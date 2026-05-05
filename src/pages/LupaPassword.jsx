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
  try {
    const response = await axios.post('http://localhost:8000/api/forgot-password', {
      step: 1,
      email: email 
    });
    if (response.data.status === "success") {
      alert("OTP Terkirim ke Email!");
      setStep(2);
    }
  } catch (error) {
    alert(error.response?.data?.message || "Gagal kirim OTP");
  }
};

const handleVerifyOTP = async () => {
  try {
    const response = await axios.post('http://localhost:8000/api/forgot-password', {
      step: 2,
      email: email,
      otp: otpInput
    });
    if (response.data.status === "success") {
      setStep(3);
    }
  } catch (error) {
    alert("OTP Salah!");
  }
};

// TAHAP 3: Update Password
const handleUpdatePassword = async () => {
  try {
    const response = await axios.post('http://localhost:8000/api/forgot-password', {
      step: 3,
      email: email,
      password: newPassword
    });
    if (response.data.status === "success") {
      alert("Password Berhasil Diganti!");
      navigate('/');
    }
  } catch (error) {
    alert("Gagal ganti password");
  }
};

  return (
    <div className="flex min-h-screen bg-white font-sans text-gray-800">
      {/* SISI KIRI */}
      <div className="hidden lg:flex w-1/2 bg-blue-500 items-center justify-center p-12 rounded-r-[80px]">
        <div className="text-white text-center max-w-md">
          <h1 className="text-6xl font-bold mb-4">Hello, Welcome</h1>
          <p className="text-lg opacity-90 mb-8">Sudah punya akun? <span className="font-bold border-b border-white cursor-pointer" onClick={() => navigate('/')}>Login</span> di sini</p>
          <button onClick={() => navigate('/')} className="px-12 py-3 border-2 border-white rounded-full font-bold text-xl hover:bg-white hover:text-blue-500 transition-all">Login</button>
        </div>
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
                className="w-full px-6 py-4 bg-gray-200 rounded-xl mb-8 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg" 
              />
              <button onClick={handleSendOTP} className="w-full bg-blue-500 text-white py-4 rounded-full font-bold text-xl shadow-lg hover:bg-blue-600 transition-all">Kirim kode OTP</button>
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
              <button onClick={handleVerifyOTP} className="w-full bg-blue-500 text-white py-4 rounded-full font-bold text-xl shadow-lg hover:bg-blue-600 transition-all">Verifikasi</button>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in duration-500 text-center">
              <h2 className="text-5xl font-bold mb-8">Password Baru</h2>
              <input 
                type="password" placeholder="Password Baru" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-6 py-4 bg-gray-200 rounded-xl mb-8 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg" 
              />
              <button onClick={handleUpdatePassword} className="w-full bg-blue-500 text-white py-4 rounded-full font-bold text-xl shadow-lg hover:bg-blue-600 transition-all">Simpan password</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LupaPassword;