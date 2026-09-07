"use client";

import React from "react";
import { BusinessProfile as ProfileType } from "../data/businesses";
import { LinkButton } from "./LinkButton";

export function BusinessProfile({ profile }: { profile: ProfileType }) {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans"
      style={{
        backgroundColor: profile.theme.background,
        color: profile.theme.text,
      }}
    >
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Profile Image/Logo */}
        <div
          className="relative w-32 h-32 mb-6 shadow-xl rounded-full overflow-hidden border-4 bg-white"
          style={{ borderColor: profile.theme.primary }}
        >
          <img
            src={profile.logo}
            alt={`${profile.name} logo`}
            className="object-cover w-full h-full"
          />
        </div>

        {/* Business Name and Description */}
        <h1 className="text-3xl font-bold text-center mb-2">{profile.name}</h1>
        <p className="text-center text-lg mb-8 opacity-80 px-4">
          {profile.description}
        </p>

        {/* Links List */}
        <div className="w-full">
          {profile.links.map((link, index) => (
            <LinkButton
              key={index}
              link={link}
              primaryColor={profile.theme.primary}
            />
          ))}
        </div>

        {/* VCard / Save to Contacts Button (Optional extra for MVP) */}
        <button
          className="mt-6 w-full py-3 px-4 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          style={{ backgroundColor: profile.theme.primary }}
          onClick={() => alert("Rehbere ekleme özelliği yakında!")}
        >
          Rehbere Kaydet
        </button>

        {/* Footer */}
        <div className="mt-12 text-sm opacity-50 text-center">
          <p>Powered by NFC Digital</p>
        </div>
      </div>
    </div>
  );
}
