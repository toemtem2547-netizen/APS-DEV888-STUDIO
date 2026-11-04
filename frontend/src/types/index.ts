export interface User {
  id: number;
  username: string;
  email: string;
  playerId?: string | null;
  walletBalance: number;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roleId: number;
  roleName: 'super_admin' | 'admin' | 'staff';
  permissions: string[];
}

export interface PackageItem {
  id: number;
  name: string;
  coins: number;
  price: number;
  bonusCoins: number;
  imageUrl: string;
  badge?: string | null;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
}

export interface BoxReward {
  id: number;
  name: string;
  description: string;
  image_url: string;
  type: 'ITEM' | 'CODE' | 'CREDIT' | 'COUPON' | 'VIP' | string;
  value: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  stock: number;
  weight: number;
  probability_percent?: number;
}

export type BoxRewardMapping = BoxReward;

export interface MysteryBox {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  colorTheme: string;
  badge?: string | null;
  isActive: boolean;
  sortOrder: number;
  rewards?: BoxReward[];
  createdAt?: string;
}

export interface DrawResult {
  boxId: number;
  boxName: string;
  cost: number;
  reward: {
    id: number;
    name: string;
    description: string;
    image_url: string;
    type: string;
    value: string;
    rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    code?: string | null;
    bonusCredited?: number;
  };
  newWalletBalance: number;
}

export interface DrawHistoryItem {
  id: number;
  user_id: number;
  username: string;
  email: string;
  box_id: number;
  box_name: string;
  reward_id: number;
  reward_name: string;
  reward_type: string;
  reward_value: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  cost: number;
  code?: string | null;
  created_at: string;
}

export interface Reward {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  type: 'ITEM' | 'CODE' | 'CREDIT' | 'COUPON' | 'VIP';
  value: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  stock: number;
  isActive: boolean;
  createdAt?: string;
}

export interface Order {
  id: string;
  userId?: number;
  username?: string;
  email?: string;
  playerId: string;
  packageId?: number;
  packageName: string;
  coinsAmount: number;
  price: number;
  discountAmount: number;
  finalPrice: number;
  paymentMethod: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  createdAt: string;
  updatedAt?: string;
}

export interface InventoryItem {
  id: number;
  rewardId: number;
  rewardName: string;
  rewardType: string;
  rewardValue: string;
  rarity: string;
  imageUrl: string;
  codeContent?: string | null;
  isUsed: boolean;
  usedAt?: string | null;
  acquiredFrom: string;
  createdAt: string;
}

export interface WalletTransaction {
  id: number;
  type: string;
  amount: number;
  balanceAfter: number;
  referenceType?: string;
  referenceId?: string;
  description: string;
  createdAt: string;
}

export interface Promotion {
  id: number;
  title: string;
  subtitle: string;
  bannerUrl: string;
  promoType: 'DISCOUNT' | 'BONUS' | 'FLASH_SALE';
  discountPercent: number;
  bonusPercent: number;
  minSpend: number;
  code?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
}

export interface Coupon {
  id: number;
  code: string;
  discount_amount: number;
  discount_percent: number;
  min_spend: number;
  max_uses: number;
  current_uses: number;
  expires_at?: string | null;
  is_active: boolean;
}

export interface UserManagementItem {
  id: number;
  username: string;
  email: string;
  playerId?: string | null;
  isActive: boolean;
  walletBalance: number;
  orderCount: number;
  drawCount: number;
  totalSpent: number;
  createdAt: string;
}

export interface DashboardMetrics {
  kpi: {
    totalRevenue: number;
    todayRevenue: number;
    monthRevenue: number;
    totalOrders: number;
    todayOrders: number;
    totalUsers: number;
    todayUsers: number;
    totalDraws: number;
    todayDraws: number;
    walletPoolBalance: number;
  };
  salesTrend: Array<{ date: string; label: string; revenue: number; orders: number }>;
  topPackages: Array<{ name: string; units: number; revenue: number }>;
  boxActivity: Array<{ name: string; value: number; revenue: number }>;
  recentOrders: any[];
  recentDraws: any[];
}

export interface HomeSlideItem {
  id: number;
  image: string;
  badge: string;
  tag: string;
  title: string;
  description: string;
  primaryBtn: { label: string; path: string };
  secondaryBtn: { label: string; path: string };
}

export interface HomeSubCard1 {
  image: string;
  badge: string;
  title: string;
  link: string;
}

export interface HomeSubCard2 {
  image: string;
  badge: string;
  title: string;
  link: string;
}

export interface HomeSubCard3 {
  action1: { image: string; label: string; link: string };
  action2: { image: string; label: string; link: string };
  action3: { image: string; label: string; link: string; badge: string };
}

export interface HomeTrustStats {
  stat1: string;
  stat2: string;
  stat3: string;
}

export interface HomeCmsConfig {
  slides: HomeSlideItem[];
  subCard1: HomeSubCard1;
  subCard2: HomeSubCard2;
  subCard3: HomeSubCard3;
  trustStats: HomeTrustStats;
}

