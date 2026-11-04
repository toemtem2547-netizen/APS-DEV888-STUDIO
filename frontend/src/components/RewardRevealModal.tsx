import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Trophy,
  ArrowRight,
  RotateCw,
  CheckCircle,
  Copy,
  Check,
  Zap,
  FastForward,
  X,
  Wallet,
  Crown,
  Flame,
  Star,
  Gift,
  ShieldCheck,
  Diamond,
  CircleDot,
  Coins,
  FlaskConical,
  Ticket,
  Shield,
  Sword,
  Feather,
  Award,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DrawResult, MysteryBox, BoxReward } from '../types';
import { playTickSound, playWinSound } from '../utils/audio';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80';

const GRID_TOTAL_SLOTS = 12; // 3 columns x 4 rows = 12 slots

interface GridSlotItem {
  id: number | string;
  name: string;
  description: string;
  image_url: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  valueTag: string;
  code?: string | null;
  bonusCredited?: number;
}

interface RewardRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: DrawResult | null;
  box: MysteryBox | null;
  isOpening: boolean;
  onStartDraw?: () => void;
  onDrawAgain?: () => void;
  userBalance?: number;
  openTopupModal?: () => void;
}

// ═══════════════════════════════════════════════════════════════════
// RARITY THEMES — High-contrast AAA Gaming Gear Card Aesthetic
// ═══════════════════════════════════════════════════════════════════
const RARITY_THEMES: Record<
  string,
  {
    cardBorder: string;
    cardBg: string;
    activeBorder: string;
    activeBg: string;
    badgeBg: string;
    badgeIconColor: string;
    glowOrb: string;
    label: string;
    icon: React.ReactNode;
  }
> = {
  LEGENDARY: {
    cardBorder: 'border-amber-500/30 hover:border-amber-400/60 shadow-amber-500/5',
    cardBg: 'bg-[#150F06]/95',
    activeBorder: 'border-amber-400 ring-2 ring-amber-400/70 shadow-[0_0_25px_rgba(245,158,11,0.5)]',
    activeBg: 'bg-gradient-to-b from-[#2E1B07] to-[#140C04]',
    badgeBg: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black shadow-sm',
    badgeIconColor: 'text-black',
    glowOrb: 'bg-amber-400/15',
    label: 'LEGENDARY',
    icon: <Crown className="w-2.5 h-2.5 stroke-[2.5]" />,
  },
  EPIC: {
    cardBorder: 'border-purple-500/30 hover:border-purple-400/60 shadow-purple-500/5',
    cardBg: 'bg-[#11081A]/95',
    activeBorder: 'border-purple-400 ring-2 ring-purple-400/70 shadow-[0_0_25px_rgba(168,85,247,0.5)]',
    activeBg: 'bg-gradient-to-b from-[#28133E] to-[#12081C]',
    badgeBg: 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-black shadow-sm',
    badgeIconColor: 'text-white',
    glowOrb: 'bg-purple-600/15',
    label: 'EPIC',
    icon: <Flame className="w-2.5 h-2.5 stroke-[2.5]" />,
  },
  RARE: {
    cardBorder: 'border-cyan-500/30 hover:border-cyan-400/60 shadow-cyan-500/5',
    cardBg: 'bg-[#08121E]/95',
    activeBorder: 'border-cyan-400 ring-2 ring-cyan-400/70 shadow-[0_0_25px_rgba(6,182,212,0.5)]',
    activeBg: 'bg-gradient-to-b from-[#10243B] to-[#071321]',
    badgeBg: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black shadow-sm',
    badgeIconColor: 'text-white',
    glowOrb: 'bg-cyan-500/15',
    label: 'RARE',
    icon: <Zap className="w-2.5 h-2.5 stroke-[2.5]" />,
  },
  COMMON: {
    cardBorder: 'border-slate-800/80 hover:border-slate-700 shadow-slate-900/5',
    cardBg: 'bg-[#0B0D15]/95',
    activeBorder: 'border-zinc-300 ring-2 ring-zinc-300/60 shadow-[0_0_20px_rgba(255,255,255,0.35)]',
    activeBg: 'bg-gradient-to-b from-[#181D2B] to-[#0E1119]',
    badgeBg: 'bg-zinc-800 text-zinc-300 font-bold border border-zinc-700/40',
    badgeIconColor: 'text-zinc-400',
    glowOrb: 'bg-slate-400/10',
    label: 'COMMON',
    icon: <CircleDot className="w-2.5 h-2.5" />,
  },
};

// ═══════════════════════════════════════════════════════════════════
// GAMING GEAR SMART IMAGE RESOLVER & 3D VISUAL COMPONENT
// ═══════════════════════════════════════════════════════════════════
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

  // Append version to bypass any stale browser disk cache
  return `${assetPath}?v=transparent_v1`;
};

const RewardVisual: React.FC<{
  name: string;
  imageUrl: string;
  rarity: string;
  isWinner?: boolean;
  isActive?: boolean;
}> = ({ name, imageUrl, rarity, isWinner, isActive }) => {
  const [imgError, setImgError] = useState(false);
  const resolved = resolveGamingGearImage(name, imageUrl);

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      {/* 3D Product Image — Transparent Background PNG, 100% Crisp Object, No Circles, No Masks */}
      <img
        src={imgError ? '/images/rewards/headset.png?v=transparent_v1' : resolved}
        alt={name}
        className={`w-full h-full object-contain p-0.5 relative z-10 filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] ${
          isWinner ? 'scale-110 animate-bounce' : isActive ? 'scale-105' : ''
        }`}
        loading="eager"
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
      />
    </div>
  );
};

