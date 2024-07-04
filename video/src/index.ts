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
let peers: any = {};
let roomNames: Map<any, string> = new Map();
let transports: any[] = [];
let producers: any[] = [];
let consumers: any[] = [];
let sockets: Map<string, any[]> = new Map();
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
io.on("connection", (socket) => {
  socket.emit("successful-connection", { socketId: socket.id });
  socket.on("join-room", async ({ roomName }, callback) => {
    let ff = roomNames.get(socket.id);
    if (!ff) {
      roomNames.set(socket.id, roomName);
    }
    let fff = sockets.get(roomName);
    if (!fff) {
      fff = [];
    }
    fff?.push(socket);
    sockets.set(roomName, fff);

    // peers[socket.id] = {
    //   socket,
    //   roomName, // Name for the Router this Peer joined
    //   transports: [],
    //   producers: [],
    //   consumers: [],
    //   peerDetails: {
    //     name: "",
    //     isAdmin: false, // Is this Peer the Admin?
    //   },
    // };
    let router = routers.get(roomName);
    if (!router) {
      let rr = await worker.createRouter({ mediaCodecs });
      routers.set(roomName, rr);
      router = rr;
    }

    const rtpCapabilities = router.rtpCapabilities;
    callback({ rtpCapabilities });
  });
  socket.on("getProducers", (callback) => {
    //return all producer transports
    const roomName = roomNames.get(socket.id);
    if (!roomName) {
      return;
    }
    console.log("length", producers.length);
    let producerList: any = [];
    producers.forEach((producerData) => {
      if (
        producerData.socket.id !== socket.id &&
        producerData.roomName === roomName
      ) {
        producerList.push(producerData.producer.id);
      }
    });
    console.log("list", producerList.length);
    // return the producer list back to the client
    callback(producerList);
  });
  socket.on(
    "createWebRtcTransport",
    async ({ consumer, roomName }, callback) => {
      console.log("callinggg...", consumer, roomName);
      const router = routers.get(roomName);
      createWebRtcTransport(router).then(
        (transport: any) => {
          callback({
            params: {
              id: transport.id,
              iceParameters: transport.iceParameters,
              iceCandidates: transport.iceCandidates,
              dtlsParameters: transport.dtlsParameters,
            },
          });

          // add transport to Peer's properties
          //addTransport(transport, roomName, consumer)
          transports.push({
            socketId: socket.id,
            transport,
            roomName,
            consumer,
          });
        },
        (error) => {
          console.log(error);
        }
      );
    }
  );

  socket.on(
    "transport-produce",
    async ({ kind, rtpParameters, appData, roomName }, callback) => {
      const producer = await getTransport(socket.id).produce({
        kind,
        rtpParameters,
        appData,
      });
      console.log("this also three times", kind);
      addProducer(producer, roomName, socket);

      informConsumers(roomName, socket.id, producer.id);

      console.log("Producer ID: ", producer.id, producer.kind);

      producer.on("transportclose", () => {
        console.log("transport for this producer closed ");
        producer.close();
      });

      // Send back to the client the Producer's id
      callback({
        id: producer.id,
        producersExist: producers.length > 1 ? true : false,
      });
    }
  );
  socket.on("consumer-resume", async ({ serverConsumerId }) => {
    console.log("consumer resume");
    const { consumer } = consumers.find(
      (consumerData) => consumerData.consumer.id === serverConsumerId
    );
    await consumer.resume();
  });
  socket.on(
    "consume",
    async (
      { rtpCapabilities, remoteProducerId, serverConsumerTransportId },
      callback
    ) => {
      try {
        const roomName = roomNames.get(socket.id);
        if (!roomName) {
          return;
        }
        const router = routers.get(roomName);
        let consumerTransport = transports.find(
          (transportData) =>
            transportData.consumer &&
            transportData.transport.id == serverConsumerTransportId
        ).transport;

        // check if the router can consume the specified producer
        if (
          router?.canConsume({
            producerId: remoteProducerId,
            rtpCapabilities,
          })
        ) {
          // transport can now consume and return a consumer
          const consumer = await consumerTransport.consume({
            producerId: remoteProducerId,
            rtpCapabilities,
            paused: true,
          });

          consumer.on("transportclose", () => {
            console.log("transport close from consumer");
          });

          consumer.on("producerclose", () => {
            console.log("producer of consumer closed");
            socket.emit("producer-closed", { remoteProducerId });

            consumerTransport.close([]);
            transports = transports.filter(
              (transportData) =>
                transportData.transport.id !== consumerTransport.id
            );
            consumer.close();
            consumers = consumers.filter(
              (consumerData) => consumerData.consumer.id !== consumer.id
            );
          });

          addConsumer(consumer, roomName, socket);

          // from the consumer extract the following params
          // to send back to the Client
          const params = {
            id: consumer.id,
            producerId: remoteProducerId,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
            serverConsumerId: consumer.id,
          };

          // send the parameters to the client
          callback({ params });
        }
      } catch (error) {
        callback({
          params: {
            error: error,
          },
        });
      }
    }
  );
  const removeItems = (items: any, socketId: string, type: string) => {
    items.forEach((item: any) => {
      if (item.socketId === socket.id) {
        item[type].close();
      }
    });
    items = items.filter((item: any) => item.socketId !== socket.id);

    return items;
  };
  socket.on("transport-connect", ({ dtlsParameters }) => {
    console.log("DTLS PARAMS... ", { dtlsParameters });

    getTransport(socket.id).connect({ dtlsParameters });
  });
  socket.on(
    "transport-recv-connect",
    async ({ dtlsParameters, serverConsumerTransportId }) => {
      console.log(`DTLS PARAMSs: ${dtlsParameters}`);
      const consumerTransport = transports.find(
        (transportData) =>
          transportData.consumer &&
          transportData.transport.id == serverConsumerTransportId
      ).transport;
      await consumerTransport.connect({ dtlsParameters });
    }
  );
  socket.on("disconnect", () => {
    // do some cleanup
    console.log("peer disconnected");
    const roomName = roomNames.get(socket.id);
    let producer = producers.find((ele) => {
      return ele.socket == socket;
    });
    if (roomName && producer) {
      console.log("user hangup", roomName, producer.producer.id);
      const arr = sockets.get(roomName);
      arr?.forEach((ele) => {
        console.log(ele.id);
        ele.emit("user-hangup", { producerId: producer.producer.id });
      });
    }
    consumers = removeItems(consumers, socket.id, "consumer");
    producers = removeItems(producers, socket.id, "producer");
    transports = removeItems(transports, socket.id, "transport");
    roomNames.delete(socket.id);

    // remove socket from room
    // rooms[roomName] = {
    //   router: rooms[roomName].router,
    //   peers: rooms[roomName].peers.filter(socketId => socketId !== socket.id)
    // }
  });
});
const addConsumer = (consumer: any, roomName: string, socket: any) => {
  // add the consumer to the consumers list
  consumers.push({ socketId: socket.id, consumer, roomName });

  // add the consumer id to the peers list
  //   peers[socket.id] = {
  //     ...peers[socket.id],
  //     consumers: [...peers[socket.id].consumers, consumer.id],
  //};
};
const informConsumers = (roomName: any, socketId: string, id: string) => {
  console.log(
    `just joined, id ${id} ${roomName}, ${socketId}`,
    producers.length
  );
  // A new producer just joined
  // let all consumers to consume this producer
  producers.forEach((producerData) => {
    if (
      producerData.socket.id !== socketId &&
      producerData.roomName == roomName
    ) {
      console.log("producerData");
      // use socket to send producer id to producer
      producerData.socket.emit("new-producer", { producerId: id });
    }
  });
};
const addProducer = (producer: any, roomName: string, socket: any) => {
  console.log("try adding producer");
  const ff = producers.find((ele) => {
    if (ele.roomName == roomName && ele.socket == socket) {
      return ele;
    }
  });
  if (!ff) {
    console.log("adding producer", roomName, socket.id);
    producers.push({ socket, producer, roomName });
  }
  //   peers[socket.id] = {
  //     ...peers[socket.id],
  //     producers: [...peers[socket.id].producers, producer.id],
  //};
};
const getTransport = (socketId: string) => {
  const [producerTransport] = transports.filter(
    (transport) => transport.socketId === socketId && !transport.consumer
  );
  return producerTransport.transport;
};
const createWebRtcTransport = async (router: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      // https://mediasoup.org/documentation/v3/mediasoup/api/#WebRtcTransportOptions
      const webRtcTransport_options = {
        listenIps: [
          {
            ip: "0.0.0.0", // replace with relevant IP address
            announcedIp: "127.0.0.1",
          },
        ],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
      };

      // https://mediasoup.org/documentation/v3/mediasoup/api/#router-createWebRtcTransport
      let transport = await router.createWebRtcTransport(
        webRtcTransport_options
      );
      console.log(`transport id: ${transport.id}`);

      transport.on("dtlsstatechange", (dtlsState: any) => {
        if (dtlsState === "closed") {
          transport.close();
        }
      });

      transport.on("close", () => {
        console.log("transport closed");
      });

      resolve(transport);
    } catch (error) {
      reject(error);
    }
  });
};
server.listen(process.env.PORT, () => {
  console.log(`listening to port ${process.env.PORT}`);
});
