import { useContext, useEffect, useState } from "react";
import GroupChat from "./components/GroupChat";
import GroupDialog from "./components/GroupDialog";
import GroupList from "./components/GroupList";
import { Link, useLocation } from "react-router-dom";
import { contextt } from "./Contextt";
//import { toast } from "react-toastify";

const Group = () => {
  const [refetch, setRefetch] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const value = useContext(contextt);
  const [group, setGroup] = useState<any | null>(null);
  useEffect(() => {
    // toast.error(
    //   "shifting the deployment from render to aws ec2 so this feature will not properly sorry :("
    // );
    if (value && value.info.isloggedIn) {
      const ws = new WebSocket(
        `ws://ec2-3-27-162-152.ap-southeast-2.compute.amazonaws.com/socket?email=${
          "1" + value?.info.email
        }`
      );
      setSocket(ws);
      ws.addEventListener("message", (event) => {
        const message = JSON.parse(event.data);
        console.log("message", message);
        setMessages((prev) => {
          return [
            ...prev,
            {
              by: message.user._id,
              text: message.text,
              kind: message.kind,
            },
          ];
        });
      });
    }
  }, [value]);

  return (
    <div className="min-h-[70dvh] my-4 flex flex-col gap-4">
      <div className="flex items-center justify-end gap-3">
        <Link
          to="/chat"
          className="border py-2 px-4 rounded-xl hover:bg-green-600 transition duration-300 ease-in-out"
        >
          one-on-one chat
        </Link>
        <GroupDialog setRefetch={setRefetch} />
      </div>
      <div className="flex flex-col gap-3 my-5">
        <GroupList setGroup={setGroup} refetch={refetch} />
        <GroupChat
          socket={socket}
          group={group}
          userId={value?.info.id}
          messages={messages}
          setMessages={setMessages}
        />
      </div>
    </div>
  );
};

export default Group;
