import { Request, Response } from 'express';
import { z } from 'zod';
import { query } from '../config/db';

export const packageSchema = z.object({
  name: z.string().min(1, 'Package name is required'),
  coins: z.number().int().positive('Coins must be positive'),
  price: z.number().positive('Price must be positive'),
  bonusCoins: z.number().int().nonnegative().default(0),
  imageUrl: z.string().optional().default(''),
  badge: z.string().optional().nullable(),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export async function getActivePackages(req: Request, res: Response): Promise<void> {
  try {
    const packages: any = await query(
      `SELECT id, name, coins, price, bonus_coins, image_url, badge, is_popular, sort_order
       FROM packages
       WHERE is_active = 1
       ORDER BY sort_order ASC, price ASC`
    );

    res.json({
      success: true,
      data: packages.map((p: any) => ({
        id: p.id,
        name: p.name,
        coins: p.coins,
        price: parseFloat(p.price),
        bonusCoins: p.bonus_coins,
        imageUrl: p.image_url,
        badge: p.badge,
        isPopular: Boolean(p.is_popular),
        sortOrder: p.sort_order,
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getAllPackages(req: Request, res: Response): Promise<void> {
  try {
    const packages: any = await query(
      `SELECT id, name, coins, price, bonus_coins, image_url, badge, is_popular, is_active, sort_order, created_at
       FROM packages
       ORDER BY sort_order ASC, id DESC`
    );

    res.json({
      success: true,
      data: packages.map((p: any) => ({
        id: p.id,
        name: p.name,
        coins: p.coins,
        price: parseFloat(p.price),
        bonusCoins: p.bonus_coins,
        imageUrl: p.image_url,
        badge: p.badge,
        isPopular: Boolean(p.is_popular),
        isActive: Boolean(p.is_active),
        sortOrder: p.sort_order,
        createdAt: p.created_at,
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createPackage(req: Request, res: Response): Promise<void> {
  try {
    const data = packageSchema.parse(req.body);

    const result: any = await query(
      `INSERT INTO packages (name, coins, price, bonus_coins, image_url, badge, is_popular, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.coins,
        data.price,
        data.bonusCoins,
        data.imageUrl,
        data.badge || null,
        data.isPopular,
        data.isActive,
        data.sortOrder,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'สร้างแพ็กเกจสำเร็จ',
      packageId: result.insertId,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function updatePackage(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const data = packageSchema.partial().parse(req.body);

    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name); }
    if (data.coins !== undefined) { updates.push('coins = ?'); values.push(data.coins); }
    if (data.price !== undefined) { updates.push('price = ?'); values.push(data.price); }
    if (data.bonusCoins !== undefined) { updates.push('bonus_coins = ?'); values.push(data.bonusCoins); }
    if (data.imageUrl !== undefined) { updates.push('image_url = ?'); values.push(data.imageUrl); }
    if (data.badge !== undefined) { updates.push('badge = ?'); values.push(data.badge); }
    if (data.isPopular !== undefined) { updates.push('is_popular = ?'); values.push(data.isPopular); }
    if (data.isActive !== undefined) { updates.push('is_active = ?'); values.push(data.isActive); }
    if (data.sortOrder !== undefined) { updates.push('sort_order = ?'); values.push(data.sortOrder); }

    if (updates.length === 0) {
      res.status(400).json({ success: false, message: 'No fields to update' });
      return;
    }

    values.push(id);
    await query(`UPDATE packages SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ success: true, message: 'อัปเดตแพ็กเกจสำเร็จ' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function deletePackage(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await query(`DELETE FROM packages WHERE id = ?`, [id]);
    res.json({ success: true, message: 'ลบแพ็กเกจเรียบร้อยแล้ว' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
