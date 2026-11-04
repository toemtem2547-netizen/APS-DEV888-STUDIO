import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Gift,
  TrendingUp,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { adminApi } from '../../services/adminApi';
import { DashboardMetrics } from '../../types';
import { StatCard } from '../../components/admin/StatCard';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await adminApi.getDashboard();
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-3xl bg-[#10141E] border border-white/5"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-80 rounded-3xl bg-[#10141E] border border-white/5"></div>
          <div className="h-80 rounded-3xl bg-[#10141E] border border-white/5"></div>
        </div>
      </div>
    );
  }

  const { kpi, salesTrend, topPackages, boxActivity, recentOrders } = data;
  const PIE_COLORS = ['#6366F1', '#EC4899', '#F59E0B', '#3B82F6', '#10B981'];

  return (
    <div className="p-8 space-y-8">
      {/* 1. KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="ยอดขายทั้งหมด"
          value={`฿${kpi.totalRevenue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`}
          subtitle={`วันนี้: ฿${kpi.todayRevenue.toFixed(2)} | เดือนนี้: ฿${kpi.monthRevenue.toFixed(2)}`}
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="จำนวนคำสั่งซื้อ"
          value={kpi.totalOrders.toLocaleString()}
          subtitle={`วันนี้: ${kpi.todayOrders} ออเดอร์`}
          icon={ShoppingCart}
          color="indigo"
        />
        <StatCard
          title="สมาชิกระบบ"
          value={kpi.totalUsers.toLocaleString()}
          subtitle={`เพิ่มวันนี้: ${kpi.todayUsers} ท่าน`}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="การสุ่มกล่องสมบัติ"
          value={kpi.totalDraws.toLocaleString()}
          subtitle={`เปิดวันนี้: ${kpi.todayDraws} ครั้ง`}
          icon={Gift}
          color="amber"
        />
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-8 bg-[#10141E] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">แนวโน้มรายได้ (Revenue Trend)</h3>
              <p className="text-xs text-zinc-400">สถิติยอดขาย 7 วันย้อนหลัง</p>
            </div>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> Real-time
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" stroke="#6B7280" fontSize={11} />
                <YAxis stroke="#6B7280" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D1117', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ color: '#9CA3AF' }}
                  formatter={(val: any) => [`฿${Number(val).toFixed(2)}`, 'รายได้']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mystery Box Distribution Donut Chart */}
        <div className="lg:col-span-4 bg-[#10141E] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">สัดส่วนการเปิดกล่องสุ่ม</h3>
            <p className="text-xs text-zinc-400">แยกตามประเภทกล่องสมบัติ</p>
          </div>

          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={boxActivity.length > 0 ? boxActivity : [{ name: 'ยังไม่มีข้อมูล', value: 1 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {boxActivity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D1117', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ color: '#9CA3AF' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-white/5">
            {boxActivity.slice(0, 4).map((b, idx) => (
              <div key={b.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                  <span className="text-zinc-300 truncate max-w-[140px]">{b.name}</span>
                </div>
                <span className="font-bold text-white font-mono">{b.value} ครั้ง</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Top Packages & Recent Orders Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Top Selling Packages BarChart */}
        <div className="lg:col-span-5 bg-[#10141E] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">แพ็กเกจขายดี (Top Packages)</h3>
            <p className="text-xs text-zinc-400">จำนวนยูนิตที่ขายได้</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPackages}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={10} />
                <YAxis stroke="#6B7280" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D1117', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="units" fill="#EC4899" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders Live Table */}
        <div className="lg:col-span-7 bg-[#10141E] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">คำสั่งซื้อล่าสุด</h3>
              <p className="text-xs text-zinc-400">รายการสั่งซื้อแบบ Real-time</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-zinc-400 text-[11px] uppercase">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">UID</th>
                  <th className="py-2.5 px-3">แพ็กเกจ</th>
                  <th className="py-2.5 px-3">ยอดเงิน</th>
                  <th className="py-2.5 px-3">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-3 font-mono font-bold text-zinc-300">{ord.id}</td>
                    <td className="py-3 px-3 font-mono text-indigo-400">{ord.player_id}</td>
                    <td className="py-3 px-3 font-semibold text-white">{ord.package_name}</td>
                    <td className="py-3 px-3 font-mono text-emerald-400 font-bold">฿{ord.final_price.toFixed(2)}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
