import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Gamepad2,
  Lock,
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ShieldCheck,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { platformApi } from '../services/api';
import { WalletTransaction } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, openAuthModal, refreshUser } = useAuth();
  const { balance, openTopupModal } = useWallet();

  const [playerId, setPlayerId] = useState(user?.playerId || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);

  useEffect(() => {
    if (user?.playerId) setPlayerId(user.playerId);
  }, [user]);

  useEffect(() => {
    const fetchTxs = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await platformApi.getWalletTransactions(20);
        if (res.data?.success) {
          setTransactions(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load wallet transactions');
      } finally {
        setLoadingTx(false);
      }
    };

    fetchTxs();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 pt-36 pb-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
          <UserIcon className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">กรุณาเข้าสู่ระบบ</h2>
          <p className="text-xs text-zinc-400 mt-2">
            เข้าสู่ระบบเพื่อจัดการข้อมูลส่วนตัว บัญชีเกม และประวัติกระเป๋าเงินของคุณ
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

  const handleUpdatePlayerId = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setErrorMsg(null);

    try {
      const res = await platformApi.updateProfile({ playerId });
      if (res.data?.success) {
        setProfileMsg(res.data.message);
        await refreshUser();
        setTimeout(() => setProfileMsg(null), 3000);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    setErrorMsg(null);

    if (newPassword !== confirmPassword) {
      setErrorMsg('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      const res = await platformApi.changePassword({ oldPassword, newPassword });
      if (res.data?.success) {
        setPasswordMsg('เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordMsg(null), 3000);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-10">
      {/* Profile Header */}
      <div className="bg-[#0D1117] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-indigo-500/20">
            {user?.username.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">{user?.username}</h1>
            <p className="text-xs text-zinc-400 mt-0.5">{user?.email}</p>
            {user?.playerId && (
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[11px] font-mono font-bold">
                UID: {user.playerId}
              </span>
            )}
          </div>
        </div>

        {/* Wallet Pill Card */}
        <div className="bg-[#121821] border border-white/10 rounded-2xl p-4 flex items-center gap-6 shadow-inner w-full sm:w-auto justify-between sm:justify-start">
          <div>
            <span className="text-[11px] text-zinc-400">ยอดเงินในกระเป๋า</span>
            <p className="text-xl font-black text-white">฿{balance.toFixed(2)}</p>
          </div>
          <button
            onClick={openTopupModal}
            className="py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>เติมเงิน</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {profileMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> <span>{profileMsg}</span>
        </div>
      )}
      {passwordMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> <span>{passwordMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> <span>{errorMsg}</span>
        </div>
      )}

      {/* Settings Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bound Game Account */}
        <div className="bg-[#0D1117] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">เชื่อมต่อ Player ID / UID</h3>
              <p className="text-xs text-zinc-400">ตั้งค่า UID เริ่มต้นเพื่อให้ระบบกรอกให้อัตโนมัติเมื่อเติมเงิน</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePlayerId} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Player ID / UID ของท่าน</label>
              <input
                type="text"
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                placeholder="เช่น UID-992812"
                className="w-full bg-[#121821] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="py-2.5 px-5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors"
            >
              บันทึก Player ID
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-[#0D1117] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">เปลี่ยนรหัสผ่าน</h3>
              <p className="text-xs text-zinc-400">เปลี่ยนรหัสผ่านเพื่อความปลอดภัยของบัญชีผู้ใช้</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">รหัสผ่านเดิม</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-[#121821] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">รหัสผ่านใหม่</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#121821] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">ยืนยันรหัสผ่านใหม่</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#121821] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="py-2.5 px-5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-colors"
            >
              เปลี่ยนรหัสผ่าน
            </button>
          </form>
        </div>
      </div>

      {/* Wallet Transactions History */}
      <div className="bg-[#0D1117] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-lg text-white">ประวัติธุรกรรม Wallet</h3>
          </div>
          <span className="text-xs text-zinc-400">20 รายการล่าสุด</span>
        </div>

        {loadingTx ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-[#121821] animate-pulse"></div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-xs">
            ยังไม่มีประวัติธุรกรรมในกระเป๋าเงิน
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {transactions.map((tx) => {
              const isCredit = tx.amount > 0;
              return (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCredit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {isCredit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-bold text-white text-xs sm:text-sm">{tx.description}</p>
                      <p className="text-[10px] text-zinc-500">
                        {new Date(tx.createdAt).toLocaleString('th-TH')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-black font-mono text-sm ${isCredit ? 'text-emerald-400' : 'text-zinc-200'}`}>
                      {isCredit ? `+฿${tx.amount.toFixed(2)}` : `฿${tx.amount.toFixed(2)}`}
                    </p>
                    <p className="text-[10px] text-zinc-500">คงเหลือ ฿{tx.balanceAfter.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
