"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/";

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) return;

    setPending(true);
    setMessage(null);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setPending(false);
      if (error) return setMessage({ ok: false, text: error.message });
      router.push(next);
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName || email.split("@")[0] },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setPending(false);

    if (error) return setMessage({ ok: false, text: error.message });
    if (data.session) {
      router.push(next);
      router.refresh();
      return;
    }
    setMessage({ ok: true, text: "สมัครสำเร็จ — กรุณายืนยันอีเมลจากลิงก์ที่ส่งไปให้" });
  }

  const inputClass =
    "w-full rounded-xl border border-line bg-canvas px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-brand-500";

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-1 rounded-full bg-surface p-1">
        {(
          [
            ["signin", "เข้าสู่ระบบ"],
            ["signup", "สมัครสมาชิก"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setMode(value);
              setMessage(null);
            }}
            className={`rounded-full py-2 text-sm font-medium transition ${
              mode === value ? "bg-canvas text-brand-700 shadow-pill" : "text-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        {mode === "signup" && (
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="ชื่อที่ใช้แสดง"
            autoComplete="name"
            className={inputClass}
          />
        )}

        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="อีเมล"
          autoComplete="email"
          className={inputClass}
        />

        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          className={inputClass}
        />

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-brand-600 px-6 py-3 text-sm font-medium text-white shadow-pill transition hover:bg-brand-700 active:scale-[0.99] disabled:opacity-60"
        >
          {pending ? "กำลังดำเนินการ…" : mode === "signin" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
        </button>

        {message && (
          <p
            role="status"
            className={`rounded-xl px-4 py-3 text-sm ${
              message.ok ? "bg-brand-50 text-brand-800" : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </p>
        )}
      </form>
    </>
  );
}
