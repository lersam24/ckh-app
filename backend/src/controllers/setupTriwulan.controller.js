const prisma = require("../config/prisma");

exports.list = async (req, res, next) => {
  try {
    const { tahun } = req.query;
    const data = await prisma.setupTriwulan.findMany({
      where: { userId: req.user.id, ...(tahun ? { tahun: Number(tahun) } : {}) },
      include: { rencanaKinerjas: { include: { ikis: true } } },
      orderBy: [{ tahun: "desc" }, { triwulan: "asc" }],
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { tahun, triwulan } = req.body;
    if (!tahun || !triwulan) {
      return res.status(400).json({ error: "Tahun dan triwulan wajib diisi" });
    }

    const item = await prisma.setupTriwulan.create({
      data: { userId: req.user.id, tahun: Number(tahun), triwulan: Number(triwulan) },
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// TODO: endpoint copy dari triwulan sebelumnya & import Excel KipApp
// bisa diportasi dari app/api/setup-triwulan/copy dan .../import di project Next.js
exports.copyFromPrevious = async (req, res) => {
  res.status(501).json({ error: "Belum diimplementasikan - lihat TODO di controller" });
};

exports.importExcel = async (req, res) => {
  res.status(501).json({ error: "Belum diimplementasikan - lihat TODO di controller" });
};
