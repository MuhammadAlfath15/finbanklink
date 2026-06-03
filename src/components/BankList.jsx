import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBanks } from '../services/api';

// ── Helper ─────────────────────────────────────────────────────────────────
const formatRp = (n) =>
  'Rp ' + Math.round(n).toLocaleString('id-ID');

const getBankStyle = (name = '') => {
  if (name.includes('BCA Syariah')) return { cardBg: 'bg-[#EFF6FF]', accent: 'from-[#3B82F6] to-transparent', textMain: 'text-[#1D4ED8]' };
  if (name.includes('Mega Syariah')) return { cardBg: 'bg-[#FFFBEB]', accent: 'from-[#F59E0B] to-transparent', textMain: 'text-[#B45309]' };
  if (name.includes('BCA'))    return { cardBg: 'bg-[#E3F2FD]', accent: 'from-[#1E56A0] to-transparent', textMain: 'text-[#1E56A0]' };
  if (name.includes('Mandiri'))return { cardBg: 'bg-[#FEFCE8]', accent: 'from-[#EAB308] to-transparent', textMain: 'text-[#A16207]' };
  if (name.includes('BNI'))    return { cardBg: 'bg-[#FFF7ED]', accent: 'from-[#FF9A3E] to-transparent', textMain: 'text-[#C2410C]' };
  if (name.includes('BRI'))    return { cardBg: 'bg-[#F0F9FF]', accent: 'from-[#01579B] to-transparent', textMain: 'text-[#01579B]' };
  if (name.includes('BSI'))    return { cardBg: 'bg-[#F0FDFA]', accent: 'from-[#43C6AC] to-transparent', textMain: 'text-[#0F766E]' };
  if (name.includes('BTN'))    return { cardBg: 'bg-[#F8FAFC]', accent: 'from-[#64748B] to-transparent', textMain: 'text-[#334155]' };
  if (name.includes('CIMB'))   return { cardBg: 'bg-[#FEF2F2]', accent: 'from-[#DC2626] to-transparent', textMain: 'text-[#991B1B]' };
  if (name.includes('Danamon'))return { cardBg: 'bg-[#FFF7ED]', accent: 'from-[#F97316] to-transparent', textMain: 'text-[#C2410C]' };
  if (name.includes('Mega'))   return { cardBg: 'bg-[#FEFCE8]', accent: 'from-[#EAB308] to-transparent', textMain: 'text-[#A16207]' };
  if (name.includes('OCBC'))   return { cardBg: 'bg-[#FFF1F2]', accent: 'from-[#E11D48] to-transparent', textMain: 'text-[#9F1239]' };
  if (name.includes('Panin'))  return { cardBg: 'bg-[#EEF2FF]', accent: 'from-[#4F46E5] to-transparent', textMain: 'text-[#3730A3]' };
  if (name.includes('Muamalat')) return { cardBg: 'bg-[#FAF5FF]', accent: 'from-[#7E22CE] to-transparent', textMain: 'text-[#6B21A8]' };
  if (name.includes('BTPN')) return { cardBg: 'bg-[#F7FEE7]', accent: 'from-[#65A30D] to-transparent', textMain: 'text-[#4D7C0F]' };
  return { cardBg: 'bg-[#F8FAFC]', accent: 'from-[#64748B] to-transparent', textMain: 'text-[#334155]' };
};

