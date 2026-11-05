import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Package, Gift, Trophy, ShieldCheck, User, Sparkles, Disc } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  isGold?: boolean;
  requiresAuth?: boolean;
  isAccount?: boolean;
  isDisabled?: boolean;
}

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { settings } = useSettings();

  const mbEnabled = settings.game_mystery_box_enabled !== 'false';
  const gachaEnabled = settings.game_gacha_enabled !== 'false';
  const wheelEnabled = settings.game_wheel_enabled !== 'false';

  const items: NavItem[] = [
    { label: 'หน้าแรก', path: '/', icon: Zap },
    { label: 'เติมเงิน', path: '/topup', icon: Package },
    {
      label: settings.game_mystery_box_title?.split('(')[0]?.trim() || 'กล่องสุ่ม',
      path: '/mystery-box',
      icon: Gift,
      isDisabled: !mbEnabled,
    },
    {
      label: settings.game_gacha_title?.split('(')[0]?.trim() || 'วงล้อกาชา',
      path: '/gacha',
      icon: Trophy,
      isGold: true,
      isDisabled: !gachaEnabled,
    },
    {
      label: settings.game_wheel_title?.split('(')[0]?.trim() || 'เปิดการ์ด 3D',
      path: '/wheel',
      icon: Sparkles,
      isDisabled: !wheelEnabled,
    },
    {
      label: 'สล็อต',
      path: '/slots',
      icon: Disc,
      isGold: true,
      isDisabled: (settings as any).game_slot_enabled === 'false',
    },
    { label: 'คลัง', path: '/inventory', icon: ShieldCheck, requiresAuth: true },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07090D]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 pb-safe">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          if (item.isAccount && !isAuthenticated) {
            return (
              <button
                key={item.label}
                onClick={() => openAuthModal('login')}
                className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-zinc-400 hover:text-white"
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          }

          if (item.requiresAuth && !isAuthenticated) {
            return (
              <button
                key={item.label}
                onClick={() => openAuthModal('login')}
                className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-zinc-400 hover:text-white"
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-indigo-400 font-bold scale-105'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-indigo-500/10' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
