const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function timePlan({level='SD', jpPerWeek=4, weeksGanjil=18, weeksGenap=18, jpPerMeeting=2, meetingMinutes=35}={}) {
  const jpWeek = Math.max(1, Number(jpPerWeek)||4);
  const wg = Math.max(1, Number(weeksGanjil)||18);
  const wn = Math.max(1, Number(weeksGenap)||18);
  const jpm = Math.max(1, Number(jpPerMeeting)||2);
  const mm = Math.max(15, Number(meetingMinutes)||35);
  return {
    jpPerWeek: jpWeek, weeksGanjil: wg, weeksGenap: wn, jpPerMeeting:jpm, meetingMinutes:mm,
    jpGanjil: jpWeek*wg, jpGenap: jpWeek*wn, jpYear: jpWeek*(wg+wn),
    meetingsGanjil: Math.ceil((jpWeek*wg)/jpm), meetingsGenap: Math.ceil((jpWeek*wn)/jpm)
  };
}

function tableRows(n, prefix) {
  return Array.from({length:n},(_,i)=>`<tr><td>${i+1}</td><td>${prefix} ${i+1}</td><td>Tujuan/kompetensi dikembangkan sesuai CP dan kebutuhan peserta didik.</td><td>Aktivitas pembelajaran kontekstual</td><td>Asesmen formatif/sumatif</td><td>${2} JP</td></tr>`).join('');
}

export function buildFallbackCurriculum({docType='CP',level='SD',grade=5,section='A',subject='Matematika',semester='Ganjil',academicYear='2026/2027',chapter='Materi Pembelajaran',jpPerWeek=4,weeksGanjil=18,weeksGenap=18,jpPerMeeting=2,meetingMinutes=35}={}) {
  const t=timePlan({level,jpPerWeek,weeksGanjil,weeksGenap,jpPerMeeting,meetingMinutes});
  const phase = level==='SD'?(grade<=2?'A':grade<=4?'B':'C'):level==='SMP'?'D':'E/F';
  const head = `<h1>${esc(docType)} — ${esc(subject)} Kelas ${grade}${esc(section)}</h1><p><b>Jenjang:</b> ${esc(level)} · <b>Fase:</b> ${phase} · <b>Semester:</b> ${esc(semester)} · <b>Tahun Ajaran:</b> ${esc(academicYear)}</p><p><b>Materi/Bab:</b> ${esc(chapter)}</p>`;
  const settings = `<h2>Pengaturan Alokasi Waktu</h2><table border="1" cellpadding="6" cellspacing="0"><tr><th>Parameter</th><th>Nilai</th></tr><tr><td>JP per minggu</td><td>${t.jpPerWeek} JP</td></tr><tr><td>Minggu efektif Ganjil</td><td>${t.weeksGanjil} minggu</td></tr><tr><td>Minggu efektif Genap</td><td>${t.weeksGenap} minggu</td></tr><tr><td>JP per pertemuan</td><td>${t.jpPerMeeting} JP</td></tr><tr><td>Durasi 1 JP</td><td>${t.meetingMinutes} menit</td></tr><tr><td>Total Ganjil</td><td><b>${t.jpGanjil} JP</b> / ±${t.meetingsGanjil} pertemuan</td></tr><tr><td>Total Genap</td><td><b>${t.jpGenap} JP</b> / ±${t.meetingsGenap} pertemuan</td></tr><tr><th>Total 1 Tahun</th><th><b>${t.jpYear} JP</b></th></tr></table>`;

  if(docType==='CP') return `${head}<h2>1. Capaian Pembelajaran</h2><p>Gunakan CP resmi sesuai fase ${phase} dan mata pelajaran ${esc(subject)} sebagai sumber utama. Sistem menyiapkan kerangka pemetaan agar guru dapat memasukkan atau menyesuaikan CP resmi sekolah tanpa mengarang nomor/rumusan regulasi.</p><h3>Elemen/kompetensi yang dipetakan</h3><table border="1" cellpadding="6" cellspacing="0"><tr><th>No</th><th>Elemen</th><th>Deskripsi kompetensi</th><th>Bukti ketercapaian</th></tr>${tableRows(5,'Elemen')}</table>${settings}<p><i>Catatan: validasi rumusan CP dengan dokumen resmi yang berlaku sebelum digunakan sebagai dokumen sekolah.</i></p>`;
  if(docType==='TP') return `${head}<h2>1. Tujuan Pembelajaran (TP)</h2><p>TP disusun operasional, terukur, dan diturunkan dari CP fase ${phase}. Sesuaikan kata kerja, tingkat kesulitan, dan konteks kelas.</p><table border="1" cellpadding="6" cellspacing="0"><tr><th>No</th><th>TP</th><th>Indikator ketercapaian</th><th>Asesmen</th><th>Alokasi</th></tr>${Array.from({length:8},(_,i)=>`<tr><td>${i+1}</td><td>Peserta didik mampu menjelaskan, menerapkan, atau mengomunikasikan konsep ${esc(chapter)} sesuai konteks.</td><td>Jawaban/produk memenuhi kriteria yang ditetapkan.</td><td>Observasi, tugas, kuis, produk</td><td>${t.jpPerMeeting} JP</td></tr>`).join('')}</table>${settings}`;
  if(docType==='ATP') return `${head}<h2>1. Alur Tujuan Pembelajaran (ATP)</h2><p>Alur disusun dari konsep prasyarat menuju penerapan dan penguatan, lalu disebar ke minggu efektif yang tersedia.</p><table border="1" cellpadding="6" cellspacing="0"><tr><th>No</th><th>Urutan TP</th><th>Materi/lingkup</th><th>Aktivitas</th><th>Asesmen</th><th>Alokasi</th></tr>${tableRows(12,'TP')}</table>${settings}`;
  if(docType==='Program Semester') return `${head}<h2>1. Program Semester</h2><p>Distribusi pembelajaran selama semester ${esc(semester)} dengan waktu yang dapat diubah oleh guru.</p>${settings}<h3>Distribusi Minggu Efektif</h3><table border="1" cellpadding="6" cellspacing="0"><tr><th>Minggu</th><th>Materi/TP</th><th>JP</th><th>Kegiatan</th><th>Asesmen</th></tr>${Array.from({length:Math.min(18,semester==='Ganjil'?t.weeksGanjil:t.weeksGenap)},(_,i)=>`<tr><td>${i+1}</td><td>Materi/TP ${i+1}</td><td>${t.jpPerWeek} JP</td><td>Pembelajaran dan latihan</td><td>Formatif</td></tr>`).join('')}</table>`;
  return `${head}<h2>1. Program Tahunan</h2><p>Program tahunan memetakan seluruh pembelajaran satu tahun berdasarkan minggu efektif dan alokasi JP yang dapat disesuaikan.</p>${settings}<h3>Distribusi Tahunan</h3><table border="1" cellpadding="6" cellspacing="0"><tr><th>Periode</th><th>Minggu Efektif</th><th>Alokasi</th><th>Ruang Lingkup</th><th>Catatan</th></tr><tr><td>Ganjil</td><td>${t.weeksGanjil}</td><td>${t.jpGanjil} JP</td><td>Unit/Materi 1–6</td><td>Sesuaikan kalender pendidikan</td></tr><tr><td>Genap</td><td>${t.weeksGenap}</td><td>${t.jpGenap} JP</td><td>Unit/Materi 7–12</td><td>Sesuaikan kalender pendidikan</td></tr><tr><th>Total</th><th>${t.weeksGanjil+t.weeksGenap}</th><th>${t.jpYear} JP</th><th colspan="2">Rencana satu tahun</th></tr></table>`;
}

