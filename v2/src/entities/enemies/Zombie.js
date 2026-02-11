// Zombie - Walking enemy
import { Enemy } from '../Enemy.js';
import { ChaseBehavior } from '../../ai/behaviors/ChaseBehavior.js';

export class Zombie extends Enemy {
  constructor(x, y) {
    super(x, y, 14, 28);

    // Zombie properties
    this.health = 50;
    this.maxHealth = 50;
    this.damage = 10;
    this.color = '#8B4513'; // Brown
    this.entityType = 'zombie';

    // Zombie AI - chases player at medium speed
    this.setAI(new ChaseBehavior(this, 70, 200));
  }

  update(dt, world, entities) {
    super.update(dt, world, entities);

    // Limit horizontal velocity to prevent wall clipping
    const maxSpeed = 90;
    if (Math.abs(this.vel.x) > maxSpeed) {
      this.vel.x = Math.sign(this.vel.x) * maxSpeed;
    }
  }
}
