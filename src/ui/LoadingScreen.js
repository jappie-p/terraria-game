// LoadingScreen - Biome-themed animated loading screens
export class LoadingScreen {
  constructor(textureGen) {
    this.textureGen = textureGen;
    this.visible = true;
    this.progress = 0;
    this.targetProgress = 100;
    this.opacity = 1.0;
    this.finished = false;
    this.fadingOut = false;
    this.animationTimer = 0;

    // Biome selection
    this.biomes = ['forest', 'cave', 'desert', 'snow', 'ocean'];
    this.currentBiome = this.biomes[Math.floor(Math.random() * this.biomes.length)];
    // this.currentBiome = 'ocean'; // Debug specific biome

    // Flavor text mapping
    this.flavorTexts = {
      forest: ['Growing trees...', 'Spawning slimes...', 'Planting grass...', 'Sunlight rays flickering...'],
      cave: ['Carving tunnels...', 'Placing ores...', 'Lighting torches...', 'Dripping water...'],
      desert: ['Shaping dunes...', 'Heating sand...', 'Generating cactus...', 'Wind blowing...'],
      snow: ['Freezing terrain...', 'Crystallizing ice...', 'Falling snow...', 'Chilling winds...'],
      ocean: ['Filling oceans...', 'Generating coral...', 'Rising bubbles...', 'Tides turning...']
    };
    this.currentFlavor = this.flavorTexts[this.currentBiome][0];
    this.flavorTimer = 0;

    // Particle system
    this.particles = [];
    this.initParticles();
  }

  initParticles() {
    this.particles = [];
    const count = 50;
    for (let i = 0; i < count; i++) {
      this.spawnParticle(true); // Pre-warm particles (random positions)
    }
  }

  spawnParticle(randomY = false) {
    const p = {
      x: Math.random() * window.innerWidth,
      y: randomY ? Math.random() * window.innerHeight : -10,
      vx: 0,
      vy: 0,
      size: Math.random() * 3 + 1,
      life: 1.0,
      type: 'default'
    };

    // Biome specific particle physics
    switch (this.currentBiome) {
      case 'forest': // Falling leaves
        p.vx = (Math.random() - 0.5) * 50; // Sway
        p.vy = 20 + Math.random() * 30; // Fall
        p.color = Math.random() > 0.5 ? '#228B22' : '#32CD32';
        p.type = 'leaf';
        break;
      case 'cave': // Dust/Drips
        if (Math.random() > 0.8) { // Water drip
           p.color = '#4488FF';
           p.vy = 200;
           p.size = 2;
           p.type = 'drip';
        } else { // Dust
           p.color = '#555555';
           p.vx = (Math.random() - 0.5) * 10;
           p.vy = 5 + Math.random() * 10;
           p.size = 1;
           p.type = 'dust';
        }
        break;
      case 'desert': // Sand/Wind
        p.x = -10; // Spawn left
        p.y = Math.random() * window.innerHeight;
        p.vx = 100 + Math.random() * 100; // Fast right
        p.vy = (Math.random() - 0.5) * 20;
        p.color = '#F4A460';
        p.size = 2;
        p.type = 'sand';
        break;
      case 'snow': // Snowflakes
        p.vx = (Math.random() - 0.5) * 20 + 20; // Slight wind right
        p.vy = 30 + Math.random() * 40;
        p.color = '#FFFFFF';
        p.size = Math.random() * 2 + 1;
        p.type = 'snow';
        break;
      case 'ocean': // Bubbles
        p.y = window.innerHeight + 10; // Spawn bottom
        p.vx = (Math.random() - 0.5) * 10;
        p.vy = -(20 + Math.random() * 30); // Rise
        p.color = 'rgba(200, 255, 255, 0.5)';
        p.size = Math.random() * 4 + 1;
        p.type = 'bubble';
        break;
    }
    this.particles.push(p);
  }

