const app=document.getElementById('app'), crumb=document.getElementById('crumb'), toast=document.getElementById('toast');

const LEVELS={
  SD:{label:'SD',grades:[1,2,3,4,5,6],subjects:['Pendidikan Agama','Pendidikan Pancasila','Bahasa Indonesia','Matematika','IPAS','PJOK','Seni Budaya','Bahasa Inggris','Muatan Lokal']},
  SMP:{label:'SMP',grades:[7,8,9],subjects:['Pendidikan Agama','Pendidikan Pancasila','Bahasa Indonesia','Matematika','IPA','IPS','Bahasa Inggris','PJOK','Informatika','Seni Budaya','Prakarya','Muatan Lokal']},
  SMA:{label:'SMA',grades:[10,11,12],subjects:['Pendidikan Agama','Pendidikan Pancasila','Bahasa Indonesia','Matematika','Bahasa Inggris','Fisika','Kimia','Biologi','Ekonomi','Sosiologi','Geografi','Sejarah','Informatika','PJOK','Seni Budaya','Muatan Lokal']}
};

const pageNames={dashboard:'Beranda',curriculum:'Referensi Kurikulum',materials:'Bab & Materi',learning:'Pembelajaran',documents:'Dokumen Ajar',editor:'Editor',students:'Data Siswa',attendance:'Absensi',journal:'Jurnal Kelas',schedule:'Jadwal',assessment:'Penilaian',reports:'Laporan',settings:'Pengaturan'};
let state=JSON.parse(localStorage.getItem('pag_state')||'null')||{level:'SD',grade:5,section:'A',academicYear:'2026/2027',semester:'Ganjil',subject:'Matematika'};
const students=JSON.parse(localStorage.getItem('students')||'[]');
const docs=JSON.parse(localStorage.getItem('docs')||'[]');
state.paperSize=localStorage.getItem('paperSize')||state.paperSize||'A4';
let moduleSections=JSON.parse(localStorage.getItem('module_sections')||'null')||{};
let moduleSignature=JSON.parse(localStorage.getItem('module_signature')||'null')||{date:'',principalName:'',principalNip:'',teacherName:'',teacherNip:''};

