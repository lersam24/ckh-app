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
    <main className="max-w-container-max mx-auto px-margin-lg py-gutter-lg w-full">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Setup Triwulan</h1>
        <div className="flex gap-2">
          <select
            value={tahun}
            onChange={(e) => changePeriod(parseInt(e.target.value), triwulan)}
            className="rounded-lg border border-outline-variant text-on-surface text-sm px-3 py-1.5 bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none"
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
            className="rounded-lg border border-outline-variant text-on-surface text-sm px-3 py-1.5 bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none"
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
            className="font-label-md text-label-md px-3 py-1.5 rounded-lg border border-outline-variant text-primary hover:bg-surface-container-low transition-colors disabled:opacity-60"
          >
            {isCopying ? "Menyalin..." : "Salin dari triwulan lalu"}
          </button>
        )}
        <a
          href="/setup-triwulan/import"
          className="font-label-md text-label-md px-3 py-1.5 rounded-lg border border-outline-variant text-primary hover:bg-surface-container-low transition-colors"
        >
          Import SKP Tahunan
        </a>
      </div>

      <section className="mb-8">
        <p className="font-body-md text-body-md font-medium text-on-surface mb-2">
          RK Utama{" "}
          <span className="text-on-surface-variant font-normal">
            (dari import, tidak bisa diubah)
          </span>
        </p>
        {rkUtama.length === 0 ? (
          <div className="rounded-xl border border-dashed border-outline-variant p-6 text-center text-body-md text-on-surface-variant">
            Belum ada RK Utama. Import SKP Tahunan dulu untuk mengisi bagian
            ini.
          </div>
        ) : (
          <div className="space-y-2">
            {rkUtama.map((rk) => (
              <div
                key={rk.id}
                className="bg-surface-container-lowest border border-surface-border rounded-xl px-5 py-3.5"
              >
                <p className="font-body-md text-body-md font-medium text-on-surface">
                  {rk.deskripsi}
                </p>
                {rk.ikis.map((iki) => (
                  <p key={iki.id} className="font-body-md text-sm text-on-surface-variant mt-1">
                    IKI: {iki.deskripsi}
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <p className="font-body-md text-body-md font-medium text-on-surface">
            RK Tambahan{" "}
            <span className="text-on-surface-variant font-normal">
              (manual, bisa diedit)
            </span>
          </p>
          <button
            onClick={() => setIsAddOpen(true)}
            className="font-label-md text-label-md px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity"
          >
            + Tambah RK
          </button>
        </div>

        {rkTambahan.length === 0 ? (
          <div className="rounded-xl border border-dashed border-outline-variant p-6 text-center text-body-md text-on-surface-variant">
            Belum ada RK Tambahan.
          </div>
        ) : (
          <div className="space-y-2">
            {rkTambahan.map((rk) => (
              <div
                key={rk.id}
                className="bg-surface-container-lowest border border-surface-border rounded-xl px-5 py-3.5 flex items-start justify-between"
              >
                <div>
                  <p className="font-body-md text-body-md font-medium text-on-surface">
                    {rk.deskripsi}
                  </p>
                  {rk.ikis.map((iki) => (
                    <p key={iki.id} className="font-body-md text-sm text-on-surface-variant mt-1">
                      IKI: {iki.deskripsi}
                    </p>
                  ))}
                </div>
                <button
                  onClick={() => handleDeleteRK(rk.id)}
                  disabled={deletingId === rk.id}
                  className="font-label-md text-label-md text-error hover:underline disabled:opacity-50 shrink-0 ml-3"
                >
                  {deletingId === rk.id ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {isAddOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md p-6">
            <h2 className="font-title-lg text-title-lg text-on-surface mb-4">
              Tambah RK Tambahan
            </h2>

            {error && (
              <div className="mb-3 rounded-lg bg-error-container border border-error-container px-3 py-2 text-body-md text-on-error-container">
                {error}
              </div>
            )}

            <form onSubmit={handleAddRK} className="space-y-3">
              <div>
                <label className="block font-body-md text-body-md text-on-surface mb-1">
                  Nama Rencana Kinerja
                </label>
                <input
                  type="text"
                  required
                  value={namaRK}
                  onChange={(e) => setNamaRK(e.target.value)}
                  placeholder="Contoh: Menjadi narasumber webinar"
                  className="w-full rounded-lg border border-outline-variant text-on-surface placeholder:text-on-surface-variant px-3 py-2 text-sm bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-body-md text-body-md text-on-surface mb-1">
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
                    className="w-full rounded-lg border border-outline-variant text-on-surface placeholder:text-on-surface-variant px-3 py-2 text-sm mb-2 bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none"
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setIkiList([...ikiList, ""])}
                  className="font-label-md text-label-md text-primary hover:underline"
                >
                  + Tambah IKI lain
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 font-label-md text-label-md rounded-lg border border-outline-variant text-primary hover:bg-surface-container-low transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 font-label-md text-label-md rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity disabled:opacity-60"
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
