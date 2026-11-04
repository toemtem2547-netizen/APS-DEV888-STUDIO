import React, { useState } from 'react';
import { X, Wallet, QrCode, CreditCard, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useSettings } from '../context/SettingsContext';

export const TopupModal: React.FC = () => {
  const { isTopupModalOpen, closeTopupModal, balance, topup } = useWallet();
  const { settings } = useSettings();

  const [selectedAmount, setSelectedAmount] = useState<number>(300);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'PROMPTPAY' | 'CREDIT_CARD'>('PROMPTPAY');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isTopupModalOpen) return null;

  const presets = [
    { amount: 50, bonus: 0 },
    { amount: 100, bonus: 0 },
    { amount: 300, bonus: 0 },
    { amount: 500, bonus: 25, label: '+5% โบนัส' },
    { amount: 1000, bonus: 100, label: '+10% โบนัส' },
    { amount: 2000, bonus: 200, label: '+10% โบนัส' },
  ];

  const currentAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  let calculatedBonus = 0;
  if (currentAmount >= 1000) calculatedBonus = Number((currentAmount * 0.10).toFixed(2));
  else if (currentAmount >= 500) calculatedBonus = Number((currentAmount * 0.05).toFixed(2));

  const handleConfirmTopup = async () => {
    if (currentAmount <= 0) {
      setError('กรุณาระบุจำนวนเงินที่ถูกต้อง');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await topup(currentAmount, paymentMethod);
      setSuccessMessage(res.message);
      setTimeout(() => {
        setSuccessMessage(null);
        closeTopupModal();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'การเติมเงินล้มเหลว');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0D1117] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/90 overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>

        {/* Close Button */}
        <button
          onClick={closeTopupModal}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">เติมเครดิตเข้า Wallet</h3>
            <p className="text-xs text-zinc-400">
              ยอดคงเหลือปัจจุบัน: <span className="text-indigo-400 font-bold">{settings.currency_symbol}{balance.toFixed(2)}</span>
            </p>
          </div>
        </div>

        {successMessage ? (
          <div className="py-12 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-xl font-bold text-white">{successMessage}</h4>
            <p className="text-xs text-zinc-400">ยอดเงินถูกอัปเดตเข้ากระเป๋าของคุณเรียบร้อยแล้ว</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Amount Presets */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                เลือกจำนวนเงินที่ต้องการเติม
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {presets.map((p) => {
                  const isSelected = selectedAmount === p.amount && !customAmount;
                  return (
                    <button
                      key={p.amount}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(p.amount);
                        setCustomAmount('');
                      }}
                      className={`relative p-3 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/20 scale-[1.02]'
                          : 'bg-[#121821] border-white/5 text-zinc-300 hover:border-white/20'
                      }`}
                    >
                      {p.label && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-red-500 text-black text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow">
                          {p.label}
                        </span>
                      )}
                      <p className="font-extrabold text-base">฿{p.amount}</p>
                      {p.bonus > 0 && (
                        <p className="text-[10px] text-amber-400 font-medium">แถม +฿{p.bonus}</p>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Amount Input */}
              <div className="mt-3">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-400 font-bold">฿</span>
                  <input
                    type="number"
                    min="1"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(0);
                    }}
                    placeholder="หรือระบุจำนวนเงินเอง (บาท)"
                    className="w-full bg-[#121821] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">ช่องทางชำระเงิน</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('PROMPTPAY')}
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                    paymentMethod === 'PROMPTPAY'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                      : 'bg-[#121821] border-white/5 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-indigo-400" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-white">PromptPay QR</p>
                    <p className="text-[10px] text-zinc-400">สแกนจ่ายทันที ฟรีค่าธรรมเนียม</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CREDIT_CARD')}
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                    paymentMethod === 'CREDIT_CARD'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                      : 'bg-[#121821] border-white/5 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-purple-400" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-white">บัตรเครดิต / เดบิต</p>
                    <p className="text-[10px] text-zinc-400">Visa, Mastercard</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Simulated QR Code Display if PromptPay */}
            {paymentMethod === 'PROMPTPAY' && currentAmount > 0 && (
              <div className="p-4 rounded-2xl bg-[#121821] border border-white/5 flex items-center gap-4">
                <div className="w-20 h-20 bg-white p-2 rounded-xl flex-shrink-0 flex items-center justify-center shadow">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PROMPTPAY-DEMO-PAYMENT-${currentAmount}`}
                    alt="PromptPay QR"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-white">พร้อมเพย์ คิวอาร์โค้ด</p>
                  <p className="text-zinc-400">ยอดชำระ: <span className="font-bold text-white">฿{currentAmount.toFixed(2)}</span></p>
                  {calculatedBonus > 0 && (
                    <p className="text-amber-400 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> รับเครดิตรวม ฿{(currentAmount + calculatedBonus).toFixed(2)}
                    </p>
                  )}
                  <p className="text-[10px] text-zinc-400">คลิกปุ่มด้านล่างเพื่อยืนยันการชำระเงินจำลอง</p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Button */}
            <button
              type="button"
              disabled={loading || currentAmount <= 0}
              onClick={handleConfirmTopup}
              className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'กำลังทำรายการ...' : `ยืนยันการชำระเงิน ฿${currentAmount.toFixed(2)}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
