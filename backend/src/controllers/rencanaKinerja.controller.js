const prisma = require("../config/prisma");

exports.list = async (req, res, next) => {
  try {
    const { setupTriwulanId } = req.query;
    const data = await prisma.rencanaKinerja.findMany({
      where: { ...(setupTriwulanId ? { setupTriwulanId } : {}) },
      include: { ikis: true },
      orderBy: { urutan: "asc" },
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { setupTriwulanId, deskripsi, jenis, urutan, ikis } = req.body;
    if (!setupTriwulanId || !deskripsi || !jenis) {
      return res.status(400).json({ error: "Field wajib belum lengkap" });
    }

    const item = await prisma.rencanaKinerja.create({
      data: {
        setupTriwulanId,
        deskripsi,
        jenis, // "UTAMA" | "TAMBAHAN"
        urutan,
        ikis: ikis?.length
          ? { create: ikis.map((deskripsi) => ({ deskripsi })) }
          : undefined,
      },
      include: { ikis: true },
    });

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { deskripsi, urutan } = req.body;
    const item = await prisma.rencanaKinerja.update({
      where: { id: req.params.id },
      data: { ...(deskripsi !== undefined && { deskripsi }), ...(urutan !== undefined && { urutan }) },
    });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await prisma.rencanaKinerja.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
