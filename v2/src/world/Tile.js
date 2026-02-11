// Tile data structure
// Tiles are lightweight data objects, not full class instances
import { TILE_PROPS } from '../utils/Constants.js';

export class Tile {
  // Create a tile with type and optional health
  static create(type, health = null) {
    const props = TILE_PROPS[type];
    return {
      type: type,
      health: health !== null ? health : (props?.health || 0),
      metadata: null // For chests, signs, etc. (added later)
    };
  }

  // Check if tile is solid (blocks movement)
  static isSolid(tile) {
    if (!tile || tile.type === 0) return false;
    const props = TILE_PROPS[tile.type];
    return props?.solid || false;
  }

  // Check if tile is transparent (lets light through)
  static isTransparent(tile) {
    if (!tile || tile.type === 0) return true;
    const props = TILE_PROPS[tile.type];
    return props?.transparent || false;
  }

  // Get tile max health
  static getMaxHealth(tile) {
    if (!tile) return 0;
    const props = TILE_PROPS[tile.type];
    return props?.health || 0;
  }

  // Damage a tile and return true if destroyed
  static damage(tile, amount) {
    if (!tile || tile.type === 0) return true;
    tile.health -= amount;
    return tile.health <= 0;
  }

  // Clone a tile
  static clone(tile) {
    return {
      type: tile.type,
      health: tile.health,
      metadata: tile.metadata ? { ...tile.metadata } : null
    };
  }
}
