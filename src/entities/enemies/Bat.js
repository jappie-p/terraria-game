// Bat - Flying enemy that swoops at the player
import { Enemy } from '../Enemy.js';

export class Bat extends Enemy {
  constructor(x, y) {
    super(x, y, 12, 10);

    // Bat properties
    this.health = 20;
    this.maxHealth = 20;
    this.damage = 8;
    this.color = '#4A0080'; // Dark purple
    this.entityType = 'bat';
    this.name = 'Bat';

    // Flying properties
    this.isFlying = true;
    this.flySpeed = 120;
    this.swoopSpeed = 200;
    this.hoverHeight = 100; // Preferred height above ground
    this.detectionRange = 250;

    // State machine
    this.state = 'idle'; // idle, hover, swoop, retreat
    this.stateTimer = 0;
    this.targetPos = { x: x, y: y };
    this.swoopCooldown = 0;
    this.idleAngle = Math.random() * Math.PI * 2;
  }

  update(dt, world, entities) {
    // Find player
    const player = entities.find(e => e.isPlayer);
    if (!player) {
      this.idleMovement(dt);
      return;
    }

    const dx = player.pos.x - this.pos.x;
    const dy = player.pos.y - this.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Update cooldowns
    this.swoopCooldown = Math.max(0, this.swoopCooldown - dt);
    this.stateTimer += dt;

    // State machine
    switch (this.state) {
      case 'idle':
        if (distance < this.detectionRange) {
          this.state = 'hover';
          this.stateTimer = 0;
        } else {
          this.idleMovement(dt);
        }
        break;

      case 'hover':
        // Hover above player
        this.targetPos.x = player.pos.x + Math.sin(this.stateTimer * 3) * 50;
        this.targetPos.y = player.pos.y - this.hoverHeight;
        this.moveToward(this.targetPos, this.flySpeed, dt);

        // Swoop when ready
        if (this.swoopCooldown <= 0 && distance < 150) {
          this.state = 'swoop';
          this.stateTimer = 0;
          this.targetPos = { x: player.pos.x, y: player.pos.y };
        }

        // Lose interest
        if (distance > this.detectionRange * 1.5) {
          this.state = 'idle';
        }
        break;

      case 'swoop':
        // Dive at player
        this.moveToward(this.targetPos, this.swoopSpeed, dt);

        // End swoop after time or near target
        const swoopDist = Math.sqrt(
          Math.pow(this.pos.x - this.targetPos.x, 2) +
          Math.pow(this.pos.y - this.targetPos.y, 2)
        );
        if (this.stateTimer > 1 || swoopDist < 20) {
          this.state = 'retreat';
          this.stateTimer = 0;
          this.swoopCooldown = 2; // Wait before swooping again
        }
        break;

      case 'retreat':
        // Fly back up
        this.targetPos.y = player.pos.y - this.hoverHeight - 50;
        this.moveToward(this.targetPos, this.flySpeed, dt);

        if (this.stateTimer > 0.5) {
          this.state = 'hover';
          this.stateTimer = 0;
        }
        break;
    }

    // Apply contact damage
    this.updateContactDamage(dt);
  }

  idleMovement(dt) {
    // Gentle floating movement
    this.idleAngle += dt * 0.5;
    this.vel.x = Math.cos(this.idleAngle) * 30;
    this.vel.y = Math.sin(this.idleAngle * 2) * 20;
  }

  moveToward(target, speed, dt) {
    const dx = target.x - this.pos.x;
    const dy = target.y - this.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      this.vel.x = (dx / distance) * speed;
      this.vel.y = (dy / distance) * speed;
    }

    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
  }

  // Override to disable gravity
  applyGravity(dt, gravity) {
    // Bats fly, no gravity
  }
}
