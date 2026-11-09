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
  const [screenShake, setScreenShake] = useState(false);
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
  const triggerScreenShake = () => {
    setScreenShake(true);
    window.setTimeout(() => setScreenShake(false), 950);
  };

  const coinRain = (power = 1) => {
    const colors = ['#FFD700', '#FFC107', '#FFE57F', '#F59E0B', '#FFF8E1', '#E11D48', '#9333EA'];
    const end = Date.now() + 1800 * power;
    const frame = () => {
      confetti({ particleCount: 10 * power, angle: 60, spread: 75, origin: { x: 0, y: 0.7 }, colors, shapes: ['circle'], scalar: 1.8, gravity: 1.1 });
      confetti({ particleCount: 10 * power, angle: 120, spread: 75, origin: { x: 1, y: 0.7 }, colors, shapes: ['circle'], scalar: 1.8, gravity: 1.1 });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
    confetti({ particleCount: 180 * power, spread: 130, startVelocity: 55, origin: { y: 0.5 }, colors, shapes: ['circle', 'square'], scalar: 1.6 });
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
        triggerScreenShake();
        coinRain(3.5);
        if (sound) playWinSound('LEGENDARY');
      } else if (ratio >= 10) {
        setOverlay({ kind: ratio >= 50 ? 'EPIC' : ratio >= 25 ? 'MEGA' : 'BIG', amount: data.totalWin });
        triggerScreenShake();
        coinRain(ratio >= 50 ? 3 : ratio >= 25 ? 2.2 : 1.5);
        if (sound) playWinSound(ratio >= 25 ? 'LEGENDARY' : 'EPIC');
      } else if (data.totalWin > 0 && sound) {
        if (ratio >= 3) triggerScreenShake();
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
    <div className={`slot-page relative min-h-screen overflow-hidden pt-[76px] pb-10 select-none flex flex-col justify-center ${screenShake ? 'slot-screen-shake' : ''}`}>
      <style>{SLOT_CSS}</style>

      {/* Background */}
      <div className="absolute inset-0 -z-0 overflow-hidden pointer-events-none">
        <img src={`${IMG}/slot_bg.jpg`} alt="" className="h-full w-full object-cover scale-100" />
        <div className="absolute inset-0 bg-black/30" />

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

      <div className="relative z-10 mx-auto w-full max-w-[1020px] px-2 sm:px-4 scale-[0.88] 2xl:scale-95 origin-center my-auto">
        {/* ---------- Top bar ---------- */}
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3 relative">
          <div className="flex items-center gap-2 relative z-20">
            <Link to="/slots" className="slot-round-btn" title="กลับไปเลือกล็อบบี้ห้องเกม"><Home className="w-5 h-5" /></Link>
            <Link to="/slots" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-yellow-400/40 text-[11px] font-black text-yellow-300 hover:text-white hover:border-yellow-300 transition-all shadow-md">
              <span>← เลือกล็อบบี้ห้องสล็อต</span>
            </Link>
          </div>

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
        <div className="relative flex items-center justify-center">
          {/* Machine frame */}
          <div className="slot-frame relative w-full lg:w-[72%] xl:w-[70%]">
            <div className="slot-frame-bolts" />
            {/* Free spins banner */}
            {freeLeft > 0 || (result?.isFreeSpin && !spinning) ? (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 slot-free-banner flex items-center gap-1.5">
                <span>🔥 FREE SPINS {Math.max(0, freeTotal - freeLeft)} / {freeTotal} · x{config?.freeSpinMultiplier || 2}</span>
              </div>
            ) : (
              <div className="hidden sm:flex absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 px-3.5 py-0.5 rounded-full bg-black/80 border border-yellow-400/40 text-[10px] font-black text-yellow-300 tracking-wider shadow-lg whitespace-nowrap">
                ⭐ สัญลักษณ์เรียง 5 แถว หรือ 3 SCATTER รับโบนัสฟรีสปินทันที! ⭐
              </div>
            )}

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

                {/* Paylines overlay (Clean view: no dashed line) */}

                {/* Line win tag */}
                {!spinning && activeLine >= 0 && winLines[activeLine] && (
                  <div className="absolute left-1/2 bottom-2 -translate-x-1/2 z-20 slot-line-tag" style={{ borderColor: activeColor, color: activeColor }}>
                    LINE {winLines[activeLine].lineIndex + 1} · {winLines[activeLine].count}× {SYMBOLS[winLines[activeLine].symbol].name} = ฿{fmt(winLines[activeLine].amount)}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Control bar wrapper */}
        <div className="relative mt-2 sm:mt-3 mx-auto lg:w-[76%]">
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

        <p className="text-center text-[10px] text-zinc-500 mt-3">กด Spacebar เพื่อหมุน · ผลลัพธ์สุ่มจากเซิร์ฟเวอร์ 100% · RTP ประมาณ 94%</p>
      </div>

      {/* ---------- Celebration overlays ---------- */}
      {overlay && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-md" onClick={() => setOverlay(null)}>
          <div className="slot-rays" />
          <div className="slot-gold-explosion" />
          <div className="relative text-center slot-overlay-pop px-4">
            {overlay.kind === 'FREE' ? (
              <>
                <img src={`${IMG}/sym_scatter.jpg`} alt="" className="w-40 h-40 sm:w-52 sm:h-52 mx-auto rounded-3xl slot-tile-win mb-4 drop-shadow-[0_0_35px_rgba(217,70,239,0.9)]" />
                <div className="slot-big-title" data-text="FREE SPINS">FREE SPINS</div>
                <div className="slot-big-amount text-yellow-300 drop-shadow-[0_0_20px_rgba(250,204,21,0.9)]">{overlay.spins} ครั้ง · x{config?.freeSpinMultiplier || 2}</div>
              </>
            ) : overlay.kind === 'FREE_END' ? (
              <>
                <div className="slot-big-title text-[2.6rem] sm:text-[4rem]" data-text="TOTAL FREE WIN">TOTAL FREE WIN</div>
                <div className="slot-big-amount text-yellow-300 drop-shadow-[0_0_25px_rgba(250,204,21,1)]">฿{fmt(overlay.amount || 0)}</div>
              </>
            ) : (
              <>
                {overlay.kind === 'JACKPOT' && <Crown className="w-24 h-24 mx-auto text-yellow-300 drop-shadow-[0_0_35px_rgba(250,204,21,1)] mb-2 animate-bounce" />}
                <div className={`slot-big-title ${overlay.kind === 'JACKPOT' ? 'slot-jackpot-title' : ''}`} data-text={`${overlay.kind} WIN`}>
                  {overlay.kind === 'JACKPOT' ? '💥 JACKPOT! 💥' : `💥 ${overlay.kind} WIN 💥`}
                </div>
                <BigAmount amount={overlay.amount || 0} />
              </>
            )}
            <div className="text-zinc-400 text-xs mt-6 tracking-widest uppercase">แตะเพื่อปิด</div>
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
                  <b className="text-fuchsia-300">SCATTER & 5 OF A KIND</b> · 3 SCATTER = x2 + 8 ฟรีสปิน · 4 SCATTER = x10 + 12 ฟรีสปิน · <b className="text-yellow-300">5 SCATTER = JACKPOT</b> + 15 ฟรีสปิน · <b className="text-emerald-300">เรียงครบ 5 แถว</b> รับเพิ่ม 10 ฟรีสปิน! · ฟรีสปินรางวัล x{config?.freeSpinMultiplier || 2}
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
@keyframes slotDrift { from { transform: scale(1) translateX(0); } to { transform: scale(1) translateX(0); } }
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
  padding: clamp(10px, 1.4vw, 18px); 
  border-radius: 28px; 
  background: linear-gradient(135deg, #ffd700 0%, #b8860b 20%, #150d00 50%, #d4af37 80%, #fff0a8 100%);
  border: 3px solid #ffe57f;
  box-shadow:
    0 0 0 2px #100800, 
    0 0 45px rgba(234, 179, 8, 0.4), 
    0 30px 70px rgba(0, 0, 0, 0.95), 
    inset 0 2px 6px rgba(255, 255, 255, 0.9), 
    inset 0 -6px 14px rgba(0, 0, 0, 0.8); 
  position: relative;
}
.slot-frame::before { 
  content: ''; 
  position: absolute; 
  inset: 5px; 
  border-radius: 22px; 
  border: 1.5px solid rgba(255, 240, 160, 0.7); 
  box-shadow: inset 0 0 15px rgba(255, 215, 0, 0.25);
  pointer-events: none; 
}
.slot-frame-bolts { display: none; }
.slot-window { border-radius:18px; overflow:hidden; background:radial-gradient(ellipse at 50% 35%,#131a40 0%,#080c24 60%,#030512 100%); border: 2px solid rgba(245,200,76,0.4); box-shadow: inset 0 8px 24px rgba(0,0,0,0.95), inset 0 -8px 24px rgba(0,0,0,0.95); }
.slot-window::after { content:''; position:absolute; inset:0; pointer-events:none; background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,transparent 14%,transparent 86%,rgba(0,0,0,.55) 100%); z-index:5; }
.slot-reel-divider::after { content:''; position:absolute; right:0; top:3%; bottom:3%; width:2px; background:linear-gradient(180deg,transparent,#f5c84c 20%,#fff2b3 50%,#f5c84c 80%,transparent); opacity:.6; z-index:4; }

/* Controls */
.slot-controls { 
  padding: 12px 14px; 
  border-radius: 26px; 
  background: linear-gradient(180deg, rgba(28, 18, 78, 0.95), rgba(10, 6, 34, 0.98)); 
  border: 2.5px solid #d4af37; 
  box-shadow: 0 15px 35px rgba(0,0,0,0.7), 0 0 25px rgba(212, 175, 55, 0.2), inset 0 2px 5px rgba(255,255,255,0.25); 
}
.slot-btn-green, .slot-spin-btn { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  font-weight: 900; 
  font-style: italic; 
  color: #fff; 
  text-shadow: 0 2px 2px #074e17, 0 0 8px rgba(0,0,0,0.5); 
  border-radius: 20px; 
  background: linear-gradient(180deg, #70f438 0%, #22c514 45%, #15800d 80%, #0d5c07 100%); 
  border: 2.5px solid #fef08a; 
  box-shadow: 0 5px 0 #074705, 0 8px 18px rgba(0,0,0,0.55), inset 0 3px 5px rgba(255,255,255,0.7); 
  transition: transform .12s, filter .2s; 
  min-height: 58px; 
}
.slot-btn-green:active, .slot-spin-btn:active { transform: translateY(3px); box-shadow: 0 2px 0 #074705, inset 0 3px 4px rgba(255,255,255,0.7); }
.slot-btn-green:hover, .slot-spin-btn:hover:not(:disabled) { filter: brightness(1.12); }
.slot-spin-btn { 
  font-size: clamp(1.4rem, 2.4vw, 2rem); 
  line-height: 1; 
  min-height: 74px; 
  border-radius: 22px; 
  animation: slotSpinPulse 2.2s ease-in-out infinite; 
}
.slot-spin-btn span { display: block; text-align: center; }
.slot-spin-btn:disabled { filter: saturate(0.5) brightness(0.85); animation: none; }
@keyframes slotSpinPulse { 
  0%,100% { box-shadow: 0 5px 0 #074705, 0 0 0 0 rgba(74, 222, 128, 0.6), inset 0 3px 5px rgba(255,255,255,0.7); } 
  50% { box-shadow: 0 5px 0 #074705, 0 0 24px 6px rgba(74, 222, 128, 0.45), inset 0 3px 5px rgba(255,255,255,0.7); } 
}
.slot-btn-purple { 
  font-weight: 900; 
  font-size: 12px; 
  line-height: 1.1; 
  color: #fff; 
  border-radius: 16px; 
  background: linear-gradient(180deg, #d946ef, #9333ea 50%, #581c87); 
  border: 2px solid #fde047; 
  box-shadow: 0 4px 0 #3b0764, inset 0 2px 4px rgba(255,255,255,0.5); 
  padding: .45rem; 
  transition: transform .1s;
}
.slot-btn-purple:hover:not(:disabled) { filter: brightness(1.1); }
.slot-btn-purple:active { transform: translateY(2px); box-shadow: 0 2px 0 #3b0764; }
.slot-btn-purple:disabled, .slot-arrow:disabled { opacity: .45; }
.slot-btn-small { 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  gap: 4px; 
  font-weight: 900; 
  font-size: 11px; 
  color: #f1f5f9; 
  border-radius: 14px; 
  padding: .45rem; 
  background: rgba(255,255,255,0.1); 
  border: 1.5px solid rgba(255,255,255,0.22); 
  transition: all .15s;
}
.slot-btn-small:hover { background: rgba(255,255,255,0.18); border-color: rgba(255,255,255,0.35); }
.slot-btn-small-on { 
  background: linear-gradient(180deg, #facc15, #eab308); 
  color: #1e1b4b; 
  border-color: #fef08a; 
  box-shadow: 0 0 12px rgba(250, 204, 21, 0.6);
}
.slot-panel { 
  border-radius: 18px; 
  padding: .35rem; 
  background: linear-gradient(180deg, #181145, #0c0828); 
  border: 2px solid #c99a2e; 
  box-shadow: inset 0 3px 8px rgba(0,0,0,0.65), 0 2px 6px rgba(0,0,0,0.4); 
  min-height: 58px; 
}
.slot-panel-label { font-size: 10px; font-weight: 900; letter-spacing: .12em; color: #fde68a; }
.slot-panel-value { font-size: clamp(.85rem, 1.6vw, 1.15rem); font-weight: 900; color: #fff; }
.slot-arrow { 
  width: 26px; 
  height: 26px; 
  border-radius: 9px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  color: #fff; 
  background: linear-gradient(180deg, #4ade80, #16a34a); 
  border: 1.5px solid #bbf7d0; 
  box-shadow: 0 2px 0 #14532d; 
  transition: transform .1s;
}
.slot-arrow:active { transform: translateY(1px); }
.slot-win-panel { 
  border-radius: 20px; 
  padding: .35rem; 
  background: linear-gradient(180deg, #2563eb 0%, #1d4ed8 45%, #1e1b4b 100%); 
  border: 2.5px solid #fde047; 
  box-shadow: 0 0 22px rgba(37,99,235,0.55), inset 0 3px 6px rgba(255,255,255,0.45), inset 0 -6px 12px rgba(0,0,0,0.5); 
  min-height: 58px; 
}
.slot-win-value { font-size: clamp(1.2rem, 2.8vw, 2rem); font-weight: 900; color: #fff; text-shadow: 0 2px 0 #0f172a, 0 0 14px rgba(255,255,255,0.7); }
.slot-win-pop { animation: slotWinPop .5s cubic-bezier(.34,1.56,.64,1); color: #fef08a; }
@keyframes slotWinPop { 0% { transform: scale(.7); } 100% { transform: scale(1); } }
.slot-spin-busy { pointer-events: none; }

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
.slot-screen-shake { animation: slotShake 0.65s cubic-bezier(0.36, 0.07, 0.19, 0.97) both; }
@keyframes slotShake {
  10%, 90% { transform: translate3d(-3px, 2px, 0) rotate(-0.5deg); }
  20%, 80% { transform: translate3d(4px, -3px, 0) rotate(0.8deg); }
  30%, 50%, 70% { transform: translate3d(-6px, 4px, 0) rotate(-1deg); }
  40%, 60% { transform: translate3d(6px, -4px, 0) rotate(1deg); }
}
.slot-gold-explosion {
  position: absolute;
  inset: -20px;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.45) 0%, rgba(255, 107, 0, 0.2) 50%, transparent 70%);
  animation: slotPulseBlast 1.2s ease-out infinite;
  pointer-events: none;
}
@keyframes slotPulseBlast {
  0% { transform: scale(0.6); opacity: 0.9; }
  100% { transform: scale(1.4); opacity: 0; }
}
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
