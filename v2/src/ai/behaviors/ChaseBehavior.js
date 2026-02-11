// ChaseBehavior - AI that chases the player
import { AIComponent } from '../AIComponent.js';

export class ChaseBehavior extends AIComponent {
  constructor(entity, chaseSpeed = 80, detectionRange = 200) {
    super(entity);
    this.chaseSpeed = chaseSpeed;
    this.detectionRange = detectionRange;
    this.loseTargetRange = detectionRange * 1.5;
  }

  update(dt, world, entities) {
    super.update(dt, world, entities);

    // Find nearest player
    const player = this.findNearestPlayer(entities);

    if (!player) {
      this.target = null;
      this.setState('IDLE');
      return;
    }

    const distance = this.entity.pos.dist(player.pos);

    // Check if player is in range
    if (this.state === 'IDLE' && distance <= this.detectionRange) {
      this.target = player;
      this.setState('CHASE');
    }

    // Lose target if too far
    if (this.state === 'CHASE' && distance > this.loseTargetRange) {
      this.target = null;
      this.setState('IDLE');
    }

    // Chase the target
    if (this.state === 'CHASE' && this.target) {
      // Only apply movement if not stuck against a wall
      const dx = this.target.pos.x - this.entity.pos.x;
      const moveDirection = dx > 0 ? 1 : -1;

      // Check if we're stuck (velocity is being stopped by collision)
      const isStuck = Math.abs(this.entity.vel.x) < 10 && this.entity.onGround;

      if (isStuck) {
        // Try jumping if stuck
        if (this.entity.onGround) {
          this.entity.vel.y = -300; // Jump
        }
      } else {
        // Normal movement
        this.entity.vel.x = moveDirection * this.chaseSpeed;
        this.entity.facing = moveDirection;
      }

      // Attack if close enough
      if (distance < 30) {
        this.setState('ATTACK');
      }
    }

    // Attack state
    if (this.state === 'ATTACK') {
      this.entity.vel.x *= 0.5; // Slow down during attack

      // Go back to chase after attack
      if (this.stateTimer > 0.5) {
        this.setState('CHASE');
      }
    }

    // Idle - do nothing
    if (this.state === 'IDLE') {
      this.entity.vel.x *= 0.85; // Slow down with friction
    }
  }
}
