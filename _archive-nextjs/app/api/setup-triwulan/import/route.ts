import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

type ParsedRK = {
  deskripsi: string;
  ikis: string[];
};

function getRow(raw: unknown[], i: number): string[] {
  const row = raw[i];
  if (row === undefined) return [];
  return Array.isArray(row)
    ? row.map((v) => String(v ?? ""))
    : Object.values(row as Record<string, unknown>).map((v) => String(v ?? ""));
}

const BULLET_RE = /^[•\-*·●○▪]\s*/;
const MARKER_TEXT_RE = /ukuran\s*keberhasilan/i;

function firstNonEmptyCell(row: string[]): { col: number; value: string } | null {
  for (let c = 0; c < row.length; c++) {
    const v = (row[c] ?? "").trim();
    if (v) return { col: c, value: v };
  }
  return null;
}

/**
 * Parser untuk format resmi "Penetapan SKP" (export dari e-kinerja/KipApp),
 * yaitu dokumen dengan struktur:
 *   Baris section: "A. Utama"
 *   Baris No=1 + deskripsi RK ke-1 (di kolom berikutnya)
 *   Baris berisi teks "Ukuran keberhasilan/ indikator kinerja individu dan Target:\n• IKI 1\n• IKI 2\n..."
 *   Baris No=2 + deskripsi RK ke-2
 *   ...dst, sampai bertemu section "B. Tambahan" (Perilaku Kerja, bukan RK).
 *
 * Dibuat cukup longgar (mencari marker section di kolom manapun, menerima
 * beberapa gaya bullet) supaya tetap tahan terhadap variasi kecil pada
 * template export dari berbagai instansi/versi aplikasi.
 */
function parseSkpPenetapanFormat(raw: unknown[]): ParsedRK[] {
  let startIdx = -1;
  let endIdx = raw.length;

  for (let i = 0; i < raw.length; i++) {
    const row = getRow(raw, i);
    const first = firstNonEmptyCell(row);
    const text = first?.value.toLowerCase() ?? "";
    if (startIdx === -1 && /^a\.?\s*utama\b/.test(text)) {
      startIdx = i + 1;
      continue;
    }
    if (startIdx !== -1 && /^b\.?\s*tambahan\b/.test(text)) {
      endIdx = i;
      break;
    }
  }

  if (startIdx === -1) {
    console.warn("IMPORT_SKP_PARSER: marker 'A. Utama' tidak ditemukan, fallback ke parser generik.");
    return [];
  }

  const result: ParsedRK[] = [];
  let current: ParsedRK | null = null;

  for (let i = startIdx; i < endIdx; i++) {
    const row = getRow(raw, i);
    const cells = row.map((v) => v.trim());
    const nonEmpty = cells
      .map((v, c) => ({ col: c, value: v }))
      .filter((c) => c.value !== "");

    if (nonEmpty.length === 0) continue;

    const fullText = nonEmpty.map((c) => c.value).join(" ");

    // Baris IKI: mengandung teks penanda "Ukuran keberhasilan..."
    if (MARKER_TEXT_RE.test(fullText) && current) {
      // Ambil sel yang mengandung marker (biasanya satu sel berisi banyak baris \n)
      const markerCell = nonEmpty.find((c) => MARKER_TEXT_RE.test(c.value));
      const blockText = markerCell ? markerCell.value : fullText;
      const lines = blockText.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || MARKER_TEXT_RE.test(trimmed)) continue;
        const iki = BULLET_RE.test(trimmed)
          ? trimmed.replace(BULLET_RE, "").trim()
          : trimmed;
        if (iki && !current.ikis.includes(iki)) {
          current.ikis.push(iki);
        }
      }
      continue;
    }

    // Baris RK baru: sel pertama berupa nomor urut (1, 2, 3, ... atau "1.")
    // diikuti sel lain berisi deskripsi.
    const numMatch = nonEmpty[0].value.match(/^(\d{1,3})\.?$/);
    if (numMatch && nonEmpty.length > 1) {
      const deskripsi = nonEmpty
        .slice(1)
        .map((c) => c.value)
        .join(" ")
        .trim();
      if (deskripsi && !MARKER_TEXT_RE.test(deskripsi)) {
        current = { deskripsi, ikis: [] };
        result.push(current);
        continue;
      }
    }
  }

  return result.filter((rk) => rk.deskripsi);
}

