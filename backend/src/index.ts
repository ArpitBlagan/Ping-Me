import express, { Request } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import dotenv from "dotenv";
dotenv.config();
import { WebSocketServer, WebSocket } from "ws";
import mongoose from "mongoose";
import { GroupManager, WsManager } from "./manager";
import { router } from "./route";
const instance = WsManager.getInstance();
const groupInstance = GroupManager.getInstance();
mongoose.connect(process.env.DATABASE_URL as string).then(() => {
  console.log("connected");
});
const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://chat-assignment-lyart.vercel.app",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use("/api", router);
const server = http.createServer(app);

const wss = new WebSocketServer({ server });
wss.on("connection", (ws: WebSocket, req: Request) => {
  console.log("url", req.url);
  const email = req.url.split("=").pop();
  console.log(email);
  if (email) {
    if (email[0] >= "0" && email[0] <= "9") {
      console.log("group chat connection");
      groupInstance.addUser(ws, email.substr(1));
    } else {
      console.log("one-on-one chat connection");
      instance.addUser(email, ws);
      instance.sendOnlineuser();
    }
  }
  ws.on("message", async (data: any) => {
    const message = JSON.parse(data);
    if (message.type == "text") {
      instance.messageToUser(
        message.by,
        message.to,
        message.senderEmail,
        message.receiverEmail,
        ws,
        message.text,
        message.kind,
        message.uu
      );
    } else if (message.type == "groupText") {
      groupInstance.sendMessage(
        ws,
        message.text,
        message.channel,
        message.by,
        message.kind
      );
    }
  });
  ws.on("close", () => {
    instance.removeUser(ws);
    instance.sendOnlineuser();
  });
});
const Port = process.env.PORT || 8000;
server.listen(Port, () => {
  console.log(`listening on port ${Port}`);
});
