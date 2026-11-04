import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Copy,
  Check,
  Gift,
  ExternalLink,
  Sparkles,
  Package,
  Calendar,
  Layers
} from 'lucide-react';
import { platformApi } from '../services/api';
import { InventoryItem } from '../types';
import { useAuth } from '../context/AuthContext';

export const InventoryPage: React.FC = () => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNUSED' | 'USED'>('ALL');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchInventory = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const res = await platformApi.getMyInventory();
      if (res.data?.success) {
        setItems(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [isAuthenticated]);

  const handleCopyCode = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleMarkUsed = async (id: number) => {
    try {
      await platformApi.markRewardUsed(id);
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, isUsed: true, usedAt: new Date().toISOString() } : it))
      );
    } catch (err) {
      console.error('Failed to mark as used:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 pt-36 pb-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">กรุณาเข้าสู่ระบบ</h2>
          <p className="text-xs text-zinc-400 mt-2">
            เข้าสู่ระบบเพื่อดูรายการไอเทม โค้ดของรางวัล และของขวัญที่คุณได้รับจากการสุ่มกล่อง
          </p>
        </div>
        <button
          onClick={() => openAuthModal('login')}
          className="py-3 px-6 rounded-2xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all"
        >
          เข้าสู่ระบบทันที
        </button>
      </div>
    );
  }

  const filteredItems = items.filter((item) => {
    if (filter === 'UNUSED') return !item.isUsed;
    if (filter === 'USED') return item.isUsed;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>MY INVENTORY</span>
          </div>
          <h1 className="text-3xl font-black text-white">คลังของรางวัลของฉัน</h1>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0D1117] border border-white/10 rounded-2xl">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'ALL' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            ทั้งหมด ({items.length})
          </button>
          <button
            onClick={() => setFilter('UNUSED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'UNUSED' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            พร้อมใช้งาน ({items.filter((i) => !i.isUsed).length})
          </button>
          <button
            onClick={() => setFilter('USED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'USED' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            ใช้แล้ว ({items.filter((i) => i.isUsed).length})
          </button>
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-[#0D1117] animate-pulse border border-white/5"></div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-20 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 mx-auto">
            <Gift className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">ยังไม่มีไอเทมในคลัง</h3>
            <p className="text-xs text-zinc-400 mt-1">
              {filter !== 'ALL'
                ? 'ไม่พบไอเทมตามเงื่อนไขที่เลือก'
                : 'คุณยังไม่ได้รับของรางวัล ลองเปิดกล่องสุ่มเพื่อรับไอเทมระดับตำนาน'}
            </p>
          </div>
          <Link
            to="/mystery-box"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/30 transition-all hover:scale-105"
          >
            <span>ไปสุ่มกล่องสมบัติ</span>
            <Sparkles className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-3xl border p-5 flex flex-col justify-between transition-all duration-300 ${
                item.isUsed
                  ? 'bg-[#0D1117]/60 border-white/5 opacity-70'
                  : 'bg-[#0D1117] border-white/10 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-950/30'
              }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      item.rarity === 'LEGENDARY'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : item.rarity === 'EPIC'
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                        : item.rarity === 'RARE'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    }`}
                  >
                    {item.rarity}
                  </span>

                  <span className="text-[10px] text-zinc-500">
                    จาก: {item.acquiredFrom}
                  </span>
                </div>

                {/* Item Details */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/10 p-1 flex-shrink-0 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.rewardName}
                      className="w-full h-full object-cover rounded-xl"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{item.rewardName}</h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">ประเภท: {item.rewardType}</p>
                  </div>
                </div>

                {/* Digital Code or Details */}
                {item.codeContent && (
                  <div className="p-3 bg-[#121821] rounded-2xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold">Redeem Code:</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400 tracking-wider truncate select-all">
                        {item.codeContent}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(item.codeContent!, item.id)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                        title="คัดลอกโค้ด"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Status / Mark Used Action */}
              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-[11px] text-zinc-500">
                  {new Date(item.createdAt).toLocaleDateString('th-TH')}
                </span>

                {item.isUsed ? (
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 text-zinc-500 font-semibold text-[11px]">
                    ใช้ไปแล้ว
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleMarkUsed(item.id)}
                    className="px-3 py-1 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold text-[11px] transition-colors"
                  >
                    ทำเครื่องหมายว่าใช้แล้ว
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
