// Boss - Base class for boss enemies with phases
import { Enemy } from './Enemy.js';

export class Boss extends Enemy {
  constructor(x, y, width, height) {
    super(x, y, width, height);

    // Boss properties
    this.isBoss = true;
    this.maxHealth = 500;
    this.health = 500;
    this.phase = 1;
    this.maxPhases = 3;
    this.phaseTransitioning = false;
    this.invulnerable = false;

    // Boss stats
    this.damage = 15;
    this.contactDamageInterval = 0.8;

    // Attack timers
    this.attackTimer = 0;
    this.attackInterval = 3.0; // Seconds between attacks
    this.nextAttack = null;

    // Loot table
    this.dropTable = [];
  }

  update(dt, world, entities) {
    super.update(dt, world, entities);

    // Check for phase transitions
    this.checkPhaseTransition();

    // Update attack timer
    this.attackTimer += dt;

    // Execute attacks
    if (this.attackTimer >= this.attackInterval && !this.phaseTransitioning) {
      this.selectAttack();
      this.executeAttack(entities);
      this.attackTimer = 0;
    }
  }

  checkPhaseTransition() {
    const healthPercent = this.health / this.maxHealth;

    // Phase 2 at 66% health
    if (this.phase === 1 && healthPercent <= 0.66) {
      this.enterPhase(2);
    }
    // Phase 3 at 33% health
    else if (this.phase === 2 && healthPercent <= 0.33) {
      this.enterPhase(3);
    }
  }

  enterPhase(newPhase) {
    this.phase = newPhase;
    this.phaseTransitioning = true;
    this.invulnerable = true;

    console.log(`Boss entered phase ${newPhase}!`);

    // End transition after 1 second
    setTimeout(() => {
      this.phaseTransitioning = false;
      this.invulnerable = false;
    }, 1000);

    // Override in subclasses for phase-specific changes
    this.onPhaseChange(newPhase);
  }

  onPhaseChange(phase) {
    // Override in subclasses
  }

  selectAttack() {
    // Override in subclasses to choose attack pattern
    this.nextAttack = 'basic';
  }

  executeAttack(entities) {
    // Override in subclasses to implement attacks
  }

  takeDamage(amount) {
    if (this.invulnerable) return;
    super.takeDamage(amount);
  }

  onDeath() {
    super.onDeath();
    console.log('Boss defeated!');

    // Drop loot
    this.dropLoot();
  }

  dropLoot() {
    // Override in subclasses
  }
}
