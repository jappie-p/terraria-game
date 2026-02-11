// EyeOfTerror - Flying boss that shoots projectiles
import { Boss } from '../Boss.js';
import { Projectile } from '../../combat/Projectile.js';

export class EyeOfTerror extends Boss {
  constructor(x, y) {
    super(x, y, 48, 48); // Large 48x48 boss

    this.name = 'Eye of Terror';
    this.maxHealth = 800;
    this.health = 800;
    this.damage = 20;
    this.color = '#FF0000'; // Red eye

    // Flying boss - doesn't use gravity
    this.flying = true;
    this.flySpeed = 100;
    this.chargeSpeed = 300;

    // Attack patterns
    this.attacking = false;
    this.charging = false;
    this.chargeTarget = null;
  }

  update(dt, world, entities) {
    // Don't apply physics gravity for flying boss
    const oldGravity = this.vel.y;

    super.update(dt, world, entities);

    // Flying movement - chase player
    const player = this.findNearestPlayer(entities);
    if (player && !this.charging) {
      const dx = player.pos.x - this.pos.x;
      const dy = player.pos.y - this.pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0) {
        // Fly toward player
        this.vel.x = (dx / distance) * this.flySpeed;
        this.vel.y = (dy / distance) * this.flySpeed;
      }
    }

    // Override gravity (flying enemy)
    if (this.flying) {
      // Keep some vertical momentum but not gravity
      this.vel.y *= 0.95;
    }
  }

  findNearestPlayer(entities) {
    for (const entity of entities) {
      if (entity.constructor.name === 'Player' && entity.alive) {
        return entity;
      }
    }
    return null;
  }

  onPhaseChange(phase) {
    if (phase === 2) {
      // Phase 2: Faster attacks
      this.attackInterval = 2.0;
      this.flySpeed = 120;
      console.log('Eye of Terror is enraged!');
    } else if (phase === 3) {
      // Phase 3: Even faster, charge attacks
      this.attackInterval = 1.5;
      this.flySpeed = 150;
      console.log('Eye of Terror is in a frenzy!');
    }
  }

  selectAttack() {
    if (this.phase === 3 && Math.random() < 0.4) {
      this.nextAttack = 'charge';
    } else {
      this.nextAttack = 'shoot';
    }
  }

  executeAttack(entities) {
    const player = this.findNearestPlayer(entities);
    if (!player) return;

    if (this.nextAttack === 'shoot') {
      this.shootAtPlayer(player, entities);
    } else if (this.nextAttack === 'charge') {
      this.chargeAtPlayer(player);
    }
  }

  shootAtPlayer(player, entities) {
    // Calculate direction to player
    const dx = player.pos.x - this.pos.x;
    const dy = player.pos.y - this.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    // Shoot projectiles
    const projectileCount = this.phase === 1 ? 1 : this.phase === 2 ? 3 : 5;
    const spread = this.phase === 1 ? 0 : this.phase === 2 ? 0.2 : 0.4;

    for (let i = 0; i < projectileCount; i++) {
      const angle = Math.atan2(dy, dx);
      const offsetAngle = angle + (i - Math.floor(projectileCount / 2)) * spread;

      const speed = 300;
      const velX = Math.cos(offsetAngle) * speed;
      const velY = Math.sin(offsetAngle) * speed;

      const projectile = new Projectile(
        this.pos.x,
        this.pos.y,
        velX,
        velY,
        this.damage * 0.6, // 60% of contact damage
        this
      );

      projectile.color = '#FF4444'; // Red projectiles
      entities.push(projectile);
    }
  }

  chargeAtPlayer(player) {
    // Store charge target
    this.charging = true;
    this.chargeTarget = { x: player.pos.x, y: player.pos.y };

    // Calculate charge direction
    const dx = this.chargeTarget.x - this.pos.x;
    const dy = this.chargeTarget.y - this.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      this.vel.x = (dx / distance) * this.chargeSpeed;
      this.vel.y = (dy / distance) * this.chargeSpeed;
    }

    // End charge after 1 second
    setTimeout(() => {
      this.charging = false;
      this.chargeTarget = null;
    }, 1000);
  }
}
