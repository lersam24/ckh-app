# CKH Backend (Express.js + MySQL)

Backend terpisah untuk aplikasi CKH, menggantikan API routes bawaan Next.js.
Frontend Next.js yang sudah ada di root repo nantinya memanggil backend ini via REST API,
bukan lagi mengakses Prisma/Postgres secara langsung.

## Stack
- Express.js 4
- Prisma ORM -> MySQL (schema di `prisma/schema.prisma`)
- JWT (jsonwebtoken) untuk autentikasi, disimpan di httpOnly cookie
- bcryptjs untuk hash password
- **Penyimpanan file lokal** di folder `backend/uploads/` (foto profil & bukti dukung),
  di-serve langsung sebagai static file lewat `/uploads/...`
- multer untuk parsing multipart/form-data

> Project ini sudah 100% lepas dari Supabase — database sekarang MySQL sendiri,
> backend Express sendiri, dan file disimpan lokal di server (bukan Supabase Storage).

> ⚠️ Catatan penting untuk local storage: jika backend di-deploy ke platform dengan
> filesystem *ephemeral* (mis. Vercel, Railway tanpa volume, Render free tier), file yang
> diupload akan **hilang setiap kali redeploy/restart**. Gunakan VPS dengan disk persisten,
> atau tambahkan volume/disk permanen di layanan hosting Anda.

## Setup

1. Buat database MySQL:
   ```sql
   CREATE DATABASE ckh_db CHARACTER SET utf8mb4;
   ```

2. Salin environment variables:
   ```bash
   cp .env.example .env
   # lalu isi DATABASE_URL, JWT_SECRET, FRONTEND_URL
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Jalankan migrasi Prisma (generate tabel di MySQL):
   ```bash
   npx prisma migrate dev --name init
   ```

5. Jalankan server dev:
   ```bash
   npm run dev
   ```
   Server berjalan di `http://localhost:4000`.

## Struktur folder

```
backend/
├── prisma/
│   └── schema.prisma        # skema database MySQL
├── src/
│   ├── config/
│   │   └── prisma.js        # Prisma client singleton
│   ├── controllers/         # logika bisnis per resource
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── errorHandler.js
│   ├── routes/               # definisi endpoint per resource
│   └── server.js             # entry point Express
├── .env.example
└── package.json
```

## Endpoint yang sudah tersedia

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/auth/register` | Registrasi user baru |
| POST | `/api/auth/login` | Login, lockout 5 menit setelah 5x gagal |
| POST | `/api/auth/logout` | Logout, hapus cookie |
| GET  | `/api/auth/me` | Data user yang sedang login |
| GET/PATCH | `/api/user/profile` | Lihat & ubah profil |
| PATCH | `/api/user/password` | Ubah password |
| POST | `/api/user/foto` | Upload foto profil, simpan lokal (field form: `foto`) |
| GET/POST | `/api/setup-triwulan` | List & buat setup triwulan |
| POST | `/api/setup-triwulan/copy` | **TODO**: copy dari triwulan sebelumnya |
| POST | `/api/setup-triwulan/import` | **TODO**: import Excel KipApp |
| GET/POST/PATCH/DELETE | `/api/rencana-kinerja` | CRUD Rencana Kinerja + IKI |
| GET/POST/PATCH/DELETE | `/api/capaian-harian` | CRUD Capaian Harian |
| POST | `/api/capaian-harian/:id/bukti-dukung` | Upload bukti dukung, simpan lokal (field form: `file`) |

File yang diupload tersimpan di `backend/uploads/foto-profil/` dan `backend/uploads/bukti-dukung/`,
dan bisa diakses lewat `http://localhost:4000/uploads/<subfolder>/<nama-file>`.

Endpoint bertanda **TODO** perlu diportasi dari logika yang sudah ada di
`app/api/setup-triwulan/copy` dan `app/api/setup-triwulan/import` pada project Next.js asli —
logika bisnisnya sama, hanya perlu dipindah dari Next.js Route Handler ke Express controller.

## Yang perlu disesuaikan di sisi Frontend (Next.js)

1. Hapus/nonaktifkan folder `app/api/*` (sudah digantikan backend ini), kecuali jika Anda
   tetap ingin menyimpan sebagian sebagai proxy tipis ke backend.
2. Ganti NextAuth session-based auth menjadi memanggil `/api/auth/login` di backend,
   simpan JWT (via cookie yang di-set backend, atau simpan di state/httpOnly proxy).
3. Ganti seluruh `fetch("/api/...")` di komponen/dashboard agar menunjuk ke
   `process.env.NEXT_PUBLIC_API_URL` (URL backend Express), contoh:
   ```ts
   fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/capaian-harian`, { credentials: "include" })
   ```
4. Hapus dependency `@prisma/client`, `next-auth`, dan folder `prisma/` di root (frontend)
   karena database kini sepenuhnya dikelola backend.
