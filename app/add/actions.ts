"use server";

import { addBusiness as dbAddBusiness, slugExists } from "../../lib/businesses";
import { BusinessLink } from "../../data/businesses";
import { readProfileImage } from "../../lib/profile-form";
import { readPhotoForm } from "../../lib/profile-photo";
import { redirect } from "next/navigation";

export async function addBusiness(formData: FormData) {
  const slug = (formData.get("slug") as string).trim().toLowerCase();
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

  // Slug benzersizlik kontrolü
  if (await slugExists(slug)) {
    throw new Error(`"${slug}" slug zaten kullanımda. Farklı bir slug seçin.`);
  }

  await dbAddBusiness(
    {
      slug,
      name,
      description,
      logo_url: "", // uploadLogo içinde dolacak
      primary_color,
      background_color,
      text_color,
      links,
      design: {
        ...readPhotoForm(formData),
        show_contact: formData.get("show_contact") !== "false",
      },
    },
    logoFile,
    coverFile,
    footerFile,
  );

  redirect(`/${slug}`);
}
