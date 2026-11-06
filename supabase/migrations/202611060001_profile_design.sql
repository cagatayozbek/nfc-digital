-- Existing profiles keep their appearance through application defaults.
alter table public.businesses add column if not exists design jsonb not null default '{}'::jsonb;
