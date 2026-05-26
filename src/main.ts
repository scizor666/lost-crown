import Phaser from 'phaser';
import type { MazeData, Direction } from './maze';
import { generateMaze, THEME_NAMES } from './maze';
import {
  playDoorOpen, playSearch, playEmpty,
  playCrownFound, playWinFanfare, playStep,
} from './audio';
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });


// ─────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────
const W = 800;
const H = 600;
const GRID_COLS = 5;
const GRID_ROWS = 5;

const ROOM_COLORS: Record<string, number[]> = {
  throne:      [0x6b21a8, 0x9333ea],
  bedroom:     [0xdb2777, 0xf472b6],
  library:     [0x1d4ed8, 0x60a5fa],
  kitchen:     [0xb45309, 0xfbbf24],
  garden:      [0x15803d, 0x4ade80],
  dungeon:     [0x374151, 0x6b7280],
  armory:      [0x7f1d1d, 0xef4444],
  ballroom:    [0x701a75, 0xe879f9],
  treasury:    [0x854d0e, 0xfde047],
  playroom:    [0xbe185d, 0xfb7185],
  gallery:     [0x1e3a8a, 0x93c5fd],
  chapel:      [0x4c1d95, 0xc4b5fd],
  stables:     [0x78350f, 0xd97706],
  observatory: [0x1e1b4b, 0x818cf8],
  dining:      [0x831843, 0xfda4af],
};

// ─────────────────────────────────────────────
//  BOOT SCENE
// ─────────────────────────────────────────────
class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload(): void {
    // Draw a simple loading bar
    const bar = this.add.graphics();
    bar.fillStyle(0xffffff, 0.3);
    bar.fillRoundedRect(W / 2 - 200, H / 2 - 16, 400, 32, 16);

    const fill = this.add.graphics();
    this.load.on('progress', (v: number) => {
      fill.clear();
      fill.fillStyle(0xfbbf24, 1);
      fill.fillRoundedRect(W / 2 - 196, H / 2 - 12, 392 * v, 24, 12);
    });

    this.add.text(W / 2, H / 2 - 60, '👑 Lost Crown', {
      fontFamily: '"Nunito", sans-serif',
      fontSize: '40px',
      color: '#fbbf24',
      stroke: '#7c2d12',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(W / 2, H / 2 + 60, 'Loading castle…', {
      fontFamily: '"Nunito", sans-serif',
      fontSize: '20px',
      color: '#fde68a',
    }).setOrigin(0.5);

    this.load.setBaseURL(import.meta.env.BASE_URL);
    this.load.image('may',   '/assets/may.png');
    this.load.image('didi',  '/assets/didi.png');
    this.load.image('crown', '/assets/crown.png');
  }

  create(): void {
    this.scene.start('Title');
  }
}

// ─────────────────────────────────────────────
//  TITLE SCENE
// ─────────────────────────────────────────────
class TitleScene extends Phaser.Scene {
  constructor() { super('Title'); }

  create(): void {
    // Gradient bg
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x4c1d95, 0x4c1d95, 0x1e1b4b, 0x1e1b4b, 1);
    bg.fillRect(0, 0, W, H);

