import { BusinessLink, ProfileDesign } from "../data/businesses";
import { DEFAULT_DESIGN, LINK_TYPES, normalizeLink } from "./profile-design";

export function readProfileForm(form: FormData) {
  const name = String(form.get("name") || "").trim();
  const description = String(form.get("description") || "").trim();
  if (!name || name.length > 120)
    throw new Error("Profil adı 1–120 karakter olmalı.");
  if (description.length > 2000)
    throw new Error("Açıklama en fazla 2000 karakter olabilir.");
  const color = (key: string) => {
    const value = String(form.get(key) || "");
    if (!/^#[0-9a-f]{6}$/i.test(value))
      throw new Error("Geçerli bir tema rengi seçin.");
    return value;
  };
  let rawLinks: unknown, rawDesign: unknown;
  try {
    rawLinks = JSON.parse(String(form.get("links") || "[]"));
    rawDesign = JSON.parse(String(form.get("design") || "{}"));
  } catch {
    throw new Error("Profil ayarları okunamadı.");
  }
  if (!Array.isArray(rawLinks) || rawLinks.length > 50)
    throw new Error("En fazla 50 bağlantı ekleyebilirsiniz.");
  const links: BusinessLink[] = rawLinks.map((link, i) => {
    if (!link || !LINK_TYPES.some((t) => t.value === link.type))
      throw new Error("Geçersiz bağlantı türü.");
    const label = typeof link.label === "string" ? link.label.trim() : "";
    const url =
      typeof link.url === "string" ? normalizeLink(link.type, link.url) : "";
    if (!label || label.length > 100 || !url)
      throw new Error(
        `${i + 1}. bağlantının başlığını ve adresini kontrol edin.`,
      );
    return {
      id: typeof link.id === "string" ? link.id.slice(0, 100) : undefined,
      type: link.type,
      label,
      url,
      visible: link.visible !== false,
      featured: link.featured === true,
    };
  });
  if (!rawDesign || typeof rawDesign !== "object" || Array.isArray(rawDesign))
    throw new Error("Geçersiz görünüm ayarları.");
  const raw = rawDesign as Record<string, unknown>;
  const design: ProfileDesign = { ...DEFAULT_DESIGN };
  const options = {
    template: ["personal", "artist", "business"],
    photo_shape: ["square", "rounded", "circle"],
    photo_fit: ["contain", "cover"],
    font: ["sans", "serif", "mono"],
    button_shape: ["square", "rounded", "pill"],
    button_style: ["outline", "solid"],
    spacing: ["compact", "comfortable", "spacious"],
    alignment: ["center", "left"],
  };
  for (const [key, allowed] of Object.entries(options)) {
    if (raw[key] !== undefined) {
      if (!allowed.includes(raw[key] as string))
        throw new Error("Geçersiz görünüm seçeneği.");
      Object.assign(design, { [key]: raw[key] });
    }
  }
  for (const [key, min, max] of [
    ["photo_size", 72, 200],
    ["photo_x", 0, 100],
    ["photo_y", 0, 100],
    ["photo_zoom", 1, 3],
  ] as const) {
    const value = raw[key] ?? design[key];
    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < min ||
      value > max
    )
      throw new Error("Görsel ölçüleri geçersiz.");
    design[key] = value;
  }
  design.show_contact = raw.show_contact !== false;
  design.contact_label =
    typeof raw.contact_label === "string"
      ? raw.contact_label.trim().slice(0, 60) || DEFAULT_DESIGN.contact_label
      : DEFAULT_DESIGN.contact_label;
  if (typeof raw.cover_url === "string" && raw.cover_url) {
    if (!/^https?:\/\//.test(raw.cover_url))
      throw new Error("Kapak görselini yeniden yükleyin.");
    design.cover_url = raw.cover_url;
  }
  return {
    profile: {
      name,
      description,
      primary_color: color("primary"),
      background_color: color("background"),
      text_color: color("text"),
      links,
      design,
    },
    logoFile: readProfileImage(form, "logo"),
    coverFile: readProfileImage(form, "cover"),
  };
}

export function readProfileImage(form: FormData, key: string) {
  const file = form.get(key);
  if (!(file instanceof File) || !file.size) return null;
  if (
    !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
      file.type,
    ) ||
    file.size > 5 * 1024 * 1024
  )
    throw new Error(
      "Görseller JPG, PNG, WebP veya GIF ve en fazla 5 MB olmalı.",
    );
  return file;
}
