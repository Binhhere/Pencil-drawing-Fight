/**
 * AngleDetector — measures interior angles at each vertex of a polygon.
 * Used by StatsCalculator to count sharp / right / obtuse corners.
 */
export class AngleDetector {
  /** Interior angle in degrees at vertex `curr`, between edges prev→curr and curr→next. */
  static getAngleAt(prev, curr, next) {
    const v1 = { x: prev.x - curr.x, y: prev.y - curr.y };
    const v2 = { x: next.x - curr.x, y: next.y - curr.y };
    const dot  = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.hypot(v1.x, v1.y);
    const mag2 = Math.hypot(v2.x, v2.y);
    if (mag1 < 1e-9 || mag2 < 1e-9) return 180;
    const cosA = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
    return Math.acos(cosA) * (180 / Math.PI);
  }

  /**
   * Classify angle per the GDD spec:
   *  < 45°       → sharp   (cộng DMG)
   *  45° – 80°   → neutral
   *  ~90°        → right   (cộng ARM + HP)
   *  > 90°       → obtuse  (cộng DEF / tròn dần)
   */
  static classify(deg) {
    if (deg < 45)  return 'sharp';
    if (deg < 80)  return 'neutral';
    if (deg < 115) return 'right';
    return 'obtuse';
  }

  /**
   * Run detection on a closed polygon (array of {x,y}).
   * @returns {Array<{angle:number, type:string, point:{x,y}}>}
   */
  static detectAll(points) {
    const n = points.length;
    if (n < 3) return [];
    return points.map((curr, i) => {
      const prev  = points[(i - 1 + n) % n];
      const next  = points[(i + 1) % n];
      const angle = this.getAngleAt(prev, curr, next);
      return { angle, type: this.classify(angle), point: curr };
    });
  }
}
