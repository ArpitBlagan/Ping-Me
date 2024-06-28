import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "./components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Input } from "./components/ui/input";
import { Triangle } from "react-loader-spinner";
import { useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { contextt } from "./Contextt";
import { ArrowLeft, EllipsisVertical, Laugh, Paperclip, X } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import uuid from "react-uuid";
const TextArea = () => {
  const value = useContext(contextt);
  const [preview, setPreview] = useState<null | any>(null);
  const [file, setFile] = useState<null | any>(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [friends, setFriends] = useState([]);
  const [list, setList] = useState([]);
  const [addL, setAddL] = useState(false);
  const [searchL, setSearchL] = useState(false);
  const [sele, setSele] = useState<any | null>(null);
  const [frndL, setFrndL] = useState(false);
  const [socket, setSocket] = useState<null | WebSocket>(null);
  const [online, setOnline] = useState([]);
  const [message, setMessage] = useState("");
  const [conversation, setConv] = useState<any[]>([]);
  const [refetch, setRefetch] = useState(false);
  const scrollRef = useRef(null);
  const seleId = useRef(null);
  const scrollRef2 = useRef(null);
  const [emojiOpen, setEmojiOpne] = useState(false);
  const [fileDia, setFileDia] = useState(false);
  const [addId, setAddId] = useState("");
  const [convLoading, setConvLoading] = useState(false);
  useEffect(() => {
    console.log(value?.info);
    let sock: WebSocket;
    if (value?.info.email) {
      sock = new WebSocket(
        `wss://chat-assignment-qrb7.onrender.com?email=${value?.info.email}`
      );
      setSocket(sock);
      sock.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type == "text") {
          if (seleId.current == message.by) {
            setConv((prev) => {
              return [
                ...prev,
                { id: message.id, by: { _id: message.by }, text: message.text },
              ];
            });
          }
        } else if (message.type == "online user") {
          setOnline(message.list);
        } else if (message.type == "refetch") {
          setRefetch(!refetch);
        } else if (message.type == "saved") {
          // const uu = message.uu;
          // const id = message.id;
          // console.log(conversation);
        }
      };
      // sock.addEventListener("message", (value) => {
      //   const message = JSON.parse(value.data);
      //   if (message.type == "text") {
      //     console.log(message, sele);
      //     if (sele.id == message.by) {
      //       setConv((prev) => {
      //         return [
      //           ...prev,
      //           { id: message.id, by: { _id: message.by }, text: message.text },
      //         ];
      //       });
      //     }
      //   } else if (message.type == "online user") {
      //     setOnline(message.list);
      //   } else if (message.type == "refetch") {
      //     setRefetch(!refetch);
      //   }
      // });
    }
    return () => {
      sock?.close();
    };
  }, [value]);

  useEffect(() => {
    if (scrollRef && scrollRef.current) {
      //@ts-ignore
      scrollRef.current?.scrollIntoView({
        block: "end",
        inline: "nearest",
      });
    }
    if (scrollRef2 && scrollRef2.current) {
      //@ts-ignore
      scrollRef2.current?.scrollIntoView({
        block: "end",
        inline: "nearest",
      });
    }
  }, [conversation, emojiOpen]);
  useEffect(() => {
    const getConv = async () => {
      setConvLoading(true);
      try {
        const res = await axios.get(
          `https://chat-assignment-qrb7.onrender.com/api/conversation?to=${sele.id}`,
          {
            withCredentials: true,
          }
        );
        console.log(res.data);
        setConv(res.data.messages);
        setConvLoading(false);
      } catch (err) {
        toast.error("something went wrong while fetching chat history :( !");
        setConvLoading(false);
      }
    };
    if (sele) {
      getConv();
    }
  }, [sele]);
  useEffect(() => {
    const getData = async () => {
      if (friends.length == 0) {
        setFrndL(true);
      }
      try {
        const res = await axios.get(
          "https://chat-assignment-qrb7.onrender.com/api/friends",
          {
            withCredentials: true,
          }
        );
        console.log(res.data);
        setFriends(res.data.friends);
        setFrndL(false);
      } catch (err) {
        setFrndL(false);
        toast.error("something went wrong while fetching friends list :( !");
      }
    };
    getData();
  }, [refetch]);
  useEffect(() => {
    const getRes = async () => {
      setSearchL(true);
      console.log("sending search req");
      try {
        const res = await axios.get(
          `https://chat-assignment-qrb7.onrender.com/api/search?text=${text}`,
          {
            withCredentials: true,
          }
        );
        setList(res.data);
        setSearchL(false);
      } catch (err) {
        setSearchL(false);
      }
    };
    console.log("text changed");
    let tt = setTimeout(() => {
      getRes();
    }, 1000);
    return () => {
      clearTimeout(tt);
    };
  }, [text]);
  return (
    <div className=" my-4 flex flex-col gap-3">
      <div className="flex items-center justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild className="cursor-pointer">
            <Button className="w-[160px] bg-green-600">Add+</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <Input
                  className="my-4"
                  placeholder="arpit@gmail.com"
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                  }}
                />
              </DialogTitle>
              <DialogDescription>
                <div className="overflow-hidden overflow-y-scroll flex flex-col gap-3">
                  {searchL ? (
                    <div className="flex items-center justify-center">
                      <Triangle />
                    </div>
                  ) : (
                    list.map((ele: any, index: any) => {
                      let ok = friends.find((elee: any) => {
                        return ele.email == elee.email;
                      });
                      //@ts-ignore
                      if (ele._id != value?.info.id && !ok) {
                        return (
                          <div
                            className="flex items-center justify-around border rounded-xl py-2 px-4"
                            key={index}
                          >
                            <p>{ele.name}</p>
                            <p>{ele.email}</p>
                            <Button
                              disabled={addL}
                              onClick={async (e) => {
                                e.preventDefault();
                                const body = { id: ele._id };
                                setAddL(true);
                                setAddId(ele.id);
                                try {
                                  await axios.patch(
                                    "https://chat-assignment-qrb7.onrender.com/api/addFriend",
                                    body,
                                    { withCredentials: true }
                                  );
                                  toast.success(
                                    "friend added successfully :) !"
                                  );
                                  setRefetch(!refetch);
                                  setAddL(false);
                                  setOpen(false);
                                } catch (err) {
                                  toast.error("error while adding friend :( !");
                                  setAddL(false);
                                }
                              }}
                            >
                              {addL && addId == ele.id ? "Adding" : "Add"}
                            </Button>
                          </div>
                        );
                      }
                    })
                  )}
                  {list.length == 0 && <div>No Match</div>}
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
      <div className="min-h-[80dvh] flex gap-3">
        <div className=" hidden md:block flex flex-col gap-2">
          {frndL ? (
            <div className="flex items-center justify-center h-full">
              <Triangle />
            </div>
          ) : (
            friends.map((ele: any) => {
              return (
                <div
                  className="border rounded-xl py-2 px-4 cursor-pointer"
                  key={ele._id}
                  onClick={(e) => {
                    e.preventDefault();
                    setSele({ id: ele._id, name: ele.name, email: ele.email });
                    seleId.current = ele._id;
                    setMessage("");
                    setConv([]);
                  }}
                >
                  <p className="text-2xl">{ele.name}</p>
                  <p className="text-gray-600">{ele.email}</p>
                </div>
              );
            })
          )}
        </div>
        <div className="hidden md:block flex-1 border border-l-gray-600 rounded-xl py-2 px-4 ">
          {sele && sele.id ? (
            <div className="flex flex-col gap-2 h-full">
              <div className="flex flex-col gap-2 items-end justify-center">
                <div className="flex gap-2 items-center">
                  <p className="text-2xl">{sele.name}</p>
                  <p className="text-gray-600">{sele.email}</p>
                  <EllipsisVertical />
                </div>
                <p>
                  {/* @ts-ignore */}
                  {online.includes(sele.email) ? (
                    <span className="text-green-600">online</span>
                  ) : (
                    <span className="text-gray-600">offline</span>
                  )}
                </p>
              </div>
              <div className="h-[60dvh] overflow-hidden overflow-y-auto py-2 px-4">
                {convLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Triangle />
                  </div>
                ) : (
                  conversation.map((ele: any, index: any) => {
                    return (
                      <div
                        key={index}
                        className={`flex ${
                          ele.by._id == value?.info.id
                            ? "justify-end"
                            : "justify-start"
                        } mb-4`}
                      >
                        {ele.kind == "text" ? (
                          <div
                            className={`max-w-xs break-words ${
                              ele.by._id == value?.info.id
                                ? "bg-blue-500 text-white"
                                : "bg-gray-300 text-black"
                            } p-3 rounded-lg`}
                          >
                            {ele.text}
                          </div>
                        ) : (
                          <div>
                            <img
                              src={ele.text}
                              width={400}
                              height={400}
                              className="rounded-md"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                <div ref={scrollRef} />
              </div>
              <div className="flex items-center gap-1 md:gap-3 relative">
                <div className="absolute bottom-0 left-0">
                  <EmojiPicker
                    className="mt-10 "
                    open={emojiOpen}
                    onEmojiClick={(emojiObject) => {
                      setMessage((prev) => {
                        return prev + emojiObject.emoji;
                      });
                    }}
                  />
                </div>
                <Input
                  placeholder="enter text :) !"
                  className="flex-1 py-4 px-4 h-[50px]"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                  }}
                />
                <Dialog open={fileDia} onOpenChange={setFileDia}>
                  <DialogTrigger asChild>
                    <Paperclip />
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-center">
                        Choose File
                      </DialogTitle>
                      <DialogDescription>
                        <form className="flex flex-col gap-2 justify-center">
                          <Input
                            type="file"
                            className="text-gray-500 cursor-pointer"
                            onChange={async (e: any) => {
                              const ff = e.target.files[0];
                              setFile(ff);
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setPreview(reader.result);
                              };
                              reader.readAsDataURL(ff);
                            }}
                          />
                          {preview && (
                            <div className="flex items-center justify-center w-full">
                              <img
                                src={preview}
                                alt="Preview"
                                style={{ width: "200px", marginTop: "10px" }}
                                className="rounded-md"
                              />
                            </div>
                          )}
                          <Button
                            className="bg-green-500"
                            onClick={async (e) => {
                              e.preventDefault();
                              toast("uploading image first");
                              try {
                                const formdata = new FormData();
                                formdata.append("file", file);
                                const res = await axios.post(
                                  "https://chat-assignment-qrb7.onrender.com/api/upload/file",
                                  formdata,
                                  { withCredentials: true }
                                );
                                console.log("image url", res.data);
                                toast("now sending");
                                const uu = uuid();
                                const body = JSON.stringify({
                                  type: "text",
                                  kind: "image",
                                  text: res.data,
                                  by: value?.info.id,
                                  senderEmail: value?.info.email,
                                  to: sele.id,
                                  receiverEmail: sele.email,
                                  uu,
                                });
                                socket?.send(body);
                                setConv((prev) => {
                                  return [
                                    ...prev,
                                    {
                                      by: { _id: value?.info.id },
                                      type: "text",
                                      kind: "image",
                                      text: res.data,
                                      uu,
                                    },
                                  ];
                                });
                                setFileDia(false);
                              } catch (err) {
                                toast.error(
                                  "something went wrong while uploading the file"
                                );
                              }
                            }}
                          >
                            Upload
                          </Button>
                        </form>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    setEmojiOpne(!emojiOpen);
                  }}
                  className="py-1 px-2"
                >
                  {emojiOpen ? <X /> : <Laugh />}
                </Button>
                <Button
                  className="bg-green-500"
                  onClick={(e) => {
                    e.preventDefault();
                    if (message.length == 0) {
                      return toast.error("message filed is empty :(");
                    }
                    const uu = uuid();
                    const body = JSON.stringify({
                      type: "text",
                      kind: "text",
                      text: message,
                      by: value?.info.id,
                      senderEmail: value?.info.email,
                      to: sele.id,
                      receiverEmail: sele.email,
                      uu,
                    });
                    socket?.send(body);
                    setConv((prev) => {
                      return [
                        ...prev,
                        {
                          by: { _id: value?.info.id },
                          type: "text",
                          kind: "text",
                          text: message,
                          uu,
                        },
                      ];
                    });
                    setMessage("");
                    setEmojiOpne(false);
                  }}
                >
                  send
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center ">
              Chatting-App
            </div>
          )}
        </div>
        {sele ? (
          <div className="md:hidden w-full">
            <div className="flex flex-col gap-2 h-full w-full">
              <div className="flex border py-2 px-3 rounded-xl">
                <div className="flex justify-between gap-2 w-full">
                  <div className="flex justify-start items-center">
                    <ArrowLeft
                      onClick={(e) => {
                        e.preventDefault();
                        setSele(null);
                        seleId.current = null;
                      }}
                    />
                  </div>
                  <div className="flex flex-col md:items-end justify-center md:gap-2">
                    <div className="flex items-center gap-1 md:gap-3">
                      <p className="text-2xl">{sele.name}</p>
                      <p className="text-gray-600">{sele.email}</p>
                      <EllipsisVertical />
                    </div>
                    <p>
                      {/* @ts-ignore */}
                      {online.includes(sele.email) ? (
                        <span className="text-green-600">online</span>
                      ) : (
                        <span className="text-gray-600">offline</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="h-[60dvh] overflow-hidden overflow-y-auto py-2 px-4 ">
                {conversation.map((ele: any, index: any) => {
                  return (
                    <div
                      key={index}
                      className={`flex ${
                        ele.by._id == value?.info.id
                          ? "justify-end"
                          : "justify-start"
                      } mb-4`}
                    >
                      {ele.kind == "text" ? (
                        <div
                          className={`max-w-xs break-words ${
                            ele.by._id == value?.info.id
                              ? "bg-blue-500 text-white"
                              : "bg-gray-300 text-black"
                          } p-3 rounded-lg`}
                        >
                          {ele.text}
                        </div>
                      ) : (
                        <div>
                          <img
                            src={ele.text}
                            width={400}
                            height={400}
                            className="rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={scrollRef2} />
              </div>
              <div className="flex items-center gap-3 relative">
                <div className="absolute bottom-0 left-0">
                  <EmojiPicker
                    className="mt-10 "
                    width={180}
                    height={400}
                    open={emojiOpen}
                    onEmojiClick={(emojiObject) => {
                      setMessage((prev) => {
                        return prev + emojiObject.emoji;
                      });
                    }}
                  />
                </div>
                <Input
                  placeholder="enter text :) !"
                  className="flex-1 py-4 px-4 h-[50px]"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                  }}
                />
                <Dialog open={fileDia} onOpenChange={setFileDia}>
                  <DialogTrigger asChild>
                    <Paperclip />
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-center">
                        Choose File
                      </DialogTitle>
                      <DialogDescription>
                        <form className="flex flex-col gap-5">
                          <Input
                            type="file"
                            className="text-gray-500"
                            onChange={async (e: any) => {
                              const ff = e.target.files[0];
                              setFile(ff);
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setPreview(reader.result);
                              };
                              reader.readAsDataURL(ff);
                            }}
                          />
                          {preview && (
                            <div className="flex items-center justify-center w-full">
                              <img
                                src={preview}
                                alt="Preview"
                                style={{ width: "200px", marginTop: "10px" }}
                              />
                            </div>
                          )}
                          <Button
                            className="bg-green-500"
                            onClick={async (e) => {
                              e.preventDefault();
                              toast("uploading image first");
                              try {
                                const formdata = new FormData();
                                formdata.append("file", file);
                                const res = await axios.post(
                                  "https://chat-assignment-qrb7.onrender.com/api/upload/file",
                                  formdata,
                                  { withCredentials: true }
                                );
                                const uu = uuid();
                                const body = JSON.stringify({
                                  type: "text",
                                  kind: "image",
                                  text: res.data,
                                  by: value?.info.id,
                                  senderEmail: value?.info.email,
                                  to: sele.id,
                                  receiverEmail: sele.email,
                                  uu,
                                });
                                socket?.send(body);
                                setConv((prev) => {
                                  return [
                                    ...prev,
                                    {
                                      by: { _id: value?.info.id },
                                      type: "text",
                                      kind: "image",
                                      text: res.data,
                                      uu,
                                    },
                                  ];
                                });
                                setFileDia(false);
                              } catch (err) {
                                toast.error(
                                  "something went wrong while uploading the file"
                                );
                              }
                            }}
                          >
                            Upload
                          </Button>
                        </form>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    setEmojiOpne(!emojiOpen);
                  }}
                >
                  {emojiOpen ? <X /> : <Laugh />}
                </Button>
                <Button
                  className="bg-green-500"
                  onClick={(e) => {
                    e.preventDefault();
                    if (message.length == 0) {
                      toast.error("message filed is empty :(");
                      return;
                    }
                    const uu = uuid();
                    const body = JSON.stringify({
                      type: "text",
                      kind: "text",
                      text: message,
                      by: value?.info.id,
                      senderEmail: value?.info.email,
                      to: sele.id,
                      receiverEmail: sele.email,
                      uu,
                    });
                    socket?.send(body);
                    setConv((prev) => {
                      return [
                        ...prev,
                        {
                          by: { _id: value?.info.id },
                          type: "text",
                          text: message,
                          uu,
                        },
                      ];
                    });
                    setMessage("");
                    setEmojiOpne(false);
                  }}
                >
                  send
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="md:hidden w-full">
            {frndL ? (
              <div className="flex items-center justify-center h-full">
                <Triangle />
              </div>
            ) : (
              friends.map((ele: any) => {
                return (
                  <div
                    className="border rounded-xl py-2 px-4 cursor-pointer"
                    key={ele._id}
                    onClick={(e) => {
                      e.preventDefault();
                      setSele({
                        id: ele._id,
                        name: ele.name,
                        email: ele.email,
                      });
                      seleId.current = ele._id;
                      setMessage("");
                      setConv([]);
                    }}
                  >
                    <p className="text-2xl">{ele.name}</p>
                    <p className="text-gray-600">{ele.email}</p>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextArea;
