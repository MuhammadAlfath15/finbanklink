import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

function Daftar() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirm_password: '',
    nama_usaha: '',
    kategori_usaha: '',
    lama_usaha: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Hapus pesan merah secara real-time saat user mulai mengetik di kolom tersebut
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleNextStep = () => {
    let newErrors = {};
    let valid = true;

    // OTORITAS VALIDASI PAGE 1
    if (!formData.name.trim()) {
      newErrors.name = "Nama wajib diisi!";
      valid = false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email wajib diisi!";
      valid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Format email salah!";
      valid = false;
    }

    if (formData.password.length < 8) {
      newErrors.password = "Password minimal harus 8 karakter!";
      valid = false;
    }

    if (formData.confirm_password !== formData.password) {
      newErrors.confirm_password = "Konfirmasi password tidak cocok!";
      valid = false;
    }

    if (!valid) {
      setErrors(newErrors);
      return; // STOP! User dilarang ke Page 2
    }

    setErrors({});
    setStep(2);
  };

  const handleDaftar = async (e) => {
    if (e) e.preventDefault();

    // Validasi Page 2 sebelum kirim
    if (!formData.nama_usaha || !formData.kategori_usaha || !formData.lama_usaha) {
      toast.error("Mohon lengkapi semua data usaha!");
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/register', formData);

      console.log("Respon Berhasil:", response.data);

      // Laravel mengembalikan 201 untuk 'Created' atau 200 untuk 'OK'
      if (response.status === 201 || response.status === 200) {
        toast.success("Pendaftaran Berhasil!");
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (error) {
      console.error("Error Lengkap:", error);
      const pesanError = error.response?.data?.message || "Terjadi kesalahan pada server";
      toast.error(pesanError);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-gray-800">
      {/* SISI KIRI */}
      <div className="hidden lg:flex w-1/2 bg-blue-500 items-center justify-center p-12 rounded-r-[80px]">
        <div className="text-white text-center max-w-md">
          <h1 className="text-6xl font-bold mb-4">Hello, Welcome</h1>
          <p className="text-lg opacity-90 mb-8">
            Sudah punya akun? <span className="font-bold border-b border-white cursor-pointer" onClick={() => navigate('/')}>Login</span> di sini
          </p>
          <button onClick={() => navigate('/')} className="px-12 py-3 border-2 border-white rounded-full font-bold text-xl hover:bg-white hover:text-blue-500 transition-all">
            Login
          </button>
        </div>
      </div>

      {/* SISI KANAN */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-5xl font-bold text-center mb-12 text-gray-800">Daftar</h2>
          <form autoComplete="off" onSubmit={handleDaftar} className="space-y-6">
            {step === 1 ? (
              <div className="space-y-4">
                {/* NAMA */}
                <div>
                  <input name="name" type="text" placeholder="Nama asli sesuai KTP" className={`w-full px-6 py-4 bg-gray-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.name ? 'border-2 border-red-500' : ''}`} onChange={handleChange} value={formData.name} />
                  {errors.name && <p className="text-red-500 text-xs -mt-2 ml-2">{errors.name}</p>}
                </div>

                {/* EMAIL */}
                <div>
                  <input name="email" type="email" placeholder="Email" className={`w-full px-6 py-4 bg-gray-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.email ? 'border-2 border-red-500' : ''}`} onChange={handleChange} value={formData.email} />
                  {errors.email && <p className="text-red-500 text-xs -mt-2 ml-2">{errors.email}</p>}
                </div>

                {/* PASSWORD */}
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className={`w-full px-6 py-4 bg-gray-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.password ? 'border-2 border-red-500' : ''}`}
                    onChange={handleChange}
                    value={formData.password}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-gray-500 hover:text-blue-600">
                    {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                  </button>
                  {errors.password && <p className="text-red-500 text-xs -mt-2 ml-2">{errors.password}</p>}
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <input name="confirm_password" type="password" placeholder="Confirm Password" className={`w-full px-6 py-4 bg-gray-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.confirm_password ? 'border-2 border-red-500' : ''}`} onChange={handleChange} value={formData.confirm_password} />
                  {errors.confirm_password && <p className="text-red-500 text-xs -mt-2 ml-2">{errors.confirm_password}</p>}
                </div>

                <button type="button" onClick={handleNextStep} className="w-full bg-blue-500 text-white py-4 rounded-full font-bold text-xl shadow-lg hover:bg-blue-600 transition-all">
                  Lanjut
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* NAMA USAHA */}
                <div>
                  <input name="nama_usaha" type="text" placeholder="Nama usaha" className="w-full px-6 py-4 bg-gray-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400" onChange={handleChange} value={formData.nama_usaha} required />
                </div>
                {/* KATEGORI */}
                <div>
                  <input name="kategori_usaha" type="text" placeholder="Kategori Usaha" className="w-full px-6 py-4 bg-gray-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400" onChange={handleChange} value={formData.kategori_usaha} required />
                </div>
                {/* LAMA USAHA */}
                <div>
                  <input name="lama_usaha" type="text" placeholder="Lama usaha" className="w-full px-6 py-4 bg-gray-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400" onChange={handleChange} value={formData.lama_usaha} required />
                </div>

                <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(1)} className="w-1/3 bg-gray-300 text-gray-700 py-4 rounded-full font-bold">
                    Kembali
                  </button>
                  <button type="submit" className="w-full bg-blue-500 text-white py-4 rounded-full font-bold text-xl shadow-lg hover:bg-blue-600 transition-all">
                    Daftar
                  </button>
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