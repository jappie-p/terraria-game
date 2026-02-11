// World - Manages chunks and provides tile access
import { CHUNK_SIZE, TILE_SIZE, TILE } from '../utils/Constants.js';
import { Chunk } from './Chunk.js';
import { Tile } from './Tile.js';

export class World {
  constructor(generator) {
    this.chunks = new Map(); // Map<"x,y", Chunk>
    this.generator = generator; // WorldGenerator instance
    this.seed = generator.seed;
    this.containers = new Map(); // Map<"x,y", Array<Item>> for chests, etc.

    // Block animations
    this.blockAnimations = new Map(); // Map<"x,y", {type, progress, maxProgress}>
    this.fallingSand = []; // Array of {x, y, fallProgress} for falling sand
    this.sandUpdateTimer = 0;
  }

  // Get container items at world coordinates
  getContainerItems(worldX, worldY) {
    const key = `${worldX},${worldY}`;
    if (!this.containers.has(key)) {
      // Initialize empty container (20 slots)
      this.containers.set(key, new Array(20).fill(null));
    }
    return this.containers.get(key);
  }

  // Set container items
  setContainerItems(worldX, worldY, items) {
    const key = `${worldX},${worldY}`;
    this.containers.set(key, items);
  }

  // Remove container data
  removeContainer(worldX, worldY) {
    const key = `${worldX},${worldY}`;
    this.containers.delete(key);
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

    // Add break animation
    this.addBlockAnimation(worldX, worldY, 'break');

    this.setTileType(worldX, worldY, 0); // Set to air

    // Remove container data if it exists
    this.removeContainer(worldX, worldY);

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

  // Update world (for liquid physics, falling tiles, etc.)
  update(dt) {
    // Update block animations
    this.updateBlockAnimations(dt);

    // Update falling sand (throttled for performance)
    this.sandUpdateTimer += dt;
    if (this.sandUpdateTimer >= 0.15) { // Update every 150ms (slower falling)
      this.sandUpdateTimer = 0;
      this.updateFallingSand();
    }
  }

  // Update block breaking/placing animations
  updateBlockAnimations(dt) {
    for (const [key, anim] of this.blockAnimations) {
      anim.progress += dt;
      if (anim.progress >= anim.maxProgress) {
        this.blockAnimations.delete(key);
      }
    }
  }

  // Add a block animation (breaking or placing)
  addBlockAnimation(worldX, worldY, type) {
    const key = `${worldX},${worldY}`;
    this.blockAnimations.set(key, {
      type: type, // 'break' or 'place'
      progress: 0,
      maxProgress: type === 'break' ? 0.3 : 0.2
    });
  }

  // Get block animation at position
  getBlockAnimation(worldX, worldY) {
    const key = `${worldX},${worldY}`;
    return this.blockAnimations.get(key);
  }

  // Update falling sand physics
  updateFallingSand() {
    // Check all loaded chunks for sand that needs to fall
    for (const [key, chunk] of this.chunks) {
      const chunkX = chunk.x;
      const chunkY = chunk.y;

      // Scan from bottom to top so sand falls properly
      for (let localY = CHUNK_SIZE - 1; localY >= 0; localY--) {
        for (let localX = 0; localX < CHUNK_SIZE; localX++) {
          const tile = chunk.getTile(localX, localY);
          if (tile && tile.type === TILE.SAND) {
            const worldX = chunkX * CHUNK_SIZE + localX;
            const worldY = chunkY * CHUNK_SIZE + localY;

            // Check if tile below is air
            const belowTile = this.getTile(worldX, worldY + 1);
            if (belowTile && belowTile.type === TILE.AIR) {
              // Move sand down
              this.setTileType(worldX, worldY, TILE.AIR);
              this.setTileType(worldX, worldY + 1, TILE.SAND);

              // Mark both chunks as dirty
              chunk.markDirty();
              const { chunkX: belowChunkX, chunkY: belowChunkY } = this.worldToChunk(worldX, worldY + 1);
              if (belowChunkX !== chunkX || belowChunkY !== chunkY) {
                const belowChunk = this.getChunk(belowChunkX, belowChunkY);
                belowChunk.markDirty();
              }
            }
          }
        }
      }
    }
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
