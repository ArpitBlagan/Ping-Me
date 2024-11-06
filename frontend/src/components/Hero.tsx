import { Link } from "react-router-dom";
import { useContext } from "react";
import { contextt } from "@/Contextt";
import {
  RiChat3Fill,
  RiFlashlightFill,
  RiGithubFill,
  RiMegaphoneFill,
} from "@remixicon/react";
import { BackgroundLines } from "@/components/ui/background-lines";
import { HoverBorderGradient } from "@/components/ui/hover-background";
import { motion } from "framer-motion";
const features = [
  {
    title: "Fast and Seamless",
    description:
      "A robust file transfer application should support high-speed transfers and allow users to send large files without restrictions. ",
    icon: <RiFlashlightFill size={50} />,
  },
  {
    title: "User-Friendly Interface",
    description:
      "The application should have an intuitive interface that allows users to easily upload, send, and manage their files.",
    icon: <RiMegaphoneFill size={50} />,
  },
  {
    title: "One-on-One and Group Chats",
    description:
      " Users can send messages, images, videos, and files in real-time, facilitating direct communication between individuals or collaborative discussions among multiple participants.",
    icon: <RiChat3Fill size={50} />,
  },
];
const Hero = () => {
  const value = useContext(contextt);
  return (
    <div className="flex flex-col justify-around items-center my-2 ">
      <div
        className={`flex relative flex-col rounded-md mb-10 items-center w-full justify-center min-h-[90dvh] gap-3 `}
      >
        <BackgroundLines className="flex items-center justify-center w-full flex-col px-4">
          <p className="text-[20px] md:text-[50px] font-bold text-center">
            Stay connected with ease and style
            <br />
            using PingMe 🚀.
            <br />
            <span className="bg-gradient-to-r font-md from-gray-600 via-purple-500 to-red-400 inline-block text-transparent bg-clip-text">
              your ultimate solution for seamless,
              <br />
              instant communication.
            </span>
          </p>

          {value?.info.isloggedIn && (
            <Link
              to="/chat"
              className=" py-2 px-4 mt-2  text-center border  rounded-xl hover:bg-green-600  dark:hover:bg-violet-600 transition duration-300 ease-in-out"
            >
              Text-Area
            </Link>
          )}
          <p className="w-8/13 text-center text-[14px] md:text-xl  text-gray-700">
            The application leverages the ws library to enable WebSocket
            communication,
            <br />
            providing users with a seamless and instant messaging experience and
            more
          </p>

          <div className="mt-10 flex items-center gap-4">
            <HoverBorderGradient className="dark:bg-black bg-white text-black dark:text-white flex items-center ">
              <a
                href="https://github.com/ArpitBlagan/chat-assignment"
                target="_blank"
                rel="noreferrer"
                className="flex  items-center justify-center t py-2 px-6 rounded-xl"
              >
                <RiGithubFill className=" rounded-xl ml-1" />
              </a>
            </HoverBorderGradient>
            <HoverBorderGradient
              containerClassName="rounded-full"
              as="button"
              className="dark:bg-black bg-white text-black dark:text-white flex items-center "
            >
              <a
                href="https://refnet-sepia.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="flex  items-center justify-center t py-2 px-6 rounded-xl"
              >
                Refnet
              </a>
            </HoverBorderGradient>
          </div>
        </BackgroundLines>
      </div>
      <div className="flex flex-col gap-5 items-center justify-center min-h-[40vh] mb-10">
        <p className="text-3xl text-semibold text-gray-700">Features</p>
        <div className="grid md:grid-cols-3 gap-3">
          {features.map((ele, index) => {
            return (
              <motion.div
                whileHover={{ scale: 1.02 }}
                key={index}
                className="cursor-pointer flex flex-col items-center justify-center gap-3 border shadow-lg rounded-xl py-3 px-4"
              >
                <div className="flex flex-col gap-3 items-center justify-start">
                  {ele.icon}
                  <p className="font-semibold md:text-3xl">{ele.title}</p>
                </div>
                <p className="text-gray-700 text-md text-center">
                  {ele.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="min-h-[60dvh] flex flex-col items-center gap-5 justify-center">
        <p className="text-gray-700 font-bold text-5xl">Demo</p>
        <iframe
          src="https://www.loom.com/embed/dbc5d7525e8e422eaf9c5b67fa634a58?sid=cc800c5b-3498-4a48-96f6-bf5d78ed2f9d"
          className="md:h-[400px] h-[300px] w-full md:w-[700px] rounded-md"
        ></iframe>
      </div>
    </div>
  );
};

export default Hero;
