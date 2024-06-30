import { WebSocket } from "ws";
import { saveMessage } from "./controller/message";
import redis, { RedisClientType } from "redis";
import { userModel } from "./model/user";
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
  private redisClient: RedisClientType;
  private constructor() {
    this.redisClient = redis.createClient();
    this.redisClient.connect();
    this.groups = new Map();
  }
  static getInstance() {
    if (!this.instance) {
      this.instance = new GroupManager();
    }
    return this.instance;
  }
  async addUser(ws: WebSocket, email: string) {
    const user = await userModel.findOne({ email }).populate("groups");
    if (!user) {
      return { message: "user not found or something wrong with the server" };
    }
    const groups = user?.groups;
    groups?.forEach((ele: any) => {
      this.redisClient.subscribe(ele.name, this.redisCallbackHandler);
    });
  }
  private redisCallbackHandler = (message: string, channel: string) => {
    const parsedMessage = JSON.parse(message);
    console.log(parsedMessage);
    const users = this.groups.get(channel);
    if (users && users.length) {
      users.forEach((ele) => {
        ele.ws.send(JSON.stringify(parsedMessage));
      });
    }
  };
  sendMessage(text: string, channel: string) {
    this.redisClient.publish(channel, JSON.stringify({ message: text }));
  }
}
