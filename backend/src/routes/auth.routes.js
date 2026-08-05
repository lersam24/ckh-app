const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth.middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", requireAuth, authController.me);

module.exports = router;
