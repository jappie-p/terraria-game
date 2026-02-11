// PhysicsSystem - Handles gravity, velocity, and collision resolution
import { GRAVITY, TERMINAL_VELOCITY, FRICTION, AIR_RESISTANCE, TILE_SIZE, WORLD_HEIGHT } from '../utils/Constants.js';
import { Collision } from './Collision.js';

export class PhysicsSystem {
  constructor(world) {
    this.world = world;
    this.gravity = GRAVITY;
    // Maximum distance an entity can move per substep (prevents tunneling)
    this.maxStepDistance = TILE_SIZE / 2;
  }

  // Update all entities
  update(entities, dt) {
    for (const entity of entities) {
      this.updateEntity(entity, dt);
    }
  }

  // Update a single entity
  updateEntity(entity, dt) {
    // First, push entity out of any solid tiles it may be stuck in
    this.unstickEntity(entity);

    // Reset ground state
    entity.onGround = false;

    // Apply gravity
    entity.vel.y += this.gravity * dt;

    // Limit falling speed (terminal velocity)
    if (entity.vel.y > TERMINAL_VELOCITY) {
      entity.vel.y = TERMINAL_VELOCITY;
    }

    // Calculate total movement this frame
    const totalMoveX = entity.vel.x * dt;
    const totalMoveY = entity.vel.y * dt;

    // Use substep collision for large movements to prevent tunneling
    const moveDistance = Math.sqrt(totalMoveX * totalMoveX + totalMoveY * totalMoveY);
    const numSteps = Math.max(1, Math.ceil(moveDistance / this.maxStepDistance));

    const stepX = totalMoveX / numSteps;
    const stepY = totalMoveY / numSteps;

    for (let step = 0; step < numSteps; step++) {
      // Move on X axis and resolve collisions
      entity.pos.x += stepX;
      this.resolveCollisionsX(entity);

      // Move on Y axis and resolve collisions
      entity.pos.y += stepY;
      this.resolveCollisionsY(entity);

      // Check world boundaries
      this.enforceWorldBoundaries(entity);
    }

    // Apply friction/air resistance AFTER collision resolution
    if (entity.onGround) {
      entity.vel.x *= FRICTION;
    } else {
      entity.vel.x *= AIR_RESISTANCE;
    }

    // Stop very small velocities to prevent jittering
    if (Math.abs(entity.vel.x) < 0.1) entity.vel.x = 0;
    if (Math.abs(entity.vel.y) < 0.1 && entity.onGround) entity.vel.y = 0;
  }

  // Enforce world boundaries to prevent falling through
  enforceWorldBoundaries(entity) {
    const bounds = entity.getBounds();

    // Bottom of world (bedrock layer) - convert WORLD_HEIGHT tiles to pixels
    const worldBottomPixels = WORLD_HEIGHT * TILE_SIZE;
    if (bounds.bottom > worldBottomPixels) {
      entity.pos.y = worldBottomPixels - entity.size.y / 2;
      entity.vel.y = 0;
      entity.onGround = true;
    }

    // Top of world (sky limit) - prevent going too high
    const skyLimit = -100 * TILE_SIZE; // 100 tiles above surface
    if (bounds.top < skyLimit) {
      entity.pos.y = skyLimit + entity.size.y / 2;
      entity.vel.y = 0;
    }
  }

  // Resolve X-axis collisions
  resolveCollisionsX(entity) {
    const collisions = Collision.entityVsTiles(entity, this.world);
    const bounds = entity.getBounds();

    for (const tileData of collisions) {
      const tileBounds = tileData.bounds;

      // Calculate overlap on each axis
      const overlapX = Math.min(bounds.right - tileBounds.left, tileBounds.right - bounds.left);
      const overlapY = Math.min(bounds.bottom - tileBounds.top, tileBounds.bottom - bounds.top);

      // Only resolve X if overlap is smaller on X axis (hitting the side)
      if (overlapX < overlapY) {
        Collision.resolveX(entity, tileData);
      }
    }
  }

  // Resolve Y-axis collisions
  resolveCollisionsY(entity) {
    const collisions = Collision.entityVsTiles(entity, this.world);
    const bounds = entity.getBounds();

    for (const tileData of collisions) {
      const tileBounds = tileData.bounds;

      // Calculate overlap on each axis
      const overlapX = Math.min(bounds.right - tileBounds.left, tileBounds.right - bounds.left);
      const overlapY = Math.min(bounds.bottom - tileBounds.top, tileBounds.bottom - bounds.top);

      // Only resolve Y if overlap is smaller or equal on Y axis
      if (overlapY <= overlapX) {
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

  // Push entity out of solid tiles they may be stuck in
  unstickEntity(entity) {
    const collisions = Collision.entityVsTiles(entity, this.world);

    if (collisions.length === 0) return;

    // Find the best direction to push the entity
    let bestPushY = 0;
    let bestPushX = 0;

    for (const tileData of collisions) {
      const bounds = entity.getBounds();
      const tileBounds = tileData.bounds;

      // Calculate penetration depths
      const overlapLeft = bounds.right - tileBounds.left;
      const overlapRight = tileBounds.right - bounds.left;
      const overlapTop = bounds.bottom - tileBounds.top;
      const overlapBottom = tileBounds.bottom - bounds.top;

      // Find minimum overlap direction
      const minOverlapX = overlapLeft < overlapRight ? -overlapLeft : overlapRight;
      const minOverlapY = overlapTop < overlapBottom ? -overlapTop : overlapBottom;

      // Push in the direction with least penetration (usually up)
      if (Math.abs(minOverlapY) < Math.abs(minOverlapX)) {
        if (Math.abs(minOverlapY) > Math.abs(bestPushY)) {
          bestPushY = minOverlapY;
        }
      } else {
        if (Math.abs(minOverlapX) > Math.abs(bestPushX)) {
          bestPushX = minOverlapX;
        }
      }
    }

    // Apply the push (prioritize vertical push to get entities on top of ground)
    if (bestPushY !== 0) {
      entity.pos.y += bestPushY;
      entity.vel.y = 0;
      if (bestPushY < 0) {
        entity.onGround = true;
      }
    }
    if (bestPushX !== 0) {
      entity.pos.x += bestPushX;
      entity.vel.x = 0;
    }
  }
}
