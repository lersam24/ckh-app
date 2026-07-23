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

type Tab = "kegiatan" | "rk" | "iki";

const TABS: { key: Tab; label: string }[] = [
  { key: "kegiatan", label: "Kegiatan Hari Ini" },
  { key: "rk", label: "Rencana Kegiatan (RK)" },
  { key: "iki", label: "Indikator Kinerja Individu (IKI)" },
];

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
  const [activeTab, setActiveTab] = useState<Tab>("kegiatan");

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

  return (
    <>
      <div className="bg-surface-container-lowest rounded-xl border border-surface-border shadow-sm overflow-hidden">
        {/* Tab Headers */}
        <div className="border-b border-surface-border flex overflow-x-auto hide-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-4 px-4 text-center text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.key
                  ? "text-primary border-primary bg-primary-fixed/30"
                  : "text-on-surface-variant hover:text-on-surface border-transparent hover:border-outline-variant"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-gutter-lg space-y-gutter-md">
          {activeTab === "kegiatan" && (
            <>
              {capaianHariIni.length === 0 && (
                <button
                  onClick={handleCopyFromYesterday}
                  disabled={isCopying}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant rounded-lg hover:bg-surface-container-low text-on-surface-variant transition-colors text-label-md disabled:opacity-60 mb-2"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    content_paste
                  </span>
                  {isCopying ? "Menyalin..." : "Salin dari Kemarin"}
                </button>
              )}
              <CapaianHarianList
                capaianHarian={capaianHariIni}
                rkList={rkList}
                tanggalDefault={tanggalDefault}
              />
            </>
          )}

          {activeTab === "rk" && (
            <div className="space-y-gutter-md">
              {rkList.length === 0 ? (
                <p className="text-on-surface-variant font-body-md text-sm py-4 text-center">
                  Belum ada rencana kinerja.{" "}
                  <a
                    href="/setup-triwulan"
                    className="text-primary hover:underline font-medium"
                  >
                    Setup sekarang
                  </a>
                </p>
              ) : (
                rkList.map((rk) => (
                  <div
                    key={rk.id}
                    className="border border-surface-border rounded-xl p-5 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="material-symbols-outlined text-[14px] text-primary">
                            {rk.jenis === "UTAMA" ? "push_pin" : "add_circle"}
                          </span>
                          <span className="text-label-sm text-on-surface-variant font-medium uppercase tracking-wider">
                            {rk.jenis === "UTAMA" ? "RK Utama" : "RK Tambahan"}
                          </span>
                          {rk.totalCapaian > 0 && (
                            <span className="text-label-sm text-outline ml-1">
                              · {rk.totalCapaian} catatan
                            </span>
                          )}
                        </div>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface">
                          {rk.deskripsi}
                        </h3>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-label-sm font-medium mb-1.5">
                        <span className="text-on-surface-variant">Progress</span>
                        <span className="text-primary">
                          {rk.progressRataRata}%
                        </span>
                      </div>
                      <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${rk.progressRataRata}%` }}
                        />
                      </div>
                    </div>

                    {rk.ikis.length > 0 && (
                      <div className="pt-3 border-t border-surface-border">
                        <div className="flex items-center gap-1.5 text-on-surface-variant font-body-md text-sm">
                          <span className="material-symbols-outlined text-[16px]">
                            checklist
                          </span>
                          <span>{rk.ikis.length} IKI terdaftar</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "iki" && (
            <div className="space-y-gutter-md">
              {rkList.filter((rk) => rk.ikis.length > 0).length === 0 ? (
                <p className="text-on-surface-variant font-body-md text-sm py-4 text-center">
                  Belum ada IKI.{" "}
                  <a
                    href="/setup-triwulan"
                    className="text-primary hover:underline font-medium"
                  >
                    Tambahkan IKI saat setup triwulan
                  </a>
                </p>
              ) : (
                rkList
                  .filter((rk) => rk.ikis.length > 0)
                  .map((rk) => (
                    <div
                      key={rk.id}
                      className="border border-surface-border rounded-xl p-5 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center gap-1.5 mb-3">
                        <span className="material-symbols-outlined text-[14px] text-primary">
                          {rk.jenis === "UTAMA" ? "push_pin" : "add_circle"}
                        </span>
                        <span className="text-label-sm text-on-surface-variant font-medium uppercase tracking-wider">
                          {rk.jenis === "UTAMA" ? "RK Utama" : "RK Tambahan"}
                        </span>
                        <span className="text-on-surface-variant mx-0.5">·</span>
                        <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                          {rk.deskripsi}
                        </span>
                      </div>
                      <ul className="space-y-2 ml-0.5">
                        {rk.ikis.map((iki) => (
                          <li
                            key={iki.id}
                            className="flex items-start gap-2 text-on-surface-variant font-body-md text-sm"
                          >
                            <span className="material-symbols-outlined text-[16px] text-primary mt-0.5 shrink-0">
                              check_circle
                            </span>
                            <span>{iki.deskripsi}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tombol Tambah Kegiatan */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full border-2 border-dashed border-primary-fixed rounded-xl p-8 hover:border-primary hover:bg-primary-fixed/20 transition-all group flex flex-col items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mt-6"
      >
        <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-[24px] font-bold">
            add
          </span>
        </div>
        <span className="text-lg font-semibold text-primary">
          Tambah Kegiatan Hari Ini
        </span>
        <span className="text-sm text-on-surface-variant mt-1">
          Klik untuk mencatat aktifitas baru Anda
        </span>
      </button>

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
