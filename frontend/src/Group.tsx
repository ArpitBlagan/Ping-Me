import { useState } from "react";
import GroupChat from "./components/GroupChat";
import GroupDialog from "./components/GroupDialog";
import GroupList from "./components/GroupList";
import { Link } from "react-router-dom";

const Group = () => {
  const [refetch, setRefetch] = useState(false);
  return (
    <div className="h-[80dvh] my-4 flex flex-col gap-4">
      <div className="flex items-center justify-end gap-3">
        <Link
          to="/chat"
          className="border py-2 px-4 rounded-xl hover:bg-green-600 transition duration-300 ease-in-out"
        >
          one-on-one chat
        </Link>
        <GroupDialog setRefetch={setRefetch} />
      </div>
      <div className="flex flex-col gap-3">
        <GroupList refetch={refetch} />
        <GroupChat />
      </div>
    </div>
  );
};

export default Group;
