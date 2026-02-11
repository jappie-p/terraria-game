// Chunk - Container for a 32x32 grid of tiles
import { CHUNK_SIZE } from '../utils/Constants.js';
import { Tile } from './Tile.js';

export class Chunk {
  constructor(chunkX, chunkY) {
    this.x = chunkX; // Chunk coordinates
    this.y = chunkY;
    this.tiles = []; // 2D array of tiles
    this.walls = []; // 2D array of walls (background)
    this.isDirty = true; // Needs re-render
    this.entities = []; // Entities in this chunk (for later)

    // Initialize empty tile and wall arrays
    for (let y = 0; y < CHUNK_SIZE; y++) {
      this.tiles[y] = [];
      this.walls[y] = [];
      for (let x = 0; x < CHUNK_SIZE; x++) {
        this.tiles[y][x] = Tile.create(0); // Air
        this.walls[y][x] = 0; // No wall
      }
    }
  }

  // Get tile at local chunk coordinates (0-31)
  getTile(localX, localY) {
    if (localX < 0 || localX >= CHUNK_SIZE || localY < 0 || localY >= CHUNK_SIZE) {
      return null;
    }
    return this.tiles[localY][localX];
  }

  // Set tile at local chunk coordinates
  setTile(localX, localY, tile) {
    if (localX < 0 || localX >= CHUNK_SIZE || localY < 0 || localY >= CHUNK_SIZE) {
      return false;
    }
    this.tiles[localY][localX] = tile;
    this.isDirty = true;
    return true;
  }

  // Get wall at local chunk coordinates
  getWall(localX, localY) {
    if (localX < 0 || localX >= CHUNK_SIZE || localY < 0 || localY >= CHUNK_SIZE) {
      return null;
    }
    return this.walls[localY][localX];
  }

  // Set wall at local chunk coordinates
  setWall(localX, localY, wallType) {
    if (localX < 0 || localX >= CHUNK_SIZE || localY < 0 || localY >= CHUNK_SIZE) {
      return false;
    }
    this.walls[localY][localX] = wallType;
    this.isDirty = true;
    return true;
  }

  // Mark chunk as needing re-render
  markDirty() {
    this.isDirty = true;
  }

  // Check if chunk is empty (all air)
  isEmpty() {
    for (let y = 0; y < CHUNK_SIZE; y++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        if (this.tiles[y][x].type !== 0) {
          return false;
        }
      }
    }
    return true;
  }

  // Get chunk key for Map storage
  static getKey(chunkX, chunkY) {
    return `${chunkX},${chunkY}`;
  }

  // Get key for this chunk
  getKey() {
    return Chunk.getKey(this.x, this.y);
  }

  // Serialize chunk to JSON for saving
  toJSON() {
    // Only store non-air tiles to save space
    const compressed = [];
    for (let y = 0; y < CHUNK_SIZE; y++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        const tile = this.tiles[y][x];
        if (tile.type !== 0) {
          compressed.push({
            x,
            y,
            type: tile.type,
            health: tile.health,
            metadata: tile.metadata
          });
        }
      }
    }
    return {
      x: this.x,
      y: this.y,
      tiles: compressed
    };
  }

  // Deserialize chunk from JSON
  static fromJSON(data) {
    const chunk = new Chunk(data.x, data.y);
    // Fill in non-air tiles
    for (const tileData of data.tiles) {
      chunk.tiles[tileData.y][tileData.x] = {
        type: tileData.type,
        health: tileData.health,
        metadata: tileData.metadata
      };
    }
    chunk.isDirty = true;
    return chunk;
  }
}
