const router = require("express").Router();
const multer = require("multer");
const controller = require("../controllers/setupTriwulan.controller");
const { requireAuth } = require("../middleware/auth.middleware");

// File Excel (SKP dari KipApp) diproses langsung di memory, tidak disimpan permanen
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.use(requireAuth);

router.get("/", controller.list);
router.post("/", controller.create);
router.post("/copy", controller.copyFromPrevious);
router.post("/import", upload.single("file"), controller.importExcel);

module.exports = router;
