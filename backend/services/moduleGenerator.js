const OFFICIAL_SOURCES = [
  'https://kurikulum.kemdikbud.go.id/',
  'https://internal-portal.kemdikbud.go.id/program/312-ruang-gtk'
];

function esc(s='') {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function list(items=[]) { return `<ul>${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`; }

function defaultMinutes(level='SD') {
  return level === 'SD' ? 70 : level === 'SMP' ? 80 : 90;
}

function splitMinutes(total) {
  total = Math.max(30, Number(total) || 70);
  let opening = Math.max(10, Math.round((total * 0.15) / 5) * 5);
  let closing = Math.max(10, Math.round((total * 0.15) / 5) * 5);
  let core = total - opening - closing;
  if (core < 10) {
    core = 10;
    opening = Math.max(10, Math.round((total - core) / 2 / 5) * 5);
    closing = total - core - opening;
  }
  return { total, opening, core, closing };
}



export function recommendLearningModel({subject='', chapter='', objectivesText='', linkedTP='', linkedATP=''}) {
  const text = `${subject} ${chapter} ${objectivesText} ${linkedTP} ${linkedATP}`.toLowerCase();
  const scores = { PBL: 0, PjBL: 0, Inquiry: 0, Discovery: 0, 'Problem Solving': 0, 'Cooperative Learning': 0 };
  const add = (model, words, points=2) => words.forEach(w => { if (text.includes(w)) scores[model] += points; });

  add('PjBL', ['proyek','produk','karya','merancang','membuat','menghasilkan','pameran','presentasi produk'], 4);
  add('PBL', ['masalah','problem','kasus','solusi','memecahkan','pemecahan masalah','kontekstual','menentukan solusi'], 4);
  add('Inquiry', ['menyelidiki','penyelidikan','investigasi','menguji','hipotesis','mengumpulkan data','menganalisis data','menemukan bukti'], 4);
  add('Discovery', ['menemukan konsep','menemukan pola','mengidentifikasi pola','menggeneralisasi','eksplorasi konsep','menemukan hubungan'], 4);
  add('Problem Solving', ['menghitung','menyelesaikan soal','strategi penyelesaian','langkah penyelesaian','algoritma','perhitungan','menerapkan rumus'], 3);
  add('Cooperative Learning', ['bekerja sama','kolaborasi','diskusi kelompok','berbagi peran','saling membantu','kelompok'], 2);
  // Kata kerja operasional pada TP menjadi sinyal utama pemilihan model.
  add('PjBL', ['menciptakan','merancang','mengembangkan produk','menghasilkan karya','membuat model','membuat poster','membuat laporan proyek'], 5);
  add('PBL', ['menganalisis masalah','menentukan solusi','mengevaluasi solusi','memecahkan masalah'], 5);
  add('Inquiry', ['mengajukan pertanyaan','merumuskan hipotesis','mengumpulkan bukti','menguji hipotesis','menarik kesimpulan berdasarkan data'], 5);
  add('Discovery', ['menemukan','mengidentifikasi pola','menyimpulkan pola','menemukan prinsip','menemukan konsep'], 5);
  add('Problem Solving', ['menggunakan strategi','memilih strategi','menyelesaikan permasalahan','menghitung dengan tepat','menentukan hasil'], 4);
  add('Cooperative Learning', ['mempresentasikan hasil kelompok','berbagi tugas','bekerja dalam kelompok','memberikan tanggapan kepada kelompok'], 4);

  // Tie-breaker berdasarkan karakter umum tujuan pembelajaran.
  if (scores.PjBL === 0 && /proyek|produk|karya|merancang|membuat/.test(text)) scores.PjBL += 3;
  if (scores.PBL === 0 && /masalah|kasus|kontekstual/.test(text)) scores.PBL += 3;
  if (scores['Problem Solving'] === 0 && /matematika|menghitung|pecahan|persamaan|perbandingan|bangun/.test(text)) scores['Problem Solving'] += 2;
  if (scores.Inquiry === 0 && /ipa|ipас|sains|fisika|kimia|biologi|mengamati|menguji/.test(text)) scores.Inquiry += 2;

  const priority = ['PBL','PjBL','Inquiry','Discovery','Problem Solving','Cooperative Learning'];
  const model = priority.reduce((best, key) => scores[key] > scores[best] ? key : best, priority[0]);
  const rationale = {
    PBL: 'TP menekankan pemecahan masalah nyata/kontekstual dan penyusunan solusi.',
    PjBL: 'TP menekankan perancangan dan pembuatan produk/karya/proyek.',
    Inquiry: 'TP menekankan penyelidikan, pengumpulan data, pengujian, dan pembuktian.',
    Discovery: 'TP menekankan penemuan konsep, pola, hubungan, atau generalisasi.',
    'Problem Solving': 'TP menekankan penerapan strategi dan langkah penyelesaian masalah/soal.',
    'Cooperative Learning': 'TP kuat pada kolaborasi, pembagian peran, dan interaksi antarpeserta didik.'
  }[model];
  return { model, rationale, scores };
}

function buildIntegratedLearningMaterials({subject, chapter, model, objectives, allocation}) {
  const obj = (objectives || []).map((x,i)=>`${i+1}. ${x}`).join('<br>');
  return `
<h2>LKPD (Lembar Kerja Peserta Didik)</h2>
<p><b>Petunjuk:</b> Kerjakan secara berkelompok/individu sesuai arahan guru. Gunakan informasi pada bahan ajar dan buktikan jawaban melalui langkah kerja yang tersedia.</p>
<h3>Identitas LKPD</h3>
<table border="1" cellpadding="6" cellspacing="0">
<tr><td>Materi</td><td>${esc(chapter)}</td></tr>
<tr><td>Mata Pelajaran</td><td>${esc(subject)}</td></tr>
<tr><td>Model Pembelajaran</td><td>${esc(model)}</td></tr>
<tr><td>Tujuan Pembelajaran</td><td>${obj}</td></tr>
</table>
<h3>Aktivitas LKPD</h3>
<ol>
<li><b>Mengamati:</b> Amati contoh/permasalahan yang disajikan guru.</li>
<li><b>Menanya:</b> Tuliskan minimal dua pertanyaan yang muncul dari hasil pengamatan.</li>
<li><b>Mengeksplorasi:</b> Lakukan langkah kerja, catat data/temuan, dan gunakan konsep pada bahan ajar.</li>
<li><b>Menganalisis:</b> Diskusikan hasil dan berikan alasan berdasarkan bukti.</li>
<li><b>Mengomunikasikan:</b> Sajikan hasil pekerjaan dan tanggapi masukan kelompok lain.</li>
</ol>
<h3>Tabel Hasil Kerja</h3>
<table border="1" cellpadding="6" cellspacing="0">
<tr><th>No.</th><th>Temuan/Data</th><th>Analisis</th><th>Kesimpulan</th></tr>
<tr><td>1</td><td>&nbsp;<br>&nbsp;</td><td>&nbsp;<br>&nbsp;</td><td>&nbsp;<br>&nbsp;</td></tr>
<tr><td>2</td><td>&nbsp;<br>&nbsp;</td><td>&nbsp;<br>&nbsp;</td><td>&nbsp;<br>&nbsp;</td></tr>
<tr><td>3</td><td>&nbsp;<br>&nbsp;</td><td>&nbsp;<br>&nbsp;</td><td>&nbsp;<br>&nbsp;</td></tr>
</table>
<h3>Refleksi Peserta Didik</h3>
<p>1. Hal yang paling saya pahami: ________________________________</p>
<p>2. Hal yang masih sulit: _______________________________________</p>
<p>3. Strategi saya untuk memperbaikinya: __________________________</p>

<h2>Bahan Ajar</h2>
<h3>Ringkasan Materi</h3>
<p><b>${esc(chapter)}</b> adalah materi yang dipelajari untuk mencapai tujuan pembelajaran berikut:</p>
<ul>${(objectives || []).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
<h3>Penjelasan Konsep</h3>
<p>Guru menyajikan konsep utama secara bertahap, menggunakan contoh kontekstual, istilah penting, prosedur/langkah penyelesaian, dan contoh penerapan dalam kehidupan sehari-hari. Peserta didik diarahkan membandingkan contoh dan noncontoh serta menjelaskan alasan dari jawabannya.</p>
<h3>Contoh Penerapan</h3>
<ol>
<li>Identifikasi masalah atau situasi.</li>
<li>Tentukan konsep yang relevan.</li>
<li>Lakukan langkah penyelesaian secara runtut.</li>
<li>Periksa kembali hasil dan jelaskan alasannya.</li>
</ol>
<h3>Kosakata Penting</h3>
<p><b>Konsep:</b> gagasan utama yang menjadi dasar pemahaman materi.<br>
<b>Prosedur:</b> urutan langkah untuk menyelesaikan tugas atau masalah.<br>
<b>Bukti:</b> data atau alasan yang digunakan untuk mendukung kesimpulan.</p>
<h3>Latihan Mandiri</h3>
<ol><li>Jelaskan kembali konsep utama dengan kata-kata sendiri.</li><li>Berikan satu contoh penerapan.</li><li>Selesaikan satu masalah kontekstual dan jelaskan langkahnya.</li></ol>

<h2>Asesmen Terintegrasi</h2>
<h3>Asesmen Diagnostik</h3>
<ol><li>Apa yang sudah kamu ketahui tentang ${esc(chapter)}?</li><li>Berikan satu contoh yang berkaitan dengan materi.</li><li>Bagian mana yang menurutmu paling sulit?</li></ol>
<h3>Asesmen Formatif</h3>
<table border="1" cellpadding="6" cellspacing="0">
<tr><th>Indikator</th><th>Teknik</th><th>Bukti</th><th>Kriteria</th></tr>
<tr><td>Pemahaman konsep</td><td>Tanya jawab/kuis</td><td>Jawaban peserta didik</td><td>Benar dan disertai alasan</td></tr>
<tr><td>Keterampilan proses</td><td>Observasi</td><td>LKPD/proses kerja</td><td>Langkah runtut dan tepat</td></tr>
<tr><td>Komunikasi</td><td>Presentasi</td><td>Paparan hasil</td><td>Jelas, logis, dan responsif</td></tr>
</table>
<h3>Asesmen Sumatif</h3>
<ol>
<li>Soal pemahaman konsep: jelaskan konsep utama materi.</li>
<li>Soal penerapan: selesaikan permasalahan kontekstual.</li>
<li>Soal penalaran: berikan alasan/bukti atas jawabanmu.</li>
</ol>
<h3>Rubrik Penilaian</h3>
<table border="1" cellpadding="6" cellspacing="0">
<tr><th>Aspek</th><th>4 - Sangat Baik</th><th>3 - Baik</th><th>2 - Cukup</th><th>1 - Perlu Bimbingan</th></tr>
<tr><td>Konsep</td><td>Tepat dan mendalam</td><td>Tepat</td><td>Sebagian tepat</td><td>Belum tepat</td></tr>
<tr><td>Proses/LKPD</td><td>Runtut, mandiri, bukti lengkap</td><td>Runtut, sedikit bantuan</td><td>Belum konsisten</td><td>Perlu bimbingan</td></tr>
<tr><td>Komunikasi</td><td>Jelas, logis, mampu menjawab</td><td>Jelas</td><td>Kurang runtut</td><td>Belum mampu menjelaskan</td></tr>
</table>
<p><b>Catatan:</b> Instrumen asesmen otomatis ini merupakan bagian dari Modul Ajar dan dapat diedit guru sebelum digunakan.</p>
`;
}

export function buildFallbackModule({level, grade, section, subject, chapter, model='AUTO', semester='Ganjil', academicYear='2026/2027', webSources=[], allocationMinutes, linkedCP='', linkedTP='', linkedATP='', linkedProsem='', linkedProta=''}) {
  const recommendation = model === 'AUTO' ? recommendLearningModel({subject, chapter, linkedTP, linkedATP}) : {model, rationale:'Model dipilih sesuai parameter yang diberikan.'};
  model = recommendation.model;
  const phase = level === 'SD' ? (grade <= 2 ? 'A' : grade <= 4 ? 'B' : 'C') : level === 'SMP' ? 'D' : 'E';
  const allocation = splitMinutes(Number(allocationMinutes) || defaultMinutes(level));
  const duration = level === 'SD' ? `${Math.round(allocation.total/35)} × 35 menit` : level === 'SMP' ? `${Math.round(allocation.total/40)} × 40 menit` : `${Math.round(allocation.total/45)} × 45 menit`;
  const sources = [...OFFICIAL_SOURCES, ...webSources].filter((v,i,a)=>v && a.indexOf(v)===i);
  const objectives = [
    `Peserta didik menjelaskan konsep utama ${chapter} dengan istilah yang tepat.`,
    `Peserta didik menerapkan konsep ${chapter} pada contoh atau masalah kontekstual.`,
    `Peserta didik mengomunikasikan hasil kerja dan memberikan alasan berdasarkan bukti atau langkah penyelesaian.`,
    `Peserta didik melakukan refleksi terhadap strategi belajar dan tindak lanjutnya.`
  ];
  const activities = model === 'PBL'
    ? ['Orientasi pada masalah kontekstual','Mengorganisasi peserta didik dan membagi tugas','Membimbing penyelidikan individu/kelompok','Mengembangkan dan mempresentasikan solusi','Menganalisis proses pemecahan masalah dan refleksi']
    : model === 'PjBL'
    ? ['Menentukan pertanyaan pemantik/proyek','Merancang langkah dan produk','Menyusun jadwal dan pembagian tugas','Mengerjakan, memantau, dan memperbaiki produk','Presentasi produk, asesmen, dan refleksi']
    : ['Eksplorasi pengetahuan awal','Mengamati dan mengumpulkan informasi','Mengolah informasi melalui latihan/kolaborasi','Mengomunikasikan hasil','Refleksi dan tindak lanjut'];
  return `
<h1>MODUL AJAR — ${esc(subject)}: ${esc(chapter)}</h1>
<p><b>Jenjang:</b> ${esc(level)} &nbsp; <b>Kelas:</b> ${grade}${esc(section)} &nbsp; <b>Fase:</b> ${phase} &nbsp; <b>Semester:</b> ${esc(semester)} &nbsp; <b>Tahun Ajaran:</b> ${esc(academicYear)}</p>
<h2>A. Informasi Umum</h2>
<p><b>Identitas:</b> ${esc(subject)} · ${esc(level)} Kelas ${grade}${esc(section)} · Materi ${esc(chapter)}</p>
<p><b>Alokasi waktu:</b> ${duration}. <b>Model Pembelajaran Otomatis:</b> ${esc(model)}.</p><p><b>Dasar pemilihan model:</b> ${esc(recommendation.rationale)} Model ini dipilih sistem berdasarkan karakter Tujuan Pembelajaran/TP dan ATP yang terhubung.</p>
<p><b>Kompetensi awal:</b> Peserta didik memiliki pengalaman awal yang berkaitan dengan konsep dasar materi dan mampu mengikuti instruksi sederhana, berdiskusi, serta menggunakan sumber belajar yang tersedia.</p>
<p><b>Profil Pelajar Pancasila/karakter:</b> bernalar kritis, mandiri, gotong royong, kreatif, dan berakhlak sesuai konteks pembelajaran.</p>
<p><b>Sarana dan prasarana:</b> papan tulis/proyektor, LKPD, buku/sumber digital, alat tulis, dan perangkat sesuai kebutuhan materi.</p>
<p><b>Target peserta didik:</b> reguler dengan penyesuaian bagi peserta didik yang memerlukan dukungan tambahan.</p>
<h2>B. Komponen Inti</h2>
<h3>Capaian/arah pembelajaran</h3>
<p>Pembelajaran diarahkan pada pencapaian kompetensi fase ${phase} dan tujuan pembelajaran yang relevan dengan ${esc(subject)} serta konteks ${esc(chapter)}. CP resmi perlu disesuaikan dengan dokumen kurikulum sekolah dan regulasi terbaru.</p>
<h3>Tujuan Pembelajaran</h3>${list(objectives)}
<h3>Pemahaman Bermakna</h3><p>Peserta didik memahami bahwa ${esc(chapter)} bukan sekadar konsep untuk dihafal, tetapi dapat digunakan untuk membaca situasi, mengambil keputusan, memecahkan masalah, dan menjelaskan fenomena di lingkungan sekitar.</p>
<h3>Pertanyaan Pemantik</h3>${list([`Apa yang sudah kamu ketahui tentang ${chapter}?`,`Mengapa ${chapter} penting dalam kehidupan sehari-hari?`,`Bagaimana kita dapat membuktikan atau menjelaskan jawaban kita?`])}
<h3>Persiapan Guru</h3>${list(['Memeriksa kesiapan sarana dan sumber belajar.','Menyiapkan asesmen diagnostik singkat.','Menyesuaikan contoh dengan konteks lokal dan kebutuhan peserta didik.','Menentukan kelompok dan pembagian tugas jika diperlukan.'])}
<h3>Alokasi Waktu Terperinci</h3>
<table border="1" cellpadding="6" cellspacing="0"><tr><th>Tahap</th><th>Waktu</th><th>Rincian</th></tr>
<tr><td>Pendahuluan</td><td><b>${allocation.opening} menit</b></td><td>Salam, apersepsi, motivasi, asesmen awal singkat, penyampaian tujuan dan kriteria keberhasilan.</td></tr>
<tr><td>Inti</td><td><b>${allocation.core} menit</b></td><td>Eksplorasi/penyelidikan, aktivitas model ${esc(model)}, diskusi, latihan/produk, presentasi, umpan balik dan asesmen formatif.</td></tr>
<tr><td>Penutup</td><td><b>${allocation.closing} menit</b></td><td>Kesimpulan, refleksi, umpan balik, tindak lanjut, remedial/pengayaan dan penugasan bila diperlukan.</td></tr>
<tr><th>Total</th><th><b>${allocation.total} menit</b></th><th>Jumlah waktu seluruh tahap.</th></tr></table>
<h3>Kegiatan Pembelajaran</h3>
<h4>Pendahuluan — ${allocation.opening} menit</h4>${list(['Salam, apersepsi, dan pengecekan kesiapan belajar.','Mengaitkan materi dengan pengalaman nyata peserta didik.','Menyampaikan tujuan, kriteria keberhasilan, dan aktivitas pembelajaran.'])}
<h4>Inti — ${esc(model)} — ${allocation.core} menit</h4>${list(activities)}
<h4>Penutup — ${allocation.closing} menit</h4>${list(['Peserta didik menyampaikan kesimpulan.','Guru memberikan umpan balik dan meluruskan miskonsepsi.','Peserta didik mengisi refleksi singkat.','Guru menyampaikan tindak lanjut/remedial/pengayaan.'])}
<h2>C. Asesmen</h2>
<h3>Diagnostik</h3><p>Pertanyaan awal/lisan atau kuis singkat untuk memetakan pengetahuan prasyarat dan miskonsepsi.</p>
<h3>Formatif</h3>${list(['Observasi partisipasi dan kolaborasi.','Pemeriksaan LKPD/proses kerja.','Pertanyaan cek pemahaman.','Umpan balik selama proses.'])}
<h3>Sumatif</h3><p>Tugas/tes/produk yang mengukur ketercapaian tujuan pembelajaran. Bentuk dan bobot disesuaikan dengan karakteristik ${esc(subject)} dan kebijakan sekolah.</p>
<h3>Rubrik ringkas</h3><table border="1" cellpadding="6" cellspacing="0"><tr><th>Aspek</th><th>4</th><th>3</th><th>2</th><th>1</th></tr><tr><td>Pemahaman konsep</td><td>Sangat tepat</td><td>Tepat</td><td>Sebagian tepat</td><td>Perlu bimbingan</td></tr><tr><td>Penerapan</td><td>Mandiri dan tepat</td><td>Tepat dengan sedikit bantuan</td><td>Masih perlu arahan</td><td>Belum mampu</td></tr><tr><td>Komunikasi</td><td>Jelas dan berbasis alasan</td><td>Jelas</td><td>Kurang runtut</td><td>Belum jelas</td></tr></table>
<h2>D. Diferensiasi</h2>${list(['Konten: gunakan contoh bertingkat sesuai kesiapan.','Proses: sediakan pendampingan, kelompok fleksibel, atau langkah kerja bertahap.','Produk: beri pilihan bentuk hasil kerja yang tetap mengukur tujuan yang sama.'])}
<h2>E. Remedial dan Pengayaan</h2><p><b>Remedial:</b> pembelajaran ulang dengan contoh lebih sederhana, latihan bertahap, dan pendampingan. <b>Pengayaan:</b> masalah lebih kompleks, proyek kecil, atau penerapan lintas konteks.</p>
<h2>F. Refleksi</h2><p><b>Refleksi peserta didik:</b> Apa yang saya pahami? Bagian mana yang masih sulit? Strategi apa yang membantu saya?</p><p><b>Refleksi guru:</b> Apakah tujuan tercapai? Miskonsepsi apa yang muncul? Penyesuaian apa yang perlu dilakukan pada pertemuan berikutnya?</p>
<h2>G. Lampiran yang Disiapkan</h2>${list(['LKPD/lembar aktivitas','Instrumen asesmen diagnostik','Instrumen asesmen formatif','Instrumen asesmen sumatif','Rubrik penilaian','Bahan bacaan/media','Kunci jawaban atau contoh jawaban bila relevan'])}
<h2>H. Sumber dan Referensi Internet</h2><p>Modul ini dibuat sebagai konten baru berdasarkan kebutuhan pembelajaran dan perlu divalidasi guru sebelum digunakan. Referensi internet yang digunakan/ditelusuri:</p>${list(sources)}
<p><i>Catatan: CP, TP, ATP, contoh, asesmen, dan aktivitas perlu disesuaikan dengan dokumen kurikulum sekolah, fase, karakteristik peserta didik, dan regulasi yang berlaku.</i></p>`;
}

export function buildPrompt({level, grade, section, subject, chapter, model='AUTO', semester, academicYear, focus='', allocationMinutes, linkedCP='', linkedTP='', linkedATP='', linkedProsem='', linkedProta=''}) {
  const allocation = splitMinutes(Number(allocationMinutes) || defaultMinutes(level));
  const recommendation = model === 'AUTO' ? recommendLearningModel({subject, chapter, linkedTP, linkedATP}) : {model, rationale:'Model dipilih sesuai parameter yang diberikan.'};
  model = recommendation.model;
  return `Buat MODUL AJAR LENGKAP berbahasa Indonesia untuk guru Indonesia. Gunakan web search untuk memeriksa sumber terbaru dan utamakan domain resmi pemerintah pendidikan Indonesia (kurikulum.kemdikbud.go.id, kemdikbud.go.id, kemendikdasmen.go.id, rumah.pendidikan.go.id/ruang GTK bila tersedia). Jangan menyalin modul ajar pihak lain. Tulis konten baru dan ringkas sumber dengan kata-kata sendiri.

Konteks: Jenjang ${level}, kelas ${grade}, rombel ${section}, mata pelajaran ${subject}, materi/bab ${chapter}, semester ${semester}, tahun ajaran ${academicYear}. Model pembelajaran dipilih OTOMATIS menjadi: ${model}. Alasan: ${recommendation.rationale}. Konteks tambahan guru: ${focus || 'tidak ada'}.

ALOKASI WAKTU WAJIB: total ${allocation.total} menit. Pendahuluan ${allocation.opening} menit, Inti ${allocation.core} menit, Penutup ${allocation.closing} menit. Angka harus persis dan jumlah ketiganya harus sama dengan total.

Keluarkan HTML siap ditempel ke editor, tanpa markdown fences. WAJIB membuat tabel berjudul “Alokasi Waktu Terperinci” dengan kolom Tahap, Waktu, dan Rincian. WAJIB mengulang angka menit pada subjudul kegiatan: “Pendahuluan — ${allocation.opening} menit”, “Inti — ${allocation.core} menit”, dan “Penutup — ${allocation.closing} menit”. Jangan hanya menulis “2 JP” tanpa rincian menit.

Modul minimal mencakup: judul; identitas; fase; alokasi waktu; kompetensi awal; profil/karakter; sarana prasarana; target peserta didik; model/metode; CP yang relevan atau petunjuk bahwa CP harus disesuaikan dengan dokumen resmi; tujuan pembelajaran terukur; pemahaman bermakna; pertanyaan pemantik; persiapan guru; kegiatan pendahuluan-inti-penutup yang rinci per langkah; asesmen diagnostik, formatif, sumatif; kisi-kisi/instrumen; rubrik; diferensiasi konten/proses/produk; remedial; pengayaan; refleksi guru dan siswa; LKPD ringkas; bahan bacaan; glosarium; daftar pustaka; dan sumber internet.

MODEL PEMBELAJARAN OTOMATIS: gunakan model ${model} secara konsisten pada sintaks kegiatan, LKPD, asesmen, dan bahan ajar. Jangan meminta guru memilih model lagi.

Jangan mengarang nomor regulasi/CP jika tidak ditemukan. Jika sumber resmi tidak menyediakan rincian tertentu, tandai bagian tersebut sebagai perlu disesuaikan guru. Sertakan daftar sumber URL yang benar-benar ditelusuri di bagian akhir.`;
}

export function extractSources(response) {
  const found = new Set();
  const walk = v => {
    if (!v || typeof v !== 'object') return;
    if (Array.isArray(v)) return v.forEach(walk);
    if (typeof v.url === 'string' && /^https?:\/\//.test(v.url)) found.add(v.url);
    Object.values(v).forEach(walk);
  };
  walk(response?.output || response);
  return [...found].slice(0, 20);
}
