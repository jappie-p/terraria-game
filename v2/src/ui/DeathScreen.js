// DeathScreen - Shown when player dies
export class DeathScreen {
  constructor() {
    this.visible = false;
    this.selectedOption = 0;
    this.options = [
      { id: 'respawn', label: 'Respawn', description: 'Return to the surface' },
      { id: 'menu', label: 'Main Menu', description: 'Return to title screen' },
    ];
    this.animationTime = 0;
    this.fadeIn = 0;
    this.deathMessage = 'You died!';
    this.killedBy = '';
  }

  // Show death screen
  show(killedBy = '') {
    this.visible = true;
    this.fadeIn = 0;
    this.animationTime = 0;
    this.selectedOption = 0;
    this.killedBy = killedBy;

    // Random death messages
    const messages = [
      'You died!',
      'Game Over',
      'You have perished',
      'Your adventure ends here...',
      'Better luck next time!',
      'You were slain',
    ];
    this.deathMessage = messages[Math.floor(Math.random() * messages.length)];
  }

  // Hide death screen
  hide() {
    this.visible = false;
  }

  // Update animation
  update(dt) {
    if (!this.visible) return;

    this.animationTime += dt;
    this.fadeIn = Math.min(1, this.fadeIn + dt * 2); // Fade in over 0.5 seconds
  }

  // Handle keyboard input
  handleInput(key) {
    if (!this.visible) return null;

    // Don't allow input until fade-in is mostly complete
    if (this.fadeIn < 0.8) return null;

    if (key === 'ArrowUp' || key === 'w' || key === 'W') {
      this.selectedOption = Math.max(0, this.selectedOption - 1);
      return null;
    }
    if (key === 'ArrowDown' || key === 's' || key === 'S') {
      this.selectedOption = Math.min(this.options.length - 1, this.selectedOption + 1);
      return null;
    }
    if (key === 'Enter' || key === ' ') {
      return this.selectOption();
    }
    return null;
  }

  // Handle mouse click
  handleClick(mousePos, canvasWidth, canvasHeight) {
    if (!this.visible || this.fadeIn < 0.8) return null;

    const centerX = canvasWidth / 2;
    const startY = canvasHeight / 2 + 50;
    const buttonWidth = 250;
    const buttonHeight = 45;
    const buttonSpacing = 15;

    for (let i = 0; i < this.options.length; i++) {
      const buttonX = centerX - buttonWidth / 2;
      const buttonY = startY + i * (buttonHeight + buttonSpacing);

      if (mousePos.x >= buttonX && mousePos.x <= buttonX + buttonWidth &&
          mousePos.y >= buttonY && mousePos.y <= buttonY + buttonHeight) {
        this.selectedOption = i;
        return this.selectOption();
      }
    }
    return null;
  }

  // Select current option
  selectOption() {
    return this.options[this.selectedOption].id;
  }

