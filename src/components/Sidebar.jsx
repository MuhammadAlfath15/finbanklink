import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CircleDollarSign, Activity, History, UserCircle, Menu } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrollProgress, setScrollProgress] = useState(0); // 0 → 1
  const rafRef = useRef(null);

  useEffect(() => {
    const SCROLL_RANGE = 80;

    const handleScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        const progress = Math.min(window.scrollY / SCROLL_RANGE, 1);
        setScrollProgress(progress);
        rafRef.current = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const p = scrollProgress; // nilai mentah 0→1, biarkan CSS yang ease

  // ── Hanya properti BAR yang berubah, bukan konten/padding ──
  const navHeight   = 84 - p * 14;                   // 84 → 70 px
  const navMt       = p * 16;                         // 0  → 16 px
  const navBorderR  = p * 9999;                       // 0  → pill
  const navMaxW     = `calc(100% - ${p * 32}px)`;    // 100% → calc(100%-2rem)
  const bgAlpha     = 1 - p * 0.25;                  // 1.0 → 0.75
  const blurPx      = p * 8;                          // 0  → 8px
  const shadowA     = p * 0.25;                       // 0  → 0.25

  const menuItems = [
    { name: 'Beranda',          icon: <LayoutDashboard size={22} />, path: '/dashboard' },
    { name: 'Cari Modal',       icon: <CircleDollarSign size={22} />, path: '/cari-modal' },
    { name: 'Kesehatan Bisnis', icon: <Activity size={22} />,         path: '/kesehatan-bisnis' },
    { name: 'Status/Riwayat',  icon: <History size={22} />,           path: '/riwayat' },
    { name: 'Profile',          icon: <UserCircle size={22} />,       path: '/profile' },
  ];

  return (
    /* Wrapper sticky — tinggi tetap 84px agar layout di bawah tidak loncat */
    <div className="sticky top-0 z-50 w-full h-[84px]">
      {/*
        Layer luar: full-width, center align, pointer-events-none
        Layer dalam (nav): hanya bar yang berubah shape
      */}
      <div className="absolute inset-0 flex justify-center pointer-events-none">
        <nav
          style={{
            /* ── Shape bar ── */
            height:           `${navHeight}px`,
            marginTop:        `${navMt}px`,
            borderRadius:     `${navBorderR}px`,
            maxWidth:         navMaxW,
            /* ── Visual bar ── */
            backgroundColor:  `rgba(117, 177, 255, ${bgAlpha})`,
            backdropFilter:   `blur(${blurPx}px)`,
            WebkitBackdropFilter: `blur(${blurPx}px)`,
            boxShadow:        `0 8px 30px rgba(0,59,149,${shadowA})`,
            /* ── CSS transition hanya pada properti bar ── */
            transition: [
              'height 0.5s cubic-bezier(0.4,0,0.2,1)',
              'margin-top 0.5s cubic-bezier(0.4,0,0.2,1)',
              'border-radius 0.5s cubic-bezier(0.4,0,0.2,1)',
              'max-width 0.5s cubic-bezier(0.4,0,0.2,1)',
              'background-color 0.5s ease',
              'box-shadow 0.5s ease',
            ].join(', '),
            willChange: 'height, border-radius, max-width',
          }}
          /* padding KONSTAN — konten tidak ikut bergerak */
          className="pointer-events-auto w-full flex items-center justify-between overflow-hidden px-6 md:px-12"
        >
          {/* Logo Brand */}
          <div
            className="flex items-center cursor-pointer shrink-0"
            onClick={() => navigate('/dashboard')}
          >
            <h1 className="text-2xl md:text-[28px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0047AB] via-[#001D4A] to-black">
              FinBankLink
            </h1>
          </div>

          {/* Menu Navigasi - Desktop & Tablet */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-white keep-light text-[#003B95] font-bold shadow-sm'
                      : 'text-white font-semibold hover:bg-white/20'
                  }`}
                >
                  <span className={isActive ? 'text-[#003B95]' : 'text-white'}>
                    {item.icon}
                  </span>
                  <span className="text-[14px] tracking-wide">{item.name}</span>
                </button>
              );
            })}
          </div>

          {/* Hamburger Menu - Mobile */}
          <div className="lg:hidden flex items-center shrink-0">
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