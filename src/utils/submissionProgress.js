/**
 * Logika timeline & pengajuan aktif — dipakai Riwayat & Dashboard.
 */

export function shortDate(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return null;
  }
}

/**
 * Timeline 4 langkah — dari status server (menunggu | disetujui | ditolak | dibatalkan).
 */
export function buildTimeline(statusRaw, submittedAt, updatedAt, message = '', submissionId = null) {
  const t0 = shortDate(submittedAt);
  const t1 = shortDate(updatedAt) || t0;

  // 1. Deteksi status efektif (Gunakan LocalStorage sebagai prioritas untuk integrasi instan)
  let effectiveStatus = statusRaw;
  if (submissionId) {
    const localSteps = JSON.parse(localStorage.getItem('local_submission_steps') || '{}');
    // Cek ID apa adanya (bisa string REQ- atau integer PK)
    if (localSteps[submissionId]) {
      effectiveStatus = localSteps[submissionId];
    }
  }

  // 2. Fallback: Deteksi marker dari pesan bank (Penting jika beda browser/incognito)
  if (statusRaw === 'menunggu' || statusRaw === 'Menunggu') {
    if (message?.includes('[STEP:VERIFIKASI]')) effectiveStatus = 'Verifikasi';
    if (message?.includes('[STEP:SURVEI]')) effectiveStatus = 'Survei';
  }

  // 3. Render Timeline berdasarkan effectiveStatus
  if (effectiveStatus === 'dibatalkan') {
    return [
      { key: 's1', label: 'Pengajuan terkirim ke bank', done: true, date: t0 },
      { key: 's2', label: 'Pengajuan dibatalkan', done: true, date: t1, variant: 'cancel' },
      { key: 's3', label: 'Verifikasi bank', done: false, date: null, skipped: true },
      { key: 's4', label: 'Keputusan akhir', done: false, date: null, skipped: true },
    ];
  }

  if (effectiveStatus === 'menunggu' || effectiveStatus === 'Menunggu') {
    return [
      { key: 's1', label: 'Pengajuan terkirim ke bank', done: true, date: t0 },
      { key: 's2', label: 'Verifikasi bank', done: false, current: true, date: null },
      { key: 's3', label: 'Survei / analisis kredit', done: false, date: null },
      { key: 's4', label: 'Keputusan akhir', done: false, date: null },
    ];
  }

  if (effectiveStatus === 'Verifikasi' || effectiveStatus === 'verifikasi') {
    return [
      { key: 's1', label: 'Pengajuan terkirim ke bank', done: true, date: t0 },
      { key: 's2', label: 'Verifikasi bank', done: true, date: t1 },
      { key: 's3', label: 'Survei / analisis kredit', done: false, current: true, date: null },
      { key: 's4', label: 'Keputusan akhir', done: false, date: null },
    ];
  }

  if (effectiveStatus === 'Survei' || effectiveStatus === 'survei') {
    return [
      { key: 's1', label: 'Pengajuan terkirim ke bank', done: true, date: t0 },
      { key: 's2', label: 'Verifikasi bank', done: true, date: t0 },
      { key: 's3', label: 'Survei / analisis kredit', done: true, date: t1 },
      { key: 's4', label: 'Keputusan akhir', done: false, current: true, date: null },
    ];
  }

  if (effectiveStatus === 'disetujui' || effectiveStatus === 'Disetujui') {
    return [
      { key: 's1', label: 'Pengajuan terkirim ke bank', done: true, date: t0 },
      { key: 's2', label: 'Verifikasi bank', done: true, date: t0 },
      { key: 's3', label: 'Survei / analisis kredit', done: true, date: t1 },
      { key: 's4', label: 'Keputusan akhir — disetujui', done: true, date: t1, variant: 'success' },
    ];
  }

  if (effectiveStatus === 'ditolak' || effectiveStatus === 'Ditolak') {
    return [
      { key: 's1', label: 'Pengajuan terkirim ke bank', done: true, date: t0 },
      { key: 's2', label: 'Verifikasi bank', done: true, date: t0 },
      { key: 's3', label: 'Analisis kredit bank', done: true, date: t1 },
      { key: 's4', label: 'Keputusan akhir — ditolak', done: true, date: t1, variant: 'reject' },
    ];
  }

  return [
    { key: 's1', label: 'Pengajuan terkirim ke bank', done: true, date: t0 },
    { key: 's2', label: 'Verifikasi bank', done: false, date: null },
    { key: 's3', label: 'Survei / analisis kredit', done: false, date: null },
    { key: 's4', label: 'Keputusan akhir', done: false, date: null },
  ];
}

/** Jumlah tahap yang belum selesai (abaikan skipped). */
export function countRemainingTimelineSteps(timeline) {
  if (!Array.isArray(timeline)) return 0;
  return timeline.filter((s) => !s.done && !s.skipped).length;
}

/** Pengajuan "aktif" untuk kartu dashboard & tab aktif riwayat. */
export function pickActiveSubmission(sortedList) {
  if (!Array.isArray(sortedList) || sortedList.length === 0) return null;
  const waiting = sortedList.find((s) => {
    const localSteps = JSON.parse(localStorage.getItem('local_submission_steps') || '{}');
    const eff = localSteps[s.id] || localSteps[s.submission_id] || s.status_raw;
    return ['menunggu', 'Verifikasi', 'Survei', 'verifikasi', 'survei'].includes(eff) || s.bank_message?.includes('[STEP:');
  });
  if (waiting) return waiting;
  return sortedList.find((s) => s.status_raw === 'disetujui') || null;
}

/**
 * Ringkasan untuk kartu kecil dashboard (judul 2 baris + teks bawah).
 */
export function getDashboardSubmissionCardCopy(submission) {
  if (!submission) {
    return {
      line1: 'Belum ada pengajuan',
      line2: 'FinBankLink',
      foot: 'Ajukan modal di halaman Cari Modal untuk melihat progres di sini.',
      variant: 'empty',
    };
  }

  const bank = submission.nama_bank || 'Bank';
  const raw = submission.status_raw || 'menunggu';
  const msg = submission.bank_message || '';
  const tl = buildTimeline(raw, submission.submitted_at, submission.updated_at, msg, submission.id);
  const remaining = countRemainingTimelineSteps(tl);

  const localSteps = JSON.parse(localStorage.getItem('local_submission_steps') || '{}');
  let eff = localSteps[submission.id] || localSteps[submission.submission_id] || raw;
  eff = eff.toLowerCase();

  if (eff === 'menunggu' || eff === 'verifikasi' || eff === 'survei') {
    return {
      line1: eff === 'menunggu' ? 'Sedang diverifikasi' : eff === 'verifikasi' ? 'Sedang Verifikasi' : 'Dalam Survei',
      line2: bank,
      foot: remaining > 0 ? `Lengkapi ${remaining} tahap lagi untuk keputusan akhir.` : 'Menunggu pembaruan dari bank.',
      variant: 'pending',
    };
  }

  if (eff === 'disetujui') {
    return {
      line1: 'Pengajuan disetujui',
      line2: bank,
      foot: 'Ikuti arahan petugas bank untuk akad & pencairan.',
      variant: 'success',
    };
  }

  if (eff === 'ditolak') {
    return {
      line1: 'Pengajuan ditolak',
      line2: bank,
      foot: 'Lihat detail di Status / Riwayat.',
      variant: 'reject',
    };
  }

  return {
    line1: 'Status diperbarui',
    line2: bank,
    foot: 'Cek riwayat pengajuan kamu.',
    variant: 'pending',
  };
}
