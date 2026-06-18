import type { Point } from '../types/geometry';

type PaintedSegment = {
  from: Point;
  to: Point;
};

export class InkBudget {
  private paintedSegments: PaintedSegment[] = [];
  private remainingInk: number;

  constructor(private readonly maxInk = 2200) {
    this.remainingInk = maxInk;
  }

  get remaining(): number {
    return this.remainingInk;
  }

  get ratio(): number {
    return this.remainingInk / this.maxInk;
  }

  canDraw(): boolean {
    return this.remainingInk > 0;
  }

  useSegment(from: Point, to: Point): boolean {
    if (!this.canDraw()) return false;

    const length = Math.hypot(to.x - from.x, to.y - from.y);
    const covered = this.hasNearbyPaintedSegment(from, to);
    const cost = covered ? 0 : length;

    if (cost > this.remainingInk) return false;

    this.remainingInk = Math.max(0, this.remainingInk - cost);
    this.paintedSegments.push({ from, to });
    return true;
  }

  reset(): void {
    this.remainingInk = this.maxInk;
    this.paintedSegments = [];
  }

  private hasNearbyPaintedSegment(from: Point, to: Point): boolean {
    const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
    return this.paintedSegments.some((segment) => {
      const segmentMid = {
        x: (segment.from.x + segment.to.x) / 2,
        y: (segment.from.y + segment.to.y) / 2,
      };
      return Math.hypot(mid.x - segmentMid.x, mid.y - segmentMid.y) < 5;
    });
  }
}
