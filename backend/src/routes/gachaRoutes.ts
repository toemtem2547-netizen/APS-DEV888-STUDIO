import { Router } from 'express';
import { getGachaPool, spinGacha, getGachaHistory } from '../controllers/gachaController';
import { authenticateUser, optionalAuthenticateUser } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuthenticateUser, getGachaPool);
router.post('/spin', authenticateUser, spinGacha);
router.get('/history', authenticateUser, getGachaHistory);

export default router;
