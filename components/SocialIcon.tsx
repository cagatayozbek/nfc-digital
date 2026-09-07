import React from "react";
import { LinkType } from "../data/businesses";

export function SocialIcon({ type }: { type: LinkType }) {
  // A simple icon renderer based on the type.
  // In a real app, use a library like lucide-react or react-icons

  switch (type) {
    case "instagram":
      return <span className="text-xl">📸</span>;
    case "whatsapp":
      return <span className="text-xl">💬</span>;
    case "website":
      return <span className="text-xl">🌐</span>;
    case "maps":
      return <span className="text-xl">📍</span>;
    case "phone":
      return <span className="text-xl">📞</span>;
    case "email":
      return <span className="text-xl">✉️</span>;
    case "google_review":
      return <span className="text-xl">⭐</span>;
    case "contact":
      return <span className="text-xl">👤</span>;
    default:
      return <span className="text-xl">🔗</span>;
  }
}
