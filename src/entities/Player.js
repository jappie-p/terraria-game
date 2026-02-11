// Player - Player entity with movement and controls
import { Entity } from './Entity.js';
import { PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_SPEED, PLAYER_JUMP_FORCE, PLAYER_MAX_HEALTH, TILE_SIZE, TILE_PROPS, TILE } from '../utils/Constants.js';
import { Inventory } from '../items/Inventory.js';
import { ItemDatabase } from '../items/ItemDatabase.js';
import { CraftingSystem } from '../crafting/CraftingSystem.js';
import { RecipeDatabase } from '../crafting/RecipeDatabase.js';
import { Weapon } from '../combat/Weapon.js';
import { Equipment } from '../items/Equipment.js';
import { Projectile } from '../combat/Projectile.js';

export class Player extends Entity {
  constructor(x, y) {
    super(x, y, PLAYER_WIDTH, PLAYER_HEIGHT);
    this.baseMaxHealth = PLAYER_MAX_HEALTH;
    this.maxHealth = PLAYER_MAX_HEALTH;
    this.health = PLAYER_MAX_HEALTH;
    this.color = '#e38ef0af'; // pink player
    this.isPlayer = true;
    this.facingLeft = false;

    // Player-specific properties
    this.baseMoveSpeed = PLAYER_SPEED;
    this.moveSpeed = PLAYER_SPEED;
    this.jumpForce = PLAYER_JUMP_FORCE;
    this.canJump = false;
    this.facing = 1; // 1 = right, -1 = left

    // Stats
    this.stats = {
      defense: 0,
      attackBonus: 0
    };

    // Inventory
    this.inventory = new Inventory(40); // 40 slots total
    this.selectedSlot = 0; // Hotbar selection (0-9)

    // Equipment
    this.equipment = new Equipment();

    // Crafting
    this.craftingSystem = new CraftingSystem();
    this.loadRecipes();

    // Mining
    this.reach = 5; // tiles
    this.miningTarget = null; // {x, y, progress, maxHealth}
    this.miningSpeed = 20; // Base damage per second
    this.miningSwing = 0; // Swing animation progress (0-1)
    this.miningSwingSpeed = 8; // Swings per second
    this.isMining = false;

    // Combat
    this.weapon = null; // Current weapon instance
    this.attackRange = 40; // Pixels
    this.summonBoss = null; // Boss to summon

    // Interaction
    this.nearbyChest = null; // {x, y} of nearby chest for interaction prompt
    this.interactionRequest = null; // Request to open chest UI

    // Give player a starting pickaxe and some resources for testing
    const startingPickaxe = ItemDatabase.getItem('stone_pickaxe');
    if (startingPickaxe) {
      this.inventory.addItem(startingPickaxe, 1);
    }

    // Give all materials for testing
    const materials = [
      { id: 'wood', count: 50 },
      { id: 'stone', count: 50 },
      { id: 'sand', count: 30 },
      { id: 'iron_ore', count: 50 },
      { id: 'gold_ore', count: 50 },
      { id: 'coal_ore', count: 50 },
      { id: 'diamond', count: 50 },
      { id: 'diamond_ore', count: 20 },
      { id: 'iron_bar', count: 50 },
      { id: 'gold_bar', count: 50 },
      { id: 'gel', count: 30 },
      { id: 'lens', count: 20 },
      { id: 'workbench', count: 5 },
      { id: 'furnace', count: 5 },
      { id: 'chest', count: 5 }
    ];

    for (const mat of materials) {
      const item = ItemDatabase.getItem(mat.id);
      if (item) {
        this.inventory.addItem(item, mat.count);
      }
    }

    // Give starting sword for testing combat
    const startingSword = ItemDatabase.getItem('wooden_sword');
    if (startingSword) {
      this.inventory.addItem(startingSword, 1);
    }

    // Give ranged weapons for testing
    const bow = ItemDatabase.getItem('wooden_bow');
    if (bow) {
      this.inventory.addItem(bow, 1);
    }

    // Give boss summoning item for testing
    const suspiciousEye = ItemDatabase.getItem('suspicious_eye');
    if (suspiciousEye) {
      this.inventory.addItem(suspiciousEye, 3);
    }
  }

  // Load all recipes
  loadRecipes() {
    const recipes = RecipeDatabase.getAllRecipes();
    for (const recipe of recipes) {
      this.craftingSystem.addRecipe(recipe);
    }
  }

