import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query } from '../config/db';
import { WalletService } from '../services/walletService';

export async function getAdminUsers(req: Request, res: Response): Promise<void> {
  try {
    const search = req.query.search as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    let sql = `
      SELECT u.id, u.username, u.email, u.player_id, u.is_active, u.created_at,
             COALESCE(w.balance, 0.00) as wallet_balance,
             (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) as order_count,
             (SELECT COUNT(*) FROM draw_histories dh WHERE dh.user_id = u.id) as draw_count,
             (SELECT COALESCE(SUM(final_price), 0) FROM orders o WHERE o.user_id = u.id AND o.status = 'COMPLETED') as total_spent
      FROM users u
      LEFT JOIN wallets w ON u.id = w.user_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search && search.trim().length > 0) {
      sql += ` AND (u.username LIKE ? OR u.email LIKE ? OR u.player_id LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    sql += ` ORDER BY u.id DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const users: any = await query(sql, params);

    // Count
    let countSql = `SELECT COUNT(*) as total FROM users u WHERE 1=1`;
    const countParams: any[] = [];
    if (search && search.trim().length > 0) {
      countSql += ` AND (u.username LIKE ? OR u.email LIKE ? OR u.player_id LIKE ?)`;
      const term = `%${search.trim()}%`;
      countParams.push(term, term, term);
    }
    const countRes: any = await query(countSql, countParams);
    const total = countRes[0]?.total || 0;

    res.json({
      success: true,
      data: users.map((u: any) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        playerId: u.player_id,
        isActive: Boolean(u.is_active),
        walletBalance: parseFloat(u.wallet_balance),
        orderCount: u.order_count,
        drawCount: u.draw_count,
        totalSpent: parseFloat(u.total_spent),
        createdAt: u.created_at,
      })),
      pagination: { total, limit, offset }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getUserDetails(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const [user]: any = await query(
      `SELECT u.id, u.username, u.email, u.player_id, u.is_active, u.created_at,
              COALESCE(w.balance, 0.00) as wallet_balance
       FROM users u
       LEFT JOIN wallets w ON u.id = w.user_id
       WHERE u.id = ? LIMIT 1`,
      [id]
    );

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const orders: any = await query(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 10`,
      [id]
    );

    const draws: any = await query(
      `SELECT * FROM draw_histories WHERE user_id = ? ORDER BY created_at DESC LIMIT 10`,
      [id]
    );

    const transactions: any = await query(
      `SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
      [id]
    );

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          wallet_balance: parseFloat(user.wallet_balance),
          is_active: Boolean(user.is_active),
        },
        recentOrders: orders,
        recentDraws: draws,
        transactions,
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function toggleUserStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    await query(`UPDATE users SET is_active = ? WHERE id = ?`, [isActive ? 1 : 0, id]);

    res.json({
      success: true,
      message: isActive ? 'เปิดใช้งานบัญชีผู้ใช้แล้ว' : 'ระงับการใช้งานบัญชีผู้ใช้แล้ว',
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function adjustUserWallet(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { action, amount, reason } = req.body; // action: 'ADD' | 'DEDUCT'

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({ success: false, message: 'จำนวนเงินต้องมากกว่า 0' });
      return;
    }

    if (!reason || reason.trim().length === 0) {
      res.status(400).json({ success: false, message: 'กรุณาระบุเหตุผลการปรับยอดเงิน' });
      return;
    }

    const userId = parseInt(id, 10);
    let result;

    if (action === 'ADD') {
      result = await WalletService.credit(
        userId,
        numAmount,
        'ADMIN_ADJUST',
        `Admin เติมเครดิต: ${reason}`,
        'ADMIN_ACTION'
      );
    } else if (action === 'DEDUCT') {
      result = await WalletService.deduct(
        userId,
        numAmount,
        'ADMIN_ADJUST',
        `Admin หักเครดิต: ${reason}`,
        'ADMIN_ACTION'
      );
    } else {
      res.status(400).json({ success: false, message: 'Invalid action. Must be ADD or DEDUCT' });
      return;
    }

    res.json({
      success: true,
      message: 'ปรับยอดเงินในกระเป๋าผู้ใช้สำเร็จ',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function getAdminsList(req: Request, res: Response): Promise<void> {
  try {
    const admins: any = await query(
      `SELECT a.id, a.username, a.email, a.full_name, a.role_id, a.is_active, a.created_at, r.name as role_name
       FROM admins a
       JOIN roles r ON a.role_id = r.id
       ORDER BY a.id ASC`
    );

    const roles: any = await query(`SELECT * FROM roles`);

    res.json({
      success: true,
      data: {
        admins: admins.map((a: any) => ({
          id: a.id,
          username: a.username,
          email: a.email,
          fullName: a.full_name,
          roleId: a.role_id,
          roleName: a.role_name,
          isActive: Boolean(a.is_active),
          createdAt: a.created_at,
        })),
        roles,
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createAdminUser(req: Request, res: Response): Promise<void> {
  try {
    const { username, email, password, fullName, roleId } = req.body;

    if (!username || !email || !password || !fullName || !roleId) {
      res.status(400).json({ success: false, message: 'All fields are required' });
      return;
    }

    const hash = await bcrypt.hash(password, 10);
    const result: any = await query(
      `INSERT INTO admins (username, email, password_hash, role_id, full_name, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [username, email, hash, roleId, fullName]
    );

    res.status(201).json({ success: true, message: 'สร้างผู้ดูแลระบบสำเร็จ', adminId: result.insertId });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}
