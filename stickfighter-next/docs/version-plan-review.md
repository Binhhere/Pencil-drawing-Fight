# Version Plan Review

## Assessment

The A.B plan is implementable and technically coherent. The strongest decision is delaying PixiJS until A5.1. The early product risk is not rendering performance; it is whether drawing analysis, stat formulas, and combat feedback feel understandable and fun.

## Recommended Tech Path

Use this sequence:

1. A1-A4: Vite + TypeScript + Canvas + Matter.js.
2. A5.1: introduce PixiJS only after combat, mobile touch, and effects need a better render layer.
3. A8+: add a Node/WebSocket server only after local play is proven.

This keeps iteration fast and avoids locking the gameplay inside a heavy engine before the rules are known.

## What I Can Build From This Plan

- A1.0-A1.3: drawing, ink budget, path simplification, 7 stats, weapon classifier, local draft save.
- A2.0-A2.2: Matter.js body creation, floor/world tuning, debug render, speed-based auto push.
- A3.0-A3.3: collision combat, damage resolver, cooldowns, HP bars, rematch rules, playtest tuning hooks.
- A4.0-A5.3: launch layout, responsive/mobile input, audio toggle, Pixi renderer migration, Capacitor wrapper.
- A6.0+: multi-unit architecture, selection, orders, per-tip cooldowns.
- A8.0+: WebSocket room flow once local deterministic state is stable enough.

## Main Risks

- Closed shape detection: freehand drawings are messy, so A1.1 validation must be forgiving.
- Fill modifier: measuring real filled area from strokes is harder than estimating stroke length over outline area. Start with an estimate, then improve with raster sampling if needed.
- Concave physics bodies: Matter.js plus poly-decomp can fail on noisy vertices. Keep convex hull and circle fallbacks.
- Combat readability: players must understand why a hit hurt. Debug overlays and simple effects matter more than complex formulas early.
- Mobile multi-touch: two players drawing at the same time needs pointer tracking per canvas/player, not a single global drawing state.

## MVP Cut

The practical first public MVP should stop at A4.0:

- one device
- two players
- one fighter each
- drawing to 7 stats
- physics body
- combat winner
- simple web deployment

Audio, mobile polish, PixiJS, multi-unit, bot, online, and save/meta should remain follow-up layers.
