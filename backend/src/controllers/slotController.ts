import { Response } from 'express';
import { SlotService } from '../services/slotService';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getSlotConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const data = await SlotService.getConfig(req.user?.id);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function spinSlot(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อนเล่นสล็อต' });
      return;
    }
    const bet = Number(req.body?.bet);
    const result = await SlotService.spin(req.user.id, bet);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function getSlotHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const limit = parseInt(String(req.query.limit || '20'), 10) || 20;
    const data = await SlotService.getHistory(req.user.id, limit);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getSlotBigWins(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const data = await SlotService.getRecentBigWins(10);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