    // Stars
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, W);
      const y = Phaser.Math.Between(0, H * 0.7);
      const r = Math.random() * 2 + 0.5;
      const star = this.add.circle(x, y, r, 0xffffff, Math.random() * 0.8 + 0.2);
      this.tweens.add({
        targets: star,
        alpha: { from: 0.2, to: 1 },
        duration: Phaser.Math.Between(800, 2000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000),
      });
    }

    // Castle silhouette (drawn with graphics)
    this.drawCastleSilhouette();

    // Title
    const title = this.add.text(W / 2, 90, '👑 Lost Crown', {
      fontFamily: '"Nunito", sans-serif',
      fontSize: '56px',
      color: '#fbbf24',
      stroke: '#7c2d12',
      strokeThickness: 8,
      shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 8, fill: true },
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scaleX: 1.04, scaleY: 1.04,
      yoyo: true, repeat: -1,
      duration: 1200, ease: 'Sine.easeInOut',
    });

    // May sprite
    const may = this.add.image(W / 2 - 110, 310, 'may').setScale(0.38);
    this.tweens.add({
      targets: may, y: 310 - 10,
      yoyo: true, repeat: -1,
      duration: 1400, ease: 'Sine.easeInOut',
    });

    // Didi sprite
    const didi = this.add.image(W / 2 + 110, 320, 'didi').setScale(0.30);
    this.tweens.add({
      targets: didi, y: 320 + 10,
      yoyo: true, repeat: -1,
      duration: 1100, ease: 'Sine.easeInOut',
    });

    // Crown sparkle
    const crown = this.add.image(W / 2, 250, 'crown').setScale(0.22);
    this.tweens.add({
      targets: crown,
      angle: { from: -8, to: 8 },
      yoyo: true, repeat: -1,
      duration: 900, ease: 'Sine.easeInOut',
    });

    // Story text
    this.add.text(W / 2, 400, [
      'Princess May was playing with Didi and her cat fish pole…',
      'and accidentally lost her crown somewhere in the 25-room castle!',
      'Help them search every room to find it! 🐾',
    ], {
      fontFamily: '"Nunito", sans-serif',
      fontSize: '15px',
      color: '#e9d5ff',
      align: 'center',
      wordWrap: { width: 640 },
      lineSpacing: 6,
    }).setOrigin(0.5);

    // Instructions
    this.add.text(W / 2, 470, '🗝️  Use arrow keys (or on-screen buttons) to move between rooms\n🔍  Click objects in each room to search them', {
      fontFamily: '"Nunito", sans-serif',
      fontSize: '13px',
      color: '#c4b5fd',
      align: 'center',
      wordWrap: { width: 600 },
      lineSpacing: 4,
    }).setOrigin(0.5);

    // Play button
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0xfbbf24, 1);
    btnBg.fillRoundedRect(W / 2 - 100, 510, 200, 55, 28);

    const btnText = this.add.text(W / 2, 537, '✨  Play!', {
      fontFamily: '"Nunito", sans-serif',
      fontSize: '26px',
      color: '#7c2d12',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const btn = this.add.zone(W / 2, 537, 200, 55).setInteractive({ cursor: 'pointer' });
    btn.on('pointerover', () => {
      btnBg.clear();
      btnBg.fillStyle(0xfde68a, 1);
      btnBg.fillRoundedRect(W / 2 - 100, 510, 200, 55, 28);
      this.tweens.add({ targets: btnText, scaleX: 1.06, scaleY: 1.06, duration: 100 });
    });
    btn.on('pointerout', () => {
      btnBg.clear();
      btnBg.fillStyle(0xfbbf24, 1);
      btnBg.fillRoundedRect(W / 2 - 100, 510, 200, 55, 28);
      this.tweens.add({ targets: btnText, scaleX: 1, scaleY: 1, duration: 100 });
    });
    btn.on('pointerdown', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(420, () => this.scene.start('Game'));
    });

    this.input.keyboard!.on('keydown-SPACE', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(420, () => this.scene.start('Game'));
    });
  }

  private drawCastleSilhouette(): void {
    const g = this.add.graphics();
    g.fillStyle(0x1e1b4b, 0.9);
    // Main body
    g.fillRect(120, 200, 560, 250);
    // Towers
    const towers = [[100, 140, 80, 80], [620, 140, 80, 80], [240, 160, 70, 60], [490, 160, 70, 60]];
    towers.forEach(([x, y, w, h]) => g.fillRect(x, y, w, h));
    // Battlements
    [[100, 140, 80], [620, 140, 80], [240, 160, 70], [490, 160, 70]].forEach(([x, , w]) => {
      for (let i = 0; i < 4; i++) {
        g.fillRect(x + i * (w / 3) + 2, (x === 240 || x === 490 ? 148 : 128), w / 5, 16);
      }
    });
    // Gate arch
    g.fillStyle(0x4c1d95, 1);
    g.fillRect(350, 310, 100, 140);
    g.fillCircle(400, 315, 50);
    g.fillStyle(0x1e1b4b, 0.9);
  }
}

