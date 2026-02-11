// ItemStack - A stack of items (item + count)
export class ItemStack {
  constructor(item, count = 1) {
    this.item = item; // Item reference
    this.count = count;
  }

  // Check if can add more to this stack
  canAdd(amount = 1) {
    if (!this.item.stackable) return false;
    return this.count + amount <= this.item.maxStack;
  }

  // Add to stack, returns overflow amount
  add(amount = 1) {
    if (!this.item.stackable) return amount;

    const space = this.item.maxStack - this.count;
    const toAdd = Math.min(amount, space);
    this.count += toAdd;
    return amount - toAdd; // Return overflow
  }

  // Remove from stack
  remove(amount = 1) {
    const toRemove = Math.min(amount, this.count);
    this.count -= toRemove;
    return toRemove;
  }

  // Check if stack is empty
  isEmpty() {
    return this.count <= 0;
  }

  // Check if stack is full
  isFull() {
    return this.count >= this.item.maxStack;
  }

  // Split stack into two
  split(amount) {
    if (amount >= this.count) {
      const result = new ItemStack(this.item, this.count);
      this.count = 0;
      return result;
    }

    const splitCount = Math.min(amount, this.count);
    this.count -= splitCount;
    return new ItemStack(this.item, splitCount);
  }

  // Clone this stack
  clone() {
    return new ItemStack(this.item.clone(), this.count);
  }
}
