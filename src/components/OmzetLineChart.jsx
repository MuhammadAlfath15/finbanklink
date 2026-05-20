import React from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function buildPath(points, W, H, padX, padY) {
  const usableW = W - padX * 2;
  const usableH = H - padY * 2;
  const max = 100;
  const pts = Array.isArray(points) && points.length === 12 ? points : Array(12).fill(0);
  return pts.map((v, i) => {
    const x = padX + (i / (pts.length - 1)) * usableW;
    const y = padY + usableH - (Math.min(100, Math.max(0, Number(v))) / max) * usableH;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

function buildArea(points, W, H, padX, padY) {
  const usableW = W - padX * 2;
  const usableH = H - padY * 2;
  const max = 100;
  const pts = Array.isArray(points) && points.length === 12 ? points : Array(12).fill(0);
  const coords = pts.map((v, i) => {
    const x = padX + (i / (pts.length - 1)) * usableW;
    const y = padY + usableH - (Math.min(100, Math.max(0, Number(v))) / max) * usableH;
    return [x, y];
  });
  const start = `M${coords[0][0].toFixed(1)},${coords[0][1].toFixed(1)}`;
  const lines = coords.slice(1).map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const baseY = (padY + usableH).toFixed(1);
  const close = `L${coords[coords.length - 1][0].toFixed(1)},${baseY} L${coords[0][0].toFixed(1)},${baseY} Z`;
  return `${start} ${lines} ${close}`;
}

/**
 * Grafik garis omzet (skala 0–100 per bulan), sama seperti Dashboard user.
 */
export default function OmzetLineChart({ chartPoints = [], title = 'Omzet (indeks bulanan)' }) {
  const pts = Array.isArray(chartPoints) && chartPoints.length === 12
    ? chartPoints.map((v) => Number(v) || 0)
    : [...(chartPoints || []), ...Array(12).fill(0)].slice(0, 12).map((v) => Number(v) || 0);

  const W = 560;
  const H = 340;
  const padX = 40;
  const padY = 20;
  const linePath = buildPath(pts, W, H, padX, padY);
  const areaPath = buildArea(pts, W, H, padX, padY);
  const usableW = W - padX * 2;
  const usableH = H - padY * 2;
  const empty = pts.every((v) => v === 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{title}</p>
      {empty ? (
        <p className="text-sm text-gray-400 text-center py-8">Belum ada data omzet tahun ini.</p>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="omzetAreaGradBank" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#818CF8" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0, 50, 100].map((v) => {
            const y = padY + usableH - (v / 100) * usableH;
            return (
              <g key={v}>
                <line x1={padX} y1={y} x2={W - padX} y2={y} stroke="#E5E7EB" strokeWidth="1" />
                <text x={padX - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#9CA3AF">{v}</text>
              </g>
            );
          })}
          <path d={areaPath} fill="url(#omzetAreaGradBank)" />
          <path d={linePath} fill="none" stroke="#818CF8" strokeWidth="2" strokeLinejoin="round" />
          {pts.map((v, i) => {
            const x = padX + (i / (pts.length - 1)) * usableW;
            const y = padY + usableH - (Math.min(100, Math.max(0, v)) / 100) * usableH;
            return <circle key={i} cx={x} cy={y} r="3.5" fill="white" stroke="#818CF8" strokeWidth="2" />;
          })}
          {MONTHS.map((m, i) => {
            const x = padX + (i / (MONTHS.length - 1)) * usableW;
            return (
              <text key={m} x={x} y={H - 4} textAnchor="middle" fontSize="9" fill="#9CA3AF">{m}</text>
            );
          })}
        </svg>
      )}
    </div>
  );
}
