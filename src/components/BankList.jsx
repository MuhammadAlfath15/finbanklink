import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BankList = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Memanggil API Laravel yang tadi sudah jalan di http://127.0.0.1:8000/api/banks
    axios.get('http://127.0.0.1:8000/api/banks')
      .then(response => {
        setBanks(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Waduh, gagal ambil data bank:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-10">Sabar ya, lagi loading data...</p>;

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {banks.map((bank) => {
  const getBankStyle = (name) => {
    if (name.includes('BCA')) return {
      cardBg: 'bg-[#E3F2FD]', 
      accent: 'from-[#1A569C] to-transparent',
      textMain: 'text-[#0D47A1]' // Biru lebih tajam
    };
    if (name.includes('Mandiri')) return {
      cardBg: 'bg-[#FFFDE7]', 
      accent: 'from-[#FBC02D] to-transparent',
      textMain: 'text-[#7F6D00]' // Gold-brown lebih tajam
    };
    return {
      cardBg: 'bg-[#E8F5E9]',
      accent: 'from-[#2ECC71] to-transparent',
      textMain: 'text-[#1B5E20]'
    };
  };

  const { cardBg, accent, textMain } = getBankStyle(bank.nama_bank);

  return (
    <div key={bank.id} className={`relative rounded-[15px] flex flex-col h-[210px] border-none shadow-md overflow-hidden ${cardBg}`}>
      
      {/* Background Gradient - Sedikit lebih tegas dibanding sebelumnya */}
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-20 clip-path-figma-soft`}></div>
      
      {/* Content Layer */}
      <div className="relative z-10 p-6 flex-grow flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            {/* Font dipertebal ke Bold dan warna lebih gelap */}
            <h3 className={`font-bold text-xl ${textMain} tracking-tight`}>{bank.nama_bank}</h3>
            <p className="text-[13px] font-semibold text-gray-800 mt-1">Nama Produk : {bank.nama_produk}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500 font-black uppercase">Kecocokan</p>
            <span className="inline-block bg-[#2ECC71] text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm">
              {bank.skor_kecocokan}%
            </span>
          </div>
        </div>

        {/* Info Bunga & Cicilan - Font Semibold agar tidak kurus */}
        <div className="grid grid-cols-2 gap-x-4 mb-2">
          <div className="space-y-0.5">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Bunga</p>
            <p className="text-[13px] font-semibold text-gray-900">{bank.bunga} / Bulan</p>
          </div>
          <div className="space-y-0.5 text-right md:text-left">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Cicilan</p>
            <p className="text-[13px] font-semibold text-gray-900">{bank.cicilan}</p>
          </div>
        </div>
      </div>

      {/* Tombol Aksi - Diberi padding px-6 agar tidak terlalu pojok */}
      <div className="relative z-10 grid grid-cols-2 py-4 px-4 bg-white/20 backdrop-blur-md border-t border-gray-200/30">
        <button className="text-[13px] font-bold text-gray-700 hover:text-blue-900 transition-all border-r border-gray-300/50">
          Detail Produk
        </button>
        <button className="text-[13px] font-bold text-gray-700 hover:text-blue-900 transition-all">
          Ajukan Sekarang
        </button>
      </div>
    </div>
  );
})}
    </div>
  );
};

export default BankList;