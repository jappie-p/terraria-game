// Renderer - Drawing pipeline for tiles, entities, and UI
import { TILE, TILE_SIZE, CHUNK_SIZE, TILE_COLORS, WALL_COLORS, SHOW_CHUNK_BORDERS, SHOW_COLLISION_BOXES, SURFACE_LEVEL } from '../utils/Constants.js';
import { TextureGenerator } from './TextureGenerator.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.camera = null; // Set by Game

    // Canvas settings
    this.ctx.imageSmoothingEnabled = false; // Pixel perfect rendering

    // Texture generator
    this.textureGen = new TextureGenerator();
    this.textureGen.generateAll();

    // Pattern size for seamless textures
    this.PATTERN_SIZE = 64;

    // Cache for sky gradient
    this.skyGradient = null;
    this.lastCanvasHeight = 0;

    // Tall grass positions (seeded by world position)
    this.tallGrassCache = new Map();
  }

  // Clear canvas with sky gradient
  clear() {
    // Recreate gradient if canvas height changed
    if (this.lastCanvasHeight !== this.canvas.height) {
      const skyPalette = this.textureGen.getSkyPalette();
      this.skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
      this.skyGradient.addColorStop(0, skyPalette.top);
      this.skyGradient.addColorStop(0.6, skyPalette.bottom);
      this.skyGradient.addColorStop(1, '#1a1a2e'); // Dark underground fade
      this.lastCanvasHeight = this.canvas.height;
    }

    this.ctx.fillStyle = this.skyGradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw sun
    this.drawSun();
  }

  // Draw sun in the sky
  drawSun() {
    if (!this.camera) return;

    // Sun position (fixed in sky, moves slightly with camera for parallax)
    const sunX = this.canvas.width * 0.8 - this.camera.pos.x * 0.02;
    const sunY = 60;

    this.ctx.save();
    this.ctx.fillStyle = '#FFD700';
    this.ctx.shadowColor = '#FFA500';
    this.ctx.shadowBlur = 30;
    this.ctx.beginPath();
    this.ctx.arc(sunX, sunY, 25, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  // Render the complete frame
  render(world, entities, uiElements = []) {
    this.clear();

    if (!this.camera) return;

    // Save context state
    this.ctx.save();

    // Render world layers
    this.renderWorld(world);

    // Find player for mining crack overlay
    const player = entities ? entities.find(e => e.isPlayer) : null;

    // Render mining crack overlay on block being mined
    if (player) {
      this.renderMiningCracks(player, world);
    }

    // Render chest interaction prompt
    if (player && player.nearbyChest) {
      this.renderChestPrompt(player.nearbyChest);
    }

    // Render block animations (breaking particles)
    this.renderBlockAnimations(world);

    // Render entities
    this.renderEntities(entities);

    // Restore context
    this.ctx.restore();

    // Render UI (not affected by camera)
    this.renderUI(uiElements);

    // Debug info
    if (SHOW_CHUNK_BORDERS) {
      this.renderChunkBorders(world);
    }
  }

  // Render world tiles
  renderWorld(world) {
    if (!world || !this.camera) return;

    // Get visible chunks
    const chunks = world.getVisibleChunks(this.camera);

    // First pass: Render walls (background)
    for (const chunk of chunks) {
      this.renderChunkWalls(chunk, world);
    }

    // Second pass: Render tiles
    for (const chunk of chunks) {
      this.renderChunkTiles(chunk, world);
    }

    // Third pass: Render decorations (tall grass, edges)
    for (const chunk of chunks) {
      this.renderChunkDecorations(chunk, world);
    }
  }

  // Render chunk walls
  renderChunkWalls(chunk, world) {
    const chunkPixelX = chunk.x * CHUNK_SIZE * TILE_SIZE;
    const chunkPixelY = chunk.y * CHUNK_SIZE * TILE_SIZE;

    for (let localY = 0; localY < CHUNK_SIZE; localY++) {
      for (let localX = 0; localX < CHUNK_SIZE; localX++) {
        const wall = chunk.getWall(localX, localY);
        if (!wall || wall === 0) continue;

        const worldPixelX = chunkPixelX + localX * TILE_SIZE;
        const worldPixelY = chunkPixelY + localY * TILE_SIZE;

        if (!this.camera.isRectVisible(worldPixelX, worldPixelY, TILE_SIZE, TILE_SIZE)) {
          continue;
        }

        this.renderWall(wall, worldPixelX, worldPixelY);
      }
    }
  }

  // Render chunk tiles with textures
  renderChunkTiles(chunk, world) {
    const chunkPixelX = chunk.x * CHUNK_SIZE * TILE_SIZE;
    const chunkPixelY = chunk.y * CHUNK_SIZE * TILE_SIZE;

    for (let localY = 0; localY < CHUNK_SIZE; localY++) {
      for (let localX = 0; localX < CHUNK_SIZE; localX++) {
        const tile = chunk.getTile(localX, localY);
        if (!tile || tile.type === 0) continue; // Skip air

        const worldTileX = chunk.x * CHUNK_SIZE + localX;
        const worldTileY = chunk.y * CHUNK_SIZE + localY;
        const worldPixelX = chunkPixelX + localX * TILE_SIZE;
        const worldPixelY = chunkPixelY + localY * TILE_SIZE;

        if (!this.camera.isRectVisible(worldPixelX, worldPixelY, TILE_SIZE, TILE_SIZE)) {
          continue;
        }

        this.renderTile(tile, worldPixelX, worldPixelY, worldTileX, worldTileY, world);
      }
    }
  }

  // Render decorations (grass edges, tall grass)
  renderChunkDecorations(chunk, world) {
    const chunkPixelX = chunk.x * CHUNK_SIZE * TILE_SIZE;
    const chunkPixelY = chunk.y * CHUNK_SIZE * TILE_SIZE;

    for (let localY = 0; localY < CHUNK_SIZE; localY++) {
      for (let localX = 0; localX < CHUNK_SIZE; localX++) {
        const tile = chunk.getTile(localX, localY);
        if (!tile) continue;

        const worldTileX = chunk.x * CHUNK_SIZE + localX;
        const worldTileY = chunk.y * CHUNK_SIZE + localY;
        const worldPixelX = chunkPixelX + localX * TILE_SIZE;
        const worldPixelY = chunkPixelY + localY * TILE_SIZE;

        if (!this.camera.isRectVisible(worldPixelX, worldPixelY, TILE_SIZE, TILE_SIZE)) {
          continue;
        }

        // Check for grass edges
        if (tile.type === TILE.GRASS || tile.type === TILE.DIRT) {
          this.renderGrassEdges(worldTileX, worldTileY, worldPixelX, worldPixelY, world);
        }

        // Draw tall grass on top of grass blocks
        if (tile.type === TILE.GRASS) {
          this.renderTallGrass(worldTileX, worldTileY, worldPixelX, worldPixelY, world);
        }
      }
    }
  }

  // Render a single wall (background)
  renderWall(wallType, worldX, worldY) {
    const screenPos = this.camera.worldToScreen({ x: worldX, y: worldY });
    const color = WALL_COLORS[wallType] || '#333333';

    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      Math.floor(screenPos.x),
      Math.floor(screenPos.y),
      TILE_SIZE * this.camera.zoom,
      TILE_SIZE * this.camera.zoom
    );
  }

  // Render a single tile with procedural texture
  renderTile(tile, worldX, worldY, tileX, tileY, world) {
    const screenPos = this.camera.worldToScreen({ x: worldX, y: worldY });
    const screenX = Math.floor(screenPos.x);
    const screenY = Math.floor(screenPos.y);
    const size = Math.ceil(TILE_SIZE * this.camera.zoom);

    // Check for place animation (scale up effect)
    const anim = world.getBlockAnimation(tileX, tileY);
    let scale = 1;
    if (anim && anim.type === 'place') {
      const progress = anim.progress / anim.maxProgress;
      scale = 0.5 + progress * 0.5; // Start at 50% size, grow to 100%
    }

    // Get texture for this tile type
    const texture = this.textureGen.getTileTexture(tile.type);

    // Calculate animated size and position
    const animSize = Math.ceil(size * scale);
    const animX = screenX + (size - animSize) / 2;
    const animY = screenY + (size - animSize) / 2;

    if (texture) {
      // Calculate source position in the pattern texture
      // Modulo by pattern size for seamless tiling
      let sx = (tileX * TILE_SIZE) % this.PATTERN_SIZE;
      let sy = (tileY * TILE_SIZE) % this.PATTERN_SIZE;

      // Handle negative coordinates
      if (sx < 0) sx += this.PATTERN_SIZE;
      if (sy < 0) sy += this.PATTERN_SIZE;

      // Grass texture is 64x16, only varies horizontally
      if (tile.type === TILE.GRASS) {
        sy = 0;
      }

      // Glass texture is only 16x16
      if (tile.type === TILE.GLASS) {
        sx = 0;
        sy = 0;
      }

      // Draw the texture slice
      this.ctx.drawImage(
        texture,
        sx, sy, TILE_SIZE, TILE_SIZE, // Source rectangle
        animX, animY, animSize, animSize   // Destination rectangle
      );

      // Apply depth-based darkening (underground gets darker)
      const surfaceY = SURFACE_LEVEL;
      const depth = tileY - surfaceY;
      if (depth > 0) {
        const darkness = Math.min(depth * 0.015, 0.7); // Max 70% dark
        this.ctx.fillStyle = `rgba(0, 0, 0, ${darkness})`;
        this.ctx.fillRect(animX, animY, animSize, animSize);
      }
    } else {
      // Fallback to solid color if no texture
      const color = TILE_COLORS[tile.type] || '#FF00FF';
      this.ctx.fillStyle = color;
      this.ctx.fillRect(animX, animY, animSize, animSize);
    }
  }

  // Render block break animations (particle burst)
  renderBlockAnimations(world) {
    for (const [key, anim] of world.blockAnimations) {
      if (anim.type === 'break') {
        const [x, y] = key.split(',').map(Number);
        const worldPixelX = x * TILE_SIZE;
        const worldPixelY = y * TILE_SIZE;
        const screenPos = this.camera.worldToScreen({ x: worldPixelX, y: worldPixelY });

        const progress = anim.progress / anim.maxProgress;
        const numParticles = 6;

        for (let i = 0; i < numParticles; i++) {
          const angle = (i / numParticles) * Math.PI * 2;
          const dist = progress * TILE_SIZE * 1.5;
          const px = screenPos.x + TILE_SIZE / 2 + Math.cos(angle) * dist;
          const py = screenPos.y + TILE_SIZE / 2 + Math.sin(angle) * dist;
          const size = 3 * (1 - progress);
          const alpha = 1 - progress;

          this.ctx.fillStyle = `rgba(139, 90, 43, ${alpha})`;
          this.ctx.fillRect(px - size / 2, py - size / 2, size, size);
        }
      }
    }
  }

  // Render grass edges on sides of blocks
  renderGrassEdges(tileX, tileY, worldPixelX, worldPixelY, world) {
    // Check if we need left edge (air to the left, ground above)
    const leftTile = world.getTile(tileX - 1, tileY);
    const aboveTile = world.getTile(tileX, tileY - 1);
    const aboveLeftTile = world.getTile(tileX - 1, tileY - 1);

    // Only draw edge if there's a grass block diagonally above
    if ((!leftTile || leftTile.type === TILE.AIR) && aboveLeftTile && aboveLeftTile.type === TILE.GRASS) {
      const edgeTexture = this.textureGen.getEdgeTexture('left');
      if (edgeTexture) {
        const screenPos = this.camera.worldToScreen({ x: worldPixelX, y: worldPixelY });
        this.ctx.drawImage(
          edgeTexture,
          Math.floor(screenPos.x),
          Math.floor(screenPos.y),
          TILE_SIZE * this.camera.zoom,
          TILE_SIZE * this.camera.zoom
        );
      }
    }

    // Check if we need right edge
    const rightTile = world.getTile(tileX + 1, tileY);
    const aboveRightTile = world.getTile(tileX + 1, tileY - 1);

    if ((!rightTile || rightTile.type === TILE.AIR) && aboveRightTile && aboveRightTile.type === TILE.GRASS) {
      const edgeTexture = this.textureGen.getEdgeTexture('right');
      if (edgeTexture) {
        const screenPos = this.camera.worldToScreen({ x: worldPixelX, y: worldPixelY });
        this.ctx.drawImage(
          edgeTexture,
          Math.floor(screenPos.x),
          Math.floor(screenPos.y),
          TILE_SIZE * this.camera.zoom,
          TILE_SIZE * this.camera.zoom
        );
      }
    }
  }

  // Render tall grass decoration
  renderTallGrass(tileX, tileY, worldPixelX, worldPixelY, world) {
    // Check if tile above is air (grass needs open sky)
    const aboveTile = world.getTile(tileX, tileY - 1);
    if (aboveTile && aboveTile.type !== TILE.AIR) return;

    // Use seeded random based on position for consistent placement
    const seed = tileX * 73856093 + tileY * 19349663;
    const random = ((seed % 1000) / 1000);

    // Only 30% chance of tall grass
    if (random > 0.3) return;

    const grassTexture = this.textureGen.getTallGrassTexture();
    if (grassTexture) {
      const screenPos = this.camera.worldToScreen({ x: worldPixelX, y: worldPixelY - TILE_SIZE });
      this.ctx.drawImage(
        grassTexture,
        Math.floor(screenPos.x),
        Math.floor(screenPos.y),
        TILE_SIZE * this.camera.zoom,
        TILE_SIZE * this.camera.zoom
      );
    }
  }

  // Render entities
  renderEntities(entities) {
    if (!entities) return;

    for (const entity of entities) {
      if (!entity || !entity.pos) continue;

      // Check if entity is visible
      if (!this.camera.isRectVisible(
        entity.pos.x - entity.size.x / 2,
        entity.pos.y - entity.size.y / 2,
        entity.size.x,
        entity.size.y
      )) {
        continue;
      }

      this.renderEntity(entity);
    }
  }

  // Render a single entity
  renderEntity(entity) {
    const screenPos = this.camera.worldToScreen(entity.pos);
    const zoom = this.camera.zoom;
    const width = entity.size.x * zoom;
    const height = entity.size.y * zoom;

    // Try to get texture for entity
    let texture = null;
    if (entity.isPlayer) {
      texture = this.textureGen.getEntityTexture('player');
    } else if (entity.entityType === 'zombie') {
      texture = this.textureGen.getEntityTexture('zombie');
    } else if (entity.entityType === 'slime') {
      texture = this.textureGen.getEntityTexture('slime');
    }

    if (texture) {
      // Draw entity texture centered on screenPos
      const drawX = Math.floor(screenPos.x - width / 2);
      const drawY = Math.floor(screenPos.y - height / 2);

      // Save context for flipping
      this.ctx.save();
      
      // Flip texture if facing left
      if (entity.facingLeft) {
        this.ctx.scale(-1, 1);
        // When flipped, x coordinate needs to be inverted and adjusted relative to the pivot
        // Drawing at -drawX - width effectively mirrors it across the Y-axis
        this.ctx.drawImage(
          texture,
          -drawX - width, drawY,
          width, height
        );
        
        // Draw Armor (if player)
        if (entity.isPlayer && entity.equipment) {
           this.renderArmor(entity, -drawX - width, drawY, width, height);
        }

      } else {
        this.ctx.drawImage(
          texture,
          drawX, drawY,
          width, height
        );

        // Draw Armor (if player)
        if (entity.isPlayer && entity.equipment) {
           this.renderArmor(entity, drawX, drawY, width, height);
        }
      }
      
      this.ctx.restore();

    } else {
      // Fallback to colored rectangle
      const color = entity.color || '#FF0000';
      this.ctx.fillStyle = color;
      this.ctx.fillRect(
        Math.floor(screenPos.x - width / 2),
        Math.floor(screenPos.y - height / 2),
        width,
        height
      );
    }

    // Draw enemy health bar
    if (entity.isEnemy && entity.maxHealth && entity.health < entity.maxHealth) {
      this.renderEnemyHealthBar(entity, screenPos);
    }

    // Show collision box in debug mode
    if (SHOW_COLLISION_BOXES) {
      this.ctx.strokeStyle = '#00FF00';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(
        Math.floor(screenPos.x - width / 2),
        Math.floor(screenPos.y - height / 2),
        width,
        height
      );
    }
  }

  // Render armor overlays
  renderArmor(player, x, y, width, height) {
    const slots = ['leggings', 'chestplate', 'helmet']; // Draw order: Legs -> Body -> Head
    
    for (const slotName of slots) {
      const itemStack = player.equipment.getSlot(slotName);
      if (itemStack) {
        const item = itemStack.item;
        const textureKey = 'armor_' + item.id;
        const texture = this.textureGen.textures[textureKey];
        
        if (texture) {
          this.ctx.drawImage(texture, x, y, width, height);
        }
      }
    }
  }

  // Render enemy health bar
  renderEnemyHealthBar(entity, screenPos) {
    const barWidth = entity.size.x;
    const barHeight = 4;
    const barX = screenPos.x - barWidth / 2;
    const barY = screenPos.y - entity.size.y / 2 - 8;

    // Background
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(barX, barY, barWidth, barHeight);

    // Health
    const healthPercent = Math.max(0, entity.health / entity.maxHealth);
    const healthWidth = barWidth * healthPercent;

    // Color based on health
    let color = '#00FF00'; // Green
    if (healthPercent < 0.3) {
      color = '#FF0000'; // Red
    } else if (healthPercent < 0.6) {
      color = '#FFFF00'; // Yellow
    }

    this.ctx.fillStyle = color;
    this.ctx.fillRect(barX, barY, healthWidth, barHeight);

    // Border
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(barX, barY, barWidth, barHeight);
  }

  // Render mining animation (pickaxe swing)
  renderMiningAnimation(player, screenPos) {
    const selectedItem = player.inventory.getSlot(player.selectedSlot);
    if (!selectedItem || selectedItem.item.toolType !== 'PICKAXE') return;

    // Get pickaxe texture
    const itemId = selectedItem.item.id;
    const texture = this.textureGen.getItemTexture(itemId);
    if (!texture) return;

    // Calculate swing angle (oscillates between -45 and 45 degrees)
    const swingAngle = Math.sin(player.miningSwing * Math.PI * 2) * 0.8;

    // Position the pickaxe at player's hand
    const handOffsetX = player.facingLeft ? -8 : 8;
    const handOffsetY = -2;
    const pickaxeX = screenPos.x + handOffsetX;
    const pickaxeY = screenPos.y + handOffsetY;

    this.ctx.save();
    this.ctx.translate(pickaxeX, pickaxeY);

    // Flip if facing left
    if (player.facingLeft) {
      this.ctx.scale(-1, 1);
    }

    // Rotate for swing
    this.ctx.rotate(swingAngle);

    // Draw pickaxe
    this.ctx.drawImage(texture, -6, -18, 20, 20);

    this.ctx.restore();
  }

  // Render mining crack overlay on block being mined
  renderMiningCracks(player, world) {
    if (!player.miningTarget) return;

    const target = player.miningTarget;
    const progress = target.progress / target.maxHealth;
    if (progress <= 0) return;

    // Calculate crack stage (0-9 like Minecraft)
    const stage = Math.min(9, Math.floor(progress * 10));
    if (stage < 1) return;

    const worldX = target.x * TILE_SIZE;
    const worldY = target.y * TILE_SIZE;
    const screenPos = this.camera.worldToScreen({ x: worldX, y: worldY });
    const size = Math.ceil(TILE_SIZE * this.camera.zoom);

    // Draw crack overlay
    this.ctx.save();
    this.ctx.globalAlpha = 0.6 + stage * 0.04;

    // Draw crack pattern based on stage
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 1 + stage * 0.2;

    const sx = screenPos.x;
    const sy = screenPos.y;

    // More cracks as stage increases
    this.ctx.beginPath();

    // Central crack
    if (stage >= 1) {
      this.ctx.moveTo(sx + size * 0.5, sy + size * 0.3);
      this.ctx.lineTo(sx + size * 0.5, sy + size * 0.7);
    }
    // Side cracks
    if (stage >= 2) {
      this.ctx.moveTo(sx + size * 0.3, sy + size * 0.5);
      this.ctx.lineTo(sx + size * 0.7, sy + size * 0.5);
    }
    // Diagonal cracks
    if (stage >= 3) {
      this.ctx.moveTo(sx + size * 0.2, sy + size * 0.2);
      this.ctx.lineTo(sx + size * 0.5, sy + size * 0.5);
    }
    if (stage >= 4) {
      this.ctx.moveTo(sx + size * 0.8, sy + size * 0.2);
      this.ctx.lineTo(sx + size * 0.5, sy + size * 0.5);
    }
    if (stage >= 5) {
      this.ctx.moveTo(sx + size * 0.2, sy + size * 0.8);
      this.ctx.lineTo(sx + size * 0.5, sy + size * 0.5);
    }
    if (stage >= 6) {
      this.ctx.moveTo(sx + size * 0.8, sy + size * 0.8);
      this.ctx.lineTo(sx + size * 0.5, sy + size * 0.5);
    }
    // More fragmentation
    if (stage >= 7) {
      this.ctx.moveTo(sx + size * 0.1, sy + size * 0.5);
      this.ctx.lineTo(sx + size * 0.3, sy + size * 0.3);
      this.ctx.moveTo(sx + size * 0.9, sy + size * 0.5);
      this.ctx.lineTo(sx + size * 0.7, sy + size * 0.7);
    }
    if (stage >= 8) {
      this.ctx.moveTo(sx + size * 0.5, sy + size * 0.1);
      this.ctx.lineTo(sx + size * 0.3, sy + size * 0.3);
      this.ctx.moveTo(sx + size * 0.5, sy + size * 0.9);
      this.ctx.lineTo(sx + size * 0.7, sy + size * 0.7);
    }
    if (stage >= 9) {
      // Final stage - lots of small cracks
      for (let i = 0; i < 5; i++) {
        const x1 = sx + size * (0.2 + i * 0.15);
        const y1 = sy + size * (0.2 + (i % 3) * 0.3);
        const x2 = x1 + size * 0.1;
        const y2 = y1 + size * 0.15;
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
      }
    }

    this.ctx.stroke();

    // Dark overlay that increases with damage
    this.ctx.fillStyle = `rgba(0, 0, 0, ${stage * 0.05})`;
    this.ctx.fillRect(sx, sy, size, size);

    this.ctx.restore();
  }

  // Render UI elements
  renderUI(uiElements) {
    for (const element of uiElements) {
      if (element && element.visible && element.render) {
        // Boss health bar needs canvas width
        if (element.constructor.name === 'BossHealthBar') {
          element.render(this.ctx, this.canvas.width);
        } else {
          element.render(this.ctx);
        }
      }
    }
  }

  // Debug: Render chunk borders
  renderChunkBorders(world) {
    const chunks = world.getVisibleChunks(this.camera);

    this.ctx.strokeStyle = '#FF0000';
    this.ctx.lineWidth = 2;

    for (const chunk of chunks) {
      const chunkPixelX = chunk.x * CHUNK_SIZE * TILE_SIZE;
      const chunkPixelY = chunk.y * CHUNK_SIZE * TILE_SIZE;

      const screenPos = this.camera.worldToScreen({
        x: chunkPixelX,
        y: chunkPixelY
      });

      const width = CHUNK_SIZE * TILE_SIZE * this.camera.zoom;
      const height = CHUNK_SIZE * TILE_SIZE * this.camera.zoom;

      this.ctx.strokeRect(
        Math.floor(screenPos.x),
        Math.floor(screenPos.y),
        width,
        height
      );

      // Chunk coordinates label
      this.ctx.fillStyle = '#FF0000';
      this.ctx.font = '12px monospace';
      this.ctx.fillText(
        `${chunk.x},${chunk.y}`,
        screenPos.x + 4,
        screenPos.y + 16
      );
    }
  }

  // Draw text on screen (for debug/UI)
  drawText(text, x, y, color = '#FFFFFF', size = 14) {
    this.ctx.fillStyle = color;
    this.ctx.font = `${size}px monospace`;
    this.ctx.fillText(text, x, y);
  }

  // Draw FPS counter
  drawFPS(fps) {
    this.drawText(`FPS: ${Math.round(fps)}`, 10, 50, '#FFFFFF', 14);
  }

  // Set camera
  setCamera(camera) {
    this.camera = camera;
  }

  // Resize canvas
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    // Force gradient regeneration
    this.lastCanvasHeight = 0;
    if (this.camera) {
      this.camera.viewport.width = width;
      this.camera.viewport.height = height;
    }
  }
}
