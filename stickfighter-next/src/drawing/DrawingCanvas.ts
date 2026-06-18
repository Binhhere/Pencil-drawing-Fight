import { InkBudget } from './InkBudget';
import { StrokeStore } from './StrokeStore';
import type { Point, Stroke } from '../types/geometry';

type DrawingCanvasOptions = {
  canvas: HTMLCanvasElement;
  inkEl: HTMLElement;
  color: string;
  onChange: (strokes: Stroke[]) => void;
};

export class DrawingCanvas {
  readonly store = new StrokeStore();
  private readonly ctx: CanvasRenderingContext2D;
  private readonly inkBudget = new InkBudget(2200);
  private currentStroke: Stroke = [];
  private isDrawing = false;

  constructor(private readonly options: DrawingCanvasOptions) {
    const ctx = options.canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context is unavailable');
    this.ctx = ctx;
    this.setupCanvas();
    this.bindEvents();
  }

  clear(): void {
    this.store.clear();
    this.inkBudget.reset();
    this.currentStroke = [];
    this.isDrawing = false;
    this.setupCanvas();
    this.updateInk();
    this.options.onChange(this.store.all);
  }

  private setupCanvas(): void {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.options.canvas.width, this.options.canvas.height);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = this.options.color;
  }

  private bindEvents(): void {
    const canvas = this.options.canvas;
    const passiveOptions = { passive: false };

    canvas.addEventListener('pointerdown', (event) => this.startDraw(event));
    canvas.addEventListener('pointermove', (event) => this.draw(event));
    canvas.addEventListener('pointerup', () => this.endDraw());
    canvas.addEventListener('pointercancel', () => this.endDraw());
    canvas.addEventListener('touchstart', (event) => event.preventDefault(), passiveOptions);
    canvas.addEventListener('touchmove', (event) => event.preventDefault(), passiveOptions);
  }

  private startDraw(event: PointerEvent): void {
    if (!this.inkBudget.canDraw()) return;
    this.options.canvas.setPointerCapture(event.pointerId);
    this.isDrawing = true;
    const point = this.toCanvasPoint(event);
    this.currentStroke = [point];
    this.ctx.beginPath();
    this.ctx.moveTo(point.x, point.y);
  }

  private draw(event: PointerEvent): void {
    if (!this.isDrawing || !this.inkBudget.canDraw()) return;

    const point = this.toCanvasPoint(event);
    const previous = this.currentStroke[this.currentStroke.length - 1];
    const length = Math.hypot(point.x - previous.x, point.y - previous.y);
    if (length < 2) return;

    if (!this.inkBudget.useSegment(previous, point)) {
      this.endDraw();
      return;
    }

    this.currentStroke.push(point);
    this.ctx.lineTo(point.x, point.y);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(point.x, point.y);
    this.updateInk();
  }

  private endDraw(): void {
    if (!this.isDrawing) return;
    this.isDrawing = false;

    if (this.currentStroke.length > 1) {
      this.store.add([...this.currentStroke]);
      this.store.saveDraft();
      this.options.onChange(this.store.all);
    }

    this.currentStroke = [];
  }

  private toCanvasPoint(event: PointerEvent): Point {
    const rect = this.options.canvas.getBoundingClientRect();
    const scaleX = this.options.canvas.width / rect.width;
    const scaleY = this.options.canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  private updateInk(): void {
    this.options.inkEl.style.width = `${this.inkBudget.ratio * 100}%`;
  }
}
