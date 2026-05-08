import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CircleDollarSign, Activity, History, UserCircle, Menu } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: 'Beranda', icon: <LayoutDashboard size={22} />, path: '/dashboard' },
    { name: 'Cari Modal', icon: <CircleDollarSign size={22} />, path: '/cari-modal' },
    { name: 'Kesehatan Bisnis', icon: <Activity size={22} />, path: '/kesehatan-bisnis' },
    { name: 'Status/Riwayat', icon: <History size={22} />, path: '/riwayat' },
    { name: 'Profile', icon: <UserCircle size={22} />, path: '/profile' },
  ];

  return (
    <div className="sticky top-0 z-50 w-full h-[84px]">
      <div className="w-full h-full absolute top-0 left-0 flex justify-center pointer-events-none">
        <nav 
          className={`pointer-events-auto w-full flex items-center justify-between ease-out transition-all duration-500 overflow-hidden ${
            isScrolled 
              ? 'max-w-[calc(100%-2rem)] lg:max-w-[1200px] bg-[#75B1FF]/75 backdrop-blur-[3px] shadow-[0_8px_30px_rgba(0,59,149,0.25)] h-[70px] px-6 md:px-10 rounded-full mt-4' 
              : 'max-w-full bg-[#75B1FF] shadow-md h-[84px] px-6 md:px-12 rounded-none mt-0'
          }`}
        >
      {/* Logo Brand */}
      <div 
        className="flex items-center cursor-pointer" 
        onClick={() => navigate('/dashboard')}
      >
        <h1 className="text-2xl md:text-[28px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0047AB] via-[#001D4A] to-black">
          FinBankLink
        </h1>
      </div>

      {/* Menu Navigasi - Desktop & Tablet */}
      <div className="hidden lg:flex items-center h-full gap-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-white text-[#003B95] font-bold shadow-sm' 
                  : 'text-white font-semibold hover:bg-white/20'
              }`}
            >
              <span className={`${isActive ? 'text-[#003B95]' : 'text-white'}`}>
                {item.icon}
              </span>
              <span className="text-[14px] tracking-wide">{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* Hamburger Menu - Mobile (untuk user awam jika di layar kecil) */}
      <div className="lg:hidden flex items-center">
        <button className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors">
          <Menu size={28} />
        </button>
      </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;