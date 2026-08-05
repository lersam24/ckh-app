require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const setupTriwulanRoutes = require("./routes/setupTriwulan.routes");
const rencanaKinerjaRoutes = require("./routes/rencanaKinerja.routes");
const capaianHarianRoutes = require("./routes/capaianHarian.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// File yang diupload (foto profil, bukti dukung) diakses lewat /uploads/...
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/setup-triwulan", setupTriwulanRoutes);
app.use("/api/rencana-kinerja", rencanaKinerjaRoutes);
app.use("/api/capaian-harian", capaianHarianRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`CKH backend jalan di http://localhost:${PORT}`);
});
