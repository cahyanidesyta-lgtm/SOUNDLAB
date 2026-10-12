# SOUNDLAB — Perbaikan Vercel (Missing public directory)

Vercel sebelumnya menjalankan `npm run build`, tetapi skrip build hanya melakukan pemeriksaan sintaks. Karena Output Directory di Vercel disetel ke `public`, deploy gagal saat tidak menemukan folder tersebut.

## Perbaikan
- `package.json`: `npm run build` kini menjalankan pengujian sintaks lalu `node scripts/build.js`.
- `scripts/build.js`: membuat ulang `public/` dan menyalin HTML, CSS, JS browser, logo, favicon, dan manifest; **tidak** mempublikasikan `api/`, `lib/`, atau `database/`.
- `vercel.json`: menyetel `buildCommand` ke `npm run build` dan `outputDirectory` ke `public`.
- `.gitignore`: mengabaikan direktori hasil build `public/`.
- Mengunci Node.js ke `22.x` pada `package.json` agar tidak otomatis mengikuti major version baru.

## Cara memasang patch di GitHub
1. Ekstrak `SOUNDLAB-vercel-hotfix.zip`.
2. Unggah/replace `package.json`, `vercel.json`, `.gitignore` dan tambahkan `scripts/build.js` ke ROOT repo `SOUNDLAB`.
3. Commit ke branch `main` agar Vercel membuat deployment baru.
4. Di Vercel, pilih Framework Preset **Other**, Root Directory root repository, lalu pastikan Build Command `npm run build` dan Output Directory `public`. Konfigurasi `vercel.json` juga memaksakan nilai ini.
5. Periksa build log menampilkan: `SOUNDLAB build succeeded. Generated public/index.html and public/assets/.`.

## Tes lokal
```sh
npm run build
```
Harus muncul `public/index.html`, `public/assets/app.js`, `public/assets/style.css`, dll.

### Batasan
Pengujian lokal lulus; belum diuji di akun Vercel Anda. Neon Auth/login sungguhan membutuhkan konfigurasi env dan schema SQL sesuai README.
