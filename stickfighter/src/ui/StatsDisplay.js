/**
 * StatsDisplay — renders the four combat-stat chips below each drawing canvas.
 */
export class StatsDisplay {
  constructor(containerEl) {
    this.el = containerEl;
  }

  render(stats) {
    if (!stats) {
      this.el.innerHTML = '<span style="color:#475569;font-size:0.75rem">Vẽ gì đó để xem chỉ số…</span>';
      return;
    }

    this.el.innerHTML = `
      <div class="stat-item stat-hp">
        <span class="stat-label">❤️ HP</span>
        <span class="stat-value">${stats.hp}</span>
      </div>
      <div class="stat-item stat-dmg">
        <span class="stat-label">⚔️ DMG</span>
        <span class="stat-value">${stats.dmg}</span>
      </div>
      <div class="stat-item stat-arm">
        <span class="stat-label">🛡 ARM</span>
        <span class="stat-value">${stats.arm}</span>
      </div>
      <div class="stat-item stat-def">
        <span class="stat-label">🌀 DEF</span>
        <span class="stat-value">${stats.def}</span>
      </div>
    `;
  }

  clear() {
    this.el.innerHTML = '';
  }
}
