import Matter from 'matter-js';
import type { FighterStats } from '../types/combat';
import type { Point } from '../types/geometry';

type FighterBodyOptions = {
  vertices: Point[];
  stats: FighterStats;
  startX: number;
  startY: number;
};

export class FighterBody {
  body: Matter.Body | null = null;
  hp: number;

  constructor(private readonly options: FighterBodyOptions) {
    this.hp = options.stats.hp;
  }

  get maxHp(): number {
    return this.options.stats.hp;
  }

  get stats(): FighterStats {
    return this.options.stats;
  }

  create(world: Matter.World): Matter.Body {
    const body = Matter.Bodies.fromVertices(
      this.options.startX,
      this.options.startY,
      [this.centerAndScale(this.options.vertices)],
      {
        label: 'fighter',
        friction: 0.5,
        restitution: 0.35,
        density: 0.001 + this.options.stats.weight / 50000,
      },
      true,
    );

    this.body = body;
    Matter.World.add(world, body);
    return body;
  }

  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
  }

  private centerAndScale(vertices: Point[]): Point[] {
    const minX = Math.min(...vertices.map((point) => point.x));
    const maxX = Math.max(...vertices.map((point) => point.x));
    const minY = Math.min(...vertices.map((point) => point.y));
    const maxY = Math.max(...vertices.map((point) => point.y));
    const width = maxX - minX || 10;
    const height = maxY - minY || 10;
    const scale = 155 / Math.max(width, height);

    return vertices.map((point) => ({
      x: (point.x - minX - width / 2) * scale,
      y: (point.y - minY - height / 2) * scale,
    }));
  }
}
