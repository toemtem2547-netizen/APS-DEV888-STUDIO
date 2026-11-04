import axios from 'axios';

export const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Admin JWT Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminApi = {
  // Auth
  login: (data: any) => api.post('/admin/auth/login', data),
  getMe: () => api.get('/admin/auth/me'),

  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),

  // Packages
  getPackages: () => api.get('/admin/packages'),
  createPackage: (data: any) => api.post('/admin/packages', data),
  updatePackage: (id: number, data: any) => api.put(`/admin/packages/${id}`, data),
  deletePackage: (id: number) => api.delete(`/admin/packages/${id}`),

  // Mystery Boxes
  getMysteryBoxes: () => api.get('/admin/mystery-boxes'),
  getBoxesDrawHistory: () => api.get('/admin/mystery-boxes/history'),
  createMysteryBox: (data: any) => api.post('/admin/mystery-boxes', data),
  updateMysteryBox: (id: number, data: any) => api.put(`/admin/mystery-boxes/${id}`, data),
  deleteMysteryBox: (id: number) => api.delete(`/admin/mystery-boxes/${id}`),
  setBoxRewards: (id: number, rewardMappings: Array<{ rewardId: number; weight: number }>) =>
    api.post(`/admin/mystery-boxes/${id}/rewards`, { rewardMappings }),

  // Rewards
  getRewards: () => api.get('/admin/rewards'),
  createReward: (data: any) => api.post('/admin/rewards', data),
  updateReward: (id: number, data: any) => api.put(`/admin/rewards/${id}`, data),
  deleteReward: (id: number) => api.delete(`/admin/rewards/${id}`),

  // Promotions
  getPromotions: () => api.get('/admin/promotions'),
  createPromotion: (data: any) => api.post('/admin/promotions', data),
  updatePromotion: (id: number, data: any) => api.put(`/admin/promotions/${id}`, data),
  deletePromotion: (id: number) => api.delete(`/admin/promotions/${id}`),

  // Orders
  getOrders: (params?: { status?: string; search?: string; limit?: number; offset?: number }) =>
    api.get('/admin/orders', { params }),
  updateOrderStatus: (id: string, status: string) => api.put(`/admin/orders/${id}/status`, { status }),

  // Users
  getUsers: (params?: { search?: string; limit?: number; offset?: number }) =>
    api.get('/admin/users', { params }),
  getUserDetails: (id: number) => api.get(`/admin/users/${id}`),
  toggleUserStatus: (id: number, isActive: boolean) =>
    api.put(`/admin/users/${id}/status`, { isActive }),
  adjustUserWallet: (id: number, action: 'ADD' | 'DEDUCT', amount: number, reason: string) =>
    api.post(`/admin/users/${id}/wallet`, { action, amount, reason }),

  // Admins
  getAdmins: () => api.get('/admin/admins'),
  createAdmin: (data: any) => api.post('/admin/admins', data),

  // Settings
  getSettings: () => api.get('/settings'),
  updateSettings: (data: Record<string, string>) => api.put('/admin/settings', data),

  // Gacha Lucky Vault
  getGachaItems: () => api.get('/admin/gacha/items'),
  createGachaItem: (data: any) => api.post('/admin/gacha/items', data),
  updateGachaItem: (id: number, data: any) => api.put(`/admin/gacha/items/${id}`, data),
  deleteGachaItem: (id: number) => api.delete(`/admin/gacha/items/${id}`),
  batchUpdateGachaItems: (items: any[]) => api.put('/admin/gacha/items/batch', { items }),

  // Lucky Spin Wheel (วงล้อเสี่ยงโชค / เปิดการ์ด 3D)
  getWheelItems: () => api.get('/wheel/admin/items'),
  createWheelItem: (data: any) => api.post('/wheel/admin/items', data),
  updateWheelItem: (id: number, data: any) => api.put(`/wheel/admin/items/${id}`, data),
  deleteWheelItem: (id: number) => api.delete(`/wheel/admin/items/${id}`),
  batchUpdateWheelItems: (items: any[]) => api.put('/wheel/admin/items/batch', { items }),

  // Game Management Overview
  getGameOverview: () => api.get('/admin/games/overview'),

  // File Upload (Direct from Computer/Mobile)
  uploadImage: (data: { image: string; filename?: string }) => api.post('/admin/upload-image', data),
};

export default api;
