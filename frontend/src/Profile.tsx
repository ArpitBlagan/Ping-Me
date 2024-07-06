import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
const Profile = () => {
  const { id } = useParams();
  const [info, setInfo] = useState<any | null>(null);
  useEffect(() => {
    const getUserInfo = async () => {
      const res = await axios.get(`/api/user/info`, { withCredentials: true });
      console.log(res.data);
      setInfo(res.data);
    };
    if (id) {
      getUserInfo();
    }
  }, []);
  return (
    <div>
      <div className="flex flex-col items-center justify-center">
        <p>{info.name}</p>
        <p className="text-gray-600 text-sm">{info.email}</p>
      </div>
      <div>
        <p>Your Friends</p>
        {info.friends.map((ele: any) => {
          return (
            <p key={ele._id} className="text-gray-600">
              {ele.name}
            </p>
          );
        })}
      </div>
      <div>
        <p>Groups you are part in.</p>
        {info.groups.map((ele: any) => {
          return (
            <p key={ele._id} className="text-gray-600">
              {ele.name}
            </p>
          );
        })}
      </div>
    </div>
  );
};

export default Profile;
