import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  FileText, Clock, CheckCircle, XCircle, Search,
  Filter, ChevronRight, Download, Building,
  CreditCard, Activity, ExternalLink, Loader2, ChevronDown,
  Lock, Shield,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getBankSubmissions, getBankSubmission, updateBankSubmissionStatus } from '../services/api';
import OmzetLineChart from '../components/OmzetLineChart';

const formatRp = (angka) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

const getStatusColor = (status) => {
  switch (status) {
    case 'Disetujui':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Ditolak':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    default:
      return 'bg-amber-100 text-amber-700 border-amber-200';
  }
};

const getScoreColor = (score) => {
  if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
  return 'text-rose-600 bg-rose-50 border-rose-200';
};

const METRIC_LABELS = [
  { key: 'skor_profitabilitas', label: 'Profitabilitas' },
  { key: 'skor_legalitas', label: 'Legalitas' },
  { key: 'skor_tren_omzet', label: 'Tren Omzet' },
  { key: 'skor_kolektibilitas', label: 'Kolektibilitas' },
  { key: 'skor_keberlanjutan', label: 'Keberlanjutan' },
  { key: 'skor_kapasitas_utang', label: 'Kap. Utang' },
];

export default function BankDashboard() {
  const [activeTab, setActiveTab] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');

  // Preferensi privasi nasabah
  const [privacyPrefs, setPrivacyPrefs] = useState(() => {
    try {
      const stored = localStorage.getItem('privacy_prefs');
      return stored ? JSON.parse(stored) : { profil_publik: true, skor_publik: true, analitik: true, akses_dokumen: true };
    } catch {
      return { profil_publik: true, skor_publik: true, analitik: true, akses_dokumen: true };
    }
  });

  // Dekripsi berkas finansial
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpSending, setOtpSending] = useState(false);

  const isSkorPublik = privacyPrefs.skor_publik !== false;
  const isAksesDokumenTerbatas = privacyPrefs.akses_dokumen === true;

  // Sinkronisasi preferensi privasi secara real-time
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('privacy_prefs');
        if (stored) {
          setPrivacyPrefs(JSON.parse(stored));
        }
      } catch (err) {
        console.error('Failed to sync privacy prefs:', err);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    // Juga sinkronisasi saat visibility berubah
    const handleVis = () => {
      if (document.visibilityState === 'visible') {
        handleStorageChange();
      }
    };
    document.addEventListener('visibilitychange', handleVis);
    // Jalankan sekali di mount
    handleStorageChange();
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVis);
    };
  }, []);

  // Enterprise scale sorting & pagination states
  const [sortBy, setSortBy] = useState('date_desc');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, scoreFilter, sortBy]);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await getBankSubmissions();
      setData(Array.isArray(rows) ? rows : []);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Gagal memuat daftar pengajuan.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const stats = useMemo(
    () => ({
      total: data.length,
      menunggu: data.filter((d) => ['Menunggu', 'Verifikasi', 'Survei'].includes(d.status)).length,
      disetujui: data.filter((d) => d.status === 'Disetujui').length,
      ditolak: data.filter((d) => d.status === 'Ditolak').length,
    }),
    [data]
  );

  const filteredData = useMemo(() => {
    const result = data.filter((item) => {
      let matchTab = true;
      if (activeTab !== 'Semua') {
        if (activeTab === 'Menunggu') {
          matchTab = ['Menunggu', 'Verifikasi', 'Survei'].includes(item.status);
        } else {
          matchTab = item.status === activeTab;
        }
      }
      const q = searchQuery.toLowerCase();
      const matchSearch =
        (item.umkm || '').toLowerCase().includes(q) ||
        (item.id || '').toLowerCase().includes(q) ||
        String(item.owner || '')
          .toLowerCase()
          .includes(q);
      
      let matchScore = true;
      if (scoreFilter === 'high') {
        matchScore = (item.score ?? 0) >= 80;
      } else if (scoreFilter === 'low') {
        matchScore = (item.score ?? 0) < 60;
      }
      
      return matchTab && matchSearch && matchScore;
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'date_desc') {
        return b.submission_id - a.submission_id;
      }
      if (sortBy === 'date_asc') {
        return a.submission_id - b.submission_id;
      }
      if (sortBy === 'score_desc') {
        return (b.score ?? 0) - (a.score ?? 0);
      }
      if (sortBy === 'score_asc') {
        return (a.score ?? 0) - (b.score ?? 0);
      }
      if (sortBy === 'amount_desc') {
        return (b.amount ?? 0) - (a.amount ?? 0);
      }
      if (sortBy === 'amount_asc') {
        return (a.amount ?? 0) - (b.amount ?? 0);
      }
      return 0;
    });
  }, [data, activeTab, searchQuery, scoreFilter, sortBy]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  }, [filteredData.length]);

  const openDetail = async (item) => {
    setSelectedRequest(item);
    setDetail(null);
    setIsModalOpen(true);
    setDetailLoading(true);
    setAdminMessage('');
    setIsDecrypted(false);
    setShowOtpModal(false);
    setOtpInput('');
    try {
      const d = await getBankSubmission(item.submission_id);
      setDetail(d);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Gagal memuat detail pengajuan.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedRequest(null);
      setDetail(null);
      setIsDecrypted(false);
      setShowOtpModal(false);
      setOtpInput('');
    }, 200);
  };

  const handleRequestDecryption = () => {
    setOtpSending(true);
    const toastId = toast.loading('Mengirimkan permintaan persetujuan berkas ke WhatsApp pelaku UMKM...');
    setTimeout(() => {
      toast.dismiss(toastId);
      toast.success('Permintaan Persetujuan WhatsApp Terkirim! Kode OTP simulasi dikirim ke nomor nasabah.', { duration: 4000 });
      setOtpSending(false);
      setShowOtpModal(true);
    }, 1500);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otpInput === '123456') {
      toast.success('Dekripsi Berhasil! Berkas finansial sensitif sekarang didekripsi.');
      setIsDecrypted(true);
      setShowOtpModal(false);
    } else {
      toast.error('Kode OTP tidak valid. Silakan periksa kembali pesan WhatsApp nasabah.');
    }
  };

  const handleAction = async (submissionId, action) => {
    setActionLoading(true);
    let targetStatus = action.toLowerCase();
    let finalMessage = adminMessage;

    // Normalisasi action ke status backend
    if (action === 'approve') targetStatus = 'disetujui';
    if (action === 'reject') targetStatus = 'ditolak';

    try {
      // Kirim status dan pesan langsung ke backend asli!
      await updateBankSubmissionStatus(submissionId, targetStatus, finalMessage);
      
      // Hapus status simulasi lokal
      const localSteps = JSON.parse(localStorage.getItem('local_submission_steps') || '{}');
      delete localSteps[selectedRequest.id];
      delete localSteps[submissionId];
      localStorage.setItem('local_submission_steps', JSON.stringify(localSteps));
      
      let actionText = '';
      if (targetStatus === 'disetujui') {
        actionText = 'disetujui';
      } else if (targetStatus === 'ditolak') {
        actionText = 'ditolak';
      } else {
        actionText = `ke tahap ${action} berhasil dimulai`;
      }
      
      toast.success(`Pengajuan ${actionText}.`);
      
      closeDetail(); // Tutup modal
      await loadList(); // Refresh data
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Gagal memperbarui status.');
    } finally {
      setActionLoading(false);
    }
  };

  const d = detail || selectedRequest;
  const health = detail?.health;
  const ringScore = selectedRequest?.score ?? 0;

  return (
    <div className="font-sans min-h-full pb-10">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Portal Verifikasi Bank</h1>
          <p className="text-gray-500 text-sm">
            Pantau pengajuan dari nasabah, skor kesehatan bisnis, omzet, dan berkas untuk validasi kelayakan modal.
          </p>
        </div>
        <button
          type="button"
          onClick={() => toast('Ekspor laporan: sambungkan endpoint unduhan di backend.')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all"
        >
          <Download size={16} />
          Unduh Laporan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          icon={<FileText size={24} className="text-blue-500" />}
          title="Total Pengajuan"
          value={stats.total}
          bg="bg-blue-50"
          border="border-blue-100"
        />
        <StatCard
          icon={<Clock size={24} className="text-amber-500" />}
          title="Menunggu Verifikasi"
          value={stats.menunggu}
          bg="bg-amber-50"
          border="border-amber-100"
        />
        <StatCard
          icon={<CheckCircle size={24} className="text-emerald-500" />}
          title="Disetujui"
          value={stats.disetujui}
          bg="bg-emerald-50"
          border="border-emerald-100"
        />
        <StatCard
          icon={<XCircle size={24} className="text-rose-500" />}
          title="Ditolak"
          value={stats.ditolak}
          bg="bg-rose-50"
          border="border-rose-100"
        />
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex gap-2 p-1 bg-gray-50 rounded-xl w-full md:w-auto overflow-x-auto hide-scrollbar">
            {['Semua', 'Menunggu', 'Disetujui', 'Ditolak'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${activeTab === tab
                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] lg:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari ID, UMKM, atau pemilik..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
              />
            </div>

            {/* Filter Skor */}
            <div className="relative">
              <select
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
                className="pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all cursor-pointer appearance-none"
              >
                <option value="all">Semua Skor</option>
                <option value="high">🌟 Prioritas (Skor ≥ 80)</option>
                <option value="low">⚠️ Berisiko (Skor &lt; 60)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
                <ChevronDown size={14} />
              </div>
            </div>

            {/* Sort Selector */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all cursor-pointer appearance-none"
              >
                <option value="date_desc">📅 Pengajuan Terbaru</option>
                <option value="date_asc">📅 Pengajuan Terlama</option>
                <option value="score_desc">📈 Skor Tertinggi</option>
                <option value="score_asc">📉 Skor Terendah</option>
                <option value="amount_desc">💰 Nominal Terbesar</option>
                <option value="amount_asc">💰 Nominal Terkecil</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-[11px] uppercase tracking-wider text-gray-500 font-bold border-b border-gray-100">
                <th className="p-4 pl-6 font-semibold">ID &amp; Tanggal</th>
                <th className="p-4 font-semibold">Profil UMKM</th>
                <th className="p-4 font-semibold">Pinjaman &amp; Tenor</th>
                <th className="p-4 font-semibold text-center">Skor (ringkas)</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 pr-6 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    <Loader2 className="animate-spin inline text-blue-400" size={28} />
                    <p className="text-sm mt-2">Memuat pengajuan...</p>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-500 text-sm">
                    {data.length === 0
                      ? 'Belum ada pengajuan. Saat nasabah menyelesaikan alur pengajuan (OTP + dokumen), data akan muncul di sini.'
                      : 'Tidak ada data yang cocok dengan filter.'}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => {
                  const localSteps = JSON.parse(localStorage.getItem('local_submission_steps') || '{}');
                  const displayStatus = localSteps[item.id] || item.status;
                  
                  return (
                    <tr key={item.submission_id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="p-4 pl-6 align-middle">
                        <p className="font-bold text-gray-800 text-sm">{item.id}</p>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <Clock size={10} /> {item.date}
                        </p>
                      </td>
                      <td className="p-4 align-middle max-w-[220px]">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-gray-800 text-sm truncate max-w-[130px]">{item.umkm}</p>
                          {item.score >= 80 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase tracking-widest flex-shrink-0">
                              Prioritas
                            </span>
                          )}
                          {item.score < 60 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black bg-rose-50 text-rose-600 border border-rose-200 uppercase tracking-widest flex-shrink-0">
                              Risiko
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{item.businessType}</p>
                      </td>
                      <td className="p-4 align-middle">
                        <p className="font-bold text-gray-800 text-sm">{formatRp(item.amount)}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.product} • {item.tenor} Bln
                        </p>
                      </td>
                      <td className="p-4 align-middle text-center">
                        {!isSkorPublik ? (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl cursor-not-allowed"
                            title="Terproteksi Privasi"
                          >
                            <span>🔒</span> Terkunci
                          </span>
                        ) : (
                          <div
                            className={`inline-flex items-center justify-center w-9 h-9 rounded-full border text-sm font-bold ${getScoreColor(item.score)}`}
                            title="Skala 0–100 dari total skor /600"
                          >
                            {item.score}
                          </div>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(displayStatus)}`}
                        >
                          {(displayStatus === 'Menunggu' || displayStatus === 'Verifikasi' || displayStatus === 'Survei') && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />}
                          {displayStatus === 'Disetujui' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />}
                          {displayStatus === 'Ditolak' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />}
                          {displayStatus}
                        </span>
                      </td>
                      <td className="p-4 pr-6 align-middle text-right">
                        <button
                          type="button"
                          onClick={() => openDetail(item)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm group-hover:scale-105 active:scale-95"
                          aria-label="Detail"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p className="font-medium">
            Menampilkan <span className="text-gray-900 font-bold">{filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> sampai{' '}
            <span className="text-gray-900 font-bold">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> dari{' '}
            <span className="text-gray-900 font-bold">{filteredData.length}</span> pengajuan
            {scoreFilter !== 'all' || searchQuery ? ' (terfilter)' : ''}
          </p>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Sebelumnya
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const isCurrent = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-100'
                        : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Selanjutnya
              </button>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeDetail}
            aria-hidden="true"
          />

          <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Detail Pengajuan</h2>
                <p className="text-sm text-gray-500 mt-1">
                  ID: <span className="font-medium text-gray-700">{selectedRequest.id}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={closeDetail}
                className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-colors"
                aria-label="Tutup"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 bg-gray-50/30 hide-scrollbar">
              {['Menunggu', 'Verifikasi', 'Survei'].includes(selectedRequest.status) && (
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
                  <Activity className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-amber-800">Proses Berjalan: {selectedRequest.status}</h4>
                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                      Tinjau skor kesehatan, grafik omzet, dan berkas. Lanjutkan ke tahap berikutnya jika sesuai kriteria.
                    </p>
                  </div>
                </div>
              )}

              {detailLoading && (
                <div className="flex justify-center py-16">
                  <Loader2 className="animate-spin text-blue-400" size={36} />
                </div>
              )}

              {!detailLoading && d && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Transparansi Pengajuan Aktif Lainnya */}
                    {detail?.other_active_submissions && detail.other_active_submissions.length > 0 && (
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 p-6 rounded-2xl border border-amber-200 shadow-sm relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
                        <h3 className="text-sm font-black text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                          ⚠️ Transparansi Pengajuan Aktif Lainnya
                        </h3>
                        <p className="text-xs text-amber-700 leading-relaxed font-semibold mb-4">
                          Perhatian: Nasabah terdeteksi mengajukan pinjaman di bank lain pada waktu bersamaan. Hal ini dapat meningkatkan risiko kapasitas utang nasabah (Over-leveraging).
                        </p>
                        <div className="bg-white rounded-xl border border-amber-200/60 overflow-hidden">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-amber-50/40 text-[10px] uppercase font-bold text-amber-800 border-b border-amber-100">
                                <th className="p-3 pl-4">Bank</th>
                                <th className="p-3">Produk</th>
                                <th className="p-3">Nominal</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 pr-4 text-right">Tanggal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-100/50 text-gray-700 font-semibold">
                              {detail.other_active_submissions.map((other, idx) => (
                                <tr key={idx} className="hover:bg-amber-50/20">
                                  <td className="p-3 pl-4 text-amber-900">{other.nama_bank}</td>
                                  <td className="p-3">{other.nama_produk}</td>
                                  <td className="p-3 text-amber-700 font-black">{formatRp(other.nominal)}</td>
                                  <td className="p-3">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-wider">
                                      {other.status}
                                    </span>
                                  </td>
                                  <td className="p-3 pr-4 text-right text-gray-400 font-normal">{other.date}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Building size={16} className="text-blue-500" /> Profil pemohon &amp; usaha
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                        <DetailItem label="Nama usaha" value={d.umkm || '—'} />
                        <DetailItem label="Bidang usaha" value={d.businessType || '—'} />
                        <DetailItem label="Nama pemilik (KTP)" value={d.owner || '—'} />
                        <DetailItem label="Nomor telepon" value={d.phone || '—'} />
                        <DetailItem label="NIK" value={d.ktp_nik || '—'} />
                        <DetailItem label="Email" value={d.user_email || '—'} />
                        <div className="sm:col-span-2">
                          <DetailItem label="Alamat (KTP)" value={d.pemohon_alamat || '—'} />
                        </div>
                        <div className="sm:col-span-2">
                          <DetailItem label="Alamat usaha" value={d.address || '—'} />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <CreditCard size={16} className="text-emerald-500" /> Detail pinjaman
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                        <DetailItem label="Bank" value={d.bank_nama || '—'} />
                        <DetailItem label="Produk pinjaman" value={d.product || '—'} />
                        <DetailItem label="Nominal pengajuan" value={formatRp(d.amount)} highlight />
                        <DetailItem label="Tenor" value={`${d.tenor} Bulan`} />
                        <DetailItem
                          label="Estimasi cicilan / bulan"
                          value={d.cicilan_per_bulan != null ? formatRp(Number(d.cicilan_per_bulan)) : '—'}
                        />
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FileText size={16} className="text-indigo-500" /> Berkas pengajuan
                      </h3>
                      {isAksesDokumenTerbatas && !isDecrypted ? (
                        <div className="space-y-4">
                          <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex gap-3 items-center">
                            <Lock className="text-rose-500 flex-shrink-0" size={20} />
                            <div>
                              <p className="text-xs font-bold text-rose-800">🔒 Berkas Finansial Terkunci</p>
                              <p className="text-[11px] text-rose-600 mt-0.5 leading-relaxed">
                                Nasabah mengaktifkan perlindungan akses dokumen. Kunci persetujuan OTP diperlukan.
                              </p>
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            disabled={otpSending}
                            onClick={handleRequestDecryption}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-blue-100 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {otpSending ? <Loader2 size={14} className="animate-spin" /> : 'Minta Kunci Dekripsi'}
                          </button>
                        </div>
                      ) : (
                        detail?.documents?.length ? (
                          <ul className="space-y-2">
                            {detail.documents.map((doc) => (
                              <li key={doc.key}>
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors text-sm font-semibold text-gray-800"
                                >
                                  <span className="flex items-center gap-2">
                                    {isAksesDokumenTerbatas && <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />}
                                    {doc.label}
                                  </span>
                                  <ExternalLink size={16} className="text-blue-500 flex-shrink-0" />
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">Tidak ada tautan berkas.</p>
                        )
                      )}
                    </div>

                    <div className="relative">
                      {!isSkorPublik && (
                        <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-[4px] rounded-3xl flex flex-col items-center justify-center p-4 border border-gray-100/50">
                          <Lock className="text-gray-400 w-8 h-8 mb-2" />
                          <p className="text-xs font-bold text-gray-500 text-center">Grafik Finansial Terproteksi Privasi</p>
                        </div>
                      )}
                      <OmzetLineChart
                        chartPoints={detail?.omzet?.data}
                        title={`Grafik omzet nasabah (${detail?.omzet?.year ?? new Date().getFullYear()})`}
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-[#001D4A] p-6 rounded-2xl shadow-md text-white relative overflow-hidden">
                      <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-50" />
                      <h3 className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-6 relative z-10 flex items-center gap-2">
                        <Activity size={16} /> Skor kesehatan bisnis
                      </h3>

                      {!isSkorPublik ? (
                        <div className="relative z-10 min-h-[300px] flex flex-col items-center justify-center text-center p-4">
                          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 mb-4 shadow-lg animate-pulse">
                            <Lock className="text-amber-400 w-8 h-8" />
                          </div>
                          <h4 className="text-sm font-extrabold tracking-wide uppercase text-amber-400 mb-2">🔒 Skor Kesehatan Terproteksi</h4>
                          <p className="text-xs text-blue-200 leading-relaxed max-w-[200px]">
                            Nasabah menonaktifkan visibilitas skor kesehatan publik demi kedaulatan privasi data usaha.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col items-center justify-center relative z-10 mb-6">
                            <div
                              className={`w-28 h-28 rounded-full border-4 flex items-center justify-center bg-white/10 backdrop-blur-sm ${ringScore >= 80 ? 'border-emerald-400' : ringScore >= 60 ? 'border-blue-400' : 'border-rose-400'
                                }`}
                            >
                              <span className="text-4xl font-black">{ringScore}</span>
                            </div>
                            <p className="text-xs font-medium text-blue-200 mt-3 text-center px-2">
                              Ringkasan 0–100 dari total <strong className="text-white">{health?.skor_total ?? '—'}</strong> / 600
                            </p>
                          </div>

                          <div className="space-y-2 relative z-10 text-xs">
                            {METRIC_LABELS.map(({ key, label }) => (
                              <div
                                key={key}
                                className="flex items-center justify-between border-b border-white/10 pb-2 last:border-0"
                              >
                                <span className="text-blue-100">{label}</span>
                                <span className="font-bold text-white">{health?.[key] ?? '—'}</span>
                              </div>
                            ))}
                          </div>

                          {detail?.health_labels && (
                            <div className="mt-4 pt-4 border-t border-white/10 relative z-10 space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-blue-100">Kolektibilitas</span>
                                <span className="font-bold text-emerald-300">{detail.health_labels.kolektibilitas}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-blue-100">Legalitas (indikator)</span>
                                <span className="font-bold text-emerald-300">{detail.health_labels.legalitas}</span>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {['Menunggu', 'Verifikasi', 'Survei'].includes(selectedRequest.status) && (
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-6">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                          📝 Catatan untuk Nasabah (Opsional)
                        </h3>
                        <textarea
                          value={adminMessage}
                          onChange={(e) => setAdminMessage(e.target.value)}
                          placeholder="Masukkan alasan, syarat tambahan, atau pesan lainnya ke nasabah..."
                          className="w-full h-32 p-3 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all resize-none"
                        ></textarea>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-8 py-5 border-t border-gray-100 bg-white sticky bottom-0 z-10 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDetail}
                className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
              >
                Tutup
              </button>

              {(() => {
                const localSteps = JSON.parse(localStorage.getItem('local_submission_steps') || '{}');
                const displayStatus = localSteps[selectedRequest.id] || selectedRequest.status;
                const isOngoing = ['Menunggu', 'Verifikasi', 'Survei'].includes(displayStatus);

                if (!isOngoing) return null;

                return (
                  <>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleAction(selectedRequest.submission_id, 'reject')}
                      className="px-6 py-2.5 rounded-xl bg-rose-50 text-rose-600 font-bold text-sm hover:bg-rose-100 hover:shadow-sm transition-all disabled:opacity-50"
                    >
                      Tolak pengajuan
                    </button>

                    {displayStatus === 'Menunggu' && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleAction(selectedRequest.submission_id, 'Verifikasi')}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-600/20 hover:bg-blue-700 hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {actionLoading && <Loader2 size={16} className="animate-spin" />}
                        Mulai Verifikasi
                      </button>
                    )}

                    {displayStatus === 'Verifikasi' && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleAction(selectedRequest.submission_id, 'Survei')}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {actionLoading && <Loader2 size={16} className="animate-spin" />}
                        Lanjut ke Survei
                      </button>
                    )}

                    {displayStatus === 'Survei' && (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleAction(selectedRequest.submission_id, 'approve')}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {actionLoading && <Loader2 size={16} className="animate-spin" />}
                        Setujui &amp; proses
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {showOtpModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowOtpModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
            {/* Background elements for premium feel */}
            <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-20%] w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <button
              onClick={() => setShowOtpModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition-colors"
            >
              <XCircle size={18} />
            </button>

            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl flex items-center justify-center mb-5 mx-auto shadow-sm">
              <Shield size={28} strokeWidth={2.5} className="text-indigo-600" />
            </div>

            <h3 className="text-xl font-black text-gray-900 text-center mb-2">Dekripsi Berkas Sensitif</h3>
            <p className="text-xs text-gray-500 text-center leading-relaxed mb-6 px-4">
              Silakan masukkan 6-digit kode OTP persetujuan yang telah dikirim ke nomor WhatsApp pelaku UMKM <strong>({selectedRequest?.phone || 'nasabah'})</strong>.
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block text-center">Kode Verifikasi OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="******"
                  className="w-full text-center px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 text-2xl font-black tracking-[0.75em] text-gray-800 placeholder-gray-300"
                  autoFocus
                />
                <p className="text-[10px] text-gray-400 text-center font-medium">
                  Petunjuk Pengembang: Gunakan kode <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">123456</span> untuk demo.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-xs font-black uppercase tracking-wider text-gray-500 hover:bg-gray-50 transition-all active:scale-[0.98]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={otpInput.length !== 6}
                  className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Verifikasi & Dekripsi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, title, value, bg, border }) {
  return (
    <div className={`p-5 rounded-2xl border ${border} ${bg} relative overflow-hidden group`}>
      <div className="absolute right-[-10%] top-[-10%] w-24 h-24 bg-white opacity-40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-3xl font-black text-gray-900">{value}</h3>
        </div>
        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center">{icon}</div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, highlight }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-sm ${highlight ? 'font-black text-blue-600 text-lg' : 'font-semibold text-gray-800'}`}>{value}</p>
    </div>
  );
}
