// WorldGenerator - Procedural terrain generation
import { CHUNK_SIZE, TILE, WALL, SURFACE_LEVEL, WORLD_HEIGHT, CAVE_THRESHOLD } from '../utils/Constants.js';
import { SimplexNoise } from '../utils/SimplexNoise.js';
import { Chunk } from './Chunk.js';
import { Tile } from './Tile.js';

export class WorldGenerator {
  constructor(seed = Date.now()) {
    this.seed = seed;
    this.noise = new SimplexNoise(seed);
    this.caveNoise = new SimplexNoise(seed + 1000);
    this.oreNoise = new SimplexNoise(seed + 2000);
    this.caveEntranceNoise = new SimplexNoise(seed + 3000);
    this.oreVeinNoise = new SimplexNoise(seed + 4000);

    // Pre-generated ore veins for consistent clustering
    this.oreVeins = new Map(); // Store vein centers
  }

  // Generate a chunk
  generateChunk(chunkX, chunkY) {
    const chunk = new Chunk(chunkX, chunkY);

    // Generate terrain for each tile in the chunk
    for (let localY = 0; localY < CHUNK_SIZE; localY++) {
      for (let localX = 0; localX < CHUNK_SIZE; localX++) {
        // World coordinates
        const worldX = chunkX * CHUNK_SIZE + localX;
        const worldY = chunkY * CHUNK_SIZE + localY;

        const tile = this.generateTile(worldX, worldY);
        chunk.setTile(localX, localY, tile);

        // Generate walls for underground areas
        const wall = this.generateWall(worldX, worldY, tile.type);
        chunk.setWall(localX, localY, wall);
      }
    }

    chunk.isDirty = true;
    return chunk;
  }

  // Generate a single tile
  generateTile(worldX, worldY) {
    // Get terrain height at this x position
    const surfaceY = this.getTerrainHeight(worldX);

    // Above surface = air
    if (worldY < surfaceY) {
      return Tile.create(TILE.AIR);
    }

    // Check for caves
    if (this.isCave(worldX, worldY)) {
      return Tile.create(TILE.AIR);
    }

    // Surface layer = grass
    if (worldY === surfaceY) {
      return Tile.create(TILE.GRASS);
    }

    // 3-4 layers below surface = dirt
    if (worldY < surfaceY + 4) {
      return Tile.create(TILE.DIRT);
    }

    // Check for ores in stone layer
    const ore = this.generateOre(worldX, worldY, surfaceY);
    if (ore !== null) {
      return Tile.create(ore);
    }

    // Everything else = stone
    return Tile.create(TILE.STONE);
  }

  // Get terrain height at x position
  getTerrainHeight(x) {
    // Use octave noise for varied terrain
    const scale = 0.01; // Lower = smoother hills
    const noise = this.noise.octaveNoise2D(x * scale, 0, 4, 0.5, 2.0);

    // Convert from -1..1 to height
    const variation = 20; // Height variation
    const height = SURFACE_LEVEL + Math.floor(noise * variation);

    return Math.max(0, Math.min(WORLD_HEIGHT - 1, height));
  }

  // Check if position is a cave
  isCave(x, y) {
    const surfaceY = this.getTerrainHeight(x);
    const depthBelowSurface = y - surfaceY;

    // 1. Surface cave entrances - create reliable openings
    const entranceScale = 0.008; // Large scale for spaced out entrances
    const entranceValue = this.caveEntranceNoise.noise2D01(x * entranceScale, 0);

    // Entrance every ~100-150 blocks
    if (entranceValue > 0.92 && depthBelowSurface >= -2 && depthBelowSurface <= 30) {
      // Create a cone-shaped entrance
      const entranceDepth = depthBelowSurface + 2;
      const entranceWidth = 5 - (entranceDepth / 10); // Narrows as it goes down

      // Get entrance center from noise
      const localX = x % 100;
      const distFromCenter = Math.abs(localX - 50);

      if (distFromCenter < entranceWidth) {
        return true; // Entrance shaft
      }
    }

    // No caves above surface or just below
    if (depthBelowSurface < 8) return false;

    // 2. Main cave system - horizontal tunnels
    const caveScale = 0.025; // Scale for cave size
    const compressedY = y * 0.3; // Heavily compress Y for horizontal caves
    const caveValue1 = this.caveNoise.octaveNoise2D(x * caveScale, compressedY * caveScale, 3, 0.5, 2.0);

    // 3. Vertical connections to link caves to surface
    const verticalScale = 0.015;
    const verticalValue = this.caveNoise.octaveNoise2D(x * verticalScale, y * verticalScale, 2, 0.4, 2.0);

    // Combine horizontal and vertical caves
    const combinedValue = Math.max(caveValue1, verticalValue * 0.8);

    // 4. Large caverns deeper underground
    const cavernScale = 0.012;
    const cavernValue = this.caveNoise.octaveNoise2D(x * cavernScale, y * cavernScale, 2, 0.6, 2.0);

    // Adjust threshold based on depth
    let threshold = 0.40;
    if (depthBelowSurface > 30) {
      threshold = 0.35; // More caves deeper
    }
    if (depthBelowSurface > 60) {
      threshold = 0.30; // Even more caves very deep
      // Add large caverns
      if (cavernValue > 0.45) return true;
    }

    return combinedValue > threshold;
  }

