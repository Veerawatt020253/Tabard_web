import Link from "next/link";
import { BookCover } from "@/components/book-cover";
import type { Book } from "@/lib/types";

export function BookCard({ book, index = 0 }: { book: Book; index?: number }) {
  const available = book.available_copies > 0;

  return (
    <Link
      href={`/books/${book.id}`}
      className="animate-rise group block"
      style={{ animationDelay: `${Math.min(index, 11) * 35}ms` }}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-surface shadow-card transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lift">
        <BookCover book={book} />
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[0.7rem] font-medium backdrop-blur ${
            available ? "bg-white/90 text-brand-700" : "bg-ink/70 text-white"
          }`}
        >
          {available ? `ว่าง ${book.available_copies} เล่ม` : "ถูกยืมหมด"}
        </span>
      </div>

      <div className="mt-3 space-y-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate text-[0.95rem] font-medium text-ink">{book.title}</h3>
          <span className="shrink-0 text-xs text-muted">{book.published_year ?? ""}</span>
        </div>
        <p className="truncate text-sm text-muted">{book.author}</p>
        <p className="text-xs text-muted/80">{book.category}</p>
      </div>
    </Link>
  );
}
