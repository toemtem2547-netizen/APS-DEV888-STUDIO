import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Flame, 
  Sparkles, 
  Play, 
  Crown, 
  Zap, 
  ShieldCheck, 
  Trophy, 
  Search, 
  TrendingUp, 
  Star,
  Gamepad2,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';

interface SlotRoom {
  id: string;
  title: string;
  subtitle: string;
  theme: string;
  banner: string;
  mascot?: string;
  rtp: string;
  volatility: 'HIGH' | 'MEDIUM' | 'VERY HIGH';
  maxMultiplier: string;
  minBet: number;
  jackpot: string;
  tag: 'HOT' | 'NEW' | 'POPULAR' | 'EXCLUSIVE';
  tagColor: string;
  available: boolean;
  features: string[];
}

const ROOMS: SlotRoom[] = [
  {
    id: 'cat-heist',
    title: 'Cat Heist Slots',
    subtitle: 'แก๊งแมวปล้นเซฟทองคำ ลุ้นรับแจ็คพ็อตมังกรพิทักษ์',
    theme: 'Vault Heist & Golden Dragon',
    banner: '/images/slots/slot_banner.jpg',
    mascot: '/images/slots/slot_mascot.png',
    rtp: '96.80%',
    volatility: 'HIGH',
    maxMultiplier: 'x5,000',
    minBet: 1,
    jackpot: '฿5,097.51',
    tag: 'HOT',
    tagColor: 'from-amber-500 to-rose-600',
    available: true,
    features: ['5 of a Kind Free Spins', 'Diamond Scatter x2', 'Progressive Jackpot', 'Wild Vault'],
  },
  {
    id: 'dragon-treasure',
    title: "Dragon's Golden Hoard",
    subtitle: 'พิชิตขุมทรัพย์มังกรทองโบราณ ปลดล็อกหีบเพชรสีเลือด',
    theme: 'Oriental Mythic Fantasy',
    banner: '/images/slots/dragon_epic.jpg',
    mascot: '/images/slots/deco_golden_dragon.png',
    rtp: '97.20%',
    volatility: 'VERY HIGH',
    maxMultiplier: 'x10,000',
    minBet: 2,
    jackpot: '฿12,450.00',
    tag: 'EXCLUSIVE',
    tagColor: 'from-red-600 to-amber-500',
    available: true,
    features: ['Dragon Orb Multiplier', 'Mega Free Spins', 'Ruby Wild Expand', 'Jackpot Wheel'],
  },
  {
    id: 'cyber-vault',
    title: 'Cyberpunk Neon Vault',
    subtitle: 'เจาะรหัสตู้เซฟไซเบอร์เนออนแห่งอนาคต ลุ้นเหรียญคริปโต',
    theme: 'Sci-Fi Cyberpunk',
    banner: '/images/golden_cyber_vault.jpg',
    mascot: '/images/boxes/gold.jpg',
    rtp: '96.50%',
    volatility: 'MEDIUM',
    maxMultiplier: 'x3,500',
    minBet: 1,
    jackpot: '฿8,200.00',
    tag: 'NEW',
    tagColor: 'from-cyan-500 to-blue-600',
    available: true,
    features: ['Laser Re-Spin', 'Neon Wild Link', 'Plasma Free Spins', 'Overcharge Bonus'],
  },
  {
    id: 'zombie-bunker',
    title: 'Outbreak: Zombie Vault',
    subtitle: 'ฝ่าดงซอมบี้เปิดคลังเสบียงลับใต้ดิน เอาชีวิตรอดชิงทองคำ',
    theme: 'Horror Apocalyptic Survival',
    banner: '/images/zombie_bunker_bg.jpg',
    mascot: '/images/zombie_monster.jpg',
    rtp: '95.90%',
    volatility: 'HIGH',
    maxMultiplier: 'x4,200',
    minBet: 5,
    jackpot: '฿6,890.00',
    tag: 'POPULAR',
    tagColor: 'from-emerald-500 to-teal-700',
    available: true,
    features: ['Biohazard Wilds', 'Nightmare Spins', 'Surge Multiplier', 'Vault C4 Blast'],
  },
];

