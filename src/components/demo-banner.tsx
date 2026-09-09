import { isSupabaseConfigured } from "@/lib/supabase/config";

export function DemoBanner() {
  if (isSupabaseConfigured) return null;

  return (
    <div className="mt-8 flex flex-col gap-2 rounded-2xl border border-brand-200 bg-brand-50/70 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-brand-900">
        <strong className="font-semibold">โหมดตัวอย่าง</strong> — กำลังแสดงข้อมูลจำลองในเครื่อง
        เพราะยังไม่ได้เชื่อมต่อ Supabase
      </p>
      <code className="shrink-0 rounded-lg bg-canvas px-2.5 py-1 text-xs text-brand-800">
        ตั้งค่า .env.local แล้วรีสตาร์ต
      </code>
    </div>
  );
}
