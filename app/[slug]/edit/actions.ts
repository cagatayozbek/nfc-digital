"use server";

import { updateBusiness } from "../../../lib/businesses";
import { readProfileForm } from "../../../lib/profile-form";
import { revalidatePath } from "next/cache";

export async function editBusiness(slug: string, formData: FormData) {
  const { profile, logoFile, coverFile } = readProfileForm(formData);
  await updateBusiness(slug, profile, logoFile, coverFile);
  revalidatePath(`/${slug}`);
  revalidatePath("/arkaoda");
  return { slug };
}
