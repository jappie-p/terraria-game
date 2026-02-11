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
        base: '#B0B0B0',
        dark: '#808080',
        light: '#D3D3D3',
        ore: '#A0522D'
      },
      gold: {
        base: '#FFD700',
        dark: '#DAA520',
        light: '#FFEC8B',
        ore: '#696969'
      },
      diamond: {
        base: '#00FFFF',
        dark: '#008B8B',
        light: '#AFEEEE',
        ore: '#2F4F4F'
      },
      coal: {
        base: '#1C1C1C',
        dark: '#000000',
        light: '#3A3A3A',
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
    this.textures[TILE.IRON_ORE] = this.generateOreTexture('iron');
    this.textures[TILE.GOLD_ORE] = this.generateOreTexture('gold');
    this.textures[TILE.DIAMOND_ORE] = this.generateOreTexture('diamond');
    this.textures[TILE.COAL_ORE] = this.generateOreTexture('coal');

    // Decorative textures
    this.textures.edgeLeft = this.generateGrassEdgeTexture(false);
    this.textures.edgeRight = this.generateGrassEdgeTexture(true);
    this.textures.tallGrass = this.generateTallGrassTexture();

    // Entity textures
    this.textures.player = this.generatePlayerTexture();
    this.textures.zombie = this.generateZombieTexture();
    this.textures.slime = this.generateSlimeTexture();

    // Item textures
    this.generateItemTextures();

    console.log('Textures generated!');
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

  generateOreTexture(oreType) {
    const size = this.PATTERN_SIZE;
    const canvas = this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Stone base
    const stoneTexture = this.generateStoneTexture();
    ctx.drawImage(stoneTexture, 0, 0);

    // Ore veins
    const palette = this.PALETTE[oreType];
    const numVeins = 5 + Math.floor(Math.random() * 5);

    for (let i = 0; i < numVeins; i++) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      const w = 2 + Math.floor(Math.random() * 4);
      const h = 2 + Math.floor(Math.random() * 4);

      // Ore color
      this.drawWrapped(ctx, x, y, w, h, palette.base, size, size);

      // Shine
      ctx.fillStyle = palette.light;
      ctx.fillRect(x, y, Math.max(1, w - 1), 1);
      ctx.fillRect(x, y, 1, Math.max(1, h - 1));

      // Shadow
      ctx.fillStyle = palette.dark;
      ctx.fillRect(x + 1, y + h - 1, w - 1, 1);
      ctx.fillRect(x + w - 1, y + 1, 1, h - 1);
    }

    return canvas;
  }

  // === ENTITY TEXTURES ===

  generatePlayerTexture() {
    const w = 12;
    const h = 24;
    const canvas = this.createCanvas(w, h);
    const ctx = canvas.getContext('2d');

    // Knight armor (gray/silver)
    // Helmet
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(2, 0, 8, 6);
    ctx.fillStyle = '#000000';
    ctx.fillRect(3, 2, 2, 2); // Visor

    // Body (chestplate)
    ctx.fillStyle = '#A8A8A8';
    ctx.fillRect(2, 6, 8, 8);

    // Arms
    ctx.fillStyle = '#909090';
    ctx.fillRect(0, 7, 2, 6);
    ctx.fillRect(10, 7, 2, 6);

    // Legs
    ctx.fillStyle = '#606060';
    ctx.fillRect(3, 14, 3, 10);
    ctx.fillRect(6, 14, 3, 10);

    // Highlights
    ctx.fillStyle = '#E0E0E0';
    ctx.fillRect(2, 6, 6, 1);
    ctx.fillRect(2, 6, 1, 6);

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

    // Special items
    this.textures.item_suspicious_eye = this.generateSuspiciousEyeTexture();
    this.textures.item_workbench = this.generateWorkbenchTexture();
    this.textures.item_furnace = this.generateFurnaceTexture();
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

  // Workbench texture
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

  // Furnace texture
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

  // Get item texture by item ID
  getItemTexture(itemId) {
    // Convert item ID to texture key
    const textureKey = 'item_' + itemId;
    return this.textures[textureKey] || null;
  }
}
