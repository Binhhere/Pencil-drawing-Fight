/**
 * StatsCalculator — applies the GDD formulas to convert geometric shape data
 * into the 4 combat stats: HP, DMG, ARM, DEF.
 *
 * Tuning constants (k1–k5) are calibrated so a "normal" drawing produces
 * balanced stats, while extreme shapes feel appropriately rewarded.
 */
export class StatsCalculator {
  static calculate(shapeData) {
    const { area, roundness, angles } = shapeData;

    // Bucket angles by type
    const sharp   = angles.filter(a => a.type === 'sharp');
    const right   = angles.filter(a => a.type === 'right');
    const obtuse  = angles.filter(a => a.type === 'obtuse');

    // Normalise area (drawing canvas ≈ 300×260 = 78 000 px²; typical fill 10–60%)
    const normArea = Math.min(1, area / 12000);

    /* ── HP: diện tích * k1 + góc vuông * k2 ── */
    const hp = normArea * 90 + right.length * 5 + 20;

    /* ── DMG: trung bình(180° - góc nhọn) * k3 ── */
    let dmg = 8;
    if (sharp.length > 0) {
      const avgSharpness = sharp.reduce((s, a) => s + (45 - a.angle), 0) / sharp.length;
      dmg = sharp.length * 4 + avgSharpness * 0.6 + 5;
    }

    /* ── ARM: góc vuông * k4 * diện tích ── */
    const arm = right.length * 2.5 + normArea * 12;

    /* ── DEF: độ tròn * k5 ── */
    const def = roundness * 28;

    return {
      hp:  Math.round(Math.max(20,  Math.min(150, hp))),
      dmg: Math.round(Math.max(5,   Math.min(65,  dmg))),
      arm: Math.round(Math.max(0,   Math.min(28,  arm))),
      def: Math.round(Math.max(0,   Math.min(28,  def))),
    };
  }
}
