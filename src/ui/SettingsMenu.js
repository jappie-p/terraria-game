// SettingsMenu - Complex settings screen with categories
export class SettingsMenu {
  constructor() {
    this.visible = false;
    
    // Navigation
    this.categories = [
      'General',
      'Interface',
      'Video',
      'Cursor',
      'Controls',
      'Achievements',
      'Close Menu',
      'Save & Exit'
    ];
    this.selectedCategoryIndex = 0;
    
    // Settings State
    this.settings = {
      musicVolume: 80,
      soundVolume: 100,
      ambientVolume: 75,
      zoom: 2,
      autosave: true,
      autopause: true,
      placementPreview: true,
      smartCursorMode: 'Hold',
      smartCursorPriority: 'Dig'
    };

    // UI State
    this.hoveredCategory = -1;
    this.hoveredSetting = null; // { id: 'musicVolume', type: 'slider' }
    this.draggingSlider = null; // 'musicVolume'

    this.animationTime = 0;
  }

  show() {
    this.visible = true;
    this.draggingSlider = null;
  }

  hide() {
    this.visible = false;
    this.draggingSlider = null;
  }

  update(dt) {
    if (!this.visible) return;
    this.animationTime += dt;
  }

  handleInput(key) {
    if (!this.visible) return null;

    if (key === 'Escape') {
      return { action: 'back' };
    }

    // Simple keyboard navigation for categories
    if (key === 'ArrowUp' || key === 'w' || key === 'W') {
      this.selectedCategoryIndex = (this.selectedCategoryIndex - 1 + this.categories.length) % this.categories.length;
      return null;
    }
    if (key === 'ArrowDown' || key === 's' || key === 'S') {
      this.selectedCategoryIndex = (this.selectedCategoryIndex + 1) % this.categories.length;
      return null;
    }
    if (key === 'Enter' || key === ' ') {
      return this.handleCategorySelect(this.selectedCategoryIndex);
    }

    return null;
  }

  handleCategorySelect(index) {
    const category = this.categories[index];
    if (category === 'Close Menu') {
      return { action: 'back' };
    }
    if (category === 'Save & Exit') {
      // Return specific action to save and go to main menu
      // In Game.js: if action is 'saveAndExit', save game then switch state to MENU
      return { action: 'saveAndExit' };
    }
    return null;
  }

  handleClick(mousePos, canvasWidth, canvasHeight) {
    if (!this.visible) return null;

    const layout = this.getLayout(canvasWidth, canvasHeight);

    // 1. Check Left Navigation Column
    for (let i = 0; i < this.categories.length; i++) {
      const btnY = layout.navY + i * layout.navItemHeight;
      if (mousePos.x >= layout.navX && mousePos.x <= layout.navX + layout.navWidth &&
          mousePos.y >= btnY && mousePos.y <= btnY + layout.navItemHeight) {
        
        this.selectedCategoryIndex = i;
        return this.handleCategorySelect(i);
      }
    }

    // 2. Check Right Panel Settings (Only if General is selected for now)
    if (this.categories[this.selectedCategoryIndex] === 'General') {
      return this.handleGeneralSettingsClick(mousePos, layout);
    }

    return null;
  }

