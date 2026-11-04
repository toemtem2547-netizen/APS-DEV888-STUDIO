import { Router } from 'express';
import { getMyInventory, markRewardUsed } from '../controllers/rewardController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/my-inventory', authenticateUser, getMyInventory);
router.post('/my-inventory/:id/use', authenticateUser, markRewardUsed);

export default router;
