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

// ─── OTP PINJAMAN ─────────────────────────────────────────────────────────────

/**
 * Generate & kirim OTP pengajuan pinjaman ke WhatsApp user
 * @returns {{ status, message, phone }}
 */
export const sendLoanOtp = async () => {
  if (USE_MOCK) {
    return mockDelay({ status: 'success', message: 'OTP berhasil dikirim ke WhatsApp kamu.', phone: '0812****5678' });
  }
  const res = await http.post('/otp/send-loan');
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

