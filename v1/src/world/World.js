// World - Manages chunks and provides tile access
import { CHUNK_SIZE, TILE_SIZE } from '../utils/Constants.js';
import { Chunk } from './Chunk.js';
import { Tile } from './Tile.js';

export class World {
  constructor(generator) {
    this.chunks = new Map(); // Map<"x,y", Chunk>
    this.generator = generator; // WorldGenerator instance
    this.seed = generator.seed;
  }

  // Convert world tile coordinates to chunk coordinates
  worldToChunk(worldX, worldY) {
    return {
      chunkX: Math.floor(worldX / CHUNK_SIZE),
      chunkY: Math.floor(worldY / CHUNK_SIZE),
      localX: ((worldX % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE,
      localY: ((worldY % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE
    };
  }

  // Convert world pixel coordinates to tile coordinates
  pixelToTile(pixelX, pixelY) {
    return {
      x: Math.floor(pixelX / TILE_SIZE),
      y: Math.floor(pixelY / TILE_SIZE)
    };
  }

  // Convert tile coordinates to pixel coordinates (top-left of tile)
  tileToPixel(tileX, tileY) {
    return {
      x: tileX * TILE_SIZE,
      y: tileY * TILE_SIZE
    };
  }

  // Get or create a chunk
  getChunk(chunkX, chunkY) {
    const key = Chunk.getKey(chunkX, chunkY);
    let chunk = this.chunks.get(key);

    if (!chunk) {
      // Generate new chunk
      chunk = this.generator.generateChunk(chunkX, chunkY);
      this.chunks.set(key, chunk);
    }

    return chunk;
  }

  // Check if chunk exists (without generating)
  hasChunk(chunkX, chunkY) {
    const key = Chunk.getKey(chunkX, chunkY);
    return this.chunks.has(key);
  }

  // Get tile at world coordinates
  getTile(worldX, worldY) {
    const { chunkX, chunkY, localX, localY } = this.worldToChunk(worldX, worldY);
    const chunk = this.getChunk(chunkX, chunkY);
    return chunk.getTile(localX, localY);
  }

  // Set tile at world coordinates
  setTile(worldX, worldY, tile) {
    const { chunkX, chunkY, localX, localY } = this.worldToChunk(worldX, worldY);
    const chunk = this.getChunk(chunkX, chunkY);
    return chunk.setTile(localX, localY, tile);
  }

  // Get tile type at world coordinates
  getTileType(worldX, worldY) {
    const tile = this.getTile(worldX, worldY);
    return tile ? tile.type : 0;
  }

  // Set tile type at world coordinates
  setTileType(worldX, worldY, type) {
    const tile = Tile.create(type);
    return this.setTile(worldX, worldY, tile);
  }

  // Check if tile is solid at world coordinates
  isSolid(worldX, worldY) {
    const tile = this.getTile(worldX, worldY);
    return Tile.isSolid(tile);
  }

  // Get wall at world coordinates
  getWall(worldX, worldY) {
    const { chunkX, chunkY, localX, localY } = this.worldToChunk(worldX, worldY);
    const chunk = this.getChunk(chunkX, chunkY);
    return chunk.getWall(localX, localY);
  }

  // Set wall at world coordinates
  setWall(worldX, worldY, wallType) {
    const { chunkX, chunkY, localX, localY } = this.worldToChunk(worldX, worldY);
    const chunk = this.getChunk(chunkX, chunkY);
    return chunk.setWall(localX, localY, wallType);
  }

  // Get all chunks in a rectangular region
  getChunksInRegion(minChunkX, minChunkY, maxChunkX, maxChunkY) {
    const chunks = [];
    for (let cy = minChunkY; cy <= maxChunkY; cy++) {
      for (let cx = minChunkX; cx <= maxChunkX; cx++) {
        chunks.push(this.getChunk(cx, cy));
      }
    }
    return chunks;
  }

  // Get chunks visible in viewport (for rendering)
  getVisibleChunks(camera) {
    const left = camera.pos.x - camera.viewport.width / 2;
    const right = camera.pos.x + camera.viewport.width / 2;
    const top = camera.pos.y - camera.viewport.height / 2;
    const bottom = camera.pos.y + camera.viewport.height / 2;

    // Convert to tile coordinates
    const leftTile = Math.floor(left / TILE_SIZE);
    const rightTile = Math.floor(right / TILE_SIZE);
    const topTile = Math.floor(top / TILE_SIZE);
    const bottomTile = Math.floor(bottom / TILE_SIZE);

    // Convert to chunk coordinates
    const minChunkX = Math.floor(leftTile / CHUNK_SIZE);
    const maxChunkX = Math.floor(rightTile / CHUNK_SIZE);
    const minChunkY = Math.floor(topTile / CHUNK_SIZE);
    const maxChunkY = Math.floor(bottomTile / CHUNK_SIZE);

    return this.getChunksInRegion(minChunkX, minChunkY, maxChunkX, maxChunkY);
  }

  // Destroy a tile and return what it drops
  destroyTile(worldX, worldY) {
    const tile = this.getTile(worldX, worldY);
    if (!tile || tile.type === 0) return null;

    const tileType = tile.type;
    this.setTileType(worldX, worldY, 0); // Set to air

    // Mark chunk as dirty for re-rendering
    const { chunkX, chunkY } = this.worldToChunk(worldX, worldY);
    const chunk = this.getChunk(chunkX, chunkY);
    chunk.markDirty();

    return tileType; // Return tile type for item drop
  }

  // Damage a tile, returns tile type if destroyed, null otherwise
  damageTile(worldX, worldY, damage) {
    const tile = this.getTile(worldX, worldY);
    if (!tile || tile.type === 0) return null;

    const destroyed = Tile.damage(tile, damage);
    if (destroyed) {
      return this.destroyTile(worldX, worldY);
    }

    // Mark chunk as dirty for visual update
    const { chunkX, chunkY } = this.worldToChunk(worldX, worldY);
    const chunk = this.getChunk(chunkX, chunkY);
    chunk.markDirty();

    return null;
  }

  // Update world (for liquid physics, falling tiles, etc. - Phase 5)
  update(dt) {
    // Placeholder for world updates
  }

  // Serialize world to JSON
  toJSON() {
    const chunksData = [];
    for (const [key, chunk] of this.chunks) {
      // Only save non-empty chunks
      if (!chunk.isEmpty()) {
        chunksData.push(chunk.toJSON());
      }
    }
    return {
      seed: this.seed,
      chunks: chunksData
    };
  }

  // Deserialize world from JSON
  static fromJSON(data, generator) {
    const world = new World(generator);
    world.seed = data.seed;

    // Load chunks
    for (const chunkData of data.chunks) {
      const chunk = Chunk.fromJSON(chunkData);
      world.chunks.set(chunk.getKey(), chunk);
    }

    return world;
  }
}
