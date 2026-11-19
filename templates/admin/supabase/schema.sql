-- ════════════════════════════════════════════════════════════════════════════
--  Admin + web şeması (Supabase / PostgreSQL)
--  Supabase → SQL Editor'de bir kez çalıştırın; tekrar çalıştırmak güvenlidir (IF NOT EXISTS).
--
--  İçerik tabloları (posts, pages) admin modeline karşılık gelir: src/lib/models/site.ts.
--  Tip ID = tablo adı, alan ID = sütun adı. Yeni bir içerik tipi için aynı kalıpla tablo ekleyin
--  (status/version/published_at sütunları ve aşağıdaki trigger'lar) ve modeli güncelleyin.
--
--  Erişim:
--    anon (web sitesi)  yalnız status = 'published' içerikleri okur
--    service role       admin paneli ve web'in iletişim formu (RLS'yi atlar)
-- ════════════════════════════════════════════════════════════════════════════

do $$ begin
  create type content_status as enum ('draft', 'published');
exception when duplicate_object then null; end $$;

-- updated_at ve version her güncellemede; published_at ilk yayında atanır, sonra korunur.
create or replace function public.touch_row() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  new.version := coalesce(old.version, 0) + 1;
  return new;
end $$;

create or replace function public.stamp_published() returns trigger language plpgsql as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end $$;

-- ─── posts ──────────────────────────────────────────────────────────────────
create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  excerpt       text,
  body          text,
  cover_image   text,            -- Cloudinary adresi
  published_on  date,
  status        content_status not null default 'draft',
  published_at  timestamptz,
  version       integer not null default 1,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── pages ──────────────────────────────────────────────────────────────────
create table if not exists public.pages (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  body          text,
  "order"       integer,
  status        content_status not null default 'draft',
  published_at  timestamptz,
  version       integer not null default 1,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── leads (iletişim formu talepleri) ───────────────────────────────────────
create table if not exists public.leads (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  company              text,
  email                text not null,
  phone                text,
  subject              text,
  message              text not null,
  locale               text,
  consent              boolean not null default false,
  submitted_at         timestamptz not null default now(),
  status               text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  notification_status  text check (notification_status in ('pending', 'sent', 'failed', 'skipped')),
  internal_note        text,
  version              integer not null default 1,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ─── site_settings (tek satır, id = 'site') ─────────────────────────────────
create table if not exists public.site_settings (
  id                   text primary key default 'site' check (id = 'site'),
  lead_retention_days  integer check (lead_retention_days between 1 and 3650),
  version              integer not null default 1,
  updated_at           timestamptz not null default now()
);

-- ─── Trigger'lar ve indeksler ───────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['posts', 'pages', 'leads', 'site_settings'] loop
    execute format('drop trigger if exists %I_touch on public.%I', t, t);
    execute format('create trigger %I_touch before update on public.%I for each row execute function public.touch_row()', t, t);
  end loop;
  foreach t in array array['posts', 'pages'] loop
    execute format('drop trigger if exists %I_published on public.%I', t, t);
    execute format('create trigger %I_published before insert or update on public.%I for each row execute function public.stamp_published()', t, t);
    execute format('create index if not exists %I_status_idx on public.%I (status, updated_at desc)', t, t);
  end loop;
end $$;

create index if not exists leads_submitted_idx on public.leads (submitted_at desc);
create index if not exists leads_status_idx on public.leads (status);

-- ─── Row Level Security ─────────────────────────────────────────────────────
alter table public.posts enable row level security;
alter table public.pages enable row level security;
alter table public.leads enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "Published posts are public" on public.posts;
create policy "Published posts are public" on public.posts for select using (status = 'published');
drop policy if exists "Published pages are public" on public.pages;
create policy "Published pages are public" on public.pages for select using (status = 'published');
-- leads ve site_settings için politika yok: yalnız service role erişir.
