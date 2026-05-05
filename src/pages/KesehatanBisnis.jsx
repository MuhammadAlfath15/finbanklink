import React, { useState } from 'react';

const METRICS = [
  { name: 'Profitabilitas',  value: 82, minBank: 60, color: '#818CF8' },
  { name: 'Legalitas',       value: 45, minBank: 70, color: '#F87171' },
  { name: 'Tren Omzet',      value: 88, minBank: 50, color: '#2DD4BF' },
  { name: 'Kolektibilitas',  value: 90, minBank: 65, color: '#FB923C' },
  { name: 'Keberlanjutan',   value: 60, minBank: 55, color: '#4ADE80' },
  { name: 'Kapasitas Utang', value: 70, minBank: 60, color: '#34D399' },
];
const TOTAL = METRICS.reduce((s, m) => s + m.value, 0); // 435

// ── Donut Chart ───────────────────────────────────────────────────────────────
function DonutChart() {
  const cx = 165, cy = 145, R = 72, innerR = 44;
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
    <svg viewBox="0 0 350 285" className="w-full max-w-xs mx-auto">
      {segments.map((s, i) => {
        const mid = s.midAngle;
        const lineStart = toXY(R + 4, mid);
        const lineEnd   = toXY(R + 36, mid);
        const labelPt   = toXY(R + 52, mid);
        const anchor    = labelPt.x < cx - 5 ? 'end' : labelPt.x > cx + 5 ? 'start' : 'middle';
        return (
          <g key={i}>
            <path d={arcPath(R, innerR, s.startAngle, s.endAngle)} fill={s.color} />
            <line x1={lineStart.x} y1={lineStart.y} x2={lineEnd.x} y2={lineEnd.y} stroke={s.color} strokeWidth="1" />
            <text x={labelPt.x} y={labelPt.y - 5} textAnchor={anchor} fontSize="8" fill="#6B7280">{s.name}</text>
            <text x={labelPt.x} y={labelPt.y + 6} textAnchor={anchor} fontSize="9" fontWeight="700" fill={s.color}>{s.value}</text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={innerR - 2} fill="white" />
      <text x={cx} y={cy + 9} textAnchor="middle" fontSize="26" fontWeight="800" fill="#1e3a5f">{TOTAL}</text>
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
    <svg viewBox="0 0 210 210" className="w-full">
      {gridLevels.map(lv => (
        <polygon key={lv} points={poly(METRICS.map((_, i) => toXY(R * lv / 100, i)))}
          fill="none" stroke="#E5E7EB" strokeWidth="0.6" />
      ))}
      {METRICS.map((_, i) => {
        const end = toXY(R, i);
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#E5E7EB" strokeWidth="0.6" />;
      })}
      {labelLevel.map(lv => (
        <text key={lv} x={cx + 2} y={cy - R * lv / 100 + 3} fontSize="5" fill="#9CA3AF">{lv}</text>
      ))}
      <polygon points={bankPoly} fill="#BFDBFE" fillOpacity="0.35" stroke="#3B82F6" strokeWidth="0.8" />
      {showBank && (
        <polygon points={userPoly} fill="#818CF8" fillOpacity="0.45" stroke="#818CF8" strokeWidth="1.5" />
      )}
      {axisLabels.map((name, i) => {
        const pt = toXY(R + 16, i);
        const cos = Math.cos(angle(i));
        const anchor = cos > 0.2 ? 'start' : cos < -0.2 ? 'end' : 'middle';
        return <text key={i} x={pt.x} y={pt.y + 2} textAnchor={anchor} fontSize="6" fill="#6B7280">{name}</text>;
      })}
    </svg>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function KesehatanBisnis() {
  const [tab, setTab] = useState('update');

  return (
    <div className="flex gap-6 font-sans items-start">

      {/* ── Kiri: Donut + Rekomendasi ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-5">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
          <DonutChart />
          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-1">
            {METRICS.map((m, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: m.color }} />
                <span className="text-[10px] text-gray-500">{m.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rekomendasi Perbaikan - capped height, isi scroll */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-2xl font-extrabold text-gray-900">Rekomendasi Perbaikan</h2>
          {tab === 'analisis' && (
            <div className="mt-5 space-y-4 max-h-[110px] overflow-y-auto pr-1">
              {METRICS.map((m, i) => (
                <div key={i}>
                  <p className="text-sm font-bold text-gray-800">
                    {i + 1}. {m.name} (Skor: {m.value} -{' '}
                    <span style={{ color: m.color }}>
                      {m.value >= 80 ? 'Sangat Bagus' : m.value >= 65 ? 'Bagus' : 'Perlu Perbaikan'}
                    </span>)
                  </p>
                  <p className="text-xs text-gray-500 mt-1 ml-3">
                    Analisis: Margin keuntungan sudah sehat, namun masih ada ruang untuk optimalisasi.
                  </p>
                  <p className="text-xs text-gray-500 ml-3">
                    Rekomendasi: &quot;Pertahankan efisiensi biaya operasional Anda.&quot;
                  </p>
                  <p className="text-[10px] text-gray-400 italic ml-3 mt-0.5">
                    *Coba lakukan audit kecil pada pengeluaran variabel untuk meningkatkan margin.
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>


      </div>

      {/* ── Kanan: Panel Stats ── */}
      <div className="w-60 flex-shrink-0">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Toggle UPDATE / ANALISIS */}
          <div className="flex gap-2 p-3 border-b border-gray-100">
            {['update', 'analisis'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition ${
                  tab === t
                    ? 'bg-[#4A90D9] text-white shadow'
                    : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Radar Chart */}
          <div className="px-3 pt-3">
            <RadarChart showBank={tab === 'analisis'} />
          </div>

          {/* Metric List */}
          <div className="px-4 pb-2 space-y-2.5 flex-1">
            {METRICS.map((m, i) => (
              <div key={i} className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-gray-800">{m.name}</span>
                {tab === 'analisis' && (
                  <span className="text-[10px] text-gray-500 text-right leading-tight max-w-[110px]">
                    {[
                      'Keuntungan sangat stabil.',
                      'Dokumen lengkap tapi belum ada NPWP.',
                      'Penjualan naik terus 3 bulan terakhir.',
                      'Masih ada ruang untuk cicilan baru.',
                      'Usaha sudah jalan 1 tahun lebih.',
                      'Tidak pernah telat bayar listrik/tagihan.',
                    ][i]}
                  </span>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}