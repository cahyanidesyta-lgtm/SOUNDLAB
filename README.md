# SOUNDLAB — Virtual Sound Laboratory

**SOUNDLAB** adalah website eksperimen bunyi interaktif dengan palet merek:

- `#287A74` — hijau teal utama
- `#55A9A0` — teal muda
- `#AEEED3` — mint
- `#FFF8B0` — kuning lembut

## Yang sudah berjalan

- Dashboard responsif (desktop dan mobile).
- **Lab 1**: Perambatan bunyi — udara, air (cair), baja, ruang hampa; kecepatan & waktu tempuh dihitung.
- **Lab 2**: Frekuensi dan amplitudo — slider interaktif, generator suara speaker, bentuk gelombang sinus/segitiga/persegi/gigi gergaji, periode dan panjang gelombang.
- **Lab 3**: Cepat rambat — pengaruh suhu dan jarak terhadap waktu tempuh.
- **Lab 4**: Gema dan gaung — jarak pemantul, material permukaan, audio tertunda dengan umpan balik terbatas.
- Audio langsung menggunakan Web Audio API, dengan kontrol play/stop dan pengaturan gain yang konservatif.
- Grafik gelombang di canvas yang mengambil data analyser ketika generator aktif.
- Ilustrasi ruang 3D konseptual dengan rotasi lewat pointer/touch.
- Mikrofon opsional (HTTPS/localhost, izin pengguna) untuk menampilkan bentuk sinyal; **tidak dihubungkan ke speaker**.
- Simpan riwayat praktikum, unduh CSV, cetak/simpan PDF menggunakan dialog print browser.
- Halaman pertama wajib berupa login; dashboard dan laboratorium hanya tampil setelah sesi akun berhasil diverifikasi oleh server.
- Form Masuk memakai email dan password; Buat Akun memakai nama, email, dan password. Neon PostgreSQL adalah sumber autentikasi.
- API serverless untuk login/registrasi, kelas guru/siswa dan eksperimen ke Neon PostgreSQL setelah konfigurasi env.
- Favicon, logo SVG, icon PNG, serta manifest aplikasi.

## Cara menjalankan secara lokal

**Kebutuhan:** Node.js 22+. Untuk menguji login, siapkan database Neon dan jalankan aplikasi melalui deployment Vercel yang menjalankan API serverless.

```bash
cd SOUNDLAB
npm run dev
```

Buka <http://localhost:3000>. Alternatif: jalankan `python -m http.server 3000` dari folder `SOUNDLAB`.

**Catatan:** `npm run dev` cocok untuk memeriksa tampilan frontend secara lokal, tetapi login sengaja tidak dapat dilewati. Autentikasi memerlukan endpoint `/api` yang aktif dan variabel lingkungan Neon yang valid.

## Hubungkan Neon PostgreSQL

1. Buat project PostgreSQL di https://neon.tech.
2. Salin isi `database/schema.sql` ke SQL Editor Neon dan jalankan.
3. Di Vercel Project → Settings → Environment Variables, tambahkan:

   ```env
   DATABASE_URL=postgresql://... (connection string dari Neon)
   SESSION_SECRET=... (random kuat, MINIMAL 32 karakter)
   ```

   Untuk membuat secret, gunakan:

   ```bash
   node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
   ```

4. Redeploy project di Vercel. Status koneksi akun akan menunjukkan `Neon Terhubung` jika environment variables valid.
5. Registrasi dengan email, nama dan password (min. 8 karakter). Kata sandi di-hash menggunakan `scrypt` di server; cookie sesi bertanda tangan bersifat HttpOnly dan SameSite=Lax.
6. Pendaftaran publik membuat role `siswa`. Role `guru` hanya diberikan administrator setelah verifikasi identitas guru. Guru dapat membuat kelas dan melihat siswa serta hasil praktikum **yang tergabung dalam kelasnya**. Role `admin` dipertahankan untuk kompatibilitas, tetapi tidak memiliki dashboard admin.
7. Panduan terperinci dan perintah peningkatan role ada di [`NEON_SETUP.md`](NEON_SETUP.md).

