import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Home, Info, Minus, Plus, RefreshCw, Volume2, VolumeX, X, Zap, Crown, Trophy } from 'lucide-react';
import { platformApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useSettings } from '../context/SettingsContext';
import { playTickSound, playWinSound, playChestUnlockSound } from '../utils/audio';

/* ------------------------------------------------------------------ */
/*  Symbol definitions                                                 */
/* ------------------------------------------------------------------ */
type Sym = 'WILD' | 'SCATTER' | 'CAT' | 'CHEST' | 'HAT' | 'BAG' | 'A' | 'K' | 'Q' | 'J' | 'TEN';

const IMG = '/images/slots';
const SYMBOLS: Record<Sym, { img?: string; label: string; name: string; from?: string; to?: string; glow?: string }> = {
  WILD: { img: `${IMG}/sym_wild.jpg`, label: 'WILD', name: 'Vault Wild' },
  SCATTER: { img: `${IMG}/sym_scatter.jpg`, label: 'SCATTER', name: 'Diamond Scatter' },
  CAT: { img: `${IMG}/sym_cat.jpg`, label: 'BOSS', name: 'Cat Boss' },
  CHEST: { img: `${IMG}/sym_chest.jpg`, label: 'CHEST', name: 'Treasure Chest' },
  HAT: { img: `${IMG}/sym_hat.jpg`, label: 'HAT', name: 'Fedora' },
  BAG: { img: `${IMG}/sym_bag.jpg`, label: 'BAG', name: 'Money Bag' },
  A: { img: `${IMG}/sym_a.jpg`, label: 'A', name: 'Ace', from: '#FFE27A', to: '#F07A0C', glow: '#F59E0B' },
  K: { img: `${IMG}/sym_k.svg`, label: 'K', name: 'King', from: '#FF8A8A', to: '#C0121F', glow: '#EF4444' },
  Q: { img: `${IMG}/sym_q.svg`, label: 'Q', name: 'Queen', from: '#9BFFB8', to: '#0A9F4C', glow: '#22C55E' },
  J: { img: `${IMG}/sym_j.svg`, label: 'J', name: 'Jack', from: '#9CD3FF', to: '#1B5FD9', glow: '#3B82F6' },
  TEN: { img: `${IMG}/sym_10.svg`, label: '10', name: 'Ten', from: '#F7A8FF', to: '#9A1FD1', glow: '#C026D3' },
};
const ALL_SYMS = Object.keys(SYMBOLS) as Sym[];
const VISUAL_WEIGHTS: Record<Sym, number> = { WILD: 3, SCATTER: 2, CAT: 3, CHEST: 4, HAT: 5, BAG: 6, A: 10, K: 11, Q: 12, J: 13, TEN: 14 };
const LINE_COLORS = ['#FACC15', '#F43F5E', '#22D3EE', '#A3E635', '#E879F9', '#FB923C', '#60A5FA', '#34D399', '#F472B6', '#FDE047', '#C084FC', '#4ADE80', '#F87171', '#38BDF8', '#FBBF24', '#A78BFA', '#2DD4BF', '#FB7185', '#93C5FD', '#FCD34D'];

const randomSym = (): Sym => {
  const total = ALL_SYMS.reduce((s, k) => s + VISUAL_WEIGHTS[k], 0);
  let r = Math.random() * total;
  for (const k of ALL_SYMS) { if (r < VISUAL_WEIGHTS[k]) return k; r -= VISUAL_WEIGHTS[k]; }
  return 'TEN';
};
const randomGrid = (): Sym[][] => Array.from({ length: 5 }, () => Array.from({ length: 3 }, randomSym));

interface LineWin { lineIndex: number; symbol: Sym; count: number; positions: [number, number][]; amount: number }
interface SpinResult {
  grid: Sym[][]; lineWins: LineWin[]; scatterCount: number; scatterPositions: [number, number][]; scatterWin: number;
  bet: number; isFreeSpin: boolean; multiplier: number; totalWin: number; jackpotWin: number; isJackpot: boolean;
  jackpotPool: number; freeSpinsAwarded: number; freeSpinsRemaining: number; freeSpinTotalWin: number; newWalletBalance: number;
}
interface SlotConfig {
  isEnabled: boolean; bets: number[]; jackpotPool: number; paylines: number[][];
  paytable: Record<string, [number, number, number]>; scatterPays: Record<string, { multiplier: number; freeSpins: number }>;
  freeSpinMultiplier: number; freeSpinsRemaining: number; freeSpinBet: number;
}

const fmt = (n: number, d = 2) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

