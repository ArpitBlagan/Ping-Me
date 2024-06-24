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
exports.deleteMessage = exports.getMessage = exports.saveMessage = void 0;
const message_1 = require("../model/message");
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = require("../model/user");
const mongodb_1 = require("mongodb");
const saveMessage = (text, kind, by, to) => __awaiter(void 0, void 0, void 0, function* () {
    let user1, user2;
    if (by > to) {
        user1 = to;
        user2 = by;
    }
    else {
        user1 = by;
        user2 = to;
    }
    const session = mongoose_1.default.startSession();
    (yield session).startTransaction();
    try {
        const message = yield message_1.messageModel.create({
            text: text,
            kind: kind,
            by,
            to,
        });
        const conversation = yield message_1.conversationModel.findOne({ user1, user2 });
        if (!conversation) {
            yield message_1.conversationModel.create({
                user1,
                user2,
                messages: [message._id],
            });
        }
        else {
            yield message_1.conversationModel.updateOne({
                user1,
                user2,
            }, {
                $push: {
                    messages: message._id,
                },
            });
        }
        const frndList1 = yield user_1.userModel.findById(by);
        const frndList2 = yield user_1.userModel.findById(to);
        const byId = new mongodb_1.ObjectId(by);
        const toId = new mongodb_1.ObjectId(to);
        console.log(by, to);
        console.log("frnds");
        console.log(frndList1 === null || frndList1 === void 0 ? void 0 : frndList1.friends, frndList2 === null || frndList2 === void 0 ? void 0 : frndList2.friends);
        const val1 = frndList1 === null || frndList1 === void 0 ? void 0 : frndList1.friends.filter((ele) => {
            return !ele.equals(toId);
        });
        const val2 = frndList2 === null || frndList2 === void 0 ? void 0 : frndList2.friends.filter((ele) => {
            return !ele.equals(byId);
        });
        console.log("val");
        val1 === null || val1 === void 0 ? void 0 : val1.unshift(toId);
        val2 === null || val2 === void 0 ? void 0 : val2.unshift(byId);
        console.log(val1, val2);
        yield user_1.userModel.findByIdAndUpdate(by, {
            friends: val1,
        });
        yield user_1.userModel.findByIdAndUpdate(to, {
            friends: val2,
        });
        (yield session).commitTransaction();
        (yield session).endSession();
        return { message: "saved", id: message._id };
    }
    catch (err) {
        console.log(err);
        (yield session).abortTransaction();
        (yield session).endSession();
        return { message: "something went wrong" };
    }
});
exports.saveMessage = saveMessage;
const getMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const by = req.user.id;
    console.log(req.query);
    const { to } = req.query;
    if (!to) {
        return res.status(400).json({ message: "invalid queries" });
    }
    let user1, user2;
    if (by > to) {
        user1 = to;
        user2 = by;
    }
    else {
        user1 = by;
        user2 = to;
    }
    try {
        const conversations = yield message_1.conversationModel
            .findOne({
            user1,
            user2,
        })
            .populate({
            path: "messages",
            populate: { path: "by to", select: "name,email" },
        });
        res.status(200).json(conversations);
    }
    catch (err) {
        res.status(400).json({ message: "something went wrong" });
    }
});
exports.getMessage = getMessage;
const deleteMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
exports.deleteMessage = deleteMessage;
