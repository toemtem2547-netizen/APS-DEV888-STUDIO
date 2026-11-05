import { Router } from 'express';
import { getSlotConfig, spinSlot, getSlotHistory, getSlotBigWins } from '../controllers/slotController';
import { authenticateUser, optionalAuthenticateUser } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuthenticateUser, getSlotConfig);
router.post('/spin', authenticateUser, spinSlot);
router.get('/history', authenticateUser, getSlotHistory);
router.get('/big-wins', getSlotBigWins);

export default router;
