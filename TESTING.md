# SOUNDLAB — Laporan pengujian MVP

Tanggal pengujian: 12 Oktober 2026.

Pengujian interaksi menggunakan Chromium + Playwright dengan HTML/CSS/JS diinjeksikan langsung ke halaman pengujian (karena navigasi network browser pada lingkungan uji dibatasi). Tampilan desktop 1440×950 dan mobile 390×844 diperiksa.

| Kasus | Hasil |
|---|---|
| Halaman beranda ditampilkan | Lulus |
| Empat kartu laboratorium tampil | Lulus |
| Lab 2: slider 700 Hz memperbarui periode menjadi 1,43 ms | Lulus |
| Tombol audio memulai Web Audio API | Lulus (status audio aktif) |
| Menyimpan hasil praktikum ke storage demo | Lulus |
| Riwayat menunjukkan satu hasil tersimpan | Lulus |
| CSV dapat diunduh | Lulus |
| Navigasi Lab 1, 2, 3, 4 | Lulus |
| Lab 1: v udara ~343 m/s dan waktu 58,3 ms untuk 20 m | Lulus |
| Lab 3: suhu 25°C memberi v ~346,5 m/s | Lulus |
| Lab 4: pantulan pada jarak 45m memberi delay ~262 ms | Lulus |
| Toggle pengaturan kurangi gerakan | Lulus |
| Login mode demo dengan nama dan email | Lulus |
| Sidebar mobile dapat dibuka dan dipakai | Lulus |
| Error JavaScript browser selama skenario uji | 0 |
| Pemeriksaan sintaks semua JS via `npm test` | Lulus |

**Belum diuji:** koneksi dan transaksi Neon menggunakan DATABASE_URL sebenarnya; pengiriman suara terdengar secara subjektif melalui speaker fisik; Vercel deployment akun pengguna; simulasi kinerja pada semua browser/perangkat.
