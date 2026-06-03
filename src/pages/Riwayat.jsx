import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Phone, MessageCircle, Copy, Check, HelpCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMySubmissions, cancelSubmission, postUserSubmissionMessage } from '../services/api';
import { buildTimeline, pickActiveSubmission, shortDate } from '../utils/submissionProgress';

const fmt = (n) => 'Rp ' + Math.round(Number(n) || 0).toLocaleString('id-ID');

/** Warna badge status (sinkron label backend → UI). */
const STATUS_STYLE = {
  Menunggu: { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  Verifikasi: { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  Survei: { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  Disetujui: { bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
  Ditolak: { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
  Dibatalkan: { bg: '#f3f4f6', text: '#4b5563', dot: '#9ca3af' },
};

function bankMessage(statusRaw, namaBank, message = '') {
  const raw = statusRaw.toLowerCase();
  let eff = raw;
  if (raw === 'menunggu' && message?.includes('[STEP:VERIFIKASI]')) eff = 'verifikasi';
  if (raw === 'menunggu' && message?.includes('[STEP:SURVEI]')) eff = 'survei';

  if (eff === 'menunggu') {
    return {
      title: 'Pengajuan sedang diproses',
      body: `Dokumen pengajuan kamu ke ${namaBank} telah diterima. Tim bank sedang meninjau skor dan berkas kamu. Kamu akan mendapat pembaruan status di halaman ini setelah bank memutuskan.`,
    };
  }
  if (eff === 'verifikasi') {
    return {
      title: 'Tahap Verifikasi',
      body: `Bank ${namaBank} sedang melakukan verifikasi data dan dokumen kamu. Harap tunggu sebentar.`,
    };
  }
  if (eff === 'survei') {
    return {
      title: 'Tahap Survei / Analisis',
      body: `Tim analis bank ${namaBank} sedang meninjau kelayakan kredit kamu. Mungkin akan ada tim yang menghubungi untuk konfirmasi.`,
    };
  }
  if (eff === 'disetujui') {
    return {
      title: 'Pengajuan disetujui bank',
      body: `Selamat! ${namaBank} telah menyetujui pengajuan kamu. Petugas bank biasanya akan menghubungi kamu untuk tahap berikutnya (akad / pencairan). Pastikan nomor kontak kamu aktif.`,
    };
  }
  if (eff === 'ditolak') {
    return {
      title: 'Pengajuan tidak disetujui',
      body: `Bank telah menolak pengajuan ini. Kamu masih bisa mencoba produk atau bank lain lewat Cari Modal, setelah memperbaiki data atau dokumen sesuai saran bank (jika ada).`,
    };
  }
  if (eff === 'dibatalkan') {
    return {
      title: 'Pengajuan dibatalkan',
      body: 'Kamu membatalkan pengajuan ini sebelum keputusan bank. Ajukan lagi kapan pun dari Cari Modal.',
    };
  }
  return { title: 'Informasi', body: '—' };
}

const BANK_CONTACTS = {
  'Bank BCA': {
    phone: '1500888',
    whatsapp: '628111500998',
    name: 'Halo BCA',
  },
  'BCA Syariah': {
    phone: '1500888',
    whatsapp: '628111500998',
    name: 'BCA Syariah CS',
  },
  'Bank Mandiri': {
    phone: '14000',
    whatsapp: '628118414000',
    name: 'Mandiri Care',
  },
  'Bank BRI': {
    phone: '1500017',
    whatsapp: '628121214017',
    name: 'Sabrina BRI',
  },
  'Bank BNI': {
    phone: '1500046',
    whatsapp: '62811500046',
    name: 'BNI Call',
  },
  'Bank BTN': {
    phone: '1500286',
    whatsapp: '628119515002',
    name: 'BTN Contact Center',
  },
  'Bank CIMB Niaga': {
    phone: '14041',
    whatsapp: '628129914041',
    name: 'CIMB Niaga CS',
  },
  'Bank Danamon': {
    phone: '1500090',
    whatsapp: '628121111500090',
    name: 'Hello Danamon',
  },
  'Bank Mega': {
    phone: '1500010',
    whatsapp: '6282208215000',
    name: 'Mila Bank Mega',
  },
  'Bank OCBC NISP': {
    phone: '1500999',
    whatsapp: '628121500999',
    name: 'Tanya OCBC NISP',
  },
  'Bank Panin': {
    phone: '1500678',
    whatsapp: '628041401678',
    name: 'Call Panin',
  },
  'Bank BSI': {
    phone: '14040',
    whatsapp: '6281511000140',
    name: 'Aisyah BSI',
  },
  'Bank Muamalat': {
    phone: '1500016',
    whatsapp: '628118015000',
    name: 'Muamalat CS',
  },
  'Bank Mega Syariah': {
    phone: '02180660900',
    whatsapp: '628041500010',
    name: 'Mega Syariah Call',
  },
  'BTPN Syariah': {
    phone: '1500300',
    whatsapp: '628121500300',
    name: 'BTPN Syariah Care',
  },
};

function getBankContact(bankName) {
  const nameClean = bankName?.trim();
  if (!nameClean) {
    return {
      phone: '02112345678',
      whatsapp: '6281234567890',
      name: 'Layanan FinbankLink',
      isFallback: true,
    };
  }
  const matchKey = Object.keys(BANK_CONTACTS).find(k => nameClean.toLowerCase().includes(k.toLowerCase()));
  if (matchKey) {
    return {
      ...BANK_CONTACTS[matchKey],
      isFallback: false,
    };
  }
  return {
    phone: '02112345678',
    whatsapp: '6281234567890',
    name: 'Layanan FinbankLink',
    isFallback: true,
  };
}

export default function Riwayat() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('aktif');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCallBankModal, setShowCallBankModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [userMsgInput, setUserMsgInput] = useState('');
  const [sendMsgLoading, setSendMsgLoading] = useState(false);

  const handleCopyRef = (refCode) => {
    navigator.clipboard.writeText(refCode);
    setCopied(true);
    toast.success('Nomor referensi berhasil disalin!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMessage = async (submissionId) => {
    if (!userMsgInput.trim()) return;
    setSendMsgLoading(true);
    try {
      await postUserSubmissionMessage(submissionId, userMsgInput.trim());
      toast.success('Pesan terkirim ke petugas bank!');
      setUserMsgInput('');
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Gagal mengirim pesan.');
    } finally {
      setSendMsgLoading(false);
    }
  };

  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await getMySubmissions();
      const list = Array.isArray(rows) ? rows : [];
      setSubmissions(list);
      // Sinkronkan cache lokal agar komponen lain konsisten (opsional)
      const main = pickActiveSubmission(list);
      if (main) {
        localStorage.setItem(
          'active_submission',
          JSON.stringify({
            id: main.id,
            nama_bank: main.nama_bank,
            nama_produk: main.nama_produk,
            nominal: main.nominal,
            tenor: main.tenor,
            cicilan: main.cicilan,
            status: main.status,
            status_raw: main.status_raw,
            submitted_at: main.submitted_at,
            submission_id: main.submission_id,
          })
        );
      } else {
        localStorage.removeItem('active_submission');
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Gagal memuat riwayat pengajuan.');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // SINKRONISASI REAL-TIME: Dengerin perubahan di tab lain (Bank Dashboard)
  useEffect(() => {
    const syncLocal = (e) => {
      if (e.key === 'local_submission_steps') load();
    };
    window.addEventListener('storage', syncLocal);
    return () => window.removeEventListener('storage', syncLocal);
  }, [load]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') load();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [load]);

  const sorted = useMemo(
    () => [...submissions].sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at)),
    [submissions]
  );

  const activeMain = useMemo(() => pickActiveSubmission(sorted), [sorted]);

  const historyRows = sorted;

  const submission = useMemo(() => {
    if (selectedSubmissionId) {
      const found = sorted.find((s) => s.id === selectedSubmissionId || s.submission_id === selectedSubmissionId);
      if (found) return found;
    }
    return activeMain;
  }, [sorted, activeMain, selectedSubmissionId]);
  const statusStyle = submission ? STATUS_STYLE[submission.status] || STATUS_STYLE.Menunggu : null;
  const refId = submission ? `#${submission.id}` : null;
  const timeline = submission
    ? buildTimeline(submission.status_raw, submission.submitted_at, submission.updated_at, submission.bank_message, submission.id)
    : [];
  const rawMsg = submission ? bankMessage(submission.status_raw, submission.nama_bank, submission.bank_message) : null;
  // Bersihkan marker teknis [STEP:...] dari pesan asli bank jika ada
  const msg = rawMsg ? { ...rawMsg, body: (submission.bank_message || rawMsg.body).replace(/\[STEP:[^\]]+\]\s*/g, '') } : null;

  const handleConfirmCancel = async () => {
    if (!submission || submission.status_raw !== 'menunggu') return;
    setCancelLoading(true);
    try {
      await cancelSubmission(submission.submission_id);
      toast.success('Pengajuan dibatalkan.');
      setShowCancelConfirm(false);
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Gagal membatalkan.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleSelectSubmission = (row) => {
    setSelectedSubmissionId(row.id || row.submission_id);
    setActiveTab('aktif');
  };

  const renderRiwayatTab = () => (
    <div className="p-4 space-y-3 max-h-[420px] overflow-y-auto">
      {historyRows.length === 0 ? (
        <p className="text-xs text-gray-400 font-medium text-center py-6">
          Belum ada pengajuan pinjaman tercatat.
        </p>
      ) : (
        historyRows.map((row) => {
          const st = STATUS_STYLE[row.status] || STATUS_STYLE.Menunggu;
          const isSelected = submission && (submission.id === row.id || submission.submission_id === row.submission_id);
          return (
            <div
              key={row.submission_id}
              onClick={() => handleSelectSubmission(row)}
              className={`rounded-xl border p-3 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'bg-blue-50/70 border-blue-300 shadow-sm ring-1 ring-blue-100'
                  : 'border-gray-100 bg-gray-50/80 hover:bg-gray-100 hover:border-gray-200 hover:-translate-y-0.5'
              }`}
            >
              <p className="text-[10px] font-mono text-gray-500">#{row.id}</p>
              <p className="text-sm font-bold text-gray-800">{row.nama_bank}</p>
              <p className="text-xs text-gray-500 mt-0.5">{fmt(row.nominal)} · {row.tenor} bln</p>
              <span
                className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: st.bg, color: st.text }}
              >
                <span className="w-1 h-1 rounded-full" style={{ background: st.dot }} />
                {row.status}
              </span>
              <p className="text-[10px] text-gray-400 mt-1">{shortDate(row.submitted_at)}</p>
            </div>
          );
        })
      )}
    </div>
  );

  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (submission) {
      // Hitung berapa banyak step yang seharusnya 'selesai' atau 'sedang jalan'
      const target = timeline.findIndex(t => !t.done && !t.current);
      const finalTarget = target === -1 ? timeline.length : target + 1;
      
      setAnimatedProgress(0);
      let cur = 0;
      const timer = setInterval(() => {
        cur++;
        setAnimatedProgress(cur);
        if (cur >= finalTarget) clearInterval(timer);
      }, 600); 
      return () => clearInterval(timer);
    }
  }, [submission?.submission_id, timeline.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] font-sans gap-3 text-gray-500">
        <Loader2 className="animate-spin text-blue-400" size={28} />
        <span className="text-sm font-medium">Memuat status pengajuan...</span>
      </div>
    );
  }

  if (!submission) {
    const hasAny = submissions.length > 0;
    return (
      <div className="flex gap-6 font-sans items-start">
        <div className="flex-1 min-w-0 space-y-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Kartu pengajuan saat ini</h1>
          <div className="rounded-2xl border-2 border-dashed border-gray-200 p-10 flex flex-col items-center gap-4 bg-gray-50">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
                <path
                  d="M9 12h6M12 9v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="#3b82f6"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="text-gray-500 font-medium text-center text-sm max-w-md">
              {hasAny
                ? 'Tidak ada pengajuan yang sedang aktif (menunggu atau disetujui). Pengajuan terakhir kamu sudah selesai, ditolak, atau dibatalkan — cek tab Riwayat di kanan.'
                : 'Tidak ada pengajuan aktif disini. Ajukan pinjaman dengan menekan tombol di bawah ini'}
            </p>
            <button
              type="button"
              onClick={() => navigate('/cari-modal')}
              className="px-6 py-2.5 rounded-xl text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)' }}
            >
              Cari Modal Sekarang
            </button>
          </div>
        </div>

        <div className="w-60 flex-shrink-0">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex gap-2 p-3 border-b border-gray-100">
              <button
                type="button"
                onClick={() => setActiveTab('aktif')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'aktif' ? 'bg-[#4A90D9] text-white' : 'border border-gray-200 text-gray-700 bg-white shadow-sm'
                  }`}
              >
                Pengajuan aktif
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('riwayat')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'riwayat' ? 'bg-[#4A90D9] text-white' : 'border border-gray-200 text-gray-700 bg-white shadow-sm'
                  }`}
              >
                Riwayat
              </button>
            </div>
            {activeTab === 'riwayat' ? (
              renderRiwayatTab()
            ) : (
              <div className="p-4 text-center">
                <p className="text-xs text-gray-400 mb-3">
                  {hasAny ? 'Tidak ada pengajuan aktif saat ini.' : 'Belum ada pengajuan.'}
                </p>
                {hasAny && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('riwayat')}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Buka riwayat →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 font-sans items-start relative">
      {showCallBankModal && submission && (() => {
        const refCode = submission.id;
        const bankName = submission.nama_bank;
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-[28px] p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 relative text-gray-800 border border-gray-100">
              
              <button 
                type="button"
                onClick={() => {
                  setShowCallBankModal(false);
                  setUserMsgInput('');
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-1.5 hover:bg-gray-50 rounded-full"
              >
                <X size={18} />
              </button>

              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3 mx-auto border border-blue-100">
                <MessageCircle className="w-5 h-5 text-[#4A90D9]" />
              </div>

              <h3 className="text-lg font-bold text-gray-900 text-center">Hubungi Petugas {bankName}</h3>
              <p className="text-xs text-gray-500 text-center mb-4 leading-relaxed max-w-xs mx-auto">
                Kirim pesan langsung ke portal verifikasi bank untuk menanyakan kendala atau progres.
              </p>

              {/* Reference Box */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-gray-400 tracking-wider uppercase">Referensi Pengajuan</p>
                  <p className="text-xs font-mono font-bold text-gray-700 mt-0.5">{refCode}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyRef(refCode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-200 ${
                    copied 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95 shadow-sm'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check size={12} />
                      Disalin!
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      Salin
                    </>
                  )}
                </button>
              </div>

              {/* Chat Thread */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 min-h-[160px] max-h-[240px] overflow-y-auto space-y-4 mb-4">
                {!submission.user_message ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-6">
                    <p className="text-xs text-gray-400 max-w-[200px] leading-relaxed">
                      Belum ada pesan terkirim. Silakan ketik pesan Anda di bawah ini untuk memulai.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Pesan Nasabah (User) */}
                    <div className="flex flex-col items-end space-y-1">
                      <div className="bg-[#4A90D9] text-white rounded-2xl rounded-tr-none px-4 py-2.5 text-xs max-w-[85%] shadow-sm leading-relaxed">
                        {submission.user_message}
                      </div>
                      <span className="text-[9px] font-bold text-gray-400 mr-1">Anda</span>
                    </div>

                    {/* Balasan Bank */}
                    {submission.bank_message ? (
                      <div className="flex flex-col items-start space-y-1">
                        <div className="bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs max-w-[85%] shadow-sm leading-relaxed">
                          {submission.bank_message}
                        </div>
                        <span className="text-[9px] font-bold text-gray-400 ml-1">{bankName}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 w-fit">
                        <Clock size={12} className="animate-pulse" />
                        <span>Menunggu balasan dari petugas bank...</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Message Input Box */}
              <div className="space-y-2">
                <textarea
                  value={userMsgInput}
                  onChange={(e) => setUserMsgInput(e.target.value)}
                  placeholder={submission.user_message ? "Ketik pesan baru untuk memperbarui..." : "Tulis pesan Anda untuk petugas bank di sini..."}
                  className="w-full h-20 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#4A90D9] transition-all resize-none leading-relaxed"
                  maxLength={1000}
                />
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCallBankModal(false);
                      setUserMsgInput('');
                    }}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-600 font-bold text-xs rounded-xl hover:bg-gray-200 transition active:scale-95"
                  >
                    Tutup
                  </button>
                  <button
                    type="button"
                    disabled={sendMsgLoading || !userMsgInput.trim()}
                    onClick={() => handleSendMessage(submission.submission_id)}
                    className="flex-1 py-2.5 bg-[#4A90D9] text-white font-bold text-xs rounded-xl hover:bg-[#3a7bc8] transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(74,144,217,0.2)] flex items-center justify-center gap-1.5"
                  >
                    {sendMsgLoading ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      submission.user_message ? 'Perbarui Pesan' : 'Kirim Pesan'
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 mx-auto border border-red-100">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                <path
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Batalkan pengajuan?</h3>
            <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
              Hanya bisa dilakukan saat status masih menunggu keputusan bank. Lanjutkan?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-200 transition"
              >
                Kembali
              </button>
              <button
                type="button"
                disabled={cancelLoading}
                onClick={handleConfirmCancel}
                className="flex-1 py-3 bg-red-500 text-white font-bold text-sm rounded-xl hover:bg-red-600 transition shadow-[0_4px_12px_rgba(239,68,68,0.3)] disabled:opacity-50"
              >
                {cancelLoading ? 'Memproses...' : 'Ya, batalkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold text-gray-900">Kartu pengajuan saat ini</h1>
          <button
            type="button"
            onClick={() => load()}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            Muat ulang
          </button>
        </div>

        <div
          className="relative rounded-2xl overflow-hidden p-6 text-white"
          style={{
            background: 'linear-gradient(135deg, #1a3a5c 0%, #2563a8 60%, #3b82c8 100%)',
            minHeight: '170px',
          }}
        >
          <svg
            className="absolute right-0 top-0 h-full opacity-30"
            viewBox="0 0 260 170"
            preserveAspectRatio="none"
            style={{ width: '55%' }}
          >
            <polygon points="80,0 260,0 260,170 0,170" fill="#4A90D9" />
            <polygon points="140,0 260,0 260,170 60,170" fill="#5BA3E8" />
            <polygon points="200,0 260,0 260,170 120,170" fill="#7ABCF5" opacity="0.6" />
          </svg>

          <div className="absolute top-4 right-5 z-10">
            <div className="w-10 h-10 bg-[#1a3a5c] rounded-full flex items-center justify-center border-2 border-white/30">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path
                  d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6L12 2z"
                  fill="#4A90D9"
                  stroke="white"
                  strokeWidth="1.5"
                />
                <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-xl font-extrabold">{submission.nama_bank}</p>
            <p className="text-sm text-white/80 mt-0.5">Nama Produk : {submission.nama_produk}</p>

            <div className="mt-3">
              <p className="text-xs text-white/60 tracking-widest uppercase">Status :</p>
              <span
                className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
                style={{ background: statusStyle.bg, color: statusStyle.text }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: statusStyle.dot }} />
                {submission.status}
              </span>
            </div>

            <div className="flex items-end justify-between mt-4">
              <div>
                <p className="text-xs text-white/60">Nominal :</p>
                <p className="text-base font-bold">{fmt(submission.nominal)}</p>
                <p className="text-xs text-white/50 mt-0.5">
                  Tenor {submission.tenor} Bulan · Cicilan {fmt(submission.cicilan)}/bln
                </p>
              </div>
              <p className="text-sm font-mono text-white/70">{refId}</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Diajukan pada:{' '}
          {new Date(submission.submitted_at).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>

        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Pesan dari bank</h2>
          <div className="flex items-start gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-blue-400 flex items-center justify-center mt-0.5">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                <path d="M12 16v-4M12 8h.01" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="9" stroke="#3b82f6" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700 mb-0.5">{msg.title}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{msg.body}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-60 flex-shrink-0">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex gap-2 p-3 border-b border-gray-100">
            {['aktif', 'riwayat'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'aktif' && activeMain) {
                    setSelectedSubmissionId(null);
                  }
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${activeTab === tab ? 'bg-[#4A90D9] text-white' : 'border border-gray-200 text-gray-700 bg-white shadow-sm'
                  }`}
              >
                {tab === 'aktif' ? 'Pengajuan aktif' : 'Riwayat'}
              </button>
            ))}
          </div>

          {activeTab === 'riwayat' ? (
            renderRiwayatTab()
          ) : (
            <>
              <div className="p-4">
                <p className="text-sm font-extrabold text-gray-900 mb-4">Timeline proses</p>
                <div className="space-y-3">
                  {timeline.map((item, i) => {
                    const isVisible = i < animatedProgress;
                    return (
                      <div key={item.key} className={`flex items-start gap-2.5 transition-opacity duration-500 ${item.skipped ? 'opacity-60' : isVisible ? 'opacity-100' : 'opacity-30'}`}>
                        <div className="flex flex-col items-center">
                          <TimelineDot item={{ ...item, done: item.done && isVisible, current: item.current && isVisible }} />
                          {i < timeline.length - 1 && (
                            <div
                              className="w-0.5 h-3 mt-1 rounded-full transition-all duration-500"
                              style={{
                                background:
                                  (item.done && timeline[i + 1]?.done && i + 1 < animatedProgress)
                                    ? '#86efac'
                                    : (item.done && isVisible)
                                      ? '#bfdbfe'
                                      : '#e5e7eb',
                              }}
                            />
                          )}
                        </div>
                        <div className="pb-1">
                          <p
                            className={`text-xs leading-snug transition-colors duration-500 ${item.done && isVisible ? 'text-gray-800 font-semibold' : item.current && isVisible ? 'text-amber-800 font-semibold' : 'text-gray-400'
                              }`}
                          >
                            {item.label}
                          </p>
                          {item.date && isVisible && (
                            <p
                              className="text-[10px] font-medium text-emerald-600 animate-in fade-in slide-in-from-left-2 duration-500"
                            >
                              {item.date}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mx-4 mb-4 bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                <p className="text-[10px] font-extrabold text-gray-700 uppercase tracking-wide leading-snug mb-3">
                  Hubungi petugas bank / CS jika ada kendala
                </p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowCallBankModal(true)}
                    className="w-full py-2.5 bg-[#4A90D9] text-white text-xs font-extrabold rounded-xl uppercase tracking-widest hover:bg-[#3a7bc8] transition active:scale-95"
                  >
                    Call bank
                  </button>
                  {submission.status_raw === 'menunggu' && (
                    <button
                      type="button"
                      onClick={() => setShowCancelConfirm(true)}
                      className="w-full py-2 bg-transparent text-red-400 text-[11px] font-bold rounded-xl uppercase tracking-wider hover:bg-red-50 hover:text-red-600 transition"
                    >
                      Batalkan pengajuan
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineDot({ item }) {
  if (item.variant === 'reject') {
    return (
      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-red-100 border border-red-200">
        <span className="text-[10px] font-black text-red-600 leading-none">✕</span>
      </div>
    );
  }
  if (item.variant === 'success') {
    return (
      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-emerald-100">
        <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
          <path d="M2 6l3 3 5-5" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  if (item.variant === 'cancel') {
    return (
      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-200">
        <span className="text-[9px] text-gray-600">—</span>
      </div>
    );
  }
  if (item.current) {
    return (
      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-amber-100 ring-2 ring-amber-300">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
      </div>
    );
  }
  if (item.done) {
    return (
      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-green-100">
        <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
          <path d="M2 6l3 3 5-5" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
  return <div className="w-5 h-5 rounded-full flex-shrink-0 bg-gray-100 border border-gray-200" />;
}
