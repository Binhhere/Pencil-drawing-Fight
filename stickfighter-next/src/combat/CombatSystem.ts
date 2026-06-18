import Matter from 'matter-js';
import { DamageResolver } from './DamageResolver';
import type { FighterBody } from '../physics/FighterBody';

export class CombatSystem {
  private lastHit = 0;
  private readonly cooldownMs = 400;

  constructor(
    private readonly engine: Matter.Engine,
    private readonly fighters: [FighterBody, FighterBody],
  ) {}

  start(): void {
    Matter.Events.on(this.engine, 'collisionStart', this.handleCollision);
  }

  stop(): void {
    Matter.Events.off(this.engine, 'collisionStart', this.handleCollision);
  }

  private readonly handleCollision = (event: Matter.IEventCollision<Matter.Engine>): void => {
    const now = performance.now();
    if (now - this.lastHit < this.cooldownMs) return;

    for (const pair of event.pairs) {
      const bodyA = this.fighters.find((fighter) => fighter.body === pair.bodyA);
      const bodyB = this.fighters.find((fighter) => fighter.body === pair.bodyB);
      if (!bodyA || !bodyB) continue;

      const speed = Math.hypot(pair.bodyA.velocity.x - pair.bodyB.velocity.x, pair.bodyA.velocity.y - pair.bodyB.velocity.y);
      if (speed < 0.8) continue;

      bodyB.takeDamage(DamageResolver.resolve(bodyA.stats, bodyB.stats, speed));
      bodyA.takeDamage(DamageResolver.resolve(bodyB.stats, bodyA.stats, speed));
      this.lastHit = now;
      return;
    }
  };
}
