import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const rk = await prisma.rencanaKinerja.findUnique({
    where: { id },
    include: {
      setupTriwulan: true,
      capaianHarians: { select: { id: true }, take: 1 },
    },
  });

  if (!rk || rk.setupTriwulan.userId !== userId) {
    return NextResponse.json(
      { message: "RK tidak ditemukan." },
      { status: 404 }
    );
  }

  if (rk.jenis === "UTAMA") {
    return NextResponse.json(
      { message: "RK Utama tidak bisa dihapus." },
      { status: 400 }
    );
  }

  if (rk.capaianHarians.length > 0) {
    return NextResponse.json(
      {
        message:
          "RK ini sudah punya kegiatan harian terkait, tidak bisa dihapus.",
      },
      { status: 400 }
    );
  }

  await prisma.rencanaKinerja.delete({ where: { id } });

  return NextResponse.json({ message: "RK berhasil dihapus." });
}