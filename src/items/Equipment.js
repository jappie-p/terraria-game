// Equipment - Manages equipped armor and accessories
export class Equipment {
  constructor() {
    // Equipment slots
    this.slots = {
      helmet: null,
      chestplate: null,
      leggings: null,
      accessory1: null,
      accessory2: null,
      accessory3: null
    };
  }

  // Equip an item to a slot
  equip(slotName, itemStack) {
    if (!this.slots.hasOwnProperty(slotName)) {
      return false;
    }

    // Check if item is valid for this slot
    if (itemStack && !this.isValidForSlot(itemStack.item, slotName)) {
      return false;
    }

    // Store previous item
    const previousItem = this.slots[slotName];

    // Equip new item
    this.slots[slotName] = itemStack;

    return previousItem; // Return old item to add back to inventory
  }

  // Unequip an item from a slot
  unequip(slotName) {
    if (!this.slots.hasOwnProperty(slotName)) {
      return null;
    }

    const item = this.slots[slotName];
    this.slots[slotName] = null;
    return item;
  }

  // Check if item is valid for a slot
  isValidForSlot(item, slotName) {
    if (!item || !item.equipSlot) return false;

    // Accessories can go in any accessory slot
    if (slotName.startsWith('accessory') && item.equipSlot === 'accessory') {
      return true;
    }

    return item.equipSlot === slotName;
  }

  // Get item in a slot
  getSlot(slotName) {
    return this.slots[slotName];
  }

  // Get total defense from all armor
  getTotalDefense() {
    let defense = 0;

    for (const slotName in this.slots) {
      const itemStack = this.slots[slotName];
      if (itemStack && itemStack.item.defense) {
        defense += itemStack.item.defense;
      }
    }

    return defense;
  }

  // Get total bonus stats from equipment
  getBonusStats() {
    const stats = {
      maxHealth: 0,
      moveSpeed: 0,
      attackBonus: 0,
      defense: this.getTotalDefense()
    };

    for (const slotName in this.slots) {
      const itemStack = this.slots[slotName];
      if (itemStack && itemStack.item.bonusStats) {
        const bonuses = itemStack.item.bonusStats;
        stats.maxHealth += bonuses.maxHealth || 0;
        stats.moveSpeed += bonuses.moveSpeed || 0;
        stats.attackBonus += bonuses.attackBonus || 0;
      }
    }

    return stats;
  }

  // Get set bonus (if wearing full set of same tier)
  getSetBonus() {
    const helmet = this.slots.helmet?.item;
    const chest = this.slots.chestplate?.item;
    const legs = this.slots.leggings?.item;

    // Check if all 3 armor pieces exist
    if (!helmet || !chest || !legs) return null;

    // Check if they're all the same tier
    if (helmet.armorTier === chest.armorTier &&
        chest.armorTier === legs.armorTier) {
      return helmet.armorTier; // Return the tier for set bonus
    }

    return null;
  }

  // Serialize for saving
  toJSON() {
    const data = {};
    for (const slotName in this.slots) {
      const itemStack = this.slots[slotName];
      if (itemStack) {
        data[slotName] = {
          itemId: itemStack.item.id,
          count: itemStack.count
        };
      }
    }
    return data;
  }
}
