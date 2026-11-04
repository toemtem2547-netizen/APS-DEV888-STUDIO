import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Upload,
  RefreshCw,
  Palette,
  Layers,
  Crown,
  Flame,
  Zap,
  CircleDot,
  Wand2,
  Sliders,
  Target,
  Image as ImageIcon,
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { WheelItem, Reward } from '../../types';

const RARITY_THEMES: Record<string, { badgeBg: string; text: string; icon: React.ReactNode }> = {
  LEGENDARY: { badgeBg: 'bg-amber-400 text-zinc-950', text: 'text-amber-400', icon: <Crown className="w-3 h-3" /> },
  EPIC: { badgeBg: 'bg-purple-600 text-white', text: 'text-purple-400', icon: <Flame className="w-3 h-3" /> },
  RARE: { badgeBg: 'bg-sky-500 text-zinc-950', text: 'text-sky-400', icon: <Zap className="w-3 h-3" /> },
  COMMON: { badgeBg: 'bg-zinc-700 text-zinc-200', text: 'text-zinc-400', icon: <CircleDot className="w-3 h-3" /> },
};

const GAME_PRESET_IMAGES = [
  { name: 'Liquid-Cooled Custom Gaming PC', subtitle: 'คอมพิวเตอร์เกมมิ่งระดับไฮเอนด์', url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=300&auto=format&fit=crop&q=80', rarity: 'LEGENDARY' as const, color: '#B45309', defaultRate: 0.21 },
  { name: 'GeForce RTX 4090 Gaming OC', subtitle: 'การ์ดจอตัวท็อปประสิทธิภาพสูงสุด', url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&auto=format&fit=crop&q=80', rarity: 'LEGENDARY' as const, color: '#B45309', defaultRate: 0.32 },
  { name: 'จอโค้ง 34" OLED 240Hz', subtitle: 'จอมอนิเตอร์เกมมิ่งอัลตร้าไวด์', url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&auto=format&fit=crop&q=80', rarity: 'LEGENDARY' as const, color: '#B45309', defaultRate: 0.53 },
  { name: '3,000 COINS', subtitle: 'แจ็คพอตใหญ่ระดับ Mythic', url: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=300&auto=format&fit=crop&q=80', rarity: 'LEGENDARY' as const, color: '#B45309', defaultRate: 0.85 },
  { name: 'BattleStation RGB Desk', subtitle: 'โต๊ะเกมมิ่งไฟฟ้าปรับระดับ', url: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=300&auto=format&fit=crop&q=80', rarity: 'LEGENDARY' as const, color: '#B45309', defaultRate: 0.64 },
  { name: 'VR Gaming Headset', subtitle: 'แว่นตา VR ประสบการณ์ 3D', url: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=300&auto=format&fit=crop&q=80', rarity: 'EPIC' as const, color: '#6028D9', defaultRate: 1.26 },
  { name: 'Cyber Gaming Chair', subtitle: 'เก้าอี้เกมมิ่งหนังแท้ Ergonomic', url: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=300&auto=format&fit=crop&q=80', rarity: 'EPIC' as const, color: '#6028D9', defaultRate: 1.60 },
  { name: 'Custom Mechanical Keyboard', subtitle: 'คีย์บอร์ดกลไกสวิตช์สัมผัสพรีเมียม', url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=300&auto=format&fit=crop&q=80', rarity: 'EPIC' as const, color: '#6028D9', defaultRate: 2.13 },
  { name: 'Hi-Res Spatial Audio Headset', subtitle: 'หูฟังเกมมิ่งระบบเสียงรอบทิศทาง', url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&auto=format&fit=crop&q=80', rarity: 'EPIC' as const, color: '#6028D9', defaultRate: 2.34 },
  { name: 'Studio USB Microphone', subtitle: 'ไมโครโฟนสำหรับสตรีมเมอร์เสียงคมชัด', url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&auto=format&fit=crop&q=80', rarity: 'EPIC' as const, color: '#6028D9', defaultRate: 2.66 },
  { name: '1,000 COINS', subtitle: 'เครดิตกระเป๋าตังค์โบนัสใหญ่', url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=300&auto=format&fit=crop&q=80', rarity: 'EPIC' as const, color: '#6028D9', defaultRate: 2.98 },
  { name: 'Ultra-Light Wireless Mouse', subtitle: 'เมาส์เกมมิ่งไร้สายน้ำหนักเบาพิเศษ', url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&auto=format&fit=crop&q=80', rarity: 'EPIC' as const, color: '#6028D9', defaultRate: 3.19 },
  { name: 'RGB Extended Mousepad', subtitle: 'แผ่นรองเมาส์ขนาดใหญ่ไฟรอบขอบ', url: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=300&auto=format&fit=crop&q=80', rarity: 'RARE' as const, color: '#0369A1', defaultRate: 3.82 },
  { name: 'Aluminum Headphone Stand', subtitle: 'ขาตั้งหูฟังพร้อมพอร์ต USB Hub', url: 'https://images.unsplash.com/photo-1584679109597-c656b19974c9?w=300&auto=format&fit=crop&q=80', rarity: 'RARE' as const, color: '#0369A1', defaultRate: 4.25 },
  { name: '4K Ultra HD Webcam', subtitle: 'กล้องเว็บแคมสำหรับสตรีมเกมระดับ 4K', url: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=300&auto=format&fit=crop&q=80', rarity: 'RARE' as const, color: '#0369A1', defaultRate: 4.67 },
  { name: 'Smart Key Light Panel', subtitle: 'ไฟสตูดิโอปรับอุณหภูมิแสงได้', url: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=300&auto=format&fit=crop&q=80', rarity: 'RARE' as const, color: '#0369A1', defaultRate: 5.10 },
  { name: '500 COINS', subtitle: 'เครดิตเปิดการ์ดเพิ่มเติม', url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=300&auto=format&fit=crop&q=80', rarity: 'RARE' as const, color: '#0369A1', defaultRate: 5.52 },
  { name: 'เปิดการ์ดฟรีอีกครั้ง (Free Respin)', subtitle: 'สิทธิ์เลือกไพ่ฟรีใหม่อีก 1 รอบ', url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80', rarity: 'RARE' as const, color: '#0369A1', defaultRate: 6.38 },
  { name: '200 COINS', subtitle: 'เหรียญสะสมพูลเงินสด', url: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=300&auto=format&fit=crop&q=80', rarity: 'COMMON' as const, color: '#334155', defaultRate: 8.50 },
  { name: '100 COINS', subtitle: 'เหรียญสะสมคืนทุน', url: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=300&auto=format&fit=crop&q=80', rarity: 'COMMON' as const, color: '#334155', defaultRate: 9.56 },
  { name: '50 COINS', subtitle: 'เหรียญสะสมปลอบใจ', url: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=300&auto=format&fit=crop&q=80', rarity: 'COMMON' as const, color: '#334155', defaultRate: 10.63 },
  { name: 'Gaming Sticker Pack', subtitle: 'สติกเกอร์ตกแต่งเคสกันน้ำ', url: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=300&auto=format&fit=crop&q=80', rarity: 'COMMON' as const, color: '#334155', defaultRate: 9.56 },
  { name: 'Silicone Cable Organizer', subtitle: 'ตัวจัดระเบียบสายไฟบนโต๊ะคอม', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80', rarity: 'COMMON' as const, color: '#334155', defaultRate: 4.88 },
  { name: 'Microfiber Screen Cloth', subtitle: 'ผ้าเช็ดหน้าจอเกรดพรีเมียม', url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&auto=format&fit=crop&q=80', rarity: 'COMMON' as const, color: '#334155', defaultRate: 3.99 },
];

export const WheelAdminPage: React.FC = () => {
  const [items, setItems] = useState<WheelItem[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Single Create/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<WheelItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 2. Batch Rate Configurator Modal State (All-in-one Single Page Rate Configurator)
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchItems, setBatchItems] = useState<WheelItem[]>([]);
  const [batchSuccess, setBatchSuccess] = useState(false);
  const [selectedRewardToAdd, setSelectedRewardToAdd] = useState<number>(0);
  const [rateToAdd, setRateToAdd] = useState<number>(5.0);
  const [isSavingBatch, setIsSavingBatch] = useState(false);

  // 3. Card/Reward Customizer Sub-Modal State
  const [isRewardEditModalOpen, setIsRewardEditModalOpen] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [editCardName, setEditCardName] = useState('');
  const [editCardSubtitle, setEditCardSubtitle] = useState('');
  const [editCardIconUrl, setEditCardIconUrl] = useState('');
  const [editCardRarity, setEditCardRarity] = useState<'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'>('COMMON');
  const [editCardColor, setEditCardColor] = useState('#B45309');
  const [isSubModalUploading, setIsSubModalUploading] = useState(false);

  // 4. Card Back Cover Modal State
  const [isCardBackModalOpen, setIsCardBackModalOpen] = useState(false);
  const [cardBackUrl, setCardBackUrl] = useState('/images/tarot_card_back.jpg');
  const [isCardBackUploading, setIsCardBackUploading] = useState(false);
  const [isSavingCardBack, setIsSavingCardBack] = useState(false);

  // Form State for Single Create/Edit
  const [formData, setFormData] = useState({
    reward_id: 0,
    label: '',
    subtitle: '',
    icon_url: '',
    color: '#B45309',
    text_color: '#FFFFFF',
    rarity: 'COMMON' as 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY',
    weight: 5.0,
    is_active: true,
    sort_order: 1,
  });

  const COLOR_PRESETS = [
    { label: 'Gold Amber', color: '#B45309', text: '#FDE68A' },
    { label: 'Deep Purple', color: '#6D28D9', text: '#DDD6FE' },
    { label: 'Electric Blue', color: '#0369A1', text: '#BAE6FD' },
    { label: 'Emerald Green', color: '#047857', text: '#A7F3D0' },
    { label: 'Ruby Pink', color: '#BE185D', text: '#FBCFE8' },
    { label: 'Rich Orange', color: '#C2410C', text: '#FED7AA' },
    { label: 'Dark Slate', color: '#1E293B', text: '#94A3B8' },
    { label: 'Midnight Blue', color: '#0F172A', text: '#E2E8F0' },
  ];

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getWheelItems();
      if (res.data?.success) {
        setItems(res.data.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load wheel items:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRewards = async () => {
    try {
      const res = await adminApi.getRewards();
      if (res.data?.success) {
        setRewards(res.data.data || []);
        if (res.data.data && res.data.data.length > 0 && selectedRewardToAdd === 0) {
          setSelectedRewardToAdd(res.data.data[0].id);
        }
      }
    } catch (err: any) {
      console.error('Failed to load rewards:', err);
    }
  };

  const fetchCardBack = async () => {
    try {
      const res = await adminApi.getSettings();
      if (res.data?.success && res.data.data?.game_wheel_card_back) {
        setCardBackUrl(res.data.data.game_wheel_card_back);
      }
    } catch (err: any) {
      console.error('Failed to load card back settings:', err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchRewards();
    fetchCardBack();

    // Auto open modal if URL contains ?openWeights=true
    const params = new URLSearchParams(window.location.search);
    if (params.get('openWeights') === 'true') {
      openBatchRateModal();
    }
  }, []);

  const totalRate = items.reduce((sum, it) => sum + (parseFloat(String(it.weight || 0)) || 0), 0);
  const batchTotalRate = batchItems.reduce((sum, it) => sum + (parseFloat(String(it.weight || 0)) || 0), 0);

  // ═════════════════════════════════════════════════════════════════
  // BATCH RATE CONFIGURATOR HANDLERS (ALL-IN-ONE SCREEN)
  // ═════════════════════════════════════════════════════════════════
  const openBatchRateModal = () => {
    setBatchItems(items.length > 0 ? JSON.parse(JSON.stringify(items)) : []);
    setIsBatchModalOpen(true);
  };

  const handleBatchRateChange = (index: number, newRate: number) => {
    setBatchItems((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        const val = isNaN(newRate) ? 0 : Math.max(0, newRate);
        updated[index] = {
          ...updated[index],
          weight: val,
        };
      }
      return updated;
    });
  };

  const handleBatchRemoveItem = (index: number) => {
    setBatchItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBatchAddItem = () => {
    const rw = rewards.find((r) => r.id === selectedRewardToAdd);
    if (!rw) return;

    let defaultColor = '#B45309';
    if (rw.rarity === 'EPIC') defaultColor = '#6028D9';
    else if (rw.rarity === 'RARE') defaultColor = '#0369A1';
    else if (rw.rarity === 'COMMON') defaultColor = '#334155';

    const newItem: WheelItem = {
      id: 0,
      reward_id: rw.id,
      label: rw.name,
      subtitle: rw.value || rw.type || '',
      icon_url: (rw as any).imageUrl || (rw as any).image_url || '/images/packages/tier1.jpg',
      color: defaultColor,
      text_color: '#FFFFFF',
      rarity: (rw.rarity as any) || 'COMMON',
      weight: Math.max(0.01, rateToAdd || 5.0),
      is_active: true,
      sort_order: batchItems.length + 1,
    };

    setBatchItems((prev) => [...prev, newItem]);
  };

  const handleAutoFill24Slots = () => {
    if (rewards.length === 0) return;
    const current = [...batchItems];
    const existingLabels = new Set(current.map((it) => it.label.toLowerCase()));

    for (const rw of rewards) {
      if (current.length >= 24) break;
      if (!existingLabels.has(rw.name.toLowerCase())) {
        let defaultRate = 5.0;
        let defaultColor = '#334155';
        if (rw.rarity === 'LEGENDARY') {
          defaultRate = 0.5;
          defaultColor = '#B45309';
        } else if (rw.rarity === 'EPIC') {
          defaultRate = 2.0;
          defaultColor = '#6028D9';
        } else if (rw.rarity === 'RARE') {
          defaultRate = 4.0;
          defaultColor = '#0369A1';
        }

        current.push({
          id: 0,
          reward_id: rw.id,
          label: rw.name,
          subtitle: rw.value || rw.type || '',
          icon_url: (rw as any).imageUrl || (rw as any).image_url || '/images/packages/tier1.jpg',
          color: defaultColor,
          text_color: '#FFFFFF',
          rarity: (rw.rarity as any) || 'COMMON',
          weight: defaultRate,
          is_active: true,
          sort_order: current.length + 1,
        });
        existingLabels.add(rw.name.toLowerCase());
      }
    }
    setBatchItems(current);
  };

  // Auto balance rates to realistic casino distribution summing to exactly 100.00%
  const handleAutoBalanceRates = () => {
    if (batchItems.length === 0) return;
    const legendaryItems = batchItems.filter((b) => b.rarity === 'LEGENDARY');
    const epicItems = batchItems.filter((b) => b.rarity === 'EPIC');
    const rareItems = batchItems.filter((b) => b.rarity === 'RARE');
    const commonItems = batchItems.filter((b) => b.rarity === 'COMMON');

    const legRateEach = legendaryItems.length > 0 ? Number((2.5 / legendaryItems.length).toFixed(2)) : 0;
    const epicRateEach = epicItems.length > 0 ? Number((15.0 / epicItems.length).toFixed(2)) : 0;
    const rareRateEach = rareItems.length > 0 ? Number((30.0 / rareItems.length).toFixed(2)) : 0;
    const commonRateEach = commonItems.length > 0 ? Number((52.5 / commonItems.length).toFixed(2)) : 0;

    const updated = batchItems.map((b) => {
      let r = commonRateEach;
      if (b.rarity === 'LEGENDARY') r = legRateEach;
      else if (b.rarity === 'EPIC') r = epicRateEach;
      else if (b.rarity === 'RARE') r = rareRateEach;
      return { ...b, weight: r };
    });
    setBatchItems(updated);
  };

  // Normalize all current rates proportionally to sum to 100.00%
  const handleNormalizeTo100 = () => {
    if (batchItems.length === 0) return;
    const currentTotal = batchItems.reduce((s, it) => s + (parseFloat(String(it.weight || 0)) || 0), 0);
    if (currentTotal <= 0) return;

    const updated = batchItems.map((b) => {
      const val = parseFloat(String(b.weight || 0)) || 0;
      const normalized = Number(((val / currentTotal) * 100).toFixed(2));
      return { ...b, weight: normalized };
    });
    setBatchItems(updated);
  };

  const handleSaveBatchRates = async () => {
    try {
      setIsSavingBatch(true);
      await adminApi.batchUpdateWheelItems(batchItems);
      setBatchSuccess(true);
      await fetchItems();
      setTimeout(() => setBatchSuccess(false), 2500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกเรทสุ่ม');
    } finally {
      setIsSavingBatch(false);
    }
  };

  // ═════════════════════════════════════════════════════════════════
  // REWARD IMAGE & DETAILS DIRECT CUSTOMIZER SUB-MODAL
  // ═════════════════════════════════════════════════════════════════
  const openEditRewardModal = (item: WheelItem, index: number) => {
    setEditingItemIndex(index);
    setEditCardName(item.label);
    setEditCardSubtitle(item.subtitle || '');
    setEditCardIconUrl(item.icon_url || '');
    setEditCardRarity((item.rarity as any) || 'COMMON');
    setEditCardColor(item.color || '#B45309');
    setIsRewardEditModalOpen(true);
  };

  const handleApplyPreset = (p: typeof GAME_PRESET_IMAGES[0]) => {
    setEditCardName(p.name);
    setEditCardSubtitle(p.subtitle);
    setEditCardIconUrl(p.url);
    setEditCardRarity(p.rarity);
    setEditCardColor(p.color);
    if (editingItemIndex !== null && p.defaultRate) {
      setBatchItems((prev) => {
        const upd = [...prev];
        if (upd[editingItemIndex]) {
          upd[editingItemIndex] = { ...upd[editingItemIndex], weight: p.defaultRate };
        }
        return upd;
      });
    }
  };

  const handleSubModalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น (PNG, JPG, WEBP)');
      return;
    }

    try {
      setIsSubModalUploading(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res = await adminApi.uploadImage({
            image: base64Data,
            filename: file.name,
          });

          if (res.data?.success && res.data.data?.url) {
            setEditCardIconUrl(res.data.data.url);
          } else {
            setEditCardIconUrl(base64Data);
          }
        } catch {
          setEditCardIconUrl(reader.result as string);
        } finally {
          setIsSubModalUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert('ไม่สามารถอ่านไฟล์ได้: ' + err.message);
      setIsSubModalUploading(false);
    }
  };

  const handleSaveRewardCustomizer = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItemIndex === null) return;

    setBatchItems((prev) => {
      const updated = [...prev];
      if (updated[editingItemIndex]) {
        updated[editingItemIndex] = {
          ...updated[editingItemIndex],
          label: editCardName.trim(),
          subtitle: editCardSubtitle.trim(),
          icon_url: editCardIconUrl.trim(),
          rarity: editCardRarity,
          color: editCardColor,
        };
      }
      return updated;
    });

    setIsRewardEditModalOpen(false);
  };

  // ═════════════════════════════════════════════════════════════════
  // CARD BACK COVER HANDLERS
  // ═════════════════════════════════════════════════════════════════
  const handleSaveCardBack = async () => {
    try {
      setIsSavingCardBack(true);
      await adminApi.updateSettings({ game_wheel_card_back: cardBackUrl });
      alert('บันทึกรูปปกหลังไพ่ 3D สำเร็จแล้ว!');
      setIsCardBackModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกภาพปกหลังไพ่');
    } finally {
      setIsSavingCardBack(false);
    }
  };

  const handleCardBackFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น (PNG, JPG, WEBP)');
      return;
    }

    try {
      setIsCardBackUploading(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res = await adminApi.uploadImage({
            image: base64Data,
            filename: file.name,
          });

          if (res.data?.success && res.data.data?.url) {
            setCardBackUrl(res.data.data.url);
          } else {
            setCardBackUrl(base64Data);
          }
        } catch {
          setCardBackUrl(reader.result as string);
        } finally {
          setIsCardBackUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert('ไม่สามารถอ่านไฟล์ได้: ' + err.message);
      setIsCardBackUploading(false);
    }
  };

  // ═════════════════════════════════════════════════════════════════
  // SINGLE CREATE / EDIT MODAL HANDLERS
  // ═════════════════════════════════════════════════════════════════
  const openCreateModal = () => {
    setModalMode('create');
    setSelectedItem(null);
    setFormData({
      reward_id: rewards[0]?.id || 0,
      label: '',
      subtitle: '',
      icon_url: '/images/packages/tier1.jpg',
      color: '#B45309',
      text_color: '#FFFFFF',
      rarity: 'COMMON',
      weight: 5.0,
      is_active: true,
      sort_order: items.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: WheelItem) => {
    setModalMode('edit');
    setSelectedItem(item);
    setFormData({
      reward_id: item.reward_id,
      label: item.label,
      subtitle: item.subtitle || '',
      icon_url: item.icon_url || '',
      color: item.color || '#B45309',
      text_color: item.text_color || '#FFFFFF',
      rarity: item.rarity,
      weight: parseFloat(String(item.weight)) || 5.0,
      is_active: Boolean(item.is_active),
      sort_order: item.sort_order || 0,
    });
    setIsModalOpen(true);
  };

  const handleRewardSelect = (rewardId: number) => {
    const selectedReward = rewards.find((r) => r.id === rewardId);
    if (selectedReward) {
      setFormData((prev) => ({
        ...prev,
        reward_id: selectedReward.id,
        label: prev.label || selectedReward.name,
        icon_url: (selectedReward as any).imageUrl || (selectedReward as any).image_url || prev.icon_url,
        rarity: selectedReward.rarity || prev.rarity,
      }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น (PNG, JPG, WEBP)');
      return;
    }

    try {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res = await adminApi.uploadImage({
            image: base64Data,
            filename: file.name,
          });

          if (res.data?.success && res.data.data?.url) {
            setFormData((prev) => ({ ...prev, icon_url: res.data.data.url }));
          } else {
            setFormData((prev) => ({ ...prev, icon_url: base64Data }));
          }
        } catch (uploadErr: any) {
          console.error('Upload API failed, using base64 data URL:', uploadErr);
          setFormData((prev) => ({ ...prev, icon_url: reader.result as string }));
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert('ไม่สามารถอ่านไฟล์ได้: ' + err.message);
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        await adminApi.createWheelItem(formData);
      } else if (selectedItem) {
        await adminApi.updateWheelItem(selectedItem.id, formData);
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleDelete = async (id: number, label: string) => {
    if (!confirm(`คุณต้องการลบการ์ดรางวัล "${label}" ออกจากพูลเสี่ยงโชคใช่หรือไม่?`)) return;
    try {
      await adminApi.deleteWheelItem(id);
      fetchItems();
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบ');
    }
  };

  const filteredItems = items.filter((it) =>
    it.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-cyan-400" />
            จัดการเปิดการ์ด 3D (Lucky Tarot Cards CMS)
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            กำหนดของรางวัลทั้ง 24 ใบ ปรับเรทโอกาสสุ่มได้ (%) อัปโหลดภาพปกหลังไพ่ และจัดสรรเรทสุ่มตามความต้องการ
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Main All-in-one Batch & Rate Configurator Button */}
          <button
            type="button"
            onClick={openBatchRateModal}
            className="py-2.5 px-5 rounded-xl font-black text-xs text-stone-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/25 transition-all flex items-center gap-2 active:scale-95"
          >
            <Percent className="w-4 h-4 fill-stone-950" />
            <span>% กำหนดของรางวัล 24 ช่อง & ปรับเรทสุ่ม (%)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCardBackModalOpen(true)}
            className="py-2.5 px-3.5 rounded-xl font-bold text-xs text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all flex items-center gap-1.5 active:scale-95 shadow-md"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>เปลี่ยนภาพปกหลังไพ่ 3D</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="py-2.5 px-3.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มการ์ดรางวัล</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-4 rounded-2xl bg-[#10141E] border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 font-medium">จำนวนการ์ดรางวัลในพูล</p>
            <h3 className="text-2xl font-black text-white">{items.length} ใบ</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#10141E] border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 font-medium">ผลรวมเรทสุ่มทั้งหมด</p>
            <div className="flex items-center gap-2 mt-0.5">
              <h3 className="text-2xl font-black text-white">{totalRate.toFixed(2)}%</h3>
              {Math.abs(totalRate - 100) < 0.05 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ครบ 100%
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {totalRate < 100 ? `ขาด ${(100 - totalRate).toFixed(2)}%` : `เกิน ${(totalRate - 100).toFixed(2)}%`}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#10141E] border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 font-medium">ความแม่นยำระบบสุ่มการ์ด</p>
            <h3 className="text-2xl font-black text-emerald-400">100% สุ่มจริงตามเรท %</h3>
          </div>
        </div>
      </div>

      {/* SEARCH BAR & QUICK ACCESS */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="max-w-md w-full relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาการ์ดรางวัลในพูล..."
            className="w-full bg-[#10141E] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          type="button"
          onClick={openBatchRateModal}
          className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-bold transition flex items-center gap-2 shadow-sm"
        >
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>เปิดหน้าต่างปรับเรท % และรูปภาพพร้อมกันทั้ง 24 ใบ</span>
        </button>
      </div>

      {/* ITEMS TABLE (CLEAN, NO REPETITIVE CMS BUTTONS ON ROWS) */}
      <div className="bg-[#10141E] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-[#151A28] text-zinc-400 text-[11px] uppercase tracking-wider font-bold">
                <th className="py-4 px-6">ลำดับ</th>
                <th className="py-4 px-6">การ์ดรางวัล & ไอคอน</th>
                <th className="py-4 px-6">สีธีม / ออร่าการ์ด</th>
                <th className="py-4 px-6">ระดับความหายาก</th>
                <th className="py-4 px-6">โอกาสสุ่มได้ (%)</th>
                <th className="py-4 px-6">สถานะ</th>
                <th className="py-4 px-6 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    กำลังโหลดข้อมูลการ์ดรางวัล...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    ไม่พบข้อมูลการ์ดรางวัลในพูล
                  </td>
                </tr>
              ) : (
                filteredItems.map((it, idx) => {
                  const prob = totalRate > 0 ? (((parseFloat(String(it.weight || 0)) || 0) / totalRate) * 100).toFixed(2) : '0.00';
                  return (
                    <tr key={it.id || idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 font-mono text-zinc-500">#{idx + 1}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl p-1.5 flex items-center justify-center flex-shrink-0 border shadow-sm"
                            style={{
                              backgroundColor: `${it.color}25`,
                              borderColor: `${it.color}60`,
                            }}
                          >
                            <img
                              src={it.icon_url || '/images/packages/tier1.jpg'}
                              alt={it.label}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/packages/tier1.jpg';
                              }}
                            />
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{it.label}</div>
                            <div className="text-[11px] text-zinc-400">{it.subtitle || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded-md border border-white/20 shadow-sm"
                            style={{ backgroundColor: it.color }}
                          />
                          <span className="font-mono text-zinc-300 text-xs">{it.color}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-zinc-300">
                          {it.rarity}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-amber-300 font-mono text-sm">
                            {parseFloat(String(it.weight || 0)).toFixed(2)}%
                          </span>
                          <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                            <div
                              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                              style={{ width: `${Math.min(100, parseFloat(prob))}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {it.is_active ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                            Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 inline-flex items-center gap-1">
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(it)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition shadow-sm"
                            title="แก้ไขข้อมูลการ์ด"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(it.id, it.label)}
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors shadow-sm"
                            title="ลบ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 1. RATE & REWARDS ALL-IN-ONE CONFIGURATOR MODAL                */}
      {/*    (PURE DIRECT % RATE TUNER, NO CONFUSING WEIGHTS)            */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
          <div className="relative w-full max-w-5xl bg-[#10141E] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                  <Percent className="w-6 h-6 text-amber-400" />
                  <span>กำหนดของรางวัล 24 ช่อง & ปรับเรทสุ่ม (%)</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  ปรับตั้งค่าเรทโอกาสออกของการ์ดแต่ละใบได้อิสระตาม % จริง | ผลรวมเรทปัจจุบัน:{' '}
                  <span className="text-amber-400 font-bold font-mono text-sm">
                    {batchTotalRate.toFixed(2)}%
                  </span>{' '}
                  | จำนวนการ์ดในพูล:{' '}
                  <span className="text-white font-bold text-sm">{batchItems.length} / 24 ช่อง</span>
                </p>
              </div>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success Alert */}
            {batchSuccess && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold rounded-2xl flex items-center gap-2.5 shadow-sm">
                <CheckCircle2 className="w-5 h-5" /> <span>บันทึกของรางวัลและอัตราเรทสุ่มสำเร็จ!</span>
              </div>
            )}

            {/* Quick Automations */}
            <div className="flex items-center justify-between gap-3 bg-[#151A28] p-3 rounded-2xl border border-white/5 flex-wrap">
              <div className="text-xs text-zinc-300 font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>เครื่องมือช่วยจัดสัดส่วน:</span>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleNormalizeTo100}
                  className="py-2 px-3.5 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-1.5 transition shadow-sm active:scale-95"
                  title="ปรับสเกลให้เรททุกใบรวมกันได้ 100% พอดีเป๊ะ"
                >
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span>ปรับให้รวมครบ 100% อัตโนมัติ</span>
                </button>

                <button
                  type="button"
                  onClick={handleAutoBalanceRates}
                  className="py-2 px-3.5 rounded-xl text-xs font-bold text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 flex items-center gap-1.5 transition shadow-sm active:scale-95"
                >
                  <Sliders className="w-4 h-4" />
                  <span>ปรับเรทมาตรฐานอัตโนมัติ</span>
                </button>

                <button
                  type="button"
                  onClick={handleAutoFill24Slots}
                  className="py-2 px-3.5 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center gap-1.5 transition shadow-sm active:scale-95"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>เติมให้ครบ 24 ช่อง</span>
                </button>
              </div>
            </div>

            {/* Add Reward Form */}
            <div className="p-4 bg-[#151A28] rounded-2xl border border-white/5 flex flex-wrap items-end gap-3.5 shadow-inner">
              <div className="flex-1 min-w-[260px]">
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">เลือกของรางวัลจากระบบ</label>
                <select
                  value={selectedRewardToAdd}
                  onChange={(e) => setSelectedRewardToAdd(Number(e.target.value))}
                  className="w-full bg-[#10141E] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 font-medium"
                >
                  {rewards.map((rw) => (
                    <option key={rw.id} value={rw.id}>
                      [{rw.rarity}] {rw.name} ({rw.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-40">
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">เรทโอกาสออก (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.0001"
                    max="100"
                    value={rateToAdd}
                    onChange={(e) => setRateToAdd(parseFloat(e.target.value))}
                    className="w-full bg-[#10141E] border border-white/10 rounded-xl pl-4 pr-7 py-2.5 text-sm text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">%</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleBatchAddItem}
                  className="py-2.5 px-5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 rounded-xl text-sm font-black transition-all shadow-md shadow-amber-500/20 active:scale-95"
                >
                  + เพิ่มลงพูลการ์ด
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newIdx = batchItems.length;
                    setBatchItems((prev) => [
                      ...prev,
                      {
                        id: 0,
                        reward_id: 0,
                        label: 'ของรางวัลใหม่',
                        subtitle: 'รายละเอียดรางวัล',
                        icon_url: GAME_PRESET_IMAGES[0].url,
                        color: '#B45309',
                        text_color: '#FFFFFF',
                        rarity: 'EPIC',
                        weight: 2.5,
                        is_active: true,
                        sort_order: newIdx + 1,
                      },
                    ]);
                    openEditRewardModal(
                      {
                        id: 0,
                        reward_id: 0,
                        label: 'ของรางวัลใหม่',
                        subtitle: 'รายละเอียดรางวัล',
                        icon_url: GAME_PRESET_IMAGES[0].url,
                        color: '#B45309',
                        text_color: '#FFFFFF',
                        rarity: 'EPIC',
                        weight: 2.5,
                        is_active: true,
                        sort_order: newIdx + 1,
                      },
                      newIdx
                    );
                  }}
                  className="py-2.5 px-4 bg-indigo-600/25 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>สร้างของรางวัลใหม่ & รูปภาพ</span>
                </button>
              </div>
            </div>

            {/* Real-time Status Badge Banner */}
            <div className="px-4 py-3 rounded-2xl bg-[#151A28] border border-white/5 flex items-center justify-between gap-3 text-xs flex-wrap">
              <div className="flex items-center gap-2 font-medium">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-zinc-300">
                  <strong className="text-white">คำนวณแบบ Real-time:</strong> กำหนดเรท % ของไพ่แต่ละใบได้อิสระ ระบบจะคำนวณสัดส่วนและโอกาสออกจริงทันที
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-300 bg-black/50 px-3 py-1.5 rounded-xl border border-amber-500/30 whitespace-nowrap text-xs">
                  ผลรวมเรทปัจจุบัน: {batchTotalRate.toFixed(2)}%
                </span>
                {Math.abs(batchTotalRate - 100) < 0.05 ? (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ครบ 100% สมบูรณ์แบบ
                  </span>
                ) : batchTotalRate < 100 ? (
                  <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> ยังขาดอีก {(100 - batchTotalRate).toFixed(2)}%
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> เรทรวมเกิน {(batchTotalRate - 100).toFixed(2)}%
                  </span>
                )}
              </div>
            </div>

            {/* Rates Table (Direct % Input per row + Real-time Calculation) */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 rounded-2xl bg-[#0D1117] border border-white/5 p-2">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 text-xs uppercase font-bold">
                    <th className="py-3 px-3.5">รูปภาพ</th>
                    <th className="py-3 px-3.5">ของรางวัล</th>
                    <th className="py-3 px-3.5">ระดับ Rarity</th>
                    <th className="py-3 px-3.5 text-center">ปรับแต่งรูป</th>
                    <th className="py-3 px-3.5">ปรับเรทโอกาสสุ่มได้ (%)</th>
                    <th className="py-3 px-3.5">สัดส่วนจริง (%)</th>
                    <th className="py-3 px-3.5 text-right">ลบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {batchItems.map((item, index) => {
                    const currentRateVal = parseFloat(String(item.weight || 0)) || 0;
                    const prob = batchTotalRate > 0 ? ((currentRateVal / batchTotalRate) * 100).toFixed(2) : '0.00';
                    const theme = RARITY_THEMES[item.rarity] || RARITY_THEMES.COMMON;
                    const displayImg = item.icon_url || '/images/packages/tier1.jpg';

                    return (
                      <tr key={index} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-3 px-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-black/60 border border-white/10 p-1 flex items-center justify-center flex-shrink-0 shadow-inner">
                            <img
                              src={displayImg}
                              alt={item.label}
                              className="max-h-full object-contain filter drop-shadow"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = '/images/packages/tier1.jpg';
                              }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="font-bold text-white text-sm block">{item.label}</span>
                          <span className="text-xs text-zinc-400 font-mono">
                            {item.subtitle || 'ITEM'}
                          </span>
                        </td>
                        <td className="py-3 px-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${theme.badgeBg}`}>
                            {theme.icon}
                            <span>{item.rarity}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => openEditRewardModal(item, index)}
                            className="py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold inline-flex items-center gap-1.5 transition shadow-sm active:scale-95"
                            title="แก้ไขรูปภาพและข้อมูลของรางวัลนี้"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>แก้ไขรูปภาพ</span>
                          </button>
                        </td>
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="0.01"
                              min="0.0001"
                              max="100"
                              value={item.weight}
                              onChange={(e) => handleBatchRateChange(index, parseFloat(e.target.value))}
                              className="w-24 bg-[#151A28] border border-amber-500/30 rounded-xl px-3 py-1.5 text-sm text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400 transition shadow-inner"
                            />
                            <span className="text-zinc-400 font-bold text-xs">%</span>
                          </div>
                        </td>
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono font-black text-amber-400 text-sm">{prob}%</span>
                            <div className="w-16 h-1.5 rounded-full bg-slate-700/80 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-200"
                                style={{ width: `${Math.min(100, parseFloat(prob))}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleBatchRemoveItem(index)}
                            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-2 rounded-xl transition"
                            title="ลบออกจากพูลนี้"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-1">
                <span className="text-sm font-semibold text-zinc-300">
                  รวม <strong className="text-white">{batchItems.length}</strong> รายการ | ผลรวมเรท:{' '}
                  <strong className="text-amber-400 font-mono">{batchTotalRate.toFixed(2)}%</strong>
                </span>
                {Math.abs(batchTotalRate - 100) > 0.05 && (
                  <p className="text-[11px] text-zinc-400">
                    💡 แนะนำ: กดปุ่ม <span className="text-emerald-400 font-bold">"ปรับให้รวมครบ 100%"</span> ด้านบนเพื่อให้เรททุกใบรวมได้ 100% พอดี
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleSaveBatchRates}
                disabled={isSavingBatch}
                className="py-3 px-8 rounded-2xl font-black text-sm text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/25 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSavingBatch ? 'กำลังบันทึก...' : 'บันทึกของรางวัล & เรทสุ่ม (%)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 2. REWARD IMAGE & DETAILS DIRECT CUSTOMIZER SUB-MODAL            */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {isRewardEditModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0F121C] border border-amber-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-400" />
                <span>ปรับแต่งรูปภาพ & ข้อมูลการ์ดรางวัล</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsRewardEditModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRewardCustomizer} className="space-y-4">
              {/* Presets Grid */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2">
                  ⚡ เลือกจากชุดไอคอนสำเร็จรูป Gaming Gear & Coins:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1 bg-black/40 rounded-xl border border-white/5">
                  {GAME_PRESET_IMAGES.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => handleApplyPreset(preset)}
                      className={`p-1.5 rounded-lg border text-center transition flex flex-col items-center gap-1 ${editCardIconUrl === preset.url
                          ? 'border-amber-400 bg-amber-400/10'
                          : 'border-white/5 hover:border-white/20 bg-white/[0.02]'
                        }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-8 h-8 object-contain rounded" />
                      <span className="text-[9px] text-zinc-300 font-semibold truncate w-full">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview & Direct URL / File Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-black/50 border border-white/10">
                  <div className="w-20 h-20 rounded-xl p-2 flex items-center justify-center border border-white/10 bg-white/5">
                    <img
                      src={editCardIconUrl || '/images/packages/tier1.jpg'}
                      alt="Preview"
                      className="max-h-full object-contain filter drop-shadow"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/packages/tier1.jpg';
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-2">พรีวิวรูปภาพ</span>
                </div>

                <div className="sm:col-span-2 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      URL รูปภาพ หรือ อัปโหลดจากคอมพิวเตอร์
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editCardIconUrl}
                        onChange={(e) => setEditCardIconUrl(e.target.value)}
                        placeholder="https://... หรือ /images/..."
                        className="flex-1 bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                      />
                      <label className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-200 cursor-pointer flex items-center gap-1.5 transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isSubModalUploading ? 'อัปโหลด...' : 'เลือกไฟล์'}</span>
                        <input type="file" accept="image/*" onChange={handleSubModalFileUpload} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">ชื่อของรางวัล</label>
                    <input
                      type="text"
                      value={editCardName}
                      onChange={(e) => setEditCardName(e.target.value)}
                      placeholder="เช่น Liquid-Cooled Custom Gaming PC"
                      className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Subtitle & Rarity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">คำอธิบายย่อย (Subtitle / Code)</label>
                  <input
                    type="text"
                    value={editCardSubtitle}
                    onChange={(e) => setEditCardSubtitle(e.target.value)}
                    placeholder="เช่น คอมพิวเตอร์เกมมิ่งระดับไฮเอนด์"
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">ระดับความหายาก (Rarity)</label>
                  <select
                    value={editCardRarity}
                    onChange={(e) => setEditCardRarity(e.target.value as any)}
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="COMMON">COMMON (ทั่วไป)</option>
                    <option value="RARE">RARE (หายาก)</option>
                    <option value="EPIC">EPIC (มหากาพย์)</option>
                    <option value="LEGENDARY">LEGENDARY (ตำนาน)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsRewardEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black shadow-md shadow-amber-500/20 transition active:scale-95"
                >
                  บันทึกการแก้ไขรูปภาพ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 3. SINGLE CREATE / EDIT MODAL                                    */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#0F1420] border border-white/10 p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">
                  {modalMode === 'create' ? 'เพิ่มการ์ดรางวัลในพูล' : `แก้ไขการ์ดรางวัล: ${formData.label}`}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Linked Reward Picker */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">ผูกกับของรางวัลในคลัง (Reward)</label>
                <select
                  value={formData.reward_id}
                  onChange={(e) => handleRewardSelect(Number(e.target.value))}
                  className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                >
                  <option value={0} disabled>
                    -- เลือกของรางวัล --
                  </option>
                  {rewards.map((r) => (
                    <option key={r.id} value={r.id}>
                      [{r.rarity}] {r.name} ({r.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">ชื่อการ์ดรางวัล (Label)</label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="เช่น 1,000 Coins"
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">คำอธิบายย่อย (Subtitle)</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="เช่น แจ็คพอตใหญ่"
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Icon URL & Upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">URL ไอคอน หรือ อัปโหลดจากคอมพิวเตอร์</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.icon_url}
                    onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                    placeholder="/images/packages/tier1.jpg"
                    className="flex-1 bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <label className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-200 cursor-pointer flex items-center gap-1.5 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'กำลังอัปโหลด...' : 'เลือกรูปภาพ'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Color Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">เลือกชุดสีธีมการ์ด (Color Presets)</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map((p) => (
                    <button
                      key={p.color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: p.color, text_color: p.text })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${formData.color === p.color
                          ? 'border-white bg-white/10 text-white shadow-sm'
                          : 'border-white/5 hover:border-white/20 text-zinc-400 bg-[#151A28]'
                        }`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: p.color }} />
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rarity & Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">ระดับความหายาก (Rarity)</label>
                  <select
                    value={formData.rarity}
                    onChange={(e) => setFormData({ ...formData, rarity: e.target.value as any })}
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="COMMON">COMMON (ทั่วไป)</option>
                    <option value="RARE">RARE (หายาก)</option>
                    <option value="EPIC">EPIC (มหากาพย์)</option>
                    <option value="LEGENDARY">LEGENDARY (ตำนาน)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">เรทโอกาสสุ่มได้ (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.0001"
                      max="100"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0.01 })}
                      className="w-full bg-[#151A28] border border-white/10 rounded-xl pl-3.5 pr-8 py-2.5 text-xs text-amber-300 focus:outline-none focus:border-amber-400 font-mono font-bold"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">%</span>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95"
                >
                  {modalMode === 'create' ? 'สร้างการ์ดรางวัล' : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 4. CARD BACK COVER MODAL                                         */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {isCardBackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0F1420] border border-white/10 p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">ตั้งค่าภาพปกหลังไพ่ 3D (Card Back Cover)</h3>
              </div>
              <button
                onClick={() => setIsCardBackModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-zinc-400">
                ภาพนี้คือภาพลวดลายปกหลังไพ่ที่ผู้เล่นจะเห็นขณะไพ่คว่ำอยู่หน้าบ้านก่อนกดเปิด
              </p>

              {/* Preview */}
              <div className="flex justify-center p-4 bg-[#151A28] rounded-2xl border border-white/10">
                <div className="w-40 h-56 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)] bg-black">
                  <img
                    src={cardBackUrl || '/images/tarot_card_back.jpg'}
                    alt="Card Back Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/tarot_card_back.jpg';
                    }}
                  />
                </div>
              </div>

              {/* Upload & Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">URL ภาพปกหลังไพ่ หรือ อัปโหลดจากคอมพิวเตอร์</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={cardBackUrl}
                    onChange={(e) => setCardBackUrl(e.target.value)}
                    placeholder="/images/tarot_card_back.jpg"
                    className="flex-1 bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <label className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-200 cursor-pointer flex items-center gap-1.5 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isCardBackUploading ? 'กำลังอัปโหลด...' : 'เลือกรูปภาพ'}</span>
                    <input type="file" accept="image/*" onChange={handleCardBackFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCardBackModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleSaveCardBack}
                  disabled={isSavingCardBack}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/25 transition active:scale-95 disabled:opacity-50"
                >
                  {isSavingCardBack ? 'กำลังบันทึก...' : 'บันทึกภาพปกหลังไพ่'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WheelAdminPage;
