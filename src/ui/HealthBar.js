// HealthBar - HUD element for player health
export class HealthBar {
  constructor(x, y, width, height, player) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.player = player;
    this.currentValue = player.health;
    this.visible = true;
  }

  update(dt) {
    // Smoothly animate health bar value
    const target = this.player.health;
    if (this.currentValue !== target) {
      const diff = target - this.currentValue;
      if (Math.abs(diff) < 0.1) {
        this.currentValue = target;
      } else {
        this.currentValue += diff * dt * 5;
      }
    }
  }

  render(ctx) {
    if (!this.visible) return;

    // Background (darker)
    ctx.fillStyle = '#220000';
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Border (Gold/Brass style)
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 3;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    // Calculate width based on health percentage
    const percent = Math.max(0, this.currentValue / this.player.maxHealth);
    const fillWidth = Math.max(0, this.width * percent);

    if (fillWidth > 0) {
      // Create gradient for health
      const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
      gradient.addColorStop(0, '#FF4444');
      gradient.addColorStop(0.5, '#FF0000');
      gradient.addColorStop(1, '#AA0000');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(this.x + 2, this.y + 2, fillWidth - 4, this.height - 4);
      
      // Shine/Glass effect on top half
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(this.x + 2, this.y + 2, fillWidth - 4, (this.height - 4) / 2);
    }

    // Text (e.g. 100/100)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add text shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillText(`${Math.round(this.currentValue)}/${this.player.maxHealth}`, this.x + this.width / 2 + 1, this.y + this.height / 2 + 1);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${Math.round(this.currentValue)}/${this.player.maxHealth}`, this.x + this.width / 2, this.y + this.height / 2);
    
    // Heart icon decoration
    this.renderHeartIcon(ctx, this.x - 20, this.y + this.height/2);
  }
  
  renderHeartIcon(ctx, x, y) {
      ctx.save();
      ctx.translate(x, y);
      const size = 8;
      
      ctx.beginPath();
      ctx.moveTo(0, size/2);
      ctx.bezierCurveTo(0, -size/2, -size, -size/2, -size, size/2);
      ctx.bezierCurveTo(-size, size*1.5, 0, size*2, 0, size*3); // Bottom tip
      ctx.bezierCurveTo(0, size*2, size, size*1.5, size, size/2);
      ctx.bezierCurveTo(size, -size/2, 0, -size/2, 0, size/2);
      
      ctx.fillStyle = '#FF0000';
      ctx.fill();
      ctx.strokeStyle = '#880000';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Shine
      ctx.beginPath();
      ctx.arc(-size/2 + 2, 0, 2, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fill();
      
      ctx.restore();
  }
}