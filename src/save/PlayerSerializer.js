// PlayerSerializer - Converts player data to/from JSON
export class PlayerSerializer {
  // Serialize player to JSON
  static serialize(player) {
    return {
      // Position
      pos: {
        x: player.pos.x,
        y: player.pos.y
      },

      // Health
      health: player.health,
      maxHealth: player.maxHealth,

      // Inventory
      inventory: this.serializeInventory(player.inventory),
      selectedSlot: player.selectedSlot,

      // Equipment
      equipment: player.equipment.toJSON(),

      // Stats
      stats: {
        defense: player.stats.defense,
        attackBonus: player.stats.attackBonus
      }
    };
  }

  // Serialize inventory
  static serializeInventory(inventory) {
    const slots = [];

    for (let i = 0; i < inventory.slots.length; i++) {
      const itemStack = inventory.slots[i];
      if (itemStack) {
        slots.push({
          index: i,
          itemId: itemStack.item.id,
          count: itemStack.count
        });
      }
    }

    return {
      maxSlots: inventory.maxSlots,
      slots: slots
    };
  }

  // Deserialize player from JSON
  static deserialize(playerData, player, itemDatabase) {
    if (!playerData) return false;

    // Restore position
    player.pos.x = playerData.pos.x;
    player.pos.y = playerData.pos.y;

    // Restore health
    player.health = playerData.health;
    player.maxHealth = playerData.maxHealth;

    // Restore inventory
    this.deserializeInventory(playerData.inventory, player.inventory, itemDatabase);
    player.selectedSlot = playerData.selectedSlot;

    // Restore equipment
    this.deserializeEquipment(playerData.equipment, player.equipment, itemDatabase);

    // Update player stats based on equipment
    player.updateStats();

    console.log('Player data loaded');
    return true;
  }

  // Deserialize inventory
  static deserializeInventory(inventoryData, inventory, itemDatabase) {
    // Clear existing inventory
    inventory.clear();

    // Restore items
    for (const slotData of inventoryData.slots) {
      const item = itemDatabase.getItem(slotData.itemId);
      if (item) {
        inventory.setSlot(slotData.index, item, slotData.count);
      }
    }
  }

  // Deserialize equipment
  static deserializeEquipment(equipmentData, equipment, itemDatabase) {
    for (const slotName in equipmentData) {
      const slotData = equipmentData[slotName];
      if (slotData) {
        const item = itemDatabase.getItem(slotData.itemId);
        if (item) {
          const itemStack = {
            item: item,
            count: slotData.count
          };
          equipment.equip(slotName, itemStack);
        }
      }
    }
  }
}
