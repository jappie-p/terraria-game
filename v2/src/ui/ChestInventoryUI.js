// ChestInventoryUI - Displays the chest inventory and player inventory
import { TILE_SIZE, INVENTORY_ROWS, INVENTORY_COLS, HOTBAR_SLOTS } from '../utils/Constants.js';

export class ChestInventoryUI {
  constructor(player, textureGen) {
    this.player = player;
    this.textureGen = textureGen;
    this.visible = false;
    this.chestItems = null; // Array of items in the chest
    this.chestPosition = null; // {x, y} of the open chest
    this.draggedItem = null;
    this.dragStart = null; // { source: 'chest'|'player', index: 0 }

    // UI Layout (Centered on screen)
    this.padding = 10;
    this.slotSize = 40;
    this.width = (INVENTORY_COLS * (this.slotSize + 5)) + this.padding * 2;
    this.height = 400; // Adjusted for chest rows + player inventory
    this.x = 0;
    this.y = 0;
    
    // Chest capacity (e.g., 20 slots)
    this.chestCapacity = 20; 
  }

  show(chestItems, chestPosition) {
    this.visible = true;
    this.chestItems = chestItems;
    this.chestPosition = chestPosition;
    
    // Ensure chest has initialized items array
    if (!this.chestItems) {
        // This should be handled by the caller, but safety check
        console.error("ChestInventoryUI shown with null items");
        this.visible = false;
    }
  }

  hide() {
    this.visible = false;
    this.chestItems = null;
    this.chestPosition = null;
    this.draggedItem = null;
  }

  toggle(chestItems, chestPosition) {
    if (this.visible) {
      this.hide();
    } else {
      this.show(chestItems, chestPosition);
    }
  }

  // Update layout based on canvas size
  updateLayout(canvasWidth, canvasHeight) {
    this.x = (canvasWidth - this.width) / 2;
    this.y = (canvasHeight - this.height) / 2;
  }

  // Handle mouse click
  handleClick(mousePos, canvasWidth, canvasHeight) {
    if (!this.visible) return false;

    this.updateLayout(canvasWidth, canvasHeight);

    // Check Chest Slots
    const chestRows = Math.ceil(this.chestCapacity / INVENTORY_COLS);
    
    for (let i = 0; i < this.chestCapacity; i++) {
        const row = Math.floor(i / INVENTORY_COLS);
        const col = i % INVENTORY_COLS;
        const slotX = this.x + this.padding + col * (this.slotSize + 5);
        const slotY = this.y + this.padding + 30 + row * (this.slotSize + 5); // +30 for title

        if (this.isMouseOver(mousePos, slotX, slotY, this.slotSize)) {
            this.handleSlotClick(i, 'chest');
            return true;
        }
    }

    // Check Player Inventory Slots (below chest)
    const playerStartY = this.y + this.padding + 30 + (chestRows * (this.slotSize + 5)) + 20; // +20 gap
    
    // Main Inventory
    for (let i = HOTBAR_SLOTS; i < this.player.inventory.items.length; i++) {
        const invIndex = i - HOTBAR_SLOTS;
        const row = Math.floor(invIndex / INVENTORY_COLS);
        const col = invIndex % INVENTORY_COLS;
        const slotX = this.x + this.padding + col * (this.slotSize + 5);
        const slotY = playerStartY + row * (this.slotSize + 5);

        if (this.isMouseOver(mousePos, slotX, slotY, this.slotSize)) {
            this.handleSlotClick(i, 'player');
            return true;
        }
    }

    // Hotbar (below main inventory)
    const hotbarStartY = playerStartY + (3 * (this.slotSize + 5)) + 10;
    for (let i = 0; i < HOTBAR_SLOTS; i++) {
        const slotX = this.x + this.padding + i * (this.slotSize + 5);
        const slotY = hotbarStartY;

        if (this.isMouseOver(mousePos, slotX, slotY, this.slotSize)) {
            this.handleSlotClick(i, 'player');
            return true;
        }
    }
    
    // Close button (top right)
    if (mousePos.x > this.x + this.width - 30 && mousePos.x < this.x + this.width &&
        mousePos.y > this.y && mousePos.y < this.y + 30) {
        this.hide();
        return true;
    }

    return false; // Clicked outside slots
  }

  handleSlotClick(index, source) {
      // Simple swap/move logic
      if (!this.draggedItem) {
          // Pick up item
          const item = source === 'chest' ? this.chestItems[index] : this.player.inventory.items[index];
          if (item) {
              this.draggedItem = item;
              this.dragStart = { source, index };
              // Temporarily remove from source for visual feedback (or keep distinct copy?)
              // For simplicity: clear source slot immediately
              if (source === 'chest') this.chestItems[index] = null;
              else this.player.inventory.items[index] = null;
          }
      } else {
          // Place item
          const targetItem = source === 'chest' ? this.chestItems[index] : this.player.inventory.items[index];
          
          if (targetItem) {
              // Swap
              if (source === 'chest') this.chestItems[index] = this.draggedItem;
              else this.player.inventory.items[index] = this.draggedItem;
              
              // Put target item into drag hand
              this.draggedItem = targetItem;
              this.dragStart = { source, index }; // Update source to current slot
          } else {
              // Place into empty slot
              if (source === 'chest') this.chestItems[index] = this.draggedItem;
              else this.player.inventory.items[index] = this.draggedItem;
              
              this.draggedItem = null;
              this.dragStart = null;
          }
      }
  }

