import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  Ticket,
  Wallet,
  ChevronDown,
  ChevronUp,
  Info,
  Clock,
  History,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Plus,
  RefreshCw,
  Trophy,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { platformApi } from '../services/api';
import { GachaItem, GachaSpinResult, GachaReelCard, GachaHistoryItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useSettings } from '../context/SettingsContext';
import { playTickSound, playWinSound } from '../utils/audio';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80';

const resolveGamingGearImage = (name: string, url?: string): string => {
  if (url && url.trim() !== '' && url !== FALLBACK_IMAGE && url !== '/images/rewards/headset.png') {
    return `${url}?v=custom_v1`;
  }

  const n = (name || '').toLowerCase();
  let assetPath = '';

  if (n.includes('salt') || n.includes('เกลือ')) assetPath = '/images/rewards/salt.png';
  else if (n.includes('ramen') || n.includes('noodles') || n.includes('บะหมี่') || n.includes('มาม่า')) assetPath = '/images/rewards/noodles.png';
  else if (n.includes('energy') || n.includes('elixir') || n.includes('เครื่องดื่ม')) assetPath = '/images/rewards/energy_drink.png';
  else if (n.includes('stand') || n.includes('แท่นแขวน')) assetPath = '/images/rewards/stand.png';
  else if (n.includes('pad') || n.includes('แผ่นรอง') || n.includes('mat')) assetPath = '/images/rewards/mousepad.png';
  else if (n.includes('earbuds') || n.includes('tws') || n.includes('in-ear')) assetPath = '/images/rewards/earbuds.png';
  else if (n.includes('mouse') || n.includes('เมาส์')) assetPath = '/images/rewards/mouse.png';
  else if (n.includes('cam') || n.includes('webcam') || n.includes('กล้อง')) assetPath = '/images/rewards/webcam.png';
  else if (n.includes('speaker') || n.includes('soundbar') || n.includes('ลำโพง')) assetPath = '/images/rewards/speaker.png';
  else if (n.includes('mic') || n.includes('ไมโครโฟน') || n.includes('ไมค์')) assetPath = '/images/rewards/microphone.png';
  else if (n.includes('controller') || n.includes('จอย') || n.includes('gamepad')) assetPath = '/images/rewards/controller.png';
  else if (n.includes('keyboard') || n.includes('คีย์บอร์ด')) assetPath = '/images/rewards/keyboard.png';
  else if (n.includes('headset') || n.includes('หูฟัง') || n.includes('audio')) assetPath = '/images/rewards/headset.png';
  else if (n.includes('chair') || n.includes('เก้าอี้')) assetPath = '/images/rewards/chair.png';
  else if (n.includes('vr') || n.includes('แว่นตา')) assetPath = '/images/rewards/vr.png';
  else if (n.includes('monitor') || n.includes('จอคอม') || n.includes('oled') || n.includes('จอ')) assetPath = '/images/rewards/monitor.png';
  else if (n.includes('desk') || n.includes('โต๊ะ') || n.includes('table')) assetPath = '/images/rewards/desk.png';
  else if (n.includes('gpu') || n.includes('rtx') || n.includes('การ์ดจอ')) assetPath = '/images/rewards/gpu.png';
  else if (n.includes('pc') || n.includes('เคส') || n.includes('rig') || n.includes('tower')) assetPath = '/images/rewards/pc_case.png';
  else if (n.includes('3,000') || n.includes('3000')) assetPath = '/images/packages/tier6.jpg';
  else if (n.includes('1,000') || n.includes('1000')) assetPath = '/images/packages/tier4.jpg';
  else if (n.includes('500')) assetPath = '/images/packages/tier3.jpg';
  else if (n.includes('250')) assetPath = '/images/packages/tier2.jpg';
  else if (n.includes('100') || n.includes('50') || n.includes('coin') || n.includes('เหรียญ')) assetPath = '/images/packages/tier1.jpg';
  else if (url && url.trim() !== '') assetPath = url;
  else assetPath = '/images/rewards/headset.png';

  return `${assetPath}?v=transparent_v1`;
};

