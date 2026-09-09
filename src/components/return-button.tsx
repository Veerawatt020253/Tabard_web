"use client";

import { useState, useTransition } from "react";
import { returnBook } from "@/lib/actions";

export function ReturnButton({ loanId }: { loanId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await returnBook(loanId);
            setError(res.ok ? null : res.message);
          })
        }
        className="rounded-full border border-brand-600 px-5 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-600 hover:text-white disabled:opacity-60"
      >
        {pending ? "กำลังคืน…" : "คืนหนังสือ"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
