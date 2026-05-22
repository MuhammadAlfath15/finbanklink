import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import BankLogin from './pages/BankLogin';
import Daftar from './pages/Daftar';
import LupaPassword from './pages/LupaPassword';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import CariModal from './pages/CariModal';
import KesehatanBisnis from './pages/KesehatanBisnis';
import UpdateBisnis from './pages/UpdateBisnis';
import Riwayat from './pages/Riwayat';
import Profile from './pages/Profile';
import BankDashboard from './pages/BankDashboard';
import AjukanPinjaman from './pages/AjukanPinjaman';
import VerifikasiOTP from './pages/VerifikasiOTP';
import PengajuanFlow from './pages/PengajuanFlow';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';
import { Toaster } from 'react-hot-toast';

// Komponen Pelindung Rute berdasarkan Role
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  const defaultRouteByRole = {
    admin: '/admin/dashboard',
    bank: '/bank-dashboard',
    user: '/dashboard',
  };

  if (!token) {
    return <Navigate to="/" />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to={defaultRouteByRole[userRole] || '/'} />;
  }

  return children;
};

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        {/* Halaman Publik */}
        <Route path="/" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/bank/login" element={<BankLogin />} />
        <Route path="/daftar" element={<Daftar />} />
        <Route path="/lupa password" element={<LupaPassword />} /> {/* UDAH GAK PAKE SPASI */}

        {/* Halaman Internal pakai MainLayout */}
        <Route element={<MainLayout />}>
          
          {/* Rute khusus USER/NASABAH */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['user']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/cari-modal" element={
            <ProtectedRoute allowedRoles={['user']}>
              <CariModal />
            </ProtectedRoute>
          } />

          <Route path="/kesehatan-bisnis" element={
            <ProtectedRoute allowedRoles={['user']}>
              <KesehatanBisnis />
            </ProtectedRoute>
          } />

          <Route path="/riwayat" element={
            <ProtectedRoute allowedRoles={['user']}>
              <Riwayat />
            </ProtectedRoute>
          } />

          {/* Rute khusus BANK */}
          <Route path="/bank-dashboard" element={
            <ProtectedRoute allowedRoles={['bank']}>
              <BankDashboard />
            </ProtectedRoute>
          } />

          {/* Rute yang bisa diakses SEMUA role yang sudah login */}
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['user', 'bank', 'admin']}>
              <Profile />
            </ProtectedRoute>
          } />

        </Route>

        {/* Rute khusus ADMIN (Full Screen layout) */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Halaman Pengajuan & Verifikasi OTP — tanpa navbar/MainLayout */}
        <Route path="/ajukan-pinjaman" element={
          <ProtectedRoute allowedRoles={['user']}>
            <AjukanPinjaman />
          </ProtectedRoute>
        } />

        <Route path="/verifikasi-otp" element={
          <ProtectedRoute allowedRoles={['user']}>
            <VerifikasiOTP />
          </ProtectedRoute>
        } />

        <Route path="/pengajuan-flow" element={
          <ProtectedRoute allowedRoles={['user']}>
            <PengajuanFlow />
          </ProtectedRoute>
        } />

        <Route path="/update-bisnis" element={
          <ProtectedRoute allowedRoles={['user']}>
            <UpdateBisnis />
          </ProtectedRoute>
        } />

        {/* Kalau rute gak ketemu, lempar ke login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;