  // Render death screen
  render(ctx) {
    if (!this.visible) return;

    const canvas = ctx.canvas;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Dark overlay with fade-in
    ctx.fillStyle = `rgba(20, 0, 0, ${this.fadeIn * 0.85})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Blood drip effect at top
    ctx.fillStyle = `rgba(139, 0, 0, ${this.fadeIn * 0.6})`;
    for (let i = 0; i < 20; i++) {
      const x = (i * 73) % canvas.width;
      const dripHeight = 20 + Math.sin(this.animationTime * 2 + i) * 10 + (i % 5) * 15;
      ctx.fillRect(x, 0, 8, dripHeight * this.fadeIn);
    }

    // Only show content after fade starts
    if (this.fadeIn < 0.3) return;

    const contentAlpha = Math.min(1, (this.fadeIn - 0.3) / 0.7);

    ctx.save();
    ctx.globalAlpha = contentAlpha;

    // Death message with shake effect
    const shakeX = Math.sin(this.animationTime * 20) * (1 - this.fadeIn) * 10;
    const shakeY = Math.cos(this.animationTime * 20) * (1 - this.fadeIn) * 10;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Shadow
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 56px monospace';
    ctx.fillText(this.deathMessage, centerX + shakeX + 3, centerY - 80 + shakeY + 3);

    // Main text
    ctx.fillStyle = '#FF0000';
    ctx.fillText(this.deathMessage, centerX + shakeX, centerY - 80 + shakeY);

    // Killed by message
    if (this.killedBy) {
      ctx.font = '18px monospace';
      ctx.fillStyle = '#AA6666';
      ctx.fillText(`Slain by: ${this.killedBy}`, centerX, centerY - 20);
    }

    // Skull icon
    this.drawSkull(ctx, centerX, centerY - 150, 40);

    // Menu buttons
    const buttonWidth = 250;
    const buttonHeight = 45;
    const buttonSpacing = 15;
    const startY = centerY + 50;

    for (let i = 0; i < this.options.length; i++) {
      const option = this.options[i];
      const buttonX = centerX - buttonWidth / 2;
      const buttonY = startY + i * (buttonHeight + buttonSpacing);
      const isSelected = i === this.selectedOption;

      // Button background
      ctx.fillStyle = isSelected ? 'rgba(255, 0, 0, 0.3)' : 'rgba(100, 0, 0, 0.3)';
      ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

      // Button border
      ctx.strokeStyle = isSelected ? '#FF4444' : '#660000';
      ctx.lineWidth = isSelected ? 3 : 1;
      ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

      // Button text
      ctx.font = 'bold 18px monospace';
      ctx.fillStyle = isSelected ? '#FF6666' : '#AA4444';
      ctx.fillText(option.label, centerX, buttonY + buttonHeight / 2 - 3);

      // Description
      ctx.font = '11px monospace';
      ctx.fillStyle = '#664444';
      ctx.fillText(option.description, centerX, buttonY + buttonHeight / 2 + 12);

      // Selection indicator
      if (isSelected) {
        ctx.fillStyle = '#FF4444';
        ctx.font = 'bold 18px monospace';
        ctx.fillText('▶', buttonX - 20, buttonY + buttonHeight / 2);
        ctx.fillText('◀', buttonX + buttonWidth + 20, buttonY + buttonHeight / 2);
      }
    }

    // Controls hint
    ctx.font = '12px monospace';
    ctx.fillStyle = '#553333';
    ctx.fillText('Press Enter to select', centerX, canvas.height - 40);

    ctx.restore();
  }

  // Draw a pixel skull
  drawSkull(ctx, x, y, size) {
    ctx.fillStyle = '#DDDDDD';
    const s = size / 16;

    // Skull shape
    ctx.fillRect(x - 6*s, y - 4*s, 12*s, 10*s);
    ctx.fillRect(x - 7*s, y - 2*s, 14*s, 6*s);
    ctx.fillRect(x - 5*s, y - 6*s, 10*s, 4*s);
    ctx.fillRect(x - 3*s, y - 7*s, 6*s, 2*s);

    // Eye sockets
    ctx.fillStyle = '#000000';
    ctx.fillRect(x - 5*s, y - 2*s, 3*s, 3*s);
    ctx.fillRect(x + 2*s, y - 2*s, 3*s, 3*s);

    // Nose
    ctx.fillRect(x - 1*s, y + 1*s, 2*s, 2*s);

    // Teeth
    ctx.fillStyle = '#DDDDDD';
    ctx.fillRect(x - 4*s, y + 4*s, 2*s, 3*s);
    ctx.fillRect(x - 1*s, y + 4*s, 2*s, 3*s);
    ctx.fillRect(x + 2*s, y + 4*s, 2*s, 3*s);

    // Jaw outline
    ctx.fillStyle = '#AAAAAA';
    ctx.fillRect(x - 6*s, y + 5*s, 12*s, 1*s);
  }
}
