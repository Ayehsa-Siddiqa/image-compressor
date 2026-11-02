-- Squishly admin dashboard schema. Run once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- The app talks to these tables only from the server with the service-role key, so row level security is
-- enabled with no policies: the public (anon) key can't read or write anything here.

create extension if not exists pgcrypto;

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  -- scrypt$N$r$p$salt$hash, written by src/lib/admin/password.ts and scripts/create-admin.mjs
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists admin_sessions (
  -- SHA-256 of the cookie token; the token itself is never stored.
  id text primary key,
  admin_id uuid not null references admin_users (id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists admin_sessions_admin_id on admin_sessions (admin_id);

create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  status text not null default 'draft' check (status in ('draft', 'published')),
  title text not null,
  card_title text not null,
  description text not null,
  published_at date not null default current_date,
  -- { "src": "...", "width": 1200, "height": 800 }
  card_image jsonb not null,
  card_image_alt text not null default '',
  hero_image jsonb not null,
  hero_image_alt text not null,
  -- ArticleBlock[] (see src/content/blogs.ts)
  body jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table admin_users enable row level security;
alter table admin_sessions enable row level security;
alter table blog_posts enable row level security;

-- Public bucket for blog images (anyone can view; only the server can upload).
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;
