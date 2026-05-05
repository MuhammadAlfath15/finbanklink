import React from 'react';
import { useNavigate } from 'react-router-dom';

const BankDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // Hapus token dan role
    navigate('/');        // Lempar balik ke login
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-medium text-gray-800">
          Dashboard Verifikasi Bank
        </h1>
        <button 
          onClick={handleLogout}
          className="text-sm font-medium text-red-500 hover:text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
        >
          Logout
        </button>
      </div>
      
      {/* Konten tabel yang kemarin tetap di bawah sini */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
         {/* ... isi tabel ... */}
      </div>
    </div>
  );
};

export default BankDashboard;