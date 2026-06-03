import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  User, FileText, Settings, CreditCard, Info, ChevronRight, Upload, Loader2, Camera,
  CheckCircle2, Lock, Bell, Globe, Eye, EyeOff, Shield, Trash2, ChevronDown, X, AlertTriangle, Moon, Sun,
  Activity, Landmark, Sparkles, TrendingUp, BadgeCheck, Clock,
} from 'lucide-react';
import { getProfile, updateProfile, getBusinessProfile, updateBusinessProfile, changePassword } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import defaultAvatar from '../assets/profile_avatar.png';

const formatRupiah = (val) => {
  if (!val && val !== 0) return '';
  return Number(val).toLocaleString('id-ID');
};
const parseRupiah = (str) => String(str).replace(/\D/g, '');

const getCroppedImg = (imageSrc, scale, xPercent, yPercent) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 300; // standard high-quality avatar size
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, size, size);

      const imgRatio = img.width / img.height;
      let drawWidth, drawHeight;

      if (imgRatio > 1) {
        // Landscape: width fits container, height scales down (contain)
        drawWidth = size;
        drawHeight = size / imgRatio;
      } else {
        // Portrait: height fits container, width scales down (contain)
        drawHeight = size;
        drawWidth = size * imgRatio;
      }

      const scaledWidth = drawWidth * scale;
      const scaledHeight = drawHeight * scale;

      const translateX = (xPercent / 100) * size * scale;
      const translateY = (yPercent / 100) * size * scale;

      const centerX = (size - scaledWidth) / 2;
      const centerY = (size - scaledHeight) / 2;

      const destX = centerX + translateX;
      const destY = centerY + translateY;

      ctx.drawImage(img, destX, destY, scaledWidth, scaledHeight);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = (err) => reject(err);
  });
};

// ── Sub-panel components ────────────────────────────────────────────────────

