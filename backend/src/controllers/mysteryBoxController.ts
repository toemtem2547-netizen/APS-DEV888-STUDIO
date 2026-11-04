import { Request, Response } from 'express';
import { z } from 'zod';
import { query } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { DrawService } from '../services/drawService';

export const mysteryBoxSchema = z.object({
  name: z.string().min(1, 'Box name is required'),
  description: z.string().optional().default(''),
  price: z.number().positive('Price must be positive'),
  imageUrl: z.string().optional().default(''),
  colorTheme: z.string().default('bronze'),
  badge: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export async function getActiveBoxes(req: Request, res: Response): Promise<void> {
  try {
    const boxes: any = await query(
      `SELECT id, name, description, price, image_url, color_theme, badge, sort_order
       FROM mystery_boxes
       WHERE is_active = 1
       ORDER BY sort_order ASC, price ASC`
    );

    // Also fetch reward previews for each box
    const result = await Promise.all(
      boxes.map(async (b: any) => {
        const rewards = await DrawService.getBoxRewardsWithProbability(b.id);
        return {
          id: b.id,
          name: b.name,
          description: b.description,
          price: parseFloat(b.price),
          imageUrl: b.image_url,
          colorTheme: b.color_theme,
          badge: b.badge,
          sortOrder: b.sort_order,
          rewards,
        };
      })
    );

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getBoxDetails(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const boxes: any = await query(
      `SELECT id, name, description, price, image_url, color_theme, badge, is_active
       FROM mystery_boxes WHERE id = ? LIMIT 1`,
      [id]
    );

    if (!boxes || boxes.length === 0) {
      res.status(404).json({ success: false, message: 'Mystery box not found' });
      return;
    }

    const box = boxes[0];
    const rewards = await DrawService.getBoxRewardsWithProbability(box.id);

    res.json({
      success: true,
      data: {
        id: box.id,
        name: box.name,
        description: box.description,
        price: parseFloat(box.price),
        imageUrl: box.image_url,
        colorTheme: box.color_theme,
        badge: box.badge,
        isActive: Boolean(box.is_active),
        rewards,
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function drawBox(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำการสุ่มกล่อง' });
      return;
    }

    const { id } = req.params;
    const boxId = parseInt(id, 10);
    if (isNaN(boxId)) {
      res.status(400).json({ success: false, message: 'Invalid box id' });
      return;
    }

    // Check if Mystery Box is enabled
    const enabledRows: any = await query(
      `SELECT value FROM settings WHERE key_name = 'game_mystery_box_enabled'`
    );
    if (enabledRows && enabledRows[0]?.value === 'false') {
      res.status(400).json({ success: false, message: 'ระบบกล่องสุ่มกำลังปิดปรับปรุงชั่วคราว ขออภัยในความไม่สะดวก' });
      return;
    }

    const drawResult = await DrawService.drawBox(req.user.id, boxId);

    res.json({
      success: true,
      message: `ยินดีด้วย! คุณได้รับ ${drawResult.reward.name}`,
      data: drawResult,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function getRecentWins(req: Request, res: Response): Promise<void> {
  try {
    const wins = await DrawService.getRecentWinners(12);
    res.json({ success: true, data: wins });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getAllBoxes(req: Request, res: Response): Promise<void> {
  try {
    const boxes: any = await query(
      `SELECT id, name, description, price, image_url, color_theme, badge, is_active, sort_order, created_at
       FROM mystery_boxes
       ORDER BY sort_order ASC, id DESC`
    );

    const result = await Promise.all(
      boxes.map(async (b: any) => {
        const rewards = await DrawService.getBoxRewardsWithProbability(b.id);
        return {
          id: b.id,
          name: b.name,
          description: b.description,
          price: parseFloat(b.price),
          imageUrl: b.image_url,
          colorTheme: b.color_theme,
          badge: b.badge,
          isActive: Boolean(b.is_active),
          sortOrder: b.sort_order,
          rewards,
          createdAt: b.created_at,
        };
      })
    );

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createBox(req: Request, res: Response): Promise<void> {
  try {
    const data = mysteryBoxSchema.parse(req.body);

    const result: any = await query(
      `INSERT INTO mystery_boxes (name, description, price, image_url, color_theme, badge, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.description,
        data.price,
        data.imageUrl,
        data.colorTheme,
        data.badge || null,
        data.isActive,
        data.sortOrder,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'สร้างกล่องสุ่มสำเร็จ',
      boxId: result.insertId,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function updateBox(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const data = mysteryBoxSchema.partial().parse(req.body);

    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name); }
    if (data.description !== undefined) { updates.push('description = ?'); values.push(data.description); }
    if (data.price !== undefined) { updates.push('price = ?'); values.push(data.price); }
    if (data.imageUrl !== undefined) { updates.push('image_url = ?'); values.push(data.imageUrl); }
    if (data.colorTheme !== undefined) { updates.push('color_theme = ?'); values.push(data.colorTheme); }
    if (data.badge !== undefined) { updates.push('badge = ?'); values.push(data.badge); }
    if (data.isActive !== undefined) { updates.push('is_active = ?'); values.push(data.isActive); }
    if (data.sortOrder !== undefined) { updates.push('sort_order = ?'); values.push(data.sortOrder); }

    if (updates.length === 0) {
      res.status(400).json({ success: false, message: 'No fields to update' });
      return;
    }

    values.push(id);
    await query(`UPDATE mystery_boxes SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ success: true, message: 'อัปเดตกล่องสุ่มสำเร็จ' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function deleteBox(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await query(`DELETE FROM mystery_boxes WHERE id = ?`, [id]);
    res.json({ success: true, message: 'ลบกล่องสุ่มเรียบร้อยแล้ว' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function setBoxRewards(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { rewardMappings } = req.body as { rewardMappings: Array<{ rewardId: number; weight: number }> };

    if (!Array.isArray(rewardMappings)) {
      res.status(400).json({ success: false, message: 'rewardMappings must be an array' });
      return;
    }

    // Delete existing mappings
    await query(`DELETE FROM mystery_box_rewards WHERE box_id = ?`, [id]);

    // Insert new mappings
    for (const m of rewardMappings) {
      if (m.rewardId && m.weight > 0) {
        await query(
          `INSERT INTO mystery_box_rewards (box_id, reward_id, weight, is_active) VALUES (?, ?, ?, 1)`,
          [id, m.rewardId, m.weight]
        );
      }
    }

    res.json({ success: true, message: 'อัปเดตรายการของรางวัลและความน่าจะเป็นสำเร็จ' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function getBoxesDrawHistory(req: Request, res: Response): Promise<void> {
  try {
    const rows: any = await query(
      `SELECT dh.id, dh.user_id, u.username, u.email, dh.box_id, dh.box_name, dh.reward_id, dh.reward_name, dh.reward_type, dh.reward_value, dh.rarity, dh.cost, dh.reward_image_url, dh.created_at
       FROM draw_histories dh
       JOIN users u ON dh.user_id = u.id
       ORDER BY dh.created_at DESC
       LIMIT 50`
    );

    res.json({ success: true, data: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
