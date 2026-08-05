import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { nama, email, jabatan, unitKerja, fotoProfil } = await req.json();

  if (!nama || typeof nama !== "string" || nama.trim().length === 0) {
    return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
  }

  if (email) {
    const existing = await prisma.user.findFirst({
      where: {
        email,
        id: { not: userId },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email sudah digunakan pengguna lain" },
        { status: 409 }
      );
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      nama: nama.trim(),
      email: email?.trim() ?? undefined,
      jabatan: jabatan?.trim() ?? null,
      unitKerja: unitKerja?.trim() ?? null,
      fotoProfil: fotoProfil ?? null,
    },
    select: {
      id: true,
      nama: true,
      nip: true,
      email: true,
      jabatan: true,
      unitKerja: true,
      fotoProfil: true,
    },
  });

  return NextResponse.json(updated);
}
