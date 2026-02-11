// ParticleSystem - Handles all particle effects in the game

class Particle {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.vx = options.vx || 0;
    this.vy = options.vy || 0;
    this.gravity = options.gravity !== undefined ? options.gravity : 400;
    this.friction = options.friction || 0.98;
    this.size = options.size || 4;
    this.sizeDecay = options.sizeDecay || 0;
    this.color = options.color || '#FFFFFF';
    this.alpha = options.alpha || 1;
    this.alphaDecay = options.alphaDecay || 2;
    this.lifetime = options.lifetime || 1;
    this.age = 0;
    this.rotation = options.rotation || 0;
    this.rotationSpeed = options.rotationSpeed || 0;
    this.shape = options.shape || 'square'; // 'square', 'circle', 'star', 'line'
    this.trail = options.trail || false;
    this.trailLength = options.trailLength || 5;
    this.trailPositions = [];
  }

  update(dt) {
    // Store trail position
    if (this.trail) {
      this.trailPositions.unshift({ x: this.x, y: this.y });
      if (this.trailPositions.length > this.trailLength) {
        this.trailPositions.pop();
      }
    }

    // Physics
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Rotation
    this.rotation += this.rotationSpeed * dt;

    // Aging
    this.age += dt;
    this.alpha -= this.alphaDecay * dt;
    this.size -= this.sizeDecay * dt;

    return this.age < this.lifetime && this.alpha > 0 && this.size > 0;
  }

  render(ctx, camera) {
    const screenPos = camera.worldToScreen({ x: this.x, y: this.y });
    const zoom = camera.zoom;
    const size = this.size * zoom;

    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);

    // Draw trail
    if (this.trail && this.trailPositions.length > 0) {
      for (let i = 0; i < this.trailPositions.length; i++) {
        const pos = this.trailPositions[i];
        const trailScreen = camera.worldToScreen(pos);
        const trailAlpha = this.alpha * (1 - i / this.trailPositions.length) * 0.5;
        const trailSize = size * (1 - i / this.trailPositions.length);

        ctx.globalAlpha = Math.max(0, trailAlpha);
        ctx.fillStyle = this.color;
        ctx.fillRect(
          trailScreen.x - trailSize / 2,
          trailScreen.y - trailSize / 2,
          trailSize,
          trailSize
        );
      }
      ctx.globalAlpha = Math.max(0, this.alpha);
    }

    ctx.translate(screenPos.x, screenPos.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = this.color;

    switch (this.shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'star':
        this.drawStar(ctx, 0, 0, 5, size / 2, size / 4);
        break;

      case 'line':
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-size / 2, 0);
        ctx.lineTo(size / 2, 0);
        ctx.stroke();
        break;

      default: // square
        ctx.fillRect(-size / 2, -size / 2, size, size);
    }

    ctx.restore();
  }

  drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }

    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.maxParticles = 500;
  }

  update(dt) {
    this.particles = this.particles.filter(p => p.update(dt));
  }

  render(ctx, camera) {
    for (const particle of this.particles) {
      particle.render(ctx, camera);
    }
  }

  addParticle(x, y, options) {
    if (this.particles.length < this.maxParticles) {
      this.particles.push(new Particle(x, y, options));
    }
  }

  // Pre-built effect: Blood splatter
  bloodSplatter(x, y, direction = 0, intensity = 1) {
    const count = Math.floor(8 * intensity);
    for (let i = 0; i < count; i++) {
      const angle = direction + (Math.random() - 0.5) * Math.PI * 0.8;
      const speed = 100 + Math.random() * 150 * intensity;
      this.addParticle(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        color: Math.random() > 0.3 ? '#8B0000' : '#FF0000',
        size: 2 + Math.random() * 4,
        gravity: 500,
        lifetime: 0.5 + Math.random() * 0.5,
        alphaDecay: 1.5
      });
    }
  }

  // Pre-built effect: Hit sparks
  hitSparks(x, y, direction = 0) {
    const count = 6;
    for (let i = 0; i < count; i++) {
      const angle = direction + (Math.random() - 0.5) * Math.PI;
      const speed = 150 + Math.random() * 100;
      this.addParticle(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() > 0.5 ? '#FFFF00' : '#FFA500',
        size: 2 + Math.random() * 2,
        gravity: 200,
        lifetime: 0.2 + Math.random() * 0.2,
        alphaDecay: 4,
        shape: 'circle'
      });
    }
  }

  // Pre-built effect: Dust cloud
  dustCloud(x, y, color = '#8B7355') {
    const count = 5;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 40;
      this.addParticle(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        color: color,
        size: 4 + Math.random() * 6,
        sizeDecay: 3,
        gravity: -20,
        lifetime: 0.5 + Math.random() * 0.3,
        alphaDecay: 2,
        shape: 'circle'
      });
    }
  }

  // Pre-built effect: Block break particles
  blockBreak(x, y, color = '#8B4513') {
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 80 + Math.random() * 60;
      this.addParticle(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 100,
        color: color,
        size: 3 + Math.random() * 3,
        gravity: 600,
        lifetime: 0.6 + Math.random() * 0.4,
        alphaDecay: 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }
  }

  // Pre-built effect: Explosion
  explosion(x, y, color = '#FF4500', intensity = 1) {
    // Core flash
    this.addParticle(x, y, {
      vx: 0,
      vy: 0,
      color: '#FFFFFF',
      size: 30 * intensity,
      sizeDecay: 100,
      gravity: 0,
      lifetime: 0.15,
      alphaDecay: 6,
      shape: 'circle'
    });

    // Fire particles
    const count = Math.floor(15 * intensity);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 200 * intensity;
      this.addParticle(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() > 0.5 ? color : '#FFFF00',
        size: 4 + Math.random() * 6,
        gravity: 100,
        lifetime: 0.4 + Math.random() * 0.4,
        alphaDecay: 2,
        trail: true,
        trailLength: 4
      });
    }

    // Smoke
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 50;
      this.addParticle(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        color: '#444444',
        size: 8 + Math.random() * 8,
        sizeDecay: 2,
        gravity: -50,
        lifetime: 1 + Math.random() * 0.5,
        alphaDecay: 0.8,
        shape: 'circle'
      });
    }
  }

  // Pre-built effect: Item pickup sparkle
  itemPickup(x, y) {
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 60;
      this.addParticle(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: '#FFD700',
        size: 3,
        gravity: 0,
        friction: 0.9,
        lifetime: 0.4,
        alphaDecay: 2.5,
        shape: 'star'
      });
    }
  }

  // Pre-built effect: Jump dust
  jumpDust(x, y) {
    for (let i = 0; i < 4; i++) {
      const side = i < 2 ? -1 : 1;
      this.addParticle(x + side * 8, y, {
        vx: side * (30 + Math.random() * 20),
        vy: -10 - Math.random() * 20,
        color: '#9B8B7A',
        size: 3 + Math.random() * 2,
        gravity: 100,
        lifetime: 0.3,
        alphaDecay: 3,
        shape: 'circle'
      });
    }
  }

  // Pre-built effect: Land impact
  landImpact(x, y, velocity) {
    const intensity = Math.min(1, Math.abs(velocity) / 400);
    const count = Math.floor(6 * intensity);

    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      this.addParticle(x + side * (5 + Math.random() * 10), y, {
        vx: side * (40 + Math.random() * 60) * intensity,
        vy: -20 - Math.random() * 40 * intensity,
        color: '#9B8B7A',
        size: 2 + Math.random() * 3,
        gravity: 400,
        lifetime: 0.4,
        alphaDecay: 2.5
      });
    }
  }

  // Pre-built effect: Healing
  healEffect(x, y) {
    const count = 6;
    for (let i = 0; i < count; i++) {
      this.addParticle(x + (Math.random() - 0.5) * 20, y + Math.random() * 30, {
        vx: (Math.random() - 0.5) * 20,
        vy: -40 - Math.random() * 30,
        color: '#00FF00',
        size: 4,
        gravity: -20,
        lifetime: 0.8,
        alphaDecay: 1.2,
        shape: 'circle'
      });
    }
  }

  // Pre-built effect: Magic sparkles
  magicSparkles(x, y, color = '#9370DB') {
    const count = 10;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 20;
      this.addParticle(
        x + Math.cos(angle) * dist,
        y + Math.sin(angle) * dist,
        {
          vx: (Math.random() - 0.5) * 40,
          vy: -30 - Math.random() * 40,
          color: color,
          size: 2 + Math.random() * 3,
          gravity: -30,
          lifetime: 0.6 + Math.random() * 0.4,
          alphaDecay: 1.5,
          shape: 'star'
        }
      );
    }
  }

  // Pre-built effect: Weapon trail
  weaponTrail(x, y, color = '#FFFFFF') {
    this.addParticle(x, y, {
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      color: color,
      size: 4,
      sizeDecay: 15,
      gravity: 0,
      lifetime: 0.15,
      alphaDecay: 6,
      shape: 'circle'
    });
  }

  // Pre-built effect: Slime death
  slimeDeath(x, y, color = '#00AA00') {
    const count = 15;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100;
      this.addParticle(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        color: color,
        size: 4 + Math.random() * 4,
        gravity: 400,
        lifetime: 0.6 + Math.random() * 0.3,
        alphaDecay: 1.2,
        shape: 'circle'
      });
    }
  }

  clear() {
    this.particles = [];
  }
}
