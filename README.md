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
