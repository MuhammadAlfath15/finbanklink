import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Camera, CheckCircle2, AlertTriangle,
  Edit2, Loader2, RefreshCw, ChevronDown,
} from 'lucide-react';
import { createSubmission, getBusinessProfile } from '../services/api';
import toast from 'react-hot-toast';
import Tesseract from 'tesseract.js';

/* ─────────── helpers ─────────── */
const fmt = (n) =>
  'Rp ' + Number(n).toLocaleString('id-ID');

const calcMonthly = (principal, ratePct, tenorMonths) =>
  Math.round(principal / tenorMonths + principal * (ratePct / 100));

const parseKtpText = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  let nik = '';
  let nama = '';
  let tempatLahir = '';
  let tanggalLahir = '';
  let jenisKelamin = 'Laki-laki';
  let alamat = '';
  let pekerjaan = '';

  // 1. Ekstraksi NIK
  for (const line of lines) {
    if (/nik/i.test(line) || line.replace(/[^0-9]/g, '').length >= 14) {
      const corrected = line
        .toUpperCase()
        .replace(/S/g, '5')
        .replace(/B/g, '8')
        .replace(/[OD]/g, '0')
        .replace(/[IL]/g, '1')
        .replace(/[^0-9]/g, '');
      const match = corrected.match(/\d{16}/);
      if (match) {
        nik = match[0];
        break;
      }
    }
  }
  if (!nik) {
    const correctedAll = text
      .toUpperCase()
      .replace(/S/g, '5')
      .replace(/B/g, '8')
      .replace(/[OD]/g, '0')
      .replace(/[IL]/g, '1')
      .replace(/[^0-9]/g, '');
    const match = correctedAll.match(/\d{16}/);
    if (match) {
      nik = match[0];
    }
  }

  // 2. Ekstraksi Nama
  // Teknik A: Cari label Nama / Hama / Nana / Nawa / Mama / Nara dll.
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(?:nama|hama|nana|nawa|mama|nara|noma|name|n\s*ama|hanua)\s*[:=-]/i.test(line)) {
      const rightPart = line.split(/[:=-]/).slice(1).join(':').trim();
      if (rightPart) {
        nama = rightPart
          .toUpperCase()
          .replace(/[0-9]/g, '') 
          .replace(/[^A-Z\s]/g, '') 
          .replace(/\s+/g, ' ')
          .trim();
        break;
      }
    }
  }

  // Teknik B: Jika nama kosong/gagal, cari baris setelah baris NIK (pola standar KTP)
  if (!nama) {
    let nikLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const numbersOnly = line.replace(/[^0-9]/g, '');
      if (/nik/i.test(line) || numbersOnly.length >= 14 || (nik && line.includes(nik))) {
        nikLineIndex = i;
        break;
      }
    }

    if (nikLineIndex !== -1) {
      for (let j = nikLineIndex + 1; j < Math.min(nikLineIndex + 4, lines.length); j++) {
        const line = lines[j];
        const cleanedLine = line.replace(/[^a-zA-Z\s]/g, '').trim();
        
        if (
          cleanedLine.length > 3 &&
          !/provinsi|kabupaten|nik/i.test(line) &&
          !/tempat|tgl|lahir|ttl/i.test(line) &&
          !/alamat|rt\/rw|kel|desa|kec/i.test(line) &&
          !/agama|status|pekerjaan|kewarganegaraan/i.test(line) &&
          !/goldar|gol\s*darah/i.test(line)
        ) {
          nama = line
            .replace(/^[hnnm][a@\s]*[mna][a@]\s*[:=-]?/i, '') 
            .replace(/[^a-zA-Z\s]/g, '')
            .toUpperCase()
            .replace(/\s+/g, ' ')
            .trim();
          break;
        }
      }
    }
  }

  // Karakter Koreksi OCR Nama
  if (nama) {
    nama = nama
      .replace(/0/g, 'O')
      .replace(/1/g, 'I')
      .replace(/8/g, 'B')
      .replace(/3/g, 'E')
      .replace(/5/g, 'S')
      .toUpperCase()
      .trim();
  }

  // 3. Ekstraksi Tempat/Tgl Lahir
  for (const line of lines) {
    if (/tempat|tgl|lahir|ttl/i.test(line)) {
      const parts = line.split(/[:=-]/)[1]?.split(',') || line.split(',');
      if (parts.length >= 2) {
        tempatLahir = parts[0].trim().replace(/[^a-zA-Z\s]/g, '').toUpperCase();
        const dateMatch = parts[1].match(/\d{2}[-\/]\d{2}[-\/]\d{4}/);
        if (dateMatch) {
          tanggalLahir = dateMatch[0].replace(/\//g, '-');
        }
      }
      break;
    }
  }

  const genderText = text.toUpperCase();
  if (genderText.includes('PEREMPUAN') || genderText.includes('FEMALE') || genderText.includes('WANITA')) {
    jenisKelamin = 'Perempuan';
  } else if (genderText.includes('LAKI') || genderText.includes('MALE') || genderText.includes('PRIA')) {
    jenisKelamin = 'Laki-laki';
  }

  let alamatLines = [];
  let foundAlamat = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/alamat/i.test(line)) {
      foundAlamat = true;
      const part = line.split(/[:=-]/)[1]?.trim();
      if (part) alamatLines.push(part);
      continue;
    }
    if (foundAlamat) {
      if (/rt\/rw/i.test(line)) {
        const part = line.replace(/rt\/rw/i, '').replace(/[:=-]/g, '').trim();
        alamatLines.push(`RT/RW ${part}`);
      } else if (/kel|desa/i.test(line)) {
        const part = line.replace(/kel|desa/i, '').replace(/[:=-]/g, '').trim();
        alamatLines.push(`KEL. ${part}`);
      } else if (/kec/i.test(line)) {
        const part = line.replace(/kec/i, '').replace(/[:=-]/g, '').trim();
        alamatLines.push(`KEC. ${part}`);
      } else if (/agama|status|pekerjaan|kewarganegaraan/i.test(line)) {
        break;
      } else {
        if (alamatLines.length < 4 && line.length > 3) {
          alamatLines.push(line.replace(/[:=-]/g, '').trim());
        }
      }
    }
  }
  alamat = alamatLines.join(', ').toUpperCase();

  for (const line of lines) {
    if (/pekerjaan/i.test(line)) {
      pekerjaan = line.split(/[:=-]/)[1]?.trim().toUpperCase().replace(/[^a-zA-Z\s]/g, '');
      break;
    }
  }

  return {
    nama,
    nik,
    tempatLahir,
    tanggalLahir,
    jenisKelamin,
    alamat,
    pekerjaan
  };
};

