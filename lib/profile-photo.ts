import { ProfileDesign } from "../data/businesses";
import { DEFAULT_DESIGN } from "./profile-design";

export type PhotoDesign = Pick<
  ProfileDesign,
  | "photo_size"
  | "photo_shape"
  | "photo_fit"
  | "photo_x"
  | "photo_y"
  | "photo_zoom"
>;
export const DEFAULT_PHOTO: PhotoDesign = {
  photo_size: DEFAULT_DESIGN.photo_size,
  photo_shape: DEFAULT_DESIGN.photo_shape,
  photo_fit: DEFAULT_DESIGN.photo_fit,
  photo_x: 50,
  photo_y: 50,
  photo_zoom: 1,
};

export function readPhotoForm(form: FormData): PhotoDesign | undefined {
  if (!form.has("photo")) return undefined;
  const raw = JSON.parse(String(form.get("photo")));
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new Error("Geçersiz fotoğraf ayarları.");
  const photo = { ...DEFAULT_PHOTO };
  for (const [key, min, max] of [
    ["photo_size", 72, 200],
    ["photo_x", 0, 100],
    ["photo_y", 0, 100],
    ["photo_zoom", 1, 3],
  ] as const) {
    const value = raw[key] ?? photo[key];
    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < min ||
      value > max
    )
      throw new Error("Geçersiz fotoğraf ölçüleri.");
    photo[key] = value;
  }
  if (
    !["square", "rounded", "circle"].includes(raw.photo_shape) ||
    !["contain", "cover"].includes(raw.photo_fit)
  )
    throw new Error("Geçersiz fotoğraf görünümü.");
  photo.photo_shape = raw.photo_shape;
  photo.photo_fit = raw.photo_fit;
  return photo;
}