export interface PlatformSettings {
  game_title: string;
  game_subtitle: string;
  game_logo: string;
  currency_symbol: string;
  primary_color: string;
  hero_badge: string;
  hero_title: string;
  hero_description: string;
  announcement_banner: string;
  contact_support: string;
  home_cms_config?: string;

  // Game System Master Controls
  game_mystery_box_enabled?: string;
  game_mystery_box_title?: string;
  game_mystery_box_subtitle?: string;
  game_mystery_box_notice?: string;

  game_gacha_enabled?: string;
  game_gacha_title?: string;
  game_gacha_subtitle?: string;
  game_gacha_cost?: string;
  game_gacha_free_spins?: string;
  game_gacha_notice?: string;

  game_wheel_enabled?: string;
  game_wheel_title?: string;
  game_wheel_subtitle?: string;
  game_wheel_cost?: string;
  game_wheel_free_spins?: string;
  game_wheel_notice?: string;
  game_wheel_card_back?: string;

  game_maintenance_notice?: string;
  game_sound_enabled?: string;
}

export interface GameOverviewItem {
  id: string;
  name: string;
  subtitle: string;
  route: string;
  adminRoute: string;
  isEnabled: boolean;
  costPerSpin?: number;
  freeSpinsDaily?: number;
  totalItems: number;
  activeItems: number;
  totalPlays: number;
  todayPlays: number;
  totalRevenue: number;
  notice?: string;
}

export interface GameOverviewData {
  summary: {
    totalGames: number;
    activeGamesCount: number;
    totalPlays: number;
    todayPlays: number;
    totalRevenue: number;
  };
  games: {
    mystery_box: GameOverviewItem;
    gacha: GameOverviewItem;
    wheel: GameOverviewItem;
  };
  settings: Record<string, string>;
}

export interface GachaItem {
  id: number;
  reward_id: number;
  title: string;
  subtitle: string;
  category: string;
  value_text: string;
  image_url: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  weight: number;
  probability_percent?: number;
  sort_order?: number;
  reward_name?: string;
  reward_type?: string;
  reward_value?: string;
}

export interface GachaItemAdmin {
  id: number;
  reward_id: number;
  rewardId?: number;
  title: string;
  subtitle: string;
  category: string;
  value_text: string;
  valueText?: string;
  image_url: string;
  imageUrl?: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  weight: number;
  probability_percent?: number;
  is_active: boolean;
  isActive?: boolean;
  sort_order: number;
  sortOrder?: number;
  reward_name?: string;
  rewardName?: string;
  reward_type?: string;
  rewardType?: string;
  reward_value?: string;
  rewardValue?: string;
  created_at?: string;
  createdAt?: string;
}

export interface GachaItemFormData {
  reward_id: number;
  title: string;
  subtitle: string;
  category: string;
  value_text: string;
  image_url: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  weight: number;
  is_active?: boolean;
  sort_order?: number;
}

export interface GachaPoolResponse {
  items: GachaItem[];
  totalWeight: number;
  costPerSpin: number;
  remainingFreeSpins: number;
}

export interface GachaReelCard {
  id: number;
  title: string;
  category: string;
  value_text: string;
  image_url: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

export interface GachaSpinResult {
  winningIndex: number;
  winningItem: {
    id: number;
    title: string;
    subtitle: string;
    category: string;
    value_text: string;
    image_url: string;
    rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    code?: string | null;
  };
  reelSequence: GachaReelCard[];
  spinType: 'FREE_DAILY' | 'PAID';
  cost: number;
  remainingFreeSpins: number;
  newWalletBalance: number;
}

export interface GachaHistoryItem {
  id: number;
  reward_name: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  cost: number;
  spin_type: 'FREE_DAILY' | 'PAID';
  created_at: string;
  image_url: string;
  value_text: string;
}

// Lucky Spin Wheel (วงล้อเสี่ยงโชค)
export interface WheelItem {
  id: number;
  reward_id: number;
  label: string;
  subtitle: string;
  icon_url: string;
  color: string;
  text_color: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  weight: number;
  is_active: boolean;
  sort_order: number;
  reward_name?: string;
  reward_type?: string;
  reward_value?: string;
  probability_percent?: number;
}

export interface WheelPoolResponse {
  items: WheelItem[];
  totalWeight: number;
  costPerSpin: number;
  remainingFreeSpins: number;
  recentWinners?: Array<{
    id: number;
    username: string;
    item_name: string;
    rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    icon_url: string;
    created_at: string;
  }>;
}

export interface WheelSpinResult {
  winningIndex: number;
  winningItem: WheelItem;
  targetDegree: number;
  isFree: boolean;
  spinCost: number;
  rewardCode: string;
  isRespin: boolean;
  isSalt: boolean;
  newBalance: number;
}

export interface WheelHistoryItem {
  id: number;
  label: string;
  subtitle: string;
  icon_url: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  color: string;
  spin_cost: number;
  spin_type: 'COINS' | 'FREE_DAILY' | 'FREE_RESPIN';
  reward_code?: string;
  created_at: string;
}
