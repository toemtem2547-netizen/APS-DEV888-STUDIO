import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';
import { OrderService } from '../services/orderService';
import { query } from '../config/db';

export const createOrderSchema = z.object({
  playerId: z.string().optional().default('บัญชีเว็บ'),
  packageId: z.number().int().positive('Valid package ID is required'),
  paymentMethod: z.enum(['WALLET', 'PROMPTPAY', 'CREDIT_CARD']).default('WALLET'),
  couponCode: z.string().optional(),
});

export async function createOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ' });
      return;
    }

    const { playerId, packageId, paymentMethod, couponCode } = createOrderSchema.parse(req.body);

    const result = await OrderService.createOrder({
      userId: req.user.id,
      playerId,
      packageId,
      paymentMethod,
      couponCode,
    });

    res.status(201).json({
      success: true,
      message: 'ทำรายการสั่งซื้อสำเร็จ เติมเหรียญเข้า UID ของท่านเรียบร้อยแล้ว',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function getMyOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const orders = await OrderService.getUserOrders(req.user.id, limit, offset);

    res.json({
      success: true,
      data: orders.map((o: any) => ({
        id: o.id,
        playerId: o.player_id,
        packageName: o.package_name,
        coinsAmount: o.coins_amount,
        price: parseFloat(o.price),
        discountAmount: parseFloat(o.discount_amount),
        finalPrice: parseFloat(o.final_price),
        paymentMethod: o.payment_method,
        status: o.status,
        createdAt: o.created_at,
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getOrderDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.admin ? undefined : req.user?.id;
    const order = await OrderService.getOrderById(id, userId);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    res.json({ success: true, data: order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getAdminOrders(req: Request, res: Response): Promise<void> {
  try {
    const status = req.query.status as string;
    const search = req.query.search as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    let sql = `
      SELECT o.id, o.user_id, o.player_id, o.package_id, o.package_name, o.coins_amount,
             o.price, o.discount_amount, o.final_price, o.payment_method, o.status,
             o.created_at, o.updated_at, u.username, u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'ALL') {
      sql += ` AND o.status = ?`;
      params.push(status);
    }

    if (search && search.trim().length > 0) {
      sql += ` AND (o.id LIKE ? OR o.player_id LIKE ? OR u.username LIKE ? OR u.email LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    sql += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const orders: any = await query(sql, params);

    // Get total count for pagination
    let countSql = `SELECT COUNT(*) as total FROM orders o JOIN users u ON o.user_id = u.id WHERE 1=1`;
    const countParams: any[] = [];
    if (status && status !== 'ALL') {
      countSql += ` AND o.status = ?`;
      countParams.push(status);
    }
    if (search && search.trim().length > 0) {
      countSql += ` AND (o.id LIKE ? OR o.player_id LIKE ? OR u.username LIKE ? OR u.email LIKE ?)`;
      const term = `%${search.trim()}%`;
      countParams.push(term, term, term, term);
    }
    const totalRes: any = await query(countSql, countParams);
    const total = totalRes[0]?.total || 0;

    res.json({
      success: true,
      data: orders.map((o: any) => ({
        id: o.id,
        userId: o.user_id,
        username: o.username,
        email: o.email,
        playerId: o.player_id,
        packageId: o.package_id,
        packageName: o.package_name,
        coinsAmount: o.coins_amount,
        price: parseFloat(o.price),
        discountAmount: parseFloat(o.discount_amount),
        finalPrice: parseFloat(o.final_price),
        paymentMethod: o.payment_method,
        status: o.status,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
      })),
      pagination: { total, limit, offset }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'FAILED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    await query(`UPDATE orders SET status = ? WHERE id = ?`, [status, id]);

    res.json({ success: true, message: `อัปเดตสถานะคำสั่งซื้อเป็น ${status} เรียบร้อยแล้ว` });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}
