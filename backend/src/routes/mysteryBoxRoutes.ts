import { Router } from 'express';
import { getActiveBoxes, getBoxDetails, drawBox, getRecentWins } from '../controllers/mysteryBoxController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/', getActiveBoxes);
router.get('/recent-wins', getRecentWins);
router.get('/:id', getBoxDetails);
router.post('/:id/draw', authenticateUser, drawBox);

export default router;
