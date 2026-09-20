-- Conteúdo compartilhado do Fútbol Pro
-- O login continua local; esta migration permite que a biblioteca seja compartilhada entre dispositivos.

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  orden integer not null default 0,
  icono text not null default '⚽'
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  categoria_id uuid not null references public.categories(id) on delete cascade,
  video_url text not null,
  proveedor text not null default 'youtube',
  video_id text not null,
  thumbnail_url text,
  duracion text,
  fecha_creacion timestamptz not null default now()
);

insert into public.categories (id, nombre, slug, orden, icono)
values
  ('11111111-1111-1111-1111-111111111111', 'Porteros', 'porteros', 1, '🧤'),
  ('22222222-2222-2222-2222-222222222222', 'Laterales', 'laterales', 2, '🏃'),
  ('33333333-3333-3333-3333-333333333333', 'Defensas centrales', 'defensas-centrales', 3, '🛡️'),
  ('44444444-4444-4444-4444-444444444444', 'Delanteros', 'delanteros', 4, '🎯'),
  ('55555555-5555-5555-5555-555555555555', 'Técnica individual', 'tecnica-individual', 5, '⚽'),
  ('66666666-6666-6666-6666-666666666666', 'Acondicionamiento físico', 'acondicionamiento-fisico', 6, '💪'),
  ('77777777-7777-7777-7777-777777777777', 'Fútbol femenino', 'futbol-femenino', 7, '🌟'),
  ('88888888-8888-8888-8888-888888888888', 'Fútbol infantil', 'futbol-infantil', 8, '👟')
on conflict (slug) do update set
  nombre = excluded.nombre,
  orden = excluded.orden,
  icono = excluded.icono;

alter table public.categories enable row level security;
alter table public.videos enable row level security;

drop policy if exists "public can read categories" on public.categories;
create policy "public can read categories"
  on public.categories for select
  to anon, authenticated
  using (true);

drop policy if exists "public can manage categories" on public.categories;
create policy "public can manage categories"
  on public.categories for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "public can read videos" on public.videos;
create policy "public can read videos"
  on public.videos for select
  to anon, authenticated
  using (true);

drop policy if exists "public can manage videos" on public.videos;
create policy "public can manage videos"
  on public.videos for all
  to anon, authenticated
  using (true)
  with check (true);