  update(dt) {
    if (this.finished) return;

    this.animationTimer += dt;

    // Progress logic
    if (this.progress < this.targetProgress) {
      const speed = (this.targetProgress - this.progress) * 5 * dt;
      this.progress += Math.max(10 * dt, speed);
      
      // Update flavor text
      this.flavorTimer += dt;
      if (this.flavorTimer > 1.5) {
        this.flavorTimer = 0;
        const list = this.flavorTexts[this.currentBiome];
        this.currentFlavor = list[Math.floor(Math.random() * list.length)];
      }
    } else {
      this.progress = 100;
      this.currentFlavor = "Ready!";
      if (!this.fadingOut) {
        this.fadingOut = true;
        setTimeout(() => { this.startFade = true; }, 500);
      }
    }

    // Fade out
    if (this.startFade) {
      this.opacity -= dt * 2;
      if (this.opacity <= 0) {
        this.opacity = 0;
        this.finished = true;
        this.visible = false;
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      
      // Wobble for leaves
      if (p.type === 'leaf') {
        p.x += Math.sin(this.animationTimer * 2 + i) * 20 * dt;
      }

      // Check bounds
      const h = window.innerHeight;
      const w = window.innerWidth;
      
      if (p.y > h + 20 || p.x > w + 20 || p.x < -20 || p.y < -20) {
        this.particles.splice(i, 1);
        this.spawnParticle();
      }
    }
  }

  render(ctx) {
    if (!this.visible) return;

    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    ctx.save();
    ctx.globalAlpha = this.opacity;

    // Render Biome Background
    this.renderBiome(ctx, width, height);

    // Render Particles
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }

    // Render UI (Text & Bar)
    this.renderUI(ctx, width, height);

    ctx.restore();
  }

  renderBiome(ctx, width, height) {
    const t = this.animationTimer;

    switch (this.currentBiome) {
      case 'forest':
        // Sky
        const skyForest = ctx.createLinearGradient(0, 0, 0, height);
        skyForest.addColorStop(0, '#87CEEB');
        skyForest.addColorStop(1, '#E0F7FA');
        ctx.fillStyle = skyForest;
        ctx.fillRect(0, 0, width, height);

        // Distant Mountains
        ctx.fillStyle = '#A0C0D0';
        this.drawHills(ctx, width, height, 0.4, 150, 50, t * 10);
        
        // Mid Trees Layer
        ctx.fillStyle = '#2E8B57';
        this.drawHills(ctx, width, height, 0.6, 80, 100, t * 20);
        
        // Foreground Grass
        ctx.fillStyle = '#228B22';
        this.drawHills(ctx, width, height, 0.8, 40, 50, t * 40);
        
        // Sun shafts overlay
        ctx.fillStyle = 'rgba(255, 255, 200, 0.1)';
        ctx.beginPath();
        ctx.moveTo(width * 0.2, 0);
        ctx.lineTo(width * 0.4, height);
        ctx.lineTo(width * 0.6, height);
        ctx.lineTo(width * 0.8, 0);
        ctx.fill();
        break;

      case 'cave':
        // Background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);

        // Layers of rock
        ctx.fillStyle = '#2a2a2a';
        this.drawHills(ctx, width, height, 0.3, 200, 0, t * 5); // Ceiling?
        
        // Ground
        ctx.fillStyle = '#333333';
        this.drawHills(ctx, width, height, 0.7, 100, 50, t * 10);

        // Torch glow
        const glowX = width / 2 + Math.sin(t * 5) * 10;
        const glow = ctx.createRadialGradient(glowX, height - 100, 10, glowX, height - 100, 200);
        glow.addColorStop(0, 'rgba(255, 100, 0, 0.4)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
        break;

      case 'desert':
        // Sky
        const skyDesert = ctx.createLinearGradient(0, 0, 0, height);
        skyDesert.addColorStop(0, '#87CEFA');
        skyDesert.addColorStop(1, '#FFE4B5');
        ctx.fillStyle = skyDesert;
        ctx.fillRect(0, 0, width, height);

        // Sun
        ctx.fillStyle = '#FFFACD';
        ctx.beginPath();
        ctx.arc(width * 0.8, height * 0.2, 40, 0, Math.PI * 2);
        ctx.fill();

        // Dunes
        ctx.fillStyle = '#E3C676';
        this.drawHills(ctx, width, height, 0.5, 120, 80, t * 5);
        ctx.fillStyle = '#EDC9AF';
        this.drawHills(ctx, width, height, 0.7, 80, 50, t * 10);
        
        // Heat haze overlay
        ctx.fillStyle = `rgba(255, 200, 100, ${0.1 + Math.sin(t * 10) * 0.05})`;
        ctx.fillRect(0, 0, width, height);
        break;

      case 'snow':
        // Sky
        const skySnow = ctx.createLinearGradient(0, 0, 0, height);
        skySnow.addColorStop(0, '#B0C4DE');
        skySnow.addColorStop(1, '#FFFFFF');
        ctx.fillStyle = skySnow;
        ctx.fillRect(0, 0, width, height);

        // Mountains
        ctx.fillStyle = '#C8D8E8';
        this.drawHills(ctx, width, height, 0.4, 200, 100, t * 5);
        
        // Snow hills
        ctx.fillStyle = '#F0F8FF';
        this.drawHills(ctx, width, height, 0.7, 80, 50, t * 15);
        break;

      case 'ocean':
        // Sky
        const skyOcean = ctx.createLinearGradient(0, 0, 0, height/2);
        skyOcean.addColorStop(0, '#87CEEB');
        skyOcean.addColorStop(1, '#E0FFFF');
        ctx.fillStyle = skyOcean;
        ctx.fillRect(0, 0, width, height);

        // Ocean surface
        const waterY = height * 0.4;
        const waterGrad = ctx.createLinearGradient(0, waterY, 0, height);
        waterGrad.addColorStop(0, '#00BFFF');
        waterGrad.addColorStop(1, '#00008B');
        ctx.fillStyle = waterGrad;
        ctx.fillRect(0, waterY, width, height - waterY);

        // Waves
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            const waveY = waterY + i * 40;
            ctx.beginPath();
            for (let x = 0; x < width; x+= 20) {
                ctx.lineTo(x, waveY + Math.sin(x * 0.05 + t + i) * 5);
            }
            ctx.stroke();
        }
        break;
    }
  }

