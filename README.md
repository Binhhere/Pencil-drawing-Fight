# ✏️⚔️ Pencil Drawing Fight (StickFighter)

A local two-player fighting game where **each player hand-draws their own fighter**. The geometry of what you draw — angles, area, roundness — automatically determines your combat stats. No AI, no trained model: just **pure geometric math** analyzing your strokes.

**Target audience:** kids under 10 · **Platform:** Web (browser), mobile support planned later.

---

## 🎮 Core Idea

1. Two players each draw a shape in their own half of the canvas (mouse or touch), sharing a fixed **ink budget**. Draw big and you get fewer details; draw with lots of sharp corners and your shape shrinks — a natural trade-off.
2. Each drawing is analyzed geometrically (angles, area, perimeter, roundness...) to automatically compute combat stats.
3. A physics engine (Matter.js) turns the drawing into a real rigid body — the fighter drops in, balances or topples based on its own center of gravity, and charges at the opponent on its own. No manual animation needed.

| Stat | Derived from geometry |
|---|---|
| ❤️ HP | Shape area + number of right angles |
| ⚔️ DMG | Number of sharp angles (< 45°) + average sharpness |
| 🛡 ARM | Right angles × area |
| 🌀 DEF | Roundness (perimeter² / 4π × area) |
| 🏹 REACH *(Next version)* | Max distance from centroid to a vertex |
| 💨 SPEED *(Next version)* | Inverse of moment of inertia |
| ⚖️ WEIGHT *(Next version)* | Area × density |

Drawings are also automatically classified into a **weapon type** (Sword / Shield / Bow) based on their geometric traits, instead of players picking a weapon from a menu.

📄 Full game design document: [`stickfighter_gdd.md`](./stickfighter_gdd.md)

---

## 📦 Project Structure

The repo contains two parallel implementations:

```
Pencil-drawing-Fight/
├── stickfighter/          # Prototype (Phase 1) — plain JS, no build tools
├── stickfighter-next/     # Next iteration — TypeScript + Vite, in active development
└── stickfighter_gdd.md    # Original Game Design Document
```

### 🔹 `stickfighter/` — Prototype (Phase 1)

A playable-today build using HTML/Canvas and plain JavaScript ES6 modules (no build step required).

