import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Upload,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Layers,
  LayoutGrid,
  ShieldCheck,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { HomeCmsConfig, HomeSlideItem } from '../../types';

const DEFAULT_HOME_CMS: HomeCmsConfig = {
  slides: [
    {
      id: 1,
      image: '/images/banners/banner-topup-speed.jpg',
      badge: '⚡ INSTANT UID TOPUP',
      tag: 'กิจกรรมแนะนำ',
      title: 'สิทธิพิเศษสมาชิกใหม่ รับโบนัสเหรียญสูงสุด +20%',
      description:
        'ระบบเติมเหรียญอัตโนมัติ 24 ชม. ส่งตรงเข้า UID ปลอดภัย 100% เติมครั้งแรกรับโบนัสพิเศษและตั๋วสุ่มกล่องสมบัติฟรี',
      primaryBtn: { label: 'เติมเหรียญทันที', path: '/topup' },
      secondaryBtn: { label: 'สุ่มกล่องสมบัติ', path: '/mystery-box' },
    },
    {
      id: 2,
      image: '/images/banners/banner-lootbox-cyber.jpg',
      badge: '🎁 MYSTERY VAULT EVENT',
      tag: 'กล่องสุ่มยอดฮิต',
      title: 'ปลดล็อกหีบสมบัติ ลุ้นรางวัลใหญ่ระดับ Mythic',
      description:
        'เปิดกล่องสุ่มไอเทมและอุปกรณ์เกมมิ่งระดับไฮเอนด์ ลุ้นรับของแรร์ทันที การันตีไอเทมคุ้มค่าทุกการสุ่ม',
      primaryBtn: { label: 'เข้าสู่ห้องสุ่มกล่อง', path: '/mystery-box' },
      secondaryBtn: { label: 'ดูของรางวัล', path: '/inventory' },
    },
    {
      id: 3,
      image: '/images/banners/banner-royal-vault.jpg',
      badge: '👑 LUCKY KING GACHA',
      tag: 'ฟรีทุกวัน',
      title: 'หมุนวงล้อราชาฟรีทุกวัน ลุ้นรับเครดิต & ไอเทมแรร์',
      description:
        'ล็อกอินทุกวันรับสิทธิ์หมุนฟรี 1 ครั้ง ลุ้น Coins และโค้ดส่วนลดสุดคุ้ม ไม่มีเกลือแน่นอน',
      primaryBtn: { label: 'หมุนวงล้อฟรีทันที', path: '/gacha' },
      secondaryBtn: { label: 'ดูกติกาโปรโมชั่น', path: '/promotions' },
    },
  ],
  subCard1: {
    badge: 'คู่มือผู้เล่น',
    title: 'Aetheria Guide: มือใหม่ควรรู้ เติมเหรียญ & สุ่มกล่องอย่างไรให้คุ้มค่าที่สุด',
    image: '/images/guide-thumb.jpg',
    link: '/topup',
  },
  subCard2: {
    badge: 'กิจกรรม',
    title: 'Happy Daily Check-In: ล็อกอินสะสมแต้มทุกวัน รับฟรีคูปองและโบนัสเหรียญ',
    image: '/images/daily-checkin-thumb.jpg',
    link: '/gacha',
  },
  subCard3: {
    action1: {
      label: 'เติมเหรียญ',
      image: '/images/quick-coins.jpg',
      link: '/topup',
    },
    action2: {
      label: 'สุ่มกล่อง',
      image: '/images/quick-box.jpg',
      link: '/mystery-box',
    },
    action3: {
      label: 'วงล้อฟรี',
      image: '/images/quick-wheel.jpg',
      link: '/gacha',
      badge: 'FREE',
    },
  },
  trustStats: {
    stat1: 'เติมเหรียญระบบอัตโนมัติ ส่งตรงเข้าเกมใน 30 วินาที',
    stat2: 'รางวัลแท้ 100% การันตีความปลอดภัยและโปร่งใส',
    stat3: 'สมาชิกไว้วางใจกว่า 50,000+ ผู้ใช้งานทั่วประเทศ',
  },
};

