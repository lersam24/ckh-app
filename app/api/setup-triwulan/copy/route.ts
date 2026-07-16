import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getPreviousTriwulan } from "@/lib/current-triwulan";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  const body = await req.json();
  const { tahun, triwulan } = body as { tahun?: number; triwulan?: number };
  if (!tahun || !triwulan) {
    return NextResponse.json(
      { message: "Tahun dan triwulan wajib diisi." },
      { status: 400 }
    );
  }

  const target = await prisma.setupTriwulan.findUnique({
    where: { userId_tahun_triwulan: { userId, tahun, triwulan } },
    include: { rencanaKinerjas: true },
  });

  if (target && target.rencanaKinerjas.length > 0) {
    return NextResponse.json(
      { message: "Setup triwulan ini sudah punya data, tidak bisa disalin." },
      { status: 400 }
    );
  }

  const prev = getPreviousTriwulan(tahun, triwulan);
  const source = await prisma.setupTriwulan.findUnique({
    where: {
      userId_tahun_triwulan: {
        userId,
        tahun: prev.tahun,
        triwulan: prev.triwulan,
      },
    },
    include: { rencanaKinerjas: { include: { ikis: true } } },
  });

  if (!source || source.rencanaKinerjas.length === 0) {
    return NextResponse.json(
      { message: "Tidak ada data di triwulan sebelumnya." },
      { status: 404 }
    );
  }

  const targetSetup =
    target ??
    (await prisma.setupTriwulan.create({ data: { userId, tahun, triwulan } }));

  for (const rk of source.rencanaKinerjas) {
    await prisma.rencanaKinerja.create({
      data: {
        setupTriwulanId: targetSetup.id,
        deskripsi: rk.deskripsi,
        jenis: rk.jenis,
        dariImport: rk.dariImport,
        urutan: rk.urutan,
        ikis: {
          create: rk.ikis.map((iki) => ({ deskripsi: iki.deskripsi })),
        },
      },
    });
  }

  return NextResponse.json({ message: "Berhasil disalin." });
}