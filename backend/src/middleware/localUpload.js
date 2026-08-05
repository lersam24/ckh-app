const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

/**
 * Middleware multer yang menyimpan file ke folder lokal di server, mis:
 * uploads/foto-profil/, uploads/bukti-dukung/
 *
 * Setelah middleware ini, hasil upload tersedia di req.file dengan:
 * - req.file.filename : nama file di disk
 * - req.file.path     : path fisik di server
 * File bisa diakses publik lewat /uploads/<subfolder>/<filename>
 * (lihat static serving di server.js)
 */
function localUploadMiddleware(subfolder, fieldName = "file") {
  const destDir = path.join(__dirname, "..", "..", "uploads", subfolder);
  fs.mkdirSync(destDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, destDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
      cb(null, uniqueName);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // maks 5MB
    fileFilter: (req, file, cb) => {
      const allowed = /jpeg|jpg|png|webp|pdf/i;
      if (allowed.test(path.extname(file.originalname))) return cb(null, true);
      cb(new Error("Format file tidak didukung"));
    },
  });

  return [
    upload.single(fieldName),
    (req, res, next) => {
      if (req.file) {
        // URL publik relatif, gabungkan dengan BASE_URL backend di sisi frontend
        req.file.publicUrl = `/uploads/${subfolder}/${req.file.filename}`;
      }
      next();
    },
  ];
}

module.exports = { localUploadMiddleware };
