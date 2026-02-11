// Hotbar - Quick access inventory display
export class Hotbar {
  constructor(inventory, player, textureGen = null) {
    this.inventory = inventory;
    this.player = player;
    this.textureGen = textureGen;
    this.visible = true;
    this.slotSize = 40;
    this.slotCount = 10;
    this.padding = 4;
    this.borderWidth = 2;
  }

  // Set texture generator (can be set after construction)
  setTextureGenerator(textureGen) {
    this.textureGen = textureGen;
  }

  // Render the hotbar
  render(ctx) {
    if (!this.visible) return;

    const canvas = ctx.canvas;
    const totalWidth = this.slotCount * (this.slotSize + this.padding) + this.padding;
    const startX = (canvas.width - totalWidth) / 2;
    const startY = canvas.height - this.slotSize - 20;

    // Draw each slot
    for (let i = 0; i < this.slotCount; i++) {
      const x = startX + i * (this.slotSize + this.padding) + this.padding;
      const y = startY;

      // Draw slot background
      ctx.fillStyle = this.player.selectedSlot === i ? 'rgba(100, 100, 100, 0.9)' : 'rgba(50, 50, 50, 0.8)';
      ctx.fillRect(x, y, this.slotSize, this.slotSize);

      // Draw slot border
      ctx.strokeStyle = this.player.selectedSlot === i ? '#FFD700' : '#FFFFFF';
      ctx.lineWidth = this.player.selectedSlot === i ? 3 : 1;
      ctx.strokeRect(x, y, this.slotSize, this.slotSize);

      // Get item in this slot
      const itemStack = this.inventory.getSlot(i);
      if (itemStack) {
        this.renderItem(ctx, itemStack, x, y);
      }

      // Draw slot number
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText((i + 1) % 10, x + 2, y + 2);
    }

    // Reset text alignment
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  // Render an item in a slot
  renderItem(ctx, itemStack, x, y) {
    const itemSize = this.slotSize - 8;
    const itemX = x + 4;
    const itemY = y + 4;

    // Try to get item texture
    let texture = null;
    if (this.textureGen) {
      texture = this.textureGen.getItemTexture(itemStack.item.id);
    }

    if (texture) {
      // Draw item texture
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(texture, itemX, itemY, itemSize, itemSize);
    } else {
      // Fallback to colored square with icon shape
      this.renderItemFallback(ctx, itemStack, itemX, itemY, itemSize);
    }

    // Draw stack count
    if (itemStack.count > 1) {
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      // Shadow
      ctx.fillText(itemStack.count.toString(), x + this.slotSize - 3, y + this.slotSize - 3);
      // Text
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(itemStack.count.toString(), x + this.slotSize - 4, y + this.slotSize - 4);
    }

    // Draw durability bar for tools/weapons
    if (itemStack.item.durability !== undefined && itemStack.item.durability !== null) {
      const maxDur = itemStack.item.maxDurability || itemStack.item.durability;
      if (maxDur > 0) {
        const durabilityPercent = itemStack.item.durability / maxDur;
        if (durabilityPercent < 1) {
          const barWidth = this.slotSize - 8;
          const barHeight = 3;
          const barX = x + 4;
          const barY = y + this.slotSize - barHeight - 2;

          // Background
          ctx.fillStyle = '#000000';
          ctx.fillRect(barX, barY, barWidth, barHeight);

          // Durability color
          let color = '#00FF00';
          if (durabilityPercent < 0.25) {
            color = '#FF0000';
          } else if (durabilityPercent < 0.5) {
            color = '#FFFF00';
          }

          ctx.fillStyle = color;
          ctx.fillRect(barX, barY, barWidth * durabilityPercent, barHeight);
        }
      }
    }
  }

  // Fallback rendering when no texture is available
  renderItemFallback(ctx, itemStack, x, y, size) {
    const item = itemStack.item;
    const color = item.color || '#FFFFFF';
    const padding = 4;
    const innerSize = size - padding * 2;

    // Draw based on item type
    switch (item.type) {
      case 'TOOL':
        this.drawToolIcon(ctx, x + padding, y + padding, innerSize, color, item.toolType);
        break;
      case 'WEAPON':
        if (item.isRanged) {
          this.drawRangedIcon(ctx, x + padding, y + padding, innerSize, color);
        } else {
          this.drawSwordIcon(ctx, x + padding, y + padding, innerSize, color);
        }
        break;
      case 'ARMOR':
        this.drawArmorIcon(ctx, x + padding, y + padding, innerSize, color, item.equipSlot);
        break;
      case 'BLOCK':
        this.drawBlockIcon(ctx, x + padding, y + padding, innerSize, color);
        break;
      default:
        // Generic colored square
        ctx.fillStyle = color;
        ctx.fillRect(x + padding, y + padding, innerSize, innerSize);
    }
  }

  // Draw pickaxe icon
  drawToolIcon(ctx, x, y, size, color, toolType) {
    ctx.fillStyle = color;
    const s = size / 16;

    if (toolType === 'PICKAXE') {
      // Pickaxe shape
      ctx.fillRect(x + 2*s, y + 2*s, 12*s, 3*s);
      ctx.fillRect(x + 6*s, y + 5*s, 4*s, 10*s);
    } else if (toolType === 'AXE') {
      // Axe shape
      ctx.fillRect(x + 4*s, y + 2*s, 8*s, 6*s);
      ctx.fillRect(x + 6*s, y + 8*s, 4*s, 8*s);
    } else {
      // Generic tool
      ctx.fillRect(x + 6*s, y + 2*s, 4*s, 12*s);
      ctx.fillRect(x + 4*s, y + 12*s, 8*s, 4*s);
    }
  }

  // Draw sword icon
  drawSwordIcon(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    const s = size / 16;

    // Blade
    ctx.fillRect(x + 6*s, y + 1*s, 4*s, 10*s);
    // Guard
    ctx.fillStyle = '#DAA520';
    ctx.fillRect(x + 3*s, y + 10*s, 10*s, 2*s);
    // Handle
    ctx.fillStyle = '#5C4033';
    ctx.fillRect(x + 6*s, y + 12*s, 4*s, 4*s);
  }

  // Draw ranged weapon icon
  drawRangedIcon(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    const s = size / 16;

    // Bow shape
    ctx.fillRect(x + 4*s, y + 2*s, 2*s, 12*s);
    ctx.fillRect(x + 6*s, y + 4*s, 1*s, 8*s);
    ctx.fillStyle = '#F5DEB3';
    ctx.fillRect(x + 7*s, y + 3*s, 1*s, 10*s);
  }

  // Draw armor icon
  drawArmorIcon(ctx, x, y, size, color, slot) {
    ctx.fillStyle = color;
    const s = size / 16;

    if (slot === 'helmet') {
      ctx.fillRect(x + 3*s, y + 4*s, 10*s, 8*s);
      ctx.fillRect(x + 5*s, y + 2*s, 6*s, 2*s);
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + 5*s, y + 7*s, 6*s, 2*s);
    } else if (slot === 'chestplate') {
      ctx.fillRect(x + 2*s, y + 3*s, 12*s, 10*s);
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + 6*s, y + 1*s, 4*s, 3*s);
    } else if (slot === 'leggings') {
      ctx.fillRect(x + 3*s, y + 2*s, 10*s, 4*s);
      ctx.fillRect(x + 3*s, y + 6*s, 4*s, 10*s);
      ctx.fillRect(x + 9*s, y + 6*s, 4*s, 10*s);
    }
  }

  // Draw block icon
  drawBlockIcon(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);

    // Add 3D effect
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(x, y, size, 2);
    ctx.fillRect(x, y, 2, size);

    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x, y + size - 2, size, 2);
    ctx.fillRect(x + size - 2, y, 2, size);
  }

  // Handle mouse click (for later - inventory UI)
  handleClick(mousePos) {
    // Placeholder for inventory panel
    return false;
  }
}
