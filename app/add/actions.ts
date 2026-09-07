"use server";

import fs from 'fs';
import path from 'path';
import { BusinessProfile } from '../../data/businesses';

export async function addBusiness(formData: FormData) {
  const slug = formData.get('slug') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  
  const primary = formData.get('primary') as string;
  const background = formData.get('background') as string;
  const text = formData.get('text') as string;
  
  const linksString = formData.get('links') as string;
  const links = linksString ? JSON.parse(linksString) : [];

  const logoFile = formData.get('logo') as File | null;
  let logoUrl = '';

  if (logoFile && logoFile.size > 0) {
    const arrayBuffer = await logoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const ext = path.extname(logoFile.name) || '.png';
    const fileName = `${slug}-logo${ext}`;
    
    const publicLogosDir = path.join(process.cwd(), 'public', 'logos');
    if (!fs.existsSync(publicLogosDir)) {
      fs.mkdirSync(publicLogosDir, { recursive: true });
    }
    
    const filePath = path.join(publicLogosDir, fileName);
    fs.writeFileSync(filePath, buffer);
    
    logoUrl = `/logos/${fileName}`;
  } else {
    logoUrl = "https://placehold.co/400x400?text=Logo";
  }

  const profile: BusinessProfile = {
    name,
    description,
    logo: logoUrl,
    theme: { primary, background, text },
    links
  };

  const businessesPath = path.join(process.cwd(), 'data', 'businesses.ts');
  let content = fs.readFileSync(businessesPath, 'utf8');

  const lastBracketIndex = content.lastIndexOf('};');
  if (lastBracketIndex === -1) {
    throw new Error('Dosya yapısı bozuk.');
  }

  const newBusinessString = `\n  "${slug}": ${JSON.stringify(profile, null, 4).replace(/\n/g, '\n  ')},`;

  const newContent = content.slice(0, lastBracketIndex) + newBusinessString + '\n' + content.slice(lastBracketIndex);

  fs.writeFileSync(businessesPath, newContent, 'utf8');
}
