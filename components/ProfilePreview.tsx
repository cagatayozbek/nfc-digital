"use client";

import React from "react";
import {
  BusinessProfile as ProfileType,
  BusinessLink,
} from "../data/businesses";
import { SocialIcon } from "./SocialIcon";

interface ProfilePreviewProps {
  name: string;
  description: string;
  logo_url: string;
  primary_color: string;
  background_color: string;
  text_color: string;
  links: { type: BusinessLink["type"]; label: string; url: string }[];
}

export function ProfilePreview({
  name,
  description,
  logo_url,
  primary_color,
  background_color,
  text_color,
  links,
}: ProfilePreviewProps) {
  return (
    <div
      className="w-full h-full overflow-y-auto flex flex-col items-center py-10 px-4 font-sans"
      style={{ backgroundColor: background_color, color: text_color }}
    >
      {/* Logo */}
      {logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo_url}
          alt={name || "Logo"}
          className="w-24 h-24 object-contain mb-5"
        />
      ) : (
        <div
          className="w-24 h-24 mb-5 flex items-center justify-center text-xs border"
          style={{ borderColor: text_color, color: text_color, opacity: 0.3 }}
        >
          Logo
        </div>
      )}

      {/* Name */}
      <h2
        className="text-lg font-bold text-center uppercase tracking-widest mb-2"
        style={{ color: text_color }}
      >
        {name || "İşletme Adı"}
      </h2>

      {/* Description */}
      <p
        className="text-center text-xs mb-6 font-light tracking-wide px-2 leading-relaxed opacity-70"
        style={{ color: text_color }}
      >
        {description || "Açıklama..."}
      </p>

      {/* Links */}
      <div className="w-full mb-4">
        {links.length === 0 && (
          <p className="text-xs text-center opacity-30">
            Linkler burada görünür
          </p>
        )}
        {links.map((link, i) => (
          <div
            key={i}
            className="flex items-center justify-between w-full p-3 mb-2 border text-xs"
            style={{ borderColor: text_color, color: text_color }}
          >
            <div className="flex items-center gap-2">
              <SocialIcon type={link.type} className="w-3.5 h-3.5" />
              <span className="font-medium uppercase tracking-wider">
                {link.label || "(etiket)"}
              </span>
            </div>
            <span>↗</span>
          </div>
        ))}
      </div>

      {/* Save contact */}
      <div
        className="w-full py-3 text-center text-xs font-medium uppercase tracking-widest border"
        style={{
          backgroundColor: primary_color,
          color: background_color,
          borderColor: primary_color,
        }}
      >
        Rehbere Kaydet
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs uppercase tracking-widest opacity-20">
        NFC Digital
      </p>
    </div>
  );
}
