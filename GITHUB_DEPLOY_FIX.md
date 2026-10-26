# Perbaikan deploy Vercel: SOUNDLAB + Neon

## Penyebab error
Build pada repositori GitHub gagal karena `package.json` memeriksa `api/classes.js`, tetapi file tersebut belum ada pada branch `main`. Paket sumber lengkap juga memiliki `scripts/test-roles.js` dan pembaruan terkait API, skema database, serta tampilan kelas yang harus ikut tersinkron.

## Cara menerapkan dengan aman
1. Unduh ZIP `SOUNDLAB-Full-Stack-Neon-ROOT.zip`.
2. Ekstrak ZIP ke folder lokal hasil clone repositori `SOUNDLAB` (folder yang berisi `.git`). Pilih **Replace/Overwrite** bila diminta. Jangan menaruh seluruh proyek ke dalam subfolder tambahan.
3. Pastikan file berikut berada tepat di root repositori:
   - `package.json`
   - `api/classes.js`
   - `scripts/test-roles.js`
   - `lib/server.js`
   - `database/schema.sql`
   - `assets/app.js`
4. Jalankan `npm install` lalu `npm run build`. Build harus menampilkan `Tes akses lulus...` dan `SOUNDLAB build succeeded...`.
5. Commit dan push ke branch `main`. Vercel akan membuat deployment baru secara otomatis.
6. Di Neon SQL Editor, jalankan `database/schema.sql` jika skema terbaru belum diterapkan. Skrip memakai `CREATE TABLE IF NOT EXISTS` dan tidak menghapus tabel/data.
7. Pastikan Environment Variables Vercel `DATABASE_URL` dan `SESSION_SECRET` tersedia. `SESSION_SECRET` harus minimal 32 karakter acak; jangan masukkan nilainya ke repositori.

## Catatan
Jangan hanya mengunggah ZIP sebagai sebuah file ke GitHub. Vercel tidak mengekstrak ZIP itu secara otomatis; file proyek harus berada di root repositori. Jangan hapus database atau reset data untuk mengatasi error build ini.
