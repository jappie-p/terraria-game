// CraftingPanel - Crafting UI with categories
import { ItemDatabase } from '../items/ItemDatabase.js';

// Category definitions
const CATEGORIES = [
  { id: 'ALL', name: 'All', color: '#FFFFFF' },
  { id: 'WORKSTATIONS', name: 'Stations', color: '#8B4513' },
  { id: 'TOOLS', name: 'Tools', color: '#B0B0B0' },
  { id: 'WEAPONS', name: 'Weapons', color: '#FF4444' },
  { id: 'ARMOR', name: 'Armor', color: '#4488FF' },
  { id: 'SMELTING', name: 'Smelting', color: '#FF8800' },
  { id: 'WALLS', name: 'Walls', color: '#666666' },
  { id: 'BLOCKS', name: 'Blocks', color: '#228B22' },
  { id: 'SUMMONING', name: 'Summon', color: '#9370DB' }
];

export class CraftingPanel {
  constructor(craftingSystem, inventory, textureGen = null) {
    this.craftingSystem = craftingSystem;
    this.inventory = inventory;
    this.textureGen = textureGen;
    this.visible = false;
    this.selectedCategory = 'ALL';
    this.scrollOffset = 0;
    this.maxScroll = 0;
    this.hoveredRecipe = null;
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
  }

  // Set texture generator
  setTextureGenerator(textureGen) {
    this.textureGen = textureGen;
  }

  // Toggle visibility
  toggle() {
    this.visible = !this.visible;
    if (this.visible) {
      this.scrollOffset = 0;
    }
  }

  // Show panel
  show() {
    this.visible = true;
    this.scrollOffset = 0;
  }

  // Hide panel
  hide() {
    this.visible = false;
  }

  // Update layout
  updateLayout(canvasWidth, canvasHeight) {
    this.width = Math.min(700, canvasWidth - 40);
    this.height = Math.min(550, canvasHeight - 40);
    this.x = (canvasWidth - this.width) / 2;
    this.y = (canvasHeight - this.height) / 2;
  }

  // Get filtered recipes based on category
  getFilteredRecipes() {
    const allRecipes = this.craftingSystem.getAllRecipes();
    if (this.selectedCategory === 'ALL') {
      return allRecipes;
    }
    return allRecipes.filter(r => r.category === this.selectedCategory);
  }

  // Render the crafting panel
  render(ctx) {
    if (!this.visible) return;

    const canvas = ctx.canvas;
    this.updateLayout(canvas.width, canvas.height);

    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Panel background with texture
    if (this.textureGen && this.textureGen.textures.ui_panel_bg) {
      const pattern = ctx.createPattern(this.textureGen.textures.ui_panel_bg, 'repeat');
      ctx.fillStyle = pattern;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    } else {
      ctx.fillStyle = 'rgba(40, 40, 50, 0.95)';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // Border
    ctx.strokeStyle = '#8B5A2B';
    ctx.lineWidth = 4;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);

    // Title
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CRAFTING', this.x + this.width / 2, this.y + 35);

    // Show available workstations
    const workstations = this.craftingSystem.availableWorkstations || ['HAND'];
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#00FF88';
    const wsText = workstations.map(w => w === 'HAND' ? 'Hand' : w).join(' + ');
    ctx.fillText(`Available: ${wsText}`, this.x + this.width / 2, this.y + 55);

    // Close hint
    ctx.font = '11px monospace';
    ctx.fillStyle = '#888888';
    ctx.fillText('Press C or ESC to close', this.x + this.width / 2, this.y + 72);

    // Render category tabs
    this.renderCategoryTabs(ctx, this.x, this.y + 85, this.width);

    // Recipe list area
    const listY = this.y + 130;
    const listHeight = this.height - 150;
    const listWidth = this.width - 40;
    const listX = this.x + 20;

    // Clip to recipe list area
    ctx.save();
    ctx.beginPath();
    ctx.rect(listX, listY, listWidth, listHeight);
    ctx.clip();

    // Get filtered recipes
    const recipes = this.getFilteredRecipes();
    const availableRecipes = this.craftingSystem.getAvailableRecipes(this.inventory);
    const recipeHeight = 70;

    // Calculate max scroll
    const totalHeight = recipes.length * recipeHeight;
    this.maxScroll = Math.max(0, totalHeight - listHeight);

    // Render recipes
    ctx.textAlign = 'left';
    this.hoveredRecipe = null;

    for (let i = 0; i < recipes.length; i++) {
      const recipe = recipes[i];
      const y = listY + i * recipeHeight - this.scrollOffset;

      // Skip if off screen
      if (y + recipeHeight < listY || y > listY + listHeight) continue;

      const canCraft = availableRecipes.includes(recipe);
      const hasWorkstation = this.hasRequiredWorkstation(recipe);
      const hasIngredients = this.hasIngredients(recipe);

      this.renderRecipe(ctx, recipe, listX, y, listWidth, recipeHeight - 5, canCraft, hasWorkstation, hasIngredients);
    }

    ctx.restore();

    // Scrollbar
    if (this.maxScroll > 0) {
      this.renderScrollbar(ctx, listX + listWidth - 8, listY, 6, listHeight);
    }

    // Recipe count
    ctx.textAlign = 'right';
    ctx.font = '11px monospace';
    ctx.fillStyle = '#888888';
    const craftableCount = recipes.filter(r => availableRecipes.includes(r)).length;
    ctx.fillText(`${craftableCount}/${recipes.length} craftable`, this.x + this.width - 25, this.y + this.height - 10);

    ctx.textAlign = 'left';
  }

