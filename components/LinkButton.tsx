"use client";

import { BusinessLink, ProfileDesign } from "../data/businesses";
import { SocialIcon } from "./SocialIcon";
import { readableText } from "../lib/profile-design";
import { ArrowUpRight } from "lucide-react";

interface LinkButtonProps {
  link: BusinessLink;
  slug?: string;
  primaryColor?: string;
  textColor?: string;
  design?: Partial<ProfileDesign>;
  preview?: boolean;
}

export function LinkButton({
  link,
  slug,
  primaryColor = "#000000",
  textColor = "#000000",
  design,
  preview,
}: LinkButtonProps) {
  const filled = link.featured || design?.button_style === "solid";
  const style = {
    borderColor: filled ? primaryColor : textColor,
    backgroundColor: filled ? primaryColor : "transparent",
    color: filled ? readableText(primaryColor) : textColor,
    borderRadius:
      design?.button_shape === "pill"
        ? 999
        : design?.button_shape === "rounded"
          ? 14
          : 0,
  };
  const content = (
    <>
      <span className="flex min-w-0 items-center gap-3">
        <SocialIcon type={link.type} className="w-5 h-5 shrink-0" />
        <span className="font-medium text-sm break-words [overflow-wrap:anywhere]">
          {link.label}
        </span>
      </span>
      <ArrowUpRight aria-hidden="true" className="w-5 h-5 shrink-0" />
    </>
  );
  const className =
    "flex items-center justify-between gap-3 w-full p-4 border transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4";
  if (preview)
    return (
      <div className={className} style={style}>
        {content}
      </div>
    );
  const inline = ["phone", "email", "contact"].includes(link.type);
  return (
    <a
      href={link.url}
      target={inline ? "_self" : "_blank"}
      rel={inline ? undefined : "noopener noreferrer"}
      className={className}
      style={style}
      onClick={() => {
        if (slug)
          fetch("/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              slug,
              link_type: link.type,
              link_label: link.label,
            }),
            keepalive: true,
          }).catch(() => {});
      }}
    >
      {content}
    </a>
  );
}
