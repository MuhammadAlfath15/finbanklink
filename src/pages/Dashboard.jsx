import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, TrendingDown, TrendingUp, CheckCircle, Edit3, X, UploadCloud, FileSpreadsheet, Loader2, Link as LinkIcon, ShieldCheck, Clock, CheckCircle2, XCircle, Landmark, Minus } from 'lucide-react';
import { getOmzet, saveOmzet, getBusinessProfile, getMySubmissions, getNotifications, markNotificationAsRead, markAllNotificationsAsRead, getPublicAds, getPublicArticles, getBanks } from '../services/api';
import { getDashboardSubmissionCardCopy, pickActiveSubmission } from '../utils/submissionProgress';
import { toast } from 'react-hot-toast';

// ─── Data & Helpers ───────────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const formatRp = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

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

const getBankImage = (bankName = '') => {
  const normalized = bankName.toLowerCase();
  if (normalized.includes('bca')) {
    return 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&q=80';
  }
  if (normalized.includes('mandiri')) {
    return 'https://images.unsplash.com/photo-1554774853-6a56f62c6451?w=600&q=80';
  }
  if (normalized.includes('bni')) {
    return 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80';
  }
  if (normalized.includes('bri')) {
    return 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80';
  }
  if (normalized.includes('bsi') || normalized.includes('syariah')) {
    return 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80';
  }
  return 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80';
};