  handleGeneralSettingsClick(mousePos, layout) {
    const contentX = layout.contentX;
    const contentY = layout.contentY;
    const rowHeight = 40;
    
    // Define the list of interactable settings in render order
    const interactables = [
      { id: 'musicVolume', type: 'slider', y: contentY + 40 },
      { id: 'soundVolume', type: 'slider', y: contentY + 80 },
      { id: 'ambientVolume', type: 'slider', y: contentY + 120 },
      { id: 'zoom', type: 'slider', y: contentY + 180 }, // Zoom has header above it
      { id: 'autosave', type: 'toggle', y: contentY + 240 },
      { id: 'autopause', type: 'toggle', y: contentY + 280 },
      { id: 'placementPreview', type: 'toggle', y: contentY + 320 },
      { id: 'smartCursorMode', type: 'multi', y: contentY + 360 },
      { id: 'smartCursorPriority', type: 'multi', y: contentY + 400 },
    ];

    for (const item of interactables) {
      // Sliders
      if (item.type === 'slider') {
        // Slider area
        const sliderX = contentX + 150;
        const sliderWidth = 200;
        const sliderY = item.y - 10;
        const sliderHeight = 20;

        if (mousePos.x >= sliderX - 10 && mousePos.x <= sliderX + sliderWidth + 10 &&
            mousePos.y >= sliderY && mousePos.y <= sliderY + sliderHeight) {
          
          this.draggingSlider = item.id;
          this.updateSliderValue(mousePos.x, sliderX, sliderWidth, item.id);
          return { action: 'update', setting: item.id, value: this.settings[item.id] };
        }
      }
      // Toggles
      else if (item.type === 'toggle') {
        // Toggle text area "On / Off"
        const toggleX = contentX + 250;
        if (mousePos.x >= toggleX && mousePos.x <= toggleX + 60 &&
            mousePos.y >= item.y - 15 && mousePos.y <= item.y + 15) {
          this.settings[item.id] = !this.settings[item.id];
          return { action: 'update', setting: item.id, value: this.settings[item.id] };
        }
      }
      // Multi-state toggles (e.g. Smart Cursor)
      else if (item.type === 'multi') {
        const toggleX = contentX + 250;
        if (mousePos.x >= toggleX && mousePos.x <= toggleX + 100 &&
            mousePos.y >= item.y - 15 && mousePos.y <= item.y + 15) {
           // Basic toggle logic for strings (just swapping two states for simplicity)
           if (item.id === 'smartCursorMode') {
             this.settings[item.id] = this.settings[item.id] === 'Hold' ? 'Toggle' : 'Hold';
           } else if (item.id === 'smartCursorPriority') {
             this.settings[item.id] = this.settings[item.id] === 'Dig' ? 'Build' : 'Dig';
           }
           return { action: 'update', setting: item.id, value: this.settings[item.id] };
        }
      }
    }
    
    return null;
  }

  // Handle dragging (called by Game.js or implied if mouse is down)
  // We need to know if mouse is held. Game.js passes clicks. 
  // We can add a handleMouseMove or handleDrag method.
  // For simplicity, we'll assume handleClick handles the initial press, 
  // and we might rely on repeated calls or just click-to-jump for now.
  // To support dragging, Game.js would need to call a drag handler.
  // Let's implement a 'handleDrag' that Game.js calls if mouse is down.
  handleDrag(mousePos, canvasWidth, canvasHeight) {
    if (!this.draggingSlider) return null;
    
    const layout = this.getLayout(canvasWidth, canvasHeight);
    const contentX = layout.contentX;
    const sliderX = contentX + 150;
    const sliderWidth = 200;
    
    this.updateSliderValue(mousePos.x, sliderX, sliderWidth, this.draggingSlider);
    return { action: 'update', setting: this.draggingSlider, value: this.settings[this.draggingSlider] };
  }
  
  stopDrag() {
    this.draggingSlider = null;
  }

  updateSliderValue(mouseX, sliderX, sliderWidth, settingId) {
    let pct = (mouseX - sliderX) / sliderWidth;
    pct = Math.max(0, Math.min(1, pct));
    
    // Map percentages to values
    if (settingId === 'zoom') {
      // Zoom 1 to 4
      const val = 1 + pct * 3;
      this.settings[settingId] = Math.round(val * 10) / 10;
    } else {
      // Volume 0 to 100
      this.settings[settingId] = Math.round(pct * 100);
    }
  }

  getLayout(w, h) {
    const panelWidth = 700;
    const panelHeight = 500;
    const panelX = (w - panelWidth) / 2;
    const panelY = (h - panelHeight) / 2;
    
    return {
      panelX, panelY, panelWidth, panelHeight,
      navX: panelX + 20,
      navY: panelY + 80,
      navWidth: 150,
      navItemHeight: 40,
      contentX: panelX + 200,
      contentY: panelY + 80,
      contentWidth: 480
    };
  }

  render(ctx) {
    if (!this.visible) return;

    const canvas = ctx.canvas;
    const layout = this.getLayout(canvas.width, canvas.height);
    const { panelX, panelY, panelWidth, panelHeight } = layout;

    // 1. Dark Subdued Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Main Panel (Dark Indigo)
    ctx.fillStyle = '#181830';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

    // 3. Thick Beveled Border
    const borderWidth = 6;
    // Light Top/Left
    ctx.fillStyle = '#505090'; 
    ctx.fillRect(panelX, panelY, panelWidth, borderWidth); // Top
    ctx.fillRect(panelX, panelY, borderWidth, panelHeight); // Left
    // Dark Bottom/Right
    ctx.fillStyle = '#080810';
    ctx.fillRect(panelX, panelY + panelHeight - borderWidth, panelWidth, borderWidth); // Bottom
    ctx.fillRect(panelX + panelWidth - borderWidth, panelY, borderWidth, panelHeight); // Right
    
    // Inner outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX + borderWidth, panelY + borderWidth, panelWidth - borderWidth * 2, panelHeight - borderWidth * 2);

    // 4. Header
    ctx.textAlign = 'center';
    ctx.font = 'bold 20px monospace'; // Small pixel font
    ctx.fillStyle = '#E0E0E0';
    ctx.fillText('Settings Menu', panelX + panelWidth / 2, panelY + 40);

    // 5. Left Navigation Column
    this.renderNavigation(ctx, layout);

    // 6. Right Settings Panel
    this.renderSettingsContent(ctx, layout);
  }

