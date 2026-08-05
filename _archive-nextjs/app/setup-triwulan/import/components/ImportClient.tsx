"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { TRIWULAN_LABEL } from "@/lib/current-triwulan";

type ParsedRK = {
  deskripsi: string;
  ikis: string[];
};

const YEAR_OPTIONS = [2024, 2025, 2026, 2027];

export default function ImportClient({
  tahun,
  triwulan,
}: {
  tahun: number;
  triwulan: number;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ParsedRK[] | null>(null);
  const [totalRK, setTotalRK] = useState(0);
  const [totalIKI, setTotalIKI] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [importTahun, setImportTahun] = useState(tahun);
  const [importTriwulan, setImportTriwulan] = useState(triwulan);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewData(null);
      setError(null);
      setSuccess(null);
    }
  }

  async function handlePreview() {
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("tahun", String(importTahun));
      formData.append("triwulan", String(importTriwulan));

      const res = await fetch("/api/setup-triwulan/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message ?? "Gagal memproses file.");
        setIsUploading(false);
        return;
      }

      setPreviewData(data.data);
      setTotalRK(data.totalRK);
      setTotalIKI(data.totalIKI);
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleConfirmImport() {
    if (!selectedFile) return;
    setIsImporting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("tahun", String(importTahun));
      formData.append("triwulan", String(importTriwulan));
      formData.append("confirm", "true");

      const res = await fetch("/api/setup-triwulan/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message ?? "Gagal import.");
        setIsImporting(false);
        return;
      }

      setSuccess(data.message);
      setPreviewData(null);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      setTimeout(() => router.refresh(), 1500);
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="space-y-gutter-lg">
      <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-gutter-lg">
        <h3 className="font-title-lg text-title-lg text-on-surface mb-gutter-md">
          Upload File SKP Tahunan
        </h3>
        <p className="font-body-md text-on-surface-variant mb-gutter-md">
          Upload file Excel (.xlsx, .xls) atau CSV dari aplikasi KipApp yang
          berisi daftar Rencana Kinerja Utama dan IKI.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-gutter-md">
          <div>
            <label className="block font-body-md text-body-md text-on-surface mb-1">
              Tahun
            </label>
            <select
              value={importTahun}
              onChange={(e) => setImportTahun(Number(e.target.value))}
              className="w-full rounded-lg border border-outline-variant text-on-surface text-sm px-3 py-2 bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none"
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-body-md text-body-md text-on-surface mb-1">
              Triwulan
            </label>
            <select
              value={importTriwulan}
              onChange={(e) => setImportTriwulan(Number(e.target.value))}
              className="w-full rounded-lg border border-outline-variant text-on-surface text-sm px-3 py-2 bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none"
            >
              {[1, 2, 3, 4].map((t) => (
                <option key={t} value={t}>
                  {TRIWULAN_LABEL[t]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-outline-variant rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-surface-container-low transition-all"
        >
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-2 block">
            upload_file
          </span>
          {selectedFile ? (
            <div>
              <p className="font-body-md text-on-surface font-medium">
                {selectedFile.name}
              </p>
              <p className="text-label-md text-on-surface-variant mt-1">
                {(selectedFile.size / 1024).toFixed(1)} KB — Klik untuk ganti
                file
              </p>
            </div>
          ) : (
            <div>
              <p className="font-body-md text-on-surface">
                Klik untuk memilih file atau seret file ke sini
              </p>
              <p className="text-label-md text-on-surface-variant mt-1">
                Mendukung format .xlsx, .xls, .csv
              </p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />

        {error && (
          <div className="mt-3 rounded-lg bg-error-container border border-error-container px-3 py-2 text-body-md text-on-error-container">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-3 rounded-lg bg-tertiary-container border border-tertiary-container px-3 py-2 text-body-md text-on-tertiary">
            {success}
          </div>
        )}

        {selectedFile && !previewData && (
          <button
            onClick={handlePreview}
            disabled={isUploading}
            className="mt-4 w-full px-4 py-2.5 font-label-md text-label-md rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {isUploading ? "Memproses..." : "Preview Data"}
          </button>
        )}
      </div>

      {previewData && (
        <div className="bg-surface-container-lowest rounded-xl border border-surface-border overflow-hidden">
          <div className="p-gutter-lg border-b border-surface-border bg-surface-container-low">
            <div className="flex items-center justify-between">
              <h3 className="font-title-lg text-title-lg text-on-surface">
                Preview Import
              </h3>
              <div className="flex gap-3">
                <span className="font-label-md text-label-md text-on-surface-variant">
                  {totalRK} RK
                </span>
                <span className="font-label-md text-label-md text-on-surface-variant">
                  {totalIKI} IKI
                </span>
              </div>
            </div>
            <p className="text-label-md text-on-surface-variant mt-1">
              Berikut data yang akan diimport sebagai RK Utama. RK Utama lama
              untuk triwulan ini akan diganti.
            </p>
          </div>

          <div className="p-gutter-lg max-h-[400px] overflow-y-auto space-y-3">
            {previewData.map((rk, idx) => (
              <div
                key={idx}
                className="bg-surface-container-low border border-surface-border rounded-lg p-gutter-md"
              >
                <div className="flex items-start gap-2">
                  <span className="font-label-md text-label-md text-on-surface-variant bg-surface-container px-2 py-0.5 rounded shrink-0">
                    #{idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-body-md text-body-md font-medium text-on-surface">
                      {rk.deskripsi}
                    </p>
                    {rk.ikis.length > 0 && (
                      <div className="mt-1.5 space-y-0.5">
                        {rk.ikis.map((iki, ikiIdx) => (
                          <p
                            key={ikiIdx}
                            className="text-sm text-on-surface-variant flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              check_circle
                            </span>
                            IKI: {iki}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-gutter-lg border-t border-surface-border flex gap-2">
            <button
              onClick={() => {
                setPreviewData(null);
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="flex-1 px-4 py-2.5 font-label-md text-label-md rounded-lg border border-outline-variant text-primary hover:bg-surface-container-low transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={isImporting}
              className="flex-1 px-4 py-2.5 font-label-md text-label-md rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {isImporting
                ? "Mengimport..."
                : `Import ${totalRK} Rencana Kinerja`}
            </button>
          </div>
        </div>
      )}

      <a
        href="/setup-triwulan"
        className="inline-flex items-center gap-2 font-label-md text-label-md text-primary hover:underline"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Kembali ke Setup Triwulan
      </a>
    </div>
  );
}
