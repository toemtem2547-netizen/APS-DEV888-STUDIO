/**
 * Golden Cat Heist — Slot Engine (pure, stateless, server-authoritative)
 * 5 reels x 3 rows, 20 fixed paylines, left-to-right line pays.
 * - WILD  : substitutes every symbol except SCATTER, lands on reels 2-4 only
 * - SCATTER: pays anywhere (x total bet) + triggers Free Spins, max 1 per reel
 * - 5 SCATTERS = Progressive JACKPOT
 */

export type SlotSymbol =
  | 'WILD' | 'SCATTER' | 'CAT' | 'CHEST' | 'HAT' | 'BAG'
  | 'A' | 'K' | 'Q' | 'J' | 'TEN';

export const REELS = 5;
export const ROWS = 3;

// Weights per reel (index = reel 0..4)
const REEL_WEIGHTS: Record<SlotSymbol, number[]> = {
  WILD:    [0, 3, 3, 3, 0],
  SCATTER: [2, 2, 2, 2, 2],
  CAT:     [3, 3, 3, 3, 3],
  CHEST:   [4, 4, 4, 4, 4],
  HAT:     [5, 5, 5, 5, 5],
  BAG:     [6, 6, 6, 6, 6],
  A:       [10, 10, 10, 10, 10],
  K:       [11, 11, 11, 11, 11],
  Q:       [12, 12, 12, 12, 12],
  J:       [13, 13, 13, 13, 13],
  TEN:     [14, 14, 14, 14, 14],
};

// Pays as multiplier of LINE bet for 3, 4, 5 of a kind
export const PAYTABLE: Partial<Record<SlotSymbol, [number, number, number]>> = {
  CAT:   [75, 375, 1500],
  CHEST: [60, 225, 750],
  HAT:   [45, 150, 450],
  BAG:   [38, 120, 375],
  A:     [30, 90, 225],
  K:     [28, 75, 190],
  Q:     [22, 60, 150],
  J:     [18, 45, 120],
  TEN:   [15, 38, 110],
};

// Scatter: multiplier of TOTAL bet and free spins awarded by scatter count (3, 4, 5)
export const SCATTER_PAY: Record<number, { multiplier: number; freeSpins: number }> = {
  3: { multiplier: 2, freeSpins: 8 },
  4: { multiplier: 10, freeSpins: 12 },
  5: { multiplier: 50, freeSpins: 15 },
};

export const FREE_SPIN_MULTIPLIER = 2;

// 20 paylines, each entry = row index for reel 0..4
export const PAYLINES: number[][] = [
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
  [0, 0, 1, 2, 2],
  [2, 2, 1, 0, 0],
  [1, 0, 0, 0, 1],
  [1, 2, 2, 2, 1],
  [0, 1, 1, 1, 0],
  [2, 1, 1, 1, 2],
  [1, 0, 1, 2, 1],
  [1, 2, 1, 0, 1],
  [0, 1, 0, 1, 0],
  [2, 1, 2, 1, 2],
  [1, 1, 0, 1, 1],
  [1, 1, 2, 1, 1],
  [0, 2, 0, 2, 0],
  [2, 0, 2, 0, 2],
  [0, 2, 2, 2, 0],
];

export interface LineWin {
  lineIndex: number;
  symbol: SlotSymbol;
  count: number;
  positions: [number, number][]; // [reel, row]
  amount: number;
}

export interface SpinOutcome {
  grid: SlotSymbol[][]; // grid[reel][row]
  lineWins: LineWin[];
  scatterCount: number;
  scatterPositions: [number, number][];
  scatterWin: number;
  freeSpinsAwarded: number;
  isJackpot: boolean;
  baseWin: number; // before free-spin multiplier
  fiveOfAKindCount: number;
}

function pickSymbol(reel: number, exclude: SlotSymbol[] = []): SlotSymbol {
  const entries = (Object.keys(REEL_WEIGHTS) as SlotSymbol[])
    .filter((s) => !exclude.includes(s))
    .map((s) => [s, REEL_WEIGHTS[s][reel]] as const)
    .filter(([, w]) => w > 0);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = Math.random() * total;
  for (const [s, w] of entries) {
    if (r < w) return s;
    r -= w;
  }
  return entries[entries.length - 1][0];
}

export function generateGrid(): SlotSymbol[][] {
  const grid: SlotSymbol[][] = [];
  for (let reel = 0; reel < REELS; reel++) {
    const col: SlotSymbol[] = [];
    let hasScatter = false;
    for (let row = 0; row < ROWS; row++) {
      const sym = pickSymbol(reel, hasScatter ? ['SCATTER'] : []);
      if (sym === 'SCATTER') hasScatter = true;
      col.push(sym);
    }
    grid.push(col);
  }
  return grid;
}

export function evaluateGrid(grid: SlotSymbol[][], totalBet: number): SpinOutcome {
  const lineBet = totalBet / PAYLINES.length;
  const lineWins: LineWin[] = [];

  PAYLINES.forEach((line, lineIndex) => {
    const first = grid[0][line[0]];
    if (first === 'SCATTER' || first === 'WILD') return; // reel 1 never holds WILD
    let count = 1;
    for (let reel = 1; reel < REELS; reel++) {
      const s = grid[reel][line[reel]];
      if (s === first || s === 'WILD') count++;
      else break;
    }
    const pays = PAYTABLE[first];
    if (pays && count >= 3) {
      const amount = Number((pays[count - 3] * lineBet).toFixed(2));
      lineWins.push({
        lineIndex,
        symbol: first,
        count,
        positions: line.slice(0, count).map((row, reel) => [reel, row] as [number, number]),
        amount,
      });
    }
  });

  const scatterPositions: [number, number][] = [];
  grid.forEach((col, reel) => col.forEach((s, row) => {
    if (s === 'SCATTER') scatterPositions.push([reel, row]);
  }));
  const scatterCount = scatterPositions.length;
  const sc = SCATTER_PAY[Math.min(scatterCount, 5)];
  const scatterWin = sc ? Number((sc.multiplier * totalBet).toFixed(2)) : 0;
  
  // Award free spins from Scatter (3+ scatters)
  let freeSpinsAwarded = sc ? sc.freeSpins : 0;

  // Rule 2: เรียงแถวกัน 5 แถว (5 of a kind) ได้โบนัส Free Spins เพิ่ม 10 ครั้งต่อไลน์ที่ติด 5 ตัว
  const fiveOfAKindWins = lineWins.filter((w) => w.count === 5);
  const fiveOfAKindCount = fiveOfAKindWins.length;
  if (fiveOfAKindCount > 0) {
    freeSpinsAwarded += fiveOfAKindCount * 10;
  }

  const baseWin = Number((lineWins.reduce((s, w) => s + w.amount, 0) + scatterWin).toFixed(2));

  return {
    grid,
    lineWins,
    scatterCount,
    scatterPositions,
    scatterWin,
    freeSpinsAwarded,
    isJackpot: scatterCount >= 5,
    baseWin,
    fiveOfAKindCount,
  };
}
