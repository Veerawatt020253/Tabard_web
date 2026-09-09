"use client";

import { useState, useTransition } from "react";
import { deleteBook } from "@/lib/actions";

export function DeleteBookButton({ bookId, title }: { bookId: string; title: string }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(async () => void (await deleteBook(bookId)))}
          className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {pending ? "กำลังลบ…" : "ยืนยันลบ"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-full px-2 py-1.5 text-xs text-muted hover:text-ink"
        >
          ยกเลิก
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      aria-label={`ลบ ${title}`}
      className="shrink-0 rounded-full border border-line p-2 text-muted transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
        <path
          d="M4 7h16M9 7V5h6v2m-8 0 1 12h8l1-12"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
