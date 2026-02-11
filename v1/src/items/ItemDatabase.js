// ItemDatabase - All item definitions
import { Item } from './Item.js';
import { TILE } from '../utils/Constants.js';

// Item type constants
export const ITEM_TYPE = {
  BLOCK: 'BLOCK',
  TOOL: 'TOOL',
  WEAPON: 'WEAPON',
  ARMOR: 'ARMOR',
  CONSUMABLE: 'CONSUMABLE',
  SUMMONING: 'SUMMONING'
};

export const TOOL_TYPE = {
  PICKAXE: 'PICKAXE',
  AXE: 'AXE',
  SHOVEL: 'SHOVEL'
};

// All items in the game
const ITEMS = {};

// Helper to register items
function registerItem(item) {
  ITEMS[item.id] = item;
  return item;
}

// ===== BLOCKS =====

registerItem(new Item({
  id: 'dirt',
  name: 'Dirt',
  type: ITEM_TYPE.BLOCK,
  tileType: TILE.DIRT,
  stackable: true,
  maxStack: 999,
  color: '#8B4513'
}));

registerItem(new Item({
  id: 'grass',
  name: 'Grass',
  type: ITEM_TYPE.BLOCK,
  tileType: TILE.GRASS,
  stackable: true,
  maxStack: 999,
  color: '#228B22'
}));

registerItem(new Item({
  id: 'stone',
  name: 'Stone',
  type: ITEM_TYPE.BLOCK,
  tileType: TILE.STONE,
  stackable: true,
  maxStack: 999,
  color: '#696969'
}));

registerItem(new Item({
  id: 'wood',
  name: 'Wood',
  type: ITEM_TYPE.BLOCK,
  tileType: TILE.WOOD,
  stackable: true,
  maxStack: 999,
  color: '#A0522D'
}));

registerItem(new Item({
  id: 'sand',
  name: 'Sand',
  type: ITEM_TYPE.BLOCK,
  tileType: TILE.SAND,
  stackable: true,
  maxStack: 999,
  color: '#F4A460'
}));

registerItem(new Item({
  id: 'iron_ore',
  name: 'Iron Ore',
  type: ITEM_TYPE.BLOCK,
  tileType: TILE.IRON_ORE,
  stackable: true,
  maxStack: 999,
  color: '#B0B0B0'
}));

registerItem(new Item({
  id: 'coal_ore',
  name: 'Coal Ore',
  type: ITEM_TYPE.BLOCK,
  tileType: TILE.COAL_ORE,
  stackable: true,
  maxStack: 999,
  color: '#1C1C1C'
}));

registerItem(new Item({
  id: 'gold_ore',
  name: 'Gold Ore',
  type: ITEM_TYPE.BLOCK,
  tileType: TILE.GOLD_ORE,
  stackable: true,
  maxStack: 999,
  color: '#FFD700'
}));

registerItem(new Item({
  id: 'diamond_ore',
  name: 'Diamond Ore',
  type: ITEM_TYPE.BLOCK,
  tileType: TILE.DIAMOND_ORE,
  stackable: true,
  maxStack: 999,
  color: '#00FFFF'
}));

registerItem(new Item({
  id: 'workbench',
  name: 'Workbench',
  type: ITEM_TYPE.BLOCK,
  tileType: TILE.BRICK, // Temporary, will add proper tile later
  stackable: true,
  maxStack: 99,
  color: '#8B4513'
}));

registerItem(new Item({
  id: 'furnace',
  name: 'Furnace',
  type: ITEM_TYPE.BLOCK,
  tileType: TILE.BRICK, // Temporary, will add proper tile later
  stackable: true,
  maxStack: 99,
  color: '#696969'
}));

// ===== MATERIALS =====

registerItem(new Item({
  id: 'iron_bar',
  name: 'Iron Bar',
  type: ITEM_TYPE.BLOCK,
  tileType: null,
  stackable: true,
  maxStack: 999,
  color: '#C0C0C0'
}));

registerItem(new Item({
  id: 'gold_bar',
  name: 'Gold Bar',
  type: ITEM_TYPE.BLOCK,
  tileType: null,
  stackable: true,
  maxStack: 999,
  color: '#FFD700'
}));

registerItem(new Item({
  id: 'diamond',
  name: 'Diamond',
  type: ITEM_TYPE.BLOCK,
  tileType: null,
  stackable: true,
  maxStack: 999,
  color: '#00FFFF'
}));

// ===== TOOLS =====

