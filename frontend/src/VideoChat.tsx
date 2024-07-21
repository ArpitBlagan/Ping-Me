import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import * as mediasoupclient from "mediasoup-client";
import { PhoneOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ThreeDots } from "react-loader-spinner";
const params = {
  // mediasoup params
  encodings: [
    {
      rid: "r0",
      maxBitrate: 100000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r1",
      maxBitrate: 300000,
      scalabilityMode: "S1T3",
    },
    {
      rid: "r2",
      maxBitrate: 900000,
      scalabilityMode: "S1T3",
    },
  ],
  // https://mediasoup.org/documentation/v3/mediasoup-client/api/#ProducerCodecOptions
  codecOptions: {
    videoGoogleStartBitrate: 1000,
  },
};
const VideoChat = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [socket, setSocket] = useState<any | null>(null);
  const localVideo = useRef(null);
  const [videoParams, setV] = useState<any>(params);
  const [audioParams, setA] = useState<any>({});
  const [Device, setDevice] = useState<any | null>(null);
  const [rtp, setRtp] = useState<any | null>(null);
  const [consumers, setConsumers] = useState<any[]>([]);
  const [hide, setHide] = useState(false);
  const streamSuccess = (stream: any) => {
    console.log("success");
    setV((prev: any) => {
      return { ...prev, track: stream.getVideoTracks()[0] };
    });
    setA((prev: any) => {
      return { ...prev, track: stream.getAudioTracks()[0] };
    });
    //@ts-ignore
    localVideo.current.srcObject = stream;
    //@ts-ignore
    localVideo.current.play();
  };
  const getLocalStream = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: {
          width: {
            min: 640,
            max: 1920,
          },
          height: {
            min: 400,
            max: 1080,
          },
        },
      })
      .then(streamSuccess)
      .catch((err) => {
        console.log(err.message);
        toast.error("something went wrong while fetching user media :(");
      });
  };
  const createDevice = async (rtpCapabilities: any) => {
    try {
      const device = new mediasoupclient.Device();

      // https://mediasoup.org/documentation/v3/mediasoup-client/api/#device-load
      // Loads the device with RTP capabilities of the Router (server side)
      await device.load({
        // see getRtpCapabilities() below
        routerRtpCapabilities: rtpCapabilities,
      });

      console.log("Device RTP Capabilities", device.rtpCapabilities);
      setDevice(device);
      // once the device loads, create transport
      return { message: "createSendTransport" };
    } catch (error: any) {
      console.log(error);
      if (error.name === "UnsupportedError")
        console.warn("browser not supported");
      return { error: "something went wrong :(" };
    }
  };
  const createSendTranport = async () => {
    console.log("call create send transport");
    socket.emit(
      "createWebRtcTransport",
      { consumer: false, roomName: id },
      ({ params }: any) => {
        // The server sends back params needed
        // to create Send Transport on the client side
        if (params.error) {
          console.log(params.error);
          return;
        }

        console.log("params", params);

        // creates a new WebRTC Transport to send media
        // based on the server's producer transport params
        // https://mediasoup.org/documentation/v3/mediasoup-client/api/#TransportOptions
        const producerTransport = Device.createSendTransport(params);

        // https://mediasoup.org/documentation/v3/communication-between-client-and-server/#producing-media
        // this event is raised when a first call to transport.produce() is made
        // see connectSendTransport() below
        //@ts-ignore
        producerTransport.on(
          "connect",
          //@ts-ignore
          async ({ dtlsParameters }, callback, errback) => {
            try {
              // Signal local DTLS parameters to the server side transport
              // see server's socket.on('transport-connect', ...)
              await socket.emit("transport-connect", {
                dtlsParameters,
              });

              // Tell the transport that parameters were transmitted.
              callback();
            } catch (error) {
              errback(error);
            }
          }
        );
        //@ts-ignore
        producerTransport.on(
          "produce",
          //@ts-ignore
          async (parameters, callback, errback) => {
            console.log(parameters);

            try {
              // tell the server to create a Producer
              // with the following parameters and produce
              // and expect back a server side producer id
              // see server's socket.on('transport-produce', ...)
              await socket.emit(
                "transport-produce",
                {
                  kind: parameters.kind,
                  rtpParameters: parameters.rtpParameters,
                  appData: parameters.appData,
                  roomName: id,
                },
                ({ id, producersExist }: any) => {
                  // Tell the transport that parameters were transmitted and provide it with the
                  // server side producer's id.
                  callback({ id });

                  // if producers exist, then join room
                  if (producersExist) {
                    console.log("producer exists");
                    getProducers();
                  }
                }
              );
            } catch (error) {
              errback(error);
            }
          }
        );

        connectSendTransport(producerTransport);
      }
    );
  };
  const connectSendTransport = async (producerTransport: any) => {
    // we now call produce() to instruct the producer transport
    // to send media to the Router
    // https://mediasoup.org/documentation/v3/mediasoup-client/api/#transport-produce
    // this action will trigger the 'connect' and 'produce' events above
    console.log("audioparams", audioParams, "videparama", videoParams);
    const videoProducer = await producerTransport.produce(videoParams);
    const audioProducer = await producerTransport.produce(audioParams);

    audioProducer.on("trackended", () => {
      console.log("audio track ended");

      // close audio track
    });

    audioProducer.on("transportclose", () => {
      console.log("audio transport ended");

      // close audio track
    });

    videoProducer.on("trackended", () => {
      console.log("video track ended");

      // close video track
    });

    videoProducer.on("transportclose", () => {
      console.log("video transport ended");

      // close video track
    });
  };
  const signalNewConsumerTransport = async (remoteProducerId: any) => {
    //check if we are already consuming the remoteProducerId
    const cons = consumers;
    if (cons.includes(remoteProducerId)) return;
    cons.push(remoteProducerId);
    setConsumers(cons);
    await socket.emit(
      "createWebRtcTransport",
      { consumer: true, roomName: id },
      ({ params }: any) => {
        // The server sends back params needed
        // to create Send Transport on the client side
        if (params.error) {
          console.log(params.error);
          return;
        }
        console.log(`PARAMS... ${params}`);

        let consumerTransport;
        try {
          consumerTransport = Device.createRecvTransport(params);
        } catch (error) {
          // exceptions:
          // {InvalidStateError} if not loaded
          // {TypeError} if wrong arguments.
          console.log(error);
          return;
        }
        //@ts-ignore
        consumerTransport.on(
          "connect",
          //@ts-ignore
          async ({ dtlsParameters }: any, callback, errback) => {
            try {
              // Signal local DTLS parameters to the server side transport
              // see server's socket.on('transport-recv-connect', ...)
              await socket.emit("transport-recv-connect", {
                dtlsParameters,
                serverConsumerTransportId: params.id,
              });

              // Tell the transport that parameters were transmitted.
              callback();
            } catch (error) {
              // Tell the transport that something was wrong
              errback(error);
            }
          }
        );

        connectRecvTransport(consumerTransport, remoteProducerId, params.id);
      }
    );
  };
  const connectRecvTransport = async (
    consumerTransport: any,
    remoteProducerId: any,
    serverConsumerTransportId: any
  ) => {
    // for consumer, we need to tell the server first
    // to create a consumer based on the rtpCapabilities and consume
    // if the router can consume, it will send back a set of params as below
    await socket.emit(
      "consume",
      {
        rtpCapabilities: Device.rtpCapabilities,
        remoteProducerId,
        serverConsumerTransportId,
      },
      async ({ params }: any) => {
        if (params.error) {
          console.log("Cannot Consume");
          return;
        }

        console.log(`Consumer Params ${params}`);
        // then consume with the local consumer transport
        // which creates a consumer
        const consumer = await consumerTransport.consume({
          id: params.id,
          producerId: params.producerId,
          kind: params.kind,
          rtpParameters: params.rtpParameters,
        });

        // consumerTransports = [
        //   ...consumerTransports,
        //   {
        //     consumerTransport,
        //     serverConsumerTransportId: params.id,
        //     producerId: remoteProducerId,
        //     consumer,
        //   },
        // ]

        // create a new div element for the new consumer media

        const newElem = document.createElement("div");

        newElem.setAttribute("id", `td-${remoteProducerId}`);

        const { track } = consumer;
        console.log("track", track);

        if (params.kind === "audio") {
          const audioDiv = document.getElementById("aduio");
          console.log("audio");
          // append to the audio container
          newElem.innerHTML = `<audio id="${remoteProducerId}" autoplay className="absolute top-0 left-0 h-[1px] w-[1px]"></audio>`;
          audioDiv?.appendChild(newElem);
          const mediaElement = newElem.querySelector(
            "audio"
          ) as HTMLMediaElement;
          if (mediaElement) {
            mediaElement.srcObject = new MediaStream([track]);
          }
        } else {
          setHide(true);
          const videoDiv = document.getElementById("conference");
          console.log("video");
          newElem.className = "py-2 px-3 bg-gray-800 rounded-xl";
          // append to the video container
          newElem.innerHTML = `<video id="${remoteProducerId}"className="rounded-xl bg-gray"></video>`;
          videoDiv?.append(newElem);
          const mediaElement = newElem.querySelector(
            "video"
          ) as HTMLMediaElement;
          if (mediaElement) {
            mediaElement.srcObject = new MediaStream([track]);
            mediaElement.play();
          }
        }

        // the server consumer started with media paused
        // so we need to inform the server to resume
        socket.emit("consumer-resume", {
          serverConsumerId: params.serverConsumerId,
        });
      }
    );
  };
  const getProducers = () => {
    socket.emit("getProducers", (producerIds: any) => {
      console.log("producers ids", producerIds, producerIds.length);
      // for each of the producer create a consumer
      // producerIds.forEach(id => signalNewConsumerTransport(id))
      producerIds.forEach(signalNewConsumerTransport);
    });
  };
  useEffect(() => {
    console.log("cool");
    if (socket && rtp && Device && audioParams && videoParams.track) {
      console.log("ready for second phase");
      createSendTranport();
      socket.on("new-producer", ({ producerId }: any) => {
        console.log("call from backend");
        signalNewConsumerTransport(producerId);
      });
      socket.on("user-hangup", ({ producerId }: any) => {
        console.log("remove user video", producerId);
        document.getElementById(`td-${producerId}`)?.remove();
      });
    }
  }, [videoParams, audioParams, socket, rtp, Device]);
  useEffect(() => {
    //start local stream
    getLocalStream();
    //https://chat-assignment-1-video.onrender.com
    const sock = io("https://chat-assignment-1-video.onrender.com");
    setSocket(sock);
    sock.on("successful-connection", async ({ socketId }) => {
      console.log(socketId, "id", id);

      //ask for rtpCapabilites of the room's router
      sock.emit("join-room", { roomName: id }, (data: any) => {
        console.log(data);
        setRtp(data.rtpCapabilities);
        //create device
        createDevice(data.rtpCapabilities);
      });
    });
    return () => {
      if (sock) {
        sock.disconnect();
      }
    };
  }, []);
  return (
    <div className="h-[80dvh] my-2 relative">
      {!hide && (
        <div className="flex gap-2 items-center justify-center top-5  w-full absolute">
          <p className="text-gray-600">calling</p>
          <ThreeDots />
        </div>
      )}
      <div className="grid gap-2 md:grid-cols-3" id="conference">
        <div className="py-2 px-3 bg-gray-800 rounded-xl">
          <video ref={localVideo} className="rounded-xl"></video>
          <p className=" text-center">You</p>
        </div>
      </div>
      <div className="relative" id="audio"></div>
      <div className="absolute bottom-0 flex items-center justify-center w-full">
        <div className="py-2 px-4 w-1/2 flex items-center justify-center rounded-xl border">
          <HoverCard>
            <HoverCardTrigger asChild>
              <PhoneOff
                height={50}
                width={30}
                className="hover:text-red-500  cursor-pointer"
                onClick={() => {
                  navigate("/thankyou", { state: { reload: true } });
                }}
              />
            </HoverCardTrigger>
            <HoverCardContent>
              <p className="text-center text-gray-600">Hang-up the call 👾.</p>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
    </div>
  );
};

export default VideoChat;
