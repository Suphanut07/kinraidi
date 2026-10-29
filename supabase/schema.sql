-- =========================================================
-- กินรัยดี (Kinraidi) — Supabase schema
-- วิธีใช้: Supabase > SQL Editor > New query > วางทั้งไฟล์ > Run (รันซ้ำได้)
-- =========================================================

-- ---------- PROFILES ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  bio text default '' check (char_length(bio) <= 80),
  mbti text default '' check (mbti = '' or mbti ~ '^[EI][SN][TF][JP]$'),
  avatar_url text default '',
  prefs jsonb not null default '{"food":[],"with":[],"budget":[],"vibe":[]}',
  notif jsonb not null default '{"push":true,"email":false,"news":true}',
  friend_code text unique,
  name_changed_at timestamptz,
  created_at timestamptz default now()
);

-- สร้างโปรไฟล์อัตโนมัติเมื่อมีคนสมัคร
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare code text;
begin
  loop
    code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (select 1 from public.profiles where friend_code = code);
  end loop;
  insert into public.profiles (id, email, display_name, friend_code)
  values (new.id, lower(new.email), split_part(new.email, '@', 1), code)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- FRIENDSHIPS (เก็บ 2 ทิศทาง: A→B และ B→A) ----------
create table if not exists public.friendships (
  user_id uuid references public.profiles(id) on delete cascade,
  friend_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);

-- เพิ่มเพื่อนแบบทันที (ทั้งสองฝั่ง)
create or replace function public.add_friend(target uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not logged in'; end if;
  if target = auth.uid() then raise exception 'เพิ่มตัวเองเป็นเพื่อนไม่ได้'; end if;
  insert into friendships (user_id, friend_id) values (auth.uid(), target), (target, auth.uid())
  on conflict do nothing;
end $$;

-- ---------- GROUPS ----------
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  photo_url text default '',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.group_members (
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (group_id, user_id)
);

create or replace function public.is_group_member(g uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from group_members where group_id = g and user_id = auth.uid());
$$;

-- ---------- FAVORITES / HISTORY ----------
create table if not exists public.favorites (
  user_id uuid references public.profiles(id) on delete cascade,
  restaurant_id text not null,
  created_at timestamptz default now(),
  primary key (user_id, restaurant_id)
);

create table if not exists public.history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  restaurant_id text not null,
  party jsonb default '[]',
  created_at timestamptz default now()
);

-- ---------- MEAL JOINS (เพื่อนสแกน QR เข้าร่วมมื้อ) ----------
create table if not exists public.meal_joins (
  id bigint generated always as identity primary key,
  host_id uuid references public.profiles(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now()
);

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table public.profiles enable row level security;
alter table public.friendships enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.favorites enable row level security;
alter table public.history enable row level security;
alter table public.meal_joins enable row level security;

-- profiles: ผู้ใช้ที่ล็อกอินอ่านได้ (เพื่อค้นหา/แสดงเพื่อน) แก้ได้เฉพาะของตัวเอง
drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles for select to authenticated using (true);
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- friendships: เห็นของตัวเอง, เพิ่มผ่าน add_friend(), ลบของตัวเองได้
drop policy if exists "friends read own" on public.friendships;
create policy "friends read own" on public.friendships for select to authenticated using (user_id = auth.uid());
drop policy if exists "friends delete own" on public.friendships;
create policy "friends delete own" on public.friendships for delete to authenticated using (user_id = auth.uid() or friend_id = auth.uid());

-- groups: สมาชิกทุกคนในกลุ่มเห็นและจัดการได้
drop policy if exists "groups read" on public.groups;
create policy "groups read" on public.groups for select to authenticated using (public.is_group_member(id) or created_by = auth.uid());
drop policy if exists "groups insert" on public.groups;
create policy "groups insert" on public.groups for insert to authenticated with check (created_by = auth.uid());
drop policy if exists "groups update" on public.groups;
create policy "groups update" on public.groups for update to authenticated using (public.is_group_member(id));
drop policy if exists "groups delete" on public.groups;
create policy "groups delete" on public.groups for delete to authenticated using (public.is_group_member(id));

drop policy if exists "gm read" on public.group_members;
create policy "gm read" on public.group_members for select to authenticated using (public.is_group_member(group_id));
drop policy if exists "gm insert" on public.group_members;
create policy "gm insert" on public.group_members for insert to authenticated with check (
  public.is_group_member(group_id)
  or exists (select 1 from public.groups g where g.id = group_id and g.created_by = auth.uid())
);
drop policy if exists "gm delete" on public.group_members;
create policy "gm delete" on public.group_members for delete to authenticated using (public.is_group_member(group_id));

-- favorites / history: ของใครของมัน
drop policy if exists "fav own" on public.favorites;
create policy "fav own" on public.favorites for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "history own" on public.history;
create policy "history own" on public.history for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- meal_joins: คนเข้าร่วมเพิ่มของตัวเอง, host อ่านได้
drop policy if exists "mj insert" on public.meal_joins;
create policy "mj insert" on public.meal_joins for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "mj read" on public.meal_joins;
create policy "mj read" on public.meal_joins for select to authenticated using (host_id = auth.uid() or user_id = auth.uid());

-- จำกัดสิทธิ์ฟังก์ชัน: คนที่ยังไม่ล็อกอินเรียกไม่ได้, trigger เรียกตรงๆ ไม่ได้
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.add_friend(uuid) from public, anon;
grant execute on function public.add_friend(uuid) to authenticated;
revoke execute on function public.is_group_member(uuid) from public, anon;
grant execute on function public.is_group_member(uuid) to authenticated;

-- =========================================================
-- STORAGE: bucket "images" (รูปโปรไฟล์ / รูปกลุ่ม) อ่านได้สาธารณะ
-- =========================================================
insert into storage.buckets (id, name, public) values ('images', 'images', true)
on conflict (id) do nothing;

drop policy if exists "images read" on storage.objects;
create policy "images read" on storage.objects for select using (bucket_id = 'images');
drop policy if exists "images upload" on storage.objects;
create policy "images upload" on storage.objects for insert to authenticated with check (bucket_id = 'images' and (storage.foldername(name))[2] = auth.uid()::text);
drop policy if exists "images update" on storage.objects;
create policy "images update" on storage.objects for update to authenticated using (bucket_id = 'images' and (storage.foldername(name))[2] = auth.uid()::text);
