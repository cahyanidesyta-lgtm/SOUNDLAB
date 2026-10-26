# SOUNDLAB — Setup Neon PostgreSQL dan Role Siswa/Guru

## 1. Buat database

1. Buka <https://console.neon.tech> dan buat project PostgreSQL untuk SOUNDLAB.
2. Buka **SQL Editor**; pilih branch dan database proyek.
3. Salin seluruh `database/schema.sql` lalu klik **Run**. Perintah menggunakan `IF NOT EXISTS` dan tidak menghapus data yang sudah ada.
4. Di **Tables**, periksa empat tabel berikut:

   - `soundlab_users` — profil dan role (`siswa`, `guru`, dan `admin` yang dipertahankan untuk kompatibilitas).
   - `soundlab_experiments` — riwayat eksperimen milik masing-masing akun.
   - `soundlab_classes` — kelas buatan guru dan kode bergabung.
   - `soundlab_class_students` — hubungan siswa dengan kelas.

## 2. Hubungkan ke Vercel

1. Di Neon Console klik **Connect** dan salin connection string dari database yang benar.
2. Di Vercel, buka project SOUNDLAB → **Settings → Environment Variables**.
3. Tambahkan variabel **rahasia** berikut untuk `Production` (serta `Preview` jika memerlukan environment pengujian):

   | Nama | Nilai |
   |---|---|
   | `DATABASE_URL` | connection string PostgreSQL dari Neon, termasuk `sslmode=require` jika disertakan |
   | `SESSION_SECRET` | nilai acak panjang minimal 32 karakter (lebih baik 64+) |

   Buat `SESSION_SECRET` di terminal lokal dengan perintah:

   ```bash
   node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
   ```

4. **Redeploy** Vercel agar variabel terbaca oleh API. Pakai endpoint `https://<alamat-app-anda>/api/config` untuk cek `enabled: true`.
5. Jangan membagikan `DATABASE_URL`, `SESSION_SECRET`, screenshot yang menampilkan rahasia, atau menyimpannya dalam kode publik/GitHub.

**Catatan:** Database dan variabel pada akun Neon/Vercel belum dibuat otomatis oleh berkas ini. Langkah tersebut memerlukan akses dari pemilik akun.

## 3. Role siswa

- Siswa klik **Akun → Daftar**. Registrasi publik **selalu** menghasilkan role `siswa`, meskipun browser mencoba mengirim `guru`.
- Siswa dapat menggunakan empat lab, menyimpan dan menghapus **riwayat pribadi**.
- Menu **Kelas Saya → Gabung kelas**: masukkan kode 12 karakter yang guru bagikan.

## 4. Role guru

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

## 5. Verifikasi di Neon SQL Editor

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

## 6. Hal yang harus diamankan sebelum dipakai luas

- Tambahkan verifikasi email, alur reset password yang aman, rate limit/brute-force protection, monitoring dan kebijakan retensi data sebelum penggunaan sekolah secara luas.
- Bagikan kode kelas hanya kepada siswa berwenang. Kode kelas adalah mekanisme pendaftaran kelas, bukan pengganti autentikasi.
- Jangan memberikan role `guru` tanpa memeriksa identitas pemilik akun terlebih dahulu.
- Jalankan script SQL terhadap branch pengujian Neon terlebih dahulu bila database produksi sudah berisi data penting.

## 7. Tes lokal

```bash
npm run test
npm run build
npm run dev
```

`npm run dev` menampilkan **mode demo tanpa API Neon**. Fitur serverless aktif ketika dideploy di Vercel dengan dua variabel tadi. `npm run test` menguji sintaks dan skenario kontrol akses via mock, **bukan** integrasi dengan Neon asli.
