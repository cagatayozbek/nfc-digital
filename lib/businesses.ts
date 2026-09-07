import { cookies } from 'next/headers';
import { createClient } from '../utils/supabase/server';
import { BusinessProfile, BusinessLink } from '../data/businesses';

// Server-side Supabase client (server components & server actions)
async function getSupabase() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

// ─── READ ─────────────────────────────────────────────────────────────────

export async function getBusinesses(): Promise<BusinessProfile[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as BusinessProfile[];
}

export async function getBusinessBySlug(slug: string): Promise<BusinessProfile | null> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    throw new Error(error.message);
  }
  return data as BusinessProfile;
}

// ─── CREATE ───────────────────────────────────────────────────────────────

export async function addBusiness(
  profile: Omit<BusinessProfile, 'id' | 'created_at'>,
  logoFile?: File | null
): Promise<BusinessProfile> {
  const supabase = await getSupabase();
  let logo_url = profile.logo_url;

  if (logoFile && logoFile.size > 0) {
    logo_url = await uploadLogo(supabase, profile.slug, logoFile);
  }

  if (!logo_url) {
    logo_url = 'https://placehold.co/400x400?text=Logo';
  }

  const { data, error } = await supabase
    .from('businesses')
    .insert({ ...profile, logo_url })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as BusinessProfile;
}

// ─── UPDATE ───────────────────────────────────────────────────────────────

export async function updateBusiness(
  slug: string,
  updates: Partial<Omit<BusinessProfile, 'id' | 'slug' | 'created_at'>>,
  logoFile?: File | null
): Promise<BusinessProfile> {
  const supabase = await getSupabase();
  let logo_url = updates.logo_url;

  if (logoFile && logoFile.size > 0) {
    logo_url = await uploadLogo(supabase, slug, logoFile);
  }

  const { data, error } = await supabase
    .from('businesses')
    .update({ ...updates, ...(logo_url ? { logo_url } : {}) })
    .eq('slug', slug)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as BusinessProfile;
}

// ─── DELETE ───────────────────────────────────────────────────────────────

export async function deleteBusiness(slug: string): Promise<void> {
  const supabase = await getSupabase();
  const { error } = await supabase.from('businesses').delete().eq('slug', slug);
  if (error) throw new Error(error.message);
}

// ─── SLUG CHECK ───────────────────────────────────────────────────────────

export async function slugExists(slug: string): Promise<boolean> {
  const supabase = await getSupabase();
  const { count, error } = await supabase
    .from('businesses')
    .select('id', { count: 'exact', head: true })
    .eq('slug', slug);

  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}

// ─── LOGO UPLOAD ──────────────────────────────────────────────────────────

async function uploadLogo(supabase: Awaited<ReturnType<typeof createClient>>, slug: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'png';
  const fileName = `${slug}-logo.${ext}`;

  const { error } = await supabase.storage
    .from('logos')
    .upload(fileName, file, { upsert: true });

  if (error) throw new Error('Logo yüklenemedi: ' + error.message);

  const { data } = supabase.storage.from('logos').getPublicUrl(fileName);
  return data.publicUrl;
}
