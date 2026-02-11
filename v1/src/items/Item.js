// Item - Item definition
export class Item {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type; // BLOCK, TOOL, WEAPON, CONSUMABLE
    this.stackable = config.stackable !== false; // Default true
    this.maxStack = config.maxStack || 99;
    this.durability = config.durability || null; // null = infinite
    this.maxDurability = config.durability || null;
    this.sprite = config.sprite || 0; // Sprite index in atlas
    this.color = config.color || '#FFFFFF'; // Color for rendering (before sprites)

    // Tool properties
    this.toolType = config.toolType || null; // PICKAXE, AXE, SHOVEL
    this.toolPower = config.toolPower || 0; // Mining speed multiplier

    // Block properties
    this.tileType = config.tileType || null; // Which tile this places

    // Weapon properties
    this.damage = config.damage || 0;
    this.attackSpeed = config.attackSpeed || 1.0;
  }

  // Check if item can stack with another
  canStackWith(other) {
    if (!this.stackable || !other.stackable) return false;
    return this.id === other.id;
  }

  // Clone this item
  clone() {
    return new Item({
      id: this.id,
      name: this.name,
      type: this.type,
      stackable: this.stackable,
      maxStack: this.maxStack,
      durability: this.durability,
      sprite: this.sprite,
      color: this.color,
      toolType: this.toolType,
      toolPower: this.toolPower,
      tileType: this.tileType,
      damage: this.damage,
      attackSpeed: this.attackSpeed
    });
  }
}
