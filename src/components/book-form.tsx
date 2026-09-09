"use client";

import { useRef, useState, useTransition } from "react";
import { createBook } from "@/lib/actions";

const inputClass =
  "w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand-500";

export function BookForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  return (
    <form
      ref={formRef}
      action={(formData) =>
        startTransition(async () => {
          const res = await createBook(formData);
          setResult(res);
          if (res.ok) formRef.current?.reset();
        })
      }
      className="mt-5 space-y-3"
    >
      <input name="title" required placeholder="ชื่อหนังสือ *" className={inputClass} />
      <input name="author" required placeholder="ผู้แต่ง *" className={inputClass} />
      <input name="category" placeholder="หมวดหมู่ (เช่น เทคโนโลยี)" className={inputClass} />
      <textarea name="description" rows={3} placeholder="เรื่องย่อ" className={`${inputClass} resize-y`} />

      <div className="grid grid-cols-2 gap-3">
        <input name="isbn" placeholder="ISBN" className={inputClass} />
        <input
          name="published_year"
          type="number"
          min={1000}
          max={2200}
          placeholder="ปีที่พิมพ์"
          className={inputClass}
        />
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs text-muted">จำนวนเล่มในคลัง</span>
        <input
          name="total_copies"
          type="number"
          min={1}
          defaultValue={1}
          className={inputClass}
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-brand-600 px-6 py-3 text-sm font-medium text-white shadow-pill transition hover:bg-brand-700 active:scale-[0.99] disabled:opacity-60"
      >
        {pending ? "กำลังบันทึก…" : "เพิ่มเข้าคลัง"}
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
    </form>
  );
}
