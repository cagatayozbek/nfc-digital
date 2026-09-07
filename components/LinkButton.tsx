import React from 'react';
import { BusinessLink } from '../data/businesses';
import { SocialIcon } from './SocialIcon';

interface LinkButtonProps {
  link: BusinessLink;
  themeType?: 'dark' | 'light';
}

export function LinkButton({ link, themeType = 'light' }: LinkButtonProps) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between w-full p-4 mb-3 border border-black bg-transparent hover:bg-black hover:text-white transition-colors duration-200"
    >
      <div className="flex items-center gap-4">
        <SocialIcon type={link.type} className="w-5 h-5 transition-colors duration-200" />
        <span className="font-medium text-sm uppercase tracking-wider">{link.label}</span>
      </div>
      <span className="text-black group-hover:text-white transition-colors duration-200 font-light">
        ↗
      </span>
    </a>
  );
}
