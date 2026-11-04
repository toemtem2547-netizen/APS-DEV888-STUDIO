import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Gamepad2,
  Gift,
  Trophy,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Coins,
  Flame,
  Volume2,
  VolumeX,
  Sliders,
  Check,
  Play,
  Pause,
  ArrowRight,
  TrendingUp,
  Layers,
  HelpCircle,
  ShieldCheck,
  Info,
  Percent,
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { GameOverviewData } from '../../types';

export const GameManagementPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [overview, setOverview] = useState<GameOverviewData | null>(null);

  // Form State for Game Settings
  const [settings, setSettings] = useState<Record<string, string>>({
    game_mystery_box_enabled: 'true',
    game_mystery_box_title: 'กล่องสุ่มสมบัติ (Mystery Boxes)',
    game_mystery_box_subtitle: 'กล่องสุ่มไอเทมและรางวัลใหญ่ ลุ้นรับของแรร์ทันที',
    game_mystery_box_notice: '⚡ การันตีไอเทมคุ้มค่าทุกกล่อง ลุ้นรับ Gaming Gear ระดับ Mythic!',

    game_gacha_enabled: 'true',
    game_gacha_title: 'วงล้อกาชา (Gacha Vault)',
    game_gacha_subtitle: 'ตู้สุ่มรูเล็ตต์รวมรางวัลพิเศษ ลุ้นรับไอเทมแรร์ระดับตำนาน',
    game_gacha_cost: '29',
    game_gacha_free_spins: '1',
    game_gacha_notice: '👑 ล็อกอินทุกวันรับสิทธิ์หมุนฟรี 1 ครั้ง ลุ้นเครดิตและไอเทมแรร์!',

    game_wheel_enabled: 'true',
    game_wheel_title: 'เปิดการ์ด 3D เสี่ยงโชค (Lucky Tarot)',
    game_wheel_subtitle: 'เลือกไพ่ทาโรต์นำโชค 4 ใบ ลุ้นรับ Gaming Gear และ Coins',
    game_wheel_cost: '20',
    game_wheel_free_spins: '1',
    game_wheel_notice: '🔮 สิทธิ์เปิดการ์ดฟรีวันละ 1 ครั้ง! สับไพ่เสี่ยงทายลุ้นรางวัลใหญ่',

    game_maintenance_notice: 'ระบบเกมนี้กำลังปิดปรับปรุงชั่วคราวเพื่ออัปเดตของรางวัลใหม่ ขออภัยในความไม่สะดวก',
    game_sound_enabled: 'true',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [overviewRes, settingsRes] = await Promise.all([
        adminApi.getGameOverview(),
        adminApi.getSettings(),
      ]);

      if (overviewRes.data?.success) {
        setOverview(overviewRes.data.data);
      }

      if (settingsRes.data?.success && settingsRes.data.data) {
        setSettings((prev) => ({
          ...prev,
          ...settingsRes.data.data,
        }));
      }
    } catch (err: any) {
      console.error('Failed to load game management data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggleGame = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: prev[key] === 'false' ? 'true' : 'false',
    }));
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      setSavedSuccess(false);

      await adminApi.updateSettings(settings);

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);

      // Refresh overview
      const overviewRes = await adminApi.getGameOverview();
      if (overviewRes.data?.success) {
        setOverview(overviewRes.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า');
    } finally {
      setSaving(false);
    }
  };

  const mbEnabled = settings.game_mystery_box_enabled !== 'false';
  const gachaEnabled = settings.game_gacha_enabled !== 'false';
  const wheelEnabled = settings.game_wheel_enabled !== 'false';

  const activeCount = (mbEnabled ? 1 : 0) + (gachaEnabled ? 1 : 0) + (wheelEnabled ? 1 : 0);

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#121624] via-[#0E121D] to-[#141A29] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Storefront Games Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            จัดการระบบเกมส์หน้าบ้าน
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            ควบคุมการเปิด/ปิดเกมส์หน้าบ้าน ปรับราคาหมุนต่อรอบ สิทธิ์เล่นฟรีต่อวัน สโลแกน และข้อความประกาศโปรโมชั่น ส่งผลลัพธ์ไปยังหน้าร้านค้าของลูกค้าทันที
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all shadow-md"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="py-3 px-6 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2 hover:scale-[1.02] disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>บันทึกการตั้งค่าทั้งหมด</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-3 shadow-lg shadow-emerald-950/40 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>บันทึกการตั้งค่าระบบเกมส์สำเร็จแล้ว! ข้อมูลและการควบคุมหน้าบ้านจะอัปเดตแบบเรียลไทม์ทันที</span>
        </div>
      )}

      {/* Top 4 Real-time Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-[#10141E] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold">สถานะเกมหน้าบ้าน</span>
            <div className={`w-2.5 h-2.5 rounded-full ${activeCount > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{activeCount} / 3</span>
            <span className="text-[11px] font-semibold text-emerald-400">เกมพร้อมเล่น</span>
          </div>
          <span className="text-[10px] text-zinc-500 mt-2 block">
            {activeCount === 3 ? 'เปิดให้บริการครบทุกเกม' : `ปิดปรับปรุง ${3 - activeCount} เกม`}
          </span>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#10141E] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold">ยอดการเล่นรวมทุกเกม</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-400">
              {(overview?.summary.totalPlays || 0).toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-zinc-400">ครั้ง</span>
          </div>
          <span className="text-[10px] text-zinc-500 mt-2 block">
            วันนี้เล่นไปแล้ว {(overview?.summary.todayPlays || 0).toLocaleString()} รอบ
          </span>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#10141E] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold">ยอดเงินหมุนเวียนจากเกม</span>
            <Coins className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">
              ฿{(overview?.summary.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 mt-2 block">
            รายได้รวมจากการสุ่มกล่อง & หมุนวงล้อ
          </span>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#10141E] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold">พูลรางวัลในระบบ</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-purple-400">
              {((overview?.games.mystery_box.totalItems || 0) +
                (overview?.games.gacha.totalItems || 0) +
                (overview?.games.wheel.totalItems || 0))}
            </span>
            <span className="text-[11px] font-semibold text-zinc-400">ไอเทม/กล่อง</span>
          </div>
          <span className="text-[10px] text-zinc-500 mt-2 block">
            กระจายอยู่ใน 3 ระบบเกมหลัก
          </span>
        </div>
      </div>

      {/* Global Settings & Maintenance Bar */}
      <div className="bg-[#10141E] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-sm sm:text-base text-white">ตั้งค่าสากลระบบเกม (Global Game Options)</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400">เสียงเอฟเฟกต์เริ่มต้น:</span>
            <button
              onClick={() => handleToggleGame('game_sound_enabled')}
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${settings.game_sound_enabled !== 'false'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
            >
              {settings.game_sound_enabled !== 'false' ? (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>เปิดเสียง</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>ปิดเสียง</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-zinc-300 text-xs font-semibold mb-1.5 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>ข้อความแจ้งเตือนเมื่อระบบเกมปิดปรับปรุง (Maintenance Notice Broadcast)</span>
          </label>
          <input
            type="text"
            value={settings.game_maintenance_notice || ''}
            onChange={(e) => handleChange('game_maintenance_notice', e.target.value)}
            placeholder="เช่น ระบบเกมนี้กำลังปิดปรับปรุงชั่วคราวเพื่ออัปเดตของรางวัลใหม่ ขออภัยในความไม่สะดวก"
            className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
          />
          <span className="text-[11px] text-zinc-500 mt-1 block">
            ข้อความนี้จะแสดงผลบนหน้าจอเมื่อลูกค้ากดเข้าเกมที่ถูกปิดปรับปรุง
          </span>
        </div>
      </div>

      {/* 3 Main Game Cards Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">จัดการระบบเกมแต่ละตัว (Game Modules)</h2>
          </div>
          <span className="text-xs text-zinc-400">
            ปรับแต่งสิทธิ์และราคาของแต่ละเกมอิสระ
          </span>
        </div>

        {/* ═══ GAME 1: MYSTERY BOXES (กล่องสุ่ม) ═══ */}
        <div className={`rounded-3xl border transition-all duration-300 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden ${mbEnabled
            ? 'bg-[#10141E] border-white/10 hover:border-amber-500/30'
            : 'bg-[#0E111A]/90 border-zinc-800 opacity-90'
          }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${mbEnabled
                  ? 'bg-gradient-to-tr from-amber-600 to-amber-400 shadow-amber-500/20'
                  : 'bg-zinc-800 text-zinc-500'
                }`}>
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">1. ระบบกล่องสุ่ม (Mystery Boxes)</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${mbEnabled
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                    {mbEnabled ? '● เปิดให้บริการ' : '○ ปิดปรับปรุง'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Route หน้าบ้าน: <code className="text-amber-400 font-mono">/mystery-box</code>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/admin/mystery-boxes"
                className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-300 hover:text-amber-200 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Percent className="w-3.5 h-3.5 text-amber-400" />
                <span>% จัดของรางวัล & เรทสุ่ม</span>
              </Link>

              <Link
                to="/mystery-box"
                target="_blank"
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
              >
                <span>ดูหน้าบ้าน</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              {/* Master Switch */}
              <button
                onClick={() => handleToggleGame('game_mystery_box_enabled')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${mbEnabled
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-700'
                  }`}
              >
                {mbEnabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{mbEnabled ? 'ปิดให้บริการเกม' : 'เปิดให้บริการเกม'}</span>
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5">ชื่อระบบเกมหน้าบ้าน (Display Title)</label>
              <input
                type="text"
                value={settings.game_mystery_box_title || ''}
                onChange={(e) => handleChange('game_mystery_box_title', e.target.value)}
                placeholder="เช่น Mystery Boxes กล่องสุ่มสมบัติ"
                className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5">สโลแกน / คำอธิบาย (Subtitle)</label>
              <input
                type="text"
                value={settings.game_mystery_box_subtitle || ''}
                onChange={(e) => handleChange('game_mystery_box_subtitle', e.target.value)}
                placeholder="เช่น ลุ้นรับรางวัลใหญ่ระดับ Mythic และ Gaming Gear"
                className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-zinc-300 font-semibold mb-1.5">ข้อความประกาศโปรโมชั่น / กิจกรรม (Banner Notice)</label>
              <input
                type="text"
                value={settings.game_mystery_box_notice || ''}
                onChange={(e) => handleChange('game_mystery_box_notice', e.target.value)}
                placeholder="เช่น ⚡ การันตีไอเทมคุ้มค่าทุกกล่อง ลุ้นรับ Gaming Gear ระดับ Mythic!"
                className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Bottom Card Summary & Quick Link */}
          <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-zinc-400">
              <span>กล่องทั้งหมดในระบบ: <strong className="text-white font-bold">{overview?.games.mystery_box.totalItems || 0}</strong> กล่อง</span>
              <span>เปิดใช้งาน: <strong className="text-emerald-400 font-bold">{overview?.games.mystery_box.activeItems || 0}</strong> กล่อง</span>
              <span>ยอดสุ่มสะสม: <strong className="text-amber-400 font-bold">{(overview?.games.mystery_box.totalPlays || 0).toLocaleString()}</strong> ครั้ง</span>
            </div>

            <Link
              to="/admin/mystery-boxes"
              className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold group"
            >
              <span>ไปที่หน้าจัดการกล่อง & อัตราดรอป</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ═══ GAME 2: GACHA LUCKY VAULT (วงล้อกาชารูเล็ตต์) ═══ */}
        <div className={`rounded-3xl border transition-all duration-300 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden ${gachaEnabled
            ? 'bg-[#10141E] border-white/10 hover:border-purple-500/30'
            : 'bg-[#0E111A]/90 border-zinc-800 opacity-90'
          }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${gachaEnabled
                  ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-purple-500/20'
                  : 'bg-zinc-800 text-zinc-500'
                }`}>
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">2. วงล้อสุ่มกาชา (Gacha Lucky Vault)</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${gachaEnabled
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                    {gachaEnabled ? '● เปิดให้บริการ' : '○ ปิดปรับปรุง'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Route หน้าบ้าน: <code className="text-purple-400 font-mono">/gacha</code>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/admin/gacha"
                className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-300 hover:text-amber-200 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Percent className="w-3.5 h-3.5 text-amber-400" />
                <span>% จัดของรางวัล & เรทสุ่ม</span>
              </Link>

              <Link
                to="/gacha"
                target="_blank"
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
              >
                <span>ดูหน้าบ้าน</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              {/* Master Switch */}
              <button
                onClick={() => handleToggleGame('game_gacha_enabled')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${gachaEnabled
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-700'
                  }`}
              >
                {gachaEnabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{gachaEnabled ? 'ปิดให้บริการเกม' : 'เปิดให้บริการเกม'}</span>
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="lg:col-span-2">
              <label className="block text-zinc-300 font-semibold mb-1.5">ชื่อระบบเกมหน้าบ้าน (Display Title)</label>
              <input
                type="text"
                value={settings.game_gacha_title || ''}
                onChange={(e) => handleChange('game_gacha_title', e.target.value)}
                placeholder="เช่น Gacha Lucky Vault"
                className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5 flex items-center gap-1 text-amber-300">
                <Coins className="w-3.5 h-3.5" />
                <span>ค่าหมุนต่อรอบ (Coins/บาท)</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={settings.game_gacha_cost || '29'}
                onChange={(e) => handleChange('game_gacha_cost', e.target.value)}
                className="w-full bg-[#151A28] border border-amber-500/30 rounded-xl px-3.5 py-2.5 text-white font-black text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5 flex items-center gap-1 text-emerald-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>สิทธิ์หมุนฟรีต่อวัน (Free Daily)</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={settings.game_gacha_free_spins || '1'}
                onChange={(e) => handleChange('game_gacha_free_spins', e.target.value)}
                className="w-full bg-[#151A28] border border-emerald-500/30 rounded-xl px-3.5 py-2.5 text-white font-black text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-zinc-300 font-semibold mb-1.5">สโลแกน / คำอธิบาย (Subtitle)</label>
              <input
                type="text"
                value={settings.game_gacha_subtitle || ''}
                onChange={(e) => handleChange('game_gacha_subtitle', e.target.value)}
                placeholder="เช่น ตู้สุ่มรูเล็ตต์รวมรางวัลพิเศษ ลุ้นรับไอเทมแรร์ระดับตำนาน"
                className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-zinc-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-zinc-300 font-semibold mb-1.5">ข้อความประกาศโปรโมชั่น / กิจกรรม (Banner Notice)</label>
              <input
                type="text"
                value={settings.game_gacha_notice || ''}
                onChange={(e) => handleChange('game_gacha_notice', e.target.value)}
                placeholder="เช่น 👑 ล็อกอินทุกวันรับสิทธิ์หมุนฟรี 1 ครั้ง ลุ้นเครดิตและไอเทมแรร์!"
                className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-zinc-200 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Bottom Card Summary & Quick Link */}
          <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-zinc-400">
              <span>ไอเทมในตู้รูเล็ตต์: <strong className="text-white font-bold">{overview?.games.gacha.totalItems || 0}</strong> ชิ้น</span>
              <span>หมุนวันนี้: <strong className="text-emerald-400 font-bold">{overview?.games.gacha.todayPlays || 0}</strong> รอบ</span>
              <span>ยอดหมุนรวม: <strong className="text-purple-400 font-bold">{(overview?.games.gacha.totalPlays || 0).toLocaleString()}</strong> ครั้ง</span>
            </div>

            <Link
              to="/admin/gacha"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-bold group"
            >
              <span>ไปที่หน้าจัดการตู้สุ่ม & ค่าน้ำหนักเรท</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ═══ GAME 3: LUCKY TAROT CARDS (เปิดการ์ด 3D เสี่ยงโชค) ═══ */}
        <div className={`rounded-3xl border transition-all duration-300 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden ${wheelEnabled
            ? 'bg-[#10141E] border-white/10 hover:border-cyan-500/30'
            : 'bg-[#0E111A]/90 border-zinc-800 opacity-90'
          }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${wheelEnabled
                  ? 'bg-gradient-to-tr from-cyan-600 to-blue-500 shadow-cyan-500/20'
                  : 'bg-zinc-800 text-zinc-500'
                }`}>
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">3. เปิดการ์ด 3D เสี่ยงโชค (Lucky Tarot Game)</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${wheelEnabled
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                    {wheelEnabled ? '● เปิดให้บริการ' : '○ ปิดปรับปรุง'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Route หน้าบ้าน: <code className="text-cyan-400 font-mono">/wheel</code>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/admin/wheel?openWeights=true"
                className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-300 hover:text-amber-200 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Percent className="w-3.5 h-3.5 text-amber-400" />
                <span>% จัดของรางวัล & เรทสุ่ม</span>
              </Link>

              <Link
                to="/wheel"
                target="_blank"
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
              >
                <span>ดูหน้าบ้าน</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              {/* Master Switch */}
              <button
                onClick={() => handleToggleGame('game_wheel_enabled')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${wheelEnabled
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-700'
                  }`}
              >
                {wheelEnabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{wheelEnabled ? 'ปิดให้บริการเกม' : 'เปิดให้บริการเกม'}</span>
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="lg:col-span-2">
              <label className="block text-zinc-300 font-semibold mb-1.5">ชื่อระบบเกมหน้าบ้าน (Display Title)</label>
              <input
                type="text"
                value={settings.game_wheel_title || ''}
                onChange={(e) => handleChange('game_wheel_title', e.target.value)}
                placeholder="เช่น เปิดการ์ด 3D เสี่ยงโชค"
                className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5 flex items-center gap-1 text-amber-300">
                <Coins className="w-3.5 h-3.5" />
                <span>ค่าเปิดไพ่ต่อรอบ (Coins/บาท)</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={settings.game_wheel_cost || '20'}
                onChange={(e) => handleChange('game_wheel_cost', e.target.value)}
                className="w-full bg-[#151A28] border border-amber-500/30 rounded-xl px-3.5 py-2.5 text-white font-black text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5 flex items-center gap-1 text-emerald-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>สิทธิ์เปิดฟรีต่อวัน (Free Daily)</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={settings.game_wheel_free_spins || '1'}
                onChange={(e) => handleChange('game_wheel_free_spins', e.target.value)}
                className="w-full bg-[#151A28] border border-emerald-500/30 rounded-xl px-3.5 py-2.5 text-white font-black text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-zinc-300 font-semibold mb-1.5">สโลแกน / คำอธิบาย (Subtitle)</label>
              <input
                type="text"
                value={settings.game_wheel_subtitle || ''}
                onChange={(e) => handleChange('game_wheel_subtitle', e.target.value)}
                placeholder="เช่น เลือกไพ่ทาโรต์นำโชค 4 ใบ ลุ้นรับ Gaming Gear และ Coins"
                className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-zinc-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-zinc-300 font-semibold mb-1.5">ข้อความประกาศโปรโมชั่น / กิจกรรม (Banner Notice)</label>
              <input
                type="text"
                value={settings.game_wheel_notice || ''}
                onChange={(e) => handleChange('game_wheel_notice', e.target.value)}
                placeholder="เช่น 🔮 สิทธิ์เปิดการ์ดฟรีวันละ 1 ครั้ง! สับไพ่เสี่ยงทายลุ้นรางวัลใหญ่"
                className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-zinc-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-zinc-300 font-semibold mb-1.5 flex items-center justify-between">
                <span>ภาพปกหลังไพ่ 3D (Card Back Cover URL)</span>
                <span className="text-[11px] text-cyan-400 font-normal">แสดงเมื่อไพ่คว่ำหน้าบ้าน</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-14 rounded-lg overflow-hidden border border-white/20 bg-black flex-shrink-0">
                  <img
                    src={settings.game_wheel_card_back || '/images/tarot_card_back.jpg'}
                    alt="Card Back"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/tarot_card_back.jpg';
                    }}
                  />
                </div>
                <input
                  type="text"
                  value={settings.game_wheel_card_back || ''}
                  onChange={(e) => handleChange('game_wheel_card_back', e.target.value)}
                  placeholder="/images/tarot_card_back.jpg"
                  className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-zinc-200 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Bottom Card Summary & Quick Link */}
          <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-zinc-400">
              <span>ช่องไพ่ในพูล: <strong className="text-white font-bold">{overview?.games.wheel.totalItems || 0}</strong> ใบ</span>
              <span>เปิดวันนี้: <strong className="text-emerald-400 font-bold">{overview?.games.wheel.todayPlays || 0}</strong> รอบ</span>
              <span>ยอดเล่นรวม: <strong className="text-cyan-400 font-bold">{(overview?.games.wheel.totalPlays || 0).toLocaleString()}</strong> ครั้ง</span>
            </div>

            <Link
              to="/admin/wheel"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-bold group"
            >
              <span>ไปที่หน้าจัดการช่องไพ่ & ค่าน้ำหนักเรท</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Save Actions Bar at bottom */}
      <div className="sticky bottom-6 z-20 bg-[#0E121D]/95 backdrop-blur-xl border border-white/15 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-zinc-300">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>การเปลี่ยนแปลงจะมีผลทันทีที่ลูกค้าโหลดหน้าใหม่ หรือทำการหมุน/สุ่มครั้งถัดไป</span>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="py-2.5 px-6 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 hover:scale-[1.02] disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>บันทึกการตั้งค่าระบบเกมส์</span>
        </button>
      </div>
    </div>
  );
};
