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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsManager = void 0;
const message_1 = require("./controller/message");
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
