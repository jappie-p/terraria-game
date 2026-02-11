// PauseMenu - In-game pause screen
export class PauseMenu {
  constructor() {
    this.visible = false;
    this.selectedOption = 0;
    this.options = [
      { id: 'continue', label: 'Continue', description: 'Return to game' },
      { id: 'save', label: 'Save Game', description: 'Save your progress' },
      { id: 'settings', label: 'Settings', description: 'Adjust game options' },
      { id: 'menu', label: 'Main Menu', description: 'Return to title screen' },
    ];
    this.animationTime = 0;
    this.hoveredOptionIndex = -1; // For mouse hover effect
  }

  show() {
    this.visible = true;
    this.selectedOption = 0;
    this.animationTime = 0;
    this.hoveredOptionIndex = -1; // Reset on show
  }

  hide() {
    this.visible = false;
    this.hoveredOptionIndex = -1;
  }

  toggle() {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  update(dt) {
    if (!this.visible) return;
    this.animationTime += dt;
  }

  handleInput(key) {
    if (!this.visible) return null;

    if (key === 'Escape') {
      return 'continue'; // Escape again continues
    }
    if (key === 'ArrowUp' || key === 'w' || key === 'W') {
      this.selectedOption = Math.max(0, this.selectedOption - 1);
      this.hoveredOptionIndex = this.selectedOption; // Sync hover with selection
      return null;
    }
    if (key === 'ArrowDown' || key === 's' || key === 'S') {
      this.selectedOption = Math.min(this.options.length - 1, this.selectedOption + 1);
      this.hoveredOptionIndex = this.selectedOption; // Sync hover with selection
      return null;
    }
    if (key === 'Enter' || key === ' ') {
      return this.options[this.selectedOption].id;
    }
    return null;
  }

  // Handle mouse click
  handleClick(mousePos, canvasWidth, canvasHeight) {
    if (!this.visible) return null;

    const centerX = canvasWidth / 2;
    const panelWidth = 350;
    const panelHeight = 350;
    const panelY = canvasHeight / 2 - panelHeight / 2;
    
    const buttonWidth = 280;
    const buttonHeight = 45;
    const buttonSpacing = 12;
    const startY = panelY + 90; // Must match render method's startY

    for (let i = 0; i < this.options.length; i++) {
      const buttonX = centerX - buttonWidth / 2;
      const buttonY = startY + i * (buttonHeight + buttonSpacing);

      if (mousePos.x >= buttonX && mousePos.x <= buttonX + buttonWidth &&
          mousePos.y >= buttonY && mousePos.y <= buttonY + buttonHeight) {
        this.selectedOption = i; // Select on click
        return this.options[this.selectedOption].id;
      }
    }
    return null;
  }
  
  // Handle mouse movement for hover effect
  handleMouseMove(mousePos, canvasWidth, canvasHeight) {
    if (!this.visible) return;

    const centerX = canvasWidth / 2;
    const panelWidth = 350;
    const panelHeight = 350;
    const panelY = canvasHeight / 2 - panelHeight / 2;
    
    const buttonWidth = 280;
    const buttonHeight = 45;
    const buttonSpacing = 12;
    const startY = panelY + 90;

    let newHoveredIndex = -1;
    for (let i = 0; i < this.options.length; i++) {
      const buttonX = centerX - buttonWidth / 2;
      const buttonY = startY + i * (buttonHeight + buttonSpacing);

      if (mousePos.x >= buttonX && mousePos.x <= buttonX + buttonWidth &&
          mousePos.y >= buttonY && mousePos.y <= buttonY + buttonHeight) {
        newHoveredIndex = i;
        break;
      }
    }
    this.hoveredOptionIndex = newHoveredIndex;
  }

  render(ctx, mousePos) { // Now accepts mousePos
    if (!this.visible) return;

    const canvas = ctx.canvas;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Update hovered option based on mouse position
    this.handleMouseMove(mousePos, canvas.width, canvas.height);

    // Semi-transparent dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Panel background
    const panelWidth = 350;
    const panelHeight = 350;
    const panelX = centerX - panelWidth / 2;
    const panelY = centerY - panelHeight / 2;

    ctx.fillStyle = 'rgba(30, 30, 40, 0.95)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

    // Panel border
    ctx.strokeStyle = '#4488FF';
    ctx.lineWidth = 3;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

    // Title
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 32px monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('PAUSED', centerX, panelY + 45);

    // Decorative line
    ctx.strokeStyle = '#4488FF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(panelX + 40, panelY + 70);
    ctx.lineTo(panelX + panelWidth - 40, panelY + 70);
    ctx.stroke();

    // Menu buttons
    const buttonWidth = 280;
    const buttonHeight = 45;
    const buttonSpacing = 12;
    const startY = panelY + 90;

    for (let i = 0; i < this.options.length; i++) {
      const option = this.options[i];
      const buttonX = centerX - buttonWidth / 2;
      const buttonY = startY + i * (buttonHeight + buttonSpacing);
      const isSelected = i === this.selectedOption;
      const isHovered = i === this.hoveredOptionIndex; // Use for hover effect

      // Button background
      if (isSelected || isHovered) { // Highlight if selected OR hovered
        ctx.fillStyle = 'rgba(68, 136, 255, 0.4)'; // Brighter highlight
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      }
      ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

      // Button border
      ctx.strokeStyle = isSelected || isHovered ? '#4488FF' : '#666666'; // Highlight border
      ctx.lineWidth = isSelected || isHovered ? 3 : 1;
      ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

      // Button text
      ctx.font = 'bold 18px monospace';
      ctx.fillStyle = isSelected || isHovered ? '#FFFFFF' : '#E0E0E0'; // White text on highlight
      ctx.fillText(option.label, centerX, buttonY + buttonHeight / 2);

      // Selection indicator
      if (isSelected || isHovered) { // Show indicator if selected OR hovered
        ctx.fillStyle = '#4488FF';
        ctx.font = 'bold 18px monospace';
        ctx.fillText('▶', buttonX - 20, buttonY + buttonHeight / 2);
        ctx.fillText('◀', buttonX + buttonWidth + 20, buttonY + buttonHeight / 2);
      }
    }

    // Controls hint
    ctx.font = '12px monospace';
    ctx.fillStyle = '#666666';
    ctx.fillText('Press ESC or Enter to continue', centerX, panelY + panelHeight - 20);
  }
}