registerItem(new Item({
  id: 'wooden_pickaxe',
  name: 'Wooden Pickaxe',
  type: ITEM_TYPE.TOOL,
  toolType: TOOL_TYPE.PICKAXE,
  toolPower: 1,
  stackable: false,
  durability: 50,
  color: '#8B7355'
}));

registerItem(new Item({
  id: 'stone_pickaxe',
  name: 'Stone Pickaxe',
  type: ITEM_TYPE.TOOL,
  toolType: TOOL_TYPE.PICKAXE,
  toolPower: 2,
  stackable: false,
  durability: 100,
  color: '#696969'
}));

registerItem(new Item({
  id: 'iron_pickaxe',
  name: 'Iron Pickaxe',
  type: ITEM_TYPE.TOOL,
  toolType: TOOL_TYPE.PICKAXE,
  toolPower: 3,
  stackable: false,
  durability: 250,
  color: '#B0B0B0'
}));

registerItem(new Item({
  id: 'gold_pickaxe',
  name: 'Gold Pickaxe',
  type: ITEM_TYPE.TOOL,
  toolType: TOOL_TYPE.PICKAXE,
  toolPower: 4,
  stackable: false,
  durability: 150,
  color: '#FFD700'
}));

registerItem(new Item({
  id: 'diamond_pickaxe',
  name: 'Diamond Pickaxe',
  type: ITEM_TYPE.TOOL,
  toolType: TOOL_TYPE.PICKAXE,
  toolPower: 5,
  stackable: false,
  durability: 500,
  color: '#00FFFF'
}));

// ===== WEAPONS =====

registerItem(new Item({
  id: 'wooden_sword',
  name: 'Wooden Sword',
  type: ITEM_TYPE.WEAPON,
  stackable: false,
  durability: 50,
  damage: 10,
  attackSpeed: 1.2,
  color: '#8B7355'
}));

registerItem(new Item({
  id: 'stone_sword',
  name: 'Stone Sword',
  type: ITEM_TYPE.WEAPON,
  stackable: false,
  durability: 100,
  damage: 15,
  attackSpeed: 1.0,
  color: '#696969'
}));

registerItem(new Item({
  id: 'iron_sword',
  name: 'Iron Sword',
  type: ITEM_TYPE.WEAPON,
  stackable: false,
  durability: 250,
  damage: 25,
  attackSpeed: 1.1,
  color: '#B0B0B0'
}));

registerItem(new Item({
  id: 'gold_sword',
  name: 'Gold Sword',
  type: ITEM_TYPE.WEAPON,
  stackable: false,
  durability: 150,
  damage: 20,
  attackSpeed: 1.5,
  color: '#FFD700'
}));

registerItem(new Item({
  id: 'diamond_sword',
  name: 'Diamond Sword',
  type: ITEM_TYPE.WEAPON,
  stackable: false,
  durability: 500,
  damage: 35,
  attackSpeed: 1.2,
  color: '#00FFFF'
}));

// ===== RANGED WEAPONS =====

registerItem(new Item({
  id: 'wooden_bow',
  name: 'Wooden Bow',
  type: ITEM_TYPE.WEAPON,
  stackable: false,
  durability: 100,
  damage: 12,
  attackSpeed: 0.8,
  projectileSpeed: 400,
  isRanged: true,
  color: '#8B7355'
}));

registerItem(new Item({
  id: 'iron_gun',
  name: 'Iron Gun',
  type: ITEM_TYPE.WEAPON,
  stackable: false,
  durability: 250,
  damage: 20,
  attackSpeed: 2.0,
  projectileSpeed: 600,
  isRanged: true,
  color: '#B0B0B0'
}));

registerItem(new Item({
  id: 'magic_staff',
  name: 'Magic Staff',
  type: ITEM_TYPE.WEAPON,
  stackable: false,
  durability: 200,
  damage: 25,
  attackSpeed: 1.5,
  projectileSpeed: 350,
  isRanged: true,
  color: '#9370DB'
}));

// ===== ARMOR =====

// Iron Armor
registerItem(new Item({
  id: 'iron_helmet',
  name: 'Iron Helmet',
  type: ITEM_TYPE.ARMOR,
  equipSlot: 'helmet',
  stackable: false,
  defense: 2,
  armorTier: 'iron',
  color: '#B0B0B0'
}));

registerItem(new Item({
  id: 'iron_chestplate',
  name: 'Iron Chestplate',
  type: ITEM_TYPE.ARMOR,
  equipSlot: 'chestplate',
  stackable: false,
  defense: 3,
  armorTier: 'iron',
  color: '#B0B0B0'
}));

