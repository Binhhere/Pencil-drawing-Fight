const { Engine, World, Bodies } = Matter;

/**
 * PhysicsWorld — wraps Matter.js engine + world setup.
 * No built-in renderer; the arena uses a custom canvas render loop.
 */
export class PhysicsWorld {
  constructor(width, height) {
    this.width  = width;
    this.height = height;

    this.engine = Engine.create();
    this.engine.gravity.y = 1.2;

    this._floorY = height - 50;
  }

  get world() { return this.engine.world; }

  get floorY() { return this._floorY; }

  /** Add static floor + side walls. */
  addBounds() {
    const w = this.width, h = this.height;

    const floor = Bodies.rectangle(w / 2, this._floorY + 25, w, 50, {
      isStatic: true, label: 'floor',
      friction: 0.6, restitution: 0.15,
      render: { fillStyle: '#334155' },
    });
    const wallL = Bodies.rectangle(-25, h / 2, 50, h, {
      isStatic: true, label: 'wall', restitution: 0.3,
    });
    const wallR = Bodies.rectangle(w + 25, h / 2, 50, h, {
      isStatic: true, label: 'wall', restitution: 0.3,
    });

    World.add(this.world, [floor, wallL, wallR]);
    return floor;
  }

  /** Advance simulation by one fixed step (call each rAF tick). */
  step(dt = 1000 / 60) {
    Engine.update(this.engine, dt);
  }

  destroy() {
    World.clear(this.world, false);
    Engine.clear(this.engine);
  }
}
