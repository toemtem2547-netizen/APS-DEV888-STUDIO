import { Router } from 'express';
import { adminLogin, getAdminMe } from '../controllers/adminAuthController';
import { getDashboardMetrics } from '../controllers/dashboardController';
import { getAllPackages, createPackage, updatePackage, deletePackage } from '../controllers/packageController';
import { getAllBoxes, createBox, updateBox, deleteBox, setBoxRewards, getBoxesDrawHistory } from '../controllers/mysteryBoxController';
import { getAllRewards, createReward, updateReward, deleteReward } from '../controllers/rewardController';
import { getAllPromotions, createPromotion, updatePromotion, deletePromotion } from '../controllers/promotionController';
import { getAdminOrders, updateOrderStatus } from '../controllers/orderController';
import { getAdminUsers, getUserDetails, toggleUserStatus, adjustUserWallet, getAdminsList, createAdminUser } from '../controllers/userAdminController';
import { adminGetGachaItems, adminCreateGachaItem, adminUpdateGachaItem, adminDeleteGachaItem, adminBatchUpdateGachaItems } from '../controllers/gachaController';
import { updateSettings } from '../controllers/settingsController';
import { getGameOverview } from '../controllers/gameAdminController';
import { uploadImage } from '../controllers/uploadController';
import { authenticateAdmin, requirePermission } from '../middleware/auth';

const router = Router();

// Image Upload (Computer / Mobile device files)
router.post('/upload-image', uploadImage);

// Public Admin Auth
router.post('/auth/login', adminLogin);

// Protected Admin Routes
router.use(authenticateAdmin);

router.get('/auth/me', getAdminMe);

// Dashboard
router.get('/dashboard', requirePermission('dashboard.view'), getDashboardMetrics);

// Packages
router.get('/packages', requirePermission('packages.manage'), getAllPackages);
router.post('/packages', requirePermission('packages.manage'), createPackage);
router.put('/packages/:id', requirePermission('packages.manage'), updatePackage);
router.delete('/packages/:id', requirePermission('packages.manage'), deletePackage);

// Mystery Boxes
router.get('/mystery-boxes', requirePermission('boxes.manage'), getAllBoxes);
router.get('/mystery-boxes/history', requirePermission('boxes.manage'), getBoxesDrawHistory);
router.post('/mystery-boxes', requirePermission('boxes.manage'), createBox);
router.put('/mystery-boxes/:id', requirePermission('boxes.manage'), updateBox);
router.delete('/mystery-boxes/:id', requirePermission('boxes.manage'), deleteBox);
router.post('/mystery-boxes/:id/rewards', requirePermission('boxes.manage'), setBoxRewards);

// Gacha Reel Items
router.get('/gacha', requirePermission('boxes.manage'), adminGetGachaItems);
router.get('/gacha/items', requirePermission('boxes.manage'), adminGetGachaItems);
router.post('/gacha', requirePermission('boxes.manage'), adminCreateGachaItem);
router.post('/gacha/items', requirePermission('boxes.manage'), adminCreateGachaItem);
router.put('/gacha/items/batch', requirePermission('boxes.manage'), adminBatchUpdateGachaItems);
router.put('/gacha/batch', requirePermission('boxes.manage'), adminBatchUpdateGachaItems);
router.put('/gacha/:id', requirePermission('boxes.manage'), adminUpdateGachaItem);
router.put('/gacha/items/:id', requirePermission('boxes.manage'), adminUpdateGachaItem);
router.delete('/gacha/:id', requirePermission('boxes.manage'), adminDeleteGachaItem);
router.delete('/gacha/items/:id', requirePermission('boxes.manage'), adminDeleteGachaItem);

// Rewards
router.get('/rewards', requirePermission('rewards.manage'), getAllRewards);
router.post('/rewards', requirePermission('rewards.manage'), createReward);
router.put('/rewards/:id', requirePermission('rewards.manage'), updateReward);
router.delete('/rewards/:id', requirePermission('rewards.manage'), deleteReward);

// Promotions
router.get('/promotions', requirePermission('promotions.manage'), getAllPromotions);
router.post('/promotions', requirePermission('promotions.manage'), createPromotion);
router.put('/promotions/:id', requirePermission('promotions.manage'), updatePromotion);
router.delete('/promotions/:id', requirePermission('promotions.manage'), deletePromotion);

// Orders
router.get('/orders', requirePermission('orders.manage'), getAdminOrders);
router.put('/orders/:id/status', requirePermission('orders.manage'), updateOrderStatus);

// Users
router.get('/users', requirePermission('users.manage'), getAdminUsers);
router.get('/users/:id', requirePermission('users.manage'), getUserDetails);
router.put('/users/:id/status', requirePermission('users.manage'), toggleUserStatus);
router.post('/users/:id/wallet', requirePermission('users.manage'), adjustUserWallet);

// Admins & Roles
router.get('/admins', requirePermission('admins.manage'), getAdminsList);
router.post('/admins', requirePermission('admins.manage'), createAdminUser);

// Game Management Overview
router.get('/games/overview', requirePermission('settings.manage'), getGameOverview);

// Settings
router.put('/settings', requirePermission('settings.manage'), updateSettings);

export default router;