  isMouseOver(mouse, x, y, size) {
    return mouse.x >= x && mouse.x < x + size &&
           mouse.y >= y && mouse.y < y + size;
  }

  render(ctx, mousePos) {
    if (!this.visible) return;

    this.updateLayout(ctx.canvas.width, ctx.canvas.height);

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
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 4;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.strokeStyle = '#CD853F'; // Lighter wood trim
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Chest', this.x + 15, this.y + 25);
    
    // Close button (X)
    ctx.fillStyle = '#FF4444';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('X', this.x + this.width - 25, this.y + 25);

    // Draw Chest Slots
    const chestRows = Math.ceil(this.chestCapacity / INVENTORY_COLS);
    
    for (let i = 0; i < this.chestCapacity; i++) {
        const row = Math.floor(i / INVENTORY_COLS);
        const col = i % INVENTORY_COLS;
        const slotX = this.x + this.padding + col * (this.slotSize + 5);
        const slotY = this.y + this.padding + 30 + row * (this.slotSize + 5);

        this.drawSlot(ctx, slotX, slotY, this.chestItems[i], mousePos);
    }

    // Draw Player Inventory Title
    const playerStartY = this.y + this.padding + 30 + (chestRows * (this.slotSize + 5)) + 20;
    ctx.fillStyle = '#AAAAAA';
    ctx.font = '14px monospace';
    ctx.fillText('Inventory', this.x + 15, playerStartY - 5);

    // Draw Main Inventory
    for (let i = HOTBAR_SLOTS; i < this.player.inventory.items.length; i++) {
        const invIndex = i - HOTBAR_SLOTS;
        const row = Math.floor(invIndex / INVENTORY_COLS);
        const col = invIndex % INVENTORY_COLS;
        const slotX = this.x + this.padding + col * (this.slotSize + 5);
        const slotY = playerStartY + row * (this.slotSize + 5);

        this.drawSlot(ctx, slotX, slotY, this.player.inventory.items[i], mousePos);
    }

    // Draw Hotbar (separated)
    const hotbarStartY = playerStartY + (3 * (this.slotSize + 5)) + 10;
    
    // Separator line
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x + 10, hotbarStartY - 5);
    ctx.lineTo(this.x + this.width - 10, hotbarStartY - 5);
    ctx.stroke();

    for (let i = 0; i < HOTBAR_SLOTS; i++) {
        const slotX = this.x + this.padding + i * (this.slotSize + 5);
        const slotY = hotbarStartY;

        this.drawSlot(ctx, slotX, slotY, this.player.inventory.items[i], mousePos);
    }

    // Draw dragged item
    if (this.draggedItem) {
        const texture = this.textureGen.getItemTexture(this.draggedItem.id);
        if (texture) {
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(texture, mousePos.x - 12, mousePos.y - 12, 24, 24);
        }
        
        // Count
        if (this.draggedItem.count > 1) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(this.draggedItem.count, mousePos.x + 12, mousePos.y + 12);
        }
    }
  }

  drawSlot(ctx, x, y, item, mousePos) {
      const slotTexture = this.textureGen ? this.textureGen.textures.ui_slot : null;
      const isHovered = this.isMouseOver(mousePos, x, y, this.slotSize);

      // Background
      if (slotTexture) {
          ctx.drawImage(slotTexture, x, y, this.slotSize, this.slotSize);
          if (isHovered) {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
              ctx.fillRect(x + 2, y + 2, this.slotSize - 4, this.slotSize - 4);
          }
      } else {
          ctx.fillStyle = isHovered ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)';
          ctx.fillRect(x, y, this.slotSize, this.slotSize);
          ctx.strokeStyle = '#555';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, this.slotSize, this.slotSize);
      }

      // Item
      if (item) {
          const texture = this.textureGen.getItemTexture(item.id);
          const iconSize = 24;
          const iconX = x + (this.slotSize - iconSize) / 2;
          const iconY = y + (this.slotSize - iconSize) / 2;

          if (texture) {
              ctx.imageSmoothingEnabled = false;
              ctx.drawImage(texture, iconX, iconY, iconSize, iconSize);
          } else {
              ctx.fillStyle = item.color || '#FF00FF';
              ctx.fillRect(iconX, iconY, iconSize, iconSize);
          }

          // Count
          if (item.count > 1) {
              ctx.fillStyle = '#FFFFFF';
              ctx.font = 'bold 10px monospace';
              ctx.textAlign = 'right';
              // Shadow
              ctx.fillStyle = 'rgba(0,0,0,0.8)';
              ctx.fillText(item.count, x + this.slotSize - 1, y + this.slotSize - 1);
              // Text
              ctx.fillStyle = '#FFFFFF';
              ctx.fillText(item.count, x + this.slotSize - 2, y + this.slotSize - 2);
          }
      }
  }
}
