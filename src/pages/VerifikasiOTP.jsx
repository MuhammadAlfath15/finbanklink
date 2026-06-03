import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MessageCircle, RefreshCw, CheckCircle2, AlertCircle, ShieldCheck, Mail } from 'lucide-react';
import { sendLoanOtp, sendLoanOtpEmail, verifyLoanOtp } from '../services/api';

const RESEND_COOLDOWN = 60; // detik — sesuai screenshot

/* ─── Satu kotak digit OTP ─────────────────────────────────────── */
const OtpBox = ({ value, inputRef, onChange, onKeyDown, onPaste, shake, disabled }) => (
  <input
    ref={inputRef}
    type="text"
    inputMode="numeric"
    maxLength={1}
    value={value}
    onChange={onChange}
    onKeyDown={onKeyDown}
    onPaste={onPaste}
    disabled={disabled}
    autoComplete="one-time-code"
    className={[
      'w-12 h-14 text-center text-2xl font-black rounded-2xl border-2 outline-none',
      'transition-all duration-150 select-none',
      shake ? 'animate-shake border-red-400 bg-red-50 text-red-600' : '',
      value && !shake
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 shadow-md shadow-blue-100 dark:shadow-none'
        : !shake
        ? 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:border-blue-400 focus:shadow-md focus:shadow-blue-50 dark:focus:shadow-none'
        : '',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
    ].join(' ')}
  />
);

