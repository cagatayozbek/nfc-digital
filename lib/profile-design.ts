import { BusinessLink, LinkType, ProfileDesign } from "../data/businesses";

export const DEFAULT_DESIGN: ProfileDesign = {
  template: "business",
  cover_url: "",
  footer_image_url: "",
  photo_size: 144,
  photo_shape: "square",
  photo_fit: "contain",
  photo_x: 50,
  photo_y: 50,
  photo_zoom: 1,
  font: "sans",
  button_shape: "square",
  button_style: "outline",
  spacing: "spacious",
  alignment: "center",
  show_contact: true,
  contact_label: "Rehbere Kaydet",
};

export const TEMPLATES = [
  {
    id: "personal",
    name: "Kişisel",
    description: "Sade ve samimi",
    primary: "#354f46",
    background: "#f4f6f2",
    text: "#243b32",
    design: {
      photo_shape: "circle",
      photo_fit: "cover",
      photo_size: 120,
      button_shape: "pill",
      spacing: "comfortable",
      show_contact: true,
    },
  },
  {
    id: "artist",
    name: "Sanatçı",
    description: "İçeriğini öne çıkar",
    primary: "#a52831",
    background: "#ffe0e0",
    text: "#8a1724",
    design: {
      photo_shape: "rounded",
      photo_fit: "cover",
      photo_size: 160,
      button_shape: "rounded",
      spacing: "comfortable",
      font: "serif",
      show_contact: false,
    },
  },
  {
    id: "business",
    name: "İşletme",
    description: "Net ve profesyonel",
    primary: "#172d4b",
    background: "#ffffff",
    text: "#172d4b",
    design: {
      photo_shape: "square",
      photo_fit: "contain",
      photo_size: 144,
      button_shape: "square",
      spacing: "spacious",
      show_contact: true,
    },
  },
] as const;

export const LINK_TYPES: {
  value: LinkType;
  label: string;
  placeholder: string;
}[] = [
  { value: "website", label: "Web sitesi", placeholder: "example.com" },
  {
    value: "instagram",
    label: "Instagram",
    placeholder: "@kullaniciadi veya profil adresi",
  },
  { value: "whatsapp", label: "WhatsApp", placeholder: "+90 555 123 45 67" },
  { value: "phone", label: "Telefon", placeholder: "+90 555 123 45 67" },
  { value: "email", label: "E-posta", placeholder: "merhaba@example.com" },
  { value: "maps", label: "Harita", placeholder: "Harita bağlantısı" },
  {
    value: "google_review",
    label: "Google değerlendirme",
    placeholder: "Değerlendirme bağlantısı",
  },
  {
    value: "contact",
    label: "Kişi bağlantısı",
    placeholder: "https://example.com/kisi.vcf",
  },
];

export function normalizeSlug(value: string) {
  return value
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-/, "");
}
export function validSlug(slug: string) {
  return (
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) &&
    slug.length <= 80 &&
    !["add", "api", "arkaoda", "_next"].includes(slug)
  );
}
export function normalizeLink(type: LinkType, input: string): string {
  let value = input.trim();
  if (!value) return "";
  if (type === "phone" || type === "whatsapp") {
    if (type === "whatsapp" && /^https:\/\/wa\.me\/\d+(?:\?.*)?$/.test(value))
      return value;
    value = value.replace(/^tel:/i, "").replace(/[\s().-]/g, "");
    if (!/^\+?\d{7,15}$/.test(value)) return "";
    return type === "phone"
      ? `tel:${value}`
      : `https://wa.me/${value.replace(/^\+/, "")}`;
  }
  if (type === "email") {
    value = value.replace(/^mailto:/i, "");
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? `mailto:${value}` : "";
  }
  if (
    type === "instagram" &&
    /^@?[\w.]+$/.test(value) &&
    !value.includes("instagram.com")
  )
    value = `https://www.instagram.com/${value.replace(/^@/, "")}`;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(value)) value = `https://${value}`;
  try {
    const url = new URL(value);
    if (
      !["https:", "http:"].includes(url.protocol) ||
      !url.hostname.includes(".") ||
      url.username ||
      url.password
    )
      return "";
    return url.href;
  } catch {
    return "";
  }
}
export function visibleLinks(links: BusinessLink[]) {
  return links.filter((link) => link.visible !== false);
}

export function contrastRatio(a: string, b: string) {
  const luminance = (hex: string) => {
    const c = hex
      .replace("#", "")
      .match(/.{2}/g)
      ?.map((v) => parseInt(v, 16) / 255) || [0, 0, 0];
    const [r, g, blue] = c.map((v) =>
      v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
    );
    return 0.2126 * r + 0.7152 * g + 0.0722 * blue;
  };
  const l1 = luminance(a),
    l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
export function readableText(background: string) {
  return contrastRatio(background, "#ffffff") >=
    contrastRatio(background, "#000000")
    ? "#ffffff"
    : "#000000";
}
