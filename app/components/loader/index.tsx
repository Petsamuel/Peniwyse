"use client";

import Image from "next/image";

const Loader = () => {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-card-bg">
      <div className="animate-pulse flex flex-col items-center gap-6">
        <div className="h-auto w-16 overflow-hidden flex items-center justify-center">
          <Image
            src={"/logo-white.png"}
            alt="Logo"
            width={100}
            height={100}
            className="h-full w-full object-contain scale-[1]"
          />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-black text-foreground tracking-tighter">
            TradeBlott<span className="text-[#1596fe] font-black">r</span>
          </span>
          <div className="mt-4 flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1596fe] animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#1596fe] animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#1596fe] animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
