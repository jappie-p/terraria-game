// CraftingPanel - Crafting UI
import { ItemDatabase } from '../items/ItemDatabase.js';

export class CraftingPanel {
  constructor(craftingSystem, inventory, textureGen = null) {
    this.craftingSystem = craftingSystem;
    this.inventory = inventory;
    this.textureGen = textureGen;
    this.visible = false;
    this.selectedRecipe = null;
    this.scrollOffset = 0;
  }

  // Set texture generator
  setTextureGenerator(textureGen) {
    this.textureGen = textureGen;
  }

  // Toggle visibility
  toggle() {
    this.visible = !this.visible;
  }

  // Show panel
  show() {
    this.visible = true;
  }

  // Hide panel
  hide() {
    this.visible = false;
  }

  // Render the crafting panel
  render(ctx) {
    if (!this.visible) return;

    const canvas = ctx.canvas;
    const panelWidth = Math.min(600, canvas.width - 40);
    const panelHeight = Math.min(500, canvas.height - 40);
    const panelX = (canvas.width - panelWidth) / 2;
    const panelY = (canvas.height - panelHeight) / 2;

    // Semi-transparent background overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Panel background
    ctx.fillStyle = 'rgba(40, 40, 40, 0.95)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

    // Panel border
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Crafting', panelX + panelWidth / 2, panelY + 35);

    // Instructions
    ctx.font = '14px monospace';
    ctx.fillText('Press C to close | Click recipe to craft', panelX + panelWidth / 2, panelY + 60);

    // Get available recipes
    const availableRecipes = this.craftingSystem.getAvailableRecipes(this.inventory);
    const allRecipes = this.craftingSystem.getAllRecipes();

    // Recipe list
    const listY = panelY + 80;
    const listHeight = panelHeight - 100;
    const recipeHeight = 60;

    ctx.textAlign = 'left';

    for (let i = 0; i < allRecipes.length; i++) {
      const recipe = allRecipes[i];
      const y = listY + i * recipeHeight - this.scrollOffset;

      // Skip if off screen
      if (y + recipeHeight < listY || y > listY + listHeight) continue;

      const canCraft = availableRecipes.includes(recipe);

      // Recipe background
      ctx.fillStyle = canCraft ? 'rgba(0, 100, 0, 0.3)' : 'rgba(100, 0, 0, 0.3)';
      ctx.fillRect(panelX + 20, y, panelWidth - 40, recipeHeight - 5);

      // Recipe border
      ctx.strokeStyle = canCraft ? '#00FF00' : '#FF0000';
      ctx.lineWidth = 1;
      ctx.strokeRect(panelX + 20, y, panelWidth - 40, recipeHeight - 5);

      // Result item
      const resultItem = ItemDatabase.getItem(recipe.result.itemId);
      if (resultItem) {
        // Draw item icon
        this.drawItemIcon(ctx, resultItem, panelX + 30, y + 10, 40);

        // Item name
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px monospace';
        ctx.fillText(`${resultItem.name} x${recipe.result.count}`, panelX + 80, y + 25);

        // Workstation requirement
        ctx.font = '12px monospace';
        ctx.fillStyle = '#AAAAAA';
        ctx.fillText(`[${recipe.workstation}]`, panelX + 80, y + 45);

        // Ingredients
        let ingredientText = 'Needs: ';
        for (let j = 0; j < recipe.ingredients.length; j++) {
          const ing = recipe.ingredients[j];
          const ingItem = ItemDatabase.getItem(ing.itemId);
          if (ingItem) {
            ingredientText += `${ingItem.name} x${ing.count}`;
            if (j < recipe.ingredients.length - 1) ingredientText += ', ';
          }
        }

        ctx.fillStyle = canCraft ? '#00FF00' : '#FF0000';
        ctx.font = '11px monospace';
        const maxWidth = panelWidth - 100;
        if (ctx.measureText(ingredientText).width > maxWidth) {
          ingredientText = ingredientText.substring(0, 40) + '...';
        }
        ctx.fillText(ingredientText, panelX + 280, y + 25);

        // Click hint
        if (canCraft) {
          ctx.fillStyle = '#FFFF00';
          ctx.font = 'bold 12px monospace';
          ctx.fillText('CLICK TO CRAFT', panelX + panelWidth - 160, y + 35);
        }
      }
    }

    // Reset text align
    ctx.textAlign = 'left';
  }

  // Draw item icon with texture or fallback
  drawItemIcon(ctx, item, x, y, size) {
    // Try to get texture
    let texture = null;
    if (this.textureGen) {
      texture = this.textureGen.getItemTexture(item.id);
    }

    if (texture) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(texture, x, y, size, size);
    } else {
      // Fallback to colored square
      ctx.fillStyle = item.color || '#FFFFFF';
      ctx.fillRect(x, y, size, size);

      // Add 3D effect
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(x, y, size, 2);
      ctx.fillRect(x, y, 2, size);
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(x, y + size - 2, size, 2);
      ctx.fillRect(x + size - 2, y, 2, size);
    }
  }

  // Handle click
  handleClick(mousePos) {
    if (!this.visible) return false;

    const canvas = document.getElementById('gameCanvas');
    const panelWidth = Math.min(600, canvas.width - 40);
    const panelHeight = Math.min(500, canvas.height - 40);
    const panelX = (canvas.width - panelWidth) / 2;
    const panelY = (canvas.height - panelHeight) / 2;

    const listY = panelY + 80;
    const recipeHeight = 60;
    const allRecipes = this.craftingSystem.getAllRecipes();

    // Check if clicking on a recipe
    for (let i = 0; i < allRecipes.length; i++) {
      const recipe = allRecipes[i];
      const y = listY + i * recipeHeight - this.scrollOffset;

      if (mousePos.x >= panelX + 20 &&
          mousePos.x <= panelX + panelWidth - 20 &&
          mousePos.y >= y &&
          mousePos.y <= y + recipeHeight - 5) {

        // Try to craft
        if (this.craftingSystem.craft(recipe, this.inventory)) {
          console.log('Crafted:', recipe.result.itemId);
        } else {
          console.log('Cannot craft:', recipe.result.itemId);
        }
        return true;
      }
    }

    return false;
  }
}
