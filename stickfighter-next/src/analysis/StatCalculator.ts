import { WeaponClassifier } from './WeaponClassifier';
import type { FighterStats, FillModifier } from '../types/combat';
import type { ShapeMetrics, Stroke } from '../types/geometry';

export class StatCalculator {
  static calculate(metrics: ShapeMetrics, strokes: Stroke[]): FighterStats {
    const sharp = metrics.angles.filter((angle) => angle.type === 'sharp');
    const right = metrics.angles.filter((angle) => angle.type === 'right');
    const normArea = Math.min(1, metrics.area / 12000);
    const fillModifier = this.calculateFillModifier(metrics, strokes);

    const hp = normArea * 90 + right.length * 5 + 20;
    const avgSharpness = sharp.length > 0
      ? sharp.reduce((sum, angle) => sum + (45 - angle.angle), 0) / sharp.length
      : 0;
    const dmg = (sharp.length > 0 ? sharp.length * 4 + avgSharpness * 0.6 + 5 : 8) * fillModifier.damageMultiplier;
    const arm = right.length * 2.5 + normArea * 12;
    const def = metrics.roundness * 28 * fillModifier.defenseMultiplier;
    const reach = Math.min(100, metrics.reach / 1.6);
    const speed = Math.min(100, (90000000 / metrics.momentOfInertia) * fillModifier.speedMultiplier);
    const weight = Math.min(100, normArea * 85 + metrics.vertices.length * 1.5);

    const withoutWeapon = {
      hp: this.clampRound(hp, 20, 150),
      dmg: this.clampRound(dmg, 5, 65),
      arm: this.clampRound(arm, 0, 28),
      def: this.clampRound(def, 0, 28),
      reach: this.clampRound(reach, 5, 100),
      speed: this.clampRound(speed, 5, 100),
      weight: this.clampRound(weight, 5, 100),
      modifier: fillModifier,
    };

    return {
      ...withoutWeapon,
      weaponType: WeaponClassifier.classify(metrics, withoutWeapon),
    };
  }

  private static calculateFillModifier(metrics: ShapeMetrics, strokes: Stroke[]): FillModifier {
    const strokeLength = strokes.reduce((sum, stroke) => {
      return sum + stroke.slice(1).reduce((strokeSum, point, index) => {
        const prev = stroke[index];
        return strokeSum + Math.hypot(point.x - prev.x, point.y - prev.y);
      }, 0);
    }, 0);

    const estimatedInkArea = strokeLength * 3;
    const fillRatio = Math.min(1, estimatedInkArea / Math.max(metrics.area, 1));

    if (fillRatio <= 0.3) {
      return {
        label: 'light-detail',
        fillRatio,
        speedMultiplier: 1.12,
        damageMultiplier: 1,
        defenseMultiplier: 1,
      };
    }

    return {
      label: 'dense-detail',
      fillRatio,
      speedMultiplier: 1,
      damageMultiplier: 1.08,
      defenseMultiplier: 1.08,
    };
  }

  private static clampRound(value: number, min: number, max: number): number {
    return Math.round(Math.max(min, Math.min(max, value)));
  }
}
