import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

const STATUS_COLOR = {
  'DOKUMEN TERKIRIM':       { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  'SEDANG DIVERIFIKASI BANK': { bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6' },
  'SURVEI LOKASI':          { bg: '#ede9fe', text: '#5b21b6', dot: '#7c3aed' },
  'ANALISIS KREDIT':        { bg: '#f0fdf4', text: '#166534', dot: '#22c55e' },
  'SELESAI':                { bg: '#f0fdf4', text: '#166534', dot: '#16a34a' },
};

export default function Riwayat() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('aktif');

  // Baca data pengajuan dari localStorage
  const raw = localStorage.getItem('active_submission');
  const submission = raw ? JSON.parse(raw) : null;

  const statusStyle = submission
    ? (STATUS_COLOR[submission.status] ?? STATUS_COLOR['DOKUMEN TERKIRIM'])
    : null;

  const refId = submission
    ? '#' + submission.id.replace('PRO-', 'PRO-').slice(0, 12)
    : null;

  /* ── Tab Riwayat (kosong untuk sekarang) ── */
  const RiwayatTab = () => (
    <div className="p-4 text-center">
      <p className="text-xs text-gray-400 font-medium">Belum ada riwayat pengajuan yang selesai.</p>
    </div>
  );

  /* ── Empty State (belum pernah ajukan) ── */
  if (!submission) {
    return (
      <div className="flex gap-6 font-sans items-start">
        <div className="flex-1 min-w-0 space-y-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Kartu pengajuan saat ini</h1>
          <div className="rounded-2xl border-2 border-dashed border-gray-200 p-10 flex flex-col items-center gap-4 bg-gray-50">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
                <path d="M9 12h6M12 9v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium text-center text-sm">
              Kamu belum memiliki pengajuan aktif.
            </p>
            <button
              onClick={() => navigate('/cari-modal')}
              className="px-6 py-2.5 rounded-xl text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)' }}
            >
              Cari Modal Sekarang
            </button>
          </div>
        </div>

        {/* Timeline panel — kosong */}
        <div className="w-60 flex-shrink-0">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex gap-2 p-3 border-b border-gray-100">
              <button className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#4A90D9] text-white">
                Pengajuan aktif
              </button>
              <button className="flex-1 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-700 bg-white shadow-sm">
                Riwayat
              </button>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-gray-400">Belum ada pengajuan aktif.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Ada Submission ── */
  return (
    <div className="flex gap-6 font-sans items-start">

      {/* ── Kiri: Kartu & Pesan ── */}
      <div className="flex-1 min-w-0 space-y-6">

        <h1 className="text-2xl font-extrabold text-gray-900">Kartu pengajuan saat ini</h1>

        {/* Bank Card */}
        <div
          className="relative rounded-2xl overflow-hidden p-6 text-white"
          style={{
            background: 'linear-gradient(135deg, #1a3a5c 0%, #2563a8 60%, #3b82c8 100%)',
            minHeight: '170px',
          }}
        >
          {/* Decorative shapes */}
          <svg className="absolute right-0 top-0 h-full opacity-30"
            viewBox="0 0 260 170" preserveAspectRatio="none" style={{ width: '55%' }}>
            <polygon points="80,0 260,0 260,170 0,170" fill="#4A90D9" />
            <polygon points="140,0 260,0 260,170 60,170" fill="#5BA3E8" />
            <polygon points="200,0 260,0 260,170 120,170" fill="#7ABCF5" opacity="0.6" />
          </svg>

          {/* Shield icon */}
          <div className="absolute top-4 right-5 z-10">
            <div className="w-10 h-10 bg-[#1a3a5c] rounded-full flex items-center justify-center border-2 border-white/30">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6L12 2z"
                  fill="#4A90D9" stroke="white" strokeWidth="1.5" />
                <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Card content */}
          <div className="relative z-10">
            <p className="text-xl font-extrabold">{submission.nama_bank}</p>
            <p className="text-sm text-white/80 mt-0.5">Nama Produk : {submission.nama_produk}</p>

            <div className="mt-3">
              <p className="text-xs text-white/60 tracking-widest uppercase">Status :</p>
              {/* Status badge */}
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
                <p className="text-xs text-white/50 mt-0.5">Tenor {submission.tenor} Bulan · Cicilan {fmt(submission.cicilan)}/bln</p>
              </div>
              <p className="text-sm font-mono text-white/70">{refId}</p>
            </div>
          </div>
        </div>

        {/* Tanggal submit */}
        <p className="text-xs text-gray-400">
          Diajukan pada: {new Date(submission.submitted_at).toLocaleDateString('id-ID', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
          })}
        </p>

        {/* Pesan dari bank */}
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
              <p className="text-sm font-semibold text-gray-700 mb-0.5">Pengajuan sedang diproses</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Dokumen pengajuan kamu ke <strong>{submission.nama_bank}</strong> telah berhasil diterima.
                Tim bank akan menghubungi kamu dalam <strong>1–3 hari kerja</strong> untuk konfirmasi lebih lanjut.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* ── Kanan: Timeline Panel ── */}
      <div className="w-60 flex-shrink-0">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Tab toggle */}
          <div className="flex gap-2 p-3 border-b border-gray-100">
            {['aktif', 'riwayat'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === tab
                    ? 'bg-[#4A90D9] text-white'
                    : 'border border-gray-200 text-gray-700 bg-white shadow-sm'
                }`}
              >
                {tab === 'aktif' ? 'Pengajuan aktif' : 'Riwayat'}
              </button>
            ))}
          </div>

          {activeTab === 'riwayat' ? <RiwayatTab /> : (
            <>
              {/* Timeline */}
              <div className="p-4">
                <p className="text-sm font-extrabold text-gray-900 mb-4">Timeline Proses</p>
                <div className="space-y-3">
                  {submission.timeline.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      {/* Circle + connector */}
                      <div className="flex flex-col items-center">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          item.done ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                            <path d="M2 6l3 3 5-5"
                              stroke={item.done ? '#16A34A' : '#9CA3AF'}
                              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        {i < submission.timeline.length - 1 && (
                          <div className="w-0.5 h-3 mt-1" style={{ background: item.done ? '#86efac' : '#e5e7eb' }} />
                        )}
                      </div>
                      <div className="pb-1">
                        <p className={`text-xs leading-snug ${item.done ? 'text-gray-800 font-semibold' : 'text-gray-400'}`}>
                          {item.label}
                        </p>
                        {item.date && (
                          <p className="text-[10px] text-green-600 font-medium">{item.date}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call Bank */}
              <div className="mx-4 mb-4 bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                <p className="text-[10px] font-extrabold text-gray-700 uppercase tracking-wide leading-snug mb-3">
                  Hubungi Petugas Bank/CS Jika Ada Kendala
                </p>
                <button className="w-full py-2.5 bg-[#4A90D9] text-white text-xs font-extrabold rounded-xl uppercase tracking-widest hover:bg-[#3a7bc8] transition">
                  Call Bank
                </button>
              </div>
            </>
          )}

        </div>
      </div>

    </div>
  );
}