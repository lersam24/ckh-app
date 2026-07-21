-- ============================================================
-- MIGRASI: Konversi kolom id & foreign key dari TEXT ke UUID
-- Menyesuaikan implementasi database dengan RANCANGAN_DATABASE_MODEL_WEB_CKH
-- ============================================================
-- PENTING:
-- 1. WAJIB BACKUP DATABASE dulu sebelum menjalankan ini
--    (Supabase Dashboard -> Database -> Backups, atau pg_dump)
-- 2. Jalankan lewat Supabase SQL Editor, atau `prisma migrate deploy`
-- 3. Skrip ini AMAN dijalankan hanya jika seluruh data pada kolom
--    id/foreign key yang ada saat ini SUDAH berupa string UUID valid
--    (karena aplikasi memakai Prisma @default(uuid()) sejak awal,
--    seharusnya semua data sudah berformat UUID walau tersimpan
--    sebagai text)
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- STEP 1: Lepas semua foreign key constraint terlebih dahulu
-- (kolom yang direferensikan tidak bisa diubah tipenya selama
--  masih terikat foreign key)
-- ------------------------------------------------------------
ALTER TABLE "skp_tahunan_import" DROP CONSTRAINT "skp_tahunan_import_user_id_fkey";
ALTER TABLE "setup_triwulan" DROP CONSTRAINT "setup_triwulan_user_id_fkey";
ALTER TABLE "rencana_kinerja" DROP CONSTRAINT "rencana_kinerja_setup_triwulan_id_fkey";
ALTER TABLE "iki" DROP CONSTRAINT "iki_rencana_kinerja_id_fkey";
ALTER TABLE "capaian_harian" DROP CONSTRAINT "capaian_harian_user_id_fkey";
ALTER TABLE "capaian_harian" DROP CONSTRAINT "capaian_harian_rencana_kinerja_id_fkey";
ALTER TABLE "capaian_harian" DROP CONSTRAINT "capaian_harian_copied_from_id_fkey";

-- ------------------------------------------------------------
-- STEP 2: Ubah tipe kolom id & foreign key dari TEXT -> UUID
-- Klausa USING "<kolom>"::uuid mengonversi nilai text yang ada
-- menjadi tipe uuid native. Jika ada satu saja nilai yang bukan
-- format UUID valid, statement ini akan GAGAL (lihat catatan di
-- bagian bawah file untuk cara memeriksa data bermasalah).
-- ------------------------------------------------------------

-- users
ALTER TABLE "users" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;

-- skp_tahunan_import
ALTER TABLE "skp_tahunan_import" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "skp_tahunan_import" ALTER COLUMN "user_id" TYPE UUID USING "user_id"::uuid;

-- setup_triwulan
ALTER TABLE "setup_triwulan" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "setup_triwulan" ALTER COLUMN "user_id" TYPE UUID USING "user_id"::uuid;

-- rencana_kinerja
ALTER TABLE "rencana_kinerja" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "rencana_kinerja" ALTER COLUMN "setup_triwulan_id" TYPE UUID USING "setup_triwulan_id"::uuid;

-- iki
ALTER TABLE "iki" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "iki" ALTER COLUMN "rencana_kinerja_id" TYPE UUID USING "rencana_kinerja_id"::uuid;

-- capaian_harian
ALTER TABLE "capaian_harian" ALTER COLUMN "id" TYPE UUID USING "id"::uuid;
ALTER TABLE "capaian_harian" ALTER COLUMN "user_id" TYPE UUID USING "user_id"::uuid;
ALTER TABLE "capaian_harian" ALTER COLUMN "rencana_kinerja_id" TYPE UUID USING "rencana_kinerja_id"::uuid;
ALTER TABLE "capaian_harian" ALTER COLUMN "copied_from_id" TYPE UUID USING "copied_from_id"::uuid;

-- ------------------------------------------------------------
-- STEP 3: Buat ulang foreign key constraint (sama persis
-- dengan migration awal, hanya sekarang menghubungkan kolom
-- bertipe UUID <-> UUID)
-- ------------------------------------------------------------
ALTER TABLE "skp_tahunan_import" ADD CONSTRAINT "skp_tahunan_import_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "setup_triwulan" ADD CONSTRAINT "setup_triwulan_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "rencana_kinerja" ADD CONSTRAINT "rencana_kinerja_setup_triwulan_id_fkey"
  FOREIGN KEY ("setup_triwulan_id") REFERENCES "setup_triwulan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "iki" ADD CONSTRAINT "iki_rencana_kinerja_id_fkey"
  FOREIGN KEY ("rencana_kinerja_id") REFERENCES "rencana_kinerja"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "capaian_harian" ADD CONSTRAINT "capaian_harian_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "capaian_harian" ADD CONSTRAINT "capaian_harian_rencana_kinerja_id_fkey"
  FOREIGN KEY ("rencana_kinerja_id") REFERENCES "rencana_kinerja"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "capaian_harian" ADD CONSTRAINT "capaian_harian_copied_from_id_fkey"
  FOREIGN KEY ("copied_from_id") REFERENCES "capaian_harian"("id") ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;

-- ============================================================
-- CATATAN:
-- Jika STEP 2 gagal dengan error "invalid input syntax for type uuid",
-- berarti ada data lama yang bukan format UUID valid (misalnya dari
-- proses seed/testing manual). Cari datanya dulu SEBELUM migrasi ini,
-- contoh untuk tabel users:
--
--   SELECT id FROM users WHERE id !~
--     '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
--
-- Ulangi query serupa untuk kolom id/foreign key di tabel lain sebelum
-- menjalankan migrasi ini.
-- ============================================================
