import { getConnection, query } from '../config/db';
import { WalletService } from './walletService';
import {
  generateGrid,
  evaluateGrid,
  PAYLINES,
  PAYTABLE,
  SCATTER_PAY,
  FREE_SPIN_MULTIPLIER,
} from './slotEngine';

const DEFAULT_BETS = [1, 2, 5, 10, 20, 50, 100];
const DEFAULT_JACKPOT_SEED = 5000;
const JACKPOT_CONTRIBUTION = 0.01; // 1% of every paid bet feeds the progressive jackpot

let tablesReady = false;

async function ensureTables() {
  if (tablesReady) return;
  await query(`CREATE TABLE IF NOT EXISTS slot_states (
    user_id INT PRIMARY KEY,
    free_spins_remaining INT NOT NULL DEFAULT 0,
    free_spin_bet DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    free_spin_total_win DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  await query(`CREATE TABLE IF NOT EXISTS slot_spins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bet DECIMAL(10, 2) NOT NULL,
    win DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    is_free_spin BOOLEAN DEFAULT FALSE,
    is_jackpot BOOLEAN DEFAULT FALSE,
    grid VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slot_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  tablesReady = true;
}

function parseBets(raw?: string): number[] {
  if (!raw) return DEFAULT_BETS;
  const bets = raw
    .split(',')
    .map((b) => parseFloat(b.trim()))
    .filter((b) => Number.isFinite(b) && b > 0)
    .sort((a, b) => a - b);
  return bets.length ? bets : DEFAULT_BETS;
}

async function loadSettings(conn?: any) {
  const sql = `SELECT key_name, value FROM settings WHERE key_name IN
    ('game_slot_enabled', 'game_slot_bets', 'game_slot_jackpot_pool', 'game_slot_jackpot_seed')`;
  const rows: any = conn ? (await conn.query(sql))[0] : await query(sql);
  const map: Record<string, string> = {};
  (rows || []).forEach((r: any) => { map[r.key_name] = r.value; });
  const seed = map['game_slot_jackpot_seed'] ? parseFloat(map['game_slot_jackpot_seed']) : DEFAULT_JACKPOT_SEED;
  return {
    isEnabled: map['game_slot_enabled'] !== 'false',
    bets: parseBets(map['game_slot_bets']),
    jackpotSeed: seed,
    jackpotPool: map['game_slot_jackpot_pool'] ? parseFloat(map['game_slot_jackpot_pool']) : seed,
  };
}

export class SlotService {
  static async getConfig(userId?: number) {
    await ensureTables();
    const s = await loadSettings();
    let freeSpinsRemaining = 0;
    let freeSpinBet = 0;
    if (userId) {
      const rows: any = await query(
        `SELECT free_spins_remaining, free_spin_bet FROM slot_states WHERE user_id = ?`,
        [userId]
      );
      if (rows?.[0]) {
        freeSpinsRemaining = Number(rows[0].free_spins_remaining) || 0;
        freeSpinBet = parseFloat(rows[0].free_spin_bet) || 0;
      }
    }
    return {
      isEnabled: s.isEnabled,
      bets: s.bets,
      jackpotPool: s.jackpotPool,
      paylines: PAYLINES,
      paytable: PAYTABLE,
      scatterPays: SCATTER_PAY,
      freeSpinMultiplier: FREE_SPIN_MULTIPLIER,
      freeSpinsRemaining,
      freeSpinBet,
    };
  }

  static async spin(userId: number, requestedBet: number) {
    await ensureTables();
    const conn = await getConnection();
    try {
      await conn.beginTransaction();
      const s = await loadSettings(conn);
      if (!s.isEnabled) throw new Error('เกมสล็อตกำลังปิดปรับปรุงชั่วคราว ขออภัยในความไม่สะดวก');

      // Lock user slot state (free spins)
      await conn.query(`INSERT IGNORE INTO slot_states (user_id) VALUES (?)`, [userId]);
      const [stateRows]: any = await conn.query(
        `SELECT free_spins_remaining, free_spin_bet, free_spin_total_win FROM slot_states WHERE user_id = ? FOR UPDATE`,
        [userId]
      );
      const state = stateRows[0];
      let freeLeft = Number(state.free_spins_remaining) || 0;
      const isFreeSpin = freeLeft > 0;

      let bet: number;
      let balanceAfter: number;
      if (isFreeSpin) {
        bet = parseFloat(state.free_spin_bet);
        freeLeft -= 1;
        balanceAfter = (await WalletService.getBalance(userId)).balance;
      } else {
        if (!s.bets.includes(requestedBet)) throw new Error('จำนวนเดิมพันไม่ถูกต้อง');
        bet = requestedBet;
        const d = await WalletService.deduct(userId, bet, 'PURCHASE', `Golden Cat Heist Slot — เดิมพัน ฿${bet}`, 'SLOT_SPIN', undefined, conn);
        balanceAfter = d.newBalance;
      }

      // Jackpot pool (locked row)
      await conn.query(
        `INSERT IGNORE INTO settings (key_name, value, description) VALUES ('game_slot_jackpot_pool', ?, 'Slot progressive jackpot pool')`,
        [s.jackpotSeed.toFixed(2)]
      );
      const [jpRows]: any = await conn.query(
        `SELECT value FROM settings WHERE key_name = 'game_slot_jackpot_pool' FOR UPDATE`
      );
      let jackpotPool = parseFloat(jpRows[0]?.value) || s.jackpotSeed;
      if (!isFreeSpin) jackpotPool += bet * JACKPOT_CONTRIBUTION;

      // Server-side RNG outcome
      const outcome = evaluateGrid(generateGrid(), bet);
      const multiplier = isFreeSpin ? FREE_SPIN_MULTIPLIER : 1;
      let jackpotWin = 0;
      if (outcome.isJackpot) {
        jackpotWin = Number(jackpotPool.toFixed(2));
        jackpotPool = s.jackpotSeed;
      }
      const totalWin = Number((outcome.baseWin * multiplier + jackpotWin).toFixed(2));

      freeLeft += outcome.freeSpinsAwarded;
      const freeSpinBet = outcome.freeSpinsAwarded > 0 && !isFreeSpin ? bet : parseFloat(state.free_spin_bet);
      const freeTotalWin = isFreeSpin || outcome.freeSpinsAwarded > 0
        ? (isFreeSpin ? parseFloat(state.free_spin_total_win) : 0) + totalWin
        : 0;

      await conn.query(
        `UPDATE settings SET value = ? WHERE key_name = 'game_slot_jackpot_pool'`,
        [jackpotPool.toFixed(2)]
      );
      await conn.query(
        `UPDATE slot_states SET free_spins_remaining = ?, free_spin_bet = ?, free_spin_total_win = ? WHERE user_id = ?`,
        [freeLeft, freeLeft > 0 ? freeSpinBet : 0, freeLeft > 0 ? freeTotalWin : 0, userId]
      );

      const [ins]: any = await conn.query(
        `INSERT INTO slot_spins (user_id, bet, win, is_free_spin, is_jackpot, grid) VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, isFreeSpin ? 0 : bet, totalWin, isFreeSpin, outcome.isJackpot, JSON.stringify(outcome.grid)]
      );

      if (totalWin > 0) {
        const c = await WalletService.credit(
          userId,
          totalWin,
          'BONUS',
          outcome.isJackpot ? `🎰 JACKPOT! Golden Cat Heist ฿${totalWin}` : `รางวัลสล็อต Golden Cat Heist ฿${totalWin}`,
          'SLOT_WIN',
          String(ins.insertId),
          conn
        );
        balanceAfter = c.newBalance;
      }

      await conn.commit();

      return {
        spinId: ins.insertId,
        grid: outcome.grid,
        lineWins: outcome.lineWins.map((w) => ({ ...w, amount: Number((w.amount * multiplier).toFixed(2)) })),
        scatterCount: outcome.scatterCount,
        scatterPositions: outcome.scatterPositions,
        scatterWin: Number((outcome.scatterWin * multiplier).toFixed(2)),
        bet,
        isFreeSpin,
        multiplier,
        totalWin,
        jackpotWin,
        isJackpot: outcome.isJackpot,
        jackpotPool: Number(jackpotPool.toFixed(2)),
        freeSpinsAwarded: outcome.freeSpinsAwarded,
        freeSpinsRemaining: freeLeft,
        freeSpinTotalWin: Number(freeTotalWin.toFixed(2)),
        newWalletBalance: balanceAfter,
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  static async getHistory(userId: number, limit = 20) {
    await ensureTables();
    return await query(
      `SELECT id, bet, win, is_free_spin, is_jackpot, created_at FROM slot_spins
       WHERE user_id = ? ORDER BY id DESC LIMIT ?`,
      [userId, Math.min(Math.max(limit, 1), 100)]
    );
  }

  static async getRecentBigWins(limit = 10) {
    await ensureTables();
    return await query(
      `SELECT ss.id, ss.bet, ss.win, ss.is_jackpot, ss.created_at, u.username
       FROM slot_spins ss JOIN users u ON u.id = ss.user_id
       WHERE ss.win > 0 ORDER BY ss.win DESC, ss.id DESC LIMIT ?`,
      [limit]
    );
  }
}
