import React from 'react';
import { User, FileText, Settings, CreditCard, Info, QrCode, ShieldCheck, ChevronRight } from 'lucide-react';

const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Yurii Kharlistov' };
  const [firstName, ...rest] = user.name.split(' ');
  const lastName = rest.join(' ');

  return (
    <div className="flex gap-6 font-sans p-2">

      {/* === SISI KIRI === */}
      <div className="w-64 flex-shrink-0 space-y-4">

        {/* Card Biru */}
        <div className="bg-[#4A90D9] rounded-3xl p-5 text-white shadow-md">
          {/* Toggle Personal / Bisnis */}
          <div className="flex justify-center mb-5">
            <div className="bg-[#5A9FE8] rounded-full p-1 flex gap-1 text-xs">
              <span className="bg-white text-[#4A90D9] font-semibold px-4 py-1 rounded-full">
                Personal
              </span>
              <span className="px-4 py-1 opacity-80 cursor-pointer">Bisnis</span>
            </div>
          </div>

          {/* Foto Profil */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full border-4 border-white/40 overflow-hidden mb-3 shadow-lg">
              <img
                src="https://i.pravatar.cc/150?img=47"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-base font-semibold tracking-wide text-center">{user.name}</h2>
            <p className="text-xs opacity-80 mt-0.5">08123456789</p>
          </div>

          {/* Tombol QR & Proteksi */}
          <div className="flex gap-2 mt-5">
            <button className="flex-1 bg-white/20 hover:bg-white/30 transition py-2 rounded-xl text-[10px] flex items-center justify-center gap-1.5 border border-white/20">
              <QrCode size={12} />
              QR SAYA
              <ChevronRight size={10} />
            </button>
            <button className="flex-1 bg-white/20 hover:bg-white/30 transition py-2 rounded-xl text-[10px] flex items-center justify-center gap-1.5 border border-white/20">
              <ShieldCheck size={12} className="text-red-300" />
              Proteksi Akun
              <ChevronRight size={10} />
            </button>
          </div>
        </div>

        {/* Menu Navigasi */}
        <div className="bg-white rounded-3xl border border-gray-100 p-3 space-y-0.5 shadow-sm">
          {/* Item Aktif */}
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[#4A90D9]">
            <div className="w-8 h-8 bg-[#4A90D9] rounded-full flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-white" />
            </div>
            <span className="text-sm font-medium">Personal Info</span>
          </button>

          {[
            { icon: <FileText size={15} />, label: 'Dokumen Legalitas' },
            { icon: <Settings size={15} />, label: 'Pengaturan' },
            { icon: <CreditCard size={15} />, label: 'Data Keuangan' },
            { icon: <Info size={15} />, label: 'Info Umum' },
          ].map((item, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-gray-500 hover:bg-gray-50 transition group"
            >
              <div className="w-8 h-8 bg-gray-100 group-hover:bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 transition">
                {item.icon}
              </div>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* === SISI KANAN === */}
      <div className="flex-1 space-y-4">

        {/* Form Account Settings */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Account Settings</h1>
          <p className="text-sm text-gray-400 mb-7">Manage your personal information and preferences</p>

          <form className="space-y-5">
            {/* Nama Depan & Belakang */}
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-600 block">Nama Depan</label>
                <input
                  type="text"
                  defaultValue={firstName}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm text-gray-700"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-600 block">Nama Belakang</label>
                <input
                  type="text"
                  defaultValue={lastName}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm text-gray-700"
                />
              </div>
            </div>

            {/* Nomor Telp */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-600 block">Nomor Telp</label>
              <input
                type="text"
                defaultValue="08123456789"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm text-gray-700"
              />
            </div>

            {/* Profesional Bio */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-600 block">Profesional Bio</label>
              <textarea
                rows={3}
                placeholder="...."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm text-gray-700 resize-none"
              />
            </div>

            {/* Tombol Simpan */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                className="px-16 py-3 bg-[#4A90D9] text-white rounded-2xl font-bold text-sm hover:bg-blue-500 transition shadow-md shadow-blue-100 uppercase tracking-wider"
              >
                SIMPAN
              </button>
            </div>
          </form>
        </div>

        {/* Info Grid Bawah */}
        <div className="grid grid-cols-5 gap-3">

          {/* Nama Toko */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center text-center shadow-sm">
            <div className="w-12 h-12 flex items-center justify-center mb-2">
              <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
                <rect x="6" y="20" width="36" height="24" rx="3" fill="#3B82F6" />
                <path d="M4 22L24 6L44 22" fill="#2563EB" />
                <rect x="16" y="30" width="7" height="14" rx="1" fill="white" />
                <rect x="25" y="30" width="7" height="14" rx="1" fill="white" />
                <rect x="10" y="26" width="8" height="6" rx="1" fill="white" opacity="0.8" />
                <rect x="30" y="26" width="8" height="6" rx="1" fill="white" opacity="0.8" />
              </svg>
            </div>
            <p className="text-[11px] font-bold text-gray-800 leading-tight">Nama Toko</p>
            <p className="text-[10px] text-blue-500 mt-0.5">Toko Gelap</p>
          </div>

          {/* Bidang Usaha */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center text-center shadow-sm">
            <div className="w-12 h-12 flex items-center justify-center mb-2">
              <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
                <circle cx="24" cy="24" r="20" fill="#FB923C" />
                <circle cx="24" cy="24" r="14" fill="#EA580C" />
                <path d="M24 14 L26 20 L32 20 L27 24 L29 30 L24 26 L19 30 L21 24 L16 20 L22 20 Z" fill="white" />
                <path d="M38 10 C40 8 42 12 40 14 C38 12 36 10 38 10Z" fill="#FCD34D" />
                <path d="M36 8 C38 6 42 8 40 12" stroke="#FCD34D" strokeWidth="1.5" fill="none" />
              </svg>
            </div>
            <p className="text-[11px] font-bold text-gray-800 leading-tight">Bidang Usaha</p>
            <p className="text-[10px] text-orange-400 mt-0.5">Narkoboy</p>
          </div>

          {/* Lama Usaha */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center text-center shadow-sm">
            <div className="w-12 h-12 flex items-center justify-center mb-2">
              <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
                <circle cx="24" cy="24" r="20" fill="#6B7280" />
                <circle cx="24" cy="24" r="16" fill="#4B5563" />
                <circle cx="24" cy="24" r="2" fill="white" />
                <line x1="24" y1="24" x2="24" y2="12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="24" y1="24" x2="34" y2="27" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <circle cx="24" cy="10" r="1.5" fill="white" opacity="0.5" />
                <circle cx="24" cy="38" r="1.5" fill="white" opacity="0.5" />
                <circle cx="10" cy="24" r="1.5" fill="white" opacity="0.5" />
                <circle cx="38" cy="24" r="1.5" fill="white" opacity="0.5" />
              </svg>
            </div>
            <p className="text-[11px] font-bold text-gray-800 leading-tight">Lama Usaha</p>
            <p className="text-[10px] text-gray-400 mt-0.5">8 Bulan</p>
          </div>

          {/* Akun Terproteksi */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center text-center shadow-sm">
            <div className="w-12 h-12 flex items-center justify-center mb-2">
              <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
                <path d="M24 4L8 12V24C8 33.6 15.2 42.4 24 44C32.8 42.4 40 33.6 40 24V12L24 4Z" fill="#10B981" />
                <path d="M24 4L8 12V24C8 33.6 15.2 42.4 24 44" fill="#059669" />
                <path d="M16 24L21 29L32 18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-[11px] font-bold text-gray-800 leading-tight">Akun<br />Terproteksi</p>
            <p className="text-[10px] text-green-400 mt-0.5">Aktif</p>
          </div>

          {/* Lokasi */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center text-center shadow-sm">
            <div className="w-12 h-12 flex items-center justify-center mb-2">
              <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
                <path d="M24 4C17 4 12 10 12 17C12 26 24 44 24 44C24 44 36 26 36 17C36 10 31 4 24 4Z" fill="#22C55E" />
                <circle cx="24" cy="17" r="6" fill="white" />
                <circle cx="24" cy="17" r="3" fill="#22C55E" />
              </svg>
            </div>
            <p className="text-[11px] font-bold text-gray-800 leading-tight">Lokasi</p>
            <p className="text-[10px] text-green-400 mt-0.5">Penjaruy</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;