# CKH Frontend (React.js + Vite)

Frontend baru menggantikan Next.js — React SPA murni yang mengonsumsi
backend Express (`../backend`) lewat REST API.

## Stack
- React 18 + Vite
- React Router v6 (routing client-side)
- Axios (HTTP client, dengan interceptor JWT otomatis)
- Tailwind CSS
- Auth berbasis JWT disimpan di `localStorage`, dikirim lewat header `Authorization: Bearer`

## Setup

1. Salin environment variable:
   ```bash
   cp .env.example .env
   # sesuaikan VITE_API_URL jika backend tidak di localhost:4000
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Jalankan dev server:
   ```bash
   npm run dev
   ```
   Berjalan di `http://localhost:3000`, pastikan backend (`../backend`) juga jalan di `http://localhost:4000`.

## Struktur folder

```
frontend/
├── src/
│   ├── api/client.js          # axios instance + interceptor JWT
│   ├── context/AuthContext.jsx # state login global
│   ├── components/
│   │   ├── AuthLayout.jsx
│   │   ├── DashboardLayout.jsx
│   │   ├── DashboardNavbar.jsx
│   │   └── ProtectedRoute.jsx  # guard halaman yang butuh login
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx       # catat & lihat capaian harian
│   │   ├── SetupTriwulan.jsx   # kelola RK per triwulan
│   │   ├── Rekap.jsx           # rekap capaian per tanggal
│   │   └── Pengaturan.jsx      # profil, password, foto
│   ├── App.jsx                 # routing
│   └── main.jsx                # entry point
├── index.html
└── package.json
```

## Catatan implementasi
- Halaman-halaman ini adalah **fungsi inti** yang sudah tersambung penuh ke backend
  (login, register, CRUD capaian harian, setup triwulan, rekap, pengaturan profil/password/foto).
- Import Excel SKP dan fitur "copy setup dari triwulan sebelumnya" belum ada UI-nya
  karena endpoint backend-nya juga masih `TODO` (lihat `backend/README.md`).
- Styling dibuat fungsional dan konsisten dengan tema biru CKH APP, namun belum
  1:1 identik dengan desain Next.js lama (ilustrasi dekoratif di halaman login dilepas
  untuk menyederhanakan). Bisa dipercantik lebih lanjut jika diperlukan.
