// EnemySpawner - Spawns enemies around the player
import { Slime } from './enemies/Slime.js';
import { Zombie } from './enemies/Zombie.js';
import { Bat } from './enemies/Bat.js';
import { Skeleton } from './enemies/Skeleton.js';
import { Demon } from './enemies/Demon.js';
import { TILE, SURFACE_LEVEL, TILE_SIZE } from '../utils/Constants.js';

export class EnemySpawner {
  constructor(world) {
    this.world = world;
    this.spawnTimer = 0;
    this.spawnInterval = 4.0; // Spawn every 4 seconds
    this.maxEnemies = 20; // Maximum enemies at once
    this.spawnDistance = { min: 300, max: 500 }; // Pixels from player

    // Enemy types - organized by depth tier
    this.surfaceEnemies = [
      { class: Slime, weight: 4 },
      { class: Zombie, weight: 2 }
    ];

    this.undergroundEnemies = [
      { class: Slime, weight: 2 },
      { class: Zombie, weight: 3 },
      { class: Bat, weight: 3 },
      { class: Skeleton, weight: 2 }
    ];

    this.deepEnemies = [
      { class: Zombie, weight: 2 },
      { class: Bat, weight: 2 },
      { class: Skeleton, weight: 3 },
      { class: Demon, weight: 2 }
    ];
  }

  update(dt, entities, player) {
    this.spawnTimer += dt;

    // Check if we should spawn
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;

      // Count current enemies
      const enemyCount = entities.filter(e => e.isEnemy).length;

      // Spawn if under limit
      if (enemyCount < this.maxEnemies) {
        this.spawnEnemy(entities, player);
      }
    }
  }

  spawnEnemy(entities, player) {
    // Try to find valid spawn location
    for (let attempt = 0; attempt < 10; attempt++) {
      const spawnPos = this.findSpawnPosition(player);

      if (spawnPos && this.isValidSpawnLocation(spawnPos.x, spawnPos.y)) {
        // Create enemy type based on depth
        const EnemyClass = this.selectEnemyType(spawnPos.y);
        const enemy = new EnemyClass(spawnPos.x, spawnPos.y);
        enemy.isEnemy = true; // Tag for counting
        entities.push(enemy);
        return true;
      }
    }

    return false; // Failed to find valid location
  }

  findSpawnPosition(player) {
    // Random angle around player
    const angle = Math.random() * Math.PI * 2;

    // Random distance
    const distance = this.spawnDistance.min +
                    Math.random() * (this.spawnDistance.max - this.spawnDistance.min);

    // Calculate position
    const x = player.pos.x + Math.cos(angle) * distance;
    const y = player.pos.y + Math.sin(angle) * distance;

    return { x, y };
  }

  isValidSpawnLocation(x, y) {
    const tileX = Math.floor(x / 16);
    const tileY = Math.floor(y / 16);

    // Check if position is in air
    const tile = this.world.getTile(tileX, tileY);
    if (tile && tile.type !== TILE.AIR) {
      return false; // Can't spawn inside blocks
    }

    // Check if ground below (within 3 tiles)
    for (let checkY = tileY + 1; checkY <= tileY + 3; checkY++) {
      const groundTile = this.world.getTile(tileX, checkY);
      if (groundTile && groundTile.type !== TILE.AIR) {
        return true; // Found ground
      }
    }

    return false; // No ground found
  }

  selectEnemyType(depth) {
    // Select enemy pool based on depth
    let enemyPool;
    const surfaceY = SURFACE_LEVEL * TILE_SIZE;

    if (depth < surfaceY + 200) {
      // Surface level
      enemyPool = this.surfaceEnemies;
    } else if (depth < surfaceY + 600) {
      // Underground
      enemyPool = this.undergroundEnemies;
    } else {
      // Deep underground
      enemyPool = this.deepEnemies;
    }

    // Weighted random selection
    const totalWeight = enemyPool.reduce((sum, type) => sum + type.weight, 0);
    let random = Math.random() * totalWeight;

    for (const type of enemyPool) {
      random -= type.weight;
      if (random <= 0) {
        return type.class;
      }
    }

    // Fallback
    return enemyPool[0].class;
  }
}
