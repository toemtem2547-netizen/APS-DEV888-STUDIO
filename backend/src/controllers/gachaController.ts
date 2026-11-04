import { Request, Response } from 'express';
import { z } from 'zod';
import { GachaService } from '../services/gachaService';
import { AuthenticatedRequest } from '../middleware/auth';
import { query } from '../config/db';

export const gachaItemSchema = z.object({
  rewardId: z.number().int().positive(),
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional().default(''),
  category: z.string().min(1, 'Category is required'),
  valueText: z.string().min(1, 'Value text is required'),
  imageUrl: z.string().optional().default(''),
  rarity: z.enum(['COMMON', 'RARE', 'EPIC', 'LEGENDARY']).default('COMMON'),
  weight: z.number().positive('Rate must be positive'),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export async function getGachaPool(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const pool = await GachaService.getPool(userId);
    res.json({ success: true, data: pool });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function spinGacha(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำการหมุนวงล้อสุ่ม' });
      return;
    }

    const result = await GachaService.spin(req.user.id);

    res.json({
      success: true,
      message: `ยินดีด้วย! คุณได้รับ ${result.winningItem.title}`,
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function getGachaHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const history = await GachaService.getHistory(req.user.id);
    res.json({ success: true, data: history });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// Admin handlers
export async function adminGetGachaItems(req: Request, res: Response): Promise<void> {
  try {
    const items: any = await query(
      `SELECT gi.*, r.name as reward_name
       FROM gacha_items gi
       JOIN rewards r ON gi.reward_id = r.id
       ORDER BY gi.sort_order ASC, gi.id ASC`
    );

    const totalWeight = items.reduce((sum: number, it: any) => sum + (parseFloat(it.weight) || 0), 0);

    res.json({
      success: true,
      data: items.map((it: any) => ({
        id: it.id,
        rewardId: it.reward_id,
        reward_id: it.reward_id,
        rewardName: it.reward_name,
        reward_name: it.reward_name,
        title: it.title,
        subtitle: it.subtitle,
        category: it.category,
        valueText: it.value_text,
        value_text: it.value_text,
        imageUrl: it.image_url,
        image_url: it.image_url,
        rarity: it.rarity,
        weight: parseFloat(it.weight) || 0,
        isActive: Boolean(it.is_active),
        is_active: Boolean(it.is_active),
        sortOrder: Number(it.sort_order),
        sort_order: Number(it.sort_order),
        probability_percent: totalWeight > 0 ? Number(((parseFloat(it.weight) / totalWeight) * 100).toFixed(2)) : 0,
        createdAt: it.created_at,
        created_at: it.created_at,
      })),
      totalWeight,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function adminCreateGachaItem(req: Request, res: Response): Promise<void> {
  try {
    const data = gachaItemSchema.parse(req.body);

    const result: any = await query(
      `INSERT INTO gacha_items (reward_id, title, subtitle, category, value_text, image_url, rarity, weight, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.rewardId,
        data.title,
        data.subtitle,
        data.category,
        data.valueText,
        data.imageUrl,
        data.rarity,
        data.weight,
        data.isActive,
        data.sortOrder,
      ]
    );

    res.status(201).json({ success: true, message: 'สร้างของรางวัลในวงล้อกาชาสำเร็จ', id: result.insertId });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function adminUpdateGachaItem(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const data = gachaItemSchema.partial().parse(req.body);

    const updates: string[] = [];
    const values: any[] = [];

    if (data.rewardId !== undefined) { updates.push('reward_id = ?'); values.push(data.rewardId); }
    if (data.title !== undefined) { updates.push('title = ?'); values.push(data.title); }
    if (data.subtitle !== undefined) { updates.push('subtitle = ?'); values.push(data.subtitle); }
    if (data.category !== undefined) { updates.push('category = ?'); values.push(data.category); }
    if (data.valueText !== undefined) { updates.push('value_text = ?'); values.push(data.valueText); }
    if (data.imageUrl !== undefined) { updates.push('image_url = ?'); values.push(data.imageUrl); }
    if (data.rarity !== undefined) { updates.push('rarity = ?'); values.push(data.rarity); }
    if (data.weight !== undefined) { updates.push('weight = ?'); values.push(data.weight); }
    if (data.isActive !== undefined) { updates.push('is_active = ?'); values.push(data.isActive); }
    if (data.sortOrder !== undefined) { updates.push('sort_order = ?'); values.push(data.sortOrder); }

    if (updates.length === 0) {
      res.status(400).json({ success: false, message: 'No fields to update' });
      return;
    }

    values.push(id);
    await query(`UPDATE gacha_items SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ success: true, message: 'อัปเดตของรางวัลในวงล้อสำเร็จ' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function adminDeleteGachaItem(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await query(`DELETE FROM gacha_items WHERE id = ?`, [id]);
    res.json({ success: true, message: 'ลบของรางวัลในวงล้อเรียบร้อยแล้ว' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function adminBatchUpdateGachaItems(req: Request, res: Response): Promise<void> {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      res.status(400).json({ success: false, message: 'items array is required' });
      return;
    }

    const keepIds: number[] = [];

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const rate = Math.max(0.0001, parseFloat(String(it.weight ?? it.rate ?? 1)) || 0.0001);
      const title = String(it.title || 'Reward').trim();
      const subtitle = String(it.subtitle || '').trim();
      const category = String(it.category || 'GAMING_GEAR').trim();
      const valueText = String(it.valueText || it.value_text || 'ITEM').trim();
      const imageUrl = String(it.imageUrl || it.image_url || '').trim();
      const rarity = String(it.rarity || 'COMMON').trim();
      const rewardId = parseInt(String(it.rewardId || it.reward_id || 0), 10) || 0;
      const isActive = it.isActive !== undefined ? (it.isActive ? 1 : 0) : (it.is_active !== undefined ? (it.is_active ? 1 : 0) : 1);
      const sortOrder = i + 1;

      if (it.id) {
        keepIds.push(Number(it.id));
        await query(
          `UPDATE gacha_items SET
            reward_id = ?, title = ?, subtitle = ?, category = ?, value_text = ?,
            image_url = ?, rarity = ?, weight = ?, is_active = ?, sort_order = ?
           WHERE id = ?`,
          [rewardId, title, subtitle, category, valueText, imageUrl, rarity, rate, isActive, sortOrder, it.id]
        );
      } else {
        const res: any = await query(
          `INSERT INTO gacha_items (reward_id, title, subtitle, category, value_text, image_url, rarity, weight, is_active, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [rewardId, title, subtitle, category, valueText, imageUrl, rarity, rate, isActive, sortOrder]
        );
        keepIds.push(res.insertId);
      }
    }

    // Clean up items removed from pool if any
    if (keepIds.length > 0) {
      const placeholders = keepIds.map(() => '?').join(',');
      await query(`DELETE FROM gacha_items WHERE id NOT IN (${placeholders})`, keepIds);
    }

    res.json({ success: true, message: 'บันทึกของรางวัลและอัตราเรทสุ่มสำเร็จ!' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

