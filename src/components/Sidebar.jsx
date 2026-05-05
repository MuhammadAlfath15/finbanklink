import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CircleDollarSign, Activity, History, UserCircle } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Beranda', icon: <LayoutDashboard size={28} />, path: '/dashboard' },
    { name: 'Cari Modal', icon: <CircleDollarSign size={28} />, path: '/cari-modal' },
    { name: 'Kesehatan Bisnis', icon: <Activity size={28} />, path: '/kesehatan-bisnis' },
    { name: 'Status/Riwayat', icon: <History size={28} />, path: '/riwayat' },
    { name: 'Profile', icon: <UserCircle size={28} />, path: '/profile' },
  ];

  return (
    <nav className="w-full bg-[#75B1FF] h-20 flex items-center justify-between px-16 relative z-50 overflow-visible">
      <h1 className="text-3xl font-bold text-[#003B95]">FinBankLink</h1>

      <div className="flex items-center h-full gap-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div key={item.name} className="relative w-20 h-full flex justify-center">
              {isActive ? (
                /* Container yang turun lebih dalam (Top-8) */
                <div className="absolute top-8 flex flex-col items-center">
                  
                  {/* Lingkaran Putih Luar - Warna disamakan dengan background Dashboard */}
                  {/* Tanpa shadow agar menyatu total */}
                  <div className="w-[100px] h-[100px] bg-[#F8FAFC] rounded-full absolute z-10"></div>
                  
                  {/* Lingkaran Biru Ikon - Tetap menonjol */}
                  <div className="w-16 h-16 bg-[#75B1FF] rounded-full flex items-center justify-center text-white border-[4px] border-white shadow-md relative z-20 top-4">
                    {item.icon}
                  </div>
                  
                </div>
              ) : (
                <button
                  onClick={() => navigate(item.path)}
                  className="text-white hover:bg-white/20 p-4 rounded-full transition-all self-center"
                >
                  {item.icon}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default Sidebar;