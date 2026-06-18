import { AngleDetector } from './AngleDetector.js';

/**
 * ShapeAnalyzer — takes raw freehand points, simplifies the path, then
 * extracts area, perimeter, circularity, centroid, and angles.
 */
export class ShapeAnalyzer {

  /* ─── Douglas-Peucker path simplification ───────────── */

  static _perpDist(p, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    if (len < 1e-9) return Math.hypot(p.x - a.x, p.y - a.y);
    return Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / len;
  }

  static douglasPeucker(pts, eps) {
    if (pts.length < 3) return pts;
    let maxD = 0, idx = 0;
    const end = pts.length - 1;
    for (let i = 1; i < end; i++) {
      const d = this._perpDist(pts[i], pts[0], pts[end]);
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > eps) {
      const L = this.douglasPeucker(pts.slice(0, idx + 1), eps);
      const R = this.douglasPeucker(pts.slice(idx), eps);
      return [...L.slice(0, -1), ...R];
    }
    return [pts[0], pts[end]];
  }

  /* ─── geometry helpers ───────────────────────────────── */

  static area(pts) {
    let a = 0;
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      a += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
    }
    return Math.abs(a) / 2;
  }

  static perimeter(pts) {
    let len = 0;
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length;
      len += Math.hypot(pts[j].x - pts[i].x, pts[j].y - pts[i].y);
    }
    return len;
  }

  static centroid(pts) {
    return {
      x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
      y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
    };
  }

  /* ─── main entry point ───────────────────────────────── */

  /**
   * @param {Array<{x,y}>} rawPoints  — all drawn points (flat, across strokes)
   * @param {number}       epsilon    — simplification tolerance (px)
   * @returns shape descriptor object
   */
  static analyze(rawPoints, epsilon = 7) {
    // 1. Thin out dense raw points first (every 3rd) to speed up DP
    const thinned = rawPoints.filter((_, i) => i % 3 === 0);
    
    // 2. Simplify
    let pts = this.douglasPeucker(thinned.length >= 2 ? thinned : rawPoints, epsilon);

    // 3. Remove near-duplicate consecutive points
    pts = pts.filter((p, i) => {
      if (i === 0) return true;
      return Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y) > 1.5;
    });

    // 4. Fallback if too few points
    if (pts.length < 3) {
      const cx = rawPoints.reduce((s, p) => s + p.x, 0) / rawPoints.length;
      const cy = rawPoints.reduce((s, p) => s + p.y, 0) / rawPoints.length;
      const r  = 30;
      pts = [
        { x: cx,     y: cy - r },
        { x: cx + r, y: cy + r },
        { x: cx - r, y: cy + r },
      ];
    }

    const a   = this.area(pts);
    const p   = this.perimeter(pts);
    const c   = this.centroid(pts);
    // circularity: 1 = perfect circle, higher = spikier
    const circ = p * p / (4 * Math.PI * Math.max(a, 1));
    // roundness: 1 = circle, 0 = very spiky
    const roundness = Math.min(1, 1 / circ);

    const angles = AngleDetector.detectAll(pts);

    return { pts, area: a, perimeter: p, centroid: c, circularity: circ, roundness, angles };
  }
}
