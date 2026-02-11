// Entity - Base class for all game entities (player, enemies, items, etc.)
import { Vec } from '../utils/Vec.js';

export class Entity {
  constructor(x, y, width, height) {
    this.pos = new Vec(x, y); // Position (center of entity)
    this.vel = new Vec(0, 0); // Velocity
    this.size = new Vec(width, height); // Size (width, height)
    this.health = 100;
    this.maxHealth = 100;
    this.alive = true;
    this.onGround = false;
    this.color = '#FF0000'; // Default color for rendering
    this.components = new Map(); // For component system (Phase 4)
  }

  // Update entity
  update(dt, world, input) {
    // Override in subclasses
  }

  // Render entity (custom rendering beyond Renderer)
  render(renderer) {
    // Override in subclasses if needed
  }

  // Get bounding box
  getBounds() {
    return {
      left: this.pos.x - this.size.x / 2,
      right: this.pos.x + this.size.x / 2,
      top: this.pos.y - this.size.y / 2,
      bottom: this.pos.y + this.size.y / 2
    };
  }

  // Check collision with another entity
  collidesWith(other) {
    const bounds1 = this.getBounds();
    const bounds2 = other.getBounds();

    return !(bounds1.right < bounds2.left ||
             bounds1.left > bounds2.right ||
             bounds1.bottom < bounds2.top ||
             bounds1.top > bounds2.bottom);
  }

  // Take damage
  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.onDeath();
    }
  }

  // Heal
  heal(amount) {
    this.health = Math.min(this.health + amount, this.maxHealth);
  }

  // Called when entity dies
  onDeath() {
    this.alive = false;
  }

  // Add component (for later - Phase 4)
  addComponent(name, component) {
    this.components.set(name, component);
  }

  // Get component
  getComponent(name) {
    return this.components.get(name);
  }

  // Has component
  hasComponent(name) {
    return this.components.has(name);
  }
}