// ─────────────────────────────────────────────
//  GAME SCENE
// ─────────────────────────────────────────────
class GameScene extends Phaser.Scene {
  private maze!: MazeData;
  private currentCol = 0;
  private currentRow = 0;
  private turnCount = 0;
  private crownFound = false;

  // UI Groups
  private roomContainer!: Phaser.GameObjects.Container;
  private hudContainer!: Phaser.GameObjects.Container;
  private navButtons: { dir: Direction; btn: Phaser.GameObjects.Container }[] = [];
  private miniMapCells: Phaser.GameObjects.Rectangle[][] = [];
  private miniMapPlayer!: Phaser.GameObjects.Arc;
  private turnText!: Phaser.GameObjects.Text;
  private roomNameText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;
  private messageTimer?: Phaser.Time.TimerEvent;

  constructor() { super('Game'); }

  create(): void {
    this.maze = generateMaze();
    this.currentCol = this.maze.startCol;
    this.currentRow = this.maze.startRow;
    this.turnCount = 0;
    this.crownFound = false;

    this.buildHUD();
    this.buildNavButtons();
    this.renderRoom();
    this.updateMiniMap();
    this.updateNavButtons();

    // Keyboard
    this.input.keyboard!.on('keydown', (e: KeyboardEvent) => {
      if (this.crownFound) return;
      const map: Record<string, Direction> = {
        ArrowUp: 'N', KeyW: 'N',
        ArrowDown: 'S', KeyS: 'S',
        ArrowRight: 'E', KeyD: 'E',
        ArrowLeft: 'W', KeyA: 'W',
      };
      const dir = map[e.code];
      if (dir) this.tryMove(dir);
    });

    this.cameras.main.fadeIn(400);
  }

  // ── HUD ──────────────────────────────────────
  private buildHUD(): void {
    this.hudContainer = this.add.container(0, 0);

    // Top bar
    const topBar = this.add.graphics();
    topBar.fillStyle(0x0f0a1e, 0.92);
    topBar.fillRect(0, 0, W, 58);

    // Crown icon + title
    const hudTitle = this.add.text(16, 12, '👑 Lost Crown', {
      fontFamily: '"Nunito", sans-serif',
      fontSize: '22px', color: '#fbbf24', fontStyle: 'bold',
    });

    this.roomNameText = this.add.text(W / 2, 12, '', {
      fontFamily: '"Nunito", sans-serif',
      fontSize: '18px', color: '#e9d5ff',
    }).setOrigin(0.5, 0);

    this.turnText = this.add.text(W - 16, 12, 'Turns: 0', {
      fontFamily: '"Nunito", sans-serif',
      fontSize: '18px', color: '#fde68a',
    }).setOrigin(1, 0);

    // Mini-map area
    const mapBg = this.add.graphics();
    mapBg.fillStyle(0x1e1b4b, 0.9);
    mapBg.fillRoundedRect(W - 148, 65, 138, 138, 10);

    this.add.text(W - 79, 70, 'Map', {
      fontFamily: '"Nunito", sans-serif', fontSize: '11px', color: '#a78bfa',
    }).setOrigin(0.5, 0);

    // Build mini-map cells
    this.miniMapCells = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      this.miniMapCells[r] = [];
      for (let c = 0; c < GRID_COLS; c++) {
        const x = (W - 148) + 12 + c * 23;
        const y = 84 + r * 23;
        const cell = this.add.rectangle(x, y, 19, 19, 0x312e81, 1).setOrigin(0, 0);
        this.miniMapCells[r][c] = cell;
      }
    }

    this.miniMapPlayer = this.add.arc(0, 0, 5, 0, 360, false, 0xfbbf24, 1);

