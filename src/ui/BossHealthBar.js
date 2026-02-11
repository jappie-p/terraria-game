// BossHealthBar - Displays boss health at top of screen
export class BossHealthBar {
  constructor() {
    this.visible = false;
    this.boss = null;
    this.x = 0;
    this.y = 20;
    this.width = 600;
    this.height = 40;
  }

  setBoss(boss) {
    this.boss = boss;
    this.visible = boss !== null && boss.alive;
  }

  update(dt) {
    // Hide if boss is dead
    if (this.boss && !this.boss.alive) {
      this.visible = false;
      this.boss = null;
    }
  }

  render(ctx, canvasWidth) {
    if (!this.visible || !this.boss) return;

    // Center on screen
    this.x = (canvasWidth - this.width) / 2;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(this.x - 10, this.y - 10, this.width + 20, this.height + 40);

    // Boss name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.boss.name || 'Boss', this.x + this.width / 2, this.y + 15);

    // Health bar background
    ctx.fillStyle = '#333333';
    ctx.fillRect(this.x, this.y + 25, this.width, this.height);

    // Health bar (red)
    const healthPercent = Math.max(0, this.boss.health / this.boss.maxHealth);
    const healthWidth = this.width * healthPercent;

    // Color based on phase
    let barColor = '#00FF00'; // Green
    if (this.boss.phase === 2) {
      barColor = '#FFFF00'; // Yellow
    } else if (this.boss.phase >= 3) {
      barColor = '#FF0000'; // Red
    }

    ctx.fillStyle = barColor;
    ctx.fillRect(this.x, this.y + 25, healthWidth, this.height);

    // Border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.strokeRect(this.x, this.y + 25, this.width, this.height);

    // Health text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const healthText = `${Math.ceil(this.boss.health)} / ${this.boss.maxHealth}`;
    ctx.fillText(healthText, this.x + this.width / 2, this.y + 25 + this.height / 2);

    // Phase indicator
    if (this.boss.phase > 1) {
      ctx.fillStyle = '#FFD700';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`PHASE ${this.boss.phase}`, this.x + this.width / 2, this.y + 70);
    }
  }
}
