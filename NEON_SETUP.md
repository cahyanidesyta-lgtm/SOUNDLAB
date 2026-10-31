# SOUNDLAB — Setup Neon PostgreSQL dan Role Siswa/Guru

## 1. Buat database Neon (panduan pemula)

1. Buka <https://console.neon.tech> lalu **Sign up** atau **Log in**.
2. Dari dashboard, klik **New Project** / **Create Project**.
3. Isi nama project, misalnya `SOUNDLAB`. Pilih region yang paling dekat dengan mayoritas pengguna aplikasi, lalu klik **Create Project**. Biarkan pilihan database dan role bawaan jika belum ada kebutuhan khusus.
4. Setelah project terbuka, pilih **SQL Editor** dari navigasi project.
5. Pada pemilih di bagian atas SQL Editor, pastikan branch utama (biasanya `main` atau `production`) dan database bawaan project (biasanya `neondb`) sedang dipilih.
6. Buka file `database/schema.sql` dari ZIP SOUNDLAB menggunakan editor teks. Salin seluruh isinya, tempel ke SQL Editor Neon, lalu klik **Run**.
7. Buka menu **Tables** dan pastikan tabel `soundlab_users`, `soundlab_experiments`, `soundlab_classes`, dan `soundlab_class_students` sudah muncul.

Script ini memakai `CREATE TABLE IF NOT EXISTS`, jadi dapat dijalankan ulang tanpa menghapus tabel atau data yang sudah ada. Tetap pilih project dan branch yang benar sebelum menjalankannya.

## 2. Ambil alamat koneksi database

1. Di Neon Console, buka project SOUNDLAB lalu klik **Connect**.
2. Pilih branch, compute, database, dan role yang sama dengan tempat Anda menjalankan `schema.sql`.
3. Biarkan **Connection pooling** aktif untuk aplikasi Vercel (alamat pooled biasanya memiliki teks `-pooler` pada hostname).
4. Salin seluruh connection string PostgreSQL. Simpan sebagai rahasia; jangan kirim ke chat, screenshot, atau repository GitHub.

## 3. Hubungkan ke Vercel

1. Di Vercel, buka project SOUNDLAB → **Settings → Environment Variables**.
2. Tambahkan variabel berikut untuk **Production** (tambahkan **Preview** juga bila ingin menguji deployment preview):

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | Connection string yang disalin dari Neon |
   | `SESSION_SECRET` | String acak rahasia minimal 32 karakter; disarankan 64 karakter atau lebih |

3. Untuk membuat `SESSION_SECRET` acak di komputer yang memiliki Node.js, jalankan:

   ```bash
   node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
   ```

   Salin hasilnya sebagai nilai `SESSION_SECRET`. Jangan gunakan password database sebagai `SESSION_SECRET`.
4. Klik **Save**, lalu buka **Deployments** dan lakukan **Redeploy** pada deployment terbaru. Perubahan environment variable baru berlaku pada deployment berikutnya.
5. Buka `https://ALAMAT-PROJECT-ANDA.vercel.app/api/config`. Jika konfigurasi benar, respons harus menunjukkan `enabled: true`.

**Penting:** jangan menambahkan `DATABASE_URL` atau `SESSION_SECRET` ke file frontend, jangan menaruhnya di GitHub, dan jangan membagikan tangkapan layar yang menampilkan nilainya.

## 4. Tabel database yang digunakan

   - `soundlab_users` — profil dan role (`siswa`, `guru`, dan `admin` yang dipertahankan untuk kompatibilitas).
   - `soundlab_experiments` — riwayat eksperimen milik masing-masing akun.
   - `soundlab_classes` — kelas buatan guru dan kode bergabung.
   - `soundlab_class_students` — hubungan siswa dengan kelas.

## 5. Role siswa

- Siswa klik **Akun → Daftar**. Registrasi publik **selalu** menghasilkan role `siswa`, meskipun browser mencoba mengirim `guru`.
- Siswa dapat menggunakan empat lab, menyimpan dan menghapus **riwayat pribadi**.
- Menu **Kelas Saya → Gabung kelas**: masukkan kode 12 karakter yang guru bagikan.

## 6. Role guru

Untuk mencegah orang asing membuat akun guru, **pendaftaran guru publik dinonaktifkan**.

1. Guru membuat akun seperti siswa terlebih dahulu dengan email yang benar-benar ia kendalikan.
2. Administrator sekolah **memverifikasi identitas guru dan kepemilikan akun/email** sebelum memberikan akses guru. Tanpa verifikasi email otomatis, gunakan proses verifikasi langsung oleh administrator; jangan hanya mempercayai nama atau alamat email saat mendaftar.
3. Administrator membuka **SQL Editor** Neon lalu menjalankan perintah berikut setelah mengganti alamat email:

   ```sql
   UPDATE soundlab_users
   SET role = 'guru'
   WHERE email = 'email-guru-terverifikasi@sekolah.sch.id'
     AND role = 'siswa'
   RETURNING id, name, email, role;
   ```

4. Periksa apakah hasil mengembalikan **tepat satu** akun yang sudah diverifikasi; setelah guru memuat ulang aplikasi, role `guru` berlaku.
5. Guru membuka **Kelas Saya → Buat kelas**, membagikan kode 12 karakter kepada siswa di kelas terkait.
6. Guru melihat siswa dan hasil praktikum **hanya dari kelasnya**, bukan semua akun sekolah. Siswa harus bergabung menggunakan kode kelas lebih dulu. Riwayat pribadi guru tetap terpisah.

Role di server dibaca kembali dari Neon setiap kali ada permintaan API, sehingga mengganti role di database langsung mengubah izin. Role `admin` dari versi lama dipertahankan di schema, tetapi **tidak otomatis memiliki hak akses kelas**.

## 7. Verifikasi di Neon SQL Editor

```sql
SELECT role, COUNT(*) AS jumlah
FROM soundlab_users
GROUP BY role ORDER BY role;

SELECT c.name AS kelas, u.name AS guru, c.join_code
FROM soundlab_classes c
JOIN soundlab_users u ON u.id = c.teacher_id
ORDER BY c.created_at DESC;
```

Gunakan akun **uji** siswa dan guru untuk mencoba registrasi, kode kelas, penyimpanan eksperimen dan pembatasan tampilan. Jangan memakai data pribadi siswa saat pertama kali menguji.

## 8. Hal yang harus diamankan sebelum dipakai luas

- Tambahkan verifikasi email, alur reset password yang aman, rate limit/brute-force protection, monitoring dan kebijakan retensi data sebelum penggunaan sekolah secara luas.
- Bagikan kode kelas hanya kepada siswa berwenang. Kode kelas adalah mekanisme pendaftaran kelas, bukan pengganti autentikasi.
- Jangan memberikan role `guru` tanpa memeriksa identitas pemilik akun terlebih dahulu.
- Jalankan script SQL terhadap branch pengujian Neon terlebih dahulu bila database produksi sudah berisi data penting.

## 9. Tes lokal

```bash
npm run test
npm run build
npm run dev
```

`npm run dev` menampilkan **mode demo tanpa API Neon**. Fitur serverless aktif ketika dideploy di Vercel dengan dua variabel tadi. `npm run test` menguji sintaks dan skenario kontrol akses via mock, **bukan** integrasi dengan Neon asli.
