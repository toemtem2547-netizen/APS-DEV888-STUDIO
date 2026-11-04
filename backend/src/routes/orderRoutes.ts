import { Router } from 'express';
import { createOrder, getMyOrders, getOrderDetails } from '../controllers/orderController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.post('/', authenticateUser, createOrder);
router.get('/my-orders', authenticateUser, getMyOrders);
router.get('/:id', authenticateUser, getOrderDetails);

export default router;