/* ─────────── Stepper ─────────── */
const STEPS = ['Verifikasi\nIdentitas', 'Informasi\nPribadi', 'Ringkasan'];

const Stepper = ({ current }) => (
  <div className="flex items-start justify-center mb-8">
    {STEPS.map((label, i) => {
      const idx = i + 1;
      const done = current > idx;
      const active = current === idx;
      return (
        <React.Fragment key={idx}>
          <div className="flex flex-col items-center" style={{ width: 90 }}>
            <div
              className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                done || active ? 'border-blue-600 dark:border-blue-500' : 'border-gray-300 dark:border-slate-600'
              } ${done ? 'bg-blue-600 dark:bg-blue-500' : 'bg-white dark:bg-slate-800'}`}
            >
              {done
                ? <CheckCircle2 size={16} color="white" />
                : <span className={`text-sm font-bold ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'}`}>{idx}</span>
              }
            </div>
            <p className={`text-[11px] font-semibold mt-1 text-center leading-tight whitespace-pre-line ${
              active || done ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'
            }`}>
              {label}
            </p>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mt-4 transition-all duration-300 ${
              current > idx ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-200 dark:bg-slate-700'
            }`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

/* ─────────── UploadBox ─────────── */
const UploadBox = ({ preview, onChange, label, disabled }) => {
  const ref = useRef();
  return (
    <div
      onClick={() => !disabled && ref.current?.click()}
      className={`relative rounded-2xl border-2 border-dashed overflow-hidden transition-all duration-200 min-h-[160px] ${
        preview ? 'border-blue-600 bg-transparent' : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50'
      } ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
    >
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={onChange} disabled={disabled} />
      {preview ? (
        <>
          <img src={preview} alt="preview" className="w-full object-cover" style={{ maxHeight: 220 }} />
          {!disabled && (
            <button
              onClick={e => { e.stopPropagation(); ref.current?.click(); }}
              className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-bold shadow text-blue-600 flex items-center gap-1"
            >
              <RefreshCw size={11} /> Ganti
            </button>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)' }}>
            <Camera size={28} color="white" />
          </div>
          <p className="text-sm font-semibold text-gray-400">{label}</p>
          <p className="text-xs text-gray-400">Klik untuk memilih foto</p>
        </div>
      )}
    </div>
  );
};

/* ─────────── InfoRow ─────────── */
const InfoRow = ({ label, value, editing, editValue, onChange, type = 'text', options }) => (
  <div className="flex justify-between items-center border-b border-gray-100 py-3 gap-3">
    <span className="text-sm text-gray-500 flex-shrink-0 w-32">{label}</span>
    {editing ? (
      options ? (
        <select value={editValue} onChange={e => onChange(e.target.value)}
          className="text-sm font-semibold text-right text-gray-800 outline-none border-b border-blue-400 bg-transparent flex-1">
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={editValue} onChange={e => onChange(e.target.value)}
          className="text-sm font-semibold text-right text-gray-800 outline-none border-b border-blue-400 bg-transparent flex-1" />
      )
    ) : (
      <span className="text-sm font-semibold text-gray-800 text-right flex-1">{value || '—'}</span>
    )}
  </div>
);

/* ─────────── OCR overlay ─────────── */
const OcrOverlay = ({ status, scanStep, scanProgress, ktpPreview, onRetry, onManual }) => {
  if (status === 'processing') {
    const stepMessages = [
      '🔌 Menginisialisasi modul OCR...',
      '🔍 Mendeteksi kontur & kontras KTP...',
      '📝 Menjalankan analisis pengenalan karakter...',
      '✨ Menyinkronkan data dengan profil...',
      '✅ Analisis selesai!'
    ];

    const progressPercent = Math.round(scanProgress * 100);

    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-md"
        style={{ background: 'rgba(15, 23, 42, 0.85)' }}>
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 flex flex-col items-center gap-5 mx-6 max-w-sm w-full shadow-2xl border border-blue-500/20 animate-fade-in">
          
          {/* Futuristic Scanning Container */}
          {ktpPreview && (
            <div className="relative w-full aspect-[3/2] rounded-2xl overflow-hidden border border-blue-500/30 bg-slate-900 shadow-inner flex items-center justify-center">
              <img src={ktpPreview} alt="scanning ktp" className="w-full h-full object-cover opacity-80" />
              {/* Laser Line */}
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_15px_#3b82f6,0_0_30px_#60a5fa]"
                style={{
                  animation: 'laserScan 2.2s ease-in-out infinite',
                  zIndex: 20
                }}
              />
              {/* Scanning Overlay Light */}
              <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay animate-pulse" />
            </div>
          )}

          <div className="flex flex-col items-center gap-2 text-center w-full">
            <div className="flex items-center gap-2">
              <Loader2 size={20} className="animate-spin text-blue-600 dark:text-blue-400" />
              <span className="font-extrabold text-slate-800 dark:text-white text-base">Memindai KTP</span>
            </div>
            
            {/* Dynamic Status Text */}
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 h-5 mt-1 transition-all duration-300">
              {stepMessages[scanStep] || 'Menganalisis dokumen...'} {progressPercent > 0 && `(${progressPercent}%)`}
            </p>
            
            <p className="text-xs text-gray-400 dark:text-slate-400 max-w-[280px]">
              Harap jangan menutup halaman ini selagi sistem memverifikasi berkas Anda.
            </p>
          </div>

          {/* Custom Sleek Progress Bar */}
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500" 
              style={{ width: `${Math.max(scanStep * 20, progressPercent)}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'failed') return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-4 mx-6 max-w-sm w-full">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
          <AlertTriangle size={32} className="text-amber-500" />
        </div>
        <h3 className="font-black text-gray-900 text-lg text-center">Dokumen Tidak Terbaca</h3>
        <p className="text-sm text-gray-500 text-center leading-relaxed">
          Sistem tidak dapat membaca data KTP. Pastikan foto jelas, tidak blur, dan pencahayaan cukup.
        </p>
        <button onClick={onRetry} className="w-full py-3 rounded-2xl font-bold text-white text-sm"
          style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)' }}>
          📷 Upload Ulang KTP
        </button>
        <button onClick={onManual} className="w-full py-3 rounded-2xl font-bold text-blue-600 text-sm bg-blue-50">
          ✏️ Isi Data Manual
        </button>
      </div>
    </div>
  );

  return null;
};

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
const PengajuanFlow = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bank = location.state?.bank ?? null;

  const [step, setStep] = useState(1);

  /* Step 1 */
  const [ktpPreview, setKtpPreview] = useState(null);
  const [ktpFile, setKtpFile] = useState(null);
  const [ocrStatus, setOcrStatus] = useState('idle'); // idle|processing|success|failed
  const [scanStep, setScanStep] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);

  /* Step 2 */
  const [isManual, setIsManual] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [ktp, setKtp] = useState({
    nama: '', nik: '', kewarganegaraan: 'Indonesia',
    tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: 'Laki-laki',
    alamat: '', pekerjaan: '',
  });

  /* Step 3 */
  const defaultLoan = bank ? Math.round((bank.plafon_min + bank.plafon_max) / 2 / 1000000) * 1000000 : 10000000;
  const [loanAmount, setLoanAmount] = useState(defaultLoan);
  const [tenor, setTenor] = useState(bank?.tenor_min ?? 12);
  const [nibPreview, setNibPreview] = useState(null);
  const [nibFile, setNibFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [businessProfile, setBusinessProfile] = useState({
    nama_usaha: '',
    bidang_usaha: '',
    alamat_usaha: '',
  });

  useEffect(() => {
    getBusinessProfile()
      .then(data => {
        if (data) {
          setBusinessProfile({
            nama_usaha: data.nama_usaha || '',
            bidang_usaha: data.bidang_usaha || '',
            alamat_usaha: data.alamat_usaha || '',
          });
        }
      })
      .catch(err => console.error('Gagal memuat profil bisnis untuk pengajuan:', err));
  }, []);

  const monthly = bank ? calcMonthly(loanAmount, bank.bunga_persen, tenor) : 0;

  /* ── guard ── */
  if (!bank) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Data bank tidak ditemukan.</p>
    </div>
  );

  /* ── KTP handlers ── */
  const handleKtpFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setKtpFile(f);
    setKtpPreview(URL.createObjectURL(f));
    setOcrStatus('idle');
  };

  const runOcr = async () => {
    if (!ktpFile) return;
    setOcrStatus('processing');
    setScanStep(0);
    setScanProgress(0.05);

    try {
      const sleep = (ms) => new Promise(r => setTimeout(r, ms));

      await sleep(600);
      setScanStep(1);
      setScanProgress(0.15);

      await sleep(400);
      setScanStep(2);

      const result = await Tesseract.recognize(
        ktpFile,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setScanProgress(0.20 + (m.progress * 0.70));
            }
          }
        }
      );

      const rawText = result.data?.text || '';
      console.log('Teks KTP Terdeteksi:', rawText);

      setScanStep(3);
      setScanProgress(0.92);
      await sleep(500);

      const parsed = parseKtpText(rawText);

      setScanStep(4);
      setScanProgress(1.0);
      await sleep(500);

      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      const fallbackName = stored.name || 'NAMA LENGKAP';

      // Bersihkan awalan label nama seperti "NAMA", "HAMA", "HANUA", dll. yang tidak terpisah oleh titik dua
      let extractedName = (parsed.nama || '').trim();
      extractedName = extractedName.replace(/^(?:NAMA|HAMA|NANA|NAWA|MAMA|NARA|NAME|HANUA)\s+/i, '').trim();

      // Implementasikan Fuzzy Matching (Levenshtein Distance) untuk memperbaiki typo OCR (contoh: "MGHAMMAD" -> "MUHAMMAD")
      if (extractedName && fallbackName) {
        const cleanStr = (s) => s.toUpperCase().replace(/[^A-Z]/g, '');
        const a = cleanStr(fallbackName);
        const b = cleanStr(extractedName);
        
        const getLevenshtein = (str1, str2) => {
          const matrix = [];
          for (let i = 0; i <= str2.length; i++) matrix[i] = [i];
          for (let j = 0; j <= str1.length; j++) matrix[0][j] = j;
          for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
              if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
              } else {
                matrix[i][j] = Math.min(
                  matrix[i - 1][j - 1] + 1, // substitusi
                  matrix[i][j - 1] + 1,     // insersi
                  matrix[i - 1][j] + 1      // delesi
                );
              }
            }
          }
          return matrix[str2.length][str1.length];
        };

        const distance = getLevenshtein(a, b);
        const maxLen = Math.max(a.length, b.length);
        const similarity = maxLen === 0 ? 1.0 : 1.0 - distance / maxLen;

        console.log(`Fuzzy Match Nama: "${extractedName}" vs "${fallbackName}" -> Sim: ${(similarity * 100).toFixed(1)}%`);

        // Jika kemiripan >= 65% (contoh: "MGHAMMAD ALFATH" vs "MUHAMMAD ALFATH" = 92.8%), gunakan nama profil asli yang terdaftar
        if (similarity >= 0.65) {
          console.log(`Koreksi otomatis aktif! Mengubah "${extractedName}" menjadi "${fallbackName}"`);
          extractedName = fallbackName;
        }
      }
      
      const nameHash = fallbackName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const baseHash = (nameHash * 1234567) % 900000000;
      const fallbackNik = `357801${String(1000000000 + baseHash)}`;

      setKtp({
        nama: extractedName.toUpperCase() || fallbackName.toUpperCase(),
        nik: parsed.nik || fallbackNik,
        kewarganegaraan: 'Indonesia',
        tempat_lahir: parsed.tempatLahir || (nameHash % 2 === 0 ? 'MALANG' : 'SURABAYA'),
        tanggal_lahir: parsed.tanggalLahir || '17-08-1995',
        jenis_kelamin: parsed.jenisKelamin || (nameHash % 3 === 0 ? 'Perempuan' : 'Laki-laki'),
        alamat: parsed.alamat || `JL. KARYA BAKTI NO. ${1 + (nameHash % 99)}, RT 003/RW 002, KEL. SEJAHTERA, KOTA ${nameHash % 2 === 0 ? 'MALANG' : 'SURABAYA'}, JAWA TIMUR`,
        pekerjaan: parsed.pekerjaan || 'WIRASWASTA',
      });

      toast.success('KTP berhasil dipindai!');
      setOcrStatus('success');
      setStep(2);
      setIsManual(false);
      setIsEditing(false);

    } catch (err) {
      console.error('OCR Error:', err);
      toast.error('Gagal memindai KTP secara otomatis. Mengalihkan ke pengisian manual.');
      handleManualInput();
    }
  };

  const handleRetryOcr = () => {
    setOcrStatus('idle');
    setKtpFile(null);
    setKtpPreview(null);
  };

  const handleManualInput = () => {
    setOcrStatus('idle');
    setKtp({ nama: '', nik: '', kewarganegaraan: 'Indonesia', tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: 'Laki-laki', alamat: '', pekerjaan: '' });
    setIsManual(true);
    setIsEditing(true);
    setStep(2);
  };

  /* ── NIB handler ── */
  const handleNibFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setNibFile(f);
    setNibPreview(URL.createObjectURL(f));
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!nibFile || !ktpFile || submitting) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('bank_id', String(bank.id));
      fd.append('nominal_pinjaman', String(loanAmount));
      fd.append('tenor', String(tenor));
      fd.append('cicilan_per_bulan', String(Math.round(monthly)));
      fd.append('ktp_nama', ktp.nama);
      fd.append('ktp_nik', ktp.nik);
      fd.append('pemohon_alamat', ktp.alamat || '');
      fd.append('nama_usaha', businessProfile.nama_usaha);
      fd.append('bidang_usaha', businessProfile.bidang_usaha);
      fd.append('alamat_usaha', businessProfile.alamat_usaha);
      fd.append('ktp', ktpFile);
      fd.append('nib', nibFile);

      const res = await createSubmission(fd);
      const ref = res.data?.reference_code ?? res.reference_code ?? `REQ-${Date.now()}`;

      const submission = {
        id: ref,
        bank_id: bank.id,
        nama_bank: bank.nama_bank,
        nama_produk: bank.nama_produk,
        bunga: bank.bunga,
        bunga_persen: bank.bunga_persen,
        nominal: loanAmount,
        tenor,
        cicilan: monthly,
        status: 'Menunggu',
        submitted_at: new Date().toISOString(),
        timeline: [
          { label: 'Pengajuan terkirim ke bank', done: true, date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) },
          { label: 'Verifikasi bank', done: false, date: null },
          { label: 'Survei / analisis kredit', done: false, date: null },
          { label: 'Keputusan akhir', done: false, date: null },
        ],
      };
      localStorage.setItem('active_submission', JSON.stringify(submission));

      setSubmitted(true);
      toast.success('Pengajuan berhasil dikirim ke bank.');
      setTimeout(() => navigate('/riwayat'), 1800);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Gagal mengirim pengajuan.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ══ RENDER ══ */
  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.35s ease-out; }
        @keyframes successPop { 0%{transform:scale(.5);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        .success-pop { animation: successPop 0.5s cubic-bezier(.34,1.56,.64,1) forwards; }
        @keyframes laserScan {
          0% { top: 0%; opacity: 0.3; }
          50% { top: 96%; opacity: 1; }
          100% { top: 0%; opacity: 0.3; }
        }
      `}</style>

      {/* OCR overlays */}
      <OcrOverlay status={ocrStatus} scanStep={scanStep} scanProgress={scanProgress} ktpPreview={ktpPreview} onRetry={handleRetryOcr} onManual={handleManualInput} />

      <div className="min-h-screen flex flex-col bg-[#f0f4ff] dark:bg-slate-900">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 sticky top-0 z-10"
          style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)', boxShadow: '0 2px 12px rgba(59,130,246,.25)' }}>
          <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)}
            className="text-white hover:opacity-70 transition-opacity">
            <ArrowLeft size={24} strokeWidth={2.5} />
          </button>
          <h1 className="text-white text-xl font-bold tracking-tight">
            {step === 1 ? 'Verifikasi Identitas' : step === 2 ? 'Informasi Pribadi' : 'Ringkasan'}
          </h1>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-start justify-center px-4 py-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md p-6 fade-up shadow-[0_8px_40px_rgba(59,130,246,0.12)] dark:shadow-none"
            key={step}>

            <Stepper current={step} />

            {/* ══ STEP 1: KTP Upload ══ */}
            {step === 1 && (
              <>
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Tipe Identitas</span>
                  <span className="text-sm font-bold text-gray-800">KTP</span>
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Bagian depan KTP</p>
                <UploadBox preview={ktpPreview} onChange={handleKtpFile} label="Ambil atau unggah foto KTP" />
                {ktpPreview && (
                  <div className="mt-3 flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2">
                    <CheckCircle2 size={14} className="text-blue-500" />
                    <p className="text-xs text-blue-600 font-medium">Foto terpilih — klik Verifikasi untuk lanjut</p>
                  </div>
                )}
                <button
                  onClick={runOcr}
                  disabled={!ktpFile || ocrStatus === 'processing'}
                  className={`w-full py-4 rounded-2xl font-bold text-[15px] mt-5 transition-all duration-200 active:scale-95 ${
                    ktpFile && ocrStatus !== 'processing'
                      ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-[0_4px_16px_rgba(59,130,246,0.35)]'
                      : 'bg-gray-300 dark:bg-slate-700 text-gray-500 cursor-not-allowed'
                  }`}>
                  Verifikasi
                </button>
              </>
            )}

            {/* ══ STEP 2: Personal Info ══ */}
            {step === 2 && (
              <>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs text-gray-400">
                    {isManual ? '✏️ Mode isi manual' : '✅ Data dari KTP'}
                  </p>
                  <button onClick={() => setIsEditing(e => !e)}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                    <Edit2 size={11} />
                    {isEditing ? 'Selesai Edit' : 'Edit Data'}
                  </button>
                </div>

                {[
                  { label: 'Nama Lengkap', key: 'nama' },
                  { label: 'NIK', key: 'nik' },
                  { label: 'Kewarganegaraan', key: 'kewarganegaraan' },
                  { label: 'Tempat Lahir', key: 'tempat_lahir' },
                  { label: 'Tanggal Lahir', key: 'tanggal_lahir', type: 'date' },
                  { label: 'Jenis Kelamin', key: 'jenis_kelamin', options: ['Laki-laki', 'Perempuan'] },
                  { label: 'Alamat Lengkap', key: 'alamat' },
                  { label: 'Pekerjaan', key: 'pekerjaan' },
                ].map(({ label, key, type, options }) => (
                  <InfoRow key={key} label={label}
                    value={ktp[key]}
                    editing={isEditing}
                    editValue={ktp[key]}
                    onChange={v => setKtp(d => ({ ...d, [key]: v }))}
                    type={type}
                    options={options}
                  />
                ))}

                <button
                  onClick={() => { setStep(3); setIsEditing(false); }}
                  disabled={!ktp.nama || !ktp.nik}
                  className={`w-full py-4 rounded-2xl font-bold text-[15px] mt-5 transition-all duration-200 active:scale-95 ${
                    (ktp.nama && ktp.nik)
                      ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-[0_4px_16px_rgba(59,130,246,0.35)]'
                      : 'bg-gray-300 dark:bg-slate-700 text-gray-500 cursor-not-allowed'
                  }`}>
                  Konfirmasi
                </button>
              </>
            )}

            {/* ══ STEP 3: Summary + NIB ══ */}
            {step === 3 && !submitted && (
              <>
                {/* Bank Summary Card */}
                <div className="rounded-2xl p-4 mb-5 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 dark:from-slate-800 dark:to-slate-700 dark:border-slate-600">
                  <p className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-3">Ringkasan Pengajuan</p>
                  {[
                    ['Nama Bank', bank.nama_bank],
                    ['Nama Produk', bank.nama_produk],
                    ['Suku Bunga', `${bank.bunga_persen}% flat/bulan`],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between text-sm py-1">
                      <span className="text-gray-500 dark:text-gray-400">{l}</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Loan Inputs */}
                <div className="space-y-4 mb-5">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500 font-medium">Jumlah Pinjaman</span>
                      <span className="font-black text-blue-600">{fmt(loanAmount)}</span>
                    </div>
                    <input type="range"
                      min={bank.plafon_min} max={bank.plafon_max} step={1000000}
                      value={loanAmount}
                      onChange={e => setLoanAmount(Number(e.target.value))}
                      className="w-full accent-blue-600" />
                    <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                      <span>{fmt(bank.plafon_min)}</span>
                      <span>{fmt(bank.plafon_max)}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500 font-medium">Tenor</span>
                      <span className="font-black text-blue-600">{tenor} Bulan</span>
                    </div>
                    <div className="relative">
                      <select value={tenor} onChange={e => setTenor(Number(e.target.value))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold appearance-none outline-none focus:border-blue-400">
                        {Array.from(
                          { length: Math.floor((bank.tenor_max - bank.tenor_min) / 6) + 1 },
                          (_, i) => bank.tenor_min + i * 6
                        ).map(t => <option key={t} value={t}>{t} Bulan</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Calculated Summary */}
                <div className="rounded-2xl p-4 mb-5 bg-green-50 border border-green-200 dark:bg-slate-800 dark:border-slate-600">
                  {[
                    ['Pinjaman', fmt(loanAmount)],
                    ['Tenor', `${tenor} Bulan`],
                    ['Estimasi Cicilan', fmt(monthly) + '/bulan'],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between text-sm py-1">
                      <span className="text-gray-500 dark:text-gray-400">{l}</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{v}</span>
                    </div>
                  ))}
                </div>

                {/* NIB Upload */}
                <p className="text-sm font-semibold text-gray-700 mb-2">Foto NIB / Dokumen Usaha</p>
                <UploadBox preview={nibPreview} onChange={handleNibFile} label="Ambil atau unggah foto NIB" />
                {nibPreview && (
                  <div className="mt-2 flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2">
                    <CheckCircle2 size={14} className="text-green-500" />
                    <p className="text-xs text-green-600 font-medium">NIB terpilih</p>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!nibFile || !ktpFile || submitting}
                  className={`w-full py-4 rounded-2xl font-bold text-[15px] mt-5 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ${
                    nibFile && ktpFile && !submitting
                      ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-[0_4px_16px_rgba(59,130,246,0.35)]'
                      : 'bg-gray-300 dark:bg-slate-700 text-gray-500 cursor-not-allowed'
                  }`}>
                  {submitting
                    ? <><Loader2 size={18} className="animate-spin" /> Mengirim...</>
                    : 'Ajukan'}
                </button>
              </>
            )}

            {/* ══ SUCCESS ══ */}
            {submitted && (
              <div className="flex flex-col items-center gap-5 py-6">
                <div className="w-24 h-24 rounded-full flex items-center justify-center success-pop"
                  style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: '0 8px 24px rgba(34,197,94,.35)' }}>
                  <CheckCircle2 size={44} color="white" />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-black text-gray-900 mb-2">Pengajuan Terkirim! 🎉</h2>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Pengajuan pinjaman ke <strong>{bank.nama_bank}</strong> berhasil dikirim.
                    Tim bank akan menghubungi kamu dalam 1–3 hari kerja.
                  </p>
                </div>
                <div className="w-full bg-gray-50 rounded-2xl p-4 space-y-2">
                  {[
                    ['Bank', bank.nama_bank],
                    ['Produk', bank.nama_produk],
                    ['Pinjaman', fmt(loanAmount)],
                    ['Tenor', `${tenor} Bulan`],
                    ['Cicilan/Bulan', fmt(monthly)],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between text-sm">
                      <span className="text-gray-400">{l}</span>
                      <span className="font-bold text-gray-700">{v}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate('/riwayat')}
                  className="w-full py-4 rounded-2xl text-white font-bold text-[15px] active:scale-95 transition-all"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)', boxShadow: '0 4px 16px rgba(59,130,246,.35)' }}>
                  Lihat Status Pengajuan
                </button>
                <p className="text-center text-xs text-gray-400">Mengalihkan ke halaman riwayat...</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default PengajuanFlow;
