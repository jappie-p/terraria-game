// WanderBehavior - AI that wanders randomly
import { AIComponent } from '../AIComponent.js';

export class WanderBehavior extends AIComponent {
  constructor(entity, wanderSpeed = 30) {
    super(entity);
    this.wanderSpeed = wanderSpeed;
    this.wanderDirection = Math.random() > 0.5 ? 1 : -1;
    this.wanderTime = 0;
    this.wanderDuration = 2 + Math.random() * 3; // 2-5 seconds
  }

  update(dt, world, entities) {
    super.update(dt, world, entities);

    this.wanderTime += dt;

    // Change direction periodically
    if (this.wanderTime >= this.wanderDuration) {
      this.wanderDirection = Math.random() > 0.3 ? -this.wanderDirection : 0; // Sometimes stop
      this.wanderDuration = 1 + Math.random() * 4;
      this.wanderTime = 0;
    }

    // Apply wandering movement
    if (this.wanderDirection !== 0) {
      this.entity.vel.x = this.wanderDirection * this.wanderSpeed;
      this.entity.facing = this.wanderDirection;
    } else {
      this.entity.vel.x *= 0.8; // Slow down when not moving
    }
  }
}
