import { getConnection, query } from '../config/db';
import { WalletService } from './walletService';

export interface GachaItemData {
  id: number;
  reward_id: number;
  title: string;
  subtitle: string;
  category: string;
  value_text: string;
  image_url: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  weight: number;
  probability_percent?: number;
}

export class GachaService {
  /**
   * Get all active Gacha Reel items with calculated probabilities and user's free daily spin status
   */
  static async getPool(userId?: number) {
    const items: any = await query(
      `SELECT gi.id, gi.reward_id, gi.title, gi.subtitle, gi.category, gi.value_text,
              gi.image_url, gi.rarity, gi.weight, gi.sort_order, r.type as reward_type, r.value as reward_value
       FROM gacha_items gi
       JOIN rewards r ON gi.reward_id = r.id
       WHERE gi.is_active = 1
       ORDER BY gi.sort_order ASC, gi.id ASC`
    );

    const totalWeight = items.reduce((sum: number, it: any) => sum + (parseFloat(it.weight) || 0), 0);
    const mappedItems: GachaItemData[] = items.map((it: any) => ({
      ...it,
      weight: parseFloat(it.weight) || 0,
      probability_percent: totalWeight > 0 ? Number(((parseFloat(it.weight) / totalWeight) * 100).toFixed(2)) : 0,
    }));

    // Dynamic Game Settings from DB
    const settingsRows: any = await query(
      `SELECT key_name, value FROM settings WHERE key_name IN ('game_gacha_cost', 'game_gacha_free_spins', 'game_gacha_enabled')`
    );
    const settingsMap: Record<string, string> = {};
    (settingsRows || []).forEach((r: any) => { settingsMap[r.key_name] = r.value; });

    const costPerSpin = settingsMap['game_gacha_cost'] ? parseFloat(settingsMap['game_gacha_cost']) : 29.00;
    const maxFreeSpins = settingsMap['game_gacha_free_spins'] !== undefined ? parseInt(settingsMap['game_gacha_free_spins'], 10) : 1;
    const isEnabled = settingsMap['game_gacha_enabled'] !== 'false';

    let remainingFreeSpins = maxFreeSpins;
    if (userId) {
      const usedRows: any = await query(
        `SELECT COUNT(*) as count FROM gacha_spins
         WHERE user_id = ? AND spin_type = 'FREE_DAILY' AND DATE(created_at) = CURDATE()`,
        [userId]
      );
      const usedCount = usedRows && usedRows[0]?.count ? Number(usedRows[0].count) : 0;
      remainingFreeSpins = Math.max(0, maxFreeSpins - usedCount);
    }

    return {
      items: mappedItems,
      totalWeight,
      costPerSpin,
      remainingFreeSpins,
      isEnabled,
    };
  }

