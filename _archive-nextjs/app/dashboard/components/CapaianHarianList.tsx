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

  const isSelesai = (item: CapaianHarian) => item.progress >= 100;

  return (
    <>
      <div className="flex flex-col gap-gutter-md">
        {capaianHarian.length === 0 ? (
          <div className="text-center py-10 text-on-surface-variant font-body-md">
            Belum ada catatan hari ini. Klik tombol di bawah untuk mencatat
            kegiatan.
          </div>
        ) : (
          capaianHarian.map((item) => (
            <div
              key={item.id}
              className="activity-card bg-surface-container-lowest border border-surface-border rounded-lg p-gutter-md"
            >
              <div className="flex flex-col md:flex-row gap-gutter-md justify-between">
                <div className="flex-1">
                  {/* Icon + Time */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        isSelesai(item) ? "text-tertiary" : "text-primary"
                      }`}
                      style={{ fontVariationSettings: '"FILL" 1' }}
                    >
                      {isSelesai(item) ? "check_circle" : "push_pin"}
                    </span>
                    <span className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
                      {formatJam(item.jamMulai)} — {formatJam(item.jamSelesai)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">
                    {item.rencanaKinerja.deskripsi}
                  </h3>

                  {/* Description */}
                  <p className="text-on-surface-variant font-body-md mb-4">
                    {item.deskripsiKegiatan}
                  </p>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-label-md text-on-surface-variant">
                        Progress
                      </span>
                      <span
                        className={`text-label-md font-bold ${
                          isSelesai(item) ? "text-tertiary" : "text-primary"
                        }`}
                      >
                        {item.progress}
                        {isSelesai(item) ? "% Selesai" : "%"}
                      </span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isSelesai(item) ? "bg-tertiary" : "bg-primary"
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Capaian */}
                  {item.capaian && (
                    <p className="text-on-surface-variant font-body-md text-sm mb-2">
                      <span className="font-medium text-on-surface">
                        Capaian:
                      </span>{" "}
                      {item.capaian}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex md:flex-col gap-2 justify-end shrink-0">
                  <button
                    onClick={() => handleCopyEntry(item)}
                    disabled={copyingId === item.id}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 border border-outline-variant rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors text-label-md disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      content_copy
                    </span>
                    {copyingId === item.id ? "..." : "Salin"}
                  </button>
                  <button
                    onClick={() => setEditData(item)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 border border-outline-variant rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors text-label-md"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      edit
                    </span>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 border border-error-container rounded-lg hover:bg-error-container/20 text-error transition-colors text-label-md disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      delete
                    </span>
                    {deletingId === item.id ? "..." : "Hapus"}
                  </button>
                </div>
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
