// Game Constants

// Tile types
export const TILE = {
  AIR: 0,
  DIRT: 1,
  GRASS: 2,
  STONE: 3,
  WOOD: 4,
  SAND: 5,
  IRON_ORE: 6,
  COAL_ORE: 7,
  GOLD_ORE: 8,
  DIAMOND_ORE: 9,
  BRICK: 10,
  GLASS: 11,
  LEAVES: 12,
  WATER: 13,
  LAVA: 14,
};

// Wall types (background tiles)
export const WALL = {
  AIR: 0,
  DIRT_WALL: 1,
  STONE_WALL: 2,
  WOOD_WALL: 3,
};

// Tile properties
export const TILE_PROPS = {
  [TILE.AIR]: { solid: false, health: 0, transparent: true },
  [TILE.DIRT]: { solid: true, health: 100, transparent: false },
  [TILE.GRASS]: { solid: true, health: 100, transparent: false },
  [TILE.STONE]: { solid: true, health: 200, transparent: false },
  [TILE.WOOD]: { solid: true, health: 150, transparent: false },
  [TILE.SAND]: { solid: true, health: 80, transparent: false },
  [TILE.IRON_ORE]: { solid: true, health: 300, transparent: false },
  [TILE.COAL_ORE]: { solid: true, health: 250, transparent: false },
  [TILE.GOLD_ORE]: { solid: true, health: 400, transparent: false },
  [TILE.DIAMOND_ORE]: { solid: true, health: 500, transparent: false },
  [TILE.BRICK]: { solid: true, health: 250, transparent: false },
  [TILE.GLASS]: { solid: true, health: 50, transparent: true },
  [TILE.LEAVES]: { solid: false, health: 50, transparent: true },
  [TILE.WATER]: { solid: false, health: 0, transparent: true },
  [TILE.LAVA]: { solid: false, health: 0, transparent: true },
};

// World constants
export const TILE_SIZE = 16; // pixels per tile
export const CHUNK_SIZE = 32; // tiles per chunk
export const CHUNK_PIXEL_SIZE = TILE_SIZE * CHUNK_SIZE; // 512 pixels

// World generation
export const WORLD_HEIGHT = 256; // tiles
export const SURFACE_LEVEL = 64; // average surface height
export const BEDROCK_LEVEL = WORLD_HEIGHT - 10;
export const CAVE_THRESHOLD = 0.3;
export const ORE_SPAWN_DEPTH = 40; // tiles below surface

// Physics constants
export const GRAVITY = 800; // pixels/second^2
export const TERMINAL_VELOCITY = 600; // max fall speed
export const FRICTION = 0.85; // ground friction multiplier
export const AIR_RESISTANCE = 0.98; // air friction multiplier

// Player constants
export const PLAYER_WIDTH = 12;
export const PLAYER_HEIGHT = 24;
export const PLAYER_SPEED = 150; // pixels/second
export const PLAYER_JUMP_FORCE = 400; // pixels/second
export const PLAYER_MAX_HEALTH = 100;
export const PLAYER_REACH = 5; // tiles

// Camera constants
export const CAMERA_SMOOTHNESS = 0.1; // lerp amount (lower = smoother)
export const CAMERA_DEADZONE = 50; // pixels before camera starts moving

// Rendering constants
export const LAYER = {
  BACKGROUND: 0,
  TILES: 1,
  ENTITIES: 2,
  UI: 3,
};

// Input keys
export const KEYS = {
  MOVE_LEFT: ['a', 'A', 'ArrowLeft'],
  MOVE_RIGHT: ['d', 'D', 'ArrowRight'],
  JUMP: [' ', 'w', 'W', 'ArrowUp'],
  INVENTORY: ['e', 'E', 'Tab'],
  CRAFT: ['c', 'C'],
};

// Colors for rendering (when sprites aren't loaded)
export const TILE_COLORS = {
  [TILE.AIR]: '#87CEEB', // Sky blue
  [TILE.DIRT]: '#8B4513', // Brown
  [TILE.GRASS]: '#228B22', // Green
  [TILE.STONE]: '#696969', // Gray
  [TILE.WOOD]: '#A0522D', // Sienna
  [TILE.SAND]: '#F4A460', // Sandy brown
  [TILE.IRON_ORE]: '#B0B0B0', // Silver
  [TILE.COAL_ORE]: '#1C1C1C', // Almost black
  [TILE.GOLD_ORE]: '#FFD700', // Gold
  [TILE.DIAMOND_ORE]: '#00FFFF', // Cyan
  [TILE.BRICK]: '#A0522D', // Brick color
  [TILE.GLASS]: '#E0E0E0', // Light gray
  [TILE.LEAVES]: '#006400', // Dark green
  [TILE.WATER]: '#4169E1', // Royal blue
  [TILE.LAVA]: '#FF4500', // Orange red
};

// Wall colors (darker versions of tiles for background)
export const WALL_COLORS = {
  [WALL.AIR]: 'transparent',
  [WALL.DIRT_WALL]: '#5C2E0F', // Dark brown
  [WALL.STONE_WALL]: '#3F3F3F', // Dark gray
  [WALL.WOOD_WALL]: '#6B3410', // Dark sienna
};

// UI Constants
export const HOTBAR_SLOTS = 10;
export const INVENTORY_ROWS = 4;
export const INVENTORY_COLS = 10;
export const INVENTORY_SIZE = INVENTORY_ROWS * INVENTORY_COLS;

// Debug
export const DEBUG_MODE = true;
export const SHOW_CHUNK_BORDERS = false;
export const SHOW_COLLISION_BOXES = false;