// ── Detail Modal ────────────────────────────────────────────────────────────
const DetailModal = ({ bank, onClose, onAjukan }) => {
  const { cardBg, accent, textMain } = getBankStyle(bank.nama_bank);

  const plafonMin  = bank.plafon_min  ?? 1_000_000;
  const plafonMax  = bank.plafon_max  ?? 50_000_000;
  const tenorMin   = bank.tenor_min   ?? 6;
  const tenorMax   = bank.tenor_max   ?? 36;
  const bungaPct   = bank.bunga_persen ?? 0.5; // % per bulan flat

  const [pinjaman, setPinjaman] = useState(Math.round((plafonMin + plafonMax) / 2));
  const [tenor,    setTenor]    = useState(Math.round((tenorMin + tenorMax) / 2));

  // Flat interest cicilan calculation
  const pokokPerBulan  = pinjaman / tenor;
  const bungaPerBulan  = pinjaman * (bungaPct / 100);
  const cicilanPerBulan = pokokPerBulan + bungaPerBulan;

  const syarat = bank.syarat ?? [
    'Usaha telah berjalan minimal 6 bulan.',
    'Fotokopi KTP & NIB.',
    'Tidak sedang memiliki kredit produktif lain.',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl bg-white dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className={`relative overflow-hidden rounded-t-2xl px-5 pt-5 pb-4 ${cardBg} dark:bg-slate-800`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-20`} />
          <div className="relative flex justify-between items-start">
            <div>
              <h2 className={`text-xl font-bold ${textMain} dark:text-white`}>{bank.nama_bank}</h2>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-0.5">
                Nama Produk : {bank.nama_produk}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {/* Shield icon */}
              <svg viewBox="0 0 24 24" fill="currentColor" className={`w-7 h-7 ${textMain} dark:text-emerald-400`}>
                <path d="M12 1L3 5v6c0 5.25 3.75 10.15 9 11.25C17.25 21.15 21 16.25 21 11V5l-9-4z" />
              </svg>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase">Kecocokan</span>
              <span className="inline-block bg-[#2ECC71] text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm">
                {bank.skor_kecocokan}%
              </span>
            </div>
          </div>
          <hr className="mt-3 border-gray-300/60" />
        </div>

        {/* ── Body ── */}
        <div className="px-5 pt-4 pb-2 space-y-5">

          {/* RINGKASAN PRODUK */}
          <section>
            <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-2">
              Ringkasan Produk:
            </h3>
            <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0" />
                Plafon: {formatRp(plafonMin)} – {formatRp(plafonMax)}
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0" />
                Tenor: {tenorMin} bulan – {tenorMax} bulan
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0" />
                Suku Bunga: {bungaPct}% Flat / bulan
              </li>
            </ul>
          </section>

          {/* SIMULASI PINJAMAN */}
          <section>
            <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-2">
              Simulasi Pinjaman (Interaktif):
            </h3>
            <div className="space-y-3">
              {/* Slider pinjaman */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Jumlah Pinjaman</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{formatRp(pinjaman)}</span>
                </div>
                <input
                  id={`slider-pinjaman-${bank.id}`}
                  type="range"
                  min={plafonMin}
                  max={plafonMax}
                  step={500000}
                  value={pinjaman}
                  onChange={(e) => setPinjaman(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 rounded-full cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                  <span>{formatRp(plafonMin)}</span>
                  <span>{formatRp(plafonMax)}</span>
                </div>
              </div>

              {/* Slider tenor */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Tenor</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{tenor} Bulan</span>
                </div>
                <input
                  id={`slider-tenor-${bank.id}`}
                  type="range"
                  min={tenorMin}
                  max={tenorMax}
                  step={6}
                  value={tenor}
                  onChange={(e) => setTenor(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 rounded-full cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                  <span>{tenorMin} bln</span>
                  <span>{tenorMax} bln</span>
                </div>
              </div>

              {/* Hasil estimasi */}
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-700/50 rounded-xl px-4 py-3 flex justify-between items-center">
                <span className="text-xs text-blue-700 dark:text-blue-300 font-semibold">Estimasi Cicilan / Bulan</span>
                <span className="text-base font-black text-blue-800 dark:text-blue-200">{formatRp(cicilanPerBulan)}</span>
              </div>
            </div>
          </section>

          {/* SYARAT & KETENTUAN */}
          <section>
            <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-2">
              Syarat & Ketentuan:
            </h3>
            <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
              {syarat.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* ── Footer ── */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 rounded-b-2xl">
          <button
            id={`btn-kembali-${bank.id}`}
            onClick={onClose}
            className="py-4 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border-r border-gray-200 dark:border-gray-700 transition-colors"
          >
            Kembali
          </button>
          <button
            id={`btn-ajukan-modal-${bank.id}`}
            onClick={onAjukan}
            className="py-4 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            Ajukan Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};

// ── BankList ────────────────────────────────────────────────────────────────
const BankList = () => {
  const [banks,      setBanks]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeBank, setActiveBank] = useState(null);
  const navigate = useNavigate();

  const goAjukan = (bank) => navigate('/ajukan-pinjaman', { state: { bank } }); // bank yang sedang dibuka detailnya

  useEffect(() => {
    getBanks()
      .then(data => { setBanks(data); setLoading(false); })
      .catch(err  => { console.error('Gagal ambil data bank:', err); setLoading(false); });
  }, []);

  if (loading) return <p className="text-center mt-10">Sabar ya, lagi loading data...</p>;

  return (
    <>
      {/* Modal */}
      {activeBank && (
        <DetailModal
          bank={activeBank}
          onClose={() => setActiveBank(null)}
          onAjukan={() => goAjukan(activeBank)}
        />
      )}

      {/* Grid kartu bank */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banks.map((bank) => {
          const { cardBg, accent, textMain } = getBankStyle(bank.nama_bank);
          return (
            <div
              key={bank.id}
              className={`relative rounded-[15px] flex flex-col h-[210px] border-none shadow-md overflow-hidden ${cardBg}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-20`} />

              <div className="relative z-10 p-6 flex-grow flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`font-bold text-xl ${textMain} tracking-tight`}>{bank.nama_bank}</h3>
                    <p className="text-[13px] font-semibold text-gray-800 mt-1">
                      Nama Produk : {bank.nama_produk}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-black uppercase">Kecocokan</p>
                    <span className="inline-block bg-[#2ECC71] text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm">
                      {bank.skor_kecocokan}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 mb-2">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Bunga</p>
                    <p className="text-[13px] font-semibold text-gray-900">{bank.bunga_persen}% / Bln</p>
                  </div>
                  <div className="space-y-0.5 text-right md:text-left">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Cicilan</p>
                    <p className="text-[13px] font-semibold text-gray-900">{bank.cicilan}</p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-2 py-4 px-4 bg-white/20 backdrop-blur-md border-t border-gray-200/30">
                <button
                  id={`btn-detail-${bank.id}`}
                  onClick={() => setActiveBank(bank)}
                  className="text-[13px] font-bold text-gray-700 hover:text-blue-900 transition-all border-r border-gray-300/50"
                >
                  Detail Produk
                </button>
                <button
                  id={`btn-ajukan-card-${bank.id}`}
                  onClick={() => goAjukan(bank)}
                  className="text-[13px] font-bold text-gray-700 hover:text-blue-900 transition-all"
                >
                  Ajukan Sekarang
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default BankList;