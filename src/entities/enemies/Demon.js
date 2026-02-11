// Demon - Strong melee enemy that charges at players
import { Enemy } from '../Enemy.js';
import { ChaseBehavior } from '../../ai/behaviors/ChaseBehavior.js';

export class Demon extends Enemy {
  constructor(x, y) {
    super(x, y, 18, 32);

    // Demon properties - stronger than regular enemies
    this.health = 100;
    this.maxHealth = 100;
    this.damage = 20;
    this.color = '#8B0000'; // Dark red
    this.entityType = 'demon';
    this.name = 'Demon';

    // Movement
    this.normalSpeed = 60;
    this.chargeSpeed = 250;
    this.jumpForce = 350;

    // Combat state
    this.state = 'patrol'; // patrol, chase, charge, cooldown
    this.stateTimer = 0;
    this.chargeCooldown = 0;
    this.chargeDirection = 1;
    this.detectionRange = 200;
    this.chargeRange = 120;

    // Demon AI - aggressive chasing
    this.setAI(new ChaseBehavior(this, this.normalSpeed, this.detectionRange));
  }

  update(dt, world, entities) {
    // Find player
    const player = entities.find(e => e.isPlayer);

    if (player) {
      const dx = player.pos.x - this.pos.x;
      const dy = player.pos.y - this.pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Update timers
      this.stateTimer += dt;
      this.chargeCooldown = Math.max(0, this.chargeCooldown - dt);

      // State machine
      switch (this.state) {
        case 'patrol':
          // Use default AI until player is close
          super.update(dt, world, entities);
          if (distance < this.detectionRange) {
            this.state = 'chase';
            this.stateTimer = 0;
          }
          break;

        case 'chase':
          // Chase player
          super.update(dt, world, entities);

          // Start charge when close and ready
          if (distance < this.chargeRange && this.chargeCooldown <= 0 && this.onGround) {
            this.state = 'charge';
            this.stateTimer = 0;
            this.chargeDirection = Math.sign(dx) || 1;

            // Jump slightly when charging
            this.vel.y = -this.jumpForce * 0.3;
          }

          // Lose interest if player far away
          if (distance > this.detectionRange * 2) {
            this.state = 'patrol';
          }
          break;

        case 'charge':
          // Charge in a straight line
          this.vel.x = this.chargeDirection * this.chargeSpeed;

          // End charge after time or hitting wall
          if (this.stateTimer > 0.8 || this.hitWall) {
            this.state = 'cooldown';
            this.stateTimer = 0;
            this.chargeCooldown = 2;
            this.vel.x = 0;
          }

          // Still apply gravity and physics
          this.applyGravity(dt, 800);
          break;

        case 'cooldown':
          // Brief pause after charge
          this.vel.x *= 0.9; // Slow down

          if (this.stateTimer > 0.5) {
            this.state = 'chase';
            this.stateTimer = 0;
          }

          // Apply physics
          this.applyGravity(dt, 800);
          break;
      }
    } else {
      super.update(dt, world, entities);
    }

    // Update contact damage
    this.updateContactDamage(dt);

    // Track if we hit a wall (for charge ending)
    this.hitWall = false;
  }

  // Called by physics system when hitting a wall
  onWallCollision() {
    this.hitWall = true;
  }

  applyGravity(dt, gravity) {
    this.vel.y += gravity * dt;
    const terminalVelocity = 600;
    if (this.vel.y > terminalVelocity) {
      this.vel.y = terminalVelocity;
    }
  }
}
