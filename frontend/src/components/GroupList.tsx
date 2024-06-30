import axios from "axios";
import { useEffect, useState } from "react";
import { Triangle } from "react-loader-spinner";
import { toast } from "react-toastify";
const GroupList = ({ refetch }: any) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const getGroups = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          "https://chat-assignment-qrb7.onrender.com/api/api/group",
          { withCredentials: true }
        );
        setGroups(res.data);
        setLoading(false);
      } catch (err) {
        toast.error("something went wrong while fetching groups :(");
        setLoading(false);
      }
    };
    getGroups();
  }, [refetch]);
  return (
    <div>
      {loading ? (
        <div className="flex items-center justify-center">
          <Triangle />
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {groups.map((ele) => {
            return (
              <div>
                <p>{ele.name}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GroupList;
