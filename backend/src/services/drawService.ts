import { getConnection, query } from '../config/db';
import { WalletService } from './walletService';

export interface RewardWithWeight {
  id: number;
  name: string;
  description: string;
  image_url: string;
  type: string;
  value: string;
  rarity: string;
  stock: number;
  weight: number;
  probability_percent?: number;
}

export class DrawService {
  /**
   * Get all rewards in a mystery box along with their calculated drop probability percentages.
   */
  static async getBoxRewardsWithProbability(boxId: number): Promise<RewardWithWeight[]> {
    const rows: any = await query(
      `SELECT r.id, r.name, r.description, r.image_url, r.type, r.value, r.rarity, r.stock, mbr.weight
       FROM mystery_box_rewards mbr
       JOIN rewards r ON mbr.reward_id = r.id
       WHERE mbr.box_id = ? AND mbr.is_active = 1 AND r.is_active = 1
       ORDER BY mbr.weight ASC`,
      [boxId]
    );

    const totalWeight = rows.reduce((sum: number, item: any) => sum + item.weight, 0);

    return rows.map((item: any) => ({
      ...item,
      probability_percent: totalWeight > 0 ? Number(((item.weight / totalWeight) * 100).toFixed(2)) : 0,
    }));
  }

  /**
   * Draw a mystery box atomically.
   */
  static async drawBox(userId: number, boxId: number) {
    const conn = await getConnection();

    try {
      await conn.beginTransaction();

      // 1. Fetch Box details with lock
      const [boxRows]: any = await conn.query(
        `SELECT id, name, price, is_active FROM mystery_boxes WHERE id = ? FOR UPDATE`,
        [boxId]
      );

      if (!boxRows || boxRows.length === 0) {
        throw new Error('Mystery box not found');
      }

      const box = boxRows[0];
      if (!box.is_active) {
        throw new Error('กล่องสุ่มนี้ปิดให้บริการชั่วคราว');
      }

      const cost = parseFloat(box.price);

      // 2. Fetch active rewards and weights for this box with lock
      const [poolRows]: any = await conn.query(
        `SELECT r.id, r.name, r.description, r.image_url, r.type, r.value, r.rarity, r.stock, mbr.weight
         FROM mystery_box_rewards mbr
         JOIN rewards r ON mbr.reward_id = r.id
         WHERE mbr.box_id = ? AND mbr.is_active = 1 AND r.is_active = 1
         FOR UPDATE`,
        [boxId]
      );

      if (!poolRows || poolRows.length === 0) {
        throw new Error('ไม่พบของรางวัลในกล่องนี้');
      }

      // Filter out out-of-stock rewards (stock = 0; -1 is unlimited)
      const availableRewards = poolRows.filter((r: any) => r.stock === -1 || r.stock > 0);
      if (availableRewards.length === 0) {
        throw new Error('ของรางวัลในกล่องนี้หมดชั่วคราว กรุณาลองใหม่อีกครั้งภายหลัง');
      }

      // 3. Deduct Wallet Balance Atomically
      const { newBalance } = await WalletService.deduct(
        userId,
        cost,
        'MYSTERY_BOX',
        `เปิดกล่องสุ่ม: ${box.name}`,
        'MYSTERY_BOX',
        box.id.toString(),
        conn
      );

      // 4. Weighted Random Selection (Backend Truth)
      const totalWeight = availableRewards.reduce((sum: number, r: any) => sum + r.weight, 0);
      let randomNum = Math.random() * totalWeight;
      let selectedReward = availableRewards[0];

      for (const item of availableRewards) {
        if (randomNum <= item.weight) {
          selectedReward = item;
          break;
        }
        randomNum -= item.weight;
      }

      // 5. Decrement Stock if not unlimited
      if (selectedReward.stock > 0) {
        await conn.query(`UPDATE rewards SET stock = stock - 1 WHERE id = ?`, [selectedReward.id]);
      }

      // Generate digital code if CODE type
      let generatedCode: string | null = null;
      if (selectedReward.type === 'CODE') {
        const uniqueSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
        generatedCode = `${selectedReward.value}-${uniqueSuffix}`;
      }

      // 6. Grant to User's Reward Inventory
      await conn.query(
        `INSERT INTO reward_inventories
         (user_id, reward_id, reward_name, reward_type, reward_value, rarity, image_url, code_content, acquired_from)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          selectedReward.id,
          selectedReward.name,
          selectedReward.type,
          selectedReward.value,
          selectedReward.rarity,
          selectedReward.image_url,
          generatedCode || (selectedReward.type === 'ITEM' ? selectedReward.value : null),
          box.name,
        ]
      );

      // 7. Record to Draw History
      await conn.query(
        `INSERT INTO draw_histories
         (user_id, box_id, box_name, reward_id, reward_name, reward_type, reward_value, rarity, reward_image_url, cost)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          box.id,
          box.name,
          selectedReward.id,
          selectedReward.name,
          selectedReward.type,
          selectedReward.value,
          selectedReward.rarity,
          selectedReward.image_url,
          cost,
        ]
      );

      // 8. If reward is CREDIT type, automatically credit user wallet with bonus
      let bonusCredited = 0;
      let finalBalance = newBalance;
      if (selectedReward.type === 'CREDIT') {
        const creditAmt = parseFloat(selectedReward.value) || 0;
        if (creditAmt > 0) {
          bonusCredited = creditAmt;
          const credRes = await WalletService.credit(
            userId,
            creditAmt,
            'BONUS',
            `โบนัสเหรียญจากกล่องสุ่ม ${box.name}`,
            'MYSTERY_BOX_REWARD',
            selectedReward.id.toString(),
            conn
          );
          finalBalance = credRes.newBalance;
        }
      }

      await conn.commit();

      return {
        boxId: box.id,
        boxName: box.name,
        cost,
        reward: {
          id: selectedReward.id,
          name: selectedReward.name,
          description: selectedReward.description,
          image_url: selectedReward.image_url,
          type: selectedReward.type,
          value: selectedReward.value,
          rarity: selectedReward.rarity,
          code: generatedCode,
          bonusCredited,
        },
        newWalletBalance: finalBalance,
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Recent winners across platform for home ticker
   */
  static async getRecentWinners(limit = 10): Promise<any[]> {
    return await query(
      `SELECT dh.id, dh.box_name, dh.reward_name, dh.rarity, dh.reward_image_url, dh.created_at,
              CONCAT(SUBSTRING(u.username, 1, 3), '***') as masked_username
       FROM draw_histories dh
       JOIN users u ON dh.user_id = u.id
       ORDER BY dh.id DESC
       LIMIT ?`,
      [limit]
    );
  }
}
