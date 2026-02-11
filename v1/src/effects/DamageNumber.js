// DamageNumber - Floating damage numbers
export class DamageNumber {
  constructor(x, y, damage, isCrit = false) {
    this.x = x;
    this.y = y;
    this.damage = Math.floor(damage);
    this.isCrit = isCrit;
    this.lifetime = 1.0; // 1 second
    this.age = 0;
    this.velY = -50; // Float upward
    this.alpha = 1.0;
  }

  update(dt) {
    this.age += dt;
    this.y += this.velY * dt;

    // Fade out
    this.alpha = Math.max(0, 1 - (this.age / this.lifetime));

    return this.age < this.lifetime;
  }

  render(ctx, camera) {
    const screenPos = camera.worldToScreen({ x: this.x, y: this.y });

    ctx.save();
    ctx.globalAlpha = this.alpha;

    // Draw damage number
    ctx.fillStyle = this.isCrit ? '#FF0000' : '#FFFFFF';
    ctx.font = this.isCrit ? 'bold 20px monospace' : 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Outline for readability
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText(this.damage.toString(), screenPos.x, screenPos.y);

    ctx.fillText(this.damage.toString(), screenPos.x, screenPos.y);

    ctx.restore();
  }
}
