// Game - Main game class with game loop
import { World } from './world/World.js';
import { WorldGenerator } from './world/WorldGenerator.js';
import { Camera } from './rendering/Camera.js';
import { Renderer } from './rendering/Renderer.js';
import { Player } from './entities/Player.js';
import { PhysicsSystem } from './physics/PhysicsSystem.js';
import { InputManager } from './input/InputManager.js';
import { Hotbar } from './ui/Hotbar.js';
import { CraftingPanel } from './ui/CraftingPanel.js';
import { HealthBar } from './ui/HealthBar.js';
import { EquipmentPanel } from './ui/EquipmentPanel.js';
import { BossHealthBar } from './ui/BossHealthBar.js';
import { EyeOfTerror } from './entities/bosses/EyeOfTerror.js';
import { DamageNumber } from './effects/DamageNumber.js';
import { EnemySpawner } from './entities/EnemySpawner.js';
import { DamageSystem } from './combat/DamageSystem.js';
import { Collision } from './physics/Collision.js';
import { SaveManager } from './save/SaveManager.js';
import { WorldSerializer } from './save/WorldSerializer.js';
import { PlayerSerializer } from './save/PlayerSerializer.js';
import { ItemDatabase } from './items/ItemDatabase.js';
import { SURFACE_LEVEL, TILE_SIZE } from './utils/Constants.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.running = false;
    this.paused = false;

    // Core systems
    this.renderer = new Renderer(canvas);
    this.input = new InputManager(canvas);

    // World
    const seed = Date.now();
    this.generator = new WorldGenerator(seed);
    this.world = new World(this.generator);

    // Camera
    this.camera = new Camera({
      width: canvas.width,
      height: canvas.height
    });
    this.renderer.setCamera(this.camera);

    // Player - spawn at surface
    const spawnX = 0 * TILE_SIZE + TILE_SIZE / 2;
    const surfaceY = this.generator.getTerrainHeight(0);
    const spawnY = (surfaceY - 2) * TILE_SIZE;
    this.player = new Player(spawnX, spawnY);

    // Set camera to follow player
    this.camera.follow(this.player);
    this.camera.snapToTarget(); // Immediate snap on start

    // Physics
    this.physics = new PhysicsSystem(this.world);

    // Entities
    this.entities = [this.player];

    // Enemy spawning
    this.enemySpawner = new EnemySpawner(this.world);

    // Visual effects
    this.damageNumbers = [];

    // UI elements (pass texture generator to hotbar for item icons)
    this.hotbar = new Hotbar(this.player.inventory, this.player, this.renderer.textureGen);
    this.craftingPanel = new CraftingPanel(this.player.craftingSystem, this.player.inventory, this.renderer.textureGen);
    this.equipmentPanel = new EquipmentPanel(this.player.equipment, this.player.inventory, this.player, this.renderer.textureGen);
    this.healthBar = new HealthBar(10, 10, 200, 20, this.player);
    this.bossHealthBar = new BossHealthBar();
    this.uiElements = [this.hotbar, this.craftingPanel, this.equipmentPanel, this.healthBar, this.bossHealthBar];

    // FPS tracking
    this.fps = 60;
    this.frameCount = 0;
    this.fpsTimer = 0;

    // Time tracking
    this.lastTime = performance.now();

    // Save system
    this.saveManager = new SaveManager();
    this.playtime = 0; // Total playtime in seconds
  }

  // Start the game loop
  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  // Stop the game loop
  stop() {
    this.running = false;
  }

  // Pause/unpause
  setPaused(paused) {
    this.paused = paused;
  }

  // Main game loop
  gameLoop() {
    if (!this.running) return;

    // Calculate delta time
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    // Cap delta time to prevent physics issues
    const dt = Math.min(deltaTime, 0.1);

    // Update FPS counter
    this.updateFPS(dt);

    if (!this.paused) {
      // Update game
      this.update(dt);
    }

    // Render
    this.render();

    // Continue loop
    requestAnimationFrame(() => this.gameLoop());
  }

  // Update game state
  update(dt) {
    // Update playtime
    this.playtime += dt;

    // Auto-save
    if (this.saveManager.shouldAutoSave(dt)) {
      this.save();
    }

    // Manual save (F5 key)
    if (this.input.isPressed('F5')) {
      this.save();
    }

    // Load game (F9 key)
    if (this.input.isPressed('F9')) {
      this.load();
    }

    // Handle crafting panel toggle
    if (this.input.isPressed('c') || this.input.isPressed('C')) {
      this.craftingPanel.toggle();
    }

    // Handle equipment panel toggle
    if (this.input.isPressed('e') || this.input.isPressed('E')) {
      this.equipmentPanel.toggle();
    }

    // If crafting panel is open, handle clicks
    if (this.craftingPanel.visible && this.input.mouse.leftPressed) {
      this.craftingPanel.handleClick(this.input.mouse.pos);
    }

    // If equipment panel is open, handle clicks
    if (this.equipmentPanel.visible && this.input.mouse.leftPressed) {
      this.equipmentPanel.handleClick(this.input.mouse.pos, this.player.selectedSlot);
    }

    // Update player (pass camera for mining/building and entities for combat)
    // Don't update if any UI panel is open
    if (!this.craftingPanel.visible && !this.equipmentPanel.visible) {
      this.player.update(dt, this.world, this.input, this.camera, this.entities);
    }

    // Update all entities (enemies, projectiles)
    for (const entity of this.entities) {
      if (entity !== this.player && entity.update) {
        entity.update(dt, this.world, this.entities);
      }
    }

    // Render projectiles with camera
    for (const entity of this.entities) {
      if (entity.isProjectile && entity.render) {
        entity.render(this.renderer.ctx, this.camera);
      }
    }

    // Update damage numbers
    this.damageNumbers = this.damageNumbers.filter(dn => dn.update(dt));

    // Update enemy spawner (don't spawn during boss fight)
    const bossActive = this.entities.some(e => e.isBoss && e.alive);
    if (!bossActive) {
      this.enemySpawner.update(dt, this.entities, this.player);
    }

    // Handle boss summoning
    if (this.player.summonBoss) {
      this.summonBoss(this.player.summonBoss);
      this.player.summonBoss = null;
    }

    // Update boss health bar
    const activeBoss = this.entities.find(e => e.isBoss && e.alive);
    if (activeBoss) {
      this.bossHealthBar.setBoss(activeBoss);
    } else {
      this.bossHealthBar.setBoss(null);
    }
    this.bossHealthBar.update(dt);

    // Update physics
    this.physics.update(this.entities, dt);

    // Handle combat
    this.updateCombat(dt);

    // Remove dead entities
    this.entities = this.entities.filter(e => e.alive);

    // Update camera
    this.camera.update(dt);

    // Update world (for liquids, falling blocks, etc. - Phase 5)
    this.world.update(dt);

    // Clear input states (must be at end of update)
    this.input.update();
  }

  // Handle combat interactions
  updateCombat(dt) {
    // Player weapon vs enemies
    if (this.player.weapon && this.player.weapon.isSwinging()) {
      for (const entity of this.entities) {
        if (entity === this.player) continue;
        if (!entity.isEnemy) continue;

        // Check if weapon can hit enemy
        if (this.player.weapon.canHit(entity)) {
          // Calculate damage with player's attack bonuses
          const damage = DamageSystem.calculateDamage(this.player, entity, this.player.weapon.damage);
          entity.takeDamage(damage);

          // Spawn damage number
          this.spawnDamageNumber(entity.pos.x, entity.pos.y - entity.size.y / 2, damage);

          // Apply knockback
          const dx = entity.pos.x - this.player.pos.x;
          const dy = entity.pos.y - this.player.pos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 0) {
            entity.vel.x += (dx / distance) * 200;
            entity.vel.y -= 100;
          }

          this.player.weapon.markHit(entity);
        }
      }
    }

    // Enemy contact damage vs player
    for (const entity of this.entities) {
      if (!entity.isEnemy) continue;

      // Check collision with player
      if (Collision.entityVsEntity(entity, this.player)) {
        if (entity.canDealContactDamage && entity.canDealContactDamage()) {
          // Calculate damage with player's defense
          const damage = DamageSystem.calculateDamage(entity, this.player, entity.damage);
          this.player.takeDamage(damage);

          // Spawn damage number
          this.spawnDamageNumber(this.player.pos.x, this.player.pos.y - this.player.size.y / 2, damage);

          // Apply knockback to player
          const dx = this.player.pos.x - entity.pos.x;
          const dy = this.player.pos.y - entity.pos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 0) {
            this.player.vel.x += (dx / distance) * 200;
            this.player.vel.y -= 100;
          }

          entity.resetContactDamage();
        }
      }
    }
  }

  // Spawn a damage number
  spawnDamageNumber(x, y, damage) {
    const damageNumber = new DamageNumber(x, y, damage);
    this.damageNumbers.push(damageNumber);
  }

  // Render game
  render() {
    this.renderer.render(this.world, this.entities, this.uiElements);

    // Render damage numbers
    for (const dn of this.damageNumbers) {
      dn.render(this.renderer.ctx, this.camera);
    }

    // Debug info
    this.renderDebugInfo();
  }

  // Render debug information
  renderDebugInfo() {
    const ctx = this.renderer.ctx;

    // FPS in top left
    this.renderer.drawFPS(this.fps);

    // Put other debug info in right column to avoid health bar overlap
    const rightX = this.renderer.canvas.width - 200;
    let y = 10;

    // Player position
    const playerTileX = Math.floor(this.player.pos.x / TILE_SIZE);
    const playerTileY = Math.floor(this.player.pos.y / TILE_SIZE);
    this.renderer.drawText(
      `Pos: ${playerTileX}, ${playerTileY}`,
      rightX,
      y,
      '#FFFFFF',
      12
    );
    y += 18;

    // Playtime
    const minutes = Math.floor(this.playtime / 60);
    const seconds = Math.floor(this.playtime % 60);
    this.renderer.drawText(
      `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`,
      rightX,
      y,
      '#FFFF00',
      12
    );
    y += 18;

    // Enemy count
    const enemyCount = this.entities.filter(e => e.isEnemy).length;
    this.renderer.drawText(
      `Enemies: ${enemyCount}`,
      rightX,
      y,
      '#FF0000',
      12
    );
    y += 18;

    // Defense
    this.renderer.drawText(
      `Defense: ${this.player.stats.defense}`,
      rightX,
      y,
      '#00FFFF',
      12
    );
    y += 18;

    // Chunks loaded
    this.renderer.drawText(
      `Chunks: ${this.world.chunks.size}`,
      rightX,
      y,
      '#FFFFFF',
      12
    );
    y += 18;

    // Seed (bottom right)
    this.renderer.drawText(
      `Seed: ${this.world.seed}`,
      rightX,
      y,
      '#AAAAAA',
      10
    );

    // Save indicator (top right)
    if (this.saveManager.lastAutoSave < 2) {
      this.renderer.drawText(
        'SAVED!',
        this.renderer.canvas.width - 80,
        30,
        '#00FF00',
        18
      );
    }
  }

  // Update FPS counter
  updateFPS(dt) {
    this.frameCount++;
    this.fpsTimer += dt;

    if (this.fpsTimer >= 1.0) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer = 0;
    }
  }

  // Handle window resize
  resize(width, height) {
    this.renderer.resize(width, height);
  }

  // Save game
  save() {
    const saveData = {
      timestamp: Date.now(),
      playtime: this.playtime,
      seed: this.world.seed,
      world: WorldSerializer.serialize(this.world),
      player: PlayerSerializer.serialize(this.player)
    };

    const success = this.saveManager.save(saveData);
    if (success) {
      console.log('Game saved!');
    }
    return success;
  }

  // Load game
  load() {
    const saveData = this.saveManager.load();
    if (!saveData) {
      console.log('No save data to load');
      return false;
    }

    // Restore world
    WorldSerializer.deserialize(saveData.world, this.world, this.generator);

    // Restore player
    PlayerSerializer.deserialize(saveData.player, this.player, ItemDatabase);

    // Restore playtime
    this.playtime = saveData.playtime || 0;

    // Update camera to player position
    this.camera.follow(this.player);
    this.camera.snapToTarget();

    console.log('Game loaded!');
    return true;
  }

  // Check if save exists
  hasSave() {
    return this.saveManager.hasSave();
  }

  // Delete save
  deleteSave() {
    return this.saveManager.deleteSave();
  }

  // Summon a boss
  summonBoss(bossType) {
    // Spawn boss near player
    const spawnX = this.player.pos.x + 200;
    const spawnY = this.player.pos.y - 100;

    let boss = null;

    if (bossType === 'eye_of_terror') {
      boss = new EyeOfTerror(spawnX, spawnY);
    }

    if (boss) {
      this.entities.push(boss);
      console.log(`${boss.name} has awoken!`);
    }
  }
}
