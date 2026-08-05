const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");

exports.getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, nip: true, nama: true, email: true, jabatan: true, unitKerja: true, fotoProfil: true },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { nama, jabatan, unitKerja } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { nama, jabatan, unitKerja },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isValid) return res.status(400).json({ error: "Password lama salah" });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    res.json({ message: "Password berhasil diubah" });
  } catch (err) {
    next(err);
  }
};

// req.file disediakan oleh localUploadMiddleware (lihat routes/user.routes.js)
exports.uploadFoto = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { fotoProfil: req.file.publicUrl },
    });
    res.json({ fotoProfil: user.fotoProfil });
  } catch (err) {
    next(err);
  }
};
