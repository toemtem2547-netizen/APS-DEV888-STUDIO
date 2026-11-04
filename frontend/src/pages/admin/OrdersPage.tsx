import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, CheckCircle2, Clock, XCircle, AlertCircle, Eye } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { Order } from '../../types';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await adminApi.getOrders({
        status: statusFilter,
        search: searchTerm,
        limit: 100,
      });
      if (res.data?.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            COMPLETED
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            PROCESSING
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
            CANCELLED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">จัดการคำสั่งซื้อ (Orders Management)</h1>
          <p className="text-xs text-zinc-400">ตรวจสอบคำสั่งซื้อทั้งหมด ค้นหาตาม UID และเปลี่ยนสถานะ</p>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-[#10141E] border border-white/10 rounded-2xl overflow-x-auto">
          {['ALL', 'COMPLETED', 'PROCESSING', 'PENDING', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-md flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหา Order ID, UID, Username, Email..."
            className="w-full bg-[#10141E] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          ค้นหา
        </button>
      </form>

      {/* Table */}
      <div className="bg-[#10141E] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-[#151A28] text-zinc-400 text-[11px] uppercase tracking-wider font-bold">
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-6">ลูกค้า (User)</th>
                <th className="py-4 px-6">Player UID</th>
                <th className="py-4 px-6">แพ็กเกจ</th>
                <th className="py-4 px-6">เหรียญ (Coins)</th>
                <th className="py-4 px-6">ยอดชำระ</th>
                <th className="py-4 px-6">สถานะ</th>
                <th className="py-4 px-6">วันที่</th>
                <th className="py-4 px-6 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-white/[0.02]">
                  <td className="py-4 px-6 font-mono font-bold text-zinc-300">{ord.id}</td>
                  <td className="py-4 px-6">
                    <p className="font-bold text-white">{ord.username}</p>
                    <p className="text-[10px] text-zinc-500">{ord.email}</p>
                  </td>
                  <td className="py-4 px-6 font-mono text-indigo-400 font-bold">{ord.playerId}</td>
                  <td className="py-4 px-6 font-semibold text-white">{ord.packageName}</td>
                  <td className="py-4 px-6 font-mono font-bold text-amber-400">
                    {ord.coinsAmount.toLocaleString()}
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-white">฿{ord.finalPrice.toFixed(2)}</td>
                  <td className="py-4 px-6">{getStatusBadge(ord.status)}</td>
                  <td className="py-4 px-6 text-zinc-400">
                    {new Date(ord.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white"
                        title="ดูรายละเอียด"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {ord.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'COMPLETED')}
                          className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-[10px]"
                          title="ทำเครื่องหมายว่าสำเร็จ"
                        >
                          สำเร็จ
                        </button>
                      )}

                      {ord.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'CANCELLED')}
                          className="px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-[10px]"
                          title="ยกเลิกออเดอร์"
                        >
                          ยกเลิก
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#10141E] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white">รายละเอียดคำสั่งซื้อ</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-[#151A28] rounded-2xl space-y-2 border border-white/5">
                <div className="flex justify-between"><span className="text-zinc-400">Order ID:</span><span className="font-mono text-white font-bold">{selectedOrder.id}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Player UID:</span><span className="font-mono text-indigo-400 font-bold">{selectedOrder.playerId}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">ลูกค้า:</span><span className="text-white font-bold">{selectedOrder.username} ({selectedOrder.email})</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">แพ็กเกจ:</span><span className="text-white font-bold">{selectedOrder.packageName}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Coins:</span><span className="text-amber-400 font-bold">{selectedOrder.coinsAmount.toLocaleString()} Coins</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">ช่องทางชำระ:</span><span className="text-white font-semibold">{selectedOrder.paymentMethod}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">ยอดชำระ:</span><span className="text-white font-bold text-sm">฿{selectedOrder.finalPrice.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">สถานะปัจจุบัน:</span><span>{getStatusBadge(selectedOrder.status)}</span></div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">เปลี่ยนสถานะคำสั่งซื้อ</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'COMPLETED')}
                    className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold"
                  >
                    COMPLETED
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'PROCESSING')}
                    className="py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold"
                  >
                    PROCESSING
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')}
                    className="py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold"
                  >
                    CANCELLED
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
