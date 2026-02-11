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
import { InventoryScreen } from './ui/InventoryScreen.js';
import { ChestInventoryUI } from './ui/ChestInventoryUI.js';
import { BossHealthBar } from './ui/BossHealthBar.js';
import { MainMenu } from './ui/MainMenu.js';
import { DeathScreen } from './ui/DeathScreen.js';
import { PauseMenu } from './ui/PauseMenu.js';
import { SettingsMenu } from './ui/SettingsMenu.js';
import { LoadingScreen } from './ui/LoadingScreen.js';
import { EyeOfTerror } from './entities/bosses/EyeOfTerror.js';
import { DamageNumber } from './effects/DamageNumber.js';
import { ParticleSystem } from './effects/ParticleSystem.js';
import { audioManager } from './audio/AudioManager.js';
import { EnemySpawner } from './entities/EnemySpawner.js';
import { DamageSystem } from './combat/DamageSystem.js';
import { Collision } from './physics/Collision.js';
import { SaveManager } from './save/SaveManager.js';
import { WorldSerializer } from './save/WorldSerializer.js';
import { PlayerSerializer } from './save/PlayerSerializer.js';
import { ItemDatabase } from './items/ItemDatabase.js';
import { SURFACE_LEVEL, TILE_SIZE } from './utils/Constants.js';