  /**
   * Spin Gacha Reel atomically
   */
  static async spin(userId: number) {
    const conn = await getConnection();

    try {
      await conn.beginTransaction();

      // Check if Gacha game is enabled by Admin
      const [enabledRows]: any = await conn.query(
        `SELECT value FROM settings WHERE key_name = 'game_gacha_enabled'`
      );
      if (enabledRows && enabledRows[0]?.value === 'false') {
        throw new Error('ระบบวงล้อกาชากำลังปิดปรับปรุงชั่วคราว ขออภัยในความไม่สะดวก');
      }

      // Read dynamic cost and free spins limit
      const [settingsRows]: any = await conn.query(
        `SELECT key_name, value FROM settings WHERE key_name IN ('game_gacha_cost', 'game_gacha_free_spins')`
      );
      const settingsMap: Record<string, string> = {};
      (settingsRows || []).forEach((r: any) => { settingsMap[r.key_name] = r.value; });

      const costPerSpin = settingsMap['game_gacha_cost'] ? parseFloat(settingsMap['game_gacha_cost']) : 29.00;
      const maxFreeSpins = settingsMap['game_gacha_free_spins'] !== undefined ? parseInt(settingsMap['game_gacha_free_spins'], 10) : 1;

      // 1. Check if user has free daily spin today with lock
      const [freeSpinUsage]: any = await conn.query(
        `SELECT COUNT(*) as count FROM gacha_spins
         WHERE user_id = ? AND spin_type = 'FREE_DAILY' AND DATE(created_at) = CURDATE()
         FOR UPDATE`,
        [userId]
      );

      const usedFreeSpins = freeSpinUsage ? (freeSpinUsage[0]?.count || 0) : 0;
      const hasFreeSpin = maxFreeSpins > 0 && usedFreeSpins < maxFreeSpins;
      const spinType = hasFreeSpin ? 'FREE_DAILY' : 'WALLET';
      const cost = hasFreeSpin ? 0.00 : costPerSpin;

      // 2. Deduct wallet if paid spin
      let currentBalance = 0;
      if (!hasFreeSpin) {
        const deductRes = await WalletService.deduct(
          userId,
          cost,
          'PURCHASE',
          'หมุนวงล้อสุ่มกาชา (Gacha Reel)',
          'GACHA_SPIN',
          undefined,
          conn
        );
        currentBalance = deductRes.newBalance;
      } else {
        const balRes = await WalletService.getBalance(userId);
        currentBalance = balRes.balance;
      }

      // 3. Fetch active Gacha items
      const [items]: any = await conn.query(
        `SELECT gi.id, gi.reward_id, gi.title, gi.subtitle, gi.category, gi.value_text,
                gi.image_url, gi.rarity, gi.weight, r.name as reward_name, r.type as reward_type,
                r.value as reward_value, r.stock
         FROM gacha_items gi
         JOIN rewards r ON gi.reward_id = r.id
         WHERE gi.is_active = 1
         FOR UPDATE`
      );

      if (!items || items.length === 0) {
        throw new Error('ไม่พบของรางวัลในวงล้อกาชา');
      }

      // 4. Weighted Random Selection for winning item (Backend Truth)
      const totalWeight = items.reduce((sum: number, it: any) => sum + (parseFloat(it.weight) || 0), 0);
      let rand = Math.random() * totalWeight;
      let winner = items[0];

      for (const it of items) {
        const itemWeight = parseFloat(it.weight) || 0;
        if (rand <= itemWeight) {
          winner = it;
          break;
        }
        rand -= itemWeight;
      }

      // 5. Build Reel Sequence Strip (~70 items long) with winner at index 55
      const winningIndex = 55;
      const reelSequence: any[] = [];

      for (let i = 0; i < 75; i++) {
        if (i === winningIndex) {
          reelSequence.push({
            id: winner.id,
            title: winner.title,
            category: winner.category,
            value_text: winner.value_text,
            image_url: winner.image_url,
            rarity: winner.rarity,
          });
        } else {
          // Weighted random pick for visual carousel realism
          let r = Math.random() * totalWeight;
          let pick = items[0];
          for (const it of items) {
            const w = parseFloat(it.weight) || 0;
            if (r <= w) {
              pick = it;
              break;
            }
            r -= w;
          }
          reelSequence.push({
            id: pick.id,
            title: pick.title,
            category: pick.category,
            value_text: pick.value_text,
            image_url: pick.image_url,
            rarity: pick.rarity,
          });
        }
      }

      // 6. Generate digital code if CODE type
      let generatedCode: string | null = null;
      if (winner.reward_type === 'CODE') {
        const uniqueSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
        generatedCode = `${winner.reward_value}-${uniqueSuffix}`;
      }

      // 7. Grant reward to User Inventory
      await conn.query(
        `INSERT INTO reward_inventories
         (user_id, reward_id, reward_name, reward_type, reward_value, rarity, image_url, code_content, acquired_from)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'GACHA_LUCKY_REEL')`,
        [
          userId,
          winner.reward_id,
          winner.title,
          winner.reward_type,
          winner.reward_value,
          winner.rarity,
          winner.image_url,
          generatedCode || (winner.reward_type === 'ITEM' ? winner.reward_value : null),
        ]
      );

      // 8. Record spin history
      const [spinInsert]: any = await conn.query(
        `INSERT INTO gacha_spins
         (user_id, gacha_item_id, reward_id, reward_name, rarity, cost, spin_type)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, winner.id, winner.reward_id, winner.title, winner.rarity, cost, spinType]
      );

      // 9. If CREDIT type, add bonus credit to wallet
      let finalBalance = currentBalance;
      if (winner.reward_type === 'CREDIT') {
        const creditAmt = parseFloat(winner.reward_value) || 0;
        if (creditAmt > 0) {
          const credRes = await WalletService.credit(
            userId,
            creditAmt,
            'BONUS',
            `โบนัสเหรียญจากวงล้อกาชา ${winner.title}`,
            'GACHA_REWARD',
            spinInsert.insertId.toString(),
            conn
          );
          finalBalance = credRes.newBalance;
        }
      }

      await conn.commit();

      return {
        winningIndex,
        winningItem: {
          id: winner.id,
          title: winner.title,
          subtitle: winner.subtitle,
          category: winner.category,
          value_text: winner.value_text,
          image_url: winner.image_url,
          rarity: winner.rarity,
          code: generatedCode,
        },
        reelSequence,
        spinType,
        cost,
        remainingFreeSpins: 0,
        newWalletBalance: finalBalance,
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  static async getHistory(userId: number, limit = 20) {
    return await query(
      `SELECT gs.id, gs.reward_name, gs.rarity, gs.cost, gs.spin_type, gs.created_at, gi.image_url, gi.value_text
       FROM gacha_spins gs
       JOIN gacha_items gi ON gs.gacha_item_id = gi.id
       WHERE gs.user_id = ?
       ORDER BY gs.id DESC
       LIMIT ?`,
      [userId, limit]
    );
  }
}
