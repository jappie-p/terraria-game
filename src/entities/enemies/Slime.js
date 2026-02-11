// Slime - Basic bouncing enemy
import { Enemy } from '../Enemy.js';
import { ChaseBehavior } from '../../ai/behaviors/ChaseBehavior.js';

export class Slime extends Enemy {
  constructor(x, y) {
    super(x, y, 16, 16);

    // Slime properties
    this.health = 30;
    this.maxHealth = 30;
    this.damage = 5;
    this.color = '#00FF00'; // Green
    this.entityType = 'slime';

    // Slime AI - chases player slowly
    this.setAI(new ChaseBehavior(this, 60, 150));

    // Slime bounces
    this.bounceTimer = 0;
    this.bounceInterval = 1.5 + Math.random();
  }

  update(dt, world, entities) {
    super.update(dt, world, entities);

    // Bounce behavior - only when on ground
    this.bounceTimer += dt;
    if (this.bounceTimer >= this.bounceInterval && this.onGround) {
      this.vel.y = -250; // Bounce
      this.bounceTimer = 0;
      this.bounceInterval = 1.0 + Math.random() * 1.5;
    }

    // Limit horizontal velocity to prevent wall clipping
    const maxSpeed = 80;
    if (Math.abs(this.vel.x) > maxSpeed) {
      this.vel.x = Math.sign(this.vel.x) * maxSpeed;
    }
  }
}
