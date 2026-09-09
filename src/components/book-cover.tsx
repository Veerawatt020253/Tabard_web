import type { Book } from "@/lib/types";

/** ปกจำลอง: ไล่เฉดเขียวคนละโทนต่อเล่ม ใช้แทนภาพปกจริงเมื่อยังไม่มีไฟล์ */
const palettes = [
  "from-brand-500 via-brand-700 to-brand-900",
  "from-emerald-500 via-brand-700 to-brand-950",
  "from-brand-400 via-brand-600 to-teal-900",
  "from-lime-500 via-brand-600 to-brand-900",
  "from-teal-500 via-brand-700 to-brand-950",
  "from-brand-600 via-brand-800 to-emerald-950",
];

function hash(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  return h;
}

export function BookCover({
  book,
  className = "",
  size = "card",
}: {
  book: Pick<Book, "id" | "title" | "author" | "cover_url">;
  className?: string;
  size?: "card" | "detail";
}) {
  if (book.cover_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={book.cover_url}
        alt={`ปกหนังสือ ${book.title}`}
        className={`size-full object-cover ${className}`}
      />
    );
  }

  const seed = hash(book.id + book.title);
  const gradient = palettes[seed % palettes.length];
  const initial = [...book.title.trim()][0] ?? "?";

  return (
    <div
      className={`relative size-full overflow-hidden bg-gradient-to-br ${gradient} ${className}`}
      role="img"
      aria-label={`ปกหนังสือ ${book.title}`}
    >
      {/* สันหนังสือ */}
      <span className="absolute inset-y-0 left-0 w-[6%] bg-black/20" />
      <span className="absolute inset-y-0 left-[6%] w-px bg-white/30" />

      {/* แสงตกกระทบมุมบน */}
      <span className="absolute -right-10 -top-12 size-36 rounded-full bg-white/15 blur-2xl" />

      {/* ตัวอักษรแรกของชื่อเรื่องแบบจาง ๆ */}
      <span
        aria-hidden="true"
        className={`absolute bottom-[-0.12em] right-[0.06em] select-none font-semibold leading-none text-white/20 ${
          size === "detail" ? "text-[11rem]" : "text-[6.5rem]"
        }`}
      >
        {initial}
      </span>

      {/* เส้นตกแต่งบาง ๆ */}
      <span className="absolute left-[16%] top-[14%] h-px w-[46%] bg-white/35" />
      <span className="absolute left-[16%] top-[calc(14%+7px)] h-px w-[28%] bg-white/20" />
    </div>
  );
}
