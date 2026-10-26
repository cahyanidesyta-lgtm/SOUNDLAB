# SOUNDLAB Full-Stack Package

Paket ini berisi aplikasi SOUNDLAB lengkap: frontend laboratorium virtual, API serverless Node.js untuk autentikasi dan data praktikum, role siswa/guru, manajemen kelas, skema PostgreSQL Neon, konfigurasi Vercel, aset publik hasil build, serta dokumentasi dan tes.

## Pasang

1. Ekstrak ZIP ini.
2. Buat project PostgreSQL di Neon, lalu jalankan `database/schema.sql` pada SQL Editor.
3. Upload isi folder proyek ke repository GitHub (pastikan `package.json`, `index.html`, `api/`, `lib/`, dan `database/` berada di root repository).
4. Import repository di Vercel dengan Framework Preset `Other`; biarkan konfigurasi build/output mengikuti `vercel.json` (`npm run build`, output `public`).
5. Tambahkan `DATABASE_URL` dan `SESSION_SECRET` di Vercel → Settings → Environment Variables. Gunakan secret acak minimal 32 karakter; jangan menaruh kredensial di source code atau ZIP.
6. Redeploy, lalu buka `/api/config` dan pastikan respons menyatakan `enabled: true`.
7. Buat akun guru lewat pendaftaran biasa, verifikasi identitas dan kepemilikan emailnya, kemudian administrator mengubah role akun tersebut menjadi `guru` menggunakan petunjuk di `NEON_SETUP.md`. Pendaftaran publik selalu menghasilkan role `siswa`.

## Tes

Jalankan dengan Node.js 22:

```bash
npm test
npm run build
npm run dev
```

`npm test` dan `npm run build` sudah dijalankan sebelum paket dibuat dan lulus. `npm run dev` adalah mode demo lokal; API Neon sungguhan aktif setelah deployment Vercel dengan variabel lingkungan yang benar. Koneksi Neon dan deployment pada akun pengguna belum diuji karena memerlukan akses akun pemilik.

## Isi utama

- `assets/` — UI, stylesheet, audio, ikon, dan logika frontend
- `api/` — endpoint konfigurasi, autentikasi, eksperimen, dan kelas
- `lib/server.js` — koneksi Neon, sesi, hashing kata sandi, validasi origin
- `database/schema.sql` — tabel akun, eksperimen, kelas, dan anggota kelas
- `scripts/` — build, server demo lokal, dan tes kontrol akses
- `public/` — aset statis hasil build untuk deployment
- `README.md`, `NEON_SETUP.md`, `TESTING.md` — dokumentasi penggunaan, instalasi, dan pengujian

Paket tidak menyertakan `node_modules`, file `.env`, password, connection string, atau secret.
