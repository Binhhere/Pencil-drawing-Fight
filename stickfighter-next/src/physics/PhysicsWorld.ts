import Matter from 'matter-js';

export class PhysicsWorld {
  readonly engine = Matter.Engine.create();
  readonly world = this.engine.world;

  constructor(
    readonly width: number,
    readonly height: number,
  ) {
    this.engine.gravity.y = 1.2;
  }

  get floorY(): number {
    return this.height - 50;
  }

  addBounds(): void {
    const floor = Matter.Bodies.rectangle(this.width / 2, this.floorY + 25, this.width, 50, {
      isStatic: true,
      label: 'floor',
      friction: 0.6,
      restitution: 0.15,
    });
    const leftWall = Matter.Bodies.rectangle(-25, this.height / 2, 50, this.height, { isStatic: true });
    const rightWall = Matter.Bodies.rectangle(this.width + 25, this.height / 2, 50, this.height, { isStatic: true });
    Matter.World.add(this.world, [floor, leftWall, rightWall]);
  }

  step(deltaMs: number): void {
    Matter.Engine.update(this.engine, deltaMs);
  }
}
