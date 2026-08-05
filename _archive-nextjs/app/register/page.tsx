"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nama: "",
    email: "",
    nip: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validasi dasar di client sebelum kirim ke server
    if (!/^\d{18}$/.test(form.nip)) {
      setError("NIP harus terdiri dari 18 digit angka.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setIsLoading(true);
    try {
      // Endpoint ini perlu dibuat terpisah: app/api/register/route.ts
      // Tugasnya: hash password dengan bcrypt, simpan ke tabel `users` lewat Prisma
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: form.nama,
          email: form.email,
          nip: form.nip,
          password: form.password,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message ?? "Registrasi gagal. Coba lagi.");
        setIsLoading(false);
        return;
      }

      router.push("/login?registered=1");
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-slate-900">
            Registrasi Akun Pegawai Baru
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Sistem Pencatatan Kinerja Harian Pegawai BPS
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nama" className="block text-sm text-slate-700 mb-1">
              Nama Lengkap
            </label>
            <div className="relative">
              <input
                id="nama"
                type="text"
                required
                placeholder="John Doe"
                value={form.nama}
                onChange={(e) => update("nama", e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-slate-700 mb-1">
              Email Instansi
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                required
                placeholder="nama@instansi.go.id"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="nip" className="block text-sm text-slate-700 mb-1">
              Nomor Induk Pegawai (NIP)
            </label>
            <div className="relative">
              <input
                id="nip"
                type="text"
                inputMode="numeric"
                required
                placeholder="19XXXXXXXXXXXXXX"
                value={form.nip}
                onChange={(e) => update("nip", e.target.value.replace(/\D/g, ""))}
                maxLength={18}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6h11M9 12h11M9 18h11M5 6h.01M5 12h.01M5 18h.01" />
                </svg>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="password" className="block text-sm text-slate-700 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-3 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute inset-y-0 right-2.5 flex items-center text-slate-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v4h8z" />
                  </svg>
                </span>
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm text-slate-700 mb-1">
                Konfirmasi
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-3 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute inset-y-0 right-2.5 flex items-center text-slate-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm4-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-medium py-2.5 flex items-center justify-center gap-2 transition"
          >
            {isLoading ? "Memproses..." : "Daftar Sekarang"}
            {!isLoading && (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0" />
              </svg>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-5 pt-4 border-t border-slate-100">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
