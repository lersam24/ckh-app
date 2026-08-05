export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-r from-sky-500 to-cyan-400 py-4 shadow-md">
        <div className="flex items-center justify-center gap-3">
          <span className="text-white font-semibold tracking-wide">
            BADAN PUSAT STATISTIK
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_#cef7f8_10%,_#5cd6d9_100%)] px-4 py-12">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-100 py-4 text-center text-xs text-slate-500">
        © 2026 Aplikasi CKH ·{" "}
        <span className="font-semibold text-slate-700">Aplikasi CKH PUSDIKLAT BPS</span>
      </footer>
    </div>
  );
}
