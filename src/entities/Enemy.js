// Enemy - Base enemy class with AI support
import { Entity } from './Entity.js';

export class Enemy extends Entity {
  constructor(x, y, width, height) {
    super(x, y, width, height);

    // Enemy properties
    this.isEnemy = true; // Mark as enemy for spawner and combat
    this.ai = null; // AI component
    this.damage = 10; // Contact damage
    this.dropTable = []; // Items to drop on death
    this.contactDamageInterval = 1.0; // seconds between contact damage
    this.lastContactDamage = 0;
    this.invincibleUntil = 0; // For damage invincibility frames
    this.facingLeft = false; // For texture flipping
  }

  // Update enemy
  update(dt, world, entities) {
    // Update AI
    if (this.ai) {
      this.ai.update(dt, world, entities);
    }

    // Update invincibility
    this.lastContactDamage += dt;

    // Update facing direction based on velocity
    if (this.vel.x < -5) {
      this.facingLeft = true;
    } else if (this.vel.x > 5) {
      this.facingLeft = false;
    }
  }

  // Set AI behavior
  setAI(aiComponent) {
    this.ai = aiComponent;
  }

  // Can deal contact damage
  canDealContactDamage() {
    return this.lastContactDamage >= this.contactDamageInterval;
  }

  // Reset contact damage timer
  resetContactDamage() {
    this.lastContactDamage = 0;
  }

  // Update contact damage timer (called by subclasses)
  updateContactDamage(dt) {
    // This is handled in the base update(), but subclasses can call this
    // if they override update() without calling super.update()
    this.lastContactDamage += dt;
  }

  // Drop items on death
  onDeath() {
    super.onDeath();
    // Drop table logic would go here (Phase 8)
  }

  // Take damage with invincibility frames
  takeDamage(amount) {
    const now = Date.now();
    if (this.invincibleUntil && now < this.invincibleUntil) {
      return; // Still invincible
    }

    super.takeDamage(amount);

    // Set invincibility frames
    this.invincibleUntil = now + 200; // 200ms invincibility
  }
}
