// DamageSystem - Handles damage calculation and application
export class DamageSystem {
  // Calculate damage from attacker to target
  static calculateDamage(attacker, target, baseDamage, damageType = 'MELEE') {
    let damage = baseDamage;

    // Apply attacker bonuses (from equipment, buffs, etc.)
    if (attacker.stats && attacker.stats.attackBonus) {
      damage += attacker.stats.attackBonus;
    }

    // Apply target defense
    if (target.stats && target.stats.defense) {
      damage = Math.max(1, damage - target.stats.defense);
    }

    // Random variance (90% to 110%)
    damage *= 0.9 + Math.random() * 0.2;

    return Math.floor(damage);
  }

  // Apply damage to an entity
  static applyDamage(entity, damage, source = null) {
    if (!entity || !entity.alive) return false;

    entity.takeDamage(damage);

    // Apply knockback if source is provided
    if (source && entity.pos && source.pos) {
      const dx = entity.pos.x - source.pos.x;
      const dy = entity.pos.y - source.pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0) {
        const knockbackForce = 200;
        entity.vel.x += (dx / distance) * knockbackForce;
        entity.vel.y -= 100; // Slight upward knockback
      }
    }

    return true;
  }

  // Check if entity can be damaged (invincibility frames)
  static canDamage(entity) {
    if (!entity || !entity.alive) return false;
    if (entity.invincibleUntil && Date.now() < entity.invincibleUntil) return false;
    return true;
  }

  // Set invincibility frames
  static setInvincible(entity, duration = 500) {
    entity.invincibleUntil = Date.now() + duration;
  }
}
