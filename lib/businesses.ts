import { cookies } from "next/headers";
import { createClient } from "../utils/supabase/server";
import { BusinessProfile } from "../data/businesses";

// Server-side Supabase client (server components & server actions)
async function getSupabase() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

// ─── READ ─────────────────────────────────────────────────────────────────

export async function getBusinesses(): Promise<BusinessProfile[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as BusinessProfile[];
}

export async function getBusinessBySlug(
  slug: string,
): Promise<BusinessProfile | null> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw new Error(error.message);
  }
  return data as BusinessProfile;
}

// ─── CREATE ───────────────────────────────────────────────────────────────

export async function addBusiness(
  profile: Omit<BusinessProfile, "id" | "created_at">,
  logoFile?: File | null,
  coverFile?: File | null,
): Promise<BusinessProfile> {
  const supabase = await getSupabase();
  let logo_url = profile.logo_url;

  if (logoFile && logoFile.size > 0) {
    logo_url = await uploadLogo(supabase, profile.slug, logoFile);
  }

  const design = { ...profile.design };
  if (coverFile && coverFile.size > 0)
    design.cover_url = await uploadImage(
      supabase,
      profile.slug,
      coverFile,
      "cover",
    );

  const { data, error } = await supabase
    .from("businesses")
    .insert({ ...profile, logo_url, design })
    .select()
    .single();

  if (error) throw profileWriteError(error);
  return data as BusinessProfile;
}

// ─── UPDATE ───────────────────────────────────────────────────────────────

export async function updateBusiness(
  slug: string,
  updates: Partial<Omit<BusinessProfile, "id" | "slug" | "created_at">>,
  logoFile?: File | null,
  coverFile?: File | null,
): Promise<BusinessProfile> {
  const supabase = await getSupabase();
  let logo_url = updates.logo_url;

  if (logoFile && logoFile.size > 0) {
    logo_url = await uploadLogo(supabase, slug, logoFile);
  }

  const design = { ...updates.design };
  if (coverFile && coverFile.size > 0)
    design.cover_url = await uploadImage(supabase, slug, coverFile, "cover");

  const { data, error } = await supabase
    .from("businesses")
    .update({
      ...updates,
      ...(updates.design || coverFile ? { design } : {}),
      ...(logo_url ? { logo_url } : {}),
    })
    .eq("slug", slug)
    .select()
    .single();

  if (error) throw profileWriteError(error);
  return data as BusinessProfile;
}

// ─── DELETE ───────────────────────────────────────────────────────────────

export async function deleteBusiness(slug: string): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase.from("businesses").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
}

// ─── SLUG CHECK ───────────────────────────────────────────────────────────

export async function slugExists(slug: string): Promise<boolean> {
  const supabase = await getSupabase();
  const { count, error } = await supabase
    .from("businesses")
    .select("id", { count: "exact", head: true })
    .eq("slug", slug);

  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}

// ─── LOGO UPLOAD ──────────────────────────────────────────────────────────

function profileWriteError(error: { code?: string; message: string }) {
  if (
    ["PGRST204", "42703"].includes(error.code || "") &&
    error.message.includes("design")
  )
    return new Error(
      "Görünüm ayarları henüz etkinleştirilmemiş. Profil kaydedilemedi; yöneticiyle iletişime geçin.",
    );
  if (error.code === "23505")
    return new Error("Bu profil adresi kullanımda. Farklı bir adres seçin.");
  return new Error(error.message);
}

async function uploadLogo(
  supabase: Awaited<ReturnType<typeof getSupabase>>,
  slug: string,
  file: File,
) {
  return uploadImage(supabase, slug, file, "logo");
}

async function uploadImage(
  supabase: Awaited<ReturnType<typeof getSupabase>>,
  slug: string,
  file: File,
  kind: string,
): Promise<string> {
  const extension = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  }[file.type];
  if (!extension || file.size > 5 * 1024 * 1024)
    throw new Error(
      "Geçersiz görsel. En fazla 5 MB JPG, PNG, WebP veya GIF yükleyin.",
    );
  const fileName = `${slug}-${kind}-${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from("logos")
    .upload(fileName, file, { contentType: file.type });
  if (error) throw new Error("Görsel yüklenemedi: " + error.message);
  return supabase.storage.from("logos").getPublicUrl(fileName).data.publicUrl;
}
