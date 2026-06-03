import axios from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// TOGGLE INI UNTUK GANTI MODE
// true  → pakai mock data, gak perlu backend nyala sama sekali
// false → hit backend Laravel temen lu secara real
// ─────────────────────────────────────────────────────────────────────────────
const USE_MOCK = false;

const BASE_URL = 'http://localhost:8000/api';

// Axios instance — URL & header terpusat di sini
const http = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json', // KRITIS: tanpa ini Laravel redirect (bukan JSON) waktu validasi gagal
  },
  timeout: 10000, // 10 detik — kalau backend gak balas, langsung error
});

// Otomatis selipkan token kalau ada di localStorage
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Otomatis tangani error 401 (token kadaluarsa / tidak valid)
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      
      // Arahkan ke halaman login yang sesuai
      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        window.location.href = '/admin/login';
      } else if (path.startsWith('/bank')) {
        window.location.href = '/bank/login';
      } else {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Mock Data ────────────────────────────────────────────────────────────────
// Struktur ini ngikutin persis response dari AuthController & BankController

const MOCK_USER = {
  id: 1,
  name: 'Budi Santoso',
  email: 'budi@example.com',
  role: 'user',
};

const MOCK_BANKS = [
  {
    id: 1,
    nama_bank: 'Bank BRI',
    nama_produk: 'KUR Mikro BRI',
    bunga: '6% per tahun',
    cicilan: 'Rp 1.750.000/bulan',
    skor_kecocokan: 92,
    deskripsi: 'Kredit Usaha Rakyat Mikro dengan bunga rendah dan proses cepat.',
    plafon_min: 1000000,
    plafon_max: 50000000,
    tenor_min: 6,
    tenor_max: 36,
    bunga_persen: 0.5,
    syarat: [
      'Usaha telah berjalan minimal 6 bulan.',
      'Fotokopi KTP, KK, dan NIB/SIUP.',
      'Tidak sedang memiliki kredit macet.',
      'Fotokopi rekening koran 3 bulan terakhir.',
    ],
  },
  {
    id: 2,
    nama_bank: 'Bank BNI',
    nama_produk: 'BNI Wirausaha',
    bunga: '7% per tahun',
    cicilan: 'Rp 2.100.000/bulan',
    skor_kecocokan: 85,
    deskripsi: 'Pinjaman modal usaha untuk UMKM dengan tenor fleksibel hingga 5 tahun.',
    plafon_min: 5000000,
    plafon_max: 100000000,
    tenor_min: 12,
    tenor_max: 60,
    bunga_persen: 0.58,
    syarat: [
      'Usaha telah berjalan minimal 1 tahun.',
      'Fotokopi KTP dan NPWP.',
      'Laporan keuangan sederhana 6 bulan terakhir.',
      'Tidak memiliki tunggakan di bank lain.',
    ],
  },
  {
    id: 3,
    nama_bank: 'Bank Mandiri',
    nama_produk: 'KUR Mandiri',
    bunga: '6% per tahun',
    cicilan: 'Rp 1.900.000/bulan',
    skor_kecocokan: 88,
    deskripsi: 'Solusi pinjaman modal usaha untuk usaha mikro dan kecil yang produktif.',
    plafon_min: 1000000,
    plafon_max: 50000000,
    tenor_min: 6,
    tenor_max: 36,
    bunga_persen: 0.5,
    syarat: [
      'Usaha telah berjalan minimal 6 bulan.',
      'Fotokopi KTP & NIB.',
      'Tidak sedang memiliki kredit produktif lain.',
      'Surat keterangan usaha dari kelurahan.',
    ],
  },
  {
    id: 4,
    nama_bank: 'Bank BCA',
    nama_produk: 'BCA KlikBisnis',
    bunga: '9% per tahun',
    cicilan: 'Rp 2.500.000/bulan',
    skor_kecocokan: 74,
    deskripsi: 'Pinjaman modal kerja untuk bisnis yang sudah berjalan minimal 2 tahun.',
    plafon_min: 10000000,
    plafon_max: 200000000,
    tenor_min: 12,
    tenor_max: 48,
    bunga_persen: 0.75,
    syarat: [
      'Usaha telah berjalan minimal 2 tahun.',
      'Rekening aktif di BCA minimal 6 bulan.',
      'Fotokopi KTP, NPWP, dan akta pendirian usaha.',
      'Laporan keuangan 1 tahun terakhir.',
    ],
  },
  {
    id: 5,
    nama_bank: 'Bank BTN',
    nama_produk: 'BTN Modal Usaha',
    bunga: '8% per tahun',
    cicilan: 'Rp 2.200.000/bulan',
    skor_kecocokan: 79,
    deskripsi: 'Kredit modal usaha untuk pengembangan bisnis skala menengah.',
    plafon_min: 5000000,
    plafon_max: 150000000,
    tenor_min: 12,
    tenor_max: 60,
    bunga_persen: 0.67,
    syarat: [
      'Usaha telah berjalan minimal 1 tahun.',
      'Fotokopi KTP, KK, dan NPWP.',
      'Bukti kepemilikan usaha (NIB/SIUP/TDP).',
      'Rekening koran 3 bulan terakhir.',
    ],
  },
];

// Simulasi delay jaringan biar kerasa realistis (300ms)
const mockDelay = (data) =>
  new Promise((resolve) => setTimeout(() => resolve(data), 300));

// ─── AUTH ─────────────────────────────────────────────────────────────────────

/**
 * Login user
 * @param {string} email
 * @param {string} password
 * @returns {{ success, message, token, role, user }}
 */
export const login = async (email, password) => {
  if (USE_MOCK) {
    // Simulasi validasi: email harus ada '@' dan password minimal 6 karakter
    if (!email.includes('@') || password.length < 6) {
      throw new Error('Email atau Password salah!');
    }
    return mockDelay({
      success: true,
      message: 'Login berhasil',
      token: 'mock-token-abc123',
      role: 'user',
      user: MOCK_USER,
    });
  }
  const res = await http.post('/login', { email, password });
  return res.data;
};

export const adminLogin = async (email, password) => {
  const res = await http.post('/admin/login', { email, password });
  return res.data;
};

export const bankLogin = async (email, password) => {
  if (USE_MOCK) {
    if (!email.includes('@') || password.length < 6) {
      throw new Error('Email atau Password salah!');
    }
    return mockDelay({
      success: true,
      message: 'Login bank berhasil',
      token: 'mock-token-bank123',
      role: 'bank',
      user: {
        id: 10,
        name: 'Yurii Kharlistov',
        email: email,
        role: 'bank',
        bank_id: 1,
      },
    });
  }
  const res = await http.post('/bank/login', { email, password });
  return res.data;
};

/**
 * Register user baru
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {{ message }}
 */
export const register = async (name, email, password) => {
  if (USE_MOCK) {
    return mockDelay({ message: 'Berhasil' });
  }
  const res = await http.post('/register', { name, email, password });
  return res.data;
};

/**
 * Lupa password — Step 1: Kirim OTP ke email
 * @param {string} email
 * @returns {{ status, message }}
 */
export const forgotPasswordStep1 = async (email) => {
  if (USE_MOCK) {
    return mockDelay({ status: 'success', message: 'OTP terkirim' });
  }
  const res = await http.post('/forgot-password', { step: 1, email });
  return res.data;
};

/**
 * Lupa password — Step 2: Verifikasi OTP
 * @param {string} email
 * @param {string} otp
 * @returns {{ status, message }}
 */
export const forgotPasswordStep2 = async (email, otp) => {
  if (USE_MOCK) {
    // Mock: OTP apapun dianggap valid
    return mockDelay({ status: 'success', message: 'OTP Valid' });
  }
  const res = await http.post('/forgot-password', { step: 2, email, otp });
  return res.data;
};

/**
 * Lupa password — Step 3: Ganti password baru
 * @param {string} email
 * @param {string} password
 * @returns {{ status, message }}
 */
export const forgotPasswordStep3 = async (email, password) => {
  if (USE_MOCK) {
    return mockDelay({ status: 'success', message: 'Password Berhasil Diubah' });
  }
  const res = await http.post('/forgot-password', { step: 3, email, password });
  return res.data;
};

// ─── PROFILE ──────────────────────────────────────────────────────────────────

/**
 * Ambil profil user yang sedang login
 * @returns {{ id, name, email, phone, bio, role }}
 */
export const getProfile = async () => {
  if (USE_MOCK) {
    const stored = JSON.parse(localStorage.getItem('user')) || {};
    return mockDelay({
      id:    stored.id    ?? 1,
      name:  stored.name  ?? 'Yurii Kharlistov',
      email: stored.email ?? 'user@example.com',
      phone: stored.phone ?? '08123456789',
      bio:   stored.bio   ?? '',
      role:  stored.role  ?? 'user',
    });
  }
  const res = await http.get('/profile');
  return res.data;
};

/**
 * Update profil user yang sedang login
 * @param {{ name, email, phone, bio }} data
 * @returns {{ message, user }}
 */
export const updateProfile = async (data) => {
  if (USE_MOCK) {
    // Simpan ke localStorage biar reaktif di sesi yang sama
    const stored = JSON.parse(localStorage.getItem('user')) || {};
    const updated = { ...stored, ...data };
    localStorage.setItem('user', JSON.stringify(updated));
    return mockDelay({ message: 'Profil berhasil diperbarui', user: updated });
  }
  const res = await http.put('/profile', data);
  // Sync localStorage setelah update berhasil
  const stored = JSON.parse(localStorage.getItem('user')) || {};
  localStorage.setItem('user', JSON.stringify({ ...stored, ...res.data.user }));
  return res.data;
};

/**
 * Ambil semua data bank
 * @returns {Array<{ id, nama_bank, nama_produk, bunga, cicilan, skor_kecocokan, deskripsi }>}
 */
export const getBanks = async () => {
  if (USE_MOCK) {
    return mockDelay(MOCK_BANKS);
  }
  const res = await http.get('/banks');
  return res.data;
};

export const getPublicAds = async () => {
  const res = await http.get('/content/ads');
  return res.data;
};

export const getPublicArticles = async () => {
  const res = await http.get('/content/articles');
  return res.data;
};

export const getAdminAds = async () => {
  const res = await http.get('/admin/ads');
  return res.data;
};

export const createAdminAd = async (payload) => {
  const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
  const res = await http.post('/admin/ads', payload,
    isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined
  );
  return res.data;
};

export const updateAdminAd = async (id, payload) => {
  const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
  if (isFormData) {
    payload.append('_method', 'PUT');
    const res = await http.post(`/admin/ads/${id}`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }
  const res = await http.put(`/admin/ads/${id}`, payload);
  return res.data;
};

export const deleteAdminAd = async (id) => {
  const res = await http.delete(`/admin/ads/${id}`);
  return res.data;
};

export const getAdminArticles = async () => {
  const res = await http.get('/admin/articles');
  return res.data;
};

export const createAdminArticle = async (payload) => {
  const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
  const res = await http.post('/admin/articles', payload, isFormData
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : undefined);
  return res.data;
};

export const updateAdminArticle = async (id, payload) => {
  const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
  if (isFormData) {
    // Workaround for Laravel PUT requests with file uploads
    payload.append('_method', 'PUT');
    const res = await http.post(`/admin/articles/${id}`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  }
  const res = await http.put(`/admin/articles/${id}`, payload);
  return res.data;
};

export const deleteAdminArticle = async (id) => {
  const res = await http.delete(`/admin/articles/${id}`);
  return res.data;
};

export const getAdminBanks = async () => {
  const res = await http.get('/admin/banks');
  return res.data;
};

export const getAdminBankCategories = async () => {
  const res = await http.get('/admin/bank-categories');
  return res.data;
};

export const createAdminBankCategory = async (payload) => {
  const res = await http.post('/admin/bank-categories', payload);
  return res.data;
};

export const updateAdminBankCategory = async (id, payload) => {
  const res = await http.put(`/admin/bank-categories/${id}`, payload);
  return res.data;
};

export const deleteAdminBankCategory = async (id) => {
  const res = await http.delete(`/admin/bank-categories/${id}`);
  return res.data;
};

export const createAdminBank = async (payload) => {
  const res = await http.post('/admin/banks', payload);
  return res.data;
};

export const updateAdminBank = async (id, payload) => {
  if (payload instanceof FormData) {
    payload.append('_method', 'PUT');
    const res = await http.post(`/admin/banks/${id}`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  }
  const res = await http.put(`/admin/banks/${id}`, payload);
  return res.data;
};

export const deleteAdminBank = async (id) => {
  const res = await http.delete(`/admin/banks/${id}`);
  return res.data;
};

export const getAdminUserDocuments = async () => {
  const res = await http.get('/admin/users/documents');
  return res.data;
};

export const auditUserDocument = async (payload) => {
  const res = await http.post('/admin/users/documents/audit', payload);
  return res.data;
};

// ─── OTP PINJAMAN ─────────────────────────────────────────────────────────────

/**
 * Generate & kirim OTP pengajuan pinjaman ke WhatsApp user
 * @param {number} bankId
 * @returns {{ status, message, phone }}
 */
export const sendLoanOtp = async (bankId) => {
  if (USE_MOCK) {
    return mockDelay({ status: 'success', message: 'OTP berhasil dikirim ke WhatsApp kamu.', phone: '0812****5678' });
  }
  const res = await http.post('/otp/send-loan', { bank_id: bankId });
  return res.data;
};

/**
 * Generate & kirim OTP pengajuan pinjaman ke Email user
 * @param {number} bankId
 * @returns {{ status, message, email }}
 */
export const sendLoanOtpEmail = async (bankId) => {
  if (USE_MOCK) {
    return mockDelay({ status: 'success', message: 'OTP berhasil dikirim ke Email kamu.', email: 'u***r@example.com' });
  }
  const res = await http.post('/otp/send-loan-email', { bank_id: bankId });
  return res.data;
};

/**
 * Verifikasi OTP pengajuan pinjaman
 * @param {string} otp  — 6 digit kode
 * @returns {{ status, message }}
 */
export const verifyLoanOtp = async (otp) => {
  if (USE_MOCK) {
    if (otp === '123456') return mockDelay({ status: 'success', message: 'OTP berhasil diverifikasi.' });
    throw Object.assign(new Error('Kode OTP salah atau sudah kadaluarsa.'), { response: { data: { message: 'Kode OTP salah atau sudah kadaluarsa.' } } });
  }
  const res = await http.post('/otp/verify-loan', { otp });
  return res.data;
};

// ─── OMZET / GRAFIK ──────────────────────────────────────────────────────────

/**
 * Ambil data omzet untuk chart
 * @returns {{ year: number, data: number[] }}
 */
export const getOmzet = async () => {
  if (USE_MOCK) {
    return mockDelay({ year: new Date().getFullYear(), data: [55, 20, 35, 25, 75, 60, 55, 90, 8, 65, 82, 72] });
  }
  const res = await http.get('/omzet');
  return res.data;
};

/**
 * Simpan data omzet ke chart backend
 * @param {number} year 
 * @param {number[]} data - array of 12 numbers (Jan - Des)
 * @returns {{ message }}
 */
export const saveOmzet = async (year, data) => {
  if (USE_MOCK) {
    return mockDelay({ message: 'Mock data omzet tersimpan' });
  }
  const res = await http.post('/omzet', { year, data });
  return res.data;
};

// ─── BUSINESS PROFILE / KESEHATAN BISNIS ─────────────────────────────────────

const MOCK_BUSINESS_PROFILE = {
  has_nib: false,
  has_npwp: false,
  has_ktp: false,
  has_kk: false,
  has_selfie_ktp: false,
  has_ttd: false,
  has_rekening: false,
  has_foto_usaha: false,
  has_kontrak: false,
  has_bukti_pelunasan: false,
  omzet_bulan_ini: null,
  cicilan_berjalan: null,
  skor_profitabilitas: 0,
  skor_legalitas: 0,
  skor_tren_omzet: 0,
  skor_kolektibilitas: 0,
  skor_keberlanjutan: 0,
  skor_kapasitas_utang: 0,
  skor_total: 0,
  updated_at: null,
};

/**
 * Ambil profil bisnis + skor kesehatan bisnis user
 * @returns {BusinessProfile}
 */
export const getBusinessProfile = async () => {
  if (USE_MOCK) {
    const stored = JSON.parse(localStorage.getItem('business_profile') || 'null');
    return mockDelay(stored || MOCK_BUSINESS_PROFILE);
  }
  const res = await http.get('/business-profile');
  return res.data;
};

/**
 * Update data bisnis (multipart/form-data karena ada upload file)
 * @param {FormData} formData
 * @returns {{ message, data: BusinessProfile }}
 */
export const updateBusinessProfile = async (formData) => {
  if (USE_MOCK) {
    // Baca nilai dari FormData untuk update mock
    const stored = JSON.parse(localStorage.getItem('business_profile') || 'null') || { ...MOCK_BUSINESS_PROFILE };

    const omzet = parseFloat(formData.get('omzet_bulan_ini')) || stored.omzet_bulan_ini || 0;
    const cicilan = parseFloat(formData.get('cicilan_berjalan')) || stored.cicilan_berjalan || 0;

    if (formData.get('nib'))     stored.has_nib = true;
    if (formData.get('npwp'))    stored.has_npwp = true;
    if (formData.get('ktp'))     stored.has_ktp = true;
    if (formData.get('kk'))      stored.has_kk = true;
    if (formData.get('selfie_ktp')) stored.has_selfie_ktp = true;
    if (formData.get('tanda_tangan')) stored.has_ttd = true;
    if (formData.get('rekening')) stored.has_rekening = true;
    if (formData.get('foto_usaha')) stored.has_foto_usaha = true;
    if (formData.get('kontrak')) stored.has_kontrak = true;
    if (formData.get('bukti_pelunasan')) stored.has_bukti_pelunasan = true;

    stored.omzet_bulan_ini = omzet;
    stored.cicilan_berjalan = cicilan;

    // Hitung ulang skor (sederhana untuk mock)
    stored.skor_legalitas = 20 + (stored.has_nib ? 40 : 0) + (stored.has_npwp ? 40 : 0);
    stored.skor_profitabilitas = Math.min(30 + (stored.has_rekening ? 30 : 0) + (omzet >= 10_000_000 ? 40 : omzet >= 5_000_000 ? 25 : omzet > 0 ? 10 : 0), 100);
    stored.skor_tren_omzet = Math.min(40 + (omzet > 0 ? 20 : 0), 100);
    stored.skor_keberlanjutan = Math.min(20 + (stored.has_foto_usaha ? 40 : 0) + (stored.has_kontrak ? 40 : 0), 100);
    const ratio = omzet > 0 ? cicilan / omzet : 0;
    stored.skor_kapasitas_utang = ratio <= 0.2 ? 90 : ratio <= 0.35 ? 75 : ratio <= 0.5 ? 55 : 30;
    stored.skor_kolektibilitas = Math.min(50 + (stored.has_bukti_pelunasan ? 30 : 0) + (cicilan === 0 ? 20 : 0), 100);
    stored.skor_total = stored.skor_legalitas + stored.skor_profitabilitas + stored.skor_tren_omzet + stored.skor_kolektibilitas + stored.skor_keberlanjutan + stored.skor_kapasitas_utang;
    stored.updated_at = new Date().toISOString();

    localStorage.setItem('business_profile', JSON.stringify(stored));
    return mockDelay({ message: 'Data bisnis berhasil diperbarui (mock)', data: stored });
  }

  // Hit backend dengan FormData (Content-Type diset otomatis oleh browser)
  const res = await http.post('/business-profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// ─── PENGAJUAN MODAL & PORTAL BANK ───────────────────────────────────────────

/**
 * Kirim pengajuan (multipart): bank_id, nominal_pinjaman, tenor, ktp_nama, ktp_nik,
 * pemohon_alamat (opsional), ktp (file), nib (file), cicilan_per_bulan (opsional).
 */
export const createSubmission = async (formData) => {
  if (USE_MOCK) {
    return mockDelay({
      message: 'Pengajuan berhasil (mock)',
      data: { id: 99, reference_code: 'REQ-2026-000099', status: 'menunggu' },
    });
  }
  const res = await http.post('/submissions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const getBankSubmissions = async () => {
  if (USE_MOCK) {
    return mockDelay([]);
  }
  const res = await http.get('/bank/submissions');
  return res.data;
};

export const getBankSubmission = async (submissionId) => {
  if (USE_MOCK) {
    return mockDelay(null);
  }
  const res = await http.get(`/bank/submissions/${submissionId}`);
  return res.data;
};

/**
 * @param {number} submissionId
 * @param {'disetujui'|'ditolak'} status
 * @param {string} message
 */
export const updateBankSubmissionStatus = async (submissionId, status, message = '') => {
  if (USE_MOCK) {
    return mockDelay({ message: 'OK (mock)' });
  }
  const res = await http.patch(`/bank/submissions/${submissionId}/status`, { status, message });
  return res.data;
};

/**
 * Daftar pengajuan nasabah (GET /submissions) — sinkron status dengan bank.
 * @returns {Promise<Array>}
 */
export const getMySubmissions = async () => {
  if (USE_MOCK) {
    return mockDelay([]);
  }
  const res = await http.get('/submissions');
  return res.data;
};

/** Batalkan pengajuan (DELETE) — hanya saat status menunggu. */
export const cancelSubmission = async (submissionId) => {
  if (USE_MOCK) {
    return mockDelay({ message: 'Dibatalkan (mock)' });
  }
  const res = await http.delete(`/submissions/${submissionId}`);
  return res.data;
};

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

export const getNotifications = async () => {
  if (USE_MOCK) {
    return mockDelay({ data: [] });
  }
  const res = await http.get('/notifications');
  return res.data;
};

export const markNotificationAsRead = async (id) => {
  if (USE_MOCK) {
    return mockDelay({ message: 'OK' });
  }
  const res = await http.patch(`/notifications/${id}/read`);
  return res.data;
};

export const markAllNotificationsAsRead = async () => {
  if (USE_MOCK) {
    return mockDelay({ message: 'OK' });
  }
  const res = await http.post('/notifications/read-all');
  return res.data;
};

// ─── SETTINGS ────────────────────────────────────────────────────────────────

/**
 * Ganti password user yang sedang login
 * @param {string} current_password
 * @param {string} new_password
 * @param {string} new_password_confirmation
 */
export const changePassword = async (current_password, new_password, new_password_confirmation) => {
  if (USE_MOCK) {
    if (current_password !== 'password123') {
      throw Object.assign(new Error('Password saat ini tidak sesuai.'), {
        response: { data: { message: 'Password saat ini tidak sesuai.' } },
      });
    }
    return mockDelay({ message: 'Password berhasil diubah.' });
  }
  const res = await http.post('/profile/change-password', {
    current_password,
    new_password,
    new_password_confirmation,
  });
  return res.data;
};

/**
 * Hapus akun user beserta semua data (konfirmasi dengan password)
 * @param {string} password
 */
export const deleteAccount = async (password) => {
  if (USE_MOCK) {
    if (password !== 'password123') {
      throw Object.assign(new Error('Password tidak sesuai. Akun tidak dihapus.'), {
        response: { data: { message: 'Password tidak sesuai. Akun tidak dihapus.' } },
      });
    }
    return mockDelay({ message: 'Akun berhasil dihapus.' });
  }
  const res = await http.delete('/account', { data: { password } });
  return res.data;
};

/**
 * Kirim pesan dari nasabah ke petugas bank
 */
export const postUserSubmissionMessage = async (submissionId, message) => {
  if (USE_MOCK) {
    return mockDelay({ message: 'Pesan berhasil dikirim (mock)' });
  }
  const res = await http.post(`/submissions/${submissionId}/message`, { message });
  return res.data;
};

/**
 * Kirim balasan dari petugas bank ke nasabah
 */
export const postBankSubmissionMessage = async (submissionId, message) => {
  if (USE_MOCK) {
    return mockDelay({ message: 'Balasan berhasil dikirim (mock)' });
  }
  const res = await http.post(`/bank/submissions/${submissionId}/message`, { message });
  return res.data;
};