**Stack:** HTML + Canvas API · JavaScript ES6 modules · [Matter.js 0.19](https://brm.io/matter-js/) · [poly-decomp 0.3](https://github.com/schteppe/poly-decomp.js)

**Quick start:**
```bash
cd stickfighter
python -m http.server 8080
# or: npx serve .
# Open http://localhost:8080
```
> Because this build uses ES6 modules, it must be served through a local server — opening `index.html` directly (`file://`) will not work.

**How to play:**
1. Both players draw a shape in their own half of the canvas (mouse or touch). The ink bar shows how much stroke length is left — draw big and you get less detail, draw with lots of sharp points and the shape gets smaller.
2. **HP / DMG / ARM / DEF** stats appear below the canvas right after each stroke.
3. When both players are done, press **⚔️ FIGHT!**
4. Both fighters drop onto the arena floor and automatically charge at each other.
5. Whoever runs out of HP first loses.

**Source layout:**
```
stickfighter/
├── index.html
├── styles/main.css
├── src/
│   ├── main.js                 ← orchestrator
│   ├── canvas/
│   │   ├── DrawingCanvas.js    ← hand-drawing + ink meter
│   │   └── InkMeter.js
│   ├── analysis/
│   │   ├── ShapeAnalyzer.js    ← Douglas-Peucker simplification + geometry
│   │   ├── AngleDetector.js    ← angle classification
│   │   └── StatsCalculator.js  ← HP/DMG/ARM/DEF formulas
│   ├── physics/
│   │   ├── PhysicsWorld.js     ← Matter.js world setup
│   │   └── FighterBody.js      ← rigid body built from the drawn shape
│   ├── combat/
│   │   ├── CombatManager.js    ← collision → damage
│   │   └── HealthBar.js        ← HP bar rendering
│   └── ui/
│       ├── GameUI.js           ← phase transitions
│       └── StatsDisplay.js     ← stat chips
└── docs/
    ├── stickfighter_gdd.md
    └── CHANGELOG.md
```

More detail (full controls, stat formulas, source layout): see [`stickfighter/README.md`](./stickfighter/README.md)

### 🔹 `stickfighter-next/` — Next Version (in development)

A production-oriented rewrite in TypeScript + Vite. The `stickfighter/` prototype is kept as-is for reference.

**Stack:** [Vite](https://vitejs.dev/) · TypeScript · [Matter.js](https://brm.io/matter-js/) · [poly-decomp](https://github.com/schteppe/poly-decomp.js) · Canvas renderer (PixiJS to be added at stage A5.1)

**Run it:**
```bash
cd stickfighter-next
npm install
npm run dev      # start the Vite dev server
npm run build    # production build
```
Open the dev server URL printed by Vite in your terminal.

**Current scope (A1.0):**
- Draw on canvas with pointer input
- Track ink budget
- Analyze strokes into geometric metrics
- Calculate 7 stats: HP, DMG, ARM, DEF, REACH, SPEED, WEIGHT
- Classify weapon type: sword, shield, bow, balanced
- Show a temporary stat panel

Physics and combat modules exist as interfaces/skeletons for stages A2/A3, but A1 should be finished and stable before those are expanded.

**Source layout:**
```
stickfighter-next/
├── index.html
├── src/
│   ├── main.ts
│   ├── styles.css
│   ├── types/
│   │   ├── geometry.ts
│   │   └── combat.ts
│   ├── drawing/
│   │   ├── DrawingCanvas.ts
│   │   ├── InkBudget.ts
│   │   └── StrokeStore.ts
│   ├── analysis/
│   │   ├── ShapeAnalyzer.ts
│   │   ├── AngleDetector.ts
│   │   ├── StatCalculator.ts
│   │   └── WeaponClassifier.ts
│   ├── physics/
│   │   ├── PhysicsWorld.ts
│   │   └── FighterBody.ts
│   ├── combat/
│   │   ├── CombatSystem.ts
│   │   └── DamageResolver.ts
│   ├── render/
│   │   └── CanvasArenaRenderer.ts
│   ├── game/
│   │   └── Game.ts
│   └── ui/
│       └── StatsPanel.ts
└── docs/
```

More detail: see [`stickfighter-next/README.md`](./stickfighter-next/README.md)

---

## 🧮 Stat System (design reference)

All stats come from pure geometric math — no AI, no trained model.

| Stat | Measured from | Target formula |
|---|---|---|
| **HP** | Shape area + number of right angles | `HP = area * k1 + right_angles * k2` |
| **DMG** | Number of sharp angles (< 45°), average sharpness | `DMG = avg(180° - sharp_angle) * k3` |
| **ARM** | Number of right angles (~90°) + area | `ARM = right_angles * k4 * area` |
| **DEF** | Roundness = perimeter² / (4π × area) | `DEF = roundness * k5` (a perfect circle = 1.0) |
| **REACH** | Max distance from centroid to farthest vertex | `REACH = max(dist(centroid, vertex))` |
| **SPEED** | Inverse of moment of inertia | `SPEED = 1 / moment_of_inertia` — thinner shapes move faster |
| **WEIGHT** | Area × density | Affects knockback on collision |

**Balancing via ink:** each player gets the same total stroke length. Drawing bigger means fewer details; drawing with many sharp points shrinks the shape — a built-in trade-off.

**Angle classification:**
```
< 45°     → sharp    → adds to DMG
45°–80°   → neutral
~ 90°     → right    → adds to ARM + HP
> 90°     → obtuse   → adds to DEF (rounder)
```

**Weapons come from shape, not a selection menu.** Each drawing is automatically classified based on its geometry:

| If the shape has... | Detected type | Combat effect |
|---|---|---|
| Many sharp angles, high REACH, small area | **Sword** | High damage when a sharp vertex hits the opponent |
| Large area, high DEF, high ARM | **Shield** | Knockback push-back, reduced incoming damage |
| Small, concentrated sharp points, high SPEED | **Bow** | Spawns a small projectile on first contact |

**Physics-driven movement (no hand animation):**
- The drawn shape becomes a real Matter.js rigid body
- It drops in, gravity takes over, and it balances itself according to its own shape
- If the center of gravity (COG) sits outside its base, it topples — Matter.js handles this entirely
- A well-drawn shape stands and moves confidently; a lopsided one tilts, rolls, and limps — and that's part of the fun

---

## 🗺️ Development Roadmap

### Phase 1 — Proof of Concept
Goal: get it running and fun, not pretty. Each side draws exactly one shape, splits the screen left/right, and pressing **FIGHT** drops both shapes onto the arena floor to auto-charge at each other. First to zero HP loses. No tutorial, no save system, no online multiplayer, no hand animation, no sound in this phase.

### Version plan (v0.1 → v4.0)
Progress is measured by scope completed, not by calendar time.

| Version | Milestone |
|---|---|
| **v0.1 — Drawing + Stats** | Canvas drawing, ink meter, vertex export, 7-stat calculation and display |
| **v0.2 — Physics Body** | Drawn shapes become real Matter.js rigid bodies; drop, balance, or topple naturally |
| **v0.3 — Combat Loop** | Auto-charge on contact, damage resolution (DMG vs ARM/DEF), weapon-type effects, win/lose state |
| **v0.4 — Playtest + Balance** | Internal playtesting, tuning constants (k1–k5) and charge force, bug fixes, minimal usable UI |
| **v1.0 — Web Launch** | Deploy (Vercel / Netlify / GitHub Pages), tablet-responsive layout, shareable link |
| **v1.1 — Mobile Polish** | Smooth multi-touch for two simultaneous players, portrait/landscape layouts, iOS Safari + Android Chrome testing |
| **v2.0 — Multi-unit** | Draw a squad of 2–5 shapes per side sharing one ink budget; small-many vs. large-few tactical trade-offs |
| **v3.0 — Online Multiplayer** | WebSocket server, stroke/vertex sync between clients, simple room codes, no accounts required |
| **v4.0 — Monetization + Scale** | Not yet designed; to be defined once real player data exists from v1.0 |

### Later phases (design sketch, not yet detailed)
- **Phase 2 — Multi-unit & tactics:** draw multiple units per side, select/group units, draw directional arrows to issue movement orders (RTS-style unit selection).
- **Phase 3 — Polish & mobile:** trace-over tutorials with a faint outline template, a basic shape library (sword, gun, shield, spear), Capacitor mobile port, sound and effects.
- **Phase 4 — Scale:** save drawings and replays (needs backend + database), online multiplayer via WebSocket, collabs/skins/IP (needs API + auth), and — once there's enough real player data — training an actual ML model from it.

---

## 👨‍💻 Author

Binhhere

## 📃 License

All Rights Reserved. This repository is public for portfolio and reference purposes only — no permission is granted to copy, modify, distribute, or commercially use this code. See [`LICENSE`](./LICENSE) for details.