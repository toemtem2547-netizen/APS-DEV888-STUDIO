import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Gamepad2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, openAuthModal, login, register } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authModalMode === 'login') {
        await login(username || email, password);
      } else {
        if (!username || !email || !password) {
          throw new Error('กรุณากรอกข้อมูลให้ครบทุกช่อง');
        }
        await register(username, email, password, playerId);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0D1117] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/90 overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-black text-white tracking-wide">
            {authModalMode === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชีใหม่'}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            {authModalMode === 'login'
              ? 'ยินดีต้อนรับกลับ เข้าสู่ระบบเพื่อทำรายการเติมเกมและสุ่มกล่อง'
              : 'สมัครสมาชิกเพียงไม่กี่วินาทีเพื่อรับสิทธิพิเศษและเริ่มเติมเกม'}
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 p-1 bg-[#121821] rounded-2xl mb-6 border border-white/5">
          <button
            type="button"
            onClick={() => { openAuthModal('login'); setError(null); }}
            className={`py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
              authModalMode === 'login'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            เข้าสู่ระบบ
          </button>
          <button
            type="button"
            onClick={() => { openAuthModal('register'); setError(null); }}
            className={`py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
              authModalMode === 'register'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            สมัครสมาชิก
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              {authModalMode === 'login' ? 'ชื่อผู้ใช้ หรือ อีเมล' : 'ชื่อผู้ใช้ (Username)'}
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={authModalMode === 'login' ? 'กรอก Username หรือ Email' : 'ตั้งชื่อผู้ใช้'}
                className="w-full bg-[#121821] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          {authModalMode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">อีเมล</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full bg-[#121821] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Player ID / UID ในเกม (ถ้ามี)
                </label>
                <div className="relative">
                  <Gamepad2 className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    placeholder="เช่น UID-123456"
                    className="w-full bg-[#121821] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">รหัสผ่าน</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#121821] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 mt-2"
          >
            {loading ? 'กำลังดำเนินการ...' : authModalMode === 'login' ? 'เข้าสู่ระบบทันที' : 'ยืนยันการสมัครสมาชิก'}
          </button>
        </form>

        {/* Demo Credentials hint */}
        <div className="mt-5 p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-[11px] text-zinc-400 text-center">
          <p className="font-semibold text-zinc-300">บัญชีทดสอบสำหรับผู้เล่น:</p>
          <p className="mt-0.5 text-indigo-400">Username: <span className="text-white font-mono">player1</span> / Password: <span className="text-white font-mono">User@123456</span></p>
        </div>
      </div>
    </div>
  );
};