  // Update player
  update(dt, world, input, camera, entities) {
    if (!input) return;

    // Check nearby workstations
    if (world) {
      this.updateNearbyWorkstations(world);
      this.updateNearbyChest(world);
    }

    // Check for F key to interact with chest
    if (input.isPressed('f') || input.isPressed('F')) {
      if (this.nearbyChest) {
        this.interactionRequest = {
          type: 'CHEST',
          x: this.nearbyChest.x,
          y: this.nearbyChest.y
        };
      }
    }

    // Horizontal movement
    let moveX = 0;

    if (input.isDown('a') || input.isDown('ArrowLeft')) {
      moveX -= 1;
      this.facing = -1;
      this.facingLeft = true;
    }
    if (input.isDown('d') || input.isDown('ArrowRight')) {
      moveX += 1;
      this.facing = 1;
      this.facingLeft = false;
    }

    // Apply movement
    this.vel.x = moveX * this.moveSpeed;

    // Jumping
    if ((input.isDown('w') || input.isDown('ArrowUp') || input.isDown(' ')) && this.canJump) {
      this.vel.y = -this.jumpForce;
      this.canJump = false;
      this.justJumped = true; // For Game.js to play effects
    }

    // Update ground state (set by PhysicsSystem)
    if (this.onGround) {
      this.canJump = true;
    }

    // Hotbar selection (number keys 1-9, 0)
    for (let i = 0; i < 10; i++) {
      const key = i === 9 ? '0' : String(i + 1);
      if (input.isPressed(key)) {
        this.selectedSlot = i;
        this.updateWeapon(); // Update equipped weapon when slot changes
      }
    }

    // Update current weapon
    this.updateWeapon();

    // Update weapon swing
    if (this.weapon) {
      this.weapon.update(dt);
    }

    // Left click - Attack or mine
    if (input.mouse.leftPressed && this.weapon && camera) {
      const selectedItem = this.inventory.getSlot(this.selectedSlot);

      // Check if ranged weapon
      if (selectedItem && selectedItem.item.isRanged) {
        // Shoot projectile
        this.shootProjectile(input, camera, entities);
      } else {
        // Melee attack
        this.weapon.swing();
      }
    } else if (input.mouse.left && camera) {
      // Mine if not using weapon
      if (!this.weapon || !this.weapon.isSwinging()) {
        this.updateMining(dt, world, input, camera);
      }
    } else {
      this.miningTarget = null;
      this.isMining = false;
    }

    // Placing blocks or using items (right click)
    if (input.mouse.rightPressed && camera) {
      const selectedItem = this.inventory.getSlot(this.selectedSlot);

      // Check for interaction first
      const interaction = this.handleInteraction(world, input, camera);
      if (interaction) {
        // Interaction handled (e.g. opened chest), interaction object might be useful for Game.js
        this.interactionRequest = interaction;
        return; // Don't place block if interacted
      }

      // Check if summoning item
      if (selectedItem && selectedItem.item.type === 'SUMMONING') {
        this.useSummoningItem(selectedItem, entities);
      } else {
        this.placeBlock(world, input, camera);
      }
    }
  }

  // Handle interaction with tiles (chests, etc.)
  handleInteraction(world, input, camera) {
    const target = this.getTargetTile(input, world, camera);
    if (!target) return null;

    const tile = world.getTile(target.x, target.y);
    if (!tile) return null;

    // Check for chest
    if (tile.type === TILE.CHEST) {
      return {
        type: 'CHEST',
        x: target.x,
        y: target.y
      };
    }

    return null;
  }

  // Get tile player is looking at (for mining/placing)
  getTargetTile(input, world, camera) {
    if (!input || !input.mouse) return null;

    // Convert mouse screen position to world position
    const worldPos = camera.screenToWorld(input.mouse.pos);

    // Convert world pixel to tile coordinates
    const tilePos = world.pixelToTile(worldPos.x, worldPos.y);

    // Check if in reach
    const playerTileX = Math.floor(this.pos.x / TILE_SIZE);
    const playerTileY = Math.floor(this.pos.y / TILE_SIZE);

    const dx = tilePos.x - playerTileX;
    const dy = tilePos.y - playerTileY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.reach) {
      return null;
    }

