"use server";

import { updateBusiness } from '../../../lib/businesses';
import { BusinessLink } from '../../../data/businesses';
import { redirect } from 'next/navigation';

export async function editBusiness(slug: string, formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const primary_color = formData.get('primary') as string;
  const background_color = formData.get('background') as string;
  const text_color = formData.get('text') as string;
  const linksString = formData.get('links') as string;
  const links: BusinessLink[] = linksString ? JSON.parse(linksString) : [];
  const logoFile = formData.get('logo') as File | null;

  await updateBusiness(
    slug,
    { name, description, primary_color, background_color, text_color, links },
    logoFile
  );

  redirect(`/${slug}`);
}
