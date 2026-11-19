-- ============================================================
-- VAYU STUDIO — Supabase schema
-- Run this in Supabase Dashboard → SQL Editor → New query
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin', 'owner')),
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Auto-profile for BOTH email signups and Discord OAuth users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display_name text;
begin
  display_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',          -- Discord
    new.raw_user_meta_data ->> 'user_name',     -- Discord username
    split_part(new.email, '@', 1),
    'Member'
  );

  insert into public.profiles (id, email, full_name, role, avatar_url)
  values (
    new.id,
    new.email,
    display_name,
    case when lower(coalesce(new.email, '')) = lower('admin@vayuplayz.com')
         then 'owner' else 'user' end,
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- site content (admin editable JSON) ----------
create table if not exists public.site_content (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

-- ---------- site settings (editable in Admin → Site content) ----------
-- These override the defaults in js/data.js. on conflict keeps admin edits.
insert into public.site_content (key, data)
values ('site_settings', '{
  "ADMIN_DISCORD_ID": "",
  "DEFAULT_ADMIN_EMAIL": "admin@vayuplayz.com",
  "YOUTUBE_CHANNEL_ID": "UCidFGGXE-tVCsYwnRBJ3_RQ",
  "DISCORD_WIDGET_ID": "1504530914128953464",
  "DISCORD_CHAT_CHANNEL_ID": "1504798937989513307",
  "SOCIAL": {
    "youtube": "https://youtube.com/@vayuplayzofficial",
    "instagram": "https://www.instagram.com/vayuplayzofficial",
    "discord": "https://discord.gg/eCmwsWw3Bg",
    "mc": "https://vayumc.fun"
  }
}'::jsonb)
on conflict (key) do nothing;

-- ---------- contact inbox ----------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamptz not null default now()
);

-- ---------- helpers ----------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'owner')
  );
$$;

create or replace function public.set_user_role(target uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  if new_role not in ('user', 'admin', 'owner') then
    raise exception 'Invalid role';
  end if;

  update public.profiles set role = new_role where id = target;
  if not found then
    raise exception 'User not found';
  end if;
end;
$$;

revoke all on function public.set_user_role(uuid, text) from public;
grant execute on function public.set_user_role(uuid, text) to authenticated;

-- ---------- Own profile editing (Account page) ----------
-- Users may only change their display name and avatar. `role` is untouched,
-- so this cannot be used to self-promote. RLS still blocks direct updates.
create or replace function public.update_own_profile(p_full_name text, p_avatar_url text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
     set full_name = case
                       when p_full_name is null or btrim(p_full_name) = '' then full_name
                       else btrim(p_full_name)
                     end,
         avatar_url = nullif(btrim(coalesce(p_avatar_url, '')), '')
   where id = auth.uid();
end;
$$;

revoke all on function public.update_own_profile(text, text) from public;
grant execute on function public.update_own_profile(text, text) to authenticated;

-- ---------- Admin access by Discord ID ----------
-- Set ADMIN_DISCORD_ID in Admin → Site content → site_settings (or in the
-- seed row above). It is sent by the client but verified against this user's
-- own Discord identity below.
-- On login the client calls this function. It checks the signed-in user's OWN
-- Discord identity, so nobody can claim admin using someone else's ID.
create or replace function public.claim_admin_by_discord(discord_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  matched boolean := false;
begin
  if discord_id is null or btrim(discord_id) = '' then
    return false;
  end if;

  select exists (
    select 1
    from auth.identities i
    where i.user_id = auth.uid()
      and i.provider = 'discord'
      and (i.provider_id = btrim(discord_id) or i.id::text = btrim(discord_id))
  ) into matched;

  if not matched then
    return false;
  end if;

  update public.profiles set role = 'owner' where id = auth.uid();
  return true;
end;
$$;

revoke all on function public.claim_admin_by_discord(text) from public;
grant execute on function public.claim_admin_by_discord(text) to authenticated;

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.site_content enable row level security;
alter table public.contact_messages enable row level security;

-- profiles: authenticated users can see each other (needed for admin user list)
drop policy if exists "profiles readable by authenticated" on public.profiles;
create policy "profiles readable by authenticated"
  on public.profiles for select to authenticated using (true);

-- only admins can change profile rows (role changes go through set_user_role RPC)
drop policy if exists "admin manages profiles" on public.profiles;
create policy "admin manages profiles"
  on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- site content: everyone can read, only admins can write
drop policy if exists "site content public read" on public.site_content;
create policy "site content public read"
  on public.site_content for select using (true);

drop policy if exists "admin writes site content" on public.site_content;
create policy "admin writes site content"
  on public.site_content for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- contact messages: anyone can insert, only admins can read/delete
drop policy if exists "messages public insert" on public.contact_messages;
create policy "messages public insert"
  on public.contact_messages for insert to anon, authenticated with check (true);

drop policy if exists "admin reads messages" on public.contact_messages;
create policy "admin reads messages"
  on public.contact_messages for select to authenticated using (public.is_admin());

drop policy if exists "admin deletes messages" on public.contact_messages;
create policy "admin deletes messages"
  on public.contact_messages for delete to authenticated using (public.is_admin());

-- ============================================================
-- Discord OAuth setup (Supabase Dashboard):
-- Authentication → Providers → Discord → Enable
--   Client ID / Secret: from https://discord.com/developers/applications
--   Redirect URL: https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
--   Scopes: identify email
-- Also add your site URL under Authentication → URL Configuration.
-- ============================================================
