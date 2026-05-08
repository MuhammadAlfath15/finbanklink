import React, { useState, useEffect } from 'react';
import { User, FileText, Settings, CreditCard, Info, QrCode, ShieldCheck, ChevronRight, Upload, Check, Loader2 } from 'lucide-react';
import { getProfile, updateProfile } from '../services/api';
import toast from 'react-hot-toast';

// ── Sub-panel components ────────────────────────────────────────────────────

const PersonalInfo = ({ user, onUpdate }) => {
  const [form, setForm]       = useState({ name: '', email: '', phone: '', bio: '' });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    getProfile()
      .then(data => {
        const fetched = { name: data.name || '', email: data.email || '', phone: data.phone || '', bio: data.bio || '' };
        setForm(fetched);
        onUpdate(data); // ← langsung update card biru saat data API masuk
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateProfile(form);
      onUpdate(res.user ?? form); // update card biru
      toast.success('Profil berhasil disimpan!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  const [firstName, ...rest] = (form.name || 'User').split(' ');
  const lastName = rest.join(' ');

  if (loading) return <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex items-center justify-center h-48"><Loader2 className="animate-spin text-blue-400" size={28} /></div>;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Account Settings</h2>
      <p className="text-sm text-gray-400 mb-7">Manage your personal information and preferences</p>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-600 block">Nama Depan</label>
            <input name="_firstName" type="text" value={firstName} onChange={e => setForm({ ...form, name: e.target.value + (lastName ? ' ' + lastName : '') })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm text-gray-700" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-600 block">Nama Belakang</label>
            <input name="_lastName" type="text" value={lastName} onChange={e => setForm({ ...form, name: firstName + (e.target.value ? ' ' + e.target.value : '') })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm text-gray-700" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-600 block">Nomor Telp</label>
          <input name="phone" type="text" value={form.phone} onChange={handleChange} placeholder="08xxxxxxxxxx" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm text-gray-700" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-600 block">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm text-gray-700" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-600 block">Profesional Bio</label>
          <textarea name="bio" rows={3} value={form.bio} onChange={handleChange} placeholder="Ceritakan sedikit tentang dirimu..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm text-gray-700 resize-none" />
        </div>
        <div className="flex justify-end pt-1">
          <button type="button" onClick={handleSave} disabled={saving} className="px-16 py-3 bg-[#4A90D9] text-white rounded-2xl font-bold text-sm hover:bg-blue-500 transition shadow-md shadow-blue-100 uppercase tracking-wider disabled:opacity-60 flex items-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? 'Menyimpan...' : 'SIMPAN'}
          </button>
        </div>
      </div>
    </div>
  );
};

const UploadBox = ({ label, hint }) => {
  const [uploaded, setUploaded] = useState(false);
  return (
    <label className={`flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${uploaded ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'}`}>
      <input type="file" className="hidden" onChange={() => setUploaded(true)} />
      {uploaded
        ? <Check size={22} className="text-green-500" />
        : <Upload size={22} className="text-gray-400" />}
      <span className="text-xs font-semibold text-center text-gray-600">{uploaded ? 'File terupload ✓' : label}</span>
      {!uploaded && <span className="text-[10px] text-gray-400">{hint}</span>}
    </label>
  );
};

const DocRow = ({ title, desc, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
        <div className="text-left">
          <p className="text-sm font-semibold text-gray-800">{title}</p>
          {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
        </div>
        <ChevronRight size={18} className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && <div className="px-6 pb-5 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50/50">{children}</div>}
    </div>
  );
};

const DokumenLegalitas = () => (
  <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
    <h2 className="text-2xl font-bold text-gray-800 mb-1">Dokumen Legalitas</h2>
    <p className="text-sm text-gray-400 mb-7">Manage your personal information and preferences</p>
    <div className="space-y-3">
      <DocRow title="Berkas Identitas (Wajib)" desc="KTP, KK, dan selfie untuk verifikasi identitas" defaultOpen>
        <UploadBox label="Upload KTP" hint="JPG/PNG maks. 5MB" />
        <UploadBox label="Upload Kartu Keluarga" hint="JPG/PNG maks. 5MB" />
        <UploadBox label="Selfie dengan KTP" hint="Foto langsung, maks. 5MB" />
        <UploadBox label="Tanda Tangan Digital" hint="PNG transparan, maks. 2MB" />
      </DocRow>
      <DocRow title="Berkas Izin Usaha (Legalitas Bisnis)" desc="NIB, SIUP, atau dokumen perizinan lainnya">
        <UploadBox label="Upload NIB" hint="PDF/JPG maks. 5MB" />
        <UploadBox label="Upload SIUP / TDP" hint="PDF/JPG maks. 5MB" />
        <UploadBox label="Akta Pendirian Usaha" hint="PDF maks. 10MB" />
        <UploadBox label="SK Kemenkumham" hint="PDF maks. 10MB" />
      </DocRow>
      <DocRow title="Bukti Domisili & Operasional" desc="Surat keterangan usaha dan lokasi operasional">
        <UploadBox label="Surat Keterangan Usaha" hint="Dari kelurahan/kecamatan" />
        <UploadBox label="Foto Tempat Usaha" hint="JPG/PNG maks. 5MB" />
        <UploadBox label="Bukti Kepemilikan Tempat" hint="Sertifikat / surat sewa" />
      </DocRow>
    </div>
  </div>
);

const Pengaturan = () => (
  <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
    <h2 className="text-2xl font-bold text-gray-800 mb-1">Pengaturan</h2>
    <p className="text-sm text-gray-400 mb-7">Kelola preferensi dan keamanan akun kamu</p>
    <div className="space-y-3">
      {[
        { label: 'Ganti Password', desc: 'Ubah password akun kamu secara berkala' },
        { label: 'Notifikasi', desc: 'Atur notifikasi email dan push notification' },
        { label: 'Bahasa & Wilayah', desc: 'Pilih bahasa tampilan dan zona waktu' },
        { label: 'Privasi Data', desc: 'Kelola siapa yang bisa melihat datamu' },
        { label: 'Hapus Akun', desc: 'Hapus permanen akun dan seluruh data kamu' },
      ].map((item, i) => (
        <button key={i} className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border transition hover:shadow-sm ${i === 4 ? 'border-red-100 hover:bg-red-50 text-red-500' : 'border-gray-100 hover:bg-gray-50 text-gray-700'}`}>
          <div className="text-left">
            <p className="text-sm font-semibold">{item.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
          </div>
          <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
        </button>
      ))}
    </div>
  </div>
);

const DataKeuangan = () => (
  <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
    <h2 className="text-2xl font-bold text-gray-800 mb-1">Data Keuangan</h2>
    <p className="text-sm text-gray-400 mb-7">Informasi keuangan usaha untuk keperluan pengajuan pinjaman</p>
    <div className="space-y-3">
      <DocRow title="Rekening Koran" desc="Upload 3 bulan terakhir untuk validasi cashflow" defaultOpen>
        <UploadBox label="Rekening Koran Bulan 1" hint="PDF maks. 10MB" />
        <UploadBox label="Rekening Koran Bulan 2" hint="PDF maks. 10MB" />
        <UploadBox label="Rekening Koran Bulan 3" hint="PDF maks. 10MB" />
      </DocRow>
      <DocRow title="Laporan Keuangan" desc="Neraca, laba rugi, dan arus kas usaha">
        <UploadBox label="Laporan Laba Rugi" hint="PDF/Excel maks. 10MB" />
        <UploadBox label="Neraca Keuangan" hint="PDF/Excel maks. 10MB" />
      </DocRow>
      <DocRow title="Data Aset & Utang" desc="Informasi aset dan kewajiban yang dimiliki">
        <UploadBox label="Bukti Kepemilikan Aset" hint="Sertifikat / BPKB" />
        <UploadBox label="Bukti Cicilan Berjalan" hint="Jika ada pinjaman aktif" />
      </DocRow>
    </div>
  </div>
);

const InfoUmum = () => (
  <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
    <h2 className="text-2xl font-bold text-gray-800 mb-1">Info Umum</h2>
    <p className="text-sm text-gray-400 mb-7">Informasi umum tentang usaha dan profil bisnis kamu</p>
    <div className="space-y-5">
      {[
        { label: 'Nama Toko / Usaha', placeholder: 'Contoh: Toko Maju Jaya', type: 'text' },
        { label: 'Bidang Usaha', placeholder: 'Contoh: Perdagangan, Kuliner, Jasa...', type: 'text' },
        { label: 'Alamat Usaha', placeholder: 'Jl. Contoh No. 1, Kota...', type: 'text' },
        { label: 'Lama Usaha Berjalan', placeholder: 'Contoh: 2 Tahun 3 Bulan', type: 'text' },
        { label: 'Omzet Per Bulan (estimasi)', placeholder: 'Contoh: Rp 10.000.000', type: 'text' },
        { label: 'Jumlah Karyawan', placeholder: 'Contoh: 5 orang', type: 'text' },
      ].map((f, i) => (
        <div key={i} className="space-y-1.5">
          <label className="text-sm font-medium text-gray-600 block">{f.label}</label>
          <input type={f.type} placeholder={f.placeholder} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm text-gray-700" />
        </div>
      ))}
      <div className="flex justify-end pt-1">
        <button type="button" className="px-16 py-3 bg-[#4A90D9] text-white rounded-2xl font-bold text-sm hover:bg-blue-500 transition shadow-md shadow-blue-100 uppercase tracking-wider">SIMPAN</button>
      </div>
    </div>
  </div>
);

// ── Info Grid (bawah) ───────────────────────────────────────────────────────
const InfoGrid = () => (
  <div className="grid grid-cols-5 gap-3">
    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center text-center shadow-sm">
      <div className="w-12 h-12 flex items-center justify-center mb-2">
        <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
          <rect x="6" y="20" width="36" height="24" rx="3" fill="#3B82F6" />
          <path d="M4 22L24 6L44 22" fill="#2563EB" />
          <rect x="16" y="30" width="7" height="14" rx="1" fill="white" />
          <rect x="25" y="30" width="7" height="14" rx="1" fill="white" />
          <rect x="10" y="26" width="8" height="6" rx="1" fill="white" opacity="0.8" />
          <rect x="30" y="26" width="8" height="6" rx="1" fill="white" opacity="0.8" />
        </svg>
      </div>
      <p className="text-[11px] font-bold text-gray-800 leading-tight">Nama Toko</p>
      <p className="text-[10px] text-blue-500 mt-0.5">Toko Gelap</p>
    </div>
    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center text-center shadow-sm">
      <div className="w-12 h-12 flex items-center justify-center mb-2">
        <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
          <circle cx="24" cy="24" r="20" fill="#FB923C" />
          <path d="M24 14 L26 20 L32 20 L27 24 L29 30 L24 26 L19 30 L21 24 L16 20 L22 20 Z" fill="white" />
        </svg>
      </div>
      <p className="text-[11px] font-bold text-gray-800 leading-tight">Bidang Usaha</p>
      <p className="text-[10px] text-orange-400 mt-0.5">Perdagangan</p>
    </div>
    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center text-center shadow-sm">
      <div className="w-12 h-12 flex items-center justify-center mb-2">
        <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
          <circle cx="24" cy="24" r="20" fill="#6B7280" />
          <circle cx="24" cy="24" r="2" fill="white" />
          <line x1="24" y1="24" x2="24" y2="12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="24" y1="24" x2="34" y2="27" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-[11px] font-bold text-gray-800 leading-tight">Lama Usaha</p>
      <p className="text-[10px] text-gray-400 mt-0.5">8 Bulan</p>
    </div>
    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center text-center shadow-sm">
      <div className="w-12 h-12 flex items-center justify-center mb-2">
        <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
          <path d="M24 4L8 12V24C8 33.6 15.2 42.4 24 44C32.8 42.4 40 33.6 40 24V12L24 4Z" fill="#10B981" />
          <path d="M16 24L21 29L32 18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-[11px] font-bold text-gray-800 leading-tight">Akun<br />Terproteksi</p>
      <p className="text-[10px] text-green-400 mt-0.5">Aktif</p>
    </div>
    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center text-center shadow-sm">
      <div className="w-12 h-12 flex items-center justify-center mb-2">
        <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
          <path d="M24 4C17 4 12 10 12 17C12 26 24 44 24 44C24 44 36 26 36 17C36 10 31 4 24 4Z" fill="#22C55E" />
          <circle cx="24" cy="17" r="6" fill="white" />
          <circle cx="24" cy="17" r="3" fill="#22C55E" />
        </svg>
      </div>
      <p className="text-[11px] font-bold text-gray-800 leading-tight">Lokasi</p>
      <p className="text-[10px] text-green-400 mt-0.5">Jakarta</p>
    </div>
  </div>
);

// ── Nav config ──────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: 'personal',   icon: User,       label: 'Personal Info' },
  { key: 'dokumen',    icon: FileText,   label: 'Dokumen Legalitas' },
  { key: 'pengaturan', icon: Settings,   label: 'Pengaturan' },
  { key: 'keuangan',   icon: CreditCard, label: 'Data Keuangan' },
  { key: 'info',       icon: Info,       label: 'Info Umum' },
];

// ── Main ────────────────────────────────────────────────────────────────────
const Profile = () => {
  const [user,      setUser]      = useState(JSON.parse(localStorage.getItem('user')) || { name: 'User' });
  const [activeKey, setActiveKey] = useState('personal');

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    // Sync localStorage
    localStorage.setItem('user', JSON.stringify({ ...user, ...updatedUser }));
  };

  const renderPanel = () => {
    switch (activeKey) {
      case 'dokumen':    return <DokumenLegalitas />;
      case 'pengaturan': return <Pengaturan />;
      case 'keuangan':   return <DataKeuangan />;
      case 'info':       return <InfoUmum />;
      default:           return <PersonalInfo user={user} onUpdate={handleUserUpdate} />;
    }
  };

  return (
    <div className="flex gap-6 font-sans p-2">

      {/* === SISI KIRI === */}
      <div className="w-64 flex-shrink-0 space-y-4">

        {/* Card Biru */}
        <div className="bg-[#4A90D9] rounded-3xl p-5 text-white shadow-md">
          <div className="flex justify-center mb-5">
            <div className="bg-[#5A9FE8] rounded-full p-1 flex gap-1 text-xs">
              <span className="bg-white text-[#4A90D9] font-semibold px-4 py-1 rounded-full">Personal</span>
              <span className="px-4 py-1 opacity-80 cursor-pointer">Bisnis</span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full border-4 border-white/40 overflow-hidden mb-3 shadow-lg">
              <img src="https://i.pravatar.cc/150?img=47" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-base font-semibold tracking-wide text-center">{user.name}</h2>
            <p className="text-xs opacity-80 mt-0.5">{user.phone || '—'}</p>
          </div>
          <div className="flex gap-2 mt-5">
            <button className="flex-1 bg-white/20 hover:bg-white/30 transition py-2 rounded-xl text-[10px] flex items-center justify-center gap-1.5 border border-white/20">
              <QrCode size={12} /> QR SAYA <ChevronRight size={10} />
            </button>
            <button className="flex-1 bg-white/20 hover:bg-white/30 transition py-2 rounded-xl text-[10px] flex items-center justify-center gap-1.5 border border-white/20">
              <ShieldCheck size={12} className="text-red-300" /> Proteksi Akun <ChevronRight size={10} />
            </button>
          </div>
        </div>

        {/* Menu Navigasi */}
        <div className="bg-white rounded-3xl border border-gray-100 p-3 space-y-0.5 shadow-sm">
          {NAV_ITEMS.map(({ key, icon: Icon, label }) => {
            const isActive = activeKey === key;
            return (
              <button
                key={key}
                onClick={() => setActiveKey(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition group ${isActive ? 'text-[#4A90D9]' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition ${isActive ? 'bg-[#4A90D9]' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                  <Icon size={14} className={isActive ? 'text-white' : 'text-gray-500'} />
                </div>
                <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* === SISI KANAN === */}
      <div className="flex-1 space-y-4">
        {renderPanel()}
        <InfoGrid />
      </div>
    </div>
  );
};

export default Profile;