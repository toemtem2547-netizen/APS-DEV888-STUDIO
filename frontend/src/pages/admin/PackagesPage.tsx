import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  X,
  Coins,
  Sparkles,
  ExternalLink,
  Eye
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { PackageItem } from '../../types';

export const PackagesPage: React.FC = () => {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageItem | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [coins, setCoins] = useState(500);
  const [price, setPrice] = useState(129);
  const [bonusCoins, setBonusCoins] = useState(50);
  const [imageUrl, setImageUrl] = useState('');
  const [badge, setBadge] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  const fetchPackages = async () => {
    try {
      const res = await adminApi.getPackages();
      if (res.data?.success) {
        setPackages(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load packages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const openCreateModal = () => {
    setEditingPackage(null);
    setName('');
    setCoins(500);
    setPrice(129);
    setBonusCoins(50);
    setImageUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80');
    setBadge('');
    setIsPopular(false);
    setIsActive(true);
    setSortOrder(packages.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: PackageItem) => {
    setEditingPackage(pkg);
    setName(pkg.name);
    setCoins(pkg.coins);
    setPrice(pkg.price);
    setBonusCoins(pkg.bonusCoins);
    setImageUrl(pkg.imageUrl);
    setBadge(pkg.badge || '');
    setIsPopular(pkg.isPopular);
    setIsActive(pkg.isActive);
    setSortOrder(pkg.sortOrder);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        coins: Number(coins),
        price: Number(price),
        bonusCoins: Number(bonusCoins),
        imageUrl,
        badge: badge.trim() || null,
        isPopular,
        isActive,
        sortOrder: Number(sortOrder),
      };

      if (editingPackage) {
        await adminApi.updatePackage(editingPackage.id, payload);
      } else {
        await adminApi.createPackage(payload);
      }

      setIsModalOpen(false);
      fetchPackages();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving package');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('คุณต้องการลบแพ็กเกจนี้ใช่หรือไม่?')) return;
    try {
      await adminApi.deletePackage(id);
      fetchPackages();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting package');
    }
  };

  const filteredPackages = packages.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">จัดการแพ็กเกจเติมเกม (Packages)</h1>
          <p className="text-xs text-zinc-400">สร้าง แก้ไข ตั้งราคา จำนวนเหรียญ และโบนัส</p>
        </div>

        <button
          onClick={openCreateModal}
          className="py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มแพ็กเกจใหม่</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="max-w-md relative">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ค้นหาตามชื่อแพ็กเกจ..."
          className="w-full bg-[#10141E] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Packages Table */}
      <div className="bg-[#10141E] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-[#151A28] text-zinc-400 text-[11px] uppercase tracking-wider font-bold">
                <th className="py-4 px-6">ลำดับ</th>
                <th className="py-4 px-6">ชื่อแพ็กเกจ</th>
                <th className="py-4 px-6">จำนวน Coins</th>
                <th className="py-4 px-6">โบนัส Coins</th>
                <th className="py-4 px-6">ราคาขาย (บาท)</th>
                <th className="py-4 px-6">ป้าย Badge</th>
                <th className="py-4 px-6">สถานะ</th>
                <th className="py-4 px-6 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPackages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 font-mono text-zinc-400">#{pkg.sortOrder}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/10 overflow-hidden flex-shrink-0">
                        <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-bold text-white text-sm">{pkg.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-bold text-amber-400 font-mono text-sm">
                    {pkg.coins.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-zinc-300 font-mono">
                    {pkg.bonusCoins > 0 ? `+${pkg.bonusCoins.toLocaleString()}` : '-'}
                  </td>
                  <td className="py-4 px-6 font-black text-white font-mono text-sm">
                    ฿{pkg.price.toFixed(2)}
                  </td>
                  <td className="py-4 px-6">
                    {pkg.badge || pkg.isPopular ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {pkg.badge || (pkg.isPopular ? 'POPULAR' : '')}
                      </span>
                    ) : (
                      <span className="text-zinc-600">-</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        pkg.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {pkg.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(pkg)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                        title="แก้ไข"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="ลบ"
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

      {/* Create / Edit Modal with Live Preview */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#10141E] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingPackage ? 'แก้ไขแพ็กเกจเติมเงิน' : 'สร้างแพ็กเกจเติมเงินใหม่'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">ชื่อแพ็กเกจ</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น 500 Coins"
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">จำนวนเหรียญ (Coins)</label>
                    <input
                      type="number"
                      required
                      value={coins}
                      onChange={(e) => setCoins(parseInt(e.target.value, 10))}
                      className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">โบนัสเหรียญ (Bonus)</label>
                    <input
                      type="number"
                      value={bonusCoins}
                      onChange={(e) => setBonusCoins(parseInt(e.target.value, 10))}
                      className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">ราคาขาย (บาท)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={price}
                      onChange={(e) => setPrice(parseFloat(e.target.value))}
                      className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">ลำดับการแสดง (Sort)</label>
                    <input
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(parseInt(e.target.value, 10))}
                      className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">รูปภาพ URL</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">ป้ายกำกับพิเศษ (Badge text)</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="เช่น HOT DEAL, BEST VALUE"
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPopular}
                      onChange={(e) => setIsPopular(e.target.checked)}
                      className="rounded border-white/10 bg-[#151A28] text-indigo-600"
                    />
                    <span>ติดป้าย POPULAR</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-white/10 bg-[#151A28] text-indigo-600"
                    />
                    <span>เปิดใช้งาน (Active)</span>
                  </label>
                </div>
              </div>

              {/* Right: Live Preview */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">ตัวอย่างการแสดงผลหน้าร้าน</span>
                <div className="p-4 rounded-3xl bg-[#0D1117] border border-white/10 space-y-4 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400 font-bold">{name || 'ชื่อแพ็กเกจ'}</span>
                    {(badge || isPopular) && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-black">
                        {badge || 'POPULAR'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-lg font-black text-white">{coins || 0} Coins</p>
                      {bonusCoins > 0 && <p className="text-[10px] text-amber-400 font-bold">+{bonusCoins} Bonus</p>}
                    </div>
                  </div>

                  {imageUrl && (
                    <div className="h-20 rounded-xl overflow-hidden bg-black/40">
                      <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-white/5 pt-3">
                    <span className="text-xs text-zinc-400">ราคา</span>
                    <span className="font-black text-white text-base">฿{price?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    บันทึกข้อมูล
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
