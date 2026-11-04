import React, { createContext, useContext, useEffect, useState } from 'react';
import { platformApi } from '../services/api';
import { PlatformSettings } from '../types';

interface SettingsContextType {
  settings: PlatformSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: PlatformSettings = {
  game_title: 'AETHERIA: CHRONICLES OF VALOR',
  game_subtitle: 'The Ultimate High-Fantasy Tactical Action RPG',
  game_logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
  currency_symbol: '฿',
  primary_color: '#6366F1',
  hero_badge: 'OFFICIAL AUTHORIZED TOP-UP PARTNER',
  hero_title: 'เติมเหรียญ Aetheria รวดเร็ว ปลอดภัย ได้รับทันที',
  hero_description: 'ระบบเติมเงินอัตโนมัติ 24 ชม. ส่งตรงเข้า UID ปลอดภัย 100% พร้อมโบนัสพิเศษและกล่องสุ่มลุ้นรับของรางวัลระดับ Mythic',
  announcement_banner: '⚡ ฉลองเปิดเซิร์ฟเวอร์ใหม่! เติมเงินแพ็กเกจ 500 Coins ขึ้นไป รับฟรี โบนัสเหรียญ +20% วันนี้',
  contact_support: '@AetheriaTopup',

  // Game System Defaults
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
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await platformApi.getSettings();
      if (res.data?.success && res.data?.data) {
        const loaded = { ...defaultSettings, ...res.data.data };
        setSettings(loaded);

        // Dynamically update document title and accent CSS variable
        document.title = `${loaded.game_title} | Game Top-up Platform`;
        if (loaded.primary_color) {
          document.documentElement.style.setProperty('--primary-accent', loaded.primary_color);
        }
      }
    } catch (err) {
      console.warn('Failed to load dynamic settings, using defaults');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
