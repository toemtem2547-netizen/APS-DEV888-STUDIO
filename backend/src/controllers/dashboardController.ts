import { Request, Response } from 'express';
import { query } from '../config/db';

export async function getDashboardMetrics(req: Request, res: Response): Promise<void> {
  try {
    // 1. Core KPIs
    const [revTotal]: any = await query(
      `SELECT COALESCE(SUM(final_price), 0) as total_rev FROM orders WHERE status = 'COMPLETED'`
    );
    const [revToday]: any = await query(
      `SELECT COALESCE(SUM(final_price), 0) as today_rev FROM orders WHERE status = 'COMPLETED' AND DATE(created_at) = CURDATE()`
    );
    const [revMonth]: any = await query(
      `SELECT COALESCE(SUM(final_price), 0) as month_rev FROM orders WHERE status = 'COMPLETED' AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())`
    );

    const [ordersCount]: any = await query(`SELECT COUNT(*) as count FROM orders`);
    const [ordersToday]: any = await query(`SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURDATE()`);

    const [usersCount]: any = await query(`SELECT COUNT(*) as count FROM users WHERE is_active = 1`);
    const [usersToday]: any = await query(`SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURDATE()`);

    const [drawsCount]: any = await query(`SELECT COUNT(*) as count FROM draw_histories`);
    const [drawsToday]: any = await query(`SELECT COUNT(*) as count FROM draw_histories WHERE DATE(created_at) = CURDATE()`);

    const [walletPool]: any = await query(`SELECT COALESCE(SUM(balance), 0) as total_balance FROM wallets`);

    // 2. Sales Trend (Past 7 Days for Recharts)
    const salesTrend: any = await query(`
      SELECT DATE(d.day) as date,
             DATE_FORMAT(d.day, '%d/%m') as label,
             COALESCE(SUM(o.final_price), 0) as revenue,
             COUNT(o.id) as order_count
      FROM (
        SELECT CURDATE() - INTERVAL (a.a + (10 * b.a)) DAY as day
        FROM (SELECT 0 as a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) as a
        CROSS JOIN (SELECT 0 as a) as b
      ) d
      LEFT JOIN orders o ON DATE(o.created_at) = d.day AND o.status = 'COMPLETED'
      GROUP BY d.day
      ORDER BY d.day ASC
    `);

    // 3. Top Packages Sold
    const topPackages: any = await query(`
      SELECT package_name, COUNT(*) as units_sold, SUM(final_price) as total_revenue
      FROM orders
      WHERE status = 'COMPLETED'
      GROUP BY package_id, package_name
      ORDER BY units_sold DESC
      LIMIT 5
    `);

    // 4. Mystery Box Activity
    const boxActivity: any = await query(`
      SELECT box_name, COUNT(*) as draw_count, SUM(cost) as total_spent
      FROM draw_histories
      GROUP BY box_id, box_name
      ORDER BY draw_count DESC
    `);

    // 5. Recent Orders
    const recentOrders: any = await query(`
      SELECT o.id, o.player_id, o.package_name, o.final_price, o.payment_method, o.status, o.created_at, u.username
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 6
    `);

    // 6. Recent Draws
    const recentDraws: any = await query(`
      SELECT dh.id, dh.box_name, dh.reward_name, dh.rarity, dh.cost, dh.created_at, u.username
      FROM draw_histories dh
      JOIN users u ON dh.user_id = u.id
      ORDER BY dh.created_at DESC
      LIMIT 6
    `);

    res.json({
      success: true,
      data: {
        kpi: {
          totalRevenue: parseFloat(revTotal.total_rev),
          todayRevenue: parseFloat(revToday.today_rev),
          monthRevenue: parseFloat(revMonth.month_rev),
          totalOrders: ordersCount.count,
          todayOrders: ordersToday.count,
          totalUsers: usersCount.count,
          todayUsers: usersToday.count,
          totalDraws: drawsCount.count,
          todayDraws: drawsToday.count,
          walletPoolBalance: parseFloat(walletPool.total_balance),
        },
        salesTrend: salesTrend.map((t: any) => ({
          date: t.date,
          label: t.label,
          revenue: parseFloat(t.revenue),
          orders: parseInt(t.order_count, 10),
        })),
        topPackages: topPackages.map((p: any) => ({
          name: p.package_name,
          units: parseInt(p.units_sold, 10),
          revenue: parseFloat(p.total_revenue),
        })),
        boxActivity: boxActivity.map((b: any) => ({
          name: b.box_name,
          value: parseInt(b.draw_count, 10),
          revenue: parseFloat(b.total_spent),
        })),
        recentOrders: recentOrders.map((o: any) => ({
          ...o,
          final_price: parseFloat(o.final_price),
        })),
        recentDraws: recentDraws.map((d: any) => ({
          ...d,
          cost: parseFloat(d.cost),
        })),
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