export function buildCurriculumPrompt({docType,level,grade,section,subject,semester,academicYear,chapter,jpPerWeek,weeksGanjil,weeksGenap,jpPerMeeting,meetingMinutes}) {
  const t=timePlan({level,jpPerWeek,weeksGanjil,weeksGenap,jpPerMeeting,meetingMinutes});
  const phase = level==='SD'?(grade<=2?'A':grade<=4?'B':'C'):level==='SMP'?'D':'E/F';
  return `Buat dokumen administrasi guru Indonesia: ${docType}. Tulis dalam Bahasa Indonesia dan keluarkan HTML siap ditempel ke editor, tanpa markdown fences. Konteks: ${level}, kelas ${grade}${section}, fase ${phase}, ${subject}, semester ${semester}, tahun ajaran ${academicYear}, materi/bab ${chapter||'umum'}.

Gunakan web search. Prioritaskan sumber resmi pemerintah pendidikan Indonesia: kurikulum.kemdikbud.go.id, kemdikbud.go.id, kemendikdasmen.go.id, rumah.pendidikan.go.id. Jangan menyalin dokumen pihak lain. Jangan mengarang nomor regulasi atau rumusan CP jika tidak ditemukan.

PENGATURAN WAKTU WAJIB: ${t.jpPerWeek} JP/minggu; minggu efektif Ganjil ${t.weeksGanjil}; Genap ${t.weeksGenap}; ${t.jpPerMeeting} JP/pertemuan; 1 JP = ${t.meetingMinutes} menit. Total Ganjil ${t.jpGanjil} JP, Genap ${t.jpGenap} JP, setahun ${t.jpYear} JP. Gunakan angka ini secara konsisten dan tampilkan tabel alokasi waktu. Jika guru mengubah parameter, semua total dan distribusi harus mengikuti parameter baru.

Untuk ${docType}: buat lengkap, operasional, mudah diedit, dan siap dipakai guru. ${docType==='CP'?'Jelaskan CP per elemen/fase dan beri catatan sumber resmi.':docType==='TP'?'Turunkan TP yang terukur dari CP, indikator, asesmen, dan alokasi JP.':docType==='ATP'?'Susun urutan TP yang logis dari prasyarat ke penerapan, materi, asesmen, dan alokasi JP.':docType==='Program Semester'?'Buat tabel minggu 1 sampai minggu efektif semester, materi/TP, JP, kegiatan, asesmen, dan catatan minggu yang dapat disesuaikan.':'Buat pemetaan Ganjil dan Genap selama satu tahun, minggu efektif, unit/materi, alokasi JP, asesmen, dan catatan kalender pendidikan.'}
Sertakan bagian identitas, tujuan penggunaan, tabel utama, alokasi waktu, catatan penyesuaian, dan sumber internet yang benar-benar ditelusuri. Konten harus orisinal dan dapat diedit guru.`;
}

export function extractCurriculumSources(response) {
  const found=new Set();
  const walk=v=>{if(!v||typeof v!=='object')return;if(Array.isArray(v))return v.forEach(walk);if(typeof v.url==='string'&&/^https?:\/\//.test(v.url))found.add(v.url);Object.values(v).forEach(walk)};
  walk(response?.output||response); return [...found].slice(0,20);
}
