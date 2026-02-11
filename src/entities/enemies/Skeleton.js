// Skeleton - Ranged enemy that shoots arrows
import { Enemy } from '../Enemy.js';
import { Projectile } from '../../combat/Projectile.js';

export class Skeleton extends Enemy {
  constructor(x, y) {
    super(x, y, 14, 28);

    // Skeleton properties
    this.health = 40;
    this.maxHealth = 40;
    this.damage = 5; // Contact damage
    this.arrowDamage = 12;
    this.color = '#D3D3D3'; // Light gray (bones)
    this.entityType = 'skeleton';
    this.name = 'Skeleton';

    // Ranged attack properties
    this.detectionRange = 300;
    this.attackRange = 250;
    this.preferredDistance = 150; // Tries to stay this far from player
    this.shootCooldown = 0;
    this.shootInterval = 2; // Seconds between shots
    this.arrowSpeed = 300;

    // Movement
    this.moveSpeed = 50;
    this.state = 'idle'; // idle, approach, attack, retreat
    this.facingDirection = 1;
  }

  update(dt, world, entities) {
    super.update(dt, world, entities);

    // Find player
    const player = entities.find(e => e.isPlayer);
    if (!player) return;

    const dx = player.pos.x - this.pos.x;
    const dy = player.pos.y - this.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Update facing direction
    this.facingDirection = dx > 0 ? 1 : -1;

    // Update cooldowns
    this.shootCooldown = Math.max(0, this.shootCooldown - dt);

    // AI behavior
    if (distance > this.detectionRange) {
      // Idle - don't see player
      this.vel.x = 0;
      return;
    }

    if (distance < this.preferredDistance * 0.7) {
      // Too close - retreat
      this.vel.x = -Math.sign(dx) * this.moveSpeed;
    } else if (distance > this.preferredDistance * 1.3) {
      // Too far - approach
      this.vel.x = Math.sign(dx) * this.moveSpeed;
    } else {
      // Good distance - stop and shoot
      this.vel.x = 0;

      if (this.shootCooldown <= 0 && this.canSeePlayer(player, world)) {
        this.shootArrow(player, entities);
        this.shootCooldown = this.shootInterval;
      }
    }
  }

  canSeePlayer(player, world) {
    // Simple line of sight check
    const startX = Math.floor(this.pos.x / 16);
    const startY = Math.floor(this.pos.y / 16);
    const endX = Math.floor(player.pos.x / 16);
    const endY = Math.floor(player.pos.y / 16);

    // Bresenham's line algorithm simplified
    const dx = Math.abs(endX - startX);
    const dy = Math.abs(endY - startY);
    const sx = startX < endX ? 1 : -1;
    const sy = startY < endY ? 1 : -1;
    let err = dx - dy;

    let x = startX;
    let y = startY;

    while (x !== endX || y !== endY) {
      // Check if tile blocks sight
      if (world.isSolid(x, y)) {
        return false;
      }

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }

    return true;
  }

  shootArrow(player, entities) {
    // Calculate direction to player
    const dx = player.pos.x - this.pos.x;
    const dy = player.pos.y - this.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    // Add some inaccuracy
    const spread = 0.1; // radians
    const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * spread;

    // Create arrow projectile
    const arrow = new Projectile(
      this.pos.x + this.size.x / 2,
      this.pos.y + this.size.y / 2,
      Math.cos(angle) * this.arrowSpeed,
      Math.sin(angle) * this.arrowSpeed,
      this.arrowDamage,
      this // owner
    );

    arrow.color = '#8B4513'; // Brown arrow
    arrow.gravity = true; // Arrows arc
    arrow.friendly = false; // Damages player
    arrow.lifetime = 3;

    entities.push(arrow);
  }
}
