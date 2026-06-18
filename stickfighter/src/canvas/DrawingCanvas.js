import { InkMeter } from './InkMeter.js';

/**
 * DrawingCanvas — wraps a <canvas> element for freehand drawing.
 * Supports mouse + touch. Enforces ink budget via InkMeter.
 * Stores strokes separately for clean re-rendering during combat.
 */
export class DrawingCanvas {
  /**
   * @param {HTMLCanvasElement} canvasEl
   * @param {HTMLElement}       inkBarEl    — the .ink-fill div to update
   * @param {string}            color       — stroke colour
   * @param {function}          onUpdate    — called with (stats|null) after each stroke
   */
  constructor(canvasEl, inkBarEl, color = '#1a1a1a', onUpdate = null) {
    this.canvas   = canvasEl;
    this.ctx      = canvasEl.getContext('2d');
    this.inkBarEl = inkBarEl;
    this.color    = color;
    this.onUpdate = onUpdate;

    this.inkMeter     = new InkMeter(2200);
    this.strokes      = [];          // [ [{x,y}, ...], ... ]
    this.currentStroke = [];
    this.isDrawing    = false;
    this.hasContent   = false;

    this._initCanvas();
    this._bindEvents();
  }

  /* ─── setup ─────────────────────────────────────────── */

  _initCanvas() {
    const ctx = this.ctx;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.lineCap   = 'round';
    ctx.lineJoin  = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = this.color;
  }

  _getPos(e) {
    const rect   = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width  / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const src    = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top)  * scaleY,
    };
  }

  _bindEvents() {
    const c = this.canvas;
    const opts = { passive: false };

    c.addEventListener('mousedown',   e => this._startDraw(e));
    c.addEventListener('mousemove',   e => this._draw(e));
    c.addEventListener('mouseup',     e => this._endDraw(e));
    c.addEventListener('mouseleave',  e => this._endDraw(e));
    c.addEventListener('touchstart',  e => { e.preventDefault(); this._startDraw(e); }, opts);
    c.addEventListener('touchmove',   e => { e.preventDefault(); this._draw(e); },     opts);
    c.addEventListener('touchend',    e => { e.preventDefault(); this._endDraw(e); },  opts);
  }

  /* ─── drawing events ─────────────────────────────────── */

  _startDraw(e) {
    if (this.inkMeter.isEmpty()) return;
    this.isDrawing = true;
    const pos = this._getPos(e);
    this.currentStroke = [pos];
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
  }

  _draw(e) {
    if (!this.isDrawing || this.inkMeter.isEmpty()) return;
    const pos  = this._getPos(e);
    const prev = this.currentStroke[this.currentStroke.length - 1];
    const dx   = pos.x - prev.x;
    const dy   = pos.y - prev.y;
    const len  = Math.sqrt(dx * dx + dy * dy);

    if (len < 2) return;                    // skip micro-movements

    if (!this.inkMeter.use(len)) {
      this._endDraw(e);
      return;
    }

    this.currentStroke.push(pos);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);

    this._updateInkBar();
  }

  _endDraw(e) {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    if (this.currentStroke.length > 1) {
      this.strokes.push([...this.currentStroke]);
      this.hasContent = true;
      if (this.onUpdate) this.onUpdate();
    }
    this.currentStroke = [];
  }

  _updateInkBar() {
    if (this.inkBarEl) {
      this.inkBarEl.style.width = (this.inkMeter.getRatio() * 100) + '%';
    }
  }

  /* ─── public API ─────────────────────────────────────── */

  /** Flat array of all drawn points (for analysis). */
  get allPoints() {
    return this.strokes.flat();
  }

  clear() {
    this.strokes        = [];
    this.currentStroke  = [];
    this.hasContent     = false;
    this.inkMeter.reset();
    this._updateInkBar();
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.onUpdate) this.onUpdate();
  }

  /**
   * Returns an offscreen canvas with the drawing centred, transparent background.
   * `scale` re-sizes so the shape fits within ~targetPx pixels on longest axis.
   */
  buildRenderCanvas(targetPx = 160) {
    const pts = this.allPoints;
    if (pts.length < 2) return null;

    const minX = Math.min(...pts.map(p => p.x));
    const maxX = Math.max(...pts.map(p => p.x));
    const minY = Math.min(...pts.map(p => p.y));
    const maxY = Math.max(...pts.map(p => p.y));
    const w = maxX - minX || 10;
    const h = maxY - minY || 10;

    const longest = Math.max(w, h);
    const scale   = targetPx / longest;
    const pad     = 12;
    const cw      = Math.ceil(w * scale) + pad * 2;
    const ch      = Math.ceil(h * scale) + pad * 2;

    const oc  = document.createElement('canvas');
    oc.width  = cw;
    oc.height = ch;
    const oct = oc.getContext('2d');

    oct.lineCap    = 'round';
    oct.lineJoin   = 'round';
    oct.lineWidth  = 3;
    oct.strokeStyle = this.color;

    const tx = (p) => (p.x - minX) * scale + pad;
    const ty = (p) => (p.y - minY) * scale + pad;

    for (const stroke of this.strokes) {
      if (stroke.length < 2) continue;
      oct.beginPath();
      oct.moveTo(tx(stroke[0]), ty(stroke[0]));
      for (let i = 1; i < stroke.length; i++) {
        oct.lineTo(tx(stroke[i]), ty(stroke[i]));
      }
      oct.stroke();
    }

    // Metadata used by FighterBody for physics body creation
    oc._scale = scale;
    oc._pad   = pad;
    oc._minX  = minX;
    oc._minY  = minY;
    oc._w     = w;
    oc._h     = h;

    return oc;
  }

  /**
   * Returns simplified vertices centred at origin, already scaled by targetPx.
   * Used by FighterBody to build the Matter.js body.
   */
  getScaledVertices(targetPx = 160) {
    const pts = this.allPoints;
    if (pts.length < 3) return null;

    const minX = Math.min(...pts.map(p => p.x));
    const maxX = Math.max(...pts.map(p => p.x));
    const minY = Math.min(...pts.map(p => p.y));
    const maxY = Math.max(...pts.map(p => p.y));
    const w    = maxX - minX || 10;
    const h    = maxY - minY || 10;
    const sc   = targetPx / Math.max(w, h);

    // Centre at origin
    return pts.map(p => ({
      x: (p.x - minX - w / 2) * sc,
      y: (p.y - minY - h / 2) * sc,
    }));
  }
}
