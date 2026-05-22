import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MessageCircle, X, ChevronRight } from 'lucide-react';
import { sendLoanOtp, getMySubmissions } from '../services/api';

/* ─────────────────────────────────────────────
   OTP Bottom-Sheet Modal
   ───────────────────────────────────────────── */
const OtpModal = ({ onConfirm, onOtherWay, onCancel, loading, error }) => {
  return (
    <>
      <style>{`
        @keyframes backdropFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes sheetSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        .animate-backdrop-fade-in {
          animation: backdropFadeIn 0.3s ease-out forwards;
        }
        .animate-sheet-slide-up {
          animation: sheetSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/45 animate-backdrop-fade-in"
        onClick={onCancel}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 animate-sheet-slide-up"
        style={{
          maxWidth: '640px',
          margin: '0 auto',
        }}
      >
        <div className="bg-white rounded-t-3xl shadow-2xl overflow-hidden">

          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>

          {/* App icon + title row */}
          <div className="flex items-center gap-3 px-6 pt-4 pb-3">
            {/* FinBankLink icon — gradient circle */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md"
              style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
            >
              <span className="text-white text-xs font-black leading-none tracking-tight text-center">
                FBL
              </span>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                FinBankLink
              </p>
              <p className="text-[13px] font-bold text-gray-800 leading-tight">
                Notifikasi Verifikasi
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-6 border-t border-gray-100 mb-5" />

          {/* Main content */}
          <div className="px-6 pb-2">
            {/* WhatsApp icon */}
            <div className="flex justify-center mb-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)' }}
              >
                <MessageCircle className="text-white" size={30} fill="white" />
              </div>
            </div>

            <h2 className="text-center text-[18px] font-black text-gray-900 mb-2">
              Kirim Kode OTP
            </h2>
            <p className="text-center text-sm text-gray-500 leading-relaxed mb-4">
              FinBankLink akan mengirimkan kode OTP ke nomor WhatsApp yang terdaftar pada akun kamu untuk memverifikasi pengajuan ini.
            </p>

            {/* Error Message inside Modal */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-xs font-bold text-red-600 mb-0.5">⚠️ Gagal</p>
                <p className="text-[11px] text-red-500 leading-snug">
                  {error.message}
                </p>
              </div>
            )}

            {/* CTA – Send via WhatsApp */}
            <button
              id="btn-kirim-otp-wa"
              onClick={onConfirm}
              disabled={loading}
              className={`w-full py-3.5 rounded-2xl text-white text-[15px] font-bold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform duration-150
                ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              style={{ background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Mengirim...
                </>
              ) : (
                <>
                  <MessageCircle size={18} fill="white" />
                  {error ? 'Coba Lagi' : 'Kirim via WhatsApp'}
                </>
              )}
            </button>
          </div>

          {/* Secondary options */}
          <div className="px-6 pt-2 pb-2">
            <button
              id="btn-cara-lain-otp"
              onClick={onOtherWay}
              className="w-full py-3 rounded-2xl text-[14px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 flex items-center justify-center gap-1 transition-colors duration-150"
            >
              Cara Lain
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="px-6 pt-1 pb-6">
            <button
              id="btn-batal-otp"
              onClick={onCancel}
              className="w-full py-3 rounded-2xl text-[14px] font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors duration-150"
            >
              Batalkan
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

/* ─────────────────────────────────────────────
   Educational Disclaimer Bottom-Sheet Modal
   ───────────────────────────────────────────── */
const DisclaimerModal = ({ activeSubmissions, onConfirm, onCancel }) => {
  return (
    <>
      <style>{`
        @keyframes backdropFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes sheetSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        .animate-backdrop-fade-in {
          animation: backdropFadeIn 0.3s ease-out forwards;
        }
        .animate-sheet-slide-up {
          animation: sheetSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm animate-backdrop-fade-in"
        onClick={onCancel}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 animate-sheet-slide-up"
        style={{
          maxWidth: '640px',
          margin: '0 auto',
        }}
      >
        <div className="bg-white rounded-t-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">

          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-[16px] leading-tight">Edukasi Keuangan</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Penting Sebelum Mengajukan</p>
              </div>
            </div>
            <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4">
            
            <div className="bg-amber-50/70 border border-amber-100/60 rounded-2xl p-4 flex gap-3">
              <div className="text-amber-500 mt-0.5 flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-xs text-amber-900 font-semibold leading-relaxed">
                Kami mendeteksi Anda saat ini memiliki <strong className="font-black">{activeSubmissions.length} pengajuan aktif</strong> yang sedang diproses oleh bank lain.
              </p>
            </div>

            {/* List of active loans */}
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Pengajuan Aktif Anda Saat Ini</p>
              <div className="space-y-2">
                {activeSubmissions.map((sub, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                        🏛️
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{sub.nama_bank}</p>
                        <p className="text-[10px] text-gray-500 font-semibold">{sub.nama_produk}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Sedang Diproses
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Official Disclaimer with requested text */}
            <div className="bg-[#f0f6ff] border border-blue-100 rounded-2xl p-5 shadow-inner">
              <p className="text-[13px] text-blue-950 leading-relaxed font-black italic text-center">
                "Catatan: Pengajuan beberapa pinjaman sekaligus dapat memengaruhi penilaian skor kredit Anda oleh pihak bank."
              </p>
            </div>

            {/* Educational content for layman */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black text-gray-800">Mengapa Hal Ini Penting?</h4>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h5 className="text-[11px] font-bold text-gray-800 mb-1">📉 Skor Kredit Dapat Menurun</h5>
                  <p className="text-[11.5px] text-gray-600 leading-relaxed font-medium">
                    Setiap kali Anda mengajukan pinjaman baru, bank akan melakukan verifikasi data keuangan resmi Anda. Mengajukan ke banyak bank dalam waktu singkat dapat tercatat sebagai tindakan yang menurunkan skor reputasi kredit Anda di BI Checking / SLIK OJK.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h5 className="text-[11px] font-bold text-gray-800 mb-1">⚠️ Terlihat Lebih Berisiko bagi Bank</h5>
                  <p className="text-[11.5px] text-gray-600 leading-relaxed font-medium">
                    Bank dapat melihat transparansi riwayat pengajuan aktif Anda. Pengajuan yang terlalu banyak sekaligus dapat memberi kesan bahwa usaha Anda dalam kondisi keuangan darurat yang berisiko tinggi bagi bank untuk menyetujuinya.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Footer CTAs */}
          <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-2">
            <button
              onClick={onConfirm}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              Saya Mengerti, Lanjutkan Pengajuan
            </button>
            <button
              onClick={onCancel}
              className="w-full py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-extrabold text-sm rounded-2xl transition-all"
            >
              Batalkan Pengajuan
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

/* ─────────────────────────────────────────────
   Main Page
   ───────────────────────────────────────────── */
const AjukanPinjaman = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bank     = location.state?.bank ?? null;

  const [agreed1,    setAgreed1]    = useState(false);
  const [agreed2,    setAgreed2]    = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [showOtp,    setShowOtp]    = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [otpError,   setOtpError]   = useState(null); // { message, detail }

  const [activeSubmissions, setActiveSubmissions] = useState([]);
  const [checkingSubmissions, setCheckingSubmissions] = useState(true);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    getMySubmissions()
      .then((rows) => {
        const list = Array.isArray(rows) ? rows : [];
        const localSteps = JSON.parse(localStorage.getItem('local_submission_steps') || '{}');
        const active = list.filter(s => {
          const eff = (localSteps[s.id] || localSteps[s.submission_id] || s.status_raw || 'menunggu').toLowerCase();
          return ['menunggu', 'verifikasi', 'survei'].includes(eff) || s.bank_message?.includes('[STEP:');
        });
        setActiveSubmissions(active);
      })
      .catch(() => setActiveSubmissions([]))
      .finally(() => setCheckingSubmissions(false));
  }, []);

  const canSubmit = agreed1 && agreed2 && !loading && !submitted && !showOtp && !showDisclaimer;

  /* user clicks "Ajukan Sekarang" → tampilkan DisclaimerModal atau OTP modal */
  const handleSubmit = () => {
    if (!canSubmit) return;
    setOtpError(null);
    if (activeSubmissions.length > 0) {
      setShowDisclaimer(true);
    } else {
      setShowOtp(true);
    }
  };

  const handleDisclaimerConfirm = () => {
    setShowDisclaimer(false);
    setShowOtp(true);
  };

  const handleDisclaimerCancel = () => {
    setShowDisclaimer(false);
  };

  /* user confirms OTP sending */
  const handleOtpConfirm = async () => {
    setLoading(true);
    setOtpError(null);
    try {
      const res = await sendLoanOtp(bank.id);
      setShowOtp(false);
      navigate('/verifikasi-otp', {
        state: { bank, maskedPhone: res.phone ?? null },
      });
    } catch (err) {
      const data   = err?.response?.data ?? {};
      const msg    = data.message ?? 'Gagal mengirim OTP. Coba lagi.';
      const detail = data.detail  ?? null;
      setOtpError({ message: msg, detail });
    } finally {
      setLoading(false);
    }
  };

  /* user wants another OTP method — placeholder, bisa dikembangkan */
  const handleOtherWay = () => {
    setShowOtp(false);
    // TODO: navigasi ke halaman metode OTP alternatif
    alert('Fitur cara lain akan segera hadir.');
  };

  /* user cancels OTP */
  const handleOtpCancel = () => {
    setShowOtp(false);
    setOtpError(null);
  };

  // Kalau user langsung akses URL tanpa data bank → balik ke cari-modal
  if (!bank) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <p className="text-gray-500 mb-4">Data bank tidak ditemukan.</p>
        <button
          onClick={() => navigate('/cari-modal')}
          className="text-blue-600 font-bold underline"
        >
          Kembali ke Cari Modal
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex flex-col">

        {/* ── Header ── */}
        <div className="bg-[#3b82f6] flex items-center gap-4 px-5 py-4 sticky top-0 z-10 shadow-md">
          <button
            id="btn-back-ajukan"
            onClick={() => navigate(-1)}
            className="text-white hover:opacity-70 transition-opacity"
          >
            <ArrowLeft size={24} strokeWidth={2.5} />
          </button>
          <h1 className="text-white text-xl font-bold tracking-tight">Pengajuan</h1>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 flex items-start justify-center p-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-none w-full max-w-lg p-8">

            {/* Bank Identity */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-shrink-0 w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="#3b82f6" className="w-8 h-8">
                  <path d="M4 11h12.17l-5.58-5.59L12 4l8 8-8 8-1.41-1.41L16.17 13H4v-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                  {bank.nama_bank.replace('Bank ', 'BANK\n')}
                </h2>
              </div>
            </div>

            {/* Divider */}
            <hr className="border-gray-200 mb-5" />

            {/* Info teks */}
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Kamu mengajukan sebagai pengguna dengan akun personal.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
              Kamu mengajukan bank tersebut untuk meminjam. Jika kamu sudah pernah mengajukan sebelumnya, maka:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1.5 mb-4 leading-relaxed">
              <li>datamu akan digunakan untuk memverifikasi identitasmu dan dibagikan dengan sistem untuk pendaftaran pengajuan peminjaman;</li>
              <li>datamu akan terisi secara otomatis;</li>
              <li>tidak perlu mengupload selfie dengan KTP; dan</li>
              <li>proses registrasi menjadi lebih cepat.</li>
            </ul>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Klik "Ajukan Sekarang" apabila kamu setuju untuk membagikan datamu (termasuk data pribadi) ke layanan bank.
            </p>

            {/* Checkboxes */}
            <div className="space-y-3 mb-7">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  id="checkbox-setuju"
                  type="checkbox"
                  checked={agreed1}
                  onChange={(e) => setAgreed1(e.target.checked)}
                  disabled={submitted}
                  className="mt-0.5 w-4 h-4 accent-blue-500 cursor-pointer flex-shrink-0"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  Saya setuju untuk melakukan pengajuan kepada bank tersebut
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  id="checkbox-privasi"
                  type="checkbox"
                  checked={agreed2}
                  onChange={(e) => setAgreed2(e.target.checked)}
                  disabled={submitted}
                  className="mt-0.5 w-4 h-4 accent-blue-500 cursor-pointer flex-shrink-0"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  Saya telah membaca dan menyetujui{' '}
                  <a href="#" className="text-blue-500 dark:text-blue-400 hover:underline font-medium">
                    Kebijakan Privasi FinBankLink
                  </a>
                </span>
              </label>
            </div>

            {/* Submit button / success state */}
            {submitted ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="#22c55e" className="w-8 h-8">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </div>
                <p className="text-green-700 font-bold text-center">Pengajuan berhasil dikirim!</p>
                <p className="text-sm text-gray-500 text-center">
                  Tim {bank.nama_bank} akan menghubungi kamu segera.
                </p>
                <button
                  onClick={() => navigate('/cari-modal')}
                  className="mt-2 text-blue-600 font-bold text-sm hover:underline"
                >
                  Kembali ke Cari Modal
                </button>
              </div>
            ) : (
              <button
                id="btn-ajukan-sekarang"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`w-full py-4 rounded-full text-[15px] font-bold tracking-wide transition-all duration-200 shadow-md
                  ${canSubmit
                    ? 'bg-[#3b82f6] text-white hover:bg-[#2563eb] active:scale-95 shadow-blue-200 dark:shadow-none'
                    : 'bg-gray-300 dark:bg-slate-700 text-gray-500 cursor-not-allowed shadow-none'
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Mengirim OTP...
                  </span>
                ) : 'Ajukan Sekarang'}
              </button>
            )}

            {/* ── Error banner dari Fonnte / backend ── */}
            {otpError && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-red-700 mb-1">
                  ⚠️ {otpError.message}
                </p>
                {otpError.detail && (
                  <p className="text-xs text-red-500 font-mono leading-relaxed break-words">
                    Detail: {otpError.detail}
                  </p>
                )}
                <p className="text-xs text-red-400 mt-2">
                  Cek: nomor HP di profil, jalankan <code className="bg-red-100 px-1 rounded">php artisan migrate</code>, dan pastikan device Fonnte aktif.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── OTP Modal ── */}
      {showOtp && (
        <OtpModal
          onConfirm={handleOtpConfirm}
          onOtherWay={handleOtherWay}
          onCancel={handleOtpCancel}
          loading={loading}
          error={otpError}
        />
      )}

      {/* ── Disclaimer Modal ── */}
      {showDisclaimer && (
        <DisclaimerModal
          activeSubmissions={activeSubmissions}
          onConfirm={handleDisclaimerConfirm}
          onCancel={handleDisclaimerCancel}
        />
      )}
    </>
  );
};

export default AjukanPinjaman;
