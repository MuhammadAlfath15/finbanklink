import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Untuk pindah halaman

function Daftar() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // State Data Form
  const [formData, setFormData] = useState({
    nama_asli: '', email: '', password: '', confirm_password: '',
    nama_usaha: '', kategori_usaha: '', lama_usaha: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDaftar = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      alert("Password tidak cocok!");
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));

    try {
      // Ganti URL ini dengan file PHP pendaftaran kamu nanti
      const response = await axios.post('http://localhost/finbanklink/daftar_proses.php', data);
      alert("Pendaftaran Berhasil! Silakan Login.");
      navigate('/'); // Arahkan kembali ke Login Page
    } catch (error) {
      alert("Gagal terhubung ke server!");
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      {/* SISI KIRI - Biru (Tetap Konsisten) */}
      <div className="hidden lg:flex w-1/2 bg-blue-500 items-center justify-center p-12 rounded-r-[80px]">
        <div className="text-white text-center max-w-md">
          <h1 className="text-6xl font-bold mb-4">Hello, Welcome</h1>
          <p className="mb-8">Sudah punya akun? <span className="font-bold border-b border-white cursor-pointer" onClick={() => navigate('/')}>Login</span> di sini</p>
          <button onClick={() => navigate('/')} className="px-12 py-3 border-2 border-white rounded-full font-bold text-xl hover:bg-white hover:text-blue-500 transition-all">
            Login
          </button>
        </div>
      </div>

      {/* SISI KANAN - Form Multi-step */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center py-16 px-8">
        <div className="w-full max-w-md">
          <h2 className="text-5xl font-bold text-center mb-12 text-gray-800">Daftar</h2>
          
          <form
          autoComplete="off"
          onSubmit={step === 2 ? handleDaftar : (e) => e.preventDefault()} className="space-y-10">
            {step === 1 ? (
              /* HALAMAN 1: DATA PRIBADI */
              <div className="space-y-4 animate-in fade-in duration-500">
                <input name="nama_asli" type="text" placeholder="Nama asli sesuai KTP" className="w-full px-6 py-4 bg-gray-200 rounded-xl focus:outline-none" onChange={handleChange} />
                <input name="email" type="email" placeholder="Email" className="w-full px-6 py-4 bg-gray-200 rounded-xl focus:outline-none" onChange={handleChange} />
                <input name="password" type="password" placeholder="Password" className="w-full px-6 py-4 bg-gray-200 rounded-xl focus:outline-none" onChange={handleChange} />
                <input name="confirm_password" type="password" placeholder="Confirm Password" className="w-full px-6 py-4 bg-gray-200 rounded-xl focus:outline-none" onChange={handleChange} />
                <button type="button" onClick={() => setStep(2)} className="w-full bg-blue-500 text-white py-4 rounded-full font-bold text-xl shadow-lg">Lanjut</button>
              </div>
            ) : (
              /* HALAMAN 2: DATA USAHA */
              <div className="space-y-4 animate-in fade-in duration-500">
                <input 
    name="nama_usaha" // Pastikan name-nya unik!
    type="text" 
    placeholder="Nama usaha" 
    value={formData.nama_usaha} // Tambahkan value agar tersinkron dengan state
    className="w-full px-6 py-4 bg-gray-200 rounded-xl focus:outline-none" 
    onChange={handleChange} 
  />
                <input 
    name="kategori_usaha" 
    type="text" 
    placeholder="Kategori Usaha" 
    value={formData.kategori_usaha}
    className="w-full px-6 py-4 bg-gray-200 rounded-xl focus:outline-none" 
    onChange={handleChange} 
  />
                <input 
    name="lama_usaha" 
    type="text" 
    placeholder="Lama usaha" 
    value={formData.lama_usaha}
    className="w-full px-6 py-4 bg-gray-200 rounded-xl focus:outline-none" 
    onChange={handleChange} 
  />
                <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(1)} className="w-1/3 bg-gray-300 text-gray-700 py-4 rounded-full font-bold">Kembali</button>
                  <button type="submit" className="w-2/3 bg-blue-500 text-white py-4 rounded-full font-bold text-xl shadow-lg">Daftar</button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Daftar;