// Curated 12-Slot Gaming Gear Pools for all 4 Mystery Boxes (Each with 12 COMPLETELY UNIQUE items)
const CURATED_POOLS: Record<string, GridSlotItem[]> = {
  'Bronze Chest': [
    { id: 'b-1', name: 'เกลือบริสุทธิ์ 100% (Pure Salt)', description: 'ดวงซวยสุดๆ สุ่มได้เกลือเวทมนตร์รสเค็มจับใจ ปลอบใจไว้ใส่ต้มยำนะ!', image_url: '/images/rewards/salt.png', rarity: 'COMMON', valueTag: 'SALT 100%' },
    { id: 'b-2', name: 'บะหมี่รอบดึก Gamer Ramen Cup', description: 'บะหมี่กึ่งสำเร็จรูปรสเผ็ดร้อน เติมพลังรอบดึก', image_url: '/images/rewards/noodles.png', rarity: 'COMMON', valueTag: 'Ramen Cup' },
    { id: 'b-3', name: 'เครื่องดื่ม Cyber Energy Elixir', description: 'เครื่องดื่มชูกำลัง E-Sport ปลุกประสาทสัมผัส', image_url: '/images/rewards/energy_drink.png', rarity: 'COMMON', valueTag: 'Energy Drink' },
    { id: 'b-4', name: 'แท่นแขวนหูฟัง RGB Headset Stand', description: 'แท่นวางหูฟังอะลูมิเนียมขอบไฟ RGB และ USB Hub', image_url: '/images/rewards/stand.png', rarity: 'COMMON', valueTag: 'RGB Stand' },
    { id: 'b-5', name: 'AuraGlide XXL RGB Mousepad', description: 'แผ่นรองเมาส์เกมมิ่ง 900x400mm ขอบไฟ RGB', image_url: '/images/rewards/mousepad.png', rarity: 'COMMON', valueTag: 'RGB Mousepad' },
    { id: 'b-6', name: 'CyberBass TWS Gaming Earbuds', description: 'หูฟังเกมมิ่งไร้สาย ความหน่วงต่ำ 45ms', image_url: '/images/rewards/earbuds.png', rarity: 'RARE', valueTag: 'TWS Earbuds' },
    { id: 'b-7', name: 'Ultralight Wireless Gaming Mouse', description: 'เมาส์เกมมิ่งน้ำหนักเบา เซนเซอร์ 26K DPI', image_url: '/images/rewards/mouse.png', rarity: 'RARE', valueTag: '26K Mouse' },
    { id: 'b-8', name: 'กล้องสตรีม 4K Pro Streaming Webcam', description: 'กล้องเว็บแคม 4K UHD 60FPS เลนส์มุมกว้าง', image_url: '/images/rewards/webcam.png', rarity: 'RARE', valueTag: '4K Webcam' },
    { id: 'b-9', name: 'Elite Wireless Game Controller', description: 'จอยเกมส์โปรคอนโทรลเลอร์ กริปยางกันลื่น', image_url: '/images/rewards/controller.png', rarity: 'RARE', valueTag: 'Pro Gamepad' },
    { id: 'b-10', name: 'ROG Wireless RGB Gaming Headset', description: 'หูฟังเกมมิ่งไร้สาย 7.1 ไมค์ตัดเสียง AI', image_url: '/images/rewards/headset.png', rarity: 'EPIC', valueTag: '7.1 Headset' },
    { id: 'b-11', name: 'Custom RGB Mechanical Keyboard', description: 'คีย์บอร์ดเกมมิ่ง Hot-swap สวิตช์ปรับแต่งได้', image_url: '/images/rewards/keyboard.png', rarity: 'EPIC', valueTag: 'Mech Keyboard' },
    { id: 'b-12', name: 'Liquid-Cooled Custom Gaming PC', description: 'เคสคอมพิวเตอร์เกมมิ่งทาวเวอร์ กระจก Tempered Glass', image_url: '/images/rewards/pc_case.png', rarity: 'LEGENDARY', valueTag: 'Jackpot PC' },
  ],
  'Silver Sentinel Box': [
    { id: 's-1', name: 'เกลือบริสุทธิ์ 100% (Pure Salt)', description: 'ดวงซวยสุดๆ สุ่มได้เกลือเวทมนตร์ ปลอบใจไว้ใส่ต้มยำนะ!', image_url: '/images/rewards/salt.png', rarity: 'COMMON', valueTag: 'SALT 100%' },
    { id: 's-2', name: 'แท่นแขวนหูฟัง RGB Headset Stand', description: 'แท่นวางหูฟังอะลูมิเนียมขอบไฟ RGB และ USB Hub', image_url: '/images/rewards/stand.png', rarity: 'COMMON', valueTag: 'RGB Stand' },
    { id: 's-3', name: 'AuraGlide XXL RGB Mousepad', description: 'แผ่นรองเมาส์เกมมิ่งไซส์ยักษ์ ขอบไฟ RGB', image_url: '/images/rewards/mousepad.png', rarity: 'COMMON', valueTag: 'RGB Mousepad' },
    { id: 's-4', name: 'CyberBass TWS Gaming Earbuds', description: 'หูฟังเกมมิ่งไร้สาย ความหน่วงต่ำ 45ms', image_url: '/images/rewards/earbuds.png', rarity: 'RARE', valueTag: 'TWS Earbuds' },
    { id: 's-5', name: 'Ultralight Wireless Gaming Mouse', description: 'เมาส์เกมมิ่งน้ำหนักเบา เซนเซอร์ 26K DPI', image_url: '/images/rewards/mouse.png', rarity: 'RARE', valueTag: '26K Mouse' },
    { id: 's-6', name: 'กล้องสตรีม 4K Pro Streaming Webcam', description: 'กล้องเว็บแคม 4K UHD 60FPS เลนส์มุมกว้าง', image_url: '/images/rewards/webcam.png', rarity: 'RARE', valueTag: '4K Webcam' },
    { id: 's-7', name: 'ลำโพงซาวด์บาร์ Hi-Res Gaming Soundbar', description: 'ลำโพงเกมมิ่งซับวูฟเฟอร์เบสคู่ Hi-Res Surround', image_url: '/images/rewards/speaker.png', rarity: 'RARE', valueTag: 'Hi-Res Soundbar' },
    { id: 's-8', name: 'ไมโครโฟน Studio Condenser Mic', description: 'ไมค์คอนเดนเซอร์สตรีมเมอร์ AI Noise-Cancelling', image_url: '/images/rewards/microphone.png', rarity: 'EPIC', valueTag: 'Studio Mic' },
    { id: 's-9', name: 'Elite Wireless Game Controller', description: 'จอยเกมส์โปรไร้สาย เซนเซอร์ Hall Effect', image_url: '/images/rewards/controller.png', rarity: 'RARE', valueTag: 'Pro Gamepad' },
    { id: 's-10', name: 'Custom RGB Mechanical Keyboard', description: 'คีย์บอร์ดเกมมิ่ง Hot-swap สวิตช์ปรับแต่งได้', image_url: '/images/rewards/keyboard.png', rarity: 'EPIC', valueTag: 'Mech Keyboard' },
    { id: 's-11', name: 'เก้าอี้ Ergonomic Cyber Gaming Chair', description: 'เก้าอี้เกมมิ่งสรีรศาสตร์ เบาะเมมโมรี่โฟม', image_url: '/images/rewards/chair.png', rarity: 'EPIC', valueTag: 'Gaming Chair' },
    { id: 's-12', name: 'แว่นตา VR Meta Gaming Headset', description: 'แว่น VR เกมมิ่งความละเอียด 4K คอนโทรลเลอร์ไร้สาย', image_url: '/images/rewards/vr.png', rarity: 'EPIC', valueTag: 'VR Headset' },
  ],
  'Gold Dragon Vault': [
    { id: 'g-1', name: 'เกลือบริสุทธิ์ 100% (Pure Salt)', description: 'ดวงซวยสุดๆ สุ่มได้เกลือเวทมนตร์ ปลอบใจไว้ใส่ต้มยำนะ!', image_url: '/images/rewards/salt.png', rarity: 'COMMON', valueTag: 'SALT 100%' },
    { id: 'g-2', name: 'ลำโพงซาวด์บาร์ Hi-Res Gaming Soundbar', description: 'ลำโพงเกมมิ่งแถบยาว ซับวูฟเฟอร์คู่ ระบบเสียง Hi-Res', image_url: '/images/rewards/speaker.png', rarity: 'RARE', valueTag: 'Hi-Res Soundbar' },
    { id: 'g-3', name: 'ไมโครโฟน Studio Condenser Mic', description: 'ไมค์สตรีมเมอร์ พร้อมตัดเสียงรบกวน AI และปุ่ม Mute', image_url: '/images/rewards/microphone.png', rarity: 'EPIC', valueTag: 'Studio Mic' },
    { id: 'g-4', name: 'Elite Wireless Game Controller', description: 'จอยเกมส์ไร้สาย ทริกเกอร์ฮอลล์เอฟเฟกต์', image_url: '/images/rewards/controller.png', rarity: 'RARE', valueTag: 'Pro Gamepad' },
    { id: 'g-5', name: 'ROG Wireless RGB Gaming Headset', description: 'หูฟังเกมมิ่งไร้สาย 7.1 ระบบเสียงรอบทิศทาง', image_url: '/images/rewards/headset.png', rarity: 'EPIC', valueTag: '7.1 Headset' },
    { id: 'g-6', name: 'Custom RGB Mechanical Keyboard', description: 'คีย์บอร์ด Hot-swap ไฟ RGB สวยสะดุดตา', image_url: '/images/rewards/keyboard.png', rarity: 'EPIC', valueTag: 'Mech Keyboard' },
    { id: 'g-7', name: 'เก้าอี้ Ergonomic Cyber Gaming Chair', description: 'เก้าอี้เกมมิ่งเมมโมรี่โฟม ปรับเอนได้ 165 องศา', image_url: '/images/rewards/chair.png', rarity: 'EPIC', valueTag: 'Gaming Chair' },
    { id: 'g-8', name: 'แว่นตา VR Meta Gaming Headset', description: 'แว่น VR เกมมิ่งความละเอียด 4K มุมมองกว้าง 110°', image_url: '/images/rewards/vr.png', rarity: 'EPIC', valueTag: 'VR Headset' },
    { id: 'g-9', name: 'BattleStation RGB Carbon Desk', description: 'โต๊ะคอมเกมมิ่งพร้อมไฟนีออน RGB ใต้โต๊ะ', image_url: '/images/rewards/desk.png', rarity: 'LEGENDARY', valueTag: 'Gaming Desk' },
    { id: 'g-10', name: 'จอคอมโค้ง 34" Curved OLED 240Hz', description: 'จอมอนิเตอร์เกมมิ่ง Ultrawide OLED 240Hz 0.03ms', image_url: '/images/rewards/monitor.png', rarity: 'LEGENDARY', valueTag: '34" OLED 240Hz' },
    { id: 'g-11', name: 'การ์ดจอ GeForce RTX 4090 Gaming OC', description: 'กราฟิกการ์ดตัวท็อป 24GB GDDR6X 3 พัดลม', image_url: '/images/rewards/gpu.png', rarity: 'LEGENDARY', valueTag: 'RTX 4090 24G' },
    { id: 'g-12', name: 'Liquid-Cooled Custom Gaming PC', description: 'เคสคอมพิวเตอร์เกมมิ่งทาวเวอร์ สเปกท็อปสุด', image_url: '/images/rewards/pc_case.png', rarity: 'LEGENDARY', valueTag: 'Jackpot PC' },
  ],
  'Cyber Mythic Matrix': [
    { id: 'c-1', name: 'เกลือบริสุทธิ์ 100% (Pure Salt)', description: 'ดวงซวยสุดๆ สุ่มได้เกลือเวทมนตร์ ปลอบใจไว้ใส่ต้มยำนะ!', image_url: '/images/rewards/salt.png', rarity: 'COMMON', valueTag: 'SALT 100%' },
    { id: 'c-2', name: 'ไมโครโฟน Studio Condenser Mic', description: 'ไมค์คอนเดนเซอร์สตรีมเมอร์ AI Noise-Cancelling', image_url: '/images/rewards/microphone.png', rarity: 'EPIC', valueTag: 'Studio Mic' },
    { id: 'c-3', name: 'ROG Wireless RGB Gaming Headset', description: 'หูฟังเกมมิ่ง 7.1 AI Noise-Cancelling', image_url: '/images/rewards/headset.png', rarity: 'EPIC', valueTag: '7.1 Headset' },
    { id: 'c-4', name: 'Custom RGB Mechanical Keyboard', description: 'คีย์บอร์ดเกมมิ่ง Hot-swap สวิตช์พรีเมียม', image_url: '/images/rewards/keyboard.png', rarity: 'EPIC', valueTag: 'Mech Keyboard' },
    { id: 'c-5', name: 'เก้าอี้ Ergonomic Cyber Gaming Chair', description: 'เก้าอี้เกมมิ่งเมมโมรี่โฟม ปรับเอนได้ 165 องศา', image_url: '/images/rewards/chair.png', rarity: 'EPIC', valueTag: 'Gaming Chair' },
    { id: 'c-6', name: 'แว่นตา VR Meta Gaming Headset', description: 'แว่น VR เกมมิ่งความละเอียด 4K มุมมอง 110°', image_url: '/images/rewards/vr.png', rarity: 'EPIC', valueTag: 'VR Headset' },
    { id: 'c-7', name: 'BattleStation RGB Carbon Desk', description: 'โต๊ะคอมเกมมิ่ง Ergonomic อุปกรณ์จัดสายครบครัน', image_url: '/images/rewards/desk.png', rarity: 'LEGENDARY', valueTag: 'Gaming Desk' },
    { id: 'c-8', name: 'จอคอมโค้ง 34" Curved OLED 240Hz', description: 'จอมอนิเตอร์จอโค้ง Ultrawide 34 นิ้ว OLED 240Hz', image_url: '/images/rewards/monitor.png', rarity: 'LEGENDARY', valueTag: '34" OLED 240Hz' },
    { id: 'c-9', name: 'การ์ดจอ GeForce RTX 4090 Gaming OC', description: 'การ์ดจอตัวท็อป 24GB GDDR6X สถาปัตยกรรม Ada', image_url: '/images/rewards/gpu.png', rarity: 'LEGENDARY', valueTag: 'RTX 4090 24G' },
    { id: 'c-10', name: 'Liquid-Cooled Custom Gaming PC', description: 'เคสคอมพิวเตอร์เกมมิ่ง ชุดน้ำเปิด ไฟ ARGB ทรงพลัง', image_url: '/images/rewards/pc_case.png', rarity: 'LEGENDARY', valueTag: 'Jackpot PC' },
    { id: 'c-11', name: '1,000 Coins Grand Prize', description: 'รางวัลใหญ่ 1,000 เหรียญทองก้อนโต', image_url: '/images/packages/tier4.jpg', rarity: 'EPIC', valueTag: '1,000 Coins' },
    { id: 'c-12', name: '3,000 Coins Mythic Jackpot', description: 'แจ็กพอตสูงสุด 3,000 เหรียญทองคำ', image_url: '/images/packages/tier6.jpg', rarity: 'LEGENDARY', valueTag: '3,000 Coins' },
  ],
};