**Penting:** Jangan pernah unggah `.env` atau connection string Neon ke GitHub. API login publik memerlukan rate limiting, reset password, verifikasi email, monitoring, dan proteksi tambahan sebelum digunakan secara luas di lingkungan sekolah.

## Upload GitHub + deploy Vercel

1. Ekstrak `SOUNDLAB.zip`, buat repository baru di GitHub, lalu upload **isi folder SOUNDLAB** ke root repo (sehingga `index.html` ada di root).
2. Masuk ke https://vercel.com/new dan import repository tersebut.
3. Pilih Framework Preset **Other**. Karena ini aplikasi HTML/CSS/JavaScript statis, aktifkan Override Build Command lalu **kosongkan** Build Command, sebagaimana panduan Vercel untuk static site.
4. Pastikan folder root proyek berisi `index.html`; tidak perlu output directory khusus.
5. Deploy. Halaman login akan menjadi tampilan awal. Form aktif setelah Neon dan endpoint autentikasi siap.
6. Jika menginginkan akun dan sinkronisasi database, ikuti bagian konfigurasi Neon di atas.

`api/config.js`, `api/auth.js`, `api/classes.js`, `api/experiments.js` adalah Vercel Serverless Functions berbasis Node.js, menggunakan driver `@neondatabase/serverless`. Frontend dapat disajikan secara statis, tetapi gate login tetap mengunci dashboard sampai sesi server terverifikasi; karena itu fungsi API dan Neon harus aktif untuk menggunakan aplikasi.

## Pemeriksaan

```bash
npm run test
npm run build
```

Perintah tersebut memeriksa sintaks semua berkas JS. Pengujian browser interaktif selama pembuatan mencakup navigasi ke empat lab, slider dan rumus, audio, penyimpanan lokal, ekspor CSV, form login awal, pendaftaran, penguncian workspace sebelum autentikasi, pengaturan, dan tata letak mobile (hasil tanpa kesalahan JavaScript pada lingkungan uji). **Integrasi Neon production dan deployment Vercel belum diuji dengan akun/kredensial milik pengguna.** Tes otomatis kontrol akses memakai mock dan tidak menggantikan pengujian integrasi langsung.

## Catatan ilmiah dan status MVP

- Visualisasi spasial sekarang merupakan **proyeksi 3D konseptual dengan CSS**, **bukan** simulasi WebGL/Three.js dan bukan pengukuran fisik nyata. Versi 3D tingkat lanjut dapat dikembangkan selanjutnya menggunakan Three.js / React Three Fiber.
- Kecepatan bunyi yang digunakan adalah angka pendekatan (misalnya udara 20 °C sekitar 343 m/s; air cair sekitar 1480 m/s; baja sekitar 5960 m/s). Nilainya dapat berubah sesuai kondisi fisik.
- Lab 3 menggunakan perkiraan kecepatan bunyi di udara `v ≈ 331,3 + 0,606 T` dengan `T` dalam °C.
- Lab 4 menggunakan delay model `t = 2d / v` dan refleksi sintetis berdasarkan material. Ini bukan model propagasi akustik 3D lengkap.
- Amplitudo slider adalah rasio gain digital, **bukan tingkat suara terkalibrasi (dB SPL)**. Selalu gunakan volume perangkat yang rendah.
- Dashboard kelas guru/siswa tersedia setelah menghubungkan Neon, dengan kode kelas dan pemantauan riwayat praktikum siswa yang tergabung. Belum ada LKPD, pretest/posttest, tugas kelas, laporan PDF khusus, atau dashboard admin.
- Akses internet dibutuhkan untuk memuat font DM Sans/Manrope dari Google Fonts. Jika offline, font sistem digunakan sebagai fallback.
