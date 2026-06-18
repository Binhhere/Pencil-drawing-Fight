import { AngleDetector } from './AngleDetector';
import type { Point, ShapeMetrics, Stroke } from '../types/geometry';

export class ShapeAnalyzer {
  static analyze(strokes: Stroke[], epsilon = 7): ShapeMetrics {
    const rawPoints = strokes.flat();
    const thinned = rawPoints.filter((_, index) => index % 3 === 0);
    const source = thinned.length >= 3 ? thinned : rawPoints;
    let vertices = this.douglasPeucker(source, epsilon);

    vertices = vertices.filter((point, index) => {
      if (index === 0) return true;
      const prev = vertices[index - 1];
      return Math.hypot(point.x - prev.x, point.y - prev.y) > 1.5;
    });

    if (vertices.length < 3) {
      vertices = this.fallbackTriangle(rawPoints);
    }

    const area = this.area(vertices);
    const perimeter = this.perimeter(vertices);
    const centroid = this.centroid(vertices);
    const circularity = perimeter * perimeter / (4 * Math.PI * Math.max(area, 1));
    const roundness = Math.min(1, 1 / circularity);
    const reach = Math.max(...vertices.map((p) => Math.hypot(p.x - centroid.x, p.y - centroid.y)));
    const momentOfInertia = this.approximateMomentOfInertia(vertices, centroid, area);
    const angles = AngleDetector.detectAll(vertices);

    return { vertices, area, perimeter, centroid, circularity, roundness, reach, momentOfInertia, angles };
  }

  static douglasPeucker(points: Point[], epsilon: number): Point[] {
    if (points.length < 3) return points;

    let maxDistance = 0;
    let splitIndex = 0;
    const end = points.length - 1;

    for (let index = 1; index < end; index++) {
      const distance = this.perpendicularDistance(points[index], points[0], points[end]);
      if (distance > maxDistance) {
        maxDistance = distance;
        splitIndex = index;
      }
    }

    if (maxDistance > epsilon) {
      const left = this.douglasPeucker(points.slice(0, splitIndex + 1), epsilon);
      const right = this.douglasPeucker(points.slice(splitIndex), epsilon);
      return [...left.slice(0, -1), ...right];
    }

    return [points[0], points[end]];
  }

  static area(points: Point[]): number {
    let area = 0;
    for (let index = 0; index < points.length; index++) {
      const next = (index + 1) % points.length;
      area += points[index].x * points[next].y - points[next].x * points[index].y;
    }
    return Math.abs(area) / 2;
  }

  static perimeter(points: Point[]): number {
    let length = 0;
    for (let index = 0; index < points.length; index++) {
      const next = (index + 1) % points.length;
      length += Math.hypot(points[next].x - points[index].x, points[next].y - points[index].y);
    }
    return length;
  }

  static centroid(points: Point[]): Point {
    return {
      x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
      y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
    };
  }

  private static perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const length = Math.hypot(dx, dy);
    if (length < 1e-9) return Math.hypot(point.x - lineStart.x, point.y - lineStart.y);
    return Math.abs(dy * point.x - dx * point.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x) / length;
  }

  private static approximateMomentOfInertia(points: Point[], centroid: Point, area: number): number {
    const avgRadiusSq = points.reduce((sum, point) => {
      const dx = point.x - centroid.x;
      const dy = point.y - centroid.y;
      return sum + dx * dx + dy * dy;
    }, 0) / points.length;

    return Math.max(1, area * avgRadiusSq);
  }

  private static fallbackTriangle(points: Point[]): Point[] {
    const centroid = this.centroid(points.length > 0 ? points : [{ x: 150, y: 130 }]);
    const radius = 30;
    return [
      { x: centroid.x, y: centroid.y - radius },
      { x: centroid.x + radius, y: centroid.y + radius },
      { x: centroid.x - radius, y: centroid.y + radius },
    ];
  }
}
