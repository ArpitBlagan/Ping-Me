import { WebSocket } from "ws";
import { saveGroupMessage, saveMessage } from "./controller/message";
import { RedisClientType, createClient } from "redis";
import { userModel } from "./model/user";
import mongoose from "mongoose";
import { channel } from "diagnostics_channel";
interface element {
  ws: WebSocket;
  email: string;
}
export class WsManager {
  private static instance: WsManager; // Create a static instance of the class
  private user: element[];

  private constructor() {
    this.user = [];
  }
  static getInstance() {
    if (!this.instance) {
      this.instance = new WsManager();
    }
    return this.instance;
  }
  addUser(email: string, ws: WebSocket) {
    const user = this.user.find((ele) => ele.email == email);
    if (!user) {
      this.user.push({ email, ws });
    } else {
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
  removeUser(ws: WebSocket) {
    const newArr = this.user.filter((ele) => ele.ws != ws);
    this.user = newArr;
    console.log("user removed");
  }
  async messageToUser(
    by: string,
    to: string,
    senderEmail: string,
    receiverEmail: string,
    ws: WebSocket,
    text: string,
    kind: string,
    uu: string
  ) {
    console.log("saving message from", senderEmail, "to", receiverEmail);
    const res = await saveMessage(text, kind, by, to);
    if (res.message == "saved") {
      console.log("saved");
      const reciverWs = this.user.find((ele) => ele.email == receiverEmail);
      if (reciverWs) {
        console.log("cool");
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
        ws.send(
          JSON.stringify({
            type: "saved",
            uu,
            id: res.id,
          })
        );
      }
    } else {
      console.log("fail");
      const body = JSON.stringify({
        type: "fail",
        message: "failed to save the message",
      });
      ws.send(body);
    }
  }
}

interface User {
  ws: WebSocket;
  email: string;
}

export class GroupManager {
  private static instance: GroupManager;
  public groups: Map<string, User[]>;
  // private redisClient: RedisClientType;
  // private subsClient: RedisClientType;
  private constructor() {
    // this.redisClient = createClient();
    // this.subsClient = createClient();

    this.groups = new Map();
  }
  static getInstance() {
    if (!this.instance) {
      this.instance = new GroupManager();
    }
    return this.instance;
  }
  async addUser(ws: WebSocket, email: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // if (!this.subsClient.isOpen) {
      //   await this.subsClient.connect();
      // }
      const user = await userModel.findOne({ email });
      if (!user) {
        console.log("not found");
        return { message: "user not found or something wrong with the server" };
      }
      const groups = user?.groups;
      const ff = groups?.map(async (ele: any) => {
        const arr = this.groups.get(ele.toString());
        if (arr && arr.length) {
          arr.push({ ws, email });
          this.groups.set(ele.toString(), arr);
        } else {
          this.groups.set(ele.toString, [{ ws, email }]);
        }
      });
      await Promise.all(ff);
      session.commitTransaction();
      session.endSession();
    } catch (err) {
      session.abortTransaction();
      session.endSession();
      console.log("error while adding new user");
      console.log(err);
    }
  }
  private redisCallbackHandler = (message: string, channel: string) => {
    const ff = JSON.parse(message);
    const users = this.groups.get(channel);
    console.log(users);
    if (users && users.length) {
      users.forEach((ele) => {
        if (ele.email != ff.user.email) {
          console.log("sending message to this email: ", ele.email);
          ele.ws.send(message);
        }
      });
    }
  };
  async sendMessage(text: string, channel: string, by: string, kind: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // if (!this.redisClient.isOpen) {
      //   await this.redisClient.connect();
      // }
      const user = await userModel.findById(by);
      await saveGroupMessage(text, kind, by, channel);
      // await this.redisClient.publish(
      //   channel.toString(),
      //   JSON.stringify({ text, user, kind })
      // );
      const arr = this.groups.get(channel);
      if (arr && arr.length) {
        arr.forEach((ele) => {
          ele.ws.send(JSON.stringify({ text, user, kind }));
        });
      }
      session.commitTransaction();
      session.endSession();
    } catch (err) {
      session.abortTransaction();
      session.endSession();
      console.log(`error while sending message to channel ${channel}`);
    }
  }
}
