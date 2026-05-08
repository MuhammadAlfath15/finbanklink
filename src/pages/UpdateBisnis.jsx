import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, AlertCircle } from 'lucide-react';

function UploadBox({ id, file, onChange }) {
  const inputRef = useRef(null);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={onChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded border border-dashed border-gray-500 bg-white hover:bg-gray-50 transition-colors"
      >
        {file ? (
          <span className="text-xs font-medium truncate text-gray-700">{file.name}</span>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#3B82F6"/>
              <path d="M12 7L12 17M12 7L8.5 10.5M12 7L15.5 10.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xs text-gray-500">Unggah PDF/JPG</span>
          </>
        )}
      </button>
    </div>
  );
}

function CameraBox({ id, preview, onChange }) {
  const inputRef = useRef(null);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-36 h-28 rounded border border-dashed border-gray-500 bg-white flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
      >
        {preview ? (
          <img src={preview} alt="Foto usaha" className="w-full h-full object-cover rounded" />
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-[#60A5FA] flex items-center justify-center">
              <Camera size={24} className="text-white" />
            </div>
            <span className="text-[10px] text-gray-500">Ambil foto</span>
          </>
        )}
      </button>
    </div>
  );
}

function InputField({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-2 border border-gray-400 rounded text-xs text-black h-[34px] focus:outline-none focus:border-blue-500 bg-white"
    />
  );
}

export default function UpdateBisnis() {
  const navigate = useNavigate();

  const [nibFile, setNibFile] = useState(null);
  const [npwpFile, setNpwpFile] = useState(null);
  const [rekeningFile, setRekeningFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [kontrakFile, setKontrakFile] = useState(null);
  const [buktiFile, setBuktiFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [omzet, setOmzet] = useState('');
  const [cicilan, setCicilan] = useState('');

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFotoPreview(url);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulasi buffering/loading
    await new Promise(resolve => setTimeout(resolve, 1500));
    navigate('/kesehatan-bisnis');
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col font-sans pb-10">
      
      {/* Header */}
      <div className="bg-[#60A5FA] px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/kesehatan-bisnis')} aria-label="Kembali" className="focus:outline-none">
          <ArrowLeft size={30} strokeWidth={2.5} className="text-white" />
        </button>
        <h1 className="text-white text-xl font-bold">Update data bisnis</h1>
      </div>

      {/* Warning Banner */}
      <div className="px-4 py-2.5 bg-[#F3F4F6] flex items-start gap-2 border-b border-gray-200">
        <AlertCircle size={18} className="text-[#EF4444] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-700 italic">
          Skor legalitas Anda rendah lengkapi dokumen untuk mempercepat pengajuan modal.
        </p>
      </div>

      <div className="px-4 mt-4 space-y-5">
        
        {/* Dokumen Legalitas */}
        <div>
          <h2 className="text-[15px] font-bold text-black mb-2">Dokumen Legalitas</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-black mb-1">NIB</p>
              <UploadBox id="nib" file={nibFile} onChange={e => setNibFile(e.target.files?.[0])} />
            </div>
            <div>
              <p className="text-sm text-black mb-1">NPWP</p>
              <UploadBox id="npwp" file={npwpFile} onChange={e => setNpwpFile(e.target.files?.[0])} />
            </div>
          </div>
          <p className="text-[13px] text-black mt-2">
            <span className="font-bold">Efek:</span> Unggah NIB untuk menaikkan skor Legalitas menjadi 80%.
          </p>
        </div>

        {/* Keuangan (Profitabilitas) */}
        <div>
          <h2 className="text-[15px] font-bold text-black mb-2">Keuangan (Profitabilitas)</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-black mb-1">Rekening Koran 3 Bulan</p>
              <UploadBox id="rekening" file={rekeningFile} onChange={e => setRekeningFile(e.target.files?.[0])} />
            </div>
            <div>
              <p className="text-sm text-black mb-1">Update Omzet Bulan ini</p>
              <InputField value={omzet} onChange={e => setOmzet(e.target.value)} placeholder="....." />
            </div>
          </div>
          <p className="text-[13px] text-black mt-2">
            <span className="font-bold">Efek:</span> Meningkatkan akurasi grafik Tren Omzet dan Profitabilitas.
          </p>
        </div>

        {/* Operasional (Keberlanjutan) */}
        <div>
          <h2 className="text-[15px] font-bold text-black mb-2">Operasional (Keberlanjutan)</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-black mb-2">
                Foto tempat usaha (tampak depan, dalam, dan stok barang).
              </p>
              <CameraBox id="foto" preview={fotoPreview} onChange={handleFotoChange} />
            </div>
            <div>
              <p className="text-sm text-black mb-1">Kontrak sewa/Kepemilikan</p>
              <UploadBox id="kontrak" file={kontrakFile} onChange={e => setKontrakFile(e.target.files?.[0])} />
            </div>
          </div>
          <p className="text-[13px] text-black mt-2">
            <span className="font-bold">Efek:</span> Memperkuat kepercayaan bank terhadap eksistensi fisik bisnis.
          </p>
        </div>

        {/* Kapasitas Utang & Kolektibilitas */}
        <div>
          <h2 className="text-[15px] font-bold text-black mb-2">Kapasitas Utang & Kolektibilitas</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-black mb-1">Cicilan Berjalan di Tempat Lain</p>
              <InputField value={cicilan} onChange={e => setCicilan(e.target.value)} placeholder="....." />
            </div>
            <div>
              <p className="text-sm text-black mb-1">Bukti pelunasan utang lama</p>
              <UploadBox id="bukti" file={buktiFile} onChange={e => setBuktiFile(e.target.files?.[0])} />
            </div>
          </div>
          <p className="text-[13px] text-black mt-2">
            <span className="font-bold">Efek:</span> Membersihkan rasio utang sehingga skor Kapasitas Utang naik.
          </p>
        </div>
      </div>

      <div className="px-4 mt-8 flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-56 py-3 text-white rounded-full font-bold text-[15px] flex items-center justify-center gap-2 transition-colors ${
            isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#60A5FA] hover:bg-blue-500'
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Menyimpan...
            </>
          ) : (
            'UPDATE'
          )}
        </button>
      </div>

    </div>
  );
}

