import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
interface Info {
  info: {
    isloggedIn: boolean;
    name: string;
    email: string;
    id: string;
  };
  setInfo: any;
}
export const contextt = createContext<Info | null>(null);

const Contextt = ({ children }: { children: React.ReactNode }) => {
  const [info, setInfo] = useState({
    isloggedIn: false,
    name: "",
    email: "",
    id: "",
  });
  useEffect(() => {
    toast("Welcome :) !");
    const getInfo = async () => {
      console.log("checking user token");
      try {
        const res = await axios.get("http://localhost:8000/api/isloggedin", {
          withCredentials: true,
        });
        setInfo({
          isloggedIn: true,
          name: res.data.name,
          email: res.data.email,
          id: res.data.id,
        });
      } catch (err) {}
    };
    getInfo();
  }, []);
  return (
    <contextt.Provider value={{ info, setInfo }}>{children}</contextt.Provider>
  );
};
export default Contextt;
