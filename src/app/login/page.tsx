import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata = { title: "เข้าสู่ระบบ" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-5 py-16">
      <div className="animate-rise rounded-3xl border border-line bg-canvas p-8 shadow-card">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">เข้าสู่ระบบ TaoBary</h1>
        <p className="mt-1.5 text-sm text-muted">
          เข้าสู่ระบบเพื่อยืมหนังสือและติดตามกำหนดคืนของคุณ
        </p>

        {isSupabaseConfigured ? (
          <Suspense fallback={<div className="mt-8 h-56 rounded-2xl bg-surface" />}>
            <LoginForm />
          </Suspense>
        ) : (
          <div className="mt-6 space-y-3 rounded-2xl border border-brand-200 bg-brand-50/70 p-5 text-sm text-brand-900">
            <p className="font-semibold">ยังไม่ได้เชื่อมต่อ Supabase</p>
            <p className="leading-relaxed">
              คัดลอก <code className="rounded bg-canvas px-1.5 py-0.5 text-xs">.env.local.example</code>{" "}
              เป็น <code className="rounded bg-canvas px-1.5 py-0.5 text-xs">.env.local</code> ใส่ค่า
              URL และ anon key จากโปรเจกต์ Supabase แล้วรีสตาร์ตเซิร์ฟเวอร์
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
