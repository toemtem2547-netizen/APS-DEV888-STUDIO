import { Response } from 'express';
import { z } from 'zod';
import { WheelService } from '../services/wheelService';
import { AuthenticatedRequest } from '../middleware/auth';

export const wheelItemSchema = z.object({
  reward_id: z.number().int().positive('Reward ID is required'),
  label: z.string().min(1, 'Label is required'),
  subtitle: z.string().optional().default(''),
  icon_url: z.string().optional().default(''),
  color: z.string().optional().default('#1E293B'),
  text_color: z.string().optional().default('#FFFFFF'),
  rarity: z.enum(['COMMON', 'RARE', 'EPIC', 'LEGENDARY']).default('COMMON'),
  weight: z.number().positive('Rate must be positive'),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export async function getWheelPool(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const pool = await WheelService.getPool(userId);
    res.json({ success: true, data: pool });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function spinWheel(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำการหมุนวงล้อ' });
      return;
    }

    const result = await WheelService.spin(req.user.id);
    res.json({
      success: true,
      message: `ผลการหมุนวงล้อ: ${result.winningItem.label}`,
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function getWheelHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const history = await WheelService.getHistory(req.user.id);
    res.json({ success: true, data: history });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getAdminWheelItems(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const items = await WheelService.getAllAdminItems();
    res.json({ success: true, data: items });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createAdminWheelItem(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const data = wheelItemSchema.parse(req.body);
    const id = await WheelService.createItem(data);
    res.json({ success: true, message: 'สร้างช่องรางวัลบนวงล้อสำเร็จ', data: { id } });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function updateAdminWheelItem(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    const data = wheelItemSchema.parse(req.body);
    await WheelService.updateItem(id, data);
    res.json({ success: true, message: 'อัปเดตช่องรางวัลสำเร็จ' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function deleteAdminWheelItem(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    await WheelService.deleteItem(id);
    res.json({ success: true, message: 'ลบช่องรางวัลเรียบร้อย' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function batchUpdateAdminWheelItems(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      res.status(400).json({ success: false, message: 'items array is required' });
      return;
    }
    await WheelService.batchUpdatePool(items);
    res.json({ success: true, message: 'บันทึกของรางวัลและอัตราเรทสุ่มสำเร็จ!' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

