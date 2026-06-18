const { Events } = Matter;

/**
 * CombatManager — listens for Matter.js collision events and applies
 * damage to fighters based on impact speed and combat stats.
 *
 * Damage formula (per GDD):
 *   raw   = attacker.DMG × impact_speed × scale
 *   final = max(1, raw − defender.ARM − defender.DEF × 0.5)
 *
 * A cooldown prevents the same pair from trading damage every frame.
 */
export class CombatManager {
  /**
   * @param {Matter.Engine} engine
   * @param {FighterBody}   f1
   * @param {FighterBody}   f2
   * @param {function}      onDamage  — called with (fighter, amount) after each hit
   * @param {function}      onEnd     — called with (winner) when a fighter dies
   */
  constructor(engine, f1, f2, onDamage, onEnd) {
    this.engine   = engine;
    this.f1       = f1;
    this.f2       = f2;
    this.onDamage = onDamage;
    this.onEnd    = onEnd;
    this.active   = true;

    this._cooldown   = 0;          // frames until next damage window
    this._COOLDOWN_MS = 400;       // ms between damage ticks
    this._lastHit     = 0;

    this._nudgeTimer  = 0;         // frames until next aggro nudge

    this._listener = this._onCollision.bind(this);
    Events.on(engine, 'collisionStart', this._listener);
    Events.on(engine, 'collisionActive', this._listener);
  }

  _onCollision(event) {
    if (!this.active) return;

    const now = performance.now();
    if (now - this._lastHit < this._COOLDOWN_MS) return;

    for (const pair of event.pairs) {
      const a = pair.bodyA._fighter;
      const b = pair.bodyB._fighter;
      if (!a || !b || a === b) continue;
      if ((a !== this.f1 && a !== this.f2) || (b !== this.f1 && b !== this.f2)) continue;

      // Relative speed
      const dvx  = pair.bodyA.velocity.x - pair.bodyB.velocity.x;
      const dvy  = pair.bodyA.velocity.y - pair.bodyB.velocity.y;
      const speed = Math.hypot(dvx, dvy);
      if (speed < 0.8) continue;                // ignore gentle touches

      this._applyDamage(a, b, speed);
      this._applyDamage(b, a, speed);
      this._lastHit = now;
      break;
    }
  }

  _applyDamage(attacker, defender, speed) {
    const raw    = (attacker.stats.dmg * speed * 0.35);
    const reduce = defender.stats.arm + defender.stats.def * 0.5;
    const dmg    = Math.max(1, Math.round(raw - reduce));

    defender.takeDamage(dmg);
    if (this.onDamage) this.onDamage(defender, dmg);

    if (defender.isDead() && this.active) {
      this.active = false;
      const winner = defender === this.f1 ? this.f2 : this.f1;
      setTimeout(() => this.onEnd && this.onEnd(winner), 500);
    }
  }

  /**
   * Call each frame. Nudges fighters toward each other if they drift apart
   * so fights don't stall when one fighter gets stuck against a wall.
   */
  tick() {
    if (!this.active) return;
    this._nudgeTimer++;

    if (this._nudgeTimer % 90 === 0) {   // every ~1.5 s
      const b1 = this.f1.body, b2 = this.f2.body;
      const dx = b2.position.x - b1.position.x;
      const dist = Math.abs(dx);
      if (dist > 280) {
        const dir = Math.sign(dx);
        Matter.Body.applyForce(b1, b1.position, { x:  dir * 0.003, y: 0 });
        Matter.Body.applyForce(b2, b2.position, { x: -dir * 0.003, y: 0 });
      }
    }
  }

  destroy() {
    this.active = false;
    Events.off(this.engine, 'collisionStart', this._listener);
    Events.off(this.engine, 'collisionActive', this._listener);
  }
}
