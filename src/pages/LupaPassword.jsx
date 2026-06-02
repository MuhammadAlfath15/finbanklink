import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPasswordStep1, forgotPasswordStep2, forgotPasswordStep3 } from '../services/api';

const LupaPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [expireTimer, setExpireTimer] = useState(300);
  const [resendTimer, setResendTimer] = useState(60);
  const navigate = useNavigate();

  useEffect(() => {
    let interval = null;
    if (step === 2) {
      interval = setInterval(() => {
        setExpireTimer((prev) => (prev > 0 ? prev - 1 : 0));
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step]);

  const clearMessages = () => { setErrorMsg(''); setSuccessMsg(''); };

  // TAHAP 1: Kirim OTP
  const handleSendOTP = async () => {
    if (!email) { setErrorMsg('Email tidak boleh kosong!'); return; }
    clearMessages();
    setLoading(true);
    try {
      const data = await forgotPasswordStep1(email);
      if (data.status === 'success') {
        setSuccessMsg('OTP berhasil dikirim! Cek email kamu.');
        setExpireTimer(300);
        setResendTimer(60);
        setTimeout(() => { clearMessages(); setStep(2); }, 1200);
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Gagal kirim OTP. Pastikan email terdaftar.');
    } finally {
      setLoading(false);
    }
  };

  // TAHAP 2: Verifikasi OTP
  const handleVerifyOTP = async () => {
    if (otpInput.length < 6) { setErrorMsg('Masukkan 6 digit kode OTP!'); return; }
    if (expireTimer === 0) { setErrorMsg('Kode OTP telah kadaluarsa. Silakan kirim ulang kode baru.'); return; }
    clearMessages();
    setLoading(true);
    try {
      const data = await forgotPasswordStep2(email, otpInput);
      if (data.status === 'success') {
        setStep(3);
      }
    } catch (error) {
      setErrorMsg('OTP salah atau sudah kadaluarsa. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // TAHAP 3: Ganti Password
  const handleUpdatePassword = async () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!newPassword) {
      setErrorMsg('Password wajib diisi!');
      return;
    } else if (!passwordRegex.test(newPassword)) {
      setErrorMsg('Password min. 8 karakter, wajib ada huruf besar, kecil, angka & simbol!');
      return;
    }
    clearMessages();
    setLoading(true);
    try {
      const data = await forgotPasswordStep3(email, newPassword);
      if (data.status === 'success') {
        setSuccessMsg('Password berhasil diganti!');
        setTimeout(() => navigate('/'), 1200);
      }
    } catch (error) {
      setErrorMsg('Gagal mengganti password. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Spinner SVG
  const Spinner = () => (
    <svg className="animate-spin h-5 w-5 mr-2 inline-block text-white" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );

  return (
    <div className="flex min-h-screen bg-white font-sans text-gray-800">

      {/* SISI KIRI */}
      <div className="hidden lg:flex w-1/2 bg-blue-500 items-center justify-center p-12 rounded-r-[80px]">
        <div className="text-white text-center max-w-md">
          <h1 className="text-6xl font-bold mb-4">Hello, Welcome</h1>
          <p className="text-lg opacity-90 mb-8">
            Sudah punya akun?{' '}
            <span className="font-bold border-b border-white cursor-pointer" onClick={() => navigate('/')}>Login</span> di sini
          </p>
          <button onClick={() => navigate('/')} className="px-12 py-3 border-2 border-white rounded-full font-bold text-xl hover:bg-white hover:text-blue-500 transition-all">
            Login
          </button>
        </div>
      </div>

      {/* SISI KANAN */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">

          {/* ── Feedback Messages ── */}
          {errorMsg && (
            <div className="mb-6 px-5 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold text-center">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 px-5 py-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm font-semibold text-center">
              {successMsg}
            </div>
          )}

          {/* ── Step 1: Input Email ── */}
          {step === 1 && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-5xl font-bold text-center mb-4">Lupa password?</h2>
              <p className="text-center text-gray-500 mb-10">Masukkan email yang terdaftar, kami akan kirim kode OTP.</p>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
                disabled={loading}
                className="w-full px-6 py-4 bg-gray-200 rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg disabled:opacity-60"
              />
              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full bg-blue-500 text-white py-4 rounded-full font-bold text-xl shadow-lg hover:bg-blue-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <><Spinner />Mengirim OTP...</> : 'Kirim kode OTP'}
              </button>
            </div>
          )}

          {/* ── Step 2: Verifikasi OTP ── */}
          {step === 2 && (
            <div className="animate-in fade-in duration-500 text-center">
              <h2 className="text-5xl font-bold mb-4">Verifikasi OTP</h2>
              <p className="text-gray-500 mb-2">Kode dikirim ke <span className="font-semibold text-gray-800">{email}</span></p>
              <p className="text-gray-400 text-sm mb-10">
                Masukkan 6 digit kode dari email kamu.
              </p>
              <div className="flex justify-center gap-2 mb-10">
                {[...Array(6)].map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    disabled={loading}
                    className="w-12 h-14 text-center text-2xl font-bold bg-gray-100 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition-all disabled:opacity-60"
                    onChange={(e) => {
                      clearMessages();
                      const val = e.target.value;
                      let arr = otpInput.split('');
                      arr[index] = val;
                      setOtpInput(arr.join(''));
                      if (val && e.target.nextSibling) e.target.nextSibling.focus();
                    }}
                  />
                ))}
              </div>
              <button
                onClick={handleVerifyOTP}
                disabled={loading}
                className="w-full bg-blue-500 text-white py-4 rounded-full font-bold text-xl shadow-lg hover:bg-blue-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <><Spinner />Memverifikasi...</> : 'Verifikasi'}
              </button>
              <button
                onClick={handleSendOTP}
                disabled={loading || resendTimer > 0}
                className="mt-4 text-sm text-blue-500 hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {resendTimer > 0 ? `Kirim ulang OTP dalam ${resendTimer}s` : 'Kirim ulang OTP'}
              </button>
            </div>
          )}

          {/* ── Step 3: Password Baru ── */}
          {step === 3 && (
            <div className="animate-in fade-in duration-500 text-center">
              <h2 className="text-5xl font-bold mb-4">Password Baru</h2>
              <p className="text-gray-500 mb-10">Password min. 8 karakter, wajib ada huruf besar, kecil, angka & simbol!</p>
              <input
                type="password"
                placeholder="Password Baru"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); clearMessages(); }}
                disabled={loading}
                className="w-full px-6 py-4 bg-gray-200 rounded-xl mb-8 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg disabled:opacity-60"
              />
              <button
                onClick={handleUpdatePassword}
                disabled={loading}
                className="w-full bg-blue-500 text-white py-4 rounded-full font-bold text-xl shadow-lg hover:bg-blue-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <><Spinner />Menyimpan...</> : 'Simpan password'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LupaPassword;