  renderNavigation(ctx, layout) {
    ctx.textAlign = 'left';
    ctx.font = 'bold 18px monospace';

    for (let i = 0; i < this.categories.length; i++) {
      const category = this.categories[i];
      const y = layout.navY + i * layout.navItemHeight + 25;
      const isSelected = i === this.selectedCategoryIndex;

      if (isSelected) {
        ctx.fillStyle = '#FFFF00'; // Highlight
      } else {
        ctx.fillStyle = '#AAAAAA'; // Inactive
      }
      ctx.fillText(category, layout.navX + 10, y);
    }
    
    // Vertical Separator Line
    ctx.beginPath();
    ctx.strokeStyle = '#505090';
    ctx.lineWidth = 2;
    ctx.moveTo(layout.contentX - 10, layout.navY);
    ctx.lineTo(layout.contentX - 10, layout.panelY + layout.panelHeight - 20);
    ctx.stroke();
  }

  renderSettingsContent(ctx, layout) {
    const category = this.categories[this.selectedCategoryIndex];
    
    if (category === 'General') {
      this.renderGeneralSettings(ctx, layout);
    } else {
      // Placeholder for other tabs
      ctx.textAlign = 'center';
      ctx.fillStyle = '#AAAAAA';
      ctx.fillText('Options for ' + category + ' coming soon...', layout.contentX + layout.contentWidth / 2, layout.contentY + 100);
    }
  }

  renderGeneralSettings(ctx, layout) {
    const x = layout.contentX;
    const y = layout.contentY;
    const rowHeight = 40;
    
    ctx.textAlign = 'left';
    ctx.font = '16px monospace';
    
    // Helper to draw slider
    const drawSlider = (label, value, min, max, offsetY) => {
      // Label
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(label, x, y + offsetY);
      
      // Bar background
      const barX = x + 150;
      const barY = y + offsetY - 8;
      const barW = 200;
      const barH = 10;
      
      ctx.fillStyle = '#303050';
      ctx.fillRect(barX, barY, barW, barH);
      // Bar border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(barX, barY, barW, barH);
      
      // Fill
      const pct = (value - min) / (max - min);
      ctx.fillStyle = '#5050A0'; // Indigo-ish fill
      ctx.fillRect(barX, barY, barW * pct, barH);
      
      // Knob
      const knobX = barX + barW * pct;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(knobX - 4, barY - 4, 8, 18);
      ctx.strokeRect(knobX - 4, barY - 4, 8, 18);
      
      // Value text
      ctx.fillStyle = '#AAAAAA';
      ctx.fillText(Math.floor(value) + (label.includes('Zoom') ? 'x' : '%'), barX + barW + 15, y + offsetY);
    };
    
    // Helper to draw toggle
    const drawToggle = (label, value, offsetY, valueText = null) => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(label, x, y + offsetY);
      
      const toggleX = x + 250;
      
      const text = valueText ? valueText : (value ? 'On' : 'Off');
      const color = valueText ? '#FFFFFF' : (value ? '#00FF00' : '#888888');
      
      ctx.fillStyle = color;
      ctx.fillText(text, toggleX, y + offsetY);
    };

    // 1. Volume Section
    drawSlider('Music Volume', this.settings.musicVolume, 0, 100, 40);
    drawSlider('Sound Volume', this.settings.soundVolume, 0, 100, 80);
    drawSlider('Ambient Volume', this.settings.ambientVolume, 0, 100, 120);
    
    // 2. Zoom Section
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Zoom', x, y + 170);
    drawSlider('', this.settings.zoom, 1, 4, 190);
    
    // 3. Gameplay Toggles
    drawToggle('Autosave', this.settings.autosave, 240);
    drawToggle('Autopause', this.settings.autopause, 280);
    drawToggle('Placement Preview', this.settings.placementPreview, 320);
    drawToggle('Smart Cursor Mode', true, 360, this.settings.smartCursorMode);
    drawToggle('Smart Cursor Priority', true, 400, this.settings.smartCursorPriority);
  }
}