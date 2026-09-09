"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
        active ? "bg-brand-50 text-brand-700" : "text-muted hover:bg-surface hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}
