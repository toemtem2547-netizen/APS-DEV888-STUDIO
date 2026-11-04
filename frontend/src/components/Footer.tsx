import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Headphones, Sparkles } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const Footer: React.FC = () => {
  const { settings } = useSettings();

  return (
    <footer className="border-t border-white/5 bg-[#040609] pt-12 pb-24 md:pb-12 text-zinc-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-white/5">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 p-1 flex items-center justify-center">
                {settings.game_logo ? (
                  <img
                    src={settings.game_logo}
                    alt={settings.game_title}
                    className="w-full h-full object-cover rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Zap className="w-5 h-5 text-indigo-400" />
                )}
              </div>
              <span className="font-extrabold text-lg text-white font-sans tracking-wide">
                {settings.game_title}
              </span>
            </div>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-md leading-relaxed">
              {settings.hero_description}
            </p>
            <div className="flex items-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> ปลอดภัย 100%
              </span>
              <span className="flex items-center gap-1.5 text-indigo-400">
                <Zap className="w-4 h-4" /> ส่งเข้า UID อัตโนมัติ
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <Sparkles className="w-4 h-4" /> ได้รับทันที
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">เมนูลัด</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/topup" className="hover:text-white transition-colors">เติมเงินเกม</Link></li>
              <li><Link to="/mystery-box" className="hover:text-white transition-colors">กล่องสุ่มไอเทม</Link></li>
              <li><Link to="/promotions" className="hover:text-white transition-colors">โปรโมชั่นและส่วนลด</Link></li>
              <li><Link to="/inventory" className="hover:text-white transition-colors">คลังของรางวัล</Link></li>
              <li><Link to="/admin" className="text-zinc-500 hover:text-indigo-400 transition-colors flex items-center gap-1 font-medium">🛡️ ระบบหลังบ้าน (Backoffice)</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">ติดต่อฝ่ายบริการ</h4>
            <p className="text-xs text-zinc-400">
              หากพบปัญหาในการเติมเงินหรือมีข้อสงสัย สามารถติดต่อทีมงานได้ตลอด 24 ชั่วโมง
            </p>
            <div className="bg-[#0D1117] border border-white/5 rounded-xl p-3 flex items-center gap-3">
              <Headphones className="w-5 h-5 text-indigo-400 flex-shrink-0" />
              <div>
                <p className="text-[11px] text-zinc-400">Line Official Support</p>
                <p className="text-xs font-bold text-white tracking-wide">{settings.contact_support}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <p>© {new Date().getFullYear()} {settings.game_title}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>เงื่อนไขการให้บริการ</span>
            <span>นโยบายความเป็นส่วนตัว</span>
            <span>ความปลอดภัย</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
