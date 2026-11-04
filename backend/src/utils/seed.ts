import bcrypt from 'bcryptjs';
import { initDatabaseConnection, query } from '../config/db';
import { runMigrations } from './dbMigrate';

export async function runSeeder() {
  console.log('--- Starting Database Seeder ---');
  await initDatabaseConnection();
  await runMigrations();

  // 1. Settings
  const settings = [
    { key: 'game_title', val: 'AETHERIA: CHRONICLES OF VALOR', desc: 'Game Title' },
    { key: 'game_subtitle', val: 'The Ultimate High-Fantasy Tactical Action RPG', desc: 'Game Subtitle' },
    { key: 'game_logo', val: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80', desc: 'Logo URL' },
    { key: 'currency_symbol', val: '฿', desc: 'Currency Symbol' },
    { key: 'primary_color', val: '#6366F1', desc: 'Theme Accent Color' },
    { key: 'hero_badge', val: 'OFFICIAL AUTHORIZED TOP-UP PARTNER', desc: 'Hero Badge' },
    { key: 'hero_title', val: 'เติมเหรียญ Aetheria รวดเร็ว ปลอดภัย ได้รับทันที', desc: 'Hero Title' },
    { key: 'hero_description', val: 'ระบบเติมเงินอัตโนมัติ 24 ชม. ส่งตรงเข้า UID ปลอดภัย 100% พร้อมโบนัสพิเศษและกล่องสุ่มลุ้นรับของรางวัลระดับ Mythic', desc: 'Hero Description' },
    { key: 'announcement_banner', val: '⚡ ฉลองเปิดเซิร์ฟเวอร์ใหม่! เติมเงินแพ็กเกจ 500 Coins ขึ้นไป รับฟรี โบนัสเหรียญ +20% วันนี้', desc: 'Announcement' },
    { key: 'contact_support', val: '@AetheriaTopup', desc: 'Support ID' },
    // Game System Master Controls
    { key: 'game_mystery_box_enabled', val: 'true', desc: 'เปิด/ปิด ระบบกล่องสุ่มหน้าบ้าน' },
    { key: 'game_mystery_box_title', val: 'กล่องสุ่มสมบัติ (Mystery Boxes)', desc: 'ชื่อหน้าบ้านระบบกล่องสุ่ม' },
    { key: 'game_mystery_box_subtitle', val: 'กล่องสุ่มไอเทมและรางวัลใหญ่ ลุ้นรับของแรร์ทันที', desc: 'คำอธิบายระบบกล่องสุ่ม' },
    { key: 'game_mystery_box_notice', val: '⚡ การันตีไอเทมคุ้มค่าทุกกล่อง ลุ้นรับ Gaming Gear ระดับ Mythic!', desc: 'ข้อความประกาศหน้ากล่องสุ่ม' },
    { key: 'game_gacha_enabled', val: 'true', desc: 'เปิด/ปิด ระบบวงล้อกาชาหน้าบ้าน' },
    { key: 'game_gacha_title', val: 'วงล้อกาชา (Gacha Vault)', desc: 'ชื่อหน้าบ้านระบบกาชา' },
    { key: 'game_gacha_subtitle', val: 'ตู้สุ่มรูเล็ตต์รวมรางวัลพิเศษ ลุ้นรับไอเทมแรร์ระดับตำนาน', desc: 'คำอธิบายระบบกาชา' },
    { key: 'game_gacha_cost', val: '29', desc: 'ราคาหมุนกาชาต่อรอบ (Coins)' },
    { key: 'game_gacha_free_spins', val: '1', desc: 'สิทธิ์หมุนกาชาฟรีต่อวัน' },
    { key: 'game_gacha_notice', val: '👑 ล็อกอินทุกวันรับสิทธิ์หมุนฟรี 1 ครั้ง ลุ้นเครดิตและไอเทมแรร์!', desc: 'ข้อความประกาศหน้ากาชา' },
    { key: 'game_wheel_enabled', val: 'true', desc: 'เปิด/ปิด ระบบเปิดการ์ดเสี่ยงโชคหน้าบ้าน' },
    { key: 'game_wheel_title', val: 'เปิดการ์ด 3D เสี่ยงโชค (Lucky Tarot)', desc: 'ชื่อหน้าบ้านระบบการ์ด 3D' },
    { key: 'game_wheel_subtitle', val: 'เลือกไพ่ทาโรต์นำโชค 4 ใบ ลุ้นรับ Gaming Gear และ Coins', desc: 'คำอธิบายระบบการ์ด 3D' },
    { key: 'game_wheel_cost', val: '20', desc: 'ราคาเปิดไพ่ต่อรอบ (Coins)' },
    { key: 'game_wheel_free_spins', val: '1', desc: 'สิทธิ์เปิดไพ่ฟรีต่อวัน' },
    { key: 'game_wheel_notice', val: '🔮 สิทธิ์เปิดการ์ดฟรีวันละ 1 ครั้ง! สับไพ่เสี่ยงทายลุ้นรางวัลใหญ่', desc: 'ข้อความประกาศหน้าการ์ด 3D' },
    { key: 'game_maintenance_notice', val: 'ระบบเกมนี้กำลังปิดปรับปรุงชั่วคราวเพื่ออัปเดตของรางวัลใหม่ ขออภัยในความไม่สะดวก', desc: 'ข้อความแจ้งเตือนเมื่อปิดปรับปรุงเกม' },
    { key: 'game_sound_enabled', val: 'true', desc: 'เปิดเสียงเอฟเฟกต์ในเกมเป็นค่าเริ่มต้น' },
  ];

  for (const s of settings) {
    await query(
      `INSERT INTO settings (key_name, value, description)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE value = VALUES(value), description = VALUES(description)`,
      [s.key, s.val, s.desc]
    );
  }

  // 2. Roles
  const roles = [
    { name: 'super_admin', desc: 'Super Administrator with full access' },
    { name: 'admin', desc: 'Administrator with content & order management access' },
    { name: 'staff', desc: 'Staff with order processing and support access' },
  ];

  for (const r of roles) {
    await query(
      `INSERT INTO roles (name, description) VALUES (?, ?) ON DUPLICATE KEY UPDATE description = VALUES(description)`,
      [r.name, r.desc]
    );
  }

  // 3. Permissions
  const permissions = [
    { code: 'dashboard.view', name: 'ดู Dashboard', category: 'Analytics' },
    { code: 'packages.manage', name: 'จัดการแพ็กเกจ', category: 'Packages' },
    { code: 'boxes.manage', name: 'จัดการกล่องสุ่ม', category: 'Mystery Boxes' },
    { code: 'rewards.manage', name: 'จัดการของรางวัล', category: 'Rewards' },
    { code: 'promotions.manage', name: 'จัดการโปรโมชั่น', category: 'Promotions' },
    { code: 'orders.manage', name: 'จัดการคำสั่งซื้อ', category: 'Orders' },
    { code: 'users.manage', name: 'จัดการสมาชิก & เครดิต', category: 'Users' },
    { code: 'admins.manage', name: 'จัดการผู้ดูแลระบบ', category: 'Admins' },
    { code: 'settings.manage', name: 'ตั้งค่าเว็บไซต์', category: 'Settings' },
  ];

  for (const p of permissions) {
    await query(
      `INSERT INTO permissions (code, name, category) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      [p.code, p.name, p.category]
    );
  }

  // Assign all permissions to super_admin
  const [superAdminRole]: any = await query(`SELECT id FROM roles WHERE name = 'super_admin' LIMIT 1`);
  const allPerms: any = await query(`SELECT id FROM permissions`);
  if (superAdminRole && allPerms.length > 0) {
    for (const p of allPerms) {
      await query(
        `INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)`,
        [superAdminRole.id, p.id]
      );
    }
  }

  // 4. Default Admin (admin / Admin@123456)
  const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
  await query(
    `INSERT INTO admins (username, email, password_hash, role_id, full_name, is_active)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role_id = VALUES(role_id)`,
    ['admin', 'admin@gameplatform.local', adminPasswordHash, superAdminRole?.id || 1, 'System Director', true]
  );

  // 5. Default User (player1 / User@123456)
  const userPasswordHash = await bcrypt.hash('User@123456', 10);
  await query(
    `INSERT INTO users (username, email, password_hash, player_id, is_active)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
    ['player1', 'player1@aetheria.local', userPasswordHash, 'UID-992812', true]
  );

  const [defaultUser]: any = await query(`SELECT id FROM users WHERE username = 'player1' LIMIT 1`);
  if (defaultUser) {
    // Ensure wallet exists with 500 initial credits for testing
    await query(
      `INSERT INTO wallets (user_id, balance) VALUES (?, 500.00)
       ON DUPLICATE KEY UPDATE balance = balance`,
      [defaultUser.id]
    );
    const [wallet]: any = await query(`SELECT id, balance FROM wallets WHERE user_id = ?`, [defaultUser.id]);
    const [existingTx]: any = await query(`SELECT id FROM wallet_transactions WHERE user_id = ? LIMIT 1`, [defaultUser.id]);
    if (!existingTx) {
      await query(
        `INSERT INTO wallet_transactions (wallet_id, user_id, type, amount, balance_after, reference_type, description)
         VALUES (?, ?, 'TOPUP', 500.00, 500.00, 'SYSTEM_INIT', 'Welcome Free Credits')`,
        [wallet.id, defaultUser.id]
      );
    }
  }

  // 6. Top-up Packages
  const packages = [
    {
      name: '100 Coins',
      coins: 100,
      price: 29.00,
      bonus_coins: 0,
      image_url: '/images/packages/tier1.jpg',
      badge: 'Starter',
      is_popular: false,
      sort_order: 1
    },
    {
      name: '300 Coins',
      coins: 300,
      price: 79.00,
      bonus_coins: 30,
      image_url: '/images/packages/tier2.jpg',
      badge: '+10% Bonus',
      is_popular: false,
      sort_order: 2
    },
    {
      name: '500 Coins',
      coins: 500,
      price: 129.00,
      bonus_coins: 60,
      image_url: '/images/packages/tier3.jpg',
      badge: 'POPULAR',
      is_popular: true,
      sort_order: 3
    },
    {
      name: '1,000 Coins',
      coins: 1000,
      price: 249.00,
      bonus_coins: 150,
      image_url: '/images/packages/tier4.jpg',
      badge: '+15% Bonus',
      is_popular: false,
      sort_order: 4
    },
    {
      name: '2,500 Coins',
      coins: 2500,
      price: 599.00,
      bonus_coins: 450,
      image_url: '/images/packages/tier5.jpg',
      badge: 'HOT DEAL',
      is_popular: false,
      sort_order: 5
    },
    {
      name: '5,000 Coins',
      coins: 5000,
      price: 1190.00,
      bonus_coins: 1000,
      image_url: '/images/packages/tier6.jpg',
      badge: 'BEST VALUE',
      is_popular: false,
      sort_order: 6
    }
  ];

  const existingPkgs: any = await query(`SELECT COUNT(*) as count FROM packages`);
  if (existingPkgs[0].count === 0) {
    for (const pkg of packages) {
      await query(
        `INSERT INTO packages (name, coins, price, bonus_coins, image_url, badge, is_popular, is_active, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, true, ?)`,
        [pkg.name, pkg.coins, pkg.price, pkg.bonus_coins, pkg.image_url, pkg.badge, pkg.is_popular, pkg.sort_order]
      );
    }
  }

  // 7. Rewards
  const rewards = [
    {
      name: '50 Bonus Coins',
      description: '50 เหรียญสำหรับใช้จ่ายในเกม',
      image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      type: 'CREDIT',
      value: '50',
      rarity: 'COMMON',
      stock: -1
    },
    {
      name: 'EXP Boost Potion x3',
      description: 'น้ำยาเร่ง EXP 200% นาน 3 ชั่วโมง',
      image_url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=200&auto=format&fit=crop&q=80',
      type: 'ITEM',
      value: 'ITEM-EXP-POTION-03',
      rarity: 'COMMON',
      stock: -1
    },
    {
      name: 'Energy Pack (500 AP)',
      description: 'เติมพลังงานสำหรับลงดันเจี้ยน 500 แต้ม',
      image_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200&auto=format&fit=crop&q=80',
      type: 'ITEM',
      value: 'ITEM-ENERGY-500',
      rarity: 'COMMON',
      stock: -1
    },
    {
      name: '250 Bonus Coins',
      description: '250 เหรียญส่งตรงเข้าบัญชีเกม',
      image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      type: 'CREDIT',
      value: '250',
      rarity: 'RARE',
      stock: -1
    },
    {
      name: 'Silver Knight Avatar Frame',
      description: 'กรอบโปรไฟล์อัศวินสีเงินแบบลิมิเต็ด',
      image_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=200&auto=format&fit=crop&q=80',
      type: 'ITEM',
      value: 'CODE-FRAME-SILVER-KNT',
      rarity: 'RARE',
      stock: 500
    },
    {
      name: 'Summon Ticket x5',
      description: 'ตั๋วสุ่มตัวละครระดับ SSR จำนวน 5 ใบ',
      image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&auto=format&fit=crop&q=80',
      type: 'CODE',
      value: 'VALOR-TICKET-SSR5',
      rarity: 'RARE',
      stock: 300
    },
    {
      name: '800 Bonus Coins',
      description: '800 เหรียญก้อนโตเข้ากระเป๋าทันที',
      image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      type: 'CREDIT',
      value: '800',
      rarity: 'EPIC',
      stock: -1
    },
    {
      name: 'Weapon Skin: Radiant Edge',
      description: 'สกินดาบแสงแห่งเกียรติยศ เอฟเฟกต์สีทองอร่าม',
      image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80',
      type: 'CODE',
      value: 'SKIN-RAD-EDGE-8899',
      rarity: 'EPIC',
      stock: 100
    },
    {
      name: 'Obsidian Wings Glider Code',
      description: 'ปีกร่อนเวหาออบซิเดียนสีดำทมิฬหายากพิเศษ',
      image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200&auto=format&fit=crop&q=80',
      type: 'CODE',
      value: 'WINGS-OBSID-9921',
      rarity: 'EPIC',
      stock: 50
    },
    {
      name: '3,000 Coins Grand Prize',
      description: 'รางวัลใหญ่ 3,000 Coins มูลค่ากว่า 700 บาท',
      image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      type: 'CREDIT',
      value: '3000',
      rarity: 'LEGENDARY',
      stock: 20
    },
    {
      name: 'Mythic Dragon Mount Code',
      description: 'พาหนะมังกรศักดิ์สิทธิ์ Aether Dragon Mount (Mythic Grade)',
      image_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80',
      type: 'CODE',
      value: 'MOUNT-AETHER-DRAGON-01',
      rarity: 'LEGENDARY',
      stock: 10
    }
  ];

  const existingRewards: any = await query(`SELECT COUNT(*) as count FROM rewards`);
  if (existingRewards[0].count === 0) {
    for (const rw of rewards) {
      await query(
        `INSERT INTO rewards (name, description, image_url, type, value, rarity, stock, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, true)`,
        [rw.name, rw.description, rw.image_url, rw.type, rw.value, rw.rarity, rw.stock]
      );
    }
  }

  // 8. Mystery Boxes
  const boxes = [
    {
      name: 'Bronze Chest',
      description: 'กล่องทองแดงเริ่มต้น ลุ้นรับเหรียญโบนัสและไอเทมช่วยเล่น',
      price: 29.00,
      image_url: '/images/boxes/bronze.jpg',
      color_theme: 'bronze',
      badge: 'STARTER',
      sort_order: 1
    },
    {
      name: 'Silver Sentinel Box',
      description: 'กล่องพิทักษ์สีเงิน การันตีรางวัลคุ้มค่า ลุ้นตั๋วสุ่ม SSR',
      price: 59.00,
      image_url: '/images/boxes/silver.jpg',
      color_theme: 'silver',
      badge: 'RECOMMENDED',
      sort_order: 2
    },
    {
      name: 'Gold Dragon Vault',
      description: 'คลังสมบัติมังกรทอง โอกาสได้รับสกินดาบ Radiant Edge และเหรียญ 800 Coins สูง',
      price: 99.00,
      image_url: '/images/boxes/gold.jpg',
      color_theme: 'gold',
      badge: 'HIGH WIN RATE',
      sort_order: 3
    },
    {
      name: 'Cyber Mythic Matrix',
      description: 'กล่องลับระดับ Mythic ลุ้นรับพาหนะมังกรศักดิ์สิทธิ์ และ 3,000 Coins Grand Prize',
      price: 199.00,
      image_url: '/images/boxes/mythic.jpg',
      color_theme: 'mythic',
      badge: 'MYTHIC GRADE',
      sort_order: 4
    }
  ];

  const existingBoxes: any = await query(`SELECT COUNT(*) as count FROM mystery_boxes`);
  if (existingBoxes[0].count === 0) {
    for (const box of boxes) {
      await query(
        `INSERT INTO mystery_boxes (name, description, price, image_url, color_theme, badge, is_active, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, true, ?)`,
        [box.name, box.description, box.price, box.image_url, box.color_theme, box.badge, box.sort_order]
      );
    }
  }

  // 9. Map Mystery Box to Rewards with Weights
  const existingBoxRewards: any = await query(`SELECT COUNT(*) as count FROM mystery_box_rewards`);
  if (existingBoxRewards[0].count === 0) {
    const dbBoxes: any = await query(`SELECT id, name FROM mystery_boxes`);
    const dbRewards: any = await query(`SELECT id, name, rarity FROM rewards`);

    const rewardMap: Record<string, number> = {};
    for (const r of dbRewards) {
      rewardMap[r.name] = r.id;
    }

    for (const b of dbBoxes) {
      if (b.name === 'Bronze Chest') {
        await query(`INSERT INTO mystery_box_rewards (box_id, reward_id, weight) VALUES
          (?, ?, 50),
          (?, ?, 35),
          (?, ?, 15)`,
          [b.id, rewardMap['50 Bonus Coins'], b.id, rewardMap['EXP Boost Potion x3'], b.id, rewardMap['250 Bonus Coins']]
        );
      } else if (b.name === 'Silver Sentinel Box') {
        await query(`INSERT INTO mystery_box_rewards (box_id, reward_id, weight) VALUES
          (?, ?, 40),
          (?, ?, 30),
          (?, ?, 20),
          (?, ?, 10)`,
          [b.id, rewardMap['EXP Boost Potion x3'], b.id, rewardMap['250 Bonus Coins'], b.id, rewardMap['Silver Knight Avatar Frame'], b.id, rewardMap['Summon Ticket x5']]
        );
      } else if (b.name === 'Gold Dragon Vault') {
        await query(`INSERT INTO mystery_box_rewards (box_id, reward_id, weight) VALUES
          (?, ?, 30),
          (?, ?, 30),
          (?, ?, 25),
          (?, ?, 10),
          (?, ?, 5)`,
          [b.id, rewardMap['250 Bonus Coins'], b.id, rewardMap['Summon Ticket x5'], b.id, rewardMap['800 Bonus Coins'], b.id, rewardMap['Weapon Skin: Radiant Edge'], b.id, rewardMap['3,000 Coins Grand Prize']]
        );
      } else if (b.name === 'Cyber Mythic Matrix') {
        await query(`INSERT INTO mystery_box_rewards (box_id, reward_id, weight) VALUES
          (?, ?, 35),
          (?, ?, 30),
          (?, ?, 20),
          (?, ?, 10),
          (?, ?, 5)`,
          [b.id, rewardMap['800 Bonus Coins'], b.id, rewardMap['Weapon Skin: Radiant Edge'], b.id, rewardMap['Obsidian Wings Glider Code'], b.id, rewardMap['3,000 Coins Grand Prize'], b.id, rewardMap['Mythic Dragon Mount Code']]
        );
      }
    }
  }

  // 10. Promotions & Coupons
  const promotions = [
    {
      title: 'First Top-up Extra 20% Bonus',
      subtitle: 'เติมเงินครั้งแรกรับเหรียญเพิ่มทันที 20% ทุกแพ็กเกจ',
      banner_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
      promo_type: 'BONUS',
      bonus_percent: 20,
      discount_percent: 0,
      min_spend: 100,
      code: 'FIRST20'
    },
    {
      title: 'Weekend Flash Sale 10% OFF',
      subtitle: 'สุดสัปดาห์ลดพิเศษ 10% สำหรับแพ็กเกจ 1,000 Coins ขึ้นไป',
      banner_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
      promo_type: 'DISCOUNT',
      bonus_percent: 0,
      discount_percent: 10,
      min_spend: 249,
      code: 'FLASH10'
    }
  ];

  const existingPromos: any = await query(`SELECT COUNT(*) as count FROM promotions`);
  if (existingPromos[0].count === 0) {
    for (const p of promotions) {
      await query(
        `INSERT INTO promotions (title, subtitle, banner_url, promo_type, bonus_percent, discount_percent, min_spend, code, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, true)`,
        [p.title, p.subtitle, p.banner_url, p.promo_type, p.bonus_percent, p.discount_percent, p.min_spend, p.code]
      );
    }
  }

  // Coupon
  await query(
    `INSERT INTO coupons (code, discount_amount, discount_percent, min_spend, max_uses, current_uses, is_active)
     VALUES ('VALOR10', 0, 10, 100, 500, 0, true)
     ON DUPLICATE KEY UPDATE discount_percent = 10`
  );

  // 11. Gacha Items (for horizontal roulette reel)
  const existingGacha: any = await query(`SELECT COUNT(*) as count FROM gacha_items`);
  if (existingGacha[0].count === 0) {
    const dbRewards: any = await query(`SELECT id, name FROM rewards`);
    const rwMap: Record<string, number> = {};
    for (const r of dbRewards) rwMap[r.name] = r.id;

    const gachaList = [
      {
        reward_id: rwMap['3,000 Coins Grand Prize'] || 1,
        title: 'คูปองส่วนลดพัฒนาโปรเจกต์ 10%',
        subtitle: 'ส่วนลดสูงสุดสำหรับโปรเจกต์ของคุณ',
        category: 'ส่วนลดพิเศษ',
        value_text: 'มูลค่า ฿5,000 ฟรี',
        image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80',
        rarity: 'LEGENDARY',
        weight: 5,
        sort_order: 1
      },
      {
        reward_id: rwMap['Mythic Dragon Mount Code'] || 2,
        title: 'ระบบเร่งสปีดเว็บ & Cloudflare Speed',
        subtitle: 'เพิ่มประสิทธิภาพความเร็วในการโหลด 300%',
        category: 'ความเร็วเว็บ',
        value_text: 'มูลค่า ฿3,000 ฟรี',
        image_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80',
        rarity: 'LEGENDARY',
        weight: 8,
        sort_order: 2
      },
      {
        reward_id: rwMap['Weapon Skin: Radiant Edge'] || 3,
        title: 'แพ็กเกจดูแลเซิร์ฟเวอร์ & ประกัน 3 เดือน',
        subtitle: 'บริการมอนิเตอร์และดูแลความปลอดภัย',
        category: 'บริการดูแล',
        value_text: 'มูลค่า ฿1,500 ฟรี',
        image_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=200&auto=format&fit=crop&q=80',
        rarity: 'EPIC',
        weight: 15,
        sort_order: 3
      },
      {
        reward_id: rwMap['800 Bonus Coins'] || 4,
        title: 'ระบบ PromptPay QR อัตโนมัติ',
        subtitle: 'ตัดยอดเงินและรับการแจ้งเตือนทันที',
        category: 'ระบบการเงิน',
        value_text: 'มูลค่า ฿1,500 ฟรี',
        image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200&auto=format&fit=crop&q=80',
        rarity: 'EPIC',
        weight: 15,
        sort_order: 4
      },
      {
        reward_id: rwMap['Silver Knight Avatar Frame'] || 5,
        title: 'ฟรีโดเมน .COM & Cloudflare SSL 1 ปี',
        subtitle: 'พร้อมการติดตั้งและปกป้อง DDoS',
        category: 'ความปลอดภัย',
        value_text: 'มูลค่า ฿500 ฟรี',
        image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
        rarity: 'RARE',
        weight: 25,
        sort_order: 5
      },
      {
        reward_id: rwMap['Summon Ticket x5'] || 6,
        title: 'ตั๋วสุ่มพรีเมียม SSR Ticket x5',
        subtitle: 'ใช้สุ่มหาตัวละครระดับสูงในเกม',
        category: 'รางวัลพิเศษ',
        value_text: 'มูลค่า ฿300 ฟรี',
        image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&auto=format&fit=crop&q=80',
        rarity: 'RARE',
        weight: 30,
        sort_order: 6
      },
      {
        reward_id: rwMap['EXP Boost Potion x3'] || 7,
        title: 'EXP Boost Potion x3 (เพิ่ม EXP 200%)',
        subtitle: 'น้ำยาเร่งเลเวลรวดเร็ว 3 ชั่วโมง',
        category: 'ไอเทมช่วยเหลือ',
        value_text: 'มูลค่า ฿100 ฟรี',
        image_url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=200&auto=format&fit=crop&q=80',
        rarity: 'COMMON',
        weight: 45,
        sort_order: 7
      },
      {
        reward_id: rwMap['50 Bonus Coins'] || 8,
        title: '50 Coins เติมเข้ากระเป๋าอัตโนมัติ',
        subtitle: 'เหรียญเครดิตใช้งานได้ทันที',
        category: 'เครดิตเกม',
        value_text: 'มูลค่า ฿50 ฟรี',
        image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
        rarity: 'COMMON',
        weight: 50,
        sort_order: 8
      }
    ];

    for (const g of gachaList) {
      await query(
        `INSERT INTO gacha_items (reward_id, title, subtitle, category, value_text, image_url, rarity, weight, is_active, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        [g.reward_id, g.title, g.subtitle, g.category, g.value_text, g.image_url, g.rarity, g.weight, g.sort_order]
      );
    }
  }

  console.log('--- Database Seeder Completed Successfully ---');
}

if (require.main === module) {
  runSeeder()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeder failed:', err);
      process.exit(1);
    });
}
