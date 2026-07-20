"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/rekap", label: "Rekap & Export" },
  { href: "/setup-triwulan", label: "Setup" },
  { href: "/setup-triwulan/import", label: "Import" },
];

export default function DashboardNavbar({
  userName,
}: {
  userName: string;
  userJabatan?: string | null;
}) {
  const pathname = usePathname();

  return (
    <header className="bg-surface border-b border-surface-border sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-margin-lg max-w-container-max mx-auto h-16">
        <Link href="/dashboard" className="font-headline-sm text-headline-sm font-bold text-primary shrink-0">
          Aplikasi CKH
        </Link>

        <nav className="hidden md:flex items-center gap-gutter-lg h-full">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/setup-triwulan"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isActive
                    ? "font-body-md text-body-md text-primary border-b-2 border-primary pb-1 font-bold"
                    : "font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-gutter-md">
          <div className="hidden sm:flex items-center bg-surface-container rounded-full px-4 py-1.5 border border-surface-border">
            <span className="material-symbols-outlined text-outline text-[20px] mr-2">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-body-md w-32 lg:w-48 p-0 outline-none"
              placeholder="Cari kegiatan..."
              type="text"
            />
          </div>
          <button className="material-symbols-outlined text-on-surface-variant hover:text-primary p-2 cursor-pointer">
            notifications
          </button>
          <button className="material-symbols-outlined text-on-surface-variant hover:text-primary p-2 cursor-pointer">
            settings
          </button>
          <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold overflow-hidden text-sm">
            {userName?.[0]?.toUpperCase()}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="material-symbols-outlined text-on-surface-variant hover:text-error p-2 cursor-pointer"
            title="Keluar"
          >
            logout
          </button>
        </div>
      </div>
    </header>
  );
}
