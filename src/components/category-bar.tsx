"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function CategoryBar({ categories }: { categories: string[] }) {
  const params = useSearchParams();
  const current = params.get("category") ?? "ทั้งหมด";

  function hrefFor(category: string) {
    const next = new URLSearchParams(params.toString());
    if (category === "ทั้งหมด") next.delete("category");
    else next.set("category", category);
    return next.size ? `/?${next}` : "/";
  }

  return (
    <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
      {["ทั้งหมด", ...categories].map((c) => {
        const active = c === current;
        return (
          <Link
            key={c}
            href={hrefFor(c)}
            scroll={false}
            aria-current={active ? "true" : undefined}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition ${
              active
                ? "border-brand-600 bg-brand-600 text-white shadow-pill"
                : "border-line bg-canvas text-muted hover:border-brand-300 hover:text-brand-700"
            }`}
          >
            {c}
          </Link>
        );
      })}
    </div>
  );
}
