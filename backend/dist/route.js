"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const message_1 = require("./controller/message");
const user_1 = require("./controller/user");
const middleware_1 = require("./middleware");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
exports.router = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
    destination: "uploads/",
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({ storage, limits: { fileSize: 1000000 } });
exports.router.route("/login").post(user_1.login);
exports.router.route("/register").post(user_1.register);
exports.router.route("/logout").get(user_1.logout);
exports.router.route("/group/message").get(message_1.getGroupMessage);
exports.router.use(middleware_1.validateToken);
exports.router.route("/group/create").post(upload.single("file"), message_1.createGroup);
exports.router.route("/group").get(user_1.getGroup);
exports.router.route("/upload/file").post(upload.single("file"), message_1.imageUpload);
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
