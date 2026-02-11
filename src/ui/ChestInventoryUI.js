// ChestInventoryUI - Displays the chest inventory and player inventory side by side
import { INVENTORY_COLS, HOTBAR_SLOTS } from '../utils/Constants.js';
import { ItemStack } from '../items/ItemStack.js';
import { ItemDatabase } from '../items/ItemDatabase.js';

export class ChestInventoryUI {
  constructor(player, textureGen) {
    this.player = player;
    this.textureGen = textureGen;
    this.visible = false;
    this.chestItems = null;
    this.chestPosition = null;
    this.draggedItem = null;
    this.dragStart = null;

    // UI Layout
    this.slotSize = 36;
    this.slotGap = 4;
    this.padding = 15;
    this.chestCols = 5;
    this.chestRows = 4;
    this.chestCapacity = 20;

    // Panel dimensions
    this.panelWidth = this.chestCols * (this.slotSize + this.slotGap) + this.padding * 2;
    this.panelHeight = this.chestRows * (this.slotSize + this.slotGap) + 50;

    // Total width for both panels
    this.totalWidth = this.panelWidth * 2 + 20;
    this.x = 0;
    this.y = 0;
  }

  show(chestItems, chestPosition) {
    this.visible = true;
    this.chestItems = chestItems;
    this.chestPosition = chestPosition;
    this.draggedItem = null;
    this.dragStart = null;

    if (!this.chestItems) {
      console.error("ChestInventoryUI shown with null items");
      this.visible = false;
    }
  }

  hide() {
    this.visible = false;
    this.chestItems = null;
    this.chestPosition = null;
    this.draggedItem = null;
    this.dragStart = null;
  }

  updateLayout(canvasWidth, canvasHeight) {
    this.x = (canvasWidth - this.totalWidth) / 2;
    this.y = (canvasHeight - this.panelHeight) / 2;
  }

  handleClick(mousePos, canvasWidth, canvasHeight) {
    if (!this.visible) return false;

    this.updateLayout(canvasWidth, canvasHeight);

    const chestPanelX = this.x;
    const invPanelX = this.x + this.panelWidth + 20;

    // Check close button on chest panel
    if (mousePos.x >= chestPanelX + this.panelWidth - 25 &&
        mousePos.x <= chestPanelX + this.panelWidth - 5 &&
        mousePos.y >= this.y + 5 && mousePos.y <= this.y + 25) {
      this.hide();
      return true;
    }

    // Check chest slots
    for (let i = 0; i < this.chestCapacity; i++) {
      const row = Math.floor(i / this.chestCols);
      const col = i % this.chestCols;
      const slotX = chestPanelX + this.padding + col * (this.slotSize + this.slotGap);
      const slotY = this.y + 40 + row * (this.slotSize + this.slotGap);

      if (this.isMouseOver(mousePos, slotX, slotY, this.slotSize)) {
        this.handleSlotClick(i, 'chest');
        return true;
      }
    }

    // Check player inventory slots (hotbar + main inventory in one panel)
    const invCols = 5;
    const invRows = 8; // 40 slots / 5 cols = 8 rows
    for (let i = 0; i < this.player.inventory.slots.length; i++) {
      const row = Math.floor(i / invCols);
      const col = i % invCols;
      const slotX = invPanelX + this.padding + col * (this.slotSize + this.slotGap);
      const slotY = this.y + 40 + row * (this.slotSize + this.slotGap);

      if (this.isMouseOver(mousePos, slotX, slotY, this.slotSize)) {
        this.handleSlotClick(i, 'player');
        return true;
      }
    }

    return false;
  }

  toChestFormat(itemOrStack) {
    if (!itemOrStack) return null;
    if (itemOrStack.item) {
      return { id: itemOrStack.item.id, count: itemOrStack.count };
    }
    return itemOrStack;
  }

  toInventoryFormat(itemOrStack) {
    if (!itemOrStack) return null;
    if (itemOrStack.item) {
      return itemOrStack;
    }
    const item = ItemDatabase.getItem(itemOrStack.id);
    if (!item) return null;
    return new ItemStack(item, itemOrStack.count);
  }

