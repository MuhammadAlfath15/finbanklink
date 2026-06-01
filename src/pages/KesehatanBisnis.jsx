import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Target, AlertTriangle, TrendingUp,
  Info, ChevronRight, CheckCircle2, Loader2, RefreshCw
} from 'lucide-react';
import { getBusinessProfile } from '../services/api';

// ── Helpers ───────────────────────────────────────────────────────────────────
const scoreColor = (v) => v >= 70 ? '#10B981' : v >= 50 ? '#F59E0B' : '#EF4444';
const MIN_BANK = 60;

const METRIC_KEYS = [
  { key: 'skor_profitabilitas', label: 'Profitabilitas' },
  { key: 'skor_legalitas', label: 'Legalitas' },
  { key: 'skor_tren_omzet', label: 'Tren Omzet' },
  { key: 'skor_kolektibilitas', label: 'Kolektibilitas' },
  { key: 'skor_keberlanjutan', label: 'Keberlanjutan' },
  { key: 'skor_kapasitas_utang', label: 'Kapasitas Utang' },
];

const ANALYSIS = [
  {
    getAnalysis: (bp) => bp.skor_profitabilitas >= 70
      ? 'Margin keuntungan stabil dan rekening koran sudah terlampir.'
      : bp.has_rekening
        ? 'Rekening koran ada, tapi omzet perlu ditingkatkan.'
        : 'Rekening koran belum diunggah — profitabilitas sulit dinilai bank.',
    getSaran: (bp) => bp.skor_profitabilitas >= 70
      ? 'Pertahankan konsistensi omzet dan coba audit pengeluaran variabel.'
      : 'Unggah rekening koran 3 bulan dan perbarui data omzet bulan ini.',
  },
  {
    getAnalysis: (bp) => {
      if (bp.has_nib && bp.has_npwp) return 'Dokumen legalitas lengkap (NIB & NPWP sudah ada).';
      if (bp.has_nib) return 'NIB sudah ada, tapi NPWP belum diunggah.';
      if (bp.has_npwp) return 'NPWP sudah ada, tapi NIB belum diunggah.';
      return 'NIB dan NPWP belum diunggah — legalitas sangat rendah.';
    },
    getSaran: (bp) => {
      if (bp.has_nib && bp.has_npwp) return 'Pastikan dokumen masih berlaku dan perbarui jika expired.';
      return 'Segera unggah NIB dan NPWP di Profil → Dokumen Legalitas.';
    },
  },
  {
    getAnalysis: (bp) => bp.skor_tren_omzet >= 70
      ? 'Data omzet menunjukkan tren positif selama beberapa bulan terakhir.'
      : 'Data omzet belum cukup untuk menilai tren secara akurat.',
    getSaran: (bp) => bp.skor_tren_omzet >= 70
      ? 'Pertahankan strategi marketing dan catat omzet tiap bulan.'
      : 'Perbarui data omzet tiap bulan agar tren bisa terbaca dengan baik.',
  },
  {
    getAnalysis: (bp) => bp.skor_kolektibilitas >= 70
      ? 'Riwayat pembayaran cicilan bersih, tidak ada indikasi tunggakan.'
      : 'Rasio cicilan cukup tinggi atau belum ada bukti pelunasan.',
    getSaran: (bp) => bp.skor_kolektibilitas >= 70
      ? 'Jaga kedisiplinan pembayaran untuk memudahkan persetujuan kredit.'
      : 'Unggah bukti pelunasan utang lama untuk meningkatkan kolektibilitas.',
  },
  {
    getAnalysis: (bp) => {
      if (bp.has_foto_usaha && bp.has_kontrak) return 'Foto usaha dan kontrak sewa sudah ada — bisnis terbukti beroperasi.';
      if (bp.has_foto_usaha) return 'Foto usaha ada, tapi kontrak sewa/kepemilikan belum diunggah.';
      return 'Bukti fisik usaha (foto & kontrak) belum ada.';
    },
    getSaran: (bp) => {
      if (bp.has_foto_usaha && bp.has_kontrak) return 'Perbarui foto jika ada perubahan tempat usaha.';
      return 'Unggah foto tampak depan usaha dan kontrak sewa/kepemilikan.';
    },
  },
  {
    getAnalysis: (bp) => bp.skor_kapasitas_utang >= 70
      ? 'Rasio hutang terhadap pendapatan masih dalam batas aman bank.'
      : 'Cicilan berjalan cukup besar relatif terhadap omzet.',
    getSaran: (bp) => bp.skor_kapasitas_utang >= 70
      ? 'Hindari mengambil cicilan baru sebelum pinjaman ini disetujui.'
      : 'Coba lunasi cicilan berjalan terlebih dahulu, atau tingkatkan omzet.',
  },
];

