"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CatatanHarianModal from "./CatatanHarianModal";

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
};

export default function CapaianHarianList({
  capaianHarian,
  rkList,
  tanggalDefault,
}: {
  capaianHarian: CapaianHarian[];
  rkList: RencanaKinerja[];
  tanggalDefault: string;
}) {
  const router = useRouter();
  const [editData, setEditData] = useState<CapaianHarian | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copyingId, setCopyingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus catatan ini?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/capaian-harian/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.message ?? "Gagal menghapus.");
      } else {
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function handleCopyEntry(item: CapaianHarian) {
    setCopyingId(item.id);
    try {
      const res = await fetch("/api/capaian-harian", {
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
      if (!res.ok) {
        alert("Gagal menyalin catatan.");
      } else {
        router.refresh();
      }
    } finally {
      setCopyingId(null);
    }
  }

  function formatJam(dateStr: string) {
    return dateStr.slice(11, 16);
  }

  function hitungDurasi(jamMulai: string, jamSelesai: string) {
    const mulai = new Date(`1970-01-01T${jamMulai.slice(11)}`);
    const selesai = new Date(`1970-01-01T${jamSelesai.slice(11)}`);
    const diffMs = selesai.getTime() - mulai.getTime();
    const jam = Math.floor(diffMs / 3600000);
    const menit = Math.floor((diffMs % 3600000) / 60000);
    if (jam > 0 && menit > 0) return `${jam}j ${menit}m`;
    if (jam > 0) return `${jam}j`;
    return `${menit}m`;
  }

  const isSelesai = (item: CapaianHarian) => item.progress >= 100;

  return (
    <>
      <div className="space-y-gutter-md">
        {capaianHarian.length === 0 ? (
          <div className="text-center py-10 text-on-surface-variant font-body-md">
            Belum ada catatan hari ini. Klik tombol di bawah untuk mencatat
            kegiatan.
          </div>
        ) : (
          capaianHarian.map((item) => (
            <div
              key={item.id}
              className="border border-surface-border rounded-xl p-5 hover:border-primary/40 transition-colors group"
            >
              {/* Top Info */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center text-label-sm text-on-surface-variant font-medium mb-1.5 gap-1.5">
                    <span
                      className={`material-symbols-outlined text-[14px] ${
                        isSelesai(item)
                          ? "text-tertiary"
                          : "text-primary"
                      }`}
                      style={{ fontVariationSettings: '"FILL" 1' }}
                    >
                      {isSelesai(item) ? "check_circle" : "push_pin"}
                    </span>
                    <span>
                      {formatJam(item.jamMulai)} — {formatJam(item.jamSelesai)}
                    </span>
                    <span className="opacity-30">·</span>
                    <span>{hitungDurasi(item.jamMulai, item.jamSelesai)}</span>
                  </div>
                  <h3 className="text-base font-semibold text-on-surface">
                    {item.rencanaKinerja.deskripsi}
                  </h3>
                  <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">
                    {item.deskripsiKegiatan}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 shrink-0 ml-3">
                  <button
                    onClick={() => handleCopyEntry(item)}
                    disabled={copyingId === item.id}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-surface-border rounded-md text-xs font-medium text-on-surface-variant bg-surface-container-lowest hover:bg-surface-container-low transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      content_copy
                    </span>
                    {copyingId === item.id ? "..." : "Salin"}
                  </button>
                  <button
                    onClick={() => setEditData(item)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-surface-border rounded-md text-xs font-medium text-on-surface-variant bg-surface-container-lowest hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      edit
                    </span>
                    Edit
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="my-4">
                <div className="flex justify-between text-label-sm font-medium mb-1.5">
                  <span className="text-on-surface-variant">Progress</span>
                  <span
                    className={
                      isSelesai(item) ? "text-tertiary" : "text-primary"
                    }
                  >
                    {item.progress}
                    {isSelesai(item) ? "% Selesai" : "%"}
                  </span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isSelesai(item) ? "bg-tertiary" : "bg-primary"
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>

              {/* Bottom: Capaian + Hapus */}
              <div className="flex justify-between items-center pt-3 border-t border-surface-border mt-3">
                <div className="min-w-0 flex-1">
                  {item.capaian && (
                    <p className="text-sm text-on-surface-variant truncate">
                      <span className="font-medium text-on-surface">
                        Capaian:
                      </span>{" "}
                      {item.capaian}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-error-container rounded-md text-xs font-medium text-error bg-error-container/30 hover:bg-error-container/60 transition-colors shrink-0 ml-3 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    delete
                  </span>
                  {deletingId === item.id ? "..." : "Hapus"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <CatatanHarianModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditData(null);
          }}
          rkList={rkList}
          initialData={editData}
          tanggalDefault={tanggalDefault}
        />
      )}

      {editData && !isModalOpen && (
        <CatatanHarianModal
          isOpen={true}
          onClose={() => setEditData(null)}
          rkList={rkList}
          initialData={editData}
          tanggalDefault={tanggalDefault}
        />
      )}
    </>
  );
}
