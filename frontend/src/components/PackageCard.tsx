import React from 'react';
import { Sparkles, Coins, Check, Zap, Flame, Crown } from 'lucide-react';
import { PackageItem } from '../types';
import { useSettings } from '../context/SettingsContext';

interface PackageCardProps {
  pkg: PackageItem;
  isSelected: boolean;
  onSelect: (pkg: PackageItem) => void;
  index?: number;
}

export const PackageCard: React.FC<PackageCardProps> = ({ pkg, isSelected, onSelect, index = 0 }) => {
  const { settings } = useSettings();

  // Helper to determine tier theme & local 3D artwork fallback
  const getTierInfo = () => {
    const coins = pkg.coins;
    if (coins <= 150) {
      return {
        tierImage: '/images/packages/tier1.jpg',
        tierName: 'Starter Pouch',
        accentColor: 'from-cyan-500/20 to-blue-600/10',
        borderColor: 'border-cyan-500/40',
        glowColor: 'shadow-cyan-500/20',
        ringColor: 'ring-cyan-500 border-cyan-500',
        badgeBg: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white',
        icon: Zap,
      };
    } else if (coins <= 350) {
      return {
        tierImage: '/images/packages/tier2.jpg',
        tierName: 'Bronze Chest',
        accentColor: 'from-amber-500/20 to-orange-600/10',
        borderColor: 'border-amber-500/40',
        glowColor: 'shadow-amber-500/20',
        ringColor: 'ring-amber-500 border-amber-500',
        badgeBg: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white',
        icon: Sparkles,
      };
    } else if (coins <= 600) {
      return {
        tierImage: '/images/packages/tier3.jpg',
        tierName: 'Silver Sapphire Vault',
        accentColor: 'from-indigo-500/25 to-purple-600/15',
        borderColor: 'border-indigo-500/50',
        glowColor: 'shadow-indigo-500/30',
        ringColor: 'ring-indigo-500 border-indigo-400',
        badgeBg: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white',
        icon: Sparkles,
      };
    } else if (coins <= 1500) {
      return {
        tierImage: '/images/packages/tier4.jpg',
        tierName: 'Royal Gold Chest',
        accentColor: 'from-amber-400/25 to-yellow-600/15',
        borderColor: 'border-amber-400/50',
        glowColor: 'shadow-amber-400/30',
        ringColor: 'ring-amber-400 border-amber-400',
        badgeBg: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black',
        icon: Crown,
      };
    } else if (coins <= 3500) {
      return {
        tierImage: '/images/packages/tier5.jpg',
        tierName: 'Cyber Diamond Vault',
        accentColor: 'from-emerald-400/25 to-cyan-600/15',
        borderColor: 'border-emerald-400/50',
        glowColor: 'shadow-emerald-400/30',
        ringColor: 'ring-emerald-400 border-emerald-400',
        badgeBg: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black',
        icon: Zap,
      };
    } else {
      return {
        tierImage: '/images/packages/tier6.jpg',
        tierName: 'Mythic Dragon Vault',
        accentColor: 'from-red-500/30 to-amber-600/20',
        borderColor: 'border-red-500/60',
        glowColor: 'shadow-red-500/40',
        ringColor: 'ring-red-500 border-red-500',
        badgeBg: 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white font-black animate-pulse',
        icon: Flame,
      };
    }
  };

  const tier = getTierInfo();

  // Select image: use valid custom imageUrl, else fallback to 3D artwork
  const resolvedImageUrl =
    pkg.imageUrl && !pkg.imageUrl.includes('unsplash.com')
      ? pkg.imageUrl
      : tier.tierImage;

  const totalCoins = pkg.coins + (pkg.bonusCoins || 0);
  const bonusPercent = pkg.bonusCoins > 0 ? Math.round((pkg.bonusCoins / pkg.coins) * 100) : 0;

  return (
    <div
      onClick={() => onSelect(pkg)}
      className={`relative rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 cursor-pointer transition-all duration-300 border flex flex-col justify-between overflow-hidden group select-none ${
        isSelected
          ? `bg-gradient-to-b from-[#141A25] via-[#10151E] to-[#0A0D14] ${tier.ringColor} ring-2 shadow-2xl ${tier.glowColor} scale-[1.02]`
          : 'bg-[#0E121B]/90 hover:bg-[#131926] border-white/10 hover:border-white/20 hover:scale-[1.01]'
      }`}
    >
      {/* Background Ambient Glow */}
      <div
        className={`absolute -top-16 -right-16 w-36 h-36 rounded-full bg-gradient-to-br ${tier.accentColor} blur-3xl pointer-events-none transition-opacity duration-500 ${
          isSelected ? 'opacity-80' : 'opacity-30 group-hover:opacity-60'
        }`}
      />

      {/* Badges: Popular / Hot Deal / Custom */}
      {(pkg.badge || pkg.isPopular) && (
        <div className="absolute top-0 right-0 z-10">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-bl-xl text-[9px] sm:text-[10px] font-black tracking-wider uppercase shadow-xl ${
              pkg.isPopular
                ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white shadow-amber-500/20'
                : tier.badgeBg
            }`}
          >
            {pkg.isPopular && <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
            {pkg.badge || 'POPULAR'}
          </span>
        </div>
      )}

      {/* Top Details & 3D Artwork */}
      <div className="space-y-3 relative z-0">
        {/* Artwork Container */}
        <div className="relative w-full aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-b from-black/60 to-black/30 border border-white/10 p-1.5 sm:p-2 flex items-center justify-center group-hover:border-white/25 transition-all">
          <img
            src={resolvedImageUrl}
            alt={pkg.name}
            style={{
              maskImage: 'radial-gradient(circle at 50% 50%, black 55%, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 55%, transparent 80%)',
            }}
            className="w-full h-full object-contain filter drop-shadow-[0_10px_16px_rgba(0,0,0,0.8)] group-hover:scale-108 transition-transform duration-500 ease-out"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = tier.tierImage;
            }}
          />

          {/* Quick Bonus Tag overlay on image */}
          {bonusPercent > 0 && (
            <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md border border-amber-500/40 rounded-lg px-1.5 py-0.5 flex items-center gap-1 shadow-lg">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              <span className="text-[9px] font-black text-amber-300">+{bonusPercent}% BONUS</span>
            </div>
          )}
        </div>

        {/* Coin & Bonus Information */}
        <div className="space-y-0.5">
          <div className="flex items-baseline justify-between">
            <h4 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-1">
              <span>{totalCoins.toLocaleString()}</span>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                Coins
              </span>
            </h4>
          </div>

          {pkg.bonusCoins > 0 ? (
            <p className="text-[11px] text-zinc-400 flex items-center gap-1">
              <span>พื้นฐาน {pkg.coins.toLocaleString()}</span>
              <span className="text-amber-400 font-bold">+{pkg.bonusCoins.toLocaleString()} ฟรี</span>
            </p>
          ) : (
            <p className="text-[11px] text-zinc-400">แพ็กเกจเริ่มต้นสุดคุ้ม</p>
          )}
        </div>
      </div>

      {/* Price Footer */}
      <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between relative z-0">
        <div>
          <span className="text-[10px] font-medium text-zinc-400 block">ราคาจ่ายสุทธิ</span>
          <p className="text-base sm:text-lg font-black text-white tracking-tight">
            {settings.currency_symbol || '฿'}
            {Number(pkg.price).toFixed(2)}
          </p>
        </div>

        <button
          type="button"
          tabIndex={-1}
          className={`px-2.5 py-1 sm:px-3 sm:py-1 rounded-xl font-bold text-[11px] sm:text-xs flex items-center gap-1 transition-all duration-300 shadow-md ${
            isSelected
              ? 'bg-amber-400 text-black shadow-amber-400/30 font-black'
              : 'bg-white/10 text-zinc-300 group-hover:bg-white/20 group-hover:text-white'
          }`}
        >
          {isSelected ? (
            <>
              <Check className="w-3 h-3 stroke-[3]" />
              <span>เลือกแล้ว</span>
            </>
          ) : (
            <span>เลือก</span>
          )}
        </button>
      </div>
    </div>
  );
};
