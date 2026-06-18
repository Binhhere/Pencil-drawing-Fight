/**
 * InkMeter — tracks how much ink a player has used.
 * Each player gets the same MAX_INK budget (total stroke length in pixels).
 * This creates a natural trade-off: big shapes have less detail, detailed
 * shapes are smaller.
 */
export class InkMeter {
  constructor(maxInk = 2000) {
    this.maxInk = maxInk;
    this.remaining = maxInk;
  }

  /** Consume `amount` pixels of ink. Returns true if ink was consumed. */
  use(amount) {
    if (this.remaining <= 0) return false;
    this.remaining = Math.max(0, this.remaining - amount);
    return true;
  }

  /** 0.0 (empty) → 1.0 (full) */
  getRatio() {
    return this.remaining / this.maxInk;
  }

  isEmpty() {
    return this.remaining <= 0;
  }

  reset() {
    this.remaining = this.maxInk;
  }
}
