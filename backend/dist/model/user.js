"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = exports.groupMessageModel = exports.groupModel = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    friends: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "userModel" }],
    groups: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "groupModel" }],
});
const groupSchema = new mongoose_1.Schema({
    name: String,
    profileImage: String,
    users: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "userModel" }],
    messages: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "groupMessageModel" }],
    admin: { type: mongoose_1.Schema.Types.ObjectId, ref: "userModel" },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});
const groupMessageSchema = new mongoose_1.Schema({
    groupId: { type: mongoose_1.Schema.Types.ObjectId, ref: "groupModel" },
    by: { type: mongoose_1.Schema.Types.ObjectId, ref: "userModel" },
    text: String,
    kind: String,
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
exports.groupModel = (0, mongoose_1.model)("groupModel", groupSchema);
exports.groupMessageModel = (0, mongoose_1.model)("groupMessageModel", groupMessageSchema);
exports.userModel = (0, mongoose_1.model)("userModel", userSchema);
