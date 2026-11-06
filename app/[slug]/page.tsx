import { notFound } from "next/navigation";
import { getBusinessBySlug } from "../../lib/businesses";
import { BusinessProfile } from "../../components/BusinessProfile";
import { Metadata, Viewport } from "next";

type Props = {
  params: { slug: string };
};

export const dynamic = 'force-dynamic';

export async function generateViewport({ params }: Props): Promise<Viewport> {
  const profile = await getBusinessBySlug(params.slug);
  return {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    themeColor: profile?.background_color || "#ffffff",
  };
}

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

  const background = /^#[0-9a-f]{6}$/i.test(profile.background_color)
    ? profile.background_color
    : "#ffffff";

  return (
    <>
      <style>{`
        html:has([data-public-profile="true"]),
        body:has([data-public-profile="true"]) {
          background-color: ${background};
        }
      `}</style>
      <BusinessProfile profile={profile} />
    </>
  );
}