export const HomePageAdmin: React.FC = () => {
  const [cmsConfig, setCmsConfig] = useState<HomeCmsConfig>(DEFAULT_HOME_CMS);
  const [activeTab, setActiveTab] = useState<'slides' | 'subcards' | 'trust'>('slides');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getSettings();
      if (res.data?.success && res.data.data?.home_cms_config) {
        try {
          const parsed = JSON.parse(res.data.data.home_cms_config);
          setCmsConfig({
            slides: Array.isArray(parsed.slides) && parsed.slides.length > 0 ? parsed.slides : DEFAULT_HOME_CMS.slides,
            subCard1: parsed.subCard1 || DEFAULT_HOME_CMS.subCard1,
            subCard2: parsed.subCard2 || DEFAULT_HOME_CMS.subCard2,
            subCard3: parsed.subCard3 || DEFAULT_HOME_CMS.subCard3,
            trustStats: parsed.trustStats || DEFAULT_HOME_CMS.trustStats,
          });
        } catch (e) {
          console.warn('Failed to parse home_cms_config, using default', e);
          setCmsConfig(DEFAULT_HOME_CMS);
        }
      } else {
        setCmsConfig(DEFAULT_HOME_CMS);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSavedSuccess(false);

      await adminApi.updateSettings({
        home_cms_config: JSON.stringify(cmsConfig),
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'บันทึกข้อมูลไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void, targetId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('ขนาดไฟล์ต้องไม่เกิน 5MB');
      return;
    }

    setUploadingTarget(targetId);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        if (!base64Data) {
          setUploadingTarget(null);
          return;
        }

        // Apply immediately
        callback(base64Data);

        try {
          const res = await adminApi.uploadImage({
            image: base64Data,
            filename: file.name,
          });
          if (res.data?.success && res.data?.url) {
            callback(res.data.url);
          }
        } catch (uploadErr) {
          console.warn('Upload to server failed, retained base64 data:', uploadErr);
        } finally {
          setUploadingTarget(null);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการอ่านไฟล์: ' + err.message);
      setUploadingTarget(null);
    }
  };

  // Slide controls
  const handleUpdateSlide = (index: number, field: string, value: any) => {
    setCmsConfig((prev) => {
      const nextSlides = [...prev.slides];
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        nextSlides[index] = {
          ...nextSlides[index],
          [parent]: {
            ...(nextSlides[index] as any)[parent],
            [child]: value,
          },
        };
      } else {
        nextSlides[index] = {
          ...nextSlides[index],
          [field]: value,
        };
      }
      return { ...prev, slides: nextSlides };
    });
  };

  const handleAddSlide = () => {
    const newSlide: HomeSlideItem = {
      id: Date.now(),
      image: '/images/hero-banner.jpg',
      badge: '🔥 NEW PROMOTION',
      tag: 'โปรโมชั่นใหม่',
      title: 'ข้อความหัวเรื่องแบนเนอร์ใหม่',
      description: 'คำอธิบายรายละเอียดโปรโมชั่นหรือกิจกรรม สามารถปรับแต่งข้อความและรูปภาพได้ทันที',
      primaryBtn: { label: 'ดูรายละเอียด', path: '/promotions' },
      secondaryBtn: { label: 'เติมเหรียญ', path: '/topup' },
    };
    setCmsConfig((prev) => ({
      ...prev,
      slides: [...prev.slides, newSlide],
    }));
  };

  const handleDeleteSlide = (index: number) => {
    if (cmsConfig.slides.length <= 1) {
      alert('ต้องมีสไลด์อย่างน้อย 1 สไลด์เสมอ');
      return;
    }
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสไลด์นี้?')) return;
    setCmsConfig((prev) => ({
      ...prev,
      slides: prev.slides.filter((_, i) => i !== index),
    }));
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= cmsConfig.slides.length) return;

    setCmsConfig((prev) => {
      const nextSlides = [...prev.slides];
      const temp = nextSlides[index];
      nextSlides[index] = nextSlides[targetIndex];
      nextSlides[targetIndex] = temp;
      return { ...prev, slides: nextSlides };
    });
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-zinc-400">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
          <span>กำลังโหลดข้อมูลหน้าแรก CMS...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F141C] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              จัดการเนื้อหาหน้าแรก (Home Page CMS)
              <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Live Storefront
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              แก้ไขรูปภาพแบนเนอร์ ข้อความปุ่ม การ์ดย่อย 3 ช่อง และข้อความสถิติความน่าเชื่อถือ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-semibold transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            <span>ดูหน้าเว็บจริง</span>
          </a>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>กำลังบันทึก...</span>
              </>
            ) : savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>บันทึกสำเร็จแล้ว!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>บันทึกการเปลี่ยนแปลง</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('slides')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'slides'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>แบนเนอร์สไลด์หลัก ({cmsConfig.slides.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('subcards')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'subcards'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>การ์ดย่อย 3 ช่อง (Sub-Hero Cards)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('trust')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'trust'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>ข้อความการันตี (Trust Stats)</span>
        </button>
      </div>

      {/* TAB 1: SLIDES */}
      {activeTab === 'slides' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-400">
              จัดการแบนเนอร์สไลด์ที่แสดงในส่วน Hero ด้านบนสุดของหน้าแรก ลูกค้าสามารถเลื่อนดูได้
            </p>
            <button
              type="button"
              onClick={handleAddSlide}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-indigo-600 hover:text-white text-zinc-300 font-bold text-xs transition-all border border-white/10"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มสไลด์ใหม่</span>
            </button>
          </div>

          <div className="space-y-5">
            {cmsConfig.slides.map((slide, idx) => (
              <div
                key={slide.id || idx}
                className="bg-[#0F141C] border border-white/10 rounded-2xl p-5 shadow-lg space-y-4 hover:border-indigo-500/30 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-500/30">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-sm text-white">
                      สไลด์: {slide.title || 'ไม่มีชื่อหัวข้อ'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/10">
                      Tag: {slide.tag}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveSlide(idx, 'up')}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-zinc-300 hover:text-white transition-all"
                      title="ย้ายขึ้น"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === cmsConfig.slides.length - 1}
                      onClick={() => handleMoveSlide(idx, 'down')}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-zinc-300 hover:text-white transition-all"
                      title="ย้ายลง"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSlide(idx)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                      title="ลบสไลด์นี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left: Image preview & upload */}
                  <div className="lg:col-span-4 space-y-3">
                    <label className="text-xs font-bold text-zinc-300 block">
                      รูปภาพแบนเนอร์ (แนะนำ 1920x800 หรือ 1200x500)
                    </label>
                    <div className="relative aspect-[16/7] rounded-xl overflow-hidden bg-black/60 border border-white/10 group">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/hero-banner.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          <span>เปลี่ยนรูปภาพ</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload(e, (url) => handleUpdateSlide(idx, 'image', url), `slide-${idx}`)
                            }
                          />
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={slide.image}
                        onChange={(e) => handleUpdateSlide(idx, 'image', e.target.value)}
                        placeholder="URL รูปภาพ เช่น /images/..."
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                      <div className="flex items-center justify-between text-[11px] text-zinc-500">
                        <span>อัปโหลดจากเครื่อง:</span>
                        <label className="cursor-pointer text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                          <Upload className="w-3 h-3" />
                          <span>{uploadingTarget === `slide-${idx}` ? 'กำลังอัปโหลด...' : 'เลือกไฟล์...'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload(e, (url) => handleUpdateSlide(idx, 'image', url), `slide-${idx}`)
                            }
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Right: Text fields & buttons */}
                  <div className="lg:col-span-8 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 mb-1 block">Badge (ข้อความป้ายบน)</label>
                        <input
                          type="text"
                          value={slide.badge}
                          onChange={(e) => handleUpdateSlide(idx, 'badge', e.target.value)}
                          placeholder="เช่น 👑 NEW USER BENEFITS"
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 mb-1 block">Tag (ป้ายกำกับสไลด์)</label>
                        <input
                          type="text"
                          value={slide.tag}
                          onChange={(e) => handleUpdateSlide(idx, 'tag', e.target.value)}
                          placeholder="เช่น กิจกรรมแนะนำ"
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 mb-1 block">หัวข้อสไลด์ (Title)</label>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => handleUpdateSlide(idx, 'title', e.target.value)}
                        placeholder="เช่น สิทธิพิเศษสมาชิกใหม่ รับโบนัสเหรียญสูงสุด +20%"
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-bold focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 mb-1 block">คำอธิบาย (Description)</label>
                      <textarea
                        rows={2}
                        value={slide.description}
                        onChange={(e) => handleUpdateSlide(idx, 'description', e.target.value)}
                        placeholder="รายละเอียดสไลด์..."
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Primary Button */}
                      <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-2">
                        <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">
                          ปุ่มหลัก (Primary Button)
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={slide.primaryBtn?.label || ''}
                            onChange={(e) => handleUpdateSlide(idx, 'primaryBtn.label', e.target.value)}
                            placeholder="ข้อความปุ่ม"
                            className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white"
                          />
                          <input
                            type="text"
                            value={slide.primaryBtn?.path || ''}
                            onChange={(e) => handleUpdateSlide(idx, 'primaryBtn.path', e.target.value)}
                            placeholder="ลิงก์ เช่น /topup"
                            className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white font-mono"
                          />
                        </div>
                      </div>

                      {/* Secondary Button */}
                      <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-2">
                        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                          ปุ่มรอง (Secondary Button)
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={slide.secondaryBtn?.label || ''}
                            onChange={(e) => handleUpdateSlide(idx, 'secondaryBtn.label', e.target.value)}
                            placeholder="ข้อความปุ่ม"
                            className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white"
                          />
                          <input
                            type="text"
                            value={slide.secondaryBtn?.path || ''}
                            onChange={(e) => handleUpdateSlide(idx, 'secondaryBtn.path', e.target.value)}
                            placeholder="ลิงก์ เช่น /mystery-box"
                            className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SUBCARDS */}
      {activeTab === 'subcards' && (
        <div className="space-y-6">
          <p className="text-xs text-zinc-400">
            การ์ดย่อย 3 ใบใต้แบนเนอร์หลัก: การ์ดที่ 1 (คู่มือ/บทความ), การ์ดที่ 2 (กิจกรรม/เช็คอิน), และการ์ดที่ 3 (3 ปุ่มด่วน 3D Icons)
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sub-Card 1: Guide */}
            <div className="bg-[#0F141C] border border-white/10 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="font-bold text-sm text-indigo-400 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-xs">1</span>
                  การ์ดช่องที่ 1 (บทความ / คู่มือ)
                </span>
              </div>

              <div className="space-y-3">
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-black/60 border border-white/10 group">
                  <img
                    src={cmsConfig.subCard1.image}
                    alt={cmsConfig.subCard1.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/guide-thumb.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>อัปโหลดรูป</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(
                            e,
                            (url) => setCmsConfig((prev) => ({ ...prev, subCard1: { ...prev.subCard1, image: url } })),
                            'subcard-1'
                          )
                        }
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 mb-1 block">Badge ป้ายกำกับ</label>
                  <input
                    type="text"
                    value={cmsConfig.subCard1.badge}
                    onChange={(e) =>
                      setCmsConfig((prev) => ({ ...prev, subCard1: { ...prev.subCard1, badge: e.target.value } }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 mb-1 block">หัวข้อการ์ด (Title)</label>
                  <textarea
                    rows={2}
                    value={cmsConfig.subCard1.title}
                    onChange={(e) =>
                      setCmsConfig((prev) => ({ ...prev, subCard1: { ...prev.subCard1, title: e.target.value } }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white resize-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 mb-1 block">ลิงก์ปลายทาง (Link)</label>
                  <input
                    type="text"
                    value={cmsConfig.subCard1.link}
                    onChange={(e) =>
                      setCmsConfig((prev) => ({ ...prev, subCard1: { ...prev.subCard1, link: e.target.value } }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 mb-1 block">URL รูปภาพ</label>
                  <input
                    type="text"
                    value={cmsConfig.subCard1.image}
                    onChange={(e) =>
                      setCmsConfig((prev) => ({ ...prev, subCard1: { ...prev.subCard1, image: e.target.value } }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Sub-Card 2: Activity */}
            <div className="bg-[#0F141C] border border-white/10 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="font-bold text-sm text-amber-400 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-xs">2</span>
                  การ์ดช่องที่ 2 (กิจกรรม / เช็คอิน)
                </span>
              </div>

              <div className="space-y-3">
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-black/60 border border-white/10 group">
                  <img
                    src={cmsConfig.subCard2.image}
                    alt={cmsConfig.subCard2.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/daily-checkin-thumb.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>อัปโหลดรูป</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(
                            e,
                            (url) => setCmsConfig((prev) => ({ ...prev, subCard2: { ...prev.subCard2, image: url } })),
                            'subcard-2'
                          )
                        }
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 mb-1 block">Badge ป้ายกำกับ</label>
                  <input
                    type="text"
                    value={cmsConfig.subCard2.badge}
                    onChange={(e) =>
                      setCmsConfig((prev) => ({ ...prev, subCard2: { ...prev.subCard2, badge: e.target.value } }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 mb-1 block">หัวข้อการ์ด (Title)</label>
                  <textarea
                    rows={2}
                    value={cmsConfig.subCard2.title}
                    onChange={(e) =>
                      setCmsConfig((prev) => ({ ...prev, subCard2: { ...prev.subCard2, title: e.target.value } }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white resize-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 mb-1 block">ลิงก์ปลายทาง (Link)</label>
                  <input
                    type="text"
                    value={cmsConfig.subCard2.link}
                    onChange={(e) =>
                      setCmsConfig((prev) => ({ ...prev, subCard2: { ...prev.subCard2, link: e.target.value } }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 mb-1 block">URL รูปภาพ</label>
                  <input
                    type="text"
                    value={cmsConfig.subCard2.image}
                    onChange={(e) =>
                      setCmsConfig((prev) => ({ ...prev, subCard2: { ...prev.subCard2, image: e.target.value } }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Sub-Card 3: 3 Quick Actions */}
            <div className="bg-[#0F141C] border border-white/10 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="font-bold text-sm text-fuchsia-400 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-fuchsia-500/20 flex items-center justify-center text-xs">3</span>
                  การ์ดช่องที่ 3 (3D Quick Actions)
                </span>
              </div>

              <div className="space-y-4">
                {/* Action 1 */}
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">ปุ่มที่ 1 (เหรียญ)</span>
                    <label className="cursor-pointer text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>อัปโหลดไอคอน</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(
                            e,
                            (url) =>
                              setCmsConfig((prev) => ({
                                ...prev,
                                subCard3: { ...prev.subCard3, action1: { ...prev.subCard3.action1, image: url } },
                              })),
                            'action-1'
                          )
                        }
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={cmsConfig.subCard3.action1.label}
                      onChange={(e) =>
                        setCmsConfig((prev) => ({
                          ...prev,
                          subCard3: { ...prev.subCard3, action1: { ...prev.subCard3.action1, label: e.target.value } },
                        }))
                      }
                      placeholder="ข้อความปุ่ม"
                      className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={cmsConfig.subCard3.action1.link}
                      onChange={(e) =>
                        setCmsConfig((prev) => ({
                          ...prev,
                          subCard3: { ...prev.subCard3, action1: { ...prev.subCard3.action1, link: e.target.value } },
                        }))
                      }
                      placeholder="ลิงก์ เช่น /topup"
                      className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Action 2 */}
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-400">ปุ่มที่ 2 (กล่องสุ่ม)</span>
                    <label className="cursor-pointer text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>อัปโหลดไอคอน</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(
                            e,
                            (url) =>
                              setCmsConfig((prev) => ({
                                ...prev,
                                subCard3: { ...prev.subCard3, action2: { ...prev.subCard3.action2, image: url } },
                              })),
                            'action-2'
                          )
                        }
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={cmsConfig.subCard3.action2.label}
                      onChange={(e) =>
                        setCmsConfig((prev) => ({
                          ...prev,
                          subCard3: { ...prev.subCard3, action2: { ...prev.subCard3.action2, label: e.target.value } },
                        }))
                      }
                      placeholder="ข้อความปุ่ม"
                      className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={cmsConfig.subCard3.action2.link}
                      onChange={(e) =>
                        setCmsConfig((prev) => ({
                          ...prev,
                          subCard3: { ...prev.subCard3, action2: { ...prev.subCard3.action2, link: e.target.value } },
                        }))
                      }
                      placeholder="ลิงก์ เช่น /mystery-box"
                      className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Action 3 */}
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-yellow-400">ปุ่มที่ 3 (วงล้อกาชา)</span>
                    <label className="cursor-pointer text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>อัปโหลดไอคอน</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(
                            e,
                            (url) =>
                              setCmsConfig((prev) => ({
                                ...prev,
                                subCard3: { ...prev.subCard3, action3: { ...prev.subCard3.action3, image: url } },
                              })),
                            'action-3'
                          )
                        }
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={cmsConfig.subCard3.action3.label}
                      onChange={(e) =>
                        setCmsConfig((prev) => ({
                          ...prev,
                          subCard3: { ...prev.subCard3, action3: { ...prev.subCard3.action3, label: e.target.value } },
                        }))
                      }
                      placeholder="ข้อความปุ่ม"
                      className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={cmsConfig.subCard3.action3.link}
                      onChange={(e) =>
                        setCmsConfig((prev) => ({
                          ...prev,
                          subCard3: { ...prev.subCard3, action3: { ...prev.subCard3.action3, link: e.target.value } },
                        }))
                      }
                      placeholder="ลิงก์ /gacha"
                      className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white font-mono"
                    />
                    <input
                      type="text"
                      value={cmsConfig.subCard3.action3.badge || ''}
                      onChange={(e) =>
                        setCmsConfig((prev) => ({
                          ...prev,
                          subCard3: { ...prev.subCard3, action3: { ...prev.subCard3.action3, badge: e.target.value } },
                        }))
                      }
                      placeholder="ป้าย FREE"
                      className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-amber-300 font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRUST STATS */}
      {activeTab === 'trust' && (
        <div className="bg-[#0F141C] border border-white/10 rounded-2xl p-6 shadow-lg space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white">แถบข้อความการันตีความน่าเชื่อถือ (Trust Stats Strip)</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              แสดงอยู่ใต้การ์ดย่อย 3 ช่อง ช่วยเพิ่มความมั่นใจในการเติมเงินและเปิดกล่องสุ่มให้กับลูกค้า
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>ข้อความที่ 1 (ระบบอัตโนมัติ)</span>
              </label>
              <input
                type="text"
                value={cmsConfig.trustStats.stat1}
                onChange={(e) =>
                  setCmsConfig((prev) => ({ ...prev, trustStats: { ...prev.trustStats, stat1: e.target.value } }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>ข้อความที่ 2 (ความปลอดภัย)</span>
              </label>
              <input
                type="text"
                value={cmsConfig.trustStats.stat2}
                onChange={(e) =>
                  setCmsConfig((prev) => ({ ...prev, trustStats: { ...prev.trustStats, stat2: e.target.value } }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>ข้อความที่ 3 (สถิติผู้ใช้งาน)</span>
              </label>
              <input
                type="text"
                value={cmsConfig.trustStats.stat3}
                onChange={(e) =>
                  setCmsConfig((prev) => ({ ...prev, trustStats: { ...prev.trustStats, stat3: e.target.value } }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
