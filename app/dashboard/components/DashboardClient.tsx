"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CatatanHarianModal from "./CatatanHarianModal";
import CapaianHarianList from "./CapaianHarianList";

type RencanaKinerja = {
  id: string;
  deskripsi: string;
  jenis: "UTAMA" | "TAMBAHAN";
  dariImport: boolean;
  urutan: number | null;
  ikis: { id: string; deskripsi: string }[];
  progressRataRata: number;
  totalCapaian: number;
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
};

export default function DashboardClient({
  rkList,
  capaianHariIni,
  tanggalDefault,
  totalHariAktif,
  totalHariKerja,
  rataRataProgress,
}: {
  rkList: RencanaKinerja[];
  capaianHariIni: CapaianHarian[];
  tanggalDefault: string;
  totalHariAktif: number;
  totalHariKerja: number;
  rataRataProgress: number;
}) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  async function handleCopyFromYesterday() {
    setIsCopying(true);
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().slice(0, 10);

      const res = await fetch(`/api/capaian-harian?tanggal=${yStr}`);
      if (!res.ok) return;
      const { data } = await res.json();

      if (!data || data.length === 0) {
        alert("Tidak ada catatan kemarin untuk disalin.");
        setIsCopying(false);
        return;
      }

      for (const item of data) {
        await fetch("/api/capaian-harian", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rencanaKinerjaId: item.rencanaKinerja.id,
            tanggal: tanggalDefault,
            jamMulai: item.jamMulai.slice(11, 16),
            jamSelesai: item.jamSelesai.slice(11, 16),
            deskripsiKegiatan: item.deskripsiKegiatan,
            progress: item.progress,
            capaian: item.capaian,
            copiedFromId: item.id,
          }),
        });
      }

      router.refresh();
    } catch {
      alert("Gagal menyalin catatan kemarin.");
    } finally {
      setIsCopying(false);
    }
  }

  const persentaseHariAktif =
    totalHariKerja > 0
      ? Math.round((totalHariAktif / totalHariKerja) * 100)
      : 0;

  return (
    <>
      <div className="flex flex-col gap-gutter-lg">
        <div className="bg-surface-container-lowest rounded-xl border border-surface-border overflow-hidden">
          <div className="p-gutter-lg border-b border-surface-border bg-surface-container-low flex justify-between items-center">
            <h2 className="font-title-lg text-title-lg text-on-surface">
              Kegiatan Hari Ini
            </h2>
            <div className="flex items-center gap-2">
              {capaianHariIni.length === 0 && (
                <button
                  onClick={handleCopyFromYesterday}
                  disabled={isCopying}
                  className="flex items-center gap-1 px-3 py-1.5 border border-outline-variant rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors text-label-md disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    content_paste
                  </span>
                  {isCopying ? "Menyalin..." : "Salin dari Kemarin"}
                </button>
              )}
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity text-label-md"
              >
                <span className="material-symbols-outlined text-[16px]">
                  add
                </span>
                Catat Kegiatan
              </button>
            </div>
          </div>
          <div className="p-gutter-lg">
            <CapaianHarianList
              capaianHarian={capaianHariIni}
              rkList={rkList}
              tanggalDefault={tanggalDefault}
            />
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-gutter-lg">
          <h3 className="font-title-lg text-title-lg text-on-surface mb-gutter-md">
            Rencana Kinerja Aktif
          </h3>
          <div className="space-y-gutter-sm">
            {rkList.length === 0 ? (
              <p className="text-on-surface-variant font-body-md text-sm">
                Belum ada rencana kinerja.{' '}
                <a href="/setup-triwulan" className="text-primary hover:underline">
                  Setup sekarang
                </a>
              </p>
            ) : (
              rkList.map((rk) => (
                <div
                  key={rk.id}
                  className="bg-surface-container-lowest border border-surface-border rounded-lg p-gutter-md"
                >
                  <div className="flex flex-col md:flex-row gap-gutter-md justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
                          {rk.jenis === "UTAMA" ? "RK Utama" : "RK Tambahan"}
                        </span>
                        {rk.totalCapaian > 0 && (
                          <>
                            <span className="mx-1 opacity-30">·</span>
                            <span className="text-label-md text-on-surface-variant">
                              {rk.totalCapaian} catatan
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 truncate">
                        {rk.deskripsi}
                      </h3>
                      {rk.ikis.length > 0 && (
                        <div className="flex items-center gap-1 text-on-surface-variant font-body-md text-sm truncate max-w-xs">
                          <span className="material-symbols-outlined text-[16px]">
                            checklist
                          </span>
                          <span>{rk.ikis.length} IKI terdaftar</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-label-md font-bold text-primary">
                        {rk.progressRataRata}%
                      </span>
                      <div className="w-20 bg-surface-container-high h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all"
                          style={{ width: `${rk.progressRataRata}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <CatatanHarianModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            router.refresh();
          }}
          rkList={rkList}
          tanggalDefault={tanggalDefault}
        />
      )}

      <div className="hidden md:flex fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined font-bold">add</span>
        </button>
      </div>
    </>
  );
}
