const router = require("express").Router();
const controller = require("../controllers/capaianHarian.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { localUploadMiddleware } = require("../middleware/localUpload");

router.use(requireAuth);

router.get("/", controller.list);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.patch("/:id", controller.update);
router.post(
  "/:id/bukti-dukung",
  localUploadMiddleware("bukti-dukung", "file"),
  controller.uploadBuktiDukung
);
router.delete("/:id", controller.remove);

module.exports = router;
