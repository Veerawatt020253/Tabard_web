"use client";

import { useState, useTransition } from "react";
import { borrowBook } from "@/lib/actions";

export function BorrowButton({
  bookId,
  disabled,
  alreadyBorrowed,
}: {
  bookId: string;
  disabled: boolean;
  alreadyBorrowed: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  if (alreadyBorrowed) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 px-5 py-4 text-sm text-brand-900">
        คุณยืมเล่มนี้อยู่แล้ว — ดูกำหนดคืนได้ที่หน้า “การยืมของฉัน”
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={disabled || pending}
        onClick={() =>
          startTransition(async () => {
            setResult(await borrowBook(bookId));
          })
        }
        className="w-full rounded-full bg-brand-600 px-6 py-3.5 text-[0.95rem] font-medium text-white shadow-pill transition hover:bg-brand-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-line disabled:text-muted disabled:shadow-none"
      >
        {pending ? "กำลังยืม…" : disabled ? "ถูกยืมหมดแล้ว" : "ยืมหนังสือเล่มนี้"}
      </button>

      {result && (
        <p
          role="status"
          className={`rounded-xl px-4 py-3 text-sm ${
            result.ok ? "bg-brand-50 text-brand-800" : "bg-red-50 text-red-700"
          }`}
        >
          {result.message}
        </p>
      )}
    </div>
  );
}
