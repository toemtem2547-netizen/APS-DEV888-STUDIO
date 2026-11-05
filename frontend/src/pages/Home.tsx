import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap,
  Gamepad2,
  Package,
  Gift,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Tag,
  Flame,
  CheckCircle2,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Calendar,
  BookOpen,
  Coins,
  Crown,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { platformApi } from '../services/api';
import { PackageItem, MysteryBox, Promotion, HomeCmsConfig } from '../types';
import { PackageCard } from '../components/PackageCard';

export const Home: React.FC = () => {
  const { settings } = useSettings();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { balance } = useWallet();
  const navigate = useNavigate();

  // Data states with immediate cache persistence for zero-flicker on F5
  const [packages, setPackages] = useState<PackageItem[]>(() => {
    try {
      const saved = localStorage.getItem('cached_packages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [boxes, setBoxes] = useState<MysteryBox[]>(() => {
    try {
      const saved = localStorage.getItem('cached_boxes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [promotions, setPromotions] = useState<Promotion[]>(() => {
    try {
      const saved = localStorage.getItem('cached_promotions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [recentWins, setRecentWins] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('cached_recent_wins');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(packages.length === 0);

  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(() => {
    try {
      const saved = localStorage.getItem('cached_packages');
      if (saved) {
        const pkgs = JSON.parse(saved);
        return pkgs.find((p: PackageItem) => p.isPopular) || pkgs[0] || null;
      }
    } catch {}
    return null;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pkgResult, boxResult, promoResult, winsResult] = await Promise.allSettled([
          platformApi.getPackages(),
          platformApi.getMysteryBoxes(),
          platformApi.getPromotions(),
          platformApi.getRecentWins(),
        ]);

        if (pkgResult.status === 'fulfilled' && pkgResult.value.data?.success) {
          const pkgs = pkgResult.value.data.data;
          setPackages(pkgs);
          localStorage.setItem('cached_packages', JSON.stringify(pkgs));
          const pop = pkgs.find((p: PackageItem) => p.isPopular) || pkgs[0];
          setSelectedPackage((prev) => prev || pop || null);
        }
        if (boxResult.status === 'fulfilled' && boxResult.value.data?.success) {
          const bxs = boxResult.value.data.data;
          setBoxes(bxs);
          localStorage.setItem('cached_boxes', JSON.stringify(bxs));
        }
        if (promoResult.status === 'fulfilled' && promoResult.value.data?.success) {
          const prms = promoResult.value.data.data;
          setPromotions(prms);
          localStorage.setItem('cached_promotions', JSON.stringify(prms));
        }
        if (winsResult.status === 'fulfilled' && winsResult.value.data?.success) {
          const rwins = winsResult.value.data.data;
          setRecentWins(rwins);
          localStorage.setItem('cached_recent_wins', JSON.stringify(rwins));
        }
      } catch (err) {
        console.error('Failed to load home page content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSlidePaused, setIsSlidePaused] = useState(false);

  const defaultCmsConfig: HomeCmsConfig = {
    slides: [
      {
        id: 1,
        image: '/images/banners/banner-topup-speed.jpg',
        badge: '⚡ INSTANT UID TOPUP',
        title: 'สิทธิพิเศษสมาชิกใหม่ รับโบนัสเหรียญสูงสุด +20%',
        description: 'ระบบเติมเหรียญอัตโนมัติ 24 ชม. ส่งตรงเข้า UID ปลอดภัย 100% เติมครั้งแรกรับโบนัสพิเศษและตั๋วสุ่มกล่องสมบัติฟรี',
        primaryBtn: { label: 'เติมเหรียญทันที', path: '/topup' },
        secondaryBtn: { label: 'สุ่มกล่องสมบัติ', path: '/mystery-box' },
        tag: 'กิจกรรมแนะนำ',
      },
      {
        id: 2,
        image: '/images/banners/banner-lootbox-cyber.jpg',
        badge: '🎁 MYSTERY VAULT EVENT',
        title: 'ปลดล็อกหีบสมบัติ ลุ้นรางวัลใหญ่ระดับ Mythic',
        description: 'เปิดกล่องสุ่มไอเทมและอุปกรณ์เกมมิ่งระดับไฮเอนด์ ลุ้นรับของแรร์ทันที การันตีไอเทมคุ้มค่าทุกการสุ่ม',
        primaryBtn: { label: 'เข้าสู่ห้องสุ่มกล่อง', path: '/mystery-box' },
        secondaryBtn: { label: 'ดูของรางวัล', path: '/inventory' },
        tag: 'กล่องสุ่มยอดฮิต',
      },
      {
        id: 3,
        image: '/images/banners/banner-royal-vault.jpg',
        badge: '👑 LUCKY KING GACHA',
        title: 'หมุนวงล้อราชาฟรีทุกวัน ลุ้นรับเครดิต & ไอเทมแรร์',
        description: 'ล็อกอินทุกวันรับสิทธิ์หมุนฟรี 1 ครั้ง ลุ้น Coins และโค้ดส่วนลดสุดคุ้ม ไม่มีเกลือแน่นอน',
        primaryBtn: { label: 'หมุนวงล้อฟรีทันที', path: '/gacha' },
        secondaryBtn: { label: 'ดูกติกาโปรโมชั่น', path: '/promotions' },
        tag: 'ฟรีทุกวัน',
      },
    ],
    subCard1: {
      image: '/images/guide-thumb.jpg',
      badge: 'คู่มือผู้เล่น',
      title: 'Aetheria Guide: มือใหม่ควรรู้ เติมเหรียญ & สุ่มกล่องอย่างไรให้คุ้มค่าที่สุด',
      link: '/topup',
    },
    subCard2: {
      image: '/images/daily-checkin-thumb.jpg',
      badge: 'กิจกรรม',
      title: 'Happy Daily Check-In: ล็อกอินสะสมแต้มทุกวัน รับฟรีคูปองและโบนัสเหรียญ',
      link: '/gacha',
    },
    subCard3: {
      action1: {
        image: '/images/quick-coins.jpg',
        label: 'เติมเหรียญ',
        link: '/topup',
      },
      action2: {
        image: '/images/quick-box.jpg',
        label: 'สุ่มกล่อง',
        link: '/mystery-box',
      },
      action3: {
        image: '/images/quick-wheel.jpg',
        label: 'วงล้อฟรี',
        link: '/gacha',
        badge: 'FREE',
      },
    },
    trustStats: {
      stat1: 'ระบบอัตโนมัติ 100% ส่งตรงเข้า UID',
      stat2: 'ได้รับเหรียญทันที < 30 วินาที',
      stat3: 'ความปลอดภัยมาตรฐานสากล ดูแล 24/7',
    },
  };

  const cmsConfig: HomeCmsConfig = React.useMemo(() => {
    if (settings?.home_cms_config) {
      try {
        const parsed = JSON.parse(settings.home_cms_config);
        return {
          slides: Array.isArray(parsed.slides) && parsed.slides.length > 0 ? parsed.slides : defaultCmsConfig.slides,
          subCard1: parsed.subCard1 || defaultCmsConfig.subCard1,
          subCard2: parsed.subCard2 || defaultCmsConfig.subCard2,
          subCard3: parsed.subCard3 || defaultCmsConfig.subCard3,
          trustStats: parsed.trustStats || defaultCmsConfig.trustStats,
        };
      } catch (e) {
        console.warn('Failed to parse home_cms_config, using default', e);
      }
    }
    return defaultCmsConfig;
  }, [settings?.home_cms_config]);

  const heroSlides = cmsConfig.slides;

  useEffect(() => {
    if (isSlidePaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isSlidePaused, heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const getBoxTheme = (boxName: string = '', badge: string = '') => {
    const combined = `${boxName} ${badge}`.toLowerCase();
    if (combined.includes('mythic') || combined.includes('matrix') || combined.includes('cyber')) {
      return {
        accent: 'from-fuchsia-600/30 via-purple-600/15 to-transparent',
        border: 'border-fuchsia-500/30 hover:border-fuchsia-400/60',
        glow: 'shadow-fuchsia-500/10 hover:shadow-fuchsia-500/25',
        badgeBg: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40 shadow-[0_0_12px_rgba(217,70,239,0.25)]',
        aura: 'bg-fuchsia-500/25',
        btnBg: 'bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 shadow-fuchsia-600/30 text-white font-bold',
        image: '/images/boxes/mythic.jpg',
      };
    }
    if (combined.includes('gold') || combined.includes('dragon') || combined.includes('high win rate')) {
      return {
        accent: 'from-amber-500/30 via-yellow-600/15 to-transparent',
        border: 'border-amber-500/30 hover:border-amber-400/60',
        glow: 'shadow-amber-500/10 hover:shadow-amber-500/25',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
        aura: 'bg-amber-500/25',
        btnBg: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-amber-500/30 text-slate-950 font-black',
        image: '/images/boxes/gold.jpg',
      };
    }
    if (combined.includes('silver') || combined.includes('sentinel') || combined.includes('recommended')) {
      return {
        accent: 'from-cyan-500/30 via-blue-600/15 to-transparent',
        border: 'border-cyan-500/30 hover:border-cyan-400/60',
        glow: 'shadow-cyan-500/10 hover:shadow-cyan-500/25',
        badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]',
        aura: 'bg-cyan-500/25',
        btnBg: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-600/30 text-white font-bold',
        image: '/images/boxes/silver.jpg',
      };
    }
    return {
      accent: 'from-orange-500/30 via-amber-700/15 to-transparent',
      border: 'border-orange-500/30 hover:border-orange-400/60',
      glow: 'shadow-orange-500/10 hover:shadow-orange-500/25',
      badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-[0_0_12px_rgba(249,115,22,0.25)]',
      aura: 'bg-orange-500/25',
      btnBg: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-orange-600/30 text-white font-bold',
      image: '/images/boxes/bronze.jpg',
    };
  };

  return (
    <div className="space-y-16 pb-20 pt-20 sm:pt-24">
      {/* 1. HERO SHOWCASE CAROUSEL & SUB-HERO (REFERENCE 1 LAYOUT) */}
      <section className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Main Banner Slider */}
        <div
          className="relative w-full h-[340px] sm:h-[420px] lg:h-[480px] xl:h-[520px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-indigo-950/50 group bg-[#07090D]"
          onMouseEnter={() => setIsSlidePaused(true)}
          onMouseLeave={() => setIsSlidePaused(false)}
        >
          {/* Slides */}
          {heroSlides.map((slide, idx) => {
            const isActive = currentSlide === idx;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 bg-[#07090D] transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Background Banner Image */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center transform transition-transform duration-1000 ease-out group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/hero-banner.jpg';
                  }}
                />

                {/* Dark Gradient Overlay for optimal legibility */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#07090D] via-[#07090D]/85 sm:via-[#07090D]/65 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07090D] via-transparent to-[#07090D]/40" />

                {/* Banner Content */}
                <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 lg:px-16 max-w-2xl space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 backdrop-blur-md shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      {slide.badge}
                    </span>
                    <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-zinc-300 border border-white/10 backdrop-blur-md">
                      {slide.tag}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight font-sans tracking-tight drop-shadow-md">
                    {slide.title}
                  </h1>

                  <p className="text-xs sm:text-base text-zinc-300 line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow">
                    {slide.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      to={slide.primaryBtn.path}
                      className="px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/40 hover:shadow-indigo-600/60 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                      <span>{slide.primaryBtn.label}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                      to={slide.secondaryBtn.path}
                      className="px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm text-zinc-200 bg-[#0D1117]/80 hover:bg-white/10 border border-white/15 hover:border-white/30 backdrop-blur-md transition-all hover:scale-105 active:scale-95"
                    >
                      <span>{slide.secondaryBtn.label}</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-indigo-600/80 border border-white/15 text-white backdrop-blur-md flex items-center justify-center transition-all duration-200 opacity-70 hover:opacity-100 hover:scale-110 shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-indigo-600/80 border border-white/15 text-white backdrop-blur-md flex items-center justify-center transition-all duration-200 opacity-70 hover:opacity-100 hover:scale-110 shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Pagination Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  currentSlide === idx
                    ? 'w-7 h-2 bg-indigo-500 shadow-md shadow-indigo-500/50'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 2. SUB-HERO ROW: 3 MINI CARDS (EXACTLY MATCHING IMAGE 1) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {/* Card 1: Player Guide Card */}
          <Link
            to={cmsConfig.subCard1.link || '/topup'}
            className="group relative rounded-2xl sm:rounded-3xl bg-[#0D1117] hover:bg-[#121821] border border-white/10 hover:border-indigo-500/40 p-3.5 sm:p-4 flex items-center gap-3.5 transition-all duration-300 shadow-xl overflow-hidden"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
              <img
                src={cmsConfig.subCard1.image || '/images/guide-thumb.jpg'}
                alt={cmsConfig.subCard1.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/packages/tier2.jpg';
                }}
              />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  <BookOpen className="w-3 h-3" />
                  {cmsConfig.subCard1.badge || 'คู่มือผู้เล่น'}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
                {cmsConfig.subCard1.title}
              </h4>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 group-hover:text-indigo-400 pt-0.5">
                <span>ดูเพิ่มเติม</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 2: Daily Check-In & Bonus Card */}
          <Link
            to={cmsConfig.subCard2.link || '/gacha'}
            className="group relative rounded-2xl sm:rounded-3xl bg-[#0D1117] hover:bg-[#121821] border border-white/10 hover:border-amber-500/40 p-3.5 sm:p-4 flex items-center gap-3.5 transition-all duration-300 shadow-xl overflow-hidden"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
              <img
                src={cmsConfig.subCard2.image || '/images/daily-checkin-thumb.jpg'}
                alt={cmsConfig.subCard2.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/boxes/gold.jpg';
                }}
              />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Calendar className="w-3 h-3" />
                  {cmsConfig.subCard2.badge || 'กิจกรรม'}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                {cmsConfig.subCard2.title}
              </h4>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 group-hover:text-amber-400 pt-0.5">
                <span>ดูเพิ่มเติม</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 3: Quick Action Buttons Card (Modern 3D Icons, matching Image 1) */}
          <div className="rounded-2xl sm:rounded-3xl bg-[#0D1117] border border-white/10 p-3 sm:p-4 flex items-center justify-around gap-2 sm:gap-3 shadow-xl">
            {/* Action 1: เติมเงินด่วน */}
            <Link
              to={cmsConfig.subCard3.action1?.link || '/topup'}
              className="flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-white/5 transition-all group flex-1"
            >
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-indigo-950/40 via-[#121824] to-[#0D1117] border border-indigo-500/30 group-hover:border-indigo-400/60 flex items-center justify-center transition-all duration-300 shadow-lg shadow-indigo-950/40 group-hover:scale-108 group-hover:shadow-indigo-500/20 p-1.5 overflow-hidden">
                <div className="absolute inset-0 bg-amber-500/10 rounded-2xl blur-sm group-hover:bg-amber-500/20 transition-all pointer-events-none" />
                <img
                  src={cmsConfig.subCard3.action1?.image || '/images/quick-coins.jpg'}
                  alt={cmsConfig.subCard3.action1?.label || 'เติมเหรียญ'}
                  style={{
                    maskImage: 'radial-gradient(circle at 50% 50%, black 58%, transparent 82%)',
                    WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 58%, transparent 82%)',
                  }}
                  className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(245,158,11,0.4)] group-hover:scale-110 transition-transform duration-300 relative z-10"
                />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-zinc-300 group-hover:text-amber-300 transition-colors mt-2 whitespace-nowrap">
                {cmsConfig.subCard3.action1?.label || 'เติมเหรียญ'}
              </span>
            </Link>

            {/* Action 2: สุ่มกล่อง */}
            <Link
              to={cmsConfig.subCard3.action2?.link || '/mystery-box'}
              className="flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-white/5 transition-all group flex-1"
            >
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-purple-950/40 via-[#121824] to-[#0D1117] border border-purple-500/30 group-hover:border-purple-400/60 flex items-center justify-center transition-all duration-300 shadow-lg shadow-purple-950/40 group-hover:scale-108 group-hover:shadow-purple-500/20 p-1.5 overflow-hidden">
                <div className="absolute inset-0 bg-purple-500/10 rounded-2xl blur-sm group-hover:bg-purple-500/20 transition-all pointer-events-none" />
                <img
                  src={cmsConfig.subCard3.action2?.image || '/images/quick-box.jpg'}
                  alt={cmsConfig.subCard3.action2?.label || 'สุ่มกล่อง'}
                  style={{
                    maskImage: 'radial-gradient(circle at 50% 50%, black 58%, transparent 82%)',
                    WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 58%, transparent 82%)',
                  }}
                  className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(168,85,247,0.4)] group-hover:scale-110 transition-transform duration-300 relative z-10"
                />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-zinc-300 group-hover:text-purple-300 transition-colors mt-2 whitespace-nowrap">
                {cmsConfig.subCard3.action2?.label || 'สุ่มกล่อง'}
              </span>
            </Link>

            {/* Action 3: วงล้อฟรี */}
            <Link
              to={cmsConfig.subCard3.action3?.link || '/gacha'}
              className="flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-white/5 transition-all group flex-1 relative"
            >
              <div className="relative">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-amber-950/40 via-[#121824] to-[#0D1117] border border-amber-500/30 group-hover:border-amber-400/60 flex items-center justify-center transition-all duration-300 shadow-lg shadow-amber-950/40 group-hover:scale-108 group-hover:shadow-amber-500/20 p-1.5 overflow-hidden">
                  <div className="absolute inset-0 bg-amber-500/10 rounded-2xl blur-sm group-hover:bg-amber-500/20 transition-all pointer-events-none" />
                  <img
                    src={cmsConfig.subCard3.action3?.image || '/images/quick-wheel.jpg'}
                    alt={cmsConfig.subCard3.action3?.label || 'วงล้อฟรี'}
                    style={{
                      maskImage: 'radial-gradient(circle at 50% 50%, black 58%, transparent 82%)',
                      WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 58%, transparent 82%)',
                    }}
                    className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(234,179,8,0.4)] group-hover:scale-110 transition-transform duration-300 relative z-10"
                  />
                </div>
                {cmsConfig.subCard3.action3?.badge && (
                  <span className="absolute -top-1.5 -right-2 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/30 animate-pulse z-20">
                    {cmsConfig.subCard3.action3.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-zinc-300 group-hover:text-amber-300 transition-colors mt-2 whitespace-nowrap">
                {cmsConfig.subCard3.action3?.label || 'วงล้อฟรี'}
              </span>
            </Link>
          </div>
        </div>

        {/* Micro Trust Stats Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-6 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-medium text-zinc-300">{cmsConfig.trustStats?.stat1 || 'ระบบอัตโนมัติ 100% ส่งตรงเข้า UID'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span className="font-medium text-zinc-300">{cmsConfig.trustStats?.stat2 || 'ได้รับเหรียญทันที < 30 วินาที'}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="font-medium text-zinc-300">{cmsConfig.trustStats?.stat3 || 'ความปลอดภัยมาตรฐานสากล ดูแล 24/7'}</span>
          </div>
        </div>
      </section>

      {/* 2. LIVE WINNERS TICKER */}
      {recentWins.length > 0 && (
        <section className="border-y border-white/5 bg-[#0D1117]/60 py-3 overflow-hidden">
          <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase text-amber-400 flex-shrink-0 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              <Trophy className="w-3.5 h-3.5" />
              <span>ผู้โชคดีล่าสุด:</span>
            </div>

            <div className="flex items-center gap-8 overflow-x-auto no-scrollbar whitespace-nowrap text-xs text-zinc-300">
              {recentWins.map((win, idx) => (
                <div key={idx} className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-zinc-500 font-mono">{win.masked_username}</span>
                  <span className="text-zinc-400">ได้รับ</span>
                  <span className={`font-bold ${win.rarity === 'LEGENDARY' ? 'text-amber-400' : win.rarity === 'EPIC' ? 'text-purple-400' : 'text-blue-400'}`}>
                    {win.reward_name}
                  </span>
                  <span className="text-[10px] text-zinc-500">({win.box_name})</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. POPULAR PACKAGES SHOWCASE */}
      <section className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Package className="w-4 h-4" />
              <span>TOP-UP PACKAGES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">แพ็กเกจเติมเหรียญยอดนิยม</h2>
          </div>
          <Link
            to="/topup"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>ดูแพ็กเกจทั้งหมด</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {packages.slice(0, 6).map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              isSelected={selectedPackage?.id === pkg.id}
              onSelect={(p) => {
                setSelectedPackage(p);
                navigate('/topup', { state: { packageId: p.id } });
              }}
            />
          ))}
        </div>
      </section>

      {/* 4. MYSTERY BOX SECTION */}
      <section className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Gift className="w-4 h-4" />
              <span>MYSTERY BOXES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">กล่องสุ่มไอเทมและรางวัลใหญ่</h2>
          </div>
          <Link
            to="/mystery-box"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>เข้าสู่ห้องสุ่มกล่อง</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {boxes.map((box) => {
            const theme = getBoxTheme(box.name, box.badge || '');
            const resolvedImg = box.imageUrl && !box.imageUrl.includes('unsplash.com') ? box.imageUrl : theme.image;
            return (
              <div
                key={box.id}
                className={`relative rounded-3xl bg-[#0D1117] border ${theme.border} p-5 flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 shadow-xl ${theme.glow} group overflow-hidden`}
              >
                {/* Ambient Top Glow */}
                <div
                  className={`absolute -top-14 -right-14 w-36 h-36 rounded-full bg-gradient-to-br ${theme.accent} blur-3xl pointer-events-none transition-opacity duration-500 opacity-40 group-hover:opacity-80`}
                />

                {/* Badge */}
                {box.badge && (
                  <div className="mb-2 relative z-10">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${theme.badgeBg}`}>
                      {box.badge}
                    </span>
                  </div>
                )}

                {/* Box Image with Smooth Radial Vignette & Ambient Glow (No square borders) */}
                <div className="relative w-full h-44 my-2 flex items-center justify-center overflow-hidden z-10">
                  {/* Subtle Glowing Aura */}
                  <div
                    className={`absolute w-32 h-32 rounded-full ${theme.aura} blur-3xl pointer-events-none transition-transform duration-500 group-hover:scale-125 opacity-70`}
                  />

                  {/* Soft Pedestal Shadow */}
                  <div className="absolute bottom-2 w-28 h-4 rounded-full bg-black/80 blur-md pointer-events-none" />

                  {/* Chest with Radial Vignette Mask */}
                  <img
                    src={resolvedImg}
                    alt={box.name}
                    style={{
                      maskImage: 'radial-gradient(circle at 50% 50%, black 48%, transparent 75%)',
                      WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 48%, transparent 75%)',
                    }}
                    className="max-h-full max-w-[90%] object-contain filter drop-shadow-[0_14px_24px_rgba(0,0,0,0.9)] group-hover:scale-110 transition-transform duration-500 ease-out relative z-10"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = theme.image;
                    }}
                  />
                </div>

                {/* Info */}
                <div className="space-y-1.5 my-3 relative z-10">
                  <h3 className="font-black text-lg text-white group-hover:text-amber-300 transition-colors tracking-tight">
                    {box.name}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{box.description}</p>
                </div>

                {/* Action Button */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
                  <div>
                    <span className="text-[11px] text-zinc-500 block">ราคาสุ่ม</span>
                    <p className="font-black text-lg text-white tracking-tight">
                      {settings.currency_symbol}{box.price.toFixed(2)}
                    </p>
                  </div>
                  <Link
                    to="/mystery-box"
                    className={`px-4 py-2 rounded-xl text-xs transition-all hover:scale-105 active:scale-95 shadow-lg ${theme.btnBg}`}
                  >
                    สุ่มเลย
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4.5 NEW SLOT GAME SHOWCASE BANNER */}
      <section className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border-2 border-yellow-500/40 bg-gradient-to-r from-[#1a103c] via-[#241352] to-[#0c0926] p-6 sm:p-10 shadow-[0_0_50px_rgba(234,179,8,0.25)] flex flex-col lg:flex-row items-center justify-between gap-8 group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(250,204,21,0.18)_0%,transparent_60%)] pointer-events-none" />
          <div className="space-y-4 max-w-xl z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-black text-xs tracking-wider uppercase shadow-lg shadow-yellow-500/30">
              <Sparkles className="w-4 h-4" />
              <span>เกมใหม่ล่าสุด · NEW 5x3 SLOT</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              GOLDEN CAT HEIST
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-500 text-2xl sm:text-4xl mt-1">
                สล็อตแมวมาเฟียปล้นเซฟทองคำ
              </span>
            </h2>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              สัมผัสความมันส์ระดับคาสิโนพรีเมียม 20 เพย์ไลน์ โบนัส <strong className="text-yellow-300">WILD ทะลัก</strong>, 
              ลุ้นฟรีสปินคูณสองจาก <strong className="text-purple-300">SCATTER เพชรม่วง</strong> และแจ็กพอตโปรเกรสซีฟสะสมแตกจริง!
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/slot"
                className="px-7 py-3.5 rounded-2xl font-black text-sm text-slate-950 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-yellow-500/30 flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>เข้าเล่นสล็อตทันที</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-3 text-xs text-yellow-200/80 font-bold">
                <span>⚡ เริ่มต้นเบทละ ฿1</span>
                <span>•</span>
                <span>👑 แจ็กพอตแตกง่าย</span>
                <span>•</span>
                <span>💎 RTP 94%</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 w-full max-w-md lg:max-w-lg">
            <Link to="/slot" className="block relative group-hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 bg-yellow-400/20 rounded-3xl blur-2xl group-hover:bg-yellow-400/35 transition-all" />
              <img
                src="/images/slots/slot_banner.jpg"
                alt="Golden Cat Heist Slot"
                className="relative z-10 w-full rounded-2xl border border-yellow-500/40 shadow-2xl object-cover"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. PROMOTIONS BANNER SECTION */}
      {promotions.length > 0 && (
        <section className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <Tag className="w-4 h-4" />
            <span>PROMOTIONS & DEALS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promotions.map((promo) => (
              <div
                key={promo.id}
                className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-r from-[#0D1117] via-[#121821] to-[#161D29] p-6 sm:p-8 flex flex-col justify-between shadow-2xl group"
              >
                <div className="space-y-2 z-10 max-w-sm">
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {promo.promoType}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">{promo.title}</h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{promo.subtitle}</p>
                  {promo.code && (
                    <div className="pt-2">
                      <span className="text-xs text-zinc-400">โค้ดส่วนลด: </span>
                      <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 font-mono text-sm font-bold text-amber-400 select-all">
                        {promo.code}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-6 z-10">
                  <Link
                    to="/topup"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-white/10 hover:bg-white/20 transition-all"
                  >
                    <span>ใช้โปรโมชั่นนี้</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. TRUST & SECURITY BADGES */}
      <section className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#0D1117] border border-white/5 p-8 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-left">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 mx-auto sm:mx-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">ปลอดภัย 100%</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                ระบบเชื่อมต่ออย่างปลอดภัย ไม่ต้องใช้รหัสผ่านเกม เติมผ่าน Player ID / UID เท่านั้น
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0 mx-auto sm:mx-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">ระบบอัตโนมัติ 24 ชม.</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                ทำรายการเสร็จสิ้นทันทีในไม่กี่วินาที ไม่ต้องรอแอดมินตอบ พร้อมประวัติคำสั่งซื้อ
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 mx-auto sm:mx-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">โบนัส & ของรางวัล</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                ทุกการใช้จ่ายได้รับเหรียญโบนัส และสิทธิ์ลุ้นรับรางวัลใหญ่ในกล่องสุ่มสมบัติ
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
