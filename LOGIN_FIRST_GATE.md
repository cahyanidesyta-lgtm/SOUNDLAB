# SOUNDLAB — Login sebagai Halaman Pertama

## Perubahan
- Pengunjung yang belum memiliki sesi melihat halaman Masuk lebih dahulu.
- Dashboard, navigasi laboratorium, dan audio dock disembunyikan sebelum sesi diverifikasi.
- Form Masuk menggunakan email dan password; Buat Akun menggunakan nama, email, dan password.
- Sesi yang sudah valid diverifikasi lewat `/api/auth?action=me`; sumber sesi bukan `localStorage`.
- Klik latar dan tombol Escape tidak dapat menutup halaman login.
- Logout mengembalikan pengguna ke halaman login.
- Empat laboratorium virtual dan desain SOUNDLAB tetap dipertahankan.

## Konfigurasi
Atur `DATABASE_URL` dan `SESSION_SECRET` (minimal 32 karakter) di Vercel, lalu pastikan `database/schema.sql` telah dijalankan di Neon. Tanpa API dan Neon aktif, form menunjukkan status layanan belum siap dan tidak menyediakan login demo.

## Verifikasi
`npm test` dan `npm run build` lulus pada paket ini. Integrasi Neon dan deployment akun pemilik masih perlu diuji di Vercel.
