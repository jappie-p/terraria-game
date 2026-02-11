// Recipe - Crafting recipe definition
export class Recipe {
  constructor(config) {
    this.id = config.id;
    this.result = config.result; // {itemId, count}
    this.ingredients = config.ingredients; // [{itemId, count}, ...]
    this.workstation = config.workstation || 'HAND'; // HAND, WORKBENCH, FURNACE, ANVIL
    this.category = config.category || 'GENERAL'; // For UI grouping
  }

  // Check if player can craft this recipe
  canCraft(inventory, availableWorkstations) {
    // Check workstation requirement
    if (this.workstation !== 'HAND' && !availableWorkstations.includes(this.workstation)) {
      return false;
    }

    // Check ingredients
    for (const ingredient of this.ingredients) {
      const hasEnough = inventory.getAllItems().reduce((total, stack) => {
        if (stack.item.id === ingredient.itemId) {
          return total + stack.count;
        }
        return total;
      }, 0);

      if (hasEnough < ingredient.count) {
        return false;
      }
    }

    return true;
  }

  // Get missing ingredients
  getMissingIngredients(inventory) {
    const missing = [];

    for (const ingredient of this.ingredients) {
      const hasCount = inventory.getAllItems().reduce((total, stack) => {
        if (stack.item.id === ingredient.itemId) {
          return total + stack.count;
        }
        return total;
      }, 0);

      const needed = ingredient.count - hasCount;
      if (needed > 0) {
        missing.push({ itemId: ingredient.itemId, count: needed });
      }
    }

    return missing;
  }
}
