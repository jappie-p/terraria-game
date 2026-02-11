// TextureGenerator - Procedurally generates textures for tiles and entities
import { TILE, TILE_SIZE } from '../utils/Constants.js';

export class TextureGenerator {
  constructor() {
    this.textures = {};
    this.PATTERN_SIZE = 64; // 4x4 tile pattern for seamless tiling

    // Color palettes
    this.PALETTE = {
      dirt: {
        base: '#593a28',
        dark: '#3d2619',
        light: '#754d35',
        speck: '#8c5d41'
      },
      grass: {
        top: '#98fb98',
        mid: '#32cd32',
        dark: '#006400'
      },
      stone: {
        base: '#595959',
        dark: '#2a2a2a',
        light: '#757575',
        tint: '#505359'
      },
      iron: {
        base: '#D8D8D8', // Brighter silver
        dark: '#A9A9A9',
        light: '#FFFFFF',
        ore: '#CD7F32' // Rust color (unused by default logic but good to have)
      },
      gold: {
        base: '#FFD700',
        dark: '#B8860B', // Darker gold for contrast
        light: '#FFFF00', // Bright yellow
        ore: '#696969'
      },
      diamond: {
        base: '#00FFFF',
        dark: '#00CED1', // Darker cyan
        light: '#E0FFFF', // Very light cyan
        ore: '#2F4F4F'
      },
      coal: {
        base: '#000000', // Pure black
        dark: '#1C1C1C',
        light: '#2F2F2F', // Dark grey highlight
        ore: '#696969'
      },
      wood: {
        base: '#8B4513',
        dark: '#5C2E0F',
        light: '#A0522D',
        grain: '#6B3410'
      },
      sand: {
        base: '#E8D174',
        dark: '#C9A859',
        light: '#F5E6A3',
        speck: '#D4B45C'
      },
      brick: {
        base: '#A0522D',
        dark: '#6B3A1F',
        light: '#CD6839',
        mortar: '#8B7355'
      },
      glass: {
        base: 'rgba(200, 230, 255, 0.5)',
        edge: 'rgba(255, 255, 255, 0.8)',
        shine: 'rgba(255, 255, 255, 0.6)'
      },
      leaves: {
        base: '#228B22',
        dark: '#006400',
        light: '#32CD32',
        highlight: '#90EE90'
      },
      sky: {
        top: '#4080bf',
        bottom: '#b3e5fc'
      }
    };
  }

  // Initialize all textures
  generateAll() {
    console.log('Generating procedural textures...');

    // Tile textures
    this.textures[TILE.DIRT] = this.generateDirtTexture();
    this.textures[TILE.GRASS] = this.generateGrassTexture();
    this.textures[TILE.STONE] = this.generateStoneTexture();
    this.textures[TILE.WOOD] = this.generateWoodTexture();
    this.textures[TILE.SAND] = this.generateSandTexture();
    this.textures[TILE.BRICK] = this.generateBrickTexture();
    this.textures[TILE.GLASS] = this.generateGlassTexture();
    this.textures[TILE.LEAVES] = this.generateLeavesTexture();
    this.textures[TILE.LOG] = this.generateLogTexture();
    this.textures[TILE.IRON_ORE] = this.generateOreTexture('iron');
    this.textures[TILE.GOLD_ORE] = this.generateOreTexture('gold');
    this.textures[TILE.DIAMOND_ORE] = this.generateOreTexture('diamond');
    this.textures[TILE.COAL_ORE] = this.generateOreTexture('coal');
    this.textures[TILE.WORKBENCH] = this.generateWorkbenchTileTexture();
    this.textures[TILE.FURNACE] = this.generateFurnaceTileTexture();
    this.textures[TILE.CHEST] = this.generateChestTileTexture();

    // Decorative textures
    this.textures.edgeLeft = this.generateGrassEdgeTexture(false);
    this.textures.edgeRight = this.generateGrassEdgeTexture(true);
    this.textures.tallGrass = this.generateTallGrassTexture();

    // Entity textures
    this.textures.player = this.generatePlayerTexture();
    this.textures.zombie = this.generateZombieTexture();
    this.textures.slime = this.generateSlimeTexture();
    this.textures.bat = this.generateBatTexture();
    this.textures.skeleton = this.generateSkeletonTexture();
    this.textures.demon = this.generateDemonTexture();

    // Armor worn textures (12x24)
    this.textures.armor_iron_helmet = this.generateArmorBodyTexture('helmet', 'iron');
    this.textures.armor_iron_chestplate = this.generateArmorBodyTexture('chestplate', 'iron');
    this.textures.armor_iron_leggings = this.generateArmorBodyTexture('leggings', 'iron');
    
    this.textures.armor_gold_helmet = this.generateArmorBodyTexture('helmet', 'gold');
    this.textures.armor_gold_chestplate = this.generateArmorBodyTexture('chestplate', 'gold');
    this.textures.armor_gold_leggings = this.generateArmorBodyTexture('leggings', 'gold');
    
    this.textures.armor_diamond_helmet = this.generateArmorBodyTexture('helmet', 'diamond');
    this.textures.armor_diamond_chestplate = this.generateArmorBodyTexture('chestplate', 'diamond');
    this.textures.armor_diamond_leggings = this.generateArmorBodyTexture('leggings', 'diamond');

    // UI Textures
    this.generateUITextures();

    // Item textures
    this.generateItemTextures();
  }

  // Helper to create canvas
  createCanvas(w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    return canvas;
  }