const PersonalInfo = ({ user, onUpdate }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', bio: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

/** Tombol unggah — sinkron dengan Update Bisnis / API business-profile */
const BizFileButton = ({ id, label, hint, file, hasExisting, status, feedback, accept, onChange }) => {
  const inputRef = useRef(null);
  const ok = file || hasExisting;
  const isPending = ok && status !== 'approved' && status !== 'rejected';

  return (
    <div className="relative w-full">
      <input ref={inputRef} id={id} type="file" accept={accept} className="hidden" onChange={onChange} />
      <div className={`w-full rounded-xl border-2 transition-all p-3.5 bg-white ${
        status === 'rejected'
          ? 'border-rose-300 hover:border-rose-400 bg-rose-50/10'
          : status === 'approved'
            ? 'border-emerald-400 bg-emerald-50/20'
            : isPending
              ? 'border-amber-300 hover:border-amber-400 bg-amber-50/10'
              : 'border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/40'
      }`}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            {status === 'approved' ? (
              <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
            ) : status === 'rejected' ? (
              <X size={18} className="text-rose-500 flex-shrink-0" />
            ) : isPending ? (
              <Clock size={18} className="text-amber-500 flex-shrink-0 animate-pulse" />
            ) : (
              <Upload size={18} className="text-blue-400 flex-shrink-0" />
            )}
            <span className={`text-xs font-bold truncate ${
              status === 'approved'
                ? 'text-emerald-700'
                : status === 'rejected'
                  ? 'text-rose-700 font-extrabold'
                  : isPending
                    ? 'text-amber-700'
                    : 'text-gray-600'
            }`}>
              {label}
            </span>
          </div>
          
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={`text-[10px] font-black px-2.5 py-1 rounded-lg border transition-all ${
              status === 'approved'
                ? 'text-emerald-600 bg-emerald-50 border-emerald-200 pointer-events-none opacity-60'
                : status === 'rejected'
                  ? 'text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-100'
                  : isPending
                    ? 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100'
                    : 'text-blue-500 bg-blue-50 border-blue-100 hover:bg-blue-100'
            }`}
          >
            {file ? 'Ganti' : status === 'rejected' ? 'Upload Ulang' : hasExisting ? 'Ganti' : 'Pilih'}
          </button>
        </div>

        {/* Existing file / status text info */}
        {file ? (
          <p className="text-[10px] text-amber-600 font-semibold truncate">File terpilih: {file.name} (belum disimpan)</p>
        ) : status === 'approved' ? (
          <p className="text-[10px] text-emerald-600 font-semibold">Telah disetujui & diverifikasi oleh Admin.</p>
        ) : status === 'rejected' ? (
          <div className="space-y-1">
            <p className="text-[10px] text-rose-600 font-black">DITOLAK ADMIN ✗</p>
            {feedback && <p className="text-[10px] text-rose-500 font-medium bg-rose-50/80 p-2 rounded-lg border border-rose-100">{feedback}</p>}
          </div>
        ) : hasExisting ? (
          <p className="text-[10px] text-amber-600 font-semibold">Berkas tersimpan & menunggu verifikasi Admin.</p>
        ) : (
          hint && <p className="text-[10px] text-gray-400">{hint}</p>
        )}
      </div>
    </div>
  );
};

const BizCameraButton = ({ id, label, preview, file, hasExisting, status, feedback, onChange }) => {
  const inputRef = useRef(null);
  const ok = preview || file || hasExisting;
  const isPending = ok && status !== 'approved' && status !== 'rejected';

  return (
    <div className="relative w-full">
      <input ref={inputRef} id={id} type="file" accept="image/*" capture="environment" className="hidden" onChange={onChange} />
      <div className={`w-full rounded-xl border-2 transition-all p-3.5 bg-white ${
        status === 'rejected'
          ? 'border-rose-300 bg-rose-50/10'
          : status === 'approved'
            ? 'border-emerald-400 bg-emerald-50/20'
            : isPending
              ? 'border-amber-300 bg-amber-50/10'
              : 'border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/40'
      }`}>
        <div className="flex flex-col items-center justify-center text-center space-y-3.5">
          {preview ? (
            <img src={preview} alt="" className="max-h-24 w-full object-contain rounded-lg shadow-sm animate-pulse" />
          ) : status === 'approved' ? (
            <>
              <CheckCircle2 size={24} className="text-emerald-500" />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-emerald-700 block">{label}</span>
                <span className="text-[9px] font-semibold text-emerald-600 block">Telah diverifikasi Admin ✓</span>
              </div>
            </>
          ) : status === 'rejected' ? (
            <>
              <X size={24} className="text-rose-500" />
              <div className="space-y-1 w-full">
                <span className="text-xs font-bold text-rose-700 block">{label}</span>
                <span className="text-[9px] font-black text-rose-600 block uppercase">Ditolak Admin ✗</span>
                {feedback && <p className="text-[10px] text-rose-500 font-medium bg-rose-50/80 p-2 rounded-lg border border-rose-100">{feedback}</p>}
              </div>
            </>
          ) : hasExisting ? (
            <>
              <Clock size={24} className="text-amber-500 animate-pulse" />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-amber-700 block">{label}</span>
                <span className="text-[9px] font-semibold text-amber-600 block">Menunggu verifikasi Admin...</span>
              </div>
            </>
          ) : (
            <>
              <Camera size={24} className="text-blue-400" />
              <span className="text-xs font-medium text-gray-500">{label}</span>
            </>
          )}

          {status !== 'approved' && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={`text-[10px] font-black px-4 py-1.5 rounded-lg border transition-all ${
                status === 'rejected'
                  ? 'text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-100'
                  : isPending
                    ? 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100'
                    : 'text-blue-500 bg-blue-50 border-blue-100 hover:bg-blue-100'
              }`}
            >
              {file || preview ? 'Ambil Ulang' : status === 'rejected' ? 'Ambil Foto Ulang' : hasExisting ? 'Ganti Foto' : 'Ambil Foto'}
            </button>
          )}
        </div>
      </div>
    </div>
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

const DokumenLegalitas = ({ onBusinessUpdated }) => {
  const [bp, setBp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ktpFile, setKtpFile] = useState(null);
  const [kkFile, setKkFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [ttdFile, setTtdFile] = useState(null);
  const [nibFile, setNibFile] = useState(null);
  const [npwpFile, setNpwpFile] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [kontrakFile, setKontrakFile] = useState(null);

  const load = () => {
    setLoading(true);
    getBusinessProfile()
      .then((data) => {
        setBp(data);
        onBusinessUpdated?.(data);
      })
      .catch(() => toast.error('Gagal memuat data bisnis'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSelfie = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setSelfieFile(f);
      setSelfiePreview(URL.createObjectURL(f));
    }
  };
  const handleFoto = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFotoFile(f);
      setFotoPreview(URL.createObjectURL(f));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      if (ktpFile) fd.append('ktp', ktpFile);
      if (kkFile) fd.append('kk', kkFile);
      if (selfieFile) fd.append('selfie_ktp', selfieFile);
      if (ttdFile) fd.append('tanda_tangan', ttdFile);
      if (nibFile) fd.append('nib', nibFile);
      if (npwpFile) fd.append('npwp', npwpFile);
      if (fotoFile) fd.append('foto_usaha', fotoFile);
      if (kontrakFile) fd.append('kontrak', kontrakFile);

      const body = await updateBusinessProfile(fd);
      const next = body.data;
      setBp(next);
      onBusinessUpdated?.(next);
      setKtpFile(null);
      setKkFile(null);
      setSelfieFile(null);
      setSelfiePreview(null);
      setTtdFile(null);
      setNibFile(null);
      setNpwpFile(null);
      setFotoFile(null);
      setFotoPreview(null);
      setKontrakFile(null);
      toast.success('Dokumen disimpan. Skor kesehatan bisnis diperbarui.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan dokumen');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex items-center justify-center min-h-[240px]">
        <Loader2 className="animate-spin text-blue-400" size={28} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Dokumen Legalitas</h2>
          <p className="text-sm text-gray-400">
            Unggah berkas identitas dan legalitas usaha. Bagian NIB/NPWP dan bukti operasional mempengaruhi skor di halaman Kesehatan Bisnis.
          </p>
        </div>
        {bp && (
          <div className="flex flex-wrap gap-2 text-[11px] font-bold">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700">Legalitas {bp.skor_legalitas ?? '—'}</span>
            <span className="px-3 py-1 rounded-full bg-violet-50 text-violet-700">Keberlanjutan {bp.skor_keberlanjutan ?? '—'}</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <DocRow title="Berkas Identitas (Wajib)" desc="Disimpan untuk verifikasi — tidak mengubah hitungan skor otomatis" defaultOpen>
          <BizFileButton id="ktp" label="Upload KTP" hint="PDF/JPG/PNG maks. 5MB" file={ktpFile} hasExisting={bp?.has_ktp} status={bp?.document_statuses?.['ktp_path']} feedback={bp?.document_feedbacks?.['ktp_path']} accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setKtpFile(e.target.files?.[0])} />
          <BizFileButton id="kk" label="Upload Kartu Keluarga" hint="PDF/JPG/PNG maks. 5MB" file={kkFile} hasExisting={bp?.has_kk} status={bp?.document_statuses?.['kk_path']} feedback={bp?.document_feedbacks?.['kk_path']} accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setKkFile(e.target.files?.[0])} />
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <BizCameraButton id="selfie" label="Selfie dengan KTP" preview={selfiePreview} file={selfieFile} hasExisting={bp?.has_selfie_ktp} status={bp?.document_statuses?.['selfie_ktp_path']} feedback={bp?.document_feedbacks?.['selfie_ktp_path']} onChange={handleSelfie} />
            <BizFileButton id="ttd" label="Tanda Tangan Digital (PNG)" hint="PNG transparan maks. 2MB" file={ttdFile} hasExisting={bp?.has_ttd} status={bp?.document_statuses?.['ttd_path']} feedback={bp?.document_feedbacks?.['ttd_path']} accept=".png" onChange={(e) => setTtdFile(e.target.files?.[0])} />
          </div>
        </DocRow>
        <DocRow title="Berkas Izin Usaha (mempengaruhi skor Legalitas)" desc="NIB dan NPWP — sama dengan data yang dipakai bank">
          <BizFileButton id="nib" label="Upload NIB" hint="PDF/JPG maks. 5MB" file={nibFile} hasExisting={bp?.has_nib} status={bp?.document_statuses?.['nib_path']} feedback={bp?.document_feedbacks?.['nib_path']} accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setNibFile(e.target.files?.[0])} />
          <BizFileButton id="npwp" label="Upload NPWP" hint="PDF/JPG maks. 5MB" file={npwpFile} hasExisting={bp?.has_npwp} status={bp?.document_statuses?.['npwp_path']} feedback={bp?.document_feedbacks?.['npwp_path']} accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setNpwpFile(e.target.files?.[0])} />
        </DocRow>
        <DocRow title="Bukti Domisili & Operasional (mempengaruhi skor Keberlanjutan)" desc="Membuktikan usaha berjalan di lokasi nyata">
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <BizCameraButton id="foto_usaha" label="Foto tempat usaha" preview={fotoPreview} file={fotoFile} hasExisting={bp?.has_foto_usaha} status={bp?.document_statuses?.['foto_usaha_path']} feedback={bp?.document_feedbacks?.['foto_usaha_path']} onChange={handleFoto} />
            <BizFileButton id="kontrak" label="Kontrak sewa / bukti kepemilikan" hint="PDF/JPG maks. 5MB" file={kontrakFile} hasExisting={bp?.has_kontrak} status={bp?.document_statuses?.['kontrak_path']} feedback={bp?.document_feedbacks?.['kontrak_path']} accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setKontrakFile(e.target.files?.[0])} />
          </div>
        </DocRow>
      </div>

      <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-10 py-3 bg-[#4A90D9] text-white rounded-2xl font-bold text-sm hover:bg-blue-500 transition shadow-md disabled:opacity-60 flex items-center gap-2"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? 'Menyimpan...' : 'Simpan dokumen & perbarui skor'}
        </button>
      </div>
    </div>
  );
};

// ── Pengaturan ──────────────────────────────────────────────────────────────

const ToggleSwitch = ({ checked, onChange, id }) => (
  <button
    id={id}
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-[#4A90D9]' : 'bg-gray-200'}`}
  >
    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const PwInput = ({ label, name, value, onChange, placeholder, error }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-600 block">{label}</label>
      <div className={`flex items-center border rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 bg-gray-50 transition-all ${
        error ? 'border-red-400 focus-within:ring-red-100' : 'border-gray-200'
      }`}>
        <input
          name={name} type={show ? 'text' : 'password'} value={value}
          onChange={onChange} placeholder={placeholder}
          className="flex-1 px-4 py-2.5 bg-transparent text-sm text-gray-700 focus:outline-none"
        />
        <button type="button" onClick={() => setShow(v => !v)} className="px-3 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && (
        <p className="text-[10px] text-red-500 font-extrabold flex items-center gap-1 mt-1 animate-pulse">
          <AlertTriangle size={11} className="text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

const SettingRow = ({ icon: Icon, iconBg, label, desc, children, defaultOpen = false, danger = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${danger ? 'border-red-100' : 'border-gray-100'}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-4 px-6 py-4 transition text-left ${danger ? 'hover:bg-red-50' : 'hover:bg-gray-50'}`}
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon size={17} className={danger ? 'text-red-500' : 'text-white'} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${danger ? 'text-red-500' : 'text-gray-800'}`}>{label}</p>
          <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
        </div>
        <ChevronDown size={16} className={`text-gray-300 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-6 pb-6 pt-2 border-t border-gray-50 bg-gray-50/30">{children}</div>}
    </div>
  );
};



const Pengaturan = () => {
  const navigate = useNavigate();
  const { isDark, toggleDark } = useTheme();

  // ── Ganti Password ──────────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwErrors, setPwErrors] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });

  const handlePwChange = e => {
    const { name, value } = e.target;
    setPwForm(f => ({ ...f, [name]: value }));
    setPwErrors(errs => ({ ...errs, [name]: '' }));
  };

  const handlePwSave = async () => {
    const { current_password, new_password, new_password_confirmation } = pwForm;
    const nextErrors = { current_password: '', new_password: '', new_password_confirmation: '' };
    let hasError = false;

    if (!current_password) {
      nextErrors.current_password = 'Password saat ini wajib diisi.';
      hasError = true;
    }
    if (!new_password) {
      nextErrors.new_password = 'Password baru wajib diisi.';
      hasError = true;
    }
    if (!new_password_confirmation) {
      nextErrors.new_password_confirmation = 'Konfirmasi password baru wajib diisi.';
      hasError = true;
    }

    if (hasError) {
      setPwErrors(nextErrors);
      return;
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(new_password)) {
      setPwErrors({
        current_password: '',
        new_password: 'Password baru min. 8 karakter, wajib ada huruf besar, kecil, angka & simbol!',
        new_password_confirmation: ''
      });
      return;
    }
    
    if (new_password !== new_password_confirmation) {
      setPwErrors({
        current_password: '',
        new_password: '',
        new_password_confirmation: 'Konfirmasi password tidak cocok.'
      });
      return;
    }

    setPwSaving(true);
    try {
      await changePassword(current_password, new_password, new_password_confirmation);
      toast.success('Password berhasil diubah! Silakan login ulang.');
      setPwForm({ current_password: '', new_password: '', new_password_confirmation: '' });
      setPwErrors({ current_password: '', new_password: '', new_password_confirmation: '' });
      setTimeout(() => { localStorage.clear(); navigate('/login'); }, 1800);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Gagal mengubah password.';
      if (errorMsg.toLowerCase().includes('current') || errorMsg.toLowerCase().includes('lama') || errorMsg.toLowerCase().includes('saat ini')) {
        setPwErrors({
          current_password: errorMsg,
          new_password: '',
          new_password_confirmation: ''
        });
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setPwSaving(false);
    }
  };

  // ── Notifikasi ──────────────────────────────────────────────────────────────
  const NOTIF_KEY = 'notif_prefs';
  const [notif, setNotif] = useState(() => {
    try {
      const stored = localStorage.getItem(NOTIF_KEY);
      return stored ? JSON.parse(stored) : { email_pengajuan: true, email_promo: true, push_reminder: false, push_skor: false };
    } catch {
      return { email_pengajuan: true, email_promo: true, push_reminder: false, push_skor: false };
    }
  });
  const notifItems = [
    { key: 'email_pengajuan', label: 'Status Pengajuan Pinjaman', desc: 'Email instan saat status pengajuan (Verifikasi, Survei, Disetujui/Ditolak) diperbarui oleh bank mitra' },
    { key: 'email_promo', label: 'Rekomendasi Kemitraan & Penawaran Modal', desc: 'Alert kecocokan produk pembiayaan baru dari bank mitra yang sesuai kriteria skor bisnis Anda' },
    { key: 'push_reminder', label: 'Pengingat Kelengkapan Berkas', desc: 'Alert sistem penting untuk segera melengkapi dokumen agar skor bisnis optimal' },
    { key: 'push_skor', label: 'Laporan & Pembaruan Skor Kesehatan', desc: 'Push notifikasi jika indikator skor kesehatan bisnis mengalami kenaikan atau pembaruan' },
  ];
  const toggleNotif = (key, val) => {
    const next = { ...notif, [key]: val };
    setNotif(next);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
    toast.success(`Notifikasi ${val ? 'diaktifkan' : 'dimatikan'}`);
  };

  // ── Bahasa & Wilayah ────────────────────────────────────────────────────────
  const LANG_KEY = 'lang_prefs';
  const [lang, setLang] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LANG_KEY)) || { bahasa: 'id', zona: 'WIB' }; } catch { return { bahasa: 'id', zona: 'WIB' }; }
  });
  const handleLangChange = (key, val) => {
    const next = { ...lang, [key]: val };
    setLang(next);
    localStorage.setItem(LANG_KEY, JSON.stringify(next));
    toast.success('Preferensi disimpan');
  };



  return (
    <>
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        <div className="mb-7">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Pengaturan</h2>
          <p className="text-sm text-gray-400">Kelola preferensi dan keamanan akun kamu</p>
        </div>

        <div className="space-y-3">

          {/* Mode Gelap */}
          <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-indigo-900/60 bg-gradient-to-r from-[#0f1117] to-[#1a1f2e]' : 'border-gray-100'}`}>
            <div className="flex items-center gap-4 px-6 py-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isDark ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                {isDark
                  ? <Moon size={17} className="text-yellow-200" />
                  : <Sun size={17} className="text-yellow-300" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${isDark ? 'text-indigo-100' : 'text-gray-800'}`}>
                  Mode Gelap
                  {isDark && <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600/40 text-indigo-300 align-middle">AKTIF</span>}
                </p>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-indigo-300/70' : 'text-gray-400'}`}>
                  {isDark ? 'Tampilan saat ini: Mode Gelap 🌙' : 'Ganti ke tampilan gelap yang lebih nyaman di malam hari'}
                </p>
              </div>
              <ToggleSwitch id="toggle-dark-mode" checked={isDark} onChange={toggleDark} />
            </div>
          </div>

          {/* Ganti Password */}
          <SettingRow icon={Lock} iconBg="bg-[#4A90D9]" label="Ganti Password" desc="Ubah password akun kamu secara berkala">
            <div className="space-y-4 mt-3">
              <PwInput label="Password Saat Ini" name="current_password" value={pwForm.current_password} onChange={handlePwChange} placeholder="Masukkan password lama" error={pwErrors.current_password} />
              <PwInput label="Password Baru" name="new_password" value={pwForm.new_password} onChange={handlePwChange} placeholder="Min. 8 karakter (wajib huruf besar, kecil, angka, simbol)" error={pwErrors.new_password} />
              <PwInput label="Konfirmasi Password Baru" name="new_password_confirmation" value={pwForm.new_password_confirmation} onChange={handlePwChange} placeholder="Ulangi password baru" error={pwErrors.new_password_confirmation} />
              <div className="pt-1 flex justify-between items-center">
                <p className="text-xs text-gray-400">Min. 8 karakter, wajib ada huruf besar, kecil, angka & simbol. Setelah ganti, kamu harus login ulang.</p>
                <button
                  type="button" onClick={handlePwSave} disabled={pwSaving}
                  className="px-8 py-2.5 bg-[#4A90D9] text-white rounded-xl font-bold text-sm hover:bg-blue-500 transition disabled:opacity-60 flex items-center gap-2"
                >
                  {pwSaving && <Loader2 size={14} className="animate-spin" />}
                  {pwSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </SettingRow>

          {/* Notifikasi */}
          <SettingRow icon={Bell} iconBg="bg-violet-500" label="Notifikasi" desc="Atur notifikasi email dan push notification">
            <div className="space-y-1 mt-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Email</p>
              {notifItems.slice(0, 2).map(item => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <ToggleSwitch id={`notif-${item.key}`} checked={notif[item.key] ?? true} onChange={val => toggleNotif(item.key, val)} />
                </div>
              ))}
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 pt-4">Push Notification</p>
              {notifItems.slice(2).map(item => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <ToggleSwitch id={`notif-${item.key}`} checked={notif[item.key] ?? false} onChange={val => toggleNotif(item.key, val)} />
                </div>
              ))}
            </div>
          </SettingRow>

          {/* Bahasa & Wilayah */}
          <SettingRow icon={Globe} iconBg="bg-emerald-500" label="Bahasa & Wilayah" desc="Pilih bahasa tampilan dan zona waktu">
            <div className="space-y-4 mt-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-600 block">Bahasa Tampilan</label>
                <div className="relative">
                  <select
                    value={lang.bahasa}
                    onChange={e => handleLangChange('bahasa', e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 pr-10"
                  >
                    <option value="id">🇮🇩  Bahasa Indonesia</option>
                    <option value="en">🇺🇸  English</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-600 block">Zona Waktu</label>
                <div className="relative">
                  <select
                    value={lang.zona}
                    onChange={e => handleLangChange('zona', e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 pr-10"
                  >
                    <option value="WIB">WIB — Waktu Indonesia Barat (UTC+7)</option>
                    <option value="WITA">WITA — Waktu Indonesia Tengah (UTC+8)</option>
                    <option value="WIT">WIT — Waktu Indonesia Timur (UTC+9)</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="bg-blue-50 rounded-2xl px-4 py-3">
                <p className="text-xs text-blue-700">Waktu saat ini: <strong>{new Date().toLocaleString('id-ID', { timeZone: lang.zona === 'WIB' ? 'Asia/Jakarta' : lang.zona === 'WITA' ? 'Asia/Makassar' : 'Asia/Jayapura' })}</strong></p>
              </div>
            </div>
          </SettingRow>


        </div>
      </div>
    </>
  );
};

const DataKeuangan = ({ onBusinessUpdated }) => {
  const [bp, setBp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rekeningFile, setRekeningFile] = useState(null);
  const [buktiFile, setBuktiFile] = useState(null);
  const [omzet, setOmzet] = useState('');
  const [cicilan, setCicilan] = useState('');

  const load = () => {
    setLoading(true);
    getBusinessProfile()
      .then((data) => {
        setBp(data);
        if (data.omzet_bulan_ini) setOmzet(formatRupiah(data.omzet_bulan_ini));
        if (data.cicilan_berjalan !== null && data.cicilan_berjalan !== undefined) setCicilan(formatRupiah(data.cicilan_berjalan));
        onBusinessUpdated?.(data);
      })
      .catch(() => toast.error('Gagal memuat data keuangan'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      if (rekeningFile) fd.append('rekening', rekeningFile);
      if (buktiFile) fd.append('bukti_pelunasan', buktiFile);
      const oz = parseRupiah(omzet);
      const cic = parseRupiah(cicilan);
      if (oz) fd.append('omzet_bulan_ini', oz);
      if (cic !== '') fd.append('cicilan_berjalan', cic || '0');

      const body = await updateBusinessProfile(fd);
      const next = body.data;
      setBp(next);
      onBusinessUpdated?.(next);
      setRekeningFile(null);
      setBuktiFile(null);
      toast.success('Data keuangan disimpan. Skor kesehatan bisnis diperbarui.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data keuangan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex items-center justify-center min-h-[240px]">
        <Loader2 className="animate-spin text-blue-400" size={28} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Data Keuangan</h2>
          <p className="text-sm text-gray-400 max-w-xl">
            Rekening koran, omzet, dan cicilan dipakai untuk menghitung Profitabilitas, Tren Omzet, Kolektibilitas, dan Kapasitas Utang.
          </p>
        </div>
        {bp && (
          <div className="flex flex-wrap gap-2 text-[11px] font-bold">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">Profitabilitas {bp.skor_profitabilitas ?? '—'}</span>
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800">Tren Omzet {bp.skor_tren_omzet ?? '—'}</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <DocRow title="Rekening koran & omzet" desc="Satu berkas rekening koran (gabungkan 3 bulan dalam satu PDF bila perlu)" defaultOpen>
          <div className="sm:col-span-2">
            <BizFileButton
              id="rekening"
              label="Rekening koran"
              hint="PDF/JPG maks. 5MB — mempengaruhi skor Profitabilitas"
              file={rekeningFile}
              hasExisting={bp?.has_rekening}
              status={bp?.document_statuses?.['rekening_path']}
              feedback={bp?.document_feedbacks?.['rekening_path']}
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setRekeningFile(e.target.files?.[0])}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-sm font-medium text-gray-600">Omzet bulan ini</label>
            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-400">
              <span className="px-3 text-xs font-bold text-gray-400 border-r border-gray-200 bg-gray-50 py-2.5">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={omzet}
                onChange={(e) => setOmzet(formatRupiah(parseRupiah(e.target.value)))}
                placeholder="contoh: 15.000.000"
                className="flex-1 px-3 py-2 text-sm text-gray-800 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-gray-400">≥ Rp 10 juta memberi bobot skor omzet tertinggi (lihat halaman Kesehatan Bisnis).</p>
          </div>
        </DocRow>
        <DocRow title="Kapasitas utang & kolektibilitas" desc="Memperkirakan beban cicilan terhadap omzet">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-sm font-medium text-gray-600">Cicilan berjalan di tempat lain</label>
            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-400">
              <span className="px-3 text-xs font-bold text-gray-400 border-r border-gray-200 bg-gray-50 py-2.5">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={cicilan}
                onChange={(e) => setCicilan(formatRupiah(parseRupiah(e.target.value)))}
                placeholder="0 jika tidak ada"
                className="flex-1 px-3 py-2 text-sm text-gray-800 focus:outline-none"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <BizFileButton
              id="bukti"
              label="Bukti pelunasan utang lama (opsional)"
              hint="PDF/JPG maks. 5MB"
              file={buktiFile}
              hasExisting={bp?.has_bukti_pelunasan}
              status={bp?.document_statuses?.['bukti_pelunasan_path']}
              feedback={bp?.document_feedbacks?.['bukti_pelunasan_path']}
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setBuktiFile(e.target.files?.[0])}
            />
          </div>
        </DocRow>
      </div>

      <p className="text-xs text-gray-500 mt-6 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
        Laporan neraca/laba rugi detail bisa diminta bank pada tahap pengajuan. Yang dipakai untuk skor otomatis di aplikasi ini mengikuti field di atas.
      </p>

      <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-10 py-3 bg-[#4A90D9] text-white rounded-2xl font-bold text-sm hover:bg-blue-500 transition shadow-md disabled:opacity-60 flex items-center gap-2"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? 'Menyimpan...' : 'Simpan data keuangan & perbarui skor'}
        </button>
      </div>
    </div>
  );
};

const InfoUmum = ({ onBusinessUpdated }) => {
  const [form, setForm] = useState({
    nama_usaha: '',
    bidang_usaha: '',
    alamat_usaha: '',
    lama_usaha: '',
    jumlah_karyawan: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getBusinessProfile()
      .then((data) => {
        setForm({
          nama_usaha: data.nama_usaha || '',
          bidang_usaha: data.bidang_usaha || '',
          alamat_usaha: data.alamat_usaha || '',
          lama_usaha: data.lama_usaha || '',
          jumlah_karyawan: data.jumlah_karyawan || '',
        });
        onBusinessUpdated?.(data);
      })
      .catch(() => toast.error('Gagal memuat info umum'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('nama_usaha', form.nama_usaha);
      fd.append('bidang_usaha', form.bidang_usaha);
      fd.append('alamat_usaha', form.alamat_usaha);
      fd.append('lama_usaha', form.lama_usaha);
      fd.append('jumlah_karyawan', form.jumlah_karyawan);

      const res = await updateBusinessProfile(fd);
      onBusinessUpdated?.(res.data);
      toast.success('Info umum berhasil disimpan');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan info umum');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex items-center justify-center min-h-[240px]">
        <Loader2 className="animate-spin text-blue-400" size={28} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Info Umum</h2>
      <p className="text-sm text-gray-400 mb-7">Informasi umum tentang usaha dan profil bisnis kamu</p>
      <div className="space-y-5">
        {[
          { label: 'Nama Toko / Usaha', name: 'nama_usaha', placeholder: 'Contoh: Toko Maju Jaya', type: 'text' },
          { label: 'Bidang Usaha', name: 'bidang_usaha', placeholder: 'Contoh: Perdagangan, Kuliner, Jasa...', type: 'text' },
          { label: 'Alamat Usaha', name: 'alamat_usaha', placeholder: 'Jl. Contoh No. 1, Kota...', type: 'text' },
          { label: 'Lama Usaha Berjalan', name: 'lama_usaha', placeholder: 'Contoh: 2 Tahun 3 Bulan', type: 'text' },
          { label: 'Jumlah Karyawan', name: 'jumlah_karyawan', placeholder: 'Contoh: 5 orang', type: 'text' },
        ].map((f, i) => (
          <div key={i} className="space-y-1.5">
            <label className="text-sm font-medium text-gray-600 block">{f.label}</label>
            <input
              name={f.name}
              type={f.type}
              value={form[f.name]}
              onChange={handleChange}
              placeholder={f.placeholder}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm text-gray-700"
            />
          </div>
        ))}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-16 py-3 bg-[#4A90D9] text-white rounded-2xl font-bold text-sm hover:bg-blue-500 transition shadow-md shadow-blue-100 uppercase tracking-wider disabled:opacity-60 flex items-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? 'Menyimpan...' : 'SIMPAN'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Info Grid (bawah) ───────────────────────────────────────────────────────
const InfoGrid = ({ bp }) => (
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
      <p className="text-[10px] text-blue-500 mt-0.5 truncate w-full px-1">{bp?.nama_usaha || 'Belum diisi'}</p>
    </div>
    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col items-center text-center shadow-sm">
      <div className="w-12 h-12 flex items-center justify-center mb-2">
        <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
          <circle cx="24" cy="24" r="20" fill="#FB923C" />
          <path d="M24 14 L26 20 L32 20 L27 24 L29 30 L24 26 L19 30 L21 24 L16 20 L22 20 Z" fill="white" />
        </svg>
      </div>
      <p className="text-[11px] font-bold text-gray-800 leading-tight">Bidang Usaha</p>
      <p className="text-[10px] text-orange-400 mt-0.5 truncate w-full px-1">{bp?.bidang_usaha || 'Belum diisi'}</p>
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
      <p className="text-[10px] text-gray-400 mt-0.5">{bp?.lama_usaha || '—'}</p>
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
      <p className="text-[10px] text-green-400 mt-0.5 truncate w-full px-1">{bp?.alamat_usaha || '—'}</p>
    </div>
  </div>
);

// ── Nav config ──────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: 'personal', icon: User, label: 'Personal Info' },
  { key: 'dokumen', icon: FileText, label: 'Dokumen Legalitas' },
  { key: 'keuangan', icon: CreditCard, label: 'Data Keuangan' },
  { key: 'pengaturan', icon: Settings, label: 'Pengaturan' },
  { key: 'info', icon: Info, label: 'Info Umum' },
];

// ── Main ────────────────────────────────────────────────────────────────────
const Profile = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || { name: 'User' });
  const [activeKey, setActiveKey] = useState(() => {
    const p = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('panel');
    return p && ['personal', 'dokumen', 'keuangan', 'pengaturan', 'info'].includes(p) ? p : 'personal';
  });
  const [healthSnap, setHealthSnap] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempAvatar, setTempAvatar] = useState('');
  const [tempScale, setTempScale] = useState(1);
  const [tempX, setTempX] = useState(0);
  const [tempY, setTempY] = useState(0);
  const [savingCrop, setSavingCrop] = useState(false);

  useEffect(() => {
    getBusinessProfile()
      .then(setHealthSnap)
      .catch(() => console.error("Gagal load data bisnis awal"));
  }, []);

  useEffect(() => {
    const p = searchParams.get('panel');
    if (p && ['personal', 'dokumen', 'keuangan', 'pengaturan', 'info'].includes(p)) {
      setActiveKey(p);
    }
  }, [searchParams]);

  const goNav = (key) => {
    setActiveKey(key);
    if (key === 'personal') {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ panel: key }, { replace: true });
    }
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    // Sync localStorage
    localStorage.setItem('user', JSON.stringify({ ...user, ...updatedUser }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setTempAvatar(reader.result);
      setTempScale(1);
      setTempX(0);
      setTempY(0);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleApplyCrop = async () => {
    setSavingCrop(true);
    try {
      const croppedBase64 = await getCroppedImg(tempAvatar, tempScale, tempX, tempY);
      const updatedUser = { ...user, avatar: croppedBase64 };
      await updateProfile(updatedUser);
      handleUserUpdate(updatedUser);
      setShowCropModal(false);
      toast.success('Foto profil berhasil dipasang!');
    } catch (err) {
      toast.error('Gagal menyimpan ke server: ' + (err.response?.data?.message || err.message));
      console.error("Avatar upload error:", err);
    } finally {
      setSavingCrop(false);
    }
  };

  const renderPanel = () => {
    switch (activeKey) {
      case 'dokumen': return <DokumenLegalitas onBusinessUpdated={setHealthSnap} />;
      case 'pengaturan': return <Pengaturan />;
      case 'keuangan': return <DataKeuangan onBusinessUpdated={setHealthSnap} />;
      case 'info': return <InfoUmum onBusinessUpdated={setHealthSnap} />;
      default: return <PersonalInfo user={user} onUpdate={handleUserUpdate} />;
    }
  };

  return (
    <>
      <div className="flex gap-6 font-sans p-2">

        {/* === SISI KIRI === */}
        <div className="w-64 flex-shrink-0 space-y-4">

          {/* Card Biru */}
          <div className="bg-gradient-to-br from-[#4A90D9] via-[#5A9FE8] to-[#3A7BC8] rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
            {/* Decorative background circles */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />

            {/* Verified badge */}
            <div className="flex justify-center mb-4 relative">
              <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-[10px] font-semibold border border-white/20">
                <BadgeCheck size={13} className="text-emerald-300" />
                <span>Akun Terverifikasi</span>
              </div>
            </div>

            <div className="flex flex-col items-center relative">
              <label className="relative w-20 h-20 rounded-full border-4 border-white/40 overflow-hidden mb-3 shadow-lg cursor-pointer group">
                <input type="file" accept="image/png, image/jpeg, image/jpg" className="hidden" onChange={handleAvatarChange} />
                <img
                  src={user.avatar || defaultAvatar}
                  alt="Profile"
                  className="w-full h-full object-cover transition-all duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Camera size={20} className="text-white drop-shadow-md" />
                </div>
              </label>
              <h2 className="text-base font-bold tracking-wide text-center">{user.name}</h2>
              <p className="text-xs opacity-80 mt-0.5">{user.phone || '—'}</p>

              <p className="text-[10px] opacity-50 mt-1">Bergabung sejak {new Date(user.created_at || Date.now()).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex gap-2 mt-5 relative">
              <Link to="/kesehatan-bisnis" className="flex-1 bg-white/15 hover:bg-white/25 backdrop-blur-sm transition-all duration-200 py-1.5 rounded-xl text-[10px] flex flex-col items-center gap-0.5 border border-white/20 hover:scale-[1.02] active:scale-95">
                <span className="font-bold">Skor Bisnis</span>
                {healthSnap && <span className="text-[9px] opacity-70 font-semibold">{healthSnap.skor_total}/600</span>}
              </Link>
              <Link to="/cari-modal" className="flex-1 bg-white/15 hover:bg-white/25 backdrop-blur-sm transition-all duration-200 py-1.5 rounded-xl text-[10px] flex flex-col items-center gap-0.5 border border-white/20 hover:scale-[1.02] active:scale-95">
                <span className="font-bold">Ajukan Pinjaman</span>
                <span className="text-[9px] opacity-70 font-semibold">Mulai proses →</span>
              </Link>
            </div>
          </div>

          {/* Menu Navigasi */}
          <div className="bg-white rounded-3xl border border-gray-100 p-3 space-y-0.5 shadow-sm">
            {NAV_ITEMS.map(({ key, icon: Icon, label }) => {
              const isActive = activeKey === key;
              return (
                <button
                  key={key}
                  onClick={() => goNav(key)}
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
          {healthSnap && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50/90 px-4 py-3 text-sm text-blue-950">
              <span>
                Skor kesehatan bisnis terbaru: <strong className="font-extrabold">{healthSnap.skor_total}</strong>
                <span className="text-blue-600/80">/600</span>
              </span>
              <Link to="/kesehatan-bisnis" className="font-bold text-[#4A90D9] hover:underline">
                Lihat ringkasan
              </Link>
            </div>
          )}
          <InfoGrid bp={healthSnap} />
        </div>
      </div>

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 pb-4 text-center border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Atur Foto Profil</h3>
              <p className="text-xs text-gray-400 mt-1">Sesuaikan posisi dan perbesaran agar wajah terlihat jelas</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col items-center gap-6">
              {/* Preview Circle */}
              <div className="w-32 h-32 rounded-full border-4 border-gray-100 shadow-md overflow-hidden bg-gray-50 relative">
                <img
                  src={tempAvatar || defaultAvatar}
                  alt="Preview"
                  className="w-full h-full object-contain"
                  style={{ transform: `scale(${tempScale}) translate(${tempX}%, ${tempY}%)` }}
                />
              </div>

              {/* Sliders container */}
              <div className="w-full space-y-4">
                {/* Zoom Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-500">
                    <span>Perbesar (Zoom)</span>
                    <span>{Math.round(tempScale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={tempScale}
                    onChange={(e) => setTempScale(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4A90D9] focus:outline-none"
                  />
                </div>

                {/* Horizontal Shift */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-500">
                    <span>Geser Kiri / Kanan</span>
                    <span>{tempX}%</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="1"
                    value={tempX}
                    onChange={(e) => setTempX(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4A90D9] focus:outline-none"
                  />
                </div>

                {/* Vertical Shift */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-500">
                    <span>Geser Atas / Bawah</span>
                    <span>{tempY}%</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="1"
                    value={tempY}
                    onChange={(e) => setTempY(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4A90D9] focus:outline-none"
                  />
                </div>

                {/* Reset Button */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setTempScale(1);
                      setTempX(0);
                      setTempY(0);
                    }}
                    className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs font-bold rounded-xl transition"
                  >
                    Reset Posisi
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowCropModal(false)}
                className="flex-1 py-4 text-sm font-bold text-gray-500 hover:bg-gray-50 transition border-r border-gray-100 uppercase tracking-wider"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplyCrop}
                disabled={savingCrop}
                className="flex-1 py-4 text-sm font-bold text-[#4A90D9] hover:bg-gray-50 transition uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingCrop && <Loader2 size={14} className="animate-spin" />}
                {savingCrop ? 'Memasang...' : 'Pasang Foto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;