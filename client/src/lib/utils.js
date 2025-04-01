import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import animationData from "@/assets/Greetings"


export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const colors = [
  "bg-[#ff006e] text-[#ff006e] border-[1px] border-[#ff006faa]",
  "bg-[#ff6d6a] text-[#ff6d6a] border-[1px] border-[#ff6d6abb]",
  "bg-[#ff906a] text-[#ff906a] border-[1px] border-[#ff906abb]",
  "bg-[#4cc9f0] text-[#4cc9f0] border-[1px] border-[#4cc9f0bb]",
];

export const getColor = (color) => {
  if (color >= 0 && color < colors.length) {
    return colors[color];
  }

  return colors[0]; // Fallback to the first color if out of range
};

export const animationDefaultOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,

}
