import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../config/db';
import { ENV } from '../config/env';
import { AuthenticatedRequest } from '../middleware/auth';
import { WalletService } from '../services/walletService';

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(30),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  playerId: z.string().optional(),
});

export const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { username, email, password, playerId } = registerSchema.parse(req.body);

    const existing: any = await query(
      `SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1`,
      [username, email]
    );

    if (existing && existing.length > 0) {
      res.status(409).json({ success: false, message: 'Username หรือ Email นี้ถูกใช้งานแล้วในระบบ' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result: any = await query(
      `INSERT INTO users (username, email, password_hash, player_id, is_active)
       VALUES (?, ?, ?, ?, true)`,
      [username, email, passwordHash, playerId || null]
    );

    const userId = result.insertId;

    // Initialize wallet
    await WalletService.getBalance(userId);

    const token = jwt.sign(
      { id: userId, username },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'สมัครสมาชิกสำเร็จ ยินดีต้อนรับเข้าสู่ระบบ',
      token,
      user: {
        id: userId,
        username,
        email,
        playerId: playerId || null,
        walletBalance: 0.00,
      }
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { usernameOrEmail, password } = loginSchema.parse(req.body);

    const users: any = await query(
      `SELECT id, username, email, password_hash, player_id, is_active
       FROM users
       WHERE username = ? OR email = ?
       LIMIT 1`,
      [usernameOrEmail, usernameOrEmail]
    );

    if (!users || users.length === 0) {
      res.status(401).json({ success: false, message: 'ไม่พบบัญชีผู้ใช้ หรือชื่อผู้ใช้ไม่ถูกต้อง' });
      return;
    }

    const user = users[0];

    if (!user.is_active) {
      res.status(403).json({ success: false, message: 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { balance } = await WalletService.getBalance(user.id);

    res.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        playerId: user.player_id,
        walletBalance: balance,
      }
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const users: any = await query(
      `SELECT id, username, email, player_id, created_at FROM users WHERE id = ? LIMIT 1`,
      [req.user.id]
    );

    if (!users || users.length === 0) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const { balance } = await WalletService.getBalance(req.user.id);

    res.json({
      success: true,
      user: {
        ...users[0],
        walletBalance: balance,
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { playerId } = req.body;

    await query(`UPDATE users SET player_id = ? WHERE id = ?`, [playerId || null, req.user.id]);

    res.json({
      success: true,
      message: 'อัปเดตข้อมูลส่วนตัวสำเร็จ',
      playerId,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword || newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร' });
      return;
    }

    const [user]: any = await query(`SELECT password_hash FROM users WHERE id = ?`, [req.user.id]);
    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'รหัสผ่านเดิมไม่ถูกต้อง' });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await query(`UPDATE users SET password_hash = ? WHERE id = ?`, [newHash, req.user.id]);

    res.json({ success: true, message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
