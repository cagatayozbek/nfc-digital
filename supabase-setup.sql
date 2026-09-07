-- ================================================================
-- NFC Digital — Supabase Kurulum SQL
-- Supabase Dashboard > SQL Editor'e yapıştır ve çalıştır
-- Proje: https://mhvoepnksnmuvvdxxirk.supabase.co
-- ================================================================

-- 1. Tablo oluştur
create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null default '',
  logo_url text not null default '',
  primary_color text not null default '#000000',
  background_color text not null default '#ffffff',
  text_color text not null default '#000000',
  links jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

-- 2. Row Level Security
alter table businesses enable row level security;

create policy "Public read"
  on businesses for select using (true);

create policy "Public insert"
  on businesses for insert with check (true);

create policy "Public update"
  on businesses for update using (true);

create policy "Public delete"
  on businesses for delete using (true);

-- 3. Seed — Mevcut veriler
insert into businesses (slug, name, description, logo_url, primary_color, background_color, text_color, links)
values
  (
    'demo',
    'Demo İşletme',
    'Bu bir demo profildir. Müşterilerinize NFC kartınızın nasıl çalışacağını göstermek için kullanabilirsiniz.',
    'https://placehold.co/400x400?text=Logo',
    '#3b82f6', '#f3f4f6', '#1f2937',
    '[
      {"type":"phone","label":"Hemen Ara","url":"tel:+905555555555"},
      {"type":"whatsapp","label":"WhatsApp","url":"https://wa.me/905555555555"},
      {"type":"instagram","label":"Instagram","url":"https://instagram.com"},
      {"type":"maps","label":"Yol Tarifi","url":"https://maps.google.com"},
      {"type":"google_review","label":"Bizi Değerlendirin","url":"https://google.com"},
      {"type":"website","label":"Web Sitesi","url":"https://example.com"}
    ]'::jsonb
  ),
  (
    'baskent-ozpen',
    'Başkent Özpen',
    'PVC Pencere ve Kapı Sistemleri',
    'https://placehold.co/400x400?text=Özpen',
    '#dc2626', '#ffffff', '#000000',
    '[
      {"type":"phone","label":"Bizi Arayın","url":"tel:+905320000000"},
      {"type":"whatsapp","label":"WhatsApp","url":"https://wa.me/905320000000"},
      {"type":"instagram","label":"Instagram","url":"https://instagram.com"},
      {"type":"maps","label":"Yol Tarifi","url":"https://maps.google.com"}
    ]'::jsonb
  ),
  (
    'iot',
    'IOT Yazılım AŞ',
    'iot yazılım aş',
    'https://placehold.co/400x400?text=IOT',
    '#000000', '#ffffff', '#000000',
    '[
      {"type":"website","label":"Web Sitesi","url":"https://example.com"},
      {"type":"instagram","label":"Instagram","url":"https://instagram.com"}
    ]'::jsonb
  )
on conflict (slug) do nothing;

-- ================================================================
-- STORAGE BUCKET (Dashboard > Storage > New Bucket ile de yapılır)
-- Name: logos  |  Public: true (toggle açık)
-- STORAGE BUCKET & POLİCY
-- ================================================================
-- insert into storage.buckets (id, name, public)
-- values ('logos', 'logos', true) on conflict do nothing;

-- Bucket oluştur (Dashboard > Storage > New Bucket ile de yapılabilir)
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

-- Storage RLS policy: herkese okuma (public bucket zaten okumaya açık)
create policy "Logos public read"
  on storage.objects for select
  using ( bucket_id = 'logos' );

-- Storage RLS policy: herkese yükleme/güncelleme izni
create policy "Logos public upload"
  on storage.objects for insert
  with check ( bucket_id = 'logos' );

create policy "Logos public update"
  on storage.objects for update
  using ( bucket_id = 'logos' );

create policy "Logos public delete"
  on storage.objects for delete
  using ( bucket_id = 'logos' );

-- ================================================================
-- CLICK EVENTS — Tıklanma Takibi
-- Supabase Dashboard > SQL Editor'e yapıştır ve çalıştır
-- ================================================================

create table if not exists click_events (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null,
  link_type  text not null,
  link_label text,
  clicked_at timestamptz default now()
);

alter table click_events enable row level security;

-- Herkese insert (profil ziyaretçileri tıklayabilir)
create policy "Click events public insert"
  on click_events for insert with check (true);

-- Herkese select (admin analytics için)
create policy "Click events public select"
  on click_events for select using (true);
