import { Router } from 'express';
import { getWalletBalance, getWalletTransactions, topupWallet } from '../controllers/walletController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/balance', authenticateUser, getWalletBalance);
router.get('/transactions', authenticateUser, getWalletTransactions);
router.post('/topup', authenticateUser, topupWallet);

export default router;
