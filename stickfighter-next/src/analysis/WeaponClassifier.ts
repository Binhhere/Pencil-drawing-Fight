import type { FighterStats, WeaponType } from '../types/combat';
import type { ShapeMetrics } from '../types/geometry';

export class WeaponClassifier {
  static classify(metrics: ShapeMetrics, partialStats: Omit<FighterStats, 'weaponType'>): WeaponType {
    const sharpCount = metrics.angles.filter((angle) => angle.type === 'sharp').length;
    const compactShield = partialStats.arm >= 16 && partialStats.def >= 16 && partialStats.weight >= 55;
    const longSharp = sharpCount >= 2 && partialStats.reach >= 55 && partialStats.weight < 70;
    const lightSharp = sharpCount >= 1 && partialStats.speed >= 60 && partialStats.weight < 45;

    if (compactShield) return 'shield';
    if (lightSharp) return 'bow';
    if (longSharp) return 'sword';
    return 'balanced';
  }
}
