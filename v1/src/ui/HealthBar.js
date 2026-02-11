// HealthBar - Displays player health
export class HealthBar {
  constructor(x, y, width, height, player) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.player = player;
    this.visible = true;
  }

  render(ctx) {
    if (!this.visible || !this.player) return;

    const player = this.player;

    // Calculate health percentage
    const healthPercent = Math.max(0, player.health / player.maxHealth);

    // Shadow/background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);

    // Background (dark red)
    ctx.fillStyle = '#3A0000';
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Health bar with gradient
    const healthWidth = this.width * healthPercent;

    // Color based on health percentage
    let barColor;
    if (healthPercent > 0.6) {
      barColor = '#00FF00'; // Green
    } else if (healthPercent > 0.3) {
      barColor = '#FFAA00'; // Orange
    } else {
      barColor = '#FF0000'; // Red
    }

    // Create gradient for health bar
    const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    gradient.addColorStop(0, barColor);
    gradient.addColorStop(1, this.darkenColor(barColor));

    ctx.fillStyle = gradient;
    ctx.fillRect(this.x, this.y, healthWidth, this.height);

    // Shine effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(this.x, this.y, healthWidth, this.height / 2);

    // Border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Health text with shadow
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const healthText = `${Math.ceil(player.health)} / ${player.maxHealth}`;
    ctx.fillText(healthText, this.x + this.width / 2 + 1, this.y + this.height / 2 + 1);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(healthText, this.x + this.width / 2, this.y + this.height / 2);

    // Heart icon (optional)
    ctx.fillStyle = '#FF0000';
    ctx.font = '16px monospace';
    ctx.fillText('❤', this.x - 20, this.y + this.height / 2);
  }

  darkenColor(color) {
    // Simple color darkening
    if (color === '#00FF00') return '#008800';
    if (color === '#FFAA00') return '#AA6600';
    if (color === '#FF0000') return '#880000';
    return color;
  }
}
