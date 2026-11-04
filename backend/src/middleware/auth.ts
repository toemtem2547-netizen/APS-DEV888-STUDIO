import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { query } from '../config/db';
import { AuthUser, AuthAdmin } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  admin?: AuthAdmin;
}

export async function authenticateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authorization header missing or invalid' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as { id: number; username: string };

    const users: any = await query(
      `SELECT id, username, email, player_id, is_active FROM users WHERE id = ? LIMIT 1`,
      [decoded.id]
    );

    if (!users || users.length === 0) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    if (!users[0].is_active) {
      res.status(403).json({ success: false, message: 'This account has been suspended by administration' });
      return;
    }

    req.user = {
      id: users[0].id,
      username: users[0].username,
      email: users[0].email,
      player_id: users[0].player_id,
    };

    next();
  } catch (err: any) {
    res.status(401).json({ success: false, message: 'Invalid or expired session token' });
  }
}

export async function optionalAuthenticateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as { id: number; username: string };
      const users: any = await query(`SELECT id, username, email, player_id, is_active FROM users WHERE id = ? LIMIT 1`, [decoded.id]);
      if (users && users.length > 0 && users[0].is_active) {
        req.user = {
          id: users[0].id,
          username: users[0].username,
          email: users[0].email,
          player_id: users[0].player_id,
        };
      }
    }
  } catch (err) {
    // optional token, continue
  }
  next();
}

export async function authenticateAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Admin authentication required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, ENV.ADMIN_JWT_SECRET) as { id: number; username: string };

    const admins: any = await query(
      `SELECT a.id, a.username, a.email, a.full_name, a.role_id, a.is_active, r.name as role_name
       FROM admins a
       JOIN roles r ON a.role_id = r.id
       WHERE a.id = ? LIMIT 1`,
      [decoded.id]
    );

    if (!admins || admins.length === 0) {
      res.status(401).json({ success: false, message: 'Admin not found' });
      return;
    }

    if (!admins[0].is_active) {
      res.status(403).json({ success: false, message: 'Admin account has been deactivated' });
      return;
    }

    // Fetch permissions
    const perms: any = await query(
      `SELECT p.code FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role_id = ?`,
      [admins[0].role_id]
    );

    req.admin = {
      id: admins[0].id,
      username: admins[0].username,
      email: admins[0].email,
      role_id: admins[0].role_id,
      role_name: admins[0].role_name,
      full_name: admins[0].full_name,
      permissions: perms.map((p: any) => p.code),
    };

    next();
  } catch (err: any) {
    res.status(401).json({ success: false, message: 'Invalid or expired admin session' });
  }
}

export function requirePermission(permissionCode: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({ success: false, message: 'Admin authorization required' });
      return;
    }

    if (req.admin.role_name === 'super_admin' || req.admin.permissions.includes(permissionCode)) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      message: `Access denied. Requires permission: ${permissionCode}`,
    });
  };
}
