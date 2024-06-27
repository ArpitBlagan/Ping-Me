"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const message_1 = require("./controller/message");
const user_1 = require("./controller/user");
const middleware_1 = require("./middleware");
exports.router = (0, express_1.Router)();
exports.router.route("/login").post(user_1.login);
exports.router.route("/register").post(user_1.register);
exports.router.route("/logout").get(user_1.logout);
exports.router.use(middleware_1.validateToken);
exports.router.route("/friends").get(user_1.getFriends);
exports.router.route("/search").get(user_1.searchUser);
exports.router.route("/addFriend").patch(user_1.addFriend);
exports.router.route("/conversation").get(message_1.getMessage).delete(message_1.deleteMessage);
exports.router.route("/isloggedin").get((req, res) => {
    return res.status(200).json({
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
    });
});
