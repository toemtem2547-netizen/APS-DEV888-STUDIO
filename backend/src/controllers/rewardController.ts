import { Request, Response } from 'express';
import { z } from 'zod';
import { query } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

export const rewardSchema = z.object({
  name: z.string().min(1, 'Reward name is required'),
  description: z.string().optional().default(''),
  imageUrl: z.string().optional().default(''),
  type: z.enum(['ITEM', 'CODE', 'CREDIT', 'COUPON', 'VIP']).default('ITEM'),
  value: z.string().min(1, 'Value/Code is required'),
  rarity: z.enum(['COMMON', 'RARE', 'EPIC', 'LEGENDARY']).default('COMMON'),
  stock: z.number().int().default(-1),
  isActive: z.boolean().default(true),
});

export async function getMyInventory(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const items: any = await query(
      `SELECT id, reward_id, reward_name, reward_type, reward_value, rarity, image_url, code_content, is_used, used_at, acquired_from, created_at
       FROM reward_inventories
       WHERE user_id = ?
       ORDER BY id DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: items.map((i: any) => ({
        id: i.id,
        rewardId: i.reward_id,
        rewardName: i.reward_name,
        rewardType: i.reward_type,
        rewardValue: i.reward_value,
        rarity: i.rarity,
        imageUrl: i.image_url,
        codeContent: i.code_content,
        isUsed: Boolean(i.is_used),
        usedAt: i.used_at,
        acquiredFrom: i.acquired_from,
        createdAt: i.created_at,
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function markRewardUsed(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    await query(
      `UPDATE reward_inventories
       SET is_used = 1, used_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [id, req.user.id]
    );

    res.json({ success: true, message: 'บันทึกการใช้งานไอเทมเรียบร้อยแล้ว' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getAllRewards(req: Request, res: Response): Promise<void> {
  try {
    const rewards: any = await query(`SELECT * FROM rewards ORDER BY rarity DESC, id DESC`);

    res.json({
      success: true,
      data: rewards.map((r: any) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        imageUrl: r.image_url,
        type: r.type,
        value: r.value,
        rarity: r.rarity,
        stock: r.stock,
        isActive: Boolean(r.is_active),
        createdAt: r.created_at,
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createReward(req: Request, res: Response): Promise<void> {
  try {
    const data = rewardSchema.parse(req.body);

    const result: any = await query(
      `INSERT INTO rewards (name, description, image_url, type, value, rarity, stock, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.description,
        data.imageUrl,
        data.type,
        data.value,
        data.rarity,
        data.stock,
        data.isActive,
      ]
    );

    res.status(201).json({ success: true, message: 'สร้างของรางวัลสำเร็จ', rewardId: result.insertId });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function updateReward(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const data = rewardSchema.partial().parse(req.body);

    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name); }
    if (data.description !== undefined) { updates.push('description = ?'); values.push(data.description); }
    if (data.imageUrl !== undefined) { updates.push('image_url = ?'); values.push(data.imageUrl); }
    if (data.type !== undefined) { updates.push('type = ?'); values.push(data.type); }
    if (data.value !== undefined) { updates.push('value = ?'); values.push(data.value); }
    if (data.rarity !== undefined) { updates.push('rarity = ?'); values.push(data.rarity); }
    if (data.stock !== undefined) { updates.push('stock = ?'); values.push(data.stock); }
    if (data.isActive !== undefined) { updates.push('is_active = ?'); values.push(data.isActive); }

    if (updates.length === 0) {
      res.status(400).json({ success: false, message: 'No fields to update' });
      return;
    }

    values.push(id);
    await query(`UPDATE rewards SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ success: true, message: 'อัปเดตของรางวัลสำเร็จ' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function deleteReward(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await query(`DELETE FROM rewards WHERE id = ?`, [id]);
    res.json({ success: true, message: 'ลบของรางวัลเรียบร้อยแล้ว' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
