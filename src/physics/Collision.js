// Collision - AABB collision detection
import { TILE_SIZE } from '../utils/Constants.js';
import { Tile } from '../world/Tile.js';

export class Collision {
  // Check AABB collision between two rectangles
  static rectVsRect(r1, r2) {
    return !(r1.right < r2.left ||
             r1.left > r2.right ||
             r1.bottom < r2.top ||
             r1.top > r2.bottom);
  }

  // Get tiles surrounding an entity
  static getSurroundingTiles(entity, world) {
    const bounds = entity.getBounds();

    // Convert to tile coordinates
    const leftTile = Math.floor(bounds.left / TILE_SIZE);
    const rightTile = Math.floor(bounds.right / TILE_SIZE);
    const topTile = Math.floor(bounds.top / TILE_SIZE);
    const bottomTile = Math.floor(bounds.bottom / TILE_SIZE);

    const tiles = [];

    for (let ty = topTile; ty <= bottomTile; ty++) {
      for (let tx = leftTile; tx <= rightTile; tx++) {
        const tile = world.getTile(tx, ty);
        if (tile && tile.type !== 0) {
          tiles.push({
            tile,
            x: tx,
            y: ty,
            bounds: {
              left: tx * TILE_SIZE,
              right: (tx + 1) * TILE_SIZE,
              top: ty * TILE_SIZE,
              bottom: (ty + 1) * TILE_SIZE
            }
          });
        }
      }
    }

    return tiles;
  }

  // Check collision between entity and world tiles
  static entityVsTiles(entity, world) {
    const tiles = this.getSurroundingTiles(entity, world);
    const collisions = [];

    const entityBounds = entity.getBounds();

    for (const tileData of tiles) {
      // Check if tile is solid
      const props = world.getTile(tileData.x, tileData.y);
      if (!props || props.type === 0) continue;

      if (!Tile.isSolid(props)) continue;

      // Check collision
      if (this.rectVsRect(entityBounds, tileData.bounds)) {
        collisions.push(tileData);
      }
    }

    return collisions;
  }

  // Resolve collision on X axis
  static resolveX(entity, tileData) {
    const entityBounds = entity.getBounds();
    const tileBounds = tileData.bounds;

    // Determine which side to push from
    if (entity.vel.x > 0) {
      // Moving right, push left
      const overlap = entityBounds.right - tileBounds.left;
      entity.pos.x -= overlap;
    } else if (entity.vel.x < 0) {
      // Moving left, push right
      const overlap = tileBounds.right - entityBounds.left;
      entity.pos.x += overlap;
    }

    entity.vel.x = 0;
  }

  // Resolve collision on Y axis
  static resolveY(entity, tileData) {
    const entityBounds = entity.getBounds();
    const tileBounds = tileData.bounds;

    // Determine which side to push from
    if (entity.vel.y > 0) {
      // Moving down, push up (landing on ground)
      const overlap = entityBounds.bottom - tileBounds.top;
      entity.pos.y -= overlap;
      entity.onGround = true;
    } else if (entity.vel.y < 0) {
      // Moving up, push down (hitting ceiling)
      const overlap = tileBounds.bottom - entityBounds.top;
      entity.pos.y += overlap;
    }

    entity.vel.y = 0;
  }

  // Check if point is inside a tile
  static pointVsTile(x, y, world) {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);
    return world.isSolid(tileX, tileY);
  }

  // Check collision between two entities
  static entityVsEntity(entity1, entity2) {
    const bounds1 = entity1.getBounds();
    const bounds2 = entity2.getBounds();
    return this.rectVsRect(bounds1, bounds2);
  }

  // Get all entities colliding with given entity
  static getCollidingEntities(entity, entities) {
    const colliding = [];

    for (const other of entities) {
      if (other === entity) continue; // Skip self
      if (this.entityVsEntity(entity, other)) {
        colliding.push(other);
      }
    }

    return colliding;
  }
}
