// Weapon - Weapon mechanics
export class Weapon {
  constructor(owner, damage, attackSpeed = 1.0, range = 40) {
    this.owner = owner;
    this.damage = damage;
    this.attackSpeed = attackSpeed;
    this.range = range;
    this.swinging = false;
    this.swingTime = 0;
    this.swingDuration = 0.3; // seconds
    this.cooldown = 0;
    this.hitEntities = new Set(); // Entities hit this swing
  }

  // Start a weapon swing
  swing() {
    if (this.swinging || this.cooldown > 0) return false;

    this.swinging = true;
    this.swingTime = 0;
    this.hitEntities.clear();
    return true;
  }

  // Update weapon state
  update(dt) {
    if (this.swinging) {
      this.swingTime += dt;

      if (this.swingTime >= this.swingDuration) {
        this.swinging = false;
        this.cooldown = this.getCooldown();
      }
    }

    if (this.cooldown > 0) {
      this.cooldown -= dt;
    }
  }

  // Check if weapon is currently swinging
  isSwinging() {
    return this.swinging;
  }

  // Get weapon cooldown (based on attack speed)
  getCooldown() {
    return (1.0 / this.attackSpeed) * 0.5; // 0.5s base cooldown
  }

  // Get weapon reach
  getReach() {
    return this.range;
  }

  // Get weapon damage
  getDamage() {
    return this.damage;
  }

  // Get weapon hitbox (simplified - cone in front of player)
  getHitbox() {
    if (!this.owner) return null;

    const reach = this.getReach();
    const facing = this.owner.facing || 1;

    return {
      x: this.owner.pos.x + (facing * reach / 2),
      y: this.owner.pos.y,
      width: reach,
      height: this.owner.size.y
    };
  }

  // Check if entity is in weapon range
  canHit(entity) {
    if (!this.swinging) return false;
    if (this.hitEntities.has(entity)) return false; // Already hit this swing

    const hitbox = this.getHitbox();
    if (!hitbox) return false;

    const entityBounds = entity.getBounds();

    // Check overlap
    return !(hitbox.x + hitbox.width < entityBounds.left ||
             hitbox.x > entityBounds.right ||
             hitbox.y + hitbox.height < entityBounds.top ||
             hitbox.y > entityBounds.bottom);
  }

  // Mark entity as hit
  markHit(entity) {
    this.hitEntities.add(entity);
  }

  // Is weapon ready to swing
  isReady() {
    return !this.swinging && this.cooldown <= 0;
  }
}
