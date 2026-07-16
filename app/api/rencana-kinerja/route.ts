import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();
    const { setupTriwulanId, deskripsi, ikis } = body as {
      setupTriwulanId?: string;
      deskripsi?: string;
      ikis?: string[];
    };

    if (!setupTriwulanId || !deskripsi?.trim()) {
      return NextResponse.json(
        { message: "Data tidak lengkap." },
        { status: 400 }
      );
    }

    const setup = await prisma.setupTriwulan.findUnique({
      where: { id: setupTriwulanId },
      include: { rencanaKinerjas: true },
    });
    if (!setup || setup.userId !== userId) {
      return NextResponse.json(
        { message: "Setup triwulan tidak ditemukan." },
        { status: 404 }
      );
    }

    const rk = await prisma.rencanaKinerja.create({
      data: {
        setupTriwulanId,
        deskripsi: deskripsi.trim(),
        jenis: "TAMBAHAN",
        dariImport: false,
        urutan: setup.rencanaKinerjas.length + 1,
        ikis: {
          create: (ikis ?? [])
            .filter((v) => v.trim())
            .map((deskripsiIki) => ({ deskripsi: deskripsiIki.trim() })),
        },
      },
      include: { ikis: true },
    });

    return NextResponse.json({ rencanaKinerja: rk }, { status: 201 });
  } catch (err) {
    console.error("ADD_RK_ERROR", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}