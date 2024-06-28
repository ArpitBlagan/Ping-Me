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
  return (
    <div className="flex flex-col justify-around items-center my-2 ">
      <div className="flex flex-col items-center justify-center min-h-[70dvh]">
        <p className="text-[40px] md:text-[50px] text-center">
          Stay connected with ease and style
          <br />
          using our intuitive texting-app
          <br />
          your ultimate solution for seamless,
          <br />
          instant communication 🚀.
        </p>
        <Link
          to="/chat"
          className="py-2 px-4 mt-2 border border-gray-400 rounded-xl "
        >
          TextArea
        </Link>
      </div>

      <div className="h-[60dvh] flex items-center justify-center">
        <iframe
          src="https://www.loom.com/embed/dbc5d7525e8e422eaf9c5b67fa634a58?sid=cc800c5b-3498-4a48-96f6-bf5d78ed2f9d"
          className="h-[400px] w-[700px] rounded-md"
        ></iframe>
      </div>
      <div className="flex flex-col gap-2 mb-3 mt-4">
        <p className="text-[25px]  text-center">About Stack Used</p>
        <Carousel className="w-full max-w-xs">
          <CarouselContent>
            {arr.map((ele, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card className="">
                    <CardContent className="flex flex-col aspect-square items-center justify-center p-6">
                      <img src={ele.image} />
                      <p className="text-2xl font-semibold text-center">
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
