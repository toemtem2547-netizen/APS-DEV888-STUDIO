import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Plus,
  Edit2,
  Trash2,
  Search,
  Sparkles,
  Percent,
  TrendingUp,
  AlertCircle,
  Eye,
  CheckCircle2,
  X,
  Upload,
  Loader2,
  Image as ImageIcon,
  Wand2,
  Sliders,
  Target,
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { GachaItemAdmin, Reward } from '../../types';

const RARITY_THEMES: Record<string, { badgeBg: string; text: string; label: string }> = {
  LEGENDARY: { badgeBg: 'bg-amber-400 text-zinc-950 font-black', text: 'text-amber-400', label: '👑 LEGENDARY' },
  EPIC: { badgeBg: 'bg-purple-600 text-white font-black', text: 'text-purple-400', label: '💎 EPIC' },
  RARE: { badgeBg: 'bg-cyan-500 text-zinc-950 font-black', text: 'text-cyan-400', label: '★ RARE' },
  COMMON: { badgeBg: 'bg-zinc-700 text-zinc-200 font-semibold', text: 'text-zinc-400', label: 'COMMON' },
};

const GAME_PRESET_IMAGES = [
  { name: 'Liquid-Cooled Gaming PC', subtitle: 'คอมพิวเตอร์เกมมิ่งระดับไฮเอนด์', url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=300&auto=format&fit=crop&q=80', rarity: 'LEGENDARY' as const, valueText: 'มูลค่า ฿85,000', defaultRate: 0.25 },
  { name: 'GeForce RTX 4090 OC', subtitle: 'การ์ดจอรุ่นท็อปพลังกราฟิกสูงสุด', url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300&auto=format&fit=crop&q=80', rarity: 'LEGENDARY' as const, valueText: 'มูลค่า ฿69,900', defaultRate: 0.35 },
  { name: 'จอโค้ง 34" OLED 240Hz', subtitle: 'จอมอนิเตอร์เกมมิ่งอัลตร้าไวด์', url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&auto=format&fit=crop&q=80', rarity: 'LEGENDARY' as const, valueText: 'มูลค่า ฿35,900', defaultRate: 0.60 },
  { name: '3,000 COINS Jackpot', subtitle: 'แจ็คพอตใหญ่เข้ากระเป๋าทันที', url: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=300&auto=format&fit=crop&q=80', rarity: 'LEGENDARY' as const, valueText: '฿3,000 เครดิต', defaultRate: 0.80 },
  { name: 'VR Gaming Headset 3D', subtitle: 'แว่นตา VR เสมือนจริง', url: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=300&auto=format&fit=crop&q=80', rarity: 'EPIC' as const, valueText: 'มูลค่า ฿18,900', defaultRate: 1.50 },
  { name: 'Cyber Gaming Chair', subtitle: 'เก้าอี้เกมมิ่งหนังแท้ Ergonomic', url: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=300&auto=format&fit=crop&q=80', rarity: 'EPIC' as const, valueText: 'มูลค่า ฿12,500', defaultRate: 2.00 },
  { name: 'Custom Mechanical Keyboard', subtitle: 'คีย์บอร์ดกลไกไฟ RGB พรีเมียม', url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=300&auto=format&fit=crop&q=80', rarity: 'EPIC' as const, valueText: 'มูลค่า ฿6,900', defaultRate: 2.50 },
  { name: 'Spatial Audio Headset 7.1', subtitle: 'หูฟังเกมมิ่งระบบเสียงรอบทิศทาง', url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&auto=format&fit=crop&q=80', rarity: 'EPIC' as const, valueText: 'มูลค่า ฿4,900', defaultRate: 3.00 },
  { name: 'Studio USB Microphone', subtitle: 'ไมโครโฟนสำหรับสตรีมเมอร์', url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&auto=format&fit=crop&q=80', rarity: 'EPIC' as const, valueText: 'มูลค่า ฿3,800', defaultRate: 3.50 },
  { name: '1,000 COINS Bonus', subtitle: 'เครดิตกระเป๋าตังค์โบนัสใหญ่', url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=300&auto=format&fit=crop&q=80', rarity: 'EPIC' as const, valueText: '฿1,000 เครดิต', defaultRate: 4.00 },
  { name: 'RGB Extended Mousepad', subtitle: 'แผ่นรองเมาส์ขนาดใหญ่ไฟขอบ', url: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=300&auto=format&fit=crop&q=80', rarity: 'RARE' as const, valueText: 'มูลค่า ฿1,290', defaultRate: 5.50 },
  { name: 'Aluminum Headphone Stand', subtitle: 'ขาตั้งหูฟังพร้อมพอร์ต Hub', url: 'https://images.unsplash.com/photo-1584679109597-c656b19974c9?w=300&auto=format&fit=crop&q=80', rarity: 'RARE' as const, valueText: 'มูลค่า ฿990', defaultRate: 6.00 },
  { name: '500 COINS Voucher', subtitle: 'เครดิตเปิดกาชาเพิ่มเติม', url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=300&auto=format&fit=crop&q=80', rarity: 'RARE' as const, valueText: '฿500 เครดิต', defaultRate: 7.00 },
  { name: '200 COINS Wallet', subtitle: 'เหรียญสะสมพูลเงินสด', url: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=300&auto=format&fit=crop&q=80', rarity: 'COMMON' as const, valueText: '฿200 เครดิต', defaultRate: 15.00 },
  { name: '100 COINS Return', subtitle: 'เหรียญสะสมคืนทุน', url: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=300&auto=format&fit=crop&q=80', rarity: 'COMMON' as const, valueText: '฿100 เครดิต', defaultRate: 20.00 },
  { name: 'Gaming Sticker Pack', subtitle: 'สติกเกอร์ตกแต่งเคสกันน้ำ', url: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=300&auto=format&fit=crop&q=80', rarity: 'COMMON' as const, valueText: 'มูลค่า ฿150', defaultRate: 27.00 },
];

export const GachaAdminPage: React.FC = () => {
  const [items, setItems] = useState<GachaItemAdmin[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 1. Single Create/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<GachaItemAdmin | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields for Single Modal
  const [rewardId, setRewardId] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [valueText, setValueText] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [rarity, setRarity] = useState<'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'>('COMMON');
  const [rate, setRate] = useState<number>(5.0);
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // 2. Batch Rate Configurator Modal State (All-in-one Single Page Rate Configurator)
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [batchItems, setBatchItems] = useState<GachaItemAdmin[]>([]);
  const [batchSuccess, setBatchSuccess] = useState<boolean>(false);
  const [selectedRewardToAdd, setSelectedRewardToAdd] = useState<number>(0);
  const [rateToAdd, setRateToAdd] = useState<number>(5.0);
  const [isSavingBatch, setIsSavingBatch] = useState<boolean>(false);

  // 3. Item/Reward Customizer Sub-Modal State
  const [isRewardEditModalOpen, setIsRewardEditModalOpen] = useState<boolean>(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editSubtitle, setEditSubtitle] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('');
  const [editValueText, setEditValueText] = useState<string>('');
  const [editImageUrl, setEditImageUrl] = useState<string>('');
  const [editRarity, setEditRarity] = useState<'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'>('COMMON');
  const [isSubModalUploading, setIsSubModalUploading] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gachaRes, rewardRes] = await Promise.all([
        adminApi.getGachaItems(),
        adminApi.getRewards(),
      ]);

      if (gachaRes.data?.success) {
        const raw = gachaRes.data.data || [];
        const normalized: GachaItemAdmin[] = raw.map((it: any) => ({
          ...it,
          reward_id: it.reward_id ?? it.rewardId ?? 0,
          reward_name: it.reward_name ?? it.rewardName ?? '',
          value_text: it.value_text ?? it.valueText ?? '',
          image_url: it.image_url ?? it.imageUrl ?? '',
          is_active: it.is_active !== undefined ? Boolean(it.is_active) : (it.isActive !== undefined ? Boolean(it.isActive) : true),
          sort_order: it.sort_order ?? it.sortOrder ?? 0,
          weight: parseFloat(String(it.weight || 0)) || 0,
        }));
        setItems(normalized);
      }
      if (rewardRes.data?.success) {
        setRewards(rewardRes.data.data || []);
        if (rewardRes.data.data?.length > 0 && selectedRewardToAdd === 0) {
          setSelectedRewardToAdd(rewardRes.data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load gacha items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto open modal if URL contains ?openWeights=true
    const params = new URLSearchParams(window.location.search);
    if (params.get('openWeights') === 'true') {
      openBatchRateModal();
    }
  }, []);

  const totalRate = items
    .filter((i) => i.is_active ?? (i as any).isActive ?? true)
    .reduce((sum, i) => sum + (parseFloat(String(i.weight || 0)) || 0), 0);

  const batchTotalRate = batchItems
    .filter((i) => i.is_active ?? (i as any).isActive ?? true)
    .reduce((sum, i) => sum + (parseFloat(String(i.weight || 0)) || 0), 0);

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

    const newItem: GachaItemAdmin = {
      id: 0,
      reward_id: rw.id,
      rewardId: rw.id,
      reward_name: rw.name,
      rewardName: rw.name,
      title: rw.name,
      subtitle: rw.description || 'สิทธิพิเศษพรีเมียม',
      category: rw.type === 'ITEM' ? 'Gaming Gear' : (rw.type === 'CREDIT' ? 'เหรียญ Coins' : 'ของรางวัล'),
      value_text: rw.value ? `มูลค่า ${rw.value}` : 'ฟรี',
      valueText: rw.value ? `มูลค่า ${rw.value}` : 'ฟรี',
      image_url: rw.imageUrl || '/images/boxes/gold.jpg',
      imageUrl: rw.imageUrl || '/images/boxes/gold.jpg',
      rarity: rw.rarity,
      weight: Math.max(0.01, rateToAdd || 5.0),
      is_active: true,
      isActive: true,
      sort_order: batchItems.length + 1,
      sortOrder: batchItems.length + 1,
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    setBatchItems((prev) => [...prev, newItem]);
  };

  const handleAutoFillRewards = () => {
    if (rewards.length === 0) return;
    const current = [...batchItems];
    const existingTitles = new Set(current.map((it) => it.title.toLowerCase()));

    for (const rw of rewards) {
      if (!existingTitles.has(rw.name.toLowerCase())) {
        let defaultRate = 5.0;
        if (rw.rarity === 'LEGENDARY') defaultRate = 0.5;
        else if (rw.rarity === 'EPIC') defaultRate = 2.0;
        else if (rw.rarity === 'RARE') defaultRate = 4.0;

        current.push({
          id: 0,
          reward_id: rw.id,
          rewardId: rw.id,
          reward_name: rw.name,
          rewardName: rw.name,
          title: rw.name,
          subtitle: rw.description || 'ของรางวัลพรีเมียม',
          category: rw.type === 'ITEM' ? 'Gaming Gear' : 'ไอเทมพิเศษ',
          value_text: rw.value ? `มูลค่า ${rw.value}` : 'ฟรี',
          valueText: rw.value ? `มูลค่า ${rw.value}` : 'ฟรี',
          image_url: rw.imageUrl || '/images/boxes/gold.jpg',
          imageUrl: rw.imageUrl || '/images/boxes/gold.jpg',
          rarity: rw.rarity,
          weight: defaultRate,
          is_active: true,
          isActive: true,
          sort_order: current.length + 1,
          sortOrder: current.length + 1,
          created_at: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        });
        existingTitles.add(rw.name.toLowerCase());
      }
    }
    setBatchItems(current);
  };

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

  const handleNormalizeTo100 = () => {
    if (batchItems.length === 0) return;
    const currentTotal = batchItems
      .filter((i) => i.is_active ?? (i as any).isActive ?? true)
      .reduce((s, it) => s + (parseFloat(String(it.weight || 0)) || 0), 0);

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
      await adminApi.batchUpdateGachaItems(batchItems);
      setBatchSuccess(true);
      await fetchData();
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
  const openEditRewardModal = (item: GachaItemAdmin, index: number) => {
    setEditingItemIndex(index);
    setEditTitle(item.title);
    setEditSubtitle(item.subtitle || '');
    setEditCategory(item.category || 'Gaming Gear');
    setEditValueText(item.value_text || (item as any).valueText || 'ฟรี');
    setEditImageUrl(item.image_url || (item as any).imageUrl || '');
    setEditRarity(item.rarity as any);
    setIsRewardEditModalOpen(true);
  };

  const handleApplyPreset = (p: typeof GAME_PRESET_IMAGES[0]) => {
    setEditTitle(p.name);
    setEditSubtitle(p.subtitle);
    setEditCategory('Gaming Gear');
    setEditValueText(p.valueText);
    setEditImageUrl(p.url);
    setEditRarity(p.rarity);
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
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WebP)');
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

          if (res.data?.success && res.data?.url) {
            setEditImageUrl(res.data.url);
          } else {
            setEditImageUrl(base64Data);
          }
        } catch {
          setEditImageUrl(reader.result as string);
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
          title: editTitle.trim(),
          subtitle: editSubtitle.trim(),
          category: editCategory.trim(),
          value_text: editValueText.trim(),
          valueText: editValueText.trim(),
          image_url: editImageUrl.trim(),
          imageUrl: editImageUrl.trim(),
          rarity: editRarity,
        };
      }
      return updated;
    });

    setIsRewardEditModalOpen(false);
  };

  // ═════════════════════════════════════════════════════════════════
  // SINGLE CREATE / EDIT MODAL HANDLERS
  // ═════════════════════════════════════════════════════════════════
  const openCreateModal = () => {
    setEditingItem(null);
    setFormError(null);
    if (rewards.length > 0) {
      const defaultRw = rewards[0];
      setRewardId(defaultRw.id);
      setTitle(defaultRw.name);
      setSubtitle('สิทธิพิเศษพรีเมียม');
      setCategory('Gaming Gear');
      setValueText('มูลค่า ฿500 ฟรี');
      setImageUrl(defaultRw.imageUrl);
      setRarity(defaultRw.rarity);
    } else {
      setRewardId(1);
      setTitle('');
      setSubtitle('');
      setCategory('Gaming Gear');
      setValueText('');
      setImageUrl('/images/boxes/gold.jpg');
      setRarity('COMMON');
    }
    setRate(5.0);
    setSortOrder(items.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: GachaItemAdmin) => {
    setEditingItem(item);
    setFormError(null);
    setRewardId(item.reward_id ?? (item as any).rewardId ?? 1);
    setTitle(item.title);
    setSubtitle(item.subtitle || '');
    setCategory(item.category || '');
    setValueText(item.value_text || (item as any).valueText || '');
    setImageUrl(item.image_url || (item as any).imageUrl || '');
    setRarity(item.rarity);
    setRate(parseFloat(String(item.weight || 0)) || 5.0);
    setSortOrder(item.sort_order ?? (item as any).sortOrder ?? 0);
    setIsActive(item.is_active ?? (item as any).isActive ?? true);
    setIsModalOpen(true);
  };

  const handleRewardSelect = (id: number) => {
    setRewardId(id);
    const selected = rewards.find((r) => r.id === id);
    if (selected) {
      setTitle(selected.name);
      setImageUrl(selected.imageUrl);
      setRarity(selected.rarity);
      setValueText(selected.value || 'ฟรี');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setFormError('กรุณากรอกชื่อรางวัล');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const payload = {
        rewardId,
        title,
        subtitle,
        category,
        valueText,
        imageUrl,
        rarity,
        weight: parseFloat(String(rate)) || 5.0,
        sortOrder: Number(sortOrder),
        isActive,
      };

      if (editingItem) {
        await adminApi.updateGachaItem(editingItem.id, payload);
      } else {
        await adminApi.createGachaItem(payload);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Save failed:', err);
      setFormError(err.response?.data?.message || 'บันทึกข้อมูลล้มเหลว');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, itemTitle: string) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${itemTitle}" ออกจากตู้สุ่ม?`)) return;

    try {
      await adminApi.deleteGachaItem(id);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถลบรายการได้');
    }
  };

  const filteredItems = items.filter(
    (i) =>
      i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.rarity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-400" />
            จัดการตู้สุ่มวงล้อกาชา (Gacha Lucky Vault)
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            กำหนดของรางวัลในตู้ ปรับเรทโอกาสสุ่มได้ (%) แน่นอนแบบเรียลไทม์ และตรวจสอบอัตราความน่าจะเป็นของวงล้อกาชา
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
            <span>% กำหนดของรางวัลในตู้ & ปรับเรทสุ่ม (%)</span>
          </button>

          <button
            onClick={openCreateModal}
            className="py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มของรางวัลในตู้สุ่ม</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-4 rounded-2xl bg-[#10141E] border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 font-medium">จำนวนของรางวัลในตู้</p>
            <h3 className="text-2xl font-black text-white">{items.length} รายการ</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#10141E] border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 font-medium">ผลรวมเรทสุ่มทั้งหมด</p>
            <h3 className="text-2xl font-black text-white">{totalRate.toFixed(2)}%</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#10141E] border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 font-medium">ความแม่นยำระบบสุ่มกาชา</p>
            <h3 className="text-2xl font-black text-emerald-400">100% สุ่มจริงตามเรท %</h3>
          </div>
        </div>
      </div>

      {/* Search Bar & Quick Access */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="max-w-md w-full relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาตามชื่อรางวัล, หมวดหมู่, หรือความหายาก..."
            className="w-full bg-[#10141E] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          type="button"
          onClick={openBatchRateModal}
          className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-bold transition flex items-center gap-2 shadow-sm"
        >
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>เปิดหน้าต่างปรับเรท % และรางวัลพร้อมกันทั้งตู้กาชา</span>
        </button>
      </div>

      {/* Items Table (CLEAN, NO REPETITIVE CMS BUTTONS ON ROWS) */}
      <div className="bg-[#10141E] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-[#151A28] text-zinc-400 text-[11px] uppercase tracking-wider font-bold">
                <th className="py-4 px-6 whitespace-nowrap">ลำดับ</th>
                <th className="py-4 px-6 whitespace-nowrap">ของรางวัล</th>
                <th className="py-4 px-6 whitespace-nowrap">หมวดหมู่</th>
                <th className="py-4 px-6 whitespace-nowrap">ระดับความหายาก</th>
                <th className="py-4 px-6 whitespace-nowrap">ป้ายมูลค่า</th>
                <th className="py-4 px-6 whitespace-nowrap">โอกาสดรอป (%)</th>
                <th className="py-4 px-6 whitespace-nowrap">สถานะ</th>
                <th className="py-4 px-6 text-right whitespace-nowrap">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-zinc-400">
                    กำลังโหลดข้อมูลของรางวัลในตู้สุ่ม...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-zinc-500">
                    ไม่พบรายการของรางวัลในตู้กาชา
                  </td>
                </tr>
              ) : (
                filteredItems.map((it) => {
                  const isActiveItem = it.is_active ?? (it as any).isActive ?? true;
                  const itemRateVal = parseFloat(String(it.weight || 0)) || 0;
                  const prob =
                    totalRate > 0 && isActiveItem
                      ? ((itemRateVal / totalRate) * 100).toFixed(2)
                      : '0.00';
                  const theme = RARITY_THEMES[it.rarity] || RARITY_THEMES.COMMON;

                  return (
                    <tr key={it.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 text-zinc-400 font-mono whitespace-nowrap">
                        #{it.sort_order ?? (it as any).sortOrder ?? it.id}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 overflow-hidden flex-shrink-0 p-1 flex items-center justify-center shadow-inner">
                            <img
                              src={it.image_url || (it as any).imageUrl || '/images/boxes/gold.jpg'}
                              alt={it.title}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/boxes/gold.jpg';
                              }}
                              className="w-full h-full object-contain filter drop-shadow"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{it.title}</div>
                            <div className="text-[11px] text-zinc-400">{it.subtitle}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-zinc-300 whitespace-nowrap">{it.category}</td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider ${theme.badgeBg}`}>
                          {theme.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 whitespace-nowrap">
                          {it.value_text || (it as any).valueText || 'ฟรี'}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-amber-400 font-mono text-sm">{itemRateVal.toFixed(2)}%</span>
                          <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                            <div
                              className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                              style={{ width: `${Math.min(100, parseFloat(prob))}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {isActiveItem ? (
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
                            title="แก้ไขข้อมูลรางวัล"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(it.id, it.title)}
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
      {/*    (PURE DIRECT % RATE TUNER FOR GACHA, NO CONFUSING WEIGHTS)  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
          <div className="relative w-full max-w-5xl bg-[#10141E] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                  <Percent className="w-6 h-6 text-amber-400" />
                  <span>กำหนดของรางวัลในตู้กาชา & ปรับเรทสุ่ม (%)</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  ปรับตั้งค่าเรทโอกาสออกของรางวัลแต่ละชิ้นได้อิสระตาม % จริง | ผลรวมเรทปัจจุบัน:{' '}
                  <span className="text-amber-400 font-bold font-mono text-sm">
                    {batchTotalRate.toFixed(2)}%
                  </span>{' '}
                  | จำนวนของรางวัลในตู้:{' '}
                  <span className="text-white font-bold text-sm">{batchItems.length} รายการ</span>
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
                  title="ปรับสเกลให้เรททุกชิ้นรวมกันได้ 100% พอดีเป๊ะ"
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
                  onClick={handleAutoFillRewards}
                  className="py-2 px-3.5 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center gap-1.5 transition shadow-sm active:scale-95"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>เติมของรางวัลจากระบบ</span>
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
                  + เพิ่มลงตู้กาชา
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
                        rewardId: 0,
                        reward_name: 'ของรางวัลใหม่',
                        rewardName: 'ของรางวัลใหม่',
                        title: 'ของรางวัลใหม่',
                        subtitle: 'รายละเอียดรางวัลพิเศษ',
                        category: 'Gaming Gear',
                        value_text: 'มูลค่า ฿2,500',
                        valueText: 'มูลค่า ฿2,500',
                        image_url: GAME_PRESET_IMAGES[0].url,
                        imageUrl: GAME_PRESET_IMAGES[0].url,
                        rarity: 'EPIC',
                        weight: 2.5,
                        is_active: true,
                        isActive: true,
                        sort_order: newIdx + 1,
                        sortOrder: newIdx + 1,
                        created_at: new Date().toISOString(),
                        createdAt: new Date().toISOString(),
                      },
                    ]);
                    openEditRewardModal(
                      {
                        id: 0,
                        reward_id: 0,
                        rewardId: 0,
                        reward_name: 'ของรางวัลใหม่',
                        rewardName: 'ของรางวัลใหม่',
                        title: 'ของรางวัลใหม่',
                        subtitle: 'รายละเอียดรางวัลพิเศษ',
                        category: 'Gaming Gear',
                        value_text: 'มูลค่า ฿2,500',
                        valueText: 'มูลค่า ฿2,500',
                        image_url: GAME_PRESET_IMAGES[0].url,
                        imageUrl: GAME_PRESET_IMAGES[0].url,
                        rarity: 'EPIC',
                        weight: 2.5,
                        is_active: true,
                        isActive: true,
                        sort_order: newIdx + 1,
                        sortOrder: newIdx + 1,
                        created_at: new Date().toISOString(),
                        createdAt: new Date().toISOString(),
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

            {/* Server-Side True Probability RNG Notice */}
            <div className="px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-medium">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  <strong>การันตีสุ่มตามเรทจริง 100%</strong> (Real-time True Probability RNG): กำหนดกี่ % โอกาสออกจริงตามนั้นทันที
                </span>
              </div>
              <span className="font-mono font-bold text-amber-300 bg-black/40 px-3 py-1 rounded-lg border border-amber-500/30 whitespace-nowrap text-xs">
                รวมเรทปัจจุบัน: {batchTotalRate.toFixed(2)}%
              </span>
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
                    const displayImg = item.image_url || (item as any).imageUrl || '/images/boxes/gold.jpg';

                    return (
                      <tr key={index} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-3 px-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-black/60 border border-white/10 p-1 flex items-center justify-center flex-shrink-0 shadow-inner">
                            <img
                              src={displayImg}
                              alt={item.title}
                              className="max-h-full object-contain filter drop-shadow"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = '/images/boxes/gold.jpg';
                              }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="font-bold text-white text-sm block">{item.title}</span>
                          <span className="text-xs text-zinc-400 font-mono">
                            {item.subtitle || item.category || 'ITEM'}
                          </span>
                        </td>
                        <td className="py-3 px-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] uppercase ${theme.badgeBg}`}>
                            <span>{theme.label}</span>
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
                    💡 แนะนำ: กดปุ่ม <span className="text-emerald-400 font-bold">"ปรับให้รวมครบ 100%"</span> ด้านบนเพื่อให้เรททุกชิ้นรวมได้ 100% พอดี
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
                <span>ปรับแต่งรูปภาพ & ข้อมูลรางวัลในตู้กาชา</span>
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
                      className={`p-1.5 rounded-lg border text-center transition flex flex-col items-center gap-1 ${editImageUrl === preset.url
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
                      src={editImageUrl || '/images/boxes/gold.jpg'}
                      alt="Preview"
                      className="max-h-full object-contain filter drop-shadow"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/boxes/gold.jpg';
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
                        value={editImageUrl}
                        onChange={(e) => setEditImageUrl(e.target.value)}
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
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="เช่น Liquid-Cooled Gaming PC"
                      className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Subtitle & Category & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">คำอธิบายย่อย (Subtitle)</label>
                  <input
                    type="text"
                    value={editSubtitle}
                    onChange={(e) => setEditSubtitle(e.target.value)}
                    placeholder="เช่น คอมพิวเตอร์เกมมิ่งท็อป"
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">หมวดหมู่ (Category)</label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    placeholder="เช่น Gaming Gear"
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">ป้ายมูลค่า (Value Text)</label>
                  <input
                    type="text"
                    value={editValueText}
                    onChange={(e) => setEditValueText(e.target.value)}
                    placeholder="เช่น มูลค่า ฿85,000"
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Rarity */}
              <div className="text-xs">
                <label className="block font-semibold text-zinc-300 mb-1">ระดับความหายาก (Rarity)</label>
                <select
                  value={editRarity}
                  onChange={(e) => setEditRarity(e.target.value as any)}
                  className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="COMMON">COMMON (ทั่วไป)</option>
                  <option value="RARE">RARE (หายาก)</option>
                  <option value="EPIC">EPIC (มหากาพย์)</option>
                  <option value="LEGENDARY">LEGENDARY (ตำนาน)</option>
                </select>
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
          <div className="relative w-full max-w-2xl bg-[#0F121C] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">
                  {editingItem ? `แก้ไขรางวัลในตู้กาชา: ${editingItem.title}` : 'เพิ่มของรางวัลในตู้กาชา'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Linked Reward Picker */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">ผูกกับของรางวัลในคลัง (Reward)</label>
                <select
                  value={rewardId}
                  onChange={(e) => handleRewardSelect(Number(e.target.value))}
                  className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
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
                  <label className="text-xs font-semibold text-zinc-300">ชื่อของรางวัล (Title)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="เช่น Liquid-Cooled Gaming PC"
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">คำอธิบายย่อย (Subtitle)</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="เช่น คอมพิวเตอร์ท็อป"
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Category & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">หมวดหมู่ (Category)</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="เช่น Gaming Gear"
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">ป้ายมูลค่า (Value Text)</label>
                  <input
                    type="text"
                    value={valueText}
                    onChange={(e) => setValueText(e.target.value)}
                    placeholder="เช่น มูลค่า ฿85,000"
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Image URL & Upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">URL รูปภาพ หรือ อัปโหลดจากคอมพิวเตอร์</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="/images/boxes/gold.jpg"
                    className="flex-1 bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <label className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-200 cursor-pointer flex items-center gap-1.5 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'อัปโหลด...' : 'เลือกรูปภาพ'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setIsUploading(true);
                          const reader = new FileReader();
                          reader.onload = async () => {
                            const b64 = reader.result as string;
                            setImageUrl(b64);
                            try {
                              const res = await adminApi.uploadImage({ image: b64, filename: file.name });
                              if (res.data?.success && res.data?.url) setImageUrl(res.data.url);
                            } catch { } finally {
                              setIsUploading(false);
                            }
                          };
                          reader.readAsDataURL(file);
                        } catch {
                          setIsUploading(false);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Rarity & Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">ระดับความหายาก (Rarity)</label>
                  <select
                    value={rarity}
                    onChange={(e) => setRarity(e.target.value as any)}
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
                      value={rate}
                      onChange={(e) => setRate(parseFloat(e.target.value) || 0.01)}
                      className="w-full bg-[#151A28] border border-white/10 rounded-xl pl-3.5 pr-8 py-2.5 text-xs text-amber-300 focus:outline-none focus:border-amber-400 font-mono font-bold"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">%</span>
                  </div>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="gacha_item_active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-white/5 border-white/20"
                />
                <label htmlFor="gacha_item_active" className="text-xs text-zinc-300 cursor-pointer">
                  เปิดใช้งานของรางวัลนี้ในตู้สุ่มทันที (Active)
                </label>
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
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'กำลังบันทึก...' : (editingItem ? 'บันทึกการแก้ไข' : 'สร้างของรางวัล')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GachaAdminPage;
