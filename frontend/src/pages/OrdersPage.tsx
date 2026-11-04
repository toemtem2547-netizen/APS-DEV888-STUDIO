import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Package, CheckCircle2, AlertCircle, XCircle, ArrowRight, Zap } from 'lucide-react';
import { platformApi } from '../services/api';
import { Order } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

export const OrdersPage: React.FC = () => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { settings } = useSettings();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const res = await platformApi.getMyOrders();
        if (res.data?.success) {
          setOrders(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 pt-36 pb-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
          <Clock className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">กรุณาเข้าสู่ระบบ</h2>
          <p className="text-xs text-zinc-400 mt-2">
            เข้าสู่ระบบเพื่อดูประวัติการสั่งซื้อและสถานะการเติมเหรียญเข้าเกมของคุณ
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> สำเร็จ
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5 animate-spin" /> กำลังดำเนินการ
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3.5 h-3.5" /> ยกเลิก
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock className="w-3.5 h-3.5" /> รอดำเนินการ
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4" />
            <span>TRANSACTION HISTORY</span>
          </div>
          <h1 className="text-3xl font-black text-white">ประวัติการสั่งซื้อ</h1>
        </div>

        <Link
          to="/topup"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
        >
          <Zap className="w-4 h-4" />
          <span>เติมเหรียญเพิ่ม</span>
        </Link>
      </div>

      {/* Orders List / Table */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-[#0D1117] animate-pulse border border-white/5"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">ยังไม่มีประวัติคำสั่งซื้อ</h3>
            <p className="text-xs text-zinc-400 mt-1">
              เมื่อคุณทำรายการเติมเงิน รายการและสถานะการเติมจะแสดงที่นี่
            </p>
          </div>
          <Link
            to="/topup"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <span>เริ่มเติมเหรียญทันที</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="bg-[#0D1117] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-[#121821] text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Player UID</th>
                  <th className="py-4 px-6">แพ็กเกจ</th>
                  <th className="py-4 px-6">เหรียญที่ได้รับ</th>
                  <th className="py-4 px-6">ยอดชำระ</th>
                  <th className="py-4 px-6">ช่องทาง</th>
                  <th className="py-4 px-6">สถานะ</th>
                  <th className="py-4 px-6">วันที่</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-mono text-zinc-300 font-bold">{order.id}</td>
                    <td className="py-4 px-6 font-mono text-indigo-400 font-semibold">{order.playerId}</td>
                    <td className="py-4 px-6 font-bold text-white">{order.packageName}</td>
                    <td className="py-4 px-6 font-extrabold text-amber-400">
                      {order.coinsAmount.toLocaleString()} Coins
                    </td>
                    <td className="py-4 px-6 font-bold text-white">
                      {settings.currency_symbol}{order.finalPrice.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-zinc-400 uppercase text-[11px] font-semibold">
                      {order.paymentMethod}
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(order.status)}</td>
                    <td className="py-4 px-6 text-zinc-400">
                      {new Date(order.createdAt).toLocaleString('th-TH', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
