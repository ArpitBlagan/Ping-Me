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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ws_1 = require("ws");
const mongoose_1 = __importDefault(require("mongoose"));
const manager_1 = require("./manager");
const route_1 = require("./route");
const instance = manager_1.WsManager.getInstance();
mongoose_1.default.connect(process.env.DATABASE_URL).then(() => {
    console.log("connected");
});
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:5173",
        "https://chat-assignment-lyart.vercel.app",
    ],
    credentials: true,
}));
app.use(express_1.default.json());
app.use("/api", route_1.router);
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
wss.on("connection", (ws, req) => {
    console.log("url", req.url);
    const email = req.url.split("=").pop();
    console.log(email);
    if (email) {
        instance.addUser(email, ws);
        instance.sendOnlineuser();
    }
    ws.on("message", (data) => __awaiter(void 0, void 0, void 0, function* () {
        const message = JSON.parse(data);
        if (message.type == "text") {
            instance.messageToUser(message.by, message.to, message.senderEmail, message.receiverEmail, ws, message.text, message.kind, message.uu);
        }
    }));
    ws.on("close", () => {
        instance.removeUser(ws);
        instance.sendOnlineuser();
    });
});
const Port = process.env.PORT || 8000;
server.listen(Port, () => {
    console.log(`listening on port ${Port}`);
});
