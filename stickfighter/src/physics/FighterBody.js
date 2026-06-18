const { Bodies, Body, Vertices, World } = Matter;

/**
 * FighterBody — converts a player's drawing into a Matter.js rigid body
 * and renders it on the arena canvas each frame, transformed by physics state.
 */
export class FighterBody {
  /**
   * @param {Array<{x,y}>} rawPoints   — all drawn points (flat)
   * @param {Array}        strokes     — raw strokes (for re-rendering)
   * @param {number}       startX/Y   — spawn position in arena
   * @param {object}       stats      — { hp, dmg, arm, def }
   * @param {string}       color      — stroke colour for rendering
   */
  constructor({ rawPoints, strokes, startX, startY, stats, color }) {
    this.rawPoints = rawPoints;
    this.strokes   = strokes;
    this.startX    = startX;
    this.startY    = startY;
    this.stats     = stats;
    this.color     = color;

    this.body       = null;
    this.hp         = stats.hp;
    this.maxHp      = stats.hp;

    this._scale     = 1;
    this._offX      = 0;   // offset from body centre to drawn-shape centre (post-decomp)
    this._offY      = 0;
    this._localVerts = null;
    this._renderCanvas = null;  // offscreen canvas with the drawing

    this.flashTimer = 0;  // frames to flash red after hit
  }

  /* ─── body creation ──────────────────────────────────── */

  create(world) {
    const body = this._buildBody();
    this.body  = body;
    body._fighter = this;           // back-reference for collision handler
    World.add(world, body);
    this._buildRenderCanvas();
    return body;
  }

  _buildBody() {
    const pts = this.rawPoints;

    // Fallback: not enough points → regular polygon
    if (!pts || pts.length < 6) {
      return Bodies.polygon(this.startX, this.startY, 5, 65, {
        friction: 0.5, restitution: 0.4, density: 0.003,
        label: 'fighter', frictionAir: 0.015,
      });
    }

    // Compute bounding box → scale to target size
    const minX = Math.min(...pts.map(p => p.x));
    const maxX = Math.max(...pts.map(p => p.x));
    const minY = Math.min(...pts.map(p => p.y));
    const maxY = Math.max(...pts.map(p => p.y));
    const w = maxX - minX || 10;
    const h = maxY - minY || 10;

    const TARGET = 155;
    this._scale = TARGET / Math.max(w, h);

    // Centre at origin + scale
    const verts = pts.map(p => ({
      x: (p.x - minX - w / 2) * this._scale,
      y: (p.y - minY - h / 2) * this._scale,
    }));
    this._localVerts = verts;

    const opts = {
      friction: 0.5, restitution: 0.4, density: 0.003,
      label: 'fighter', frictionAir: 0.015,
    };

    try {
      if (window.decomp) Matter.Common.setDecomp(window.decomp);
      const body = Bodies.fromVertices(this.startX, this.startY, verts, opts, false);
      if (body) {
        // Matter shifts the body so its centroid is at (startX, startY);
        // record any internal offset it introduced.
        this._offX = body.position.x - this.startX;
        this._offY = body.position.y - this.startY;
        Body.setPosition(body, { x: this.startX, y: this.startY });
        return body;
      }
    } catch (e) {
      console.warn('[FighterBody] fromVertices failed, trying convex hull', e);
    }

    // Fallback 1: convex hull
    try {
      const hull = Vertices.hull(verts);
      const body = Bodies.fromVertices(this.startX, this.startY, hull, opts, false);
      if (body) {
        Body.setPosition(body, { x: this.startX, y: this.startY });
        return body;
      }
    } catch (e) {
      console.warn('[FighterBody] hull also failed', e);
    }

    // Fallback 2: circle
    return Bodies.circle(this.startX, this.startY, 65, opts);
  }

  /* ─── render canvas (offscreen, transparent) ─────────── */

  _buildRenderCanvas() {
    const pts = this.rawPoints;
    if (!pts || pts.length < 2) return;

    const minX = Math.min(...pts.map(p => p.x));
    const maxX = Math.max(...pts.map(p => p.x));
    const minY = Math.min(...pts.map(p => p.y));
    const maxY = Math.max(...pts.map(p => p.y));
    const w = maxX - minX || 10;
    const h = maxY - minY || 10;
    const s = this._scale;
    const PAD = 10;

    const oc  = document.createElement('canvas');
    oc.width  = Math.ceil(w * s) + PAD * 2;
    oc.height = Math.ceil(h * s) + PAD * 2;
    const oct = oc.getContext('2d');

    oct.lineCap    = 'round';
    oct.lineJoin   = 'round';
    oct.lineWidth  = Math.max(2.5, 3 * s);
    oct.strokeStyle = this.color;

    const tx = p => (p.x - minX) * s + PAD;
    const ty = p => (p.y - minY) * s + PAD;

    for (const stroke of this.strokes) {
      if (stroke.length < 2) continue;
      oct.beginPath();
      oct.moveTo(tx(stroke[0]), ty(stroke[0]));
      for (let i = 1; i < stroke.length; i++) oct.lineTo(tx(stroke[i]), ty(stroke[i]));
      oct.stroke();
    }

    this._renderCanvas = oc;
    // Centre offset: where (0,0) is relative to the canvas top-left
    this._rcCX = Math.ceil(w * s) / 2 + PAD;
    this._rcCY = Math.ceil(h * s) / 2 + PAD;
  }

  /* ─── per-frame rendering ────────────────────────────── */

  draw(ctx) {
    if (!this.body || !this._renderCanvas) return;
    const { x, y } = this.body.position;
    const angle    = this.body.angle;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    if (this.flashTimer > 0) {
      ctx.globalAlpha = 0.55;
      ctx.filter = 'saturate(4) hue-rotate(330deg)';
      this.flashTimer--;
    }

    ctx.drawImage(
      this._renderCanvas,
      -this._rcCX,
      -this._rcCY,
    );

    ctx.restore();
  }

  /* ─── combat ─────────────────────────────────────────── */

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    this.flashTimer = 6;
  }

  isDead() { return this.hp <= 0; }

  /** Give both fighters a nudge toward each other so they actually collide. */
  launchToward(targetX) {
    const dir = targetX > this.body.position.x ? 1 : -1;
    Body.setVelocity(this.body, { x: dir * 3, y: -1 });
  }
}
