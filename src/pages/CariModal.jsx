import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { getBanks } from '../services/api';

// ── Helper ──────────────────────────────────────────────────────────────────
const formatRp = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

const getBankAccentStyle = (name = '') => {
  if (name.includes('BCA')) return { cardBg: 'bg-[#E3F2FD]', accent: 'from-[#1A569C] to-transparent', textMain: 'text-[#0D47A1]' };
  if (name.includes('Mandiri')) return { cardBg: 'bg-[#FFFDE7]', accent: 'from-[#FBC02D] to-transparent', textMain: 'text-[#7F6D00]' };
  if (name.includes('BRI')) return { cardBg: 'bg-[#FFF3E0]', accent: 'from-[#E65100] to-transparent', textMain: 'text-[#BF360C]' };
  if (name.includes('BNI')) return { cardBg: 'bg-[#F3E5F5]', accent: 'from-[#6A1B9A] to-transparent', textMain: 'text-[#4A148C]' };
  if (name.includes('BTN')) return { cardBg: 'bg-[#E8F5E9]', accent: 'from-[#1B5E20] to-transparent', textMain: 'text-[#1B5E20]' };
  return { cardBg: 'bg-[#E8F5E9]', accent: 'from-[#2ECC71] to-transparent', textMain: 'text-[#1B5E20]' };
};

