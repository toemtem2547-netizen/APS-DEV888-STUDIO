import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../config/db';
import { ENV } from '../config/env';
import { AuthenticatedRequest } from '../middleware/auth';

export const adminLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export async function adminLogin(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = adminLoginSchema.parse(req.body);

    const admins: any = await query(
      `SELECT a.id, a.username, a.email, a.password_hash, a.role_id, a.full_name, a.is_active, r.name as role_name
       FROM admins a
       JOIN roles r ON a.role_id = r.id
       WHERE a.username = ? OR a.email = ?
       LIMIT 1`,
      [username, username]
    );

    if (!admins || admins.length === 0) {
      res.status(401).json({ success: false, message: 'Invalid admin credentials' });
      return;
    }

    const admin = admins[0];

    if (!admin.is_active) {
      res.status(403).json({ success: false, message: 'Admin account has been deactivated' });
      return;
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid admin credentials' });
      return;
    }

    // Fetch permissions
    const perms: any = await query(
      `SELECT p.code FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = ?`,
      [admin.role_id]
    );

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role_name },
      ENV.ADMIN_JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Admin authentication successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        fullName: admin.full_name,
        roleId: admin.role_id,
        roleName: admin.role_name,
        permissions: perms.map((p: any) => p.code),
      }
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function getAdminMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    res.json({
      success: true,
      admin: req.admin,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
