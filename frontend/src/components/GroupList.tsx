import axios from "axios";
import { useEffect, useState } from "react";
import { Triangle } from "react-loader-spinner";
import { toast } from "react-toastify";
const GroupList = ({ refetch, setGroup }: any) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const getGroups = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          "https://chat-assignment-qrb7.onrender.com/api/group",
          { withCredentials: true }
        );
        console.log(res.data);
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
        <div className="flex flex-col gap-2 border py-2 px-3 rounded-xl">
          <div className="flex items-center justify-center text-gray-600 text-lg">
            <p className="hover:text-green-600">Groups</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {groups.map((ele) => {
              return (
                <div
                  key={ele._id}
                  className="flex items-center gap-3 justify-start border py-2 px-4 rounded-xl cursor-pointer hover:text-green-600"
                  onClick={(e) => {
                    e.preventDefault();
                    setGroup({
                      id: ele._id,
                      name: ele.name,
                      image: ele.profileImage,
                      members: ele.users,
                    });
                  }}
                >
                  <img
                    src={ele.profileImage}
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                  <p>{ele.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupList;
