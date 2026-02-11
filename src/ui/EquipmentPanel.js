// EquipmentPanel - UI for equipping armor
export class EquipmentPanel {
  constructor(equipment, inventory, player, textureGen = null) {
    this.equipment = equipment;
    this.inventory = inventory;
    this.player = player;
    this.textureGen = textureGen;
    this.visible = false;

    // Panel dimensions
    this.x = 300;
    this.y = 100;
    this.width = 250;
    this.height = 350;

    // Slot positions
    this.slots = {
      helmet: { x: this.x + 95, y: this.y + 50, label: 'Helmet' },
      chestplate: { x: this.x + 95, y: this.y + 110, label: 'Chest' },
      leggings: { x: this.x + 95, y: this.y + 170, label: 'Legs' },
      accessory1: { x: this.x + 20, y: this.y + 230, label: 'Acc 1' },
      accessory2: { x: this.x + 95, y: this.y + 230, label: 'Acc 2' },
      accessory3: { x: this.x + 170, y: this.y + 230, label: 'Acc 3' }
    };

    this.slotSize = 50;
  }

  // Set texture generator
  setTextureGenerator(textureGen) {
    this.textureGen = textureGen;
  }

  toggle() {
    this.visible = !this.visible;
  }

  render(ctx) {
    if (!this.visible) return;

    // Semi-transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Equipment', this.x + this.width / 2, this.y + 25);

    // Render each equipment slot
    for (const slotName in this.slots) {
      const slot = this.slots[slotName];
      this.renderSlot(ctx, slotName, slot);
    }

    // Show total defense
    const totalDefense = this.equipment.getTotalDefense();
    ctx.fillStyle = '#00FF00';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Defense: ${totalDefense}`, this.x + this.width / 2, this.y + this.height - 40);

    // Show set bonus if any
    const setBonus = this.equipment.getSetBonus();
    if (setBonus) {
      ctx.fillStyle = '#FFD700';
      ctx.fillText(`Set Bonus: ${setBonus.toUpperCase()}`, this.x + this.width / 2, this.y + this.height - 15);
    }

    // Instructions
    ctx.fillStyle = '#AAAAAA';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Click armor in inventory to equip', this.x + 10, this.y + 300);
    ctx.fillText('Click equipped item to unequip', this.x + 10, this.y + 315);
    ctx.fillText('Press E to close', this.x + 10, this.y + 330);
  }

  renderSlot(ctx, slotName, slot) {
    const itemStack = this.equipment.getSlot(slotName);

    // Slot background
    ctx.fillStyle = '#333333';
    ctx.fillRect(slot.x, slot.y, this.slotSize, this.slotSize);

    // Slot border
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    ctx.strokeRect(slot.x, slot.y, this.slotSize, this.slotSize);

    // Slot label
    ctx.fillStyle = '#AAAAAA';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(slot.label, slot.x + this.slotSize / 2, slot.y - 5);

    // Item if equipped
    if (itemStack) {
      // Try to get texture
      let texture = null;
      if (this.textureGen) {
        texture = this.textureGen.getItemTexture(itemStack.item.id);
      }

      if (texture) {
        // Draw item texture
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(texture, slot.x + 5, slot.y + 5, this.slotSize - 10, this.slotSize - 10);
      } else {
        // Fallback to colored square
        ctx.fillStyle = itemStack.item.color || '#FFFFFF';
        ctx.fillRect(slot.x + 5, slot.y + 5, this.slotSize - 10, this.slotSize - 10);

        // Item name (abbreviated)
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        const name = itemStack.item.name.substring(0, 8);
        ctx.fillText(name, slot.x + this.slotSize / 2, slot.y + this.slotSize / 2 + 4);
      }

      // Defense value
      if (itemStack.item.defense) {
        ctx.fillStyle = '#00FF00';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`+${itemStack.item.defense}`, slot.x + this.slotSize / 2, slot.y + this.slotSize - 5);
      }
    } else {
      // Empty slot icon based on slot type
      ctx.fillStyle = '#555555';
      ctx.font = '20px monospace';
      ctx.textAlign = 'center';

      // Draw slot type icon
      if (slotName === 'helmet') {
        this.drawHelmetOutline(ctx, slot.x + 15, slot.y + 12, 20);
      } else if (slotName === 'chestplate') {
        this.drawChestOutline(ctx, slot.x + 15, slot.y + 12, 20);
      } else if (slotName === 'leggings') {
        this.drawLegsOutline(ctx, slot.x + 15, slot.y + 12, 20);
      } else {
        ctx.fillText('?', slot.x + this.slotSize / 2, slot.y + this.slotSize / 2 + 8);
      }
    }
  }

  // Draw helmet outline for empty slot
  drawHelmetOutline(ctx, x, y, size) {
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, y + 4, size - 4, size - 8);
    ctx.strokeRect(x + 4, y, size - 8, 4);
    // Visor
    ctx.fillStyle = '#333333';
    ctx.fillRect(x + 4, y + 10, size - 8, 4);
  }

  // Draw chestplate outline for empty slot
  drawChestOutline(ctx, x, y, size) {
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, y + 4, size - 4, size - 6);
    // Neck hole
    ctx.fillStyle = '#333333';
    ctx.fillRect(x + 6, y, size - 12, 5);
  }

  // Draw leggings outline for empty slot
  drawLegsOutline(ctx, x, y, size) {
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 2;
    // Waist
    ctx.strokeRect(x + 2, y, size - 4, 6);
    // Left leg
    ctx.strokeRect(x + 2, y + 6, 7, size - 8);
    // Right leg
    ctx.strokeRect(x + size - 9, y + 6, 7, size - 8);
  }

  handleClick(mousePos, selectedSlot) {
    if (!this.visible) return false;

    // Check if clicking on an equipment slot
    for (const slotName in this.slots) {
      const slot = this.slots[slotName];

      if (mousePos.x >= slot.x && mousePos.x <= slot.x + this.slotSize &&
          mousePos.y >= slot.y && mousePos.y <= slot.y + this.slotSize) {

        const itemStack = this.equipment.getSlot(slotName);

        if (itemStack) {
          // Unequip
          this.player.unequipItem(slotName);
          return true;
        }
      }
    }

    // Check if trying to equip from inventory
    const selectedItem = this.inventory.getSlot(selectedSlot);
    if (selectedItem && selectedItem.item.type === 'ARMOR') {
      this.player.equipItem(selectedSlot);
      return true;
    }

    return false;
  }
}
