/**
 * main.js — StickFighter Phase 1
 * Orchestrates: drawing → analysis → physics → combat → result
 */

import { DrawingCanvas }  from './canvas/DrawingCanvas.js';
import { ShapeAnalyzer }  from './analysis/ShapeAnalyzer.js';
import { StatsCalculator } from './analysis/StatsCalculator.js';
import { PhysicsWorld }   from './physics/PhysicsWorld.js';
import { FighterBody }    from './physics/FighterBody.js';
import { CombatManager }  from './combat/CombatManager.js';
import { HealthBar }      from './combat/HealthBar.js';
import { GameUI }         from './ui/GameUI.js';
import { StatsDisplay }   from './ui/StatsDisplay.js';

/* ═══════════════════════════════════════════════════════
   State
════════════════════════════════════════════════════════ */
const ui      = new GameUI();
const players = [
  {
    canvas:       null,
    statsDisplay: null,
    stats:        null,
    shapeData:    null,
    color:        '#1e40af',  // P1 blue
    label:        '🔵 Người chơi 1',
  },
  {
    canvas:       null,
    statsDisplay: null,
    stats:        null,
    shapeData:    null,
    color:        '#b91c1c',  // P2 red
    label:        '🔴 Người chơi 2',
  },
];

let physicsWorld  = null;
let fighters      = [];
let combatManager = null;
let healthBars    = [];
let rafId         = null;

/* ═══════════════════════════════════════════════════════
   Boot
════════════════════════════════════════════════════════ */
function init() {
  // Drawing canvases
  players.forEach((p, i) => {
    const n = i + 1;
    p.statsDisplay = new StatsDisplay(document.getElementById(`stats-p${n}`));
    p.statsDisplay.render(null);

    p.canvas = new DrawingCanvas(
      document.getElementById(`canvas-p${n}`),
      document.getElementById(`ink-bar-${n}`),
      p.color,
      () => onDrawUpdate(i),
    );

    document.getElementById(`clear-p${n}`).addEventListener('click', () => {
      p.canvas.clear();
      p.stats     = null;
      p.shapeData = null;
      p.statsDisplay.render(null);
      checkFightReady();
    });
  });

  ui.setFightReady(false);
  ui.onFight(startFight);
  ui.onReplay(resetGame);
  ui.showDraw();
}

/* ═══════════════════════════════════════════════════════
   Drawing phase
════════════════════════════════════════════════════════ */
function onDrawUpdate(playerIndex) {
  const p   = players[playerIndex];
  const pts = p.canvas.allPoints;
  if (pts.length < 6) {
    p.stats     = null;
    p.shapeData = null;
    p.statsDisplay.render(null);
    checkFightReady();
    return;
  }

  const shapeData = ShapeAnalyzer.analyze(pts);
  const stats     = StatsCalculator.calculate(shapeData);
  p.stats     = stats;
  p.shapeData = shapeData;
  p.statsDisplay.render(stats);
  checkFightReady();
}

function checkFightReady() {
  const ready = players.every(p => p.stats !== null);
  ui.setFightReady(ready);
}

/* ═══════════════════════════════════════════════════════
   Fight phase
════════════════════════════════════════════════════════ */
function startFight() {
  // Size arena to available width
  const arenaCanvas = document.getElementById('arena-canvas');
  const W = Math.min(window.innerWidth - 16, 720);
  const H = Math.round(W * 0.55);
  arenaCanvas.width  = W;
  arenaCanvas.height = H;

  ui.showArena();

  // Physics world
  physicsWorld = new PhysicsWorld(W, H);
  const floor  = physicsWorld.addBounds();

  // Spawn positions: P1 left quarter, P2 right quarter, above floor
  const spawnY = H * 0.25;
  const spawns = [W * 0.22, W * 0.78];

  // Create fighters
  fighters = players.map((p, i) => {
    const fb = new FighterBody({
      rawPoints: p.canvas.allPoints,
      strokes:   p.canvas.strokes,
      startX:    spawns[i],
      startY:    spawnY,
      stats:     p.stats,
      color:     p.color,
    });
    fb.create(physicsWorld.world);
    return fb;
  });

  // Give each fighter an initial nudge toward the other
  fighters[0].launchToward(spawns[1]);
  fighters[1].launchToward(spawns[0]);

  // Health bars
  healthBars = players.map((_, i) => {
    const n = i + 1;
    return new HealthBar(
      document.getElementById(`hp-bar-${n}`),
      document.getElementById(`hp-val-${n}`),
      fighters[i].maxHp,
    );
  });

  // Combat
  combatManager = new CombatManager(
    physicsWorld.engine,
    fighters[0],
    fighters[1],
    (fighter, dmg) => {
      // Health bars update each frame; nothing extra needed here
    },
    (winner) => {
      const winIdx = fighters.indexOf(winner);
      const losIdx = 1 - winIdx;
      ui.showResult(players[winIdx].label, players[losIdx].label);
      cancelAnimationFrame(rafId);
    },
  );

  // Render loop
  let lastTime = 0;
  function loop(ts) {
    const dt = Math.min(ts - lastTime, 50);  // cap at 50 ms to avoid spiral
    lastTime = ts;

    physicsWorld.step(dt || 16.67);
    combatManager.tick();

    renderArena(arenaCanvas, W, H, physicsWorld.floorY);
    healthBars.forEach((hb, i) => hb.update(fighters[i].hp));

    rafId = requestAnimationFrame(loop);
  }
  rafId = requestAnimationFrame(loop);
}

/* ═══════════════════════════════════════════════════════
   Arena rendering (custom — no Matter.Render)
════════════════════════════════════════════════════════ */
function renderArena(canvas, W, H, floorY) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#0a0f1e');
  sky.addColorStop(1, '#0f1f3d');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Stars (static, seeded)
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let i = 0; i < 40; i++) {
    const sx = ((i * 173 + 7)  % W);
    const sy = ((i * 97  + 13) % floorY);
    ctx.fillRect(sx, sy, 1.5, 1.5);
  }

  // Floor
  const floorGrad = ctx.createLinearGradient(0, floorY, 0, H);
  floorGrad.addColorStop(0, '#1e3a5f');
  floorGrad.addColorStop(1, '#0f2040');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, floorY, W, H - floorY);

  // Floor edge highlight
  ctx.beginPath();
  ctx.moveTo(0, floorY);
  ctx.lineTo(W, floorY);
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth   = 2;
  ctx.shadowColor = '#3b82f6';
  ctx.shadowBlur  = 8;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Draw fighters
  fighters.forEach(f => f.draw(ctx));

  // Debug: outline physics bodies (comment out for release)
  // drawDebugBodies(ctx);
}

/* ═══════════════════════════════════════════════════════
   Reset
════════════════════════════════════════════════════════ */
function resetGame() {
  // Stop physics + render
  if (rafId) cancelAnimationFrame(rafId);
  if (combatManager) combatManager.destroy();
  if (physicsWorld)  physicsWorld.destroy();
  fighters      = [];
  combatManager = null;
  physicsWorld  = null;
  healthBars    = [];

  // Reset player state
  players.forEach((p, i) => {
    const n = i + 1;
    p.canvas.clear();
    p.stats     = null;
    p.shapeData = null;
    p.statsDisplay.render(null);
  });

  ui.setFightReady(false);
  ui.showDraw();
}

/* ─── kick things off ─── */
init();
