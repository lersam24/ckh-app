import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nama, email, nip, password } = body as {
      nama?: string;
      email?: string;
      nip?: string;
      password?: string;
    };

    if (!nama || !email || !nip || !password) {
      return NextResponse.json(
        { message: "Semua field wajib diisi." },
        { status: 400 }
      );
    }
    if (!/^\d{18}$/.test(nip)) {
      return NextResponse.json(
        { message: "NIP harus terdiri dari 18 digit angka." },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password minimal 8 karakter." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ nip }, { email }] },
    });
    if (existing) {
      return NextResponse.json(
        {
          message:
            existing.nip === nip
              ? "NIP sudah terdaftar."
              : "Email sudah terdaftar.",
        },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        nama,
        email,
        nip,
        passwordHash,
      },
      select: { id: true, nama: true, email: true, nip: true },
    });

    return NextResponse.json(
      { message: "Registrasi berhasil.", user },
      { status: 201 }
    );
  } catch (err) {
    console.error("REGISTER_ERROR", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}