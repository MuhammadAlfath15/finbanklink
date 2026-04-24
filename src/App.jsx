import React, { useState } from 'react';
import axios from 'axios';
import './index.css';
import { useNavigate } from 'react-router-dom';

function App() {
  const [namaBisnis, setNamaBisnis] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const handleLogin = async (e) => {
  e.preventDefault();
  setErrorMessage(''); // Reset pesan error setiap kali tombol diklik

  const formData = new FormData();
  formData.append('nama_bisnis', namaBisnis);
  formData.append('password', password);

  try {
    const response = await axios.post('http://localhost/finbanklink/login_proses.php', formData);
    
    if (response.data.includes("Berhasil")) {
      alert("Selamat Datang!");
    } else {
      // Jika salah, pesan dari PHP dimasukkan ke state error
      setErrorMessage("Nama Bisnis atau Password salah!");
    }
  } catch (error) {
    setErrorMessage("Gagal terhubung ke server!");
  }
};

  return (
    <div className="flex min-h-screen bg-white font-sans">
      
      {/* BAGIAN KIRI -- BACKGROUND BIRU */}
      <div className="hidden lg:flex w-1/2 bg-blue-500 items-center justify-center p-12 rounded-r-[80px]">
        <div className="text-white text-center max-w-md">
          <h1 className="text-6xl font-bold mb-4">Hello, Welcome</h1>
          <p className="text-lg opacity-90 mb-8">
            Belum punya akun? <span className="font-bold border-b border-white cursor-pointer" onClick={() => navigate('/daftar')}>Daftar</span> di sini
          </p>
          <button 
            onClick={() => navigate('/daftar')} 
            className="px-12 py-3 border-2 border-white rounded-full font-bold text-xl hover:bg-white hover:text-blue-500 transition-all"
          >
            Daftar
          </button>
        </div>
      </div>

      {/* BAGIAN KANAN - FORM LOGIN */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-5xl font-bold text-center mb-12 text-gray-800">Login</h2>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="text" 
              placeholder="Nama/Nama Bisnis"
              className="w-full px-6 py-4 bg-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
              onChange={(e) => setNamaBisnis(e.target.value)}
            />
            <div className="relative w-full">
  <input 
    type={showPassword ? "text" : "password"} 
    placeholder="Password"
    className="w-full px-6 py-4 bg-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
    onChange={(e) => setPassword(e.target.value)}
  />
  {/* Tombol Ikon Mata */}
  <button 
    type="button"
    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    )}
  </button>
</div>

            <div className="flex justify-between items-center text-sm font-semibold">
              <label className="flex items-center text-gray-700 cursor-pointer">
                <input type="checkbox" className="mr-2 w-4 h-4" /> Remember me
              </label>
              <span 
  className="text-blue-500 cursor-pointer text-sm font-bold" 
  onClick={() => navigate('/lupa-password')}
>
  Lupa Password?
</span>
            </div>

            {errorMessage && (
  <p className="text-red-500 text-sm font-semibold w-full text-center">
    {errorMessage}
  </p>
)}

            <button 
              type="submit" 
              className="w-full bg-blue-500 text-white py-4 rounded-full font-bold text-xl shadow-lg hover:bg-blue-600 transition-all"
            >
              Login
            </button>
          </form>

          <div className="flex items-center my-8">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 font-medium">Atau masuk dengan</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Ikon Social Login */}
          <div className="flex justify-center gap-8">
            {/* Ikon Google */}
            <button className="p-3 bg-white border border-gray-100 shadow-sm rounded-full hover:scale-110 transition-transform">
              <img src="https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" alt="Google" className="w-8 h-8" />
            </button>
            {/* Ikon Apple */}
            <button className="p-3 bg-white border border-gray-100 shadow-sm rounded-full hover:scale-110 transition-transform">
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" className="w-8 h-8" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;