export const GachaPage: React.FC = () => {
  const { isAuthenticated, openAuthModal, updateUserBalance } = useAuth();
  const { balance, openTopupModal, refreshBalance } = useWallet();
  const { settings } = useSettings();

  const [poolItems, setPoolItems] = useState<GachaItem[]>([]);
  const [costPerSpin, setCostPerSpin] = useState<number>(29);
  const [remainingFreeSpins, setRemainingFreeSpins] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reel Strip State
  const [stripCards, setStripCards] = useState<GachaReelCard[]>([]);
  const [stripTranslateX, setStripTranslateX] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [winningResult, setWinningResult] = useState<GachaSpinResult | null>(null);
  const [showWinModal, setShowWinModal] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Expandable sections
  const [showOddsModal, setShowOddsModal] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<GachaHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  const reelContainerRef = useRef<HTMLDivElement | null>(null);
  const stripTrackRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTickCardIndex = useRef<number>(-1);

  // Card dimensions
  const CARD_WIDTH = 210;
  const CARD_GAP = 16; // 8px margin each side (mx-2)
  const CARD_STEP = CARD_WIDTH + CARD_GAP; // 226px per step

  // Load pool data
  const fetchPool = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await platformApi.getGachaPool();
      if (res.data?.success) {
        const items: GachaItem[] = res.data.data.items || [];
        setPoolItems(items);
        setCostPerSpin(res.data.data.costPerSpin || 29);
        setRemainingFreeSpins(res.data.data.remainingFreeSpins ?? 0);

        // Build initial preview strip (repeat pool items to create a full scenic ribbon)
        if (items.length > 0) {
          const previewList: GachaReelCard[] = [];
          for (let i = 0; i < 60; i++) {
            const item = items[i % items.length];
            previewList.push({
              id: item.id,
              title: item.title,
              category: item.category,
              value_text: item.value_text,
              image_url: item.image_url,
              rarity: item.rarity,
            });
          }
          setStripCards(previewList);
          // Center the preview strip nicely on item index 6
          setTimeout(() => {
            if (reelContainerRef.current) {
              const containerWidth = reelContainerRef.current.clientWidth;
              const centerOffset = 6 * CARD_STEP + CARD_WIDTH / 2 - containerWidth / 2;
              setStripTranslateX(-centerOffset);
            }
          }, 80);
        }
      }
    } catch (err: any) {
      console.error('Failed to load gacha pool:', err);
      setErrorMessage(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลของรางวัลกาชาได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingHistory(true);
      const res = await platformApi.getGachaHistory(30);
      if (res.data?.success) {
        setHistoryList(res.data.data || []);
      }
    } catch (err) {
      console.warn('Failed to load gacha history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchPool();
  }, [isAuthenticated]);

  useEffect(() => {
    if (showHistory) {
      fetchHistory();
    }
  }, [showHistory]);

  // Handle Spin Click
  const handleSpin = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    // Check balance if free spin is already used
    if (remainingFreeSpins <= 0 && balance < costPerSpin) {
      setErrorMessage(`ยอดเงินคงเหลือไม่เพียงพอ (ต้องการ ฿${costPerSpin}) กรุณาเติมเงิน`);
      openTopupModal();
      return;
    }

    try {
      setIsSpinning(true);
      setErrorMessage(null);
      setShowWinModal(false);

      // 1. Call Backend API
      const res = await platformApi.spinGacha();
      if (!res.data?.success) {
        throw new Error(res.data?.message || 'เกิดข้อผิดพลาดในการสุ่มกาชา');
      }

      const result: GachaSpinResult = res.data.data;
      setWinningResult(result);
      setRemainingFreeSpins(result.remainingFreeSpins);

      // Update wallet balance immediately in contexts
      updateUserBalance(result.newWalletBalance);

      // 2. Prepare Reel Strip
      setIsAnimating(false);
      setStripCards(result.reelSequence);

      // Center container measurement
      const containerWidth = reelContainerRef.current?.clientWidth || 1000;
      const winningIndex = result.winningIndex || 55;

      // Small jitter between -30px and +30px inside the winning card
      const jitter = Math.floor(Math.random() * 60) - 30;
      const targetOffset = winningIndex * CARD_STEP + CARD_WIDTH / 2 - containerWidth / 2 + jitter;

      // Reset to 0 then animate
      setStripTranslateX(0);

      // Allow DOM to apply initial reset pos
      setTimeout(() => {
        setIsAnimating(true);
        setStripTranslateX(-targetOffset);

        // Sound ticker using requestAnimationFrame
        lastTickCardIndex.current = -1;
        const startTime = performance.now();
        const duration = 5400; // 5.4s matching transition

        const checkTicker = (time: number) => {
          if (!stripTrackRef.current) return;
          const rect = stripTrackRef.current.getBoundingClientRect();
          const containerLeft = reelContainerRef.current?.getBoundingClientRect().left || 0;
          const currentCenterRel = containerLeft + containerWidth / 2 - rect.left;
          const currentCardIndex = Math.floor(currentCenterRel / CARD_STEP);

          if (currentCardIndex !== lastTickCardIndex.current && currentCardIndex >= 0) {
            lastTickCardIndex.current = currentCardIndex;
            playTickSound();
          }

          if (time - startTime < duration) {
            animationFrameRef.current = requestAnimationFrame(checkTicker);
          }
        };

        animationFrameRef.current = requestAnimationFrame(checkTicker);

        // 3. Animation Completion after 5.6s
        setTimeout(() => {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
          setIsSpinning(false);
          setIsAnimating(false);

          // Play triumph audio & confetti
          const wonRarity = result.winningItem.rarity || 'COMMON';
          const isSalt = !!(
            result.winningItem.title &&
            (result.winningItem.title.includes('เกลือ') || result.winningItem.title.toLowerCase().includes('salt'))
          );
          playWinSound(wonRarity, isSalt);
          triggerConfetti(wonRarity, isSalt);

          // Show win celebration modal
          setShowWinModal(true);
          refreshBalance();
        }, 5600);
      }, 50);
    } catch (err: any) {
      console.error('Spin error:', err);
      setIsSpinning(false);
      setIsAnimating(false);
      setErrorMessage(err.response?.data?.message || err.message || 'ไม่สามารถทำรายการสุ่มได้');
    }
  };

  const triggerConfetti = (rarity: string, isSalt = false) => {
    const celebrationZIndex = 100005;

    if (isSalt) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#94A3B8', '#CBD5E1', '#E2E8F0', '#38BDF8', '#FFFFFF'],
        zIndex: celebrationZIndex,
      });
      return;
    }

    const palette =
      rarity === 'LEGENDARY'
        ? ['#F59E0B', '#FBBF24', '#FDE047', '#EF4444', '#EC4899', '#8B5CF6', '#10B981']
        : rarity === 'EPIC'
        ? ['#A855F7', '#C084FC', '#D946EF', '#EC4899', '#818CF8', '#F59E0B']
        : rarity === 'RARE'
        ? ['#06B6D4', '#38BDF8', '#60A5FA', '#34D399', '#F59E0B', '#A78BFA']
        : ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#FBBF24', '#06B6D4'];

    const baseCount = rarity === 'LEGENDARY' ? 140 : rarity === 'EPIC' ? 100 : rarity === 'RARE' ? 75 : 60;

    // 1. Immediate Center Fireworks Explosion
    confetti({
      particleCount: baseCount,
      spread: 100,
      startVelocity: 50,
      origin: { x: 0.5, y: 0.5 },
      colors: palette,
      zIndex: celebrationZIndex,
    });

    // 2. Left side cannon
    setTimeout(() => {
      confetti({
        particleCount: Math.round(baseCount * 0.75),
        angle: 60,
        spread: 65,
        startVelocity: 55,
        origin: { x: 0.15, y: 0.7 },
        colors: palette,
        zIndex: celebrationZIndex,
      });
    }, 180);

    // 3. Right side cannon
    setTimeout(() => {
      confetti({
        particleCount: Math.round(baseCount * 0.75),
        angle: 120,
        spread: 65,
        startVelocity: 55,
        origin: { x: 0.85, y: 0.7 },
        colors: palette,
        zIndex: celebrationZIndex,
      });
    }, 360);

    // 4. Secondary grand burst
    setTimeout(() => {
      confetti({
        particleCount: Math.round(baseCount * 0.8),
        spread: 120,
        startVelocity: 42,
        origin: { x: 0.5, y: 0.42 },
        shapes: ['star', 'circle'],
        colors: palette,
        zIndex: celebrationZIndex,
      });
    }, 520);
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'LEGENDARY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
            👑 LEGENDARY
          </span>
        );
      case 'EPIC':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
            💎 EPIC
          </span>
        );
      case 'RARE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            ★ RARE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-700/40 text-slate-300 border border-slate-600/40">
            COMMON
          </span>
        );
    }
  };

  const getCardBorderClass = (rarity: string) => {
    switch (rarity) {
      case 'LEGENDARY':
        return 'border-amber-500/80 shadow-[0_0_22px_rgba(245,158,11,0.25)] hover:border-amber-400';
      case 'EPIC':
        return 'border-purple-500/80 shadow-[0_0_20px_rgba(168,85,247,0.25)] hover:border-purple-400';
      case 'RARE':
        return 'border-cyan-500/80 shadow-[0_0_18px_rgba(6,182,212,0.2)] hover:border-cyan-400';
      default:
        return 'border-slate-700/80 shadow-sm hover:border-slate-600';
    }
  };

  const getCardAuraClass = (rarity: string) => {
    switch (rarity) {
      case 'LEGENDARY':
        return 'bg-gradient-to-b from-amber-500/25 via-amber-600/10 to-transparent';
      case 'EPIC':
        return 'bg-gradient-to-b from-purple-500/25 via-purple-600/10 to-transparent';
      case 'RARE':
        return 'bg-gradient-to-b from-cyan-500/25 via-cyan-600/10 to-transparent';
      default:
        return 'bg-gradient-to-b from-slate-700/20 to-transparent';
    }
  };

  useEffect(() => {
    // Reset scroll to top on mount so entering the page always shows Image 2
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const scrollToVaultRewards = () => {
    const el = document.getElementById('vault-rewards-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (settings.game_gacha_enabled === 'false') {
    return (
      <div className="min-h-screen bg-[#07090D] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#10141E] border border-purple-500/30 rounded-3xl p-8 text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 mx-auto flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/20">
            <AlertCircle className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/40">
              ระบบกำลังปิดปรับปรุงชั่วคราว
            </span>
            <h2 className="text-xl font-black text-white">{settings.game_gacha_title || 'วงล้อกาชา (Gacha Vault)'}</h2>
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
    <div className="min-h-screen bg-[#070b14] text-slate-100 pt-16 sm:pt-20 pb-24 px-4 select-none">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[750px] h-[500px] bg-amber-500/10 blur-[130px] rounded-full" />
        <div className="absolute top-1/3 left-10 w-[450px] h-[450px] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* ========================================================================= */}
        {/* FIRST SCREEN: HERO + ROULETTE REEL + CONTROLS (MATCHING IMAGE 2 EXACTLY) */}
        {/* ========================================================================= */}
        <section className="min-h-[calc(100vh-5.5rem)] flex flex-col justify-center items-center py-4">
          <div className="w-full">
            {/* Top Header Badge */}
            <div className="flex flex-col items-center text-center mb-5">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wide mb-3 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>{settings.game_gacha_notice || '🪙 NEXUS LUCKY VAULT • ลุ้นรับสิทธิพิเศษฟรี'}</span>
              </div>

              {/* Main Title */}
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2.5">
                {settings.game_gacha_title || 'หมุนวงล้อสุ่มกาชา (Gacha Vault)'}
              </h1>

              {/* Subtitle */}
              <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                {settings.game_gacha_subtitle || 'ตู้สุ่มรูเล็ตต์รวมรางวัลพิเศษ ลุ้นรับไอเทมแรร์ระดับตำนาน การันตีความคุ้มค่าทุกการสุ่ม'}
              </p>

              {/* Free Spin Ticket & Wallet Balance Bar */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-amber-500/30 text-xs md:text-sm font-semibold backdrop-blur shadow-lg">
                  <Ticket className="w-4 h-4 text-amber-400" />
                  <span>สิทธิ์คงเหลือ:</span>
                  <span className="text-amber-400 font-bold">
                    🎟️ {remainingFreeSpins > 0 ? `${remainingFreeSpins} สิทธิ์ (หมุนฟรี)` : '0 สิทธิ์'}
                  </span>
                  <button
                    type="button"
                    onClick={openTopupModal}
                    className="ml-2 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 transition flex items-center gap-1 font-bold"
                  >
                    <Plus className="w-3 h-3" /> เพิ่มสิทธิ์
                  </button>
                </div>

                {isAuthenticated && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs md:text-sm font-semibold backdrop-blur shadow-lg">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-400">เครดิตคงเหลือ:</span>
                    <span className="text-emerald-400 font-bold">฿{balance.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="max-w-xl mx-auto mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-xs text-rose-300 hover:underline flex-shrink-0"
                >
                  ปิด
                </button>
              </div>
            )}

            {/* ========================================================================= */}
            {/* ROULETTE REEL BOX */}
            {/* ========================================================================= */}
            <div className="relative max-w-6xl mx-auto mb-7">
              <div
                ref={reelContainerRef}
                className="relative h-[310px] md:h-[320px] rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-[#0e1424] to-[#080d1a] shadow-[0_0_60px_rgba(245,158,11,0.12)] overflow-hidden flex items-center"
              >
                {/* Top Indicator Needle */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
                  <svg
                    width="28"
                    height="18"
                    viewBox="0 0 28 18"
                    className="drop-shadow-[0_0_10px_rgba(245,158,11,0.9)]"
                  >
                    <polygon points="0,0 28,0 14,18" fill="#F59E0B" />
                  </svg>
                </div>

                {/* Bottom Indicator Needle */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
                  <svg
                    width="28"
                    height="18"
                    viewBox="0 0 28 18"
                    className="drop-shadow-[0_0_10px_rgba(245,158,11,0.9)]"
                  >
                    <polygon points="0,18 28,18 14,0" fill="#F59E0B" />
                  </svg>
                </div>

                {/* Center Glowing Laser Guideline */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-amber-400/80 via-amber-300 to-amber-400/80 shadow-[0_0_14px_#f59e0b] z-20 pointer-events-none opacity-70" />

                {/* Left & Right Fade Gradients */}
                <div className="absolute inset-y-0 left-0 w-24 md:w-36 bg-gradient-to-r from-[#0e1424] via-[#0e1424]/90 to-transparent z-20 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-24 md:w-36 bg-gradient-to-l from-[#0e1424] via-[#0e1424]/90 to-transparent z-20 pointer-events-none" />

                {/* Horizontal Sliding Track */}
                <div
                  ref={stripTrackRef}
                  className="flex items-center will-change-transform py-4"
                  style={{
                    transform: `translateX(${stripTranslateX}px)`,
                    transition: isAnimating
                      ? 'transform 5.5s cubic-bezier(0.12, 0.95, 0.22, 1)'
                      : 'none',
                  }}
                >
                  {stripCards.map((card, idx) => {
                    const borderCls = getCardBorderClass(card.rarity);
                    const auraCls = getCardAuraClass(card.rarity);

                    return (
                      <div
                        key={`${card.id}-${idx}`}
                        style={{ width: `${CARD_WIDTH}px`, height: '268px' }}
                        className={`flex-shrink-0 mx-2 rounded-xl border bg-[#111726]/90 backdrop-blur p-3.5 flex flex-col items-center justify-between text-center transition-all relative overflow-hidden ${borderCls}`}
                      >
                        {/* Background card radial aura */}
                        <div className={`absolute inset-0 pointer-events-none ${auraCls}`} />

                        {/* Top Rarity Badge */}
                        <div className="relative z-10">{getRarityBadge(card.rarity)}</div>

                        {/* Center Product Showcase (NO CIRCLES, Natural Rectangular 3D Product) */}
                        <div className="relative z-10 my-1.5 w-full h-24 flex items-center justify-center p-1">
                          <img
                            src={resolveGamingGearImage(card.title, card.image_url)}
                            alt={card.title}
                            className="max-h-full max-w-full object-contain filter drop-shadow-[0_6px_16px_rgba(0,0,0,0.85)] transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Item Title & Category */}
                        <div className="relative z-10 w-full px-1">
                          <h3 className="font-bold text-white text-xs md:text-sm line-clamp-2 leading-tight min-h-[2.5rem] flex items-center justify-center">
                            {card.title}
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">{card.category}</p>
                        </div>

                        {/* Value Pill at Bottom */}
                        <div className="relative z-10 mt-1 w-full">
                          <span className="inline-block w-full py-1 px-2 rounded-full border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 text-xs font-bold tracking-wide shadow-sm truncate">
                            {card.value_text || 'ฟรี'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SPIN ACTION BUTTON & CONTROLS */}
            {/* ========================================================================= */}
            <div className="flex flex-col items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleSpin}
                disabled={isSpinning || loading}
                className={`relative group px-10 py-4 rounded-full font-black text-base md:text-lg text-slate-950 tracking-wide transition-all transform shadow-[0_0_35px_rgba(245,158,11,0.5)] ${
                  isSpinning || loading
                    ? 'opacity-60 cursor-not-allowed bg-amber-600'
                    : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:via-amber-400 hover:to-amber-500 hover:scale-105 active:scale-95'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isSpinning ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                      <span>กำลังหมุนลุ้นรางวัล...</span>
                    </>
                  ) : remainingFreeSpins > 0 ? (
                    <>
                      <Zap className="w-5 h-5 fill-slate-950 text-slate-950" />
                      <span>หมุนสุ่มรับสิทธิ์ฟรี (SPIN NOW)</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 fill-slate-950 text-slate-950" />
                      <span>หมุนสุ่มทันที (SPIN NOW - ฿{costPerSpin})</span>
                    </>
                  )}
                </div>
              </button>

              {/* Subtext info */}
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  {remainingFreeSpins > 0
                    ? 'สุ่มได้ฟรี 100% • โค้ดหรือไอเทมที่ได้จะถูกบันทึกเข้าคลังสัมภาระ (Inventory) ของคุณทันที'
                    : `หมุนครั้งละ ฿${costPerSpin} • สุ่มได้จริง 100% พร้อมการันตีของรางวัลทุกครั้ง`}
                </span>
              </div>

              {/* Navigation Links: See All Rewards & History */}
              <div className="flex items-center gap-4 mt-2">
                <button
                  type="button"
                  onClick={scrollToVaultRewards}
                  className="group text-xs md:text-sm text-amber-400/90 hover:text-amber-300 font-semibold flex items-center gap-1.5 transition underline-offset-4 hover:underline cursor-pointer"
                >
                  <Award className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>ดูของรางวัลทั้งหมด & อัตราการดรอป (Drop Rates)</span>
                  <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                </button>

                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-xs md:text-sm text-slate-400 hover:text-white font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <History className="w-4 h-4" />
                    <span>ประวัติการสุ่มของคุณ</span>
                    {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* USER SPIN HISTORY SECTION (COLLAPSIBLE) */}
        {/* ========================================================================= */}
        {showHistory && (
          <div className="max-w-4xl mx-auto my-10 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                ประวัติการหมุนสุ่มของคุณ (Your Spin Records)
              </h2>
              <button
                type="button"
                onClick={fetchHistory}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> รีเฟรช
              </button>
            </div>

            {loadingHistory ? (
              <div className="text-center py-6 text-slate-400 text-sm">กำลังโหลดประวัติ...</div>
            ) : historyList.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                คุณยังไม่มีประวัติการหมุนกาชา กดหมุนเพื่อรับรางวัลชิ้นแรกเลย!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-3 font-semibold">รางวัลที่ได้รับ</th>
                      <th className="pb-3 font-semibold">ระดับความหายาก</th>
                      <th className="pb-3 font-semibold">ประเภทการสุ่ม</th>
                      <th className="pb-3 font-semibold">มูลค่า</th>
                      <th className="pb-3 font-semibold text-right">เวลา</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {historyList.map((hist) => (
                      <tr key={hist.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 flex items-center gap-2 font-medium text-white">
                          <img
                            src={hist.image_url}
                            alt={hist.reward_name}
                            className="w-8 h-8 rounded-lg object-contain bg-slate-800 p-1 border border-slate-700"
                          />
                          <span className="truncate max-w-[200px]">{hist.reward_name}</span>
                        </td>
                        <td className="py-3">{getRarityBadge(hist.rarity)}</td>
                        <td className="py-3">
                          {hist.spin_type === 'FREE_DAILY' ? (
                            <span className="text-amber-400 font-semibold">🎟️ ฟรีประจำวัน</span>
                          ) : (
                            <span className="text-slate-300">฿{hist.cost}</span>
                          )}
                        </td>
                        <td className="py-3 text-amber-400 font-semibold">{hist.value_text}</td>
                        <td className="py-3 text-right text-slate-400">
                          {new Date(hist.created_at).toLocaleString('th-TH')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ALL REWARDS POOL PREVIEW GRID (BELOW THE FOLD - SCROLL OR CLICK TO VIEW) */}
        {/* ========================================================================= */}
        <div id="vault-rewards-section" className="mt-20 md:mt-28 pt-16 border-t border-slate-800/80 scroll-mt-24">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-2">
              <Trophy className="w-3.5 h-3.5" />
              <span>VAULT PRIZE POOL</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white flex items-center justify-center gap-2">
              <span>ของรางวัลทั้งหมดในตู้สุ่ม (All Vault Items)</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-xl mx-auto">
              การันตีได้รับของรางวัลแท้ 100% ทุกครั้งที่หมุน สุ่มออกตามอัตราความน่าจะเป็นที่โปร่งใส
            </p>

            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowOddsModal(true)}
                className="text-xs px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-amber-500/30 text-amber-300 hover:text-amber-200 font-semibold inline-flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 text-amber-400" />
                <span>ดูตารางอัตราการดรอปแบบละเอียด (Odds Table)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {poolItems.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl border bg-slate-900/60 backdrop-blur p-4 flex flex-col items-center text-center transition hover:scale-[1.02] ${getCardBorderClass(
                  item.rarity
                )}`}
              >
                <div className="w-full flex items-center justify-between mb-2">
                  {getRarityBadge(item.rarity)}
                  <span className="text-[11px] font-bold text-amber-400">
                    โอกาส {item.probability_percent}%
                  </span>
                </div>

                {/* Product Showcase (NO CIRCLES, Natural Rectangular Container) */}
                <div className="w-full h-24 my-2 flex items-center justify-center p-1">
                  <img
                    src={resolveGamingGearImage(item.title, item.image_url)}
                    alt={item.title}
                    className="max-h-full max-w-full object-contain filter drop-shadow-[0_4px_14px_rgba(0,0,0,0.7)]"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <h4 className="font-bold text-white text-sm line-clamp-2 leading-tight mt-1 mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 mb-3">{item.category}</p>

                <div className="mt-auto w-full pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">มูลค่าของขวัญ</span>
                  <span className="text-amber-400 font-bold">{item.value_text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* WIN CELEBRATION MODAL */}
      {/* ========================================================================= */}
      {showWinModal && winningResult && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0B0C10] border-2 border-amber-400/70 p-6 sm:p-8 text-center shadow-[0_0_80px_rgba(245,158,11,0.35)] animate-scale-up overflow-hidden">
            {/* Ambient Golden Glows */}
            <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-amber-300 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="mb-2">{getRarityBadge(winningResult.winningItem.rarity)}</div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 mb-1 drop-shadow-sm flex items-center justify-center gap-2">
                <span>🎉 ยินดีด้วย! คุณได้รับรางวัล ✨</span>
              </h2>
              <p className="text-xs text-stone-400 mb-4">
                {winningResult.spinType === 'FREE_DAILY'
                  ? 'จากการหมุนสุ่มสิทธิ์ฟรีประจำวัน'
                  : `จากการหมุนสุ่ม (฿${winningResult.cost})`}
              </p>

              {/* Glowing Hero Reward Image with Rotating Sunburst Rays */}
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto my-3 flex items-center justify-center">
                {/* Rotating Sunburst Rays */}
                <div
                  className="absolute w-60 h-60 -inset-6 m-auto rounded-full pointer-events-none opacity-40 animate-[spin_15s_linear_infinite]"
                  style={{
                    willChange: 'transform',
                    transform: 'translateZ(0)',
                    background:
                      'conic-gradient(from 0deg, rgba(245,158,11,0.45) 0deg 15deg, transparent 15deg 30deg, rgba(245,158,11,0.45) 30deg 45deg, transparent 45deg 60deg, rgba(245,158,11,0.45) 60deg 75deg, transparent 75deg 90deg, rgba(245,158,11,0.45) 90deg 105deg, transparent 105deg 120deg, rgba(245,158,11,0.45) 120deg 135deg, transparent 135deg 150deg, rgba(245,158,11,0.45) 150deg 165deg, transparent 165deg 180deg, rgba(245,158,11,0.45) 180deg 195deg, transparent 195deg 210deg, rgba(245,158,11,0.45) 210deg 225deg, transparent 225deg 240deg, rgba(245,158,11,0.45) 240deg 255deg, transparent 255deg 270deg, rgba(245,158,11,0.45) 270deg 285deg, transparent 285deg 300deg, rgba(245,158,11,0.45) 300deg 315deg, transparent 315deg 330deg, rgba(245,158,11,0.45) 330deg 345deg, transparent 345deg 360deg)',
                    maskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)',
                    WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)',
                  }}
                />
                <div className="absolute inset-0 bg-amber-400/25 rounded-full blur-2xl animate-pulse" />
                <div className="relative w-full h-full rounded-2xl bg-gradient-to-b from-[#181a22] to-[#0c0d12] border-2 border-amber-400/70 p-4 flex items-center justify-center shadow-[0_15px_35px_rgba(0,0,0,0.8)]">
                  <img
                    src={resolveGamingGearImage(winningResult.winningItem.title, winningResult.winningItem.image_url)}
                    alt={winningResult.winningItem.title}
                    className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_20px_rgba(245,158,11,0.4)] animate-bounce"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Title & Category */}
              <h3 className="text-xl sm:text-2xl font-black text-white mb-1 tracking-tight">
                {winningResult.winningItem.title}
              </h3>
              <p className="text-xs text-stone-400 mb-3">{winningResult.winningItem.category}</p>

              {/* Value Badge (Gold - No Green) */}
              <div className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-amber-500/15 border border-amber-400/50 text-amber-300 font-black text-xs sm:text-sm mb-5 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <Award className="w-4 h-4 text-amber-400" />
                <span>{winningResult.winningItem.value_text}</span>
              </div>

              {/* If Item has a Code */}
              {winningResult.winningItem.code && (
                <div className="mb-5 p-3.5 rounded-2xl bg-stone-900/90 border border-amber-500/40 text-left">
                  <span className="text-[11px] text-amber-400 font-bold block mb-1.5">
                    🔑 โค้ดรับรางวัลของคุณ:
                  </span>
                  <div className="flex items-center justify-between gap-2 bg-black/60 px-3.5 py-2 rounded-xl border border-stone-800">
                    <code className="text-sm font-mono text-amber-300 font-black tracking-wider select-all">
                      {winningResult.winningItem.code}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        if (winningResult.winningItem.code) {
                          navigator.clipboard.writeText(winningResult.winningItem.code);
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                        }
                      }}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 transition"
                    >
                      {copiedCode ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-amber-400">คัดลอกแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>คัดลอก</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5">
                <Link
                  to="/inventory"
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 font-black text-sm transition-all shadow-[0_0_25px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>ดูของในคลังสัมภาระ (Inventory)</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setShowWinModal(false)}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white text-xs font-bold transition border border-white/10"
                >
                  ปิดหน้าต่าง / หมุนต่อ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ODDS & DROP RATE MODAL */}
      {/* ========================================================================= */}
      {showOddsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl bg-slate-900 border border-slate-700 p-6 flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">ตารางของรางวัล & อัตราการดรอป (Odds Table)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOddsModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-3 flex-1 pr-1">
              <p className="text-xs text-slate-400 mb-2">
                ระบบใช้ขั้นตอนสุ่มแบบ Weighted Random Algorithm ฝั่งเซิร์ฟเวอร์แบบโปร่งใส 100%
                อัตราการได้รับของรางวัลคำนวณตามค่าน้ำหนักจริง:
              </p>

              {poolItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-10 h-10 rounded-lg object-contain bg-slate-900 p-1 border border-slate-700"
                    />
                    <div>
                      <h4 className="text-xs md:text-sm font-bold text-white">{item.title}</h4>
                      <p className="text-[11px] text-slate-400">{item.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <span className="text-xs md:text-sm font-black text-amber-400">
                        {item.probability_percent}%
                      </span>
                      <p className="text-[10px] text-amber-400/90 font-semibold">{item.value_text}</p>
                    </div>
                    {getRarityBadge(item.rarity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowOddsModal(false)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                รับทราบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GachaPage;
