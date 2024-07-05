import { useEffect, useRef, useState, useContext } from "react";
import pingme from "@/img/pingme.png";
import { toast } from "react-toastify";
import { CircleX, Laugh, Paperclip, Video, X } from "lucide-react";
import axios from "axios";
import { Triangle } from "react-loader-spinner";
import uuid from "react-uuid";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { contextt } from "@/Contextt";
import { DialogHeader } from "./ui/dialog";
import { Input } from "./ui/input";
import EmojiPicker from "emoji-picker-react";
const GroupChat = ({ socket, group, userId, messages, setMessages }: any) => {
  const value = useContext(contextt);
  const scrollRef = useRef(null);
  const scrollRef2 = useRef(null);
  const [loading, setLoading] = useState(false);
  const [emojiOpen, setEmojiOpne] = useState(false);
  const [preview, setPreview] = useState<null | any>(null);
  const [file, setFile] = useState<null | any>(null);
  const [fileDia, setFileDia] = useState(false);
  const [message, setMessage] = useState("");
  const [seleUsers, setSeleUsers] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [fLoading, setFLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const getFriends = async () => {
      setFLoading(true);
      try {
        const res = await axios.get(
          `https://chat-assignment-qrb7.onrender.com/api/search?text=${searchText}`,
          { withCredentials: true }
        );
        setUsers(res.data);
        setFLoading(false);
      } catch (err) {
        toast.error("Not able to fetch the users data :(");
        setFLoading(false);
      }
    };
    let time = setTimeout(() => {
      getFriends();
    }, 2000);
    return () => {
      clearTimeout(time);
    };
  }, [searchText]);
  useEffect(() => {
    const getMessage = async () => {
      setLoading(true);
      try {
        console.log(group.id);
        const res = await axios.get(
          `https://chat-assignment-qrb7.onrender.com/api/group/message?groupId=${group.id}`,
          { withCredentials: true }
        );
        console.log("groupMessage", res.data);
        setLoading(false);
        setMessages(res.data);
      } catch (err) {
        toast.error("something went wrong while fetching messages");
        setLoading(false);
      }
    };
    if (group) {
      getMessage();
    }
  }, [group]);
  useEffect(() => {
    if (scrollRef2 && scrollRef2.current) {
      //@ts-ignore
      scrollRef2.current?.scrollIntoView({
        block: "end",
        inline: "nearest",
      });
    }
    if (scrollRef && scrollRef.current) {
      //@ts-ignore
      scrollRef.current?.scrollIntoView({
        block: "end",
        inline: "nearest",
      });
    }
  }, [messages]);
  const handleAdd = async () => {
    if (seleUsers.length == 0) {
      toast.error("no new member is there to add :(");
    }
    try {
      const body = {
        users: seleUsers,
        groupId: group.id,
      };
      await axios.patch(
        "https://chat-assignment-qrb7.onrender.com/api/group/addmembers",
        body,
        {
          withCredentials: true,
        }
      );
      toast.success("new members added to the group successfully :)");
    } catch (err) {
      toast.error(
        "something went wrong while adding new members to the group :("
      );
    }
  };
  return (
    <div>
      {group ? (
        <div>
          <div>
            <div className="border py-2 px-4 rounded-xl flex flex-col gap-2 relative">
              <div className=" flex  justify-end gap-2 items-center">
                <img
                  src={group.image}
                  width={50}
                  height={50}
                  className="rounded-full"
                />
                <p className="text-2xl">{group.name}</p>
              </div>
              <div className="flex items-center gap-3 justify-end">
                <div className="flex-1 flex flex-wrap items-center gap-2">
                  <p className="text-gray-600">Members</p>
                  {group.members.map((ele: any) => {
                    return (
                      <p
                        className="text-sm text-gray-600 hover:text-green-600"
                        key={ele._id}
                      >
                        {ele.name}({ele.email})
                      </p>
                    );
                  })}
                </div>
                <a href={`/videochat/${group.id}`} target="_blank">
                  <Video
                    className="cursor-pointer hover:text-green-600"
                    height={30}
                    width={30}
                  />
                </a>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <p className="cursor-pointer text-center">Add Member</p>
                  </DialogTrigger>
                  <DialogContent className="absolute top-0 w-full py-2 px-3 border rounded-xl bg-gray-800">
                    <DialogHeader>
                      <DialogTitle>
                        <div className="flex items-center justify-between border py-2 px-4">
                          <p>Add Member</p>
                          <CircleX
                            className="cursor-pointer"
                            onClick={() => {
                              setOpen(false);
                            }}
                          />
                        </div>
                      </DialogTitle>
                      <DialogDescription>
                        <div className="flex flex-col gap-3">
                          <label>Search User</label>
                          <Input
                            placeholder="Arpit"
                            value={searchText}
                            onChange={(e) => {
                              setSearchText(e.target.value);
                            }}
                          />
                          <label>New Members</label>
                          <div className="flex flex-wrap gap-2">
                            {seleUsers.map((ele, index) => {
                              return (
                                <div
                                  key={index}
                                  className="relative py-2 px-8 bg-gray-600 rounded-xl flex justify-start"
                                >
                                  <p>{ele.name}</p>
                                  <CircleX
                                    className="absolute top-1.5 right-1 cursor-pointer"
                                    onClick={() => {
                                      let arr = seleUsers;
                                      let newArr = arr.filter((elee) => {
                                        return elee.id != ele.id;
                                      });
                                      setSeleUsers(newArr);
                                    }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                          <p>Result</p>
                          {fLoading ? (
                            <div className="flex items-center justify-center">
                              <Triangle />
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2">
                              {users.map((ele, index) => {
                                let present = seleUsers.find((elee) => {
                                  return elee.id == ele._id;
                                });
                                let pp = group.members.find((eleee: any) => {
                                  return eleee._id == ele._id;
                                });
                                if (
                                  ele._id != value?.info.id &&
                                  !present &&
                                  !pp
                                ) {
                                  return (
                                    <div
                                      className="flex items-center justify-around border rounded-xl py-2 px-4"
                                      key={index}
                                    >
                                      <p>{ele.name}</p>
                                      <p>{ele.email}</p>
                                      <Button
                                        onClick={async (e) => {
                                          e.preventDefault();
                                          setSeleUsers((prev) => {
                                            return [
                                              ...prev,
                                              {
                                                id: ele._id,
                                                name: ele.name,
                                              },
                                            ];
                                          });
                                        }}
                                        variant={"outline"}
                                      >
                                        Add
                                      </Button>
                                    </div>
                                  );
                                }
                              })}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-center">
                          <Button
                            className="bg-green-600 mt-3 w-1/2"
                            disabled={loading}
                            onClick={(e) => {
                              e.preventDefault();
                              handleAdd();
                            }}
                          >
                            {loading ? "Adding..." : "Add"}
                          </Button>
                        </div>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div>
              {group.members.map((ele: any) => {
                <p className="text-gray-600 text-[4px]" key={ele._id}>
                  {ele.name}
                </p>;
              })}
            </div>
          </div>
          {loading ? (
            <div className="h-[60dvh] flex items-center justify-center">
              <Triangle />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="h-[70dvh] overflow-hidden overflow-y-auto py-3 px-4">
                {messages.map((ele: any, index: any) => {
                  return (
                    <div
                      key={index}
                      className={`flex ${
                        ele.by == userId ? "justify-end" : "justify-start"
                      } mb-4`}
                    >
                      {ele.kind == "text" ? (
                        <div
                          className={`max-w-xs break-words ${
                            ele.by == userId
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
                {messages.length == 0 && (
                  <p className="my-2 text-center text-red-400">No Messages</p>
                )}
                <div ref={scrollRef2} />
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
                                  type: "groupText",
                                  kind: "image",
                                  text: res.data,
                                  by: userId,
                                  channel: group.id,
                                  uu,
                                });
                                socket?.send(body);
                                setMessages((prev: any) => {
                                  return [
                                    ...prev,
                                    {
                                      by: userId,
                                      type: "groupText",
                                      kind: "image",
                                      text: res.data,
                                      channel: group.id,
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
                  onKeyPress={(e: any) => {
                    console.log("cool");
                    if (e.key === "Enter") {
                      if (message.length == 0) {
                        return toast.error("message filed is empty :(");
                      }
                      const uu = uuid();
                      const body = JSON.stringify({
                        type: "groupText",
                        kind: "text",
                        text: message,
                        by: userId,
                        channel: group.id,
                        uu,
                      });
                      socket?.send(body);
                      setMessages((prev: any) => {
                        return [
                          ...prev,
                          {
                            by: userId,
                            type: "groupText",
                            kind: "text",
                            text: message,
                            uu,
                          },
                        ];
                      });
                      setMessage("");
                      setEmojiOpne(false);
                    }
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    if (message.length == 0) {
                      return toast.error("message filed is empty :(");
                    }
                    const uu = uuid();
                    const body = JSON.stringify({
                      type: "groupText",
                      kind: "text",
                      text: message,
                      by: userId,
                      channel: group.id,
                      uu,
                    });
                    socket?.send(body);
                    setMessages((prev: any) => {
                      return [
                        ...prev,
                        {
                          by: userId,
                          type: "groupText",
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
              <div ref={scrollRef} />
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center h-[60dvh] dark:bg-gray-600 rounded-xl">
          <img src={pingme} height={500} width={500} className="rounded-xl " />
          <div className="flex items-end justify-center w-full ">
            <p>Face Time Feature coming soon 🚀.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupChat;
