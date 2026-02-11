// WorldSerializer - Converts world data to/from JSON
import { ItemDatabase } from '../items/ItemDatabase.js';

export class WorldSerializer {
  // Serialize world to JSON
  static serialize(world) {
    const chunks = [];

    // Only save modified chunks (isDirty = true or has player changes)
    for (const [key, chunk] of world.chunks) {
      // Convert chunk to simple format
      const chunkData = {
        x: chunk.x,
        y: chunk.y,
        tiles: this.serializeTiles(chunk)
      };

      chunks.push(chunkData);
    }

    // Serialize container contents (chests)
    const containers = [];
    for (const [key, items] of world.containers) {
      const serializedItems = items.map(item => {
        if (!item) return null;
        return {
          id: item.id,
          count: item.count
        };
      });
      containers.push({ key, items: serializedItems });
    }

    return {
      seed: world.seed,
      chunks: chunks,
      chunkCount: chunks.length,
      containers: containers
    };
  }

  // Serialize tiles in a chunk
  static serializeTiles(chunk) {
    const tiles = [];

    for (let y = 0; y < chunk.tiles.length; y++) {
      for (let x = 0; x < chunk.tiles[y].length; x++) {
        const tile = chunk.tiles[y][x];

        // Only save non-air tiles to reduce save size
        if (tile && tile.type !== 0) {
          tiles.push({
            x: x,
            y: y,
            type: tile.type,
            health: tile.health
          });
        }
      }
    }

    return tiles;
  }

  // Deserialize world from JSON
  static deserialize(worldData, world, generator) {
    if (!worldData) return false;

    // Restore seed
    world.seed = worldData.seed;
    generator.seed = worldData.seed;

    // Clear existing chunks
    world.chunks.clear();

    // Load saved chunks
    for (const chunkData of worldData.chunks) {
      // Generate base chunk from seed
      const chunk = generator.generateChunk(chunkData.x, chunkData.y);

      // Apply saved tile changes
      this.deserializeTiles(chunk, chunkData.tiles);

      // Add to world
      const key = `${chunkData.x},${chunkData.y}`;
      world.chunks.set(key, chunk);
    }

    // Restore container contents (chests)
    world.containers.clear();
    if (worldData.containers) {
      for (const containerData of worldData.containers) {
        const items = containerData.items.map(itemData => {
          if (!itemData) return null;
          const item = ItemDatabase.getItem(itemData.id);
          if (!item) return null;
          return { ...item, count: itemData.count, id: item.id };
        });
        world.containers.set(containerData.key, items);
      }
      console.log(`Loaded ${worldData.containers.length} containers`);
    }

    console.log(`Loaded ${worldData.chunks.length} chunks`);
    return true;
  }

  // Deserialize tiles into a chunk
  static deserializeTiles(chunk, tilesData) {
    for (const tileData of tilesData) {
      const tile = chunk.getTile(tileData.x, tileData.y);
      if (tile) {
        tile.type = tileData.type;
        tile.health = tileData.health;
      }
    }
  }
}
