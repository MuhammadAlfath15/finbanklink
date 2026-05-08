import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Target, AlertTriangle, TrendingUp, Info, ChevronRight, CheckCircle2 } from 'lucide-react';

const getScoreColor = (val) => val < 60 ? '#EF4444' : '#3B82F6';

const METRICS = [
  { name: 'Profitabilitas',  value: 82, minBank: 60, color: getScoreColor(82) },
  { name: 'Legalitas',       value: 45, minBank: 60, color: getScoreColor(45) },
  { name: 'Tren Omzet',      value: 88, minBank: 60, color: getScoreColor(88) },
  { name: 'Kolektibilitas',  value: 90, minBank: 60, color: getScoreColor(90) },
  { name: 'Keberlanjutan',   value: 60, minBank: 60, color: getScoreColor(60) },
  { name: 'Kapasitas Utang', value: 70, minBank: 60, color: getScoreColor(70) },
];
const TOTAL = METRICS.reduce((s, m) => s + m.value, 0); // 435

// ── Donut Chart ───────────────────────────────────────────────────────────────
function DonutChart() {
  const cx = 175, cy = 145, R = 78, innerR = 48;
  const toXY = (r, angle) => ({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });

  const arcPath = (r1, r2, a1, a2) => {
    const p1 = toXY(r1, a1), p2 = toXY(r1, a2);
    const p3 = toXY(r2, a2), p4 = toXY(r2, a1);
    const lg = a2 - a1 > Math.PI ? 1 : 0;
    return `M${p1.x.toFixed(1)},${p1.y.toFixed(1)} A${r1},${r1} 0 ${lg},1 ${p2.x.toFixed(1)},${p2.y.toFixed(1)} L${p3.x.toFixed(1)},${p3.y.toFixed(1)} A${r2},${r2} 0 ${lg},0 ${p4.x.toFixed(1)},${p4.y.toFixed(1)} Z`;
  };

  let cum = -Math.PI / 2;
  const segments = METRICS.map(m => {
    const angle = (m.value / TOTAL) * 2 * Math.PI;
    const s = { ...m, startAngle: cum, endAngle: cum + angle, midAngle: cum + angle / 2 };
    cum += angle;
    return s;
  });

  return (
    <svg viewBox="0 0 350 285" className="w-full max-w-[350px] md:max-w-[380px] mx-auto drop-shadow-sm scale-105 transition-transform duration-300">
      {segments.map((s, i) => {
        const mid = s.midAngle;
        const lineStart = toXY(R + 3, mid);
        const lineEnd   = toXY(R + 18, mid);
        const labelPt   = toXY(R + 26, mid);
        const anchor    = labelPt.x < cx - 5 ? 'end' : labelPt.x > cx + 5 ? 'start' : 'middle';
        return (
          <g key={i}>
            <path d={arcPath(R, innerR, s.startAngle, s.endAngle)} fill={s.color} stroke="white" strokeWidth="1.5" className="hover:opacity-80 transition-opacity" />
            <line x1={lineStart.x} y1={lineStart.y} x2={lineEnd.x} y2={lineEnd.y} stroke={s.color} strokeWidth="1.5" opacity="0.4" />
            <text x={labelPt.x} y={labelPt.y - 4} textAnchor={anchor} fontSize="10.5" fontWeight="600" fill="#6B7280">{s.name}</text>
            <text x={labelPt.x} y={labelPt.y + 9} textAnchor={anchor} fontSize="12" fontWeight="900" fill={s.color}>{s.value}</text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={innerR - 2} fill="white" />
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="32" fontWeight="900" fill="#1e3a5f">{TOTAL}</text>
    </svg>
  );
}

// ── Radar Chart ───────────────────────────────────────────────────────────────
function RadarChart({ showBank = false }) {
  const cx = 105, cy = 105, R = 72, N = 6;
  const angle = i => -Math.PI / 2 + i * (2 * Math.PI / N);
  const toXY  = (r, i) => ({ x: cx + r * Math.cos(angle(i)), y: cy + r * Math.sin(angle(i)) });
  const poly  = pts => pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const gridLevels = [20, 40, 60, 80, 100];
  const userPoly   = poly(METRICS.map((m, i) => toXY(R * m.value / 100, i)));
  const bankPoly   = poly(METRICS.map((m, i) => toXY(R * m.minBank / 100, i)));
  const axisLabels = ['Profitabilitas', 'Legalitas', 'Tren Omzet', 'Kolektibilitas', 'Keberlanjutan', 'Kapasitas utang'];
  const labelLevel = [20, 40, 60];

  return (
    <svg viewBox="0 0 210 210" className="w-full drop-shadow-sm overflow-visible">
      {gridLevels.map(lv => (
        <polygon key={lv} points={poly(METRICS.map((_, i) => toXY(R * lv / 100, i)))}
          fill="none" stroke="#E5E7EB" strokeWidth="0.8" strokeDasharray={lv === 100 ? "" : "2 2"} />
      ))}
      {METRICS.map((_, i) => {
        const end = toXY(R, i);
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#E5E7EB" strokeWidth="0.8" />;
      })}
      {labelLevel.map(lv => (
        <text key={lv} x={cx + 2} y={cy - R * lv / 100 + 3} fontSize="5" fontWeight="600" fill="#9CA3AF">{lv}</text>
      ))}
      <polygon points={bankPoly} fill="#FECACA" fillOpacity="0.4" stroke="#EF4444" strokeWidth="1" />
      {showBank && (
        <polygon points={userPoly} fill="#818CF8" fillOpacity="0.5" stroke="#6366f1" strokeWidth="1.5" />
      )}
      {axisLabels.map((name, i) => {
        const pt = toXY(R + 18, i);
        const cos = Math.cos(angle(i));
        const anchor = cos > 0.2 ? 'start' : cos < -0.2 ? 'end' : 'middle';
        return <text key={i} x={pt.x} y={pt.y + 2} textAnchor={anchor} fontSize="7" fontWeight="700" fill="#4B5563">{name}</text>;
      })}
    </svg>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function KesehatanBisnis() {
  const [tab, setTab] = useState('update');
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 font-sans">
      
      {/* HEADER / HERO SECTION */}
      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-70 pointer-events-none" />
        
        <div className="flex-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
            <Activity size={14} /> Ringkasan Performa
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Skor Kesehatan Bisnis
          </h1>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-lg mb-8">
            Skor ini mengevaluasi kesiapan dan kelayakan bisnis Anda untuk mendapatkan pendanaan. Tingkatkan skor Anda di atas standar bank untuk memperbesar peluang persetujuan.
          </p>
          
          <div className="flex flex-wrap items-center gap-6">
            <div className="bg-gradient-to-br from-[#60A5FA] to-blue-600 p-5 rounded-2xl text-white shadow-lg shadow-blue-200/50 min-w-[160px]">
              <span className="block text-blue-100 text-[10px] font-bold mb-1 uppercase tracking-wider">Total Skor Anda</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-black leading-none">{TOTAL}</span>
                <span className="text-blue-200 text-sm font-semibold">/ 600</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 border-l border-gray-100 pl-6 py-1">
              <div className="flex items-center gap-2.5 text-sm">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <span className="text-gray-700 font-semibold">Kolektibilitas Sangat Baik</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <AlertTriangle size={18} className="text-amber-500" />
                <span className="text-gray-700 font-semibold">Legalitas Perlu Perhatian</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-auto flex-shrink-0 relative z-10 bg-white/60 backdrop-blur-md p-4 rounded-3xl border border-gray-100 shadow-sm">
          <DonutChart />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        
        {/* LEFT COLUMN: Rekomendasi */}
        <div className="flex-1 w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col min-h-[500px]">
           <div className="flex items-center justify-between mb-8 flex-shrink-0">
             <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">
               Rekomendasi Perbaikan
             </h2>
             <span className="hidden sm:inline-block px-3 py-1 bg-gray-50 rounded-lg text-xs font-bold text-gray-400 uppercase tracking-wider">
               {tab === 'analisis' ? 'Detail Analisis' : 'Butuh Update'}
             </span>
           </div>

           <div className="relative flex-1">
             <div className="absolute inset-0 overflow-y-auto pr-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
               {tab === 'update' ? (
                 <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200 p-6">
               <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-5">
                 <Target size={36} />
               </div>
               <h3 className="text-xl text-gray-900 font-extrabold mb-3">Data Belum Lengkap?</h3>
               <p className="text-sm text-gray-500 max-w-sm mb-8 leading-relaxed">
                 Perbarui dokumen dan data keuangan Anda secara berkala agar hasil analisis selalu akurat dan terpercaya oleh bank.
               </p>
               <button onClick={() => navigate('/update-bisnis')} className="px-8 py-3.5 bg-[#60A5FA] text-white text-sm font-bold rounded-full hover:bg-blue-500 hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-200">
                 Update Data Sekarang
               </button>
               
               <p className="mt-6 text-xs text-gray-400">
                 Atau <button onClick={() => setTab('analisis')} className="text-blue-500 font-semibold hover:underline">lihat hasil analisis</button> data saat ini
               </p>
             </div>
           ) : (
             <div className="space-y-4">
                {METRICS.map((m, i) => (
                  <div key={i} className="p-5 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-md hover:shadow-blue-50/50 transition-all bg-white group">
                    <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: m.color }} />
                        <h3 className="font-extrabold text-gray-900 text-lg">{m.name}</h3>
                      </div>
                      <div className="px-3 py-1.5 rounded-lg text-sm font-black" style={{ backgroundColor: `${m.color}15`, color: m.color }}>
                        Skor: {m.value}
                      </div>
                    </div>
                    
                    <div className="pl-7 space-y-3">
                      <div className="flex items-start gap-3">
                        <Info size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-600 leading-relaxed">
                          <span className="font-bold text-gray-800">Analisis:</span> {
                            i === 0 ? "Margin keuntungan stabil, namun masih ada ruang untuk optimalisasi operasional." :
                            i === 1 ? "Dokumen pendirian lengkap, tapi NIB belum diunggah." :
                            i === 2 ? "Omzet menunjukkan tren positif selama 3 bulan terakhir." :
                            i === 3 ? "Riwayat pembayaran cicilan lancar tanpa tunggakan." :
                            i === 4 ? "Umur bisnis mencukupi, namun kontrak tempat usaha hampir habis." :
                            "Rasio hutang terhadap pendapatan masih dalam batas aman bank."
                          }
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <TrendingUp size={16} className="text-[#60A5FA] mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-600 leading-relaxed">
                          <span className="font-bold text-gray-800">Saran:</span> {
                            i === 0 ? "Coba lakukan audit kecil pada pengeluaran variabel untuk meningkatkan margin bersih Anda." :
                            i === 1 ? "Segera unggah NIB terbaru Anda di halaman Update Data." :
                            i === 2 ? "Pertahankan strategi marketing saat ini untuk menjaga tren positif." :
                            i === 3 ? "Jaga kedisiplinan pembayaran ini untuk mempermudah persetujuan kredit." :
                            i === 4 ? "Segera perpanjang kontrak sewa atau unggah bukti kepemilikan." :
                            "Hindari mengambil cicilan baru sebelum pinjaman ini disetujui."
                          }
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

        {/* RIGHT COLUMN: Radar & Stats Panel */}
        <div className="w-full lg:w-[360px] flex-shrink-0 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex-1 flex flex-col">
            
            {/* iOS Style Segmented Control */}
            <div className="flex p-1.5 bg-gray-100/80 rounded-2xl mb-8">
              <button
                onClick={() => navigate('/update-bisnis')}
                className={`flex-1 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all ${
                  tab === 'update' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Update Data
              </button>
              <button
                onClick={() => setTab('analisis')}
                className={`flex-1 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all ${
                  tab === 'analisis' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Analisis
              </button>
            </div>

            {/* Radar Chart */}
            <div className="bg-gray-50/50 rounded-3xl p-5 mb-8 border border-gray-100 flex flex-col items-center">
              <RadarChart showBank={tab === 'analisis'} />
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

            {/* List */}
            <div className="space-y-1">
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-2 mb-3">Ringkasan Metrik</h3>
              {METRICS.map((m, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: m.color }} />
                    <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">{m.name}</span>
                  </div>
                  {tab === 'analisis' ? (
                     <span className="text-base font-black" style={{ color: m.color }}>{m.value}</span>
                  ) : (
                     <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
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