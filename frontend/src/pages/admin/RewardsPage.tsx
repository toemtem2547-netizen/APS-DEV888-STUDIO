import React, { useState, useEffect, useRef } from 'react';
import { Award, Plus, Edit2, Trash2, Search, Sparkles, Upload, Loader2 } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { Reward } from '../../types';

export const RewardsPage: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [type, setType] = useState<'ITEM' | 'CODE' | 'CREDIT' | 'COUPON' | 'VIP'>('ITEM');
  const [value, setValue] = useState('');
  const [rarity, setRarity] = useState<'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'>('COMMON');
  const [stock, setStock] = useState(-1);
  const [isActive, setIsActive] = useState(true);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchRewards = async () => {
    try {
      const res = await adminApi.getRewards();
      if (res.data?.success) {
        setRewards(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load rewards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const openCreateModal = () => {
    setEditingReward(null);
    setName('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80');
    setType('ITEM');
    setValue('ITEM-VALOR-01');
    setRarity('COMMON');
    setStock(-1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (rw: Reward) => {
    setEditingReward(rw);
    setName(rw.name);
    setDescription(rw.description);
    setImageUrl(rw.imageUrl);
    setType(rw.type);
    setValue(rw.value);
    setRarity(rw.rarity);
    setStock(rw.stock);
    setIsActive(rw.isActive);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        description,
        imageUrl,
        type,
        value,
        rarity,
        stock: Number(stock),
        isActive,
      };

      if (editingReward) {
        await adminApi.updateReward(editingReward.id, payload);
      } else {
        await adminApi.createReward(payload);
      }

      setIsModalOpen(false);
      fetchRewards();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving reward');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('คุณต้องการลบของรางวัลนี้ใช่หรือไม่?')) return;
    try {
      await adminApi.deleteReward(id);
      fetchRewards();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting reward');
    }
  };

  const handleLocalFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('ไฟล์รูปภาพมีขนาดใหญ่เกินไป (กรุณาใช้รูปขนาดไม่เกิน 15 MB)');
      return;
    }

    try {
      setIsUploading(true);
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
          console.warn('Upload to server failed, using base64:', uploadErr);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert('ไม่สามารถอ่านไฟล์ได้: ' + err.message);
      setIsUploading(false);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const filteredRewards = rewards.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">ของรางวัลและสินค้าดิจิทัล (Rewards)</h1>
          <p className="text-xs text-zinc-400">จัดการไอเทม โค้ดแลกรับ เครดิต และระดับความหายาก</p>
        </div>

        <button
          onClick={openCreateModal}
          className="py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มของรางวัลใหม่</span>
        </button>
      </div>

      {/* Search */}
      <div className="max-w-md relative">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ค้นหาชื่อของรางวัล..."
          className="w-full bg-[#10141E] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-[#10141E] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-[#151A28] text-zinc-400 text-[11px] uppercase tracking-wider font-bold">
                <th className="py-4 px-6">ของรางวัล</th>
                <th className="py-4 px-6">ประเภท (Type)</th>
                <th className="py-4 px-6">ระดับ Rarity</th>
                <th className="py-4 px-6">มูลค่า / โค้ด</th>
                <th className="py-4 px-6">คงเหลือ (Stock)</th>
                <th className="py-4 px-6">สถานะ</th>
                <th className="py-4 px-6 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRewards.map((rw) => (
                <tr key={rw.id} className="hover:bg-white/[0.02]">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                        <img src={rw.imageUrl} alt={rw.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-bold text-white text-sm">{rw.name}</span>
                        <p className="text-[11px] text-zinc-400 line-clamp-1">{rw.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-semibold text-zinc-300">{rw.type}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        rw.rarity === 'LEGENDARY'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : rw.rarity === 'EPIC'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                          : rw.rarity === 'RARE'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {rw.rarity}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-zinc-300">{rw.value}</td>
                  <td className="py-4 px-6 font-mono">
                    {rw.stock === -1 ? <span className="text-emerald-400 font-bold">ไม่จำกัด (∞)</span> : rw.stock}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        rw.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {rw.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(rw)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rw.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#10141E] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingReward ? 'แก้ไขของรางวัล' : 'สร้างของรางวัลใหม่'}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    กำหนดชื่อ รายละเอียด ประเภท ระดับ Rarity และอัปโหลดรูปภาพของรางวัล
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Image Preview & Upload Card */}
              <div className="p-4 rounded-2xl bg-[#151A28] border border-white/5 space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Thumbnail Preview */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-black/60 border border-white/10 p-2 flex items-center justify-center flex-shrink-0 cursor-pointer hover:border-indigo-400 group overflow-hidden shadow-inner transition"
                    title="คลิกเพื่อเลือกไฟล์รูปภาพจากคอมหรือมือถือ"
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-1.5 text-indigo-400">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-[10px] font-bold">กำลังอัปโหลด...</span>
                      </div>
                    ) : imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={name || 'Preview'}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/boxes/gold.jpg';
                        }}
                        className="max-h-full object-contain filter drop-shadow group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-zinc-500 group-hover:text-indigo-400 transition">
                        <Upload className="w-7 h-7" />
                        <span className="text-[10px] font-bold">เลือกรูป</span>
                      </div>
                    )}
                    <span className="absolute bottom-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-black/80 text-zinc-300 border border-white/10">
                      {isUploading ? 'อัปโหลด...' : 'ตัวอย่างรูป'}
                    </span>
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-zinc-300">
                        รูปภาพของรางวัล (เปิดไฟล์จากคอมหรือมือถือได้เลย)
                      </label>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30 transition shadow-sm"
                      >
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        <span>📁 เลือกรูปจากคอม / มือถือ</span>
                      </button>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLocalFileSelect}
                      accept="image/*"
                      className="hidden"
                    />

                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="URL รูปภาพ เช่น /images/... หรือกดปุ่มสีส้มเพื่อเลือกไฟล์"
                      className="w-full bg-[#10141E] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <p className="text-[11px] text-zinc-500">
                      * รองรับไฟล์รูปภาพ JPG, PNG, WebP ขนาดไม่เกิน 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Reward Name & Description */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">ชื่อของรางวัล (Reward Name)</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น Liquid-Cooled Custom Gaming PC หรือ 3,000 Coins"
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">คำอธิบายรายละเอียด</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="คำอธิบายของรางวัล สเปก หรือเงื่อนไขการรับ..."
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>

              {/* Type & Rarity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">ประเภทของรางวัล (Type)</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="ITEM">ITEM (ไอเทมเกม/อุปกรณ์)</option>
                    <option value="CODE">CODE (รหัสดิจิทัล/Serial)</option>
                    <option value="CREDIT">CREDIT (เหรียญเครดิตในเว็บ)</option>
                    <option value="COUPON">COUPON (คูปองส่วนลด)</option>
                    <option value="VIP">VIP (สถานะพิเศษ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">ระดับความหายาก (Rarity)</label>
                  <select
                    value={rarity}
                    onChange={(e: any) => setRarity(e.target.value)}
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="COMMON">COMMON (ทั่วไป - สีเทา/ขาว)</option>
                    <option value="RARE">RARE (หายาก - สีฟ้า)</option>
                    <option value="EPIC">EPIC (มหากาพย์ - สีม่วง)</option>
                    <option value="LEGENDARY">LEGENDARY (ตำนาน - สีทอง)</option>
                  </select>
                </div>
              </div>

              {/* Value & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    {type === 'CREDIT' ? 'จำนวนเหรียญเครดิตที่จะได้รับ' : 'Value / Code prefix'}
                  </label>
                  <input
                    type="text"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={type === 'CREDIT' ? 'เช่น 500 หรือ 3000' : 'เช่น GEAR-PC-RIG-01'}
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    จำนวนในสต็อก Stock (-1 = ไม่จำกัด)
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(parseInt(e.target.value, 10))}
                    placeholder="-1"
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-semibold text-xs text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all"
                >
                  {editingReward ? 'บันทึกการแก้ไขของรางวัล' : 'สร้างของรางวัลใหม่'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
