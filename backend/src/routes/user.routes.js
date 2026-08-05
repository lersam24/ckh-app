const router = require("express").Router();
const controller = require("../controllers/user.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { localUploadMiddleware } = require("../middleware/localUpload");

router.use(requireAuth);

router.get("/profile", controller.getProfile);
router.patch("/profile", controller.updateProfile);
router.patch("/password", controller.changePassword);
router.post("/foto", localUploadMiddleware("foto-profil", "foto"), controller.uploadFoto);

module.exports = router;
