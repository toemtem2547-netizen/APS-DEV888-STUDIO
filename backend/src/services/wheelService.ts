import { query, getConnection } from '../config/db';
import { WalletService } from './walletService';

export interface WheelItemData {
  id: number;
  reward_id: number;
  label: string;
  subtitle: string;
  icon_url: string;
  color: string;
  text_color: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  weight: number;
  is_active: boolean;
  sort_order: number;
  reward_type?: string;
  reward_value?: string;
  probability_percent?: number;
}

export class WheelService {
  /**
   * Initialize tables and seed default 8 wheel items if empty
   */
  static async initTables() {
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS wheel_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          reward_id INT NOT NULL,
          label VARCHAR(255) NOT NULL,
          subtitle VARCHAR(255) DEFAULT '',
          icon_url TEXT,
          color VARCHAR(50) DEFAULT '#1E293B',
          text_color VARCHAR(50) DEFAULT '#FFFFFF',
          rarity ENUM('COMMON', 'RARE', 'EPIC', 'LEGENDARY') DEFAULT 'COMMON',
          weight INT NOT NULL DEFAULT 10,
          is_active BOOLEAN DEFAULT TRUE,
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await query(`
        CREATE TABLE IF NOT EXISTS wheel_spins (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          wheel_item_id INT NOT NULL,
          spin_cost DECIMAL(10, 2) DEFAULT 0.00,
          spin_type ENUM('COINS', 'FREE_DAILY', 'FREE_RESPIN') DEFAULT 'COINS',
          reward_code VARCHAR(255) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX (user_id),
          INDEX (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // Check if items already exist
      const existing: any = await query(`SELECT COUNT(*) as count FROM wheel_items`);
      if (existing && existing[0]?.count === 0) {
        console.log('Seeding default 24 Tarot Card items...');
        const rewards: any = await query(`SELECT id, name, rarity, image_url FROM rewards`);
        const rMap: Record<string, any> = {};
        for (const r of rewards) rMap[r.name] = r;
        const fallbackId = rewards[0]?.id || 1;

        const defaultCards = [
          { nameKey: 'Liquid-Cooled Custom Gaming PC', label: 'Liquid-Cooled Custom Gaming PC', subtitle: 'คอมพิวเตอร์เกมมิ่งสเปกเทพ', icon_url: '/images/rewards/pc_case.png', color: '#B45309', text_color: '#FDE68A', rarity: 'LEGENDARY', weight: 2, sort_order: 1 },
          { nameKey: 'การ์ดจอ GeForce RTX 4090 Gaming OC', label: 'GeForce RTX 4090 Gaming OC', subtitle: 'การ์ดจอตัวท็อประดับโลก', icon_url: '/images/rewards/gpu.png', color: '#B45309', text_color: '#FDE68A', rarity: 'LEGENDARY', weight: 3, sort_order: 2 },
          { nameKey: 'จอคอมโค้ง 34" Curved OLED 240Hz', label: 'จอโค้ง 34" OLED 240Hz', subtitle: 'จอมอนิเตอร์เกมมิ่งโค้ง', icon_url: '/images/rewards/monitor.png', color: '#B45309', text_color: '#FDE68A', rarity: 'LEGENDARY', weight: 5, sort_order: 3 },
          { nameKey: '3,000 Coins Mythic Jackpot', label: '3,000 COINS', subtitle: 'แจ็กพอตใหญ่ระดับ Mythic', icon_url: '/images/packages/tier6.jpg', color: '#B45309', text_color: '#FDE68A', rarity: 'LEGENDARY', weight: 8, sort_order: 4 },
          { nameKey: 'BattleStation RGB Carbon Desk', label: 'BattleStation RGB Desk', subtitle: 'โต๊ะเกมมิ่งคาร์บอนไฟเบอร์', icon_url: '/images/rewards/desk.png', color: '#B45309', text_color: '#FDE68A', rarity: 'LEGENDARY', weight: 6, sort_order: 5 },
          { nameKey: 'แว่นตา VR Meta Gaming Headset', label: 'VR Gaming Headset', subtitle: 'แว่นตา VR ประสบการณ์ 3D', icon_url: '/images/rewards/vr.png', color: '#6D28D9', text_color: '#DDD6FE', rarity: 'EPIC', weight: 12, sort_order: 6 },
          { nameKey: 'เก้าอี้ Ergonomic Cyber Gaming Chair', label: 'Cyber Gaming Chair', subtitle: 'เก้าอี้เกมมิ่งสรีรศาสตร์', icon_url: '/images/rewards/chair.png', color: '#6D28D9', text_color: '#DDD6FE', rarity: 'EPIC', weight: 15, sort_order: 7 },
          { nameKey: 'Custom RGB Mechanical Keyboard', label: 'คีย์บอร์ดเกมมิ่ง RGB', subtitle: 'Custom Mechanical RGB', icon_url: '/images/rewards/keyboard.png', color: '#BE185D', text_color: '#FBCFE8', rarity: 'EPIC', weight: 20, sort_order: 8 },
          { nameKey: 'ROG Wireless RGB Gaming Headset', label: 'หูฟังเกมมิ่ง RGB 7.1', subtitle: 'ROG Wireless Headset', icon_url: '/images/rewards/headset.png', color: '#6D28D9', text_color: '#DDD6FE', rarity: 'EPIC', weight: 22, sort_order: 9 },
          { nameKey: 'ไมโครโฟน Studio Condenser Mic', label: 'ไมโครโฟน Studio RGB', subtitle: 'Studio Condenser Mic', icon_url: '/images/rewards/microphone.png', color: '#6D28D9', text_color: '#DDD6FE', rarity: 'EPIC', weight: 25, sort_order: 10 },
          { nameKey: '1,000 Coins Grand Prize', label: '1,000 COINS', subtitle: 'รางวัลโบนัสเครดิตก้อนโต', icon_url: '/images/packages/tier4.jpg', color: '#6D28D9', text_color: '#DDD6FE', rarity: 'EPIC', weight: 28, sort_order: 11 },
          { nameKey: 'Elite Wireless Game Controller', label: 'จอยเกมส์ไร้สาย Elite', subtitle: 'Wireless Game Controller', icon_url: '/images/rewards/controller.png', color: '#0369A1', text_color: '#BAE6FD', rarity: 'RARE', weight: 35, sort_order: 12 },
          { nameKey: 'กล้องสตรีม 4K Pro Streaming Webcam', label: 'กล้องสตรีม 4K Pro', subtitle: 'Streaming Webcam 4K', icon_url: '/images/rewards/webcam.png', color: '#0369A1', text_color: '#BAE6FD', rarity: 'RARE', weight: 32, sort_order: 13 },
          { nameKey: 'Ultralight Wireless Gaming Mouse', label: 'เมาส์เกมมิ่ง Ultralight', subtitle: 'Wireless Gaming Mouse', icon_url: '/images/rewards/mouse.png', color: '#0369A1', text_color: '#BAE6FD', rarity: 'RARE', weight: 40, sort_order: 14 },
          { nameKey: 'CyberBass TWS Gaming Earbuds', label: 'หูฟัง TWS CyberBass', subtitle: 'Wireless Gaming Earbuds', icon_url: '/images/rewards/earbuds.png', color: '#0369A1', text_color: '#BAE6FD', rarity: 'RARE', weight: 45, sort_order: 15 },
          { nameKey: 'ลำโพงซาวด์บาร์ Hi-Res Gaming Soundbar', label: 'ลำโพงซาวด์บาร์ Hi-Res', subtitle: 'Gaming Soundbar RGB', icon_url: '/images/rewards/speaker.png', color: '#0369A1', text_color: '#BAE6FD', rarity: 'RARE', weight: 38, sort_order: 16 },
          { nameKey: '500 Bonus Coins', label: '500 COINS', subtitle: 'เหรียญทองคุ้มค่า', icon_url: '/images/packages/tier3.jpg', color: '#C2410C', text_color: '#FED7AA', rarity: 'RARE', weight: 50, sort_order: 17 },
          { nameKey: '50 Bonus Coins', label: 'เปิดการ์ดฟรีอีกครั้ง', subtitle: 'Free Card Respin', icon_url: '/images/tarot_card_back.jpg', color: '#047857', text_color: '#A7F3D0', rarity: 'RARE', weight: 40, sort_order: 18 },
          { nameKey: 'AuraGlide XXL RGB Mousepad', label: 'แผ่นรองเมาส์ XXL RGB', subtitle: 'AuraGlide Gaming Mousepad', icon_url: '/images/rewards/mousepad.png', color: '#1E293B', text_color: '#94A3B8', rarity: 'COMMON', weight: 70, sort_order: 19 },
          { nameKey: 'แท่นแขวนหูฟัง RGB Headset Stand', label: 'แท่นแขวนหูฟัง RGB', subtitle: 'RGB Headset Stand Hub', icon_url: '/images/rewards/stand.png', color: '#1E293B', text_color: '#94A3B8', rarity: 'COMMON', weight: 65, sort_order: 20 },
          { nameKey: 'เครื่องดื่ม Cyber Energy Elixir', label: 'Cyber Energy Elixir', subtitle: 'เครื่องดื่มเพิ่มพลังเกมเมอร์', icon_url: '/images/rewards/energy_drink.png', color: '#1E293B', text_color: '#94A3B8', rarity: 'COMMON', weight: 90, sort_order: 21 },
          { nameKey: 'บะหมี่รอบดึก Gamer Ramen Cup', label: 'มาม่ารอบดึก Gamer Ramen', subtitle: 'บะหมี่ถ้วยสู้ศึกยามดึก', icon_url: '/images/rewards/noodles.png', color: '#334155', text_color: '#CBD5E1', rarity: 'COMMON', weight: 100, sort_order: 22 },
          { nameKey: '100 Bonus Coins', label: '100 COINS', subtitle: 'โบนัสเครดิต', icon_url: '/images/packages/tier1.jpg', color: '#0369A1', text_color: '#BAE6FD', rarity: 'COMMON', weight: 80, sort_order: 23 },
          { nameKey: 'เกลือบริสุทธิ์ 100% (Pure Salt)', label: 'ลองใหม่อีกครั้ง', subtitle: 'เกลือบริสุทธิ์ 100%', icon_url: '/images/rewards/salt.png', color: '#1E293B', text_color: '#94A3B8', rarity: 'COMMON', weight: 120, sort_order: 24 },
        ];

        for (const it of defaultCards) {
          const rw = rMap[it.nameKey];
          const rewardId = rw ? rw.id : fallbackId;
          await query(
            `INSERT INTO wheel_items (reward_id, label, subtitle, icon_url, color, text_color, rarity, weight, is_active, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
            [rewardId, it.label, it.subtitle, it.icon_url, it.color, it.text_color, it.rarity, it.weight, it.sort_order]
          );
        }
      }
    } catch (err: any) {
      console.error('Error initializing Wheel tables:', err.message);
    }
  }

  /**
   * Get active wheel items with odds and user status
   */
  static async getPool(userId?: number) {
    await this.initTables();

    const items: any = await query(`
      SELECT wi.id, wi.reward_id, wi.label, wi.subtitle, wi.icon_url, wi.color, wi.text_color,
             wi.rarity, wi.weight, wi.sort_order, wi.is_active,
             r.name as reward_name, r.type as reward_type, r.value as reward_value, r.image_url as reward_image
      FROM wheel_items wi
      LEFT JOIN rewards r ON wi.reward_id = r.id
      WHERE wi.is_active = 1
      ORDER BY wi.sort_order ASC, wi.id ASC
    `);

    const totalWeight = items.reduce((sum: number, it: any) => sum + (parseFloat(it.weight) || 0), 0);
    const mappedItems: WheelItemData[] = items.map((it: any) => {
      const w = parseFloat(it.weight) || 0;
      return {
        id: it.id,
        reward_id: it.reward_id,
        label: it.label,
        subtitle: it.subtitle || '',
        icon_url: it.icon_url || it.reward_image || '/images/packages/tier1.jpg',
        color: it.color || '#1E293B',
        text_color: it.text_color || '#FFFFFF',
        rarity: it.rarity,
        weight: w,
        is_active: Boolean(it.is_active),
        sort_order: it.sort_order,
        reward_type: it.reward_type,
        reward_value: it.reward_value,
        probability_percent: totalWeight > 0 ? Number(((w / totalWeight) * 100).toFixed(2)) : 0,
      };
    });

    // Dynamic Game Settings from DB
    const settingsRows: any = await query(
      `SELECT key_name, value FROM settings WHERE key_name IN ('game_wheel_cost', 'game_wheel_free_spins', 'game_wheel_enabled')`
    );
    const settingsMap: Record<string, string> = {};
    (settingsRows || []).forEach((r: any) => { settingsMap[r.key_name] = r.value; });

    const costPerSpin = settingsMap['game_wheel_cost'] ? parseFloat(settingsMap['game_wheel_cost']) : 20.00;
    const maxFreeSpins = settingsMap['game_wheel_free_spins'] !== undefined ? parseInt(settingsMap['game_wheel_free_spins'], 10) : 1;
    const isEnabled = settingsMap['game_wheel_enabled'] !== 'false';

    let remainingFreeSpins = maxFreeSpins;
    if (userId) {
      const usedRows: any = await query(
        `SELECT COUNT(*) as count FROM wheel_spins
         WHERE user_id = ? AND spin_type = 'FREE_DAILY' AND DATE(created_at) = CURDATE()`,
        [userId]
      );
      const usedCount = usedRows && usedRows[0]?.count ? Number(usedRows[0].count) : 0;
      remainingFreeSpins = Math.max(0, maxFreeSpins - usedCount);
    }

    // Recent big winners for ticker
    const recentWinners: any = await query(`
      SELECT ws.id, ws.created_at, u.username, wi.label as item_name, wi.rarity, wi.icon_url
      FROM wheel_spins ws
      JOIN users u ON ws.user_id = u.id
      JOIN wheel_items wi ON ws.wheel_item_id = wi.id
      WHERE wi.rarity IN ('RARE', 'EPIC', 'LEGENDARY')
      ORDER BY ws.id DESC
      LIMIT 10
    `);

    return {
      items: mappedItems,
      totalWeight,
      costPerSpin,
      remainingFreeSpins,
      isEnabled,
      recentWinners: recentWinners || [],
    };
  }

  /**
   * Spin the Wheel
   */
  static async spin(userId: number) {
    await this.initTables();

    // Check if Wheel/Tarot game is enabled
    const enabledRows: any = await query(
      `SELECT value FROM settings WHERE key_name = 'game_wheel_enabled'`
    );
    if (enabledRows && enabledRows[0]?.value === 'false') {
      throw new Error('ระบบเปิดการ์ดเสี่ยงโชคกำลังปิดปรับปรุงชั่วคราว ขออภัยในความไม่สะดวก');
    }

    const pool = await this.getPool(userId);
    if (!pool.items || pool.items.length === 0) {
      throw new Error('ยังไม่มีรายการของรางวัลในวงล้อหมุน');
    }

    const isFree = pool.remainingFreeSpins > 0;
    const spinCost = isFree ? 0 : pool.costPerSpin;

    const conn = await getConnection();
    await conn.beginTransaction();

    try {
      // 1. Balance deduction if not free
      let userBalance = 0;
      if (!isFree) {
        const deductRes = await WalletService.deduct(
          userId,
          spinCost,
          'PURCHASE',
          `หมุนวงล้อเสี่ยงโชค (Lucky Wheel Spin)`,
          'WHEEL_SPIN',
          undefined,
          conn
        );
        userBalance = deductRes.newBalance;
      } else {
        const balRes = await WalletService.getBalance(userId);
        userBalance = balRes.balance;
      }

      // 2. Weighted RNG selection
      const totalWeight = pool.totalWeight;
      let randomVal = Math.random() * totalWeight;
      let winningIndex = 0;
      let winningItem = pool.items[0];

      for (let i = 0; i < pool.items.length; i++) {
        const it = pool.items[i];
        if (randomVal <= it.weight) {
          winningIndex = i;
          winningItem = it;
          break;
        }
        randomVal -= it.weight;
      }

      // 3. Process Reward fulfillment
      const isSalt = winningItem.label.includes('ลองใหม่') || winningItem.label.includes('เกลือ');
      const isRespin = winningItem.label.includes('หมุนฟรี');

      let rewardCode = '';
      if (isRespin) {
        rewardCode = 'FREE-RESPIN-CLAIMED';
      } else if (!isSalt) {
        rewardCode = `SPIN-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;

        // If it's a CREDIT coin reward, auto add coins directly to user balance!
        if (winningItem.reward_type === 'CREDIT' && winningItem.reward_value) {
          const coinsAwarded = Number(winningItem.reward_value) || 0;
          if (coinsAwarded > 0) {
            const creditRes = await WalletService.credit(
              userId,
              coinsAwarded,
              'BONUS',
              `โบนัสเหรียญจากวงล้อเสี่ยงโชค (${winningItem.label})`,
              'WHEEL_REWARD',
              undefined,
              conn
            );
            userBalance = creditRes.newBalance;
          }
        }

        // Add to user inventory
        await conn.query(
          `INSERT INTO reward_inventories 
           (user_id, reward_id, reward_name, reward_type, reward_value, rarity, image_url, code_content, acquired_from, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'WHEEL_FORTUNE', NOW())`,
          [
            userId,
            winningItem.reward_id,
            winningItem.label,
            winningItem.reward_type || 'ITEM',
            winningItem.reward_value || '',
            winningItem.rarity || 'COMMON',
            winningItem.icon_url || '',
            rewardCode || null,
          ]
        );
      }

      // 4. Record spin history
      await conn.query(
        `INSERT INTO wheel_spins (user_id, wheel_item_id, spin_cost, spin_type, reward_code, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [userId, winningItem.id, spinCost, isFree ? 'FREE_DAILY' : 'COINS', rewardCode || null]
      );

      await conn.commit();

      // Calculate target angle
      // Wheel has N segments. Segment width = 360 / N
      const segmentCount = pool.items.length;
      const segmentAngle = 360 / segmentCount;
      // Pointer is at TOP (270 degrees or 0 depending on rotation).
      // If pointer is at 0 (top: 12 o'clock), to land on winningIndex:
      // Target rotation angle calculation with realistic random jitter inside the wedge
      const wedgeCenter = winningIndex * segmentAngle + segmentAngle / 2;
      const jitter = (Math.random() - 0.5) * (segmentAngle * 0.7); // jitter within safe bounds
      const minFullSpins = 5 + Math.floor(Math.random() * 3); // 5 to 7 full rotations
      const targetDegree = minFullSpins * 360 + (360 - wedgeCenter) + jitter;

      return {
        winningItem,
        winningIndex,
        targetDegree,
        isFree,
        spinCost,
        rewardCode,
        isRespin,
        isSalt,
        newBalance: userBalance,
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Get user spin history
   */
  static async getHistory(userId: number) {
    return query(
      `SELECT ws.id, ws.spin_cost, ws.spin_type, ws.reward_code, ws.created_at,
              wi.label, wi.subtitle, wi.icon_url, wi.rarity, wi.color
       FROM wheel_spins ws
       JOIN wheel_items wi ON ws.wheel_item_id = wi.id
       WHERE ws.user_id = ?
       ORDER BY ws.id DESC
       LIMIT 30`,
      [userId]
    );
  }

  /**
   * Admin: Get all items
   */
  static async getAllAdminItems() {
    await this.initTables();
    return query(`
      SELECT wi.*, r.name as reward_name, r.type as reward_type, r.value as reward_value
      FROM wheel_items wi
      LEFT JOIN rewards r ON wi.reward_id = r.id
      ORDER BY wi.sort_order ASC, wi.id ASC
    `);
  }

  /**
   * Admin: Create item
   */
  static async createItem(data: any) {
    const rate = Math.max(0.0001, parseFloat(String(data.weight ?? data.rate ?? 1)) || 1);
    const res: any = await query(
      `INSERT INTO wheel_items (reward_id, label, subtitle, icon_url, color, text_color, rarity, weight, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.reward_id,
        data.label,
        data.subtitle || '',
        data.icon_url || '',
        data.color || '#1E293B',
        data.text_color || '#FFFFFF',
        data.rarity || 'COMMON',
        rate,
        data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
        data.sort_order || 0,
      ]
    );
    return res.insertId;
  }

  /**
   * Admin: Update item
   */
  static async updateItem(id: number, data: any) {
    const rate = Math.max(0.0001, parseFloat(String(data.weight ?? data.rate ?? 1)) || 1);
    await query(
      `UPDATE wheel_items SET
        reward_id = ?, label = ?, subtitle = ?, icon_url = ?, color = ?,
        text_color = ?, rarity = ?, weight = ?, is_active = ?, sort_order = ?
       WHERE id = ?`,
      [
        data.reward_id,
        data.label,
        data.subtitle || '',
        data.icon_url || '',
        data.color || '#1E293B',
        data.text_color || '#FFFFFF',
        data.rarity || 'COMMON',
        rate,
        data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
        data.sort_order || 0,
        id,
      ]
    );
    return true;
  }

  /**
   * Admin: Delete item
   */
  static async deleteItem(id: number) {
    await query('DELETE FROM wheel_items WHERE id = ?', [id]);
    return true;
  }

  /**
   * Admin: Batch update/sync all wheel pool items and rates in one go
   */
  static async batchUpdatePool(items: any[]) {
    if (!Array.isArray(items)) {
      throw new Error('Items must be an array');
    }

    const keepIds: number[] = [];

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const rate = Math.max(0.0001, parseFloat(String(it.weight ?? it.rate ?? 1)) || 0.0001);
      const label = String(it.label || 'Reward').trim();
      const subtitle = String(it.subtitle || '').trim();
      const iconUrl = String(it.icon_url || '').trim();
      const color = String(it.color || '#B45309').trim();
      const textColor = String(it.text_color || '#FFFFFF').trim();
      const rarity = String(it.rarity || 'COMMON').trim();
      const rewardId = parseInt(String(it.reward_id || 0), 10) || 0;
      const isActive = it.is_active !== undefined ? (it.is_active ? 1 : 0) : 1;
      const sortOrder = i + 1;

      if (it.id) {
        keepIds.push(Number(it.id));
        await query(
          `UPDATE wheel_items SET
            reward_id = ?, label = ?, subtitle = ?, icon_url = ?, color = ?,
            text_color = ?, rarity = ?, weight = ?, is_active = ?, sort_order = ?
           WHERE id = ?`,
          [rewardId, label, subtitle, iconUrl, color, textColor, rarity, rate, isActive, sortOrder, it.id]
        );
      } else {
        const res: any = await query(
          `INSERT INTO wheel_items (reward_id, label, subtitle, icon_url, color, text_color, rarity, weight, is_active, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [rewardId, label, subtitle, iconUrl, color, textColor, rarity, rate, isActive, sortOrder]
        );
        keepIds.push(res.insertId);
      }
    }

    // Clean up items removed from pool if any
    if (keepIds.length > 0) {
      const placeholders = keepIds.map(() => '?').join(',');
      await query(`DELETE FROM wheel_items WHERE id NOT IN (${placeholders})`, keepIds);
    }

    return true;
  }
}