registerItem(new Item({
  id: 'iron_leggings',
  name: 'Iron Leggings',
  type: ITEM_TYPE.ARMOR,
  equipSlot: 'leggings',
  stackable: false,
  defense: 2,
  armorTier: 'iron',
  color: '#B0B0B0'
}));

// Gold Armor
registerItem(new Item({
  id: 'gold_helmet',
  name: 'Gold Helmet',
  type: ITEM_TYPE.ARMOR,
  equipSlot: 'helmet',
  stackable: false,
  defense: 3,
  armorTier: 'gold',
  bonusStats: { attackBonus: 1 },
  color: '#FFD700'
}));

registerItem(new Item({
  id: 'gold_chestplate',
  name: 'Gold Chestplate',
  type: ITEM_TYPE.ARMOR,
  equipSlot: 'chestplate',
  stackable: false,
  defense: 4,
  armorTier: 'gold',
  bonusStats: { attackBonus: 2 },
  color: '#FFD700'
}));

registerItem(new Item({
  id: 'gold_leggings',
  name: 'Gold Leggings',
  type: ITEM_TYPE.ARMOR,
  equipSlot: 'leggings',
  stackable: false,
  defense: 3,
  armorTier: 'gold',
  bonusStats: { attackBonus: 1 },
  color: '#FFD700'
}));

// Diamond Armor
registerItem(new Item({
  id: 'diamond_helmet',
  name: 'Diamond Helmet',
  type: ITEM_TYPE.ARMOR,
  equipSlot: 'helmet',
  stackable: false,
  defense: 4,
  armorTier: 'diamond',
  bonusStats: { maxHealth: 10 },
  color: '#00FFFF'
}));

registerItem(new Item({
  id: 'diamond_chestplate',
  name: 'Diamond Chestplate',
  type: ITEM_TYPE.ARMOR,
  equipSlot: 'chestplate',
  stackable: false,
  defense: 6,
  armorTier: 'diamond',
  bonusStats: { maxHealth: 15 },
  color: '#00FFFF'
}));

registerItem(new Item({
  id: 'diamond_leggings',
  name: 'Diamond Leggings',
  type: ITEM_TYPE.ARMOR,
  equipSlot: 'leggings',
  stackable: false,
  defense: 5,
  armorTier: 'diamond',
  bonusStats: { maxHealth: 10 },
  color: '#00FFFF'
}));

// ===== SUMMONING ITEMS =====

registerItem(new Item({
  id: 'suspicious_eye',
  name: 'Suspicious Eye',
  type: ITEM_TYPE.SUMMONING,
  stackable: true,
  maxStack: 20,
  summonsBoss: 'eye_of_terror',
  color: '#FF0000'
}));

// ===== WALLS =====

registerItem(new Item({
  id: 'dirt_wall',
  name: 'Dirt Wall',
  type: ITEM_TYPE.BLOCK,
  tileType: null,
  wallType: 1, // WALL.DIRT_WALL
  stackable: true,
  maxStack: 999,
  color: '#5C2E0F'
}));

registerItem(new Item({
  id: 'stone_wall',
  name: 'Stone Wall',
  type: ITEM_TYPE.BLOCK,
  tileType: null,
  wallType: 2, // WALL.STONE_WALL
  stackable: true,
  maxStack: 999,
  color: '#3F3F3F'
}));

registerItem(new Item({
  id: 'wood_wall',
  name: 'Wood Wall',
  type: ITEM_TYPE.BLOCK,
  tileType: null,
  wallType: 3, // WALL.WOOD_WALL
  stackable: true,
  maxStack: 999,
  color: '#6B3410'
}));

// Export functions to access items

export class ItemDatabase {
  // Get item by ID
  static getItem(id) {
    return ITEMS[id] ? ITEMS[id].clone() : null;
  }

  // Get all items
  static getAllItems() {
    return Object.values(ITEMS);
  }

  // Get item by tile type (for when tiles are mined)
  static getItemForTile(tileType) {
    const tileToItem = {
      [TILE.DIRT]: 'dirt',
      [TILE.GRASS]: 'dirt', // Grass drops dirt
      [TILE.STONE]: 'stone',
      [TILE.WOOD]: 'wood',
      [TILE.SAND]: 'sand',
      [TILE.IRON_ORE]: 'iron_ore',
      [TILE.COAL_ORE]: 'coal_ore',
      [TILE.GOLD_ORE]: 'gold_ore',
      [TILE.DIAMOND_ORE]: 'diamond_ore'
    };

    const itemId = tileToItem[tileType];
    return itemId ? this.getItem(itemId) : null;
  }

  // Check if item exists
  static hasItem(id) {
    return ITEMS.hasOwnProperty(id);
  }
}