/* ------------------------------------------------------------------ */
/*  Count-up hook                                                      */
/* ------------------------------------------------------------------ */
function useCountUp(target: number, duration = 900) {
  const [val, setVal] = useState(target);
  const fromRef = useRef(target);
  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = from + (target - from) * eased;
      setVal(v);
      fromRef.current = v;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

/* ------------------------------------------------------------------ */
/*  Symbol tile                                                        */
/* ------------------------------------------------------------------ */
const SymbolTile: React.FC<{ sym: Sym; win?: boolean; dim?: boolean; color?: string }> = ({ sym, win, dim, color }) => {
  const def = SYMBOLS[sym];
  const [imgOk, setImgOk] = useState(true);
  return (
    <div className="h-full w-full p-[5%]">
      <div
        className={`slot-tile relative h-full w-full rounded-[12%] overflow-hidden transition-all duration-300 ${win ? 'slot-tile-win' : ''} ${dim ? 'opacity-35 saturate-50' : ''}`}
        style={win ? ({ '--win-color': color || '#FACC15' } as React.CSSProperties) : undefined}
      >
        {def.img && imgOk ? (
          <img src={def.img} alt={def.name} draggable={false} onError={() => setImgOk(false)} className="absolute inset-0 h-full w-full object-cover select-none" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: `radial-gradient(circle at 50% 45%, ${def.glow || '#6366F1'}55 0%, #0b1030 62%, #05071a 100%)` }}>
            <span
              className="slot-royal select-none"
              data-text={def.label}
              style={{ backgroundImage: `linear-gradient(180deg, #fff 0%, ${def.from} 28%, ${def.to} 78%, #3b0a00 100%)`, fontSize: def.label.length > 1 ? 'clamp(1.2rem,3.8vw,3rem)' : 'clamp(1.6rem,5vw,3.8rem)' }}
            >
              {def.label}
            </span>
          </div>
        )}
        {(sym === 'WILD' || sym === 'SCATTER') && <div className="slot-shine absolute inset-0 pointer-events-none" />}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Reel (vertical strip animation)                                    */
/* ------------------------------------------------------------------ */
const Reel: React.FC<{
  strip: Sym[]; duration: number; anticipation: boolean; spinning: boolean;
  winSet: Set<string>; reelIndex: number; activeColor?: string; hasWins: boolean;
}> = ({ strip, duration, anticipation, spinning, winSet, reelIndex, activeColor, hasWins }) => {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (strip.length > 3) {
      el.style.transition = 'none';
      el.style.transform = 'translateY(0)';
      void el.offsetHeight; // force reflow
      el.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.1, 0.25, 1.0)`;
      el.style.transform = `translateY(-${((strip.length - 3) / strip.length) * 100}%)`;
    } else {
      el.style.transition = 'none';
      el.style.transform = 'translateY(0)';
    }
  }, [strip, duration]);

  return (
    <div className={`relative h-full overflow-hidden ${anticipation ? 'slot-anticipation' : ''}`}>
      <div
        ref={ref}
        className={`absolute inset-x-0 top-0 will-change-transform ${spinning && strip.length > 3 ? 'slot-motion-blur' : ''}`}
        style={{ height: `${(strip.length / 3) * 100}%` }}
      >
        {strip.map((s, i) => {
          const row = i - (strip.length - 3);
          const isFinal = row >= 0 && row < 3;
          const key = `${reelIndex}-${row}`;
          const win = !spinning && isFinal && winSet.has(key);
          return (
            <div key={i} style={{ height: `${100 / strip.length}%` }}>
              <SymbolTile sym={s} win={win} dim={!spinning && hasWins && !win} color={activeColor} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export const SlotPage: React.FC = () => {
  const { isAuthenticated, openAuthModal, updateUserBalance } = useAuth();
  const { balance, openTopupModal } = useWallet();
  const { settings } = useSettings();
  const s = settings as any;

  const [config, setConfig] = useState<SlotConfig | null>(null);
  const [betIdx, setBetIdx] = useState(2);
  const [grid, setGrid] = useState<Sym[][]>(randomGrid);
  const [strips, setStrips] = useState<Sym[][]>(() => grid.map((c) => c));
  const [durations, setDurations] = useState<number[]>([0, 0, 0, 0, 0]);
  const [anticipation, setAnticipation] = useState<boolean[]>([false, false, false, false, false]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [activeLine, setActiveLine] = useState<number>(-1); // -1 = all
  const [lastWin, setLastWin] = useState(0);
  const [displayBalance, setDisplayBalance] = useState(balance);
  const [jackpot, setJackpot] = useState(0);
  const [freeLeft, setFreeLeft] = useState(0);
  const [freeTotal, setFreeTotal] = useState(0);
  const [freeWinTotal, setFreeWinTotal] = useState(0);
  const [autoLeft, setAutoLeft] = useState(0);
  const [turbo, setTurbo] = useState(false);
  const [muted, setMuted] = useState(false);
  const [overlay, setOverlay] = useState<null | { kind: 'BIG' | 'MEGA' | 'EPIC' | 'JACKPOT' | 'FREE' | 'FREE_END'; amount?: number; spins?: number }>(null);
  const [showPaytable, setShowPaytable] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [bigWins, setBigWins] = useState<any[]>([]);
  const [mascotSrc, setMascotSrc] = useState(`${IMG}/slot_mascot.png`);
  const [logoSrc, setLogoSrc] = useState(`${IMG}/slot_logo.png`);
  const timers = useRef<number[]>([]);

  const bets = config?.bets?.length ? config.bets : [1, 2, 5, 10, 20, 50, 100];
  const bet = freeLeft > 0 && config?.freeSpinBet ? config.freeSpinBet : bets[Math.min(betIdx, bets.length - 1)];
  const paylines = config?.paylines || [];
  const sound = !muted && s.game_sound_enabled !== 'false';

  const winDisplay = useCountUp(lastWin, 1100);
  const jackpotDisplay = useCountUp(jackpot, 1600);

  useEffect(() => { if (!spinning) setDisplayBalance(balance); }, [balance, spinning]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const loadConfig = useCallback(async () => {
    try {
      const res = await platformApi.getSlotConfig();
      if (res.data?.success) {
        const c: SlotConfig = res.data.data;
        setConfig(c);
        setJackpot(c.jackpotPool);
        if (c.freeSpinsRemaining > 0) { setFreeLeft(c.freeSpinsRemaining); setFreeTotal((t) => Math.max(t, c.freeSpinsRemaining)); }
      }
    } catch { /* offline */ }
  }, []);

  const loadBigWins = useCallback(async () => {
    try {
      const res = await platformApi.getSlotBigWins();
      if (res.data?.success) setBigWins(res.data.data || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadConfig(); loadBigWins(); }, [loadConfig, loadBigWins, isAuthenticated]);
  useEffect(() => {
    const id = window.setInterval(() => { if (!spinning) loadConfig(); }, 20000);
    return () => clearInterval(id);
  }, [loadConfig, spinning]);

  const showToast = (msg: string) => { setToast(msg); window.setTimeout(() => setToast(null), 3200); };
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };

  /* ---------------- Win lines cycling ---------------- */
  const winLines = result?.lineWins || [];
  useEffect(() => {
    if (spinning || winLines.length === 0) return;
    setActiveLine(-1);
    let i = -1;
    const id = window.setInterval(() => {
      i = (i + 1) % (winLines.length + 1);
      setActiveLine(i === winLines.length ? -1 : i);
    }, 1300);
    return () => clearInterval(id);
  }, [result, spinning]); // eslint-disable-line react-hooks/exhaustive-deps

  const winSet = useMemo(() => {
    const set = new Set<string>();
    if (!result || spinning) return set;
    const lines = activeLine === -1 ? winLines : [winLines[activeLine]].filter(Boolean);
    lines.forEach((w) => w.positions.forEach(([r, c]) => set.add(`${r}-${c}`)));
    if (activeLine === -1 && result.scatterCount >= 3) result.scatterPositions.forEach(([r, c]) => set.add(`${r}-${c}`));
    return set;
  }, [result, activeLine, spinning, winLines]);
  const activeColor = activeLine >= 0 && winLines[activeLine] ? LINE_COLORS[winLines[activeLine].lineIndex % 20] : '#FACC15';

  /* ---------------- Effects ---------------- */
  const coinRain = (power = 1) => {
    const colors = ['#FFD700', '#FFC107', '#FFE57F', '#F59E0B', '#FFF8E1'];
    const end = Date.now() + 1400 * power;
    const frame = () => {
      confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0, y: 0.75 }, colors, shapes: ['circle'], scalar: 1.6, gravity: 1.2 });
      confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1, y: 0.75 }, colors, shapes: ['circle'], scalar: 1.6, gravity: 1.2 });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
    confetti({ particleCount: 140 * power, spread: 110, startVelocity: 45, origin: { y: 0.55 }, colors, shapes: ['circle', 'square'], scalar: 1.4 });
  };

  /* ---------------- Spin ---------------- */
  const spin = useCallback(async () => {
    if (spinning) return;
    if (!isAuthenticated) { openAuthModal('login'); return; }
    if (config && !config.isEnabled) { showToast('เกมสล็อตปิดปรับปรุงชั่วคราว'); return; }
    const isFree = freeLeft > 0;
    if (!isFree && balance < bet) { setAutoLeft(0); showToast('ยอดเงินไม่พอ กรุณาเติมเงิน'); openTopupModal(); return; }

    setSpinning(true);
    setResult(null);
    setLastWin(0);
    setOverlay(null);
    if (!isFree) setDisplayBalance((b) => b - bet);

    let data: SpinResult;
    try {
      const res = await platformApi.spinSlot(bet);
      if (!res.data?.success) throw new Error(res.data?.message);
      data = res.data.data;
    } catch (err: any) {
      setSpinning(false);
      setAutoLeft(0);
      setDisplayBalance(balance);
      showToast(err?.response?.data?.message || err?.message || 'เกิดข้อผิดพลาด');
      return;
    }

    // Build strips: current 3 on top -> random filler -> final 3 at bottom
    const base = turbo ? 420 : 950;
    const step = turbo ? 110 : 260;
    const durs: number[] = [];
    const ant: boolean[] = [];
    let extra = 0;
    let scattersSoFar = 0;
    for (let r = 0; r < 5; r++) {
      const anticipate = scattersSoFar >= 2;
      if (anticipate) extra += turbo ? 500 : 1100;
      ant.push(anticipate);
      durs.push(base + step * r + extra);
      scattersSoFar += data.grid[r].filter((x) => x === 'SCATTER').length;
    }
    const newStrips = data.grid.map((finalCol, r) => {
      const filler = Math.round(durs[r] / (turbo ? 45 : 55));
      return [...grid[r], ...Array.from({ length: filler }, randomSym), ...finalCol];
    });
    setDurations(durs);
    setAnticipation(ant);
    setStrips(newStrips);
    if (sound) durs.forEach((d) => later(() => playTickSound(), d - 40));

    const total = Math.max(...durs) + 120;
    later(() => {
      setGrid(data.grid);
      setStrips(data.grid.map((c) => c));
      setAnticipation([false, false, false, false, false]);
      setResult(data);
      setSpinning(false);
      setJackpot(data.jackpotPool);
      setFreeLeft(data.freeSpinsRemaining);
      setFreeWinTotal(data.freeSpinTotalWin);
      if (data.freeSpinsAwarded > 0) setFreeTotal((t) => (isFree ? t + data.freeSpinsAwarded : data.freeSpinsAwarded));
      setLastWin(data.totalWin);
      setDisplayBalance(data.newWalletBalance);
      updateUserBalance(data.newWalletBalance);
      setConfig((c) => (c ? { ...c, freeSpinBet: data.freeSpinsRemaining > 0 ? data.bet : 0, freeSpinsRemaining: data.freeSpinsRemaining } : c));

      const ratio = data.totalWin / data.bet;
      if (data.isJackpot) {
        setOverlay({ kind: 'JACKPOT', amount: data.totalWin });
        coinRain(3);
        if (sound) playWinSound('LEGENDARY');
      } else if (ratio >= 10) {
        setOverlay({ kind: ratio >= 50 ? 'EPIC' : ratio >= 25 ? 'MEGA' : 'BIG', amount: data.totalWin });
        coinRain(ratio >= 50 ? 2.5 : ratio >= 25 ? 1.8 : 1.2);
        if (sound) playWinSound(ratio >= 25 ? 'LEGENDARY' : 'EPIC');
      } else if (data.totalWin > 0 && sound) {
        playWinSound(ratio >= 3 ? 'RARE' : 'COMMON');
      }

      if (data.freeSpinsAwarded > 0) {
        later(() => {
          setOverlay({ kind: 'FREE', spins: data.freeSpinsAwarded });
          if (sound) playChestUnlockSound();
        }, ratio >= 10 || data.isJackpot ? 3600 : 700);
      } else if (isFree && data.freeSpinsRemaining === 0) {
        later(() => setOverlay({ kind: 'FREE_END', amount: data.freeSpinTotalWin }), ratio >= 10 ? 3600 : 900);
      }
      if (data.totalWin >= data.bet * 10) loadBigWins();
    }, total);
  }, [spinning, isAuthenticated, openAuthModal, config, freeLeft, balance, bet, openTopupModal, turbo, grid, sound, updateUserBalance, loadBigWins]);

  /* ---------------- Auto-play & free spins chaining ---------------- */
  useEffect(() => {
    if (spinning || !result) return;
    if (overlay) return;
    const wantsNext = freeLeft > 0 || autoLeft > 0;
    if (!wantsNext) return;
    const delay = result.totalWin > 0 ? (turbo ? 900 : 1700) : turbo ? 350 : 650;
    const id = window.setTimeout(() => {
      if (freeLeft <= 0 && autoLeft > 0) setAutoLeft((a) => a - 1);
      spin();
    }, delay);
    return () => clearTimeout(id);
  }, [spinning, result, overlay, freeLeft, autoLeft, turbo, spin]);

  // Auto-close celebration overlays
  useEffect(() => {
    if (!overlay) return;
    const ms = overlay.kind === 'JACKPOT' ? 6000 : overlay.kind === 'FREE' || overlay.kind === 'FREE_END' ? 2800 : 3400;
    const id = window.setTimeout(() => setOverlay(null), ms);
    return () => clearTimeout(id);
  }, [overlay]);

  // Space bar to spin
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !(e.target as HTMLElement)?.closest('input,textarea')) { e.preventDefault(); spin(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [spin]);

  const toggleAuto = () => {
    if (!isAuthenticated) { openAuthModal('login'); return; }
    if (autoLeft > 0) setAutoLeft(0);
    else { setAutoLeft(25); if (!spinning && !result) spin(); else if (!spinning && result && !overlay) spin(); }
  };

  const locked = spinning || freeLeft > 0 || autoLeft > 0;
  const linesToDraw = !spinning && result ? (activeLine === -1 ? winLines : [winLines[activeLine]].filter(Boolean)) : [];

  /* ================================================================== */
  return (
    <div className="slot-page relative min-h-screen overflow-hidden pt-[76px] pb-28 md:pb-10 select-none">
      <style>{SLOT_CSS}</style>

      {/* Background & Ambient Vault Hoard */}
      <div className="absolute inset-0 -z-0 overflow-hidden pointer-events-none">
        <img src={`${IMG}/slot_bg.jpg`} alt="" className="h-full w-full object-cover scale-105 slot-bg-drift" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,8,30,0.1)_0%,rgba(7,9,13,0.68)_72%,#07090D_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07090D]/65 via-transparent to-[#07090D]/95" />

        {/* Ambient Golden Light Beams from Top Corners */}
        <div className="hidden lg:block absolute -top-24 -left-24 w-[520px] h-[520px] bg-amber-500/15 rounded-full blur-[110px]" />
        <div className="hidden lg:block absolute -top-24 -right-24 w-[520px] h-[520px] bg-yellow-500/15 rounded-full blur-[110px]" />
        <div className="hidden lg:block absolute bottom-0 left-0 w-[600px] h-[380px] bg-amber-500/20 rounded-full blur-[100px]" />
        <div className="hidden lg:block absolute bottom-0 right-0 w-[600px] h-[380px] bg-orange-500/20 rounded-full blur-[100px]" />

        {/* ============================================================ */}
        {/*  LEFT & RIGHT FULL-HEIGHT WINGS: GIANT STANDALONE DRAGONS    */}
        {/* ============================================================ */}

        {/* LEFT DRAGON: Super Giant Wing (Full Left Viewport) */}
        <div className="hidden lg:flex absolute left-[-40px] xl:left-[-20px] 2xl:left-[10px] top-[10%] bottom-[8%] w-[32vw] max-w-[560px] items-center justify-center z-10 pointer-events-none slot-dragon-guardian">
          <div className="relative w-full">
            <div className="absolute inset-2 bg-gradient-to-br from-amber-400/50 via-red-500/30 to-transparent blur-[80px] rounded-full animate-pulse" />
            <img
              src={`${IMG}/deco_golden_dragon.png`}
              alt="Golden Dragon Left"
              className="w-full h-auto -scale-x-100 drop-shadow-[0_25px_60px_rgba(0,0,0,0.98)] drop-shadow-[0_0_45px_rgba(251,191,36,0.75)]"
            />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-5 py-1 rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 text-xs sm:text-sm font-black text-slate-950 uppercase tracking-widest shadow-[0_0_25px_rgba(251,191,36,0.95)] border-2 border-yellow-200 whitespace-nowrap">
              🐉 GOLDEN DRAGON
            </div>
          </div>
        </div>

        {/* RIGHT DRAGON: Super Giant Wing (Full Right Viewport) */}
        <div className="hidden lg:flex absolute right-[-40px] xl:right-[-20px] 2xl:right-[10px] top-[10%] bottom-[8%] w-[32vw] max-w-[560px] items-center justify-center z-10 pointer-events-none slot-dragon-guardian">
          <div className="relative w-full">
            <div className="absolute inset-2 bg-gradient-to-bl from-amber-400/50 via-red-500/30 to-transparent blur-[80px] rounded-full animate-pulse" />
            <img
              src={`${IMG}/deco_golden_dragon.png`}
              alt="Golden Dragon Right"
              className="w-full h-auto drop-shadow-[0_25px_60px_rgba(0,0,0,0.98)] drop-shadow-[0_0_45px_rgba(251,191,36,0.7)]"
            />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-5 py-1 rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-red-600 text-xs sm:text-sm font-black text-slate-950 uppercase tracking-widest shadow-[0_0_25px_rgba(251,191,36,0.95)] border-2 border-yellow-200 whitespace-nowrap">
              🐉 GOLDEN DRAGON
            </div>
          </div>
        </div>

        {/* Twinkling Sparkles & Floating Gold Dust */}
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            className="slot-sparkle"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 29) % 92}%`,
              width: i % 3 === 0 ? '6px' : '4px',
              height: i % 3 === 0 ? '6px' : '4px',
              animationDelay: `${(i % 7) * 0.55}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1320px] px-2 sm:px-4">
        {/* ---------- Top bar ---------- */}
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3 relative">
          <Link to="/" className="slot-round-btn relative z-20" title="กลับหน้าแรก"><Home className="w-5 h-5" /></Link>

          {/* Jackpot with flanking Dragon & Chest Ornaments */}
          <div className="relative flex-1 max-w-[580px] mx-auto flex items-center justify-center">
            <div className="slot-jackpot relative w-full z-10">
              <div className="slot-jackpot-inner">
                <Crown className="w-5 h-5 sm:w-7 sm:h-7 text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.9)] shrink-0" />
                <span className="slot-jackpot-label">JACKPOT</span>
                <span className="slot-jackpot-value tabular-nums">฿{fmt(jackpotDisplay)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-20">
            <button onClick={() => setMuted((m) => !m)} className="slot-round-btn" title="เสียง">
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button onClick={() => setShowPaytable(true)} className="slot-round-btn" title="ตารางจ่าย"><Info className="w-5 h-5" /></button>
          </div>
        </div>

        {/* ---------- Stage ---------- */}
        <div className="relative flex items-end justify-center">
          {/* ============================================================ */}
          {/*  LEFT SIDE OF SLOT MACHINE: TREASURES                        */}
          {/* ============================================================ */}

          {/* Left Treasure Base: 1 Large Red Jewel Chest + Money Bag */}
          <div className="hidden lg:block absolute -left-12 xl:-left-20 2xl:-left-28 bottom-[-16px] w-40 xl:w-48 2xl:w-56 z-30 pointer-events-none">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/30 blur-2xl rounded-full" />
              <img
                src={`${IMG}/sym_bag.png`}
                alt=""
                className="w-[45%] absolute -top-8 -right-2 rotate-[12deg] drop-shadow-[0_12px_20px_rgba(0,0,0,0.85)] slot-float"
              />
              <img
                src={`${IMG}/sym_chest.png`}
                alt=""
                className="relative w-full rotate-[3deg] drop-shadow-[0_18px_28px_rgba(0,0,0,0.95)] drop-shadow-[0_0_25px_rgba(250,204,21,0.5)] slot-float"
              />
              <img
                src={`${IMG}/deco_coin_stack.png`}
                alt=""
                className="w-[38%] absolute -bottom-3 -left-3 rotate-[-6deg] drop-shadow-[0_10px_18px_rgba(0,0,0,0.9)]"
              />
            </div>
          </div>

          {/* ============================================================ */}
          {/*  RIGHT SIDE OF SLOT MACHINE: LOGO, MASCOT & TREASURES        */}
          {/* ============================================================ */}

          {/* 1. Game Logo (Top-Right of Frame) */}
          <img
            src={logoSrc}
            onError={() => setLogoSrc(`${IMG}/slot_logo.jpg`)}
            alt="Cat Heist Slots"
            className={`hidden lg:block absolute -right-2 xl:-right-6 -top-8 w-36 xl:w-44 z-30 pointer-events-none slot-float drop-shadow-[0_10px_30px_rgba(250,204,21,0.55)] ${logoSrc.endsWith('.jpg') ? 'slot-black-key' : ''}`}
          />

          {/* 2. Cat Boss Mascot (Mid/Bottom-Right of Frame) */}
          <img
            src={mascotSrc}
            onError={() => setMascotSrc(`${IMG}/slot_mascot.jpg`)}
            alt="Cat Boss"
            className={`hidden lg:block absolute -right-12 xl:-right-20 bottom-[-6px] h-[76%] z-30 pointer-events-none slot-mascot ${mascotSrc.endsWith('.jpg') ? 'slot-black-key' : ''}`}
          />

          {/* 3. Right Treasure Base: 1 Royal Gold Chest beside Mascot */}
          <div className="hidden lg:block absolute -right-14 xl:-right-22 2xl:-right-28 bottom-[-16px] w-38 xl:w-44 2xl:w-50 z-[32] pointer-events-none">
            <div className="relative">
              <img
                src={`${IMG}/deco_royal_chest.png`}
                alt=""
                className="w-full rotate-[-5deg] drop-shadow-[0_18px_28px_rgba(0,0,0,0.95)] drop-shadow-[0_0_22px_rgba(250,204,21,0.5)] slot-float"
              />
              <img
                src={`${IMG}/sym_bag.png`}
                alt=""
                className="w-[44%] absolute -bottom-2 -left-2 rotate-[-8deg] drop-shadow-[0_12px_20px_rgba(0,0,0,0.9)]"
              />
              <img
                src={`${IMG}/deco_coin_stack.png`}
                alt=""
                className="w-[36%] absolute -bottom-3 right-0 rotate-[6deg] drop-shadow-[0_10px_18px_rgba(0,0,0,0.9)]"
              />
            </div>
          </div>

          {/* ============================================================ */}
          {/*  CENTER BOTTOM FLOOR: DIAMOND SCATTER VAULT & TREASURE       */}
          {/* ============================================================ */}
          <div className="hidden md:flex absolute -bottom-7 left-1/2 -translate-x-1/2 z-30 items-center justify-center pointer-events-none">
            <div className="relative flex items-end justify-center">
              <img
                src={`${IMG}/deco_coin_stack.png`}
                alt=""
                className="w-14 xl:w-16 -mr-4 mb-1 rotate-[-14deg] drop-shadow-[0_8px_15px_rgba(0,0,0,0.85)]"
              />
              <div className="relative w-28 xl:w-32 slot-float">
                <div className="absolute inset-0 bg-fuchsia-500/45 blur-2xl rounded-full animate-pulse" />
                <img
                  src={`${IMG}/sym_scatter.png`}
                  alt=""
                  className="w-full drop-shadow-[0_12px_24px_rgba(217,70,239,0.75)]"
                />
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 text-[9px] font-black text-white uppercase tracking-wider shadow-md whitespace-nowrap border border-pink-200/60">
                  💎 DIAMOND VAULT
                </div>
              </div>
              <img
                src={`${IMG}/sym_bag.png`}
                alt=""
                className="w-14 xl:w-16 -ml-4 mb-1 rotate-[14deg] drop-shadow-[0_8px_15px_rgba(0,0,0,0.85)]"
              />
            </div>
          </div>

          {/* Machine frame */}
          <div className="slot-frame relative w-full lg:w-[78%] xl:w-[76%]">
            <div className="slot-frame-bolts" />
            {/* Free spins banner */}
            {freeLeft > 0 || (result?.isFreeSpin && !spinning) ? (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 slot-free-banner">
                FREE SPINS {Math.max(0, freeTotal - freeLeft)} / {freeTotal} · x{config?.freeSpinMultiplier || 2}
              </div>
            ) : null}

            <div className="slot-window relative">
              <div className="relative grid grid-cols-5 aspect-[5/3]">
                {strips.map((strip, r) => (
                  <div key={r} className={`relative h-full ${r < 4 ? 'slot-reel-divider' : ''}`}>
                    <Reel
                      strip={strip}
                      duration={durations[r]}
                      anticipation={anticipation[r] && spinning}
                      spinning={spinning}
                      winSet={winSet}
                      reelIndex={r}
                      activeColor={activeColor}
                      hasWins={winSet.size > 0}
                    />
                  </div>
                ))}

                {/* Paylines overlay */}
                <svg viewBox="0 0 500 300" className="absolute inset-0 w-full h-full pointer-events-none z-10" preserveAspectRatio="none">
                  {linesToDraw.map((w) => {
                    const line = paylines[w.lineIndex];
                    if (!line) return null;
                    const pts = line.map((row, reel) => `${reel * 100 + 50},${row * 100 + 50}`).join(' ');
                    const c = LINE_COLORS[w.lineIndex % 20];
                    return (
                      <g key={w.lineIndex}>
                        <polyline points={pts} fill="none" stroke={c} strokeWidth="9" strokeOpacity="0.25" strokeLinejoin="round" strokeLinecap="round" />
                        <polyline points={pts} fill="none" stroke={c} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" className="slot-line-dash" style={{ filter: `drop-shadow(0 0 6px ${c})` }} />
                      </g>
                    );
                  })}
                </svg>

                {/* Line win tag */}
                {!spinning && activeLine >= 0 && winLines[activeLine] && (
                  <div className="absolute left-1/2 bottom-2 -translate-x-1/2 z-20 slot-line-tag" style={{ borderColor: activeColor, color: activeColor }}>
                    LINE {winLines[activeLine].lineIndex + 1} · {winLines[activeLine].count}× {SYMBOLS[winLines[activeLine].symbol].name} = ฿{fmt(winLines[activeLine].amount)}
                  </div>
                )}
              </div>
            </div>

            {/* Line number pegs */}
            <div className="hidden sm:flex absolute left-[-14px] top-[12%] bottom-[12%] flex-col justify-between">
              {[1, 4, 2, 5, 3].map((n) => <span key={n} className="slot-peg">{n}</span>)}
            </div>
            <div className="hidden sm:flex absolute right-[-14px] top-[12%] bottom-[12%] flex-col justify-between">
              {[6, 9, 7, 10, 8].map((n) => <span key={n} className="slot-peg">{n}</span>)}
            </div>
          </div>
        </div>

        {/* Control bar wrapper with foreground coin spill */}
        <div className="relative mt-3 sm:mt-5 mx-auto lg:w-[86%]">
          {/* Gold bars & continuous coin spill strip behind controls */}
          <div className="absolute -top-10 -bottom-3 inset-x-[-4%] pointer-events-none z-0 overflow-visible opacity-90">
            <img src={`${IMG}/vault_coins_strip.svg`} alt="" className="w-full h-full object-cover filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]" />
          </div>

          <div className="slot-controls relative z-10">
            <div className="grid grid-cols-12 items-stretch gap-2 sm:gap-3">
            {/* Buy coins */}
            <button onClick={() => (isAuthenticated ? openTopupModal() : openAuthModal('login'))} className="slot-btn-green col-span-4 sm:col-span-2 order-1">
              <span className="text-[11px] sm:text-sm leading-none">BUY</span>
              <span className="text-base sm:text-xl leading-none">COINS</span>
            </button>

            {/* Free / auto info */}
            <div className="slot-panel col-span-4 sm:col-span-2 order-2 flex flex-col items-center justify-center">
              <span className="slot-panel-label">{freeLeft > 0 ? 'FREE GAMES' : 'LINES'}</span>
              <span className="slot-panel-value">{freeLeft > 0 ? `${freeTotal - freeLeft} of ${freeTotal}` : '20'}</span>
              {autoLeft > 0 && <span className="text-[9px] font-black text-emerald-300 tracking-wider">AUTO {autoLeft}</span>}
            </div>

            {/* WIN */}
            <div className="slot-win-panel col-span-4 sm:col-span-3 order-3 flex flex-col items-center justify-center">
              <span className="slot-panel-label text-sky-100">{freeLeft > 0 || result?.isFreeSpin ? `FREE WIN ฿${fmt(freeWinTotal)}` : 'WIN'}</span>
              <span className={`slot-win-value tabular-nums ${lastWin > 0 && !spinning ? 'slot-win-pop' : ''}`}>฿{fmt(winDisplay)}</span>
            </div>

            {/* BET */}
            <div className="slot-panel col-span-6 sm:col-span-2 order-4 flex flex-col items-center justify-center px-1">
              <span className="slot-panel-label">BET</span>
              <div className="flex items-center justify-between w-full gap-1">
                <button disabled={locked || betIdx === 0} onClick={() => setBetIdx((i) => Math.max(0, i - 1))} className="slot-arrow"><Minus className="w-4 h-4" /></button>
                <span className="slot-panel-value tabular-nums">฿{fmt(bet, bet % 1 ? 2 : 0)}</span>
                <button disabled={locked || betIdx >= bets.length - 1} onClick={() => setBetIdx((i) => Math.min(bets.length - 1, i + 1))} className="slot-arrow"><Plus className="w-4 h-4" /></button>
              </div>
              <span className="mt-0.5 text-[10px] sm:text-xs font-bold text-yellow-200/90 tabular-nums">💰 ฿{fmt(Math.max(0, displayBalance))}</span>
            </div>

            {/* Max bet + turbo */}
            <div className="col-span-6 sm:col-span-1 order-5 flex sm:flex-col gap-2">
              <button disabled={locked} onClick={() => setBetIdx(bets.length - 1)} className="slot-btn-purple flex-1">MAX<br className="hidden sm:block" /> BET</button>
              <button onClick={() => setTurbo((t) => !t)} className={`slot-btn-small flex-1 ${turbo ? 'slot-btn-small-on' : ''}`} title="Turbo">
                <Zap className="w-4 h-4" /> <span className="sm:hidden xl:inline">TURBO</span>
              </button>
            </div>

            {/* SPIN */}
            <div className="col-span-12 sm:col-span-2 order-6 flex sm:flex-col items-center gap-2">
              <button onClick={() => spin()} disabled={spinning || !!overlay} className={`slot-spin-btn flex-1 w-full ${spinning ? 'slot-spin-busy' : ''}`}>
                {spinning ? <RefreshCw className="w-7 h-7 animate-spin" /> : freeLeft > 0 ? <span>FREE<br />SPIN</span> : <span>SPIN</span>}
              </button>
              <button onClick={toggleAuto} className={`slot-btn-small w-28 sm:w-full ${autoLeft > 0 ? 'slot-btn-small-on' : ''}`}>
                {autoLeft > 0 ? `STOP (${autoLeft})` : 'AUTO ×25'}
              </button>
            </div>
            </div>
          </div>
        </div>

        {/* ---------- Big wins ticker ---------- */}
        {bigWins.length > 0 && (
          <div className="mt-4 mx-auto lg:w-[86%] rounded-2xl border border-yellow-500/20 bg-black/40 backdrop-blur-md overflow-hidden">
            <div className="flex items-center">
              <div className="shrink-0 px-3 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-black text-xs font-black flex items-center gap-1"><Trophy className="w-4 h-4" /> BIG WINS</div>
              <div className="overflow-hidden flex-1">
                <div className="slot-ticker flex gap-8 whitespace-nowrap py-2 text-xs sm:text-sm">
                  {[...bigWins, ...bigWins].map((w, i) => (
                    <span key={i} className="text-zinc-300">
                      {w.is_jackpot ? '👑' : '🎰'} <b className="text-white">{String(w.username).slice(0, 3)}***</b> ชนะ <b className="text-yellow-300">฿{fmt(parseFloat(w.win))}</b>
                      <span className="text-zinc-500"> (เดิมพัน ฿{parseFloat(w.bet) || 'FREE'})</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        <p className="text-center text-[10px] text-zinc-500 mt-3">กด Spacebar เพื่อหมุน · ผลลัพธ์สุ่มจากเซิร์ฟเวอร์ 100% · RTP ประมาณ 94%</p>
      </div>

      {/* ---------- Celebration overlays ---------- */}
      {overlay && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setOverlay(null)}>
          <div className="slot-rays" />
          <div className="relative text-center slot-overlay-pop px-4">
            {overlay.kind === 'FREE' ? (
              <>
                <img src={`${IMG}/sym_scatter.jpg`} alt="" className="w-40 h-40 sm:w-52 sm:h-52 mx-auto rounded-3xl slot-tile-win mb-4" />
                <div className="slot-big-title" data-text="FREE SPINS">FREE SPINS</div>
                <div className="slot-big-amount">{overlay.spins} ครั้ง · x{config?.freeSpinMultiplier || 2}</div>
              </>
            ) : overlay.kind === 'FREE_END' ? (
              <>
                <div className="slot-big-title text-[2.6rem] sm:text-[4rem]" data-text="TOTAL FREE WIN">TOTAL FREE WIN</div>
                <div className="slot-big-amount">฿{fmt(overlay.amount || 0)}</div>
              </>
            ) : (
              <>
                {overlay.kind === 'JACKPOT' && <Crown className="w-20 h-20 mx-auto text-yellow-300 drop-shadow-[0_0_25px_rgba(250,204,21,1)] mb-2" />}
                <div className={`slot-big-title ${overlay.kind === 'JACKPOT' ? 'slot-jackpot-title' : ''}`} data-text={`${overlay.kind} WIN`}>
                  {overlay.kind === 'JACKPOT' ? 'JACKPOT!' : `${overlay.kind} WIN`}
                </div>
                <BigAmount amount={overlay.amount || 0} />
              </>
            )}
            <div className="text-zinc-400 text-xs mt-6">แตะเพื่อปิด</div>
          </div>
        </div>
      )}

      {/* ---------- Paytable ---------- */}
      {showPaytable && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3" onClick={() => setShowPaytable(false)}>
          <div className="slot-paytable relative w-full max-w-3xl max-h-[88vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-3 right-3 slot-round-btn" onClick={() => setShowPaytable(false)}><X className="w-5 h-5" /></button>
            <h2 className="slot-jackpot-label text-2xl sm:text-3xl text-center mb-1">PAYTABLE</h2>
            <p className="text-center text-xs text-zinc-400 mb-5">จ่ายเป็นเท่าของเดิมพันต่อไลน์ (เดิมพันรวม ÷ 20) · เรียงจากซ้ายไปขวา</p>

            <div className="grid sm:grid-cols-2 gap-3 mb-5">
              <div className="flex items-center gap-3 rounded-2xl bg-white/5 border border-yellow-500/30 p-3">
                <div className="w-20 h-20 shrink-0"><SymbolTile sym="WILD" /></div>
                <p className="text-xs text-zinc-300"><b className="text-yellow-300">WILD</b> แทนทุกสัญลักษณ์ ยกเว้น SCATTER · ออกเฉพาะรีล 2, 3, 4</p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/5 border border-fuchsia-500/30 p-3">
                <div className="w-20 h-20 shrink-0"><SymbolTile sym="SCATTER" /></div>
                <p className="text-xs text-zinc-300">
                  <b className="text-fuchsia-300">SCATTER</b> ที่ไหนก็ได้ · 3 = x2 + 8 ฟรีสปิน · 4 = x10 + 12 ฟรีสปิน · <b className="text-yellow-300">5 = JACKPOT</b> + 15 ฟรีสปิน · ฟรีสปินรางวัล x{config?.freeSpinMultiplier || 2}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {(['CAT', 'CHEST', 'HAT', 'BAG', 'A', 'K', 'Q', 'J', 'TEN'] as Sym[]).map((k) => {
                const p = config?.paytable?.[k];
                return (
                  <div key={k} className="rounded-2xl bg-white/5 border border-white/10 p-2 text-center">
                    <div className="aspect-square"><SymbolTile sym={k} /></div>
                    {p && (
                      <div className="mt-1 text-[11px] font-bold leading-tight">
                        <div><span className="text-zinc-400">5×</span> <span className="text-yellow-300">{p[2]}</span></div>
                        <div><span className="text-zinc-400">4×</span> <span className="text-yellow-200">{p[1]}</span></div>
                        <div><span className="text-zinc-400">3×</span> <span className="text-zinc-200">{p[0]}</span></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <h3 className="text-sm font-black text-yellow-200 mt-6 mb-2">20 PAYLINES</h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {paylines.map((line, i) => (
                <div key={i} className="rounded-lg bg-black/40 border border-white/10 p-1.5">
                  <div className="text-[9px] text-zinc-400 mb-0.5">LINE {i + 1}</div>
                  <div className="grid grid-cols-5 gap-[2px]">
                    {[0, 1, 2].map((row) => line.map((lr, reel) => (
                      <span key={`${row}-${reel}`} className="aspect-square rounded-[2px]" style={{ background: lr === row ? LINE_COLORS[i] : 'rgba(255,255,255,0.08)' }} />
                    )))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] px-5 py-3 rounded-2xl bg-rose-600/95 text-white text-sm font-bold shadow-2xl border border-rose-300/40">{toast}</div>
      )}
    </div>
  );
};

const BigAmount: React.FC<{ amount: number }> = ({ amount }) => {
  const [target, setTarget] = useState(0);
  useEffect(() => { const id = window.setTimeout(() => setTarget(amount), 50); return () => clearTimeout(id); }, [amount]);
  const v = useCountUp(target, 2600);
  return <div className="slot-big-amount tabular-nums">฿{fmt(v)}</div>;
};

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */
const SLOT_CSS = `
.slot-page { font-family: 'Inter','Noto Sans Thai',sans-serif; }
.slot-bg-drift { animation: slotDrift 30s ease-in-out infinite alternate; }
@keyframes slotDrift { from { transform: scale(1.05) translateX(0); } to { transform: scale(1.12) translateX(-1.5%); } }
.slot-sparkle { position:absolute; width:4px; height:4px; border-radius:9999px; background:#ffe9a8; box-shadow:0 0 10px 3px rgba(255,214,102,.8); animation: slotTwinkle 4s ease-in-out infinite; opacity:0; }
@keyframes slotTwinkle { 0%,100% { opacity:0; transform:scale(.4);} 50% { opacity:1; transform:scale(1.2);} }

/* Jackpot */
.slot-jackpot { padding:3px; border-radius:9999px; background:linear-gradient(180deg,#fff6c2,#f2b318 35%,#9a5b00 70%,#ffd34d); box-shadow:0 0 30px rgba(250,204,21,.45), 0 6px 18px rgba(0,0,0,.6); }
.slot-jackpot-inner { display:flex; align-items:center; justify-content:center; gap:.6rem; border-radius:9999px; padding:.35rem 1rem; background:radial-gradient(ellipse at 50% 0%,#3b2a85 0%,#1a1046 55%,#0b0624 100%); box-shadow: inset 0 2px 10px rgba(255,255,255,.15), inset 0 -4px 12px rgba(0,0,0,.6); }
.slot-jackpot-label { font-weight:900; font-style:italic; letter-spacing:.04em; background:linear-gradient(180deg,#fffbe0,#ffd23f 45%,#ff8a00); -webkit-background-clip:text; background-clip:text; color:transparent; filter:drop-shadow(0 2px 0 #7a2e00) drop-shadow(0 0 8px rgba(255,190,0,.6)); font-size:clamp(.9rem,2.2vw,1.5rem); }
.slot-jackpot-value { font-weight:900; color:#fff; font-size:clamp(1rem,3vw,2rem); text-shadow:0 0 12px rgba(125,211,252,.9), 0 2px 0 #1e3a8a; }

.slot-round-btn { width:42px; height:42px; border-radius:9999px; display:flex; align-items:center; justify-content:center; color:#fff7d6; background:radial-gradient(circle at 35% 30%,#6b4bd8,#2b1670 70%); border:2px solid #f5c84c; box-shadow:0 4px 10px rgba(0,0,0,.5), inset 0 2px 4px rgba(255,255,255,.3); transition:transform .15s; }
.slot-round-btn:hover { transform:scale(1.08); }

/* Frame */
.slot-frame { 
  padding: clamp(12px, 1.8vw, 24px); 
  border-radius: 32px; 
  background: 
    radial-gradient(ellipse at 50% 0%, #fffbe0 0%, #ffd54f 20%, transparent 60%),
    linear-gradient(145deg, #fff2b8 0%, #f7b71d 15%, #945800 32%, #ffdf7a 50%, #b06e00 68%, #fff0a8 85%, #6e3d00 100%);
  border: 3px solid #ffe57f;
  box-shadow:
    0 0 0 2px #3d1f00, 
    0 0 0 5px #ffb300,
    0 0 75px rgba(250, 180, 30, 0.65), 
    0 35px 70px rgba(0, 0, 0, 0.85), 
    inset 0 3px 8px rgba(255, 255, 255, 0.9), 
    inset 0 -8px 16px rgba(0, 0, 0, 0.6); 
  position: relative;
}
.slot-frame::before { 
  content: ''; 
  position: absolute; 
  inset: 7px; 
  border-radius: 25px; 
  border: 2px solid rgba(255, 248, 200, 0.85); 
  box-shadow: inset 0 0 12px rgba(255, 215, 0, 0.4);
  pointer-events: none; 
}
.slot-frame-bolts { 
  position: absolute; 
  inset: 0; 
  pointer-events: none; 
  background:
    radial-gradient(circle at 18px 18px, #ffffff 0 3px, #ffd54f 5px, #8a5300 7px, transparent 8px),
    radial-gradient(circle at calc(100% - 18px) 18px, #ffffff 0 3px, #ffd54f 5px, #8a5300 7px, transparent 8px),
    radial-gradient(circle at 18px calc(100% - 18px), #ffffff 0 3px, #ffd54f 5px, #8a5300 7px, transparent 8px),
    radial-gradient(circle at calc(100% - 18px) calc(100% - 18px), #ffffff 0 3px, #ffd54f 5px, #8a5300 7px, transparent 8px); 
}
.slot-window { border-radius:16px; overflow:hidden; background:radial-gradient(ellipse at 50% 30%,#1d2a6b 0%,#0c1440 55%,#050822 100%); box-shadow: inset 0 0 0 3px #3a2200, inset 0 10px 25px rgba(0,0,0,.85), inset 0 -10px 25px rgba(0,0,0,.85); }
.slot-window::after { content:''; position:absolute; inset:0; pointer-events:none; background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,transparent 14%,transparent 86%,rgba(0,0,0,.55) 100%); z-index:5; }
.slot-reel-divider::after { content:''; position:absolute; right:0; top:4%; bottom:4%; width:2px; background:linear-gradient(180deg,transparent,#f5c84c 20%,#fff2b3 50%,#f5c84c 80%,transparent); opacity:.55; z-index:4; }
.slot-peg { width:26px; height:26px; border-radius:9999px; font-size:11px; font-weight:900; color:#3b1d00; display:flex; align-items:center; justify-content:center; background:radial-gradient(circle at 35% 30%,#fff6c8,#e0a11a 60%,#8a5300); box-shadow:0 2px 4px rgba(0,0,0,.6); }

/* Tiles */
.slot-tile { background:#0a0f33; box-shadow: inset 0 0 0 1.5px rgba(245,200,76,.35), 0 3px 8px rgba(0,0,0,.5); }
.slot-tile:hover { transform: scale(1.03); filter: brightness(1.12); z-index: 5; }
.slot-tile-win { animation: slotTileWin .9s ease-in-out infinite; box-shadow: 0 0 0 3px var(--win-color,#facc15), 0 0 30px 6px var(--win-color,#facc15), inset 0 0 22px rgba(255,255,255,.5) !important; z-index:10; position:relative; }
@keyframes slotTileWin { 0%,100% { transform:scale(1); filter:brightness(1.1);} 50% { transform:scale(1.08); filter:brightness(1.45) drop-shadow(0 0 12px var(--win-color,#facc15));} }
.slot-shine::after { content:''; position:absolute; top:-50%; left:-60%; width:40%; height:200%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent); transform:rotate(20deg); animation: slotShine 2.8s ease-in-out infinite; }
@keyframes slotShine { 0% { left:-60%; } 55%,100% { left:130%; } }
.slot-royal { position:relative; font-weight:900; line-height:1; font-family:'Georgia','Times New Roman',serif; -webkit-background-clip:text; background-clip:text; color:transparent; -webkit-text-stroke:2px #ffe08a; filter: drop-shadow(0 3px 0 #2b1200) drop-shadow(0 0 10px rgba(255,210,90,.55)); }
.slot-motion-blur { filter: blur(1.6px) brightness(1.05); }
.slot-anticipation { box-shadow: inset 0 0 0 3px #e879f9, inset 0 0 40px rgba(232,121,249,.8); animation: slotAnt .35s ease-in-out infinite alternate; }
@keyframes slotAnt { from { filter:brightness(1);} to { filter:brightness(1.4);} }
.slot-line-dash { stroke-dasharray: 14 8; animation: slotDash .8s linear infinite; }
@keyframes slotDash { to { stroke-dashoffset: -44; } }
.slot-line-tag { padding:.3rem .8rem; border-radius:9999px; background:rgba(5,8,34,.88); border:2px solid; font-size:clamp(9px,1.4vw,13px); font-weight:900; white-space:nowrap; box-shadow:0 4px 14px rgba(0,0,0,.6); }
.slot-free-banner { padding:.35rem 1.2rem; border-radius:9999px; font-weight:900; font-size:clamp(10px,1.5vw,14px); color:#fff; letter-spacing:.06em; background:linear-gradient(90deg,#a21caf,#7c3aed,#db2777); border:2px solid #fde68a; box-shadow:0 0 20px rgba(217,70,239,.8); white-space:nowrap; animation: slotTileWin 1.4s ease-in-out infinite; }

/* Controls */
.slot-controls { padding:10px; border-radius:24px; background:linear-gradient(180deg,rgba(40,26,110,.92),rgba(16,10,52,.95)); border:2px solid #d9a52a; box-shadow:0 10px 30px rgba(0,0,0,.6), inset 0 2px 6px rgba(255,255,255,.15); }
.slot-btn-green, .slot-spin-btn { display:flex; flex-direction:column; align-items:center; justify-content:center; font-weight:900; font-style:italic; color:#fff; text-shadow:0 2px 0 #0b5d1e, 0 0 8px rgba(0,0,0,.4); border-radius:18px; background:linear-gradient(180deg,#b6ff6a 0%,#3fd627 40%,#16a30d 75%,#0b6f06 100%); border:3px solid #f5d76e; box-shadow:0 5px 0 #075204, 0 8px 18px rgba(0,0,0,.5), inset 0 3px 4px rgba(255,255,255,.6); transition:transform .1s, filter .2s; min-height:58px; }
.slot-btn-green:active, .slot-spin-btn:active { transform:translateY(3px); box-shadow:0 2px 0 #075204, inset 0 3px 4px rgba(255,255,255,.6); }
.slot-btn-green:hover, .slot-spin-btn:hover:not(:disabled) { filter:brightness(1.1); }
.slot-spin-btn { font-size:clamp(1.5rem,2.6vw,2.2rem); line-height:1; min-height:76px; border-radius:22px; animation: slotSpinPulse 2s ease-in-out infinite; }
.slot-spin-btn span { display:block; text-align:center; }
.slot-spin-btn:disabled { filter:saturate(.6) brightness(.9); animation:none; }
@keyframes slotSpinPulse { 0%,100% { box-shadow:0 5px 0 #075204, 0 0 0 0 rgba(132,255,90,.6), inset 0 3px 4px rgba(255,255,255,.6);} 50% { box-shadow:0 5px 0 #075204, 0 0 25px 6px rgba(132,255,90,.45), inset 0 3px 4px rgba(255,255,255,.6);} }
.slot-btn-purple { font-weight:900; font-size:13px; line-height:1.05; color:#fff; border-radius:16px; background:linear-gradient(180deg,#e9a8ff,#a23be6 45%,#6b1fb0); border:2px solid #f5d76e; box-shadow:0 4px 0 #4a1080, inset 0 2px 3px rgba(255,255,255,.5); padding:.5rem; }
.slot-btn-purple:disabled, .slot-arrow:disabled { opacity:.45; }
.slot-btn-small { display:flex; align-items:center; justify-content:center; gap:4px; font-weight:900; font-size:11px; color:#e0e7ff; border-radius:12px; padding:.45rem; background:rgba(255,255,255,.08); border:1.5px solid rgba(255,255,255,.2); }
.slot-btn-small-on { background:linear-gradient(180deg,#fde047,#f59e0b); color:#3b1d00; border-color:#fff3b0; }
.slot-panel { border-radius:16px; padding:.35rem; background:linear-gradient(180deg,#120a3a,#22145e); border:2px solid #c99a2e; box-shadow: inset 0 3px 8px rgba(0,0,0,.6); min-height:58px; }
.slot-panel-label { font-size:10px; font-weight:900; letter-spacing:.12em; color:#fde68a; }
.slot-panel-value { font-size:clamp(.85rem,1.6vw,1.15rem); font-weight:900; color:#fff; }
.slot-arrow { width:26px; height:26px; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#fff; background:linear-gradient(180deg,#86efac,#16a34a); border:1.5px solid #dcfce7; box-shadow:0 2px 0 #14532d; }
.slot-win-panel { border-radius:18px; padding:.35rem; background:linear-gradient(180deg,#3aa0ff 0%,#1d4ed8 45%,#172a8a 100%); border:3px solid #f5d76e; box-shadow:0 0 20px rgba(59,130,246,.5), inset 0 3px 6px rgba(255,255,255,.4), inset 0 -6px 12px rgba(0,0,0,.4); min-height:58px; }
.slot-win-value { font-size:clamp(1.2rem,2.8vw,2rem); font-weight:900; color:#fff; text-shadow:0 2px 0 #0b1a5e, 0 0 12px rgba(255,255,255,.6); }
.slot-win-pop { animation: slotWinPop .5s cubic-bezier(.34,1.56,.64,1); color:#fff7b0; }
@keyframes slotWinPop { 0% { transform:scale(.7);} 100% { transform:scale(1);} }
.slot-spin-busy { pointer-events:none; }

/* Decorations */
.slot-float { animation: slotFloat 4s ease-in-out infinite; }
.slot-float-slow { animation: slotFloat 6s ease-in-out infinite; }
@keyframes slotFloat { 0%,100% { translate:0 0; } 50% { translate:0 -10px; } }
.slot-dragon-guardian { animation: slotDragonHover 5.5s ease-in-out infinite; transform-origin: center center; }
@keyframes slotDragonHover { 0%,100% { transform: translateY(0) scale(1) rotate(0deg); } 50% { transform: translateY(-12px) scale(1.03) rotate(-1.5deg); } }
.slot-mascot { filter: drop-shadow(0 20px 30px rgba(0,0,0,.7)) drop-shadow(0 0 25px rgba(250,204,21,.25)); animation: slotMascot 5s ease-in-out infinite; transform-origin: bottom center; }
@keyframes slotMascot { 0%,100% { transform: rotate(0deg) scale(1);} 50% { transform: rotate(-1.5deg) scale(1.02);} }
.slot-black-key { -webkit-mask-image: radial-gradient(ellipse 60% 55% at 50% 50%, #000 60%, transparent 100%); mask-image: radial-gradient(ellipse 60% 55% at 50% 50%, #000 60%, transparent 100%); }
.slot-deco-mask { -webkit-mask-image: radial-gradient(circle at 50% 50%, #000 55%, transparent 72%); mask-image: radial-gradient(circle at 50% 50%, #000 55%, transparent 72%); filter: drop-shadow(0 10px 20px rgba(0,0,0,.6)); }
.slot-ticker { animation: slotTicker 40s linear infinite; width:max-content; }
@keyframes slotTicker { from { transform:translateX(0);} to { transform:translateX(-50%);} }

/* Overlays */
.slot-rays { position:absolute; width:180vmax; height:180vmax; background:repeating-conic-gradient(from 0deg, rgba(255,210,80,.18) 0deg 10deg, transparent 10deg 20deg); animation: slotRays 18s linear infinite; -webkit-mask-image: radial-gradient(circle, #000 0%, transparent 55%); mask-image: radial-gradient(circle, #000 0%, transparent 55%); }
@keyframes slotRays { to { transform: rotate(360deg);} }
.slot-overlay-pop { animation: slotOverlayPop .7s cubic-bezier(.34,1.56,.64,1); }
@keyframes slotOverlayPop { 0% { transform:scale(.3); opacity:0;} 100% { transform:scale(1); opacity:1;} }
.slot-big-title { font-size:clamp(3rem,10vw,7rem); font-weight:900; font-style:italic; line-height:1; letter-spacing:.02em; background:linear-gradient(180deg,#fffef0 0%,#ffe066 35%,#ff9d00 65%,#c2410c 100%); -webkit-background-clip:text; background-clip:text; color:transparent; -webkit-text-stroke:2px #fff3c4; filter: drop-shadow(0 6px 0 #6b1d00) drop-shadow(0 0 30px rgba(255,180,0,.8)); animation: slotTitlePulse 1.2s ease-in-out infinite; }
.slot-jackpot-title { background:linear-gradient(180deg,#fff 0%,#f0abfc 30%,#c026d3 60%,#6d28d9 100%); -webkit-background-clip:text; background-clip:text; filter: drop-shadow(0 6px 0 #3b0764) drop-shadow(0 0 40px rgba(217,70,239,.9)); }
@keyframes slotTitlePulse { 0%,100% { transform:scale(1);} 50% { transform:scale(1.06);} }
.slot-big-amount { margin-top:.5rem; font-size:clamp(2rem,6vw,4rem); font-weight:900; color:#fff; text-shadow:0 4px 0 #1e3a8a, 0 0 25px rgba(125,211,252,.9); }
.slot-paytable { border-radius:24px; padding:1.5rem; background:linear-gradient(180deg,#1c1250,#0b0726); border:3px solid #d9a52a; box-shadow:0 0 50px rgba(250,204,21,.25); }
`;

export default SlotPage;
