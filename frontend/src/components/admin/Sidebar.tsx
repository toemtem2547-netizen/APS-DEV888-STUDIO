import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Gift,
  Award,
  Tag,
  Users,
  Shield,
  Settings,
  LogOut,
  ExternalLink,
  Zap,
  Trophy,
  Home as HomeIcon,
  Palette,
  Disc,
  Gamepad2,
  Sparkles,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { admin, logout, hasPermission } = useAdminAuth();

  const operationsMenus = [
    { label: 'ภาพรวมระบบ (Dashboard)', path: '/admin', icon: LayoutDashboard, perm: 'dashboard.view' },
    { label: 'จัดการคำสั่งซื้อ (Orders)', path: '/admin/orders', icon: ShoppingCart, perm: 'orders.manage' },
    { label: 'สมาชิก & เครดิต (Users)', path: '/admin/users', icon: Users, perm: 'users.manage' },
    { label: 'ผู้ดูแลระบบ (Admins & Roles)', path: '/admin/admins', icon: Shield, perm: 'admins.manage' },
    { label: 'ตั้งค่าเว็บไซต์ (Site Settings)', path: '/admin/settings', icon: Settings, perm: 'settings.manage' },
  ];

  const storefrontMenus = [
    { label: 'จัดการหน้าหลัก (Home Page)', path: '/admin/home', icon: HomeIcon, perm: 'settings.manage' },
    { label: 'จัดการระบบเกมส์ (Game Control)', path: '/admin/games', icon: Gamepad2, perm: 'settings.manage' },
    { label: 'แพ็กเกจเติมเงิน (Packages)', path: '/admin/packages', icon: Package, perm: 'packages.manage' },
    { label: 'กล่องสุ่ม (Mystery Boxes)', path: '/admin/mystery-boxes', icon: Gift, perm: 'boxes.manage' },
    { label: 'วงล้อกาชา (Gacha Vault)', path: '/admin/gacha', icon: Trophy, perm: 'boxes.manage' },
    { label: 'เปิดการ์ด 3D (Lucky Tarot)', path: '/admin/wheel', icon: Sparkles, perm: 'boxes.manage' },
    { label: 'ของรางวัล (Rewards)', path: '/admin/rewards', icon: Award, perm: 'rewards.manage' },
    { label: 'โปรโมชั่น & โค้ด (Promotions)', path: '/admin/promotions', icon: Tag, perm: 'promotions.manage' },
  ];

  const renderNavList = (items: typeof operationsMenus) => (
    <div className="space-y-1.5">
      {items.map((item) => {
        if (!hasPermission(item.perm)) return null;

        const Icon = item.icon;
        const isActive = item.path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.path);

        return (
          <Link
            key={item.path}
            to={item.path}
            className={clsx(
              'flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
              isActive
                ? 'bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30 shadow-md shadow-indigo-950/40'
                : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'
            )}
          >
            <Icon
              className={clsx(
                'w-5 h-5 transition-transform duration-200 group-hover:scale-110 flex-shrink-0',
                isActive ? 'text-indigo-400' : 'text-zinc-400 group-hover:text-zinc-200'
              )}
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <aside className="w-72 bg-[#0A0D14] border-r border-white/10 flex flex-col justify-between h-screen fixed top-0 left-0 z-30 select-none">
      {/* Top Brand & Nav */}
      <div className="overflow-y-auto flex-1 no-scrollbar">
        <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0A0D14]/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-base text-white tracking-wider">BACKOFFICE</span>
              <span className="text-xs text-zinc-400 block">Storefront CMS & Control</span>
            </div>
          </div>
        </div>

        {/* Navigation Categories */}
        <nav className="p-3.5 space-y-6">
          {/* Section 1: Operations & System (Moved to TOP) */}
          <div>
            <div className="px-3.5 pb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
              <Shield className="w-4 h-4" />
              <span>การดำเนินงาน & ระบบ</span>
            </div>
            {renderNavList(operationsMenus)}
          </div>

          {/* Section 2: Storefront Pages (Moved to BOTTOM) */}
          <div>
            <div className="px-3.5 pb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
              <Palette className="w-4 h-4" />
              <span>จัดการเนื้อหาหน้าเว็บ</span>
            </div>
            {renderNavList(storefrontMenus)}
          </div>
        </nav>
      </div>

      {/* Footer Profile & External Link */}
      <div className="p-3.5 border-t border-white/5 space-y-2.5">
        <Link
          to="/"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all shadow-sm"
        >
          <span>เปิดหน้าร้านค้าลูกค้า</span>
          <ExternalLink className="w-4 h-4" />
        </Link>

        <div className="flex items-center justify-between bg-[#10141E] border border-white/10 p-3 rounded-2xl shadow-inner">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white flex-shrink-0 shadow-md shadow-indigo-500/30">
              {admin?.username?.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{admin?.fullName || admin?.username}</p>
              <span className="text-[11px] text-indigo-400 font-semibold uppercase">{admin?.roleName}</span>
            </div>
          </div>

          <button
            onClick={logout}
            title="ออกจากระบบ"
            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
