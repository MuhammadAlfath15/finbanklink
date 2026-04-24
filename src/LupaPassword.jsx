import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LupaPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  // TAHAP 1: Kirim OTP
  const handleSendOTP = async () => {
    if (!email) return alert("Silakan masukkan email!");
    const data = new FormData();
    data.append('step', '1');
    data.append('email', email);

    try {
      const response = await axios.post('http://localhost/finbanklink/lupa_password_proses.php', data);
      if (response.data.includes("OTP_TERKIRIM")) {
        alert("Kode OTP telah dikirim!");
        setStep(2);
      } else {
        alert("Email tidak terdaftar!");
      }
    } catch (error) {
      alert("Gagal terhubung ke server!");
    }
  };

  // TAHAP 2: Verifikasi OTP
  const handleVerifyOTP = async () => {
    const data = new FormData();
    data.append('step', '2');
    data.append('email', email);
    data.append('otp', otpInput);

    try {
      const response = await axios.post('http://localhost/finbanklink/lupa_password_proses.php', data);
      if (response.data.includes("OTP_COCOK")) {
        alert("OTP Benar! Silakan buat password baru.");
        setStep(3);
      } else {
        alert("Kode OTP salah atau kedaluwarsa!");
      }
    } catch (error) {
      alert("Gagal verifikasi OTP!");
    }
  };

  // TAHAP 3: Update Password
  const handleUpdatePassword = async () => {
    if (!newPassword) return alert("Password baru tidak boleh kosong!");
    const data = new FormData();
    data.append('step', '3');
    data.append('email', email);
    data.append('password', newPassword);

    try {
      const response = await axios.post('http://localhost/finbanklink/lupa_password_proses.php', data);
      if (response.data.includes("BERHASIL_UPDATE")) {
        alert("Password Berhasil Diubah!");
        navigate('/'); // Asumsi '/' adalah halaman login kamu
      } else {
        alert("Gagal mengubah password.");
      }
    } catch (error) {
      alert("Terjadi kesalahan server!");
    }
  };

  return (
    <div className="flex min-h-screen font-sans">
      {/* SISI KIRI - WELCOME SECTION */}
      <div className="hidden lg:flex w-1/2 bg-blue-700 text-white flex-col items-center justify-center p-12 rounded-r-[60px]">
        <h1 className="text-6xl font-bold mb-4 italic">Hello, Welcome</h1>
        <p className="text-xl mb-12">Sudah punya akun? <span className="font-bold cursor-pointer underline" onClick={() => navigate('/')}>Login</span> di sini</p>
        <button onClick={() => navigate('/')} className="border-2 border-white px-12 py-3 rounded-full text-xl font-bold hover:bg-white hover:text-blue-700 transition-all">Login</button>
      </div>

      {/* SISI KANAN - FORM SECTION */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          
          {step === 1 && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-5xl font-bold text-center mb-12">Lupa password?</h2>
              <input 
                type="email" placeholder="Email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-gray-100 rounded-2xl mb-8 outline-none border-2 border-transparent focus:border-blue-500 transition-all" 
              />
              <button onClick={handleSendOTP} className="w-full bg-blue-700 hover:bg-blue-800 active:scale-95 text-white py-4 rounded-full font-bold text-xl shadow-lg transition-all">Kirim kode OTP</button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in duration-500 text-center">
              <h2 className="text-5xl font-bold mb-4">Verifikasi OTP</h2>
              <p className="text-gray-500 mb-10">Masukkan 6 digit kode dari email Anda</p>
              <div className="flex justify-center gap-2 mb-10">
                {[...Array(6)].map((_, index) => (
                  <input
                    key={index} type="text" maxLength="1"
                    className="w-12 h-14 text-center text-2xl font-bold bg-gray-100 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none transition-all"
                    onChange={(e) => {
                      const val = e.target.value;
                      let currentOtp = otpInput.split('');
                      currentOtp[index] = val;
                      setOtpInput(currentOtp.join(''));
                      if (val && e.target.nextSibling) e.target.nextSibling.focus();
                    }}
                  />
                ))}
              </div>
              <button onClick={handleVerifyOTP} className="w-full bg-blue-700 hover:bg-blue-800 active:scale-95 text-white py-4 rounded-full font-bold text-xl shadow-lg transition-all">Verifikasi</button>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in duration-500 text-center">
              <h2 className="text-5xl font-bold mb-8">Buat ulang password</h2>
              <input 
                type="password" placeholder="Password Baru" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-6 py-4 bg-gray-100 rounded-2xl mb-6 outline-none border-2 border-transparent focus:border-blue-500 transition-all" 
              />
              <button onClick={handleUpdatePassword} className="w-full bg-blue-700 hover:bg-blue-800 active:scale-95 text-white py-4 rounded-full font-bold text-xl shadow-lg transition-all">Simpan password</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LupaPassword;