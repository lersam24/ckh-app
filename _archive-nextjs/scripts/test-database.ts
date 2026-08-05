/**
 * TEST DATABASE — Verifikasi struktur & perilaku database CKH App
 * sesuai RANCANGAN_DATABASE_MODEL_WEB_CKH.docx
 *
 * Cara pakai:
 *   1. Taruh file ini di:  scripts/test-database.ts
 *   2. Jalankan:           npx tsx scripts/test-database.ts
 *      (kalau belum ada "tsx": npm i -D tsx)
 *
 * Script ini akan:
 *   - Membuat data uji (user, setup triwulan, RK, IKI, capaian harian)
 *   - Memverifikasi tipe UUID, relasi, dan constraint unik sesuai rancangan
 *   - Menguji cascade delete sesuai aturan onDelete di schema
 *   - MEMBERSIHKAN SEMUA DATA UJI di akhir (aman dijalankan berkali-kali)
 *
 * Semua data uji ditandai dengan email "test-ckh-db@example.com" supaya
 * tidak mungkin bentrok dengan data pengguna asli.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

let passed = 0;
let failed = 0;

function ok(label: string) {
  passed++;
  console.log(`✅ PASS  ${label}`);
}

function bad(label: string, detail?: unknown) {
  failed++;
  console.log(`❌ FAIL  ${label}`);
  if (detail) console.log(`         ↳ ${String(detail)}`);
}

function assert(condition: boolean, label: string, detail?: unknown) {
  condition ? ok(label) : bad(label, detail);
}

async function main() {
  console.log("========================================");
  console.log(" TEST DATABASE — CKH App");
  console.log("========================================\n");

  const testEmail = "test-ckh-db@example.com";
  const testNip = "999999999999999999"; // 18 digit, khusus data uji

  // Bersihkan sisa data uji dari run sebelumnya (kalau ada, misal script
  // sebelumnya terhenti di tengah jalan)
  await prisma.user.deleteMany({ where: { email: testEmail } });

  try {
    // ------------------------------------------------------------
    // TEST 1: Buat User & cek tipe id (harus UUID, bukan text biasa)
    // ------------------------------------------------------------
    const user = await prisma.user.create({
      data: {
        nip: testNip,
        nama: "User Uji Coba",
        email: testEmail,
        passwordHash: "dummy-hash-not-real",
        jabatan: "Tester",
        unitKerja: "QA",
      },
    });
    assert(!!user.id, "User berhasil dibuat");
    assert(
      UUID_REGEX.test(user.id),
      "User.id berformat UUID valid",
      `id = ${user.id}`
    );
    assert(
      user.failedAttempts === 0 && user.lockedUntil === null,
      "Kolom failed_attempts & locked_until punya default yang benar"
    );

    // ------------------------------------------------------------
    // TEST 2: Constraint UNIQUE pada nip & email
    // ------------------------------------------------------------
    try {
      await prisma.user.create({
        data: {
          nip: testNip, // sengaja duplikat
          nama: "Duplikat NIP",
          email: "beda@example.com",
          passwordHash: "x",
        },
      });
      bad("Constraint UNIQUE pada users.nip ditegakkan database");
    } catch (e) {
      ok("Constraint UNIQUE pada users.nip ditegakkan database");
    }

    // ------------------------------------------------------------
    // TEST 3: Setup Triwulan + constraint UNIQUE(user_id, tahun, triwulan)
    // ------------------------------------------------------------
    const setup = await prisma.setupTriwulan.create({
      data: { userId: user.id, tahun: 2026, triwulan: 3 },
    });
    assert(UUID_REGEX.test(setup.id), "SetupTriwulan.id berformat UUID valid");

    try {
      await prisma.setupTriwulan.create({
        data: { userId: user.id, tahun: 2026, triwulan: 3 }, // duplikat
      });
      bad("Constraint UNIQUE(user_id, tahun, triwulan) ditegakkan database");
    } catch (e) {
      ok("Constraint UNIQUE(user_id, tahun, triwulan) ditegakkan database");
    }

    // ------------------------------------------------------------
    // TEST 4: Rencana Kinerja — enum JenisRK & default dari_import
    // ------------------------------------------------------------
    const rkUtama = await prisma.rencanaKinerja.create({
      data: {
        setupTriwulanId: setup.id,
        deskripsi: "RK Utama uji coba",
        jenis: "UTAMA",
        dariImport: true,
        urutan: 1,
      },
    });
    const rkTambahan = await prisma.rencanaKinerja.create({
      data: {
        setupTriwulanId: setup.id,
        deskripsi: "RK Tambahan uji coba",
        jenis: "TAMBAHAN",
        urutan: 2,
      },
    });
    assert(
      rkUtama.jenis === "UTAMA" && rkTambahan.jenis === "TAMBAHAN",
      "Enum JenisRK (UTAMA/TAMBAHAN) berfungsi dengan benar"
    );
    assert(
      rkTambahan.dariImport === false,
      "Default dari_import = false berfungsi (RK manual)"
    );

    // ------------------------------------------------------------
    // TEST 5: IKI terhubung ke Rencana Kinerja
    // ------------------------------------------------------------
    const iki = await prisma.iki.create({
      data: {
        rencanaKinerjaId: rkUtama.id,
        deskripsi: "IKI uji coba",
      },
    });
    assert(UUID_REGEX.test(iki.id), "Iki.id berformat UUID valid");

    // ------------------------------------------------------------
    // TEST 6: Capaian Harian — termasuk field nullable & self-relation
    // (copied_from_id) sesuai rancangan
    // ------------------------------------------------------------
    const entry1 = await prisma.capaianHarian.create({
      data: {
        userId: user.id,
        rencanaKinerjaId: rkUtama.id,
        tanggal: new Date("2026-07-20"),
        jamMulai: new Date("1970-01-01T08:00:00Z"),
        jamSelesai: new Date("1970-01-01T10:00:00Z"),
        deskripsiKegiatan: "Menyusun laporan uji coba",
        progress: 50,
        capaian: "Draft laporan selesai 50%",
        // buktiDukungUrl sengaja dikosongkan untuk menguji nullable
      },
    });
    assert(
      entry1.buktiDukungUrl === null,
      "Kolom bukti_dukung_url nullable sesuai rancangan"
    );

    const entry2 = await prisma.capaianHarian.create({
      data: {
        userId: user.id,
        rencanaKinerjaId: rkUtama.id,
        tanggal: new Date("2026-07-21"),
        jamMulai: new Date("1970-01-01T08:00:00Z"),
        jamSelesai: new Date("1970-01-01T09:30:00Z"),
        deskripsiKegiatan: "Melanjutkan laporan (copy dari entri sebelumnya)",
        progress: 80,
        capaian: "Draft laporan selesai 80%",
        copiedFromId: entry1.id, // menguji self-relation
      },
    });
    assert(
      entry2.copiedFromId === entry1.id,
      "Self-relation copied_from_id pada capaian_harian berfungsi"
    );

    // ------------------------------------------------------------
    // TEST 7: Query relasi berlapis (users → setup_triwulan →
    // rencana_kinerja → iki, dan capaian_harian)
    // ------------------------------------------------------------
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        setupTriwulans: {
          include: {
            rencanaKinerjas: {
              include: { ikis: true, capaianHarians: true },
            },
          },
        },
      },
    });
    const loadedRk = fullUser?.setupTriwulans[0]?.rencanaKinerjas ?? [];
    const totalIki = loadedRk.reduce((sum, rk) => sum + rk.ikis.length, 0);
    const totalCapaian = loadedRk.reduce(
      (sum, rk) => sum + rk.capaianHarians.length,
      0
    );
    assert(
      loadedRk.length === 2,
      "Relasi setup_triwulan → rencana_kinerja (2 RK) terbaca lengkap"
    );
    assert(totalIki === 1, "Relasi rencana_kinerja → iki terbaca lengkap");
    assert(
      totalCapaian === 2,
      "Relasi rencana_kinerja → capaian_harian terbaca lengkap"
    );

    // ------------------------------------------------------------
    // TEST 8: onDelete: Restrict — rencana_kinerja tidak boleh
    // dihapus selama masih ada capaian_harian yang mereferensikannya
    // ------------------------------------------------------------
    try {
      await prisma.rencanaKinerja.delete({ where: { id: rkUtama.id } });
      bad(
        "onDelete: Restrict pada capaian_harian.rencana_kinerja_id ditegakkan"
      );
    } catch (e) {
      ok(
        "onDelete: Restrict pada capaian_harian.rencana_kinerja_id ditegakkan"
      );
    }

    // ------------------------------------------------------------
    // TEST 9: onDelete: Cascade — hapus user otomatis menghapus semua
    // data turunannya (setup_triwulan, rencana_kinerja, iki, capaian_harian)
    // ------------------------------------------------------------
    await prisma.user.delete({ where: { id: user.id } });

    const sisaSetup = await prisma.setupTriwulan.findMany({
      where: { userId: user.id },
    });
    const sisaRk = await prisma.rencanaKinerja.findMany({
      where: { setupTriwulanId: setup.id },
    });
    const sisaIki = await prisma.iki.findMany({
      where: { rencanaKinerjaId: rkUtama.id },
    });
    const sisaCapaian = await prisma.capaianHarian.findMany({
      where: { userId: user.id },
    });

    assert(
      sisaSetup.length === 0 &&
        sisaRk.length === 0 &&
        sisaIki.length === 0 &&
        sisaCapaian.length === 0,
      "onDelete: Cascade — hapus user otomatis membersihkan semua data turunan"
    );
  } catch (err) {
    bad("Terjadi error tak terduga saat pengujian", err);
    // Bersih-bersih paksa kalau ada error di tengah jalan
    await prisma.user.deleteMany({ where: { email: testEmail } }).catch(() => {});
  }

  console.log("\n========================================");
  console.log(` HASIL: ${passed} lulus, ${failed} gagal`);
  console.log("========================================");

  if (failed > 0) {
    console.log(
      "\n⚠️  Ada test yang gagal — cek detail di atas dan bandingkan dengan"
    );
    console.log("    RANCANGAN_DATABASE_MODEL_WEB_CKH.docx untuk tahu bagian mana yang tidak sesuai.");
    process.exitCode = 1;
  } else {
    console.log("\n🎉 Semua test lulus — struktur database sudah sesuai rancangan.");
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});