// ── Detail Modal ─────────────────────────────────────────────────────────────
const DetailModal = ({ bank, onClose, onAjukan }) => {
  const { cardBg, accent, textMain } = getBankAccentStyle(bank.nama_bank);
  const plafonMin = bank.plafon_min ?? 1_000_000;
  const plafonMax = bank.plafon_max ?? 50_000_000;
  const tenorMin = bank.tenor_min ?? 6;
  const tenorMax = bank.tenor_max ?? 36;
  const bungaPct = bank.bunga_persen ?? 0.5;
  const [pinjaman, setPinjaman] = useState(Math.round((plafonMin + plafonMax) / 2));
  const [tenor, setTenor] = useState(Math.round((tenorMin + tenorMax) / 2));
  const cicilanPerBulan = (pinjaman / tenor) + (pinjaman * (bungaPct / 100));
  const syarat = bank.syarat ?? ['Usaha berjalan minimal 6 bulan.', 'Fotokopi KTP & NIB.', 'Tidak memiliki kredit macet.'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`relative overflow-hidden rounded-t-2xl px-5 pt-5 pb-4 ${cardBg}`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-20`} />
          <div className="relative flex justify-between items-start">
            <div>
              <h2 className={`text-xl font-bold ${textMain}`}>{bank.nama_bank}</h2>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">Nama Produk : {bank.nama_produk}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <svg viewBox="0 0 24 24" fill="currentColor" className={`w-7 h-7 ${textMain}`}>
                <path d="M12 1L3 5v6c0 5.25 3.75 10.15 9 11.25C17.25 21.15 21 16.25 21 11V5l-9-4z" />
              </svg>
              <span className="text-[10px] text-gray-500 font-black uppercase">Kecocokan</span>
              <span className="inline-block bg-[#2ECC71] text-white text-[11px] font-bold px-3 py-0.5 rounded-full">{bank.skor_kecocokan}%</span>
            </div>
          </div>
          <hr className="mt-3 border-gray-300/60" />
        </div>

        {/* Body */}
        <div className="px-5 pt-4 pb-2 space-y-5">
          <section>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide mb-2">Ringkasan Produk:</h3>
            <ul className="space-y-1.5 text-sm text-gray-700">
              <li className="flex items-start gap-2"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0" />Plafon: {formatRp(plafonMin)} – {formatRp(plafonMax)}</li>
              <li className="flex items-start gap-2"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0" />Tenor: {tenorMin} bulan – {tenorMax} bulan</li>
              <li className="flex items-start gap-2"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0" />Suku Bunga: {bungaPct}% Flat / bulan</li>
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide mb-2">Simulasi Pinjaman (Interaktif):</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Jumlah Pinjaman</span><span className="font-bold text-gray-800">{formatRp(pinjaman)}</span></div>
                <input type="range" min={plafonMin} max={plafonMax} step={500000} value={pinjaman} onChange={(e) => setPinjaman(Number(e.target.value))} className="w-full accent-blue-600 h-1.5 rounded-full cursor-pointer" />
                <div className="flex justify-between text-[10px] text-gray-400 mt-0.5"><span>{formatRp(plafonMin)}</span><span>{formatRp(plafonMax)}</span></div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Tenor</span><span className="font-bold text-gray-800">{tenor} Bulan</span></div>
                <input type="range" min={tenorMin} max={tenorMax} step={6} value={tenor} onChange={(e) => setTenor(Number(e.target.value))} className="w-full accent-blue-600 h-1.5 rounded-full cursor-pointer" />
                <div className="flex justify-between text-[10px] text-gray-400 mt-0.5"><span>{tenorMin} bln</span><span>{tenorMax} bln</span></div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex justify-between items-center">
                <span className="text-xs text-blue-700 font-semibold">Estimasi Cicilan / Bulan</span>
                <span className="text-base font-black text-blue-800">{formatRp(cicilanPerBulan)}</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide mb-2">Syarat & Ketentuan:</h3>
            <ul className="space-y-1.5 text-sm text-gray-700">
              {syarat.map((s, i) => (<li key={i} className="flex items-start gap-2"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0" />{s}</li>))}
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 grid grid-cols-2 rounded-b-2xl">
          <button onClick={onClose} className="py-4 text-sm font-bold text-gray-600 hover:text-gray-900 border-r border-gray-200 transition-colors">Kembali</button>
          <button onClick={onAjukan} className="py-4 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">Ajukan Sekarang</button>
        </div>
      </div>
    </div>
  );
};

const CariModal = () => {
  const [banks, setBanks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeBank, setActiveBank] = useState(null);
  const navigate = useNavigate();

  const goAjukan = (bank) => navigate('/ajukan-pinjaman', { state: { bank } });

  useEffect(() => {
    getBanks()
      .then(data => setBanks(data))
      .catch(error => console.error('Gagal mengambil data:', error));
  }, []);

  return (
    <>
      {activeBank && <DetailModal bank={activeBank} onClose={() => setActiveBank(null)} onAjukan={() => goAjukan(activeBank)} />}
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
                  <p className="text-[12px] md:text-[14px] font-bold text-[#003B95] uppercase tracking-wider leading-none whitespace-nowrap">
                    Yuk cari modal
                  </p>
                </div>
              </div>

              {/* MAIN BALIHO BOX - KUNCI STYLE */}
              <div className="bg-[#DCEBFF] rounded-xl p-6 pt-10 pb-2 border-none relative overflow-hidden shadow-[10px_10px_0px_rgba(0,0,0,0.12)] w-full max-w-[380px] z-10">
                <div className="relative z-10 text-left">
                  <h1 className="text-[26px] md:text-[28px] font-bold text-[#001D4A] leading-[1.2] mb-5 -mt-2">
                    Tempat Pinjaman <br />
                    Tanpa Ribet.
                  </h1>

                  <div className="relative w-full pt-1">
                    <div className="absolute top-0 left-0 w-full border-t-[1.5px] border-dotted border-[#003B95]/30" />
                    <div className="flex justify-center items-center py-2">
                      <span className="text-2xl md:text-3xl font-black tracking-tight flex items-center">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0047AB] via-[#001D4A] to-black">FinBankLink</span>
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
                    className="block w-full pl-14 pr-6 py-4 bg-white border-none rounded-2xl text-sm font-semibold text-[#001D4A] placeholder-slate-400 focus:ring-4 focus:ring-[#75B1FF]/30 outline-none transition-all shadow-xl"
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
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white uppercase tracking-wider transition-all border-none outline-none"
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
                      <button
                        onClick={() => setActiveBank(bank)}
                        className="flex-1 py-4 text-[13px] font-bold text-[#1A1A1A] hover:bg-white/40 transition-colors uppercase tracking-wide"
                      >
                        Detail Produk
                      </button>
                      <button
                        onClick={() => goAjukan(bank)}
                        className="flex-1 py-4 text-[13px] font-bold text-[#1A1A1A] hover:bg-white/40 transition-colors uppercase tracking-wide"
                      >
                        Ajukan Sekarang
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

      </div>
    </>
  );
};

export default CariModal;