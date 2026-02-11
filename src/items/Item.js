// Item - Item definition
export class Item {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type; // BLOCK, TOOL, WEAPON, CONSUMABLE, ARMOR, SUMMONING
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
    this.tileType = config.tileType !== undefined ? config.tileType : null; // Which tile this places
    this.wallType = config.wallType !== undefined ? config.wallType : null; // Which wall this places

    // Weapon properties
    this.damage = config.damage || 0;
    this.attackSpeed = config.attackSpeed || 1.0;
    this.isRanged = config.isRanged || false;
    this.projectileSpeed = config.projectileSpeed || 0;

    // Armor properties
    this.equipSlot = config.equipSlot || null; // helmet, chestplate, leggings, accessory
    this.defense = config.defense || 0;
    this.armorTier = config.armorTier || null;
    this.bonusStats = config.bonusStats || null; // {maxHealth, attackBonus, moveSpeed, defense}

    // Consumable properties
    this.healAmount = config.healAmount || 0;
    this.lightSource = config.lightSource || false;

    // Summoning properties
    this.summonsBoss = config.summonsBoss || null;
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
      wallType: this.wallType,
      damage: this.damage,
      attackSpeed: this.attackSpeed,
      isRanged: this.isRanged,
      projectileSpeed: this.projectileSpeed,
      equipSlot: this.equipSlot,
      defense: this.defense,
      armorTier: this.armorTier,
      bonusStats: this.bonusStats ? { ...this.bonusStats } : null,
      healAmount: this.healAmount,
      lightSource: this.lightSource,
      summonsBoss: this.summonsBoss
    });
  }
}
