# SOUNDLAB — Perbaikan Akses Halaman Login

Paket ini memperbaiki halaman awal agar form Masuk dan pilihan Buat Akun tetap terlihat dan dapat diisi meskipun pemeriksaan API Neon belum selesai atau konfigurasi belum tersedia.

## Yang diperbaiki
- Form login tetap interaktif; kolom email dan password tidak otomatis dinonaktifkan.
- Tombol Masuk dan pilihan Buat Akun tetap terlihat.
- Jika API/Neon tidak tersedia, halaman menampilkan pesan yang jelas; tidak ada login demo/palsu.
- Autentikasi tetap dilakukan oleh `/api/auth` menggunakan sesi server.
- Halaman laboratorium tetap dikunci sampai sesi pengguna tervalidasi oleh server.

## Jika setelah deploy tetap tidak bisa login
1. Di Vercel → Settings → Environment Variables, pastikan `DATABASE_URL` dan `SESSION_SECRET` tersedia untuk environment yang digunakan.
2. Pastikan `SESSION_SECRET` panjangnya minimal 32 karakter.
3. Pastikan `database/schema.sql` sudah dijalankan pada database Neon yang sesuai.
4. Deploy ulang, kemudian periksa `/api/config`. Respons normal berbentuk JSON dengan `enabled: true`.
5. Jika `/api/config` atau `/api/auth` memberi 404/500, periksa deployment functions dan log Vercel. Jangan mengubah role atau membuat login lokal sebagai jalan pintas.

## Build lokal
```bash
npm install
npm test
npm run build
```
