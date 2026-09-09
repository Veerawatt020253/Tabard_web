import Link from "next/link";
import { BookCover } from "@/components/book-cover";
import { ReturnButton } from "@/components/return-button";
import { EmptyState } from "@/components/empty-state";
import { DemoBanner } from "@/components/demo-banner";
import { getMyLoans, getSessionUser } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { dueLabel, formatDate, isOverdue } from "@/lib/format";
import type { LoanWithBook } from "@/lib/types";

export const metadata = { title: "การยืมของฉัน" };

const toneClass = {
  ok: "bg-brand-50 text-brand-700",
  soon: "bg-amber-50 text-amber-700",
  late: "bg-red-50 text-red-700",
} as const;

function LoanRow({ loan }: { loan: LoanWithBook }) {
  const returned = Boolean(loan.returned_at);
  const due = dueLabel(loan.due_at);

  return (
    <li className="flex items-center gap-4 rounded-2xl border border-line bg-canvas p-4 transition hover:shadow-card sm:gap-5 sm:p-5">
      <Link href={`/books/${loan.book_id}`} className="shrink-0">
        <div className="h-24 w-[4.5rem] overflow-hidden rounded-xl shadow-card">
          <BookCover book={loan.book} />
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={`/books/${loan.book_id}`} className="block truncate font-medium text-ink hover:underline">
          {loan.book.title}
        </Link>
        <p className="truncate text-sm text-muted">{loan.book.author}</p>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted">ยืมเมื่อ {formatDate(loan.borrowed_at)}</span>
          {returned ? (
            <span className="rounded-full bg-surface px-2.5 py-1 text-muted">
              คืนแล้ว {formatDate(loan.returned_at!)}
            </span>
          ) : (
            <span className={`rounded-full px-2.5 py-1 font-medium ${toneClass[due.tone]}`}>
              กำหนดคืน {formatDate(loan.due_at)} · {due.text}
            </span>
          )}
        </div>
      </div>

      {!returned && <ReturnButton loanId={loan.id} />}
    </li>
  );
}

export default async function MyLoansPage() {
  const user = isSupabaseConfigured ? await getSessionUser() : null;
  const loans = await getMyLoans();

  if (isSupabaseConfigured && !user) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <EmptyState
          title="เข้าสู่ระบบเพื่อดูการยืมของคุณ"
          description="รายการหนังสือที่ยืมและกำหนดคืนจะแสดงที่นี่หลังเข้าสู่ระบบ"
          action={
            <Link
              href="/login?next=/my-loans"
              className="inline-flex rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              เข้าสู่ระบบ
            </Link>
          }
        />
      </div>
    );
  }

  const active = loans.filter((l) => !l.returned_at);
  const history = loans.filter((l) => l.returned_at);
  const overdue = active.filter((l) => isOverdue(l.due_at));

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">การยืมของฉัน</h1>
      <p className="mt-1 text-muted">ติดตามหนังสือที่กำลังยืมและกำหนดคืนได้ที่นี่</p>

      <DemoBanner />

      <div className="mt-8 grid grid-cols-3 gap-3">
        {[
          { label: "กำลังยืม", value: active.length, accent: "text-brand-700" },
          { label: "เกินกำหนด", value: overdue.length, accent: overdue.length ? "text-red-600" : "text-ink" },
          { label: "คืนแล้ว", value: history.length, accent: "text-ink" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-surface px-4 py-4 text-center">
            <p className={`text-2xl font-semibold ${s.accent}`}>{s.value}</p>
            <p className="mt-0.5 text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-ink">กำลังยืมอยู่</h2>
        {active.length === 0 ? (
          <EmptyState
            title="ยังไม่มีหนังสือที่ยืมอยู่"
            description="เลือกเล่มที่สนใจจากคลังแล้วกดยืมได้เลย"
            action={
              <Link
                href="/"
                className="inline-flex rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
              >
                ไปหน้าค้นหาหนังสือ
              </Link>
            }
          />
        ) : (
          <ul className="space-y-3">
            {active.map((loan) => (
              <LoanRow key={loan.id} loan={loan} />
            ))}
          </ul>
        )}
      </section>

      {history.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-ink">ประวัติการยืม</h2>
          <ul className="space-y-3 opacity-80">
            {history.map((loan) => (
              <LoanRow key={loan.id} loan={loan} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
