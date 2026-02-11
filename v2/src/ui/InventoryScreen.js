// InventoryScreen - Minecraft-style inventory with backpack, armor, and hotbar
export class InventoryScreen {
  constructor(player, textureGen = null) {
    this.player = player;
    this.inventory = player.inventory;
    this.equipment = player.equipment;
    this.textureGen = textureGen;
    this.visible = false;

    // Layout settings
    this.slotSize = 44;
    this.slotPadding = 4;
    this.panelPadding = 20;

    // Inventory grid: 4 rows of 10 slots (slots 10-39 are backpack, 0-9 are hotbar)
    this.backpackRows = 3;
    this.backpackCols = 10;
    this.hotbarSlots = 10;

    // Held item for drag and drop
    this.heldItem = null;
    this.heldFromSlot = null; // { type: 'inventory'|'equipment', index: number|string }

    // Hover state for tooltips
    this.hoveredSlot = null;
    this.hoverType = null; // 'inventory', 'equipment', 'hotbar'

    // Animation
    this.animationTime = 0;
    this.fadeIn = 0;

    // Equipment slot definitions
    this.equipmentSlots = [
      { id: 'helmet', label: 'Helmet', row: 0 },
      { id: 'chestplate', label: 'Chest', row: 1 },
      { id: 'leggings', label: 'Legs', row: 2 },
    ];

    this.accessorySlots = [
      { id: 'accessory1', label: 'Acc 1' },
      { id: 'accessory2', label: 'Acc 2' },
      { id: 'accessory3', label: 'Acc 3' },
    ];
  }

  setTextureGenerator(textureGen) {
    this.textureGen = textureGen;
  }

  show() {
    this.visible = true;
    this.fadeIn = 0;
    this.heldItem = null;
    this.heldFromSlot = null;
  }

  hide() {
    this.visible = false;
    // Return held item to original slot
    if (this.heldItem && this.heldFromSlot) {
      this.returnHeldItem();
    }
    this.heldItem = null;
    this.heldFromSlot = null;
  }

