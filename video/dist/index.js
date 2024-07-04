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
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const mediasoup = __importStar(require("mediasoup"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173"],
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.get("/api/check", (req, res) => {
    res.json({ message: "working properly :)" });
});
const server = (0, http_1.createServer)(app);
let worker;
let peers = {};
let roomNames = new Map();
let transports = [];
let producers = [];
let consumers = [];
let sockets = new Map();
let routers = new Map();
const createWorker = () => __awaiter(void 0, void 0, void 0, function* () {
    let ww = yield mediasoup.createWorker({
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
});
// We create a Worker as soon as our application starts
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        worker = yield createWorker();
    });
})();
const mediaCodecs = [
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
const io = new socket_io_1.Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
        credentials: true,
    },
});
io.on("connection", (socket) => {
    socket.emit("successful-connection", { socketId: socket.id });
    socket.on("join-room", (_a, callback_1) => __awaiter(void 0, [_a, callback_1], void 0, function* ({ roomName }, callback) {
        let ff = roomNames.get(socket.id);
        if (!ff) {
            roomNames.set(socket.id, roomName);
        }
        let fff = sockets.get(roomName);
        if (!fff) {
            fff = [];
        }
        fff === null || fff === void 0 ? void 0 : fff.push(socket);
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
            let rr = yield worker.createRouter({ mediaCodecs });
            routers.set(roomName, rr);
            router = rr;
        }
        const rtpCapabilities = router.rtpCapabilities;
        callback({ rtpCapabilities });
    }));
    socket.on("getProducers", (callback) => {
        //return all producer transports
        const roomName = roomNames.get(socket.id);
        if (!roomName) {
            return;
        }
        console.log("length", producers.length);
        let producerList = [];
        producers.forEach((producerData) => {
            if (producerData.socket.id !== socket.id &&
                producerData.roomName === roomName) {
                producerList.push(producerData.producer.id);
            }
        });
        console.log("list", producerList.length);
        // return the producer list back to the client
        callback(producerList);
    });
    socket.on("createWebRtcTransport", (_a, callback_1) => __awaiter(void 0, [_a, callback_1], void 0, function* ({ consumer, roomName }, callback) {
        console.log("callinggg...", consumer, roomName);
        const router = routers.get(roomName);
        createWebRtcTransport(router).then((transport) => {
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
        }, (error) => {
            console.log(error);
        });
    }));
    socket.on("transport-produce", (_a, callback_1) => __awaiter(void 0, [_a, callback_1], void 0, function* ({ kind, rtpParameters, appData, roomName }, callback) {
        const producer = yield getTransport(socket.id).produce({
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
    }));
    socket.on("consumer-resume", (_a) => __awaiter(void 0, [_a], void 0, function* ({ serverConsumerId }) {
        console.log("consumer resume");
        const { consumer } = consumers.find((consumerData) => consumerData.consumer.id === serverConsumerId);
        yield consumer.resume();
    }));
    socket.on("consume", (_a, callback_1) => __awaiter(void 0, [_a, callback_1], void 0, function* ({ rtpCapabilities, remoteProducerId, serverConsumerTransportId }, callback) {
        try {
            const roomName = roomNames.get(socket.id);
            if (!roomName) {
                return;
            }
            const router = routers.get(roomName);
            let consumerTransport = transports.find((transportData) => transportData.consumer &&
                transportData.transport.id == serverConsumerTransportId).transport;
            // check if the router can consume the specified producer
            if (router === null || router === void 0 ? void 0 : router.canConsume({
                producerId: remoteProducerId,
                rtpCapabilities,
            })) {
                // transport can now consume and return a consumer
                const consumer = yield consumerTransport.consume({
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
                    transports = transports.filter((transportData) => transportData.transport.id !== consumerTransport.id);
                    consumer.close();
                    consumers = consumers.filter((consumerData) => consumerData.consumer.id !== consumer.id);
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
        }
        catch (error) {
            callback({
                params: {
                    error: error,
                },
            });
        }
    }));
    const removeItems = (items, socketId, type) => {
        items.forEach((item) => {
            if (item.socketId === socket.id) {
                item[type].close();
            }
        });
        items = items.filter((item) => item.socketId !== socket.id);
        return items;
    };
    socket.on("transport-connect", ({ dtlsParameters }) => {
        console.log("DTLS PARAMS... ", { dtlsParameters });
        getTransport(socket.id).connect({ dtlsParameters });
    });
    socket.on("transport-recv-connect", (_a) => __awaiter(void 0, [_a], void 0, function* ({ dtlsParameters, serverConsumerTransportId }) {
        console.log(`DTLS PARAMSs: ${dtlsParameters}`);
        const consumerTransport = transports.find((transportData) => transportData.consumer &&
            transportData.transport.id == serverConsumerTransportId).transport;
        yield consumerTransport.connect({ dtlsParameters });
    }));
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
            arr === null || arr === void 0 ? void 0 : arr.forEach((ele) => {
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
const addConsumer = (consumer, roomName, socket) => {
    // add the consumer to the consumers list
    consumers.push({ socketId: socket.id, consumer, roomName });
    // add the consumer id to the peers list
    //   peers[socket.id] = {
    //     ...peers[socket.id],
    //     consumers: [...peers[socket.id].consumers, consumer.id],
    //};
};
const informConsumers = (roomName, socketId, id) => {
    console.log(`just joined, id ${id} ${roomName}, ${socketId}`, producers.length);
    // A new producer just joined
    // let all consumers to consume this producer
    producers.forEach((producerData) => {
        if (producerData.socket.id !== socketId &&
            producerData.roomName == roomName) {
            console.log("producerData");
            // use socket to send producer id to producer
            producerData.socket.emit("new-producer", { producerId: id });
        }
    });
};
const addProducer = (producer, roomName, socket) => {
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
const getTransport = (socketId) => {
    const [producerTransport] = transports.filter((transport) => transport.socketId === socketId && !transport.consumer);
    return producerTransport.transport;
};
const createWebRtcTransport = (router) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
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
            let transport = yield router.createWebRtcTransport(webRtcTransport_options);
            console.log(`transport id: ${transport.id}`);
            transport.on("dtlsstatechange", (dtlsState) => {
                if (dtlsState === "closed") {
                    transport.close();
                }
            });
            transport.on("close", () => {
                console.log("transport closed");
            });
            resolve(transport);
        }
        catch (error) {
            reject(error);
        }
    }));
});
server.listen(process.env.PORT, () => {
    console.log(`listening to port ${process.env.PORT}`);
});
