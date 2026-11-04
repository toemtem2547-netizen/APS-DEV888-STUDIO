import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Trophy,
  History,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Copy,
  Gift,
  Crown,
  Volume2,
  VolumeX,
  Zap,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Info,
  Award,
  X,
  Eye,
  Shuffle,
  Gem,
  Dices,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { platformApi } from '../services/api';
import { WheelItem, WheelSpinResult, WheelHistoryItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useSettings } from '../context/SettingsContext';
import {
  playTickSound,
  playWinSound,
  playCardHoverSound,
  playCardSelectSound,
  playCardFlipSound,
  playCardShuffleSound,
  playLaserLockSound,
} from '../utils/audio';

// Ultra-Luxury Rarity Themes for Tarot Cards
const RARITY_THEME = {
  LEGENDARY: {
    label: 'LEGENDARY',
    badge: 'bg-amber-500/25 text-amber-300 border-amber-400/70 shadow-lg shadow-amber-500/30',
    border: 'border-amber-400',
    frontBg: 'from-[#221706] via-[#150e04] to-[#080b12]',
    glow: '0 0 50px rgba(245, 158, 11, 0.7), inset 0 0 25px rgba(245, 158, 11, 0.3)',
    textColor: 'text-amber-400',
    tagHex: '#F59E0B',
    haloColor: 'rgba(245, 158, 11, 0.25)',
  },
  EPIC: {
    label: 'EPIC',
    badge: 'bg-purple-500/25 text-purple-300 border-purple-400/70 shadow-lg shadow-purple-500/30',
    border: 'border-purple-400',
    frontBg: 'from-[#1b092a] via-[#11051b] to-[#080b12]',
    glow: '0 0 50px rgba(168, 85, 247, 0.7), inset 0 0 25px rgba(168, 85, 247, 0.3)',
    textColor: 'text-purple-400',
    tagHex: '#A855F7',
    haloColor: 'rgba(168, 85, 247, 0.25)',
  },
  RARE: {
    label: 'RARE',
    badge: 'bg-cyan-500/25 text-cyan-300 border-cyan-400/70 shadow-lg shadow-cyan-500/30',
    border: 'border-cyan-400',
    frontBg: 'from-[#071d2b] via-[#04121c] to-[#080b12]',
    glow: '0 0 50px rgba(56, 189, 248, 0.7), inset 0 0 25px rgba(56, 189, 248, 0.3)',
    textColor: 'text-cyan-400',
    tagHex: '#38BDF8',
    haloColor: 'rgba(56, 189, 248, 0.25)',
  },
  COMMON: {
    label: 'COMMON',
    badge: 'bg-slate-700/35 text-slate-300 border-slate-500/60',
    border: 'border-slate-500',
    frontBg: 'from-[#141b2b] via-[#0d121c] to-[#080b12]',
    glow: '0 0 30px rgba(148, 163, 184, 0.3), inset 0 0 15px rgba(148, 163, 184, 0.15)',
    textColor: 'text-slate-300',
    tagHex: '#94A3B8',
    haloColor: 'rgba(148, 163, 184, 0.15)',
  },
};

