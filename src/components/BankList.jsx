import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBanks } from '../services/api';

// ── Helper ─────────────────────────────────────────────────────────────────
const formatRp = (n) =>
  'Rp ' + Math.round(n).toLocaleString('id-ID');

const getBankStyle = (name = '') => {
  if (name.includes('BCA'))    return { cardBg: 'bg-[#E3F2FD]', accent: 'from-[#1A569C] to-transparent', textMain: 'text-[#0D47A1]' };
  if (name.includes('Mandiri'))return { cardBg: 'bg-[#FFFDE7]', accent: 'from-[#FBC02D] to-transparent', textMain: 'text-[#7F6D00]' };
  if (name.includes('BRI'))    return { cardBg: 'bg-[#FFF3E0]', accent: 'from-[#E65100] to-transparent', textMain: 'text-[#BF360C]' };
  if (name.includes('BNI'))    return { cardBg: 'bg-[#F3E5F5]', accent: 'from-[#6A1B9A] to-transparent', textMain: 'text-[#4A148C]' };
  if (name.includes('BTN'))    return { cardBg: 'bg-[#E8F5E9]', accent: 'from-[#1B5E20] to-transparent', textMain: 'text-[#1B5E20]' };
  return { cardBg: 'bg-[#E8F5E9]', accent: 'from-[#2ECC71] to-transparent', textMain: 'text-[#1B5E20]' };
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
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className={`relative overflow-hidden rounded-t-2xl px-5 pt-5 pb-4 ${cardBg}`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-20`} />
          <div className="relative flex justify-between items-start">
            <div>
              <h2 className={`text-xl font-bold ${textMain}`}>{bank.nama_bank}</h2>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">
                Nama Produk : {bank.nama_produk}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {/* Shield icon */}
              <svg viewBox="0 0 24 24" fill="currentColor" className={`w-7 h-7 ${textMain}`}>
                <path d="M12 1L3 5v6c0 5.25 3.75 10.15 9 11.25C17.25 21.15 21 16.25 21 11V5l-9-4z" />
              </svg>
              <span className="text-[10px] text-gray-500 font-black uppercase">Kecocokan</span>
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
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide mb-2">
              Ringkasan Produk:
            </h3>
            <ul className="space-y-1.5 text-sm text-gray-700">
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
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide mb-2">
              Simulasi Pinjaman (Interaktif):
            </h3>
            <div className="space-y-3">
              {/* Slider pinjaman */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Jumlah Pinjaman</span>
                  <span className="font-bold text-gray-800">{formatRp(pinjaman)}</span>
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
                <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                  <span>{formatRp(plafonMin)}</span>
                  <span>{formatRp(plafonMax)}</span>
                </div>
              </div>

              {/* Slider tenor */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Tenor</span>
                  <span className="font-bold text-gray-800">{tenor} Bulan</span>
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
                <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                  <span>{tenorMin} bln</span>
                  <span>{tenorMax} bln</span>
                </div>
              </div>

              {/* Hasil estimasi */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex justify-between items-center">
                <span className="text-xs text-blue-700 font-semibold">Estimasi Cicilan / Bulan</span>
                <span className="text-base font-black text-blue-800">{formatRp(cicilanPerBulan)}</span>
              </div>
            </div>
          </section>

          {/* SYARAT & KETENTUAN */}
          <section>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide mb-2">
              Syarat & Ketentuan:
            </h3>
            <ul className="space-y-1.5 text-sm text-gray-700">
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
        <div className="sticky bottom-0 bg-white border-t border-gray-200 grid grid-cols-2 rounded-b-2xl">
          <button
            id={`btn-kembali-${bank.id}`}
            onClick={onClose}
            className="py-4 text-sm font-bold text-gray-600 hover:text-gray-900 border-r border-gray-200 transition-colors"
          >
            Kembali
          </button>
          <button
            id={`btn-ajukan-modal-${bank.id}`}
            onClick={onAjukan}
            className="py-4 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
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
                    <p className="text-[13px] font-semibold text-gray-900">{bank.bunga} / Bulan</p>
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