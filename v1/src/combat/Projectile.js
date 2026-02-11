// Projectile - Bullets, arrows, magic projectiles
import { Entity } from '../entities/Entity.js';

export class Projectile extends Entity {
  constructor(x, y, velocityX, velocityY, damage, owner) {
    super(x, y, 4, 4); // Small 4x4 projectile

    this.vel.x = velocityX;
    this.vel.y = velocityY;
    this.damage = damage;
    this.owner = owner; // Who shot it
    this.lifetime = 5.0; // Seconds before despawn
    this.age = 0;
    this.piercing = false; // Can hit multiple enemies
    this.hitEntities = new Set(); // Track what we've hit
    this.gravity = false; // Most projectiles ignore gravity
    this.color = '#FFFF00'; // Yellow by default
    this.isProjectile = true;
  }

  update(dt, world, entities) {
    this.age += dt;

    // Despawn if too old
    if (this.age >= this.lifetime) {
      this.alive = false;
      return;
    }

    // Move projectile
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;

    // Apply gravity if enabled (for arrows)
    if (this.gravity) {
      this.vel.y += 400 * dt; // Half gravity for projectiles
    }

    // Check collision with tiles
    if (this.checkTileCollision(world)) {
      this.alive = false; // Destroy on wall hit
      return;
    }

    // Check collision with entities
    this.checkEntityCollision(entities);
  }

  checkTileCollision(world) {
    const tileX = Math.floor(this.pos.x / 16);
    const tileY = Math.floor(this.pos.y / 16);

    const tile = world.getTile(tileX, tileY);
    if (tile && tile.type !== 0) {
      return true; // Hit a solid tile
    }

    return false;
  }

  checkEntityCollision(entities) {
    for (const entity of entities) {
      // Skip owner
      if (entity === this.owner) continue;

      // Skip other projectiles
      if (entity.isProjectile) continue;

      // Skip already hit entities (unless piercing)
      if (!this.piercing && this.hitEntities.has(entity)) continue;

      // Skip dead entities
      if (!entity.alive) continue;

      // Check collision
      if (this.collidesWith(entity)) {
        this.onHit(entity);

        if (!this.piercing) {
          this.alive = false; // Destroy projectile
          break;
        }
      }
    }
  }

  onHit(entity) {
    // Deal damage
    entity.takeDamage(this.damage);

    // Mark as hit
    this.hitEntities.add(entity);

    // Apply knockback
    const dx = entity.pos.x - this.pos.x;
    const dy = entity.pos.y - this.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const knockbackForce = 150;
      entity.vel.x += (dx / distance) * knockbackForce;
      entity.vel.y -= 50;
    }
  }

  render(ctx, camera) {
    const screenPos = camera.worldToScreen(this.pos);

    // Draw projectile as a circle
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, this.size.x, 0, Math.PI * 2);
    ctx.fill();
  }
}
