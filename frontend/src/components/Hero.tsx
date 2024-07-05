import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import mern from "@/img/Mern.png";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { GithubIcon } from "lucide-react";
import { useContext } from "react";
import { contextt } from "@/Contextt";
const arr = [
  {
    image: mern,
    text: "",
  },
  {
    image: "",
    text: "Typescript+Zod+UseForm for form validations and input validations.",
  },
  {
    image: "",
    text: "WS library for creating websocket server etc.",
  },
];
const Hero = () => {
  const value = useContext(contextt);
  return (
    <div className="flex flex-col justify-around items-center my-2 ">
      <div className="flex flex-col items-center justify-center min-h-[70dvh] gap-3">
        <p className="text-[30px] md:text-[50px] text-center">
          Stay connected with ease and style
          <br />
          using our intuitive texting-app 🚀.
          <br />
          <span className="bg-gradient-to-r from-gray-600 via-purple-500 to-red-400 inline-block text-transparent bg-clip-text">
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
        <p className="w-8/13 text-center text-[20px] md:text-md text-xl">
          The application leverages the{" "}
          <span className="text-red-500">ws library</span> to enable WebSocket
          communication,
          <br />
          providing users with a seamless and instant messaging experience and
          <br /> <span className="text-red-500">mediasoup</span> sfu for video
          calling feature.
        </p>
        <div className="flex flex-col items-center justify-center">
          <a
            href="https://github.com/ArpitBlagan/chat-assignment"
            target="_blank"
          >
            <GithubIcon
              width={50}
              height={30}
              className="hover:bg-red-500 rounded-xl py-1"
            />
          </a>
          <p>Codebase</p>
        </div>
      </div>

      <div className="h-[60dvh] flex items-center justify-center">
        <iframe
          src="https://www.loom.com/embed/dbc5d7525e8e422eaf9c5b67fa634a58?sid=cc800c5b-3498-4a48-96f6-bf5d78ed2f9d"
          className="md:h-[400px] h-[300px] w-full md:w-[700px] rounded-md"
        ></iframe>
      </div>
      <div className="flex flex-col items-center justify-center gap-2 mb-3 mt-4">
        <p className="md:text-[25px]  text-center">About Stack Used</p>
        <Carousel className=" w-1/2 md:w-full max-w-xs">
          <CarouselContent>
            {arr.map((ele, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card className="">
                    <CardContent className="flex flex-col aspect-square items-center justify-center md:p-6 px-3">
                      <img src={ele.image} />
                      <p className="md:text-2xl text-[10px] md:font-semibold text-center ">
                        {ele.text}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
};

export default Hero;