export const RewardRevealModal: React.FC<RewardRevealModalProps> = ({
  isOpen,
  onClose,
  result,
  box,
  isOpening,
  onStartDraw,
  onDrawAgain,
  userBalance,
  openTopupModal,
}) => {
  const [gridItems, setGridItems] = useState<GridSlotItem[]>([]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [trailSlot, setTrailSlot] = useState<number | null>(null);
  const [winningSlot, setWinningSlot] = useState<number | null>(null);
  const [isStepping, setIsStepping] = useState<boolean>(false);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [showWinnerPopup, setShowWinnerPopup] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // Lock body scroll completely while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Celebratory fireworks explosion & confetti celebration ("ฉลอง พลุแตก")
  const triggerConfetti = (rarity: string, isSalt = false) => {
    // Critical: zIndex must be higher than winner modal z-[100000]
    const celebrationZIndex = 100005;

    if (isSalt) {
      // Fun salt crystals burst (silver, ice blue, white)
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#94A3B8', '#CBD5E1', '#E2E8F0', '#38BDF8', '#FFFFFF'],
        zIndex: celebrationZIndex,
      });
      return;
    }

    // Curated high-energy festival colors per rarity
    const palette =
      rarity === 'LEGENDARY'
        ? ['#F59E0B', '#FBBF24', '#FDE047', '#EF4444', '#EC4899', '#8B5CF6', '#10B981']
        : rarity === 'EPIC'
        ? ['#A855F7', '#C084FC', '#D946EF', '#EC4899', '#818CF8', '#F59E0B']
        : rarity === 'RARE'
        ? ['#06B6D4', '#38BDF8', '#60A5FA', '#34D399', '#F59E0B', '#A78BFA']
        : ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#FBBF24', '#06B6D4']; // Bright colorful fireworks for COMMON!

    const baseCount = rarity === 'LEGENDARY' ? 120 : rarity === 'EPIC' ? 90 : rarity === 'RARE' ? 70 : 60;

    // 1. Immediate Center Fireworks Explosion ("พลุแตกกลางจอ")
    confetti({
      particleCount: baseCount,
      spread: 100,
      startVelocity: 48,
      origin: { x: 0.5, y: 0.5 },
      colors: palette,
      zIndex: celebrationZIndex,
    });

    // 2. Left Fireworks Cannon ("ยิงพลุเฉียงขึ้นจากฝั่งซ้าย")
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

    // 3. Right Fireworks Cannon ("ยิงพลุเฉียงขึ้นจากฝั่งขวา")
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

    // 4. Secondary Grand Fireworks Cascade ("พลุระเบิดชุดสอง ระยิบระยับ")
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

  // Build the 12-slot board items with real database rewards configured in backoffice
  const build12GridItems = (
    currentBox: MysteryBox | null,
    boxName: string,
    wonReward: any
  ): { items: GridSlotItem[]; targetIndex: number } => {
    let rawList: GridSlotItem[] = [];

    // If box has real rewards configured by admin in backoffice
    if (currentBox && currentBox.rewards && currentBox.rewards.length > 0) {
      rawList = currentBox.rewards.map((r, idx) => ({
        id: r.id || `r-${idx}`,
        name: r.name,
        description: r.description || '',
        image_url: r.image_url || FALLBACK_IMAGE,
        rarity: (r.rarity as any) || 'COMMON',
        valueTag: r.value || (r.probability_percent ? `${r.probability_percent}%` : ''),
      }));
    }

    let items: GridSlotItem[] = [];
    if (rawList.length > 0) {
      // Systematically populate all 12 slots using the configured database rewards
      while (items.length < 12) {
        for (const r of rawList) {
          if (items.length < 12) {
            items.push({ ...r, id: `slot-${items.length}` });
          }
        }
      }
    } else {
      // Fallback pool if box has no rewards mapped yet
      const preset = CURATED_POOLS[boxName] || CURATED_POOLS['Bronze Chest'];
      items = preset.map((it, idx) => ({ ...it, id: `slot-${idx}` }));
    }

    let targetIndex = wonReward ? items.findIndex((it) => it.name === wonReward.name) : -1;

    if (wonReward) {
      if (targetIndex === -1) {
        targetIndex = 7;
        items[targetIndex] = {
          id: `win-${wonReward.id || 7}`,
          name: wonReward.name,
          description: wonReward.description,
          image_url: wonReward.image_url,
          rarity: wonReward.rarity,
          valueTag: wonReward.value || 'Special Reward',
          code: wonReward.code,
          bonusCredited: wonReward.bonusCredited,
        };
      } else {
        items[targetIndex] = {
          ...items[targetIndex],
          code: wonReward.code,
          bonusCredited: wonReward.bonusCredited,
        };
      }
    }

    return { items, targetIndex };
  };

  // Step-by-step runner along the 12 cells
  const startGridStepping = (targetSlotIndex: number) => {
    clearTimer();
    setIsStepping(true);
    setIsRevealed(false);
    setShowWinnerPopup(false);
    setWinningSlot(null);

    let currentSlot = activeSlot !== null ? activeSlot : 0;
    setActiveSlot(currentSlot);

    const fullLoops = 3;
    const stepsToTarget = (targetSlotIndex - currentSlot + GRID_TOTAL_SLOTS) % GRID_TOTAL_SLOTS;
    const totalSteps = fullLoops * GRID_TOTAL_SLOTS + stepsToTarget;

    let stepCount = 0;

    const stepNext = () => {
      if (stepCount >= totalSteps) {
        setTrailSlot(null);
        setActiveSlot(targetSlotIndex);
        setWinningSlot(targetSlotIndex);
        setIsStepping(false);
        setIsRevealed(true);
        setShowWinnerPopup(true);

        const wonRarity = result?.reward.rarity || 'COMMON';
        const isSalt = !!(
          result?.reward.name &&
          (result.reward.name.includes('เกลือ') || result.reward.name.toLowerCase().includes('salt'))
        );
        playWinSound(wonRarity, isSalt);
        triggerConfetti(wonRarity, isSalt);
        return;
      }

      setTrailSlot(currentSlot);
      currentSlot = (currentSlot + 1) % GRID_TOTAL_SLOTS;
      setActiveSlot(currentSlot);
      playTickSound();
      stepCount++;

      const progress = stepCount / totalSteps;
      let delay = 50;

      if (progress > 0.6 && progress <= 0.8) {
        delay = 95 + (progress - 0.6) * 350;
      } else if (progress > 0.8 && progress <= 0.92) {
        delay = 180 + (progress - 0.8) * 800;
      } else if (progress > 0.92) {
        delay = 320 + (progress - 0.92) * 1400;
      }

      timerRef.current = setTimeout(stepNext, delay);
    };

    timerRef.current = setTimeout(stepNext, 70);
  };

  useEffect(() => {
    if (!isOpen) {
      clearTimer();
      setActiveSlot(null);
      setTrailSlot(null);
      setWinningSlot(null);
      setIsStepping(false);
      setIsRevealed(false);
      setShowWinnerPopup(false);
      return;
    }

    if (result && result.reward) {
      const { items, targetIndex } = build12GridItems(box, box?.name || result.boxName, result.reward);
      setGridItems(items);
      startGridStepping(targetIndex);
    } else if (box) {
      // Standby Preview: populate board with 12 items from real database configuration!
      const { items } = build12GridItems(box, box.name, null);
      setGridItems(items);
      setActiveSlot(null);
      setWinningSlot(null);
      setIsStepping(false);
      setIsRevealed(false);
      setShowWinnerPopup(false);
    }
  }, [isOpen, result, box]);

  const handleSkip = () => {
    if (!result) return;
    clearTimer();

    const targetIdx = gridItems.findIndex((it) => it.name === result.reward.name);
    const finalIdx = targetIdx !== -1 ? targetIdx : 7;

    setTrailSlot(null);
    setActiveSlot(finalIdx);
    setWinningSlot(finalIdx);
    setIsStepping(false);
    setIsRevealed(true);
    setShowWinnerPopup(true);

    const wonRarity = result.reward.rarity || 'COMMON';
    const isSalt = !!(
      result.reward.name &&
      (result.reward.name.includes('เกลือ') || result.reward.name.toLowerCase().includes('salt'))
    );
    playWinSound(wonRarity, isSalt);
    triggerConfetti(wonRarity, isSalt);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!isOpen) return null;

  const wonReward = result?.reward;
  const wonRarityTheme = wonReward ? RARITY_THEMES[wonReward.rarity] || RARITY_THEMES.COMMON : RARITY_THEMES.COMMON;
  const isBalanceInsufficient =
    userBalance !== undefined && box !== null && userBalance < box.price;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/90 select-none">
      {/* ═══ Main Vault Machine Cabinet — Spacious Scale matching Image 3 Reference ═══ */}
      <div className="relative w-[94vw] max-w-6xl xl:max-w-7xl max-h-[90vh] flex flex-col justify-between bg-[#0B0C11] border border-amber-500/25 hover:border-amber-500/35 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(245,158,11,0.08)] overflow-hidden my-auto transition-all">
        {/* Subtle Top Ambient Gold Spotlight & Hairline Accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent pointer-events-none" />

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* HEADER MARQUEE — Generous & High-Contrast Typography          */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <div className="flex items-center justify-between gap-3 pb-2.5 mb-2.5 border-b border-amber-500/20 relative z-20">
          {/* Left: Box 3D Avatar & Info */}
          <div className="flex items-center gap-3 sm:gap-3.5">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-black/40 border border-amber-500/30 p-1 flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-black/60 pointer-events-none" />
              <img
                src={box?.imageUrl || FALLBACK_IMAGE}
                alt={box?.name || 'Box'}
                className="w-full h-full object-contain relative z-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                style={{
                  maskImage: 'radial-gradient(circle at 50% 50%, black 60%, transparent 88%)',
                  WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 60%, transparent 88%)',
                }}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                <span className="text-lg sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                  {box?.name || result?.boxName || 'Mystery Box'}
                </span>
                <span className="px-3 py-0.5 rounded-xl text-xs sm:text-sm font-black bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-sm">
                  ฿{box?.price.toFixed(0)}
                </span>
                {userBalance !== undefined && (
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-200 bg-stone-900/90 px-3 py-0.5 rounded-xl border border-stone-800 shadow-sm">
                    <Wallet className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>คงเหลือ ฿{userBalance.toLocaleString('th-TH', { minimumFractionDigits: 0 })}</span>
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-stone-300 flex items-center gap-2 mt-0.5 font-bold">
                {isRevealed ? (
                  <span className="text-white font-extrabold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    ยินดีด้วย! สุ่มสำเร็จ — ได้รับรางวัลแล้ว 🎉
                  </span>
                ) : isStepping ? (
                  <span className="text-amber-300 font-extrabold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-spin flex-shrink-0" />
                    ไฟกำลังวิ่งสลับช่อง... ลุ้นหยุดช่องไหน ได้ชิ้นนั้น!
                  </span>
                ) : (
                  <span className="text-stone-300 font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    ตรวจดูของรางวัลทั้ง 12 ช่อง แล้วกดปุ่มเริ่มสุ่มด้านล่างเพื่อลุ้นรางวัล!
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-2">
            {!isRevealed && isStepping && (
              <button
                type="button"
                onClick={handleSkip}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-stone-900 hover:bg-stone-800 border border-amber-500/30 text-amber-300 transition"
              >
                <FastForward className="w-4 h-4 text-amber-400" />
                <span>ข้าม</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition border border-stone-800 hover:border-amber-500/30"
              title="ปิด"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* 12-SLOT GRID (4 COLUMNS x 3 ROWS) - SPACIOUS & PROMINENT      */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <div className="relative z-10 bg-[#06070A]/95 border border-amber-500/20 rounded-2xl p-2 sm:p-3 shadow-xl overflow-hidden flex-1 flex flex-col justify-center">
          {/* Subtle Cyber Grid Accent */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 relative z-10">
            {gridItems.map((item, idx) => {
              const theme = RARITY_THEMES[item.rarity] || RARITY_THEMES.COMMON;
              const isActive = activeSlot === idx;
              const isTrail = trailSlot === idx && isStepping;
              const isWinner = winningSlot === idx && isRevealed;
              const isSalt = item.name.includes('เกลือ') || item.name.toLowerCase().includes('salt');

              return (
                <div
                  key={item.id}
                  className={`group relative rounded-2xl border p-2 sm:p-2.5 flex flex-col items-center justify-between text-center min-h-[155px] sm:min-h-[165px] md:min-h-[180px] overflow-hidden transition-all duration-200 select-none ${
                    isWinner
                      ? 'border-amber-400 bg-gradient-to-b from-amber-500/25 via-amber-950/25 to-black ring-2 ring-amber-400/90 shadow-[0_0_30px_rgba(245,158,11,0.55)] scale-[1.02] z-20'
                      : isActive
                        ? 'border-amber-400 bg-gradient-to-b from-amber-500/20 to-stone-950 ring-2 ring-amber-400/75 shadow-[0_0_20px_rgba(245,158,11,0.45)] scale-[1.01] z-10'
                        : isTrail
                          ? 'border-amber-400/40 bg-stone-900/95 opacity-90'
                          : isRevealed
                            ? 'opacity-40 grayscale-[20%] border-stone-800/60 bg-[#090A0F]'
                            : isStepping
                              ? 'opacity-60 border-stone-800/70 bg-[#0B0D14]'
                              : `hover:border-amber-500/40 hover:-translate-y-0.5 hover:shadow-lg ${
                                  isSalt ? 'border-sky-500/30 bg-[#08101C]' : `${theme.cardBorder} ${theme.cardBg}`
                                }`
                  }`}
                >
                  {/* Subtle Rarity Aura Glow */}
                  <div
                    className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 ${
                      isActive || isWinner
                        ? 'opacity-60 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.22),transparent_70%)]'
                        : isSalt
                          ? 'opacity-35 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.12),transparent_70%)]'
                          : 'opacity-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02),transparent_70%)]'
                    }`}
                  />

                  {/* Top: Slot Number & Rarity Tag — flex-shrink-0 to never clip */}
                  <div className="w-full flex items-center justify-between gap-1 mb-0.5 relative z-10 flex-shrink-0">
                    <span
                      className={`text-[10px] sm:text-xs font-mono font-extrabold px-1.5 py-0.5 rounded-md border tracking-wider transition-colors shadow-sm ${
                        isActive || isWinner
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'text-stone-400 bg-black/60 border-stone-800'
                      }`}
                    >
                      #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>

                    {isSalt ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] uppercase tracking-wider font-black flex items-center gap-1 shadow-sm bg-gradient-to-r from-sky-400 via-indigo-400 to-pink-500 text-black">
                        <span>🧂</span>
                        <span>เกลือ (SALT)</span>
                      </span>
                    ) : (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] uppercase tracking-wider font-black flex items-center gap-1 shadow-sm ${theme.badgeBg}`}
                      >
                        <span className={theme.badgeIconColor}>{theme.icon}</span>
                        <span>{theme.label}</span>
                      </span>
                    )}
                  </div>

                  {/* Center: Image / Icon — Responsive height so it never pushes content out of view */}
                  <div className="relative my-0.5 flex items-center justify-center w-full flex-1 min-h-[64px] max-h-[82px] sm:max-h-[92px]">
                    <div className="relative w-full h-full max-w-[95px] sm:max-w-[110px] flex items-center justify-center">
                      <RewardVisual
                        name={item.name}
                        imageUrl={item.image_url}
                        rarity={item.rarity}
                        isWinner={isWinner}
                        isActive={isActive}
                      />
                    </div>
                  </div>

                  {/* Bottom: Item Name & Value Tag — flex-shrink-0 to ensure 100% visible */}
                  <div className="w-full mt-0.5 relative z-10 flex flex-col items-center flex-shrink-0">
                    <h4
                      className={`font-black text-xs sm:text-[13px] leading-snug line-clamp-1 truncate tracking-tight w-full px-1 drop-shadow-sm ${
                        isWinner
                          ? 'text-amber-300 font-black'
                          : isActive
                            ? 'text-white'
                            : isSalt
                              ? 'text-sky-200 group-hover:text-white'
                              : 'text-stone-100 group-hover:text-amber-200'
                      }`}
                      title={item.name}
                    >
                      {item.name}
                    </h4>
                    {item.valueTag && (
                      <span className={`text-[9px] sm:text-[10px] font-mono font-bold block truncate mt-0.5 py-0.5 px-2 rounded-md border tracking-wide shadow-sm ${
                        isSalt
                          ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/25'
                      }`}>
                        {item.valueTag}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* BOTTOM ACTION & WINNER SHOWCASE BAR — Compact, Zero Scrolling */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <div className="mt-2.5 pt-2.5 border-t border-amber-500/20 relative z-20">
          {isRevealed && wonReward ? (
            /* Streamlined Winner Bar: Compact single-row banner that fits inside standard height */
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-[#0E1017] border border-amber-500/30 rounded-xl px-3 py-1.5 animate-in fade-in duration-200">
              {/* Left: Winner Identity Chip */}
              <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
                <div
                  className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg border ${wonRarityTheme.cardBorder} bg-black/60 p-0.5 flex-shrink-0 flex items-center justify-center overflow-hidden`}
                >
                  <RewardVisual
                    name={wonReward.name}
                    imageUrl={wonReward.image_url}
                    rarity={wonReward.rarity}
                    isWinner={true}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-black uppercase flex items-center gap-0.5 ${wonRarityTheme.badgeBg}`}
                    >
                      <span className={wonRarityTheme.badgeIconColor}>{wonRarityTheme.icon}</span>
                      {wonRarityTheme.label}
                    </span>
                    {wonReward.name.includes('เกลือ') || wonReward.name.toLowerCase().includes('salt') ? (
                      <span className="text-[11px] text-rose-400 font-bold flex items-center gap-1">
                        <span>🧂</span>
                        <span>ดวงซวย! สุ่มได้เกลือ 100% ปลอบใจไว้ใส่ต้มยำนะ</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span>ยินดีด้วย! คุณได้รับรางวัลนี้</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white truncate leading-tight">
                    {wonReward.name}
                  </h3>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0 w-full sm:w-auto justify-end">
                {wonReward.code && (
                  <button
                    type="button"
                    onClick={() => handleCopyCode(wonReward.code!)}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 flex items-center gap-1 font-semibold transition"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3 h-3 text-amber-400" />
                        <span className="text-amber-400">คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-stone-400" />
                        <span>{wonReward.code}</span>
                      </>
                    )}
                  </button>
                )}

                {onDrawAgain && (
                  <button
                    type="button"
                    onClick={onDrawAgain}
                    disabled={isBalanceInsufficient}
                    className={`py-1.5 px-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition ${
                      isBalanceInsufficient
                        ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                        : 'bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-sm active:scale-95'
                    }`}
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>สุ่มอีกครั้ง {box ? `(฿${box.price.toFixed(0)})` : ''}</span>
                  </button>
                )}

                <Link
                  to="/inventory"
                  onClick={onClose}
                  className="py-1.5 px-3 rounded-xl font-semibold text-xs text-stone-200 bg-stone-900 hover:bg-stone-800 border border-stone-700 flex items-center gap-1 transition"
                >
                  <span>ดูในคลัง</span>
                  <ArrowRight className="w-3 h-3 text-stone-400" />
                </Link>

                <button
                  type="button"
                  onClick={onClose}
                  className="py-1.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-xs font-semibold text-stone-400 hover:text-white transition border border-stone-800"
                >
                  ปิด
                </button>
              </div>
            </div>
          ) : isStepping ? (
            <div className="flex items-center justify-between text-xs text-stone-400 px-2 py-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>แสงไฟกำลังวิ่งสุ่มสลับทีละช่อง... ไฟหยุดช่องไหน ได้รับไอเทมชิ้นนั้นทันที</span>
              </span>
              <span className="font-mono text-amber-500/70 font-bold tracking-wider text-[10px]">
                12-SLOTS LUCKY VAULT
              </span>
            </div>
          ) : (
            /* Standby State: User opened modal, has not spun yet! */
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-1 py-0.5">
              <div className="flex items-center gap-1.5 text-xs sm:text-[13px] font-medium text-stone-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>ตรวจดูของรางวัลทั้ง 12 ช่องเรียบร้อยแล้ว กดปุ่มเพื่อเริ่มสุ่มได้ทันที</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={isBalanceInsufficient && openTopupModal ? openTopupModal : onStartDraw}
                  disabled={isOpening}
                  className={`flex-1 sm:flex-initial py-2 px-6 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition ${
                    isBalanceInsufficient
                      ? 'bg-stone-900 text-amber-400 border border-amber-500/40 hover:bg-stone-800'
                      : 'bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-md active:scale-95'
                  }`}
                >
                  {isOpening ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin text-stone-950" />
                      <span>กำลังสุ่มรางวัล...</span>
                    </>
                  ) : isBalanceInsufficient ? (
                    <>
                      <Wallet className="w-3.5 h-3.5" />
                      <span>เครดิตไม่พอ (กดเพื่อเติมเงิน)</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-stone-950" />
                      <span>เริ่มสุ่มรางวัล {box ? `(฿${box.price.toFixed(0)})` : ''}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="py-2 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-xs sm:text-sm font-bold text-stone-300 hover:text-white transition border border-stone-800 hover:border-amber-500/30"
                >
                  ปิด
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* CENTER POPUP WINNER REVEAL MODAL — Pops up in Center of Screen upon Winning */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {showWinnerPopup && isRevealed && wonReward && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 select-none">
          <div className="relative w-full max-w-md bg-[#0B0C11] border border-amber-500/30 rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(245,158,11,0.15)] text-center overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Top Ambient Gold Spotlight & Hairline Accent */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-48 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
            <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent pointer-events-none" />

            {/* Close button (returns to inspect the board) */}
            <button
              type="button"
              onClick={() => setShowWinnerPopup(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center border border-stone-800 hover:border-amber-500/30 transition"
              title="ปิดหน้าต่างนี้"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Congratulations or Salty */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg ${
                wonReward.name.includes('เกลือ') || wonReward.name.toLowerCase().includes('salt')
                  ? 'bg-rose-500/15 border border-rose-500/40 text-rose-300'
                  : 'bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border border-amber-500/50 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
              }`}>
                {wonReward.name.includes('เกลือ') || wonReward.name.toLowerCase().includes('salt') ? (
                  <>
                    <span className="text-base">🧂</span>
                    <span>ดวงซวย! สุ่มได้เกลือบริสุทธิ์ (Salty Gacha)</span>
                  </>
                ) : (
                  <>
                    <span className="text-base animate-bounce">🎉</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                    <span>ขอแสดงความยินดีด้วย! คุณได้รับรางวัล</span>
                    <span className="text-base animate-bounce">✨</span>
                  </>
                )}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 mb-3">
              {box?.name || 'Mystery Box'}
            </h2>

            {/* Large Center Item Visual with Rotating Celebration Rays */}
            <div className="relative my-4 flex items-center justify-center">
              {/* Rotating Celebration Sunburst Aura */}
              <div
                className="absolute w-56 h-56 -inset-6 m-auto rounded-full pointer-events-none opacity-40 animate-[spin_15s_linear_infinite]"
                style={{
                  willChange: 'transform',
                  transform: 'translateZ(0)',
                  background:
                    'conic-gradient(from 0deg, rgba(245,158,11,0.45) 0deg 15deg, transparent 15deg 30deg, rgba(245,158,11,0.45) 30deg 45deg, transparent 45deg 60deg, rgba(245,158,11,0.45) 60deg 75deg, transparent 75deg 90deg, rgba(245,158,11,0.45) 90deg 105deg, transparent 105deg 120deg, rgba(245,158,11,0.45) 120deg 135deg, transparent 135deg 150deg, rgba(245,158,11,0.45) 150deg 165deg, transparent 165deg 180deg, rgba(245,158,11,0.45) 180deg 195deg, transparent 195deg 210deg, rgba(245,158,11,0.45) 210deg 225deg, transparent 225deg 240deg, rgba(245,158,11,0.45) 240deg 255deg, transparent 255deg 270deg, rgba(245,158,11,0.45) 270deg 285deg, transparent 285deg 300deg, rgba(245,158,11,0.45) 300deg 315deg, transparent 315deg 330deg, rgba(245,158,11,0.45) 330deg 345deg, transparent 345deg 360deg)',
                  maskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)',
                  WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)',
                }}
              />
              <div className="absolute inset-0 w-48 h-48 mx-auto rounded-full bg-amber-500/25 blur-2xl pointer-events-none animate-pulse" />

              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-[#07080B] border border-amber-500/40 p-3 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.35)]">
                {/* Subtle pulse ring around item */}
                <div className="absolute inset-0 rounded-2xl border border-amber-400/40 animate-ping pointer-events-none opacity-20" />
                <RewardVisual
                  name={wonReward.name}
                  imageUrl={wonReward.image_url}
                  rarity={wonReward.rarity}
                  isWinner={true}
                />
              </div>
            </div>

            {/* Rarity & Item Name */}
            <div className="space-y-1.5 mb-4">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-sm ${wonRarityTheme.badgeBg}`}
              >
                <span className={wonRarityTheme.badgeIconColor}>{wonRarityTheme.icon}</span>
                <span>{wonRarityTheme.label}</span>
              </span>

              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {wonReward.name}
              </h3>

              {wonReward.description && (
                <p className="text-xs text-stone-300 line-clamp-2 px-2">
                  {wonReward.description}
                </p>
              )}
            </div>

            {/* Redeem Code if any */}
            {wonReward.code && (
              <div className="mb-4 p-2.5 rounded-xl bg-stone-900/90 border border-stone-800 flex items-center justify-between gap-2 text-left">
                <div className="min-w-0">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">โค้ดรางวัลของคุณ:</span>
                  <code className="text-xs font-mono font-bold text-amber-300 truncate block">
                    {wonReward.code}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(wonReward.code!)}
                  className="flex-shrink-0 text-xs text-stone-300 hover:text-white font-medium flex items-center gap-1 bg-stone-800 hover:bg-stone-700 px-3 py-1.5 rounded-lg border border-stone-700 transition"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-amber-400 font-bold">คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอก</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Bonus Credit badge if any */}
            {Boolean(wonReward.bonusCredited && wonReward.bonusCredited > 0) && (
              <div className="mb-4 py-1.5 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>เครดิตโบนัส +฿{wonReward.bonusCredited} เข้ากระเป๋าเรียบร้อยแล้ว</span>
              </div>
            )}

            {/* Bottom Action Buttons */}
            <div className="space-y-2 mt-4">
              {onDrawAgain && (
                <button
                  type="button"
                  onClick={() => {
                    setShowWinnerPopup(false);
                    onDrawAgain();
                  }}
                  disabled={isBalanceInsufficient}
                  className={`w-full py-3 px-5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition ${
                    isBalanceInsufficient
                      ? 'bg-stone-900 text-stone-500 cursor-not-allowed border border-stone-800'
                      : 'bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-md active:scale-95'
                  }`}
                >
                  <RotateCw className="w-4 h-4" />
                  <span>สุ่มอีกครั้ง {box ? `(฿${box.price.toFixed(0)})` : ''}</span>
                </button>
              )}

              <div className="flex items-center gap-2">
                <Link
                  to="/inventory"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-3.5 rounded-xl font-bold text-xs sm:text-sm text-stone-200 bg-stone-900 hover:bg-stone-800 border border-stone-800 flex items-center justify-center gap-1.5 transition"
                >
                  <span>ดูในคลัง</span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
                </Link>

                <button
                  type="button"
                  onClick={() => setShowWinnerPopup(false)}
                  className="flex-1 py-2.5 px-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-xs sm:text-sm font-bold text-stone-300 hover:text-white transition border border-stone-800 hover:border-amber-500/30"
                >
                  ตรวจดูตาราง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

export default RewardRevealModal;