  toggle() {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  update(dt) {
    if (!this.visible) return;
    this.animationTime += dt;
    this.fadeIn = Math.min(1, this.fadeIn + dt * 5);
  }

  // Return held item to its original slot
  returnHeldItem() {
    if (!this.heldItem || !this.heldFromSlot) return;

    if (this.heldFromSlot.type === 'inventory') {
      this.inventory.setSlot(this.heldFromSlot.index, this.heldItem);
    } else if (this.heldFromSlot.type === 'equipment') {
      this.equipment.equip(this.heldFromSlot.index, this.heldItem);
    }
  }

  // Calculate panel dimensions and position
  getPanelLayout(canvasWidth, canvasHeight) {
    const gridWidth = this.backpackCols * (this.slotSize + this.slotPadding);
    const equipmentWidth = 80;
    const playerPreviewWidth = 80;

    const panelWidth = gridWidth + equipmentWidth + playerPreviewWidth + this.panelPadding * 4;
    const panelHeight = (this.backpackRows + 2) * (this.slotSize + this.slotPadding) + 120;

    return {
      panelX: (canvasWidth - panelWidth) / 2,
      panelY: (canvasHeight - panelHeight) / 2,
      panelWidth,
      panelHeight,
      gridWidth,
      equipmentWidth,
      playerPreviewWidth
    };
  }

  handleInput(key) {
    if (!this.visible) return false;

    if (key === 'Escape' || key === 'e' || key === 'E' || key === 'i' || key === 'I') {
      this.hide();
      return true;
    }

    return false;
  }

  handleClick(mousePos, canvasWidth, canvasHeight) {
    if (!this.visible) return false;

    const layout = this.getPanelLayout(canvasWidth, canvasHeight);
    const { panelX, panelY, gridWidth, equipmentWidth } = layout;

    // Check equipment slots
    const equipX = panelX + this.panelPadding;
    const equipY = panelY + 60;

    // Armor slots
    for (let i = 0; i < this.equipmentSlots.length; i++) {
      const slot = this.equipmentSlots[i];
      const slotX = equipX;
      const slotY = equipY + i * (this.slotSize + this.slotPadding);

      if (this.isInSlot(mousePos, slotX, slotY)) {
        this.handleEquipmentClick(slot.id);
        return true;
      }
    }

    // Accessory slots
    const accY = equipY + this.equipmentSlots.length * (this.slotSize + this.slotPadding) + 20;
    for (let i = 0; i < this.accessorySlots.length; i++) {
      const slot = this.accessorySlots[i];
      const slotX = equipX;
      const slotY = accY + i * (this.slotSize + this.slotPadding);

      if (this.isInSlot(mousePos, slotX, slotY)) {
        this.handleEquipmentClick(slot.id);
        return true;
      }
    }

    // Check inventory grid (backpack)
    const gridX = panelX + this.panelPadding + equipmentWidth + 60;
    const gridY = panelY + 60;

    for (let row = 0; row < this.backpackRows; row++) {
      for (let col = 0; col < this.backpackCols; col++) {
        const slotIndex = 10 + row * this.backpackCols + col; // Backpack starts at slot 10
        const slotX = gridX + col * (this.slotSize + this.slotPadding);
        const slotY = gridY + row * (this.slotSize + this.slotPadding);

        if (this.isInSlot(mousePos, slotX, slotY)) {
          this.handleInventoryClick(slotIndex);
          return true;
        }
      }
    }

    // Check hotbar
    const hotbarY = gridY + this.backpackRows * (this.slotSize + this.slotPadding) + 20;
    for (let i = 0; i < this.hotbarSlots; i++) {
      const slotX = gridX + i * (this.slotSize + this.slotPadding);
      const slotY = hotbarY;

      if (this.isInSlot(mousePos, slotX, slotY)) {
        this.handleInventoryClick(i); // Hotbar is slots 0-9
        return true;
      }
    }

    return false;
  }

  isInSlot(mousePos, slotX, slotY) {
    return mousePos.x >= slotX && mousePos.x < slotX + this.slotSize &&
           mousePos.y >= slotY && mousePos.y < slotY + this.slotSize;
  }

  handleInventoryClick(slotIndex) {
    const clickedItem = this.inventory.getSlot(slotIndex);

    if (this.heldItem) {
      // Place or swap held item
      if (clickedItem) {
        // Check if same item type - stack them
        if (clickedItem.item.id === this.heldItem.item.id && clickedItem.item.stackable) {
          const remaining = clickedItem.add(this.heldItem.count);
          if (remaining === 0) {
            this.heldItem = null;
            this.heldFromSlot = null;
          } else {
            this.heldItem.count = remaining;
          }
        } else {
          // Swap items
          this.inventory.setSlot(slotIndex, this.heldItem);
          this.heldItem = clickedItem;
          this.heldFromSlot = { type: 'inventory', index: slotIndex };
        }
      } else {
        // Place item in empty slot
        this.inventory.setSlot(slotIndex, this.heldItem);
        this.heldItem = null;
        this.heldFromSlot = null;
      }
    } else if (clickedItem) {
      // Pick up item
      this.heldItem = clickedItem;
      this.heldFromSlot = { type: 'inventory', index: slotIndex };
      this.inventory.setSlot(slotIndex, null);
    }
  }

  handleEquipmentClick(slotId) {
    const clickedItem = this.equipment.getSlot(slotId);

    if (this.heldItem) {
      // Try to equip held item
      if (this.equipment.isValidForSlot(this.heldItem.item, slotId)) {
        if (clickedItem) {
          // Swap items
          this.equipment.equip(slotId, this.heldItem);
          this.heldItem = clickedItem;
          this.heldFromSlot = { type: 'equipment', index: slotId };
        } else {
          // Place item
          this.equipment.equip(slotId, this.heldItem);
          this.heldItem = null;
          this.heldFromSlot = null;
        }
        // Update player stats
        this.player.updateStats();
      }
    } else if (clickedItem) {
      // Pick up equipped item
      this.heldItem = clickedItem;
      this.heldFromSlot = { type: 'equipment', index: slotId };
      this.equipment.unequip(slotId);
      // Update player stats
      this.player.updateStats();
    }
  }

  handleMouseMove(mousePos, canvasWidth, canvasHeight) {
    if (!this.visible) return;

    this.hoveredSlot = null;
    this.hoverType = null;

    const layout = this.getPanelLayout(canvasWidth, canvasHeight);
    const { panelX, panelY, equipmentWidth } = layout;

    // Check equipment slots
    const equipX = panelX + this.panelPadding;
    const equipY = panelY + 60;

    for (let i = 0; i < this.equipmentSlots.length; i++) {
      const slot = this.equipmentSlots[i];
      const slotX = equipX;
      const slotY = equipY + i * (this.slotSize + this.slotPadding);

      if (this.isInSlot(mousePos, slotX, slotY)) {
        this.hoveredSlot = slot.id;
        this.hoverType = 'equipment';
        return;
      }
    }

    // Accessory slots
    const accY = equipY + this.equipmentSlots.length * (this.slotSize + this.slotPadding) + 20;
    for (let i = 0; i < this.accessorySlots.length; i++) {
      const slot = this.accessorySlots[i];
      const slotX = equipX;
      const slotY = accY + i * (this.slotSize + this.slotPadding);

      if (this.isInSlot(mousePos, slotX, slotY)) {
        this.hoveredSlot = slot.id;
        this.hoverType = 'equipment';
        return;
      }
    }

    // Check inventory grid
    const gridX = panelX + this.panelPadding + equipmentWidth + 60;
    const gridY = panelY + 60;

    for (let row = 0; row < this.backpackRows; row++) {
      for (let col = 0; col < this.backpackCols; col++) {
        const slotIndex = 10 + row * this.backpackCols + col;
        const slotX = gridX + col * (this.slotSize + this.slotPadding);
        const slotY = gridY + row * (this.slotSize + this.slotPadding);

        if (this.isInSlot(mousePos, slotX, slotY)) {
          this.hoveredSlot = slotIndex;
          this.hoverType = 'inventory';
          return;
        }
      }
    }

    // Check hotbar
    const hotbarY = gridY + this.backpackRows * (this.slotSize + this.slotPadding) + 20;
    for (let i = 0; i < this.hotbarSlots; i++) {
      const slotX = gridX + i * (this.slotSize + this.slotPadding);
      const slotY = hotbarY;

      if (this.isInSlot(mousePos, slotX, slotY)) {
        this.hoveredSlot = i;
        this.hoverType = 'hotbar';
        return;
      }
    }
  }

  render(ctx, mousePos) {
    if (!this.visible) return;

    const canvas = ctx.canvas;
    const layout = this.getPanelLayout(canvas.width, canvas.height);
    const { panelX, panelY, panelWidth, panelHeight, equipmentWidth } = layout;

    // Update hover state
    if (mousePos) {
      this.handleMouseMove(mousePos, canvas.width, canvas.height);
    }

    // Dark overlay
    ctx.fillStyle = `rgba(0, 0, 0, ${0.7 * this.fadeIn})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Scale for fade in
    ctx.save();
    const scale = 0.9 + 0.1 * this.fadeIn;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.globalAlpha = this.fadeIn;

    // Panel background
    if (this.textureGen && this.textureGen.textures.ui_panel_bg) {
      const pattern = ctx.createPattern(this.textureGen.textures.ui_panel_bg, 'repeat');
      ctx.fillStyle = pattern;
      ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    } else {
      ctx.fillStyle = 'rgba(40, 40, 50, 0.95)';
      ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    }

    // Panel border (Gold/Wood style)
    ctx.strokeStyle = '#8B5A2B'; // Wood brown
    ctx.lineWidth = 4;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    ctx.strokeStyle = '#DAA520'; // Gold inner trim
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX + 2, panelY + 2, panelWidth - 4, panelHeight - 4);

    // Title
    ctx.textAlign = 'center';
    ctx.font = 'bold 24px monospace';
    ctx.fillStyle = '#FFD700';
    // Title shadow
    ctx.fillText('Inventory', panelX + panelWidth / 2 + 2, panelY + 37);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Inventory', panelX + panelWidth / 2, panelY + 35);

    // Render equipment section
    this.renderEquipment(ctx, panelX + this.panelPadding, panelY + 60);

    // Render player preview
    this.renderPlayerPreview(ctx, panelX + this.panelPadding + 60, panelY + 60);

    // Render inventory grid
    const gridX = panelX + this.panelPadding + equipmentWidth + 60;
    const gridY = panelY + 60;
    this.renderInventoryGrid(ctx, gridX, gridY);

    // Render hotbar
    const hotbarY = gridY + this.backpackRows * (this.slotSize + this.slotPadding) + 20;
    this.renderHotbar(ctx, gridX, hotbarY);

    // Render stats
    this.renderStats(ctx, panelX + panelWidth - 120, panelY + 60);

    // Render tooltip
    if (this.hoveredSlot !== null && mousePos) {
      this.renderTooltip(ctx, mousePos);
    }

    // Render held item at cursor
    if (this.heldItem && mousePos) {
      this.renderItem(ctx, this.heldItem, mousePos.x - this.slotSize / 2, mousePos.y - this.slotSize / 2);
    }

    ctx.restore();

    // Instructions (outside scale transform)
    ctx.globalAlpha = this.fadeIn;
    ctx.textAlign = 'center';
    ctx.font = '14px monospace';
    ctx.fillStyle = '#888888';
    ctx.fillText('Click to pick up/place items | Press E or ESC to close', canvas.width / 2, canvas.height - 30);
    ctx.globalAlpha = 1;
  }

  renderEquipment(ctx, x, y) {
    // Section label
    ctx.textAlign = 'left';
    ctx.font = '14px monospace';
    ctx.fillStyle = '#AAAAAA';
    ctx.fillText('Armor', x, y - 10);

    // Armor slots
    for (let i = 0; i < this.equipmentSlots.length; i++) {
      const slot = this.equipmentSlots[i];
      const slotY = y + i * (this.slotSize + this.slotPadding);
      const itemStack = this.equipment.getSlot(slot.id);
      const isHovered = this.hoveredSlot === slot.id && this.hoverType === 'equipment';

      this.renderSlot(ctx, x, slotY, itemStack, isHovered, slot.id);
    }

    // Accessory label
    const accY = y + this.equipmentSlots.length * (this.slotSize + this.slotPadding) + 10;
    ctx.fillText('Accessories', x, accY);

    // Accessory slots
    for (let i = 0; i < this.accessorySlots.length; i++) {
      const slot = this.accessorySlots[i];
      const slotY = accY + 10 + i * (this.slotSize + this.slotPadding);
      const itemStack = this.equipment.getSlot(slot.id);
      const isHovered = this.hoveredSlot === slot.id && this.hoverType === 'equipment';

      this.renderSlot(ctx, x, slotY, itemStack, isHovered, slot.id);
    }
  }

  renderPlayerPreview(ctx, x, y) {
    const previewWidth = 60;
    const previewHeight = 120;

    // Preview background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x, y, previewWidth, previewHeight);

    // Draw player texture scaled up
    const playerTexture = this.textureGen.getEntityTexture('player');
    const scale = 5;
    const drawX = x + (previewWidth - 12 * scale) / 2;
    const drawY = y + (previewHeight - 24 * scale) / 2;

    if (playerTexture) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(playerTexture, drawX, drawY, 12 * scale, 24 * scale);
    }

    // Draw Armor overlays
    const slots = ['leggings', 'chestplate', 'helmet'];
    for (const slotName of slots) {
      const itemStack = this.equipment.getSlot(slotName);
      if (itemStack) {
        const textureKey = 'armor_' + itemStack.item.id;
        const texture = this.textureGen.textures[textureKey];
        if (texture) {
          ctx.drawImage(texture, drawX, drawY, 12 * scale, 24 * scale);
        }
      }
    }
  }

  renderInventoryGrid(ctx, x, y) {
    // Section label
    ctx.textAlign = 'left';
    ctx.font = '14px monospace';
    ctx.fillStyle = '#AAAAAA';
    ctx.fillText('Backpack', x, y - 10);

    // Render backpack slots (slots 10-39)
    for (let row = 0; row < this.backpackRows; row++) {
      for (let col = 0; col < this.backpackCols; col++) {
        const slotIndex = 10 + row * this.backpackCols + col;
        const slotX = x + col * (this.slotSize + this.slotPadding);
        const slotY = y + row * (this.slotSize + this.slotPadding);
        const itemStack = this.inventory.getSlot(slotIndex);
        const isHovered = this.hoveredSlot === slotIndex && this.hoverType === 'inventory';

        this.renderSlot(ctx, slotX, slotY, itemStack, isHovered);
      }
    }
  }

  renderHotbar(ctx, x, y) {
    // Section label with separator line
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y - 10);
    ctx.lineTo(x + this.backpackCols * (this.slotSize + this.slotPadding), y - 10);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = '14px monospace';
    ctx.fillStyle = '#AAAAAA';
    ctx.fillText('Hotbar', x, y - 15);

    // Render hotbar slots (slots 0-9)
    for (let i = 0; i < this.hotbarSlots; i++) {
      const slotX = x + i * (this.slotSize + this.slotPadding);
      const itemStack = this.inventory.getSlot(i);
      const isSelected = this.player.selectedSlot === i;
      const isHovered = this.hoveredSlot === i && this.hoverType === 'hotbar';

      this.renderSlot(ctx, slotX, y, itemStack, isHovered, null, isSelected);

      // Slot number
      ctx.fillStyle = '#888888';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText((i + 1) % 10, slotX + this.slotSize / 2, y + this.slotSize + 12);
    }
  }

  renderSlot(ctx, x, y, itemStack, isHovered, equipSlotType = null, isSelected = false) {
    const slotTexture = this.textureGen ? this.textureGen.textures.ui_slot : null;
    const selectedTexture = this.textureGen ? this.textureGen.textures.ui_slot_selected : null;

    if (slotTexture && selectedTexture) {
      // Draw textured slot
      ctx.drawImage(isSelected || isHovered ? selectedTexture : slotTexture, x, y, this.slotSize, this.slotSize);
      
      // Hover overlay
      if (isHovered) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(x + 2, y + 2, this.slotSize - 4, this.slotSize - 4);
      }
    } else {
      // Fallback slot
      if (isSelected) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
      } else if (isHovered) {
        ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';
      } else {
        ctx.fillStyle = 'rgba(60, 60, 70, 0.8)';
      }
      ctx.fillRect(x, y, this.slotSize, this.slotSize);

      if (isSelected) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
      } else if (isHovered) {
        ctx.strokeStyle = '#AAAAAA';
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = '#444444';
        ctx.lineWidth = 1;
      }
      ctx.strokeRect(x, y, this.slotSize, this.slotSize);
    }

    // Draw slot type icon if empty equipment slot
    if (!itemStack && equipSlotType) {
      this.renderEmptyEquipSlot(ctx, x, y, equipSlotType);
    }

    // Draw item
    if (itemStack) {
      this.renderItem(ctx, itemStack, x, y);
    }
  }

  renderEmptyEquipSlot(ctx, x, y, slotType) {
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 2;
    const padding = 8;
    const size = this.slotSize - padding * 2;

    ctx.save();
    ctx.translate(x + padding, y + padding);

    if (slotType === 'helmet') {
      // Helmet outline
      ctx.strokeRect(4, 8, size - 8, size - 12);
      ctx.strokeRect(8, 2, size - 16, 8);
    } else if (slotType === 'chestplate') {
      // Chest outline
      ctx.strokeRect(2, 6, size - 4, size - 8);
      ctx.beginPath();
      ctx.moveTo(size / 2 - 6, 0);
      ctx.lineTo(size / 2 + 6, 0);
      ctx.lineTo(size / 2 + 6, 8);
      ctx.lineTo(size / 2 - 6, 8);
      ctx.stroke();
    } else if (slotType === 'leggings') {
      // Legs outline
      ctx.strokeRect(4, 0, size - 8, 8);
      ctx.strokeRect(4, 8, (size - 12) / 2, size - 10);
      ctx.strokeRect(size / 2 + 2, 8, (size - 12) / 2, size - 10);
    } else if (slotType.startsWith('accessory')) {
      // Accessory - circle
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  renderItem(ctx, itemStack, x, y) {
    const itemPadding = 4;
    const itemSize = this.slotSize - itemPadding * 2;
    const itemX = x + itemPadding;
    const itemY = y + itemPadding;

    // Try to get texture
    let texture = null;
    if (this.textureGen) {
      texture = this.textureGen.getItemTexture(itemStack.item.id);
    }

    if (texture) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(texture, itemX, itemY, itemSize, itemSize);
    } else {
      // Fallback colored square
      ctx.fillStyle = itemStack.item.color || '#FFFFFF';
      ctx.fillRect(itemX, itemY, itemSize, itemSize);

      // Add 3D effect
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(itemX, itemY, itemSize, 3);
      ctx.fillRect(itemX, itemY, 3, itemSize);
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(itemX, itemY + itemSize - 3, itemSize, 3);
      ctx.fillRect(itemX + itemSize - 3, itemY, 3, itemSize);
    }

    // Stack count
    if (itemStack.count > 1) {
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = '#000000';
      ctx.fillText(itemStack.count, x + this.slotSize - 3, y + this.slotSize - 1);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(itemStack.count, x + this.slotSize - 4, y + this.slotSize - 2);
    }
  }

  renderStats(ctx, x, y) {
    ctx.textAlign = 'left';
    ctx.font = '12px monospace';

    // Defense
    const defense = this.equipment.getTotalDefense();
    ctx.fillStyle = '#00AAFF';
    ctx.fillText('Defense:', x, y);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(defense.toString(), x + 70, y);

    // Set bonus
    const setBonus = this.equipment.getSetBonus();
    if (setBonus) {
      ctx.fillStyle = '#FFD700';
      ctx.fillText('Set:', x, y + 20);
      ctx.fillText(setBonus.toUpperCase(), x + 35, y + 20);
    }
  }

  renderTooltip(ctx, mousePos) {
    let itemStack = null;

    if (this.hoverType === 'inventory' || this.hoverType === 'hotbar') {
      itemStack = this.inventory.getSlot(this.hoveredSlot);
    } else if (this.hoverType === 'equipment') {
      itemStack = this.equipment.getSlot(this.hoveredSlot);
    }

    if (!itemStack) return;

    const item = itemStack.item;
    const padding = 10;
    const lineHeight = 18;
    let lines = [item.name];

    // Add item stats
    if (item.damage) {
      lines.push(`Damage: ${item.damage}`);
    }
    if (item.defense) {
      lines.push(`Defense: ${item.defense}`);
    }
    if (item.miningPower) {
      lines.push(`Mining Power: ${item.miningPower}%`);
    }
    if (item.description) {
      lines.push(item.description);
    }

    // Calculate tooltip size
    ctx.font = '14px monospace';
    let maxWidth = 0;
    for (const line of lines) {
      const width = ctx.measureText(line).width;
      if (width > maxWidth) maxWidth = width;
    }

    const tooltipWidth = maxWidth + padding * 2;
    const tooltipHeight = lines.length * lineHeight + padding * 2;

    // Position tooltip
    let tooltipX = mousePos.x + 15;
    let tooltipY = mousePos.y + 15;

    // Keep on screen
    if (tooltipX + tooltipWidth > ctx.canvas.width) {
      tooltipX = mousePos.x - tooltipWidth - 5;
    }
    if (tooltipY + tooltipHeight > ctx.canvas.height) {
      tooltipY = mousePos.y - tooltipHeight - 5;
    }

    // Draw tooltip background
    ctx.fillStyle = 'rgba(20, 20, 30, 0.95)';
    ctx.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 1;
    ctx.strokeRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);

    // Draw text
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    for (let i = 0; i < lines.length; i++) {
      if (i === 0) {
        // Item name - colored by rarity
        ctx.fillStyle = this.getRarityColor(item.rarity);
        ctx.font = 'bold 14px monospace';
      } else {
        ctx.fillStyle = '#AAAAAA';
        ctx.font = '14px monospace';
      }
      ctx.fillText(lines[i], tooltipX + padding, tooltipY + padding + i * lineHeight);
    }
  }

  getRarityColor(rarity) {
    switch (rarity) {
      case 'common': return '#FFFFFF';
      case 'uncommon': return '#00FF00';
      case 'rare': return '#5555FF';
      case 'epic': return '#AA00AA';
      case 'legendary': return '#FFAA00';
      default: return '#FFFFFF';
    }
  }
}
