import { PoolConnection } from 'mysql2/promise';
import { query, getConnection } from '../config/db';
import { TransactionType } from '../types';

export class WalletService {
  /**
   * Get current balance for user. Creates wallet if it doesn't exist.
   */
  static async getBalance(userId: number): Promise<{ walletId: number; balance: number }> {
    const rows: any = await query(`SELECT id, balance FROM wallets WHERE user_id = ? LIMIT 1`, [userId]);
    if (rows && rows.length > 0) {
      return { walletId: rows[0].id, balance: parseFloat(rows[0].balance) };
    }

    // Auto-create wallet
    await query(`INSERT IGNORE INTO wallets (user_id, balance) VALUES (?, 0.00)`, [userId]);
    const newRows: any = await query(`SELECT id, balance FROM wallets WHERE user_id = ? LIMIT 1`, [userId]);
    return { walletId: newRows[0].id, balance: parseFloat(newRows[0].balance) };
  }

  /**
   * Atomically deduct balance from user wallet with locking and negative balance prevention.
   */
  static async deduct(
    userId: number,
    amount: number,
    type: TransactionType,
    description: string,
    refType?: string,
    refId?: string,
    conn?: PoolConnection
  ): Promise<{ newBalance: number; transactionId: number }> {
    if (amount <= 0) {
      throw new Error('Deduction amount must be greater than zero');
    }

    const runWithConn = async (c: PoolConnection) => {
      // Lock wallet row
      const [rows]: any = await c.query(
        `SELECT id, balance FROM wallets WHERE user_id = ? FOR UPDATE`,
        [userId]
      );

      if (!rows || rows.length === 0) {
        throw new Error('Wallet not found');
      }

      const walletId = rows[0].id;
      const currentBalance = parseFloat(rows[0].balance);

      if (currentBalance < amount) {
        throw new Error(`ยอดเครดิตคงเหลือไม่เพียงพอ (ต้องการ ฿${amount.toFixed(2)} ยอดปัจจุบัน ฿${currentBalance.toFixed(2)})`);
      }

      const newBalance = Number((currentBalance - amount).toFixed(2));

      await c.query(`UPDATE wallets SET balance = ? WHERE id = ?`, [newBalance, walletId]);

      const [txResult]: any = await c.query(
        `INSERT INTO wallet_transactions
         (wallet_id, user_id, type, amount, balance_after, reference_type, reference_id, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [walletId, userId, type, -amount, newBalance, refType || null, refId || null, description]
      );

      return { newBalance, transactionId: txResult.insertId };
    };

    if (conn) {
      return await runWithConn(conn);
    } else {
      const c = await getConnection();
      try {
        await c.beginTransaction();
        const res = await runWithConn(c);
        await c.commit();
        return res;
      } catch (err) {
        await c.rollback();
        throw err;
      } finally {
        c.release();
      }
    }
  }

  /**
   * Atomically add credit/balance to user wallet.
   */
  static async credit(
    userId: number,
    amount: number,
    type: TransactionType,
    description: string,
    refType?: string,
    refId?: string,
    conn?: PoolConnection
  ): Promise<{ newBalance: number; transactionId: number }> {
    if (amount <= 0) {
      throw new Error('Credit amount must be greater than zero');
    }

    const runWithConn = async (c: PoolConnection) => {
      // Ensure wallet exists
      await c.query(`INSERT IGNORE INTO wallets (user_id, balance) VALUES (?, 0.00)`, [userId]);

      const [rows]: any = await c.query(
        `SELECT id, balance FROM wallets WHERE user_id = ? FOR UPDATE`,
        [userId]
      );

      const walletId = rows[0].id;
      const currentBalance = parseFloat(rows[0].balance);
      const newBalance = Number((currentBalance + amount).toFixed(2));

      await c.query(`UPDATE wallets SET balance = ? WHERE id = ?`, [newBalance, walletId]);

      const [txResult]: any = await c.query(
        `INSERT INTO wallet_transactions
         (wallet_id, user_id, type, amount, balance_after, reference_type, reference_id, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [walletId, userId, type, amount, newBalance, refType || null, refId || null, description]
      );

      return { newBalance, transactionId: txResult.insertId };
    };

    if (conn) {
      return await runWithConn(conn);
    } else {
      const c = await getConnection();
      try {
        await c.beginTransaction();
        const res = await runWithConn(c);
        await c.commit();
        return res;
      } catch (err) {
        await c.rollback();
        throw err;
      } finally {
        c.release();
      }
    }
  }

  /**
   * Get transaction history for user.
   */
  static async getHistory(userId: number, limit = 50, offset = 0): Promise<any[]> {
    return await query(
      `SELECT id, type, amount, balance_after, reference_type, reference_id, description, created_at
       FROM wallet_transactions
       WHERE user_id = ?
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
  }
}
