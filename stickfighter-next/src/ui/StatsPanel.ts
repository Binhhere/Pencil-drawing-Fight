import type { FighterStats } from '../types/combat';

const WEAPON_LABELS = {
  sword: 'Kiem',
  shield: 'Khien',
  bow: 'Cung',
  balanced: 'Can bang',
};

export class StatsPanel {
  constructor(private readonly element: HTMLElement) {}

  render(stats: FighterStats | null): void {
    if (!stats) {
      this.element.innerHTML = '<span class="empty">Ve mot hinh de xem chi so.</span>';
      return;
    }

    this.element.innerHTML = `
      <div class="weapon">Weapon: ${WEAPON_LABELS[stats.weaponType]}</div>
      ${this.row('HP', stats.hp)}
      ${this.row('DMG', stats.dmg)}
      ${this.row('ARM', stats.arm)}
      ${this.row('DEF', stats.def)}
      ${this.row('REACH', stats.reach)}
      ${this.row('SPEED', stats.speed)}
      ${this.row('WEIGHT', stats.weight)}
      <div class="modifier">${stats.modifier.label}: ${(stats.modifier.fillRatio * 100).toFixed(0)}%</div>
    `;
  }

  private row(label: string, value: number): string {
    return `<div class="stat-row"><span>${label}</span><strong>${value}</strong></div>`;
  }
}
