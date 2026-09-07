"use client";

import React from "react";
import Image from "next/image";
import { BusinessProfile as ProfileType } from "../data/businesses";
import { LinkButton } from "./LinkButton";

function downloadVCard(profile: ProfileType) {
  // Telefon numarasını link'lerden çıkar
  const phoneLink = profile.links.find((l) => l.type === "phone");
  const emailLink = profile.links.find((l) => l.type === "email");
  const websiteLink = profile.links.find((l) => l.type === "website");

  const phone = phoneLink?.url.replace("tel:", "") ?? "";
  const email = emailLink?.url.replace("mailto:", "") ?? "";
  const website = websiteLink?.url ?? "";

  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${profile.name}`,
    `ORG:${profile.name}`,
    profile.description ? `NOTE:${profile.description}` : "",
    phone ? `TEL;TYPE=WORK,VOICE:${phone}` : "",
    email ? `EMAIL:${email}` : "",
    website ? `URL:${website}` : "",
    `PHOTO;VALUE=URI:${profile.logo_url}`,
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n");

  const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${profile.slug ?? profile.name}.vcf`;
  a.click();
  URL.revokeObjectURL(url);
}

export function BusinessProfile({ profile }: { profile: ProfileType }) {
  const slug = profile.slug;
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center py-16 px-6 font-sans selection:bg-black selection:text-white"
      style={{
        backgroundColor: profile.background_color,
        color: profile.text_color,
      }}
    >
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Logo */}
        <div
          className="relative w-36 h-36 mb-8"
          style={{ borderColor: profile.text_color }}
        >
          <Image
            src={profile.logo_url || "https://placehold.co/400x400?text=Logo"}
            alt={`${profile.name} logo`}
            fill
            className="object-contain"
            unoptimized={profile.logo_url?.startsWith("http")}
          />
        </div>

        {/* İşletme Adı ve Açıklama */}
        <h1
          className="text-2xl font-bold text-center mb-3 uppercase tracking-widest"
          style={{ color: profile.text_color }}
        >
          {profile.name}
        </h1>
        <p
          className="text-center text-sm mb-10 font-light tracking-wide px-2 leading-relaxed opacity-70"
          style={{ color: profile.text_color }}
        >
          {profile.description}
        </p>

        {/* Linkler */}
        <div className="w-full mb-8">
          {profile.links.map((link, index) => (
            <LinkButton
              key={index}
              link={link}
              slug={slug}
              primaryColor={profile.primary_color}
              textColor={profile.text_color}
            />
          ))}
        </div>

        {/* Rehbere Kaydet */}
        <button
          className="w-full py-4 px-4 font-medium text-sm uppercase tracking-widest border transition-colors duration-200"
          style={{
            backgroundColor: profile.primary_color,
            color: profile.background_color,
            borderColor: profile.primary_color,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "transparent";
            (e.currentTarget as HTMLButtonElement).style.color =
              profile.primary_color;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              profile.primary_color;
            (e.currentTarget as HTMLButtonElement).style.color =
              profile.background_color;
          }}
          onClick={() => downloadVCard(profile)}
        >
          Rehbere Kaydet
        </button>

        {/* Footer */}
        <div className="mt-16 text-xs uppercase tracking-widest opacity-30 text-center">
          <p>NFC Digital</p>
        </div>
      </div>
    </div>
  );
}
