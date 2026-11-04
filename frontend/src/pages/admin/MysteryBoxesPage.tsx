import React, { useState, useEffect, useRef } from 'react';
import {
  Gift,
  Plus,
  Edit2,
  Trash2,
  Percent,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCw,
  X,
  History,
  Eye,
  Crown,
  Flame,
  Zap,
  CircleDot,
  Wand2,
  Search,
  ArrowRight,
  TrendingUp,
  Coins,
  Image as ImageIcon,
  Upload,
  FileImage,
  Loader2
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { MysteryBox, Reward, DrawHistoryItem } from '../../types';
import { playTickSound, playWinSound } from '../../utils/audio';

const RARITY_THEMES: Record<string, { badgeBg: string; text: string; icon: React.ReactNode }> = {
  LEGENDARY: { badgeBg: 'bg-amber-400 text-zinc-950', text: 'text-amber-400', icon: <Crown className="w-3 h-3" /> },
  EPIC: { badgeBg: 'bg-purple-600 text-white', text: 'text-purple-400', icon: <Flame className="w-3 h-3" /> },
  RARE: { badgeBg: 'bg-sky-500 text-zinc-950', text: 'text-sky-400', icon: <Zap className="w-3 h-3" /> },
  COMMON: { badgeBg: 'bg-zinc-700 text-zinc-200', text: 'text-zinc-400', icon: <CircleDot className="w-3 h-3" /> },
};

const GAME_PRESET_IMAGES = [
  {
    name: 'Valorant Points (VP)',
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
    rarity: 'EPIC' as const,
    type: 'CODE' as const,
    value: 'VP-2400',
    desc: 'เหรียญเกม Valorant',
  },
  {
    name: 'Roblox Robux 800',
    url: 'https://images.unsplash.com/photo-1612287233256-4c55208f4305?w=200&auto=format&fit=crop&q=80',
    rarity: 'EPIC' as const,
    type: 'CODE' as const,
    value: 'ROBUX-800',
    desc: 'บัตรเติมโรบล็อกซ์',
  },
  {
    name: 'Free Fire Diamonds 1,080',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80',
    rarity: 'RARE' as const,
    type: 'CODE' as const,
    value: 'FF-1080',
    desc: 'เพชรฟีฟาย',
  },
  {
    name: 'Steam Wallet ฿500',
    url: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=200&auto=format&fit=crop&q=80',
    rarity: 'LEGENDARY' as const,
    type: 'CODE' as const,
    value: 'STEAM-500THB',
    desc: 'รหัสสตีมวอลเล็ต',
  },
  {
    name: 'Legendary Dragon Blade',
    url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=200&auto=format&fit=crop&q=80',
    rarity: 'LEGENDARY' as const,
    type: 'ITEM' as const,
    value: 'ITEM-DRAGON-BLADE',
    desc: 'ดาบมังกรตำนาน',
  },
  {
    name: 'Cyberpunk Katana',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&auto=format&fit=crop&q=80',
    rarity: 'EPIC' as const,
    type: 'ITEM' as const,
    value: 'ITEM-CYBER-KATANA',
    desc: 'ดาบคาตานะนีออน',
  },
  {
    name: 'Sacred Gold Crown',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&auto=format&fit=crop&q=80',
    rarity: 'LEGENDARY' as const,
    type: 'ITEM' as const,
    value: 'ITEM-GOLD-CROWN',
    desc: 'มงกุฎทองคำศักดิ์สิทธิ์',
  },
  {
    name: '1,000 เครดิตร้านค้า',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=200&auto=format&fit=crop&q=80',
    rarity: 'RARE' as const,
    type: 'CREDIT' as const,
    value: '1000',
    desc: 'ยอดเครดิตสำหรับใช้งานในเว็บ',
  },
  {
    name: 'Energy Elixir Potion',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200&auto=format&fit=crop&q=80',
    rarity: 'COMMON' as const,
    type: 'ITEM' as const,
    value: 'ITEM-ELIXIR-POTION',
    desc: 'น้ำยาพลังงานเพิ่มค่าประสบการณ์',
  },
  {
    name: 'VIP Gold Pass (30 วัน)',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80',
    rarity: 'EPIC' as const,
    type: 'VIP' as const,
    value: 'VIP-30D',
    desc: 'สถานะสิทธิพิเศษ VIP 30 วัน',
  }
];

export const MysteryBoxesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'boxes' | 'history'>('boxes');

  // Boxes & Rewards State
  const [boxes, setBoxes] = useState<MysteryBox[]>([]);
  const [allRewards, setAllRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  // Box Modal (Create/Edit box metadata)
  const [isBoxModalOpen, setIsBoxModalOpen] = useState(false);
  const [editingBox, setEditingBox] = useState<MysteryBox | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(99);
  const [imageUrl, setImageUrl] = useState('');
  const [colorTheme, setColorTheme] = useState('gold');
  const [badge, setBadge] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  // Weights & Rewards Configurator Modal
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [configBox, setConfigBox] = useState<MysteryBox | null>(null);
  const [boxRewards, setBoxRewards] = useState<Array<{
    rewardId: number;
    weight: number;
    rewardName: string;
    rarity: string;
    imageUrl?: string;
    type?: string;
    value?: string;
  }>>([]);
  const [selectedRewardToAdd, setSelectedRewardToAdd] = useState<number>(0);
  const [weightToAdd, setWeightToAdd] = useState<number>(10);
  const [weightSuccess, setWeightSuccess] = useState(false);

  // Quick Edit / Customize Reward Image & Info Modal
  const [isRewardEditModalOpen, setIsRewardEditModalOpen] = useState(false);
  const [editingRewardItem, setEditingRewardItem] = useState<Reward | null>(null);
  const [rewardFormName, setRewardFormName] = useState('');
  const [rewardFormImageUrl, setRewardFormImageUrl] = useState('');
  const [rewardFormRarity, setRewardFormRarity] = useState<'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'>('COMMON');
  const [rewardFormType, setRewardFormType] = useState<'ITEM' | 'CODE' | 'CREDIT' | 'COUPON' | 'VIP'>('ITEM');
  const [rewardFormValue, setRewardFormValue] = useState('');
  const [rewardFormStock, setRewardFormStock] = useState(-1);
  const [rewardFormIsNew, setRewardFormIsNew] = useState(false);
  const [rewardSaveLoading, setRewardSaveLoading] = useState(false);

  // Local File Upload States & Refs (Computer & Mobile Gallery)
  const rewardFileInputRef = useRef<HTMLInputElement | null>(null);
  const boxFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingRewardImg, setIsUploadingRewardImg] = useState(false);
  const [isUploadingBoxImg, setIsUploadingBoxImg] = useState(false);
  const [uploadSuccessTip, setUploadSuccessTip] = useState(false);

  // 12-Slot Live Board Preview & Test Simulation
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewBox, setPreviewBox] = useState<MysteryBox | null>(null);
  const [preview12Slots, setPreview12Slots] = useState<Array<{ id: number | string; name: string; rarity: string; image_url: string; weight: number; probability: string }>>([]);
  const [activeTestSlot, setActiveTestSlot] = useState<number | null>(null);
  const [winningTestSlot, setWinningTestSlot] = useState<number | null>(null);
  const [isTestingSpin, setIsTestingSpin] = useState(false);
  const [showTestWinnerPopup, setShowTestWinnerPopup] = useState(false);
  const [testWonReward, setTestWonReward] = useState<any | null>(null);
  const simTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Draw History State
  const [historyList, setHistoryList] = useState<DrawHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySearch, setHistorySearch] = useState('');

  const fetchBoxesAndRewards = async () => {
    try {
      setLoading(true);
      const [boxRes, rewardRes] = await Promise.all([
        adminApi.getMysteryBoxes(),
        adminApi.getRewards(),
      ]);

      if (boxRes.data?.success) setBoxes(boxRes.data.data);
      if (rewardRes.data?.success) {
        setAllRewards(rewardRes.data.data);
        if (rewardRes.data.data.length > 0) {
          setSelectedRewardToAdd(rewardRes.data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load boxes or rewards:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrawHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await adminApi.getBoxesDrawHistory();
      if (res.data?.success) {
        setHistoryList(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load draw history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchBoxesAndRewards();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchDrawHistory();
    }
  }, [activeTab]);

  // Clean simulation timer on unmount
  useEffect(() => {
    return () => {
      if (simTimerRef.current) clearTimeout(simTimerRef.current);
    };
  }, []);

  // ═════════════════════════════════════════════════════════════════
  // BOX METADATA MODAL HANDLERS
  // ═════════════════════════════════════════════════════════════════
  const openCreateBoxModal = () => {
    setEditingBox(null);
    setName('');
    setDescription('');
    setPrice(99);
    setImageUrl('https://images.unsplash.com/photo-1563089145-599997674d42?w=400&auto=format&fit=crop&q=80');
    setColorTheme('gold');
    setBadge('');
    setIsActive(true);
    setSortOrder(boxes.length + 1);
    setIsBoxModalOpen(true);
  };

  const openEditBoxModal = (box: MysteryBox) => {
    setEditingBox(box);
    setName(box.name);
    setDescription(box.description);
    setPrice(box.price);
    setImageUrl(box.imageUrl);
    setColorTheme(box.colorTheme);
    setBadge(box.badge || '');
    setIsActive(box.isActive);
    setSortOrder(box.sortOrder);
    setIsBoxModalOpen(true);
  };

  const handleSaveBox = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        description,
        price: Number(price),
        imageUrl,
        colorTheme,
        badge: badge.trim() || null,
        isActive,
        sortOrder: Number(sortOrder),
      };

      if (editingBox) {
        await adminApi.updateMysteryBox(editingBox.id, payload);
      } else {
        await adminApi.createMysteryBox(payload);
      }

      setIsBoxModalOpen(false);
      fetchBoxesAndRewards();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving box');
    }
  };

  const handleDeleteBox = async (id: number) => {
    if (!window.confirm('คุณต้องการลบกล่องสุ่มนี้ใช่หรือไม่?')) return;
    try {
      await adminApi.deleteMysteryBox(id);
      fetchBoxesAndRewards();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting box');
    }
  };

  // ═════════════════════════════════════════════════════════════════
  // REWARDS & WEIGHTS CONFIGURATOR HANDLERS
  // ═════════════════════════════════════════════════════════════
  const openWeightConfigurator = (box: MysteryBox) => {
    setConfigBox(box);
    const existing = (box.rewards || []).map((r) => ({
      rewardId: r.id,
      weight: r.weight,
      rewardName: r.name,
      rarity: r.rarity,
      imageUrl: r.image_url,
      type: r.type,
      value: r.value,
    }));
    setBoxRewards(existing);
    setWeightSuccess(false);
    setIsWeightModalOpen(true);
  };

  const totalWeight = boxRewards.reduce((sum, item) => sum + item.weight, 0);

  const handleAddRewardToBox = () => {
    if (!selectedRewardToAdd || weightToAdd <= 0) return;
    const rwObj = allRewards.find((r) => r.id === Number(selectedRewardToAdd));
    if (!rwObj) return;

    const exists = boxRewards.some((b) => b.rewardId === rwObj.id);
    if (exists) {
      setBoxRewards(
        boxRewards.map((b) => (b.rewardId === rwObj.id ? { ...b, weight: weightToAdd } : b))
      );
    } else {
      setBoxRewards([
        ...boxRewards,
        {
          rewardId: rwObj.id,
          weight: weightToAdd,
          rewardName: rwObj.name,
          rarity: rwObj.rarity,
          imageUrl: rwObj.imageUrl,
          type: rwObj.type,
          value: rwObj.value,
        },
      ]);
    }
  };

  const handleRemoveRewardFromBox = (rewardId: number) => {
    setBoxRewards(boxRewards.filter((b) => b.rewardId !== rewardId));
  };

  const handleWeightChange = (rewardId: number, newWeight: number) => {
    setBoxRewards(
      boxRewards.map((b) => (b.rewardId === rewardId ? { ...b, weight: Math.max(1, newWeight) } : b))
    );
  };

  // Auto-fill to 12 slots from existing rewards
  const handleAutoFill12Slots = () => {
    if (allRewards.length === 0) return;
    const current = [...boxRewards];
    const existingIds = new Set(current.map((r) => r.rewardId));

    for (const r of allRewards) {
      if (current.length >= 12) break;
      if (!existingIds.has(r.id)) {
        let defaultWeight = 50;
        if (r.rarity === 'LEGENDARY') defaultWeight = 3;
        else if (r.rarity === 'EPIC') defaultWeight = 12;
        else if (r.rarity === 'RARE') defaultWeight = 30;

        current.push({
          rewardId: r.id,
          weight: defaultWeight,
          rewardName: r.name,
          rarity: r.rarity,
          imageUrl: r.imageUrl,
          type: r.type,
          value: r.value,
        });
        existingIds.add(r.id);
      }
    }
    setBoxRewards(current);
  };

  // Auto-balance rates to industry standard (Common ~60%, Rare ~25%, Epic ~12%, Legendary ~3%)
  const handleAutoBalanceRates = () => {
    if (boxRewards.length === 0) return;
    const updated = boxRewards.map((b) => {
      let w = 50;
      if (b.rarity === 'LEGENDARY') w = 3;
      else if (b.rarity === 'EPIC') w = 12;
      else if (b.rarity === 'RARE') w = 25;
      else w = 60;
      return { ...b, weight: w };
    });
    setBoxRewards(updated);
  };

  const handleSaveWeights = async () => {
    if (!configBox) return;
    try {
      await adminApi.setBoxRewards(
        configBox.id,
        boxRewards.map((b) => ({ rewardId: b.rewardId, weight: b.weight }))
      );
      setWeightSuccess(true);
      await fetchBoxesAndRewards();
      setTimeout(() => setWeightSuccess(false), 2500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save weights');
    }
  };

  // ═════════════════════════════════════════════════════════════════
  // REWARD IMAGE & DETAILS DIRECT CUSTOMIZER HANDLERS
  // ═════════════════════════════════════════════════════════════════
  const openEditRewardModal = (rewardId: number) => {
    const rw = allRewards.find((r) => r.id === rewardId);
    if (!rw) {
      // Fallback from boxRewards if found
      const fromBox = boxRewards.find((b) => b.rewardId === rewardId);
      if (fromBox) {
        setEditingRewardItem({
          id: fromBox.rewardId,
          name: fromBox.rewardName,
          description: '',
          imageUrl: fromBox.imageUrl || '',
          type: (fromBox.type as any) || 'ITEM',
          value: fromBox.value || 'ITEM-VAL',
          rarity: (fromBox.rarity as any) || 'COMMON',
          stock: -1,
          isActive: true,
          createdAt: '',
        });
        setRewardFormName(fromBox.rewardName);
        setRewardFormImageUrl(fromBox.imageUrl || '');
        setRewardFormRarity((fromBox.rarity as any) || 'COMMON');
        setRewardFormType((fromBox.type as any) || 'ITEM');
        setRewardFormValue(fromBox.value || 'ITEM-VAL');
        setRewardFormStock(-1);
        setRewardFormIsNew(false);
        setIsRewardEditModalOpen(true);
      }
      return;
    }
    setEditingRewardItem(rw);
    setRewardFormName(rw.name);
    setRewardFormImageUrl(rw.imageUrl || '');
    setRewardFormRarity(rw.rarity);
    setRewardFormType(rw.type);
    setRewardFormValue(rw.value);
    setRewardFormStock(rw.stock);
    setRewardFormIsNew(false);
    setIsRewardEditModalOpen(true);
  };

  const openCreateRewardModalDirect = () => {
    setEditingRewardItem(null);
    setRewardFormName('');
    setRewardFormImageUrl(GAME_PRESET_IMAGES[0].url);
    setRewardFormRarity('EPIC');
    setRewardFormType('ITEM');
    setRewardFormValue('ITEM-NEW');
    setRewardFormStock(-1);
    setRewardFormIsNew(true);
    setIsRewardEditModalOpen(true);
  };

  const handleApplyPreset = (p: typeof GAME_PRESET_IMAGES[0]) => {
    setRewardFormName(p.name);
    setRewardFormImageUrl(p.url);
    setRewardFormRarity(p.rarity);
    setRewardFormType(p.type);
    setRewardFormValue(p.value);
  };

  const handleSaveRewardCustomizer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setRewardSaveLoading(true);
      const payload = {
        name: rewardFormName.trim(),
        description: '',
        imageUrl: rewardFormImageUrl.trim(),
        type: rewardFormType,
        value: rewardFormValue.trim(),
        rarity: rewardFormRarity,
        stock: Number(rewardFormStock),
        isActive: true,
      };

      let targetId = editingRewardItem?.id;

      if (rewardFormIsNew || !targetId) {
        const res = await adminApi.createReward(payload);
        targetId = res.data?.rewardId;
      } else {
        await adminApi.updateReward(targetId, payload);
      }

      // Re-fetch all rewards from server
      const rewardRes = await adminApi.getRewards();
      if (rewardRes.data?.success) {
        setAllRewards(rewardRes.data.data);
      }

      // Update in active boxRewards
      setBoxRewards((prev) => {
        const exists = prev.some((b) => b.rewardId === targetId);
        if (exists) {
          return prev.map((b) =>
            b.rewardId === targetId
              ? {
                  ...b,
                  rewardName: payload.name,
                  rarity: payload.rarity,
                  imageUrl: payload.imageUrl,
                  type: payload.type,
                  value: payload.value,
                }
              : b
          );
        } else if (rewardFormIsNew && targetId) {
          return [
            ...prev,
            {
              rewardId: targetId,
              weight: 20,
              rewardName: payload.name,
              rarity: payload.rarity,
              imageUrl: payload.imageUrl,
              type: payload.type,
              value: payload.value,
            },
          ];
        }
        return prev;
      });

      // Update in preview slots if visualizer is active
      setPreview12Slots((prev) =>
        prev.map((s) => {
          const numId = typeof s.id === 'string' ? parseInt(s.id.split('-')[0], 10) : Number(s.id);
          if (numId === targetId) {
            return {
              ...s,
              name: payload.name,
              rarity: payload.rarity,
              image_url: payload.imageUrl,
            };
          }
          return s;
        })
      );

      setIsRewardEditModalOpen(false);
      await fetchBoxesAndRewards();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving reward');
    } finally {
      setRewardSaveLoading(false);
    }
  };

  // Local File Upload Handlers (from PC storage or Mobile camera/gallery)
  const handleRewardLocalFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('ไฟล์รูปภาพมีขนาดใหญ่เกินไป (กรุณาใช้รูปขนาดไม่เกิน 15 MB)');
      return;
    }

    try {
      setIsUploadingRewardImg(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        if (!base64Data) return;

        // Immediate client preview
        setRewardFormImageUrl(base64Data);

        try {
          const res = await adminApi.uploadImage({
            image: base64Data,
            filename: file.name,
          });
          if (res.data?.success && res.data?.url) {
            setRewardFormImageUrl(res.data.url);
            setUploadSuccessTip(true);
            setTimeout(() => setUploadSuccessTip(false), 3000);
          }
        } catch (uploadErr) {
          console.warn('Server upload failed, using direct base64 image data:', uploadErr);
        } finally {
          setIsUploadingRewardImg(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert('ไม่สามารถอ่านไฟล์รูปภาพได้: ' + err.message);
      setIsUploadingRewardImg(false);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleBoxLocalFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('ไฟล์รูปภาพมีขนาดใหญ่เกินไป (กรุณาใช้รูปขนาดไม่เกิน 15 MB)');
      return;
    }

    try {
      setIsUploadingBoxImg(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        if (!base64Data) return;

        setImageUrl(base64Data);

        try {
          const res = await adminApi.uploadImage({
            image: base64Data,
            filename: file.name,
          });
          if (res.data?.success && res.data?.url) {
            setImageUrl(res.data.url);
          }
        } catch (uploadErr) {
          console.warn('Server upload failed, using direct base64 image data:', uploadErr);
        } finally {
          setIsUploadingBoxImg(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert('ไม่สามารถอ่านไฟล์รูปภาพได้: ' + err.message);
      setIsUploadingBoxImg(false);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // ═════════════════════════════════════════════════════════════════
  // 12-SLOT BOARD VISUALIZER & SIMULATION TEST
  // ═════════════════════════════════════════════════════════════════
  const openPreviewAndTest = (box: MysteryBox) => {
    setPreviewBox(box);
    setActiveTestSlot(null);
    setWinningTestSlot(null);
    setShowTestWinnerPopup(false);
    setTestWonReward(null);
    setIsTestingSpin(false);

    // Build 12 slots from real box.rewards
    const rawRewards = box.rewards || [];
    const totalW = rawRewards.reduce((sum, r) => sum + r.weight, 0);

    let slots: Array<{ id: number | string; name: string; rarity: string; image_url: string; weight: number; probability: string }> = [];

    if (rawRewards.length > 0) {
      let idx = 0;
      while (slots.length < 12) {
        const r = rawRewards[idx % rawRewards.length];
        const prob = totalW > 0 ? ((r.weight / totalW) * 100).toFixed(1) : '0.0';
        slots.push({
          id: `${r.id}-${slots.length}`,
          name: r.name,
          rarity: r.rarity,
          image_url: r.image_url,
          weight: r.weight,
          probability: prob,
        });
        idx++;
      }
    }

    setPreview12Slots(slots);
    setIsPreviewModalOpen(true);
  };

  // Run live test simulation
  const runTestSimulation = () => {
    if (preview12Slots.length === 0 || isTestingSpin) return;

    if (simTimerRef.current) clearTimeout(simTimerRef.current);
    setIsTestingSpin(true);
    setShowTestWinnerPopup(false);
    setWinningTestSlot(null);

    // Weighted RNG pick
    const totalW = preview12Slots.reduce((sum, s) => sum + s.weight, 0);
    let rand = Math.random() * (totalW > 0 ? totalW : 1);
    let targetSlotIndex = 0;

    for (let i = 0; i < preview12Slots.length; i++) {
      if (rand < preview12Slots[i].weight) {
        targetSlotIndex = i;
        break;
      }
      rand -= preview12Slots[i].weight;
    }

    let currentSlot = activeTestSlot !== null ? activeTestSlot : 0;
    setActiveTestSlot(currentSlot);

    const fullLoops = 3;
    const stepsToTarget = (targetSlotIndex - currentSlot + 12) % 12;
    const totalSteps = fullLoops * 12 + stepsToTarget;
    let stepCount = 0;

    const stepNext = () => {
      if (stepCount >= totalSteps) {
        setActiveTestSlot(targetSlotIndex);
        setWinningTestSlot(targetSlotIndex);
        setIsTestingSpin(false);
        const wonItem = preview12Slots[targetSlotIndex];
        setTestWonReward(wonItem);
        setShowTestWinnerPopup(true);
        playWinSound(wonItem.rarity);
        return;
      }

      currentSlot = (currentSlot + 1) % 12;
      setActiveTestSlot(currentSlot);
      playTickSound();
      stepCount++;

      const progress = stepCount / totalSteps;
      let delay = 50;
      if (progress > 0.6 && progress <= 0.8) delay = 90 + (progress - 0.6) * 350;
      else if (progress > 0.8 && progress <= 0.92) delay = 170 + (progress - 0.8) * 800;
      else if (progress > 0.92) delay = 320 + (progress - 0.92) * 1400;

      simTimerRef.current = setTimeout(stepNext, delay);
    };

    simTimerRef.current = setTimeout(stepNext, 70);
  };

  // Filtered History
  const filteredHistory = historyList.filter((h) => {
    const q = historySearch.toLowerCase();
    return (
      (h.username || '').toLowerCase().includes(q) ||
      (h.box_name || '').toLowerCase().includes(q) ||
      (h.reward_name || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* ═══ Header & Tab Switcher ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Gift className="w-4 h-4" />
            <span>ระบบจัดการกล่องสุ่มหลังบ้าน (Mystery Boxes Console)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            จัดการกล่องสุ่ม & กระดาน 12 ช่อง
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            สร้างกล่องสุ่ม กำหนดราคา จัดของรางวัลลงช่องตาราง 12 ช่อง ปรับอัตรา Drop Rate และทดสอบสุ่มสด
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-[#121622] p-1.5 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('boxes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'boxes'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>รายการกล่องสุ่ม ({boxes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <History className="w-4 h-4" />
            <span>ประวัติการสุ่มรางวัล</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 1: BOXES MANAGEMENT                                         */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'boxes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-xs text-zinc-400">
              กล่องสุ่มทั้งหมด {boxes.length} กล่อง — แสดงผลบนหน้าร้านค้าของระบบ
            </div>

            <button
              onClick={openCreateBoxModal}
              className="py-2.5 px-4 rounded-xl font-bold text-xs text-stone-950 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ เพิ่มกล่องสุ่มใหม่</span>
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-72 rounded-3xl bg-zinc-900/40 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {boxes.map((box) => {
                const rewardCount = box.rewards?.length || 0;
                const is12Complete = rewardCount >= 12;

                return (
                  <div
                    key={box.id}
                    className="rounded-3xl bg-[#0F121C] border border-amber-500/20 hover:border-amber-500/40 p-5 flex flex-col justify-between shadow-xl space-y-4 relative overflow-hidden transition-all duration-300"
                  >
                    {/* Top Badges */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          box.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {box.isActive ? 'เปิดให้บริการ' : 'ปิดชั่วคราว'}
                      </span>

                      {box.badge && (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          {box.badge}
                        </span>
                      )}
                    </div>

                    {/* Box 3D Avatar */}
                    <div className="w-full h-36 rounded-2xl bg-black/40 border border-white/5 overflow-hidden p-3 flex items-center justify-center relative">
                      <img src={box.imageUrl} alt={box.name} className="max-h-full object-contain filter drop-shadow-md" />
                    </div>

                    {/* Box Info */}
                    <div>
                      <h3 className="font-extrabold text-base text-white tracking-tight">{box.name}</h3>
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-1 min-h-[32px]">{box.description}</p>
                      <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-white/5">
                        <span className="text-lg font-black text-amber-400 font-mono">฿{box.price.toFixed(0)}</span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                            is12Complete ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {rewardCount} / 12 ช่อง
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 border-t border-white/5 pt-3">
                      {/* 1. Preview 12-Slot Board & Test Simulator */}
                      <button
                        type="button"
                        onClick={() => openPreviewAndTest(box)}
                        className="w-full py-2.5 px-3 rounded-xl font-bold text-xs text-stone-950 bg-amber-400 hover:bg-amber-300 flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20 active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-stone-950" />
                        <span>พรีวิวกระดาน 12 ช่อง & ทดลองสุ่ม</span>
                      </button>

                      {/* 2. Configure 12 Slots & Weights */}
                      <button
                        type="button"
                        onClick={() => openWeightConfigurator(box)}
                        className="w-full py-2 px-3 rounded-xl font-semibold text-xs text-zinc-200 bg-white/5 hover:bg-white/10 hover:text-white flex items-center justify-center gap-1.5 transition-all border border-white/5"
                      >
                        <Percent className="w-3.5 h-3.5 text-amber-400" />
                        <span>จัดของรางวัล & เรทสุ่ม</span>
                      </button>

                      {/* 3. Edit & Delete */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditBoxModal(box)}
                          className="flex-1 py-1.5 px-3 rounded-xl font-medium text-xs text-zinc-300 bg-white/5 hover:bg-white/10 flex items-center justify-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" /> แก้ไข
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBox(box.id)}
                          className="py-1.5 px-3 rounded-xl font-medium text-xs text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 2: PLAYER LIVE DRAW HISTORY                                 */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0F121C] p-4 rounded-2xl border border-white/10">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="ค้นหาชื่อผู้เล่น, ชื่อกล่องสุ่ม หรือชื่อของรางวัล..."
                className="w-full bg-[#151A28] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="button"
              onClick={fetchDrawHistory}
              className="py-2 px-4 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>รีเฟรชประวัติ</span>
            </button>
          </div>

          {/* History Table */}
          <div className="bg-[#0F121C] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#151A28] border-b border-white/5 text-zinc-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">วัน-เวลา</th>
                  <th className="py-3 px-4">ผู้เล่น (User)</th>
                  <th className="py-3 px-4">กล่องที่เปิด</th>
                  <th className="py-3 px-4">ของรางวัลที่ได้รับ</th>
                  <th className="py-3 px-4">ระดับ Rarity</th>
                  <th className="py-3 px-4">ราคา (฿)</th>
                  <th className="py-3 px-4">โค้ดที่แจก</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {historyLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-500">
                      กำลังโหลดประวัติการสุ่ม...
                    </td>
                  </tr>
                ) : filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-500">
                      ไม่พบประวัติการสุ่มรางวัล
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((row) => {
                    const theme = RARITY_THEMES[row.rarity] || RARITY_THEMES.COMMON;
                    const dateStr = new Date(row.created_at).toLocaleString('th-TH');

                    return (
                      <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">{dateStr}</td>
                        <td className="py-3 px-4 font-bold text-white">
                          <div>{row.username}</div>
                          <div className="text-[10px] text-zinc-500">{row.email}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-amber-300">{row.box_name}</td>
                        <td className="py-3 px-4 font-bold text-white">{row.reward_name}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase ${theme.badgeBg}`}>
                            {theme.icon}
                            <span>{row.rarity}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-zinc-200">฿{Number(row.cost || 0).toFixed(0)}</td>
                        <td className="py-3 px-4">
                          {row.code ? (
                            <code className="text-[11px] font-mono font-bold text-amber-300 bg-black/60 px-2 py-0.5 rounded border border-white/10 select-all">
                              {row.code}
                            </code>
                          ) : (
                            <span className="text-zinc-600 text-[11px]">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 1. 12-SLOT BOARD VISUALIZER & SIMULATOR MODAL                    */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {isPreviewModalOpen && previewBox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 select-none overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-[#0B0C11] border border-amber-500/25 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden my-auto space-y-4">
            {/* Top Spotlight & Accent */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
            <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-stone-900 border border-amber-500/30 p-1 flex items-center justify-center">
                  <img src={previewBox.imageUrl} alt={previewBox.name} className="max-h-full object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-black text-white">{previewBox.name}</h3>
                    <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      ฿{previewBox.price.toFixed(0)}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono font-bold">
                      ({preview12Slots.length} ช่อง)
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    จำลองมุมมองกระดาน 12 ช่อง และทดสอบการสุ่มจริงตามค่าน้ำหนักเปอร์เซ็นต์
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={runTestSimulation}
                  disabled={isTestingSpin}
                  className="py-2 px-4 rounded-xl font-black text-xs text-stone-950 bg-amber-400 hover:bg-amber-300 flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition active:scale-95 disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-stone-950" />
                  <span>{isTestingSpin ? 'กำลังทดสอบสุ่ม...' : 'ทดสอบสุ่มจำลอง'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="w-8 h-8 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center border border-stone-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 12-Slot Visualizer Board */}
            <div className="bg-[#07080B] border border-amber-500/20 rounded-2xl p-2.5 relative z-10">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {preview12Slots.map((slot, idx) => {
                  const theme = RARITY_THEMES[slot.rarity] || RARITY_THEMES.COMMON;
                  const isActive = activeTestSlot === idx;
                  const isWinner = winningTestSlot === idx;

                  return (
                    <div
                      key={slot.id}
                      className={`relative rounded-xl border p-2.5 flex flex-col items-center justify-between text-center min-h-[120px] transition-all duration-150 ${
                        isWinner
                          ? 'border-amber-400 bg-amber-500/15 scale-[1.03] z-20'
                          : isActive
                          ? 'border-amber-400 bg-amber-500/10 scale-[1.02] z-10'
                          : 'border-amber-500/15 bg-[#0E1016]'
                      }`}
                    >
                      {/* Top: Slot # & Drop Rate % & Quick Image Edit */}
                      <div className="w-full flex items-center justify-between gap-1 mb-1">
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                            isActive || isWinner
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'text-stone-400 bg-black/60 border-stone-800'
                          }`}
                        >
                          #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const numId = typeof slot.id === 'string' ? parseInt(slot.id.split('-')[0], 10) : Number(slot.id);
                              openEditRewardModal(numId);
                            }}
                            className="p-1 rounded bg-stone-900 hover:bg-amber-500/20 text-stone-400 hover:text-amber-300 border border-stone-800 transition"
                            title="ปรับแต่งรูปภาพ / ข้อมูลของรางวัลนี้"
                          >
                            <ImageIcon className="w-3 h-3" />
                          </button>
                          <span className="text-[10px] font-mono font-black text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            {slot.probability}%
                          </span>
                        </div>
                      </div>

                      {/* Image / Icon */}
                      <div className="relative w-12 h-12 flex items-center justify-center my-1 group/img">
                        <img
                          src={slot.image_url}
                          alt={slot.name}
                          className="max-h-full object-contain filter drop-shadow transition-transform duration-200 group-hover/img:scale-110"
                        />
                      </div>

                      {/* Bottom Name & Rarity */}
                      <div className="w-full mt-1">
                        <h4 className="font-bold text-xs leading-tight line-clamp-1 truncate text-stone-100">
                          {slot.name}
                        </h4>
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-black uppercase mt-1 ${theme.badgeBg}`}>
                          {theme.icon}
                          <span>{slot.rarity}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Test Controls / Explanations */}
            <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-white/5">
              <span>* จำลองอัตราการออกตามค่าน้ำหนักจริง (Weighted RNG) พร้อมเสียง ติ้งๆๆๆ</span>
              <button
                type="button"
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  openWeightConfigurator(previewBox);
                }}
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
              >
                <span>ปรับแก้น้ำหนักเรทสุ่ม</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TEST WINNER POPUP MODAL (CENTER OF SCREEN)                      */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {showTestWinnerPopup && testWonReward && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 select-none">
          <div className="relative w-full max-w-sm bg-[#0B0C11] border border-amber-500/30 rounded-3xl p-6 shadow-2xl text-center overflow-hidden animate-in zoom-in-95 duration-200 space-y-3">
            <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent pointer-events-none" />

            <button
              type="button"
              onClick={() => setShowTestWinnerPopup(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center border border-stone-800"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-300 inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>ยินดีด้วย! คุณได้รับรางวัล (จำลอง)</span>
            </span>

            <div className="w-24 h-24 rounded-2xl bg-[#07080B] border border-amber-500/25 p-2 flex items-center justify-center mx-auto my-2">
              <img src={testWonReward.image_url} alt={testWonReward.name} className="max-h-full object-contain" />
            </div>

            <div className="space-y-1">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase ${RARITY_THEMES[testWonReward.rarity]?.badgeBg || 'bg-zinc-700 text-white'}`}>
                {testWonReward.rarity}
              </span>
              <h3 className="text-base font-black text-white">{testWonReward.name}</h3>
              <p className="text-xs text-amber-400 font-mono font-bold">
                โอกาสออกคำนวณได้: {testWonReward.probability}%
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowTestWinnerPopup(false);
                  runTestSimulation();
                }}
                className="w-full py-2.5 rounded-xl font-black text-xs text-stone-950 bg-amber-400 hover:bg-amber-300 transition shadow"
              >
                สุ่มทดสอบอีกครั้ง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 2. REWARD & PROBABILITY WEIGHTS CONFIGURATOR MODAL             */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {isWeightModalOpen && configBox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
          <div className="relative w-full max-w-5xl bg-[#10141E] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                  <Percent className="w-6 h-6 text-amber-400" />
                  <span>กำหนดของรางวัล 12 ช่อง & เรทสุ่ม: {configBox.name}</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  ระบบคำนวณ % Drop Rate อัตโนมัติจากน้ำหนักรวม: <span className="text-amber-400 font-bold font-mono text-sm">{totalWeight}</span> | จำนวนที่เลือก: <span className="text-white font-bold text-sm">{boxRewards.length} / 12 ช่อง</span>
                </p>
              </div>
              <button
                onClick={() => setIsWeightModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {weightSuccess && (
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

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleAutoFill12Slots}
                  className="py-2 px-3.5 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center gap-1.5 transition shadow-sm"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>เติมให้ครบ 12 ช่องอัตโนมัติ</span>
                </button>

                <button
                  type="button"
                  onClick={handleAutoBalanceRates}
                  className="py-2 px-3.5 rounded-xl text-xs font-bold text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 flex items-center gap-1.5 transition shadow-sm"
                >
                  <Sliders className="w-4 h-4" />
                  <span>ปรับเรทมาตรฐานอัตโนมัติ</span>
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
                  {allRewards.map((rw) => (
                    <option key={rw.id} value={rw.id}>
                      [{rw.rarity}] {rw.name} ({rw.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-36">
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">ค่าน้ำหนัก (Weight)</label>
                <input
                  type="number"
                  min="1"
                  value={weightToAdd}
                  onChange={(e) => setWeightToAdd(parseInt(e.target.value, 10))}
                  className="w-full bg-[#10141E] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleAddRewardToBox}
                  className="py-2.5 px-5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 rounded-xl text-sm font-black transition-all shadow-md shadow-amber-500/20"
                >
                  + เพิ่มลงกล่อง
                </button>
                <button
                  type="button"
                  onClick={openCreateRewardModalDirect}
                  className="py-2.5 px-4 bg-indigo-600/25 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>สร้างของรางวัลใหม่ & รูปภาพ</span>
                </button>
              </div>
            </div>

            {/* Server-Side Weighted RNG Notice */}
            <div className="px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-medium">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  <strong>การันตีสุ่มตามน้ำหนักจริง 100%</strong> (Server-side Weighted RNG): โอกาสออก (%) จะถูกคำนวณแบบ Real-time และบันทึกเข้าสู่ระบบสุ่มของเซิร์ฟเวอร์โดยตรง
                </span>
              </div>
              <span className="font-mono font-bold text-amber-300 bg-black/40 px-3 py-1 rounded-lg border border-amber-500/30 whitespace-nowrap text-xs">
                น้ำหนักรวม: {totalWeight}
              </span>
            </div>

            {/* Weights Table */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 rounded-2xl bg-[#0D1117] border border-white/5 p-2">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 text-xs uppercase font-bold">
                    <th className="py-3 px-3.5">รูปภาพ</th>
                    <th className="py-3 px-3.5">ของรางวัล</th>
                    <th className="py-3 px-3.5">ระดับ Rarity</th>
                    <th className="py-3 px-3.5 text-center">ปรับแต่งรูป</th>
                    <th className="py-3 px-3.5">ค่าน้ำหนัก (Weight)</th>
                    <th className="py-3 px-3.5">Drop Rate (%)</th>
                    <th className="py-3 px-3.5 text-right">ลบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {boxRewards.map((br) => {
                    const prob = totalWeight > 0 ? ((br.weight / totalWeight) * 100).toFixed(2) : '0.00';
                    const theme = RARITY_THEMES[br.rarity] || RARITY_THEMES.COMMON;
                    const displayImg = br.imageUrl || allRewards.find(r => r.id === br.rewardId)?.imageUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80';

                    return (
                      <tr key={br.rewardId} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-3 px-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-black/60 border border-white/10 p-1 flex items-center justify-center flex-shrink-0 shadow-inner">
                            <img
                              src={displayImg}
                              alt={br.rewardName}
                              className="max-h-full object-contain filter drop-shadow"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80';
                              }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="font-bold text-white text-sm block">{br.rewardName}</span>
                          <span className="text-xs text-zinc-400 font-mono">
                            {br.type || 'ITEM'} • {br.value || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${theme.badgeBg}`}>
                            {theme.icon}
                            <span>{br.rarity}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => openEditRewardModal(br.rewardId)}
                            className="py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold inline-flex items-center gap-1.5 transition shadow-sm"
                            title="แก้ไขรูปภาพและข้อมูลของรางวัลนี้"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>แก้ไขรูปภาพ</span>
                          </button>
                        </td>
                        <td className="py-3 px-3.5">
                          <input
                            type="number"
                            min="1"
                            value={br.weight}
                            onChange={(e) => handleWeightChange(br.rewardId, parseInt(e.target.value, 10))}
                            className="w-24 bg-[#151A28] border border-white/15 rounded-xl px-3 py-1.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                          />
                        </td>
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono font-black text-amber-400 text-sm">{prob}%</span>
                            <div className="w-16 h-1.5 rounded-full bg-slate-700/80 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                                style={{ width: `${Math.min(100, parseFloat(prob))}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveRewardFromBox(br.rewardId)}
                            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-2 rounded-xl transition"
                            title="ลบออกจากกล่องนี้"
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
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-300">
                รวม <strong className="text-white">{boxRewards.length}</strong> รายการ | รวมน้ำหนัก <strong className="text-amber-400 font-mono">{totalWeight}</strong>
              </span>
              <button
                type="button"
                onClick={handleSaveWeights}
                className="py-3 px-8 rounded-2xl font-black text-sm text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/25 transition-all"
              >
                บันทึกของรางวัล & เรทสุ่ม
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 3. CREATE / EDIT BOX METADATA MODAL                             */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {isBoxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#10141E] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingBox ? 'แก้ไขข้อมูลกล่องสุ่ม' : 'สร้างกล่องสุ่มใหม่'}
              </h3>
              <button
                onClick={() => setIsBoxModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBox} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">ชื่อกล่อง</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">คำอธิบาย</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 h-16"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">ราคาสุ่ม (บาท)</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value))}
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">ป้าย Badge</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="เช่น MYTHIC, POPULAR"
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Box Cover Image with Direct Device Upload */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-zinc-300">รูปภาพหน้าปกกล่องสุ่ม</label>
                  <button
                    type="button"
                    onClick={() => boxFileInputRef.current?.click()}
                    disabled={isUploadingBoxImg}
                    className="text-[11px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 transition"
                  >
                    {isUploadingBoxImg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>📁 เลือกรูปจากคอม / มือถือ</span>
                  </button>
                </div>
                <input
                  type="file"
                  ref={boxFileInputRef}
                  onChange={handleBoxLocalFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="URL รูปภาพ หรือกดปุ่ม 'เลือกรูปจากคอม/มือถือ' ด้านบน"
                  className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Theme สี</label>
                  <select
                    value={colorTheme}
                    onChange={(e) => setColorTheme(e.target.value)}
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="bronze">Bronze (ทองแดง)</option>
                    <option value="silver">Silver (เงิน)</option>
                    <option value="gold">Gold (ทอง)</option>
                    <option value="mythic">Mythic (ชมพู/ม่วง)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">ลำดับการแสดง (Sort Order)</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value, 10))}
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl font-bold text-xs text-stone-950 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-500/20 transition-all font-black"
                >
                  บันทึกข้อมูลกล่องสุ่ม
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 4. REWARD IMAGE & DETAILS DIRECT CUSTOMIZATION MODAL           */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {isRewardEditModalOpen && (
        <div className="fixed inset-0 z-[110000] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0E121B] border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto">
            {/* Top Hairline Accent */}
            <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {rewardFormIsNew ? 'สร้างของรางวัลใหม่ & ปรับแต่งรูปภาพ' : `ปรับแต่งรูปภาพ & ข้อมูล: ${rewardFormName || 'ของรางวัล'}`}
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    แก้ไขรูปภาพ ชื่อ ระดับ Rarity และมูลค่า ระบบจะอัปเดตลงกระดานสุ่มทันที
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRewardEditModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets Quick Picker */}
            <div className="space-y-1.5 bg-[#151B27] p-3 rounded-2xl border border-white/5">
              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>พรีเซ็ตไอคอนเกมยอดนิยม (คลิกเพื่อเลือกทันที):</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
                {GAME_PRESET_IMAGES.map((preset, pIdx) => {
                  const pTheme = RARITY_THEMES[preset.rarity] || RARITY_THEMES.COMMON;
                  return (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="p-1.5 rounded-xl bg-black/40 hover:bg-amber-500/15 border border-white/5 hover:border-amber-500/30 transition text-left flex items-center gap-2 group"
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-7 h-7 object-contain rounded-md bg-stone-900 border border-white/10 p-0.5 flex-shrink-0"
                      />
                      <div className="overflow-hidden">
                        <span className="text-[10px] font-bold text-stone-200 group-hover:text-amber-300 line-clamp-1 block">
                          {preset.name}
                        </span>
                        <span className={`text-[8px] font-black uppercase ${pTheme.text}`}>
                          {preset.rarity}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customizer Form */}
            <form onSubmit={handleSaveRewardCustomizer} className="space-y-3.5">
              {/* Image Upload & Live Preview Card (Direct PC/Mobile Upload) */}
              <div className="p-3.5 rounded-2xl bg-[#151B27] border border-white/5 space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Live Preview Box with Click to Upload */}
                  <div
                    onClick={() => rewardFileInputRef.current?.click()}
                    className="relative w-24 h-24 rounded-2xl bg-black/70 border border-amber-500/30 p-2 flex items-center justify-center flex-shrink-0 shadow-inner group cursor-pointer hover:border-amber-400 transition"
                    title="คลิกเพื่อเลือกไฟล์รูปภาพจากคอมหรือมือถือ"
                  >
                    {isUploadingRewardImg ? (
                      <div className="flex flex-col items-center gap-1 text-amber-400">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-[9px] font-bold">กำลังอัปโหลด...</span>
                      </div>
                    ) : rewardFormImageUrl ? (
                      <img
                        src={rewardFormImageUrl}
                        alt={rewardFormName || 'Preview'}
                        className="max-h-full object-contain filter drop-shadow transition-transform duration-200 group-hover:scale-110"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-zinc-500 group-hover:text-amber-400 transition">
                        <FileImage className="w-7 h-7" />
                        <span className="text-[8px] font-bold">เลือกรูป</span>
                      </div>
                    )}
                    <span className="absolute -bottom-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-black text-amber-300 border border-amber-500/30 shadow">
                      {isUploadingRewardImg ? 'กำลังอัปโหลด' : 'ตัวอย่างรูป'}
                    </span>
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-zinc-300">
                        รูปภาพของรางวัล (เปิดไฟล์จากคอมหรือมือถือได้เลย)
                      </label>
                      {uploadSuccessTip && (
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> อัปโหลดสำเร็จ!
                        </span>
                      )}
                    </div>

                    {/* Hidden Native File Input (Works on PC, iOS Photos, Android Gallery) */}
                    <input
                      type="file"
                      ref={rewardFileInputRef}
                      onChange={handleRewardLocalFileSelect}
                      accept="image/*"
                      className="hidden"
                    />

                    {/* Prominent Device File Chooser Button */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => rewardFileInputRef.current?.click()}
                        disabled={isUploadingRewardImg}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/40 text-xs font-black transition flex items-center justify-center gap-2 shadow-sm"
                      >
                        {isUploadingRewardImg ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                            <span>กำลังอัปโหลดรูปภาพ...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-amber-400" />
                            <span>📁 เลือกรูปจากคอม / มือถือ (ไม่ต้องใช้ URL)</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Optional Image URL Input */}
                    <div className="pt-0.5">
                      <input
                        type="text"
                        value={rewardFormImageUrl}
                        onChange={(e) => setRewardFormImageUrl(e.target.value)}
                        placeholder="หรือใส่ Image URL (เช่น https://...)"
                        className="w-full bg-[#0E121B] border border-white/10 rounded-xl px-3 py-1.5 text-[11px] text-zinc-300 focus:outline-none focus:border-amber-400 font-mono"
                      />
                      <p className="text-[10px] text-zinc-400 mt-1">
                        * กดปุ่มสีส้มเพื่อเลือกไฟล์รูปจากคอมพิวเตอร์หรือโทรศัพท์มือถือ หรือเลือกจากพรีเซ็ตด้านบน
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reward Name & Rarity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    ชื่อของรางวัล
                  </label>
                  <input
                    type="text"
                    required
                    value={rewardFormName}
                    onChange={(e) => setRewardFormName(e.target.value)}
                    placeholder="เช่น ดาบมังกร หรือ บัตรเติมเงิน"
                    className="w-full bg-[#151B27] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    ระดับความหายาก (Rarity)
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['COMMON', 'RARE', 'EPIC', 'LEGENDARY'] as const).map((r) => {
                      const isSel = rewardFormRarity === r;
                      const theme = RARITY_THEMES[r];
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRewardFormRarity(r)}
                          className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase transition flex flex-col items-center gap-0.5 border ${
                            isSel
                              ? `${theme.badgeBg} border-amber-400 shadow-md`
                              : 'bg-[#151B27] text-zinc-400 border-white/5 hover:border-white/20'
                          }`}
                        >
                          {theme.icon}
                          <span>{r}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Type, Value, Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    ประเภทรางวัล (Type)
                  </label>
                  <select
                    value={rewardFormType}
                    onChange={(e) => setRewardFormType(e.target.value as any)}
                    className="w-full bg-[#151B27] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="ITEM">ITEM (ไอเทมเกม)</option>
                    <option value="CODE">CODE (โค้ดดิจิทัล)</option>
                    <option value="CREDIT">CREDIT (เครดิตเว็บ)</option>
                    <option value="COUPON">COUPON (คูปองส่วนลด)</option>
                    <option value="VIP">VIP (สถานะพิเศษ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    มูลค่า / โค้ดแลกรับ
                  </label>
                  <input
                    type="text"
                    required
                    value={rewardFormValue}
                    onChange={(e) => setRewardFormValue(e.target.value)}
                    placeholder="เช่น VP-2400 หรือ 500"
                    className="w-full bg-[#151B27] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    คงเหลือในคลัง (-1 = ไม่จำกัด)
                  </label>
                  <input
                    type="number"
                    value={rewardFormStock}
                    onChange={(e) => setRewardFormStock(parseInt(e.target.value, 10))}
                    className="w-full bg-[#151B27] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsRewardEditModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={rewardSaveLoading}
                  className="py-2.5 px-6 rounded-xl font-black text-xs text-stone-950 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {rewardSaveLoading ? (
                    <span>กำลังบันทึก...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>บันทึกรูปภาพและข้อมูลของรางวัล</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
