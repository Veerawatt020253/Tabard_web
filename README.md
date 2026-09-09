# TaoBary 📗

เว็บยืม-คืนหนังสือ (ห้องสมุดออนไลน์) ดีไซน์มินิมอลสไตล์ Google/Airbnb ธีมสีเขียว
สร้างด้วย **Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Supabase**

## ฟีเจอร์

| หน้า | ทำอะไรได้ |
| --- | --- |
| `/` | ค้นหาหนังสือจากชื่อเรื่อง/ผู้แต่ง กรองตามหมวดหมู่ และกรองเฉพาะเล่มที่ว่าง |
| `/books/[id]` | ดูรายละเอียดหนังสือ จำนวนเล่มที่เหลือ และกดยืม (14 วัน) |
| `/my-loans` | ดูรายการที่กำลังยืม กำหนดคืน แจ้งเตือนเกินกำหนด และกดคืน |
| `/admin` | เพิ่ม/ลบหนังสือ และดูภาพรวมคลัง (เฉพาะบัญชี role = `admin`) |
| `/login` | สมัครสมาชิก / เข้าสู่ระบบด้วยอีเมล + รหัสผ่าน (Supabase Auth) |

## เริ่มใช้งาน

```bash
npm install
npm run dev
```

เปิด http://localhost:3000

ถ้ายังไม่มี `.env.local` เว็บจะเข้าสู่ "โหมดตัวอย่าง" และแสดงข้อมูลจำลองในเครื่อง
เมื่อใส่ค่า Supabase ครบแล้วจะสลับไปอ่าน/เขียนฐานข้อมูลจริงอัตโนมัติ

## เชื่อมต่อ Supabase

ตั้งค่าไว้ใน `.env.local` (ไม่ถูก commit ขึ้น GitHub)
ถ้าย้ายไปโปรเจกต์อื่น ให้คัดลอกไฟล์ตัวอย่างแล้วใส่ค่าจาก **Project Settings → API**

```bash
cp .env.local.example .env.local
```

### รัน SQL

เปิด **SQL Editor** ใน Supabase Dashboard แล้ววาง `supabase/schema.sql` ทั้งไฟล์ → Run

ไฟล์นี้ **รันซ้ำได้และไม่ลบข้อมูลเดิม** — ใช้ `create table if not exists` /
`add column if not exists` / `create or replace` ทั้งหมด จึงปลอดภัยกับฐานข้อมูลที่มีข้อมูลอยู่แล้ว
สิ่งที่มันทำคือ

1. เพิ่มคอลัมน์ `description`, `isbn`, `published_year`, `cover_url` ให้ `books` (nullable — ไม่กระทบแถวเดิม)
2. สร้างตาราง `profiles` + trigger สร้างโปรไฟล์อัตโนมัติเมื่อสมัครสมาชิก
3. ใส่ trigger ให้ `books.available_copies` ตรงกับตาราง `loans` เสมอ แล้วคำนวณย้อนหลังให้ครั้งหนึ่ง
4. สร้างฟังก์ชัน `borrow_book()` / `return_book()` ที่ล็อกแถวกันยืมเกินจำนวนเล่ม
5. **เปิด Row Level Security** ให้ `books`, `loans`, `profiles` (ดูหัวข้อถัดไป)

`supabase/seed.sql` เป็นหนังสือตัวอย่างเพิ่มเติม — ไม่บังคับ และข้ามเล่มที่ชื่อซ้ำกับของเดิม

### ⚠️ Row Level Security

ก่อนรัน `schema.sql` ตาราง `books` และ `loans` **เปิดให้ anon key แก้ไขและลบข้อมูลได้**
anon key ถูกฝังอยู่ในหน้าเว็บที่ทุกคนเปิดดูได้ ใครก็ตามที่เปิด DevTools จึงลบหนังสือทั้งตารางได้
หัวข้อที่ 7 ของ `schema.sql` คือส่วนที่ปิดช่องนี้ — **ควรรันก่อนเอาขึ้นออนไลน์**

หลังรันแล้ว: ใครก็อ่านรายการหนังสือได้ / แก้คลังได้เฉพาะ `admin` / เห็นและคืนรายการยืมได้เฉพาะของตัวเอง
ถ้ามีแอปอื่นเขียนตารางเหล่านี้ด้วย anon key อยู่ แอปนั้นจะเขียนไม่ได้อีกต่อไป

### ตั้งตัวเองเป็นแอดมิน

สมัครสมาชิกที่ `/login` แล้วรัน (หน้า `/admin` จะแสดง UUID ให้คัดลอก)

```sql
update public.profiles set role = 'admin' where id = 'UUID-ของคุณ';
```

> ถ้าอยากทดสอบเร็ว ๆ ให้ปิด "Confirm email" ที่ **Authentication → Providers → Email**

## โครงสร้างฐานข้อมูล

สคีมาอิงของเดิมที่มีอยู่แล้วในโปรเจกต์ Supabase นี้ (คงชื่อคอลัมน์เดิมไว้ทั้งหมด)

**`books`**

| คอลัมน์ | หมายเหตุ |
| --- | --- |
| `id`, `title`, `author`, `category`, `total_copies`, `created_at` | ของเดิม |
| `available_copies` | ของเดิม — ตอนนี้ trigger คำนวณให้อัตโนมัติจากรายการยืมที่ยังไม่คืน |
| `color` | ของเดิม (hex) — ยังเก็บไว้ แต่ UI ใช้โทนเขียวของธีมแทน |
| `description`, `isbn`, `published_year`, `cover_url` | เพิ่มใหม่ ทั้งหมด nullable |

**`loans`** — `id`, `book_id`, `member_id` (= `auth.uid()` ของผู้ยืม), `borrowed_at`, `due_at`, `returned_at`, `status`, `created_at`

**`profiles`** — `id` (อ้าง `auth.users`), `full_name`, `role` (`member` | `admin`) สร้างอัตโนมัติเมื่อสมัครสมาชิก

**ฟังก์ชัน** — `borrow_book(p_book_id, p_days)`, `return_book(p_loan_id)`, `is_admin()`, `sync_available_copies(p_book_id)`

## โครงสร้างโค้ด

```
src/
├─ app/               หน้าเว็บทั้งหมด (App Router)
├─ components/        UI ที่ใช้ซ้ำ เช่น BookCard, SearchBar, BorrowButton
├─ lib/
│  ├─ data.ts         ชั้นอ่านข้อมูล (fallback เป็นข้อมูลตัวอย่างเมื่อไม่มี Supabase)
│  ├─ actions.ts      Server Actions: ยืม / คืน / เพิ่ม / ลบหนังสือ
│  ├─ demo-data.ts    ข้อมูลจำลองสำหรับโหมดตัวอย่าง
│  └─ supabase/       client, server และการตรวจ config
└─ proxy.ts           รีเฟรช session ของ Supabase ทุก request
```

## ธีม

โทนสีเขียวกำหนดไว้ที่เดียวใน `src/app/globals.css` (`--color-brand-*`)
ปรับค่าที่นั่นแล้วทั้งเว็บจะเปลี่ยนตามทันที
