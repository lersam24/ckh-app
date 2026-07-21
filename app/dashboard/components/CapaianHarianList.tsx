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

  return (
    <>
      <div className="flex flex-col gap-gutter-sm">
        {capaianHarian.length === 0 ? (
          <div className="text-center py-8 text-on-surface-variant font-body-md">
            Belum ada catatan hari ini. Klik tombol + untuk mencatat kegiatan.
          </div>
        ) : (
          capaianHarian.map((item) => (
            <div
              key={item.id}
              className="bg-surface-container-lowest border border-surface-border rounded-lg p-gutter-md"
            >
              <div className="flex flex-col md:flex-row gap-gutter-md justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
                      {item.rencanaKinerja.jenis === "UTAMA" ? "RK Utama" : "RK Tambahan"}
                    </span>
                    <span className="mx-1 opacity-30">·</span>
                    <span className="text-label-md text-on-surface-variant">
                      {formatJam(item.jamMulai)}–{formatJam(item.jamSelesai)}
                    </span>
                    <span className="mx-1 opacity-30">·</span>
                    <span className="text-label-md text-on-surface-variant">
                      {hitungDurasi(item.jamMulai, item.jamSelesai)}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">
                    {item.rencanaKinerja.deskripsi}
                  </h3>
                  <p className="text-on-surface-variant font-body-md text-sm mb-3 line-clamp-2">
                    {item.deskripsiKegiatan}
                  </p>

                  <div className="mb-3">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-label-md text-on-surface-variant">Progress</span>
                      <span className="text-label-md font-bold text-primary">{item.progress}%</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>

                  {item.capaian && (
                    <p className="text-body-md text-on-surface-variant text-sm">
                      <span className="font-medium text-on-surface">Capaian:</span> {item.capaian}
                    </p>
                  )}
                </div>

                <div className="flex md:flex-col gap-2 justify-end shrink-0">
                  <button
                    onClick={() => setEditData(item)}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 border border-outline-variant rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors text-label-md"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 border border-outline-variant rounded-lg hover:bg-error-container text-on-surface-variant hover:text-on-error-container transition-colors text-label-md disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
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

      <button
        onClick={() => {
          setEditData(null);
          setIsModalOpen(true);
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center md:hidden active:scale-90 transition-transform z-40"
      >
        <span className="material-symbols-outlined font-bold">add</span>
      </button>
    </>
  );
}
