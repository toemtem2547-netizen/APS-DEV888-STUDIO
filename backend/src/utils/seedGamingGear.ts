import { initDatabaseConnection, query } from '../config/db';

async function seedGamingGear() {
  await initDatabaseConnection();

  console.log('--- Seeding 20+ Unique Gaming Gear Products & Battlestation Rewards ---');

  // 1. Clear old rewards & mapping
  await query(`DELETE FROM gacha_spins`);
  await query(`DELETE FROM gacha_items`);
  await query(`DELETE FROM mystery_box_rewards`);
  await query(`DELETE FROM rewards`);

  // 2. Insert diverse, non-repeating Gaming Gear & Accessories rewards
  const gamingGearRewards = [
    // COMMON
    {
      name: 'เกลือบริสุทธิ์ 100% (Pure Salt)',
      description: 'ดวงซวยสุดๆ! สุ่มได้เกลือเวทมนตร์รสชาติเค็มจับใจ ปลอบใจไว้ใส่ต้มยำ พักล้างหน้าแล้วลุ้นใหม่นะ!',
      image_url: '/images/rewards/salt.png',
      type: 'ITEM',
      value: 'SALT-EXTRA-SALTY',
      rarity: 'COMMON',
      stock: -1
    },
    {
      name: 'บะหมี่รอบดึก Gamer Ramen Cup',
      description: 'บะหมี่กึ่งสำเร็จรูปรสเผ็ดร้อน เติมพลังรอบดึกสำหรับเกมเมอร์สายอดนอน',
      image_url: '/images/rewards/noodles.png',
      type: 'ITEM',
      value: 'FOOD-RAMEN-MIDNIGHT',
      rarity: 'COMMON',
      stock: 1000
    },
    {
      name: 'เครื่องดื่ม Cyber Energy Elixir',
      description: 'เครื่องดื่มชูกำลัง E-Sport สกัดจากโสมและวิตามิน ปลุกสมาธิและความเร็วในการตอบสนอง',
      image_url: '/images/rewards/energy_drink.png',
      type: 'ITEM',
      value: 'DRINK-ENERGY-ELIXIR',
      rarity: 'COMMON',
      stock: 800
    },
    {
      name: 'แท่นแขวนหูฟัง RGB Headset Stand',
      description: 'แท่นวางหูฟังอะลูมิเนียมขอบไฟ RGB 16.8 ล้านสี พร้อมช่องต่อ USB Hub 3.0',
      image_url: '/images/rewards/stand.png',
      type: 'ITEM',
      value: 'GEAR-STAND-RGB-HUB',
      rarity: 'COMMON',
      stock: 500
    },
    {
      name: 'AuraGlide XXL RGB Mousepad',
      description: 'แผ่นรองเมาส์เกมมิ่งไซส์ยักษ์ 900x400mm ลาย Cybernetica ขอบไฟนีออน RGB',
      image_url: '/images/rewards/mousepad.png',
      type: 'ITEM',
      value: 'GEAR-PAD-XXL-RGB',
      rarity: 'COMMON',
      stock: 500
    },
    {
      name: '50 Bonus Coins',
      description: '50 เหรียญโบนัสปลอบใจ เข้ากระเป๋าทันที',
      image_url: '/images/packages/tier1.jpg',
      type: 'CREDIT',
      value: '50',
      rarity: 'COMMON',
      stock: -1
    },
    {
      name: '100 Bonus Coins',
      description: '100 เหรียญโบนัสสำหรับใช้จ่ายในระบบ',
      image_url: '/images/packages/tier1.jpg',
      type: 'CREDIT',
      value: '100',
      rarity: 'COMMON',
      stock: -1
    },
    {
      name: '250 Bonus Coins',
      description: '250 เหรียญโบนัสสุดคุ้มเข้ากระเป๋าทันที',
      image_url: '/images/packages/tier2.jpg',
      type: 'CREDIT',
      value: '250',
      rarity: 'COMMON',
      stock: -1
    },

    // RARE
    {
      name: 'CyberBass TWS Gaming Earbuds',
      description: 'หูฟังเกมมิ่งบลูทูธ In-Ear ความหน่วงต่ำพิเศษ 45ms เบสแน่น กล่องชาร์จไฟนีออน',
      image_url: '/images/rewards/earbuds.png',
      type: 'ITEM',
      value: 'GEAR-EARBUDS-TWS',
      rarity: 'RARE',
      stock: 400
    },
    {
      name: 'Ultralight Wireless Gaming Mouse',
      description: 'เมาส์เกมมิ่งไร้สายน้ำหนักเบา เซนเซอร์ 26,000 DPI สวิตช์ Optical ตอบสนอง 0.2ms',
      image_url: '/images/rewards/mouse.png',
      type: 'ITEM',
      value: 'GEAR-MOUSE-ULTRALIGHT',
      rarity: 'RARE',
      stock: 250
    },
    {
      name: 'กล้องสตรีม 4K Pro Streaming Webcam',
      description: 'กล้องเว็บแคม 4K UHD 60FPS เลนส์มุมกว้าง ออโต้โฟกัส พร้อมไฟสตูดิโอในตัว',
      image_url: '/images/rewards/webcam.png',
      type: 'ITEM',
      value: 'GEAR-CAM-4K-PRO',
      rarity: 'RARE',
      stock: 200
    },
    {
      name: 'ลำโพงซาวด์บาร์ Hi-Res Gaming Soundbar',
      description: 'ลำโพงเกมมิ่งแถบยาว ซับวูฟเฟอร์เบสคู่ ระบบเสียง Hi-Res Surround ไฟ RGB สตรีมมิ่ง',
      image_url: '/images/rewards/speaker.png',
      type: 'ITEM',
      value: 'GEAR-SOUNDBAR-HIRES',
      rarity: 'RARE',
      stock: 180
    },
    {
      name: 'Elite Wireless Game Controller',
      description: 'จอยเกมส์โปรไร้สาย กริปยางกันลื่น ทริกเกอร์ปรับระดับ เซนเซอร์ Hall Effect',
      image_url: '/images/rewards/controller.png',
      type: 'ITEM',
      value: 'GEAR-CTRL-ELITE',
      rarity: 'RARE',
      stock: 200
    },
    {
      name: '500 Bonus Coins',
      description: '500 เหรียญเข้ากระเป๋าทันทีสุดคุ้ม',
      image_url: '/images/packages/tier3.jpg',
      type: 'CREDIT',
      value: '500',
      rarity: 'RARE',
      stock: -1
    },

    // EPIC
    {
      name: 'ไมโครโฟน Studio Condenser Mic',
      description: 'ไมโครโฟนคอนเดนเซอร์สตรีมเมอร์ พร้อมระบบตัดเสียงรบกวน AI และปุ่ม Mute ระบบสัมผัส',
      image_url: '/images/rewards/microphone.png',
      type: 'ITEM',
      value: 'GEAR-MIC-STUDIO-RGB',
      rarity: 'EPIC',
      stock: 120
    },
    {
      name: 'ROG Wireless RGB Gaming Headset',
      description: 'หูฟังเกมมิ่งไร้สาย 7.1 Spatial Audio ไมค์ตัดเสียงรบกวน AI แสงไฟ RGB',
      image_url: '/images/rewards/headset.png',
      type: 'ITEM',
      value: 'GEAR-HEADSET-ROG-71',
      rarity: 'EPIC',
      stock: 100
    },
    {
      name: 'Custom RGB Mechanical Keyboard',
      description: 'คีย์บอร์ดเกมมิ่ง Hot-swap แมคคานิคอล ไฟ RGB ใต้ปุ่ม คีย์แคป PBT พรีเมียม',
      image_url: '/images/rewards/keyboard.png',
      type: 'ITEM',
      value: 'GEAR-KB-CUSTOM-RGB',
      rarity: 'EPIC',
      stock: 120
    },
    {
      name: 'เก้าอี้ Ergonomic Cyber Gaming Chair',
      description: 'เก้าอี้เกมมิ่งตามหลักสรีรศาสตร์ เบาะเมมโมรี่โฟมระบายอากาศ ปรับเอนได้ 165 องศา',
      image_url: '/images/rewards/chair.png',
      type: 'ITEM',
      value: 'GEAR-CHAIR-ERGO-CYBER',
      rarity: 'EPIC',
      stock: 60
    },
    {
      name: 'แว่นตา VR Meta Gaming Headset',
      description: 'แว่น VR เกมมิ่งความละเอียด 4K มุมมองกว้าง 110° คอนโทรลเลอร์ตรวจจับสัมผัสไร้สาย',
      image_url: '/images/rewards/vr.png',
      type: 'ITEM',
      value: 'GEAR-VR-HEADSET-4K',
      rarity: 'EPIC',
      stock: 50
    },
    {
      name: '1,000 Coins Grand Prize',
      description: 'รางวัลใหญ่ 1,000 เหรียญก้อนโตเข้ากระเป๋าทันที',
      image_url: '/images/packages/tier4.jpg',
      type: 'CREDIT',
      value: '1000',
      rarity: 'EPIC',
      stock: -1
    },

    // LEGENDARY
    {
      name: 'จอคอมโค้ง 34" Curved OLED 240Hz',
      description: 'จอมอนิเตอร์เกมมิ่งจอโค้ง Ultrawide 34 นิ้ว แผง OLED อัตรารีเฟรช 240Hz 0.03ms',
      image_url: '/images/rewards/monitor.png',
      type: 'ITEM',
      value: 'GEAR-MONITOR-34-OLED',
      rarity: 'LEGENDARY',
      stock: 25
    },
    {
      name: 'BattleStation RGB Carbon Desk',
      description: 'โต๊ะคอมเกมมิ่ง Ergonomic ท็อปคาร์บอนไฟเบอร์ ไฟนีออน RGB ขาเหล็กกล้าแข็งแกร่ง',
      image_url: '/images/rewards/desk.png',
      type: 'ITEM',
      value: 'GEAR-DESK-CARBON-RGB',
      rarity: 'LEGENDARY',
      stock: 30
    },
    {
      name: 'การ์ดจอ GeForce RTX 4090 Gaming OC',
      description: 'กราฟิกการ์ดตัวท็อป 24GB GDDR6X สถาปัตยกรรม Ada Lovelace พร้อมพัดลมระบายความร้อน 3 ตอน',
      image_url: '/images/rewards/gpu.png',
      type: 'ITEM',
      value: 'GEAR-GPU-RTX4090-24G',
      rarity: 'LEGENDARY',
      stock: 15
    },
    {
      name: 'Liquid-Cooled Custom Gaming PC',
      description: 'เคสคอมพิวเตอร์เกมมิ่งทาวเวอร์ กระจก Tempered Glass พร้อมชุดน้ำระบบเปิดและพัดลม ARGB',
      image_url: '/images/rewards/pc_case.png',
      type: 'ITEM',
      value: 'GEAR-PC-RIG-LIQUID',
      rarity: 'LEGENDARY',
      stock: 20
    },
    {
      name: '3,000 Coins Mythic Jackpot',
      description: 'รางวัลแจ็กพอต 3,000 เหรียญ มูลค่าสูงสุดของแพลตฟอร์ม',
      image_url: '/images/packages/tier6.jpg',
      type: 'CREDIT',
      value: '3000',
      rarity: 'LEGENDARY',
      stock: 15
    }
  ];

  for (const item of gamingGearRewards) {
    await query(
      `INSERT INTO rewards (name, description, image_url, type, value, rarity, stock, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, true)`,
      [item.name, item.description, item.image_url, item.type, item.value, item.rarity, item.stock]
    );
  }

  // 3. Map to Mystery Boxes — 12 COMPLETELY UNIQUE, NON-REPEATING ITEMS PER BOX!
  const dbBoxes: any = await query(`SELECT id, name FROM mystery_boxes`);
  const dbRewards: any = await query(`SELECT id, name, rarity FROM rewards`);

  const rwMap: Record<string, number> = {};
  for (const r of dbRewards) {
    rwMap[r.name] = r.id;
  }

  for (const b of dbBoxes) {
    if (b.name.includes('Bronze')) {
      // Bronze Box (Starter ฿29)
      await query(`INSERT INTO mystery_box_rewards (box_id, reward_id, weight) VALUES
        (?, ?, 35),
        (?, ?, 25),
        (?, ?, 20),
        (?, ?, 16),
        (?, ?, 14),
        (?, ?, 10),
        (?, ?, 7),
        (?, ?, 4),
        (?, ?, 3),
        (?, ?, 2),
        (?, ?, 1),
        (?, ?, 1)`,
        [
          b.id, rwMap['เกลือบริสุทธิ์ 100% (Pure Salt)'],
          b.id, rwMap['บะหมี่รอบดึก Gamer Ramen Cup'],
          b.id, rwMap['เครื่องดื่ม Cyber Energy Elixir'],
          b.id, rwMap['แท่นแขวนหูฟัง RGB Headset Stand'],
          b.id, rwMap['AuraGlide XXL RGB Mousepad'],
          b.id, rwMap['CyberBass TWS Gaming Earbuds'],
          b.id, rwMap['Ultralight Wireless Gaming Mouse'],
          b.id, rwMap['กล้องสตรีม 4K Pro Streaming Webcam'],
          b.id, rwMap['Elite Wireless Game Controller'],
          b.id, rwMap['ROG Wireless RGB Gaming Headset'],
          b.id, rwMap['Custom RGB Mechanical Keyboard'],
          b.id, rwMap['Liquid-Cooled Custom Gaming PC']
        ]
      );
    } else if (b.name.includes('Silver')) {
      // Silver Box (Recommended ฿59)
      await query(`INSERT INTO mystery_box_rewards (box_id, reward_id, weight) VALUES
        (?, ?, 18),
        (?, ?, 20),
        (?, ?, 18),
        (?, ?, 16),
        (?, ?, 14),
        (?, ?, 12),
        (?, ?, 10),
        (?, ?, 8),
        (?, ?, 6),
        (?, ?, 4),
        (?, ?, 3),
        (?, ?, 2)`,
        [
          b.id, rwMap['เกลือบริสุทธิ์ 100% (Pure Salt)'],
          b.id, rwMap['แท่นแขวนหูฟัง RGB Headset Stand'],
          b.id, rwMap['AuraGlide XXL RGB Mousepad'],
          b.id, rwMap['CyberBass TWS Gaming Earbuds'],
          b.id, rwMap['Ultralight Wireless Gaming Mouse'],
          b.id, rwMap['กล้องสตรีม 4K Pro Streaming Webcam'],
          b.id, rwMap['ลำโพงซาวด์บาร์ Hi-Res Gaming Soundbar'],
          b.id, rwMap['ไมโครโฟน Studio Condenser Mic'],
          b.id, rwMap['Elite Wireless Game Controller'],
          b.id, rwMap['Custom RGB Mechanical Keyboard'],
          b.id, rwMap['เก้าอี้ Ergonomic Cyber Gaming Chair'],
          b.id, rwMap['แว่นตา VR Meta Gaming Headset']
        ]
      );
    } else if (b.name.includes('Gold')) {
      // Gold Dragon Vault (High Win Rate ฿99)
      await query(`INSERT INTO mystery_box_rewards (box_id, reward_id, weight) VALUES
        (?, ?, 8),
        (?, ?, 14),
        (?, ?, 14),
        (?, ?, 14),
        (?, ?, 12),
        (?, ?, 10),
        (?, ?, 10),
        (?, ?, 8),
        (?, ?, 6),
        (?, ?, 5),
        (?, ?, 4),
        (?, ?, 3)`,
        [
          b.id, rwMap['เกลือบริสุทธิ์ 100% (Pure Salt)'],
          b.id, rwMap['กล้องสตรีม 4K Pro Streaming Webcam'],
          b.id, rwMap['ลำโพงซาวด์บาร์ Hi-Res Gaming Soundbar'],
          b.id, rwMap['Elite Wireless Game Controller'],
          b.id, rwMap['ไมโครโฟน Studio Condenser Mic'],
          b.id, rwMap['ROG Wireless RGB Gaming Headset'],
          b.id, rwMap['Custom RGB Mechanical Keyboard'],
          b.id, rwMap['เก้าอี้ Ergonomic Cyber Gaming Chair'],
          b.id, rwMap['แว่นตา VR Meta Gaming Headset'],
          b.id, rwMap['BattleStation RGB Carbon Desk'],
          b.id, rwMap['จอคอมโค้ง 34" Curved OLED 240Hz'],
          b.id, rwMap['Liquid-Cooled Custom Gaming PC']
        ]
      );
    } else {
      // Cyber Mythic Matrix (Mythic Grade ฿199)
      await query(`INSERT INTO mystery_box_rewards (box_id, reward_id, weight) VALUES
        (?, ?, 2),
        (?, ?, 15),
        (?, ?, 15),
        (?, ?, 14),
        (?, ?, 12),
        (?, ?, 12),
        (?, ?, 10),
        (?, ?, 8),
        (?, ?, 6),
        (?, ?, 5),
        (?, ?, 3),
        (?, ?, 2)`,
        [
          b.id, rwMap['เกลือบริสุทธิ์ 100% (Pure Salt)'],
          b.id, rwMap['ไมโครโฟน Studio Condenser Mic'],
          b.id, rwMap['ROG Wireless RGB Gaming Headset'],
          b.id, rwMap['Custom RGB Mechanical Keyboard'],
          b.id, rwMap['เก้าอี้ Ergonomic Cyber Gaming Chair'],
          b.id, rwMap['แว่นตา VR Meta Gaming Headset'],
          b.id, rwMap['BattleStation RGB Carbon Desk'],
          b.id, rwMap['จอคอมโค้ง 34" Curved OLED 240Hz'],
          b.id, rwMap['การ์ดจอ GeForce RTX 4090 Gaming OC'],
          b.id, rwMap['Liquid-Cooled Custom Gaming PC'],
          b.id, rwMap['1,000 Coins Grand Prize'],
          b.id, rwMap['3,000 Coins Mythic Jackpot']
        ]
      );
    }
  }

  // 4. Seed Gacha Items (for Lucky Wheel / Roulette Reel)
  console.log('--- Seeding Gacha Items Pool for Lucky Reel ---');
  const gachaItemsSeed = [
    // LEGENDARY
    {
      rewardName: 'Liquid-Cooled Custom Gaming PC',
      title: 'Liquid-Cooled Custom Gaming PC',
      subtitle: 'เคสคอมเกมมิ่งสเปกเทพ พร้อมชุดน้ำระบบเปิด',
      category: 'คอมพิวเตอร์เกมมิ่ง',
      value_text: 'มูลค่า ฿85,000 ฟรี',
      image_url: '/images/rewards/pc_case.png',
      rarity: 'LEGENDARY',
      weight: 2,
      sort_order: 1
    },
    {
      rewardName: 'การ์ดจอ GeForce RTX 4090 Gaming OC',
      title: 'การ์ดจอ GeForce RTX 4090 Gaming OC',
      subtitle: 'การ์ดจอตัวท็อป 24GB GDDR6X เล่นเกม 4K ลื่นไหล',
      category: 'การ์ดจอระดับเทพ',
      value_text: 'มูลค่า ฿65,000 ฟรี',
      image_url: '/images/rewards/gpu.png',
      rarity: 'LEGENDARY',
      weight: 3,
      sort_order: 2
    },
    {
      rewardName: 'จอคอมโค้ง 34" Curved OLED 240Hz',
      title: 'จอคอมโค้ง 34" Curved OLED 240Hz',
      subtitle: 'จอมอนิเตอร์เกมมิ่ง Ultrawide OLED 0.03ms',
      category: 'จอมอนิเตอร์เกมมิ่ง',
      value_text: 'มูลค่า ฿35,000 ฟรี',
      image_url: '/images/rewards/monitor.png',
      rarity: 'LEGENDARY',
      weight: 4,
      sort_order: 3
    },
    {
      rewardName: '3,000 Coins Mythic Jackpot',
      title: '3,000 Coins Mythic Jackpot',
      subtitle: 'เหรียญเครดิตก้อนโต เติมเข้ากระเป๋าทันที',
      category: 'เครดิตโบนัส',
      value_text: '3,000 เหรียญฟรี',
      image_url: '/images/packages/tier6.jpg',
      rarity: 'LEGENDARY',
      weight: 5,
      sort_order: 4
    },

    // EPIC
    {
      rewardName: 'เก้าอี้ Ergonomic Cyber Gaming Chair',
      title: 'เก้าอี้ Ergonomic Cyber Gaming Chair',
      subtitle: 'เก้าอี้เกมมิ่งเมมโมรี่โฟม ปรับเอนได้ 165°',
      category: 'เก้าอี้เกมมิ่ง',
      value_text: 'มูลค่า ฿12,900 ฟรี',
      image_url: '/images/rewards/chair.png',
      rarity: 'EPIC',
      weight: 8,
      sort_order: 5
    },
    {
      rewardName: 'แว่นตา VR Meta Gaming Headset',
      title: 'แว่นตา VR Meta Gaming Headset',
      subtitle: 'แว่น VR 4K มุมมองกว้าง คอนโทรลเลอร์ไร้สาย',
      category: 'อุปกรณ์ VR',
      value_text: 'มูลค่า ฿18,500 ฟรี',
      image_url: '/images/rewards/vr.png',
      rarity: 'EPIC',
      weight: 8,
      sort_order: 6
    },
    {
      rewardName: 'Custom RGB Mechanical Keyboard',
      title: 'Custom RGB Mechanical Keyboard',
      subtitle: 'คีย์บอร์ด Hot-swap ไฟ RGB คีย์แคป PBT',
      category: 'คีย์บอร์ดเกมมิ่ง',
      value_text: 'มูลค่า ฿4,590 ฟรี',
      image_url: '/images/rewards/keyboard.png',
      rarity: 'EPIC',
      weight: 12,
      sort_order: 7
    },
    {
      rewardName: 'ROG Wireless RGB Gaming Headset',
      title: 'ROG Wireless RGB Gaming Headset',
      subtitle: 'หูฟังเกมมิ่ง 7.1 Spatial ไมค์ AI ตัดเสียง',
      category: 'หูฟังเกมมิ่ง',
      value_text: 'มูลค่า ฿5,990 ฟรี',
      image_url: '/images/rewards/headset.png',
      rarity: 'EPIC',
      weight: 12,
      sort_order: 8
    },
    {
      rewardName: 'ไมโครโฟน Studio Condenser Mic',
      title: 'ไมโครโฟน Studio Condenser Mic',
      subtitle: 'ไมค์สตรีมเมอร์ AI Noise-Cancelling',
      category: 'ไมโครโฟนสตรีม',
      value_text: 'มูลค่า ฿3,890 ฟรี',
      image_url: '/images/rewards/microphone.png',
      rarity: 'EPIC',
      weight: 14,
      sort_order: 9
    },
    {
      rewardName: '1,000 Coins Grand Prize',
      title: '1,000 Coins Grand Prize',
      subtitle: 'เหรียญโบนัสรางวัลใหญ่ เข้ากระเป๋าทันที',
      category: 'เครดิตโบนัส',
      value_text: '1,000 เหรียญฟรี',
      image_url: '/images/packages/tier4.jpg',
      rarity: 'EPIC',
      weight: 14,
      sort_order: 10
    },

    // RARE
    {
      rewardName: 'Elite Wireless Game Controller',
      title: 'Elite Wireless Game Controller',
      subtitle: 'จอยเกมส์โปรไร้สาย เซนเซอร์ Hall Effect',
      category: 'จอยเกมส์',
      value_text: 'มูลค่า ฿2,490 ฟรี',
      image_url: '/images/rewards/controller.png',
      rarity: 'RARE',
      weight: 22,
      sort_order: 11
    },
    {
      rewardName: 'กล้องสตรีม 4K Pro Streaming Webcam',
      title: 'กล้องสตรีม 4K Pro Streaming Webcam',
      subtitle: 'เว็บแคม 4K UHD 60FPS เลนส์มุมกว้าง',
      category: 'กล้องสตรีมเมอร์',
      value_text: 'มูลค่า ฿3,290 ฟรี',
      image_url: '/images/rewards/webcam.png',
      rarity: 'RARE',
      weight: 20,
      sort_order: 12
    },
    {
      rewardName: 'Ultralight Wireless Gaming Mouse',
      title: 'Ultralight Wireless Gaming Mouse',
      subtitle: 'เมาส์เกมมิ่งน้ำหนักเบา เซนเซอร์ 26K DPI',
      category: 'เมาส์เกมมิ่ง',
      value_text: 'มูลค่า ฿2,190 ฟรี',
      image_url: '/images/rewards/mouse.png',
      rarity: 'RARE',
      weight: 24,
      sort_order: 13
    },
    {
      rewardName: 'CyberBass TWS Gaming Earbuds',
      title: 'CyberBass TWS Gaming Earbuds',
      subtitle: 'หูฟังเกมมิ่ง TWS หน่วงต่ำ 45ms เบสแน่น',
      category: 'หูฟัง TWS',
      value_text: 'มูลค่า ฿1,890 ฟรี',
      image_url: '/images/rewards/earbuds.png',
      rarity: 'RARE',
      weight: 25,
      sort_order: 14
    },
    {
      rewardName: 'ลำโพงซาวด์บาร์ Hi-Res Gaming Soundbar',
      title: 'ลำโพงซาวด์บาร์ Hi-Res Gaming Soundbar',
      subtitle: 'ลำโพงซาวด์บาร์ Hi-Res ซับวูฟเฟอร์คู่',
      category: 'ลำโพงเกมมิ่ง',
      value_text: 'มูลค่า ฿2,790 ฟรี',
      image_url: '/images/rewards/speaker.png',
      rarity: 'RARE',
      weight: 24,
      sort_order: 15
    },
    {
      rewardName: '500 Bonus Coins',
      title: '500 Bonus Coins',
      subtitle: 'เหรียญโบนัส 500 เครดิตเข้ากระเป๋าทันที',
      category: 'เครดิตโบนัส',
      value_text: '500 เหรียญฟรี',
      image_url: '/images/packages/tier3.jpg',
      rarity: 'RARE',
      weight: 28,
      sort_order: 16
    },

    // COMMON
    {
      rewardName: 'AuraGlide XXL RGB Mousepad',
      title: 'AuraGlide XXL RGB Mousepad',
      subtitle: 'แผ่นรองเมาส์เกมมิ่ง 900x400mm ขอบไฟ RGB',
      category: 'แผ่นรองเมาส์',
      value_text: 'มูลค่า ฿890 ฟรี',
      image_url: '/images/rewards/mousepad.png',
      rarity: 'COMMON',
      weight: 45,
      sort_order: 17
    },
    {
      rewardName: 'แท่นแขวนหูฟัง RGB Headset Stand',
      title: 'แท่นแขวนหูฟัง RGB Headset Stand',
      subtitle: 'แท่นวางหูฟังขอบไฟ RGB และ USB Hub',
      category: 'แท่นวางหูฟัง',
      value_text: 'มูลค่า ฿690 ฟรี',
      image_url: '/images/rewards/stand.png',
      rarity: 'COMMON',
      weight: 50,
      sort_order: 18
    },
    {
      rewardName: 'เครื่องดื่ม Cyber Energy Elixir',
      title: 'เครื่องดื่ม Cyber Energy Elixir',
      subtitle: 'เครื่องดื่มชูกำลัง E-Sport ปลุกประสาทสัมผัส',
      category: 'เครื่องดื่มเกมเมอร์',
      value_text: 'มูลค่า ฿60 ฟรี',
      image_url: '/images/rewards/energy_drink.png',
      rarity: 'COMMON',
      weight: 55,
      sort_order: 19
    },
    {
      rewardName: 'บะหมี่รอบดึก Gamer Ramen Cup',
      title: 'บะหมี่รอบดึก Gamer Ramen Cup',
      subtitle: 'บะหมี่กึ่งสำเร็จรูปรสเผ็ดร้อน เติมพลังรอบดึก',
      category: 'อาหารรอบดึก',
      value_text: 'มูลค่า ฿45 ฟรี',
      image_url: '/images/rewards/noodles.png',
      rarity: 'COMMON',
      weight: 60,
      sort_order: 20
    },
    {
      rewardName: '100 Bonus Coins',
      title: '100 Bonus Coins',
      subtitle: '100 เหรียญโบนัสเข้ากระเป๋าทันที',
      category: 'เครดิตโบนัส',
      value_text: '100 เหรียญฟรี',
      image_url: '/images/packages/tier1.jpg',
      rarity: 'COMMON',
      weight: 65,
      sort_order: 21
    },
    {
      rewardName: 'เกลือบริสุทธิ์ 100% (Pure Salt)',
      title: 'เกลือบริสุทธิ์ 100% (Pure Salt)',
      subtitle: 'ดวงซวยสุดๆ สุ่มได้เกลือเวทมนตร์ ปลอบใจไว้ใส่ต้มยำนะ!',
      category: 'เกลือกาชา',
      value_text: 'SALT 100%',
      image_url: '/images/rewards/salt.png',
      rarity: 'COMMON',
      weight: 70,
      sort_order: 22
    },
  ];

  for (const gi of gachaItemsSeed) {
    const rewardId = rwMap[gi.rewardName];
    if (rewardId) {
      await query(
        `INSERT INTO gacha_items (reward_id, title, subtitle, category, value_text, image_url, rarity, weight, is_active, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        [rewardId, gi.title, gi.subtitle, gi.category, gi.value_text, gi.image_url, gi.rarity, gi.weight, gi.sort_order]
      );
    }
  }

  console.log('20+ Unique Gaming Gear Products, 12-Slot Mystery Boxes, and Gacha Items Pool seeded successfully!');
  process.exit(0);
}

seedGamingGear().catch((err) => {
  console.error('Failed to seed gaming gear:', err);
  process.exit(1);
});
