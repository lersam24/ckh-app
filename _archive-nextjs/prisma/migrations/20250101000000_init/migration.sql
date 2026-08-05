-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "JenisRK" AS ENUM ('UTAMA', 'TAMBAHAN');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nip" VARCHAR(18) NOT NULL,
    "nama" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "jabatan" VARCHAR(255),
    "unit_kerja" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "failed_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skp_tahunan_import" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "nama_file" VARCHAR(255),
    "imported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skp_tahunan_import_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "setup_triwulan" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "triwulan" INTEGER NOT NULL,

    CONSTRAINT "setup_triwulan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rencana_kinerja" (
    "id" TEXT NOT NULL,
    "setup_triwulan_id" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "jenis" "JenisRK" NOT NULL,
    "dari_import" BOOLEAN NOT NULL DEFAULT false,
    "urutan" INTEGER,

    CONSTRAINT "rencana_kinerja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iki" (
    "id" TEXT NOT NULL,
    "rencana_kinerja_id" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,

    CONSTRAINT "iki_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capaian_harian" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rencana_kinerja_id" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "jam_mulai" TIME NOT NULL,
    "jam_selesai" TIME NOT NULL,
    "deskripsi_kegiatan" TEXT NOT NULL,
    "progress" INTEGER NOT NULL,
    "capaian" TEXT NOT NULL,
    "bukti_dukung_url" TEXT,
    "copied_from_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capaian_harian_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_nip_key" ON "users"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "skp_tahunan_import_user_id_tahun_key" ON "skp_tahunan_import"("user_id", "tahun");

-- CreateIndex
CREATE UNIQUE INDEX "setup_triwulan_user_id_tahun_triwulan_key" ON "setup_triwulan"("user_id", "tahun", "triwulan");

-- AddForeignKey
ALTER TABLE "skp_tahunan_import" ADD CONSTRAINT "skp_tahunan_import_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "setup_triwulan" ADD CONSTRAINT "setup_triwulan_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rencana_kinerja" ADD CONSTRAINT "rencana_kinerja_setup_triwulan_id_fkey" FOREIGN KEY ("setup_triwulan_id") REFERENCES "setup_triwulan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iki" ADD CONSTRAINT "iki_rencana_kinerja_id_fkey" FOREIGN KEY ("rencana_kinerja_id") REFERENCES "rencana_kinerja"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capaian_harian" ADD CONSTRAINT "capaian_harian_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capaian_harian" ADD CONSTRAINT "capaian_harian_rencana_kinerja_id_fkey" FOREIGN KEY ("rencana_kinerja_id") REFERENCES "rencana_kinerja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capaian_harian" ADD CONSTRAINT "capaian_harian_copied_from_id_fkey" FOREIGN KEY ("copied_from_id") REFERENCES "capaian_harian"("id") ON DELETE SET NULL ON UPDATE CASCADE;

