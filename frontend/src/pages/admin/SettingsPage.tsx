import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, RefreshCw, Palette, Globe, Megaphone, PhoneCall } from 'lucide-react';
import { adminApi } from '../../services/adminApi';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({
    game_title: '',
    game_subtitle: '',
    game_logo: '',
    currency_symbol: '฿',
    primary_color: '#6366F1',
    hero_badge: '',
    hero_title: '',
    hero_description: '',
    announcement_banner: '',
    contact_support: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await adminApi.getSettings();
      if (res.data?.success) {
        setSettings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await adminApi.updateSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  const colorPresets = [
    { name: 'Indigo', color: '#6366F1' },
    { name: 'Pink/Mythic', color: '#EC4899' },
    { name: 'Emerald', color: '#10B981' },
    { name: 'Amber/Gold', color: '#F59E0B' },
    { name: 'Cyan/Blue', color: '#06B6D4' },
    { name: 'Crimson', color: '#EF4444' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">ตั้งค่าเว็บไซต์และเกม (Site & Brand Settings)</h1>
          <p className="text-xs text-zinc-400">
            ปรับแต่งชื่อเกม โลโก้ ธีมสี ข้อความแบนเนอร์ และข้อมูลร้านค้า (ผลลัพธ์จะแสดงผลที่หน้าบ้านทันที)
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="py-2.5 px-6 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 hover:scale-[1.02] disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>บันทึกการตั้งค่า</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>บันทึกการตั้งค่าสำเร็จ! หน้าเว็บไซต์ของลูกค้าจะเปลี่ยนตามค่าใหม่อัตโนมัติ</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Game & Brand Identity */}
        <div className="bg-[#10141E] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">ข้อมูลเอกลักษณ์ของเกม (Game Identity)</h3>
              <p className="text-xs text-zinc-400">ชื่อเกม โลโก้ และสกุลเงิน</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5">ชื่อเกม (Game Title)</label>
              <input
                type="text"
                required
                value={settings.game_title || ''}
                onChange={(e) => handleChange('game_title', e.target.value)}
                className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5">คำโปรยเกม (Game Subtitle)</label>
              <input
                type="text"
                value={settings.game_subtitle || ''}
                onChange={(e) => handleChange('game_subtitle', e.target.value)}
                className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5">โลโก้เกม URL (Game Logo Image)</label>
              <input
                type="text"
                value={settings.game_logo || ''}
                onChange={(e) => handleChange('game_logo', e.target.value)}
                className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5">สัญลักษณ์สกุลเงิน (Currency Symbol)</label>
              <input
                type="text"
                value={settings.currency_symbol || ''}
                onChange={(e) => handleChange('currency_symbol', e.target.value)}
                className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Theme & Color Palette */}
        <div className="bg-[#10141E] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">ธีมและสีหลัก (Primary Accent Color)</h3>
              <p className="text-xs text-zinc-400">สีที่ใช้เป็นปุ่ม CTA, กรอบเรืองแสง, และสถานะต่างๆ ในเว็บไซต์</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.primary_color || '#6366F1'}
                onChange={(e) => handleChange('primary_color', e.target.value)}
                className="w-10 h-10 rounded-xl bg-transparent border border-white/10 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={settings.primary_color || ''}
                onChange={(e) => handleChange('primary_color', e.target.value)}
                className="w-36 bg-[#151A28] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-xs mb-2">เลือกจากโทนสีแนะนำ:</label>
              <div className="flex flex-wrap gap-2.5">
                {colorPresets.map((p) => (
                  <button
                    key={p.color}
                    type="button"
                    onClick={() => handleChange('primary_color', p.color)}
                    className="px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold flex items-center gap-2 bg-[#151A28] hover:border-white/30 transition-all"
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></span>
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Hero & Banner Content */}
        <div className="bg-[#10141E] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">ข้อความส่วนหัวและประกาศ (Hero & Announcements)</h3>
              <p className="text-xs text-zinc-400">ข้อความ Hero บนหน้าแรก และแถบประกาศด้านบนสุด</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5">แถบข้อความประกาศ (Announcement Banner)</label>
              <input
                type="text"
                value={settings.announcement_banner || ''}
                onChange={(e) => handleChange('announcement_banner', e.target.value)}
                className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1.5">Hero Badge Text</label>
                <input
                  type="text"
                  value={settings.hero_badge || ''}
                  onChange={(e) => handleChange('hero_badge', e.target.value)}
                  className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1.5">Hero Title (พาดหัวหลัก)</label>
                <input
                  type="text"
                  value={settings.hero_title || ''}
                  onChange={(e) => handleChange('hero_title', e.target.value)}
                  className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5">Hero Description (คำบรรยายหน้าร้าน)</label>
              <textarea
                value={settings.hero_description || ''}
                onChange={(e) => handleChange('hero_description', e.target.value)}
                className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 h-20"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Support & Contact */}
        <div className="bg-[#10141E] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">ช่องทางติดต่อฝ่ายบริการ (Support Contact)</h3>
              <p className="text-xs text-zinc-400">แสดงในแถบ Footer ของเว็บไซต์</p>
            </div>
          </div>

          <div className="max-w-md text-xs">
            <label className="block text-zinc-300 font-semibold mb-1.5">Line / Support ID</label>
            <input
              type="text"
              value={settings.contact_support || ''}
              onChange={(e) => handleChange('contact_support', e.target.value)}
              className="w-full bg-[#151A28] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-mono font-bold"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
