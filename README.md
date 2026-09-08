# Pusat Administrasi Guru V5 — Modern

Versi baru yang dibuat sebagai proyek terpisah dari V3/V4. Fokus utama:

- UI/UX modern dengan identitas visual teal.
- Program Tahunan (PROTA) dan Program Semester (PROMES) dengan editor tabel.
- CP, TP, ATP dengan generator backend yang tetap kompatibel.
- Modul Ajar 10 langkah dengan preview langsung.
- Ukuran dokumen global A4 (21 × 29,7 cm) dan F4/Folio (21 × 33 cm).
- Print browser dan ekspor Word HTML.
- Penyimpanan lokal untuk pengembangan/offline.
- Backend API lama dipertahankan agar integrasi database dan AI dapat dilanjutkan.

## Jalankan

```bash
npm install
npm start
```

Buka `http://localhost:3000`.

Untuk generator AI/Internet, salin `backend/.env.example` menjadi `.env` dan isi `OPENAI_API_KEY` sesuai kebutuhan deployment.
