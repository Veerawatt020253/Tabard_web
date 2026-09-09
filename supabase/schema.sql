-- ============================================================
-- TaoBary — ระบบยืม-คืนหนังสือ
--
-- ไฟล์นี้ "รันซ้ำได้" และ "ไม่ลบข้อมูลเดิม"
-- ใช้ได้ทั้งกับโปรเจกต์เปล่า และกับฐานข้อมูลที่มีตาราง books/loans อยู่แล้ว
-- วิธีรัน: Supabase Dashboard → SQL Editor → วางทั้งไฟล์ → Run
--
-- สิ่งที่ทำกับฐานข้อมูลเดิม
--   • เพิ่มคอลัมน์ใหม่แบบ nullable เท่านั้น (ไม่แตะคอลัมน์/ข้อมูลเดิม)
--   • เก็บ books.color, books.available_copies, loans.member_id, loans.status ไว้ตามเดิม
--   • เปิด Row Level Security ซึ่งเดิม "ยังไม่ได้เปิด" (ดูหัวข้อ 7)
-- ============================================================

create extension if not exists "pgcrypto";


-- ============================================================
-- 1. books — คลังหนังสือ
-- ============================================================
create table if not exists public.books (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  author          text not null,
  category        text not null default 'ทั่วไป',
  total_copies    int  not null default 1 check (total_copies >= 0),
  available_copies int not null default 1 check (available_copies >= 0),
  color           text,
  created_at      timestamptz not null default now()
);

-- คอลัมน์เสริมที่ TaoBary ใช้ (ของเดิมยังไม่มี — เพิ่มแบบ nullable จึงไม่กระทบข้อมูลเก่า)
alter table public.books add column if not exists description    text;
alter table public.books add column if not exists isbn           text;
alter table public.books add column if not exists published_year int;
alter table public.books add column if not exists cover_url      text;

create index if not exists books_category_idx   on public.books (category);
create index if not exists books_created_at_idx on public.books (created_at desc);


-- ============================================================
-- 2. loans — รายการยืม-คืน
--    member_id = auth.uid() ของผู้ยืม (คงชื่อคอลัมน์เดิมไว้)
-- ============================================================
create table if not exists public.loans (
  id          uuid primary key default gen_random_uuid(),
  book_id     uuid not null references public.books (id) on delete cascade,
  member_id   uuid not null,
  borrowed_at date not null default current_date,
  due_at      date not null default (current_date + 14),
  returned_at date,
  status      text not null default 'borrowed',
  created_at  timestamptz not null default now()
);

create index if not exists loans_member_idx on public.loans (member_id);
create index if not exists loans_active_idx on public.loans (book_id) where returned_at is null;

-- ห้ามยืมเล่มเดิมซ้ำในขณะที่ยังไม่คืน
create unique index if not exists loans_one_active_per_member_book
  on public.loans (member_id, book_id) where returned_at is null;


-- ============================================================
-- 3. profiles — ผู้ใช้ + สิทธิ์ (สร้างอัตโนมัติเมื่อสมัครสมาชิก)
-- ============================================================
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  role       text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- เติม profile ให้ผู้ใช้ที่สมัครไว้ก่อนหน้านี้ (ถ้ามี)
insert into public.profiles (id, full_name)
select u.id, coalesce(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1))
from auth.users u
on conflict (id) do nothing;


-- ============================================================
-- 4. ทำให้ books.available_copies ถูกต้องเสมอ
--    เดิมคอลัมน์นี้ถูกอัปเดตด้วยมือจึงเพี้ยนจากตาราง loans ได้
--    ต่อจากนี้จะคำนวณจาก "จำนวนเล่มที่ยังไม่ถูกคืน" โดยอัตโนมัติ
-- ============================================================
create or replace function public.sync_available_copies(p_book_id uuid)
returns void
language sql
security definer set search_path = public
as $$
  update public.books b
  set available_copies = greatest(
    0,
    b.total_copies - (
      select count(*) from public.loans l
      where l.book_id = b.id and l.returned_at is null
    )
  )
  where b.id = p_book_id;
$$;

create or replace function public.loans_sync_trigger()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.sync_available_copies(old.book_id);
    return old;
  end if;
  perform public.sync_available_copies(new.book_id);
  if tg_op = 'UPDATE' and old.book_id is distinct from new.book_id then
    perform public.sync_available_copies(old.book_id);
  end if;
  return new;
end;
$$;

drop trigger if exists loans_sync_available on public.loans;
create trigger loans_sync_available
  after insert or update or delete on public.loans
  for each row execute function public.loans_sync_trigger();

