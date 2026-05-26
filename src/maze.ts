// ============================================================
// maze.ts - Dynamic castle maze generator for Lost Crown
// ============================================================

export type Direction = 'N' | 'S' | 'E' | 'W';

export interface Room {
  col: number;
  row: number;
  doors: Record<Direction, boolean>;
  visited: boolean;
  explored: boolean;  // whether the player has visited this room
  hasCrown: boolean;
  theme: RoomTheme;
  searchSpots: SearchSpot[];
}

export interface SearchSpot {
  id: string;
  label: string;
  emoji: string;
  searched: boolean;
  hasCrown: boolean;
}

export type RoomTheme =
  | 'throne'
  | 'bedroom'
  | 'library'
  | 'kitchen'
  | 'garden'
  | 'dungeon'
  | 'armory'
  | 'ballroom'
  | 'treasury'
  | 'playroom'
  | 'gallery'
  | 'chapel'
  | 'stables'
  | 'observatory'
  | 'dining';

export interface MazeData {
  grid: Room[][];
  cols: number;
  rows: number;
  startCol: number;
  startRow: number;
  crownCol: number;
  crownRow: number;
  crownSpotId: string;
}

const COLS = 5;
const ROWS = 5;

const ROOM_THEMES: RoomTheme[] = [
  'throne', 'bedroom', 'library', 'kitchen', 'garden',
  'dungeon', 'armory', 'ballroom', 'treasury', 'playroom',
  'gallery', 'chapel', 'stables', 'observatory', 'dining',
];

const THEME_SPOTS: Record<RoomTheme, { label: string; emoji: string }[]> = {
  throne:      [{ label: 'Royal Throne',  emoji: '👑' }, { label: 'Tapestry',    emoji: '🖼️' }, { label: 'Red Carpet',  emoji: '🟥' }],
  bedroom:     [{ label: 'Royal Bed',     emoji: '🛏️' }, { label: 'Wardrobe',    emoji: '🚪' }, { label: 'Vanity',      emoji: '🪞' }],
  library:     [{ label: 'Bookshelf',     emoji: '📚' }, { label: 'Reading Chair',emoji: '🪑' }, { label: 'Globe',       emoji: '🌍' }],
  kitchen:     [{ label: 'Cooking Pot',   emoji: '🍲' }, { label: 'Pantry',      emoji: '🧺' }, { label: 'Oven',        emoji: '🔥' }],
  garden:      [{ label: 'Rose Bush',     emoji: '🌹' }, { label: 'Fountain',    emoji: '⛲' }, { label: 'Flower Bed',  emoji: '🌸' }],
  dungeon:     [{ label: 'Treasure Chest',emoji: '📦' }, { label: 'Old Barrel',  emoji: '🛢️' }, { label: 'Stone Wall',  emoji: '🪨' }],
  armory:      [{ label: 'Weapon Rack',   emoji: '⚔️' }, { label: 'Shield Wall', emoji: '🛡️' }, { label: 'Armor Stand', emoji: '🦺' }],
  ballroom:    [{ label: 'Stage Curtain', emoji: '🎭' }, { label: 'Piano',       emoji: '🎹' }, { label: 'Chandelier',  emoji: '✨' }],
  treasury:    [{ label: 'Gold Chest',    emoji: '💰' }, { label: 'Coin Stack',  emoji: '🪙' }, { label: 'Jewel Box',   emoji: '💎' }],
  playroom:    [{ label: 'Toy Box',       emoji: '🧸' }, { label: 'Dollhouse',   emoji: '🏠' }, { label: 'Ball Pit',    emoji: '🎱' }],
  gallery:     [{ label: 'Painting',      emoji: '🖼️' }, { label: 'Sculpture',  emoji: '🗿' }, { label: 'Display Case',emoji: '🔮' }],
  chapel:      [{ label: 'Altar',         emoji: '🕯️' }, { label: 'Pew',        emoji: '🪑' }, { label: 'Window',      emoji: '🌈' }],
  stables:     [{ label: 'Hay Pile',      emoji: '🌾' }, { label: 'Feed Bucket', emoji: '🪣' }, { label: 'Saddle',      emoji: '🐴' }],
  observatory: [{ label: 'Telescope',     emoji: '🔭' }, { label: 'Star Chart',  emoji: '⭐' }, { label: 'Night Globe', emoji: '🌙' }],
  dining:      [{ label: 'Dining Table',  emoji: '🍽️' }, { label: 'Sideboard',  emoji: '🪚' }, { label: 'Fireplace',   emoji: '🔥' }],
};

