import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Sparkles, Copy, Check, ArrowRight, Flame } from 'lucide-react';
import { platformApi } from '../services/api';
import { Promotion } from '../types';

export const PromotionsPage: React.FC = () => {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const res = await platformApi.getPromotions();
        if (res.data?.success) {
          setPromos(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load promotions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPromos();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5" />
          <span>EXCLUSIVE DEALS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">โปรโมชั่นและดีลพิเศษ</h1>
        <p className="text-sm text-zinc-400">
          ประหยัดค่าใช้จ่ายด้วยส่วนลดและโบนัสเหรียญพิเศษเฉพาะช่วงเวลานี้เท่านั้น
        </p>
      </div>

      {/* Promos Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-60 rounded-3xl bg-[#0D1117] animate-pulse border border-white/5"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promos.map((promo) => (
            <div
              key={promo.id}
              className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#0D1117] via-[#121821] to-[#161D29] p-6 sm:p-8 flex flex-col justify-between shadow-2xl group"
            >
              <div className="space-y-3 z-10">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {promo.promoType}
                </span>
                <h3 className="text-2xl font-black text-white">{promo.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md">{promo.subtitle}</p>

                {promo.code && (
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-xs text-zinc-400">รหัสคูปอง:</span>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-white/10">
                      <span className="font-mono text-sm font-bold text-amber-400 select-all tracking-wider">
                        {promo.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(promo.code!)}
                        className="text-zinc-400 hover:text-white transition-colors"
                        title="คัดลอกโค้ด"
                      >
                        {copiedCode === promo.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-8 z-10 flex items-center justify-between border-t border-white/5 mt-6">
                <div className="text-xs text-zinc-400">
                  {promo.minSpend > 0 && <span>ยอดขั้นต่ำ ฿{promo.minSpend.toFixed(2)}</span>}
                </div>
                <Link
                  to="/topup"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                >
                  <span>ใช้โปรโมชั่นนี้</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
