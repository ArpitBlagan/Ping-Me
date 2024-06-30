import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useEffect, useRef, useState, useContext } from "react";
import { CircleX } from "lucide-react";
import { Triangle } from "react-loader-spinner";
import { toast } from "react-toastify";
import axios from "axios";
import { contextt } from "@/Contextt";

const GroupDialog = ({ setRefetch }: any) => {
  const value = useContext(contextt);
  const [name, setName] = useState("");
  const [file, setFile] = useState<any | null>(null);
  const fileInput = useRef(null);
  const [preview, setPreview] = useState<null | any>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [fLoading, setFLoading] = useState(false);
  const [seleUsers, setSeleUsers] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  useEffect(() => {
    const getFriends = async () => {
      setFLoading(true);
      try {
        const res = await axios.get(
          `https://chat-assignment-qrb7.onrender.com/api/search?text=${searchText}`,
          { withCredentials: true }
        );
        console.log(res.data);
        setUsers(res.data);
        setFLoading(false);
        setRefetch((prev: any) => {
          return !prev;
        });
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
  const handleCreate = async () => {
    if (name.length == 0 || !file) {
      toast.error("name and profile imaeg fileds are required :(");
      return;
    }
    setLoading(true);
    const formdata = new FormData();
    formdata.append("name", name);
    formdata.append("file", file);
    formdata.append("users", JSON.stringify(seleUsers));
    try {
      await axios.post(
        "https://chat-assignment-qrb7.onrender.com/api/group/create",
        formdata,
        {
          withCredentials: true,
        }
      );
      toast.success("Group Created Successfully :)");
      setLoading(false);
      setOpen(false);
    } catch (err) {
      toast.error(`something went wrong while create group ${name}`);
      setLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600">Create Group</Button>
      </DialogTrigger>
      <DialogContent className="overflow-hidden overflow-y-auto h-[85dvh]">
        <DialogHeader>
          <DialogTitle className="mb-4 text-center text-gray-600">
            Enjoy Chatting with friends in a group
          </DialogTitle>
          <DialogDescription>
            <form className="flex flex-col gap-3 ">
              <div className="flex flex-col gap-3 items-start">
                <label>Group Name</label>
                <Input
                  placeholder="Broskies"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                />
              </div>
              <div className="flex flex-col gap-3 items-start">
                <label>Profile Image</label>
                <Input
                  type="file"
                  className="text-gray-500 cursor-pointer"
                  ref={fileInput}
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
                  <div className="flex items-center justify-center w-full relative">
                    <img
                      src={preview}
                      alt="Preview"
                      style={{ width: "200px", marginTop: "10px" }}
                      className="rounded-md"
                    />
                    <CircleX
                      className="absolute top-0 right-0 cursor-pointer"
                      onClick={() => {
                        setPreview(null);
                        setFile(null);
                        if (fileInput.current) {
                          //@ts-ignore
                          fileInput.current.value = "";
                        }
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <label>Search User</label>
                <Input
                  placeholder="Arpit"
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                  }}
                />
                <label>members</label>
                <div className="flex flex-wrap gap-2">
                  {seleUsers.map((ele, index) => {
                    console.log(ele);
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
                  <p className="bg-gray-600 py-2 px-4 rounded-xl">
                    {seleUsers.length == 0 ? "Only you" : "You"}
                  </p>
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
                      console.log(present);
                      if (ele._id != value?.info.id && !present) {
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
                                    { id: ele._id, name: ele.name },
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
              <Button
                className="bg-green-600 mt-3"
                disabled={loading}
                onClick={(e) => {
                  e.preventDefault();
                  handleCreate();
                }}
              >
                {loading ? "Creating..." : "Create"}
              </Button>
            </form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default GroupDialog;
