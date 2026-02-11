// RecipeDatabase - All crafting recipes
import { Recipe } from './Recipe.js';

const RECIPES = [];

// Helper to register recipes
function registerRecipe(recipe) {
  RECIPES.push(recipe);
  return recipe;
}

// ===== WORKSTATIONS =====

registerRecipe(new Recipe({
  id: 'workbench',
  result: { itemId: 'workbench', count: 1 },
  ingredients: [
    { itemId: 'wood', count: 10 }
  ],
  workstation: 'HAND',
  category: 'WORKSTATIONS'
}));

registerRecipe(new Recipe({
  id: 'furnace',
  result: { itemId: 'furnace', count: 1 },
  ingredients: [
    { itemId: 'stone', count: 20 }
  ],
  workstation: 'HAND',
  category: 'WORKSTATIONS'
}));

// ===== TOOLS - WORKBENCH =====

registerRecipe(new Recipe({
  id: 'wooden_pickaxe',
  result: { itemId: 'wooden_pickaxe', count: 1 },
  ingredients: [
    { itemId: 'wood', count: 10 }
  ],
  workstation: 'WORKBENCH',
  category: 'TOOLS'
}));

registerRecipe(new Recipe({
  id: 'stone_pickaxe',
  result: { itemId: 'stone_pickaxe', count: 1 },
  ingredients: [
    { itemId: 'wood', count: 5 },
    { itemId: 'stone', count: 15 }
  ],
  workstation: 'WORKBENCH',
  category: 'TOOLS'
}));

registerRecipe(new Recipe({
  id: 'iron_pickaxe',
  result: { itemId: 'iron_pickaxe', count: 1 },
  ingredients: [
    { itemId: 'wood', count: 5 },
    { itemId: 'iron_bar', count: 12 }
  ],
  workstation: 'WORKBENCH',
  category: 'TOOLS'
}));

registerRecipe(new Recipe({
  id: 'gold_pickaxe',
  result: { itemId: 'gold_pickaxe', count: 1 },
  ingredients: [
    { itemId: 'wood', count: 5 },
    { itemId: 'gold_bar', count: 12 }
  ],
  workstation: 'WORKBENCH',
  category: 'TOOLS'
}));

registerRecipe(new Recipe({
  id: 'diamond_pickaxe',
  result: { itemId: 'diamond_pickaxe', count: 1 },
  ingredients: [
    { itemId: 'wood', count: 5 },
    { itemId: 'diamond', count: 10 }
  ],
  workstation: 'WORKBENCH',
  category: 'TOOLS'
}));

// ===== WEAPONS - WORKBENCH =====

registerRecipe(new Recipe({
  id: 'wooden_sword',
  result: { itemId: 'wooden_sword', count: 1 },
  ingredients: [
    { itemId: 'wood', count: 7 }
  ],
  workstation: 'WORKBENCH',
  category: 'WEAPONS'
}));

registerRecipe(new Recipe({
  id: 'stone_sword',
  result: { itemId: 'stone_sword', count: 1 },
  ingredients: [
    { itemId: 'wood', count: 3 },
    { itemId: 'stone', count: 10 }
  ],
  workstation: 'WORKBENCH',
  category: 'WEAPONS'
}));

registerRecipe(new Recipe({
  id: 'iron_sword',
  result: { itemId: 'iron_sword', count: 1 },
  ingredients: [
    { itemId: 'wood', count: 3 },
    { itemId: 'iron_bar', count: 8 }
  ],
  workstation: 'WORKBENCH',
  category: 'WEAPONS'
}));

registerRecipe(new Recipe({
  id: 'gold_sword',
  result: { itemId: 'gold_sword', count: 1 },
  ingredients: [
    { itemId: 'wood', count: 3 },
    { itemId: 'gold_bar', count: 8 }
  ],
  workstation: 'WORKBENCH',
  category: 'WEAPONS'
}));

registerRecipe(new Recipe({
  id: 'diamond_sword',
  result: { itemId: 'diamond_sword', count: 1 },
  ingredients: [
    { itemId: 'wood', count: 3 },
    { itemId: 'diamond', count: 7 }
  ],
  workstation: 'WORKBENCH',
  category: 'WEAPONS'
}));

// Ranged Weapons
registerRecipe(new Recipe({
  id: 'wooden_bow',
  result: { itemId: 'wooden_bow', count: 1 },
  ingredients: [
    { itemId: 'wood', count: 10 }
  ],
  workstation: 'WORKBENCH',
  category: 'WEAPONS'
}));

registerRecipe(new Recipe({
  id: 'iron_gun',
  result: { itemId: 'iron_gun', count: 1 },
  ingredients: [
    { itemId: 'iron_bar', count: 15 }
  ],
  workstation: 'WORKBENCH',
  category: 'WEAPONS'
}));

registerRecipe(new Recipe({
  id: 'magic_staff',
  result: { itemId: 'magic_staff', count: 1 },
  ingredients: [
    { itemId: 'wood', count: 5 },
    { itemId: 'diamond', count: 5 }
  ],
  workstation: 'WORKBENCH',
  category: 'WEAPONS'
}));

// ===== ARMOR - WORKBENCH =====

// Iron Armor
registerRecipe(new Recipe({
  id: 'iron_helmet',
  result: { itemId: 'iron_helmet', count: 1 },
  ingredients: [
    { itemId: 'iron_bar', count: 5 }
  ],
  workstation: 'WORKBENCH',
  category: 'ARMOR'
}));

