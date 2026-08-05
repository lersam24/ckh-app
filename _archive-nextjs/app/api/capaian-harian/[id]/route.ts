import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const capaian = await prisma.capaianHarian.findUnique({
    where: { id },
    include: {
      rencanaKinerja: {
        select: { id: true, deskripsi: true, jenis: true },
      },
      copiedFrom: {
        select: { id: true, deskripsiKegiatan: true, tanggal: true },
      },
    },
  });

  if (!capaian || capaian.userId !== userId) {
    return NextResponse.json(
      { message: "Data capaian tidak ditemukan." },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: capaian });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const existing = await prisma.capaianHarian.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!existing || existing.userId !== userId) {
    return NextResponse.json(
      { message: "Data capaian tidak ditemukan." },
      { status: 404 }
    );
  }

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
    } = body as {
      rencanaKinerjaId?: string;
      tanggal?: string;
      jamMulai?: string;
      jamSelesai?: string;
      deskripsiKegiatan?: string;
      progress?: number;
      capaian?: string;
    };

    if (progress !== undefined && (progress < 0 || progress > 100)) {
      return NextResponse.json(
        { message: "Progress harus antara 0 sampai 100." },
        { status: 400 }
      );
    }

    if (rencanaKinerjaId) {
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
    }

    const updated = await prisma.capaianHarian.update({
      where: { id },
      data: {
        ...(rencanaKinerjaId && { rencanaKinerjaId }),
        ...(tanggal && { tanggal: new Date(tanggal) }),
        ...(jamMulai && { jamMulai: new Date(`1970-01-01T${jamMulai}`) }),
        ...(jamSelesai && { jamSelesai: new Date(`1970-01-01T${jamSelesai}`) }),
        ...(deskripsiKegiatan && { deskripsiKegiatan: deskripsiKegiatan.trim() }),
        ...(progress !== undefined && { progress }),
        ...(capaian && { capaian: capaian.trim() }),
      },
      include: {
        rencanaKinerja: {
          select: { id: true, deskripsi: true, jenis: true },
        },
      },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("PUT_CAPAIAN_HARIAN_ERROR", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const existing = await prisma.capaianHarian.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!existing || existing.userId !== userId) {
    return NextResponse.json(
      { message: "Data capaian tidak ditemukan." },
      { status: 404 }
    );
  }

  await prisma.capaianHarian.delete({ where: { id } });

  return NextResponse.json({ message: "Capaian berhasil dihapus." });
}
