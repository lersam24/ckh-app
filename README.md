# CKH App — Aplikasi Catatan Kinerja Harian

Monorepo dengan dua bagian terpisah:

```
ckh-app/
├── backend/    # Node.js + Express.js + MySQL (Prisma) + JWT auth
├── frontend/   # React.js (Vite) — SPA yang mengonsumsi backend via REST API
└── _archive-nextjs/   # project Next.js lama (arsip, sudah tidak dipakai)
```

## Menjalankan secara lokal

Buka dua terminal:

**Terminal 1 — Backend**
```bash
cd backend
cp .env.example .env   # isi DATABASE_URL (MySQL), JWT_SECRET, dst
npm install
npx prisma migrate dev --name init
npm run dev             # jalan di http://localhost:4000
```

**Terminal 2 — Frontend**
```bash
cd frontend
cp .env.example .env    # VITE_API_URL=http://localhost:4000
npm install
npm run dev              # jalan di http://localhost:3000
```

Buka `http://localhost:3000` di browser.

## Riwayat migrasi arsitektur
1. Awalnya: Next.js App Router (frontend+backend menyatu) + Prisma + PostgreSQL (Supabase)
2. Sekarang: **backend Express.js + MySQL** terpisah dari **frontend React.js (Vite)**,
   tidak ada lagi ketergantungan ke Supabase (auth JWT sendiri, storage file lokal).

Detail masing-masing bagian ada di `backend/README.md` dan `frontend/README.md`.
