"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.addMember = exports.searchUser = exports.getFriends = exports.addFriend = exports.register = exports.login = exports.logout = void 0;
const user_1 = require("../model/user");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const z = __importStar(require("zod"));
const mongoose_1 = __importDefault(require("mongoose"));
const registerSchema = z.object({
    name: z.string(),
    email: z.string().email(""),
    password: z.string().min(6, "password should be atleast 6 characters long"),
    image: z.string().optional(),
});
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.cookie("token", "", { sameSite: "none", httpOnly: true, secure: true });
    res.status(200).json({ message: "logged out successfully" });
});
exports.logout = logout;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield user_1.userModel.findOne({ email: email });
        if (!user) {
            return res
                .status(404)
                .json({ message: "user with this email not found" });
        }
        //@ts-ignore
        const pass = user.password;
        if (yield bcryptjs_1.default.compare(password, pass)) {
            const token = jsonwebtoken_1.default.sign({
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                },
            }, process.env.SECRET);
            res.cookie("token", token, {
                sameSite: "none",
                httpOnly: true,
                secure: true,
            });
            res.status(200).json({
                id: user._id,
                email: user.email,
                name: user.name,
            });
        }
        else {
            res.status(401).json({ message: "wrong email and password pair" });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "something went wrong" });
    }
});
exports.login = login;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const data = registerSchema.safeParse(body);
    if (!data.success) {
        return res.status(400).json({ message: "Invalid inputs" });
    }
    try {
        const user = yield user_1.userModel.findOne({ email: body.email });
        console.log("user", user);
        if (!user) {
            const pass = yield bcryptjs_1.default.hash(body.password, 10);
            const val = yield user_1.userModel.create({
                name: body.name,
                email: body.email,
                password: pass,
                friends: [],
            });
            return res.status(202).json({ user: val });
        }
        else {
            return res.status(409).json({ message: "email already registered" });
        }
    }
    catch (err) {
        res.status(500).json({ message: "something went wrong" });
    }
});
exports.register = register;
const addFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    const userId = req.user.id;
    console.log("add friend", id, userId);
    const session = mongoose_1.default.startSession();
    (yield session).startTransaction();
    try {
        yield user_1.userModel.findByIdAndUpdate(userId, {
            $push: {
                friends: id,
            },
        });
        yield user_1.userModel.findByIdAndUpdate(id, {
            $push: {
                friends: userId,
            },
        });
        (yield session).commitTransaction();
        (yield session).endSession();
        res.status(202).json({ message: "friend added successfully" });
    }
    catch (err) {
        (yield session).abortTransaction();
        (yield session).endSession();
        res.status(500).json({ message: "something went wrong" });
    }
});
exports.addFriend = addFriend;
const getFriends = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    try {
        const user = yield user_1.userModel.findById(userId).limit(5).populate("friends");
        res.status(200).json(user);
    }
    catch (err) {
        res.status(500).json({ message: "something went wrong" });
    }
});
exports.getFriends = getFriends;
const searchUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const { text } = req.query;
    const regex = new RegExp("^" + text, "i");
    try {
        const data = yield user_1.userModel.find({
            $or: [{ email: { $regex: regex } }, { name: { $regex: regex } }],
        });
        res.status(200).json(data);
    }
    catch (err) {
        res.status(500).json({ message: "something went wrong" });
    }
});
exports.searchUser = searchUser;
const addMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, groupId } = req.body;
    const session = mongoose_1.default.startSession();
    (yield session).startTransaction();
    try {
        const group = yield user_1.groupModel.findByIdAndUpdate(groupId, {
            $push: {
                users: userId,
            },
        });
        yield user_1.userModel.findByIdAndUpdate(userId, {
            $push: {
                groups: group === null || group === void 0 ? void 0 : group._id,
            },
        });
        (yield session).commitTransaction();
        (yield session).endSession();
        res.status(202).json({ message: "member added to the group successfully" });
    }
    catch (err) {
        (yield session).abortTransaction();
        (yield session).endSession();
        res.status(500).json({ message: "something went wrong" });
    }
});
exports.addMember = addMember;