  handleSlotClick(index, source) {
    if (!this.draggedItem) {
      // Pick up item
      const item = source === 'chest' ? this.chestItems[index] : this.player.inventory.slots[index];
      if (item) {
        this.draggedItem = item;
        this.dragStart = { source, index };
        if (source === 'chest') this.chestItems[index] = null;
        else this.player.inventory.slots[index] = null;
      }
    } else {
      // Place item
      const targetItem = source === 'chest' ? this.chestItems[index] : this.player.inventory.slots[index];
      const convertedItem = source === 'chest'
        ? this.toChestFormat(this.draggedItem)
        : this.toInventoryFormat(this.draggedItem);

      if (targetItem) {
        // Swap
        if (source === 'chest') {
          this.chestItems[index] = convertedItem;
        } else {
          this.player.inventory.slots[index] = convertedItem;
        }
        this.draggedItem = targetItem;
        this.dragStart = { source, index };
      } else {
        // Place in empty slot
        if (source === 'chest') {
          this.chestItems[index] = convertedItem;
        } else {
          this.player.inventory.slots[index] = convertedItem;
        }
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

    const chestPanelX = this.x;
    const invPanelX = this.x + this.panelWidth + 20;
    const invRows = Math.ceil(this.player.inventory.slots.length / 5);
    const invPanelHeight = invRows * (this.slotSize + this.slotGap) + 50;

    // Draw chest panel
    this.drawPanel(ctx, chestPanelX, this.y, this.panelWidth, this.panelHeight, 'Chest');

    // Draw inventory panel
    this.drawPanel(ctx, invPanelX, this.y, this.panelWidth, invPanelHeight, 'Inventory');

    // Draw close button
    ctx.fillStyle = '#FF4444';
    ctx.fillRect(chestPanelX + this.panelWidth - 25, this.y + 8, 18, 18);
    ctx.strokeStyle = '#AA0000';
    ctx.lineWidth = 2;
    ctx.strokeRect(chestPanelX + this.panelWidth - 25, this.y + 8, 18, 18);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('X', chestPanelX + this.panelWidth - 16, this.y + 22);

    // Draw chest slots
    for (let i = 0; i < this.chestCapacity; i++) {
      const row = Math.floor(i / this.chestCols);
      const col = i % this.chestCols;
      const slotX = chestPanelX + this.padding + col * (this.slotSize + this.slotGap);
      const slotY = this.y + 40 + row * (this.slotSize + this.slotGap);

      this.drawSlot(ctx, slotX, slotY, this.chestItems[i], mousePos);
    }

    // Draw player inventory slots
    const invCols = 5;
    for (let i = 0; i < this.player.inventory.slots.length; i++) {
      const row = Math.floor(i / invCols);
      const col = i % invCols;
      const slotX = invPanelX + this.padding + col * (this.slotSize + this.slotGap);
      const slotY = this.y + 40 + row * (this.slotSize + this.slotGap);

      // Highlight hotbar slots
      const isHotbar = i < HOTBAR_SLOTS;
      this.drawSlot(ctx, slotX, slotY, this.player.inventory.slots[i], mousePos, isHotbar);
    }

    // Draw dragged item at cursor
    if (this.draggedItem) {
      const item = this.draggedItem.item || this.draggedItem;
      const count = this.draggedItem.count;
      const itemId = item.id;

      const texture = this.textureGen.getItemTexture(itemId);
      if (texture) {
        ctx.imageSmoothingEnabled = false;
        ctx.globalAlpha = 0.9;
        ctx.drawImage(texture, mousePos.x - 14, mousePos.y - 14, 28, 28);
        ctx.globalAlpha = 1;
      }

      if (count > 1) {
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(count, mousePos.x + 13, mousePos.y + 13);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(count, mousePos.x + 12, mousePos.y + 12);
      }
    }

    // Instructions
    ctx.fillStyle = '#888888';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Press F or ESC to close', this.x + this.totalWidth / 2, this.y + this.panelHeight + 20);
  }

  drawPanel(ctx, x, y, width, height, title) {
    // Dark background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x, y, width, height);

    // Border
    ctx.strokeStyle = '#4a4a6a';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, height);

    // Inner border
    ctx.strokeStyle = '#2a2a4a';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 3, y + 3, width - 6, height - 6);

    // Title bar
    ctx.fillStyle = '#2a2a4a';
    ctx.fillRect(x, y, width, 30);

    // Title text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(title, x + 12, y + 21);
  }

  drawSlot(ctx, x, y, itemOrStack, mousePos, isHotbar = false) {
    const isHovered = this.isMouseOver(mousePos, x, y, this.slotSize);

    // Slot background - darker box
    ctx.fillStyle = isHovered ? '#3a3a5a' : '#252538';
    ctx.fillRect(x, y, this.slotSize, this.slotSize);

    // Slot border
    ctx.strokeStyle = isHotbar ? '#FFD700' : (isHovered ? '#6a6a8a' : '#4a4a6a');
    ctx.lineWidth = isHotbar ? 2 : 1;
    ctx.strokeRect(x, y, this.slotSize, this.slotSize);

    // Inner highlight (3D effect)
    ctx.strokeStyle = '#1a1a28';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 1, y + this.slotSize - 1);
    ctx.lineTo(x + this.slotSize - 1, y + this.slotSize - 1);
    ctx.lineTo(x + this.slotSize - 1, y + 1);
    ctx.stroke();

    // Draw item if present
    if (itemOrStack) {
      const item = itemOrStack.item || itemOrStack;
      const count = itemOrStack.count;
      const itemId = item.id;

      const texture = this.textureGen.getItemTexture(itemId);
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

      // Item count
      if (count > 1) {
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'right';
        ctx.fillStyle = '#000000';
        ctx.fillText(count, x + this.slotSize - 2, y + this.slotSize - 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(count, x + this.slotSize - 3, y + this.slotSize - 3);
      }
    }
  }
}
