# Revisi Login dan Beranda SOUNDLAB

## Perubahan
- Form **Masuk** menggunakan email dan kata sandi.
- Form **Buat akun** menggunakan nama lengkap, email, dan kata sandi minimal 8 karakter.
- Tab Masuk/Buat akun hanya aktif ketika API autentikasi Neon tersedia.
- Login/registrasi tidak lagi berpura-pura berhasil dalam mode demo ketika Neon belum terhubung.
- Status koneksi akun terlihat di bagian atas halaman dan penjelasan kondisi tersedia di form.
- Halaman pertama langsung menampilkan form login layar penuh, bukan dashboard/beranda.
- Workspace dan audio dock disembunyikan sampai sesi login terverifikasi.
- Pengunjung yang belum masuk tidak dapat menutup form atau melewati autentikasi melalui klik latar maupun tombol Escape.
- Setelah logout, pengguna kembali ke halaman login. Empat laboratorium virtual tetap dipertahankan setelah autentikasi.
- Identitas pengguna tidak lagi dibaca sebagai sesi tepercaya dari `localStorage`; sesi diverifikasi melalui endpoint server dengan cookie HttpOnly.
- Pendaftaran dari halaman publik selalu membuat role `siswa`. Role guru/admin harus ditetapkan melalui proses administrasi yang terpisah.
- Desain form dan ajakan akun responsif untuk layar desktop maupun ponsel.

## Konfigurasi Vercel
Pastikan Environment Variables berikut sudah diatur:
- `DATABASE_URL`: connection string PostgreSQL Neon.
- `SESSION_SECRET`: rahasia acak minimal 32 karakter.

Kemudian deploy ulang. API `/api/config` harus mengembalikan `enabled: true` dan pemeriksaan sesi `/api/auth?action=me` harus merespons HTTP 200.

## Verifikasi
Jalankan:

```bash
npm run build
```

Build menjalankan pemeriksaan sintaks, tes role API, tes UI login/daftar, lalu menghasilkan folder `public/` untuk Vercel.

## Alur halaman awal
- Sesi valid dari server: langsung masuk ke workspace.
- Belum login: form Masuk tampil sebagai halaman pertama.
- Belum ada akun: pilih Buat Akun setelah layanan Neon aktif.
- Neon/API belum siap: form menampilkan status konfigurasi dan tidak mengizinkan login demo.
