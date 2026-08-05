const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 menit
const MAX_ATTEMPTS = 5;

function signToken(user) {
  return jwt.sign(
    { id: user.id, nip: user.nip, email: user.email, nama: user.nama },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

exports.register = async (req, res, next) => {
  try {
    const { nip, nama, email, password, jabatan, unitKerja } = req.body;

    if (!nip || !nama || !email || !password) {
      return res.status(400).json({ error: "Field wajib belum lengkap" });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { nip }] },
    });
    if (existing) {
      return res.status(409).json({ error: "NIP atau email sudah terdaftar" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { nip, nama, email, passwordHash, jabatan, unitKerja },
    });

    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user.id, nip: user.nip, nama: user.nama, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email dan password wajib diisi" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Email atau password salah" });
    }

    // Cek lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const sisaDetik = Math.ceil((user.lockedUntil - new Date()) / 1000);
      return res.status(423).json({
        error: `Akun terkunci. Coba lagi dalam ${sisaDetik} detik.`,
      });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      const failedAttempts = user.failedAttempts + 1;
      const lockedUntil =
        failedAttempts >= MAX_ATTEMPTS
          ? new Date(Date.now() + LOCK_DURATION_MS)
          : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: lockedUntil ? 0 : failedAttempts,
          lockedUntil,
        },
      });

      if (lockedUntil) {
        return res.status(423).json({
          error: "Terlalu banyak percobaan gagal. Akun dikunci 5 menit.",
        });
      }
      return res.status(401).json({ error: "Email atau password salah" });
    }

    // Login sukses -> reset counter
    await prisma.user.update({
      where: { id: user.id },
      data: { failedAttempts: 0, lockedUntil: null },
    });

    const token = signToken(user);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        token,
        user: { id: user.id, nip: user.nip, nama: user.nama, email: user.email },
      });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res) => {
  res.clearCookie("token").json({ message: "Logout berhasil" });
};

exports.me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        nip: true,
        nama: true,
        email: true,
        jabatan: true,
        unitKerja: true,
        fotoProfil: true,
      },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
};
