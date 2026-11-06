"use server";

import { updateBusiness, getBusinessBySlug } from "../../../lib/businesses";
import { BusinessLink } from "../../../data/businesses";
import { readProfileImage } from "../../../lib/profile-form";
import { readPhotoForm } from "../../../lib/profile-photo";
import { redirect } from "next/navigation";

export async function editBusiness(slug: string, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const primary_color = formData.get("primary") as string;
  const background_color = formData.get("background") as string;
  const text_color = formData.get("text") as string;
  const linksString = formData.get("links") as string;
  const links: BusinessLink[] = linksString ? JSON.parse(linksString) : [];
  const logoFile = readProfileImage(formData, "logo");
  const coverFile = readProfileImage(formData, "cover");
  const footerFile = readProfileImage(formData, "footer");

  const photo = readPhotoForm(formData);
  const existing = await getBusinessBySlug(slug);
  if (!existing) throw new Error("Profil bulunamadı.");
  const design = { ...existing.design, ...photo };
  if (formData.has("show_contact"))
    design.show_contact = formData.get("show_contact") !== "false";
  if (formData.get("removeCover") === "true") design.cover_url = "";
  if (formData.get("removeFooter") === "true") design.footer_image_url = "";
  await updateBusiness(
    slug,
    {
      name,
      description,
      primary_color,
      background_color,
      text_color,
      links,
      design,
    },
    logoFile,
    coverFile,
    footerFile,
  );

  redirect(`/${slug}`);
}
