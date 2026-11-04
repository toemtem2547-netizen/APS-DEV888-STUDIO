import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Wallet,
  Coins,
  Sparkles,
  Tag,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Plus,
  QrCode,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  ChevronRight,
  User,
  Clock,
  Trophy
} from 'lucide-react';
import { platformApi } from '../services/api';
import { PackageItem } from '../types';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { PackageCard } from '../components/PackageCard';

export const TopupPage: React.FC = () => {
  const { settings } = useSettings();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { balance, openTopupModal, refreshBalance } = useWallet();
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation state passed from Home (if any)
  const navState = location.state as { packageId?: number } | null;

  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);
  const [packageFilter, setPackageFilter] = useState<'ALL' | 'POPULAR' | 'VALUE'>('ALL');

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'PROMPTPAY' | 'CREDIT_CARD'>('PROMPTPAY');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  // Fetch Packages
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await platformApi.getPackages();
        if (res.data?.success) {
          const pkgs: PackageItem[] = res.data.data;
          setPackages(pkgs);

          if (navState?.packageId) {
            const matched = pkgs.find((p) => p.id === navState.packageId);
            setSelectedPackage(matched || pkgs[0]);
          } else {
            const pop = pkgs.find((p) => p.isPopular) || pkgs[0];
            setSelectedPackage(pop || null);
          }
        }
      } catch (err) {
        console.error('Failed to load packages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [navState]);

  // Handle Coupon Apply
  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !selectedPackage) return;
    setCouponError(null);

    try {
      const res = await platformApi.validateCoupon(couponCode, selectedPackage.price);
      if (res.data?.success) {
        setDiscountAmount(res.data.data.discountAmount);
        setCouponApplied(couponCode.trim().toUpperCase());
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'คูปองไม่ถูกต้องหรือหมดอายุ');
      setDiscountAmount(0);
      setCouponApplied(null);
    }
  };

  const originalPrice = selectedPackage?.price || 0;
  const finalPrice = Math.max(0, originalPrice - discountAmount);
  const isBalanceSufficient = balance >= finalPrice;

  // Handle Order Submit
  const handleCheckout = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (!selectedPackage) {
      setError('กรุณาเลือกแพ็กเกจเหรียญที่ต้องการเติม');
      return;
    }

    if (paymentMethod === 'WALLET' && !isBalanceSufficient) {
      setError(`ยอดเงินใน Wallet ไม่เพียงพอ (คงเหลือ ฿${balance.toFixed(2)} ต้องการ ฿${finalPrice.toFixed(2)})`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const accountIdentifier = user?.username || user?.email || 'บัญชีสมาชิกเว็บ';
      const res = await platformApi.createOrder({
        playerId: accountIdentifier,
        packageId: selectedPackage.id,
        paymentMethod: paymentMethod === 'CREDIT_CARD' ? 'WALLET' : paymentMethod,
        couponCode: couponApplied || undefined,
      });

      if (res.data?.success) {
        const orderData = res.data.data;
        setOrderSuccess(orderData);
        await refreshBalance();

        // Celebration Confetti
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#F59E0B', '#6366F1', '#10B981', '#EC4899'],
          });
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'การสั่งซื้อไม่สำเร็จ โปรดลองอีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  // Copy Order ID
  const handleCopyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  // Filter packages list
  const filteredPackages = packages.filter((pkg) => {
    if (packageFilter === 'POPULAR') return pkg.isPopular || (pkg.badge && pkg.badge.toLowerCase().includes('pop'));
    if (packageFilter === 'VALUE') return pkg.bonusCoins > 50 || pkg.coins >= 1000;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#07090E] text-white pt-24 pb-28 lg:pb-20 relative selection:bg-amber-400 selection:text-black">
      {/* Background Ambient Neon Effects */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-indigo-600/15 via-purple-600/10 to-transparent blur-[120px] pointer-events-none -z-0" />
      <div className="absolute top-96 right-10 w-[400px] h-[400px] bg-amber-500/10 blur-[140px] pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        {/* Header Hero Banner */}
        <div className="text-center max-w-5xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-purple-500/15 border border-amber-500/30 text-amber-400 text-xs font-black tracking-wider uppercase shadow-lg shadow-amber-500/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>⚡ INSTANT TOP-UP • เติมเงินเข้ากระเป๋าเว็บ 24 ชม.</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight whitespace-nowrap">
            เติมเงินเข้าเว็บ{' '}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
              {settings.game_title || 'AETHERIA: CHRONICLES OF VALOR'}
            </span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-zinc-300 mx-auto leading-relaxed whitespace-nowrap">
            เติมเงินเข้ากระเป๋าบัญชีเว็บทันที ปลอดภัย 100% นำไปใช้เปิดกล่องสุ่ม หมุนวงล้อกาชา และแลกรับของรางวัลได้ทันที!
          </p>

          {/* Trust Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-xs font-semibold text-zinc-400">
            <span className="flex items-center gap-1.5 text-zinc-300 whitespace-nowrap">
              <Zap className="w-4 h-4 text-amber-400" /> เครดิตเข้ากระเป๋าทันที
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300 whitespace-nowrap">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> ปลอดภัย 100% เชื่อถือได้
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300 whitespace-nowrap">
              <Clock className="w-4 h-4 text-indigo-400" /> บริการตลอด 24 ชั่วโมง
            </span>
          </div>
        </div>

        {/* Main Grid: Packages on Left, Sticky Summary on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Select Package */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-[#0C1017]/95 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-indigo-600/30">
                    01
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white">เลือกแพ็กเกจเหรียญ / เครดิต</h3>
                    <p className="text-xs text-zinc-400">เลือกจำนวน Coins ที่ต้องการ ยิ่งแพ็กเกจใหญ่ยิ่งได้โบนัสและเหรียญฟรีเยอะ</p>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center bg-[#111722] p-1 rounded-2xl border border-white/5 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setPackageFilter('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      packageFilter === 'ALL'
                        ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    ทั้งหมด
                  </button>
                  <button
                    type="button"
                    onClick={() => setPackageFilter('POPULAR')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      packageFilter === 'POPULAR'
                        ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    ยอดนิยม 🔥
                  </button>
                  <button
                    type="button"
                    onClick={() => setPackageFilter('VALUE')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      packageFilter === 'VALUE'
                        ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    คุ้มค่าสูงสุด 💎
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-64 rounded-3xl bg-[#111722] animate-pulse border border-white/5"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
                  {filteredPackages.map((pkg, idx) => (
                    <PackageCard
                      key={pkg.id}
                      pkg={pkg}
                      index={idx}
                      isSelected={selectedPackage?.id === pkg.id}
                      onSelect={(p) => {
                        setSelectedPackage(p);
                        setDiscountAmount(0);
                        setCouponApplied(null);
                        setError(null);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Step 02 Sticky Checkout Summary */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="bg-[#0C1017]/95 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md">
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <span className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-indigo-600/30">
                  02
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white">สรุปคำสั่งซื้อ</h3>
                  <p className="text-xs text-zinc-400">ตรวจสอบและยืนยันการชำระเงิน</p>
                </div>
              </div>

              {/* Selected Package Details */}
              {selectedPackage ? (
                <div className="p-4 rounded-2xl bg-[#111722] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">แพ็กเกจ</span>
                    <span className="text-sm font-bold text-white">{selectedPackage.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">เหรียญที่จะได้รับเข้าเว็บ</span>
                    <span className="text-sm font-black text-amber-400 flex items-center gap-1">
                      <Coins className="w-4 h-4" />
                      {(selectedPackage.coins + selectedPackage.bonusCoins).toLocaleString()} Coins
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <span className="text-xs text-zinc-400">บัญชีผู้รับ</span>
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                      <User className="w-3 h-3" />
                      {user?.username || user?.email || (isAuthenticated ? 'บัญชีของคุณ' : 'กรุณาเข้าสู่ระบบ')}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-[#111722] border border-white/5 text-center text-xs text-zinc-500">
                  ยังไม่ได้เลือกแพ็กเกจ กรุณาเลือกแพ็กเกจในขั้นตอนที่ 1
                </div>
              )}

              {/* Coupon Code Input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-300">โค้ดส่วนลดโปรโมชัน</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="เช่น FLASH10, VALOR10"
                      className="w-full bg-[#111722] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 uppercase tracking-wider"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || !selectedPackage}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    ใช้โค้ด
                  </button>
                </div>

                {couponApplied && (
                  <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ใช้คูปอง {couponApplied} สำเร็จ (-฿{discountAmount.toFixed(2)})
                  </p>
                )}
                {couponError && (
                  <p className="text-[11px] text-red-400 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {couponError}
                  </p>
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2.5">
                <label className="block text-xs font-semibold text-zinc-300">เลือกช่องทางชำระเงิน</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {/* PromptPay Option (Default for Web Top-Up) */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PROMPTPAY')}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      paymentMethod === 'PROMPTPAY'
                        ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                        : 'bg-[#111722] border-white/5 text-zinc-400 hover:border-white/15'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 flex-shrink-0">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">พร้อมเพย์</p>
                      <p className="text-[10px] text-zinc-400">QR สแกนจ่าย</p>
                    </div>
                  </button>

                  {/* Wallet Option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('WALLET')}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      paymentMethod === 'WALLET'
                        ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                        : 'bg-[#111722] border-white/5 text-zinc-400 hover:border-white/15'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Wallet</p>
                      <p className="text-[10px] text-amber-400 font-mono">฿{balance.toFixed(2)}</p>
                    </div>
                  </button>
                </div>

                {/* Low Wallet Balance Warning with quick Topup */}
                {paymentMethod === 'WALLET' && isAuthenticated && !isBalanceSufficient && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs animate-in fade-in">
                    <div>
                      <p className="text-amber-300 font-bold">ยอดเงินในกระเป๋าไม่พอ</p>
                      <p className="text-[11px] text-zinc-400">ขาดอีก ฿{(finalPrice - balance).toFixed(2)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={openTopupModal}
                      className="font-black text-xs text-black bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-md shadow-amber-400/20 transition-all hover:scale-105 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> เติมเงิน Wallet
                    </button>
                  </div>
                )}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="border-t border-white/10 pt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>ราคาแพ็กเกจ</span>
                  <span>{settings.currency_symbol || '฿'}{originalPrice.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-400 font-semibold">
                    <span>ส่วนลดโปรโมชัน</span>
                    <span>-{settings.currency_symbol || '฿'}{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm font-black text-white pt-2 border-t border-white/10">
                  <span>ยอดชำระสุทธิ</span>
                  <span className="text-2xl text-amber-400 font-black">
                    {settings.currency_symbol || '฿'}{finalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Main Submit Button */}
              <button
                type="button"
                disabled={submitting || !selectedPackage}
                onClick={handleCheckout}
                className="w-full py-4 px-6 rounded-2xl font-black text-sm text-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 shadow-xl shadow-amber-400/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    กำลังดำเนินการเติมเงินเข้าเว็บ...
                  </span>
                ) : !isAuthenticated ? (
                  'เข้าสู่ระบบเพื่อดำเนินการเติมเงิน'
                ) : (
                  <>
                    <span>ยืนยันการชำระเงิน</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-zinc-500 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                เข้ารหัสความปลอดภัย 256-bit SSL ทุกธุรกรรม
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar (Only visible on small/medium screens) */}
      {selectedPackage && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0C1017]/95 border-t border-white/10 p-4 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
            <div>
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-black text-white">
                  {(selectedPackage.coins + selectedPackage.bonusCoins).toLocaleString()} Coins
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                จ่ายเพียง <span className="text-amber-400 font-bold">฿{finalPrice.toFixed(2)}</span>
              </p>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={handleCheckout}
              className="py-2.5 px-6 rounded-xl font-black text-xs text-black bg-gradient-to-r from-amber-400 to-yellow-400 shadow-lg shadow-amber-400/20 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <span>{submitting ? 'กำลังส่ง...' : 'เติมเงินทันที'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Order Success Modal */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0C1017] border border-amber-500/40 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-amber-500/10 space-y-6 relative overflow-hidden">
            {/* Ambient gold glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500/20 via-emerald-500/20 to-amber-500/10 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-black tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase">
                TRANSACTION COMPLETED
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">เติมเงินเข้าเว็บสำเร็จแล้ว!</h3>
              <p className="text-xs text-zinc-400 mt-1">
                ระบบได้เพิ่มเหรียญเข้าสู่กระเป๋าบัญชีเว็บของคุณเรียบร้อยแล้ว
              </p>
            </div>

            {/* Receipt Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#111722] border border-white/5 text-left text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">รหัสคำสั่งซื้อ:</span>
                <button
                  type="button"
                  onClick={() => handleCopyOrderId(orderSuccess.orderId)}
                  className="font-mono text-white font-bold flex items-center gap-1.5 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  <span>{orderSuccess.orderId}</span>
                  {copiedOrderId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">บัญชีผู้รับ:</span>
                <span className="font-semibold text-emerald-400">
                  {user?.username || user?.email || orderSuccess.playerId || 'บัญชีของคุณ'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">แพ็กเกจ:</span>
                <span className="text-white font-semibold">{orderSuccess.packageName}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="text-zinc-400">เหรียญที่ได้รับเข้าเว็บ:</span>
                <span className="text-amber-400 font-black text-sm flex items-center gap-1">
                  <Coins className="w-4 h-4" />
                  {orderSuccess.coinsReceived.toLocaleString()} Coins
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">ยอดชำระสุทธิ:</span>
                <span className="text-white font-black text-sm">
                  {settings.currency_symbol || '฿'}{orderSuccess.finalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                to="/gacha"
                className="py-3 px-4 rounded-xl font-black text-xs text-black bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 transition-colors shadow-lg shadow-amber-400/20 flex items-center justify-center gap-1.5"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>ไปหมุนวงล้อกาชา</span>
              </Link>
              <button
                type="button"
                onClick={() => navigate('/orders')}
                className="py-3 px-4 rounded-xl font-bold text-xs text-zinc-300 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                ดูประวัติคำสั่งซื้อ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopupPage;