    // Message text (center screen popups)
    this.messageText = this.add.text(W / 2, H / 2 - 40, '', {
      fontFamily: '"Nunito", sans-serif',
      fontSize: '22px', color: '#fde68a',
      stroke: '#000', strokeThickness: 4,
      align: 'center', wordWrap: { width: 420 },
    }).setOrigin(0.5).setDepth(100).setAlpha(0);

    this.hudContainer.add([
      topBar, hudTitle, this.roomNameText, this.turnText,
      mapBg, this.miniMapPlayer,
    ]);
    this.hudContainer.setDepth(10);
  }

  // ── NAV BUTTONS ──────────────────────────────
  private buildNavButtons(): void {
    const dirs: { dir: Direction; label: string; dx: number; dy: number }[] = [
      { dir: 'N', label: '▲', dx: 0, dy: -52 },
      { dir: 'S', label: '▼', dx: 0, dy:  52 },
      { dir: 'E', label: '▶', dx: 52, dy:  0 },
      { dir: 'W', label: '◀', dx: -52, dy: 0 },
    ];

    const cx = 80;
    const cy = H - 80;

    dirs.forEach(({ dir, label, dx, dy }) => {
      const bg = this.add.graphics();
      const txt = this.add.text(0, 0, label, {
        fontFamily: '"Nunito", sans-serif',
        fontSize: '22px', color: '#fff',
      }).setOrigin(0.5);

      const zone = this.add.zone(0, 0, 44, 44).setInteractive({ cursor: 'pointer' });
      zone.on('pointerdown', () => this.tryMove(dir));
      zone.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(0xfbbf24, 1);
        bg.fillCircle(0, 0, 22);
      });
      zone.on('pointerout', () => this.drawNavBtn(bg, dir));

      const container = this.add.container(cx + dx, cy + dy, [bg, txt, zone]);
      container.setDepth(12);
      this.drawNavBtn(bg, dir);
      this.navButtons.push({ dir, btn: container });
    });
  }

  private drawNavBtn(bg: Phaser.GameObjects.Graphics, dir: Direction): void {
    bg.clear();
    const room = this.maze.grid[this.currentRow][this.currentCol];
    const active = room.doors[dir];
    bg.fillStyle(active ? 0x7c3aed : 0x374151, active ? 0.9 : 0.4);
    bg.fillCircle(0, 0, 22);
    bg.lineStyle(2, active ? 0xc4b5fd : 0x4b5563, 1);
    bg.strokeCircle(0, 0, 22);
  }

  private updateNavButtons(): void {
    this.navButtons.forEach(({ dir, btn }) => {
      const bg = btn.getAt(0) as Phaser.GameObjects.Graphics;
      const txt = btn.getAt(1) as Phaser.GameObjects.Text;
      const room = this.maze.grid[this.currentRow][this.currentCol];
      const active = room.doors[dir];
      this.drawNavBtn(bg, dir);
      txt.setColor(active ? '#fff' : '#6b7280');
    });
  }

  // ── MINI MAP ─────────────────────────────────
  private updateMiniMap(): void {
    const { grid } = this.maze;
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const room = grid[r][c];
        let color = 0x312e81;
        if (room.explored) {
          const themeColors = ROOM_COLORS[room.theme] ?? [0x4c1d95, 0x7c3aed];
          color = themeColors[0] as number;
        }
        this.miniMapCells[r][c].setFillStyle(color);
      }
    }
    // Player dot
    const x = (W - 148) + 12 + this.currentCol * 23 + 9;
    const y = 84 + this.currentRow * 23 + 9;
    this.miniMapPlayer.setPosition(x, y).setDepth(20);
  }

  // ── ROOM RENDERING ────────────────────────────
  private renderRoom(): void {
    if (this.roomContainer) this.roomContainer.destroy();
    this.roomContainer = this.add.container(0, 0);
    this.roomContainer.setDepth(1);

    const room = this.maze.grid[this.currentRow][this.currentCol];
    const themeColors = ROOM_COLORS[room.theme] ?? [0x4c1d95, 0x7c3aed];
    const [darkC, lightC] = themeColors;

    // Background gradient
    const bgGfx = this.add.graphics();
    bgGfx.fillGradientStyle(darkC as number, darkC as number, lightC as number, lightC as number, 1);
    bgGfx.fillRect(0, 58, W, H - 58);
    this.roomContainer.add(bgGfx);

    // Floor
    const floorGfx = this.add.graphics();
    floorGfx.fillStyle(0x0f0a1e, 0.35);
    floorGfx.fillRect(0, H - 110, W, 110);
    // Floor tiles
    for (let i = 0; i < 9; i++) {
      floorGfx.lineStyle(1, 0xffffff, 0.06);
      floorGfx.lineBetween(i * 90, H - 110, i * 90, H);
    }
    for (let i = 0; i < 5; i++) {
      floorGfx.lineStyle(1, 0xffffff, 0.06);
      floorGfx.lineBetween(0, H - 110 + i * 28, W, H - 110 + i * 28);
    }
    this.roomContainer.add(floorGfx);

    // Doors (rendered as archways)
    this.drawDoors(room);

    // Room name
    this.roomNameText.setText(THEME_NAMES[room.theme] ?? room.theme);

    // Decorative arch top
    const archGfx = this.add.graphics();
    archGfx.fillStyle(0x000000, 0.2);
    archGfx.fillRect(0, 58, W, 28);
    this.roomContainer.add(archGfx);

    // Search spots
    const spotPositions = [
      { x: 160, y: H - 155 },
      { x: W / 2, y: H - 165 },
      { x: W - 160, y: H - 155 },
    ];

    room.searchSpots.forEach((spot, i) => {
      const pos = spotPositions[i] ?? { x: 200 + i * 200, y: H - 160 };

      // Spot base glow
      const glowGfx = this.add.graphics();
      glowGfx.fillStyle(0xffffff, 0.06);
      glowGfx.fillEllipse(pos.x, pos.y + 10, 90, 28);
      this.roomContainer.add(glowGfx);

      // The spot icon
      const spotBg = this.add.graphics();
      spotBg.fillStyle(spot.searched ? 0x374151 : (lightC as number), spot.searched ? 0.6 : 0.9);
      spotBg.fillRoundedRect(pos.x - 44, pos.y - 48, 88, 64, 14);
      spotBg.lineStyle(3, 0xffffff, spot.searched ? 0.2 : 0.6);
      spotBg.strokeRoundedRect(pos.x - 44, pos.y - 48, 88, 64, 14);
      this.roomContainer.add(spotBg);

      const emojiTxt = this.add.text(pos.x, pos.y - 24, spot.emoji, { fontSize: '30px' }).setOrigin(0.5);
      const labelTxt = this.add.text(pos.x, pos.y + 6, spot.label, {
        fontFamily: '"Nunito", sans-serif', fontSize: '11px',
        color: spot.searched ? '#6b7280' : '#fff',
        align: 'center', wordWrap: { width: 80 },
      }).setOrigin(0.5);
      this.roomContainer.add([emojiTxt, labelTxt]);

      // Searched overlay
      if (spot.searched) {
        const searchedTxt = this.add.text(pos.x, pos.y - 24, '✓', {
          fontFamily: '"Nunito", sans-serif', fontSize: '26px', color: '#4ade80',
        }).setOrigin(0.5);
        this.roomContainer.add(searchedTxt);
      }

      // Interactable zone
      if (!spot.searched && !this.crownFound) {
        const zone = this.add.zone(pos.x, pos.y - 16, 88, 64).setInteractive({ cursor: 'pointer' });
        zone.on('pointerover', () => {
          this.tweens.add({ targets: [spotBg, emojiTxt], y: '-=4', duration: 80, ease: 'Power1' });
        });
        zone.on('pointerout', () => {
          this.tweens.add({ targets: [spotBg, emojiTxt], y: '+=4', duration: 80, ease: 'Power1' });
        });
        zone.on('pointerdown', () => this.searchSpot(spot.id));
        this.roomContainer.add(zone);
      }
    });

    // Characters
    this.drawCharacters();

    // Sparkle particles if room has crown (don't reveal which spot)
    if (room.hasCrown && !room.searchSpots.find(s => s.searched && s.hasCrown)) {
      for (let i = 0; i < 8; i++) {
        const sx = Phaser.Math.Between(100, W - 100);
        const sy = Phaser.Math.Between(150, H - 120);
        const spark = this.add.text(sx, sy, '✨', { fontSize: '12px' }).setAlpha(0);
        this.roomContainer.add(spark);
        this.tweens.add({
          targets: spark, alpha: { from: 0, to: 0.8 }, y: sy - 20,
          yoyo: true, repeat: -1,
          duration: Phaser.Math.Between(600, 1400),
          delay: Phaser.Math.Between(0, 1000),
        });
      }
    }
  }

  private drawDoors(room: { doors: Record<Direction, boolean> }): void {
    const gfx = this.add.graphics();
    const doorColor = 0x1a0533;
    const archColor = 0x7c3aed;

    // North door (top center) - arch using slice
    if (room.doors.N) {
      gfx.fillStyle(doorColor, 1);
      gfx.fillRect(W / 2 - 40, 58, 80, 60);
      gfx.fillStyle(archColor, 0.7);
      gfx.slice(W / 2, 118, 42, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false);
      gfx.fillPath();
      gfx.fillStyle(0xfde68a, 0.25);
      gfx.fillRect(W / 2 - 3, 72, 6, 46);
    }
    // South door (bottom center)
    if (room.doors.S) {
      gfx.fillStyle(doorColor, 1);
      gfx.fillRect(W / 2 - 40, H - 90, 80, 90);
      gfx.fillStyle(archColor, 0.7);
      gfx.slice(W / 2, H - 90, 42, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false);
      gfx.fillPath();
    }
    // West door (left center)
    if (room.doors.W) {
      gfx.fillStyle(doorColor, 1);
      gfx.fillRect(0, H / 2 - 50, 60, 100);
      gfx.fillStyle(archColor, 0.7);
      gfx.slice(60, H / 2, 52, Phaser.Math.DegToRad(90), Phaser.Math.DegToRad(270), false);
      gfx.fillPath();
    }
    // East door (right center)
    if (room.doors.E) {
      gfx.fillStyle(doorColor, 1);
      gfx.fillRect(W - 60, H / 2 - 50, 60, 100);
      gfx.fillStyle(archColor, 0.7);
      gfx.slice(W - 60, H / 2, 52, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(90), false);
      gfx.fillPath();
    }

    this.roomContainer.add(gfx);
  }

  private drawCharacters(): void {
    const may = this.add.image(W / 2 - 70, H - 155, 'may').setScale(0.28);
    const didi = this.add.image(W / 2 + 60, H - 145, 'didi').setScale(0.22);

    this.tweens.add({ targets: may, y: H - 165, yoyo: true, repeat: -1, duration: 1200, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: didi, y: H - 135, yoyo: true, repeat: -1, duration: 900,  ease: 'Sine.easeInOut' });

    this.roomContainer.add([may, didi]);
  }

  // ── MOVEMENT ─────────────────────────────────
  private tryMove(dir: Direction): void {
    if (this.crownFound) return;
    const room = this.maze.grid[this.currentRow][this.currentCol];
    if (!room.doors[dir]) {
      this.showMessage('🚫 No door that way!', '#ff6b6b');
      return;
    }

    playDoorOpen();
    playStep();
    this.turnCount++;
    this.turnText.setText(`Turns: ${this.turnCount}`);

    const DELTA: Record<Direction, [number, number]> = {
      N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0],
    };
    const [dc, dr] = DELTA[dir];
    this.currentCol += dc;
    this.currentRow += dr;

    this.maze.grid[this.currentRow][this.currentCol].explored = true;

    // Slide camera
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.time.delayedCall(210, () => {
      this.renderRoom();
      this.updateMiniMap();
      this.updateNavButtons();
      this.cameras.main.fadeIn(200);
    });
  }

  // ── SEARCHING ────────────────────────────────
  private searchSpot(spotId: string): void {
    if (this.crownFound) return;
    const room = this.maze.grid[this.currentRow][this.currentCol];
    const spot = room.searchSpots.find(s => s.id === spotId);
    if (!spot || spot.searched) return;

    spot.searched = true;
    this.turnCount++;
    this.turnText.setText(`Turns: ${this.turnCount}`);
    playSearch();

    if (spot.hasCrown) {
      this.crownFound = true;
      playCrownFound();
      this.time.delayedCall(400, () => {
        this.showMessage(`✨ Found in the ${spot.label}! ✨\nThe Crown is FOUND! 👑`, '#fde68a', 2000);
        this.time.delayedCall(2200, () => {
          this.scene.start('Win', {
            turns: this.turnCount,
            roomName: THEME_NAMES[room.theme],
            spotLabel: spot.label,
          });
        });
      });
    } else {
      playEmpty();
      const funnyMessages = [
        `Just some dust bunnies in the ${spot.label}… 🐰`,
        `Nothing in the ${spot.label} — only a lost sock! 🧦`,
        `The ${spot.label} is crown-free! 🔍`,
        `Didi sniffed the ${spot.label}… nope! 🐱`,
        `May checked the ${spot.label}… empty! 😅`,
      ];
      this.showMessage(funnyMessages[Math.floor(Math.random() * funnyMessages.length)], '#c4b5fd');
      this.time.delayedCall(300, () => this.renderRoom());
    }
  }

  private showMessage(msg: string, color = '#fde68a', duration = 1600): void {
    if (this.messageTimer) this.messageTimer.remove();
    this.messageText.setText(msg).setColor(color).setAlpha(1);
    this.tweens.add({ targets: this.messageText, y: H / 2 - 60, duration: 200, ease: 'Back.out' });
    this.messageTimer = this.time.delayedCall(duration, () => {
      this.tweens.add({ targets: this.messageText, alpha: 0, duration: 400 });
    });
  }
}

