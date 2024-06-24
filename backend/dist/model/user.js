"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: String,
    email: String,
    password: String,
    friends: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "userModel" }],
});
exports.userModel = (0, mongoose_1.model)("userModel", userSchema);