-- ปรับ available_copies ของหนังสือทุกเล่มให้ตรงกับตาราง loans หนึ่งครั้ง
-- (แถวที่ค่าเดิมเพี้ยนอยู่จะถูกแก้ให้ถูกต้อง — ไม่มีการลบข้อมูลใด ๆ)
update public.books b
set available_copies = greatest(
  0,
  b.total_copies - (
    select count(*) from public.loans l
    where l.book_id = b.id and l.returned_at is null
  )
)
where b.available_copies is distinct from greatest(
  0,
  b.total_copies - (
    select count(*) from public.loans l
    where l.book_id = b.id and l.returned_at is null
  )
);


-- ============================================================
-- 5. ยืมหนังสือ — ล็อกแถวกันยืมเกินจำนวนเล่มที่มี
-- ============================================================
create or replace function public.borrow_book(p_book_id uuid, p_days int default 14)
returns public.loans
language plpgsql
security definer set search_path = public
as $$
declare
  v_member uuid := auth.uid();
  v_total  int;
  v_active int;
  v_loan   public.loans;
begin
  if v_member is null then
    raise exception 'ต้องเข้าสู่ระบบก่อนยืมหนังสือ' using errcode = '42501';
  end if;

  select total_copies into v_total
  from public.books where id = p_book_id
  for update;

  if v_total is null then
    raise exception 'ไม่พบหนังสือเล่มนี้' using errcode = 'P0002';
  end if;

  select count(*) into v_active
  from public.loans
  where book_id = p_book_id and returned_at is null;

  if v_active >= v_total then
    raise exception 'หนังสือถูกยืมหมดแล้ว' using errcode = 'P0001';
  end if;

  insert into public.loans (book_id, member_id, borrowed_at, due_at, status)
  values (p_book_id, v_member, current_date, current_date + p_days, 'borrowed')
  returning * into v_loan;

  return v_loan;
end;
$$;


-- ============================================================
-- 6. คืนหนังสือ — เจ้าของรายการ หรือแอดมิน เท่านั้น
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.return_book(p_loan_id uuid)
returns public.loans
language plpgsql
security definer set search_path = public
as $$
declare
  v_loan public.loans;
begin
  update public.loans
  set returned_at = current_date,
      status      = 'returned'
  where id = p_loan_id
    and returned_at is null
    and (member_id = auth.uid() or public.is_admin())
  returning * into v_loan;

  if v_loan.id is null then
    raise exception 'ไม่พบรายการยืมที่คืนได้' using errcode = 'P0002';
  end if;

  return v_loan;
end;
$$;


-- ============================================================
-- 7. Row Level Security
--
--    ⚠️ ก่อนรันไฟล์นี้ ตาราง books และ loans "เปิดให้ anon key แก้ไข/ลบได้"
--       ซึ่ง anon key ถูกฝังอยู่ในหน้าเว็บที่ผู้ใช้ทุกคนเปิดดูได้
--       ส่วนนี้คือส่วนที่ปิดช่องโหว่ดังกล่าว
--
--    หลังรัน: ใครก็อ่านรายการหนังสือได้ / แก้คลังได้เฉพาะ admin
--             / เห็นและคืนรายการยืมได้เฉพาะของตัวเอง
-- ============================================================
alter table public.books    enable row level security;
alter table public.loans    enable row level security;
alter table public.profiles enable row level security;

-- ---- books ----
drop policy if exists "books read"   on public.books;
drop policy if exists "books manage" on public.books;

create policy "books read" on public.books
  for select using (true);

create policy "books manage" on public.books
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- loans ----
drop policy if exists "loans read"   on public.loans;
drop policy if exists "loans insert" on public.loans;
drop policy if exists "loans update" on public.loans;

create policy "loans read" on public.loans
  for select using (member_id = auth.uid() or public.is_admin());

create policy "loans insert" on public.loans
  for insert with check (member_id = auth.uid());

create policy "loans update" on public.loans
  for update using (member_id = auth.uid() or public.is_admin());

-- ---- profiles ----
drop policy if exists "profiles read"   on public.profiles;
drop policy if exists "profiles update" on public.profiles;

create policy "profiles read" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "profiles update" on public.profiles
  for update using (id = auth.uid());


-- ============================================================
-- 8. ตั้งตัวเองเป็นแอดมิน (รันหลังสมัครสมาชิกที่หน้า /login แล้ว)
-- ============================================================
-- update public.profiles set role = 'admin' where id = 'UUID-ของคุณ';

-- ล้าง 3 รายการยืมทดสอบเดิมที่ member_id ไม่ผูกกับผู้ใช้จริง (ถ้าต้องการ)
-- delete from public.loans where member_id = '00000000-0000-0000-0000-000000000001';
