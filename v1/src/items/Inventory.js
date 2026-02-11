// Inventory - Container for items
import { ItemStack } from './ItemStack.js';

export class Inventory {
  constructor(size = 40) {
    this.size = size;
    this.maxSlots = size;
    this.slots = new Array(size).fill(null);
  }

  // Get item stack at index
  getSlot(index) {
    if (index < 0 || index >= this.size) return null;
    return this.slots[index];
  }

  // Set item stack at index
  setSlot(index, itemOrStack, count = 1) {
    if (index < 0 || index >= this.size) return false;

    // If passed an ItemStack, use it directly
    if (itemOrStack && itemOrStack.item && itemOrStack.count !== undefined) {
      this.slots[index] = itemOrStack;
    }
    // If passed an Item, create an ItemStack
    else if (itemOrStack) {
      this.slots[index] = new ItemStack(itemOrStack, count);
    }
    // If null, clear the slot
    else {
      this.slots[index] = null;
    }

    return true;
  }

  // Add item to inventory, returns amount that couldn't fit
  addItem(item, count = 1) {
    let remaining = count;

    // First, try to add to existing stacks
    if (item.stackable) {
      for (let i = 0; i < this.size && remaining > 0; i++) {
        const slot = this.slots[i];
        if (slot && slot.item.id === item.id && !slot.isFull()) {
          remaining = slot.add(remaining);
        }
      }
    }

    // Then, add to empty slots
    while (remaining > 0) {
      const emptySlot = this.findEmptySlot();
      if (emptySlot === -1) break; // No space

      const stackCount = Math.min(remaining, item.maxStack);
      this.slots[emptySlot] = new ItemStack(item, stackCount);
      remaining -= stackCount;
    }

    return remaining; // Return amount that didn't fit
  }

  // Remove item from inventory
  removeItem(item, count = 1) {
    let remaining = count;

    for (let i = 0; i < this.size && remaining > 0; i++) {
      const slot = this.slots[i];
      if (slot && slot.item.id === item.id) {
        const removed = slot.remove(remaining);
        remaining -= removed;

        if (slot.isEmpty()) {
          this.slots[i] = null;
        }
      }
    }

    return count - remaining; // Return amount actually removed
  }

  // Check if inventory has item
  hasItem(item, count = 1) {
    let found = 0;

    for (let i = 0; i < this.size; i++) {
      const slot = this.slots[i];
      if (slot && slot.item.id === item.id) {
        found += slot.count;
        if (found >= count) return true;
      }
    }

    return false;
  }

  // Count how many of an item we have
  countItem(item) {
    let total = 0;

    for (let i = 0; i < this.size; i++) {
      const slot = this.slots[i];
      if (slot && slot.item.id === item.id) {
        total += slot.count;
      }
    }

    return total;
  }

  // Find first empty slot
  findEmptySlot() {
    for (let i = 0; i < this.size; i++) {
      if (!this.slots[i]) return i;
    }
    return -1;
  }

  // Check if inventory is full
  isFull() {
    return this.findEmptySlot() === -1;
  }

  // Swap two slots
  swapSlots(index1, index2) {
    if (index1 < 0 || index1 >= this.size) return false;
    if (index2 < 0 || index2 >= this.size) return false;

    const temp = this.slots[index1];
    this.slots[index1] = this.slots[index2];
    this.slots[index2] = temp;
    return true;
  }

  // Clear inventory
  clear() {
    this.slots.fill(null);
  }

  // Get all items (non-null slots)
  getAllItems() {
    return this.slots.filter(slot => slot !== null);
  }
}
