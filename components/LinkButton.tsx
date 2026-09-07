import React from "react";
import { BusinessLink } from "../data/businesses";
import { SocialIcon } from "./SocialIcon";

interface LinkButtonProps {
  link: BusinessLink;
  primaryColor: string;
}

export function LinkButton({ link, primaryColor }: LinkButtonProps) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center w-full p-4 mb-4 transition-transform hover:scale-105 active:scale-95 shadow-md rounded-xl bg-white"
      style={{ borderLeft: `6px solid ${primaryColor}` }}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-full mr-4 bg-gray-100">
        <SocialIcon type={link.type} />
      </div>
      <span className="font-semibold text-lg flex-1 text-gray-800">
        {link.label}
      </span>
      <span className="text-gray-400">→</span>
    </a>
  );
}