function currentClass(){return `${state.level} Kelas ${state.grade}${state.section}`}
function save(){localStorage.setItem('students',JSON.stringify(students));localStorage.setItem('docs',JSON.stringify(docs));localStorage.setItem('pag_state',JSON.stringify(state));document.getElementById('syncState').textContent='● Tersimpan lokal'}
function showToast(t){toast.textContent=t;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1800)}
function stat(title,value,note){return `<div class="card stat"><span class="muted">${title}</span><b>${value}</b><span class="muted">${note}</span></div>`}
function levelOptions(){return Object.keys(LEVELS).map(k=>`<option value="${k}" ${state.level===k?'selected':''}>${LEVELS[k].label}</option>`).join('')}
function gradeOptions(){return LEVELS[state.level].grades.map(g=>`<option value="${g}" ${Number(state.grade)===g?'selected':''}>Kelas ${g}</option>`).join('')}
function subjectOptions(){return LEVELS[state.level].subjects.map(s=>`<option ${state.subject===s?'selected':''}>${s}</option>`).join('')}
function classOptions(){return LEVELS[state.level].grades.flatMap(g=>['A','B','C'].map(sec=>`<option value="${g}-${sec}" ${Number(state.grade)===g&&state.section===sec?'selected':''}>${state.level} Kelas ${g}${sec}</option>`)).join('')}
function contextBar(){return `<div class="card" style="margin-bottom:18px"><div class="section-head"><div><h3>Konteks Akademik</h3><p class="muted">Semua modul mengikuti jenjang dan kelas yang dipilih.</p></div><span class="badge">${currentClass()}</span></div><div class="form" style="grid-template-columns:repeat(4,1fr)"><div class="field"><label>Jenjang</label><select id="globalLevel" onchange="changeLevel(this.value)">${levelOptions()}</select></div><div class="field"><label>Kelas</label><select id="globalGrade" onchange="changeGrade(this.value)">${gradeOptions()}</select></div><div class="field"><label>Rombel</label><select id="globalSection" onchange="changeSection(this.value)"><option ${state.section==='A'?'selected':''}>A</option><option ${state.section==='B'?'selected':''}>B</option><option ${state.section==='C'?'selected':''}>C</option></select></div><div class="field"><label>Mata Pelajaran</label><select id="globalSubject" onchange="changeSubject(this.value)">${subjectOptions()}</select></div></div></div>`}
function dashboard(){app.innerHTML=`<div class="hero"><div><h1>Pusat Administrasi Guru</h1><p>Kelola administrasi untuk <b>${currentClass()}</b>, dari SD kelas 1–6, SMP kelas 7–9, hingga SMA kelas 10–12.</p></div><button class="primary" onclick="go('documents')">＋ Buat Perangkat Ajar</button></div>${contextBar()}<div class="grid">${stat('Jenjang',state.level,`Kelas ${state.grade}${state.section}`)}${stat('Siswa',students.length||0,'Data rombel aktif')}${stat('Dokumen',docs.length||0,'Perangkat tersimpan')}${stat('Mata Pelajaran',LEVELS[state.level].subjects.length,'Pilihan tersedia')}</div><div class="section-head"><h2>Akses Cepat</h2></div><div class="quick"><button onclick="go('students')">♙ Data Siswa</button><button onclick="go('attendance')">✓ Isi Absensi</button><button onclick="go('documents')">▤ Modul Ajar</button><button onclick="go('assessment')">▥ Penilaian</button><button onclick="go('journal')">▤ Jurnal Kelas</button></div><div class="layout-2" style="margin-top:20px"><div class="card"><div class="section-head"><h2>Ruang Lingkup</h2><span class="badge">${state.academicYear}</span></div><p><b>SD:</b> Kelas 1–6</p><p><b>SMP:</b> Kelas 7–9</p><p><b>SMA:</b> Kelas 10–12</p></div><div class="card"><div class="section-head"><h2>Semester</h2></div><p>Semester aktif: <b>${state.semester}</b></p><p class="muted">Pengaturan tahun ajaran dan semester tersedia di Pengaturan.</p></div></div>`}
function studentsPage(){app.innerHTML=`<div class="section-head"><div><h2>Data Siswa</h2><p class="muted">${currentClass()} · ${students.length} siswa tersimpan di perangkat ini</p></div><button class="btn primary-dark" onclick="addStudent()">＋ Tambah Siswa</button></div>${contextBar()}<div class="card"><div class="section-head"><h3>Rombel ${currentClass()}</h3><span class="badge">${state.academicYear} · ${state.semester}</span></div><div class="table-wrap"><table class="table"><thead><tr><th>No</th><th>Nama</th><th>NIS</th><th>Jenjang/Kelas</th><th>Status</th></tr></thead><tbody>${students.length?students.map((s,i)=>`<tr><td>${i+1}</td><td><b>${s.name}</b></td><td>${s.nis||'-'}</td><td>${s.level||state.level} Kelas ${s.grade||state.grade}${s.section||state.section}</td><td><span class="badge">${s.status||'Aktif'}</span></td></tr>`).join(''):`<tr><td colspan="5" class="empty">Belum ada data siswa untuk rombel ini. Klik Tambah Siswa.</td></tr>`}</tbody></table></div></div>`}
function addStudent(){const name=prompt(`Nama siswa — ${currentClass()}:`);if(!name)return;const nis=prompt('NIS (opsional):')||'-';students.push({name,nis,level:state.level,grade:state.grade,section:state.section,status:'Aktif'});save();studentsPage();showToast('Siswa ditambahkan')}
function documents(){app.innerHTML=`<div class="section-head"><div><h2>Perangkat Ajar</h2><p class="muted">Template menyesuaikan jenjang, kelas, rombel, dan mata pelajaran.</p></div><button class="btn primary-dark" onclick="go('editor')">＋ Buat Dokumen</button></div>${contextBar()}<div class="grid">${['Modul Ajar','LKPD','Bahan Ajar','Asesmen'].map((x,i)=>`<div class="card"><div style="font-size:24px">${['▤','▥','◈','✓'][i]}</div><h3>${x}</h3><p class="muted">${state.level} · Kelas ${state.grade} · ${state.subject}</p><button class="btn" onclick="go('editor')">Buat</button></div>`).join('')}</div><div class="section-head"><h2>Dokumen Tersimpan</h2></div><div class="table-wrap"><table class="table"><thead><tr><th>Dokumen</th><th>Jenjang/Kelas</th><th>Mata Pelajaran</th><th>Status</th></tr></thead><tbody>${docs.length?docs.map(d=>`<tr><td>${d.title}</td><td>${d.level||'SD'} Kelas ${d.grade||5}${d.section||'A'}</td><td>${d.subject||'Matematika'}</td><td><span class="badge">${d.status||'Tersimpan'}</span></td></tr>`).join(''):`<tr><td colspan="4" class="empty">Belum ada dokumen tersimpan.</td></tr>`}</tbody></table></div>`}
function editor(){
const steps=['Identitas','Capaian Pembelajaran','Tujuan Pembelajaran','Alur Tujuan','Profil Pelajar Pancasila','Sarana & Prasarana','Model Pembelajaran','Langkah Pembelajaran','Asesmen','Lampiran'];
app.innerHTML=`<div class="section-head"><div><div class="badge" style="display:inline-flex;margin-bottom:8px">PERANGKAT AJAR</div><h2>Modul Ajar</h2><p class="muted">Susun modul secara bertahap, lihat hasilnya langsung dalam kertas A4/F4, lalu simpan atau ekspor.</p></div><div class="module-actions"><button class="btn" onclick="printDocument()">🖨 Cetak</button><button class="btn" onclick="exportDocumentPDF()">📄 PDF</button><button class="btn" onclick="exportDocumentWord()">📝 Word</button><button class="btn" onclick="generateModule10()">🤖 Generate 10 Bagian</button><button class="btn primary-dark" onclick="saveDoc()">💾 Simpan</button></div></div>
<div class="module-workspace"><aside class="card module-steps"><div class="section-head" style="margin:0 0 12px"><div><b>Langkah Modul</b><div class="muted" style="font-size:11px">Lengkapi bagian berikut</div></div></div><div class="progress-track"><span id="moduleProgress" style="width:10%"></span></div><div id="stepList" style="margin-top:10px">${steps.map((x,i)=>`<button class="module-step ${i===0?'active':''}" data-step="${i}" onclick="selectModuleStep(${i})"><span class="step-num">${i+1}</span><span>${x}</span></button>`).join('')}</div></aside>
<section class="card module-form-card"><div class="section-head" style="margin:0 0 16px"><div><span class="badge" id="stepBadge">01 / 10</span><h3 id="stepTitle" style="margin:9px 0 3px">Identitas</h3><p class="muted" id="stepDesc">Informasi dasar modul dan konteks kelas.</p></div></div><div id="moduleStepForm"></div><div class="module-actions" style="margin-top:20px;justify-content:space-between"><button class="btn" onclick="prevModuleStep()">← Sebelumnya</button><button class="btn primary-dark" onclick="nextModuleStep()">Berikutnya →</button></div></section>
<aside class="module-preview"><div class="preview-toolbar"><div><b>Preview Dokumen</b><div class="muted" style="font-size:11px">Perubahan tampil secara langsung</div></div><div class="paper-setting"><label class="muted">Kertas</label><select id="modulePaperSize" onchange="setPaperSize(this.value)"><option value="A4">A4 · 21 × 29,7 cm</option><option value="F4">F4 · 21 × 33 cm</option></select></div></div><div class="paper-preview"><article id="modulePreviewSheet" class="paper-sheet"><h1>MODUL AJAR</h1><p style="text-align:center">${currentClass()} · ${state.subject}</p><hr><h2>A. IDENTITAS</h2><table><tr><td width="32%"><b>Jenjang / Kelas</b></td><td>${state.level} / ${state.grade}</td></tr><tr><td><b>Mata Pelajaran</b></td><td>${state.subject}</td></tr><tr><td><b>Semester</b></td><td>${state.semester}</td></tr><tr><td><b>Tahun Ajaran</b></td><td>${state.academicYear}</td></tr><tr><td><b>Rombel</b></td><td>${state.section}</td></tr></table><h2>B. KOMPONEN INTI</h2><p><b>Materi:</b> <span id="previewChapter">Belum diisi</span></p><p><b>Alokasi Waktu:</b> <span id="previewAllocation">70</span> menit</p><p><b>Model:</b> <span id="previewModel">Otomatis</span></p><h2>C. TUJUAN PEMBELAJARAN</h2><p id="previewTP">Tuliskan tujuan pembelajaran yang ingin dicapai peserta didik.</p><h2>D. ASESMEN</h2><p id="previewAssessment">Asesmen diagnostik, formatif, dan sumatif disiapkan sesuai tujuan pembelajaran.</p><div id="moduleSignaturePreview" class="signature-block"></div></article></div></aside></div>`;
window.moduleStep=0; window.moduleSteps=steps; renderModuleStep(); updateModulePreview(); setPaperSize(state.paperSize||'A4');}
function selectModuleStep(i){window.moduleStep=i;document.querySelectorAll('.module-step').forEach((b,n)=>b.classList.toggle('active',n===i));renderModuleStep();updateModulePreview();}
function prevModuleStep(){selectModuleStep(Math.max(0,(window.moduleStep||0)-1));}
function nextModuleStep(){selectModuleStep(Math.min((window.moduleSteps||[]).length-1,(window.moduleStep||0)+1));}
function moduleValue(key){return moduleSections[key]||'';}
function renderModuleStep(){const i=window.moduleStep||0;const titles=window.moduleSteps||[];const desc=['Informasi dasar modul dan konteks kelas.','Hubungkan modul dengan capaian pembelajaran.','Rumuskan tujuan yang terukur.','Susun urutan tujuan pembelajaran.','Pilih dimensi dan nilai yang dikembangkan.','Catat media, alat, bahan, dan lingkungan belajar.','Tentukan model yang paling sesuai.','Susun kegiatan pembuka, inti, dan penutup.','Tentukan asesmen dan instrumen.','Tambahkan LKPD, bahan ajar, rubrik, dan daftar pustaka.'];document.getElementById('stepBadge').textContent=`${String(i+1).padStart(2,'0')} / 10`;document.getElementById('stepTitle').textContent=titles[i];document.getElementById('stepDesc').textContent=desc[i];document.getElementById('moduleProgress').style.width=`${((i+1)/10)*100}%`;const f=document.getElementById('moduleStepForm');
const keys=['identitas','cp','tp','atp','profil','sarpras','model','langkah','asesmen','lampiran'];const key=keys[i];
if(i===0)f.innerHTML=`<div class="form"><div class="field"><label>Jenjang</label><select id="dtypeLevel" onchange="editorLevelChanged(this.value)">${levelOptions()}</select></div><div class="field"><label>Kelas</label><select id="dtypeGrade">${gradeOptions()}</select></div><div class="field"><label>Rombel</label><select id="dtypeSection"><option>A</option><option>B</option><option>C</option></select></div><div class="field"><label>Mata Pelajaran</label><select id="editorSubject">${subjectOptions()}</select></div><div class="field"><label>Bab / Materi</label><input id="chapter" placeholder="Contoh: Pecahan, Ekosistem, Teks Eksplanasi" value="${(moduleSections.chapter||'').replace(/"/g,'&quot;')}" oninput="updateModulePreview()"></div><div class="field"><label>Alokasi Waktu (menit)</label><input id="allocationMinutes" type="number" min="30" step="5" value="70" oninput="updateModulePreview()"></div><div class="field full"><label>Hasil Generate Identitas</label><textarea id="moduleField" rows="10" oninput="syncModuleField('identitas',this.value)">${moduleValue(key)}</textarea></div></div>`;
else if(i===9){f.innerHTML=`<div class="field"><label>${titles[i]}</label><textarea id="moduleField" rows="14" placeholder="Klik <b>🤖 Generate 10 Bagian</b> untuk mengisi otomatis, lalu edit sesuai kebutuhan.">${moduleValue(key)}</textarea></div><div class="module-ai-note">🤖 Konten AI dapat diedit. Verifikasi CP, regulasi, dan konteks sekolah sebelum dokumen digunakan.</div><div class="signature-card"><div class="section-head"><div><h4 style="margin:0">✍️ Tanda Tangan Modul</h4><p class="muted" style="margin:3px 0 0">Masukkan data penandatangan agar otomatis tampil di halaman terakhir modul dan hasil cetak.</p></div><button class="btn primary-dark" onclick="toggleSignatureForm()">📝 Masukkan Data Tanda Tangan</button></div><div id="signatureForm" class="signature-form hidden"><div class="form"><div class="field"><label>Tanggal Modul</label><input id="sigDate" type="date" value="${moduleSignature.date||''}" onchange="updateModuleSignature()"></div><div class="field"><label>Nama Kepala Sekolah</label><input id="sigPrincipalName" value="${escapeAttr(moduleSignature.principalName)}" placeholder="Nama Kepala Sekolah" oninput="updateModuleSignature()"></div><div class="field"><label>NIP Kepala Sekolah</label><input id="sigPrincipalNip" value="${escapeAttr(moduleSignature.principalNip)}" placeholder="NIP Kepala Sekolah" oninput="updateModuleSignature()"></div><div class="field"><label>Nama Guru</label><input id="sigTeacherName" value="${escapeAttr(moduleSignature.teacherName)}" placeholder="Nama Guru" oninput="updateModuleSignature()"></div><div class="field"><label>NIP Guru</label><input id="sigTeacherNip" value="${escapeAttr(moduleSignature.teacherNip)}" placeholder="NIP Guru" oninput="updateModuleSignature()"></div></div><p class="muted" style="margin:8px 0 0">Data tersimpan otomatis di perangkat ini dan dapat diedit kapan saja.</p></div></div>`;document.getElementById('moduleField').addEventListener('input',e=>syncModuleField(key,e.target.value));}
else {f.innerHTML=`<div class="field"><label>${titles[i]}</label><textarea id="moduleField" rows="18" placeholder="Klik <b>🤖 Generate 10 Bagian</b> untuk mengisi otomatis, lalu edit sesuai kebutuhan.">${moduleValue(key)}</textarea></div><div class="module-ai-note">🤖 Konten AI dapat diedit. Verifikasi CP, regulasi, dan konteks sekolah sebelum dokumen digunakan.</div>`;document.getElementById('moduleField').addEventListener('input',e=>syncModuleField(key,e.target.value));}
}
function escapeAttr(value){return String(value??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function toggleSignatureForm(){const f=document.getElementById('signatureForm');if(f)f.classList.toggle('hidden');}
function updateModuleSignature(){moduleSignature={date:document.getElementById('sigDate')?.value||'',principalName:document.getElementById('sigPrincipalName')?.value||'',principalNip:document.getElementById('sigPrincipalNip')?.value||'',teacherName:document.getElementById('sigTeacherName')?.value||'',teacherNip:document.getElementById('sigTeacherNip')?.value||''};localStorage.setItem('module_signature',JSON.stringify(moduleSignature));updateModulePreview();}
function formatSignatureDate(value){if(!value)return '.........................';const d=new Date(value+'T00:00:00');return d.toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'});}
function updateModulePreview(){const c=document.getElementById('chapter');const a=document.getElementById('allocationMinutes');const m=document.getElementById('previewModel');const tp=document.getElementById('previewTP');const as=document.getElementById('previewAssessment');if(c)document.getElementById('previewChapter').textContent=c.value||'Belum diisi';if(a)document.getElementById('previewAllocation').textContent=a.value||'70';if(m)m.textContent=moduleSections.model||'Otomatis';if(tp)tp.textContent=moduleSections.tp||'Tujuan pembelajaran akan tampil setelah dibuat.';if(as)as.textContent=moduleSections.asesmen||'Asesmen akan tampil setelah dibuat.';const sig=document.getElementById('moduleSignaturePreview');if(sig){sig.innerHTML=`<div class="signature-date">${escapeHtmlForExport(formatSignatureDate(moduleSignature.date))}</div><div class="signature-grid"><div><p>Mengetahui,</p><p>Kepala Sekolah</p><div class="signature-space"></div><p><b>${escapeHtmlForExport(moduleSignature.principalName||'................................................')}</b><br>NIP. ${escapeHtmlForExport(moduleSignature.principalNip||'................................................')}</p></div><div><p>Guru Mata Pelajaran</p><p>${escapeHtmlForExport(state.subject)}</p><div class="signature-space"></div><p><b>${escapeHtmlForExport(moduleSignature.teacherName||'................................................')}</b><br>NIP. ${escapeHtmlForExport(moduleSignature.teacherNip||'................................................')}</p></div></div>`;}}
function syncModuleField(key,value){moduleSections[key]=value;localStorage.setItem('module_sections',JSON.stringify(moduleSections));updateModulePreview();}
async function generateModule10(){
  const payload=getEditorPayload();
  const btn=document.querySelector('button[onclick="generateModule10()"]');if(btn){btn.disabled=true;btn.textContent='⏳ AI + Internet...';}
  try{const r=await fetch('/api/generate-module-sections',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const data=await r.json();if(!r.ok)throw new Error(data.error||'Gagal generate 10 bagian');moduleSections={...moduleSections,...(data.sections||{})};localStorage.setItem('module_sections',JSON.stringify(moduleSections));window.moduleStep=0;renderModuleStep();updateModulePreview();showModuleSources(data.sources||[],data.notice||'');showToast(data.mode==='internet-ai'?'10 bagian Modul Ajar berhasil dibuat dengan Internet + AI':'10 bagian dibuat dengan generator lokal');}
  catch(e){showToast(e.message||'Gagal generate 10 bagian');}
  finally{if(btn){btn.disabled=false;btn.textContent='🤖 Generate 10 Bagian';}}
}
function setPaperSize(v){localStorage.setItem('paperSize',v);const s=document.getElementById('modulePreviewSheet');if(s)s.classList.toggle('f4',v==='F4');const p=document.getElementById('paperSize');if(p)p.value=v;}

function editorLevelChanged(v){const oldLevel=state.level,oldGrade=state.grade,oldSubject=state.subject;state.level=v;state.grade=LEVELS[v].grades[0];state.subject=LEVELS[v].subjects[0];const g=document.getElementById('dtypeGrade');if(g)g.innerHTML=gradeOptions();const s=document.getElementById('editorSubject');if(s)s.innerHTML=subjectOptions();const a=document.getElementById('allocationMinutes');if(a)a.value=v==='SD'?70:v==='SMP'?80:90;state.level=oldLevel;state.grade=oldGrade;state.subject=oldSubject;}
function getEditorPayload(){const c=JSON.parse(localStorage.getItem('curriculum_chain')||'{}');return {linkedCP:c.CP?.content||'',linkedTP:c.TP?.content||'',linkedATP:c.ATP?.content||'',linkedProsem:c['Program Semester']?.content||'',linkedProta:c['Program Tahunan']?.content||'',level:document.getElementById('dtypeLevel')?.value||state.level,grade:Number(document.getElementById('dtypeGrade')?.value||state.grade),section:document.getElementById('dtypeSection')?.value||state.section,subject:document.getElementById('editorSubject')?.value||state.subject,chapter:document.getElementById('chapter')?.value||'Materi Pembelajaran',model:document.getElementById('model')?.value||'AUTO',semester:state.semester,academicYear:state.academicYear,allocationMinutes:Number(document.getElementById('allocationMinutes')?.value||70),focus:document.getElementById('moduleFocus')?.value||'',signature:moduleSignature};}
function showModuleSources(sources=[],notice=''){const box=document.getElementById('moduleSources');if(!box)return;box.innerHTML=`<h3>Sumber Internet</h3>${notice?`<p class="muted">${notice}</p>`:''}${sources.length?`<ul>${sources.map(u=>`<li><a href="${u}" target="_blank" rel="noopener">${u}</a></li>`).join('')}</ul>`:'<p class="muted">Tidak ada URL sumber yang dikembalikan.</p>'}`;}
async function generateFromInternet(){const payload=getEditorPayload();const btn=document.querySelector('button[onclick="generateFromInternet()"]');if(btn){btn.disabled=true;btn.textContent='⏳ Mencari sumber & menyusun modul...';}try{const r=await fetch('/api/generate-module',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const data=await r.json();if(!r.ok)throw new Error(data.error||'Gagal generate');document.getElementById('editor').innerHTML=data.content||'<p>Modul kosong.</p>';if(data.model){const m=document.getElementById('model');if(m)m.value=data.model;const mr=document.getElementById('modelRecommendation');if(mr)mr.innerHTML=`<b>Model otomatis:</b> ${data.model}. ${data.modelRationale||''}`;}showModuleSources(data.sources||[],data.notice||'Modul dibuat berdasarkan sumber Internet yang ditelusuri dan konten baru yang disusun untuk konteks kelas.');showToast(data.mode==='internet-ai'?'Modul lengkap berhasil digenerate dari Internet':'Modul lengkap dibuat dengan generator lokal');}catch(e){showToast(e.message||'Gagal generate modul');}finally{if(btn){btn.disabled=false;btn.textContent='🌐 Generate dari Internet';}}}
async function generateLocal(){const payload=getEditorPayload();try{const r=await fetch('/api/generate-module',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const data=await r.json();if(!r.ok)throw new Error(data.error||'Gagal generate');document.getElementById('editor').innerHTML=data.content||'';if(data.model){const m=document.getElementById('model');if(m)m.value=data.model;const mr=document.getElementById('modelRecommendation');if(mr)mr.innerHTML=`<b>Model otomatis:</b> ${data.model}. ${data.modelRationale||''}`;}showModuleSources(data.sources||[],data.notice||'');showToast('Modul lengkap berhasil dibuat');}catch(e){showToast(e.message||'Gagal generate modul');}}
function saveDoc(){const title=document.querySelector('#editor h1')?.textContent||'Modul Ajar Baru',content=document.getElementById('editor')?.innerHTML||'',model=document.getElementById('model')?.value||'PBL';const p=getEditorPayload();docs.push({title,content,model,level:p.level,grade:p.grade,section:p.section,subject:p.subject,signature:moduleSignature,status:'Tersimpan',created:new Date().toISOString()});save();showToast('Modul lengkap disimpan');}
function simplePage(title,subtitle,body){app.innerHTML=`<div class="section-head"><div><h2>${title}</h2><p class="muted">${subtitle}</p></div></div>${body}`}
function curriculumPage(){
  const saved=JSON.parse(localStorage.getItem('curriculum_settings')||'null')||{jpPerWeek:4,weeksGanjil:18,weeksGenap:18,jpPerMeeting:2,meetingMinutes:35};
  app.innerHTML=`<div class="section-head"><div><h2>CP · TP · ATP · Program Semester · Program Tahunan</h2><p class="muted">Semua perangkat kurikulum dapat dibuat otomatis berdasarkan jenjang, kelas, mata pelajaran, tahun ajaran, dan alokasi waktu yang Anda tentukan.</p></div><div><button class="btn" onclick="window.print()">🖨 Print</button> <button class="btn primary-dark" onclick="generateAllCurriculum()">⚡ Generate Semua</button></div></div>
  ${contextBar()}
  <div class="card"><div class="section-head"><div><h3>Parameter Alokasi Waktu</h3><p class="muted">Ubah angka ini sebelum membuat TP, ATP, Program Semester, dan Program Tahunan.</p></div><span class="badge">${state.academicYear}</span></div>
  <div class="form" style="grid-template-columns:repeat(5,1fr)">
    <div class="field"><label>JP per Minggu</label><input id="curJpWeek" type="number" min="1" value="${saved.jpPerWeek}"></div>
    <div class="field"><label>Minggu Efektif Ganjil</label><input id="curWeeksGanjil" type="number" min="1" value="${saved.weeksGanjil}"></div>
    <div class="field"><label>Minggu Efektif Genap</label><input id="curWeeksGenap" type="number" min="1" value="${saved.weeksGenap}"></div>
    <div class="field"><label>JP per Pertemuan</label><input id="curJpMeeting" type="number" min="1" value="${saved.jpPerMeeting}"></div>
    <div class="field"><label>Menit per 1 JP</label><input id="curMeetingMinutes" type="number" min="15" value="${saved.meetingMinutes}"></div><div class="field"><label>Bab/Materi Utama</label><input id="curriculumChapter" placeholder="Contoh: Pecahan, Ekosistem"></div>
  </div>
  <p id="timeSummary" class="muted"></p>
  </div>
  <div class="card"><div class="section-head"><div><h3>Generator Dokumen</h3><p class="muted">Klik salah satu dokumen atau Generate Semua. Mode Internet menggunakan sumber resmi pendidikan yang ditelusuri oleh AI.</p></div><span id="curriculumMode" class="badge">Siap</span></div>
  <div class="grid">${[['CP','Capaian Pembelajaran','Kompetensi per fase/elemen'],['TP','Tujuan Pembelajaran','Tujuan terukur diturunkan dari CP'],['ATP','Alur Tujuan Pembelajaran','Urutan TP + materi + asesmen + JP'],['Program Semester','Program Semester','Distribusi minggu efektif semester'],['Program Tahunan','Program Tahunan','Distribusi pembelajaran satu tahun']].map(([type,title,desc])=>`<div class="card"><h3>${title}</h3><p class="muted">${desc}</p><button class="btn primary-dark" onclick="generateCurriculum('${type}',true)">🌐 Generate Internet</button><button class="btn" onclick="generateCurriculum('${type}',false)">⚡ Generate Cepat</button></div>`).join('')}</div></div>
  <div class="layout-2"><div class="card"><h3>Dokumen Hasil</h3><div id="curriculumResult" class="editor" contenteditable="true"><p>Pilih dokumen untuk mulai membuatnya.</p></div></div><div class="card"><h3>Sumber Internet</h3><div id="curriculumSources"><p class="muted">Sumber akan muncul setelah generate.</p></div></div></div>`;
  updateCurriculumTimeSummary();
  ['curJpWeek','curWeeksGanjil','curWeeksGenap','curJpMeeting','curMeetingMinutes'].forEach(id=>document.getElementById(id)?.addEventListener('input',updateCurriculumTimeSummary));
}
function curriculumPayload(type, context={}){
  const saved=JSON.parse(localStorage.getItem('curriculum_chain')||'{}');
  const p={docType:type,level:state.level,grade:Number(state.grade),section:state.section,subject:state.subject,semester:state.semester,academicYear:state.academicYear,chapter:document.getElementById('curriculumChapter')?.value||state.subject,jpPerWeek:Number(document.getElementById('curJpWeek')?.value||4),weeksGanjil:Number(document.getElementById('curWeeksGanjil')?.value||18),weeksGenap:Number(document.getElementById('curWeeksGenap')?.value||18),jpPerMeeting:Number(document.getElementById('curJpMeeting')?.value||2),meetingMinutes:Number(document.getElementById('curMeetingMinutes')?.value||35),linkedCP:(context.CP??saved.CP?.content??''),linkedTP:(context.TP??saved.TP?.content??''),linkedATP:(context.ATP??saved.ATP?.content??''),linkedProsem:(context['Program Semester']??saved['Program Semester']?.content??''),linkedProta:(context['Program Tahunan']??saved['Program Tahunan']?.content??'')};
  localStorage.setItem('curriculum_settings',JSON.stringify({jpPerWeek:p.jpPerWeek,weeksGanjil:p.weeksGanjil,weeksGenap:p.weeksGenap,jpPerMeeting:p.jpPerMeeting,meetingMinutes:p.meetingMinutes}));
  return p;
}
function updateCurriculumTimeSummary(){const el=document.getElementById('timeSummary');if(!el)return;const a=Number(document.getElementById('curJpWeek')?.value||4),g=Number(document.getElementById('curWeeksGanjil')?.value||18),n=Number(document.getElementById('curWeeksGenap')?.value||18),m=Number(document.getElementById('curJpMeeting')?.value||2),min=Number(document.getElementById('curMeetingMinutes')?.value||35);el.innerHTML=`Alokasi otomatis: <b>Ganjil ${a*g} JP</b> · <b>Genap ${a*n} JP</b> · <b>1 Tahun ${a*(g+n)} JP</b> · ${m} JP/pertemuan = ${m*min} menit/pertemuan.`;}
async function generateCurriculum(type,internet=true){
  const box=document.getElementById('curriculumResult'),mode=document.getElementById('curriculumMode');if(!box)return;
  mode.textContent=internet?'Mencari sumber Internet…':'Membuat cepat…';
  try{const payload=curriculumPayload(type);const r=await fetch('/api/generate-curriculum',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const data=await r.json();if(!r.ok)throw new Error(data.error||'Gagal membuat dokumen');box.innerHTML=data.content||'<p>Dokumen kosong.</p>';const chain=JSON.parse(localStorage.getItem('curriculum_chain')||'{}');chain[type]={content:data.content,sources:data.sources||[],updatedAt:new Date().toISOString(),params:payload};localStorage.setItem('curriculum_chain',JSON.stringify(chain));showCurriculumSources(data.sources||[],data.notice||'');mode.textContent=data.mode==='internet-ai'?'Internet + AI':'Generator lokal';showToast(`${type} berhasil dibuat dan disimpan ke rantai kurikulum`);}
  catch(e){mode.textContent='Gagal';showToast(e.message||'Gagal membuat dokumen');}
}
function showCurriculumSources(sources=[],notice=''){const box=document.getElementById('curriculumSources');if(!box)return;box.innerHTML=`${notice?`<p class="muted">${notice}</p>`:''}${sources.length?`<ul>${sources.map(u=>`<li><a href="${u}" target="_blank" rel="noopener">${u}</a></li>`).join('')}</ul>`:'<p class="muted">Tidak ada URL sumber yang dikembalikan.</p>'}`;}
async function generateAllCurriculum(){
  const types=['CP','TP','ATP','Program Semester','Program Tahunan'];
  const chain={}; let context={}; const allSources=[];
  showToast('Membuat rantai CP → TP → ATP → Prosem → Prota…');
  for(const type of types){
    try{
      const payload=curriculumPayload(type,context);
      const r=await fetch('/api/generate-curriculum',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const data=await r.json(); if(!r.ok)throw new Error(data.error||'Gagal');
      chain[type]={content:data.content,sources:data.sources||[],updatedAt:new Date().toISOString(),params:payload};
      context[type]=data.content; allSources.push(...(data.sources||[]));
    }catch(e){ chain[type]={content:`<p>Gagal membuat ${type}: ${e.message}</p>`,sources:[]}; }
  }
  localStorage.setItem('curriculum_chain',JSON.stringify(chain));
  const box=document.getElementById('curriculumResult');
  if(box)box.innerHTML=types.map(x=>`<section style="page-break-after:always"><h1>${x}</h1>${chain[x].content}</section>`).join('');
  showCurriculumSources([...new Set(allSources)],'Rantai kurikulum tersimpan. TP diturunkan dari CP, ATP dari TP, Prosem/Prota memakai ATP dan alokasi waktu yang sama.');
  const mode=document.getElementById('curriculumMode');if(mode)mode.textContent='Rantai 5 dokumen selesai';showToast('CP → TP → ATP → Prosem → Prota selesai');
}

function route(p){crumb.textContent=pageNames[p]||'Beranda';if(p==='dashboard')dashboard();else if(p==='students')studentsPage();else if(p==='documents')documents();else if(p==='editor')editor();else if(p==='attendance')simplePage('Absensi',`${currentClass()} · ${state.subject} · ${state.semester}`,`${contextBar()}<div class="card"><div class="section-head"><h3>Daftar Kehadiran</h3><button class="btn" onclick="showToast('Absensi ${currentClass()} disimpan')">Simpan Absensi</button></div><div class="table-wrap"><table class="table"><thead><tr><th>Siswa</th><th>Status</th><th>Catatan</th></tr></thead><tbody>${(students.filter(s=>(s.level||state.level)===state.level&&Number(s.grade||state.grade)===Number(state.grade)&&(s.section||state.section)===state.section)).map(s=>`<tr><td>${s.name}</td><td><select><option>Hadir</option><option>Sakit</option><option>Izin</option><option>Alpa</option><option>Terlambat</option></select></td><td><input placeholder="Opsional"></td></tr>`).join('')||`<tr><td colspan="3" class="empty">Belum ada siswa di ${currentClass()}.</td></tr>`}</tbody></table></div></div>`);else if(p==='curriculum')curriculumPage();else if(p==='materials')simplePage('Bab & Materi',`Database materi ${state.level} kelas ${state.grade}`,`${contextBar()}<div class="card"><h3>${state.subject} · Kelas ${state.grade}</h3><p>Tambahkan bab dan materi sesuai kurikulum sekolah. Sistem tidak lagi terkunci pada Kelas 5.</p><button class="btn" onclick="go('editor')">Gunakan untuk perangkat ajar</button></div>`);else if(p==='learning')simplePage('Pembelajaran',`Pembelajaran untuk ${state.level} kelas ${state.grade}`,`${contextBar()}<div class="grid">${['Pembelajaran Mendalam','PBL','PjBL','Inquiry','Discovery','Problem Solving','Cooperative Learning'].map(x=>`<div class="card"><h3>${x}</h3><p class="muted">Template sintaks dan aktivitas dapat digunakan pada semua jenjang.</p></div>`).join('')}</div>`);else if(p==='journal')simplePage('Jurnal Guru',`Catatan kegiatan ${currentClass()} · ${state.subject}`,`${contextBar()}<div class="card form"><div class="field"><label>Tanggal</label><input type="date"></div><div class="field"><label>Materi</label><input placeholder="Materi pembelajaran"></div><div class="field"><label>Aktivitas</label><textarea placeholder="Tuliskan kegiatan pembelajaran..."></textarea></div></div>`);else if(p==='schedule')simplePage('Jadwal',`Jadwal pembelajaran ${currentClass()}`,`${contextBar()}<div class="card"><p><b>Senin</b> · 08:00 ${state.subject}</p><p><b>Selasa</b> · 08:00 ${LEVELS[state.level].subjects[1]||'Mata Pelajaran'}</p><p class="muted">Jadwal nantinya dapat dibuat untuk setiap kelas, guru, mata pelajaran, dan rombel.</p></div>`);else if(p==='assessment')simplePage('Penilaian',`Penilaian ${currentClass()} · ${state.subject}`,`${contextBar()}<div class="grid">${['Diagnostik','Formatif','Sumatif','Analisis Nilai'].map(x=>`<div class="card"><h3>${x}</h3><p class="muted">Kelola penilaian dan hasil belajar ${state.level} kelas ${state.grade}.</p><button class="btn" onclick="showToast('Modul ${x} siap digunakan')">Buka</button></div>`).join('')}</div>`);else if(p==='reports')simplePage('Laporan',`Laporan ${currentClass()}`,`${contextBar()}<div class="grid">${['Laporan Nilai','Rekap Absensi','Jurnal','Perkembangan Siswa'].map(x=>`<div class="card"><h3>${x}</h3><p class="muted">Filter berdasarkan jenjang, kelas, rombel, semester, dan tahun ajaran.</p><button class="btn" onclick="window.print()">Preview / Print</button></div>`).join('')}</div>`);else if(p==='settings')simplePage('Pengaturan','Konfigurasi akademik',`<div class="card form"><div class="field"><label>Jenjang default</label><select onchange="changeLevel(this.value)">${levelOptions()}</select></div><div class="field"><label>Kelas default</label><select onchange="changeGrade(this.value)">${gradeOptions()}</select></div><div class="field"><label>Tahun Ajaran</label><input value="${state.academicYear}" onchange="state.academicYear=this.value;save()"></div><div class="field"><label>Semester</label><select onchange="state.semester=this.value;save()"><option ${state.semester==='Ganjil'?'selected':''}>Ganjil</option><option ${state.semester==='Genap'?'selected':''}>Genap</option></select></div><div class="field"><label>Ukuran kertas dokumen</label><select onchange="setPaperSize(this.value)"><option value="A4" ${state.paperSize==='A4'?'selected':''}>A4 — 21 × 29,7 cm</option><option value="F4" ${state.paperSize==='F4'?'selected':''}>F4 — 21 × 33 cm</option></select><small class="muted">Pengaturan ini dipakai untuk preview, cetak, PDF, dan Word.</small></div><div class="field"><label>Orientasi</label><select><option>Portrait</option><option>Landscape</option></select></div></div>`)}
function changeLevel(v){state.level=v;state.grade=LEVELS[v].grades[0];state.subject=LEVELS[v].subjects[0];save();route(location.hash.slice(1)||'dashboard')}
function changeGrade(v){state.grade=Number(v);save();route(location.hash.slice(1)||'dashboard')}
function changeSection(v){state.section=v;save();route(location.hash.slice(1)||'dashboard')}
function changeSubject(v){state.subject=v;save();route(location.hash.slice(1)||'dashboard')}
function go(p){route(p);document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===p));history.replaceState({},'',`#${p}`)}
document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>{go(b.dataset.page);document.querySelector('.sidebar').classList.remove('open')}));
document.getElementById('menuBtn').onclick=()=>document.querySelector('.sidebar').classList.toggle('open');
const initial=location.hash.slice(1)||'dashboard';route(initial);save();


/* =========================================================
   PRINT / PDF / WORD EXPORT
   - Print uses a clean print window and browser print engine.
   - PDF uses the same native print engine: choose "Save as PDF".
   - Word exports a .doc file compatible with Microsoft Word/LibreOffice.
   ========================================================= */
function getPrintPageSize() {
  const selected = document.querySelector('#paperSize, #printPaperSize, #modulePaperSize')?.value || localStorage.getItem('paperSize') || 'A4';
  return selected === 'F4'
    ? { name:'F4', width:'210mm', height:'330mm' }
    : { name:'A4', width:'210mm', height:'297mm' };
}

function getPrintableDocumentHTML() {
  const editor = document.querySelector('#documentEditor, #editorContent, .document-editor, [contenteditable="true"]');
  const titleEl = document.querySelector('#documentTitle, #docTitle, input[name="title"]');
  const title = titleEl?.value || titleEl?.textContent || 'Dokumen Modul Ajar';
  let content = editor?.innerHTML || document.querySelector('.editor-content')?.innerHTML || '';
  if (!content.trim()) {
    const active = document.querySelector('.page.active, .content-page.active, main');
    content = active?.innerHTML || '<p>Dokumen belum memiliki isi.</p>';
  }

  const tmp = document.createElement('div');
  tmp.innerHTML = content;
  tmp.querySelectorAll('button, input, select, textarea, .no-print, .print-hide').forEach(el => el.remove());

  const paper = getPrintPageSize();

  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>${escapeHtmlForExport(title)}</title>
<style>
@page { size: ${paper.width} ${paper.height}; margin: 18mm 15mm; }
* { box-sizing:border-box; }
html,body { margin:0; padding:0; }
body { font-family: Arial, Helvetica, sans-serif; color:#111; font-size:11pt; line-height:1.45; }
h1,h2,h3,h4 { page-break-after:avoid; }
h1 { font-size:18pt; text-align:center; margin:0 0 12pt; }
h2 { font-size:14pt; margin-top:16pt; border-bottom:1px solid #999; padding-bottom:4pt; }
h3 { font-size:12pt; margin-top:12pt; }
p { margin:0 0 7pt; }
table { width:100%; border-collapse:collapse; margin:8pt 0 12pt; page-break-inside:auto; }
thead { display:table-header-group; }
tr { page-break-inside:avoid; }
th,td { border:1px solid #777; padding:5pt 6pt; vertical-align:top; }
th { font-weight:700; }
ul,ol { margin-top:4pt; }
img { max-width:100%; height:auto; }
.export-header { text-align:center; margin-bottom:18pt; }
.export-footer { margin-top:18pt; font-size:9pt; text-align:center; color:#555; }
</style>
</head>
<body>
<div class="export-header"><h1>${escapeHtmlForExport(title)}</h1></div>
${tmp.innerHTML}
<div class="export-footer">Dicetak dari Pusat Administrasi Guru — ${paper.name}</div>
</body></html>`;
}

function escapeHtmlForExport(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

function printDocument() {
  const paper = getPrintPageSize();
  const w = window.open('', '_blank', 'width=1000,height=800');
  if (!w) {
    alert('Popup diblokir browser. Izinkan pop-up untuk mencetak dokumen.');
    return;
  }
  w.document.open();
  w.document.write(getPrintableDocumentHTML());
  w.document.close();
  w.focus();
  setTimeout(() => {
    w.print();
  }, 500);
}

function exportDocumentPDF() {
  printDocument();
}

function exportDocumentWord() {
  const titleEl = document.querySelector('#documentTitle, #docTitle, input[name="title"]');
  const title = (titleEl?.value || titleEl?.textContent || 'Dokumen Modul Ajar')
    .trim().replace(/[\\/:*?"<>|]+/g, '_').slice(0, 120) || 'Dokumen Modul Ajar';

  const html = getPrintableDocumentHTML();
  const blob = new Blob(['\ufeff', html], {type:'application/msword'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = title + '.doc';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
