import { Request, Response } from 'express';
import { z } from 'zod';
import { query } from '../config/db';

export const promotionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional().default(''),
  bannerUrl: z.string().optional().default(''),
  promoType: z.enum(['DISCOUNT', 'BONUS', 'FLASH_SALE']).default('DISCOUNT'),
  discountPercent: z.number().int().nonnegative().default(0),
  bonusPercent: z.number().int().nonnegative().default(0),
  minSpend: z.number().nonnegative().default(0),
  code: z.string().optional().nullable(),
  maxUses: z.number().int().nonnegative().default(0),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export async function getActivePromotions(req: Request, res: Response): Promise<void> {
  try {
    const promos: any = await query(
      `SELECT id, title, subtitle, banner_url, promo_type, discount_percent, bonus_percent, min_spend, code, start_date, end_date
       FROM promotions
       WHERE is_active = 1
       ORDER BY id DESC`
    );

    res.json({
      success: true,
      data: promos.map((p: any) => ({
        id: p.id,
        title: p.title,
        subtitle: p.subtitle,
        bannerUrl: p.banner_url,
        promoType: p.promo_type,
        discountPercent: p.discount_percent,
        bonusPercent: p.bonus_percent,
        minSpend: parseFloat(p.min_spend),
        code: p.code,
        startDate: p.start_date,
        endDate: p.end_date,
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function validateCoupon(req: Request, res: Response): Promise<void> {
  try {
    const { code, amount } = req.body;
    if (!code) {
      res.status(400).json({ success: false, message: 'Coupon code required' });
      return;
    }

    const currentAmount = parseFloat(amount) || 0;
    const coupons: any = await query(
      `SELECT id, code, discount_amount, discount_percent, min_spend, max_uses, current_uses, expires_at, is_active
       FROM coupons WHERE code = ? LIMIT 1`,
      [code.trim().toUpperCase()]
    );

    if (!coupons || coupons.length === 0) {
      res.status(404).json({ success: false, message: 'คูปองส่วนลดไม่ถูกต้องหรือไม่มีในระบบ' });
      return;
    }

    const coupon = coupons[0];

    if (!coupon.is_active) {
      res.status(400).json({ success: false, message: 'คูปองนี้ปิดการใช้งานแล้ว' });
      return;
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      res.status(400).json({ success: false, message: 'คูปองนี้หมดอายุการใช้งานแล้ว' });
      return;
    }

    if (coupon.max_uses > 0 && coupon.current_uses >= coupon.max_uses) {
      res.status(400).json({ success: false, message: 'สิทธิ์การใช้งานคูปองนี้เต็มแล้ว' });
      return;
    }

    if (currentAmount < parseFloat(coupon.min_spend)) {
      res.status(400).json({
        success: false,
        message: `ยอดสั่งซื้อขั้นต่ำสำหรับคูปองนี้คือ ฿${parseFloat(coupon.min_spend).toFixed(2)}`
      });
      return;
    }

    let discount = 0;
    if (coupon.discount_percent > 0) {
      discount = Number(((currentAmount * coupon.discount_percent) / 100).toFixed(2));
    } else if (coupon.discount_amount > 0) {
      discount = parseFloat(coupon.discount_amount);
    }

    res.json({
      success: true,
      message: 'ใช้คูปองส่วนลดสำเร็จ',
      data: {
        code: coupon.code,
        discountAmount: discount,
        discountPercent: coupon.discount_percent,
        finalAmount: Math.max(0, Number((currentAmount - discount).toFixed(2))),
      }
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function getAllPromotions(req: Request, res: Response): Promise<void> {
  try {
    const promos: any = await query(`SELECT * FROM promotions ORDER BY id DESC`);
    const coupons: any = await query(`SELECT * FROM coupons ORDER BY id DESC`);

    res.json({
      success: true,
      data: {
        promotions: promos.map((p: any) => ({
          id: p.id,
          title: p.title,
          subtitle: p.subtitle,
          bannerUrl: p.banner_url,
          promoType: p.promo_type,
          discountPercent: p.discount_percent || 0,
          bonusPercent: p.bonus_percent || 0,
          minSpend: parseFloat(p.min_spend) || 0,
          code: p.code,
          maxUses: p.max_uses,
          currentUses: p.current_uses,
          startDate: p.start_date,
          endDate: p.end_date,
          isActive: Boolean(p.is_active),
          createdAt: p.created_at,
        })),
        coupons: coupons.map((c: any) => ({
          id: c.id,
          code: c.code,
          discountAmount: parseFloat(c.discount_amount) || 0,
          discountPercent: c.discount_percent || 0,
          minSpend: parseFloat(c.min_spend) || 0,
          maxUses: c.max_uses,
          currentUses: c.current_uses,
          expiresAt: c.expires_at,
          isActive: Boolean(c.is_active),
          createdAt: c.created_at,
        }))
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createPromotion(req: Request, res: Response): Promise<void> {
  try {
    const data = promotionSchema.parse(req.body);

    const result: any = await query(
      `INSERT INTO promotions (title, subtitle, banner_url, promo_type, discount_percent, bonus_percent, min_spend, code, max_uses, start_date, end_date, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.subtitle,
        data.bannerUrl,
        data.promoType,
        data.discountPercent,
        data.bonusPercent,
        data.minSpend,
        data.code || null,
        data.maxUses,
        data.startDate || null,
        data.endDate || null,
        data.isActive,
      ]
    );

    res.status(201).json({ success: true, message: 'สร้างโปรโมชั่นสำเร็จ', promotionId: result.insertId });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function updatePromotion(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const data = promotionSchema.partial().parse(req.body);

    const updates: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) { updates.push('title = ?'); values.push(data.title); }
    if (data.subtitle !== undefined) { updates.push('subtitle = ?'); values.push(data.subtitle); }
    if (data.bannerUrl !== undefined) { updates.push('banner_url = ?'); values.push(data.bannerUrl); }
    if (data.promoType !== undefined) { updates.push('promo_type = ?'); values.push(data.promoType); }
    if (data.discountPercent !== undefined) { updates.push('discount_percent = ?'); values.push(data.discountPercent); }
    if (data.bonusPercent !== undefined) { updates.push('bonus_percent = ?'); values.push(data.bonusPercent); }
    if (data.minSpend !== undefined) { updates.push('min_spend = ?'); values.push(data.minSpend); }
    if (data.code !== undefined) { updates.push('code = ?'); values.push(data.code || null); }
    if (data.isActive !== undefined) { updates.push('is_active = ?'); values.push(data.isActive); }

    if (updates.length === 0) {
      res.status(400).json({ success: false, message: 'No fields to update' });
      return;
    }

    values.push(id);
    await query(`UPDATE promotions SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ success: true, message: 'อัปเดตโปรโมชั่นสำเร็จ' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function deletePromotion(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await query(`DELETE FROM promotions WHERE id = ?`, [id]);
    res.json({ success: true, message: 'ลบโปรโมชั่นเรียบร้อยแล้ว' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