  // Render category tabs
  renderCategoryTabs(ctx, x, y, width) {
    const tabWidth = width / CATEGORIES.length;
    const tabHeight = 28;

    for (let i = 0; i < CATEGORIES.length; i++) {
      const cat = CATEGORIES[i];
      const tabX = x + i * tabWidth;
      const isSelected = this.selectedCategory === cat.id;

      // Tab background
      if (isSelected) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
      } else {
        ctx.fillStyle = 'rgba(60, 60, 70, 0.8)';
      }
      ctx.fillRect(tabX + 2, y, tabWidth - 4, tabHeight);

      // Tab border
      ctx.strokeStyle = isSelected ? '#FFD700' : '#444444';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.strokeRect(tabX + 2, y, tabWidth - 4, tabHeight);

      // Tab text
      ctx.fillStyle = isSelected ? '#FFD700' : cat.color;
      ctx.font = isSelected ? 'bold 11px monospace' : '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(cat.name, tabX + tabWidth / 2, y + 18);
    }
  }

  // Render a single recipe
  renderRecipe(ctx, recipe, x, y, width, height, canCraft, hasWorkstation, hasIngredients) {
    // Recipe background
    let bgColor;
    if (canCraft) {
      bgColor = 'rgba(0, 150, 0, 0.4)';
    } else if (hasWorkstation && !hasIngredients) {
      bgColor = 'rgba(150, 100, 0, 0.3)';
    } else {
      bgColor = 'rgba(100, 0, 0, 0.3)';
    }
    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, width, height);

    // Recipe border
    if (canCraft) {
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2;
    } else {
      ctx.strokeStyle = hasWorkstation ? '#888800' : '#880000';
      ctx.lineWidth = 1;
    }
    ctx.strokeRect(x, y, width, height);

    // Result item
    const resultItem = ItemDatabase.getItem(recipe.result.itemId);
    if (!resultItem) return;

    // Draw item icon
    this.drawItemIcon(ctx, resultItem, x + 8, y + 8, 48);

    // Item name and count
    ctx.fillStyle = canCraft ? '#00FF00' : '#FFFFFF';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    const countStr = recipe.result.count > 1 ? ` x${recipe.result.count}` : '';
    ctx.fillText(`${resultItem.name}${countStr}`, x + 65, y + 28);

    // Workstation requirement badge
    const badgeX = x + 65;
    const badgeY = y + 38;
    const wsName = recipe.workstation === 'HAND' ? 'Hand' : recipe.workstation;
    ctx.font = '10px monospace';

    // Badge background
    ctx.fillStyle = hasWorkstation ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 0, 0, 0.3)';
    const wsTextWidth = ctx.measureText(wsName).width + 10;
    ctx.fillRect(badgeX, badgeY, wsTextWidth, 16);
    ctx.strokeStyle = hasWorkstation ? '#00FF88' : '#FF4444';
    ctx.lineWidth = 1;
    ctx.strokeRect(badgeX, badgeY, wsTextWidth, 16);

    // Badge text
    ctx.fillStyle = hasWorkstation ? '#00FF88' : '#FF6666';
    ctx.fillText(wsName, badgeX + 5, badgeY + 12);

    // Ingredients list
    const ingX = x + 250;
    ctx.font = '12px monospace';
    ctx.fillStyle = '#AAAAAA';
    ctx.fillText('Requires:', ingX, y + 18);

    let ingOffsetY = 30;
    for (let j = 0; j < Math.min(recipe.ingredients.length, 3); j++) {
      const ing = recipe.ingredients[j];
      const ingItem = ItemDatabase.getItem(ing.itemId);
      if (!ingItem) continue;

      const hasCount = this.getItemCount(ing.itemId);
      const hasEnough = hasCount >= ing.count;

      // Ingredient icon (small)
      this.drawItemIcon(ctx, ingItem, ingX, y + ingOffsetY - 10, 18);

      // Ingredient text
      ctx.fillStyle = hasEnough ? '#00FF00' : '#FF4444';
      ctx.font = '11px monospace';
      ctx.fillText(`${ingItem.name}: ${hasCount}/${ing.count}`, ingX + 22, y + ingOffsetY);
      ingOffsetY += 15;
    }

    // Craft button/indicator
    if (canCraft) {
      const btnX = x + width - 100;
      const btnY = y + height / 2 - 15;
      const btnW = 90;
      const btnH = 30;

      // Button background
      ctx.fillStyle = 'rgba(0, 200, 0, 0.5)';
      ctx.fillRect(btnX, btnY, btnW, btnH);
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2;
      ctx.strokeRect(btnX, btnY, btnW, btnH);

      // Button text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CRAFT', btnX + btnW / 2, btnY + 20);
      ctx.textAlign = 'left';
    } else if (!hasWorkstation) {
      // Show required workstation
      ctx.fillStyle = '#FF6666';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`Need ${wsName}`, x + width - 10, y + height / 2 + 4);
      ctx.textAlign = 'left';
    }
  }

  // Render scrollbar
  renderScrollbar(ctx, x, y, width, height) {
    // Track
    ctx.fillStyle = 'rgba(60, 60, 70, 0.8)';
    ctx.fillRect(x, y, width, height);

    // Thumb
    const thumbRatio = height / (height + this.maxScroll);
    const thumbHeight = Math.max(30, height * thumbRatio);
    const thumbY = y + (this.scrollOffset / this.maxScroll) * (height - thumbHeight);

    ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
    ctx.fillRect(x, thumbY, width, thumbHeight);
  }

  // Draw item icon with texture or fallback
  drawItemIcon(ctx, item, x, y, size) {
    // Slot background using texture if available
    const slotTexture = this.textureGen ? this.textureGen.textures.ui_slot : null;
    if (slotTexture) {
        ctx.drawImage(slotTexture, x, y, size, size);
    } else {
        ctx.fillStyle = '#333333';
        ctx.fillRect(x, y, size, size);
        ctx.strokeStyle = '#666666';
        ctx.strokeRect(x, y, size, size);
    }

    // Item texture
    let texture = null;
    if (this.textureGen) {
      texture = this.textureGen.getItemTexture(item.id);
    }

    if (texture) {
      ctx.imageSmoothingEnabled = false;
      const padding = size * 0.1;
      ctx.drawImage(texture, x + padding, y + padding, size - padding*2, size - padding*2);
    } else {
      ctx.fillStyle = item.color || '#FFFFFF';
      const padding = size * 0.1;
      ctx.fillRect(x + padding, y + padding, size - padding*2, size - padding*2);
    }
    
    if (item.count > 1) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(item.count, x + size - 2, y + size - 2);
    }
  }

  // Check if player has required workstation
  hasRequiredWorkstation(recipe) {
    if (recipe.workstation === 'HAND') return true;
    const workstations = this.craftingSystem.availableWorkstations || ['HAND'];
    return workstations.includes(recipe.workstation);
  }

  // Check if player has required ingredients
  hasIngredients(recipe) {
    for (const ing of recipe.ingredients) {
      if (this.getItemCount(ing.itemId) < ing.count) {
        return false;
      }
    }
    return true;
  }

  // Get count of item in inventory
  getItemCount(itemId) {
    return this.inventory.getAllItems().reduce((total, stack) => {
      if (stack.item.id === itemId) {
        return total + stack.count;
      }
      return total;
    }, 0);
  }

  // Handle click
  handleClick(mousePos) {
    if (!this.visible) return false;

    // Check category tab clicks
    const tabY = this.y + 85;
    const tabHeight = 28;
    const tabWidth = this.width / CATEGORIES.length;

    if (mousePos.y >= tabY && mousePos.y <= tabY + tabHeight) {
      for (let i = 0; i < CATEGORIES.length; i++) {
        const tabX = this.x + i * tabWidth;
        if (mousePos.x >= tabX && mousePos.x <= tabX + tabWidth) {
          this.selectedCategory = CATEGORIES[i].id;
          this.scrollOffset = 0;
          return true;
        }
      }
    }

    // Check recipe clicks
    const listY = this.y + 130;
    const listHeight = this.height - 150;
    const listX = this.x + 20;
    const listWidth = this.width - 40;
    const recipeHeight = 70;

    // Only process clicks in list area
    if (mousePos.x < listX || mousePos.x > listX + listWidth ||
        mousePos.y < listY || mousePos.y > listY + listHeight) {
      return false;
    }

    const recipes = this.getFilteredRecipes();
    const availableRecipes = this.craftingSystem.getAvailableRecipes(this.inventory);

    for (let i = 0; i < recipes.length; i++) {
      const recipe = recipes[i];
      const y = listY + i * recipeHeight - this.scrollOffset;

      // Skip if off screen
      if (y + recipeHeight < listY || y > listY + listHeight) continue;

      if (mousePos.y >= y && mousePos.y <= y + recipeHeight - 5) {
        // Try to craft
        if (availableRecipes.includes(recipe)) {
          if (this.craftingSystem.craft(recipe, this.inventory)) {
            console.log('Crafted:', recipe.result.itemId);
          }
        }
        return true;
      }
    }

    return false;
  }

  // Handle scroll
  handleScroll(deltaY) {
    if (!this.visible) return;

    this.scrollOffset += deltaY * 0.5;
    this.scrollOffset = Math.max(0, Math.min(this.maxScroll, this.scrollOffset));
  }
}