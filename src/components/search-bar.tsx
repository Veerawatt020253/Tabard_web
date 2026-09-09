"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function SearchBar({ categories }: { categories: string[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [q, setQ] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "ทั้งหมด");
  const [onlyAvailable, setOnlyAvailable] = useState(params.get("available") === "1");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams();
    if (q.trim()) next.set("q", q.trim());
    if (category !== "ทั้งหมด") next.set("category", category);
    if (onlyAvailable) next.set("available", "1");
    startTransition(() => router.push(next.size ? `/?${next}` : "/", { scroll: false }));
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto flex w-full max-w-3xl flex-col gap-2 rounded-3xl border border-line bg-canvas p-2 shadow-card sm:flex-row sm:items-center sm:rounded-full sm:pl-6 sm:pr-2"
    >
      <div className="flex flex-1 items-center gap-3 px-3 sm:px-0">
        <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-muted" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
          <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ค้นหาชื่อหนังสือ ผู้แต่ง หรือหัวข้อที่สนใจ"
          aria-label="ค้นหาหนังสือ"
          className="h-11 w-full bg-transparent text-[0.95rem] text-ink outline-none placeholder:text-muted/70"
        />
      </div>

      <div className="hidden h-7 w-px bg-line sm:block" />

      <label className="sr-only" htmlFor="category">
        หมวดหมู่
      </label>
      <select
        id="category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="h-11 rounded-full bg-transparent px-3 text-sm text-ink outline-none sm:w-40"
      >
        <option value="ทั้งหมด">ทุกหมวดหมู่</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <label className="flex h-11 cursor-pointer items-center gap-2 rounded-full px-3 text-sm text-muted">
        <input
          type="checkbox"
          checked={onlyAvailable}
          onChange={(e) => setOnlyAvailable(e.target.checked)}
          className="size-4 accent-brand-600"
        />
        เฉพาะที่ว่าง
      </label>

      <button
        type="submit"
        disabled={pending}
        className="h-11 shrink-0 rounded-full bg-brand-600 px-6 text-sm font-medium text-white shadow-pill transition hover:bg-brand-700 active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "กำลังค้นหา…" : "ค้นหา"}
      </button>
    </form>
  );
}
