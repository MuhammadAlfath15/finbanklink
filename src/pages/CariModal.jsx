import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';

const CariModal = () => {
  const [banks, setBanks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Memanggil API Laravel lu
    axios.get('http://127.0.0.1:8000/api/banks')
      .then(response => {
        setBanks(response.data);
      })
      .catch(error => {
        console.error("Gagal mengambil data:", error);
      });
  }, []);

  return (
    <div className="space-y-6 p-4 bg-gray-50 min-h-screen">
      
     {/* --- KOTAK 1: SECTION HEADER --- */}
<div className="bg-gradient-to-b from-[#60a5fa] via-[#3b82f6] to-[#2563eb] rounded-[32px] p-6 md:p-8 pb-4 border-none relative overflow-hidden h-auto">
  
  {/* AKSEN KURVA/WAVE (Sesuai elemen melengkung di Figma lu) */}
  <div className="absolute bottom-0 left-0 w-full h-[60%] bg-[#1d4ed8]/20 rounded-[100%] scale-x-150 translate-y-1/2 z-0" />
  
  {/* ORNAMEN DEKORATIF DI SISI KANAN (Disesuaikan agar lebih halus) */}
  <div className="absolute top-0 right-0 w-[50%] h-full bg-white/10 skew-x-12 translate-x-20 z-0" />

  <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
    
    {/* --- SISI KIRI: PAPAN REKLAME (KUNCI TOTAL) --- */}
    <div className="col-span-12 lg:col-span-7 flex flex-col items-start">
      
      {/* BADGE "Yuk cari modal" - KUNCI POSITION */}
      <div className="relative z-30 ml-0 mb-[-12px]">
        <div className="absolute top-[4px] left-[4px] w-full h-full bg-black/20 rounded-lg" />
        <div className="relative bg-white border-2 border-[#003B95] px-6 py-2 rounded-lg">
          <p className="text-[12px] md:text-[14px] font-[1000] text-[#003B95] uppercase tracking-[0.2em] leading-none whitespace-nowrap">
            Yuk cari modal
          </p>
        </div>
      </div>

      {/* MAIN BALIHO BOX - KUNCI STYLE */}
      <div className="bg-[#DCEBFF] rounded-xl p-6 pt-10 pb-2 border-none relative overflow-hidden shadow-[10px_10px_0px_rgba(0,0,0,0.12)] w-full max-w-[380px] z-10">
        <div className="relative z-10 text-left">
          <h1 className="text-[26px] md:text-[28px] font-[1000] text-[#001D4A] leading-[1.1] tracking-[-0.06em] mb-5 -mt-2">
            Tempat Pinjaman <br />
            Tanpa Ribet.
          </h1>
          
          <div className="relative w-full pt-1">
            <div className="absolute top-0 left-0 w-full border-t-[1.5px] border-dotted border-[#003B95]/30" />
            <div className="flex justify-center items-center py-2">
              <span className="text-2xl md:text-3xl font-[1000] tracking-[-0.04em] flex leading-none">
                <span className="text-[#3b82f6]">Fin</span>
                <span className="text-[#001D4A]">Bank</span>
                <span className="text-[#001D4A]">Link</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* --- SISI KANAN: SEARCH BAR (KUNCI) --- */}
    <div className="col-span-12 lg:col-span-5 flex justify-end">
      <div className="w-full lg:w-[350px]">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[#3b82f6]" />
          </div>
          <input
            type="text"
            className="block w-full pl-14 pr-6 py-4 bg-white border-none rounded-2xl text-sm font-black text-[#001D4A] placeholder-slate-400 focus:ring-4 focus:ring-[#75B1FF]/30 outline-none transition-all shadow-xl"
            placeholder="Cari mitra bank..."
          />
        </div>
      </div>
    </div>

  </div>

  {/* --- BAR FILTER (CLEAN & MEPEET) --- */}
  {/* mt-6 dan pt-4 untuk mampetin jarak dari konten atas */}
  <div className="relative z-10 mt-6 pt-4 border-t border-white/5 flex flex-wrap gap-2">
    {['Kredit Mikro', 'Bunga 0%', 'Proses 1 Hari', 'Tanpa Jaminan'].map((item) => (
      <button 
        key={item} 
        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-[1000] text-white uppercase tracking-wider transition-all border-none outline-none"
      >
        {item}
      </button>
    ))}
  </div>
</div>

      {/* --- KOTAK 2: SECTION REKOMENDASI KARTU --- */}
<div className="bg-white rounded-[40px] p-8 mt-8">
  {/* Judul Section - Font lebih slim & profesional */}
  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-8 tracking-tight">
    Rekomendasi Untukmu
  </h2>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {banks
      .filter(bank => bank.nama_bank.toLowerCase().includes(searchTerm.toLowerCase()))
      .map((bank) => {
        const accentGradients = {
          'Bank BCA': 'from-[#1E56A0] via-[#1E56A0]/60 to-transparent',
          'Bank Mandiri': 'from-[#F9F871] via-[#F9F871]/60 to-transparent',
          'Bank BNI': 'from-[#FF9A3E] via-[#FF9A3E]/60 to-transparent',
          'Bank BRI': 'from-[#01579B] via-[#01579B]/60 to-transparent',
          'Bank BSI': 'from-[#43C6AC] via-[#43C6AC]/60 to-transparent',
        };
        const currentGradient = accentGradients[bank.nama_bank] || 'from-slate-500 to-transparent';

        return (
          <div key={bank.id} className="group relative bg-[#F8FAFC] rounded-[32px] overflow-hidden flex flex-col transition-all duration-300 shadow-lg border border-gray-100">
            
            {/* CURVE VECTOR */}
            <div 
              className={`absolute inset-0 bg-gradient-to-b ${currentGradient} z-0`}
              style={{
                clipPath: 'path("M1000 400 C 800 300, 400 100, 0 0 L 1000 0 Z")'
              }}
            />

            {/* SECTION 1: DATA BANK */}
            <div className="relative z-10 px-8 pt-5 pb-5">
              
              {/* Row 1: Nama Bank - Weight diturunkan dari 1000 ke bold standar */}
              <div className="flex justify-between items-center mb-0.5">
                <h3 className="text-[22px] font-bold text-[#1A1A1A] tracking-tight">
                  {bank.nama_bank}
                </h3>
                <div className="bg-black rounded-full p-1.5">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="6" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              {/* Row 2: Produk & Kecocokan */}
              <div className="flex justify-between items-start mb-4">
                <p className="text-[13px] font-medium text-[#1A1A1A]/60">
                  Nama Produk : <span className="font-semibold text-[#1A1A1A]">{bank.nama_produk}</span>
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-[#1A1A1A]/40 uppercase tracking-widest">Kecocokan</span>
                  <span className="text-[11px] font-bold text-[#1A1A1A] bg-[#90EE90] px-2 py-0.5 rounded">90%</span>
                </div>
              </div>

              {/* Row 3: Stats - Font lebih konsisten & bersih */}
              <div className="flex gap-10 items-center">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-[#1A1A1A]/40 uppercase tracking-wider">Bunga:</span>
                  <span className="text-[15px] font-bold text-[#1A1A1A]">{bank.bunga} / Bln</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-[#1A1A1A]/40 uppercase tracking-wider">Cicilan:</span>
                  <span className="text-[15px] font-bold text-[#1A1A1A]">Rp.500.000 / Bln</span>
                </div>
              </div>
            </div>

            {/* DIVIDER */}
            <div className="w-full h-[1.5px] bg-[#1A1A1A]/10" />

            {/* SECTION 2: ACTION BUTTONS - Font dibikin Medium-Bold agar tidak gendut */}
            <div className="relative z-10 flex w-full divide-x-[1.5px] divide-[#1A1A1A]/10 bg-white/10">
              <button className="flex-1 py-4 text-[13px] font-bold text-[#1A1A1A] hover:bg-white/40 transition-colors uppercase tracking-wide">
                Detail Produk
              </button>
              <button className="flex-1 py-4 text-[13px] font-bold text-[#1A1A1A] hover:bg-white/40 transition-colors uppercase tracking-wide">
                Ajukan Sekarang
              </button>
            </div>
          </div>
        );
      })}
  </div>
</div>

    </div>
  );
};

export default CariModal;