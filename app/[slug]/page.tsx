import { notFound } from "next/navigation";
import { getBusinessBySlug, getBusinesses } from "../../lib/businesses";
import { BusinessProfile } from "../../components/BusinessProfile";
import { Metadata } from "next";

type Props = {
  params: { slug: string };
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getBusinessBySlug(params.slug);

  if (!profile) {
    return { title: "Profil Bulunamadı" };
  }

  return {
    title: `${profile.name} | NFC Digital`,
    description: profile.description,
    openGraph: {
      title: `${profile.name} | NFC Digital`,
      description: profile.description,
      images: profile.logo_url ? [{ url: profile.logo_url }] : [],
      type: "profile",
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const profile = await getBusinessBySlug(params.slug);

  if (!profile) {
    notFound();
  }

  return <BusinessProfile profile={profile} />;
}
