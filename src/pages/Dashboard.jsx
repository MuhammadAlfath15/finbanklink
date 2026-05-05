import React, { useState, useEffect } from 'react';
import { Search, Star, TrendingDown, CheckCircle } from 'lucide-react';

// ─── Data & Helpers ───────────────────────────────────────────────────────────

const CHART_POINTS = [55, 20, 35, 25, 75, 60, 55, 90, 8, 65, 82, 72];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

// Data iklan banner
const ADS = [
  {
    bg: 'linear-gradient(135deg, #3B5BDB 0%, #4C6EF5 100%)',
    label: 'Iklan bank A',
    img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&q=80&fit=crop&crop=top',
  },
  {
    bg: 'linear-gradient(135deg, #E67700 0%, #F59F00 100%)',
    label: 'Iklan bank B',
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&q=80&fit=crop&crop=top',
  },
  {
    bg: 'linear-gradient(135deg, #2F9E44 0%, #51CF66 100%)',
    label: 'Iklan bank C',
    img: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=500&q=80&fit=crop&crop=top',
  },
];

// Data kartu rekomendasi bank
const BANK_CARDS = [
  { img: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&q=80', jumlah: 'Rp. 100.000.000' },
  { img: 'https://images.unsplash.com/photo-1554774853-6a56f62c6451?w=600&q=80', jumlah: 'Rp. 55.000.000' },
  { img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80', jumlah: 'Rp. 30.000.000' },
  { img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80', jumlah: 'Rp. 75.000.000' },
  { img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80', jumlah: 'Rp. 40.000.000' },
  { img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80', jumlah: 'Rp. 20.000.000' },
];

function buildPath(points, W, H, padX, padY) {
  const usableW = W - padX * 2;
  const usableH = H - padY * 2;
  const max = 100;
  return points.map((v, i) => {
    const x = padX + (i / (points.length - 1)) * usableW;
    const y = padY + usableH - (v / max) * usableH;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

function buildArea(points, W, H, padX, padY) {
  const usableW = W - padX * 2;
  const usableH = H - padY * 2;
  const max = 100;
  const pts = points.map((v, i) => {
    const x = padX + (i / (points.length - 1)) * usableW;
    const y = padY + usableH - (v / max) * usableH;
    return [x, y];
  });
  const start = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  const lines = pts.slice(1).map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const close = `L${pts[pts.length - 1][0].toFixed(1)},${(padY + usableH).toFixed(1)} L${pts[0][0].toFixed(1)},${(padY + usableH).toFixed(1)} Z`;
  return `${start} ${lines} ${close}`;
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────
function DonutChart({ score = 435, max = 600 }) {
  const cx = 50, cy = 50, r = 36, strokeW = 10;
  const circ = 2 * Math.PI * r;
  const segments = [
    { color: '#60A5FA', pct: 0.28 },
    { color: '#A78BFA', pct: 0.22 },
    { color: '#34D399', pct: 0.20 },
    { color: '#FBBF24', pct: 0.18 },
    { color: '#F87171', pct: 0.12 },
  ];
  let offset = 0;
  return (
    <svg viewBox="0 0 100 100" className="w-24 h-24">
      {segments.map((s, i) => {
        const dash = s.pct * circ;
        const gap = circ - dash;
        const el = (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={strokeW}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset * circ}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        );
        offset += s.pct;
        return el;
      })}
      <text x="50" y="47" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1e3a5f">{score}</text>
      <text x="50" y="57" textAnchor="middle" fontSize="6" fill="#94a3b8">/{max}</text>
    </svg>
  );
}

// ─── Activity Item ────────────────────────────────────────────────────────────
function ActivityItem({ time = '10.15', starred = false }) {
  return (
    <div className="flex items-start gap-2 py-2.5 border-b border-gray-100 last:border-0">
      {/* Icon */}
      <div className="w-8 h-8 bg-gray-200 rounded-md flex-shrink-0 flex items-center justify-center mt-0.5">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-gray-500">
          <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <line x1="7" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="7" y1="13" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <p className="text-[11px] font-semibold text-gray-800 truncate">Tagihan dari Bank A</p>
          <span className="text-[9px] text-gray-400 flex-shrink-0">{time} ▸</span>
        </div>
        <p className="text-[10px] text-red-500 font-medium">Mohon untuk dibayar segera!</p>
        <p className="text-[9px] text-gray-400 truncate">Waktu pembayaran kamu sudah lewat mohon...</p>
      </div>
      {/* Star */}
      <Star size={12} className="flex-shrink-0 text-gray-300 mt-1 cursor-pointer hover:text-yellow-400 transition" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [search, setSearch] = useState('');
  const [adIndex, setAdIndex] = useState(0);

  // Auto-slide iklan setiap 4 detik
  useEffect(() => {
    const t = setInterval(() => setAdIndex(i => (i + 1) % ADS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const W = 560, H = 340, padX = 40, padY = 20;
  const linePath = buildPath(CHART_POINTS, W, H, padX, padY);
  const areaPath = buildArea(CHART_POINTS, W, H, padX, padY);
  const usableW = W - padX * 2;
  const usableH = H - padY * 2;

  return (
    <>
    <div className="flex gap-5 font-sans min-h-0">

      {/* ── Kolom Kiri (Kartu Info) ── */}
      <div className="w-36 flex-shrink-0 space-y-4">

        {/* Skor Keuanganmu */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-col items-center text-center">
          <p className="text-[10px] font-semibold text-gray-600 mb-2">Skor Keuanganmu</p>
          <DonutChart />
          <p className="text-[10px] text-gray-400 mt-1">435/600</p>
        </div>

        {/* Diverifikasi BCA */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-col items-center text-center">
          <p className="text-[10px] font-semibold text-gray-600 mb-2 leading-tight">
            Sedang diverifikasi<br />Bank BCA
          </p>
          <div className="w-12 h-12 flex items-center justify-center">
            <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
              <path d="M10 26L20 36L38 16" stroke="#9CA3AF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-[9px] text-gray-500 mt-2 leading-tight">
            Lengkapi <span className="font-bold text-gray-800">3 tahap</span><br />lagi untuk diverifikasi
          </p>
        </div>

        {/* Omzet Flow */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-col items-center text-center">
          <p className="text-[10px] font-semibold text-gray-600 mb-2">Omzet Flow</p>
          <div className="w-12 h-12 flex items-center justify-center">
            <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
              {/* Arrow body */}
              <path d="M24 6 C24 6 10 18 10 28 C10 35 16.5 40 24 40 C31.5 40 38 35 38 28 C38 18 24 6 24 6Z" fill="#EF4444" opacity="0.15" />
              <path d="M24 8 C24 8 12 20 12 29 C12 35.5 17.5 40 24 40 C30.5 40 36 35.5 36 29 C36 20 24 8 24 8Z" fill="#EF4444" />
              <path d="M18 30L24 38L30 30" fill="white" />
            </svg>
          </div>
          <p className="text-[9px] text-gray-500 mt-2 leading-tight">
            Sedang mengalami<br />penurunan dari 3<br />bulan lalu
          </p>
        </div>

      </div>

      {/* ── Kolom Tengah (Chart) ── */}
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 h-full">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818CF8" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#818CF8" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Grid Y lines */}
            {[0, 50, 100].map(v => {
              const y = padY + usableH - (v / 100) * usableH;
              return (
                <g key={v}>
                  <line x1={padX} y1={y} x2={W - padX} y2={y} stroke="#E5E7EB" strokeWidth="1" />
                  <text x={padX - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#9CA3AF">{v}</text>
                </g>
              );
            })}

            {/* Area fill */}
            <path d={areaPath} fill="url(#areaGrad)" />

            {/* Line */}
            <path d={linePath} fill="none" stroke="#818CF8" strokeWidth="2" strokeLinejoin="round" />

            {/* Dots */}
            {CHART_POINTS.map((v, i) => {
              const x = padX + (i / (CHART_POINTS.length - 1)) * usableW;
              const y = padY + usableH - (v / 100) * usableH;
              return <circle key={i} cx={x} cy={y} r="3.5" fill="white" stroke="#818CF8" strokeWidth="2" />;
            })}

            {/* X Axis labels */}
            {MONTHS.map((m, i) => {
              const x = padX + (i / (MONTHS.length - 1)) * usableW;
              return (
                <text key={m} x={x} y={H - 4} textAnchor="middle" fontSize="9" fill="#9CA3AF">{m}</text>
              );
            })}

            {/* Legend */}
            <circle cx={padX + 6} cy={H - 16} r="4" fill="none" stroke="#818CF8" strokeWidth="1.5" />
            <text x={padX + 14} y={H - 12} fontSize="8" fill="#9CA3AF">Omzet pertahun bisnis anda</text>
          </svg>
        </div>
      </div>

      {/* ── Kolom Kanan (Aktivitas) ── */}
      <div className="w-56 flex-shrink-0 bg-[#4A90D9] rounded-2xl shadow-md flex flex-col overflow-hidden self-start">
        {/* Header */}
        <div className="px-4 pt-4 pb-3">
          <h2 className="text-white text-lg font-bold text-center mb-3">Aktivitas</h2>
          {/* Search */}
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari pesan..."
              className="w-full pl-8 pr-3 py-2 bg-white rounded-xl text-[11px] text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        {/* Scrollable list */}
        <div className="bg-white overflow-y-auto max-h-[370px]">
          <div className="px-3 py-2">

            {/* Januari 2026 */}
            <p className="text-[10px] font-bold text-gray-700 py-2">Januari 2026</p>
            <ActivityItem time="10.15" />
            <ActivityItem time="09.42" />
            <ActivityItem time="08.30" />

            {/* Desember 2025 */}
            <p className="text-[10px] font-bold text-gray-700 py-2 mt-1">Desember 2025</p>
            <ActivityItem time="15.20" />
            <ActivityItem time="14.05" />
            <ActivityItem time="11.58" />
            <ActivityItem time="10.33" />
            <ActivityItem time="09.15" />

            {/* November 2025 */}
            <p className="text-[10px] font-bold text-gray-700 py-2 mt-1">November 2025</p>
            <ActivityItem time="17.00" />
            <ActivityItem time="14.45" />
            <ActivityItem time="13.22" />
            <ActivityItem time="11.10" />
            <ActivityItem time="09.05" />

            {/* Oktober 2025 */}
            <p className="text-[10px] font-bold text-gray-700 py-2 mt-1">Oktober 2025</p>
            <ActivityItem time="16.35" />
            <ActivityItem time="14.20" />
            <ActivityItem time="12.00" />
            <ActivityItem time="10.45" />

          </div>
        </div>
      </div>

    </div>

      {/* ═══ DISARANKAN UNTUKMU ═══ */}
      <div className="mt-8 font-sans">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Disarankan Untukmu</h2>

        {/* Banner Iklan Auto-Slide - proper sliding carousel */}
        <div className="relative overflow-hidden rounded-2xl mb-6 h-44 cursor-pointer select-none">
          {/* Slide track */}
          <div
            className="flex h-full"
            style={{
              width: `${ADS.length * 100}%`,
              transform: `translateX(-${(adIndex * 100) / ADS.length}%)`,
              transition: 'transform 0.5s ease-in-out',
            }}
          >
            {ADS.map((ad, i) => (
              <div
                key={i}
                className="relative h-full flex-shrink-0"
                style={{ width: `${100 / ADS.length}%`, background: ad.bg }}
              >
                {/* Teks kiri */}
                <div className="absolute left-6 top-0 h-full flex flex-col justify-center z-10 max-w-[52%]">
                  <h3 className="text-white text-xl font-extrabold leading-snug">
                    Pinjaman Modal Untuk Bisnis Anda
                  </h3>
                  <p className="text-white/80 text-xs mt-1.5">{ad.label}</p>
                </div>

                {/* Gambar kanan - fade dari warna ke foto */}
                <div className="absolute right-0 top-0 h-full w-[45%] overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 w-16 z-10"
                    style={{ background: `linear-gradient(to right, ${ad.bg.match(/#[0-9A-Fa-f]{6}/)?.[0] || '#3B5BDB'}, transparent)` }}
                  />
                  <img
                    src={ad.img}
                    alt={ad.label}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Dots indicator */}
          <div className="absolute bottom-3 left-6 flex gap-1.5 z-20">
            {ADS.map((_, i) => (
              <button
                key={i}
                onClick={() => setAdIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === adIndex ? 'bg-white w-5' : 'bg-white/50 w-2'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Kartu Rekomendasi Bank - horizontal scroll */}
        <div
          className="flex gap-4 overflow-x-auto pb-3 cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none' }}
          onMouseDown={e => {
            const el = e.currentTarget;
            let startX = e.pageX - el.offsetLeft;
            let scrollLeft = el.scrollLeft;
            const onMove = ev => { el.scrollLeft = scrollLeft - (ev.pageX - el.offsetLeft - startX); };
            const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
          }}
        >
          {BANK_CARDS.map((card, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex-shrink-0 w-72">
              {/* Foto */}
              <div className="relative h-44 overflow-hidden">
                <img src={card.img} alt="bank" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <p className="text-white text-[10px] font-semibold">Pinjaman 32864/BA/982736-18/XIII/2026</p>
                </div>
              </div>

              {/* Body */}
              <div className="p-4">
                {/* Tags */}
                <div className="flex gap-1.5 flex-wrap mb-2">
                  <span className="bg-blue-100 text-blue-600 text-[9px] font-bold px-2 py-0.5 rounded-full">20 Jam lagi</span>
                  <span className="bg-gray-100 text-gray-600 text-[9px] font-semibold px-2 py-0.5 rounded-full">★ 9+</span>
                  <span className="bg-gray-100 text-gray-600 text-[9px] font-semibold px-2 py-0.5 rounded-full">🛡️ Proteksi Asuransi</span>
                </div>

                {/* Progress */}
                <p className="text-[10px] text-gray-500 mb-1">Telah terkumpul 67% dari 25 pendana</p>
                <div className="w-full h-1 bg-gray-100 rounded-full mb-3">
                  <div className="h-1 bg-blue-500 rounded-full" style={{ width: '67%' }} />
                </div>

                {/* Detail Grid */}
                <div className="grid grid-cols-3 gap-x-2 gap-y-2 text-[10px]">
                  <div>
                    <p className="text-gray-400">Jumlah Pinjaman</p>
                    <p className="font-bold text-gray-800 text-[11px]">{card.jumlah}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Tenor</p>
                    <p className="font-bold text-gray-800 text-[11px]">8 Bulan</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Bunga Efektif</p>
                    <p className="font-bold text-gray-800 text-[11px]">12.0%</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-400">Frekuensi Angsuran Pokok</p>
                    <p className="font-bold text-gray-800 text-[11px]">Bulanan</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Agunan</p>
                    <p className="font-bold text-gray-800 text-[11px]">Tidak ada</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ TIPS & EDUKASI ═══ */}
      <div className="mt-8 mb-4 font-sans">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Tips &amp; Edukasi</h2>

        <div className="grid grid-cols-3 gap-5">
          {[
            {
              img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80',
              title: 'Jangan pernah menyebarkan pin ATM-mu',
              desc: 'Kalau tidak mau uangmu habis dalam sekejap, jaga pin-mu.',
            },
            {
              img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80',
              title: 'Mulai investasi dari sekarang',
              desc: 'Semakin cepat kamu mulai investasi, semakin besar hasil yang kamu dapatkan di masa depan.',
            },
            {
              img: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80',
              title: 'Cara meningkatkan skor kreditmu',
              desc: 'Bayar tagihan tepat waktu dan jaga rasio utang agar skor kreditmu terus meningkat.',
            },
            {
              img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80',
              title: 'Diversifikasi portofolio bisnismu',
              desc: 'Jangan taruh semua telur dalam satu keranjang — sebarkan risiko usahamu ke beberapa sektor.',
            },
            {
              img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80',
              title: 'Kelola arus kas bisnis dengan benar',
              desc: 'Pencatatan keuangan yang rapi membantu kamu menghindari defisit dan merencanakan ekspansi.',
            },
            {
              img: 'https://images.unsplash.com/photo-1565372195458-9de0b320ef04?w=600&q=80',
              title: 'Pahami bunga pinjaman sebelum meminjam',
              desc: 'Selalu bandingkan bunga efektif antar produk pinjaman agar tidak terjebak biaya tersembunyi.',
            },
          ].map((tip, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            >
              {/* Foto */}
              <div className="h-44 overflow-hidden">
                <img src={tip.img} alt={tip.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
              {/* Teks */}
              <div className="p-4">
                <p className="text-sm font-bold text-gray-800 mb-1 leading-snug">{tip.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}