// Detail Modal untuk Simulasi di Dashboard
function DetailModal({ bank, onClose, onAjukan }) {
  const { cardBg, accent, textMain } = getBankAccentStyle(bank.nama_bank);
  const plafonMin = bank.plafon_min ?? 1000000;
  const plafonMax = bank.plafon_max ?? 50000000;
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
        <div className={`relative overflow-hidden rounded-t-2xl px-5 pt-5 pb-4 ${cardBg}`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-20`} />
          <div className="relative flex justify-between items-start">
            <div>
              <h2 className={`text-xl font-bold ${textMain}`}>{bank.nama_bank}</h2>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-0.5">Nama Produk : {bank.nama_produk}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <svg viewBox="0 0 24 24" fill="currentColor" className={`w-7 h-7 ${textMain}`}>
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
            disabled={bank.skor_kecocokan < 60}
            className={`py-4 text-sm font-bold transition-colors ${bank.skor_kecocokan < 60 ? 'text-gray-400 cursor-not-allowed bg-gray-50' : 'text-blue-600 hover:text-blue-800'}`}
          >
            {bank.skor_kecocokan < 60 ? 'Skor Kurang' : 'Ajukan Sekarang'}
          </button>
        </div>
      </div>
    </div>
  );
}

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
function DonutChart({ metrics, total }) {
  const cx = 50, cy = 50, R = 44, innerR = 28;
  const toXY = (r, angle) => ({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });

  const arcPath = (r1, r2, a1, a2) => {
    const p1 = toXY(r1, a1), p2 = toXY(r1, a2);
    const p3 = toXY(r2, a2), p4 = toXY(r2, a1);
    const lg = a2 - a1 > Math.PI ? 1 : 0;
    return `M${p1.x.toFixed(1)},${p1.y.toFixed(1)} A${r1},${r1} 0 ${lg},1 ${p2.x.toFixed(1)},${p2.y.toFixed(1)} L${p3.x.toFixed(1)},${p3.y.toFixed(1)} A${r2},${r2} 0 ${lg},0 ${p4.x.toFixed(1)},${p4.y.toFixed(1)} Z`;
  };

  const totalVal = metrics.reduce((s, m) => s + m.value, 0) || 1;
  let cum = -Math.PI / 2;
  const arcs = metrics.map(m => {
    const angle = (m.value / totalVal) * 2 * Math.PI;
    const arc = { color: m.color, startAngle: cum, endAngle: cum + angle };
    cum += angle;
    return arc;
  });

  return (
    <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-sm">
      {arcs.map((s, i) => (
        <path key={i} d={arcPath(R, innerR, s.startAngle, s.endAngle)} fill={s.color} stroke="white" strokeWidth="1.5" />
      ))}
      <circle cx={cx} cy={cy} r={innerR - 1} fill="white" />
      <text x="50" y="48" textAnchor="middle" fontSize="16" fontWeight="900" fill="#1e3a5f">{total}</text>
      <text x="50" y="59" textAnchor="middle" fontSize="7" fill="#9CA3AF">/ 600</text>
    </svg>
  );
}

// ─── Activity Detail Modal ────────────────────────────────────────────────────
function ActivityDetailModal({ activity, onClose }) {
  if (!activity) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white w-full max-w-lg rounded-t-[32px] md:rounded-[32px] shadow-2xl z-10 overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
        <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                <line x1="7" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="7" y1="13" x2="13" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-lg leading-tight">Detail Pesan</h3>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Aktivitas & Notifikasi</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-start mb-6 gap-4">
            <div>
              <p className="text-sm font-black text-gray-900 mb-2">{activity.subject}</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dari:</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">{activity.title}</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 shrink-0 text-right">{activity.time} • {activity.date || 'Hari ini'}</span>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100/50">
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">
              {activity.message}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Tandai Telah Dibaca & Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Activity Item ────────────────────────────────────────────────────────────
function ActivityItem({
  time = '10.15',
  title = 'Tagihan dari Bank A',
  subject = 'Mohon untuk dibayar segera!',
  message = 'Waktu pembayaran kamu sudah lewat. Mohon segera lakukan pelunasan untuk menghindari denda keterlambatan dan penurunan skor kredit.',
  isRead = true,
  onClick
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-start gap-3 py-3.5 px-2 -mx-2 rounded-xl border-b border-gray-50 last:border-0 hover:bg-blue-50/50 cursor-pointer transition-all group"
    >
      {/* Icon */}
      <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center transition-colors ${!isRead ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-blue-50'}`}>
        <svg viewBox="0 0 24 24" fill="none" className={`w-4 h-4 transition-colors ${!isRead ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-400'}`}>
          <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
          <line x1="7" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="7" y1="13" x2="13" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <p className={`text-[11px] font-black truncate transition-colors ${!isRead ? 'text-blue-900' : 'text-gray-800 group-hover:text-blue-800'}`}>
            {title}
            {!isRead && <span className="ml-1 inline-block w-1.5 h-1.5 bg-blue-500 rounded-full"></span>}
          </p>
          <span className={`text-[9px] font-bold flex-shrink-0 ${!isRead ? 'text-blue-400' : 'text-gray-400'}`}>{time} ▸</span>
        </div>
        <p className={`text-[10px] font-bold mb-0.5 ${!isRead ? 'text-blue-600' : 'text-red-500'}`}>{subject}</p>
        <p className={`text-[9px] truncate font-medium ${!isRead ? 'text-gray-500' : 'text-gray-400'}`}>{message}</p>
      </div>
      {/* Star */}
      <Star size={12} className={`flex-shrink-0 mt-1 cursor-pointer transition ${!isRead ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-400'}`} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showLeftScrollHint, setShowLeftScrollHint] = useState(true);

  const handleLeftScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Hide hint if scrolled down more than 15px, or if close to bottom
    if (scrollTop > 15 || scrollHeight - scrollTop - clientHeight < 10) {
      setShowLeftScrollHint(false);
    } else {
      setShowLeftScrollHint(true);
    }
  };

  const [adIndex, setAdIndex] = useState(0);
  const [ads, setAds] = useState([]);
  const [adsLoaded, setAdsLoaded] = useState(false);
  const [articles, setArticles] = useState([]);
  const [chartPoints, setChartPoints] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

  // State business profile (skor kesehatan bisnis)
  const [businessProfile, setBusinessProfile] = useState(null);
  const [recommendedBanks, setRecommendedBanks] = useState([]);
  const [activeBank, setActiveBank] = useState(null);

  // State untuk modal input omzet
  const [isOmzetModalOpen, setIsOmzetModalOpen] = useState(false);
  const [tempOmzet, setTempOmzet] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0);
  const [activeActivity, setActiveActivity] = useState(null);

  const [submissions, setSubmissions] = useState([]);
  const activeSubmission = useMemo(() => pickActiveSubmission(submissions), [submissions]);
  const card = useMemo(() => getDashboardSubmissionCardCopy(activeSubmission), [activeSubmission]);

  const hasMultipleSubmissions = useMemo(() => {
    if (submissions.length === 0) return false;
    const activeSubmissions = submissions.filter(s => {
      const localSteps = JSON.parse(localStorage.getItem('local_submission_steps') || '{}');
      const eff = localSteps[s.id] || localSteps[s.submission_id] || s.status_raw;
      return ['menunggu', 'Verifikasi', 'Survei', 'verifikasi', 'survei'].includes(eff) || s.bank_message?.includes('[STEP:');
    });
    const tracking = activeSubmissions.length > 0 
      ? activeSubmissions 
      : [submissions[0]];
    return tracking.length > 1;
  }, [submissions]);

  const [submissionLoading, setSubmissionLoading] = useState(true);

  const fetchSubmissions = useCallback(() => {
    setSubmissionLoading(true);
    getMySubmissions()
      .then((rows) => {
        const list = Array.isArray(rows) ? rows : [];
        setSubmissions(list);
      })
      .catch(() => setSubmissions([]))
      .finally(() => setSubmissionLoading(false));
  }, []);

  // SINKRONISASI REAL-TIME: Dengerin perubahan di tab lain (Bank Dashboard)
  useEffect(() => {
    const syncLocal = (e) => {
      if (e.key === 'local_submission_steps') {
        fetchSubmissions();
      }
    };
    window.addEventListener('storage', syncLocal);
    return () => window.removeEventListener('storage', syncLocal);
  }, [fetchSubmissions]);

  const [notifications, setNotifications] = useState([]);
  const filteredNotifications = useMemo(() => {
    if (!notifications) return [];
    
    let prefs = {};
    try {
      prefs = JSON.parse(localStorage.getItem('notif_prefs')) || {
        email_pengajuan: true,
        email_promo: true,
        push_reminder: false,
        push_skor: false
      };
    } catch {
      prefs = {
        email_pengajuan: true,
        email_promo: true,
        push_reminder: false,
        push_skor: false
      };
    }

    const isEmailPengajuanEnabled = prefs.email_pengajuan ?? true;
    const isEmailKemitraanEnabled = prefs.email_promo ?? true;
    const isPushReminderEnabled = prefs.push_reminder ?? false;
    const isPushSkorEnabled = prefs.push_skor ?? false;

    return notifications.filter(n => {
      const title = n.title.toLowerCase();
      const subject = (n.subject || '').toLowerCase();
      const msg = n.message.toLowerCase();

      // 1. Status Pengajuan Pinjaman
      const isLoanUpdate = title.includes('bank') || subject.includes('pengajuan') || msg.includes('pengajuan') || subject.includes('status');
      if (isLoanUpdate && !isEmailPengajuanEnabled) return false;

      // 2. Rekomendasi Kemitraan & Penawaran Modal
      const isPromo = title.includes('rekomendasi') || subject.includes('promo') || subject.includes('penawaran') || subject.includes('kemitraan') || msg.includes('promo') || msg.includes('penawaran');
      if (isPromo && !isEmailKemitraanEnabled) return false;

      // 3. Pengingat Kelengkapan Berkas
      const isReminder = title.includes('dokumen') || subject.includes('lengkap') || msg.includes('dokumen') || msg.includes('lengkapi') || title.includes('berkas') || msg.includes('berkas');
      if (isReminder && !isPushReminderEnabled) return false;

      // 4. Laporan & Pembaruan Skor Kesehatan
      const isScore = title.includes('skor') || subject.includes('skor') || msg.includes('skor');
      if (isScore && !isPushSkorEnabled) return false;

      return true;
    });
  }, [notifications]);

  const fetchAllNotifications = useCallback(() => {
    getNotifications().then((res) => {
      if (res && res.data) {
        setNotifications(res.data);
      }
    }).catch(err => console.error('Gagal fetch notifikasi:', err));
  }, []);

  const fetchOmzet = () => {
    getOmzet().then(res => {
      if (res && res.data) setChartPoints(res.data);
    }).catch(err => console.error('Gagal fetch omzet:', err));
  };

  // Load data omzet & business profile dari backend
  useEffect(() => {
    fetchOmzet();
    
    // Fetch profile and banks together to calculate match scores dynamically
    Promise.all([
      getBusinessProfile().catch(() => ({ skor_total: 0 })),
      getBanks().catch(() => [])
    ]).then(([profileData, bankData]) => {
      setBusinessProfile(profileData);
      const userScore = profileData?.skor_total ?? 0;
      
      const enhancedBanks = bankData.map(bank => {
        const standard = bank.min_score || 350;
        let matchScore = Math.round((userScore / standard) * 100);
        if (userScore < standard) {
          matchScore = Math.min(matchScore, 59);
        } else {
          matchScore = Math.min(100, 60 + Math.round(((userScore - standard) / (600 - standard)) * 40));
        }
        return { ...bank, skor_kecocokan: matchScore };
      });
      
      // Deduplicate enhancedBanks by bank ID (id) to avoid duplicates from multiple category assignments
      const uniqueBanks = [];
      const seenIds = new Set();
      enhancedBanks.forEach(bank => {
        if (!seenIds.has(bank.id)) {
          seenIds.add(bank.id);
          uniqueBanks.push(bank);
        }
      });
      
      // Filter banks promoted by admin, fallback to top match score banks if empty
      const promoted = uniqueBanks.filter(b => b.is_promoted);
      if (promoted.length > 0) {
        setRecommendedBanks(promoted);
      } else {
        const topRecommendations = uniqueBanks
          .sort((a, b) => b.skor_kecocokan - a.skor_kecocokan)
          .slice(0, 4);
        setRecommendedBanks(topRecommendations);
      }
    }).catch(err => console.error('Gagal fetch bank/profile rekomendasi:', err));

    fetchSubmissions();
    fetchAllNotifications();
    getPublicAds().then((rows) => {
      if (Array.isArray(rows) && rows.length > 0) {
        setAds(rows.map((ad) => ({
          badge: ad.badge,
          title: ad.title,
          desc: ad.description || '',
          cta: ad.cta || 'Pelajari',
          img: ad.image_url,
          bgFrom: ad.bg_color_from || '#001D4A',
          bgTo: ad.bg_color_to || '#0052CC',
        })));
      }
      setAdsLoaded(true);
    }).catch(() => setAdsLoaded(true));
    getPublicArticles().then((rows) => {
      if (Array.isArray(rows)) {
        setArticles(rows);
      }
    }).catch(() => null);
  }, [fetchSubmissions, fetchAllNotifications]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        fetchSubmissions();
        fetchAllNotifications();
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [fetchSubmissions, fetchAllNotifications]);

  const handleNotificationClick = async (notif) => {
    setActiveActivity({
      time: new Date(notif.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      date: new Date(notif.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      title: notif.title,
      subject: notif.subject,
      message: notif.message
    });

    if (!notif.read_at) {
      try {
        await markNotificationAsRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n));
      } catch (err) {
        console.error('Failed to mark as read', err);
      }
    }
  };

  const handleOpenModal = () => {
    setUploadFile(null);
    setIsProcessing(false);
    setProcessStep(0);
    setTempOmzet([...chartPoints]);
    setIsOmzetModalOpen(true);
  };

  const handleSaveOmzet = async () => {
    setIsSaving(true);
    try {
      const year = new Date().getFullYear();
      await saveOmzet(year, tempOmzet);
      toast.success("Data omzet berhasil diverifikasi & disimpan!");
      setChartPoints(tempOmzet);
      setIsOmzetModalOpen(false);
    } catch (error) {
      toast.error("Gagal menyimpan data omzet");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      processSimulatedFile();
    }
  };

  const processSimulatedFile = () => {
    setIsProcessing(true);
    setProcessStep(1);

    // Simulate steps
    setTimeout(() => setProcessStep(2), 1500); // Menganalisis file
    setTimeout(() => setProcessStep(3), 3000); // Memvalidasi transaksi
    setTimeout(() => {
      setProcessStep(4); // Selesai
      setIsProcessing(false);
      // Generate realistic extracted omzet data
      const extracted = Array.from({ length: 12 }, () => Math.floor(Math.random() * 40) + 40);
      setTempOmzet(extracted);
    }, 4500);
  };

  // Reset adIndex ke 0 setiap kali ads berubah (hindari NaN akibat % 0)
  useEffect(() => {
    setAdIndex(0);
  }, [ads]);

  // Auto-slide iklan setiap 4 detik — hanya aktif kalau ada > 1 iklan
  useEffect(() => {
    if (ads.length <= 1) return;
    const len = ads.length;
    const t = setInterval(() => setAdIndex(i => (i + 1) % len), 4000);
    return () => clearInterval(t);
  }, [ads]);

  /** Menghitung tren omzet untuk indikator di kolom kiri */
  const getOmzetTrend = () => {
    // Ambil semua data omzet yang tidak nol
    const validData = chartPoints.map((v, i) => ({ v, i })).filter(item => item.v > 0);

    if (validData.length === 0) {
      return {
        title: 'Omzet Flow',
        desc: 'Belum ada data\nomzet tercatat',
        color: '#9CA3AF',
        indicator: (
          <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-100 shadow-sm transition-all group-hover:scale-110">
            <Clock className="text-gray-300" size={24} />
          </div>
        )
      };
    }

    // Ambil data terbaru dan data sebelumnya
    const latest = validData[validData.length - 1];
    const previous = validData.length > 1 ? validData[validData.length - 2] : null;

    if (!previous) {
      return {
        title: 'Omzet Flow',
        desc: 'Data perdana\nberhasil dicatat',
        color: '#3B82F6',
        indicator: (
          <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded-2xl border border-blue-100 shadow-sm transition-all group-hover:scale-110">
            <CheckCircle className="text-blue-500" size={24} />
          </div>
        )
      };
    }

    const diff = latest.v - previous.v;
    const percent = Math.round((Math.abs(diff) / previous.v) * 100);

    if (diff > 0) {
      return {
        title: 'Omzet Flow',
        desc: `Naik ${percent}% dari\nbulan sebelumnya`,
        color: '#10B981',
        indicator: (
          <div className="relative group-hover:scale-110 transition-transform">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shadow-sm border border-emerald-100">
              <TrendingUp size={24} className="text-emerald-500" strokeWidth={2.5} />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
          </div>
        )
      };
    } else if (diff < 0) {
      return {
        title: 'Omzet Flow',
        desc: `Turun ${percent}% dari\nbulan sebelumnya`,
        color: '#EF4444',
        indicator: (
          <div className="relative group-hover:scale-110 transition-transform">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center shadow-sm border border-red-100">
              <TrendingDown size={24} className="text-red-500" strokeWidth={2.5} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-400 rounded-full border-2 border-white" />
          </div>
        )
      };
    } else {
      return {
        title: 'Omzet Flow',
        desc: 'Cenderung stabil\nbulan ini',
        color: '#F59E0B',
        indicator: (
          <div className="w-12 h-12 flex items-center justify-center bg-amber-50 rounded-2xl border border-amber-100 shadow-sm transition-all group-hover:scale-110">
            <Minus className="text-amber-500" size={24} strokeWidth={3} />
          </div>
        )
      };
    }
  };

  const trendData = getOmzetTrend();

  const W = 560, H = 340, padX = 40, padY = 20;
  const linePath = buildPath(chartPoints, W, H, padX, padY);
  const areaPath = buildArea(chartPoints, W, H, padX, padY);
  const usableW = W - padX * 2;
  const usableH = H - padY * 2;

  return (
    <>
      <div className="flex gap-5 font-sans min-h-0 h-[460px]">

        {/* ── Kolom Kiri (Kartu Info) ── */}
        <div className="relative w-36 h-full flex-shrink-0">
          <div
            onScroll={handleLeftScroll}
            className="w-full h-full space-y-4 overflow-y-auto thin-scrollbar pr-1.5 pb-6"
          >

          {/* Skor Keuanganmu */}
          {(() => {
            const scoreColor = (v) => v >= 70 ? '#10B981' : v >= 50 ? '#F59E0B' : '#EF4444';
            const BP_KEYS = [
              { key: 'skor_profitabilitas' },
              { key: 'skor_legalitas' },
              { key: 'skor_tren_omzet' },
              { key: 'skor_kolektibilitas' },
              { key: 'skor_keberlanjutan' },
              { key: 'skor_kapasitas_utang' },
            ];
            const metrics = BP_KEYS.map(({ key }) => ({
              value: businessProfile?.[key] ?? 0,
              color: scoreColor(businessProfile?.[key] ?? 0),
            }));
            const total = businessProfile?.skor_total ?? 0;

            return (
              <div
                id="kartu-skor-keuangan"
                onClick={() => navigate('/kesehatan-bisnis')}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-col items-center text-center cursor-pointer hover:shadow-md hover:border-blue-200 transition-all hover:-translate-y-0.5"
              >
                <p className="text-[10px] font-semibold text-gray-600 mb-2">Skor Keuanganmu</p>
                <DonutChart metrics={metrics} total={total} />
                <p className="text-[10px] text-gray-400 mt-1">{total}/600</p>
              </div>
            );
          })()}

          {/* Status pengajuan aktif — sinkron dengan Riwayat / API */}
          {(() => {
            const activeSubmissions = submissions.filter(s => {
              const localSteps = JSON.parse(localStorage.getItem('local_submission_steps') || '{}');
              const eff = localSteps[s.id] || localSteps[s.submission_id] || s.status_raw;
              return ['menunggu', 'Verifikasi', 'Survei', 'verifikasi', 'survei'].includes(eff) || s.bank_message?.includes('[STEP:');
            });

            const trackingSubmissions = activeSubmissions.length > 0 
              ? activeSubmissions 
              : (submissions.length > 0 ? [submissions[0]] : []);

            if (submissionLoading) {
              return (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center justify-center text-center w-full min-h-[140px]">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                  <p className="text-[10px] text-gray-400 mt-2 font-semibold">Memuat progres...</p>
                </div>
              );
            }

            if (trackingSubmissions.length === 0) {
              return (
                <button
                  type="button"
                  onClick={() => navigate('/cari-modal')}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center text-center w-full hover:border-blue-200 hover:shadow-md transition-all cursor-pointer min-h-[140px] justify-center"
                >
                  <p className="text-[10px] font-black text-gray-600 mb-1">Belum ada pengajuan</p>
                  <Landmark className="w-8 h-8 text-gray-300 my-2" strokeWidth={1.5} />
                  <p className="text-[9px] text-gray-400 leading-tight">Ajukan modal usaha di halaman Cari Modal.</p>
                </button>
              );
            }

            return (
              <div className="space-y-3 w-full">
                {trackingSubmissions.map((sub, index) => {
                  const localSteps = JSON.parse(localStorage.getItem('local_submission_steps') || '{}');
                  let effStatus = localSteps[sub.id] || localSteps[sub.submission_id] || sub.status_raw || 'menunggu';
                  effStatus = effStatus.toLowerCase();
                  if (sub.bank_message?.includes('[STEP:VERIFIKASI]')) effStatus = 'verifikasi';
                  if (sub.bank_message?.includes('[STEP:SURVEI]')) effStatus = 'survei';

                  let statusText = 'Diproses';
                  let statusDesc = 'Bank sedang meninjau berkas Anda.';
                  let dotsActive = 1;

                  if (effStatus === 'verifikasi') {
                    statusText = 'Verifikasi Dokumen';
                    statusDesc = 'Dokumen Anda sedang divalidasi bank.';
                    dotsActive = 2;
                  } else if (effStatus === 'survei') {
                    statusText = 'Tahap Survei';
                    statusDesc = 'Petugas bank sedang menganalisis usaha Anda.';
                    dotsActive = 3;
                  } else if (effStatus === 'disetujui') {
                    statusText = 'Disetujui! 🎉';
                    statusDesc = 'Dana disetujui, tunggu akad pencairan.';
                    dotsActive = 4;
                  } else if (effStatus === 'ditolak') {
                    statusText = 'Ditolak';
                    statusDesc = 'Maaf, pengajuan belum memenuhi syarat.';
                    dotsActive = 4;
                  } else if (effStatus === 'dibatalkan') {
                    statusText = 'Dibatalkan';
                    statusDesc = 'Pengajuan dibatalkan nasabah.';
                    dotsActive = 0;
                  }

                  return (
                    <div
                      key={sub.submission_id || index}
                      onClick={() => navigate('/riwayat')}
                      className={`relative bg-gradient-to-b from-white to-gray-50/50 dark:from-slate-900 dark:to-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-3.5 flex flex-col text-left w-full hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-300 cursor-pointer group overflow-hidden ${
                        activeSubmissions.length > 1 ? 'border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      {/* Top Row: Bank Badge & Short ID */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span 
                          className="text-[8px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-md uppercase tracking-wider truncate max-w-[80px]" 
                          title={sub.nama_bank}
                        >
                          {sub.nama_bank}
                        </span>
                        <span className="text-[8px] font-bold text-gray-400 select-none">
                          #{sub.id.split('-').pop()}
                        </span>
                      </div>
                      
                      {/* Product Name */}
                      <h4 className="text-[10px] font-extrabold text-gray-800 dark:text-gray-200 leading-tight mb-1.5 line-clamp-2">
                        {sub.nama_produk}
                      </h4>

                      {/* Segmented Progress Bar */}
                      {effStatus !== 'dibatalkan' && (
                        <div className="w-full bg-gray-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden flex gap-[2px] mb-2.5">
                          {[1, 2, 3, 4].map((step) => {
                            let barColor = "bg-gray-200 dark:bg-slate-700/50";
                            if (step < dotsActive) {
                              barColor = "bg-blue-500";
                            } else if (step === dotsActive) {
                              barColor = effStatus === 'disetujui' ? 'bg-emerald-500' : effStatus === 'ditolak' ? 'bg-rose-500' : 'bg-amber-400 animate-pulse';
                            }
                            return <div key={step} className={`flex-1 h-full ${barColor}`} />;
                          })}
                        </div>
                      )}

                      {/* Phase Status & Description */}
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            effStatus === 'disetujui' ? 'bg-emerald-500' : effStatus === 'ditolak' || effStatus === 'dibatalkan' ? 'bg-rose-500' : 'bg-amber-400 animate-pulse'
                          }`} />
                          <span className="text-[9px] font-black text-gray-900 dark:text-white uppercase tracking-wider leading-none">
                            {statusText}
                          </span>
                        </div>
                        <p className="text-[8px] text-gray-500 dark:text-gray-400 font-medium leading-normal mt-1 min-h-[30px] line-clamp-3">
                          {statusDesc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Omzet Flow */}
          <div
            onClick={handleOpenModal}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-col items-center text-center cursor-pointer hover:shadow-md hover:border-blue-200 transition-all hover:-translate-y-0.5"
          >
            <p className="text-[10px] font-semibold text-gray-600 mb-2">{trendData.title}</p>
            <div className="w-12 h-12 flex items-center justify-center">
              {trendData.indicator}
            </div>
            <p className="text-[9px] text-gray-500 mt-2 leading-tight whitespace-pre-line">
              {trendData.desc}
            </p>
          </div>

        </div>

        {/* Floating Scroll Indicator */}
        {hasMultipleSubmissions && showLeftScrollHint && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-blue-600/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg animate-bounce pointer-events-none z-10 transition-opacity duration-300">
            <span>Scroll</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </div>
        )}
      </div>

        {/* ── Kolom Tengah (Chart) ── */}
        <div className="flex-1 min-w-0 h-full">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 h-full relative group">
            {/* Tombol Edit Omzet */}
            <button
              onClick={handleOpenModal}
              className="absolute top-4 right-4 p-2 bg-blue-50 text-blue-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100 shadow-sm flex items-center gap-2"
              title="Update Data Omzet"
            >
              <Edit3 size={16} />
              <span className="text-xs font-semibold">Update Omzet</span>
            </button>

            {/* Teks Petunjuk Jika Kosong */}
            {chartPoints.every(v => v === 0) && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-2xl">
                <p className="text-sm text-gray-500 font-medium mb-3">Grafik belum muncul karena data omzet kosong.</p>
                <button
                  onClick={handleOpenModal}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-md transition-all"
                >
                  Isi Data Omzet Sekarang
                </button>
              </div>
            )}

            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full h-auto overflow-visible"
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
              {chartPoints.map((v, i) => {
                const x = padX + (i / (chartPoints.length - 1)) * usableW;
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
              <g transform={`translate(${W / 2}, ${H + 26})`}>
                <circle cx="-65" cy="-3" r="4" fill="none" stroke="#818CF8" strokeWidth="1.5" />
                <text x="-55" y="0" fontSize="9" fill="#9CA3AF">Omzet pertahun bisnis anda</text>
              </g>
            </svg>
          </div>
        </div>

        {/* ── Kolom Kanan (Aktivitas) ── */}
        <div className="w-56 flex-shrink-0 bg-[#4A90D9] rounded-2xl shadow-md flex flex-col overflow-hidden h-full">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 flex-shrink-0">
            <div className="relative flex items-center justify-center mb-3 min-h-[28px]">
              <h2 className="text-white text-lg font-bold">Aktivitas</h2>
            </div>
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
          <div className="bg-white overflow-y-auto flex-1">
            <div className="px-3 py-2">
              {filteredNotifications.length === 0 ? (
                <div className="py-10 text-center flex flex-col items-center justify-center opacity-60">
                  <ShieldCheck size={32} className="text-gray-300 mb-2" />
                  <p className="text-xs font-bold text-gray-400">Belum ada aktivitas</p>
                  <p className="text-[10px] text-gray-400 mt-1 px-4 leading-normal">Aktivitas mungkin disembunyikan berdasarkan Pengaturan Notifikasi Anda.</p>
                </div>
              ) : (
                filteredNotifications
                  .filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.message.toLowerCase().includes(search.toLowerCase()))
                  .map((notif, index) => {
                    const isRead = !!notif.read_at;
                    const time = new Date(notif.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                    return (
                      <ActivityItem
                        key={notif.id || index}
                        time={time}
                        title={notif.title}
                        subject={notif.subject}
                        message={notif.message}
                        isRead={isRead}
                        onClick={() => handleNotificationClick(notif)}
                      />
                    );
                  })
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ═══ DISARANKAN UNTUKMU ═══ */}
      <div className="mt-8 font-sans">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Disarankan Untukmu</h2>

        {/* Banner Iklan: skeleton → carousel → hidden (kalau kosong) */}
        {!adsLoaded ? (
          /* Skeleton shimmer saat iklan belum dimuat */
          <div className="relative overflow-hidden rounded-[24px] mb-8 h-[240px] bg-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            <div className="h-full flex items-center px-10 gap-6">
              <div className="flex flex-col gap-3 flex-1">
                <div className="h-5 w-28 bg-gray-200 rounded-full" />
                <div className="h-8 w-64 bg-gray-200 rounded-xl" />
                <div className="h-4 w-80 bg-gray-200 rounded-full" />
                <div className="h-4 w-56 bg-gray-200 rounded-full" />
                <div className="h-9 w-36 bg-gray-200 rounded-full mt-2" />
              </div>
              <div className="w-[45%] h-full bg-gray-200 rounded-r-[24px]" />
            </div>
          </div>
        ) : ads.length > 0 ? (
        <div className="relative overflow-hidden rounded-[24px] mb-8 h-[240px] cursor-pointer select-none group shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          {/* Slide track */}
          <div
            className="flex h-full"
            style={{
              width: `${ads.length * 100}%`,
              transform: `translateX(-${(adIndex * 100) / ads.length}%)`,
              transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {ads.map((ad, i) => (
              <div
                key={i}
                className="relative h-full flex-shrink-0 flex items-center overflow-hidden"
                style={{
                  width: `${100 / ads.length}%`,
                  background: `linear-gradient(to right, ${ad.bgFrom || '#001D4A'}, ${ad.bgTo || '#0052CC'})`,
                }}
              >
                {/* Decorative Glow */}
                <div className="absolute top-[-50%] left-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

                {/* Image on Right */}
                <div 
                  className="absolute right-0 top-0 h-full w-[45%] md:w-[50%] overflow-hidden"
                  style={{
                    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 40%)',
                    maskImage: 'linear-gradient(to right, transparent 0%, black 40%)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 z-10 mix-blend-multiply pointer-events-none" />
                  <img
                    src={ad.img}
                    alt={ad.title}
                    className="h-full w-full object-cover object-center scale-105 group-hover:scale-110"
                    style={{ transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />
                </div>

                {/* Content on Left */}
                <div className="relative z-30 px-6 md:px-10 max-w-[65%] flex flex-col items-start justify-center">
                  <div className="inline-block px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-[9px] md:text-[10px] font-black text-white tracking-widest uppercase mb-3 shadow-sm">
                    {ad.badge}
                  </div>
                  <h3 className="text-white text-xl md:text-2xl lg:text-3xl font-extrabold leading-tight mb-2 drop-shadow-md">
                    {ad.title}
                  </h3>
                  <p className="text-white/90 text-xs md:text-sm leading-relaxed max-w-sm mb-6 font-medium drop-shadow-sm hidden md:block">
                    {ad.desc}
                  </p>
                  <button className="px-6 py-2.5 bg-white text-gray-900 text-[11px] md:text-xs font-bold rounded-full hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all shadow-[0_8px_20px_-6px_rgba(255,255,255,0.4)] flex items-center gap-2">
                    {ad.cta}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5 stroke-2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Dots indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-40">
            {ads.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setAdIndex(i); }}
                className={`h-2 rounded-full transition-all duration-300 ${i === adIndex ? 'bg-white w-6 shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-white/40 w-2 hover:bg-white/60'
                  }`}
              />
            ))}
          </div>
        </div>
        ) : null} {/* end ads ternary: null = tidak ada iklan di DB */}

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
          {recommendedBanks.length === 0 ? (
            /* Skeleton Loader */
            [1, 2, 3, 4].map((loaderIdx) => (
              <div key={loaderIdx} className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-4 w-72 flex-shrink-0 animate-pulse space-y-4">
                <div className="h-40 bg-gray-200 rounded-2xl" />
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-2 bg-gray-200 rounded w-full" />
                  <div className="h-8 bg-gray-200 rounded-xl w-full" />
                </div>
              </div>
            ))
          ) : (
            recommendedBanks.map((bank, i) => {
              const { cardBg, accent, textMain } = getBankAccentStyle(bank.nama_bank);
              const score = bank.skor_kecocokan;
              
              // Tentukan salinan teks Peluang Persetujuan yang "menjual" & mudah dimengerti
              let approvalLabel = 'Cukup';
              let approvalColor = 'text-amber-600 dark:text-amber-400';
              let progressColor = 'from-amber-400 to-amber-500';
              
              if (score >= 80) {
                approvalLabel = 'Sangat Tinggi';
                approvalColor = 'text-emerald-600 dark:text-emerald-400';
                progressColor = 'from-emerald-400 to-emerald-500';
              } else if (score >= 60) {
                approvalLabel = 'Tinggi';
                approvalColor = 'text-green-600 dark:text-green-400';
                progressColor = 'from-green-400 to-green-500';
              } else {
                approvalLabel = 'Cukup / Perlu Optimasi';
                approvalColor = 'text-rose-500 dark:text-rose-400';
                progressColor = 'from-rose-400 to-rose-500';
              }

              return (
                <div
                  key={bank.id || i}
                  onClick={() => setActiveBank(bank)}
                  className="group bg-white dark:bg-[#111c3a] rounded-[28px] border border-gray-100/80 dark:border-slate-800/80 shadow-md overflow-hidden hover:shadow-xl hover:border-blue-300/50 dark:hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex-shrink-0 w-72 flex flex-col"
                >
                  {/* Bagian Atas: Gambar dengan Gradient Overlay */}
                  <div className="relative h-40 overflow-hidden shrink-0">
                    <img
                      src={bank.promo_image_url || getBankImage(bank.nama_bank)}
                      alt={bank.nama_bank}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    {/* Dark gradient overlay so white text stands out perfectly */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-transparent z-10" />
                    
                    {/* Bank & Product Text Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        <p className="text-white text-xs font-black tracking-tight drop-shadow-sm">{bank.nama_bank}</p>
                      </div>
                      <h4 className="text-white/80 text-[10px] font-bold mt-0.5 truncate drop-shadow-sm">
                        {bank.nama_produk}
                      </h4>
                    </div>

                    {/* Dynamic Match Score Badge Float */}
                    <div className="absolute top-4 right-4 z-20">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg backdrop-blur-md bg-white/90 dark:bg-slate-900/90 shadow-sm text-[9px] font-black tracking-wide ${approvalColor}`}>
                        🎯 {score}% Match
                      </span>
                    </div>
                  </div>

                  {/* Body Kartu */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    {/* Main selling point: Plafon & Bunga */}
                    <div className="space-y-4">
                      {/* Plafon Maksimal - Hero Section */}
                      <div className="text-left">
                        <span className="text-[8px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Batas Modal Maksimal</span>
                        <span className="text-lg font-black text-slate-800 dark:text-white tracking-tight block mt-0.5">
                          {formatRp(bank.plafon_max)}
                        </span>
                      </div>

                      {/* Info Bar (Bunga & Tenor) */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-3 border border-slate-100/50 dark:border-slate-800/40">
                        <div className="text-left border-r border-slate-200/50 dark:border-slate-800/50 pr-2">
                          <span className="text-[8px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Bunga Ringan</span>
                          <span className="text-xs font-black text-slate-700 dark:text-slate-200 block mt-0.5">
                            {bank.bunga_persen}% <span className="text-[8px] font-semibold text-gray-400 dark:text-gray-500">/ Bln</span>
                          </span>
                        </div>
                        <div className="text-left pl-1">
                          <span className="text-[8px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest block">Tenor s/d</span>
                          <span className="text-xs font-black text-slate-700 dark:text-slate-200 block mt-0.5">
                            {bank.tenor_max} <span className="text-[8px] font-semibold text-gray-400 dark:text-gray-500">Bulan</span>
                          </span>
                        </div>
                      </div>

                      {/* Peluang Persetujuan */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between items-center text-[9px]">
                          <span className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Peluang Disetujui</span>
                          <span className={`font-black uppercase tracking-wider text-[9px] ${approvalColor}`}>
                            {approvalLabel}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-950/50 rounded-full overflow-hidden border border-slate-100/40 dark:border-slate-800/30">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${progressColor}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Interactive CTA button at the bottom */}
                    <div className="mt-5 pt-3 border-t border-slate-50 dark:border-slate-800/30 flex items-center justify-between text-blue-600 dark:text-blue-400 font-extrabold text-xs transition-colors group-hover:text-blue-700 dark:group-hover:text-blue-300">
                      <span>Simulasi & Ajukan</span>
                      <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-slate-800/50 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-all duration-300 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 group-hover:text-white dark:group-hover:text-white group-hover:translate-x-1">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ═══ TIPS & EDUKASI ═══ */}
      {articles.length > 0 && (
        <div className="mt-8 mb-4 font-sans">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Tips &amp; Edukasi</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {articles.map((tip, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              >
                {/* Foto */}
                <div className="h-44 overflow-hidden">
                  <img src={tip.image_url} alt={tip.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
                {/* Teks */}
                <div className="p-4">
                  <p className="text-sm font-bold text-gray-800 mb-1 leading-snug">{tip.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{tip.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modal Input Omzet ── */}
      {isOmzetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => !isProcessing && setIsOmzetModalOpen(false)} />
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl z-10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-blue-600" size={20} />
                <h3 className="font-bold text-gray-800">Verifikasi Omzet Otomatis</h3>
              </div>
              {!isProcessing && (
                <button onClick={() => setIsOmzetModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-1 rounded-full transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="p-6 overflow-y-auto hide-scrollbar bg-gray-50/30">
              <p className="text-xs text-gray-500 mb-5 text-center px-4 leading-relaxed">
                Untuk mencegah manipulasi data, unggah laporan mutasi rekening atau laporan sistem POS (Point of Sales) Anda. Sistem AI kami akan otomatis memvalidasi omzet bulanan.
              </p>

              {!uploadFile ? (
                <div className="space-y-4">
                  {/* Upload Area */}
                  <div className="relative">
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-blue-50 transition-colors">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 shadow-sm">
                        <UploadCloud size={24} />
                      </div>
                      <p className="text-sm font-bold text-gray-700 mb-1">Unggah Laporan Excel / CSV</p>
                      <p className="text-[10px] text-gray-500 font-medium">Seret dan lepas file ke sini atau klik untuk mencari</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3 py-2">
                    <div className="h-px w-16 bg-gray-200"></div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ATAU</span>
                    <div className="h-px w-16 bg-gray-200"></div>
                  </div>

                  {/* Connect POS Area */}
                  <button className="w-full border border-gray-200 bg-white rounded-xl p-4 flex items-center justify-between hover:border-blue-300 hover:shadow-sm transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                        <LinkIcon size={18} className="text-gray-600 group-hover:text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-gray-800">Hubungkan Sistem POS / ERP</p>
                        <p className="text-[10px] text-gray-500">Moka, Majoo, Pawoon, dll</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Segera Hadir</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center py-6">
                  {/* Processing State */}
                  {isProcessing ? (
                    <div className="w-full max-w-xs space-y-6">
                      <div className="flex justify-center">
                        <div className="relative">
                          <Loader2 size={48} className="text-blue-600 animate-spin" />
                          <FileSpreadsheet size={20} className="text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        {[
                          { step: 1, label: 'Membaca file laporan...' },
                          { step: 2, label: 'Menganalisis transaksi bulanan...' },
                          { step: 3, label: 'Memvalidasi keabsahan data...' }
                        ].map((s) => (
                          <div key={s.step} className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${processStep > s.step ? 'bg-green-500 text-white' :
                              processStep === s.step ? 'bg-blue-500 text-white animate-pulse' :
                                'bg-gray-200 text-gray-400'
                              }`}>
                              {processStep > s.step ? '✓' : s.step}
                            </div>
                            <p className={`text-xs font-medium ${processStep >= s.step ? 'text-gray-800' : 'text-gray-400'}`}>
                              {s.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full text-center">
                      <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} />
                      </div>
                      <h4 className="text-sm font-bold text-gray-800 mb-2">Validasi Selesai!</h4>
                      <p className="text-xs text-gray-500 mb-6 px-4">
                        Data omzet Anda berhasil diekstraksi dari <span className="font-semibold text-gray-700">{uploadFile.name}</span> dan telah divalidasi.
                      </p>

                      {/* Preview Extracted Data Mini Chart / Table */}
                      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Preview Hasil Ekstraksi</span>
                          <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">Akurat 98.5%</span>
                        </div>
                        <div className="grid grid-cols-6 gap-2">
                          {tempOmzet.slice(0, 6).map((val, idx) => (
                            <div key={idx} className="flex flex-col items-center">
                              <div className="w-full bg-blue-50 rounded-t-md relative h-10 flex items-end justify-center">
                                <div className="w-full bg-blue-500 rounded-t-md opacity-80" style={{ height: `${val}%` }}></div>
                              </div>
                              <span className="text-[8px] font-bold text-gray-500 mt-1">{MONTHS[idx]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button
                onClick={() => setIsOmzetModalOpen(false)}
                disabled={isProcessing || isSaving}
                className="px-5 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveOmzet}
                disabled={isProcessing || isSaving || !uploadFile}
                className="px-6 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isSaving ? (
                  <><Loader2 size={14} className="animate-spin" /> Menyimpan...</>
                ) : (
                  'Simpan & Update Grafik'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Detail Aktivitas ── */}
      <ActivityDetailModal
        activity={activeActivity}
        onClose={() => setActiveActivity(null)}
      />

      {/* ── Modal Detail & Simulasi Bank Rekomendasi ── */}
      {activeBank && (
        <DetailModal
          bank={activeBank}
          onClose={() => setActiveBank(null)}
          onAjukan={() => {
            setActiveBank(null);
            navigate('/ajukan-pinjaman', { state: { bank: activeBank } });
          }}
        />
      )}

    </>
  );
}