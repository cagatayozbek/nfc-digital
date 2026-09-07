import React from 'react';
import { BusinessLink } from '../data/businesses';
import { SocialIcon } from './SocialIcon';

// Bu link tipleri yeni sekme açmadan çalışmalı
const INLINE_TYPES = new Set(['phone', 'email', 'contact']);

interface LinkButtonProps {
  link: BusinessLink;
  primaryColor?: string;
  textColor?: string;
}

export function LinkButton({ link, primaryColor = '#000000', textColor = '#000000' }: LinkButtonProps) {
  const isInline = INLINE_TYPES.has(link.type);

  return (
    <a
      href={link.url}
      target={isInline ? '_self' : '_blank'}
      rel={isInline ? undefined : 'noopener noreferrer'}
      className="group flex items-center justify-between w-full p-4 mb-3 border transition-colors duration-200"
      style={{
        borderColor: textColor,
        color: textColor,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.backgroundColor = primaryColor;
        el.style.color = '#ffffff';
        el.style.borderColor = primaryColor;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.backgroundColor = 'transparent';
        el.style.color = textColor;
        el.style.borderColor = textColor;
      }}
    >
      <div className="flex items-center gap-4">
        <SocialIcon type={link.type} className="w-5 h-5" />
        <span className="font-medium text-sm uppercase tracking-wider">{link.label}</span>
      </div>
      <span className="font-light">↗</span>
    </a>
  );
}
