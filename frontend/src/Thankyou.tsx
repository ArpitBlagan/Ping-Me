import { useContext } from "react";
import { contextt } from "./Contextt";
import { Link } from "react-router-dom";
const Thankyou = () => {
  const value = useContext(contextt);
  return (
    <div className="h-[80dvh] flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-3">
        <p className="text-xl">Hope you like the quality 🙏🏼.</p>
        <p className="text-md text-gray-600">
          We are improving it more and adding more functionality to it 🚀.
        </p>
        {value?.info.isloggedIn && (
          <Link
            to="/chat"
            className=" py-2 px-4 mt-2  text-center border  rounded-xl hover:bg-gray-400 dark:hover:bg-violet-600 transition duration-300 ease-in-out"
          >
            Text-Area
          </Link>
        )}
      </div>
    </div>
  );
};

export default Thankyou;
