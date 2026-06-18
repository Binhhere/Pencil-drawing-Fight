export type WeaponType = 'sword' | 'shield' | 'bow' | 'balanced';

export type FillModifier = {
  label: string;
  fillRatio: number;
  speedMultiplier: number;
  damageMultiplier: number;
  defenseMultiplier: number;
};

export type FighterStats = {
  hp: number;
  dmg: number;
  arm: number;
  def: number;
  reach: number;
  speed: number;
  weight: number;
  weaponType: WeaponType;
  modifier: FillModifier;
};
