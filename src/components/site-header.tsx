import Link from "next/link";
import { Logo } from "@/components/logo";
import { getSessionUser } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { signOut } from "@/lib/actions";
import { NavLink } from "@/components/nav-link";

export async function SiteHeader() {
  const user = isSupabaseConfigured ? await getSessionUser() : null;
  const name = user?.profile?.full_name ?? user?.email?.split("@")[0] ?? null;

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink href="/">ค้นหาหนังสือ</NavLink>
          <NavLink href="/my-loans">การยืมของฉัน</NavLink>
          <NavLink href="/admin">จัดการคลัง</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-sm text-muted sm:inline">สวัสดี, {name}</span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition hover:border-brand-300 hover:bg-brand-50"
                >
                  ออกจากระบบ
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-pill transition hover:bg-brand-700 active:scale-[0.98]"
            >
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-line/70 px-5 py-2 no-scrollbar md:hidden">
        <NavLink href="/">ค้นหาหนังสือ</NavLink>
        <NavLink href="/my-loans">การยืมของฉัน</NavLink>
        <NavLink href="/admin">จัดการคลัง</NavLink>
      </nav>
    </header>
  );
}
