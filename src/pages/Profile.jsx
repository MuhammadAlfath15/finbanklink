import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { User, FileText, Settings, CreditCard, Info, QrCode, ShieldCheck } from 'lucide-react';

const Profile = () => {
  // Ambil data user buat nampilin nama di card kiri
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Yurii Kharlistov' };

  return (
    <div className="flex gap-8 font-sans">
      {/* --- SISI KIRI (Sidebar & User Card) --- */}
      <div className="w-1/3 space-y-6">
        {/* Card Identitas Biru */}
        <div className="bg-[#4D94FF] rounded-[32px] p-6 text-white relative overflow-hidden shadow-md">
          <div className="flex justify-center mb-2">
            <div className="bg-[#60A5FA] px-4 py-1 rounded-full text-[10px] flex gap-2">
              <span className="bg-white text-[#4D94FF] px-2 py-0.5 rounded-full font-bold">Personal</span>
              <span className="opacity-80">Bisnis</span>
            </div>
          </div>

          <div className="flex flex-col items-center mt-4">
            <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden mb-4">
              <img
                src="https://via.placeholder.com/150"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-medium tracking-wide">{user.name}</h2>
            <p className="text-sm font-light opacity-90">08123456789</p>
          </div>

          <div className="flex gap-2 mt-8">
            <button className="flex-1 bg-white/20 hover:bg-white/30 transition-colors py-2 rounded-xl text-[10px] flex items-center justify-center gap-2 border border-white/10">
              <QrCode size={14} /> QR SAYA
            </button>
            <button className="flex-1 bg-white/20 hover:bg-white/30 transition-colors py-2 rounded-xl text-[10px] flex items-center justify-center gap-2 border border-white/10">
              <ShieldCheck size={14} className="text-orange-400" /> Proteksi Akun
            </button>
          </div>
        </div>

        {/* Menu List */}
        <div className="bg-white rounded-[32px] border border-gray-100 p-4 space-y-1">
          <button className="w-full flex items-center gap-4 p-3 bg-blue-50/50 text-blue-600 rounded-2xl">
            <div className="p-2 bg-blue-500 rounded-full text-white"><User size={16} /></div>
            <span className="text-sm font-medium">Personal Info</span>
          </button>
          {[
            { icon: <FileText size={18} />, label: 'Dokumen Legalitas' },
            { icon: <Settings size={18} />, label: 'Pengaturan' },
            { icon: <CreditCard size={18} />, label: 'Data Keuangan' },
            { icon: <Info size={18} />, label: 'Info Umum' },
          ].map((item, index) => (
            <button key={index} className="w-full flex items-center gap-4 p-3 text-gray-500 hover:bg-gray-50 transition-colors rounded-2xl group">
              <div className="p-2 bg-gray-100 group-hover:bg-gray-200 rounded-full transition-colors"><span className="text-gray-500">{item.icon}</span></div>
              <span className="text-sm font-normal">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* --- SISI KANAN (Account Settings Form) --- */}
      <div className="w-2/3 space-y-6">
        <div className="bg-white rounded-[32px] border border-gray-100 p-10 shadow-sm min-h-[500px]">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Account Settings</h1>
          <p className="text-gray-400 font-normal mb-10">Manage your personal information and preferences</p>

          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 ml-2">Nama Depan</label>
                <input type="text" placeholder="Yurii" className="w-full px-6 py-3 bg-[#F8FAFC] border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-normal text-gray-700" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 ml-2">Nama Belakang</label>
                <input type="text" placeholder="Kharlistov" className="w-full px-6 py-3 bg-[#F8FAFC] border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-normal text-gray-700" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 ml-2">Nomor Telp</label>
              <input type="text" placeholder="08123456789" className="w-full px-6 py-3 bg-[#F8FAFC] border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-normal text-gray-700" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 ml-2">Profesional Bio</label>
              <textarea rows="4" placeholder="...." className="w-full px-6 py-3 bg-[#F8FAFC] border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-normal text-gray-700 resize-none"></textarea>
            </div>

            <div className="pt-4">
              <button className="w-full py-4 bg-[#60A5FA] text-white rounded-2xl font-bold text-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-100 uppercase tracking-widest">
                SIMPAN
              </button>
            </div>
          </form>
        </div>

        {/* Info Grid (Bottom) */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'Nama Toko', val: 'Toko Gelap', icon: '🏪', color: 'text-blue-600' },
            { label: 'Bidang Usaha', val: 'Narkoboy', icon: '🎯', color: 'text-orange-500' },
            { label: 'Lama Usaha', val: '8 Bulan', icon: '🕒', color: 'text-gray-600' },
            { label: 'Akun Terproteksi', val: 'Aktif', icon: '✅', color: 'text-green-500' },
            { label: 'Lokasi', val: 'Penjaruy', icon: '📍', color: 'text-green-500' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-[24px] border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm">
              <span className="text-2xl mb-2">{item.icon}</span>
              <p className="text-[10px] font-bold text-gray-800 leading-tight mb-1">{item.label}</p>
              <p className={`text-[9px] font-medium ${item.color}`}>{item.val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;