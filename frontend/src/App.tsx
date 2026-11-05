import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';

// Customer Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MobileNav } from './components/MobileNav';
import { LoginModal } from './components/LoginModal';
import { TopupModal } from './components/TopupModal';

// Customer Pages
import { Home } from './pages/Home';
import { TopupPage } from './pages/TopupPage';
import { MysteryBoxPage } from './pages/MysteryBoxPage';
import { GachaPage } from './pages/GachaPage';
import { WheelPage } from './pages/WheelPage';
import { SlotPage } from './pages/SlotPage';
import { SlotLobbyPage } from './pages/SlotLobbyPage';
import { PromotionsPage } from './pages/PromotionsPage';
import { InventoryPage } from './pages/InventoryPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProfilePage } from './pages/ProfilePage';

// Admin Components & Pages
import { Sidebar } from './components/admin/Sidebar';
import { Header } from './components/admin/Header';
import { LoginPage as AdminLoginPage } from './pages/admin/LoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { HomePageAdmin } from './pages/admin/HomePageAdmin';
import { OrdersPage as AdminOrdersPage } from './pages/admin/OrdersPage';
import { PackagesPage } from './pages/admin/PackagesPage';
import { MysteryBoxesPage } from './pages/admin/MysteryBoxesPage';
import { GachaAdminPage } from './pages/admin/GachaAdminPage';
import { WheelAdminPage } from './pages/admin/WheelAdminPage';
import { RewardsPage } from './pages/admin/RewardsPage';
import { PromotionsPage as AdminPromotionsPage } from './pages/admin/PromotionsPage';
import { UsersPage } from './pages/admin/UsersPage';
import { AdminsPage } from './pages/admin/AdminsPage';
import { SettingsPage as AdminSettingsPage } from './pages/admin/SettingsPage';
import { GameManagementPage } from './pages/admin/GameManagementPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const adminTitleMap: Record<string, { title: string; subtitle: string }> = {
  '/admin': { title: 'Dashboard Overview', subtitle: 'ภาพรวมระบบ ยอดขาย และกิจกรรมล่าสุด' },
  '/admin/home': { title: 'Home Page CMS', subtitle: 'จัดการแบนเนอร์สไลด์ การ์ดย่อย และเนื้อหาหน้าแรก' },
  '/admin/games': { title: 'Storefront Games Control', subtitle: 'ศูนย์ควบคุมและเปิด/ปิดระบบเกมส์หน้าบ้าน ตั้งค่าราคาและรอบฟรี' },
  '/admin/orders': { title: 'Order Management', subtitle: 'จัดการคำสั่งซื้อและสถานะการเติมเกม' },
  '/admin/packages': { title: 'Top-up Packages', subtitle: 'จัดการแพ็กเกจเติมเหรียญและราคา' },
  '/admin/mystery-boxes': { title: 'Mystery Boxes', subtitle: 'จัดการกล่องสุ่มและเรทความน่าจะเป็น' },
  '/admin/gacha': { title: 'Gacha Lucky Vault', subtitle: 'จัดการตู้สุ่มวงล้อกาชา ค่าน้ำหนัก และเรทดรอป' },
  '/admin/wheel': { title: 'Lucky Tarot 3D CMS', subtitle: 'จัดการพูลของรางวัลเปิดการ์ด 3D ค่าน้ำหนัก และเรทดรอป' },
  '/admin/rewards': { title: 'Rewards & Inventory', subtitle: 'จัดการของรางวัล ไอเทม และโค้ดดิจิทัล' },
  '/admin/promotions': { title: 'Promotions & Coupons', subtitle: 'แคมเปญโปรโมชั่นและส่วนลดพิเศษ' },
  '/admin/users': { title: 'Users & Wallets', subtitle: 'จัดการสมาชิกและปรับเครดิตกระเป๋าเงิน' },
  '/admin/admins': { title: 'Admin & Role Permissions', subtitle: 'จัดการผู้ดูแลระบบและกำหนดสิทธิ์การเข้าถึง' },
  '/admin/settings': { title: 'Platform & Game Settings', subtitle: 'ตั้งค่าชื่อเกม โลโก้ และธีมสี' },
};

const AdminLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0D14] flex items-center justify-center text-zinc-500 text-xs font-mono">
        กำลังโหลดระบบ...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLoginPage />;
  }

  const currentHeader = adminTitleMap[location.pathname] || {
    title: 'Backoffice Management',
    subtitle: 'ระบบจัดการหลังบ้าน',
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white flex selection:bg-indigo-600 selection:text-white">
      <Sidebar />

      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        <Header title={currentHeader.title} subtitle={currentHeader.subtitle} />

        <main className="flex-1 mt-16 pb-12">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/home" element={<HomePageAdmin />} />
            <Route path="/games" element={<GameManagementPage />} />
            <Route path="/orders" element={<AdminOrdersPage />} />
            <Route path="/packages" element={<PackagesPage />} />
            <Route path="/mystery-boxes" element={<MysteryBoxesPage />} />
            <Route path="/gacha" element={<GachaAdminPage />} />
            <Route path="/wheel" element={<WheelAdminPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/promotions" element={<AdminPromotionsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/admins" element={<AdminsPage />} />
            <Route path="/settings" element={<AdminSettingsPage />} />
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const StorefrontLayout: React.FC = () => {
  const location = useLocation();
  const isSlotGameRoom = location.pathname.startsWith('/slot') && location.pathname !== '/slots';

  return (
    <div className="min-h-screen bg-[#07090D] text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/topup" element={<TopupPage />} />
          <Route path="/mystery-box" element={<MysteryBoxPage />} />
          <Route path="/gacha" element={<GachaPage />} />
          <Route path="/wheel" element={<WheelPage />} />
          <Route path="/slots" element={<SlotLobbyPage />} />
          <Route path="/slot" element={<SlotPage />} />
          <Route path="/promotions" element={<PromotionsPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      {!isSlotGameRoom && <Footer />}
      <MobileNav />

      {/* Customer Modals */}
      <LoginModal />
      <TopupModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AuthProvider>
        <WalletProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              <Route
                path="/admin/*"
                element={
                  <AdminAuthProvider>
                    <AdminLayout />
                  </AdminAuthProvider>
                }
              />
              <Route path="/*" element={<StorefrontLayout />} />
            </Routes>
          </Router>
        </WalletProvider>
      </AuthProvider>
    </SettingsProvider>
  );
};

export default App;
