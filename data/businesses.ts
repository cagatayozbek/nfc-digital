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
  created_at?: string;
}
