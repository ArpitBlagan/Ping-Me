import { ModeToggle } from "./mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { Button } from "./ui/button";
import { contextt } from "@/Contextt";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MessageCircleMore } from "lucide-react";
const Navbar = () => {
  const navigate = useNavigate();
  const value = useContext(contextt);
  console.log(value);
  return (
    <div className="flex items-center border border-gray-600 rounded-xl py-2 px-4">
      <div className="flex-1 flex gap-3 items-center text-md md:text-[26px]  ">
        <Link
          to="/"
          className="hover:underline transition duration-300 ease-in-out md:block hidden "
        >
          <p>Ping Me</p>
        </Link>
        <MessageCircleMore className="text-red-600 cursor-pointer w-30 h-30" />
      </div>
      <div className="flex items-center justify-end gap-5">
        {value?.info.isloggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <p className="cursor-pointer">Profile</p>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem>{value.info.name}</DropdownMenuItem>
              <DropdownMenuItem>
                <span className="text-gray-700">{value.info.email}</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/chat">TextArea</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Button
                  onClick={async (e) => {
                    e.preventDefault();
                    try {
                      const res = await axios.get(
                        "https://chat-assignment-qrb7.onrender.com/api/logout",
                        { withCredentials: true },
                      );
                      console.log(res.data);
                      value.setInfo({
                        isloggedIn: false,
                        name: "",
                        email: "",
                        id: "",
                      });
                      navigate("/signin");
                    } catch (err) {
                      toast.error("");
                    }
                  }}
                >
                  Logout
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex gap-4 items-center text-sm">
            <Link to="/signin">SignUp</Link>
            <Link to="/signup">SignIn</Link>
          </div>
        )}
        <ModeToggle />
      </div>
    </div>
  );
};

export default Navbar;