/* ─── Main Page ─────────────────────────────────────────────────── */
const VerifikasiOTP = () => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const bank        = location.state?.bank        ?? null;
  const maskedPhone = location.state?.maskedPhone ?? null;
  const maskedEmail = location.state?.maskedEmail ?? null;
  const method      = location.state?.method      ?? 'whatsapp';

  const [digits,    setDigits]    = useState(['', '', '', '', '', '']);
  const [status,    setStatus]    = useState('idle');   // idle | loading | success | error
  const [errMsg,    setErrMsg]    = useState('');
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [shake,     setShake]     = useState(false);

  const inputRefs = useRef([]);

  /* ── Auto-focus kotak pertama saat halaman mount ── */
  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 300);
  }, []);

  /* ── Countdown Timer ── */
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  /* ── Shake animation helper ── */
  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  /* ── OTP digit handlers ── */
  const handleChange = (idx, e) => {
    const val = e.target.value.replace(/\D/, '');
    if (!val) return;
    const next = [...digits];
    next[idx] = val.slice(-1);
    setDigits(next);
    setErrMsg('');
    if (idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace') {
      if (digits[idx]) {
        const next = [...digits];
        next[idx] = '';
        setDigits(next);
      } else if (idx > 0) {
        inputRefs.current[idx - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowRight' && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    } else if (e.key === 'Enter') {
      handleVerify();
    }
  };

  /* paste seluruh 6 digit sekaligus */
  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    const next = ['', '', '', '', '', ''];
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setDigits(next);
    inputRefs.current[Math.min(text.length, 5)]?.focus();
  };

  const otpValue  = digits.join('');
  const canVerify = otpValue.length === 6 && status !== 'loading' && status !== 'success';

  /* ── Verifikasi ── */
  const handleVerify = async () => {
    if (!canVerify) return;
    setStatus('loading');
    setErrMsg('');
    try {
      await verifyLoanOtp(otpValue);
      setStatus('success');
      // Auto-navigate to pengajuan flow after brief success flash
      setTimeout(() => {
        navigate('/pengajuan-flow', { state: { bank } });
      }, 1500);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Kode OTP salah atau sudah kadaluarsa.';
      setErrMsg(msg);
      setStatus('error');
      setDigits(['', '', '', '', '', '']);
      triggerShake();
      setTimeout(() => {
        setStatus('idle');
        inputRefs.current[0]?.focus();
      }, 600);
    }
  };

  /* ── Kirim ulang OTP ── */
  const handleResend = useCallback(async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setErrMsg('');
    try {
      if (method === 'email') {
        await sendLoanOtpEmail(bank.id);
      } else {
        await sendLoanOtp(bank.id);
      }
      setCountdown(RESEND_COOLDOWN);
      setDigits(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      setErrMsg('Gagal mengirim ulang OTP. Coba lagi.');
    } finally {
      setResending(false);
    }
  }, [countdown, resending, method, bank?.id]);

  /* ── Guard: jika tidak ada data bank ── */
  if (!bank) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <p className="text-gray-500 mb-4">Sesi tidak valid.</p>
        <button onClick={() => navigate('/cari-modal')} className="text-blue-600 font-bold underline">
          Kembali ke Cari Modal
        </button>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────── */
  return (
    <>
      {/* Shake keyframe */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%       { transform: translateX(-6px); }
          30%       { transform: translateX(6px); }
          45%       { transform: translateX(-5px); }
          60%       { transform: translateX(5px); }
          75%       { transform: translateX(-3px); }
          90%       { transform: translateX(3px); }
        }
        .animate-shake { animation: shake 0.55s ease-in-out; }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }

        @keyframes successPop {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .success-pop { animation: successPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>

      <div className="min-h-screen flex flex-col bg-[#f0f4ff] dark:bg-slate-900">

        {/* ── Header ── */}
        <div
          className="flex items-center gap-4 px-5 py-4 sticky top-0 z-10"
          style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', boxShadow: '0 2px 12px rgba(59,130,246,0.25)' }}
        >
          <button
            id="btn-back-verifikasi"
            onClick={() => navigate(-1)}
            className="text-white hover:opacity-70 transition-opacity"
            disabled={status === 'loading'}
          >
            <ArrowLeft size={24} strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-white opacity-90" />
            <h1 className="text-white text-xl font-bold tracking-tight">Verifikasi Kode</h1>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 flex items-start justify-center px-4 py-8">
          <div
            className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md fade-in-up p-8 shadow-[0_8px_40px_rgba(59,130,246,0.12)] dark:shadow-none"
          >

            {status === 'success' ? (
              /* ── SUCCESS STATE — brief flash before auto-navigate ── */
              <div className="flex flex-col items-center gap-5 py-10">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center success-pop"
                  style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', boxShadow: '0 8px 24px rgba(34,197,94,0.35)' }}
                >
                  <CheckCircle2 className="text-white" size={44} />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-black text-gray-900 mb-2">OTP Terverifikasi! ✅</h2>
                  <p className="text-sm text-gray-500">Melanjutkan ke proses pengajuan...</p>
                </div>
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>

            ) : (
              /* ── FORM STATE ── */
              <>
                {/* Icon + deskripsi */}
                <div className="flex flex-col items-center mb-8">
                  {method === 'email' ? (
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        boxShadow: '0 6px 20px rgba(59,130,246,0.35)',
                      }}
                    >
                      <Mail className="text-white" size={28} />
                    </div>
                  ) : (
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                      style={{
                        background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
                        boxShadow: '0 6px 20px rgba(37,211,102,0.35)',
                      }}
                    >
                      <MessageCircle className="text-white" size={28} fill="white" />
                    </div>
                  )}

                  <p className="text-sm text-gray-500 text-center leading-relaxed">
                    {method === 'email' ? (
                      <>
                        Cek Email kamu buat verifikasi
                        {maskedEmail && (
                          <> ke alamat email <span className="font-semibold text-gray-700">{maskedEmail}</span></>
                        )}
                      </>
                    ) : (
                      <>
                        Cek WhatsApp kamu buat verifikasi
                        {maskedPhone && (
                          <> ke nomor <span className="font-semibold text-gray-700">{maskedPhone}</span></>
                        )}
                      </>
                    )}
                  </p>
                </div>

                {/* ── 6 kotak OTP ── */}
                <div className={`flex justify-center gap-2 mb-6 ${shake ? 'animate-shake' : ''}`}>
                  {digits.map((d, i) => (
                    <OtpBox
                      key={i}
                      value={d}
                      inputRef={(el) => (inputRefs.current[i] = el)}
                      onChange={(e) => handleChange(i, e)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      onPaste={handlePaste}
                      shake={shake}
                      disabled={status === 'loading'}
                    />
                  ))}
                </div>

                {/* Kirim ulang */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <p className="text-sm text-gray-400">Belum menerima kode?</p>
                  {countdown > 0 ? (
                    <p className="text-sm text-gray-400">
                      Kirim ulang dalam{' '}
                      <span
                        className="font-bold"
                        style={{ color: countdown <= 10 ? '#ef4444' : '#4b5563' }}
                      >
                        {formatTime(countdown)}
                      </span>
                    </p>
                  ) : (
                    <button
                      id="btn-resend-otp"
                      onClick={handleResend}
                      disabled={resending}
                      className="flex items-center gap-1.5 text-sm font-bold transition-colors disabled:opacity-50"
                      style={{ color: '#2563eb' }}
                    >
                      <RefreshCw size={13} className={resending ? 'animate-spin' : ''} />
                      {resending ? 'Mengirim...' : 'Kirim ulang'}
                    </button>
                  )}
                </div>

                {/* Error message */}
                {errMsg && (
                  <div
                    className="flex items-center gap-2 rounded-2xl px-4 py-3 mb-4"
                    style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
                  >
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600 font-medium">{errMsg}</p>
                  </div>
                )}

                {/* Tombol verifikasi */}
                <button
                  id="btn-verifikasi-otp"
                  onClick={handleVerify}
                  disabled={!canVerify}
                  className={`w-full py-4 rounded-2xl text-[15px] font-bold tracking-wide transition-all duration-200 ${
                    canVerify
                      ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-[0_4px_16px_rgba(59,130,246,0.35)]'
                      : 'bg-gray-300 dark:bg-slate-700 text-gray-500 cursor-not-allowed'
                  }`}
                  onMouseEnter={(e) => { if (canVerify) e.currentTarget.style.transform = 'scale(1.01)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {status === 'loading' ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                        <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Memverifikasi...
                    </span>
                  ) : (
                    'Verifikasi'
                  )}
                </button>

                {/* Info ekspirasi */}
                <p className="text-center text-xs text-gray-400 mt-4">
                  🔒 Kode OTP berlaku selama 5 menit dan hanya untuk satu kali penggunaan
                </p>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default VerifikasiOTP;