    return tilePos;
  }

  // Update mining (hold left click)
  updateMining(dt, world, input, camera) {
    const target = this.getTargetTile(input, world, camera);
    if (!target) {
      this.miningTarget = null;
      this.isMining = false;
      return;
    }

    const tile = world.getTile(target.x, target.y);
    if (!tile || tile.type === 0) {
      this.miningTarget = null;
      this.isMining = false;
      return;
    }

    // Get tile max health for progress calculation
    const tileProps = TILE_PROPS[tile.type];
    const maxHealth = tileProps ? tileProps.health : 100;

    // Check if we're targeting a new tile
    if (!this.miningTarget || this.miningTarget.x !== target.x || this.miningTarget.y !== target.y) {
      this.miningTarget = { x: target.x, y: target.y, progress: 0, maxHealth: maxHealth };
    }

    // Set mining state for animation
    this.isMining = true;

    // Update swing animation
    this.miningSwing += dt * this.miningSwingSpeed;
    if (this.miningSwing >= 1) {
      this.miningSwing = 0;
    }

    // Calculate mining damage
    const selectedItem = this.inventory.getSlot(this.selectedSlot);
    let damage = this.miningSpeed * dt;

    // Apply tool bonus (diamond is 5x faster than bare hands)
    if (selectedItem && selectedItem.item.toolType === 'PICKAXE') {
      damage *= (1 + selectedItem.item.toolPower * 0.8);
    }

    // Update mining progress for visual feedback
    this.miningTarget.progress += damage;

    // Damage the tile
    const destroyedTile = world.damageTile(target.x, target.y, damage);

    if (destroyedTile !== null) {
      // Tile was destroyed, add item to inventory
      const item = ItemDatabase.getItemForTile(destroyedTile);
      if (item) {
        this.inventory.addItem(item, 1);
      }
      // Store destroyed block info for particle effects (picked up by Game.js)
      this.lastDestroyedBlock = {
        x: target.x,
        y: target.y,
        tileType: destroyedTile
      };
      this.miningTarget = null;
      this.isMining = false;
    }
  }

  // Place a block or wall (right click)
  placeBlock(world, input, camera) {
    const target = this.getTargetTile(input, world, camera);
    if (!target) return;

    // Get selected item
    const selectedSlot = this.inventory.getSlot(this.selectedSlot);
    if (!selectedSlot) return;

    if (selectedSlot.item.type !== 'BLOCK') return;

    // Check if placing a wall
    if (selectedSlot.item.wallType !== undefined && selectedSlot.item.wallType !== null) {
      const placed = world.setWall(target.x, target.y, selectedSlot.item.wallType);
      if (placed) {
        this.inventory.removeItem(selectedSlot.item, 1);
      }
      return;
    }

    // Check if item can place a tile
    if (selectedSlot.item.tileType === null || selectedSlot.item.tileType === undefined) {
      return;
    }

    // Placing a regular block
    // Check if tile is already occupied
    const tile = world.getTile(target.x, target.y);
    if (tile && tile.type !== 0) {
      return;
    }

    // Check if player is standing in this position
    const playerBounds = this.getBounds();
    const tileBounds = {
      left: target.x * TILE_SIZE,
      right: (target.x + 1) * TILE_SIZE,
      top: target.y * TILE_SIZE,
      bottom: (target.y + 1) * TILE_SIZE
    };

    // Don't allow placing where player is standing
    if (!(playerBounds.right < tileBounds.left ||
          playerBounds.left > tileBounds.right ||
          playerBounds.bottom < tileBounds.top ||
          playerBounds.top > tileBounds.bottom)) {
      return;
    }

    // Place the block
    const placed = world.setTileType(target.x, target.y, selectedSlot.item.tileType);
    if (placed) {
      // Add place animation
      world.addBlockAnimation(target.x, target.y, 'place');

      // Mark the chunk as dirty to ensure re-render
      const { chunkX, chunkY } = world.worldToChunk(target.x, target.y);
      const chunk = world.getChunk(chunkX, chunkY);
      chunk.markDirty();

      // Remove one from inventory
      this.inventory.removeItem(selectedSlot.item, 1);
    }
  }

  // Update equipped weapon based on selected item
  updateWeapon() {
    const selectedSlot = this.inventory.getSlot(this.selectedSlot);

    // Check if selected item is a weapon
    if (selectedSlot && selectedSlot.item.type === 'WEAPON') {
      // Create weapon if not exists or different weapon
      if (!this.weapon || this.weapon.damage !== selectedSlot.item.damage) {
        this.weapon = new Weapon(
          this,
          selectedSlot.item.damage,
          selectedSlot.item.attackSpeed || 1.0,
          this.attackRange
        );
      }
    } else {
      this.weapon = null;
    }
  }

  // Shoot a projectile (ranged weapons)
  shootProjectile(input, camera, entities) {
    if (!this.weapon || !this.weapon.isReady()) return;

    const selectedItem = this.inventory.getSlot(this.selectedSlot);
    if (!selectedItem || !selectedItem.item.isRanged) return;

    // Get mouse world position
    const worldPos = camera.screenToWorld(input.mouse.pos);

    // Calculate direction to mouse
    const dx = worldPos.x - this.pos.x;
    const dy = worldPos.y - this.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    // Normalize and apply projectile speed
    const speed = selectedItem.item.projectileSpeed || 400;
    const velX = (dx / distance) * speed;
    const velY = (dy / distance) * speed;

    // Create projectile
    const projectile = new Projectile(
      this.pos.x,
      this.pos.y,
      velX,
      velY,
      this.weapon.damage,
      this
    );

    // Set projectile color based on weapon
    if (selectedItem.item.id === 'wooden_bow') {
      projectile.color = '#8B4513';
      projectile.gravity = true; // Arrows have gravity
    } else if (selectedItem.item.id === 'iron_gun') {
      projectile.color = '#FFD700';
    } else if (selectedItem.item.id === 'magic_staff') {
      projectile.color = '#9370DB';
    }

    // Add to entities list
    entities.push(projectile);

    // Reset weapon cooldown
    this.weapon.swinging = true;
    this.weapon.swingTime = 0;
    this.weapon.swinging = false;
    this.weapon.cooldown = this.weapon.getCooldown();
  }

  // Update stats based on equipment
  updateStats() {
    const bonuses = this.equipment.getBonusStats();

    // Update defense
    this.stats.defense = bonuses.defense;

    // Update attack bonus
    this.stats.attackBonus = bonuses.attackBonus;

    // Update max health
    this.maxHealth = this.baseMaxHealth + bonuses.maxHealth;

    // Update move speed
    this.moveSpeed = this.baseMoveSpeed + bonuses.moveSpeed;

    // Don't exceed new max health
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  // Equip item from inventory
  equipItem(inventorySlot) {
    const itemStack = this.inventory.getSlot(inventorySlot);
    if (!itemStack || !itemStack.item.equipSlot) return false;

    const slot = itemStack.item.equipSlot;

    // Equip the item (returns old item if any)
    const oldItem = this.equipment.equip(slot, itemStack);

    // Remove from inventory
    this.inventory.removeItem(itemStack.item, 1);

    // Add old item back to inventory if there was one
    if (oldItem) {
      this.inventory.addItem(oldItem.item, oldItem.count);
    }

    // Update player stats
    this.updateStats();

    return true;
  }

  // Unequip item to inventory
  unequipItem(equipSlot) {
    const itemStack = this.equipment.unequip(equipSlot);
    if (!itemStack) return false;

    // Add to inventory
    this.inventory.addItem(itemStack.item, itemStack.count);

    // Update player stats
    this.updateStats();

    return true;
  }

  // Use a summoning item (spawns boss)
  useSummoningItem(itemStack, entities) {
    if (!itemStack || !itemStack.item.summonsBoss) return false;

    // Check if boss already exists
    const bossExists = entities.some(e => e.isBoss && e.alive);
    if (bossExists) {
      console.log('A boss is already active!');
      return false;
    }

    // Mark that we want to summon a boss
    this.summonBoss = itemStack.item.summonsBoss;

    // Remove one summoning item
    this.inventory.removeItem(itemStack.item, 1);

    console.log(`Summoning ${itemStack.item.name}...`);
    return true;
  }

  // Get currently selected item
  getSelectedItem() {
    return this.inventory.getSlot(this.selectedSlot);
  }

  // Check for nearby workstations and update crafting system
  updateNearbyWorkstations(world) {
    if (!world || !this.pos) return;

    const workstations = [];
    const range = 3; // 3 blocks range for better detection

    // Get player tile position (use player position directly since pos is already top-left)
    const playerTileX = Math.floor(this.pos.x / TILE_SIZE);
    const playerTileY = Math.floor(this.pos.y / TILE_SIZE);

    // Safety check for NaN
    if (isNaN(playerTileX) || isNaN(playerTileY)) return;

    // Check tiles in range
    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        const tileX = playerTileX + dx;
        const tileY = playerTileY + dy;

        const tile = world.getTile(tileX, tileY);
        // Check tile exists and has a non-zero type (not AIR)
        if (tile && tile.type !== undefined && tile.type !== 0) {
          const props = TILE_PROPS[tile.type];
          if (props && props.workstation) {
            if (!workstations.includes(props.workstation)) {
              workstations.push(props.workstation);
            }
          }
        }
      }
    }

    // Update crafting system with available workstations
    this.craftingSystem.setAvailableWorkstations(workstations);
  }

  // Check for nearby chest for interaction prompt
  updateNearbyChest(world) {
    if (!world || !this.pos) {
      this.nearbyChest = null;
      return;
    }

    const range = 2; // 2 blocks range for chest interaction
    const playerTileX = Math.floor(this.pos.x / TILE_SIZE);
    const playerTileY = Math.floor(this.pos.y / TILE_SIZE);

    if (isNaN(playerTileX) || isNaN(playerTileY)) {
      this.nearbyChest = null;
      return;
    }

    // Find closest chest in range
    let closestChest = null;
    let closestDist = Infinity;

    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        const tileX = playerTileX + dx;
        const tileY = playerTileY + dy;

        const tile = world.getTile(tileX, tileY);
        if (tile && tile.type === TILE.CHEST) {
          const dist = Math.abs(dx) + Math.abs(dy);
          if (dist < closestDist) {
            closestDist = dist;
            closestChest = { x: tileX, y: tileY };
          }
        }
      }
    }

    this.nearbyChest = closestChest;
  }

  // Player death
  onDeath() {
    super.onDeath();
    // Respawn logic (later)
  }
}
