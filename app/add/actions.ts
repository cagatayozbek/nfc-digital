"use server";

import { addBusiness as dbAddBusiness, slugExists } from "../../lib/businesses";
import { readProfileForm } from "../../lib/profile-form";
import { validSlug } from "../../lib/profile-design";
import { revalidatePath } from "next/cache";

export async function checkSlug(slug: string) {
  if (!validSlug(slug))
    return {
      available: false,
      message:
        "Küçük harf, rakam ve arada tire kullanın. Bu adres uygun olmayabilir.",
    };
  try {
    const exists = await slugExists(slug);
    return {
      available: !exists,
      message: exists ? "Bu adres kullanımda." : "Bu adres kullanılabilir.",
    };
  } catch {
    return {
      available: false,
      message: "Adres kontrol edilemedi. Yeniden deneyin.",
    };
  }
}

export async function addBusiness(formData: FormData) {
  const slug = String(formData.get("slug") || "")
    .trim()
    .toLowerCase();
  if (!validSlug(slug))
    throw new Error("Geçerli ve ayrılmış olmayan bir profil adresi girin.");
  const { profile, logoFile, coverFile } = readProfileForm(formData);
  if (await slugExists(slug))
    throw new Error("Bu adres kullanımda. Farklı bir adres seçin.");
  await dbAddBusiness({ ...profile, slug, logo_url: "" }, logoFile, coverFile);
  revalidatePath("/arkaoda");
  return { slug };
}
