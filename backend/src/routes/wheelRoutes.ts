import { Router } from 'express';
import {
  getWheelPool,
  spinWheel,
  getWheelHistory,
  getAdminWheelItems,
  createAdminWheelItem,
  updateAdminWheelItem,
  deleteAdminWheelItem,
  batchUpdateAdminWheelItems,
} from '../controllers/wheelController';
import { authenticateUser, optionalAuthenticateUser, authenticateAdmin } from '../middleware/auth';

const router = Router();

// Storefront routes
router.get('/', optionalAuthenticateUser, getWheelPool);
router.post('/spin', authenticateUser, spinWheel);
router.get('/history', authenticateUser, getWheelHistory);

// Admin routes
router.get('/admin/items', authenticateAdmin, getAdminWheelItems);
router.post('/admin/items', authenticateAdmin, createAdminWheelItem);
router.put('/admin/items/batch', authenticateAdmin, batchUpdateAdminWheelItems);
router.put('/admin/items/:id', authenticateAdmin, updateAdminWheelItem);
router.delete('/admin/items/:id', authenticateAdmin, deleteAdminWheelItem);

export default router;
