import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, ChevronLeft, ChevronRight, Briefcase, Percent, Clock, ShieldCheck } from 'lucide-react';
import { getBanks, getBusinessProfile } from '../services/api';

// ── Helper ──────────────────────────────────────────────────────────────────
const formatRp = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const toTitleCase = (s = '') => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const formatCategoryTitle = (raw = '') => {
  const normalized = (raw || '').trim().toLowerCase();
  if (!normalized) return 'Terdaftar';
  if (normalized === 'rekomendasi untukmu') return 'Rekomendasi Untukmu';
  return toTitleCase(normalized.replace(/^kategori\s+/i, ''));
};

const getBankAccentStyle = (name = '') => {
  if (name.includes('BCA Syariah')) return { cardBg: 'bg-[#EFF6FF]', accent: 'from-[#3B82F6] to-transparent', textMain: 'text-[#1D4ED8]' };
  if (name.includes('Mega Syariah')) return { cardBg: 'bg-[#FFFBEB]', accent: 'from-[#F59E0B] to-transparent', textMain: 'text-[#B45309]' };
  if (name.includes('BCA')) return { cardBg: 'bg-[#E3F2FD]', accent: 'from-[#1E56A0] to-transparent', textMain: 'text-[#1E56A0]' };
  if (name.includes('Mandiri')) return { cardBg: 'bg-[#FEFCE8]', accent: 'from-[#EAB308] to-transparent', textMain: 'text-[#A16207]' };
  if (name.includes('BNI')) return { cardBg: 'bg-[#FFF7ED]', accent: 'from-[#FF9A3E] to-transparent', textMain: 'text-[#C2410C]' };
  if (name.includes('BRI')) return { cardBg: 'bg-[#F0F9FF]', accent: 'from-[#01579B] to-transparent', textMain: 'text-[#01579B]' };
  if (name.includes('BSI')) return { cardBg: 'bg-[#F0FDFA]', accent: 'from-[#43C6AC] to-transparent', textMain: 'text-[#0F766E]' };
  if (name.includes('BTN')) return { cardBg: 'bg-[#F8FAFC]', accent: 'from-[#64748B] to-transparent', textMain: 'text-[#334155]' };
  if (name.includes('CIMB')) return { cardBg: 'bg-[#FEF2F2]', accent: 'from-[#DC2626] to-transparent', textMain: 'text-[#991B1B]' };
  if (name.includes('Danamon')) return { cardBg: 'bg-[#FFF7ED]', accent: 'from-[#F97316] to-transparent', textMain: 'text-[#C2410C]' };
  if (name.includes('Mega')) return { cardBg: 'bg-[#FEFCE8]', accent: 'from-[#EAB308] to-transparent', textMain: 'text-[#A16207]' };
  if (name.includes('OCBC')) return { cardBg: 'bg-[#FFF1F2]', accent: 'from-[#E11D48] to-transparent', textMain: 'text-[#9F1239]' };
  if (name.includes('Panin')) return { cardBg: 'bg-[#EEF2FF]', accent: 'from-[#4F46E5] to-transparent', textMain: 'text-[#3730A3]' };
  if (name.includes('Muamalat')) return { cardBg: 'bg-[#FAF5FF]', accent: 'from-[#7E22CE] to-transparent', textMain: 'text-[#6B21A8]' };
  if (name.includes('BTPN')) return { cardBg: 'bg-[#F7FEE7]', accent: 'from-[#65A30D] to-transparent', textMain: 'text-[#4D7C0F]' };
  return { cardBg: 'bg-[#F8FAFC]', accent: 'from-[#64748B] to-transparent', textMain: 'text-[#334155]' };
};

