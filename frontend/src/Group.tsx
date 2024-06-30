import { useState } from "react";
import GroupChat from "./components/GroupChat";
import GroupDialog from "./components/GroupDialog";
import GroupList from "./components/GroupList";

const Group = () => {
  const [refetch, setRefetch] = useState(false);
  return (
    <div className="h-[80dvh] my-4">
      <div className="flex items-center justify-end">
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
