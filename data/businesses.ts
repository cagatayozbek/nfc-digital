export type LinkType =
  | "instagram"
  | "whatsapp"
  | "website"
  | "maps"
  | "phone"
  | "email"
  | "google_review"
  | "contact";

export interface BusinessLink {
  id?: string;
  visible?: boolean;
  featured?: boolean;
  type: LinkType;
  label: string;
  url: string;
}

export interface BusinessProfile {
  id?: string;
  slug: string;
  name: string;
  description: string;
  logo_url: string;
  primary_color: string;
  background_color: string;
  text_color: string;
  links: BusinessLink[];
  design?: Partial<ProfileDesign>;
  created_at?: string;
}

export interface ProfileDesign {
  template: "personal" | "artist" | "business";
  cover_url: string;
  photo_size: number;
  photo_shape: "square" | "rounded" | "circle";
  photo_fit: "contain" | "cover";
  photo_x: number;
  photo_y: number;
  photo_zoom: number;
  font: "sans" | "serif" | "mono";
  button_shape: "square" | "rounded" | "pill";
  button_style: "outline" | "solid";
  spacing: "compact" | "comfortable" | "spacious";
  alignment: "center" | "left";
  show_contact: boolean;
  contact_label: string;
}
