import { Suspense } from "react";
import Link from "next/link";
import { BookCard } from "@/components/book-card";
import { CategoryBar } from "@/components/category-bar";
import { SearchBar } from "@/components/search-bar";
import { EmptyState } from "@/components/empty-state";
import { DemoBanner } from "@/components/demo-banner";
import { getBooks, getCategories } from "@/lib/data";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const onlyAvailable = sp.available === "1";

  const [books, categories] = await Promise.all([
    getBooks({ q, category, onlyAvailable }),
    getCategories(),
  ]);

  const filtering = Boolean(q || category || onlyAvailable);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-line/70 bg-gradient-to-b from-brand-50/70 to-canvas">
        <div className="pointer-events-none absolute -right-24 -top-32 size-80 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-10 size-72 rounded-full bg-brand-100/60 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-canvas px-3 py-1 text-xs font-medium text-brand-700">
              <span className="size-1.5 rounded-full bg-brand-500" />
              ห้องสมุดออนไลน์ ยืม-คืนได้ 24 ชั่วโมง
            </span>
            <h1 className="mt-5 text-balance text-[2rem] font-semibold leading-[1.2] tracking-tight text-ink sm:text-5xl sm:leading-[1.15]">
              หนังสือเล่มถัดไปของคุณ
              <span className="block text-brand-600">อยู่ห่างแค่ไม่กี่คลิก</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-[1.05rem] leading-relaxed text-muted">
              ค้นหาจากคลังหนังสือ กดยืมออนไลน์ แล้วติดตามกำหนดคืนได้ในที่เดียว
            </p>
          </div>

          <div className="mt-10">
            <Suspense fallback={<div className="mx-auto h-16 max-w-3xl rounded-full bg-surface" />}>
              <SearchBar categories={categories} />
            </Suspense>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5">
        <DemoBanner />

        {/* ── หมวดหมู่ ───────────────────────────────────── */}
        <div className="pt-8">
          <Suspense fallback={<div className="h-10" />}>
            <CategoryBar categories={categories} />
          </Suspense>
        </div>

        {/* ── ผลลัพธ์ ────────────────────────────────────── */}
        <section className="pt-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-ink">
                {filtering ? "ผลการค้นหา" : "หนังสือทั้งหมด"}
              </h2>
              <p className="mt-0.5 text-sm text-muted">พบ {books.length} เล่ม</p>
            </div>
            {filtering && (
              <Link href="/" className="text-sm font-medium text-brand-700 hover:underline">
                ล้างตัวกรอง
              </Link>
            )}
          </div>

          {books.length === 0 ? (
            <EmptyState
              title="ไม่พบหนังสือที่ตรงกับเงื่อนไข"
              description="ลองใช้คำค้นที่สั้นลง เปลี่ยนหมวดหมู่ หรือเอาตัวกรอง “เฉพาะที่ว่าง” ออก"
              action={
                <Link
                  href="/"
                  className="inline-flex rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
                >
                  ดูหนังสือทั้งหมด
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
              {books.map((book, i) => (
                <BookCard key={book.id} book={book} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* ── วิธีใช้งาน ─────────────────────────────────── */}
        <section className="mt-20 grid gap-4 sm:grid-cols-3">
          {[
            { n: "1", t: "ค้นหา", d: "พิมพ์ชื่อเรื่อง ผู้แต่ง หรือเลือกจากหมวดหมู่ที่สนใจ" },
            { n: "2", t: "กดยืม", d: "ระบบจองเล่มให้ทันที พร้อมกำหนดคืนภายใน 14 วัน" },
            { n: "3", t: "คืนเมื่อพร้อม", d: "กดคืนได้จากหน้า “การยืมของฉัน” ไม่ต้องรอเจ้าหน้าที่" },
          ].map((step) => (
            <div key={step.n} className="rounded-2xl border border-line bg-surface p-6">
              <span className="grid size-8 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                {step.n}
              </span>
              <h3 className="mt-4 font-semibold text-ink">{step.t}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{step.d}</p>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
