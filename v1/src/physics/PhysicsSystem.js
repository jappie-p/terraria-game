// PhysicsSystem - Handles gravity, velocity, and collision resolution
import { GRAVITY, TERMINAL_VELOCITY, FRICTION, AIR_RESISTANCE } from '../utils/Constants.js';
import { Collision } from './Collision.js';

export class PhysicsSystem {
  constructor(world) {
    this.world = world;
    this.gravity = GRAVITY;
  }

  // Update all entities
  update(entities, dt) {
    for (const entity of entities) {
      this.updateEntity(entity, dt);
    }
  }

  // Update a single entity
  updateEntity(entity, dt) {
    // Reset ground state
    entity.onGround = false;

    // Apply gravity
    entity.vel.y += this.gravity * dt;

    // Limit falling speed (terminal velocity)
    if (entity.vel.y > TERMINAL_VELOCITY) {
      entity.vel.y = TERMINAL_VELOCITY;
    }

    // Move on X axis and resolve collisions
    entity.pos.x += entity.vel.x * dt;
    this.resolveCollisionsX(entity);

    // Move on Y axis and resolve collisions
    entity.pos.y += entity.vel.y * dt;
    this.resolveCollisionsY(entity);

    // Apply friction/air resistance AFTER collision resolution
    // (so we know if entity is actually on ground)
    if (entity.onGround) {
      entity.vel.x *= FRICTION;
    } else {
      entity.vel.x *= AIR_RESISTANCE;
    }

    // Stop very small velocities to prevent jittering
    if (Math.abs(entity.vel.x) < 0.1) entity.vel.x = 0;
    if (Math.abs(entity.vel.y) < 0.1 && entity.onGround) entity.vel.y = 0;
  }

  // Resolve X-axis collisions
  resolveCollisionsX(entity) {
    const collisions = Collision.entityVsTiles(entity, this.world);
    const bounds = entity.getBounds();

    for (const tileData of collisions) {
      // Only resolve X-axis if entity is actually hitting the side of a tile
      // Skip if this is primarily a vertical collision (standing on top/hitting bottom)
      const tileBounds = tileData.bounds;

      // Calculate overlap on each axis
      const overlapX = Math.min(bounds.right - tileBounds.left, tileBounds.right - bounds.left);
      const overlapY = Math.min(bounds.bottom - tileBounds.top, tileBounds.bottom - bounds.top);

      // Only resolve X if overlap is greater on X axis (hitting the side)
      if (overlapX < overlapY && entity.vel.x !== 0) {
        Collision.resolveX(entity, tileData);
      }
    }
  }

  // Resolve Y-axis collisions
  resolveCollisionsY(entity) {
    const collisions = Collision.entityVsTiles(entity, this.world);
    const bounds = entity.getBounds();

    for (const tileData of collisions) {
      // Only resolve Y-axis if entity is actually hitting top/bottom of tile
      // Skip if this is primarily a horizontal collision (hitting the side)
      const tileBounds = tileData.bounds;

      // Calculate overlap on each axis
      const overlapX = Math.min(bounds.right - tileBounds.left, tileBounds.right - bounds.left);
      const overlapY = Math.min(bounds.bottom - tileBounds.top, tileBounds.bottom - bounds.top);

      // Only resolve Y if overlap is greater on Y axis (hitting top/bottom)
      if (overlapY <= overlapX && entity.vel.y !== 0) {
        Collision.resolveY(entity, tileData);
      }
    }
  }

  // Check if entity is on ground
  isOnGround(entity) {
    // Create a test bounds slightly below entity
    const testBounds = entity.getBounds();
    testBounds.top += 1;
    testBounds.bottom += 1;

    // Check for solid tiles below
    const tiles = Collision.getSurroundingTiles(entity, this.world);
    for (const tileData of tiles) {
      if (Collision.rectVsRect(testBounds, tileData.bounds)) {
        return true;
      }
    }

    return false;
  }
}
