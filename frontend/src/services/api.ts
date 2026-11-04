import axios from 'axios';

export const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API Helper Endpoints
export const platformApi = {
  // Settings
  getSettings: () => api.get('/settings'),

  // Auth
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: any) => api.put('/auth/change-password', data),

  // Packages
  getPackages: () => api.get('/packages'),

  // Mystery Boxes
  getMysteryBoxes: () => api.get('/mystery-boxes'),
  getBoxDetails: (id: number) => api.get(`/mystery-boxes/${id}`),
  drawBox: (id: number) => api.post(`/mystery-boxes/${id}/draw`),
  getRecentWins: () => api.get('/mystery-boxes/recent-wins'),

  // Wallet
  getWalletBalance: () => api.get('/wallet/balance'),
  getWalletTransactions: (limit = 50, offset = 0) => api.get(`/wallet/transactions?limit=${limit}&offset=${offset}`),
  topupWallet: (amount: number, paymentMethod = 'PROMPTPAY') => api.post('/wallet/topup', { amount, paymentMethod }),

  // Orders
  createOrder: (data: { playerId: string; packageId: number; paymentMethod: string; couponCode?: string }) =>
    api.post('/orders', data),
  getMyOrders: (limit = 50, offset = 0) => api.get(`/orders/my-orders?limit=${limit}&offset=${offset}`),
  getOrderDetails: (id: string) => api.get(`/orders/${id}`),

  // Inventory
  getMyInventory: () => api.get('/rewards/my-inventory'),
  markRewardUsed: (id: number) => api.post(`/rewards/my-inventory/${id}/use`),

  // Promotions & Coupons
  getPromotions: () => api.get('/promotions'),
  validateCoupon: (code: string, amount: number) => api.post('/promotions/validate-coupon', { code, amount }),

  // Gacha Lucky Vault
  getGachaPool: () => api.get('/gacha'),
  spinGacha: () => api.post('/gacha/spin'),
  getGachaHistory: (limit = 20) => api.get(`/gacha/history?limit=${limit}`),

  // Lucky Spin Wheel (วงล้อเสี่ยงโชค)
  getWheelPool: () => api.get('/wheel'),
  spinWheel: () => api.post('/wheel/spin'),
  getWheelHistory: (limit = 20) => api.get(`/wheel/history?limit=${limit}`),
};

export default api;
