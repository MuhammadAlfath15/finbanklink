import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar'; // Pastiin path importnya bener

const MainLayout = () => {
  const role = localStorage.getItem('role');

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* 
          Hanya tampilkan Sidebar jika role-nya BUKAN bank.
          Kalau role-nya bank, navbar/sidebar ini hilang total.
      */}
      {role === 'user' && <Sidebar />}

      {/* Konten Utama */}
      <main className={`flex-1 px-10 ${role === 'bank' ? 'pt-6' : 'pt-6'}`}>
        <div className="bg-white rounded-[40px] shadow-lg p-10 min-h-[70vh] mb-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;