import { notFound } from "next/navigation";
import { getBusinessBySlug } from "../../../lib/businesses";
import { ProfileEditor } from "../../../components/ProfileEditor";

export const dynamic = "force-dynamic";

export default async function EditBusinessPage({
  params,
}: {
  params: { slug: string };
}) {
  const profile = await getBusinessBySlug(params.slug);
  if (!profile) notFound();
  return <ProfileEditor initialProfile={profile} />;
}
