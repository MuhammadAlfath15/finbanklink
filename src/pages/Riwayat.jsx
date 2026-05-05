import React, { useState } from 'react';

const TIMELINE = [
  { label: 'Dokumen Terkirim (5 Apr)', done: true },
  { label: 'Verifikasi Data Sistem', done: true },
  { label: 'Survei Lokasi oleh Bank (Jadwal: 7 Apr)', done: false },
  { label: 'Analisis Kredit Final', done: false },
  { label: 'Penandatanganan Akad', done: false },
];

export default function Riwayat() {
  const [activeTab, setActiveTab] = useState('aktif');

  return (
    <div className="flex gap-6 font-sans items-start">

      {/* ── Kiri: Kartu & Pesan ── */}
      <div className="flex-1 min-w-0 space-y-6">

        {/* Heading */}
        <h1 className="text-2xl font-extrabold text-gray-900">Kartu pengajuan saat ini</h1>

        {/* Bank Card */}
        <div
          className="relative rounded-2xl overflow-hidden p-6 text-white"
          style={{
            background: 'linear-gradient(135deg, #1a3a5c 0%, #2563a8 60%, #3b82c8 100%)',
            minHeight: '170px',
          }}
        >
          {/* Decorative diagonal shapes */}
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

          {/* Shield Icon */}
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
            <p className="text-xl font-extrabold">Bank BCA</p>
            <p className="text-sm text-white/80 mt-0.5">Nama Produk : KUR KUR AN</p>

            <div className="mt-4">
              <p className="text-xs text-white/60 tracking-widest uppercase">Status :</p>
              <p className="text-sm font-semibold text-white/70 tracking-wider mt-0.5">
                SEDANG DIVERIFIKASI BANK
              </p>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div>
                <p className="text-xs text-white/60">Nominal :</p>
                <p className="text-base font-bold">Rp.55.000.000</p>
              </div>
              <p className="text-sm font-mono text-white/70">#PRO-2026-001</p>
            </div>
          </div>
        </div>

        {/* Pesan dari bank */}
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Pesan dari bank</h2>
          <div className="flex items-start gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            {/* Warning icon */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-orange-400 flex items-center justify-center mt-0.5">
              <span className="text-orange-500 font-extrabold text-base leading-none">!</span>
            </div>
            <p className="text-sm text-gray-600 text-center flex-1">
              Petugas kami akan menghubungi Anda waktu survey pada Selasa jam 10:00 WIB. Mohon siapkan SKU asli.
            </p>
          </div>
        </div>

      </div>

      {/* ── Kanan: Timeline Panel ── */}
      <div className="w-60 flex-shrink-0">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Tab toggle */}
          <div className="flex gap-2 p-3 border-b border-gray-100">
            <button
              onClick={() => setActiveTab('aktif')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'aktif'
                  ? 'border border-gray-200 text-gray-700 bg-white shadow-sm'
                  : 'bg-[#4A90D9] text-white'
              }`}
            >
              Pengajuan aktif
            </button>
            <button
              onClick={() => setActiveTab('riwayat')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'riwayat'
                  ? 'border border-gray-200 text-gray-700 bg-white shadow-sm'
                  : 'bg-[#4A90D9] text-white'
              }`}
            >
              Riwayat
            </button>
          </div>

          {/* Timeline */}
          <div className="p-4">
            <p className="text-sm font-extrabold text-gray-900 mb-4">Timeline Proses</p>
            <div className="space-y-3">
              {TIMELINE.map((step, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  {/* Checkmark */}
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                    step.done ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke={step.done ? '#16A34A' : '#9CA3AF'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className={`text-xs leading-snug ${step.done ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Call Bank section */}
          <div className="mx-4 mb-4 bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
            <p className="text-[10px] font-extrabold text-gray-700 uppercase tracking-wide leading-snug mb-3">
              Hubungi Petugas Bank/CS Jika Ada Kendala
            </p>
            <button className="w-full py-2.5 bg-[#4A90D9] text-white text-xs font-extrabold rounded-xl uppercase tracking-widest hover:bg-[#3a7bc8] transition">
              Call Bank
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}