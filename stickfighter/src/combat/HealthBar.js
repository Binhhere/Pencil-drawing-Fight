/**
 * HealthBar — thin wrapper that syncs a FighterBody's HP
 * to the DOM health bar elements each frame.
 */
export class HealthBar {
  /**
   * @param {HTMLElement} fillEl   — the coloured .hb-fill bar
   * @param {HTMLElement} valEl    — the numeric display
   * @param {number}      maxHp
   */
  constructor(fillEl, valEl, maxHp) {
    this.fillEl = fillEl;
    this.valEl  = valEl;
    this.maxHp  = maxHp;
    this._prev  = -1;
  }

  update(hp) {
    if (hp === this._prev) return;
    this._prev = hp;
    const pct = Math.max(0, hp / this.maxHp * 100);
    this.fillEl.style.width = pct + '%';

    // Colour shift: green → yellow → red as HP drops
    if (pct > 55)      this.fillEl.style.filter = '';
    else if (pct > 25) this.fillEl.style.filter = 'hue-rotate(340deg) saturate(1.4)';
    else               this.fillEl.style.filter = 'hue-rotate(300deg) saturate(2)';

    this.valEl.textContent = Math.max(0, Math.round(hp));
  }
}