  // Draw with wrapping for seamless tiles
  drawWrapped(ctx, x, y, w, h, color, canvasW, canvasH) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);

    // Wrap edges
    if (x + w > canvasW) ctx.fillRect(x - canvasW, y, w, h);
    if (x < 0) ctx.fillRect(x + canvasW, y, w, h);
    if (y + h > canvasH) ctx.fillRect(x, y - canvasH, w, h);
    if (y < 0) ctx.fillRect(x, y + canvasH, w, h);

    // Wrap corners
    if (x + w > canvasW && y + h > canvasH) ctx.fillRect(x - canvasW, y - canvasH, w, h);
  }

  // === TILE TEXTURES ===

  generateDirtTexture() {
    const size = this.PATTERN_SIZE;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Base layer
    ctx.fillStyle = this.PALETTE.dirt.base;
    ctx.fillRect(0, 0, size, size);

    // Large clumps (simulating soil layers crossing blocks)
    for (let i = 0; i < 40; i++) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      const w = 4 + Math.floor(Math.random() * 8);
      const h = 2 + Math.floor(Math.random() * 4);
      const col = Math.random() > 0.5 ? this.PALETTE.dirt.dark : this.PALETTE.dirt.light;
      this.drawWrapped(ctx, x, y, w, h, col, size, size);
    }

    // Fine grit
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (Math.random() > 0.88) {
          ctx.fillStyle = Math.random() > 0.5 ? this.PALETTE.dirt.dark : this.PALETTE.dirt.speck;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    return canvas;
  }

  generateGrassTexture() {
    // 64x16 - horizontal variation, 1 block high
    const w = this.PATTERN_SIZE;
    const h = TILE_SIZE;
    const canvas = this.createCanvas(w, h);
    const ctx = canvas.getContext('2d');

    // Dirt base
    ctx.fillStyle = this.PALETTE.dirt.base;
    ctx.fillRect(0, 0, w, h);

    // Add dirt noise
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = this.PALETTE.dirt.dark;
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }

    // Grass top band
    ctx.fillStyle = this.PALETTE.grass.mid;
    ctx.fillRect(0, 0, w, 3);

    // Sod noise
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < 3; y++) {
        if (Math.random() > 0.6) {
          ctx.fillStyle = Math.random() > 0.5 ? this.PALETTE.grass.top : this.PALETTE.grass.dark;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    // Highlights
    for (let i = 0; i < 30; i++) {
      const x = Math.floor(Math.random() * w);
      const rw = 2 + Math.floor(Math.random() * 3);
      this.drawWrapped(ctx, x, 0, rw, 1, this.PALETTE.grass.top, w, h);
    }

    // Roots
    for (let i = 0; i < 40; i++) {
      const x = Math.floor(Math.random() * w);
      const rh = 3 + Math.floor(Math.random() * 4);
      this.drawWrapped(ctx, x, 2, 2, rh, this.PALETTE.grass.dark, w, h);
      this.drawWrapped(ctx, x, 2, 2, 2, this.PALETTE.grass.mid, w, h);
    }

    return canvas;
  }

  generateGrassEdgeTexture(isRightSide) {
    const canvas = this.createCanvas(TILE_SIZE, TILE_SIZE);
    const ctx = canvas.getContext('2d');

    for (let y = 0; y < TILE_SIZE; y++) {
      const width = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < width; i++) {
        const x = isRightSide ? (TILE_SIZE - 1) - i : i;
        let col;
        if (i === 0) {
          col = Math.random() > 0.3 ? this.PALETTE.grass.mid : this.PALETTE.grass.top;
        } else {
          col = this.PALETTE.grass.dark;
        }
        ctx.fillStyle = col;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    return canvas;
  }

  generateTallGrassTexture() {
    const canvas = this.createCanvas(TILE_SIZE, TILE_SIZE);
    const ctx = canvas.getContext('2d');

    const numBlades = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numBlades; i++) {
      const x = 2 + Math.floor(Math.random() * 10);
      const h = 6 + Math.floor(Math.random() * 8);
      ctx.fillStyle = this.PALETTE.grass.mid;
      ctx.fillRect(x, TILE_SIZE - h, 1, h);
      ctx.fillStyle = this.PALETTE.grass.top;
      ctx.fillRect(x, TILE_SIZE - h, 1, 2);
      if (Math.random() > 0.5) {
        ctx.fillRect(x + 1, TILE_SIZE - h - 1, 1, 1);
      }
    }

    return canvas;
  }

  generateStoneTexture() {
    const size = this.PATTERN_SIZE;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Dark mortar
    ctx.fillStyle = this.PALETTE.stone.dark;
    ctx.fillRect(0, 0, size, size);

    // Stones
    const numStones = 80;
    for (let i = 0; i < numStones; i++) {
      const w = 4 + Math.floor(Math.random() * 6);
      const h = 3 + Math.floor(Math.random() * 5);
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);

      // Color blending
      let col = this.PALETTE.stone.base;
      const rnd = Math.random();
      if (rnd > 0.85) col = this.PALETTE.dirt.base;
      else if (rnd > 0.6) col = this.PALETTE.stone.light;
      else if (rnd < 0.2) col = this.PALETTE.stone.tint;

      this.drawWrapped(ctx, x, y, w, h, col, size, size);

      // 3D highlights
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(x, y, w - 1, 1);
      ctx.fillRect(x, y, 1, h - 1);

      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(x + 1, y + h - 1, w - 1, 1);
      ctx.fillRect(x + w - 1, y + 1, 1, h - 1);
    }

    // Connecting grout noise
    for (let i = 0; i < 100; i++) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      this.drawWrapped(ctx, x, y, 1, 1, 'rgba(0,0,0,0.2)', size, size);
    }

    return canvas;
  }

  generateWoodTexture() {
    const size = this.PATTERN_SIZE;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Base
    ctx.fillStyle = this.PALETTE.wood.base;
    ctx.fillRect(0, 0, size, size);

    // Vertical grain lines
    for (let x = 0; x < size; x += 2) {
      const offset = Math.floor(Math.random() * 3);
      ctx.fillStyle = this.PALETTE.wood.grain;
      ctx.fillRect(x + offset, 0, 1, size);
    }

    // Wood rings/knots
    for (let i = 0; i < 20; i++) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      const w = 3 + Math.floor(Math.random() * 5);
      const h = 2 + Math.floor(Math.random() * 3);
      ctx.fillStyle = Math.random() > 0.5 ? this.PALETTE.wood.dark : this.PALETTE.wood.light;
      ctx.fillRect(x, y, w, h);
    }

    // Highlights
    for (let i = 0; i < 15; i++) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(x, y, 2, 1);
    }

    return canvas;
  }

  generateSandTexture() {
    const size = this.PATTERN_SIZE;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Base
    ctx.fillStyle = this.PALETTE.sand.base;
    ctx.fillRect(0, 0, size, size);

    // Sand grains (lots of them for grainy look)
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (Math.random() > 0.7) {
          const rnd = Math.random();
          if (rnd > 0.7) ctx.fillStyle = this.PALETTE.sand.light;
          else if (rnd > 0.4) ctx.fillStyle = this.PALETTE.sand.speck;
          else ctx.fillStyle = this.PALETTE.sand.dark;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    // Larger clumps
    for (let i = 0; i < 20; i++) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      const w = 2 + Math.floor(Math.random() * 4);
      const h = 1 + Math.floor(Math.random() * 2);
      ctx.fillStyle = Math.random() > 0.5 ? this.PALETTE.sand.light : this.PALETTE.sand.dark;
      this.drawWrapped(ctx, x, y, w, h, ctx.fillStyle, size, size);
    }

    return canvas;
  }

  generateBrickTexture() {
    const size = this.PATTERN_SIZE;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Mortar base
    ctx.fillStyle = this.PALETTE.brick.mortar;
    ctx.fillRect(0, 0, size, size);

    const brickWidth = 8;
    const brickHeight = 4;
    const mortarSize = 1;

    // Draw bricks in rows
    for (let row = 0; row < size / (brickHeight + mortarSize); row++) {
      const offset = (row % 2) * (brickWidth / 2);
      for (let col = -1; col < size / brickWidth + 1; col++) {
        const x = col * (brickWidth + mortarSize) + offset;
        const y = row * (brickHeight + mortarSize);

        // Brick color variation
        const rnd = Math.random();
        if (rnd > 0.8) ctx.fillStyle = this.PALETTE.brick.light;
        else if (rnd > 0.2) ctx.fillStyle = this.PALETTE.brick.base;
        else ctx.fillStyle = this.PALETTE.brick.dark;

        ctx.fillRect(x, y, brickWidth, brickHeight);

        // Brick texture noise
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
          ctx.fillRect(
            x + Math.random() * brickWidth,
            y + Math.random() * brickHeight,
            1, 1
          );
        }

        // 3D effect
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(x, y, brickWidth, 1);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(x, y + brickHeight - 1, brickWidth, 1);
      }
    }

    return canvas;
  }

  generateGlassTexture() {
    const canvas = this.createCanvas(TILE_SIZE, TILE_SIZE);
    const ctx = canvas.getContext('2d');

    // Transparent base
    ctx.fillStyle = 'rgba(200, 230, 255, 0.3)';
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

    // Edge/frame
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, TILE_SIZE - 1, TILE_SIZE - 1);

    // Shine highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(2, 2, 4, 2);
    ctx.fillRect(2, 2, 2, 4);

    // Inner shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(6, 0);
    ctx.lineTo(0, 6);
    ctx.fill();

    return canvas;
  }

  generateLeavesTexture() {
    const size = this.PATTERN_SIZE;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Dark base (gaps between leaves)
    ctx.fillStyle = 'rgba(0, 50, 0, 0.5)';
    ctx.fillRect(0, 0, size, size);

    // Leaf clusters
    for (let i = 0; i < 100; i++) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      const w = 2 + Math.floor(Math.random() * 4);
      const h = 2 + Math.floor(Math.random() * 4);

      const rnd = Math.random();
      if (rnd > 0.7) ctx.fillStyle = this.PALETTE.leaves.highlight;
      else if (rnd > 0.4) ctx.fillStyle = this.PALETTE.leaves.light;
      else if (rnd > 0.2) ctx.fillStyle = this.PALETTE.leaves.base;
      else ctx.fillStyle = this.PALETTE.leaves.dark;

      this.drawWrapped(ctx, x, y, w, h, ctx.fillStyle, size, size);
    }

    // Light specks (light through leaves)
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = 'rgba(255, 255, 200, 0.3)';
      ctx.fillRect(
        Math.floor(Math.random() * size),
        Math.floor(Math.random() * size),
        1, 1
      );
    }

    return canvas;
  }

  generateLogTexture() {
    const size = this.PATTERN_SIZE;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Base dark wood color
    const darkWood = '#3E2723';
    const midWood = '#5D4037';
    const lightWood = '#795548';
    
    // Fill background
    ctx.fillStyle = darkWood;
    ctx.fillRect(0, 0, size, size);

    // Vertical bark ridges
    for (let x = 0; x < size; x += 4) {
      // Random width for each ridge strip
      const width = 2 + Math.floor(Math.random() * 3);
      
      // Ridge color
      ctx.fillStyle = Math.random() > 0.5 ? midWood : darkWood;
      ctx.fillRect(x, 0, width, size);
      
      // Highlights on ridges
      if (Math.random() > 0.3) {
        ctx.fillStyle = lightWood;
        ctx.fillRect(x, 0, 1, size);
      }
      
      // Horizontal breaks in bark
      for (let y = 0; y < size; y += 4 + Math.random() * 8) {
        ctx.fillStyle = '#281A16'; // Very dark gap
        ctx.fillRect(x, y, width, 1);
      }
    }

    // Knots
    for (let i = 0; i < 8; i++) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      const r = 2 + Math.random() * 2;
      
      ctx.fillStyle = '#281A16';
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Ring around knot
      ctx.strokeStyle = lightWood;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    return canvas;
  }

  generateOreTexture(oreType) {
    const size = this.PATTERN_SIZE;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    const palette = this.PALETTE[oreType];

    // Decide texture based on oreType
    switch (oreType) {
      case 'iron':
        ctx.fillStyle = palette.base;
        ctx.fillRect(0, 0, size, size); // Fill with base iron color
        
        // Add metallic texture (subtle streaks and darker patches)
        for (let i = 0; i < 60; i++) {
          const x = Math.floor(Math.random() * size);
          const y = Math.floor(Math.random() * size);
          const w = 1 + Math.floor(Math.random() * 4);
          const h = 1 + Math.floor(Math.random() * 4);
          ctx.fillStyle = Math.random() > 0.5 ? palette.dark : palette.light;
          this.drawWrapped(ctx, x, y, w, h, ctx.fillStyle, size, size);
        }
        // Add some highlights for metallic sheen
        for (let i = 0; i < 15; i++) {
          const x = Math.floor(Math.random() * size);
          const y = Math.floor(Math.random() * size);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.fillRect(x, y, 2, 1);
        }
        break;

      case 'coal':
        ctx.fillStyle = palette.base; // Pure black
        ctx.fillRect(0, 0, size, size);

        // Add jagged, dark grey texture for coal
        for (let i = 0; i < 150; i++) {
          const x = Math.floor(Math.random() * size);
          const y = Math.floor(Math.random() * size);
          const w = 1 + Math.floor(Math.random() * 3);
          const h = 1 + Math.floor(Math.random() * 3);
          // Dark grey and slightly lighter specks
          ctx.fillStyle = Math.random() > 0.5 ? palette.light : palette.dark;
          this.drawWrapped(ctx, x, y, w, h, ctx.fillStyle, size, size);
        }
        // Add some very subtle highlights for shine
        for (let i = 0; i < 20; i++) {
          const x = Math.floor(Math.random() * size);
          const y = Math.floor(Math.random() * size);
          ctx.fillStyle = 'rgba(100, 100, 100, 0.1)';
          ctx.fillRect(x, y, 1, 1);
        }
        break;

      case 'gold':
        ctx.fillStyle = palette.base; // Gold base
        ctx.fillRect(0, 0, size, size);
        
        // Add gold nuggets/veins (brighter and darker gold)
        for (let i = 0; i < 80; i++) {
          const x = Math.floor(Math.random() * size);
          const y = Math.floor(Math.random() * size);
          const w = 2 + Math.floor(Math.random() * 5);
          const h = 2 + Math.floor(Math.random() * 5);
          ctx.fillStyle = Math.random() > 0.5 ? palette.dark : palette.light;
          this.drawWrapped(ctx, x, y, w, h, ctx.fillStyle, size, size);
        }
        // Add bright glints
        for (let i = 0; i < 25; i++) {
          const x = Math.floor(Math.random() * size);
          const y = Math.floor(Math.random() * size);
          ctx.fillStyle = '#FFFF00'; // Pure yellow for glints
          ctx.fillRect(x, y, 2, 2);
        }
        break;

      case 'diamond':
        ctx.fillStyle = palette.dark; // Darker cyan base
        ctx.fillRect(0, 0, size, size);

        // Add crystalline facets
        for (let i = 0; i < 10; i++) {
          const x = Math.floor(Math.random() * size);
          const y = Math.floor(Math.random() * size);
          const s = 10 + Math.floor(Math.random() * 15); // Size of facet
          ctx.fillStyle = Math.random() > 0.5 ? palette.light : palette.base;
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + s, y + s / 2);
          ctx.lineTo(x + s / 2, y + s);
          ctx.fill();
        }
        // Add bright white sparkles
        for (let i = 0; i < 30; i++) {
          const x = Math.floor(Math.random() * size);
          const y = Math.floor(Math.random() * size);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(x, y, 1, 1);
        }
        break;

      default:
        // Fallback: This case should ideally not be reached if all ore types are handled
        // or if a generic ore texture needs to be generated.
        // For now, let's just make it a noticeable magenta if unknown.
        ctx.fillStyle = '#FF00FF'; 
        ctx.fillRect(0, 0, size, size);
        break;
    }

    return canvas;
  }

  // === ENTITY TEXTURES ===

  generatePlayerTexture() {
    const w = 12;
    const h = 24;
    const canvas = this.createCanvas(w, h);
    const ctx = canvas.getContext('2d');

    // Skin (Head/Arms/Legs base)
    ctx.fillStyle = '#FFD5B4'; // Skin tone
    ctx.fillRect(2, 2, 8, 8);   // Head
    ctx.fillRect(0, 10, 3, 8);  // Left Arm
    ctx.fillRect(9, 10, 3, 8);  // Right Arm
    ctx.fillRect(3, 18, 2, 6);  // Left Leg
    ctx.fillRect(7, 18, 2, 6);  // Right Leg

    // Shirt (Default clothes)
    ctx.fillStyle = '#00AAAA'; // Blue shirt
    ctx.fillRect(3, 10, 6, 8); // Body
    ctx.fillRect(0, 10, 3, 2); // Sleeves
    ctx.fillRect(9, 10, 3, 2);

    // Pants
    ctx.fillStyle = '#222288'; // Dark blue pants
    ctx.fillRect(3, 18, 6, 2); // Waist
    ctx.fillRect(3, 20, 2, 4); // Left leg pant
    ctx.fillRect(7, 20, 2, 4); // Right leg pant

    // Shoes
    ctx.fillStyle = '#444444';
    ctx.fillRect(2, 22, 3, 2);
    ctx.fillRect(7, 22, 3, 2);

    // Face
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(4, 5, 1, 1); // Left Eye
    ctx.fillRect(7, 5, 1, 1); // Right Eye
    ctx.fillStyle = '#000000'; // Pupil
    ctx.fillRect(4, 5, 1, 1); // (Small eyes)
    ctx.fillRect(7, 5, 1, 1);

    // Hair
    ctx.fillStyle = '#5C4033'; // Brown hair
    ctx.fillRect(2, 1, 8, 2);  // Top
    ctx.fillRect(1, 2, 1, 3);  // Side
    ctx.fillRect(10, 2, 1, 3); // Side
    ctx.fillRect(2, 2, 8, 1);  // Bangs

    return canvas;
  }

  // === UI TEXTURES ===

  generateUITextures() {
    // 1. UI Panel Background (Dark stone/slate)
    const panelSize = 64;
    const panelCanvas = this.createCanvas(panelSize, panelSize);
    const pCtx = panelCanvas.getContext('2d');
    
    // Dark slate base
    pCtx.fillStyle = '#222233'; 
    pCtx.fillRect(0, 0, panelSize, panelSize);
    
    // Noise/texture
    for (let i = 0; i < 200; i++) {
        const x = Math.floor(Math.random() * panelSize);
        const y = Math.floor(Math.random() * panelSize);
        const alpha = Math.random() * 0.1;
        pCtx.fillStyle = Math.random() > 0.5 ? `rgba(0,0,0,${alpha})` : `rgba(255,255,255,${alpha * 0.5})`;
        pCtx.fillRect(x, y, 2, 2);
    }
    this.textures.ui_panel_bg = panelCanvas;

    // 2. UI Slot (Inset bevel)
    const slotSize = 40;
    const slotCanvas = this.createCanvas(slotSize, slotSize);
    const sCtx = slotCanvas.getContext('2d');
    
    // Background
    sCtx.fillStyle = '#111122';
    sCtx.fillRect(0, 0, slotSize, slotSize);
    
    // Bevel (Dark Top/Left, Light Bottom/Right for inset look? No, Inset is Dark Top/Left inner shadow)
    // Outer border
    sCtx.strokeStyle = '#444455';
    sCtx.lineWidth = 1;
    sCtx.strokeRect(0.5, 0.5, slotSize - 1, slotSize - 1);
    
    // Inner shadow (Top/Left)
    sCtx.fillStyle = '#000000';
    sCtx.fillRect(1, 1, slotSize - 2, 2);
    sCtx.fillRect(1, 1, 2, slotSize - 2);
    
    // Inner Highlight (Bottom/Right)
    sCtx.fillStyle = '#333344';
    sCtx.fillRect(1, slotSize - 3, slotSize - 2, 2);
    sCtx.fillRect(slotSize - 3, 1, 2, slotSize - 2);
    
    this.textures.ui_slot = slotCanvas;

    // 3. UI Slot Selected (Gold border)
    const selCanvas = this.createCanvas(slotSize, slotSize);
    const selCtx = selCanvas.getContext('2d');
    
    // Draw base slot first
    selCtx.drawImage(slotCanvas, 0, 0);
    
    // Gold Border
    selCtx.strokeStyle = '#FFD700';
    selCtx.lineWidth = 2;
    selCtx.strokeRect(1, 1, slotSize - 2, slotSize - 2);
    
    // Glow effect corners
    selCtx.fillStyle = '#FFFFA0';
    selCtx.fillRect(0, 0, 4, 1);
    selCtx.fillRect(0, 0, 1, 4);
    selCtx.fillRect(slotSize - 4, 0, 4, 1);
    selCtx.fillRect(slotSize - 1, 0, 1, 4);
    selCtx.fillRect(0, slotSize - 1, 4, 1);
    selCtx.fillRect(0, slotSize - 4, 1, 4);
    selCtx.fillRect(slotSize - 4, slotSize - 1, 4, 1);
    selCtx.fillRect(slotSize - 1, slotSize - 4, 1, 4);

    this.textures.ui_slot_selected = selCanvas;
  }

  // Generate 12x24 armor overlay texture for player
  generateArmorBodyTexture(slot, material) {
    const w = 12;
    const h = 24;
    const canvas = this.createCanvas(w, h);
    const ctx = canvas.getContext('2d');

    let mainColor, darkColor, lightColor;

    // Define material colors
    switch (material) {
      case 'iron':
        mainColor = '#D8D8D8';
        darkColor = '#A9A9A9';
        lightColor = '#FFFFFF';
        break;
      case 'gold':
        mainColor = '#FFD700';
        darkColor = '#B8860B';
        lightColor = '#FFFFE0';
        break;
      case 'diamond':
        mainColor = '#00FFFF';
        darkColor = '#00CED1';
        lightColor = '#E0FFFF';
        break;
      default:
        return canvas;
    }

    ctx.fillStyle = mainColor;

    if (slot === 'helmet') {
      // Helmet shape covering head
      ctx.fillRect(1, 1, 10, 3); // Top
      ctx.fillRect(1, 4, 2, 5);  // Sides
      ctx.fillRect(9, 4, 2, 5);
      ctx.fillRect(3, 1, 6, 1);  // Highlight top center
      
      // Face guard (partial)
      ctx.fillStyle = darkColor;
      ctx.fillRect(2, 4, 1, 4);
      ctx.fillRect(9, 4, 1, 4);
      
      // Highlight
      ctx.fillStyle = lightColor;
      ctx.fillRect(2, 1, 2, 1);
    } 
    else if (slot === 'chestplate') {
      // Body armor
      ctx.fillRect(2, 10, 8, 9); // Main Chest
      
      // Shoulder pads
      ctx.fillStyle = darkColor;
      ctx.fillRect(0, 9, 4, 3);
      ctx.fillRect(8, 9, 4, 3);
      
      // Highlight
      ctx.fillStyle = lightColor;
      ctx.fillRect(3, 11, 4, 2);
    } 
    else if (slot === 'leggings') {
      // Leg armor
      ctx.fillRect(3, 18, 6, 3); // Waist
      ctx.fillRect(3, 21, 2, 3); // Left Leg
      ctx.fillRect(7, 21, 2, 3); // Right Leg
      
      // Knees
      ctx.fillStyle = darkColor;
      ctx.fillRect(2, 20, 3, 1);
      ctx.fillRect(7, 20, 3, 1);
    }

    return canvas;
  }

  generateZombieTexture() {
    const w = 14;
    const h = 28;
    const canvas = this.createCanvas(w, h);
    const ctx = canvas.getContext('2d');

    // Head (greenish)
    ctx.fillStyle = '#7A9B6E';
    ctx.fillRect(3, 0, 8, 8);

    // Eyes (red)
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(4, 2, 2, 2);
    ctx.fillRect(8, 2, 2, 2);

    // Body (torn clothes)
    ctx.fillStyle = '#5C4033';
    ctx.fillRect(2, 8, 10, 10);

    // Arms
    ctx.fillStyle = '#6B8E5F';
    ctx.fillRect(0, 9, 2, 8);
    ctx.fillRect(12, 9, 2, 8);

    // Legs
    ctx.fillStyle = '#4A6344';
    ctx.fillRect(3, 18, 4, 10);
    ctx.fillRect(7, 18, 4, 10);

    // Decay spots
    ctx.fillStyle = '#3A5A33';
    ctx.fillRect(5, 3, 2, 2);
    ctx.fillRect(4, 10, 2, 2);

    return canvas;
  }

  generateSlimeTexture() {
    const w = 16;
    const h = 16;
    const canvas = this.createCanvas(w, h);
    const ctx = canvas.getContext('2d');

    // Slime body (green blob)
    ctx.fillStyle = '#00FF00';

    // Draw blob shape
    ctx.beginPath();
    ctx.ellipse(8, 10, 7, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shine/highlight
    ctx.fillStyle = '#90FF90';
    ctx.beginPath();
    ctx.ellipse(6, 8, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (black dots)
    ctx.fillStyle = '#000000';
    ctx.fillRect(5, 9, 2, 2);
    ctx.fillRect(9, 9, 2, 2);

    // White eye shine
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(5, 9, 1, 1);
    ctx.fillRect(9, 9, 1, 1);

    // Dark bottom shadow
    ctx.fillStyle = 'rgba(0,100,0,0.5)';
    ctx.fillRect(2, 14, 12, 2);

    return canvas;
  }

  generateBatTexture() {
    const w = 12;
    const h = 10;
    const canvas = this.createCanvas(w, h);
    const ctx = canvas.getContext('2d');

    // Body (dark purple)
    ctx.fillStyle = '#4A0080';
    ctx.fillRect(4, 3, 4, 5);

    // Head
    ctx.fillStyle = '#5A1090';
    ctx.fillRect(5, 2, 2, 2);

    // Wings (spread)
    ctx.fillStyle = '#3A0060';
    // Left wing
    ctx.beginPath();
    ctx.moveTo(4, 4);
    ctx.lineTo(0, 2);
    ctx.lineTo(0, 6);
    ctx.lineTo(4, 7);
    ctx.fill();
    // Right wing
    ctx.beginPath();
    ctx.moveTo(8, 4);
    ctx.lineTo(12, 2);
    ctx.lineTo(12, 6);
    ctx.lineTo(8, 7);
    ctx.fill();

    // Eyes (red glow)
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(5, 3, 1, 1);
    ctx.fillRect(6, 3, 1, 1);

    // Ears
    ctx.fillStyle = '#4A0080';
    ctx.fillRect(4, 1, 1, 2);
    ctx.fillRect(7, 1, 1, 2);

    return canvas;
  }

  generateSkeletonTexture() {
    const w = 14;
    const h = 28;
    const canvas = this.createCanvas(w, h);
    const ctx = canvas.getContext('2d');

    const bone = '#E8E8E8';
    const dark = '#B0B0B0';
    const eye = '#000000';

    // Skull
    ctx.fillStyle = bone;
    ctx.fillRect(4, 0, 6, 6);
    ctx.fillStyle = dark;
    ctx.fillRect(3, 2, 1, 3);
    ctx.fillRect(10, 2, 1, 3);

    // Eye sockets
    ctx.fillStyle = eye;
    ctx.fillRect(5, 2, 2, 2);
    ctx.fillRect(8, 2, 2, 2);

    // Red eyes inside sockets
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(5, 2, 1, 1);
    ctx.fillRect(9, 2, 1, 1);

    // Jaw/teeth
    ctx.fillStyle = dark;
    ctx.fillRect(5, 5, 4, 1);

    // Spine/ribcage
    ctx.fillStyle = bone;
    ctx.fillRect(6, 7, 2, 10);

    // Ribs
    ctx.fillStyle = dark;
    for (let y = 8; y < 15; y += 2) {
      ctx.fillRect(3, y, 3, 1);
      ctx.fillRect(8, y, 3, 1);
    }

    // Pelvis
    ctx.fillStyle = bone;
    ctx.fillRect(4, 17, 6, 2);

    // Legs
    ctx.fillRect(4, 19, 2, 9);
    ctx.fillRect(8, 19, 2, 9);

    // Arms (one holding bow position)
    ctx.fillRect(1, 8, 2, 8);
    ctx.fillRect(11, 8, 2, 8);

    // Bow (brown)
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 6, 1, 12);
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.lineTo(0, 18);
    ctx.stroke();

    return canvas;
  }

  generateDemonTexture() {
    const w = 18;
    const h = 32;
    const canvas = this.createCanvas(w, h);
    const ctx = canvas.getContext('2d');

    const skin = '#8B0000';
    const dark = '#5C0000';
    const horn = '#2F2F2F';

    // Body
    ctx.fillStyle = skin;
    ctx.fillRect(4, 8, 10, 14);

    // Darker shading
    ctx.fillStyle = dark;
    ctx.fillRect(4, 8, 2, 14);
    ctx.fillRect(12, 8, 2, 14);

    // Head
    ctx.fillStyle = skin;
    ctx.fillRect(5, 2, 8, 7);

    // Horns
    ctx.fillStyle = horn;
    ctx.fillRect(4, 0, 2, 4);
    ctx.fillRect(12, 0, 2, 4);
    ctx.fillRect(3, 1, 1, 2);
    ctx.fillRect(14, 1, 1, 2);

    // Glowing eyes
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(6, 4, 2, 2);
    ctx.fillRect(10, 4, 2, 2);
    // Eye glow center
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(6, 4, 1, 1);
    ctx.fillRect(11, 4, 1, 1);

    // Mouth with fangs
    ctx.fillStyle = '#2F0000';
    ctx.fillRect(7, 7, 4, 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(7, 7, 1, 1);
    ctx.fillRect(10, 7, 1, 1);

    // Arms (muscular)
    ctx.fillStyle = skin;
    ctx.fillRect(1, 9, 3, 10);
    ctx.fillRect(14, 9, 3, 10);
    ctx.fillStyle = dark;
    ctx.fillRect(1, 9, 1, 10);
    ctx.fillRect(16, 9, 1, 10);

    // Claws
    ctx.fillStyle = '#1F1F1F';
    ctx.fillRect(1, 19, 1, 2);
    ctx.fillRect(2, 19, 1, 2);
    ctx.fillRect(3, 19, 1, 2);
    ctx.fillRect(14, 19, 1, 2);
    ctx.fillRect(15, 19, 1, 2);
    ctx.fillRect(16, 19, 1, 2);

    // Legs
    ctx.fillStyle = skin;
    ctx.fillRect(5, 22, 3, 10);
    ctx.fillRect(10, 22, 3, 10);
    ctx.fillStyle = dark;
    ctx.fillRect(5, 22, 1, 10);
    ctx.fillRect(12, 22, 1, 10);

    // Hooves
    ctx.fillStyle = '#1F1F1F';
    ctx.fillRect(5, 30, 3, 2);
    ctx.fillRect(10, 30, 3, 2);

    return canvas;
  }

  // Get texture for tile type
  getTileTexture(tileType) {
    return this.textures[tileType];
  }

  // Get entity texture
  getEntityTexture(type) {
    return this.textures[type];
  }

  // Get edge texture
  getEdgeTexture(side) {
    return side === 'left' ? this.textures.edgeLeft : this.textures.edgeRight;
  }

  // Get tall grass texture
  getTallGrassTexture() {
    return this.textures.tallGrass;
  }

  // Get sky palette
  getSkyPalette() {
    return this.PALETTE.sky;
  }

  // ===== ITEM TEXTURES =====

  generateItemTextures() {
    // Pickaxes
    this.textures.item_wooden_pickaxe = this.generatePickaxeTexture('#8B7355', '#5C4033');
    this.textures.item_stone_pickaxe = this.generatePickaxeTexture('#696969', '#4A4A4A');
    this.textures.item_iron_pickaxe = this.generatePickaxeTexture('#B0B0B0', '#808080');
    this.textures.item_gold_pickaxe = this.generatePickaxeTexture('#FFD700', '#DAA520');
    this.textures.item_diamond_pickaxe = this.generatePickaxeTexture('#00FFFF', '#008B8B');

    // Swords
    this.textures.item_wooden_sword = this.generateSwordTexture('#8B7355', '#5C4033');
    this.textures.item_stone_sword = this.generateSwordTexture('#696969', '#4A4A4A');
    this.textures.item_iron_sword = this.generateSwordTexture('#B0B0B0', '#808080');
    this.textures.item_gold_sword = this.generateSwordTexture('#FFD700', '#DAA520');
    this.textures.item_diamond_sword = this.generateSwordTexture('#00FFFF', '#008B8B');

    // Ranged weapons
    this.textures.item_wooden_bow = this.generateBowTexture('#8B7355', '#5C4033');
    this.textures.item_iron_gun = this.generateGunTexture('#B0B0B0', '#696969');
    this.textures.item_magic_staff = this.generateStaffTexture('#9370DB', '#6B4D8C');

    // Armor - Iron
    this.textures.item_iron_helmet = this.generateHelmetTexture('#B0B0B0', '#808080');
    this.textures.item_iron_chestplate = this.generateChestplateTexture('#B0B0B0', '#808080');
    this.textures.item_iron_leggings = this.generateLeggingsTexture('#B0B0B0', '#808080');

    // Armor - Gold
    this.textures.item_gold_helmet = this.generateHelmetTexture('#FFD700', '#DAA520');
    this.textures.item_gold_chestplate = this.generateChestplateTexture('#FFD700', '#DAA520');
    this.textures.item_gold_leggings = this.generateLeggingsTexture('#FFD700', '#DAA520');

    // Armor - Diamond
    this.textures.item_diamond_helmet = this.generateHelmetTexture('#00FFFF', '#008B8B');
    this.textures.item_diamond_chestplate = this.generateChestplateTexture('#00FFFF', '#008B8B');
    this.textures.item_diamond_leggings = this.generateLeggingsTexture('#00FFFF', '#008B8B');

    // Materials
    this.textures.item_iron_bar = this.generateBarTexture('#B0B0B0', '#808080');
    this.textures.item_gold_bar = this.generateBarTexture('#FFD700', '#DAA520');
    this.textures.item_diamond = this.generateGemTexture('#00FFFF', '#008B8B', '#AFEEEE');

    // Ores (small block versions)
    this.textures.item_iron_ore = this.generateOreItemTexture('#B0B0B0', '#696969');
    this.textures.item_coal_ore = this.generateOreItemTexture('#1C1C1C', '#000000');
    this.textures.item_gold_ore = this.generateOreItemTexture('#FFD700', '#696969');
    this.textures.item_diamond_ore = this.generateOreItemTexture('#00FFFF', '#696969');

    // Blocks (small versions)
    this.textures.item_dirt = this.generateBlockItemTexture(this.PALETTE.dirt.base, this.PALETTE.dirt.dark);
    this.textures.item_grass = this.generateGrassBlockItemTexture();
    this.textures.item_stone = this.generateBlockItemTexture(this.PALETTE.stone.base, this.PALETTE.stone.dark);
    this.textures.item_wood = this.generateBlockItemTexture(this.PALETTE.wood.base, this.PALETTE.wood.dark);
    this.textures.item_sand = this.generateBlockItemTexture(this.PALETTE.sand.base, this.PALETTE.sand.dark);
    this.textures.item_log = this.generateLogItemTexture();
    this.textures.item_leaves = this.generateLeavesItemTexture();

    // Special items
    this.textures.item_suspicious_eye = this.generateSuspiciousEyeTexture();
    this.textures.item_workbench = this.generateWorkbenchTexture();
    this.textures.item_furnace = this.generateFurnaceTexture();
    this.textures.item_chest = this.generateChestTexture();

    // Consumables
    this.textures.item_torch = this.generateTorchTexture();
    this.textures.item_lesser_healing_potion = this.generatePotionTexture('#FF6B6B', '#CC5555');
    this.textures.item_healing_potion = this.generatePotionTexture('#FF0000', '#CC0000');
    this.textures.item_bottle = this.generateBottleTexture();
    this.textures.item_gel = this.generateGelTexture();
    this.textures.item_lens = this.generateLensTexture();
  }

  // Pickaxe texture
  generatePickaxeTexture(headColor, handleColor) {
    const size = 24;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Handle (diagonal)
    ctx.fillStyle = handleColor;
    ctx.fillRect(4, 16, 3, 7);
    ctx.fillRect(7, 13, 3, 3);
    ctx.fillRect(10, 10, 2, 3);

    // Handle highlight
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(4, 16, 1, 7);

    // Pickaxe head
    ctx.fillStyle = headColor;
    // Left pick
    ctx.fillRect(2, 4, 3, 2);
    ctx.fillRect(1, 6, 2, 2);
    ctx.fillRect(0, 8, 2, 2);
    // Right pick
    ctx.fillRect(17, 4, 3, 2);
    ctx.fillRect(19, 6, 2, 2);
    ctx.fillRect(20, 8, 2, 2);
    // Center
    ctx.fillRect(5, 4, 12, 4);
    ctx.fillRect(7, 8, 8, 2);

    // Head highlights
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(5, 4, 12, 1);
    ctx.fillRect(2, 4, 1, 2);

    // Head shadows
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(5, 7, 12, 1);

    return canvas;
  }

  // Sword texture
  generateSwordTexture(bladeColor, handleColor) {
    const size = 24;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Handle
    ctx.fillStyle = handleColor;
    ctx.fillRect(3, 18, 4, 5);

    // Guard
    ctx.fillStyle = '#DAA520';
    ctx.fillRect(2, 15, 6, 3);

    // Blade
    ctx.fillStyle = bladeColor;
    ctx.fillRect(4, 2, 2, 13);
    ctx.fillRect(3, 4, 4, 10);

    // Blade tip
    ctx.fillRect(4, 1, 2, 2);
    ctx.fillRect(5, 0, 1, 1);

    // Blade highlight
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(3, 4, 1, 10);
    ctx.fillRect(4, 2, 1, 2);

    // Handle wrap
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(3, 19, 4, 1);
    ctx.fillRect(3, 21, 4, 1);

    return canvas;
  }

  // Bow texture
  generateBowTexture(woodColor, stringColor) {
    const size = 24;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Bow curve
    ctx.fillStyle = woodColor;
    ctx.fillRect(6, 2, 2, 4);
    ctx.fillRect(4, 5, 2, 3);
    ctx.fillRect(3, 8, 2, 8);
    ctx.fillRect(4, 16, 2, 3);
    ctx.fillRect(6, 18, 2, 4);

    // Bow highlights
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(6, 2, 1, 4);
    ctx.fillRect(4, 5, 1, 3);
    ctx.fillRect(3, 8, 1, 8);

    // String
    ctx.fillStyle = '#F5DEB3';
    ctx.fillRect(8, 3, 1, 18);

    // Arrow nock area
    ctx.fillStyle = stringColor;
    ctx.fillRect(7, 11, 2, 2);

    return canvas;
  }

  // Gun texture
  generateGunTexture(metalColor, darkColor) {
    const size = 24;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Barrel
    ctx.fillStyle = metalColor;
    ctx.fillRect(2, 8, 16, 4);
    ctx.fillRect(1, 9, 2, 2);

    // Barrel hole
    ctx.fillStyle = '#000000';
    ctx.fillRect(1, 9, 1, 2);

    // Body
    ctx.fillStyle = darkColor;
    ctx.fillRect(10, 6, 8, 2);
    ctx.fillRect(12, 12, 6, 3);

    // Handle
    ctx.fillStyle = '#5C4033';
    ctx.fillRect(14, 15, 5, 6);
    ctx.fillRect(15, 21, 3, 2);

    // Trigger
    ctx.fillStyle = metalColor;
    ctx.fillRect(12, 13, 2, 3);

    // Highlights
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(2, 8, 14, 1);

    return canvas;
  }

  // Magic staff texture
  generateStaffTexture(gemColor, woodColor) {
    const size = 24;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Staff pole
    ctx.fillStyle = woodColor;
    ctx.fillRect(10, 8, 3, 15);

    // Staff top ornament
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(8, 5, 7, 3);
    ctx.fillRect(9, 4, 5, 1);
    ctx.fillRect(9, 8, 5, 1);

    // Gem
    ctx.fillStyle = gemColor;
    ctx.fillRect(10, 1, 3, 4);
    ctx.fillRect(9, 2, 5, 2);

    // Gem shine
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(10, 1, 1, 2);

    // Staff highlight
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(10, 8, 1, 15);

    return canvas;
  }

  // Armor body texture (wrapper for armor pieces)
  generateArmorBodyTexture(type, material) {
    const colors = {
      iron: { main: '#B0B0B0', dark: '#808080' },
      gold: { main: '#FFD700', dark: '#DAA520' },
      diamond: { main: '#00FFFF', dark: '#008B8B' }
    };

    const color = colors[material] || colors.iron;

    switch (type) {
      case 'helmet':
        return this.generateHelmetTexture(color.main, color.dark);
      case 'chestplate':
        return this.generateChestplateTexture(color.main, color.dark);
      case 'leggings':
        return this.generateLeggingsTexture(color.main, color.dark);
      default:
        return this.generateHelmetTexture(color.main, color.dark);
    }
  }

  // Helmet texture
  generateHelmetTexture(mainColor, darkColor) {
    const size = 24;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Helmet dome
    ctx.fillStyle = mainColor;
    ctx.fillRect(5, 6, 14, 10);
    ctx.fillRect(7, 4, 10, 2);
    ctx.fillRect(9, 3, 6, 1);

    // Visor slit
    ctx.fillStyle = '#000000';
    ctx.fillRect(7, 10, 10, 2);

    // Highlights
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(7, 4, 8, 1);
    ctx.fillRect(5, 6, 1, 8);

    // Shadows
    ctx.fillStyle = darkColor;
    ctx.fillRect(5, 14, 14, 2);
    ctx.fillRect(18, 6, 1, 10);

    return canvas;
  }

  // Chestplate texture
  generateChestplateTexture(mainColor, darkColor) {
    const size = 24;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Main body
    ctx.fillStyle = mainColor;
    ctx.fillRect(4, 4, 16, 14);

    // Neck hole
    ctx.fillStyle = '#000000';
    ctx.fillRect(8, 2, 8, 4);
    ctx.fillStyle = mainColor;
    ctx.fillRect(9, 4, 6, 2);

    // Arm holes
    ctx.fillStyle = darkColor;
    ctx.fillRect(2, 5, 3, 6);
    ctx.fillRect(19, 5, 3, 6);

    // Center line
    ctx.fillStyle = darkColor;
    ctx.fillRect(11, 6, 2, 10);

    // Highlights
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(5, 4, 5, 1);
    ctx.fillRect(4, 5, 1, 12);

    // Bottom edge
    ctx.fillStyle = darkColor;
    ctx.fillRect(4, 16, 16, 2);

    return canvas;
  }

  // Leggings texture
  generateLeggingsTexture(mainColor, darkColor) {
    const size = 24;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Waist
    ctx.fillStyle = mainColor;
    ctx.fillRect(5, 2, 14, 4);

    // Left leg
    ctx.fillRect(5, 6, 6, 14);

    // Right leg
    ctx.fillRect(13, 6, 6, 14);

    // Gap between legs
    ctx.fillStyle = '#000000';
    ctx.fillRect(11, 8, 2, 12);

    // Belt
    ctx.fillStyle = darkColor;
    ctx.fillRect(5, 2, 14, 2);

    // Highlights
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(5, 4, 1, 16);
    ctx.fillRect(13, 4, 1, 16);

    // Knee pads
    ctx.fillStyle = darkColor;
    ctx.fillRect(6, 12, 4, 2);
    ctx.fillRect(14, 12, 4, 2);

    return canvas;
  }

  // Metal bar texture
  generateBarTexture(mainColor, darkColor) {
    const size = 24;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Bar shape (ingot)
    ctx.fillStyle = mainColor;
    ctx.fillRect(3, 10, 18, 8);
    ctx.fillRect(5, 8, 14, 2);
    ctx.fillRect(7, 6, 10, 2);

    // Top highlight
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(7, 6, 10, 1);
    ctx.fillRect(5, 8, 2, 1);

    // Side highlight
    ctx.fillRect(3, 10, 1, 6);

    // Bottom shadow
    ctx.fillStyle = darkColor;
    ctx.fillRect(3, 16, 18, 2);
    ctx.fillRect(20, 10, 1, 8);

    return canvas;
  }

  // Gem texture (diamond)
  generateGemTexture(mainColor, darkColor, lightColor) {
    const size = 24;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Diamond shape
    ctx.fillStyle = mainColor;
    // Top
    ctx.fillRect(10, 4, 4, 2);
    ctx.fillRect(8, 6, 8, 2);
    // Middle
    ctx.fillRect(6, 8, 12, 4);
    // Bottom
    ctx.fillRect(8, 12, 8, 2);
    ctx.fillRect(10, 14, 4, 2);
    ctx.fillRect(11, 16, 2, 2);

    // Light facets
    ctx.fillStyle = lightColor;
    ctx.fillRect(10, 4, 2, 2);
    ctx.fillRect(8, 6, 4, 2);
    ctx.fillRect(6, 8, 4, 4);

    // Dark facets
    ctx.fillStyle = darkColor;
    ctx.fillRect(14, 8, 4, 4);
    ctx.fillRect(12, 12, 4, 2);
    ctx.fillRect(11, 14, 2, 4);

    // Sparkle
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(8, 7, 1, 1);
    ctx.fillRect(7, 9, 1, 1);

    return canvas;
  }

  // Ore item texture (small block)
  generateOreItemTexture(oreColor, stoneColor) {
    const size = 24;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Stone base
    ctx.fillStyle = stoneColor;
    ctx.fillRect(4, 6, 16, 14);

    // Stone texture
    ctx.fillStyle = '#4A4A4A';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(
        4 + Math.random() * 14,
        6 + Math.random() * 12,
        2 + Math.random() * 3,
        2 + Math.random() * 2
      );
    }

    // Ore veins
    ctx.fillStyle = oreColor;
    ctx.fillRect(6, 8, 3, 3);
    ctx.fillRect(14, 10, 4, 3);
    ctx.fillRect(8, 14, 3, 3);

    // Ore highlights
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(6, 8, 2, 1);
    ctx.fillRect(14, 10, 2, 1);
    ctx.fillRect(8, 14, 2, 1);

    // Block edge
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(4, 18, 16, 2);
    ctx.fillRect(18, 6, 2, 14);

    return canvas;
  }

  // Block item texture
  generateBlockItemTexture(mainColor, darkColor) {
    const size = 24;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Block face
    ctx.fillStyle = mainColor;
    ctx.fillRect(4, 6, 16, 14);

    // Texture noise
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? darkColor : 'rgba(255,255,255,0.1)';
      ctx.fillRect(
        4 + Math.random() * 14,
        6 + Math.random() * 12,
        2 + Math.random() * 2,
        1 + Math.random() * 2
      );
    }

    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(4, 6, 16, 2);
    ctx.fillRect(4, 6, 2, 14);

    // Shadow
    ctx.fillStyle = darkColor;
    ctx.fillRect(4, 18, 16, 2);
    ctx.fillRect(18, 6, 2, 14);

    return canvas;
  }

  // Log item texture
  generateLogItemTexture() {
    const size = 24;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Dark bark base
    const darkWood = '#3E2723';
    const midWood = '#5D4037';
    const lightWood = '#795548';

    ctx.fillStyle = darkWood;
    ctx.fillRect(4, 6, 16, 14);

    // Vertical bark ridges
    for (let x = 4; x < 20; x += 3) {
      ctx.fillStyle = Math.random() > 0.5 ? midWood : darkWood;
      ctx.fillRect(x, 6, 2, 14);
      if (Math.random() > 0.5) {
        ctx.fillStyle = lightWood;
        ctx.fillRect(x, 6, 1, 14);
      }
    }

    // Highlight edge
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(4, 6, 16, 2);
    ctx.fillRect(4, 6, 2, 14);

    return canvas;
  }

  // Leaves item texture
  generateLeavesItemTexture() {
    const size = 24;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Base green
    ctx.fillStyle = '#228B22';
    ctx.fillRect(4, 6, 16, 14);

    // Leaf details
    for (let i = 0; i < 15; i++) {
      const shade = Math.random() > 0.5 ? '#006400' : '#32CD32';
      ctx.fillStyle = shade;
      ctx.fillRect(
        4 + Math.random() * 14,
        6 + Math.random() * 12,
        2 + Math.random() * 3,
        2 + Math.random() * 3
      );
    }

    // Light spots (gaps in leaves)
    ctx.fillStyle = 'rgba(135, 206, 235, 0.3)';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(
        5 + Math.random() * 13,
        7 + Math.random() * 11,
        1,
        1
      );
    }

    return canvas;
  }

  // Grass block item texture
  generateGrassBlockItemTexture() {
    const size = 24;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Dirt base
    ctx.fillStyle = this.PALETTE.dirt.base;
    ctx.fillRect(4, 9, 16, 11);

    // Dirt texture
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = this.PALETTE.dirt.dark;
      ctx.fillRect(
        4 + Math.random() * 14,
        9 + Math.random() * 9,
        2 + Math.random() * 2,
        1 + Math.random() * 2
      );
    }

    // Grass top
    ctx.fillStyle = this.PALETTE.grass.mid;
    ctx.fillRect(4, 6, 16, 4);

    // Grass texture
    for (let x = 4; x < 20; x += 2) {
      ctx.fillStyle = Math.random() > 0.5 ? this.PALETTE.grass.top : this.PALETTE.grass.dark;
      ctx.fillRect(x, 6, 2, 1 + Math.random() * 2);
    }

    // Grass blades on top
    ctx.fillStyle = this.PALETTE.grass.mid;
    for (let i = 0; i < 4; i++) {
      const x = 5 + i * 4;
      ctx.fillRect(x, 4 + Math.random() * 2, 1, 2 + Math.random() * 2);
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(4, 18, 16, 2);
    ctx.fillRect(18, 6, 2, 14);

    return canvas;
  }

  // Suspicious eye texture
  generateSuspiciousEyeTexture() {
    const size = 24;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Eye white
    ctx.fillStyle = '#F0F0F0';
    ctx.beginPath();
    ctx.ellipse(12, 12, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Iris
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.ellipse(12, 12, 4, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(12, 12, 2, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye shine
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(9, 9, 2, 2);

    // Veins
    ctx.strokeStyle = '#FF6666';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(5, 10);
    ctx.lineTo(8, 11);
    ctx.moveTo(5, 14);
    ctx.lineTo(8, 13);
    ctx.moveTo(19, 10);
    ctx.lineTo(16, 11);
    ctx.stroke();

    return canvas;
  }

  // Workbench tile texture (64x64 for world rendering)
  generateWorkbenchTileTexture() {
    const size = this.PATTERN_SIZE;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    const tileSize = size / 4; // 16px per tile

    // Create a temporary 16x16 canvas to draw one workbench (scaled down from item style)
    const tCanvas = this.createCanvas(tileSize, tileSize);
    const tCtx = tCanvas.getContext('2d');

    // Draw Workbench (Item style but 16x16)
    // Top (Wood)
    tCtx.fillStyle = '#8B7355';
    tCtx.fillRect(0, 3, 16, 4); // Top slab
    
    // Legs
    tCtx.fillStyle = '#5C4033';
    tCtx.fillRect(2, 7, 3, 9); // Left leg
    tCtx.fillRect(11, 7, 3, 9); // Right leg
    
    // Cross beam
    tCtx.fillRect(5, 10, 6, 2);
    
    // Detail on top
    tCtx.fillStyle = '#6B4423';
    tCtx.fillRect(1, 4, 14, 1);
    
    // Tools
    tCtx.fillStyle = '#B0B0B0';
    tCtx.fillRect(3, 1, 2, 2);
    tCtx.fillRect(10, 2, 3, 1);

    // Draw 4x4 pattern
    for (let ty = 0; ty < 4; ty++) {
      for (let tx = 0; tx < 4; tx++) {
        ctx.drawImage(tCanvas, tx * tileSize, ty * tileSize);
      }
    }

    return canvas;
  }

  // Workbench item texture (24x24 for inventory)
  generateWorkbenchTexture() {
    const size = 24;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Table top
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(2, 6, 20, 4);

    // Table legs
    ctx.fillStyle = '#5C4033';
    ctx.fillRect(3, 10, 3, 10);
    ctx.fillRect(18, 10, 3, 10);

    // Cross beam
    ctx.fillRect(6, 14, 12, 2);

    // Wood grain on top
    ctx.fillStyle = '#6B4423';
    ctx.fillRect(4, 7, 16, 1);
    ctx.fillRect(6, 8, 12, 1);

    // Tools on top
    ctx.fillStyle = '#B0B0B0';
    ctx.fillRect(5, 4, 2, 3);
    ctx.fillRect(16, 5, 3, 2);

    return canvas;
  }

  // Furnace tile texture (64x64 for world rendering)
  generateFurnaceTileTexture() {
    const size = this.PATTERN_SIZE;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    const tileSize = size / 4; // 16px per tile

    // Create a temporary 16x16 canvas
    const tCanvas = this.createCanvas(tileSize, tileSize);
    const tCtx = tCanvas.getContext('2d');

    // Stone body
    tCtx.fillStyle = '#696969';
    tCtx.fillRect(0, 0, 16, 16);
    
    // Texture
    tCtx.fillStyle = '#4A4A4A';
    tCtx.fillRect(2, 2, 2, 2);
    tCtx.fillRect(10, 12, 2, 2);
    tCtx.fillRect(12, 3, 2, 1);
    
    // Fire opening
    tCtx.fillStyle = '#000000';
    tCtx.fillRect(4, 8, 8, 6);
    
    // Fire glow
    tCtx.fillStyle = '#FF4500';
    tCtx.fillRect(5, 10, 6, 3);
    tCtx.fillStyle = '#FFD700';
    tCtx.fillRect(6, 11, 4, 2);

    // Draw 4x4 pattern
    for (let ty = 0; ty < 4; ty++) {
      for (let tx = 0; tx < 4; tx++) {
        ctx.drawImage(tCanvas, tx * tileSize, ty * tileSize);
      }
    }

    return canvas;
  }

  // Furnace item texture (24x24 for inventory)
  generateFurnaceTexture() {
    const size = 24;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Stone body
    ctx.fillStyle = '#696969';
    ctx.fillRect(4, 4, 16, 16);

    // Stone texture
    ctx.fillStyle = '#4A4A4A';
    for (let i = 0; i < 6; i++) {
      ctx.fillRect(
        4 + Math.random() * 14,
        4 + Math.random() * 14,
        2 + Math.random() * 3,
        2 + Math.random() * 2
      );
    }

    // Fire opening
    ctx.fillStyle = '#000000';
    ctx.fillRect(8, 10, 8, 8);

    // Fire glow
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(9, 12, 6, 5);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(10, 13, 4, 3);
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(11, 14, 2, 2);

    // Top chimney hint
    ctx.fillStyle = '#4A4A4A';
    ctx.fillRect(10, 2, 4, 3);

    return canvas;
  }

  // Chest tile texture (64x64)
  generateChestTileTexture() {
    const size = this.PATTERN_SIZE;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    const tileSize = size / 4; // 16px per tile

    // Create a temporary 16x16 canvas
    const tCanvas = this.createCanvas(tileSize, tileSize);
    const tCtx = tCanvas.getContext('2d');

    // Chest Body (Wood)
    tCtx.fillStyle = '#8B4513';
    tCtx.fillRect(1, 4, 14, 12);
    
    // Lid (Top part)
    tCtx.fillStyle = '#A0522D';
    tCtx.fillRect(1, 4, 14, 4);
    
    // Outline / Bands
    tCtx.fillStyle = '#000000'; // Dark outline
    tCtx.fillRect(0, 4, 1, 12); // Left
    tCtx.fillRect(15, 4, 1, 12); // Right
    tCtx.fillRect(1, 3, 14, 1); // Top
    tCtx.fillRect(1, 15, 14, 1); // Bottom
    
    // Lock / Latch
    tCtx.fillStyle = '#FFD700';
    tCtx.fillRect(7, 7, 2, 3);
    
    // Iron Bands (optional, let's keep it simple wood for now or add grey bands)
    tCtx.fillStyle = '#4A4A4A';
    tCtx.fillRect(1, 8, 14, 1); // Separation line

    // Draw 4x4 pattern
    for (let ty = 0; ty < 4; ty++) {
      for (let tx = 0; tx < 4; tx++) {
        ctx.drawImage(tCanvas, tx * tileSize, ty * tileSize);
      }
    }

    return canvas;
  }

  // Chest item texture (24x24)
  generateChestTexture() {
    const size = 24;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Chest Body
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(4, 8, 16, 12);
    
    // Lid
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(4, 6, 16, 4);
    
    // Bands/Outline
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 1;
    ctx.strokeRect(4, 6, 16, 14);
    
    // Separation
    ctx.fillStyle = '#3E2723';
    ctx.fillRect(4, 10, 16, 1);
    
    // Lock
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(11, 9, 2, 3);

    return canvas;
  }

  // Torch item texture
  generateTorchTexture() {
    const size = 24;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Stick
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(10, 8, 4, 14);
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(10, 8, 1, 14);

    // Flame
    ctx.fillStyle = '#FF4500';
    ctx.fillRect(8, 2, 8, 8);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(9, 3, 6, 6);
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(10, 4, 4, 4);

    return canvas;
  }

  // Potion item texture
  generatePotionTexture(liquidColor, darkColor) {
    const size = 24;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Bottle shape
    ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
    ctx.fillRect(9, 2, 6, 4);  // Neck
    ctx.fillRect(7, 6, 10, 14); // Body

    // Cork
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(9, 1, 6, 2);

    // Liquid
    ctx.fillStyle = liquidColor;
    ctx.fillRect(8, 8, 8, 11);
    ctx.fillStyle = darkColor;
    ctx.fillRect(8, 16, 8, 3);

    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(8, 8, 2, 6);

    // Bottle outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(7, 6, 10, 14);

    return canvas;
  }

  // Empty bottle texture
  generateBottleTexture() {
    const size = 24;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Bottle shape (transparent glass)
    ctx.fillStyle = 'rgba(173, 216, 230, 0.4)';
    ctx.fillRect(9, 2, 6, 4);  // Neck
    ctx.fillRect(7, 6, 10, 14); // Body

    // Glass highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(8, 7, 2, 10);
    ctx.fillRect(14, 7, 1, 8);

    // Outline
    ctx.strokeStyle = 'rgba(100, 149, 237, 0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(7, 6, 10, 14);
    ctx.strokeRect(9, 2, 6, 4);

    return canvas;
  }

  // Gel texture
  generateGelTexture() {
    const size = 24;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Gel blob
    ctx.fillStyle = '#00BFFF';
    ctx.fillRect(6, 10, 12, 10);
    ctx.fillRect(8, 8, 8, 2);
    ctx.fillRect(10, 6, 4, 2);

    // Highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(7, 11, 3, 3);
    ctx.fillRect(8, 9, 2, 1);

    // Shadows
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(6, 18, 12, 2);

    return canvas;
  }

  // Lens texture
  generateLensTexture() {
    const size = 24;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Lens disc
    ctx.fillStyle = '#E0E0E0';
    ctx.beginPath();
    ctx.arc(12, 12, 8, 0, Math.PI * 2);
    ctx.fill();

    // Inner reflection
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(9, 9, 3, 0, Math.PI * 2);
    ctx.fill();

    // Outer ring
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(12, 12, 8, 0, Math.PI * 2);
    ctx.stroke();

    // Pupil hint (it's from an eye)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.arc(12, 12, 3, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  }

  // Get item texture by item ID
  getItemTexture(itemId) {
    // Convert item ID to texture key
    const textureKey = 'item_' + itemId;
    return this.textures[textureKey] || null;
  }
}
