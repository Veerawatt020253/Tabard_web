import Link from "next/link";
import { BookCover } from "@/components/book-cover";
import { DemoBanner } from "@/components/demo-banner";
import { EmptyState } from "@/components/empty-state";
import { BookForm } from "@/components/book-form";
import { DeleteBookButton } from "@/components/delete-book-button";
import { getBooks, getSessionUser } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata = { title: "จัดการคลังหนังสือ" };

export default async function AdminPage() {
  const user = isSupabaseConfigured ? await getSessionUser() : null;
  const books = await getBooks();
  const isAdmin = user?.profile?.role === "admin";

  if (isSupabaseConfigured && !user) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <EmptyState
          title="เข้าสู่ระบบเพื่อจัดการคลังหนังสือ"
          description="หน้านี้สำหรับผู้ดูแลระบบเท่านั้น"
          action={
            <Link
              href="/login?next=/admin"
              className="inline-flex rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              เข้าสู่ระบบ
            </Link>
          }
        />
      </div>
    );
  }

  const totalCopies = books.reduce((sum, b) => sum + b.total_copies, 0);
  const availableCopies = books.reduce((sum, b) => sum + b.available_copies, 0);

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">จัดการคลังหนังสือ</h1>
      <p className="mt-1 text-muted">เพิ่มหนังสือใหม่และดูภาพรวมของคลังทั้งหมด</p>

      <DemoBanner />

      {isSupabaseConfigured && !isAdmin && (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          บัญชีนี้ยังไม่ใช่ผู้ดูแลระบบ — ตั้งค่าได้ด้วยคำสั่ง SQL:{" "}
          <code className="rounded bg-white/70 px-1.5 py-0.5 text-xs">
            update public.profiles set role = &apos;admin&apos; where id = &apos;{user?.id}&apos;;
          </code>
        </div>
      )}

      <div className="mt-8 grid grid-cols-3 gap-3">
        {[
          { label: "ชื่อเรื่องทั้งหมด", value: books.length },
          { label: "จำนวนเล่มรวม", value: totalCopies },
          { label: "พร้อมให้ยืม", value: availableCopies },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-surface px-4 py-4 text-center">
            <p className="text-2xl font-semibold text-brand-700">{s.value}</p>
            <p className="mt-0.5 text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
        <section className="rounded-3xl border border-line bg-canvas p-6 shadow-card lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold text-ink">เพิ่มหนังสือใหม่</h2>
          <BookForm />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-ink">หนังสือในคลัง ({books.length})</h2>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
            {books.map((book) => (
              <li key={book.id} className="flex items-center gap-4 bg-canvas p-4">
                <Link href={`/books/${book.id}`} className="shrink-0">
                  <div className="h-16 w-12 overflow-hidden rounded-lg shadow-card">
                    <BookCover book={book} />
                  </div>
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/books/${book.id}`} className="block truncate font-medium text-ink hover:underline">
                    {book.title}
                  </Link>
                  <p className="truncate text-sm text-muted">
                    {book.author} · {book.category}
                  </p>
                </div>
                <div className="shrink-0 text-right text-sm">
                  <p className="font-medium text-ink">
                    {book.available_copies}/{book.total_copies}
                  </p>
                  <p className="text-xs text-muted">ว่าง/ทั้งหมด</p>
                </div>
                <DeleteBookButton bookId={book.id} title={book.title} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
