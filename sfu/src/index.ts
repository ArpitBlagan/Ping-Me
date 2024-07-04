import express, { type Request, type Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import * as mediasoup from "mediasoup";
dotenv.config();
const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(cookieParser());
app.get("/api/check", (req: Request, res: Response) => {
  res.json({ message: "working properly :)" });
});
const server = createServer(app);

let worker: mediasoup.types.Worker<mediasoup.types.AppData>;
let peers = {};
let transports: any[] = [];
let producers: any[] = [];
let consumers: any[] = [];
let routers: Map<
  string,
  mediasoup.types.Router<mediasoup.types.AppData>
> = new Map();

const createWorker = async () => {
  let ww = await mediasoup.createWorker({
    rtcMinPort: 40000,
    rtcMaxPort: 49999,
  });
  ww.on("died", () => {
    console.log("mediasoup worker has died");
    setTimeout(() => {
      process.exit(1);
    }, 2000);
  });
  return ww;
};

// We create a Worker as soon as our application starts
(async function () {
  worker = await createWorker();
})();
const mediaCodecs: any = [
  {
    kind: "audio",
    mimeType: "audio/opus",
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: "video",
    mimeType: "video/H264",
    clockRate: 90000,
    parameters: {
      "packetization-mode": 1,
      "profile-level-id": "42e01f",
      "level-asymmetry-allowed": 1,
    },
  },
];
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});
let router: any | null = null;
io.on("connection", (socket) => {
  console.log("user connected successfully and now tell the client about it.");
  socket.emit("successful-connection", { socketId: socket.id });
  socket.on("join-room", async ({ roomName }, callback) => {
    if (!router) {
      router = await worker.createRouter({ mediaCodecs });
    }
    const rtpCapabilities = router.rtpCapabilities;
    callback({ rtpCapabilities });
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(process.env.PORT, () => {
  console.log(`listening to port ${process.env.PORT}`);
});
