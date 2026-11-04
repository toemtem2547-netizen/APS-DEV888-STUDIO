import { Router } from 'express';
import { getActivePromotions, validateCoupon } from '../controllers/promotionController';

const router = Router();

router.get('/', getActivePromotions);
router.post('/validate-coupon', validateCoupon);

export default router;
