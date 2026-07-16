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
  userJabatan,
}: {
  userName: string;
  userJabatan?: string | null;
}) {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="font-bold text-blue-700 text-lg">Aplikasi CKH</span>
          <nav className="hidden sm:flex items-center gap-6 text-sm">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/setup-triwulan"
                  ? pathname === "/setup-triwulan"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    isActive
                      ? "text-blue-700 font-medium border-b-2 border-blue-700 pb-3 -mb-3 pt-3"
                      : "text-slate-500 hover:text-slate-700 pb-3 -mb-3 pt-3"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight">
              {userName}
            </p>
            {userJabatan && (
              <p className="text-xs text-slate-500 leading-tight">
                {userJabatan}
              </p>
            )}
          </div>
          <div
            className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-500"
            aria-hidden="true"
          >
            {userName?.[0]?.toUpperCase()}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1 text-sm text-slate-600 hover:text-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}