const THEME_NAMES: Record<RoomTheme, string> = {
  throne:      'Throne Room',
  bedroom:     'Royal Bedroom',
  library:     'Grand Library',
  kitchen:     'Castle Kitchen',
  garden:      'Indoor Garden',
  dungeon:     'Old Dungeon',
  armory:      'Royal Armory',
  ballroom:    'Grand Ballroom',
  treasury:    'Royal Treasury',
  playroom:    'May\'s Playroom',
  gallery:     'Art Gallery',
  chapel:      'Castle Chapel',
  stables:     'Indoor Stables',
  observatory: 'Observatory Tower',
  dining:      'Dining Hall',
};

export { THEME_NAMES };

function rng(max: number): number {
  return Math.floor(Math.random() * max);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rng(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const OPPOSITE: Record<Direction, Direction> = { N: 'S', S: 'N', E: 'W', W: 'E' };
const DELTA: Record<Direction, [number, number]> = {
  N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0],
};

function buildGrid(): Room[][] {
  const themes = shuffle(ROOM_THEMES);
  let themeIdx = 0;

  const grid: Room[][] = [];
  for (let r = 0; r < ROWS; r++) {
    grid[r] = [];
    for (let c = 0; c < COLS; c++) {
      const theme = themes[themeIdx % themes.length];
      themeIdx++;
      const spots = THEME_SPOTS[theme].map((s, i) => ({
        id: `${c}-${r}-${i}`,
        label: s.label,
        emoji: s.emoji,
        searched: false,
        hasCrown: false,
      }));
      grid[r][c] = {
        col: c, row: r,
        doors: { N: false, S: false, E: false, W: false },
        visited: false,
        explored: false,
        hasCrown: false,
        theme,
        searchSpots: spots,
      };
    }
  }
  return grid;
}

function carveMaze(grid: Room[][]): void {
  const stack: [number, number][] = [[0, 0]];
  grid[0][0].visited = true;

  while (stack.length > 0) {
    const [c, r] = stack[stack.length - 1];
    const dirs = shuffle(['N', 'S', 'E', 'W'] as Direction[]);
    let moved = false;
    for (const dir of dirs) {
      const [dc, dr] = DELTA[dir];
      const nc = c + dc;
      const nr = r + dr;
      if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;
      if (grid[nr][nc].visited) continue;
      // Carve
      grid[r][c].doors[dir] = true;
      grid[nr][nc].doors[OPPOSITE[dir]] = true;
      grid[nr][nc].visited = true;
      stack.push([nc, nr]);
      moved = true;
      break;
    }
    if (!moved) stack.pop();
  }
}

function bfsDistances(grid: Room[][], startC: number, startR: number): number[][] {
  const dist: number[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(-1));
  dist[startR][startC] = 0;
  const queue: [number, number][] = [[startC, startR]];
  while (queue.length > 0) {
    const [c, r] = queue.shift()!;
    const room = grid[r][c];
    for (const dir of (['N', 'S', 'E', 'W'] as Direction[])) {
      if (!room.doors[dir]) continue;
      const [dc, dr] = DELTA[dir];
      const nc = c + dc;
      const nr = r + dr;
      if (dist[nr][nc] !== -1) continue;
      dist[nr][nc] = dist[r][c] + 1;
      queue.push([nc, nr]);
    }
  }
  return dist;
}

export function generateMaze(): MazeData {
  const grid = buildGrid();
  carveMaze(grid);

  const startC = 0;
  const startR = 0;
  grid[startR][startC].explored = true;

  const distances = bfsDistances(grid, startC, startR);

  // Collect rooms at BFS distance >= 5
  const candidates: [number, number][] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (distances[r][c] >= 5) candidates.push([c, r]);
    }
  }

  // Fallback: if no room is >= 5 steps away, find the single farthest room
  // (search ALL rooms, not just row 0)
  let pool: [number, number][];
  if (candidates.length > 0) {
    pool = candidates;
  } else {
    let farthestDist = 0;
    let farthestC = 0;
    let farthestR = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (distances[r][c] > farthestDist) {
          farthestDist = distances[r][c];
          farthestC = c;
          farthestR = r;
        }
      }
    }
    pool = [[farthestC, farthestR]];
  }

  const [crownC, crownR] = pool[rng(pool.length)];
  const crownRoom = grid[crownR][crownC];
  const crownSpot = crownRoom.searchSpots[rng(crownRoom.searchSpots.length)];
  crownSpot.hasCrown = true;
  crownRoom.hasCrown = true;

  // Debug: confirm crown is always placed and reachable
  console.log(
    `👑 Crown placed in room (${crownC},${crownR}) – ${THEME_NAMES[crownRoom.theme]}` +
    ` inside "${crownSpot.label}" (BFS distance: ${distances[crownR][crownC]})`
  );

  return {
    grid,
    cols: COLS,
    rows: ROWS,
    startCol: startC,
    startRow: startR,
    crownCol: crownC,
    crownRow: crownR,
    crownSpotId: crownSpot.id,
  };
}
