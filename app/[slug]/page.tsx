import { notFound } from "next/navigation";
import { businesses } from "../../data/businesses";
import { BusinessProfile } from "../../components/BusinessProfile";
import { Metadata } from "next";

type Props = {
  params: { slug: string };
};

export function generateMetadata({ params }: Props): Metadata {
  const profile = businesses[params.slug];

  if (!profile) {
    return {
      title: "Profil Bulunamadı",
    };
  }

  return {
    title: `${profile.name} | NFC Digital`,
    description: profile.description,
  };
}

export default function ProfilePage({ params }: Props) {
  const profile = businesses[params.slug];

  if (!profile) {
    notFound();
  }

  return <BusinessProfile profile={profile} />;
}