// Game states
const GameState = {
  LOADING: 'loading',
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  SETTINGS: 'settings',
  DEAD: 'dead'
};

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.running = false;
    this.paused = false;

    // Game state
    this.state = GameState.LOADING;
    this.lastKilledBy = '';
    this.currentWorldName = '';

    // Core systems
    this.renderer = new Renderer(canvas);
    this.input = new InputManager(canvas);

    // Save system (initialize early to check for saves)
    this.saveManager = new SaveManager();

    // Menu screens
    this.loadingScreen = new LoadingScreen();
    this.mainMenu = new MainMenu();
    this.mainMenu.visible = false; // Hidden until loaded
    this.deathScreen = new DeathScreen();
    this.pauseMenu = new PauseMenu();
    this.settingsMenu = new SettingsMenu();
    this.refreshSavesList();

    // World (will be initialized when starting game)
    this.generator = null;
    this.world = null;

    // Camera
    this.camera = new Camera({
      width: canvas.width,
      height: canvas.height
    });
    this.renderer.setCamera(this.camera);

    // Player
    this.player = null;

    // Physics
    this.physics = null;

    // Entities
    this.entities = [];

    // Enemy spawning
    this.enemySpawner = null;

    // Visual effects
    this.damageNumbers = [];
    this.particleSystem = new ParticleSystem();

    // UI elements (will be initialized when starting game)
    this.hotbar = null;
    this.craftingPanel = null;
    this.equipmentPanel = null;
    this.inventoryScreen = null;
    this.healthBar = null;
    this.bossHealthBar = null;
    this.uiElements = [];

    // FPS tracking
    this.fps = 60;
    this.frameCount = 0;
    this.fpsTimer = 0;

    // Time tracking
    this.lastTime = performance.now();

    // Playtime
    this.playtime = 0;

    // Setup input handlers for menus
    this.setupMenuInput();
  }

  // Refresh saves list for main menu
  refreshSavesList() {
    const saves = this.saveManager.getAllSaves();
    // Sort by timestamp, most recent first
    saves.sort((a, b) => b.timestamp - a.timestamp);
    this.mainMenu.setSaves(saves);
  }

  // Setup input handlers for menu navigation
  setupMenuInput() {
    // Handle keyboard input for menus
    window.addEventListener('keydown', (e) => {
      if (this.state === GameState.MENU) {
        const action = this.mainMenu.handleInput(e.key);
        if (action) this.handleMenuAction(action);
      } else if (this.state === GameState.PAUSED) {
        const action = this.pauseMenu.handleInput(e.key);
        if (action) this.handlePauseAction(action);
      } else if (this.state === GameState.SETTINGS) {
        const result = this.settingsMenu.handleInput(e.key);
        if (result) this.handleSettingsAction(result);
      } else if (this.state === GameState.DEAD) {
        const action = this.deathScreen.handleInput(e.key);
        if (action) this.handleDeathAction(action);
      } else if (this.state === GameState.PLAYING) {
        // Escape - close UI panels first, then pause
        if (e.key === 'Escape') {
          if (this.craftingPanel && this.craftingPanel.visible) {
            this.craftingPanel.hide();
          } else if (this.inventoryScreen && this.inventoryScreen.visible) {
            this.inventoryScreen.hide();
          } else if (this.chestInventoryUI && this.chestInventoryUI.visible) {
            this.chestInventoryUI.hide();
          } else {
            this.pauseGame();
          }
        }
      }
    });

    // Handle mouse clicks for menus
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mousePos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      console.log('Canvas click detected at:', mousePos.x, mousePos.y, 'State:', this.state);

      if (this.state === GameState.MENU) {
        console.log('Passing click to mainMenu, screen:', this.mainMenu.screen);
        const action = this.mainMenu.handleClick(mousePos, this.canvas.width, this.canvas.height);
        console.log('mainMenu returned action:', action);
        if (action) this.handleMenuAction(action);
      } else if (this.state === GameState.PAUSED) {
        const action = this.pauseMenu.handleClick(mousePos, this.canvas.width, this.canvas.height);
        if (action) this.handlePauseAction(action);
      } else if (this.state === GameState.SETTINGS) {
        const result = this.settingsMenu.handleClick(mousePos, this.canvas.width, this.canvas.height);
        if (result) this.handleSettingsAction(result);
      } else if (this.state === GameState.DEAD) {
        const action = this.deathScreen.handleClick(mousePos, this.canvas.width, this.canvas.height);
        if (action) this.handleDeathAction(action);
      }
    });
  }

  // Pause the game
  pauseGame() {
    this.pauseMenu.show();
    this.state = GameState.PAUSED;
  }

  // Resume the game
  resumeGame() {
    this.pauseMenu.hide();
    this.state = GameState.PLAYING;
  }

  // Handle pause menu actions
  handlePauseAction(action) {
    if (action === 'continue') {
      this.resumeGame();
    } else if (action === 'save') {
      this.save();
      // Show save confirmation briefly then stay in pause
    } else if (action === 'settings') {
      this.openSettings();
    } else if (action === 'menu') {
      this.save(); // Auto-save before returning
      this.pauseMenu.hide();
      this.returnToMenu();
    }
  }

  // Open settings menu
  openSettings() {
    this.pauseMenu.hide();
    this.settingsMenu.show();
    this.state = GameState.SETTINGS;
  }

  // Handle settings actions
  handleSettingsAction(result) {
    if (result.action === 'back') {
      this.settingsMenu.hide();
      
      // Return to appropriate screen based on game state
      if (this.world) {
        this.pauseMenu.show();
        this.state = GameState.PAUSED;
      } else {
        this.mainMenu.visible = true;
        this.state = GameState.MENU;
      }
    } else if (result.action === 'saveAndExit') {
      // Save game and return to main menu
      this.save();
      this.settingsMenu.hide();
      this.returnToMenu();
    } else if (result.action === 'update') {
      // Apply setting immediately
      this.applySetting(result.setting, result.value);
    }
  }

  // Apply a setting change
  applySetting(id, value) {
    console.log(`Setting ${id} changed to ${value}`);
    
    if (id === 'zoom') {
      // Update camera zoom
      if (this.camera) {
        this.camera.setZoom(value);
      }
    } else if (id === 'showDebug') {
      // Toggle debug info (handled in renderDebugInfo, assumes it checks global or game prop)
      // For now, we can update a global or local prop.
      // Game.js constants are usually readonly imports.
      // Let's attach debug flag to game instance for now, or assume constants.
      // For this simplified version, let's just log it.
    }
    // Volume settings would hook into an AudioSystem here
  }

  // Handle main menu actions
  handleMenuAction(action) {
    console.log('handleMenuAction called with:', action);
    if (!action) return;

    // Handle object-style actions
    if (typeof action === 'object') {
      if (action.action === 'createWorld') {
        console.log('Creating new world:', action.name);
        this.startNewGame(action.name);
      } else if (action.action === 'loadSave') {
        console.log('Loading save:', action.saveId);
        this.loadGameById(action.saveId);
      } else if (action.action === 'deleteSave') {
        console.log('Deleting save:', action.saveId);
        this.deleteSaveById(action.saveId);
      } else if (action.action === 'openSettings') {
        this.mainMenu.visible = false;
        this.settingsMenu.show();
        this.state = GameState.SETTINGS;
      }
      return;
    }

    // Legacy string actions
    if (action === 'new') {
      this.startNewGame();
    } else if (action === 'load') {
      this.loadGame();
    }
  }

  // Delete a save by ID
  deleteSaveById(saveId) {
    this.saveManager.deleteSave(saveId);
    this.refreshSavesList();
    // Reset selection if needed
    if (this.mainMenu.selectedSaveIndex >= this.mainMenu.saves.length) {
      this.mainMenu.selectedSaveIndex = Math.max(0, this.mainMenu.saves.length - 1);
    }
    this.mainMenu.confirmDelete = null;
  }

  // Handle death screen actions
  handleDeathAction(action) {
    if (action === 'respawn') {
      this.respawnPlayer();
    } else if (action === 'menu') {
      this.returnToMenu();
    }
  }

  // Start a new game
  async startNewGame(worldName = null) {
    console.log('startNewGame called with worldName:', worldName);
    try {
      // Initialize audio on first game start (requires user interaction)
      if (!audioManager.initialized) {
        await audioManager.init();
      }

      const seed = Date.now();
      console.log('Initializing world with seed:', seed);
      this.initializeWorld(seed);
      this.currentWorldName = worldName || 'World ' + (this.saveManager.getAllSaves().length + 1);
      this.saveManager.clearCurrentSave(); // Start fresh, no current save
      this.state = GameState.PLAYING;
      this.mainMenu.visible = false;
      this.mainMenu.screen = 'main'; // Reset menu screen
      console.log('Game started successfully! State:', this.state);
    } catch (error) {
      console.error('Failed to start new game:', error);
      console.error('Stack trace:', error.stack);
    }
  }

  // Load existing game (most recent)
  loadGame() {
    const saveData = this.saveManager.load();
    if (!saveData) {
      console.log('No save data to load');
      return;
    }

    this.loadFromSaveData(saveData);
  }

  // Load a specific save by ID
  loadGameById(saveId) {
    const saveData = this.saveManager.loadSave(saveId);
    if (!saveData) {
      console.log('Save not found:', saveId);
      return;
    }

    // Get save name
    const metadata = this.saveManager.getSaveMetadata(saveId);
    this.currentWorldName = metadata ? metadata.name : 'Unknown World';

    this.loadFromSaveData(saveData);
  }

  // Load from save data object
  loadFromSaveData(saveData) {
    // Initialize world with saved seed
    this.initializeWorld(saveData.seed);

    // Restore world data
    WorldSerializer.deserialize(saveData.world, this.world, this.generator);

    // Restore player
    PlayerSerializer.deserialize(saveData.player, this.player, ItemDatabase);

    // Restore playtime
    this.playtime = saveData.playtime || 0;

    // Update camera to player position
    this.camera.follow(this.player);
    this.camera.snapToTarget();

    this.state = GameState.PLAYING;
    this.mainMenu.visible = false;
    this.mainMenu.screen = 'main'; // Reset menu screen
    console.log('Game loaded!');
  }

  // Initialize world and all game systems
  initializeWorld(seed) {
    try {
      console.log('initializeWorld starting with seed:', seed);
      this.generator = new WorldGenerator(seed);
      console.log('WorldGenerator created');
      this.world = new World(this.generator);
      console.log('World created');

      // Player - spawn at surface
      const spawnX = 0 * TILE_SIZE + TILE_SIZE / 2;
      const surfaceY = this.generator.getTerrainHeight(0);
      const spawnY = (surfaceY - 2) * TILE_SIZE;
      console.log('Spawn position:', spawnX, spawnY);
      this.player = new Player(spawnX, spawnY);
      console.log('Player created');

      // Set camera to follow player
      this.camera.follow(this.player);
      this.camera.snapToTarget();
      console.log('Camera configured');

      // Physics
      this.physics = new PhysicsSystem(this.world);
      console.log('Physics system created');

      // Entities
      this.entities = [this.player];

      // Enemy spawning
      this.enemySpawner = new EnemySpawner(this.world);
      console.log('Enemy spawner created');

      // Visual effects
      this.damageNumbers = [];

      // UI elements
      console.log('Creating UI elements...');
      this.hotbar = new Hotbar(this.player.inventory, this.player, this.renderer.textureGen);
      this.craftingPanel = new CraftingPanel(this.player.craftingSystem, this.player.inventory, this.renderer.textureGen);
      this.equipmentPanel = new EquipmentPanel(this.player.equipment, this.player.inventory, this.player, this.renderer.textureGen);
      this.inventoryScreen = new InventoryScreen(this.player, this.renderer.textureGen);
      this.chestInventoryUI = new ChestInventoryUI(this.player, this.renderer.textureGen);
      console.log('UI elements created');
      this.healthBar = new HealthBar(10, 10, 200, 20, this.player);
      this.bossHealthBar = new BossHealthBar();
      this.uiElements = [this.hotbar, this.craftingPanel, this.healthBar, this.bossHealthBar, this.chestInventoryUI];

      // Reset playtime for new games
      this.playtime = 0;
      console.log('initializeWorld completed successfully');
    } catch (error) {
      console.error('Error in initializeWorld:', error);
      console.error('Stack trace:', error.stack);
      throw error;
    }
  }

  // Respawn player after death
  respawnPlayer() {
    // Respawn at surface
    const spawnX = 0 * TILE_SIZE + TILE_SIZE / 2;
    const surfaceY = this.generator.getTerrainHeight(0);
    const spawnY = (surfaceY - 2) * TILE_SIZE;

    this.player.pos.x = spawnX;
    this.player.pos.y = spawnY;
    this.player.vel.x = 0;
    this.player.vel.y = 0;
    this.player.health = this.player.maxHealth;
    this.player.alive = true;

    // Clear nearby enemies
    this.entities = this.entities.filter(e => e === this.player || !e.isEnemy);

    // Snap camera
    this.camera.snapToTarget();

    // Hide death screen and resume
    this.deathScreen.hide();
    this.state = GameState.PLAYING;
  }

  // Return to main menu
  returnToMenu() {
    this.deathScreen.hide();
    this.pauseMenu.hide();
    this.mainMenu.visible = true;
    this.mainMenu.screen = 'main'; // Reset to main screen
    this.refreshSavesList();
    this.saveManager.clearCurrentSave();
    this.state = GameState.MENU;

    // Clear game state
    this.world = null;
    this.player = null;
    this.entities = [];
    this.currentWorldName = '';
  }

  // Called when player dies
  onPlayerDeath(killedBy = '') {
    this.lastKilledBy = killedBy;
    this.deathScreen.show(killedBy);
    this.state = GameState.DEAD;
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

    // Handle different game states
    switch (this.state) {
      case GameState.LOADING:
        this.loadingScreen.update(dt);
        this.renderLoadingScreen();
        if (this.loadingScreen.finished) {
          this.state = GameState.MENU;
          this.mainMenu.visible = true;
        }
        break;

      case GameState.MENU:
        this.mainMenu.update(dt);
        this.renderMenu();
        break;

      case GameState.PLAYING:
        if (!this.paused) {
          this.update(dt);
        }
        this.render();
        break;

      case GameState.PAUSED:
        this.pauseMenu.update(dt);
        this.render(); // Render game in background
        this.renderPauseMenu();
        break;

      case GameState.SETTINGS:
        this.settingsMenu.update(dt);
        if (this.world) {
          this.render(); // Render game in background
        } else {
          // Render main menu background if not in game
          this.renderMenu();
        }
        this.renderSettingsMenu();
        break;

      case GameState.DEAD:
        this.deathScreen.update(dt);
        this.render(); // Render game in background
        this.renderDeathScreen();
        break;
    }

    // Continue loop
    requestAnimationFrame(() => this.gameLoop());
  }

  // Render main menu
  renderMenu() {
    const ctx = this.renderer.ctx;
    this.mainMenu.render(ctx);
  }

  // Render loading screen
  renderLoadingScreen() {
    const ctx = this.renderer.ctx;
    this.loadingScreen.render(ctx);
  }

  // Render pause menu overlay
  renderPauseMenu() {
    const ctx = this.renderer.ctx;
    this.pauseMenu.render(ctx, this.input.mouse.pos);

    // Show current world name and save indicator
    ctx.textAlign = 'center';
    ctx.font = '14px monospace';
    ctx.fillStyle = '#888888';
    ctx.fillText(this.currentWorldName || 'Unnamed World', this.canvas.width / 2, 60);

    // Show save success indicator
    if (this.saveManager.lastAutoSave < 2) {
      ctx.fillStyle = '#00FF00';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('Game Saved!', this.canvas.width / 2, this.canvas.height - 70);
    }
  }

  // Render settings menu overlay
  renderSettingsMenu() {
    const ctx = this.renderer.ctx;
    this.settingsMenu.render(ctx);
  }

  // Render death screen overlay
  renderDeathScreen() {
    const ctx = this.renderer.ctx;
    this.deathScreen.render(ctx);
  }

  // Update game state
  update(dt) {
    // Only update if game is initialized
    if (!this.world || !this.player) return;

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
      if (this.inventoryScreen && this.inventoryScreen.visible) {
        this.inventoryScreen.hide();
      }
      this.craftingPanel.toggle();
    }

    // Handle inventory screen toggle (E or I key)
    if (this.input.isPressed('e') || this.input.isPressed('E') ||
        this.input.isPressed('i') || this.input.isPressed('I')) {
      // Close other panels first
      if (this.craftingPanel.visible) {
        this.craftingPanel.hide();
      }
      if (this.chestInventoryUI && this.chestInventoryUI.visible) {
        this.chestInventoryUI.hide();
      }
      // Toggle inventory
      if (this.inventoryScreen) {
        this.inventoryScreen.toggle();
      }
    }

    // Update inventory screen
    if (this.inventoryScreen && this.inventoryScreen.visible) {
      this.inventoryScreen.update(1/60);
    }

    // If crafting panel is open, handle clicks and scroll
    if (this.craftingPanel.visible) {
      if (this.input.mouse.leftPressed) {
        this.craftingPanel.handleClick(this.input.mouse.pos);
      }
      if (this.input.mouse.scrollDelta !== 0) {
        this.craftingPanel.handleScroll(this.input.mouse.scrollDelta);
      }
    }

    // Handle Main Menu Scroll
    if (this.state === GameState.MENU && this.input.mouse.scrollDelta !== 0) {
      this.mainMenu.handleScroll(this.input.mouse.scrollDelta);
    }

    // If inventory screen is open, handle clicks
    if (this.inventoryScreen && this.inventoryScreen.visible && this.input.mouse.leftPressed) {
      this.inventoryScreen.handleClick(this.input.mouse.pos, this.canvas.width, this.canvas.height);
    }

    // If chest UI is open, handle clicks
    if (this.chestInventoryUI && this.chestInventoryUI.visible && this.input.mouse.leftPressed) {
      this.chestInventoryUI.handleClick(this.input.mouse.pos, this.canvas.width, this.canvas.height);
    }

    // Handle Settings Dragging (Sliders)
    if (this.state === GameState.SETTINGS) {
        if (this.input.mouse.left) {
            const result = this.settingsMenu.handleDrag(this.input.mouse.pos, this.canvas.width, this.canvas.height);
            if (result) this.handleSettingsAction(result);
        } else {
            this.settingsMenu.stopDrag();
        }
    }

    // Check if any UI is blocking gameplay
    const uiBlocking = this.craftingPanel.visible || 
                      (this.inventoryScreen && this.inventoryScreen.visible) ||
                      (this.chestInventoryUI && this.chestInventoryUI.visible);

    // Always update nearby workstations and chests for UI prompts, even when UI is open
    if (this.player && this.world) {
      this.player.updateNearbyWorkstations(this.world);
      this.player.updateNearbyChest(this.world);
    }

    // Handle F key for chest interaction (works even when other UI might be open)
    if (this.input.isPressed('f') || this.input.isPressed('F')) {
      // If chest UI is open, close it
      if (this.chestInventoryUI && this.chestInventoryUI.visible) {
        this.chestInventoryUI.hide();
      }
      // If near a chest and no blocking UI, open it
      else if (this.player.nearbyChest && !this.craftingPanel.visible &&
               !(this.inventoryScreen && this.inventoryScreen.visible)) {
        const items = this.world.getContainerItems(this.player.nearbyChest.x, this.player.nearbyChest.y);
        this.chestInventoryUI.show(items, { x: this.player.nearbyChest.x, y: this.player.nearbyChest.y });
        // Hide other panels
        if (this.craftingPanel.visible) this.craftingPanel.hide();
      }
    }

    // Update player (pass camera for mining/building and entities for combat)
    // Don't update if any UI panel is open
    if (!uiBlocking) {
      this.player.update(dt, this.world, this.input, this.camera, this.entities);
    }

    // Handle block destruction effects
    if (this.player.lastDestroyedBlock) {
      const block = this.player.lastDestroyedBlock;
      const worldX = block.x * TILE_SIZE + TILE_SIZE / 2;
      const worldY = block.y * TILE_SIZE + TILE_SIZE / 2;

      // Get block color for particles
      const TILE_COLORS = {
        1: '#4CAF50', // GRASS
        2: '#8B4513', // DIRT
        3: '#808080', // STONE
        4: '#C2B280', // SAND
        5: '#5C4033', // WOOD
        6: '#228B22', // LEAVES
        7: '#87CEEB', // GLASS
        8: '#A0A0A0', // IRON_ORE
        9: '#FFD700', // GOLD_ORE
        10: '#00FFFF', // DIAMOND_ORE
        11: '#2F2F2F', // COAL_ORE
        12: '#D2691E', // COPPER_ORE
        13: '#B8860B', // WORKBENCH
        14: '#696969', // FURNACE
        15: '#FFFAFA', // SNOW
        16: '#3CB371', // CACTUS
        17: '#F5F5DC', // CLOUD
        18: '#5C3317', // LOG
        19: '#8B4513' // CHEST
      };
      const blockColor = TILE_COLORS[block.tileType] || '#808080';

      // Trigger particle effects
      if (this.particleSystem) {
        this.particleSystem.blockBreak(worldX, worldY, blockColor);
      }

      // Small screen shake for block break
      this.camera.shake(3, 0.1);

      // Block break sound
      audioManager.play('break', 0.5, 0.9 + Math.random() * 0.2);

      // Clear the event
      this.player.lastDestroyedBlock = null;
    }

    // Handle player jump effects
    if (this.player.justJumped) {
      this.player.justJumped = false;

      // Jump particles
      if (this.particleSystem) {
        const footX = this.player.pos.x + this.player.size.x / 2;
        const footY = this.player.pos.y + this.player.size.y;
        this.particleSystem.jumpDust(footX, footY);
      }

      // Jump sound
      audioManager.play('jump', 0.4);
    }

    // Check for player interactions (e.g. opening chests via right-click)
    if (this.player.interactionRequest) {
      const request = this.player.interactionRequest;
      if (request.type === 'CHEST') {
        const items = this.world.getContainerItems(request.x, request.y);
        this.chestInventoryUI.show(items, { x: request.x, y: request.y });
        // Hide other panels
        if (this.craftingPanel.visible) this.craftingPanel.hide();
      }
      this.player.interactionRequest = null; // Clear request
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

    // Update particle system
    if (this.particleSystem) {
      this.particleSystem.update(dt);
    }

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

    // Check for player death
    if (this.player && !this.player.alive) {
      this.onPlayerDeath(this.lastKilledBy);
      return;
    }

    // Process dead enemies before removal (for death effects)
    for (const entity of this.entities) {
      if (entity !== this.player && entity.isEnemy && !entity.alive && !entity.deathProcessed) {
        entity.deathProcessed = true;

        // Death particle effects
        if (this.particleSystem) {
          const cx = entity.pos.x + entity.size.x / 2;
          const cy = entity.pos.y + entity.size.y / 2;

          if (entity.entityType === 'slime') {
            this.particleSystem.slimeDeath(cx, cy, entity.color || '#00FF00');
          } else if (entity.entityType === 'bat') {
            this.particleSystem.bloodSplatter(cx, cy, Math.PI / 2, 0.5);
            this.particleSystem.dustCloud(cx, cy, '#4A0080');
          } else if (entity.entityType === 'skeleton') {
            this.particleSystem.blockBreak(cx, cy, '#E8E8E8'); // Bone fragments
          } else if (entity.entityType === 'demon') {
            this.particleSystem.explosion(cx, cy, '#FF4500', 0.8);
            this.particleSystem.bloodSplatter(cx, cy, Math.PI, 1.5);
          } else {
            // Default blood effect for zombies and others
            this.particleSystem.bloodSplatter(cx, cy, Math.PI, 1);
          }
        }

        // Screen shake for enemy deaths
        this.camera.shake(5, 0.15);

        // Death sound
        if (entity.entityType === 'slime') {
          audioManager.play('slime', 0.8);
        } else {
          audioManager.play('enemy_death', 0.7);
        }
      }
    }

    // Remove dead entities (but keep player in list even if dead)
    this.entities = this.entities.filter(e => e === this.player || e.alive);

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

          // Hit feedback effects
          const hitX = entity.pos.x + entity.size.x / 2;
          const hitY = entity.pos.y + entity.size.y / 2;
          const hitDirection = Math.atan2(entity.pos.y - this.player.pos.y, entity.pos.x - this.player.pos.x);

          // Screen shake based on damage
          const shakeIntensity = Math.min(8, 2 + damage / 10);
          this.camera.shake(shakeIntensity, 0.15);

          // Hit sound
          audioManager.play('hit', 0.6, 0.9 + Math.random() * 0.2);

          // Particle effects
          if (this.particleSystem) {
            this.particleSystem.hitSparks(hitX, hitY, hitDirection);
            // Blood for non-slime enemies
            if (entity.entityType !== 'slime') {
              this.particleSystem.bloodSplatter(hitX, hitY, hitDirection, damage / 20);
            } else {
              // Slime goo
              this.particleSystem.slimeDeath(hitX, hitY, entity.color || '#00AA00');
            }
          }

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

          // Track what killed the player
          this.lastKilledBy = entity.name || entity.entityType || 'Unknown Enemy';

          // Spawn damage number
          this.spawnDamageNumber(this.player.pos.x, this.player.pos.y - this.player.size.y / 2, damage);

          // Hit feedback effects
          const hitX = this.player.pos.x + this.player.size.x / 2;
          const hitY = this.player.pos.y + this.player.size.y / 2;

          // Screen shake - stronger when player is hit
          const shakeIntensity = Math.min(12, 4 + damage / 5);
          this.camera.shake(shakeIntensity, 0.2);

          // Hurt sound
          audioManager.play('hurt', 0.8);

          // Blood particle effects
          if (this.particleSystem) {
            const hitDirection = Math.atan2(this.player.pos.y - entity.pos.y, this.player.pos.x - entity.pos.x);
            this.particleSystem.bloodSplatter(hitX, hitY, hitDirection, damage / 15);
          }

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
    // Only render if game is initialized
    if (!this.world || !this.player) return;

    this.renderer.render(this.world, this.entities, this.uiElements);

    // Render damage numbers
    for (const dn of this.damageNumbers) {
      dn.render(this.renderer.ctx, this.camera);
    }

    // Render particles
    if (this.particleSystem) {
      this.particleSystem.render(this.renderer.ctx, this.camera);
    }

    // Debug info
    this.renderDebugInfo();

    // Render inventory screen on top
    if (this.inventoryScreen && this.inventoryScreen.visible) {
      this.inventoryScreen.render(this.renderer.ctx, this.input.mouse.pos);
    }
    
    // Render chest UI on top
    if (this.chestInventoryUI && this.chestInventoryUI.visible) {
      this.chestInventoryUI.render(this.renderer.ctx, this.input.mouse.pos);
    }
  }

  // Render debug information
  renderDebugInfo() {
    if (!this.player) return;

    const ctx = this.renderer.ctx;

    // FPS in top left
    this.renderer.drawFPS(this.fps);

    // Show tile at cursor position (bottom left)
    if (this.world && this.camera) {
      const mousePos = this.input.mouse.pos;
      const worldPos = this.camera.screenToWorld(mousePos);
      const tilePos = this.world.pixelToTile(worldPos.x, worldPos.y);
      const tile = this.world.getTile(tilePos.x, tilePos.y);
      const tileType = tile ? tile.type : 'none';
      this.renderer.drawText(
        `Cursor: ${tilePos.x}, ${tilePos.y} Type: ${tileType}`,
        10,
        this.canvas.height - 20,
        '#FFFF00',
        12
      );
    }

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

    // World name
    if (this.currentWorldName) {
      this.renderer.drawText(
        this.currentWorldName,
        rightX,
        y,
        '#00ff88',
        12
      );
      y += 18;
    }

    // Seed
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
    if (!this.world || !this.player) {
      console.log('No game to save');
      return false;
    }

    const saveData = {
      timestamp: Date.now(),
      playtime: this.playtime,
      seed: this.world.seed,
      world: WorldSerializer.serialize(this.world),
      player: PlayerSerializer.serialize(this.player)
    };

    const saveId = this.saveManager.save(saveData, this.currentWorldName);
    if (saveId) {
      console.log('Game saved!');
      this.refreshSavesList();
    }
    return !!saveId;
  }

  // Load game (during gameplay, F9)
  load() {
    if (this.state !== GameState.PLAYING) {
      return false;
    }

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
