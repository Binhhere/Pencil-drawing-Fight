import type { Point, Stroke } from '../types/geometry';

const STORAGE_KEY = 'stickfighter-next-strokes';

export class StrokeStore {
  private strokes: Stroke[] = [];

  get all(): Stroke[] {
    return this.strokes.map((stroke) => [...stroke]);
  }

  get flatPoints(): Point[] {
    return this.strokes.flat();
  }

  add(stroke: Stroke): void {
    if (stroke.length < 2) return;
    this.strokes.push(stroke);
  }

  clear(): void {
    this.strokes = [];
    localStorage.removeItem(STORAGE_KEY);
  }

  saveDraft(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.strokes));
  }

  loadDraft(): void {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Stroke[];
      if (Array.isArray(parsed)) this.strokes = parsed;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}
