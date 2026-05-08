import React, { useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Camera, CheckCircle2, AlertTriangle,
  Edit2, Loader2, RefreshCw, ChevronDown,
} from 'lucide-react';

/* ─────────── helpers ─────────── */
const fmt = (n) =>
  'Rp ' + Number(n).toLocaleString('id-ID');

const calcMonthly = (principal, ratePct, tenorMonths) =>
  Math.round(principal / tenorMonths + principal * (ratePct / 100));

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
              className="w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300"
              style={{
                borderColor: done || active ? '#2563eb' : '#d1d5db',
                background: done ? '#2563eb' : 'white',
              }}
            >
              {done
                ? <CheckCircle2 size={16} color="white" />
                : <span className="text-sm font-bold" style={{ color: active ? '#2563eb' : '#9ca3af' }}>{idx}</span>
              }
            </div>
            <p className="text-[11px] font-semibold mt-1 text-center leading-tight whitespace-pre-line"
              style={{ color: active || done ? '#2563eb' : '#9ca3af' }}>
              {label}
            </p>
          </div>
          {i < STEPS.length - 1 && (
            <div className="flex-1 h-0.5 mt-4 transition-all duration-300"
              style={{ background: current > idx ? '#2563eb' : '#e5e7eb' }} />
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
      className="relative rounded-2xl border-2 border-dashed overflow-hidden transition-all duration-200"
      style={{
        borderColor: preview ? '#2563eb' : '#cbd5e1',
        background: preview ? 'transparent' : '#f8fafc',
        minHeight: 160,
        cursor: disabled ? 'default' : 'pointer',
      }}
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
const OcrOverlay = ({ status, onRetry, onManual }) => {
  if (status === 'processing') return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-4 mx-6">
        <Loader2 size={44} className="animate-spin text-blue-600" />
        <p className="font-black text-gray-900 text-lg">Membaca dokumen KTP...</p>
        <p className="text-sm text-gray-400 text-center">Harap tunggu, sistem sedang menganalisis data KTP kamu</p>
        <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '70%' }} />
        </div>
      </div>
    </div>
  );

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
    await new Promise(r => setTimeout(r, 2800));

    const tooSmall = ktpFile.size < 20000;
    const randomFail = Math.random() < 0.05;

    if (tooSmall || randomFail) {
      setOcrStatus('failed');
      return;
    }

    /* Simulate successful OCR — bisa diganti dengan API call nyata */
    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    setKtp({
      nama: (stored.name || 'NAMA LENGKAP').toUpperCase(),
      nik: '3' + String(Math.floor(Math.random() * 1e15)).slice(0, 15),
      kewarganegaraan: 'Indonesia',
      tempat_lahir: 'MALANG',
      tanggal_lahir: '01-01-1995',
      jenis_kelamin: 'Laki-laki',
      alamat: 'JL. CONTOH ALAMAT NO. 1, RT 001/RW 001, KEL. CONTOH, KEC. CONTOH, KOTA MALANG, JAWA TIMUR',
      pekerjaan: 'WIRASWASTA',
    });
    setOcrStatus('success');
    setStep(2);
    setIsManual(false);
    setIsEditing(false);
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
    if (!nibFile || submitting) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 2000));

    // Simpan data pengajuan ke localStorage
    const submission = {
      id: 'PRO-' + Date.now(),
      bank_id:      bank.id,
      nama_bank:    bank.nama_bank,
      nama_produk:  bank.nama_produk,
      bunga:        bank.bunga,
      bunga_persen: bank.bunga_persen,
      nominal:      loanAmount,
      tenor,
      cicilan:      monthly,
      status:       'DOKUMEN TERKIRIM',
      submitted_at: new Date().toISOString(),
      timeline: [
        { label: 'Dokumen Terkirim', done: true,  date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) },
        { label: 'Verifikasi Data Sistem', done: false, date: null },
        { label: 'Survei Lokasi oleh Bank', done: false, date: null },
        { label: 'Analisis Kredit Final',   done: false, date: null },
        { label: 'Penandatanganan Akad',    done: false, date: null },
      ],
    };
    localStorage.setItem('active_submission', JSON.stringify(submission));

    setSubmitting(false);
    setSubmitted(true);
    // Auto-navigate ke riwayat setelah 1.8s
    setTimeout(() => navigate('/riwayat'), 1800);
  };

  /* ══ RENDER ══ */
  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.35s ease-out; }
        @keyframes successPop { 0%{transform:scale(.5);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        .success-pop { animation: successPop 0.5s cubic-bezier(.34,1.56,.64,1) forwards; }
      `}</style>

      {/* OCR overlays */}
      <OcrOverlay status={ocrStatus} onRetry={handleRetryOcr} onManual={handleManualInput} />

      <div className="min-h-screen flex flex-col" style={{ background: '#f0f4ff' }}>

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
          <div className="bg-white rounded-3xl w-full max-w-md p-6 fade-up"
            style={{ boxShadow: '0 8px 40px rgba(59,130,246,.12)' }}
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
                  className="w-full py-4 rounded-2xl text-white font-bold text-[15px] mt-5 transition-all duration-200 active:scale-95"
                  style={ktpFile
                    ? { background: 'linear-gradient(135deg,#3b82f6,#2563eb)', boxShadow: '0 4px 16px rgba(59,130,246,.35)' }
                    : { background: '#d1d5db', cursor: 'not-allowed' }}>
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
                  className="w-full py-4 rounded-2xl text-white font-bold text-[15px] mt-5 transition-all duration-200 active:scale-95"
                  style={(ktp.nama && ktp.nik)
                    ? { background: 'linear-gradient(135deg,#3b82f6,#2563eb)', boxShadow: '0 4px 16px rgba(59,130,246,.35)' }
                    : { background: '#d1d5db', cursor: 'not-allowed' }}>
                  Konfirmasi
                </button>
              </>
            )}

            {/* ══ STEP 3: Summary + NIB ══ */}
            {step === 3 && !submitted && (
              <>
                {/* Bank Summary Card */}
                <div className="rounded-2xl p-4 mb-5"
                  style={{ background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '1px solid #bfdbfe' }}>
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3">Ringkasan Pengajuan</p>
                  {[
                    ['Nama Bank', bank.nama_bank],
                    ['Nama Produk', bank.nama_produk],
                    ['Suku Bunga', `${bank.bunga_persen}% flat/bulan`],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between text-sm py-1">
                      <span className="text-gray-500">{l}</span>
                      <span className="font-bold text-gray-800">{v}</span>
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
                <div className="rounded-2xl p-4 mb-5"
                  style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  {[
                    ['Pinjaman', fmt(loanAmount)],
                    ['Tenor', `${tenor} Bulan`],
                    ['Estimasi Cicilan', fmt(monthly) + '/bulan'],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between text-sm py-1">
                      <span className="text-gray-500">{l}</span>
                      <span className="font-bold text-gray-800">{v}</span>
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
                  disabled={!nibFile || submitting}
                  className="w-full py-4 rounded-2xl text-white font-bold text-[15px] mt-5 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                  style={nibFile && !submitting
                    ? { background: 'linear-gradient(135deg,#3b82f6,#2563eb)', boxShadow: '0 4px 16px rgba(59,130,246,.35)' }
                    : { background: '#d1d5db', cursor: 'not-allowed' }}>
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
