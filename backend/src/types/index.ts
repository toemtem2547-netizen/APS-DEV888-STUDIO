export type UserRole = 'super_admin' | 'admin' | 'staff';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  player_id?: string | null;
}

export interface AuthAdmin {
  id: number;
  username: string;
  email: string;
  role_id: number;
  role_name: UserRole;
  full_name: string;
  permissions: string[];
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
export type PaymentMethod = 'WALLET' | 'PROMPTPAY' | 'CREDIT_CARD';
export type TransactionType = 'TOPUP' | 'PURCHASE' | 'MYSTERY_BOX' | 'BONUS' | 'ADMIN_ADJUST';
export type RewardType = 'ITEM' | 'CODE' | 'CREDIT' | 'COUPON' | 'VIP';
export type RewardRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