  // Generate ore deposits using vein/cluster system
  generateOre(x, y, surfaceY) {
    const depthBelowSurface = y - surfaceY;

    // Only generate ores below certain depth
    if (depthBelowSurface < 10) return null;

    // Use noise to determine vein centers
    const veinScale = 0.05; // Lower = bigger veins spread out more
    const veinValue = this.oreVeinNoise.noise2D01(x * veinScale, y * veinScale);

    // Different ore types at different depths and vein thresholds
    let oreType = null;
    let veinSize = 0;

    // Coal veins (shallow, common, medium veins)
    if (depthBelowSurface >= 10 && depthBelowSurface < 60) {
      if (veinValue > 0.75 && veinValue < 0.80) {
        oreType = TILE.COAL_ORE;
        veinSize = 4 + Math.floor(this.oreNoise.noise2D01(x * 0.01, y * 0.01) * 8); // 4-12 blocks
      }
    }

    // Iron veins (medium depth, common, medium veins)
    if (depthBelowSurface >= 15 && depthBelowSurface < 80) {
      if (veinValue > 0.80 && veinValue < 0.85) {
        oreType = TILE.IRON_ORE;
        veinSize = 3 + Math.floor(this.oreNoise.noise2D01(x * 0.01, y * 0.01) * 9); // 3-12 blocks
      }
    }

    // Gold veins (deep, uncommon, small-medium veins)
    if (depthBelowSurface >= 30 && depthBelowSurface < 100) {
      if (veinValue > 0.85 && veinValue < 0.88) {
        oreType = TILE.GOLD_ORE;
        veinSize = 2 + Math.floor(this.oreNoise.noise2D01(x * 0.01, y * 0.01) * 6); // 2-8 blocks
      }
    }

    // Diamond veins (very deep, rare, small veins)
    if (depthBelowSurface >= 50) {
      if (veinValue > 0.88 && veinValue < 0.90) {
        oreType = TILE.DIAMOND_ORE;
        veinSize = 1 + Math.floor(this.oreNoise.noise2D01(x * 0.01, y * 0.01) * 5); // 1-6 blocks
      }
    }

    // If we found a vein center, check if this block is part of the cluster
    if (oreType !== null) {
      return this.isInOreVein(x, y, veinSize) ? oreType : null;
    }

    return null;
  }

  // Check if a position is within an ore vein cluster
  isInOreVein(x, y, veinSize) {
    // Use noise to create blob-shaped veins
    const clusterScale = 0.2;
    const clusterValue = this.oreVeinNoise.noise2D01(x * clusterScale, y * clusterScale);

    // The threshold determines vein shape and size
    const threshold = 1.0 - (veinSize * 0.08); // Larger veins = lower threshold = more blocks

    return clusterValue > threshold;
  }

  // Generate tree at position (for later - Phase 5)
  generateTree(chunk, localX, localY) {
    // Placeholder for tree generation
    // Trees will be added in Phase 5
  }

  // Generate wall for a position
  generateWall(worldX, worldY, tileType) {
    const surfaceY = this.getTerrainHeight(worldX);

    // No walls above surface
    if (worldY < surfaceY) {
      return WALL.AIR;
    }

    // Place walls in caves and underground
    const isCave = this.isCave(worldX, worldY);

    if (isCave) {
      // Caves have stone walls
      return WALL.STONE_WALL;
    }

    // Underground has matching wall type
    if (worldY >= surfaceY + 4) {
      // Deep underground = stone walls
      return WALL.STONE_WALL;
    } else {
      // Near surface = dirt walls
      return WALL.DIRT_WALL;
    }
  }

  // Get biome at position (for later - Phase 5)
  getBiome(x, y) {
    // Placeholder for biome system
    // Will be expanded in Phase 5
    return 'FOREST';
  }
}
