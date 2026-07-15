import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header BPS */}
      <header className="bg-gradient-to-r from-sky-500 to-cyan-400 py-4">
        <div className="flex items-center justify-center gap-3">
          {/* Ganti dengan <img src="/logo-bps.png" /> kalau sudah ada asetnya */}
          <div className="h-8 w-8 rounded bg-white/20" aria-hidden="true" />
          <span className="text-white font-bold tracking-wide italic">
            BADAN PUSAT STATISTIK
          </span>
        </div>
      </header>

      {/* Konten (kartu form) dengan background gradient */}
      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-cyan-200 via-cyan-100 to-teal-100 px-4 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 py-4 text-center text-xs text-slate-500">
        © 2026  Aplikasi CKH. All rights reserved. &middot;{" "}
        <span className="font-semibold text-slate-600">Aplikasi CKH</span>{" "}
        <span className="font-semibold text-slate-600">PUSDIKLAT BPS</span>{" "}
        &middot; <a href="#" className="hover:underline">Privacy</a> &middot;{" "}
        <a href="#" className="hover:underline">Terms</a>
      </footer>
    </div>
  );
}
