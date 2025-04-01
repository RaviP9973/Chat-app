import { animationDefaultOptions } from "@/lib/utils";
import React from "react";
import Lottie from "lottie-react";
import animationData from "@/assets/Greetings"

const EmptyChatContainer = () => {
  return (
    <div className="flex-1 md:bg-[#1c1d25] md:flex flex-col justify-center items-center hidden transition-all duration-1000">
      <Lottie
        loop={true}
        autoplay={true}
        animationData= {animationData} 
        className="h-[400px] w-[400px]"
      />
      <div className="text-opacity-80 text-white flex flex-col gap-5 items-center mt-10 lg:text-4xl transition-all duration-300 text-center">
        <h3 className="poppins-medium">
            Hi<span className="text-purple-500 ">!</span> Welcome to
            <span className="text-purple-500"> Whispr</span> 
            <span className="text-purple-500 ">.</span>
        </h3>
      </div>
    </div>
  );
};

export default EmptyChatContainer;