// ─────────────────────────────────────────────
//  WIN SCENE
// ─────────────────────────────────────────────
class WinScene extends Phaser.Scene {
  constructor() { super('Win'); }

  create(data: { turns: number; roomName: string; spotLabel: string }): void {
    playWinFanfare();

    // Dark gradient bg
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x4c1d95, 0x4c1d95, 0x1e1b4b, 0x1e1b4b, 1);
    bg.fillRect(0, 0, W, H);

    // Confetti burst
    for (let i = 0; i < 60; i++) {
      const colors = [0xfbbf24, 0xf472b6, 0x60a5fa, 0x4ade80, 0xe879f9, 0xfde68a];
      const x = Phaser.Math.Between(0, W);
      const conf = this.add.rectangle(x, -20,
        Phaser.Math.Between(6, 14), Phaser.Math.Between(6, 14),
        colors[Phaser.Math.Between(0, colors.length - 1)]);
      this.tweens.add({
        targets: conf,
        y: H + 40,
        x: x + Phaser.Math.Between(-120, 120),
        angle: Phaser.Math.Between(-360, 360),
        duration: Phaser.Math.Between(1800, 3500),
        delay: Phaser.Math.Between(0, 1200),
        repeat: -1,
      });
    }

    // Stars
    for (let i = 0; i < 40; i++) {
      const s = this.add.text(
        Phaser.Math.Between(0, W), Phaser.Math.Between(0, H),
        '⭐', { fontSize: `${Phaser.Math.Between(14, 26)}px` }
      ).setAlpha(0);
      this.tweens.add({
        targets: s, alpha: { from: 0, to: 0.9 },
        yoyo: true, repeat: -1,
        duration: Phaser.Math.Between(500, 1500),
        delay: Phaser.Math.Between(0, 1500),
      });
    }

