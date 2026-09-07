"use client";

import React from 'react';
import { BusinessProfile as ProfileType } from '../data/businesses';
import { LinkButton } from './LinkButton';

export function BusinessProfile({ profile }: { profile: ProfileType }) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center py-16 px-6 font-sans bg-white text-black selection:bg-black selection:text-white">
      <div className="w-full max-w-sm flex flex-col items-center">
        
        {/* Profile Image/Logo - Minimalist */}
        <div className="relative w-28 h-28 mb-8 border border-black p-1">
          <img
            src={profile.logo}
            alt={`${profile.name} logo`}
            className="object-cover w-full h-full grayscale"
          />
        </div>

        {/* Business Name and Description */}
        <h1 className="text-2xl font-bold text-center mb-3 uppercase tracking-widest">{profile.name}</h1>
        <p className="text-center text-sm mb-10 font-light tracking-wide text-gray-600 px-2 leading-relaxed">
          {profile.description}
        </p>

        {/* Links List */}
        <div className="w-full mb-8">
          {profile.links.map((link, index) => (
            <LinkButton key={index} link={link} themeType="light" />
          ))}
        </div>

        {/* Action Button */}
        <button 
          className="w-full py-4 px-4 bg-black text-white font-medium text-sm uppercase tracking-widest border border-black hover:bg-white hover:text-black transition-colors duration-200"
          onClick={() => alert("Rehbere ekleme özelliği yakında!")}
        >
          Rehbere Kaydet
        </button>

        {/* Footer */}
        <div className="mt-16 text-xs uppercase tracking-widest text-gray-400 text-center">
          <p>NFC Digital</p>
        </div>
      </div>
    </div>
  );
}