// ── Donut Chart ───────────────────────────────────────────────────────────────
function DonutChart({ metrics, total }) {
  const cx = 175, cy = 145, R = 78, innerR = 48;
  const TOTAL_MAX = metrics.length * 100; // 600
  const toXY = (r, a) => ({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });

  const arcPath = (r1, r2, a1, a2) => {
    const p1 = toXY(r1, a1), p2 = toXY(r1, a2);
    const p3 = toXY(r2, a2), p4 = toXY(r2, a1);
    const lg = a2 - a1 > Math.PI ? 1 : 0;
    return `M${p1.x.toFixed(1)},${p1.y.toFixed(1)} A${r1},${r1} 0 ${lg},1 ${p2.x.toFixed(1)},${p2.y.toFixed(1)} L${p3.x.toFixed(1)},${p3.y.toFixed(1)} A${r2},${r2} 0 ${lg},0 ${p4.x.toFixed(1)},${p4.y.toFixed(1)} Z`;
  };

  let cum = -Math.PI / 2;
  const totalVal = metrics.reduce((s, m) => s + m.value, 0) || 1;
  const segments = metrics.map(m => {
    const angle = (m.value / totalVal) * 2 * Math.PI;
    const s = { ...m, startAngle: cum, endAngle: cum + angle, midAngle: cum + angle / 2 };
    cum += angle;
    return s;
  });

  return (
    <svg viewBox="0 0 350 285" className="w-full max-w-[350px] md:max-w-[380px] mx-auto drop-shadow-sm">
      {segments.map((s, i) => {
        if (s.value <= 0) return null; // Sembunyikan label kalau value 0 biar nggak numpuk

        const mid = s.midAngle;
        const lineStart = toXY(R + 3, mid);
        const lineEnd = toXY(R + 18, mid);
        const labelPt = toXY(R + 32, mid);
        const anchor = labelPt.x < cx - 10 ? 'end' : labelPt.x > cx + 10 ? 'start' : 'middle';
        return (
          <g key={i}>
            <path d={arcPath(R, innerR, s.startAngle, s.endAngle)} fill={s.color} stroke="white" strokeWidth="1.5" className="hover:opacity-80 transition-opacity" />
            <line x1={lineStart.x} y1={lineStart.y} x2={lineEnd.x} y2={lineEnd.y} stroke={s.color} strokeWidth="1.5" opacity="0.4" />
            <text x={labelPt.x} y={labelPt.y - 6} textAnchor={anchor} fontSize="10" fontWeight="700" fill="#4B5563">{s.name}</text>
            <text x={labelPt.x} y={labelPt.y + 7} textAnchor={anchor} fontSize="11" fontWeight="900" fill={s.color}>{s.value}</text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={innerR - 2} fill="white" />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="28" fontWeight="900" fill="#1e3a5f">{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="#9CA3AF">/ {TOTAL_MAX}</text>
    </svg>
  );
}

// ── Radar Chart ───────────────────────────────────────────────────────────────
function RadarChart({ metrics, showUser }) {
  const cx = 105, cy = 105, R = 72, N = 6;
  const angle = i => -Math.PI / 2 + i * (2 * Math.PI / N);
  const toXY = (r, i) => ({ x: cx + r * Math.cos(angle(i)), y: cy + r * Math.sin(angle(i)) });
  const poly = pts => pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const gridLevels = [20, 40, 60, 80, 100];
  const userPoly = poly(metrics.map((m, i) => toXY(R * m.value / 100, i)));
  const bankPoly = poly(metrics.map((_, i) => toXY(R * MIN_BANK / 100, i)));

  return (
    <svg viewBox="0 0 210 210" className="w-full drop-shadow-sm overflow-visible">
      {gridLevels.map(lv => (
        <polygon key={lv} points={poly(metrics.map((_, i) => toXY(R * lv / 100, i)))}
          fill="none" stroke="#E5E7EB" strokeWidth="0.8" strokeDasharray={lv === 100 ? '' : '2 2'} />
      ))}
      {metrics.map((_, i) => {
        const end = toXY(R, i);
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#E5E7EB" strokeWidth="0.8" />;
      })}
      {[20, 40, 60].map(lv => (
        <text key={lv} x={cx + 2} y={cy - R * lv / 100 + 3} fontSize="5" fontWeight="600" fill="#9CA3AF">{lv}</text>
      ))}
      <polygon points={bankPoly} fill="#FECACA" fillOpacity="0.4" stroke="#EF4444" strokeWidth="1" />
      {showUser && (
        <polygon points={userPoly} fill="#818CF8" fillOpacity="0.5" stroke="#6366f1" strokeWidth="1.5" />
      )}
      {metrics.map((m, i) => {
        const pt = toXY(R + 18, i);
        const cos = Math.cos(angle(i));
        const anchor = cos > 0.2 ? 'start' : cos < -0.2 ? 'end' : 'middle';
        return <text key={i} x={pt.x} y={pt.y + 2} textAnchor={anchor} fontSize="7" fontWeight="700" fill="#4B5563">{m.name}</text>;
      })}
    </svg>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function KesehatanBisnis() {
  const [tab, setTab] = useState('update');
  const [bp, setBp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getBusinessProfile();
      setBp(data);
    } catch (e) {
      setError('Gagal memuat data. Pastikan kamu sudah login.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Bangun array metrik dari data BP
  const metrics = bp
    ? METRIC_KEYS.map(({ key, label }) => ({
      name: label,
      value: bp[key] ?? 0,
      color: scoreColor(bp[key] ?? 0),
      minBank: MIN_BANK,
    }))
    : METRIC_KEYS.map(({ label }) => ({ name: label, value: 0, color: '#E5E7EB', minBank: MIN_BANK }));

  const total = bp?.skor_total ?? 0;

  // Temukan metrik terbaik dan terburuk
  const best = bp ? metrics.reduce((a, b) => a.value > b.value ? a : b) : null;
  const worst = bp ? metrics.reduce((a, b) => a.value < b.value ? a : b) : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 font-sans">

      {/* HERO */}
      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-70 pointer-events-none" />

        <div className="flex-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
            <Activity size={14} /> Ringkasan Performa
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Skor Kesehatan Bisnis
          </h1>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-lg mb-8">
            Skor ini mengevaluasi kesiapan bisnis Anda untuk mendapatkan pendanaan. Tingkatkan skor di atas standar bank untuk memperbesar peluang persetujuan.
          </p>

          {loading ? (
            <div className="flex items-center gap-3 text-blue-400">
              <Loader2 size={24} className="animate-spin" />
              <span className="text-sm font-semibold">Memuat data bisnis...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className="text-red-400" />
              <span className="text-sm text-red-500">{error}</span>
              <button onClick={load} className="flex items-center gap-1 text-blue-500 text-sm font-semibold hover:underline">
                <RefreshCw size={14} /> Coba lagi
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-6">
              <div className="bg-gradient-to-br from-[#60A5FA] to-blue-600 p-5 rounded-2xl text-white shadow-lg shadow-blue-200/50 min-w-[160px]">
                <span className="block text-blue-100 text-[10px] font-bold mb-1 uppercase tracking-wider">Total Skor Anda</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black leading-none">{total}</span>
                  <span className="text-blue-100 text-xs font-bold opacity-80">/ 600</span>
                </div>
                <div className="mt-2 h-1.5 bg-blue-400/40 rounded-full overflow-hidden">
                  <div className="h-full bg-white/80 rounded-full transition-all duration-700" style={{ width: `${(total / 600) * 100}%` }} />
                </div>
              </div>

              <div className="flex flex-col gap-3 border-l border-gray-100 pl-6 py-1">
                {best && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    <span className="text-gray-700 font-semibold">{best.name} Terbaik ({best.value})</span>
                  </div>
                )}
                {worst && worst.value < MIN_BANK && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <AlertTriangle size={18} className="text-amber-500" />
                    <span className="text-gray-700 font-semibold">{worst.name} Perlu Perhatian ({worst.value})</span>
                  </div>
                )}
                {bp?.updated_at && (
                  <p className="text-xs text-gray-400">
                    Update: {new Date(bp.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-full md:w-auto flex-shrink-0 relative z-10 bg-white/60 backdrop-blur-md p-4 rounded-3xl border border-gray-100 shadow-sm">
          {loading ? (
            <div className="w-[300px] h-[240px] flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-blue-300" />
            </div>
          ) : (
            <DonutChart metrics={metrics} total={total} />
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-stretch">

        {/* LEFT: Rekomendasi */}
        <div className="flex-1 w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-8 flex-shrink-0">
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">Rekomendasi Perbaikan</h2>
            <span className="hidden sm:inline-block px-3 py-1 bg-gray-50 rounded-lg text-xs font-bold text-gray-400 uppercase tracking-wider">
              {tab === 'analisis' ? 'Detail Analisis' : 'Butuh Update'}
            </span>
          </div>

          <div className="relative flex-1">
            <div className="absolute inset-0 overflow-y-auto pr-3">
              {tab === 'update' ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200 p-6">
                  <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-5">
                    <Target size={36} />
                  </div>
                  <h3 className="text-xl text-gray-900 font-extrabold mb-3">Input datamu disini</h3>
                  <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed">
                    Perbarui dokumen dan data keuangan Anda secara berkala agar hasil analisis selalu akurat dan terpercaya oleh bank.
                  </p>
                  <button onClick={() => navigate('/profile?panel=dokumen')} className="px-8 py-3.5 bg-[#60A5FA] text-white text-sm font-bold rounded-full hover:bg-blue-500 hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-200">
                    Input dokumen &amp; data di Profil
                  </button>
                  <p className="mt-6 text-xs text-gray-400">
                    Atau <button onClick={() => setTab('analisis')} className="text-blue-500 font-semibold hover:underline">lihat hasil analisis</button> data saat ini
                  </p>
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={28} className="animate-spin text-blue-300" />
                </div>
              ) : (
                <div className="space-y-4">
                  {metrics.map((m, i) => (
                    <div key={i} className="p-5 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all bg-white group">
                      <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: m.color }} />
                          <h3 className="font-extrabold text-gray-900 text-lg">{m.name}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${m.value}%`, backgroundColor: m.color }} />
                          </div>
                          <div className="px-3 py-1.5 rounded-lg text-sm font-black" style={{ backgroundColor: `${m.color}15`, color: m.color }}>
                            {m.value}
                          </div>
                        </div>
                      </div>
                      <div className="pl-7 space-y-3">
                        <div className="flex items-start gap-3">
                          <Info size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-600 leading-relaxed">
                            <span className="font-bold text-gray-800">Analisis: </span>
                            {bp ? ANALYSIS[i].getAnalysis(bp) : '—'}
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <TrendingUp size={16} className="text-[#60A5FA] mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-600 leading-relaxed">
                            <span className="font-bold text-gray-800">Saran: </span>
                            {bp ? ANALYSIS[i].getSaran(bp) : '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Radar & Stats */}
        <div className="w-full lg:w-[360px] flex-shrink-0 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex-1 flex flex-col">

            {/* Segmented Control */}
            <div className="flex p-1.5 bg-gray-100/80 rounded-2xl mb-8">
              <button
                onClick={() => setTab(tab === 'analisis' ? 'update' : 'analisis')}
                className={`flex-1 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all ${tab === 'analisis' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Analisis
              </button>
            </div>

            {/* Radar */}
            <div className="bg-gray-50/50 rounded-3xl p-5 mb-8 border border-gray-100 flex flex-col items-center">
              {loading ? (
                <div className="w-full h-[210px] flex items-center justify-center">
                  <Loader2 size={24} className="animate-spin text-blue-300" />
                </div>
              ) : (
                <RadarChart metrics={metrics} showUser={tab === 'analisis'} />
              )}
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1.5 bg-red-400 rounded-full" />
                  <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Standar Bank</span>
                </div>
                {tab === 'analisis' && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1.5 bg-indigo-500 rounded-full" />
                    <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Bisnis Anda</span>
                  </div>
                )}
              </div>
            </div>

            {/* List Metrik */}
            <div className="space-y-1">
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-2 mb-3">Ringkasan Metrik</h3>
              {metrics.map((m, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                    <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">{m.name}</span>
                  </div>
                  {tab === 'analisis' ? (
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-14 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${m.value}%`, backgroundColor: m.color }} />
                      </div>
                      <span className="text-base font-black w-8 text-right" style={{ color: m.color }}>{m.value}</span>
                    </div>
                  ) : (
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-400" />
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}