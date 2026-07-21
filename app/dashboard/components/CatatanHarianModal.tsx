"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type RencanaKinerja = {
  id: string;
  deskripsi: string;
  jenis: "UTAMA" | "TAMBAHAN";
  ikis: { id: string; deskripsi: string }[];
};

type CapaianHarian = {
  id: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  deskripsiKegiatan: string;
  progress: number;
  capaian: string;
  rencanaKinerja: { id: string; deskripsi: string; jenis: string };
  copiedFromId?: string | null;
};

export default function CatatanHarianModal({
  isOpen,
  onClose,
  rkList,
  initialData,
  tanggalDefault,
}: {
  isOpen: boolean;
  onClose: () => void;
  rkList: RencanaKinerja[];
  initialData?: CapaianHarian | null;
  tanggalDefault?: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rencanaKinerjaId, setRencanaKinerjaId] = useState("");
  const [tanggal, setTanggal] = useState(tanggalDefault ?? "");
  const [jamMulai, setJamMulai] = useState("08:00");
  const [jamSelesai, setJamSelesai] = useState("17:00");
  const [deskripsiKegiatan, setDeskripsiKegiatan] = useState("");
  const [progress, setProgress] = useState(50);
  const [capaian, setCapaian] = useState("");

  useEffect(() => {
    if (initialData) {
      setRencanaKinerjaId(initialData.rencanaKinerja.id);
      setTanggal(initialData.tanggal.slice(0, 10));
      setJamMulai(initialData.jamMulai.slice(11, 16));
      setJamSelesai(initialData.jamSelesai.slice(11, 16));
      setDeskripsiKegiatan(initialData.deskripsiKegiatan);
      setProgress(initialData.progress);
      setCapaian(initialData.capaian);
    } else {
      setRencanaKinerjaId(rkList[0]?.id ?? "");
      setTanggal(tanggalDefault ?? new Date().toISOString().slice(0, 10));
      setJamMulai("08:00");
      setJamSelesai("17:00");
      setDeskripsiKegiatan("");
      setProgress(50);
      setCapaian("");
    }
  }, [initialData, rkList, tanggalDefault]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!rencanaKinerjaId) {
      setError("Pilih Rencana Kinerja terlebih dahulu.");
      return;
    }
    if (!deskripsiKegiatan.trim()) {
      setError("Deskripsi kegiatan wajib diisi.");
      return;
    }
    if (!capaian.trim()) {
      setError("Capaian wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = initialData
        ? `/api/capaian-harian/${initialData.id}`
        : "/api/capaian-harian";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rencanaKinerjaId,
          tanggal,
          jamMulai,
          jamSelesai,
          deskripsiKegiatan,
          progress,
          capaian,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message ?? "Gagal menyimpan data.");
        setIsSubmitting(false);
        return;
      }

      onClose();
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-title-lg text-title-lg text-on-surface">
            {initialData ? "Edit Catatan Harian" : "Catat Kegiatan Hari Ini"}
          </h2>
          <button
            onClick={onClose}
            className="material-symbols-outlined text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
          >
            close
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-lg bg-error-container border border-error-container px-3 py-2 text-body-md text-on-error-container">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-body-md text-body-md text-on-surface mb-1">
              Rencana Kinerja
            </label>
            <select
              value={rencanaKinerjaId}
              onChange={(e) => setRencanaKinerjaId(e.target.value)}
              className="w-full rounded-lg border border-outline-variant text-on-surface text-sm px-3 py-2 bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">-- Pilih RK --</option>
              {rkList.map((rk) => (
                <option key={rk.id} value={rk.id}>
                  [{rk.jenis}] {rk.deskripsi}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-body-md text-body-md text-on-surface mb-1">
              Tanggal
            </label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full rounded-lg border border-outline-variant text-on-surface text-sm px-3 py-2 bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-body-md text-body-md text-on-surface mb-1">
                Jam Mulai
              </label>
              <input
                type="time"
                value={jamMulai}
                onChange={(e) => setJamMulai(e.target.value)}
                className="w-full rounded-lg border border-outline-variant text-on-surface text-sm px-3 py-2 bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block font-body-md text-body-md text-on-surface mb-1">
                Jam Selesai
              </label>
              <input
                type="time"
                value={jamSelesai}
                onChange={(e) => setJamSelesai(e.target.value)}
                className="w-full rounded-lg border border-outline-variant text-on-surface text-sm px-3 py-2 bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-body-md text-body-md text-on-surface mb-1">
              Deskripsi Kegiatan
            </label>
            <textarea
              value={deskripsiKegiatan}
              onChange={(e) => setDeskripsiKegiatan(e.target.value)}
              rows={3}
              placeholder="Apa yang Anda kerjakan hari ini?"
              className="w-full rounded-lg border border-outline-variant text-on-surface placeholder:text-on-surface-variant px-3 py-2 text-sm bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none resize-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-body-md text-body-md text-on-surface">
                Progress
              </label>
              <span className="font-label-md text-label-md text-primary font-bold">
                {progress}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-label-sm text-on-surface-variant mt-0.5">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <label className="block font-body-md text-body-md text-on-surface mb-1">
              Capaian
            </label>
            <textarea
              value={capaian}
              onChange={(e) => setCapaian(e.target.value)}
              rows={3}
              placeholder="Hasil atau capaian dari kegiatan ini..."
              className="w-full rounded-lg border border-outline-variant text-on-surface placeholder:text-on-surface-variant px-3 py-2 text-sm bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-label-md text-label-md rounded-lg border border-outline-variant text-primary hover:bg-surface-container-low transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 font-label-md text-label-md rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {isSubmitting
                ? "Menyimpan..."
                : initialData
                  ? "Perbarui"
                  : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
