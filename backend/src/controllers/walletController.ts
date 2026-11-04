import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';
import { WalletService } from '../services/walletService';
import { query } from '../config/db';

export const topupSchema = z.object({
  amount: z.number().positive('จำนวนเงินต้องมากกว่า 0'),
  paymentMethod: z.enum(['PROMPTPAY', 'CREDIT_CARD', 'TRUE_MONEY']).default('PROMPTPAY'),
});

export async function getWalletBalance(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { balance } = await WalletService.getBalance(req.user.id);

    res.json({
      success: true,
      data: {
        userId: req.user.id,
        balance,
        currency: '฿',
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getWalletTransactions(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const txs = await WalletService.getHistory(req.user.id, limit, offset);

    res.json({
      success: true,
      data: txs.map(t => ({
        id: t.id,
        type: t.type,
        amount: parseFloat(t.amount),
        balanceAfter: parseFloat(t.balance_after),
        referenceType: t.reference_type,
        referenceId: t.reference_id,
        description: t.description,
        createdAt: t.created_at,
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function topupWallet(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { amount, paymentMethod } = topupSchema.parse(req.body);

    // Calculate top-up bonus if applicable (e.g. >= 500 get 5% bonus, >= 1000 get 10% bonus)
    let bonusAmount = 0;
    if (amount >= 1000) {
      bonusAmount = Number((amount * 0.10).toFixed(2));
    } else if (amount >= 500) {
      bonusAmount = Number((amount * 0.05).toFixed(2));
    }

    const totalCredited = Number((amount + bonusAmount).toFixed(2));
    const refCode = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Record topup transaction
    await query(
      `INSERT INTO topup_transactions (id, user_id, amount, bonus_amount, total_credit, payment_method, status, reference_code)
       VALUES (?, ?, ?, ?, ?, ?, 'COMPLETED', ?)`,
      [refCode, req.user.id, amount, bonusAmount, totalCredited, paymentMethod, refCode]
    );

    // Atomically credit wallet
    const { newBalance } = await WalletService.credit(
      req.user.id,
      totalCredited,
      'TOPUP',
      `เติมเงินเครดิต ฿${amount.toFixed(2)}${bonusAmount > 0 ? ` (แถมโบนัส ฿${bonusAmount.toFixed(2)})` : ''} ผ่าน ${paymentMethod}`,
      'TOPUP',
      refCode
    );

    res.json({
      success: true,
      message: `เติมเงินสำเร็จ! ได้รับเครดิต ฿${totalCredited.toFixed(2)}`,
      data: {
        amount,
        bonusAmount,
        totalCredited,
        referenceCode: refCode,
        newBalance,
      }
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}
