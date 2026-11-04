import { getConnection, query } from '../config/db';
import { WalletService } from './walletService';
import { PaymentMethod } from '../types';

export interface CreateOrderParams {
  userId: number;
  playerId: string;
  packageId: number;
  paymentMethod: PaymentMethod;
  couponCode?: string;
}

export class OrderService {
  static async createOrder(params: CreateOrderParams) {
    const { userId, packageId, paymentMethod, couponCode } = params;
    const playerId = (params.playerId && params.playerId.trim().length > 0) ? params.playerId.trim() : 'บัญชีสมาชิกเว็บ';

    const conn = await getConnection();

    try {
      await conn.beginTransaction();

      // 1. Fetch package details
      const [pkgRows]: any = await conn.query(
        `SELECT id, name, coins, price, bonus_coins, is_active FROM packages WHERE id = ? FOR UPDATE`,
        [packageId]
      );

      if (!pkgRows || pkgRows.length === 0) {
        throw new Error('ไม่พบแพ็กเกจที่เลือก');
      }

      const pkg = pkgRows[0];
      if (!pkg.is_active) {
        throw new Error('แพ็กเกจนี้ปิดให้บริการชั่วคราว');
      }

      const originalPrice = parseFloat(pkg.price);
      let discountAmount = 0.00;

      // 2. Validate Coupon if provided
      if (couponCode && couponCode.trim().length > 0) {
        const [couponRows]: any = await conn.query(
          `SELECT id, code, discount_amount, discount_percent, min_spend, max_uses, current_uses, expires_at, is_active
           FROM coupons WHERE code = ? FOR UPDATE`,
          [couponCode.trim().toUpperCase()]
        );

        if (couponRows && couponRows.length > 0) {
          const coupon = couponRows[0];
          const now = new Date();
          const isExpired = coupon.expires_at && new Date(coupon.expires_at) < now;
          const isUsageExceeded = coupon.max_uses > 0 && coupon.current_uses >= coupon.max_uses;

          if (coupon.is_active && !isExpired && !isUsageExceeded && originalPrice >= parseFloat(coupon.min_spend)) {
            if (coupon.discount_percent > 0) {
              discountAmount = Number(((originalPrice * coupon.discount_percent) / 100).toFixed(2));
            } else if (coupon.discount_amount > 0) {
              discountAmount = parseFloat(coupon.discount_amount);
            }
            // Increment coupon usage
            await conn.query(`UPDATE coupons SET current_uses = current_uses + 1 WHERE id = ?`, [coupon.id]);
          }
        }
      }

      const finalPrice = Math.max(0, Number((originalPrice - discountAmount).toFixed(2)));
      const orderId = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // 3. Process Payment
      if (paymentMethod === 'WALLET') {
        // Deduct from wallet atomically inside this transaction
        await WalletService.deduct(
          userId,
          finalPrice,
          'PURCHASE',
          `เติมเกมแพ็กเกจ: ${pkg.name} (UID: ${playerId.trim()})`,
          'ORDER',
          orderId,
          conn
        );
      }

      // 4. Create Order Record
      const totalCoins = pkg.coins + (pkg.bonus_coins || 0);
      const initialStatus = 'COMPLETED'; // Auto delivery simulation

      await conn.query(
        `INSERT INTO orders
         (id, user_id, player_id, package_id, package_name, coins_amount, price, discount_amount, final_price, payment_method, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          userId,
          playerId.trim(),
          pkg.id,
          pkg.name,
          totalCoins,
          originalPrice,
          discountAmount,
          finalPrice,
          paymentMethod,
          initialStatus,
        ]
      );

      // 5. Update user's default player_id if not present
      await conn.query(`UPDATE users SET player_id = ? WHERE id = ? AND (player_id IS NULL OR player_id = '')`, [
        playerId.trim(),
        userId,
      ]);

      await conn.commit();

      return {
        orderId,
        playerId: playerId.trim(),
        packageName: pkg.name,
        coinsReceived: totalCoins,
        originalPrice,
        discountAmount,
        finalPrice,
        paymentMethod,
        status: initialStatus,
        createdAt: new Date().toISOString(),
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  static async getUserOrders(userId: number, limit = 50, offset = 0) {
    return await query(
      `SELECT id, player_id, package_name, coins_amount, price, discount_amount, final_price, payment_method, status, created_at
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
  }

  static async getOrderById(orderId: string, userId?: number) {
    let sql = `SELECT * FROM orders WHERE id = ?`;
    const params: any[] = [orderId];

    if (userId) {
      sql += ` AND user_id = ?`;
      params.push(userId);
    }

    const rows: any = await query(sql, params);
    return rows && rows.length > 0 ? rows[0] : null;
  }
}