  drawHills(ctx, width, height, yPct, amplitude, offset, scrollX) {
    const baseY = height * yPct;
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(0, baseY);
    
    for (let x = 0; x <= width; x += 10) {
      const y = baseY - Math.abs(Math.sin((x + scrollX) * 0.01)) * amplitude - Math.cos((x + scrollX) * 0.02) * (amplitude/2);
      ctx.lineTo(x, y);
    }
    
    ctx.lineTo(width, height);
    ctx.fill();
  }

  renderUI(ctx, width, height) {
    const centerX = width / 2;
    const bottomY = height - 100;

    // Loading Text (Pulsing)
    const dotCount = Math.floor(this.animationTimer * 2) % 4;
    const dots = '.'.repeat(dotCount);
    
    ctx.font = 'bold 24px monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText("Loading" + dots, centerX, bottomY);
    ctx.shadowBlur = 0;

    // Flavor Text
    ctx.font = '16px monospace';
    ctx.fillStyle = '#DDDDDD';
    ctx.fillText(this.currentFlavor, centerX, bottomY + 30);

    // Progress Bar
    const barW = 400;
    const barH = 20;
    const barX = centerX - barW / 2;
    const barY = bottomY + 50;

    // Bar BG
    ctx.fillStyle = '#222222';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barW, barH);

    // Bar Fill (Chunky segments)
    const fillW = (this.progress / 100) * barW;
    const segmentSize = 10;
    const numSegments = Math.floor(fillW / segmentSize);
    
    ctx.fillStyle = this.getThemeColor();
    for (let i = 0; i < numSegments; i++) {
        ctx.fillRect(barX + i * segmentSize + 1, barY + 2, segmentSize - 2, barH - 4);
    }
  }

  getThemeColor() {
      switch(this.currentBiome) {
          case 'forest': return '#32CD32';
          case 'cave': return '#FFA500';
          case 'desert': return '#FFD700';
          case 'snow': return '#00FFFF';
          case 'ocean': return '#1E90FF';
          default: return '#FFFFFF';
      }
  }
}
