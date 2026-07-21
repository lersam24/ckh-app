import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  const { searchParams } = new URL(req.url);
  const tanggal = searchParams.get("tanggal");
  const bulan = searchParams.get("bulan");
  const rencanaKinerjaId = searchParams.get("rencanaKinerjaId");

  try {
    const where: Record<string, unknown> = { userId };

    if (tanggal) {
      const date = new Date(tanggal);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.tanggal = { gte: startOfDay, lte: endOfDay };
    } else if (bulan) {
      const [year, month] = bulan.split("-").map(Number);
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
      where.tanggal = { gte: startOfMonth, lte: endOfMonth };
    }

    if (rencanaKinerjaId) {
      where.rencanaKinerjaId = rencanaKinerjaId;
    }

    const capaianList = await prisma.capaianHarian.findMany({
      where,
      include: {
        rencanaKinerja: {
          select: { id: true, deskripsi: true, jenis: true },
        },
      },
      orderBy: [{ tanggal: "desc" }, { jamMulai: "desc" }],
    });

    return NextResponse.json({ data: capaianList });
  } catch (err) {
    console.error("GET_CAPAIAN_HARIAN_ERROR", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();
    const {
      rencanaKinerjaId,
      tanggal,
      jamMulai,
      jamSelesai,
      deskripsiKegiatan,
      progress,
      capaian,
      copiedFromId,
    } = body as {
      rencanaKinerjaId?: string;
      tanggal?: string;
      jamMulai?: string;
      jamSelesai?: string;
      deskripsiKegiatan?: string;
      progress?: number;
      capaian?: string;
      copiedFromId?: string;
    };

    if (
      !rencanaKinerjaId ||
      !tanggal ||
      !jamMulai ||
      !jamSelesai ||
      !deskripsiKegiatan?.trim() ||
      progress === undefined ||
      !capaian?.trim()
    ) {
      return NextResponse.json(
        { message: "Data tidak lengkap. Semua field wajib diisi." },
        { status: 400 }
      );
    }

    if (progress < 0 || progress > 100) {
      return NextResponse.json(
        { message: "Progress harus antara 0 sampai 100." },
        { status: 400 }
      );
    }

    const rk = await prisma.rencanaKinerja.findUnique({
      where: { id: rencanaKinerjaId },
      include: { setupTriwulan: true },
    });
    if (!rk || rk.setupTriwulan.userId !== userId) {
      return NextResponse.json(
        { message: "Rencana kinerja tidak ditemukan." },
        { status: 404 }
      );
    }

    const capaianBaru = await prisma.capaianHarian.create({
      data: {
        userId,
        rencanaKinerjaId,
        tanggal: new Date(tanggal),
        jamMulai: new Date(`1970-01-01T${jamMulai}`),
        jamSelesai: new Date(`1970-01-01T${jamSelesai}`),
        deskripsiKegiatan: deskripsiKegiatan.trim(),
        progress,
        capaian: capaian.trim(),
        copiedFromId: copiedFromId || null,
      },
      include: {
        rencanaKinerja: {
          select: { id: true, deskripsi: true, jenis: true },
        },
      },
    });

    return NextResponse.json({ data: capaianBaru }, { status: 201 });
  } catch (err) {
    console.error("POST_CAPAIAN_HARIAN_ERROR", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