function parseGenericTableFormat(raw: unknown[]): ParsedRK[] {
  if (raw.length === 0) return [];

  const headerRow = raw[0];
  const headerMap: Record<number, string> = {};
  const headers = Array.isArray(headerRow)
    ? headerRow.map(String)
    : Object.values(headerRow as Record<string, unknown>).map(String);

  headers.forEach((h, i) => {
    const lower = String(h).toLowerCase().trim();
    if (
      lower.includes("rencana kinerja") ||
      lower.includes("rk") ||
      lower.includes("kegiatan")
    ) {
      headerMap[i] = "rk";
    } else if (
      lower.includes("iki") ||
      lower.includes("indikator") ||
      lower.includes("target")
    ) {
      headerMap[i] = "iki";
    }
  });

  let rkCol = -1;
  let ikiCol = -1;

  if (Object.keys(headerMap).length > 0) {
    for (const [idx, type] of Object.entries(headerMap)) {
      if (type === "rk" && rkCol === -1) rkCol = Number(idx);
      if (type === "iki" && ikiCol === -1) ikiCol = Number(idx);
    }
  } else {
    rkCol = 1;
    ikiCol = 2;
  }

  if (rkCol === -1) rkCol = 1;
  if (ikiCol === -1) ikiCol = 2;

  const rkMap = new Map<string, ParsedRK>();
  let currentRk = "";

  for (let i = 1; i < raw.length; i++) {
    const row = raw[i];
    const rowData = Array.isArray(row)
      ? row.map(String)
      : Object.values(row as Record<string, unknown>).map(String);

    const rkValue = String(rowData[rkCol] ?? "").trim();
    const ikiValue = String(rowData[ikiCol] ?? "").trim();

    if (rkValue) {
      currentRk = rkValue;
      if (!rkMap.has(currentRk)) {
        rkMap.set(currentRk, { deskripsi: currentRk, ikis: [] });
      }
    }

    if (ikiValue && currentRk) {
      const existing = rkMap.get(currentRk);
      if (existing && !existing.ikis.includes(ikiValue)) {
        existing.ikis.push(ikiValue);
      }
    }
  }

  return Array.from(rkMap.values());
}

function parseExcelFile(buffer: Buffer): ParsedRK[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    header: 1,
    defval: "",
  });

  if (raw.length === 0) return [];

  // Coba parser format resmi "Penetapan SKP" (A. Utama / B. Tambahan) dulu.
  const structured = parseSkpPenetapanFormat(raw);
  if (structured.length > 0) return structured;

  // Fallback: format tabel sederhana (header "Rencana Kinerja" / "IKI").
  return parseGenericTableFormat(raw);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const tahun = Number(formData.get("tahun"));
    const triwulan = Number(formData.get("triwulan"));
    const confirm = formData.get("confirm") === "true";

    if (!file) {
      return NextResponse.json(
        { message: "File tidak ditemukan." },
        { status: 400 }
      );
    }

    if (!tahun || !triwulan || triwulan < 1 || triwulan > 4) {
      return NextResponse.json(
        { message: "Tahun dan triwulan tidak valid." },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "xlsx" && ext !== "xls" && ext !== "csv") {
      return NextResponse.json(
        { message: "Format file tidak didukung. Gunakan .xlsx, .xls, atau .csv" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const parsed = parseExcelFile(buffer);

    if (parsed.length === 0) {
      return NextResponse.json(
        { message: "Tidak ada Rencana Kinerja yang ditemukan dalam file." },
        { status: 400 }
      );
    }

    if (!confirm) {
      return NextResponse.json({
        preview: true,
        data: parsed,
        totalRK: parsed.length,
        totalIKI: parsed.reduce((sum, rk) => sum + rk.ikis.length, 0),
      });
    }

    const setup = await prisma.setupTriwulan.upsert({
      where: {
        userId_tahun_triwulan: { userId, tahun, triwulan },
      },
      create: { userId, tahun, triwulan },
      update: {},
    });

    const existingUtama = await prisma.rencanaKinerja.findMany({
      where: { setupTriwulanId: setup.id, jenis: "UTAMA" },
      select: { id: true },
    });

    if (existingUtama.length > 0) {
      await prisma.rencanaKinerja.deleteMany({
        where: { id: { in: existingUtama.map((r) => r.id) } },
      });
    }

    const allExistingRk = await prisma.rencanaKinerja.findMany({
      where: { setupTriwulanId: setup.id },
      select: { urutan: true },
    });
    const maxUrutan = allExistingRk.reduce(
      (max, rk) => Math.max(max, rk.urutan ?? 0),
      0
    );

    for (let i = 0; i < parsed.length; i++) {
      const rk = parsed[i];
      await prisma.rencanaKinerja.create({
        data: {
          setupTriwulanId: setup.id,
          deskripsi: rk.deskripsi,
          jenis: "UTAMA",
          dariImport: true,
          urutan: maxUrutan + i + 1,
          ikis: {
            create: rk.ikis.map((deskripsi) => ({ deskripsi })),
          },
        },
      });
    }

    await prisma.skpTahunanImport.upsert({
      where: { userId_tahun: { userId, tahun } },
      create: { userId, tahun, namaFile: file.name },
      update: { namaFile: file.name },
    });

    return NextResponse.json({
      preview: false,
      message: `Berhasil import ${parsed.length} Rencana Kinerja Utama.`,
      totalRK: parsed.length,
    });
  } catch (err) {
    console.error("IMPORT_SKP_ERROR", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memproses file." },
      { status: 500 }
    );
  }
}