const resolveGamingGearImage = (name: string, url?: string): string => {
  if (url && url.trim() !== '' && url !== '/images/packages/tier1.jpg' && url !== '/images/rewards/headset.png') {
    return url;
  }

  const n = (name || '').toLowerCase();
  let assetPath = '';

  if (n.includes('salt') || n.includes('เกลือ') || n.includes('ลองใหม่อีกครั้ง')) assetPath = '/images/rewards/salt.png';
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

  return assetPath;
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

const DEFAULT_INITIAL_ITEMS: WheelItem[] = [
  { id: 1, reward_id: 1, label: '1,000 COINS', subtitle: 'แจ็กพอตใหญ่', icon_url: '/images/packages/tier4.jpg', color: '#F59E0B', text_color: '#FFFFFF', rarity: 'LEGENDARY', weight: 25, is_active: true, sort_order: 1, probability_percent: 2.5 },
  { id: 2, reward_id: 2, label: 'หูฟังเกมมิ่ง RGB', subtitle: 'Cyber Headset', icon_url: '/images/rewards/headset.png', color: '#A855F7', text_color: '#FFFFFF', rarity: 'EPIC', weight: 66, is_active: true, sort_order: 2, probability_percent: 6.67 },
  { id: 3, reward_id: 3, label: '500 COINS', subtitle: 'เหรียญทองคุ้มค่า', icon_url: '/images/packages/tier3.jpg', color: '#06B6D4', text_color: '#FFFFFF', rarity: 'RARE', weight: 83, is_active: true, sort_order: 3, probability_percent: 8.33 },
  { id: 4, reward_id: 4, label: 'คีย์บอร์ดเกมมิ่ง', subtitle: 'Mechanical RGB', icon_url: '/images/rewards/keyboard.png', color: '#A855F7', text_color: '#FFFFFF', rarity: 'EPIC', weight: 50, is_active: true, sort_order: 4, probability_percent: 5.0 },
];

interface DeckCardSlot {
  id: number;
  item: WheelItem;
  isPicked: boolean;
  isFlipped: boolean;
  rotationOffset: number;
}

export const WheelPage: React.FC = () => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { balance, openTopupModal, refreshBalance } = useWallet();
  const { settings } = useSettings();

  // Core Data
  const [items, setItems] = useState<WheelItem[]>(DEFAULT_INITIAL_ITEMS);
  const [costPerSpin, setCostPerSpin] = useState<number>(20);
  const [remainingFreeSpins, setRemainingFreeSpins] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 4 Interactive Tarot Cards (Pre-populated so cards immediately animate down without blank screen)
  const [cards, setCards] = useState<DeckCardSlot[]>(() =>
    [0, 1, 2, 3].map((slotIdx) => {
      const rotationOffset = slotIdx === 0 ? -3.5 : slotIdx === 1 ? -1.2 : slotIdx === 2 ? 1.2 : 3.5;
      return {
        id: slotIdx,
        item: DEFAULT_INITIAL_ITEMS[slotIdx],
        isPicked: false,
        isFlipped: false,
        rotationOffset,
      };
    })
  );
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);
  const [highlightedCardId, setHighlightedCardId] = useState<number | null>(null);
  const [revealedRound, setRevealedRound] = useState<boolean>(false);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [swappingCardIds, setSwappingCardIds] = useState<number[]>([]);
  const [isInitialDealing, setIsInitialDealing] = useState<boolean>(true);

  // Initial entrance dealing sounds cascade (เสียงสไลด์แจกไพ่ 4 ใบลงช่องตามลำดับ)
  useEffect(() => {
    const soundTimers: any[] = [];
    [120, 260, 400, 540].forEach((ms) => {
      const t = setTimeout(() => {
        if (soundEnabled) {
          playCardHoverSound();
        }
      }, ms);
      soundTimers.push(t);
    });

    const dealTimer = setTimeout(() => {
      setIsInitialDealing(false);
    }, 1100);

    return () => {
      soundTimers.forEach(clearTimeout);
      clearTimeout(dealTimer);
    };
  }, []);

  // Atomic Execution Lock (Prevents double clicks, spamming, and race conditions)
  const isExecutingRef = useRef<boolean>(false);

  // Modals & Inspection
  const [winningResult, setWinningResult] = useState<WheelSpinResult | null>(null);
  const [showWinModal, setShowWinModal] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [inspectedItem, setInspectedItem] = useState<WheelItem | null>(null);
  const [showOddsModal, setShowOddsModal] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // History Data
  const [historyList, setHistoryList] = useState<WheelHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  const scrollToVaultRewards = () => {
    const el = document.getElementById('vault-rewards-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // ฟังก์ชันสลับตำแหน่งไพ่ 2 ใบใน Array จริงๆ แบบรวดเร็วฉับไว คล่องแคล่ว
  const performPhysicalSwap = async (idxA: number, idxB: number) => {
    setCards((prev) => {
      if (idxA >= prev.length || idxB >= prev.length) return prev;
      const cardA = prev[idxA];
      const cardB = prev[idxB];
      setSwappingCardIds([cardA.id, cardB.id]);

      const next = [...prev];
      next[idxA] = cardB;
      next[idxB] = cardA;
      return next;
    });

    if (soundEnabled) {
      playCardHoverSound();
    }

    // สลับรวดเร็ว สปีดสูง (170ms) ไม่ต้องรอนาน
    await new Promise((r) => setTimeout(r, 170));
    setSwappingCardIds([]);
  };

  // Initialize or deal 4 fresh cards with LIGHTNING FAST PHYSICAL SWAP
  const dealNewCards = async (pool: WheelItem[] = items) => {
    if (pool.length === 0 || isExecutingRef.current) return;
    isExecutingRef.current = true;
    setIsShuffling(true);
    setWinningResult(null);
    setHighlightedCardId(null);
    setHoveredCardId(null);
    setErrorMessage(null);

    // If cards were already flipped, flip them down first
    if (revealedRound || cards.some((c) => c.isFlipped)) {
      setCards((prev) => prev.map((c) => ({ ...c, isFlipped: false, isPicked: false })));
      await new Promise((r) => setTimeout(r, 220));
    }
    setRevealedRound(false);

    if (soundEnabled) {
      playCardShuffleSound();
    }

    // ═══ LIGHTNING FAST 6-SWAP COMBO (สลับไวสะใจ 6 จังหวะรัวๆ) ═══
    await performPhysicalSwap(0, 1);
    await performPhysicalSwap(2, 3);
    await performPhysicalSwap(1, 2);
    await performPhysicalSwap(0, 3);
    await performPhysicalSwap(1, 3);
    await performPhysicalSwap(0, 2);

    // สุ่มของรางวัลใหม่ให้กับไพ่ที่สับเสร็จแล้ว
    const poolCopy = [...pool].sort(() => Math.random() - 0.5);
    const pickedItems: WheelItem[] = [];
    for (let i = 0; i < 4; i++) {
      if (poolCopy.length === 0) poolCopy.push(...pool);
      pickedItems.push(poolCopy.pop()!);
    }

    setCards((prev) =>
      prev.map((c, i) => ({
        ...c,
        item: pickedItems[i] || c.item,
        isPicked: false,
        isFlipped: false,
      }))
    );

    if (soundEnabled) {
      playCardSelectSound();
    }
    await new Promise((r) => setTimeout(r, 150));

    setIsShuffling(false);
    isExecutingRef.current = false;
  };

  // Fetch wheel pool
  const fetchPool = async () => {
    try {
      setLoading(true);
      const res = await platformApi.getWheelPool();
      if (res.data?.success) {
        const poolItems: WheelItem[] = res.data.data.items || [];
        setItems(poolItems);
        setCostPerSpin(res.data.data.costPerSpin || 20);
        setRemainingFreeSpins(res.data.data.remainingFreeSpins ?? 1);

        // Smoothly assign real pool items to the initial cards without triggering a slow shuffle state
        if (poolItems.length > 0) {
          const poolCopy = [...poolItems].sort(() => Math.random() - 0.5);
          setCards((prev) =>
            prev.map((c, idx) => ({
              ...c,
              item: poolCopy[idx % poolCopy.length] || c.item,
            }))
          );
        }
      }
    } catch (err: any) {
      console.error('Failed to load pool:', err);
      setErrorMessage(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลของรางวัลได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPool();
  }, [isAuthenticated]);

  // Fetch history
  const fetchHistory = async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingHistory(true);
      const res = await platformApi.getWheelHistory(30);
      if (res.data?.success) {
        setHistoryList(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (showHistory && isAuthenticated) {
      fetchHistory();
    }
  }, [showHistory, isAuthenticated]);

  // Unified, Rock-Solid Single Card Pick Execution (Zero-Bug Mutex Guard)
  const handleExecuteDraw = async (targetCardIndex?: number) => {
    // Strict Guard: Prevent any concurrent execution or double-click spam
    if (isExecutingRef.current || isSpinning || isShuffling || items.length === 0) {
      return;
    }

    // If round was already completed, clicking resets to a fresh hand cleanly
    if (revealedRound) {
      dealNewCards();
      return;
    }

    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    const freeToUse = Math.min(1, remainingFreeSpins);
    const paidSpins = 1 - freeToUse;
    const totalCost = paidSpins * costPerSpin;

    if (balance < totalCost) {
      openTopupModal();
      return;
    }

    try {
      isExecutingRef.current = true;
      setIsSpinning(true);
      setErrorMessage(null);

      // Determine target card: if user clicked button without picking card, choose one of the current visible cards
      const randomCard = cards[Math.floor(Math.random() * cards.length)];
      let chosenSlotId = targetCardIndex !== undefined ? targetCardIndex : randomCard.id;

      if (targetCardIndex === undefined) {
        // ขยายเวลาการสุ่มตื่นเต้นเร้าใจ (~2.8 - 3.0 วินาที) ค่อยๆ ชะลอความเร็วจนล็อกเป้า
        const totalRouletteSteps = 22;
        let stepDelay = 50;
        for (let i = 0; i < totalRouletteSteps; i++) {
          const currentCard = cards[i % cards.length];
          setHighlightedCardId(currentCard.id);
          if (soundEnabled) playTickSound();
          await new Promise((r) => setTimeout(r, stepDelay));

          // ค่อยๆ ชะลอจังหวะใน 10 สเต็ปสุดท้ายเพื่อลุ้นระทึก
          if (i >= totalRouletteSteps - 6) {
            stepDelay += 45; // ช่วงท้ายชะลอลงช้าๆ: 120ms -> 165ms -> 210ms -> 255ms -> 300ms
          } else if (i >= totalRouletteSteps - 12) {
            stepDelay += 14;
          }
        }

        // ล็อกเป้าหมายใบที่เลือกพร้อมเสียงล็อกเป้าเลเซอร์
        setHighlightedCardId(chosenSlotId);
        if (soundEnabled) playLaserLockSound();
        await new Promise((r) => setTimeout(r, 450));
      } else {
        // กรณีผู้เล่นกดจิ้มการ์ดโดยตรง: ลุ้นระทึกชาร์จพลังออร่า (~1.4 วินาที) ก่อนเปิด
        setHighlightedCardId(chosenSlotId);
        for (let i = 0; i < 5; i++) {
          if (soundEnabled) playTickSound();
          await new Promise((r) => setTimeout(r, 200));
        }
        if (soundEnabled) playLaserLockSound();
        await new Promise((r) => setTimeout(r, 380));
      }

      // Backend API call
      const res = await platformApi.spinWheel();
      if (!res.data?.success) {
        throw new Error(res.data?.message || 'การเปิดการ์ดล้มเหลว กรุณาลองใหม่อีกครั้ง');
      }

      const result: WheelSpinResult = res.data.data;
      setWinningResult(result);

      if (remainingFreeSpins > 0) {
        setRemainingFreeSpins((prev) => Math.max(0, prev - 1));
      } else {
        refreshBalance();
      }

      // Step 1: Assign winner to chosen slot and elevate card with highlight
      setCards((prevCards) =>
        prevCards.map((c) =>
          c.id === chosenSlotId
            ? { ...c, item: result.winningItem, isPicked: true }
            : { ...c, isPicked: false }
        )
      );

      if (soundEnabled) {
        playCardFlipSound();
      }

      // Step 2: 3D Flip chosen card
      await new Promise((r) => setTimeout(r, 450));
      setCards((prevCards) =>
        prevCards.map((c) => (c.id === chosenSlotId ? { ...c, isFlipped: true } : c))
      );

      if (soundEnabled) {
        playWinSound(result.winningItem.rarity, result.isSalt);
      }

      if (!result.isSalt) {
        confetti({
          particleCount: 200,
          spread: 95,
          origin: { y: 0.55 },
        });
      }

      // Step 3: Reveal the remaining cards
      await new Promise((r) => setTimeout(r, 750));
      setCards((prevCards) =>
        prevCards.map((c) => ({
          ...c,
          isFlipped: true,
        }))
      );

      setRevealedRound(true);
      refreshBalance();

      // Step 4: Show Win Modal
      setTimeout(() => {
        setShowWinModal(true);
      }, 550);
    } catch (err: any) {
      console.error('Card draw error:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการเปิดการ์ด');
    } finally {
      isExecutingRef.current = false;
      setIsSpinning(false);
      setHighlightedCardId(null);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const isFree = remainingFreeSpins > 0;
  const currentCost = isFree ? 0 : costPerSpin;
  const totalWeight = useMemo(() => items.reduce((sum, it) => sum + (it.weight || 0), 0), [items]);

  // Dynamic card 3D posture based on current display slot position
  const getCardTransform = (slot: DeckCardSlot, displayIndex: number) => {
    const rotationOffsets = [-3.5, -1.2, 1.2, 3.5];
    const targetRot = rotationOffsets[displayIndex] ?? 0;
    const isHovered = hoveredCardId === slot.id && !isSpinning && !revealedRound && !isShuffling;
    const isHighlighted = highlightedCardId === slot.id;
    const isSwapping = swappingCardIds.includes(slot.id);

    return `rotate(${slot.isPicked ? 0 : targetRot}deg) translateY(${
      isSwapping ? '-24px' : isHovered ? '-16px' : slot.isPicked ? '-20px' : isHighlighted ? '-10px' : '0px'
    }) scale(${isSwapping ? 1.07 : isHovered ? 1.04 : slot.isPicked ? 1.06 : isHighlighted ? 1.03 : 1})`;
  };

  if (settings.game_wheel_enabled === 'false') {
    return (
      <div className="min-h-screen bg-[#07090D] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#10141E] border border-cyan-500/30 rounded-3xl p-8 text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 mx-auto flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20">
            <AlertCircle className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              ระบบกำลังปิดปรับปรุงชั่วคราว
            </span>
            <h2 className="text-xl font-black text-white">{settings.game_wheel_title || 'เปิดการ์ด 3D เสี่ยงโชค'}</h2>
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
    <div className="min-h-screen bg-[#07090E] text-white pt-16 sm:pt-20 md:pt-20 pb-16 selection:bg-amber-500 selection:text-black relative overflow-x-hidden font-sans">
      {/* High-End Cosmic Stage Lighting Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[650px] bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.2)_0%,rgba(168,85,247,0.12)_45%,transparent_75%)]" />
        <div className="absolute top-1/4 left-5 w-[650px] h-[650px] bg-cyan-600/12 rounded-full blur-[160px]" />
        <div className="absolute top-1/4 right-5 w-[650px] h-[650px] bg-amber-600/12 rounded-full blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:28px_28px] opacity-35" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-5">

        {/* ═══ Top Modern Hero Header ═══ */}
        <div className="text-center max-w-5xl mx-auto space-y-2 pt-1">

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-normal">
            {settings.game_wheel_title || 'เลือกเปิดการ์ดนำโชค Pick a Card 3D'}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 max-w-5xl mx-auto leading-relaxed text-center">
            {settings.game_wheel_subtitle || 'เลือกการ์ดใบที่คุณเชื่อมั่นด้วยตัวเอง หรือกดปุ่มสุ่มอัตโนมัติ ลุ้นรับสกินอาวุธ ไอเทมระดับตำนาน และโค้ดรางวัลพรีเมียม'}
          </p>
        </div>

        {/* ═══ WIDE-STAGE 3D TAROT ARENA ═══ */}
        <div className="relative w-full mx-auto">
          {errorMessage && (
            <div className="mb-3 mx-auto p-3 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center justify-center gap-2 max-w-md shadow-lg backdrop-blur-xl animate-bounce">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* MASTER STAGE CASING */}
          <div className="relative rounded-3xl p-4 sm:p-6 md:p-8 bg-[#0A0E18]/90 border border-amber-500/30 shadow-[0_0_80px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-2xl">

            {/* Top Info Bar */}
            <div className="flex items-center justify-between px-3.5 py-2 mb-3 sm:mb-4 rounded-2xl bg-white/[0.03] border border-white/5 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSpinning || isShuffling ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`} />
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isSpinning || isShuffling ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                </span>
                <span className="font-mono text-[11px] sm:text-xs font-bold text-zinc-300 tracking-wider">
                  {isShuffling
                    ? 'กำลังสับไพ่และสลับตำแหน่ง...'
                    : revealedRound
                      ? 'เฉลยการ์ดทั้งหมดแล้ว • กดสับไพ่ใหม่เพื่อเปิดรอบถัดไป'
                      : isSpinning
                        ? 'กำลังเปิดเผยชะตารางวัล...'
                        : 'จิ้มเลือกการ์ด 1 ใบด้านล่าง หรือกดปุ่มสุ่มอัตโนมัติ'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Sound Toggle Button */}
                <button
                  type="button"
                  onClick={() => {
                    const next = !soundEnabled;
                    setSoundEnabled(next);
                    if (next) playCardSelectSound();
                  }}
                  className={`px-2.5 py-1 rounded-xl font-bold text-xs border flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
                    soundEnabled
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                      : 'bg-white/5 text-zinc-400 border-white/10 hover:text-zinc-300'
                  }`}
                  title={soundEnabled ? 'เปิดเสียงเอฟเฟกต์ไพ่ (คลิกเพื่อปิด)' : 'ปิดเสียงเอฟเฟกต์ (คลิกเพื่อเปิด)'}
                >
                  {soundEnabled ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">เปิดเสียง</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="hidden sm:inline">ปิดเสียง</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isSpinning || isShuffling}
                  onClick={() => dealNewCards()}
                  className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-amber-300 font-bold text-xs border border-white/10 flex items-center gap-1.5 transition active:scale-95 hover:border-amber-500/40 cursor-pointer disabled:opacity-50"
                  title="สับไพ่และแจกการ์ดชุดใหม่"
                >
                  <Shuffle className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin text-amber-400' : ''}`} />
                  <span>{isShuffling ? 'กำลังสับไพ่...' : 'สับไพ่ใหม่'}</span>
                </button>
              </div>
            </div>

            {/* ═══ 4 BALANCED 3D TAROT CARDS (PROPORTIONED TO FIT SCREEN) ═══ */}
            <div className="py-4 sm:py-6 px-4 sm:px-8 md:px-12 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 justify-items-center">
              {cards.map((slot, displayIndex) => {
                const conf = RARITY_THEME[slot.item.rarity as keyof typeof RARITY_THEME] || RARITY_THEME.COMMON;
                const isHovered = hoveredCardId === slot.id && !isSpinning && !revealedRound && !isShuffling;
                const isHighlighted = highlightedCardId === slot.id;
                const isSwapping = swappingCardIds.includes(slot.id);

                return (
                  <motion.div
                    layout
                    key={`card-slot-${slot.id}`}
                    initial={{ opacity: 0, y: -240, scale: 0.88 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      delay: isInitialDealing ? displayIndex * 0.14 : 0,
                      duration: 0.5,
                      ease: [0.16, 1, 0.3, 1],
                      layout: {
                        type: 'spring',
                        stiffness: 440,
                        damping: 28,
                        mass: 0.65,
                      },
                    }}
                    className="w-full flex justify-center"
                    style={{
                      zIndex: isSwapping ? 35 : 10,
                    }}
                  >
                    <div
                      onMouseEnter={() => {
                        if (!isSpinning && !revealedRound && !isShuffling) {
                          setHoveredCardId(slot.id);
                          if (soundEnabled) playCardHoverSound();
                        }
                      }}
                      onMouseLeave={() => setHoveredCardId(null)}
                      onClick={() => {
                        if (!isShuffling) {
                          if (soundEnabled) playCardSelectSound();
                          handleExecuteDraw(slot.id);
                        }
                      }}
                      style={{
                        transformStyle: 'preserve-3d',
                        transform: getCardTransform(slot, displayIndex),
                        transition: isShuffling
                          ? 'all 0.16s cubic-bezier(0.2, 1, 0.4, 1)'
                          : 'all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
                      }}
                      className={`w-full max-w-[220px] sm:max-w-[240px] md:max-w-[250px] lg:max-w-[260px] h-[310px] sm:h-[335px] md:h-[355px] lg:h-[365px] rounded-2xl sm:rounded-3xl relative cursor-pointer select-none ${
                        slot.isPicked
                          ? 'z-30 shadow-[0_0_50px_rgba(245,158,11,0.9)]'
                          : isHovered
                          ? 'z-20 shadow-[0_0_35px_rgba(245,158,11,0.6)]'
                          : isHighlighted
                          ? 'z-20 shadow-[0_0_35px_rgba(56,189,248,0.7)]'
                          : isSwapping
                          ? 'z-30 shadow-[0_0_40px_rgba(245,158,11,0.85)]'
                          : 'z-10 shadow-xl'
                      }`}
                    >
                      {/* Inner 3D Flipping Card Body */}
                      <div
                        style={{
                          transformStyle: 'preserve-3d',
                          transform: slot.isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                          transition: 'transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        className="w-full h-full relative rounded-2xl sm:rounded-3xl"
                      >
                        {/* ═══ CARD BACK (GEN-IMAGE LUXURY HOLOGRAPHIC ARTWORK) ═══ */}
                        <div
                          style={{
                            backfaceVisibility: 'hidden',
                          }}
                          className={`absolute inset-0 rounded-2xl sm:rounded-3xl border-2 ${isHovered || isHighlighted
                              ? 'border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.6)]'
                              : 'border-amber-500/40'
                            } overflow-hidden bg-black transition-all`}
                        >
                          {/* High-Resolution Tarot Card Back Illustration */}
                          <img
                            src={settings.game_wheel_card_back || '/images/tarot_card_back.jpg'}
                            alt={`Card Back #${slot.id + 1}`}
                            className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-105 filter brightness-110' : 'filter brightness-95'
                              }`}
                          />

                          {/* Glossy Sheen Overlay on Hover */}
                          <div
                            className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent transition-opacity duration-300 pointer-events-none ${isHovered || isHighlighted ? 'opacity-100' : 'opacity-0'
                              }`}
                          />

                          {/* Bottom Interactive Hover Prompt */}
                          <div className="absolute bottom-2 sm:bottom-2.5 inset-x-0 flex justify-center z-10 px-2.5">
                            <span
                              className={`w-full py-1.5 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-center transition-all ${isHovered
                                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md scale-105'
                                  : isHighlighted
                                    ? 'bg-cyan-400 text-slate-950 shadow-md scale-105'
                                    : 'bg-slate-950/80 text-zinc-300 border border-white/10 backdrop-blur-sm'
                                }`}
                            >
                              {isHovered ? 'คลิกเลือกใบนี้!' : isHighlighted ? 'กำลังเล็ง...' : 'แตะเพื่อเปิด'}
                            </span>
                          </div>
                        </div>

                        {/* ═══ CARD FRONT (REVEALED PRIZE WITH HOLOGRAPHIC GLOW) ═══ */}
                        <div
                          style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                          }}
                          className={`absolute inset-0 rounded-2xl sm:rounded-3xl border-2 ${conf.border} bg-gradient-to-b ${conf.frontBg
                            } p-3 sm:p-4 flex flex-col justify-between items-center text-center shadow-2xl overflow-hidden ${revealedRound && !slot.isPicked ? 'opacity-55 grayscale-[20%]' : 'opacity-100'
                            }`}
                        >
                          {/* Winner Halo Burst */}
                          {slot.isPicked && (
                            <div
                              className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none"
                              style={{
                                background: `radial-gradient(circle at center, ${conf.haloColor} 0%, transparent 70%)`,
                              }}
                            />
                          )}

                          {/* Top Front Info Header */}
                          <div className="w-full flex items-center justify-between gap-1 z-10">
                            <span className={`text-[8.5px] sm:text-[9.5px] px-2 py-0.5 rounded-md font-black tracking-wider uppercase border ${conf.badge}`}>
                              {slot.item.rarity}
                            </span>
                            {slot.isPicked ? (
                              <span className="text-[8.5px] sm:text-[9.5px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black animate-pulse shadow-md">
                                ★ ของรางวัลคุณ!
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono text-zinc-400">
                                {slot.item.probability_percent}%
                              </span>
                            )}
                          </div>

                          {/* Center Item Floating Art with Ambient Shadow */}
                          <div className="relative my-auto w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex items-center justify-center z-10">
                            <div
                              className="absolute inset-1 rounded-full blur-xl opacity-35 pointer-events-none"
                              style={{ backgroundColor: conf.tagHex }}
                            />
                            <img
                              src={slot.item.icon_url}
                              alt={slot.item.label}
                              className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)] relative z-10 transform group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/packages/tier1.jpg';
                              }}
                            />
                          </div>

                          {/* Item Label & Subtitle */}
                          <div className="w-full space-y-0.5 z-10">
                            <div className="font-black text-white text-xs sm:text-sm truncate leading-tight">
                              {slot.item.label}
                            </div>
                            <div className="text-[10px] text-zinc-400 truncate">
                              {slot.item.subtitle || 'ของรางวัลล้ำค่า'}
                            </div>
                          </div>

                          {/* Bottom Chance Tag */}
                          <div className="w-full pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-400 z-10">
                            <span>โอกาสได้</span>
                            <span className="font-mono font-bold text-amber-400">
                              {slot.item.probability_percent}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* ═══ MODERN CONTROL BAR (SINGLE ACTION BUTTON + REAL SHUFFLE) ═══ */}
            <div className="mt-4 sm:mt-5 pt-3.5 sm:pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                type="button"
                disabled={isSpinning || isShuffling}
                onClick={() => dealNewCards()}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-lg hover:border-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
                title="สับไพ่ในสำรับและแจกชุดใหม่"
              >
                <RotateCcw className={`w-4 h-4 text-amber-400 ${isShuffling ? 'animate-spin' : ''}`} />
                <span>{isShuffling ? 'กำลังสับไพ่ในสำรับ...' : 'สับไพ่ใหม่'}</span>
              </button>

              {/* Center/Main: SINGLE UNIFIED MASTER BUTTON */}
              <button
                type="button"
                onClick={() => {
                  if (revealedRound) {
                    dealNewCards();
                  } else {
                    if (soundEnabled) playCardSelectSound();
                    handleExecuteDraw();
                  }
                }}
                disabled={isSpinning || isShuffling || items.length === 0}
                className={`w-full sm:w-auto min-w-[280px] px-8 py-3.5 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-3 transition-all duration-200 transform shadow-2xl relative overflow-hidden cursor-pointer ${isSpinning || isShuffling
                    ? 'bg-slate-800 text-zinc-400 border border-white/10 cursor-not-allowed opacity-90'
                    : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 border-2 border-amber-300 shadow-[0_0_40px_rgba(245,158,11,0.5)] hover:shadow-[0_0_60px_rgba(245,158,11,0.8)] active:scale-95'
                  }`}
              >
                {revealedRound ? (
                  <>
                    <RotateCcw className="w-5 h-5 text-slate-950" />
                    <div className="flex flex-col items-start leading-tight">
                      <span className="tracking-wide">แจกไพ่รอบใหม่ (Deal Next Hand)</span>
                      <span className="text-[11px] font-mono font-bold opacity-85">
                        สับไพ่เพื่อเปิดรอบต่อไป
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <Crown
                      className={`w-5 h-5 ${isSpinning ? 'text-zinc-500 animate-spin' : 'text-slate-950 fill-slate-950'
                        }`}
                    />
                    <div className="flex flex-col items-start leading-tight">
                      <span className="tracking-wide">
                        {isSpinning ? 'กำลังเปิดเผยการ์ด...' : 'สุ่มเปิดการ์ดนำโชค'}
                      </span>
                      <span className="text-[11px] font-mono font-bold opacity-85">
                        {isFree ? '🎁 สิทธิ์ฟรีประจำวัน' : `ใช้ ${currentCost} COINS`}
                      </span>
                    </div>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Links: See All Rewards & History (Gacha System Style) */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-3">
          <button
            type="button"
            onClick={scrollToVaultRewards}
            className="group text-xs sm:text-sm text-amber-400/90 hover:text-amber-300 font-semibold flex items-center gap-1.5 transition underline-offset-4 hover:underline cursor-pointer"
          >
            <Award className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>ดูของรางวัลทั้งหมด & อัตราการดรอป (Drop Rates)</span>
            <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </button>

          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs sm:text-sm text-slate-400 hover:text-white font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <History className="w-4 h-4 text-amber-400/80" />
              <span>ประวัติการเปิดการ์ดของคุณ</span>
              {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* ========================================================================= */}
        {/* USER CARD HISTORY SECTION (COLLAPSIBLE - GACHA STYLE) */}
        {/* ========================================================================= */}
        {showHistory && (
          <div className="w-full my-6 p-5 sm:p-6 rounded-2xl bg-slate-900/85 border border-slate-800 backdrop-blur-xl animate-fade-in shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                ประวัติการเปิดการ์ดของคุณ (Your Card Records)
              </h2>
              <button
                type="button"
                onClick={fetchHistory}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> รีเฟรช
              </button>
            </div>

            {loadingHistory ? (
              <div className="text-center py-6 text-slate-400 text-sm">กำลังโหลดประวัติ...</div>
            ) : historyList.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                คุณยังไม่มีประวัติการเปิดการ์ด เลือกการ์ดเพื่อรับรางวัลชิ้นแรกเลย!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-3 font-semibold">รางวัลที่ได้รับ</th>
                      <th className="pb-3 font-semibold">ระดับความหายาก</th>
                      <th className="pb-3 font-semibold">ประเภทการสุ่ม</th>
                      <th className="pb-3 font-semibold">โค้ดรางวัล</th>
                      <th className="pb-3 font-semibold text-right">เวลา</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {historyList.map((hist) => (
                      <tr key={hist.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 flex items-center gap-2 font-medium text-white">
                          <img
                            src={resolveGamingGearImage(hist.label, hist.icon_url)}
                            alt={hist.label}
                            className="w-8 h-8 rounded-lg object-contain bg-slate-800 p-1 border border-slate-700"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/packages/tier1.jpg';
                            }}
                          />
                          <span className="truncate max-w-[200px]">{hist.label}</span>
                        </td>
                        <td className="py-3">{getRarityBadge(hist.rarity)}</td>
                        <td className="py-3">
                          {hist.spin_type === 'FREE_DAILY' ? (
                            <span className="text-amber-400 font-semibold">🎟️ ฟรีประจำวัน</span>
                          ) : (
                            <span className="text-slate-300">฿{hist.spin_cost} Coins</span>
                          )}
                        </td>
                        <td className="py-3">
                          {hist.reward_code ? (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-amber-300">
                              <span>{hist.reward_code}</span>
                              <button
                                onClick={() => handleCopyCode(hist.reward_code!)}
                                className="hover:text-white p-0.5"
                                title="คัดลอกโค้ด"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
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
        {/* ALL REWARDS POOL PREVIEW GRID (MATCHING GACHA SYSTEM EXACTLY) */}
        {/* ========================================================================= */}
        <div id="vault-rewards-section" className="mt-14 sm:mt-18 pt-12 border-t border-slate-800/80 scroll-mt-20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-2">
              <Trophy className="w-3.5 h-3.5" />
              <span>VAULT PRIZE POOL</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white flex items-center justify-center gap-2">
              <span>ของรางวัลทั้งหมดในสำรับ (All Vault Items)</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-xl mx-auto">
              การันตีได้รับของรางวัลแท้ 100% ทุกครั้งที่เปิด สุ่มออกตามอัตราความน่าจะเป็นที่โปร่งใส (Provably Fair)
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
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => setInspectedItem(item)}
                className={`cursor-pointer rounded-xl border bg-slate-900/60 backdrop-blur p-4 flex flex-col items-center text-center transition hover:scale-[1.02] ${getCardBorderClass(
                  item.rarity
                )}`}
              >
                <div className="w-full flex items-center justify-between mb-2">
                  {getRarityBadge(item.rarity)}
                  <span className="text-[11px] font-bold text-amber-400">
                    โอกาส {item.probability_percent || '0.00'}%
                  </span>
                </div>

                {/* Product Showcase (Natural Rectangular Container matching Gacha) */}
                <div className="w-full h-24 my-2 flex items-center justify-center p-1">
                  <img
                    src={resolveGamingGearImage(item.label, item.icon_url)}
                    alt={item.label}
                    className="max-h-full max-w-full object-contain filter drop-shadow-[0_4px_14px_rgba(0,0,0,0.7)]"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/packages/tier1.jpg';
                    }}
                  />
                </div>

                <h4 className="font-bold text-white text-sm line-clamp-2 leading-tight mt-1 mb-1">
                  {item.label}
                </h4>
                <p className="text-xs text-slate-400 mb-3">{item.subtitle || 'ของรางวัลในการ์ดนำโชค'}</p>

                <div className="mt-auto w-full pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">มูลค่าของขวัญ</span>
                  <span className="text-amber-400 font-bold">
                    {(item.reward_type === 'SALT' || item.label.includes('เกลือ') || item.label.includes('ลองใหม่'))
                      ? 'ไม่มีมูลค่า'
                      : (item.reward_value || item.subtitle || 'รางวัลพิเศษ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ SINGLE WIN CELEBRATION MODAL ═══ */}
      <AnimatePresence>
        {showWinModal && winningResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              className="relative w-full max-w-md rounded-3xl bg-[#0D121F] border border-amber-500/40 p-6 sm:p-8 text-center shadow-[0_0_80px_rgba(245,158,11,0.3)] space-y-6 overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.2)_0%,transparent_70%)] pointer-events-none" />

              <div className="space-y-1 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg">
                  <Sparkles className="w-3.5 h-3.5" />
                  {winningResult.isSalt ? 'ผลการเปิดการ์ด' : 'ยินดีด้วย! คุณได้รับรางวัล'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white pt-2 tracking-tight">
                  {winningResult.winningItem.label}
                </h2>
                <p className="text-xs text-zinc-400">
                  {winningResult.winningItem.subtitle || 'สุ่มได้จากการ์ดนำโชค Mystery Tarot'}
                </p>
              </div>

              {/* Prize Visual */}
              <div className="relative mx-auto w-36 h-36 rounded-3xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 p-3 flex items-center justify-center shadow-inner group">
                <div className="absolute inset-0 rounded-3xl bg-amber-400/10 blur-xl pointer-events-none" />
                <img
                  src={winningResult.winningItem.icon_url || '/images/packages/tier1.jpg'}
                  alt={winningResult.winningItem.label}
                  className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(245,158,11,0.5)] relative z-10"
                />
              </div>

              {/* Code details if redeemable */}
              {winningResult.rewardCode && !winningResult.isSalt && (
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 relative z-10">
                  <div className="text-[11px] text-zinc-400">รหัสโค้ดรางวัล (Redeem Code)</div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono font-bold text-amber-400 text-base tracking-wider">
                      {winningResult.rewardCode}
                    </span>
                    <button
                      onClick={() => handleCopyCode(winningResult.rewardCode)}
                      className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
                      title="คัดลอกโค้ด"
                    >
                      {copiedCode ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {copiedCode && (
                    <div className="text-[11px] text-emerald-400 font-bold">คัดลอกรหัสเรียบร้อยแล้ว!</div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 pt-2 relative z-10">
                <button
                  onClick={() => {
                    setShowWinModal(false);
                    dealNewCards();
                  }}
                  className="w-full py-3.5 rounded-2xl font-black text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/25 transition-transform active:scale-95"
                >
                  รับรางวัล & แจกไพ่ใหม่
                </button>

                {!winningResult.isSalt && (
                  <Link
                    to="/inventory"
                    className="w-full py-2.5 rounded-2xl font-bold text-xs text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition"
                  >
                    ไปที่คลังไอเทมของฉัน
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ INSPECTED ITEM DETAIL MODAL ═══ */}
      <AnimatePresence>
        {inspectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm rounded-3xl bg-[#0D121F] border border-white/10 p-6 text-center space-y-5"
            >
              <button
                onClick={() => setInspectedItem(null)}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-24 h-24 mx-auto rounded-3xl bg-white/5 border border-white/10 p-3 flex items-center justify-center">
                <img
                  src={resolveGamingGearImage(inspectedItem.label, inspectedItem.icon_url)}
                  alt={inspectedItem.label}
                  className="max-h-full max-w-full object-contain filter drop-shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/packages/tier1.jpg';
                  }}
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {inspectedItem.rarity}
                </span>
                <h3 className="text-xl font-black text-white pt-2">{inspectedItem.label}</h3>
                <p className="text-xs text-zinc-400">{inspectedItem.subtitle || 'ของรางวัลในการ์ดนำโชค'}</p>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs">
                <span className="text-zinc-400">โอกาสดรอป:</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {inspectedItem.probability_percent || '0.00'}%
                </span>
              </div>

              <button
                onClick={() => setInspectedItem(null)}
                className="w-full py-3 rounded-2xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* ODDS & DROP RATE MODAL (GACHA SYSTEM STYLE) */}
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
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-3 flex-1 pr-1">
              <p className="text-xs text-slate-400 mb-2">
                ระบบใช้ขั้นตอนสุ่มแบบ Provably Fair Weighted Random Algorithm ฝั่งเซิร์ฟเวอร์แบบโปร่งใส 100%
                อัตราการได้รับของรางวัลคำนวณตามค่าน้ำหนักจริง:
              </p>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={resolveGamingGearImage(item.label, item.icon_url)}
                      alt={item.label}
                      className="w-10 h-10 rounded-lg object-contain bg-slate-900 p-1 border border-slate-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/packages/tier1.jpg';
                      }}
                    />
                    <div>
                      <h4 className="text-xs md:text-sm font-bold text-white">{item.label}</h4>
                      <p className="text-[11px] text-slate-400">{item.subtitle || 'ของรางวัล'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <span className="text-xs md:text-sm font-black text-amber-400">
                        {item.probability_percent || '0.00'}%
                      </span>
                      <p className="text-[10px] text-amber-400/90 font-semibold">
                        {(item.reward_type === 'SALT' || item.label.includes('เกลือ') || item.label.includes('ลองใหม่'))
                          ? 'เกลือ'
                          : (item.reward_value || item.subtitle || 'ของรางวัล')}
                      </p>
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
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
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

export default WheelPage;
