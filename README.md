# Concertix

## Deploy ke Vercel

Frontend dan backend dideploy sebagai **dua project Vercel** yang terhubung ke
repository GitHub yang sama.

### 1. Siapkan repository dan database

- Commit dan push perubahan yang akan dideploy ke GitHub.
- Di Supabase, jalankan migrasi yang belum diterapkan dari `backend/migrations/`
  sesuai urutan tanggal. Jangan jalankan ulang migrasi yang sudah diterapkan.

### 2. Deploy backend

- Di Vercel, import repository Concertix sebagai project baru.
- Set **Root Directory** ke `backend`; biarkan Vercel mendeteksi Express.
- Tambahkan environment variables dari `backend/.env.example` di
  **Settings → Environment Variables**:
  `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`,
  `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_IS_PRODUCTION`, dan
  `FRONTEND_URL`.
- Deploy, lalu pastikan URL backend mengembalikan respons JSON di `/`.

### 3. Deploy frontend

- Import repository yang sama sebagai project Vercel kedua.
- Set **Root Directory** ke `frontend`; gunakan build command `npm run build`
  dan output directory `dist`.
- Set `VITE_API_BASE_URL` ke URL backend yang sudah dideploy dengan akhiran
  `/api`, misalnya `https://concertix-api.vercel.app/api`.
- Deploy. `frontend/vercel.json` sudah mengatur fallback SPA agar route seperti
  `/orders` dan `/concert/...` bisa dibuka langsung.

### 4. Selesaikan konfigurasi pembayaran

- Setelah domain frontend diketahui, pastikan `FRONTEND_URL` pada project
  backend berisi domain frontend production, lalu redeploy backend.
- Atur URL notifikasi Midtrans ke
  `https://<domain-backend>/api/payments/midtrans/notification`.
- Gunakan kredensial Midtrans production dan set
  `MIDTRANS_IS_PRODUCTION=true` hanya ketika siap menerima pembayaran nyata.

Ukuran poster dibatasi 4 MB agar upload muat dalam batas payload Vercel Functions.
Jangan commit file `.env` atau kredensial production.
