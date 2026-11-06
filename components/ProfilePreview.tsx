"use client";

import { BusinessProfile as ProfileType } from "../data/businesses";
import { BusinessProfile } from "./BusinessProfile";

type ProfilePreviewProps = Omit<ProfileType, "slug"> & { slug?: string };

export function ProfilePreview(props: ProfilePreviewProps) {
  return (
    <BusinessProfile profile={{ ...props, slug: props.slug || "" }} preview />
  );
}
