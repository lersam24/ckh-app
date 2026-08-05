const router = require("express").Router();
const controller = require("../controllers/rencanaKinerja.controller");
const { requireAuth } = require("../middleware/auth.middleware");

router.use(requireAuth);

router.get("/", controller.list);
router.post("/", controller.create);
router.patch("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
