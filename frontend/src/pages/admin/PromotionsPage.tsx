import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, Percent, Sparkles } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { Promotion, Coupon } from '../../types';

export const PromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [promoType, setPromoType] = useState<'DISCOUNT' | 'BONUS' | 'FLASH_SALE'>('DISCOUNT');
  const [discountPercent, setDiscountPercent] = useState(10);
  const [bonusPercent, setBonusPercent] = useState(0);
  const [minSpend, setMinSpend] = useState(100);
  const [code, setCode] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchPromos = async () => {
    try {
      const res = await adminApi.getPromotions();
      if (res.data?.success) {
        setPromotions(res.data.data.promotions);
        setCoupons(res.data.data.coupons);
      }
    } catch (err) {
      console.error('Failed to load promotions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const openCreateModal = () => {
    setEditingPromo(null);
    setTitle('');
    setSubtitle('');
    setBannerUrl('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80');
    setPromoType('DISCOUNT');
    setDiscountPercent(10);
    setBonusPercent(0);
    setMinSpend(100);
    setCode('VALOR10');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Promotion) => {
    setEditingPromo(p);
    setTitle(p.title);
    setSubtitle(p.subtitle);
    setBannerUrl(p.bannerUrl);
    setPromoType(p.promoType);
    setDiscountPercent(p.discountPercent);
    setBonusPercent(p.bonusPercent);
    setMinSpend(p.minSpend);
    setCode(p.code || '');
    setIsActive(p.isActive);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        subtitle,
        bannerUrl,
        promoType,
        discountPercent: Number(discountPercent),
        bonusPercent: Number(bonusPercent),
        minSpend: Number(minSpend),
        code: code.trim().toUpperCase() || null,
        isActive,
      };

      if (editingPromo) {
        await adminApi.updatePromotion(editingPromo.id, payload);
      } else {
        await adminApi.createPromotion(payload);
      }

      setIsModalOpen(false);
      fetchPromos();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving promotion');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('คุณต้องการลบโปรโมชั่นนี้ใช่หรือไม่?')) return;
    try {
      await adminApi.deletePromotion(id);
      fetchPromos();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting promotion');
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">โปรโมชั่น & คูปองส่วนลด (Promotions)</h1>
          <p className="text-xs text-zinc-400">สร้างแคมเปญลดราคา เพิ่มโบนัส และจัดการรหัสคูปอง</p>
        </div>

        <button
          onClick={openCreateModal}
          className="py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มโปรโมชั่นใหม่</span>
        </button>
      </div>

      {/* Promotions List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">แคมเปญโปรโมชั่นที่เปิดใช้งาน</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promotions.map((p) => (
            <div
              key={p.id}
              className="bg-[#10141E] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    {p.promoType}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white">{p.title}</h3>
                <p className="text-xs text-zinc-400">{p.subtitle}</p>

                {p.code && (
                  <p className="text-xs font-mono text-amber-400 font-bold mt-2">
                    โค้ดคูปอง: <span className="bg-black/60 px-2 py-0.5 rounded border border-white/10">{p.code}</span>
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                <span>ยอดขั้นต่ำ: ฿{(p.minSpend ?? 0).toFixed(2)}</span>
                <span className="font-bold text-emerald-400">
                  {(p.discountPercent ?? 0) > 0 ? `ลด ${p.discountPercent}%` : `แถมโบนัส +${p.bonusPercent ?? 0}%`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#10141E] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingPromo ? 'แก้ไขโปรโมชั่น' : 'สร้างโปรโมชั่นใหม่'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">หัวข้อโปรโมชั่น</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">คำอธิบายย่อย</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">ประเภท</label>
                  <select
                    value={promoType}
                    onChange={(e: any) => setPromoType(e.target.value)}
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="DISCOUNT">DISCOUNT (ลดราคา %)</option>
                    <option value="BONUS">BONUS (แถมเหรียญ %)</option>
                    <option value="FLASH_SALE">FLASH_SALE (ลดชั่วคราว)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">รหัสคูปอง (Coupon Code)</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="เช่น FLASH10"
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">ส่วนลด (%)</label>
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(parseInt(e.target.value, 10))}
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">โบนัส (%)</label>
                  <input
                    type="number"
                    value={bonusPercent}
                    onChange={(e) => setBonusPercent(parseInt(e.target.value, 10))}
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">ยอดขั้นต่ำ (฿)</label>
                  <input
                    type="number"
                    value={minSpend}
                    onChange={(e) => setMinSpend(parseFloat(e.target.value))}
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all"
                >
                  บันทึกโปรโมชั่น
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