registerRecipe(new Recipe({
  id: 'iron_chestplate',
  result: { itemId: 'iron_chestplate', count: 1 },
  ingredients: [
    { itemId: 'iron_bar', count: 8 }
  ],
  workstation: 'WORKBENCH',
  category: 'ARMOR'
}));

registerRecipe(new Recipe({
  id: 'iron_leggings',
  result: { itemId: 'iron_leggings', count: 1 },
  ingredients: [
    { itemId: 'iron_bar', count: 7 }
  ],
  workstation: 'WORKBENCH',
  category: 'ARMOR'
}));

// Gold Armor
registerRecipe(new Recipe({
  id: 'gold_helmet',
  result: { itemId: 'gold_helmet', count: 1 },
  ingredients: [
    { itemId: 'gold_bar', count: 5 }
  ],
  workstation: 'WORKBENCH',
  category: 'ARMOR'
}));

registerRecipe(new Recipe({
  id: 'gold_chestplate',
  result: { itemId: 'gold_chestplate', count: 1 },
  ingredients: [
    { itemId: 'gold_bar', count: 8 }
  ],
  workstation: 'WORKBENCH',
  category: 'ARMOR'
}));

registerRecipe(new Recipe({
  id: 'gold_leggings',
  result: { itemId: 'gold_leggings', count: 1 },
  ingredients: [
    { itemId: 'gold_bar', count: 7 }
  ],
  workstation: 'WORKBENCH',
  category: 'ARMOR'
}));

// Diamond Armor
registerRecipe(new Recipe({
  id: 'diamond_helmet',
  result: { itemId: 'diamond_helmet', count: 1 },
  ingredients: [
    { itemId: 'diamond', count: 5 }
  ],
  workstation: 'WORKBENCH',
  category: 'ARMOR'
}));

registerRecipe(new Recipe({
  id: 'diamond_chestplate',
  result: { itemId: 'diamond_chestplate', count: 1 },
  ingredients: [
    { itemId: 'diamond', count: 8 }
  ],
  workstation: 'WORKBENCH',
  category: 'ARMOR'
}));

registerRecipe(new Recipe({
  id: 'diamond_leggings',
  result: { itemId: 'diamond_leggings', count: 1 },
  ingredients: [
    { itemId: 'diamond', count: 7 }
  ],
  workstation: 'WORKBENCH',
  category: 'ARMOR'
}));

// ===== SMELTING - FURNACE =====

registerRecipe(new Recipe({
  id: 'smelt_iron',
  result: { itemId: 'iron_bar', count: 1 },
  ingredients: [
    { itemId: 'iron_ore', count: 3 },
    { itemId: 'coal_ore', count: 1 }
  ],
  workstation: 'FURNACE',
  category: 'SMELTING'
}));

registerRecipe(new Recipe({
  id: 'smelt_gold',
  result: { itemId: 'gold_bar', count: 1 },
  ingredients: [
    { itemId: 'gold_ore', count: 4 },
    { itemId: 'coal_ore', count: 1 }
  ],
  workstation: 'FURNACE',
  category: 'SMELTING'
}));

registerRecipe(new Recipe({
  id: 'smelt_diamond',
  result: { itemId: 'diamond', count: 1 },
  ingredients: [
    { itemId: 'diamond_ore', count: 1 },
    { itemId: 'coal_ore', count: 1 }
  ],
  workstation: 'FURNACE',
  category: 'SMELTING'
}));

// ===== SUMMONING ITEMS =====

registerRecipe(new Recipe({
  id: 'suspicious_eye',
  result: { itemId: 'suspicious_eye', count: 1 },
  ingredients: [
    { itemId: 'iron_bar', count: 5 },
    { itemId: 'diamond', count: 3 }
  ],
  workstation: 'WORKBENCH',
  category: 'SUMMONING'
}));

// ===== WALLS - WORKBENCH =====

registerRecipe(new Recipe({
  id: 'dirt_wall',
  result: { itemId: 'dirt_wall', count: 4 },
  ingredients: [
    { itemId: 'dirt', count: 1 }
  ],
  workstation: 'WORKBENCH',
  category: 'WALLS'
}));

registerRecipe(new Recipe({
  id: 'stone_wall',
  result: { itemId: 'stone_wall', count: 4 },
  ingredients: [
    { itemId: 'stone', count: 1 }
  ],
  workstation: 'WORKBENCH',
  category: 'WALLS'
}));

registerRecipe(new Recipe({
  id: 'wood_wall',
  result: { itemId: 'wood_wall', count: 4 },
  ingredients: [
    { itemId: 'wood', count: 1 }
  ],
  workstation: 'WORKBENCH',
  category: 'WALLS'
}));

// ===== BUILDING BLOCKS - HAND =====

registerRecipe(new Recipe({
  id: 'wood_from_wood',
  result: { itemId: 'wood', count: 4 },
  ingredients: [
    { itemId: 'wood', count: 1 }
  ],
  workstation: 'HAND',
  category: 'BLOCKS'
}));

// Export the database
export class RecipeDatabase {
  static getAllRecipes() {
    return RECIPES;
  }

  static getRecipe(id) {
    return RECIPES.find(r => r.id === id);
  }

  static getRecipesByCategory(category) {
    return RECIPES.filter(r => r.category === category);
  }

  static getRecipesByWorkstation(workstation) {
    return RECIPES.filter(r => r.workstation === workstation);
  }
}