export const SlotLobbyPage: React.FC = () => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { balance, openTopupModal } = useWallet();
  const [filter, setFilter] = useState<'ALL' | 'HOT' | 'NEW' | 'HIGH_RTP'>('ALL');
  const [search, setSearch] = useState('');

  const filteredRooms = ROOMS.filter((room) => {
    if (filter === 'HOT' && room.tag !== 'HOT') return false;
    if (filter === 'NEW' && room.tag !== 'NEW') return false;
    if (filter === 'HIGH_RTP' && parseFloat(room.rtp) < 96.6) return false;
    if (search.trim() && !room.title.toLowerCase().includes(search.toLowerCase()) && !room.theme.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#07090D] pt-24 pb-20 px-4 sm:px-6 relative overflow-hidden select-none">
      {/* Background Glows & Ambience */}
      <div className="absolute top-10 left-1/4 w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[350px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[350px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Hero Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black tracking-wider uppercase mb-3 shadow-[0_0_15px_rgba(251,191,36,0.15)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SIMULATED CASINO SLOTS LOBBY · ระบบจำลองเล่นฟรี</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight flex items-center gap-3">
              <span>ห้องเกมสล็อต</span>
              <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                SLOT VAULT
              </span>
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base mt-2 max-w-2xl">
              เลือกห้องสล็อตในธีมที่คุณชื่นชอบ ระบบจำลองอัลกอริทึม RNG 100% เขียนเองในเซิร์ฟเวอร์ ไม่พึ่งพา API ภายนอก ลุ้นรางวัลใหญ่และฟรีสปินไม่อั้น!
            </p>
          </div>

          {/* Quick Wallet Card */}
          <div className="w-full md:w-auto p-4 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-md flex items-center justify-between md:justify-end gap-5 shadow-2xl">
            <div>
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">ยอดเงินในกระเป๋า</div>
              <div className="text-2xl font-black text-amber-300 tabular-nums">
                ฿{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <button
              onClick={() => (isAuthenticated ? openTopupModal() : openAuthModal('login'))}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95"
            >
              เติมเครดิต
            </button>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 py-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                filter === 'ALL'
                  ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/25'
                  : 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              ทั้งหมด ({ROOMS.length})
            </button>
            <button
              onClick={() => setFilter('HOT')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                filter === 'HOT'
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/25'
                  : 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              เกมยอดฮิต (HOT)
            </button>
            <button
              onClick={() => setFilter('NEW')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                filter === 'NEW'
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25'
                  : 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              เกมใหม่ล่าสุด
            </button>
            <button
              onClick={() => setFilter('HIGH_RTP')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                filter === 'HIGH_RTP'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                  : 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              RTP สูงสุด
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อเกมหรือธีม..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/60 focus:bg-white/[0.08] transition-all"
            />
          </div>
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pt-2">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="group relative rounded-3xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-amber-400/50 transition-all duration-500 overflow-hidden flex flex-col justify-between shadow-xl hover:shadow-[0_15px_40px_rgba(250,204,21,0.15)]"
            >
              {/* Top Banner & Mascot Visual */}
              <div className="relative h-56 sm:h-64 overflow-hidden bg-slate-950">
                <img
                  src={room.banner}
                  alt={room.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-75 group-hover:opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07090D] via-[#07090D]/40 to-transparent" />

                {/* Tag Badge */}
                <div
                  className={`absolute top-4 left-4 px-3 py-1 rounded-full bg-gradient-to-r ${room.tagColor} text-white font-black text-[10px] tracking-wider uppercase shadow-lg border border-white/20`}
                >
                  {room.tag}
                </div>

                {/* Mascot Popout if available */}
                {room.mascot && (
                  <img
                    src={room.mascot}
                    alt=""
                    className="absolute right-3 -bottom-2 h-44 sm:h-52 object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)] group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                  />
                )}

                {/* Floating Jackpot Badge */}
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-2xl bg-black/75 border border-yellow-500/40 backdrop-blur-md flex items-center gap-2 shadow-xl">
                  <Crown className="w-4 h-4 text-yellow-300 animate-pulse" />
                  <div>
                    <div className="text-[9px] font-black text-yellow-400/80 leading-none">JACKPOT POOL</div>
                    <div className="text-xs font-black text-white tabular-nums leading-tight">{room.jackpot}</div>
                  </div>
                </div>

                {/* Room Title Info */}
                <div className="absolute bottom-4 left-5 right-32">
                  <span className="text-[10px] font-black tracking-wider text-amber-400 uppercase">
                    {room.theme}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight group-hover:text-amber-300 transition-colors">
                    {room.title}
                  </h3>
                </div>
              </div>

              {/* Room Stats & Features */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-5">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {room.subtitle}
                </p>

                {/* Features Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {room.features.map((feat, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-300 flex items-center gap-1"
                    >
                      <Star className="w-2.5 h-2.5 text-amber-400" />
                      {feat}
                    </span>
                  ))}
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-2xl bg-black/40 border border-white/5 text-center">
                  <div>
                    <div className="text-[10px] font-bold text-zinc-500">RTP</div>
                    <div className="text-xs font-black text-emerald-400">{room.rtp}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-zinc-500">ความผันผวน</div>
                    <div className="text-xs font-black text-amber-300">{room.volatility}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-zinc-500">เดิมพันขั้นต่ำ</div>
                    <div className="text-xs font-black text-white">฿{room.minBet}</div>
                  </div>
                </div>

                {/* Play Button */}
                <Link
                  to={room.id === 'cat-heist' ? '/slot' : `/slot?room=${room.id}`}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 group-hover:shadow-[0_0_30px_rgba(250,204,21,0.4)] transition-all transform active:scale-98"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>เข้าเล่นห้องนี้ (ENTER GAME)</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner Note */}
        <div className="mt-12 p-6 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-black/60 border border-indigo-500/20 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">ระบบจำลองการเล่น 100% เขียนและคำนวณในเซิร์ฟเวอร์ของเรา</h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                ปลอดภัย ไม่มีประวัติโกง สุ่มผลลัพธ์ด้วยตัวเลขสถิติ RNG แท้ ไม่เชื่อมต่อบริการภายนอกใดๆ
              </p>
            </div>
          </div>
          <Link
            to="/topup"
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-black transition-all whitespace-nowrap"
          >
            เติมเหรียญสำหรับหมุน
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SlotLobbyPage;
