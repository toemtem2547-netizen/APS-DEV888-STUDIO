import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Zap,
  Gift,
  Tag,
  Package,
  Wallet,
  Plus,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Clock,
  ShieldCheck,
  Shield,
  Menu,
  X,
  Trophy,
  Disc,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useSettings } from '../context/SettingsContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { balance, openTopupModal } = useWallet();
  const { settings } = useSettings();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const mbEnabled = settings.game_mystery_box_enabled !== 'false';
  const gachaEnabled = settings.game_gacha_enabled !== 'false';
  const wheelEnabled = settings.game_wheel_enabled !== 'false';

  const navLinks = [
    { label: 'หน้าแรก', path: '/', icon: Zap },
    { label: 'เติมเงิน', path: '/topup', icon: Package },
    {
      label: settings.game_mystery_box_title?.split('(')[0]?.trim() || 'กล่องสุ่ม',
      path: '/mystery-box',
      icon: Gift,
      disabled: !mbEnabled,
    },
    {
      label: settings.game_gacha_title?.split('(')[0]?.trim() || 'วงล้อกาชา',
      path: '/gacha',
      icon: Trophy,
      disabled: !gachaEnabled,
    },
    {
      label: settings.game_wheel_title?.split('(')[0]?.trim() || 'เปิดการ์ด 3D',
      path: '/wheel',
      icon: Sparkles,
      disabled: !wheelEnabled,
    },
    {
      label: (settings as any).game_slot_title?.split('(')[0]?.trim() || 'สล็อตแมวทอง',
      path: '/slot',
      icon: Disc,
      disabled: (settings as any).game_slot_enabled === 'false',
    },
    { label: 'โปรโมชั่น', path: '/promotions', icon: Tag },
    { label: 'คลังไอเทม', path: '/inventory', icon: ShieldCheck },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#07090D]/90 backdrop-blur-md border-b border-white/10 py-3 shadow-lg shadow-black/40'
          : 'bg-gradient-to-b from-[#07090D]/90 via-[#07090D]/60 to-transparent py-4'
      }`}
    >
      <div className="max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Logo & Game Title */}
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-indigo-600/20 border border-indigo-500/40 p-1 flex items-center justify-center transition-transform group-hover:scale-105 shadow-md shadow-indigo-500/20 flex-shrink-0">
            {settings.game_logo ? (
              <img
                src={settings.game_logo}
                alt={settings.game_title}
                className="w-full h-full object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Zap className="w-6 h-6 text-indigo-400" />
            )}
          </div>
          <div className="flex-shrink-0">
            <span className="font-extrabold text-base sm:text-lg lg:text-xl tracking-wider text-white flex items-center gap-1.5 font-sans whitespace-nowrap">
              {settings.game_title}
            </span>
            <span className="text-[10px] text-zinc-400 font-medium tracking-wider uppercase block -mt-0.5 whitespace-nowrap">
              OFFICIAL STORE
            </span>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#0D1117]/80 backdrop-blur-md p-1.5 rounded-full border border-white/5 flex-shrink-0">
          {navLinks.map((link: any) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 xl:px-4 py-2 rounded-full text-xs xl:text-sm font-medium flex items-center gap-2 transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? link.isSpecial
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                      : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                    : link.isSpecial
                    ? 'text-amber-300 hover:text-amber-200 hover:bg-amber-500/10'
                    : 'text-zinc-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? (link.isSpecial ? 'text-slate-950' : 'text-white') : (link.isSpecial ? 'text-amber-400' : 'text-zinc-400')}`} />
                <span className="whitespace-nowrap">{link.label}</span>
                {link.disabled && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap flex-shrink-0">
                    ปิดปรับปรุง
                  </span>
                )}
                {link.isSpecial && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap flex-shrink-0 ${
                    isActive ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'
                  }`}>
                    FREE
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Wallet & Profile / Auth */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          {isAuthenticated ? (
            <>
              {/* Wallet Pill */}
              <div className="flex items-center bg-[#0D1117] border border-white/10 rounded-full pl-3 pr-1.5 py-1 text-sm shadow-inner group flex-shrink-0">
                <Wallet className="w-4 h-4 text-indigo-400 mr-2" />
                <span className="text-zinc-400 text-xs mr-1">{settings.currency_symbol}</span>
                <span className="font-bold text-white tracking-wide pr-2">
                  {balance.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <button
                  onClick={openTopupModal}
                  title="เติมเครดิต"
                  className="w-7 h-7 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all shadow-md shadow-indigo-600/40 hover:scale-105 active:scale-95 flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* User Dropdown */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 bg-[#121821] hover:bg-zinc-800/80 border border-white/10 rounded-full px-3 py-1.5 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0">
                    {user?.username?.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-zinc-200 hidden sm:inline-block max-w-[90px] truncate">
                    {user?.username}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-[#0D1117] border border-white/10 rounded-2xl shadow-2xl shadow-black/80 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-white/5">
                      <p className="text-xs text-zinc-400">เข้าสู่ระบบในชื่อ</p>
                      <p className="text-sm font-bold text-white truncate">{user?.username}</p>
                      {user?.playerId && (
                        <p className="text-xs text-indigo-400 mt-0.5">UID: {user.playerId}</p>
                      )}
                    </div>
                    <Link
                      to="/inventory"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-indigo-400" />
                      คลังไอเทมของฉัน
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Clock className="w-4 h-4 text-emerald-400" />
                      ประวัติการสั่งซื้อ
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-blue-400" />
                      ข้อมูลส่วนตัว
                    </Link>

                    {/* Admin Featured Row in Dropdown */}
                    <div className="px-2 pt-1 border-t border-white/5 my-1">
                      <Link
                        to="/admin"
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/20 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-indigo-400" />
                          <span>โหมดแอดมิน (Backoffice)</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded font-mono font-bold">
                          ADMIN
                        </span>
                      </Link>
                    </div>

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/30 whitespace-nowrap flex-shrink-0"
            >
              เข้าสู่ระบบ
            </button>
          )}

          {/* Dedicated Sleek Admin Quick Button */}
          <Link
            to="/admin"
            className="w-9 h-9 rounded-full bg-[#121821] hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500/40 flex items-center justify-center text-zinc-400 hover:text-indigo-400 transition-all flex-shrink-0 relative group shadow-sm"
            title="เข้าสู่ระบบจัดการหลังบ้าน (Backoffice)"
          >
            <Shield className="w-4 h-4 text-indigo-400 transition-transform group-hover:scale-110" />
            <span className="absolute -bottom-8 right-0 hidden group-hover:flex items-center bg-[#0D1117] text-zinc-200 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-white/10 shadow-xl whitespace-nowrap z-50 pointer-events-none">
              🛡️ โหมดแอดมิน
            </span>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#07090D]/95 border-b border-white/10 px-4 py-4 space-y-2 animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
                {link.disabled && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    ปิดปรับปรุง
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
