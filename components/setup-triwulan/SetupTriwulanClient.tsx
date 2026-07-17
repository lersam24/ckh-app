"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TRIWULAN_LABEL } from "@/lib/current-triwulan";

type Iki = { id: string; deskripsi: string };
type RencanaKinerja = {
  id: string;
  deskripsi: string;
  jenis: "UTAMA" | "TAMBAHAN";
  dariImport: boolean;
  ikis: Iki[];
};
type Setup = {
  id: string;
  tahun: number;
  triwulan: number;
  rencanaKinerjas: RencanaKinerja[];
};

const YEAR_OPTIONS = [2024, 2025, 2026, 2027];

export default function SetupTriwulanClient({
  setup,
  tahun,
  triwulan,
  canCopyFromPrevious,
}: {
  setup: Setup;
  tahun: number;
  triwulan: number;
  canCopyFromPrevious: boolean;
}) {
  const router = useRouter();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [namaRK, setNamaRK] = useState("");
  const [ikiList, setIkiList] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const rkUtama = setup.rencanaKinerjas.filter((rk) => rk.jenis === "UTAMA");
  const rkTambahan = setup.rencanaKinerjas.filter(
    (rk) => rk.jenis === "TAMBAHAN"
  );

  function changePeriod(newTahun: number, newTriwulan: number) {
    router.push(`/setup-triwulan?tahun=${newTahun}&triwulan=${newTriwulan}`);
  }

  async function handleAddRK(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanedIki = ikiList.map((v) => v.trim()).filter(Boolean);
    if (!namaRK.trim()) {
      setError("Nama Rencana Kinerja wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/rencana-kinerja", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setupTriwulanId: setup.id,
          deskripsi: namaRK.trim(),
          ikis: cleanedIki,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message ?? "Gagal menyimpan RK Tambahan.");
        setIsSubmitting(false);
        return;
      }
      setNamaRK("");
      setIkiList([""]);
      setIsAddOpen(false);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteRK(id: string) {
    if (!confirm("Yakin ingin menghapus RK ini?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/rencana-kinerja/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.message ?? "RK tidak bisa dihapus.");
      } else {
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function handleCopyFromPrevious() {
    setIsCopying(true);
    try {
      const res = await fetch("/api/setup-triwulan/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tahun, triwulan }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.message ?? "Gagal menyalin data.");
      } else {
        router.refresh();
      }
    } finally {
      setIsCopying(false);
    }
  }

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-bold text-slate-900">Setup Triwulan</h1>
        <div className="flex gap-2">
          <select
            value={tahun}
            onChange={(e) => changePeriod(parseInt(e.target.value), triwulan)}
            className="rounded-lg border border-slate-300 text-slate-900 text-sm px-3 py-1.5"
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            value={triwulan}
            onChange={(e) => changePeriod(tahun, parseInt(e.target.value))}
            className="rounded-lg border border-slate-300 text-slate-900 text-sm px-3 py-1.5"
          >
            {[1, 2, 3, 4].map((t) => (
              <option key={t} value={t}>
                {TRIWULAN_LABEL[t]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {canCopyFromPrevious && (
          <button
            onClick={handleCopyFromPrevious}
            disabled={isCopying}
            className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {isCopying ? "Menyalin..." : "Salin dari triwulan lalu"}
          </button>
        )}
        <a
          href="/setup-triwulan/import"
          className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
        >
          Import SKP Tahunan
        </a>
      </div>

      {/* RK Utama */}
      <section className="mb-8">
        <p className="text-sm font-medium text-slate-600 mb-2">
          RK Utama{" "}
          <span className="text-slate-400 font-normal">
            (dari import, tidak bisa diubah)
          </span>
        </p>
        {rkUtama.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            Belum ada RK Utama. Import SKP Tahunan dulu untuk mengisi bagian
            ini.
          </div>
        ) : (
          <div className="space-y-2">
            {rkUtama.map((rk) => (
              <div
                key={rk.id}
                className="bg-white border border-slate-200 rounded-xl px-5 py-3.5"
              >
                <p className="text-sm font-medium text-slate-800">
                  {rk.deskripsi}
                </p>
                {rk.ikis.map((iki) => (
                  <p key={iki.id} className="text-xs text-slate-500 mt-1">
                    IKI: {iki.deskripsi}
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* RK Tambahan */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-slate-600">
            RK Tambahan{" "}
            <span className="text-slate-400 font-normal">
              (manual, bisa diedit)
            </span>
          </p>
          <button
            onClick={() => setIsAddOpen(true)}
            className="text-sm px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            + Tambah RK
          </button>
        </div>

        {rkTambahan.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            Belum ada RK Tambahan.
          </div>
        ) : (
          <div className="space-y-2">
            {rkTambahan.map((rk) => (
              <div
                key={rk.id}
                className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 flex items-start justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {rk.deskripsi}
                  </p>
                  {rk.ikis.map((iki) => (
                    <p key={iki.id} className="text-xs text-slate-500 mt-1">
                      IKI: {iki.deskripsi}
                    </p>
                  ))}
                </div>
                <button
                  onClick={() => handleDeleteRK(rk.id)}
                  disabled={deletingId === rk.id}
                  className="text-xs text-red-600 hover:underline disabled:opacity-50 shrink-0 ml-3"
                >
                  {deletingId === rk.id ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal tambah RK */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">
              Tambah RK Tambahan
            </h2>

            {error && (
              <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleAddRK} className="space-y-3">
              <div>
                <label className="block text-sm text-slate-700 mb-1">
                  Nama Rencana Kinerja
                </label>
                <input
                  type="text"
                  required
                  value={namaRK}
                  onChange={(e) => setNamaRK(e.target.value)}
                  placeholder="Contoh: Menjadi narasumber webinar"
                  className="w-full rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-1">
                  IKI (opsional, bisa lebih dari satu)
                </label>
                {ikiList.map((val, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={val}
                    onChange={(e) => {
                      const next = [...ikiList];
                      next[idx] = e.target.value;
                      setIkiList(next);
                    }}
                    placeholder="Contoh: Jumlah peserta hadir > 50"
                    className="w-full rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 px-3 py-2 text-sm mb-2"
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setIkiList([...ikiList, ""])}
                  className="text-xs text-blue-600 hover:underline"
                >
                  + Tambah IKI lain
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
