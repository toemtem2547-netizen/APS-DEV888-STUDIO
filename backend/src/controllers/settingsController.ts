import { Request, Response } from 'express';
import { query } from '../config/db';

export async function getSettings(req: Request, res: Response): Promise<void> {
  try {
    const rows: any = await query(`SELECT key_name, value, description FROM settings`);
    const settingsMap: Record<string, string> = {};

    for (const r of rows) {
      settingsMap[r.key_name] = r.value;
    }

    res.json({
      success: true,
      data: settingsMap,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateSettings(req: Request, res: Response): Promise<void> {
  try {
    const settingsObj = req.body as Record<string, string>;

    for (const [key, val] of Object.entries(settingsObj)) {
      if (typeof val === 'string') {
        await query(
          `INSERT INTO settings (key_name, value)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE value = VALUES(value)`,
          [key, val]
        );
      }
    }

    res.json({
      success: true,
      message: 'อัปเดตการตั้งค่าระบบและธีมสำเร็จ ข้อมูลหน้าบ้านจะเปลี่ยนทันที',
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}