// ── Detail Modal ─────────────────────────────────────────────────────────────
const DetailModal = ({ bank, onClose, onAjukan, pendingDocsCount }) => {
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
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl bg-white dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`relative overflow-hidden rounded-t-2xl px-5 pt-5 pb-4 ${cardBg} dark:bg-slate-800`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-20`} />
          <div className="relative flex justify-between items-start">
            <div>
              <h2 className={`text-xl font-bold ${textMain} dark:text-white`}>{bank.nama_bank}</h2>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-0.5">Nama Produk : {bank.nama_produk}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <svg viewBox="0 0 24 24" fill="currentColor" className={`w-7 h-7 ${textMain} dark:text-emerald-400`}>
                <path d="M12 1L3 5v6c0 5.25 3.75 10.15 9 11.25C17.25 21.15 21 16.25 21 11V5l-9-4z" />
              </svg>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase">Kecocokan</span>
              <span className={`inline-block text-white text-[11px] font-bold px-3 py-0.5 rounded-full ${bank.skor_kecocokan >= 60 ? 'bg-[#2ECC71]' : 'bg-red-500'}`}>
                {bank.skor_kecocokan}%
              </span>
            </div>
          </div>
          <hr className="mt-3 border-gray-300/60" />
        </div>

        {/* Body */}
        <div className="px-5 pt-4 pb-2 space-y-5">
          <section>
            <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-2">Ringkasan Produk:</h3>
            <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0" />Plafon: {formatRp(plafonMin)} – {formatRp(plafonMax)}</li>
              <li className="flex items-start gap-2"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0" />Tenor: {tenorMin} bulan – {tenorMax} bulan</li>
              <li className="flex items-start gap-2"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0" />Suku Bunga: {bungaPct}% Flat / bulan</li>
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-2">Simulasi Pinjaman (Interaktif):</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1"><span>Jumlah Pinjaman</span><span className="font-bold text-gray-800 dark:text-gray-200">{formatRp(pinjaman)}</span></div>
                <input type="range" min={plafonMin} max={plafonMax} step={500000} value={pinjaman} onChange={(e) => setPinjaman(Number(e.target.value))} className="w-full accent-blue-600 h-1.5 rounded-full cursor-pointer" />
                <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-0.5"><span>{formatRp(plafonMin)}</span><span>{formatRp(plafonMax)}</span></div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1"><span>Tenor</span><span className="font-bold text-gray-800 dark:text-gray-200">{tenor} Bulan</span></div>
                <input type="range" min={tenorMin} max={tenorMax} step={6} value={tenor} onChange={(e) => setTenor(Number(e.target.value))} className="w-full accent-blue-600 h-1.5 rounded-full cursor-pointer" />
                <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-0.5"><span>{tenorMin} bln</span><span>{tenorMax} bln</span></div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-700/50 rounded-xl px-4 py-3 flex justify-between items-center">
                <span className="text-xs text-blue-700 dark:text-blue-300 font-semibold">Estimasi Cicilan / Bulan</span>
                <span className="text-base font-black text-blue-800 dark:text-blue-200">{formatRp(cicilanPerBulan)}</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide mb-2">Syarat & Ketentuan:</h3>
            <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
              {syarat.map((s, i) => (<li key={i} className="flex items-start gap-2"><span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0" />{s}</li>))}
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 rounded-b-2xl">
          <button onClick={onClose} className="py-4 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border-r border-gray-200 dark:border-gray-700 transition-colors">Kembali</button>
          <button
            onClick={onAjukan}
            disabled={bank.skor_kecocokan < 60 || pendingDocsCount > 0}
            className={`py-4 text-sm font-bold transition-colors ${
              bank.skor_kecocokan < 60 || pendingDocsCount > 0
                ? 'text-gray-400 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
                : 'text-blue-600 hover:text-blue-800'
            }`}
          >
            {pendingDocsCount > 0 ? 'Menunggu Audit Berkas' : bank.skor_kecocokan < 60 ? 'Skor Kurang' : 'Ajukan Sekarang'}
          </button>
        </div>
      </div>
    </div>
  );
};

const BankCard = ({ bank, setActiveBank, goAjukan, pendingDocsCount }) => {
  const accentGradients = {
    'Bank BCA': 'from-[#1E56A0] via-[#1E56A0]/60 to-transparent',
    'Bank Mandiri': 'from-[#F9F871] via-[#F9F871]/60 to-transparent',
    'Bank BNI': 'from-[#FF9A3E] via-[#FF9A3E]/60 to-transparent',
    'Bank BRI': 'from-[#01579B] via-[#01579B]/60 to-transparent',
    'Bank BSI': 'from-[#43C6AC] via-[#43C6AC]/60 to-transparent',
    'Bank CIMB Niaga': 'from-[#DC2626] via-[#DC2626]/60 to-transparent',
    'Bank Danamon': 'from-[#F97316] via-[#F97316]/60 to-transparent',
    'Bank Mega': 'from-[#EAB308] via-[#EAB308]/60 to-transparent',
    'Bank OCBC NISP': 'from-[#E11D48] via-[#E11D48]/60 to-transparent',
    'Bank Panin': 'from-[#4F46E5] via-[#4F46E5]/60 to-transparent',
    'Bank Muamalat': 'from-[#7E22CE] via-[#7E22CE]/60 to-transparent',
    'BTPN Syariah': 'from-[#65A30D] via-[#65A30D]/60 to-transparent',
    'BCA Syariah': 'from-[#3B82F6] via-[#3B82F6]/60 to-transparent',
    'Bank Mega Syariah': 'from-[#F59E0B] via-[#F59E0B]/60 to-transparent',
  };
  const currentGradient = accentGradients[bank.nama_bank] || 'from-slate-500 to-transparent';

  return (
    <div className="group relative bg-[#F8FAFC] dark:bg-gray-800 rounded-[32px] overflow-hidden flex flex-col transition-all duration-300 shadow-lg border border-gray-100 dark:border-gray-700 w-full md:w-[calc(50%-12px)] snap-center shrink-0">
      <div className={`absolute inset-0 bg-gradient-to-b ${currentGradient} z-0`} style={{ clipPath: 'path("M1000 400 C 800 300, 400 100, 0 0 L 1000 0 Z")' }} />
      <div className="relative z-10 px-8 pt-5 pb-5">
        <div className="flex justify-between items-center mb-0.5">
          <h3 className="text-[22px] font-bold text-[#1A1A1A] dark:text-white tracking-tight">{bank.nama_bank}</h3>
          <div className="bg-black rounded-full p-1.5">
            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="6" d="M5 13l4 4L19 7" /></svg>
          </div>
        </div>
        <div className="flex justify-between items-start mb-4">
          <p className="text-[13px] font-medium text-[#1A1A1A]/60 dark:text-gray-400">Nama Produk : <span className="font-semibold text-[#1A1A1A] dark:text-gray-200">{bank.nama_produk}</span></p>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-[#1A1A1A]/40 dark:text-gray-500 uppercase tracking-widest">Kecocokan</span>
            <span className={`text-[11px] font-bold text-white px-2 py-0.5 rounded ${bank.skor_kecocokan >= 60 ? 'bg-[#2ECC71]' : 'bg-red-500'}`}>
              {bank.skor_kecocokan}%
            </span>
          </div>
        </div>
        <div className="flex gap-10 items-center">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-[#1A1A1A]/40 dark:text-gray-500 uppercase tracking-wider">Bunga:</span>
            <span className="text-[15px] font-bold text-[#1A1A1A] dark:text-white">{bank.bunga_persen}% / Bln</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-[#1A1A1A]/40 dark:text-gray-500 uppercase tracking-wider">Cicilan:</span>
            <span className="text-[15px] font-bold text-[#1A1A1A] dark:text-white">{bank.cicilan}</span>
          </div>
        </div>
      </div>
      <div className="w-full h-[1.5px] bg-[#1A1A1A]/10 dark:bg-white/10" />
      <div className="relative z-10 flex w-full divide-x-[1.5px] divide-[#1A1A1A]/10 dark:divide-white/10 bg-white/10 dark:bg-black/10 mt-auto">
        <button onClick={() => setActiveBank(bank)} className="flex-1 py-4 text-[13px] font-bold text-[#1A1A1A] dark:text-gray-200 hover:bg-white/40 dark:hover:bg-white/10 transition-colors uppercase tracking-wide">Detail Produk</button>
        <button
          onClick={() => bank.skor_kecocokan >= 60 && pendingDocsCount === 0 && goAjukan(bank)}
          disabled={bank.skor_kecocokan < 60 || pendingDocsCount > 0}
          className={`flex-1 py-4 text-[13px] font-bold transition-colors uppercase tracking-wide ${
            bank.skor_kecocokan < 60 || pendingDocsCount > 0
              ? 'text-gray-400 dark:text-gray-600 bg-gray-100/50 dark:bg-gray-700/30 cursor-not-allowed'
              : 'text-[#1A1A1A] dark:text-gray-200 hover:bg-white/40 dark:hover:bg-white/10'
          }`}
        >
          {pendingDocsCount > 0 ? 'Menunggu Audit' : bank.skor_kecocokan < 60 ? 'Skor Rendah' : 'Ajukan Modal'}
        </button>
      </div>
    </div>
  );
};

const BankCarousel = ({ title, banks, setActiveBank, goAjukan, pendingDocsCount }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth / 2;
      if (direction === 'left') {
        scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  if (!banks || banks.length === 0) return null;

  return (
    <div className="group/carousel">
      <div className="flex justify-between items-center mb-4 md:mb-6 px-2">
        <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A] dark:text-white tracking-tight">{title}</h2>
        {banks.length > 1 && (
          <div className="flex md:hidden items-center gap-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-700">
            <span>Geser</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="relative">
        {banks.length > 2 && (
          <>
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-5 z-20 bg-white/95 dark:bg-gray-800/95 backdrop-blur shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 dark:border-gray-700 rounded-full p-3 text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 hover:scale-110 hover:text-[#001D4A] dark:hover:text-white transition-all opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 hidden md:flex items-center justify-center"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-5 z-20 bg-white/95 dark:bg-gray-800/95 backdrop-blur shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 dark:border-gray-700 rounded-full p-3 text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 hover:scale-110 hover:text-[#001D4A] dark:hover:text-white transition-all opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 hidden md:flex items-center justify-center"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-6 pb-6 px-2 -mx-2 hide-scrollbar snap-x snap-mandatory scroll-smooth"
        >
          {banks.map(bank => (
            <BankCard key={bank.id} bank={bank} setActiveBank={setActiveBank} goAjukan={goAjukan} pendingDocsCount={pendingDocsCount} />
          ))}
        </div>
      </div>
    </div>
  );
};

const CariModal = () => {
  const [banks, setBanks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);
  const [activeBank, setActiveBank] = useState(null);
  const [bp, setBp] = useState(null);
  const navigate = useNavigate();

  const goAjukan = (bank) => navigate('/ajukan-pinjaman', { state: { bank } });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bankData, profileData] = await Promise.all([
          getBanks(),
          getBusinessProfile().catch(() => ({ skor_total: 0 }))
        ]);

        setBp(profileData);
        const userScore = profileData.skor_total || 0;

        // Kalkulasi skor kecocokan berdasarkan skor kesehatan bisnis vs standar bank
        const enhancedBanks = bankData.map(bank => {
          const standard = bank.min_score || 350;
          // Rumus: (Skor User / Skor Maksimal) * Faktor Pengetatan Bank
          // Kita pakai pendekatan: Seberapa dekat user ke standar bank tersebut.
          let matchScore = Math.round((userScore / standard) * 100);

          // Cap di 99% kalau belum 100% sempurna, tapi jangan biarkan terlalu tinggi jika standar gak terpenuhi
          if (userScore < standard) {
            matchScore = Math.min(matchScore, 59); // Jika dibawah standar, max 59% (biar merah)
          } else {
            matchScore = Math.min(100, 60 + Math.round(((userScore - standard) / (600 - standard)) * 40));
          }

          return { ...bank, skor_kecocokan: matchScore };
        });

        setBanks(enhancedBanks);
      } catch (error) {
        console.error('Gagal mengambil data:', error);
      }
    };

    fetchData();
  }, []);

  // Check if there are any documents pending audit
  const getPendingCount = (profile) => {
    if (!profile) return 0;
    const docs = ['nib_path', 'npwp_path', 'rekening_path', 'foto_usaha_path', 'kontrak_path', 'bukti_pelunasan_path'];
    let pendingCount = 0;
    docs.forEach(doc => {
      const hasFileKey = 'has_' + doc.replace('_path', '');
      const hasFile = profile[hasFileKey] || profile[doc];
      const status = profile.document_statuses?.[doc] || 'pending';
      if (hasFile && status === 'pending') {
        pendingCount++;
      }
    });
    return pendingCount;
  };

  const pendingDocsCount = getPendingCount(bp);

  return (
    <>
      {activeBank && <DetailModal bank={activeBank} onClose={() => setActiveBank(null)} onAjukan={() => goAjukan(activeBank)} pendingDocsCount={pendingDocsCount} />}
      <div className="space-y-6 p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">

        {/* --- KOTAK 1: SECTION HEADER --- */}
        <div className="bg-gradient-to-b from-[#60a5fa] via-[#3b82f6] to-[#2563eb] rounded-[32px] md:rounded-t-[40px] p-6 md:p-8 pb-5 md:pb-5 border-none relative overflow-hidden h-auto -mx-4 md:-mx-[56px] -mt-4 md:-mt-[56px]">

          {/* AKSEN KURVA/WAVE (Sesuai elemen melengkung di Figma lu) */}
          <div className="absolute bottom-0 left-0 w-full h-[60%] bg-[#1d4ed8]/20 rounded-[100%] scale-x-150 translate-y-1/2 z-0" />

          {/* ORNAMEN DEKORATIF DI SISI KANAN (Disesuaikan agar lebih halus) */}
          <div className="absolute top-0 right-0 w-[50%] h-full bg-white/10 skew-x-12 translate-x-20 z-0" />

          <div className="relative z-10 grid grid-cols-12 gap-6 items-center">

            {/* --- SISI KIRI: PAPAN REKLAME (KUNCI TOTAL) --- */}
            <div className="col-span-12 lg:col-span-7 flex flex-col items-start md:pl-8 lg:pl-12">

              {/* BADGE "Yuk cari modal" - KUNCI POSITION */}
              <div className="relative z-30 ml-0 mb-[-12px]">
                <div className="absolute top-[4px] left-[4px] w-full h-full bg-black/20 rounded-lg" />
                <div className="relative bg-white keep-light border-2 border-[#003B95] px-6 py-2 rounded-lg">
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
                    className="block w-full pl-14 pr-6 py-4 bg-white keep-light border-none rounded-2xl text-sm font-semibold text-[#001D4A] placeholder-slate-400 focus:ring-4 focus:ring-[#75B1FF]/30 outline-none transition-all shadow-xl"
                    placeholder="Cari mitra bank..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* --- BAR FILTER (GLASSMORPHIC & PREMIUM) --- */}
          <div className="relative z-10 mt-8 pt-5 border-t border-white/40 flex flex-wrap items-center gap-3 md:gap-4 md:pl-8 lg:pl-12">
            <div className="hidden md:flex items-center gap-2 text-white/90 text-sm font-semibold mr-1">
              <span>Keunggulan:</span>
            </div>
            {[
              { id: 'mikro', text: 'Kredit Mikro', icon: Briefcase },
              { id: 'bunga', text: 'Bunga Ringan', icon: Percent },
              { id: 'cepat', text: 'Proses Cepat', icon: Clock },
              { id: 'jaminan', text: 'Tanpa Jaminan', icon: ShieldCheck }
            ].map((item) => {
              const isActive = activeFilter === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveFilter(isActive ? null : item.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[11px] md:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(255,255,255,0.15)] group ${
                    isActive
                      ? 'bg-white text-blue-600 border border-white shadow-[0_4px_16px_rgba(255,255,255,0.25)]'
                      : 'bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 text-white'
                  }`}
                >
                  <item.icon className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-colors ${isActive ? 'text-blue-600' : 'text-blue-200 group-hover:text-white'}`} />
                  {item.text}
                </div>
              );
            })}
          </div>

          {/* --- ACTIVE FILTER STATUS & RESET BUTTON --- */}
          {activeFilter && (
            <div className="relative z-10 mt-4 md:ml-8 lg:ml-12 flex items-center justify-between bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-2xl max-w-lg transition-all animate-fadeIn">
              <div className="flex items-center gap-2 text-white/95 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span>Filter aktif: </span>
                <span className="bg-white/25 px-2 py-0.5 rounded-md text-white font-bold tracking-wide uppercase text-[10px]">
                  {activeFilter === 'mikro' && 'Kredit Mikro'}
                  {activeFilter === 'bunga' && 'Bunga Ringan'}
                  {activeFilter === 'cepat' && 'Proses Cepat'}
                  {activeFilter === 'jaminan' && 'Tanpa Jaminan'}
                </span>
              </div>
              <button
                onClick={() => setActiveFilter(null)}
                className="text-[10px] md:text-xs font-bold text-white hover:text-red-200 underline transition-colors cursor-pointer bg-transparent border-none uppercase tracking-wider"
              >
                Hapus Filter
              </button>
            </div>
          )}
        </div>

        {/* --- WARNING BANNER UNDER SECTION 1 --- */}
        {pendingDocsCount > 0 && (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-300/60 rounded-3xl p-4 flex items-center justify-between gap-4 shadow-sm backdrop-blur-md animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-200">
                <Clock size={20} className="animate-spin text-amber-500" style={{ animationDuration: '4s' }} />
              </div>
              <div>
                <p className="text-sm font-black text-amber-800 leading-snug">Berkas Sedang Ditinjau Admin</p>
                <p className="text-xs text-amber-700/80 mt-0.5 font-semibold">Ada {pendingDocsCount} dokumen yang saat ini dalam proses audit. Fitur pengajuan modal dikunci sementara hingga disetujui Admin.</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/profile?panel=dokumen')}
              className="flex-shrink-0 px-4.5 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-amber-600/10 cursor-pointer"
            >
              Lihat Status Berkas
            </button>
          </div>
        )}

        {/* --- KOTAK 2: SECTION REKOMENDASI KARTU --- */}
        <div className="bg-white dark:bg-gray-800 rounded-[40px] p-8 mt-8">
            {(() => {
              const filteredBanks = banks.filter(bank => {
                // 1. Pencarian Kata Kunci
                const query = searchTerm.toLowerCase();
                const matchesSearch = bank.nama_bank.toLowerCase().includes(query) ||
                                      bank.nama_produk.toLowerCase().includes(query) ||
                                      (bank.deskripsi || '').toLowerCase().includes(query);
                
                if (!matchesSearch) return false;

                // 2. Penyaringan Kategori Filter
                if (activeFilter === 'mikro') {
                  return bank.plafon_max <= 50000000;
                }
                if (activeFilter === 'bunga') {
                  return bank.bunga_persen <= 0.6;
                }
                if (activeFilter === 'cepat') {
                  const desc = (bank.deskripsi || '').toLowerCase();
                  const prod = (bank.nama_produk || '').toLowerCase();
                  return desc.includes('cepat') || prod.includes('super mikro') || prod.includes('kta');
                }
                if (activeFilter === 'jaminan') {
                  const desc = (bank.deskripsi || '').toLowerCase();
                  const prod = (bank.nama_produk || '').toLowerCase();
                  return desc.includes('tanpa jaminan') || desc.includes('tanpa agunan') || prod.includes('kta');
                }

                return true;
              });

              const banksByCategory = filteredBanks.reduce((acc, bank) => {
                const key = (bank.category_name || bank.category || 'terdaftar').toLowerCase();
                if (!acc[key]) {
                  acc[key] = {
                    rows: [],
                    sortOrder: Number(bank.category_sort_order ?? 999),
                    slug: (bank.category_slug || '').toLowerCase(),
                  };
                }
                acc[key].rows.push(bank);
                acc[key].sortOrder = Math.min(acc[key].sortOrder, Number(bank.category_sort_order ?? 999));
                return acc;
              }, {});

              const sortedCategoryEntries = Object.entries(banksByCategory)
                .map(([category, data]) => ({
                  category,
                  rows: [...data.rows].sort((a, b) => b.skor_kecocokan - a.skor_kecocokan),
                  sortOrder: data.sortOrder,
                  slug: data.slug,
                }))
                .sort((a, b) => {
                  const sortOrderDiff = a.sortOrder - b.sortOrder;
                  if (sortOrderDiff !== 0) return sortOrderDiff;
                  return a.category.localeCompare(b.category);
                });

              if (filteredBanks.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1A1A1A] dark:text-white mb-2">Bank tidak ditemukan</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">Coba gunakan kata kunci lain untuk mencari mitra bank.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-12">
                  {sortedCategoryEntries.map(({ category, rows }) => (
                    <BankCarousel
                      key={category}
                      title={formatCategoryTitle(category)}
                      banks={rows}
                      setActiveBank={setActiveBank}
                      goAjukan={goAjukan}
                      pendingDocsCount={pendingDocsCount}
                    />
                  ))}
                </div>
              );
            })()}
        </div>
      </div>
    </>
  );
};

export default CariModal;