    // Crown sparkle
    const crown = this.add.image(W / 2, 130, 'crown').setScale(0.4).setAlpha(0);
    this.tweens.add({ targets: crown, alpha: 1, scaleX: 0.45, scaleY: 0.45, yoyo: true, repeat: -1, duration: 800 });
    this.tweens.add({ targets: crown, y: 120, yoyo: true, repeat: -1, duration: 1200, ease: 'Sine.easeInOut' });

    // May + Didi celebrating
    const may  = this.add.image(W / 2 - 100, 310, 'may').setScale(0.38);
    const didi = this.add.image(W / 2 + 100, 320, 'didi').setScale(0.30);
    this.tweens.add({ targets: may, y: 290, angle: { from: -8, to: 8 }, yoyo: true, repeat: -1, duration: 600 });
    this.tweens.add({ targets: didi, y: 300, angle: { from: 8, to: -8 }, yoyo: true, repeat: -1, duration: 500 });

    // Title
    const title = this.add.text(W / 2, 210, '👑 Crown Found! 👑', {
      fontFamily: '"Nunito", sans-serif',
      fontSize: '48px', color: '#fbbf24',
      stroke: '#7c2d12', strokeThickness: 8,
      shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 8, fill: true },
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: title, alpha: 1, y: 205, duration: 600, delay: 200, ease: 'Back.out' });

    // Details
    this.add.text(W / 2, 395, [
      `May found her crown in the ${data.roomName}`,
      `hiding inside the ${data.spotLabel}! 🎉`,
      '',
      `🐾 Total turns taken: ${data.turns}`,
    ], {
      fontFamily: '"Nunito", sans-serif',
      fontSize: '18px', color: '#e9d5ff',
      align: 'center', lineSpacing: 6,
    }).setOrigin(0.5);

    // Play again button
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0xfbbf24, 1);
    btnBg.fillRoundedRect(W / 2 - 120, 490, 240, 58, 29);

    const btnTxt = this.add.text(W / 2, 519, '🔄 Play Again!', {
      fontFamily: '"Nunito", sans-serif',
      fontSize: '26px', color: '#7c2d12', fontStyle: 'bold',
    }).setOrigin(0.5);

    const zone = this.add.zone(W / 2, 519, 240, 58).setInteractive({ cursor: 'pointer' });
    zone.on('pointerover', () => {
      btnBg.clear();
      btnBg.fillStyle(0xfde68a, 1);
      btnBg.fillRoundedRect(W / 2 - 120, 490, 240, 58, 29);
    });
    zone.on('pointerout', () => {
      btnBg.clear();
      btnBg.fillStyle(0xfbbf24, 1);
      btnBg.fillRoundedRect(W / 2 - 120, 490, 240, 58, 29);
    });
    zone.on('pointerdown', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(420, () => this.scene.start('Game'));
    });

    this.input.keyboard!.on('keydown-SPACE', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(420, () => this.scene.start('Game'));
    });

    const hintTxt = this.add.text(W / 2, 560, 'Press SPACE to play again', {
      fontFamily: '"Nunito", sans-serif', fontSize: '13px', color: '#a78bfa',
    }).setOrigin(0.5);
    this.tweens.add({ targets: hintTxt, alpha: { from: 0.4, to: 1 }, yoyo: true, repeat: -1, duration: 900 });
  }
}

// ─────────────────────────────────────────────
//  PHASER GAME CONFIG
// ─────────────────────────────────────────────
new Phaser.Game({
  type: Phaser.AUTO,
  width: W,
  height: H,
  backgroundColor: '#0f0a1e',
  parent: 'game-container',
  scene: [BootScene, TitleScene, GameScene, WinScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});
