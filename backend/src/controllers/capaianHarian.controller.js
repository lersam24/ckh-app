const prisma = require("../config/prisma");

exports.list = async (req, res, next) => {
  try {
    const { tanggal, rencanaKinerjaId } = req.query;

    const data = await prisma.capaianHarian.findMany({
      where: {
        userId: req.user.id,
        ...(tanggal ? { tanggal: new Date(tanggal) } : {}),
        ...(rencanaKinerjaId ? { rencanaKinerjaId } : {}),
      },
      orderBy: [{ tanggal: "desc" }, { jamMulai: "asc" }],
      include: { rencanaKinerja: true },
    });

    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const item = await prisma.capaianHarian.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { rencanaKinerja: true },
    });
    if (!item) return res.status(404).json({ error: "Data tidak ditemukan" });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const {
      rencanaKinerjaId,
      tanggal,
      jamMulai,
      jamSelesai,
      deskripsiKegiatan,
      progress,
      capaian,
      buktiDukungUrl,
      copiedFromId,
    } = req.body;

    if (!rencanaKinerjaId || !tanggal || !jamMulai || !jamSelesai || !deskripsiKegiatan) {
      return res.status(400).json({ error: "Field wajib belum lengkap" });
    }

    const item = await prisma.capaianHarian.create({
      data: {
        userId: req.user.id,
        rencanaKinerjaId,
        tanggal: new Date(tanggal),
        jamMulai: new Date(`1970-01-01T${jamMulai}`),
        jamSelesai: new Date(`1970-01-01T${jamSelesai}`),
        deskripsiKegiatan,
        progress: Number(progress) || 0,
        capaian,
        buktiDukungUrl,
        copiedFromId,
      },
    });

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const existing = await prisma.capaianHarian.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: "Data tidak ditemukan" });

    const { deskripsiKegiatan, progress, capaian, buktiDukungUrl, jamMulai, jamSelesai } = req.body;

    const item = await prisma.capaianHarian.update({
      where: { id: req.params.id },
      data: {
        ...(deskripsiKegiatan !== undefined && { deskripsiKegiatan }),
        ...(progress !== undefined && { progress: Number(progress) }),
        ...(capaian !== undefined && { capaian }),
        ...(buktiDukungUrl !== undefined && { buktiDukungUrl }),
        ...(jamMulai !== undefined && { jamMulai: new Date(`1970-01-01T${jamMulai}`) }),
        ...(jamSelesai !== undefined && { jamSelesai: new Date(`1970-01-01T${jamSelesai}`) }),
      },
    });

    res.json(item);
  } catch (err) {
    next(err);
  }
};

// req.file disediakan oleh localUploadMiddleware (lihat routes/capaianHarian.routes.js)
exports.uploadBuktiDukung = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });

    const existing = await prisma.capaianHarian.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: "Data tidak ditemukan" });

    const item = await prisma.capaianHarian.update({
      where: { id: req.params.id },
      data: { buktiDukungUrl: req.file.publicUrl },
    });

    res.json({ buktiDukungUrl: item.buktiDukungUrl });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const existing = await prisma.capaianHarian.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: "Data tidak ditemukan" });

    await prisma.capaianHarian.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
