import Link from "next/link";
import { Logo } from "@/components/logo";

const links = [
  { href: "/", label: "ค้นหาหนังสือ" },
  { href: "/my-loans", label: "การยืมของฉัน" },
  { href: "/admin", label: "จัดการคลัง" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Logo />
          <p className="max-w-sm text-sm text-muted">
            ห้องสมุดออนไลน์ที่ทำให้การยืม-คืนหนังสือเป็นเรื่องง่าย
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-brand-700">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-line px-5 py-4">
        <p className="mx-auto max-w-6xl text-xs text-muted">
          © {new Date().getFullYear()} TaoBary · สร้างด้วย Next.js และ Supabase
        </p>
      </div>
    </footer>
  );
}
