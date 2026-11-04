import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Gift,
  Sparkles,
  Trophy,
  Info,
  RotateCw,
  Wallet,
  AlertCircle,
  Plus,
  Percent,
  CheckCircle2,
  Crown,
  ShieldCheck,
  Flame,
  Zap,
  ArrowRight,
  ExternalLink,
  Award
} from 'lucide-react';
import { platformApi } from '../services/api';
import { MysteryBox, BoxReward, DrawResult } from '../types';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { RewardRevealModal } from '../components/RewardRevealModal';

interface RecentWinItem {
  id: number;
  box_name: string;
  reward_name: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  reward_image_url: string;
  created_at: string;
  masked_username: string;
}

export const MysteryBoxPage: React.FC = () => {
  const { settings } = useSettings();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { balance, openTopupModal, refreshBalance } = useWallet();

  const [boxes, setBoxes] = useState<MysteryBox[]>([]);
  const [recentWins, setRecentWins] = useState<RecentWinItem[]>([]);
  const [selectedBox, setSelectedBox] = useState<MysteryBox | null>(null);
  const [boxDetailModalOpen, setBoxDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Unboxing & Drawing state
  const [isOpening, setIsOpening] = useState(false);
  const [drawResult, setDrawResult] = useState<DrawResult | null>(null);
  const [isRevealOpen, setIsRevealOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBoxes = async () => {
    try {
      setLoading(true);
      const res = await platformApi.getMysteryBoxes();
      if (res.data?.success) {
        setBoxes(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load mystery boxes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentWins = async () => {
    try {
      const res = await platformApi.getRecentWins();
      if (res.data?.success && Array.isArray(res.data.data)) {
        setRecentWins(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load recent wins:', err);
    }
  };

  useEffect(() => {
    fetchBoxes();
    fetchRecentWins();
  }, []);

  const handleOpenDetailModal = (box: MysteryBox) => {
    setSelectedBox(box);
    setBoxDetailModalOpen(true);
  };

  const handleSelectBox = (box: MysteryBox) => {
    setError(null);
    setSelectedBox(box);
    setDrawResult(null);
    setIsOpening(false);
    setIsRevealOpen(true);
  };

  const handleExecuteDraw = async () => {
    if (!selectedBox) return;

    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (balance < selectedBox.price) {
      openTopupModal();
      return;
    }

    setError(null);
    setIsOpening(true);

    try {
      const res = await platformApi.drawBox(selectedBox.id);

      if (res.data?.success) {
        setDrawResult(res.data.data);
        await refreshBalance();
        setIsOpening(false);
      } else {
        throw new Error(res.data?.message || 'การสุ่มกล่องล้มเหลว');
      }
    } catch (err: any) {
      setIsOpening(false);
      setError(err.response?.data?.message || err.message || 'การสุ่มกล่องล้มเหลว');
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'LEGENDARY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
            <Crown className="w-3 h-3 text-amber-400" />
            LEGENDARY
          </span>
        );
      case 'EPIC':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]">
            <Flame className="w-3 h-3 text-purple-400" />
            EPIC
          </span>
        );
      case 'RARE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-[0_0_12px_rgba(14,165,233,0.25)]">
            <Zap className="w-3 h-3 text-sky-400" />
            RARE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-stone-800/80 text-stone-300 border border-stone-700/60">
            COMMON
          </span>
        );
    }
  };

  const getMysteryBoxTheme = (box: MysteryBox) => {
    const name = (box.name || '').toLowerCase();
    const theme = (box.colorTheme || '').toLowerCase();

    if (name.includes('bronze') || theme === 'bronze') {
      return {
        image: box.imageUrl && !box.imageUrl.includes('unsplash.com') ? box.imageUrl : '/images/boxes/bronze.jpg',
        glowColor: 'bg-amber-500/25 group-hover:bg-amber-500/40',
        pedestalBorder: 'border-amber-400/40 bg-amber-500/10',
        cardBorder: 'border-amber-500/30 hover:border-amber-400/70 hover:shadow-[0_15px_45px_rgba(245,158,11,0.22)]',
        badgeClass: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
        accentGlow: 'via-amber-400/40',
      };
    } else if (name.includes('silver') || theme === 'silver') {
      return {
        image: box.imageUrl && !box.imageUrl.includes('unsplash.com') ? box.imageUrl : '/images/boxes/silver.jpg',
        glowColor: 'bg-cyan-500/25 group-hover:bg-cyan-500/45',
        pedestalBorder: 'border-cyan-400/40 bg-cyan-500/10',
        cardBorder: 'border-cyan-500/35 hover:border-cyan-400/80 hover:shadow-[0_15px_45px_rgba(6,182,212,0.25)]',
        badgeClass: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300',
        accentGlow: 'via-cyan-400/40',
      };
    } else if (name.includes('gold') || name.includes('dragon') || theme === 'gold') {
      return {
        image: box.imageUrl && !box.imageUrl.includes('unsplash.com') ? box.imageUrl : '/images/boxes/gold.jpg',
        glowColor: 'bg-amber-400/30 group-hover:bg-amber-400/50',
        pedestalBorder: 'border-amber-400/50 bg-amber-500/15',
        cardBorder: 'border-amber-400/40 hover:border-amber-300 hover:shadow-[0_15px_45px_rgba(245,158,11,0.35)]',
        badgeClass: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black',
        accentGlow: 'via-amber-300/60',
      };
    } else {
      return {
        image: box.imageUrl && !box.imageUrl.includes('unsplash.com') ? box.imageUrl : '/images/boxes/mythic.jpg',
        glowColor: 'bg-purple-600/30 group-hover:bg-fuchsia-600/50',
        pedestalBorder: 'border-fuchsia-400/50 bg-purple-500/20',
        cardBorder: 'border-fuchsia-500/40 hover:border-fuchsia-400 hover:shadow-[0_15px_45px_rgba(217,70,239,0.35)]',
        badgeClass: 'bg-gradient-to-r from-fuchsia-600 via-purple-600 to-pink-600 text-white font-black animate-pulse',
        accentGlow: 'via-fuchsia-400/60',
      };
    }
  };

  if (settings.game_mystery_box_enabled === 'false') {
    return (
      <div className="min-h-screen bg-[#07090D] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#10141E] border border-amber-500/30 rounded-3xl p-8 text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20">
            <AlertCircle className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40">
              ระบบกำลังปิดปรับปรุงชั่วคราว
            </span>
            <h2 className="text-xl font-black text-white">{settings.game_mystery_box_title || 'กล่องสุ่มสมบัติ'}</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {settings.game_maintenance_notice || 'ระบบเกมนี้กำลังปิดปรับปรุงชั่วคราวเพื่ออัปเดตรางวัลใหม่ โปรดกลับมาใหม่อีกครั้งในภายหลัง'}
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link to="/" className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/30">
              กลับสู่หน้าหลัก
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#07080B] text-white pt-24 pb-24 overflow-hidden">
      {/* ═══ Ambient Background Glows & Floating Particles ═══ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-amber-500/10 blur-[150px] rounded-full animate-aura-breathe" />
        <div className="absolute top-1/3 left-10 w-[450px] h-[450px] bg-amber-600/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-amber-500/5 blur-[160px] rounded-full" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />

        {/* Subtle Ambient Floating Particles ("ละอองแสงลอยบางๆ ทีละนิดๆ") */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { top: '15%', left: '12%', size: 'w-1 h-1', color: 'bg-amber-400', delay: '0s', dur: '7s' },
            { top: '25%', left: '85%', size: 'w-1.5 h-1.5', color: 'bg-yellow-300', delay: '1.5s', dur: '8s' },
            { top: '40%', left: '22%', size: 'w-1 h-1', color: 'bg-amber-300', delay: '3s', dur: '9s' },
            { top: '35%', left: '72%', size: 'w-1 h-1', color: 'bg-cyan-300', delay: '2s', dur: '7.5s' },
            { top: '60%', left: '8%', size: 'w-1.5 h-1.5', color: 'bg-amber-400', delay: '4s', dur: '10s' },
            { top: '55%', left: '92%', size: 'w-1 h-1', color: 'bg-fuchsia-400', delay: '2.5s', dur: '8.5s' },
            { top: '75%', left: '30%', size: 'w-1 h-1', color: 'bg-amber-300', delay: '1s', dur: '9s' },
            { top: '70%', left: '78%', size: 'w-1.5 h-1.5', color: 'bg-cyan-400', delay: '3.5s', dur: '7s' },
            { top: '85%', left: '50%', size: 'w-1 h-1', color: 'bg-yellow-400', delay: '0.5s', dur: '8s' },
            { top: '20%', left: '45%', size: 'w-1 h-1', color: 'bg-amber-200', delay: '4.5s', dur: '9.5s' },
            { top: '48%', left: '60%', size: 'w-1 h-1', color: 'bg-fuchsia-300', delay: '5s', dur: '7.8s' },
            { top: '65%', left: '40%', size: 'w-1 h-1', color: 'bg-amber-300', delay: '2.2s', dur: '8.2s' },
          ].map((p, idx) => (
            <div
              key={idx}
              className={`absolute rounded-full ${p.size} ${p.color} blur-[0.5px] opacity-40 animate-ambient-dust pointer-events-none`}
              style={{
                top: p.top,
                left: p.left,
                animationDelay: p.delay,
                animationDuration: p.dur,
              }}
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        {/* ═══ Hero Header ═══ */}
        <div className="text-center max-w-5xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900/90 border border-stone-800 text-amber-400 text-xs font-bold uppercase tracking-wider shadow-sm hover:border-amber-500/40 transition-colors">
            <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{settings.game_mystery_box_notice || 'NEXUS MYSTERY VAULT • กล่องสมบัติแห่งโชคชะตา'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-normal whitespace-nowrap">
            {settings.game_mystery_box_title || 'เปิดกล่องสุ่มปริศนา ปลดล็อกแรร์ไอเทม'}
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-stone-300 whitespace-nowrap mx-auto leading-relaxed">
            {settings.game_mystery_box_subtitle || 'ลุ้นรับสิทธิ์ติดตั้งระบบเสริม สกินระดับตำนาน และเหรียญโบนัสรางวัลใหญ่ การันตีได้รับของรางวัลแท้ 100% ทุกครั้งที่เปิด'}
          </p>

          {/* User Wallet Status & Guarantee Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-stone-900/90 border border-stone-800 text-xs sm:text-sm font-semibold shadow-md">
              <Wallet className="w-4 h-4 text-amber-400" />
              <span className="text-stone-400">เครดิตคงเหลือ:</span>
              <span className="font-extrabold text-amber-300 font-mono text-sm sm:text-base">
                {settings.currency_symbol}{balance.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
              <button
                type="button"
                onClick={openTopupModal}
                className="ml-2 px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1 border border-amber-500/40 transition-all hover:scale-105"
              >
                <Plus className="w-3.5 h-3.5" /> เติมเครดิต
              </button>
            </div>

            <div className="hidden md:flex items-center gap-4 text-xs text-stone-400 px-4 py-2 rounded-2xl bg-stone-900/50 border border-white/5">
              <span className="flex items-center gap-1 text-stone-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-amber-400" /> การันตีได้ของแท้ 100%
              </span>
              <span className="text-stone-600">•</span>
              <span className="flex items-center gap-1 text-stone-300 font-medium">
                <Sparkles className="w-4 h-4 text-amber-400" /> โค้ดส่งเข้าคลังทันที
              </span>
            </div>
          </div>
        </div>

        {/* ═══ Error Banner ═══ */}
        {error && (
          <div className="max-w-xl mx-auto p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={openTopupModal}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition"
            >
              เติมเครดิต
            </button>
          </div>
        )}

        {/* ═══ Mystery Boxes Grid ═══ */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[430px] rounded-3xl bg-stone-900/40 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {boxes.map((box, boxIdx) => {
              // Extract top reward names for sneak-peek
              const previewRewards = box.rewards && box.rewards.length > 0 ? box.rewards.slice(0, 3) : [];

              const theme = getMysteryBoxTheme(box);

              return (
                <div
                  key={box.id}
                  className={`relative rounded-3xl bg-[#0B0C11] border p-6 flex flex-col justify-between transition-all duration-300 group overflow-hidden transform hover:-translate-y-1.5 ${theme.cardBorder}`}
                >
                  {/* Subtle Card Shimmer Sweep */}
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-card-shimmer bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none" />
                  </div>

                  {/* Glowing Top Ambient Spotlight with Gentle Breathing */}
                  <div className={`absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full ${theme.glowColor} blur-3xl pointer-events-none transition-all duration-500 animate-aura-breathe`} />
                  <div className={`absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent ${theme.accentGlow} to-transparent pointer-events-none`} />

                  {/* Top Bar: Badge & Odds Button */}
                  <div className="flex items-center justify-between mb-2 relative z-10">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${theme.badgeClass}`}>
                      {box.badge || 'LUCKY CHEST'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenDetailModal(box)}
                      className="text-xs text-stone-400 hover:text-amber-300 flex items-center gap-1 transition-colors py-1 px-2 rounded-lg hover:bg-white/5"
                    >
                      <Info className="w-3.5 h-3.5 text-amber-400" />
                      <span>ดูเรทสุ่ม</span>
                    </button>
                  </div>

                  {/* 3D Floating Chest Image on Glowing Pedestal with Seamless Radial Edge Vignette */}
                  <div className="w-full h-56 my-1 flex items-center justify-center relative overflow-hidden rounded-2xl">
                    {/* Concentric Pedestal Glow with Breathing Energy */}
                    <div className={`absolute bottom-3 w-40 h-12 rounded-full ${theme.glowColor} blur-xl pointer-events-none transition-all animate-aura-breathe`} />
                    <div className={`absolute bottom-4 w-32 h-6 rounded-full border ${theme.pedestalBorder} pointer-events-none animate-pulse`} />

                    {/* Subtle floating 3D chest */}
                    <div
                      className="w-full h-full flex items-center justify-center animate-float-slow"
                      style={{ animationDelay: `${boxIdx * 0.9}s` }}
                    >
                      <img
                        src={theme.image}
                        alt={box.name}
                        style={{
                          maskImage: 'radial-gradient(circle at 50% 50%, black 50%, transparent 75%)',
                          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 50%, transparent 75%)',
                        }}
                        className="max-h-full max-w-[95%] object-contain filter drop-shadow-[0_18px_30px_rgba(0,0,0,0.9)] transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = theme.image;
                        }}
                      />
                    </div>
                  </div>

                  {/* Box Name & Description */}
                  <div className="space-y-1.5 my-2 relative z-10">
                    <h3 className="font-black text-xl text-white group-hover:text-amber-300 transition-colors tracking-tight">
                      {box.name}
                    </h3>
                    <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed min-h-[32px]">
                      {box.description}
                    </p>
                  </div>

                  {/* Rewards Sneak-Peek */}
                  {previewRewards.length > 0 && (
                    <div className="my-2.5 p-2 rounded-xl bg-stone-900/60 border border-white/5 relative z-10">
                      <div className="flex items-center justify-between text-[10px] text-stone-400 mb-1 font-semibold">
                        <span className="flex items-center gap-1 text-amber-300">
                          <Sparkles className="w-3 h-3 text-amber-400" /> ของรางวัลเด่นในกล่อง:
                        </span>
                        <span>{box.rewards?.length} ชิ้น</span>
                      </div>
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        {previewRewards.map((rw) => (
                          <div
                            key={rw.id}
                            className="w-8 h-8 rounded-lg overflow-hidden bg-black/60 border border-white/10 p-0.5 flex-shrink-0 flex items-center justify-center"
                            title={rw.name}
                          >
                            <img
                              src={rw.image_url}
                              alt={rw.name}
                              className="w-full h-full object-contain"
                              style={{
                                maskImage: 'radial-gradient(circle at 50% 50%, black 60%, transparent 92%)',
                                WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 60%, transparent 92%)',
                              }}
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/rewards/headset.png';
                              }}
                            />
                          </div>
                        ))}
                        <span className="text-[10px] text-stone-400 truncate pl-1 font-medium">
                          {previewRewards[0]?.name}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Price & Draw Button */}
                  <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between gap-3 relative z-10 mt-auto">
                    <div>
                      <span className="text-[10px] text-stone-400 font-medium block">ราคาสุ่ม</span>
                      <p className="font-black text-2xl text-white font-mono tracking-tight">
                        {settings.currency_symbol}{box.price.toFixed(0)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectBox(box)}
                      className="py-2.5 px-5 rounded-xl font-bold text-xs sm:text-sm text-zinc-950 bg-amber-400 hover:bg-amber-300 shadow-sm transition-all duration-300 active:scale-95 flex items-center gap-1.5 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] group/btn relative overflow-hidden"
                    >
                      {/* Subtle button sheen */}
                      <span className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
                      <Sparkles className="w-4 h-4 text-zinc-950 group-hover/btn:rotate-12 transition-transform" />
                      <span>เปิดกล่องสุ่ม</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ Box Probability & Details Modal ═══ */}
        {boxDetailModalOpen && selectedBox && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
            <div className="relative w-full max-w-xl bg-[#0B0C11] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(245,158,11,0.25)] space-y-6 max-h-[85vh] flex flex-col overflow-hidden">
              {/* Golden Ambient Glow */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-stone-800 pb-4 relative z-10">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <Percent className="w-5 h-5 text-amber-400" />
                    อัตราความน่าจะเป็น: {selectedBox.name}
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    คำนวณตามค่าน้ำหนักจริงของระบบหลังบ้านแบบโปร่งใส 100%
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setBoxDetailModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white flex items-center justify-center transition"
                >
                  ✕
                </button>
              </div>

              {/* Rewards Table */}
              <div className="overflow-y-auto flex-1 space-y-2.5 pr-1 relative z-10">
                {selectedBox.rewards && selectedBox.rewards.length > 0 ? (
                  selectedBox.rewards.map((rw) => (
                    <div
                      key={rw.id}
                      className="p-3 rounded-2xl bg-stone-900/80 border border-stone-800 flex items-center justify-between gap-3 hover:border-amber-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/60 border border-stone-700/80 p-1 flex-shrink-0 flex items-center justify-center">
                          <img
                            src={rw.image_url}
                            alt={rw.name}
                            className="w-full h-full object-contain"
                            style={{
                              maskImage: 'radial-gradient(circle at 50% 50%, black 60%, transparent 92%)',
                              WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 60%, transparent 92%)',
                            }}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/rewards/headset.jpg';
                            }}
                          />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-white">{rw.name}</p>
                          <div className="mt-0.5">{getRarityBadge(rw.rarity)}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-amber-400 font-mono">
                          {rw.probability_percent}%
                        </span>
                        <p className="text-[10px] text-stone-400 font-medium">Weight: {rw.weight}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-stone-400 text-xs">
                    ไม่พบข้อมูลของรางวัลในกล่องนี้
                  </div>
                )}
              </div>

              {/* Action Button inside modal */}
              <div className="pt-2 relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    setBoxDetailModalOpen(false);
                    handleSelectBox(selectedBox);
                  }}
                  className="w-full py-3 px-6 rounded-xl font-bold text-sm text-zinc-950 bg-amber-400 hover:bg-amber-300 shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-zinc-950" />
                  <span>เปิดกระดานสุ่มกล่องนี้ (฿{selectedBox.price.toFixed(0)})</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Reveal Modal with 12-Slot Runner & Victory Moment ═══ */}
        <RewardRevealModal
          isOpen={isRevealOpen}
          onClose={() => {
            setIsRevealOpen(false);
            setIsOpening(false);
            setDrawResult(null);
          }}
          result={drawResult}
          box={selectedBox}
          isOpening={isOpening}
          userBalance={balance}
          openTopupModal={openTopupModal}
          onStartDraw={handleExecuteDraw}
          onDrawAgain={handleExecuteDraw}
        />
      </div>
    </div>
  );
};

export default MysteryBoxPage;
