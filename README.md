# Pusat Administrasi Guru V6 — Modern A4/F4 + AI Internet

V6 menambahkan generator Modul Ajar 10 bagian otomatis.

## 10 bagian
1. Identitas
2. Capaian Pembelajaran (CP)
3. Tujuan Pembelajaran (TP)
4. Alur Tujuan Pembelajaran (ATP)
5. Profil Pelajar Pancasila/karakter
6. Sarana & Prasarana
7. Model Pembelajaran
8. Langkah Pembelajaran
9. Asesmen
10. Lampiran (LKPD, bahan ajar, rubrik, daftar pustaka)

## Internet + AI
Endpoint `/api/generate-module-sections` menggunakan OpenAI Responses API + web search jika `OPENAI_API_KEY` tersedia. Sumber web dibatasi ke domain pendidikan resmi: `kemdikbud.go.id`, `kemendikdasmen.go.id`, `kurikulum.kemdikbud.go.id`, dan `rumah.pendidikan.go.id`.

Jika API key belum diatur, aplikasi memakai generator lokal sehingga UI tetap dapat dicoba.

Set `.env` di backend:
```
OPENAI_API_KEY=...
OPENAI_MODEL=...
```

Jangan menaruh API key di frontend.

## Tanda Tangan Modul Ajar
Pada langkah terakhir **Lampiran**, tersedia tombol **Masukkan Data Tanda Tangan**. Guru dapat mengisi:
- Tanggal Modul
- Nama Kepala Sekolah
- NIP Kepala Sekolah
- Nama Guru
- NIP Guru

Data disimpan di browser dan otomatis ditampilkan pada area tanda tangan di preview modul serta ikut tersimpan ketika modul disimpan. Area tanda tangan dibuat kosong agar dokumen dapat dicetak dan ditandatangani secara manual.

## V7 — Paket Perangkat Ajar Pembelajaran Mendalam

Versi ini memperluas generator perangkat agar hasil lebih lengkap dan saling terhubung.

### Rantai kurikulum
- CP: elemen/kompetensi, pemetaan, bukti ketercapaian, sumber.
- TP: tujuan terukur, indikator, asesmen, alokasi.
- ATP: urutan TP dari prasyarat → penerapan → refleksi/pengayaan.
- Program Semester (PROMES): minggu efektif, materi/TP, JP, kegiatan, asesmen, catatan.
- Program Tahunan (PROTA): distribusi Ganjil/Genap, minggu efektif, JP, ruang lingkup, catatan kalender.

### Modul Ajar Pembelajaran Mendalam
Generator 10 bagian sekarang meminta konten yang lebih lengkap:
- Identitas dan kompetensi awal
- CP, TP, ATP yang terhubung
- Pembelajaran Mendalam: berkesadaran, bermakna, menggembirakan
- Memahami → Mengaplikasi → Merefleksi
- 8 dimensi profil lulusan
- Diferensiasi konten/proses/produk
- Model pembelajaran otomatis
- Langkah pembelajaran rinci dan alokasi waktu
- Asesmen diagnostik, formatif, sumatif
- Kisi-kisi, instrumen, kunci/pedoman penskoran
- Rubrik 4 tingkat dan KKTP
- LKPD
- Bahan ajar/ringkasan materi
- Remedial dan pengayaan
- Refleksi siswa dan guru
- Glosarium dan daftar pustaka
- Halaman pengesahan/tanda tangan kepala sekolah dan guru

### Paket Lengkap
Tombol **Paket Lengkap / Generate Semua Perangkat** membuat rantai CP → TP → ATP → PROMES → PROTA lalu membuat Modul Ajar berdasarkan seluruh rantai tersebut.

### Sumber Internet + AI
Jika `OPENAI_API_KEY` tersedia, generator menggunakan web search melalui OpenAI dan membatasi sumber normatif utama pada domain pendidikan pemerintah. Hasil tetap harus diverifikasi guru sebelum menjadi dokumen resmi sekolah.

## Cetak Modul Ajar

Tombol **Cetak**, **PDF**, dan **Word** pada Modul Ajar menggunakan format dokumen khusus yang meniru struktur contoh: halaman sampul, identifikasi modul, desain pembelajaran (CP/TP/ATP dan komponen Pembelajaran Mendalam), langkah pembelajaran, asesmen, lampiran, lalu halaman pengesahan/tanda tangan. Ukuran kertas: A4 210×297 mm atau F4 210×330 mm. Konten yang telah digenerate dari AI maupun diedit guru akan digunakan sebagai sumber cetak.
