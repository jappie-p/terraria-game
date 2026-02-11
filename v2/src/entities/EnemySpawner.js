// EnemySpawner - Spawns enemies around the player
import { Slime } from './enemies/Slime.js';
import { Zombie } from './enemies/Zombie.js';
import { TILE } from '../utils/Constants.js';

export class EnemySpawner {
  constructor(world) {
    this.world = world;
    this.spawnTimer = 0;
    this.spawnInterval = 5.0; // Spawn every 5 seconds
    this.maxEnemies = 15; // Maximum enemies at once
    this.spawnDistance = { min: 300, max: 500 }; // Pixels from player

    // Enemy types to spawn
    this.enemyTypes = [
      { class: Slime, weight: 3 }, // 3x more likely
      { class: Zombie, weight: 2 }
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
        // Create random enemy type
        const EnemyClass = this.selectEnemyType();
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

  selectEnemyType() {
    // Weighted random selection
    const totalWeight = this.enemyTypes.reduce((sum, type) => sum + type.weight, 0);
    let random = Math.random() * totalWeight;

    for (const type of this.enemyTypes) {
      random -= type.weight;
      if (random <= 0) {
        return type.class;
      }
    }

    // Fallback
    return this.enemyTypes[0].class;
  }
}
