import type { AngleSample, AngleType, Point } from '../types/geometry';

export class AngleDetector {
  static getAngleAt(prev: Point, curr: Point, next: Point): number {
    const v1 = { x: prev.x - curr.x, y: prev.y - curr.y };
    const v2 = { x: next.x - curr.x, y: next.y - curr.y };
    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.hypot(v1.x, v1.y);
    const mag2 = Math.hypot(v2.x, v2.y);

    if (mag1 < 1e-9 || mag2 < 1e-9) return 180;

    const cosA = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
    return Math.acos(cosA) * (180 / Math.PI);
  }

  static classify(degrees: number): AngleType {
    if (degrees < 45) return 'sharp';
    if (degrees < 80) return 'neutral';
    if (degrees < 115) return 'right';
    return 'obtuse';
  }

  static detectAll(points: Point[]): AngleSample[] {
    if (points.length < 3) return [];

    return points.map((point, index) => {
      const prev = points[(index - 1 + points.length) % points.length];
      const next = points[(index + 1) % points.length];
      const angle = this.getAngleAt(prev, point, next);
      return { angle, type: this.classify(angle), point };
    });
  }
}
