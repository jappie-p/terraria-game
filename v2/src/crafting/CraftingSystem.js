// CraftingSystem - Handles crafting logic
import { ItemDatabase } from '../items/ItemDatabase.js';

export class CraftingSystem {
  constructor() {
    this.recipes = []; // All recipes
    this.availableWorkstations = ['HAND']; // Workstations player has access to
  }

  // Add a recipe
  addRecipe(recipe) {
    this.recipes.push(recipe);
  }

  // Set available workstations
  setAvailableWorkstations(workstations) {
    this.availableWorkstations = ['HAND', ...workstations];
  }

  // Get all recipes player can currently craft
  getAvailableRecipes(inventory) {
    return this.recipes.filter(recipe =>
      recipe.canCraft(inventory, this.availableWorkstations)
    );
  }

  // Get all recipes (for UI browsing)
  getAllRecipes() {
    return this.recipes;
  }

  // Get recipes by category
  getRecipesByCategory(category) {
    return this.recipes.filter(recipe => recipe.category === category);
  }

  // Get recipes by workstation
  getRecipesByWorkstation(workstation) {
    return this.recipes.filter(recipe => recipe.workstation === workstation);
  }

  // Attempt to craft a recipe
  craft(recipe, inventory) {
    // Check if can craft
    if (!recipe.canCraft(inventory, this.availableWorkstations)) {
      return false;
    }

    // Remove ingredients from inventory
    for (const ingredient of recipe.ingredients) {
      const item = ItemDatabase.getItem(ingredient.itemId);
      if (!item) continue;

      const removed = inventory.removeItem(item, ingredient.count);
      if (removed < ingredient.count) {
        // Shouldn't happen if canCraft returned true, but safety check
        console.error('Failed to remove ingredient:', ingredient.itemId);
        return false;
      }
    }

    // Add result to inventory
    const resultItem = ItemDatabase.getItem(recipe.result.itemId);
    if (resultItem) {
      const overflow = inventory.addItem(resultItem, recipe.result.count);
      if (overflow > 0) {
        console.warn('Inventory full, lost', overflow, resultItem.name);
      }
    }

    return true;
  }

  // Craft multiple times
  craftMultiple(recipe, inventory, count) {
    let craftedCount = 0;

    for (let i = 0; i < count; i++) {
      if (this.craft(recipe, inventory)) {
        craftedCount++;
      } else {
        break;
      }
    }

    return craftedCount;
  }

  // Get max craftable amount
  getMaxCraftable(recipe, inventory) {
    if (!recipe.canCraft(inventory, this.availableWorkstations)) {
      return 0;
    }

    let maxCount = Infinity;

    for (const ingredient of recipe.ingredients) {
      const hasCount = inventory.getAllItems().reduce((total, stack) => {
        if (stack.item.id === ingredient.itemId) {
          return total + stack.count;
        }
        return total;
      }, 0);

      const possible = Math.floor(hasCount / ingredient.count);
      maxCount = Math.min(maxCount, possible);
    }

    return maxCount === Infinity ? 0 : maxCount;
  }
}
