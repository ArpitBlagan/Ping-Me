"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupManager = exports.WsManager = void 0;
const message_1 = require("./controller/message");
const redis_1 = require("redis");
const user_1 = require("./model/user");
const mongoose_1 = __importDefault(require("mongoose"));
class WsManager {
    constructor() {
        this.user = [];
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new WsManager();
        }
        return this.instance;
    }
    addUser(email, ws) {
        const user = this.user.find((ele) => ele.email == email);
        if (!user) {
            this.user.push({ email, ws });
        }
        else {
            const ff = this.user.map((ele) => {
                if (ele.email == email) {
                    ele.ws = ws;
                }
                return ele;
            });
            this.user = ff;
        }
        console.log("user added", this.user.length);
    }
    sendOnlineuser() {
        const arr = this.user.map((ele) => {
            return ele.email;
        });
        const body = JSON.stringify({
            type: "online user",
            list: arr,
        });
        this.user.forEach((ele) => {
            ele.ws.send(body);
        });
    }
    removeUser(ws) {
        const newArr = this.user.filter((ele) => ele.ws != ws);
        this.user = newArr;
        console.log("user removed");
    }
    messageToUser(by, to, senderEmail, receiverEmail, ws, text, kind, uu) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("saving message from", senderEmail, "to", receiverEmail);
            const res = yield (0, message_1.saveMessage)(text, kind, by, to);
            if (res.message == "saved") {
                console.log("saved");
                const reciverWs = this.user.find((ele) => ele.email == receiverEmail);
                if (reciverWs) {
                    console.log("cool");
                    const body = JSON.stringify({
                        id: res.id,
                        type: "text",
                        kind,
                        senderEmail,
                        text: text,
                        by,
                        to,
                        receiverEmail,
                    });
                    reciverWs.ws.send(body);
                    reciverWs.ws.send(JSON.stringify({ type: "refetch" }));
                    ws.send(JSON.stringify({ type: "refetch" }));
                    ws.send(JSON.stringify({
                        type: "saved",
                        uu,
                        id: res.id,
                    }));
                }
            }
            else {
                console.log("fail");
                const body = JSON.stringify({
                    type: "fail",
                    message: "failed to save the message",
                });
                ws.send(body);
            }
        });
    }
}
exports.WsManager = WsManager;
class GroupManager {
    constructor() {
        this.redisCallbackHandler = (message, channel) => {
            const ff = JSON.parse(message);
            const users = this.groups.get(channel);
            console.log(users);
            if (users && users.length) {
                users.forEach((ele) => {
                    if (ele.email != ff.user.email) {
                        console.log("sending message to this email: ", ele.email);
                        ele.ws.send(message);
                    }
                });
            }
        };
        this.redisClient = (0, redis_1.createClient)();
        this.subsClient = (0, redis_1.createClient)();
        this.groups = new Map();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new GroupManager();
        }
        return this.instance;
    }
    addUser(ws, email) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                if (!this.subsClient.isOpen) {
                    yield this.subsClient.connect();
                }
                const user = yield user_1.userModel.findOne({ email });
                if (!user) {
                    console.log("not found");
                    return { message: "user not found or something wrong with the server" };
                }
                const groups = user === null || user === void 0 ? void 0 : user.groups;
                const ff = groups === null || groups === void 0 ? void 0 : groups.map((ele) => __awaiter(this, void 0, void 0, function* () {
                    const arr = this.groups.get(ele.toString());
                    if (!arr || arr.length == 0) {
                        this.groups.set(ele.toString(), [{ ws, email }]);
                        yield this.subsClient.subscribe(ele.toString(), this.redisCallbackHandler);
                    }
                    else {
                        arr.push({ email, ws });
                        this.groups.set(ele.toString(), arr);
                    }
                }));
                yield Promise.all(ff);
                session.commitTransaction();
                session.endSession();
            }
            catch (err) {
                session.abortTransaction();
                session.endSession();
                console.log("error while adding new user");
                console.log(err);
            }
        });
    }
    sendMessage(text, channel, by, kind) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                if (!this.redisClient.isOpen) {
                    yield this.redisClient.connect();
                }
                const user = yield user_1.userModel.findById(by);
                yield (0, message_1.saveGroupMessage)(text, kind, by, channel);
                yield this.redisClient.publish(channel.toString(), JSON.stringify({ text, user, kind }));
                session.commitTransaction();
                session.endSession();
            }
            catch (err) {
                session.abortTransaction();
                session.endSession();
                console.log(`error while sending message to channel ${channel}`);
            }
        });
    }
}
exports.GroupManager = GroupManager;
