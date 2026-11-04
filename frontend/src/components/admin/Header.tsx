import React from 'react';
import { ShieldCheck, Bell } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { admin } = useAdminAuth();

  return (
    <header className="h-16 bg-[#0A0D14]/80 backdrop-blur-md border-b border-white/10 px-8 flex items-center justify-between fixed top-0 right-0 left-72 z-20">
      <div>
        <h2 className="text-base font-bold text-white">{title}</h2>
        {subtitle && <p className="text-[11px] text-zinc-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* System Health Status */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>API Server: 5000 Online</span>
        </div>

        <div className="text-xs text-zinc-400 border-l border-white/10 pl-4">
          <span>สวัสดี, </span>
          <span className="font-bold text-white">{admin?.username}</span>
        </div>
      </div>
    </header>
  );
};
