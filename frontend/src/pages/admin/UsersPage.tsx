import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Wallet,
  ShieldAlert,
  ShieldCheck,
  Plus,
  Minus,
  Clock,
  Gift,
  ShoppingCart,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { UserManagementItem } from '../../types';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserManagementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Adjust Wallet Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedUserForAdjust, setSelectedUserForAdjust] = useState<UserManagementItem | null>(null);
  const [adjustAction, setAdjustAction] = useState<'ADD' | 'DEDUCT'>('ADD');
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [adjustSuccess, setAdjustSuccess] = useState<string | null>(null);

  // User Profile Drawer
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [userDetailData, setUserDetailData] = useState<any | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await adminApi.getUsers({ search: searchTerm, limit: 100 });
      if (res.data?.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (user: UserManagementItem) => {
    const action = user.isActive ? 'ระงับการใช้งาน (Suspend)' : 'เปิดใช้งาน (Activate)';
    if (!window.confirm(`คุณต้องการ ${action} บัญชีของ ${user.username} ใช่หรือไม่?`)) return;

    try {
      await adminApi.toggleUserStatus(user.id, !user.isActive);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating user status');
    }
  };

  const openAdjustModal = (user: UserManagementItem) => {
    setSelectedUserForAdjust(user);
    setAdjustAction('ADD');
    setAdjustAmount('');
    setAdjustReason('');
    setAdjustSuccess(null);
    setAdjustModalOpen(true);
  };

  const handleConfirmAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForAdjust || !adjustAmount || !adjustReason.trim()) return;

    try {
      const res = await adminApi.adjustUserWallet(
        selectedUserForAdjust.id,
        adjustAction,
        parseFloat(adjustAmount),
        adjustReason.trim()
      );

      if (res.data?.success) {
        setAdjustSuccess(res.data.message);
        fetchUsers();
        setTimeout(() => {
          setAdjustSuccess(null);
          setAdjustModalOpen(false);
        }, 1500);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error adjusting balance');
    }
  };

  const openUserDetails = async (id: number) => {
    try {
      const res = await adminApi.getUserDetails(id);
      if (res.data?.success) {
        setUserDetailData(res.data.data);
        setDetailModalOpen(true);
      }
    } catch (err) {
      alert('Failed to load user details');
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">จัดการสมาชิก & เครดิต (Users & Wallets)</h1>
          <p className="text-xs text-zinc-400">ตรวจสอบผู้ใช้งาน ระงับบัญชี และปรับยอดเครดิต Wallet ตามสิทธิ์</p>
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
            placeholder="ค้นหา Username, Email, Player UID..."
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
                <th className="py-4 px-6">ผู้ใช้งาน</th>
                <th className="py-4 px-6">Player UID</th>
                <th className="py-4 px-6">ยอดเครดิต Wallet</th>
                <th className="py-4 px-6">ยอดใช้จ่ายสะสม</th>
                <th className="py-4 px-6">ออเดอร์</th>
                <th className="py-4 px-6">การสุ่มกล่อง</th>
                <th className="py-4 px-6">สถานะ</th>
                <th className="py-4 px-6 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02]">
                  <td className="py-4 px-6">
                    <p className="font-bold text-white text-sm">{u.username}</p>
                    <p className="text-[10px] text-zinc-500">{u.email}</p>
                  </td>
                  <td className="py-4 px-6 font-mono text-indigo-400 font-bold">
                    {u.playerId || '-'}
                  </td>
                  <td className="py-4 px-6 font-mono font-black text-white text-sm">
                    ฿{u.walletBalance.toFixed(2)}
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-emerald-400">
                    ฿{u.totalSpent.toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-zinc-300 font-bold">{u.orderCount} รายการ</td>
                  <td className="py-4 px-6 text-zinc-300 font-bold">{u.drawCount} ครั้ง</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openUserDetails(u.id)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white"
                        title="ดูประวัติผู้ใช้"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openAdjustModal(u)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold text-[10px] flex items-center gap-1"
                        title="ปรับยอดเครดิต"
                      >
                        <Wallet className="w-3 h-3" />
                        <span>ปรับเครดิต</span>
                      </button>

                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          u.isActive
                            ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                        }`}
                        title={u.isActive ? 'ระงับบัญชี' : 'ปลดระงับบัญชี'}
                      >
                        {u.isActive ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Wallet Balance Modal */}
      {adjustModalOpen && selectedUserForAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#10141E] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-indigo-400" />
                ปรับยอดเครดิต: {selectedUserForAdjust.username}
              </h3>
              <button onClick={() => setAdjustModalOpen(false)} className="p-1.5 text-zinc-400 hover:text-white">✕</button>
            </div>

            {adjustSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <p className="text-sm font-bold text-white">{adjustSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleConfirmAdjust} className="space-y-3">
                <div className="p-3 bg-[#151A28] rounded-xl text-xs space-y-1">
                  <p className="text-zinc-400">ยอดเงินปัจจุบัน:</p>
                  <p className="text-lg font-black text-white font-mono">฿{selectedUserForAdjust.walletBalance.toFixed(2)}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">การดำเนินการ</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjustAction('ADD')}
                      className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                        adjustAction === 'ADD'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'bg-[#151A28] text-zinc-400'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" /> เติมเครดิต (+)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustAction('DEDUCT')}
                      className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                        adjustAction === 'DEDUCT'
                          ? 'bg-red-600 text-white shadow'
                          : 'bg-[#151A28] text-zinc-400'
                      }`}
                    >
                      <Minus className="w-3.5 h-3.5" /> หักเครดิต (-)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">จำนวนเงิน (บาท)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    placeholder="เช่น 100.00"
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">เหตุผลการปรับยอดเงิน (จำเป็นสำหรับ Audit Log)</label>
                  <input
                    type="text"
                    required
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="เช่น คืนเงินจากข้อผิดพลาด, โบนัสกิจกรรม"
                    className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    ยืนยันการปรับยอดเงิน
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* User Details Drawer */}
      {detailModalOpen && userDetailData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#10141E] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">โปรไฟล์สมาชิก: {userDetailData.user.username}</h3>
                <p className="text-[11px] text-zinc-400">{userDetailData.user.email}</p>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="p-1.5 text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#151A28] rounded-xl">
                <span className="text-zinc-400">Player UID:</span>
                <p className="font-bold text-indigo-400 font-mono mt-0.5">{userDetailData.user.player_id || '-'}</p>
              </div>
              <div className="p-3 bg-[#151A28] rounded-xl">
                <span className="text-zinc-400">ยอดเครดิตปัจจุบัน:</span>
                <p className="font-bold text-emerald-400 font-mono mt-0.5">฿{userDetailData.user.wallet_balance.toFixed(2)}</p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">คำสั่งซื้อล่าสุด</h4>
              <div className="p-2 bg-[#151A28] rounded-xl max-h-36 overflow-y-auto space-y-1 text-xs">
                {userDetailData.recentOrders?.length > 0 ? (
                  userDetailData.recentOrders.map((o: any) => (
                    <div key={o.id} className="flex justify-between py-1 border-b border-white/5">
                      <span>{o.package_name}</span>
                      <span className="text-emerald-400 font-mono">฿{parseFloat(o.final_price).toFixed(2)} ({o.status})</span>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-500 text-[11px] py-2 text-center">ไม่มีคำสั่งซื้อ</p>
                )}
              </div>
            </div>

            {/* Recent Draws */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">ประวัติการสุ่มกล่อง</h4>
              <div className="p-2 bg-[#151A28] rounded-xl max-h-36 overflow-y-auto space-y-1 text-xs">
                {userDetailData.recentDraws?.length > 0 ? (
                  userDetailData.recentDraws.map((d: any) => (
                    <div key={d.id} className="flex justify-between py-1 border-b border-white/5">
                      <span>{d.box_name} ➔ {d.reward_name}</span>
                      <span className="text-amber-400 font-bold">[{d.rarity}]</span>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-500 text-[11px] py-2 text-center">ไม่มีประวัติการสุ่ม</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
