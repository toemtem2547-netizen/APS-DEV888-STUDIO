import { Request, Response } from 'express';
import { query } from '../config/db';

export async function getGameOverview(req: Request, res: Response): Promise<void> {
  try {
    // 1. Mystery Box stats
    const boxCountRows: any = await query(
      `SELECT 
        COUNT(*) as total_boxes,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_boxes
       FROM mystery_boxes`
    );
    const boxDrawRows: any = await query(
      `SELECT 
        COUNT(*) as total_draws,
        COALESCE(SUM(cost), 0) as total_revenue,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today_draws
       FROM draw_histories`
    );

    // 2. Gacha stats
    const gachaCountRows: any = await query(
      `SELECT 
        COUNT(*) as total_items,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_items
       FROM gacha_items`
    );
    const gachaSpinRows: any = await query(
      `SELECT 
        COUNT(*) as total_spins,
        COALESCE(SUM(cost), 0) as total_revenue,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today_spins,
        SUM(CASE WHEN spin_type = 'FREE_DAILY' THEN 1 ELSE 0 END) as free_spins_count
       FROM gacha_spins`
    );

    // 3. Wheel / Tarot stats
    let wheelCountRows: any = [{ total_items: 0, active_items: 0 }];
    let wheelSpinRows: any = [{ total_spins: 0, total_revenue: 0, today_spins: 0, free_spins_count: 0 }];
    try {
      wheelCountRows = await query(
        `SELECT 
          COUNT(*) as total_items,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_items
         FROM wheel_items`
      );
      wheelSpinRows = await query(
        `SELECT 
          COUNT(*) as total_spins,
          COALESCE(SUM(spin_cost), 0) as total_revenue,
          SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today_spins,
          SUM(CASE WHEN spin_type = 'FREE_DAILY' THEN 1 ELSE 0 END) as free_spins_count
         FROM wheel_spins`
      );
    } catch (e) {
      // Table might not exist yet if not initialized
    }

    // 4. Game Settings
    const settingsRows: any = await query(
      `SELECT key_name, value, description FROM settings WHERE key_name LIKE 'game_%'`
    );
    const gameSettings: Record<string, string> = {};
    for (const r of settingsRows) {
      gameSettings[r.key_name] = r.value;
    }

    const mbTotalDraws = Number(boxDrawRows[0]?.total_draws || 0);
    const mbTotalRevenue = Number(boxDrawRows[0]?.total_revenue || 0);
    const mbTodayDraws = Number(boxDrawRows[0]?.today_draws || 0);

    const gachaTotalSpins = Number(gachaSpinRows[0]?.total_spins || 0);
    const gachaTotalRevenue = Number(gachaSpinRows[0]?.total_revenue || 0);
    const gachaTodaySpins = Number(gachaSpinRows[0]?.today_spins || 0);

    const wheelTotalSpins = Number(wheelSpinRows[0]?.total_spins || 0);
    const wheelTotalRevenue = Number(wheelSpinRows[0]?.total_revenue || 0);
    const wheelTodaySpins = Number(wheelSpinRows[0]?.today_spins || 0);

    const totalPlays = mbTotalDraws + gachaTotalSpins + wheelTotalSpins;
    const todayPlays = mbTodayDraws + gachaTodaySpins + wheelTodaySpins;
    const totalRevenue = mbTotalRevenue + gachaTotalRevenue + wheelTotalRevenue;

    const isMbEnabled = gameSettings['game_mystery_box_enabled'] !== 'false';
    const isGachaEnabled = gameSettings['game_gacha_enabled'] !== 'false';
    const isWheelEnabled = gameSettings['game_wheel_enabled'] !== 'false';

    const activeGamesCount = (isMbEnabled ? 1 : 0) + (isGachaEnabled ? 1 : 0) + (isWheelEnabled ? 1 : 0);

    res.json({
      success: true,
      data: {
        summary: {
          totalGames: 3,
          activeGamesCount,
          totalPlays,
          todayPlays,
          totalRevenue,
        },
        games: {
          mystery_box: {
            id: 'mystery_box',
            name: gameSettings['game_mystery_box_title'] || 'กล่องสุ่มสมบัติ (Mystery Boxes)',
            subtitle: gameSettings['game_mystery_box_subtitle'] || 'กล่องสุ่มไอเทมและรางวัลใหญ่',
            route: '/mystery-box',
            adminRoute: '/admin/mystery-boxes',
            isEnabled: isMbEnabled,
            totalItems: Number(boxCountRows[0]?.total_boxes || 0),
            activeItems: Number(boxCountRows[0]?.active_boxes || 0),
            totalPlays: mbTotalDraws,
            todayPlays: mbTodayDraws,
            totalRevenue: mbTotalRevenue,
            notice: gameSettings['game_mystery_box_notice'] || '',
          },
          gacha: {
            id: 'gacha',
            name: gameSettings['game_gacha_title'] || 'วงล้อกาชา (Gacha Vault)',
            subtitle: gameSettings['game_gacha_subtitle'] || 'ตู้สุ่มรูเล็ตต์รวมรางวัลพิเศษ',
            route: '/gacha',
            adminRoute: '/admin/gacha',
            isEnabled: isGachaEnabled,
            costPerSpin: parseFloat(gameSettings['game_gacha_cost'] || '29'),
            freeSpinsDaily: parseInt(gameSettings['game_gacha_free_spins'] || '1', 10),
            totalItems: Number(gachaCountRows[0]?.total_items || 0),
            activeItems: Number(gachaCountRows[0]?.active_items || 0),
            totalPlays: gachaTotalSpins,
            todayPlays: gachaTodaySpins,
            totalRevenue: gachaTotalRevenue,
            notice: gameSettings['game_gacha_notice'] || '',
          },
          wheel: {
            id: 'wheel',
            name: gameSettings['game_wheel_title'] || 'เปิดการ์ด 3D เสี่ยงโชค (Lucky Tarot)',
            subtitle: gameSettings['game_wheel_subtitle'] || 'เลือกไพ่ทาโรต์นำโชค 4 ใบ',
            route: '/wheel',
            adminRoute: '/admin/wheel',
            isEnabled: isWheelEnabled,
            costPerSpin: parseFloat(gameSettings['game_wheel_cost'] || '20'),
            freeSpinsDaily: parseInt(gameSettings['game_wheel_free_spins'] || '1', 10),
            totalItems: Number(wheelCountRows[0]?.total_items || 0),
            activeItems: Number(wheelCountRows[0]?.active_items || 0),
            totalPlays: wheelTotalSpins,
            todayPlays: wheelTodaySpins,
            totalRevenue: wheelTotalRevenue,
            notice: gameSettings['game_wheel_notice'] || '',
          },
        },
        settings: gameSettings,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
