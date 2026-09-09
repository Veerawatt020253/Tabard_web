import Link from "next/link";
import { notFound } from "next/navigation";
import { BookCover } from "@/components/book-cover";
import { BorrowButton } from "@/components/borrow-button";
import { BookCard } from "@/components/book-card";
import { getBook, getBooks, getMyActiveLoanFor } from "@/lib/data";

export async function generateMetadata({ params }: PageProps<"/books/[id]">) {
  const { id } = await params;
  const book = await getBook(id);
  return { title: book ? `${book.title} — ${book.author}` : "ไม่พบหนังสือ" };
}

export default async function BookPage({ params }: PageProps<"/books/[id]">) {
  const { id } = await params;
  const book = await getBook(id);
  if (!book) notFound();

  const [activeLoan, related] = await Promise.all([
    getMyActiveLoanFor(book.id),
    getBooks({ category: book.category }),
  ]);

  const available = book.available_copies > 0;
  const borrowedCount = book.total_copies - book.available_copies;
  const others = related.filter((b) => b.id !== book.id).slice(0, 4);

  const facts = [
    { label: "หมวดหมู่", value: book.category },
    { label: "ปีที่พิมพ์", value: book.published_year?.toString() ?? "—" },
    { label: "ISBN", value: book.isbn ?? "—" },
    { label: "จำนวนทั้งหมด", value: `${book.total_copies} เล่ม` },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="transition hover:text-brand-700">
          ค้นหาหนังสือ
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={`/?category=${encodeURIComponent(book.category)}`} className="transition hover:text-brand-700">
          {book.category}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="truncate text-ink">{book.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
        {/* ── เนื้อหา ─────────────────────────────────── */}
        <div className="animate-rise">
          <div className="grid gap-8 sm:grid-cols-[14rem_minmax(0,1fr)]">
            <div className="aspect-[3/4] w-full overflow-hidden rounded-3xl shadow-lift sm:w-56">
              <BookCover book={book} size="detail" />
            </div>

            <div className="min-w-0">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                  available ? "bg-brand-50 text-brand-700" : "bg-surface text-muted"
                }`}
              >
                <span className={`size-1.5 rounded-full ${available ? "bg-brand-500" : "bg-muted"}`} />
                {available ? `ว่าง ${book.available_copies} จาก ${book.total_copies} เล่ม` : "ถูกยืมหมด"}
              </span>

              <h1 className="mt-3 text-balance text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
                {book.title}
              </h1>
              <p className="mt-2 text-lg text-muted">{book.author}</p>

              {book.description && (
                <p className="mt-6 text-pretty leading-relaxed text-ink/80">{book.description}</p>
              )}

              <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 sm:grid-cols-4">
                {facts.map((f) => (
                  <div key={f.label}>
                    <dt className="text-xs text-muted">{f.label}</dt>
                    <dd className="mt-0.5 text-sm font-medium text-ink">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* ── กล่องยืม ────────────────────────────────── */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-line bg-canvas p-6 shadow-card">
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-semibold tracking-tight text-ink">
                {available ? "ยืมได้เลย" : "ไม่ว่าง"}
              </p>
              <p className="text-sm text-muted">ยืมได้ 14 วัน</p>
            </div>

            <div className="my-5 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">มีในคลัง</span>
                <span className="font-medium text-ink">{book.total_copies} เล่ม</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">กำลังถูกยืม</span>
                <span className="font-medium text-ink">{borrowedCount} เล่ม</span>
              </div>
              <div className="flex justify-between border-t border-line pt-2.5">
                <span className="text-muted">พร้อมให้ยืม</span>
                <span className={`font-semibold ${available ? "text-brand-700" : "text-muted"}`}>
                  {book.available_copies} เล่ม
                </span>
              </div>
            </div>

            <BorrowButton
              bookId={book.id}
              disabled={!available}
              alreadyBorrowed={Boolean(activeLoan)}
            />

            <p className="mt-4 text-center text-xs leading-relaxed text-muted">
              กดยืมแล้วมารับหนังสือที่เคาน์เตอร์ได้ภายใน 24 ชั่วโมง
            </p>
          </div>
        </aside>
      </div>

      {others.length > 0 && (
        <section className="mt-20">
          <h2 className="text-xl font-semibold tracking-tight text-ink">
            เล่มอื่นในหมวด {book.category}
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
            {others.map((b, i) => (
              <BookCard key={b.id} book={b} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
