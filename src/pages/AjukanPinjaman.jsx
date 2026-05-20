import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MessageCircle, X, ChevronRight } from 'lucide-react';
import { sendLoanOtp } from '../services/api';

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

  const canSubmit = agreed1 && agreed2 && !loading && !submitted && !showOtp;

  /* user clicks "Ajukan Sekarang" → tampilkan OTP modal */
  const handleSubmit = () => {
    if (!canSubmit) return;
    setOtpError(null);
    setShowOtp(true);
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
    </>
  );
};

export default AjukanPinjaman;
