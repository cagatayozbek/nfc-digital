"use client";

import { BusinessProfile as ProfileType } from "../data/businesses";
import {
  DEFAULT_DESIGN,
  readableText,
  visibleLinks,
} from "../lib/profile-design";
import { LinkButton } from "./LinkButton";
import { UserRound } from "lucide-react";

function downloadVCard(profile: ProfileType) {
  const links = visibleLinks(profile.links);
  const phone = links.find((l) => l.type === "phone")?.url.replace("tel:", "");
  const email = links
    .find((l) => l.type === "email")
    ?.url.replace("mailto:", "");
  const website = links.find((l) => l.type === "website")?.url;
  const escape = (value: string) =>
    value
      .replace(/\\/g, "\\\\")
      .replace(/\r?\n/g, "\\n")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,");
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escape(profile.name)}`,
    `ORG:${escape(profile.name)}`,
    profile.description ? `NOTE:${escape(profile.description)}` : "",
    phone ? `TEL;TYPE=WORK,VOICE:${escape(phone)}` : "",
    email ? `EMAIL:${escape(email)}` : "",
    website ? `URL:${escape(website)}` : "",
    profile.logo_url ? `PHOTO;VALUE=URI:${escape(profile.logo_url)}` : "",
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([vcard + "\r\n"], { type: "text/vcard;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `${profile.slug || "profil"}.vcf`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function BusinessProfile({
  profile,
  preview = false,
}: {
  profile: ProfileType;
  preview?: boolean;
}) {
  const design = { ...DEFAULT_DESIGN, ...profile.design };
  const gap = { compact: 12, comfortable: 24, spacious: 32 }[design.spacing];
  const radius =
    design.button_shape === "pill"
      ? 999
      : design.button_shape === "rounded"
        ? 14
        : 0;
  const fonts = {
    sans: "Arial, Helvetica, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    mono: "'Courier New', monospace",
  };
  const links = visibleLinks(profile.links);
  return (
    <div
      data-public-profile={preview ? undefined : "true"}
      className={preview ? "min-h-full w-full" : "min-h-screen min-h-[100dvh] w-full"}
      style={{
        backgroundColor: profile.background_color,
        color: profile.text_color,
        fontFamily: fonts[design.font],
      }}
    >
      <div
        className="mx-auto w-full max-w-sm px-6 flex flex-col"
        style={{
          paddingTop: preview ? gap * 2 : `max(${gap * 2}px, env(safe-area-inset-top))`,
          paddingBottom: preview ? gap * 2 : `max(${gap * 2}px, env(safe-area-inset-bottom))`,
          alignItems: design.alignment === "left" ? "flex-start" : "center",
          textAlign: design.alignment,
        }}
      >
        {design.cover_url ? (
          <img
            src={design.cover_url}
            alt="Üst banner"
            className="w-full h-auto shrink-0"
            style={{ marginBottom: gap }}
          />
        ) : (
          <div
            className="shrink-0 overflow-hidden flex items-center justify-center"
            style={{
              width: design.photo_size,
              height: design.photo_size,
              marginBottom: gap,
              borderRadius:
                design.photo_shape === "circle"
                  ? "50%"
                  : design.photo_shape === "rounded"
                    ? 20
                    : 0,
            }}
          >
            {profile.logo_url ? (
              <img
                src={profile.logo_url}
                alt={`${profile.name || "Profil"} görseli`}
                className="w-full h-full"
                style={{
                  objectFit: design.photo_fit,
                  objectPosition: `${design.photo_x}% ${design.photo_y}%`,
                  transform: `scale(${design.photo_zoom})`,
                  transformOrigin: `${design.photo_x}% ${design.photo_y}%`,
                }}
              />
            ) : (
              <UserRound
                size={design.photo_size / 2}
                strokeWidth={1}
                aria-label="Profil görseli yok"
              />
            )}
          </div>
        )}
        <h1
          className="text-2xl font-bold w-full break-words [overflow-wrap:anywhere]"
          style={{ marginBottom: 12 }}
        >
          {profile.name || (preview ? "Profil adın" : "")}
        </h1>
        {profile.description && (
          <p
            className="text-sm leading-relaxed whitespace-pre-wrap break-words w-full [overflow-wrap:anywhere]"
            style={{ marginBottom: gap }}
          >
            {profile.description}
          </p>
        )}
        <div
          className="w-full flex flex-col"
          style={{
            gap: Math.max(8, gap / 2),
            marginTop: profile.description ? 0 : gap,
            marginBottom: gap,
          }}
        >
          {links.map((link, i) => (
            <LinkButton
              key={link.id || i}
              link={link}
              slug={profile.slug}
              primaryColor={profile.primary_color}
              textColor={profile.text_color}
              design={design}
              preview={preview}
            />
          ))}
          {preview && links.length === 0 && (
            <p className="text-sm py-4">
              Eklediğin bağlantılar burada görünecek.
            </p>
          )}
        </div>
        {design.show_contact && (
          <button
            type="button"
            tabIndex={preview ? -1 : undefined}
            onClick={preview ? undefined : () => downloadVCard(profile)}
            className="w-full py-4 px-4 font-medium text-sm border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            style={{
              backgroundColor: profile.primary_color,
              color: readableText(profile.primary_color),
              borderColor: profile.primary_color,
              borderRadius: radius,
            }}
          >
            {design.contact_label}
          </button>
        )}
        {design.footer_image_url && (
          <img
            src={design.footer_image_url}
            alt="Alt görsel"
            className="w-full h-auto shrink-0"
            style={{ marginTop: gap }}
          />
        )}
        <p className="text-xs tracking-widest mt-12">NFC DIGITAL</p>
      </div>
    </div>
  );
}
