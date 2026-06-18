# StickFighter Next

New TypeScript/Vite foundation for the drawing-first StickFighter game.

This folder keeps the old `stickfighter/` prototype intact and starts the production-oriented implementation described by the A.B version plan.

## Stack

- Vite
- TypeScript
- Matter.js
- poly-decomp
- Canvas renderer for A1-A4
- PixiJS deferred until A5.1, when particles and many objects justify it

## Current Scope

This scaffold targets A1.0:

- Draw on canvas with pointer input
- Track ink budget
- Analyze strokes into geometric metrics
- Calculate 7 stats: HP, DMG, ARM, DEF, REACH, SPEED, WEIGHT
- Classify weapon type: sword, shield, bow, balanced
- Show a temporary stat panel

Physics and combat modules are present as interfaces/skeletons for A2/A3, but the first playable target should finish A1 before expanding.

## Commands

```bash
npm install
npm run dev
npm run build
```

Open the dev server URL printed by Vite.

## Suggested Build Order

1. Finish A1.0 single drawing flow.
2. Add A1.1 touch validation and closed-path checks.
3. Tune A1.2 fill modifier.
4. Add A2 Matter body preview.
5. Add A3 combat loop.
