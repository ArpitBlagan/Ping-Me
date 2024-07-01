"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageModel = exports.conversationModel = void 0;
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    text: String,
    kind: String,
    by: { type: mongoose_1.Schema.Types.ObjectId, ref: "userModel" },
    to: { type: mongoose_1.Schema.Types.ObjectId, ref: "userModel" },
    sendAt: {
        type: Date,
        default: Date.now(),
    },
    edited: {
        type: Boolean,
        default: false,
    },
    editedAt: {
        type: Date,
        default: Date.now(),
    },
});
const conversationSchema = new mongoose_1.Schema({
    user1: { type: mongoose_1.Schema.ObjectId, ref: "userModel" },
    user2: { type: mongoose_1.Schema.ObjectId, ref: "userModel" },
    messages: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "messageModel",
        },
    ],
});
exports.conversationModel = (0, mongoose_1.model)("conversationModel", conversationSchema);
exports.messageModel = (0, mongoose_1.model)("messageModel", messageSchema);
