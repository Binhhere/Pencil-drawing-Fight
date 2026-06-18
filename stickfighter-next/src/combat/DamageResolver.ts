import type { FighterStats } from '../types/combat';

export class DamageResolver {
  static resolve(attacker: FighterStats, defender: FighterStats, impactSpeed: number): number {
    const raw = attacker.dmg * impactSpeed * 0.35;
    const reduction = defender.arm + defender.def * 0.5;
    const weaponBonus = attacker.weaponType === 'sword' ? 1.12 : 1;
    return Math.max(1, Math.round((raw - reduction) * weaponBonus));
  }
}
