import { initDatabaseConnection, query } from '../config/db';

async function syncWheelPool() {
  await initDatabaseConnection();

  console.log('Fetching rewards for mapping...');
  const rewards: any = await query(`SELECT id, name, rarity, image_url, type, value FROM rewards`);
  const rMap: Record<string, any> = {};
  for (const r of rewards) {
    rMap[r.name] = r;
  }

  const fallbackId = rewards[0]?.id || 1;

  const cardItems = [
    {
      nameKey: 'Liquid-Cooled Custom Gaming PC',
      label: 'Liquid-Cooled Custom Gaming PC',
      subtitle: 'คอมพิวเตอร์เกมมิ่งสเปกเทพ',
      icon_url: '/images/rewards/pc_case.png',
      color: '#B45309', // Amber Gold
      text_color: '#FDE68A',
      rarity: 'LEGENDARY',
      weight: 2,
      sort_order: 1,
    },
    {
      nameKey: 'การ์ดจอ GeForce RTX 4090 Gaming OC',
      label: 'GeForce RTX 4090 Gaming OC',
      subtitle: 'การ์ดจอตัวท็อประดับโลก',
      icon_url: '/images/rewards/gpu.png',
      color: '#B45309',
      text_color: '#FDE68A',
      rarity: 'LEGENDARY',
      weight: 3,
      sort_order: 2,
    },
    {
      nameKey: 'จอคอมโค้ง 34" Curved OLED 240Hz',
      label: 'จอโค้ง 34" OLED 240Hz',
      subtitle: 'จอมอนิเตอร์เกมมิ่งโค้ง',
      icon_url: '/images/rewards/monitor.png',
      color: '#B45309',
      text_color: '#FDE68A',
      rarity: 'LEGENDARY',
      weight: 5,
      sort_order: 3,
    },
    {
      nameKey: '3,000 Coins Mythic Jackpot',
      label: '3,000 COINS',
      subtitle: 'แจ็กพอตใหญ่ระดับ Mythic',
      icon_url: '/images/packages/tier6.jpg',
      color: '#B45309',
      text_color: '#FDE68A',
      rarity: 'LEGENDARY',
      weight: 8,
      sort_order: 4,
    },
    {
      nameKey: 'BattleStation RGB Carbon Desk',
      label: 'BattleStation RGB Desk',
      subtitle: 'โต๊ะเกมมิ่งคาร์บอนไฟเบอร์',
      icon_url: '/images/rewards/desk.png',
      color: '#B45309',
      text_color: '#FDE68A',
      rarity: 'LEGENDARY',
      weight: 6,
      sort_order: 5,
    },
    {
      nameKey: 'แว่นตา VR Meta Gaming Headset',
      label: 'VR Gaming Headset',
      subtitle: 'แว่นตา VR ประสบการณ์ 3D',
      icon_url: '/images/rewards/vr.png',
      color: '#6D28D9', // Deep Purple
      text_color: '#DDD6FE',
      rarity: 'EPIC',
      weight: 12,
      sort_order: 6,
    },
    {
      nameKey: 'เก้าอี้ Ergonomic Cyber Gaming Chair',
      label: 'Cyber Gaming Chair',
      subtitle: 'เก้าอี้เกมมิ่งสรีรศาสตร์',
      icon_url: '/images/rewards/chair.png',
      color: '#6D28D9',
      text_color: '#DDD6FE',
      rarity: 'EPIC',
      weight: 15,
      sort_order: 7,
    },
    {
      nameKey: 'Custom RGB Mechanical Keyboard',
      label: 'คีย์บอร์ดเกมมิ่ง RGB',
      subtitle: 'Custom Mechanical RGB',
      icon_url: '/images/rewards/keyboard.png',
      color: '#BE185D', // Ruby Pink
      text_color: '#FBCFE8',
      rarity: 'EPIC',
      weight: 20,
      sort_order: 8,
    },
    {
      nameKey: 'ROG Wireless RGB Gaming Headset',
      label: 'หูฟังเกมมิ่ง RGB 7.1',
      subtitle: 'ROG Wireless Headset',
      icon_url: '/images/rewards/headset.png',
      color: '#6D28D9',
      text_color: '#DDD6FE',
      rarity: 'EPIC',
      weight: 22,
      sort_order: 9,
    },
    {
      nameKey: 'ไมโครโฟน Studio Condenser Mic',
      label: 'ไมโครโฟน Studio RGB',
      subtitle: 'Studio Condenser Mic',
      icon_url: '/images/rewards/microphone.png',
      color: '#6D28D9',
      text_color: '#DDD6FE',
      rarity: 'EPIC',
      weight: 25,
      sort_order: 10,
    },
    {
      nameKey: '1,000 Coins Grand Prize',
      label: '1,000 COINS',
      subtitle: 'รางวัลโบนัสเครดิตก้อนโต',
      icon_url: '/images/packages/tier4.jpg',
      color: '#6D28D9',
      text_color: '#DDD6FE',
      rarity: 'EPIC',
      weight: 28,
      sort_order: 11,
    },
    {
      nameKey: 'Elite Wireless Game Controller',
      label: 'จอยเกมส์ไร้สาย Elite',
      subtitle: 'Wireless Game Controller',
      icon_url: '/images/rewards/controller.png',
      color: '#0369A1', // Electric Blue
      text_color: '#BAE6FD',
      rarity: 'RARE',
      weight: 35,
      sort_order: 12,
    },
    {
      nameKey: 'กล้องสตรีม 4K Pro Streaming Webcam',
      label: 'กล้องสตรีม 4K Pro',
      subtitle: 'Streaming Webcam 4K',
      icon_url: '/images/rewards/webcam.png',
      color: '#0369A1',
      text_color: '#BAE6FD',
      rarity: 'RARE',
      weight: 32,
      sort_order: 13,
    },
    {
      nameKey: 'Ultralight Wireless Gaming Mouse',
      label: 'เมาส์เกมมิ่ง Ultralight',
      subtitle: 'Wireless Gaming Mouse',
      icon_url: '/images/rewards/mouse.png',
      color: '#0369A1',
      text_color: '#BAE6FD',
      rarity: 'RARE',
      weight: 40,
      sort_order: 14,
    },
    {
      nameKey: 'CyberBass TWS Gaming Earbuds',
      label: 'หูฟัง TWS CyberBass',
      subtitle: 'Wireless Gaming Earbuds',
      icon_url: '/images/rewards/earbuds.png',
      color: '#0369A1',
      text_color: '#BAE6FD',
      rarity: 'RARE',
      weight: 45,
      sort_order: 15,
    },
    {
      nameKey: 'ลำโพงซาวด์บาร์ Hi-Res Gaming Soundbar',
      label: 'ลำโพงซาวด์บาร์ Hi-Res',
      subtitle: 'Gaming Soundbar RGB',
      icon_url: '/images/rewards/speaker.png',
      color: '#0369A1',
      text_color: '#BAE6FD',
      rarity: 'RARE',
      weight: 38,
      sort_order: 16,
    },
    {
      nameKey: '500 Bonus Coins',
      label: '500 COINS',
      subtitle: 'เหรียญทองคุ้มค่า',
      icon_url: '/images/packages/tier3.jpg',
      color: '#C2410C', // Rich Orange
      text_color: '#FED7AA',
      rarity: 'RARE',
      weight: 50,
      sort_order: 17,
    },
    {
      nameKey: '50 Bonus Coins',
      label: 'เปิดการ์ดฟรีอีกครั้ง',
      subtitle: 'Free Card Respin',
      icon_url: '/images/tarot_card_back.jpg',
      color: '#047857', // Emerald Green
      text_color: '#A7F3D0',
      rarity: 'RARE',
      weight: 40,
      sort_order: 18,
    },
    {
      nameKey: 'AuraGlide XXL RGB Mousepad',
      label: 'แผ่นรองเมาส์ XXL RGB',
      subtitle: 'AuraGlide Gaming Mousepad',
      icon_url: '/images/rewards/mousepad.png',
      color: '#1E293B', // Dark Slate
      text_color: '#94A3B8',
      rarity: 'COMMON',
      weight: 70,
      sort_order: 19,
    },
    {
      nameKey: 'แท่นแขวนหูฟัง RGB Headset Stand',
      label: 'แท่นแขวนหูฟัง RGB',
      subtitle: 'RGB Headset Stand Hub',
      icon_url: '/images/rewards/stand.png',
      color: '#1E293B',
      text_color: '#94A3B8',
      rarity: 'COMMON',
      weight: 65,
      sort_order: 20,
    },
    {
      nameKey: 'เครื่องดื่ม Cyber Energy Elixir',
      label: 'Cyber Energy Elixir',
      subtitle: 'เครื่องดื่มเพิ่มพลังเกมเมอร์',
      icon_url: '/images/rewards/energy_drink.png',
      color: '#1E293B',
      text_color: '#94A3B8',
      rarity: 'COMMON',
      weight: 90,
      sort_order: 21,
    },
    {
      nameKey: 'บะหมี่รอบดึก Gamer Ramen Cup',
      label: 'มาม่ารอบดึก Gamer Ramen',
      subtitle: 'บะหมี่ถ้วยสู้ศึกยามดึก',
      icon_url: '/images/rewards/noodles.png',
      color: '#334155', // Slate
      text_color: '#CBD5E1',
      rarity: 'COMMON',
      weight: 100,
      sort_order: 22,
    },
    {
      nameKey: '100 Bonus Coins',
      label: '100 COINS',
      subtitle: 'โบนัสเครดิต',
      icon_url: '/images/packages/tier1.jpg',
      color: '#0369A1',
      text_color: '#BAE6FD',
      rarity: 'COMMON',
      weight: 80,
      sort_order: 23,
    },
    {
      nameKey: 'เกลือบริสุทธิ์ 100% (Pure Salt)',
      label: 'ลองใหม่อีกครั้ง',
      subtitle: 'เกลือบริสุทธิ์ 100%',
      icon_url: '/images/rewards/salt.png',
      color: '#1E293B',
      text_color: '#94A3B8',
      rarity: 'COMMON',
      weight: 120,
      sort_order: 24,
    },
  ];

  console.log('Truncating old wheel_items...');
  await query(`TRUNCATE TABLE wheel_items`);

  console.log(`Inserting ${cardItems.length} modern 3D Tarot Card items...`);
  for (const it of cardItems) {
    const rw = rMap[it.nameKey];
    const rewardId = rw ? rw.id : fallbackId;
    await query(
      `INSERT INTO wheel_items (reward_id, label, subtitle, icon_url, color, text_color, rarity, weight, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [rewardId, it.label, it.subtitle, it.icon_url, it.color, it.text_color, it.rarity, it.weight, it.sort_order]
    );
  }

  console.log('Successfully synced wheel_items pool with 24 gaming card prizes!');
}

syncWheelPool()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Failed to sync wheel pool:', err);
    process.exit(1);
  });
