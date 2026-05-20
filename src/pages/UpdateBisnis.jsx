import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * Rute ini dipertahankan untuk bookmark/link lama.
 * Seluruh pengunggahan dokumen & data keuangan dipusatkan di Profil.
 */
export default function UpdateBisnis() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const panel = searchParams.get('panel');
    const target = panel === 'keuangan' ? 'keuangan' : 'dokumen';
    navigate(`/profile?panel=${target}`, { replace: true });
  }, [navigate, searchParams]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 bg-[#F9FAFB] font-sans px-4">
      <Loader2 className="animate-spin text-[#60A5FA]" size={32} />
      <p className="text-sm text-gray-600 text-center">Mengalihkan ke Profil untuk dokumen &amp; data keuangan…</p>
    </div>
  );
}
