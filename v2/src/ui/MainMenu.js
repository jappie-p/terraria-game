// MainMenu - Title screen with new game / load game options
import { SaveManager } from '../save/SaveManager.js';

export class MainMenu {
  constructor() {
    this.visible = true;
    this.screen = 'main'; // 'main', 'newWorld', 'loadWorld'
    this.selectedOption = 0;
    
    // Terraria-style menu options
    this.mainOptions = [
      { id: 'singleplayer', label: 'Single Player', description: 'Start or continue your adventure' },
      { id: 'multiplayer', label: 'Multiplayer', description: 'Join online worlds (Coming Soon)' },
      { id: 'achievements', label: 'Achievements', description: 'View your progress (Coming Soon)' },
      { id: 'workshop', label: 'Workshop', description: 'Community content (Coming Soon)' },
      { id: 'settings', label: 'Settings', description: 'Change game options' },
      { id: 'exit', label: 'Exit', description: 'Close the game' },
    ];
    
    this.hasExistingSave = false;
    this.animationTime = 0;
    this.hoveredOption = -1; // For mouse hover effect

    // World name input for new world
    this.worldName = '';
    this.isTypingName = false;
    this.maxNameLength = 20;

    // Save list for load screen
    this.saves = [];
    this.saveScrollOffset = 0;
    this.selectedSaveIndex = 0;
    this.confirmDelete = null;
  }

  // Update animation
  update(dt) {
    this.animationTime += dt;
  }

  // Set whether a save exists
  setSaveExists(exists) {
    this.hasExistingSave = exists;
  }

  // Set saves list
  setSaves(saves) {
    this.saves = saves || [];
    this.hasExistingSave = this.saves.length > 0;
  }

  // Handle keyboard input
  handleInput(key) {
    if (this.screen === 'main') {
      return this.handleMainInput(key);
    } else if (this.screen === 'newWorld') {
      return this.handleNewWorldInput(key);
    } else if (this.screen === 'loadWorld') {
      return this.handleLoadWorldInput(key);
    }
    return null;
  }

  handleMainInput(key) {
    if (key === 'ArrowUp' || key === 'w' || key === 'W') {
      this.selectedOption = Math.max(0, this.selectedOption - 1);
      return null;
    }
    if (key === 'ArrowDown' || key === 's' || key === 'S') {
      this.selectedOption = Math.min(this.mainOptions.length - 1, this.selectedOption + 1);
      return null;
    }
    if (key === 'Enter' || key === ' ') {
      return this.selectMainOption();
    }
    return null;
  }

  handleNewWorldInput(key) {
    if (key === 'Escape') {
      this.screen = 'loadWorld'; // Go back to world select
      this.isTypingName = false;
      return null;
    }

    if (this.isTypingName) {
      if (key === 'Enter') {
        if (this.worldName.trim().length > 0) {
          return { action: 'createWorld', name: this.worldName.trim() };
        }
        return null;
      }
      if (key === 'Backspace') {
        this.worldName = this.worldName.slice(0, -1);
        return null;
      }
      if (key.length === 1 && this.worldName.length < this.maxNameLength) {
        this.worldName += key;
        return null;
      }
      return null;
    }

    if (key === 'Enter' || key === ' ') {
      this.isTypingName = true;
      return null;
    }

    return null;
  }

  handleLoadWorldInput(key) {
    if (key === 'Escape') {
      if (this.confirmDelete) {
        this.confirmDelete = null;
      } else {
        this.screen = 'main';
      }
      return null;
    }

    if (this.confirmDelete) {
      if (key === 'Enter' || key === 'y' || key === 'Y') {
        return { action: 'deleteSave', saveId: this.confirmDelete };
      }
      if (key === 'n' || key === 'N') {
        this.confirmDelete = null;
      }
      return null;
    }

    if (key === 'ArrowUp' || key === 'w' || key === 'W') {
      this.selectedSaveIndex = Math.max(0, this.selectedSaveIndex - 1);
      return null;
    }
    if (key === 'ArrowDown' || key === 's' || key === 'S') {
      this.selectedSaveIndex = Math.min(this.saves.length - 1, this.selectedSaveIndex + 1);
      return null;
    }
    if (key === 'Enter' || key === ' ') {
      // If "New World" logic is embedded in list or separate button?
      // For now, let's say Enter loads selected.
      if (this.saves.length > 0) {
        return { action: 'loadSave', saveId: this.saves[this.selectedSaveIndex].id };
      }
      return null;
    }
    // "N" for new world shortcut
    if (key === 'n' || key === 'N') {
        this.screen = 'newWorld';
        this.worldName = 'World ' + (Date.now() % 1000);
        this.isTypingName = true;
        return null;
    }
    
    if (key === 'Delete' || key === 'd' || key === 'D') {
      if (this.saves.length > 0) {
        this.confirmDelete = this.saves[this.selectedSaveIndex].id;
      }
      return null;
    }
    return null;
  }

  // Handle mouse click
  handleClick(mousePos, canvasWidth, canvasHeight) {
    if (this.screen === 'main') {
      return this.handleMainClick(mousePos, canvasWidth, canvasHeight);
    } else if (this.screen === 'newWorld') {
      return this.handleNewWorldClick(mousePos, canvasWidth, canvasHeight);
    } else if (this.screen === 'loadWorld') {
      return this.handleLoadWorldClick(mousePos, canvasWidth, canvasHeight);
    }
    return null;
  }

  handleMainClick(mousePos, canvasWidth, canvasHeight) {
    const centerX = canvasWidth / 2;
    // Menu starts below logo
    const menuStartY = 250; 
    const optionHeight = 40;
    const optionSpacing = 15;

    for (let i = 0; i < this.mainOptions.length; i++) {
      const option = this.mainOptions[i];
      
      // Calculate text bounds roughly
      const textWidth = 300; // Hitbox width
      const y = menuStartY + i * (optionHeight + optionSpacing);
      
      if (mousePos.x >= centerX - textWidth/2 && mousePos.x <= centerX + textWidth/2 &&
          mousePos.y >= y - optionHeight/2 && mousePos.y <= y + optionHeight/2) {
        
        this.selectedOption = i;
        return this.selectMainOption();
      }
    }
    return null;
  }

  handleNewWorldClick(mousePos, canvasWidth, canvasHeight) {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    // Back button
    if (mousePos.x >= 10 && mousePos.x <= 130 && mousePos.y >= 10 && mousePos.y <= 60) {
      this.screen = 'loadWorld'; // Back to select
      this.isTypingName = false;
      return null;
    }

    // Name input box
    const inputX = centerX - 200;
    const inputY = centerY - 30;
    if (mousePos.x >= inputX && mousePos.x <= inputX + 400 &&
        mousePos.y >= inputY && mousePos.y <= inputY + 50) {
      this.isTypingName = true;
      return null;
    }

    // Create button
    const createY = centerY + 50;
    if (mousePos.x >= centerX - 110 && mousePos.x <= centerX + 110 &&
        mousePos.y >= createY - 5 && mousePos.y <= createY + 55) {
      if (this.worldName.trim().length > 0) {
        return { action: 'createWorld', name: this.worldName.trim() };
      }
    }

    return null;
  }

  // Handle scroll input
  handleScroll(deltaY) {
    if (this.screen === 'loadWorld') {
      const slotHeight = 90; // Height + spacing
      const visibleHeight = 400; // Approx visible area
      const totalHeight = this.saves.length * slotHeight;
      const maxScroll = Math.max(0, totalHeight - visibleHeight);
      
      this.saveScrollOffset += deltaY * 0.5; // Scroll speed
      this.saveScrollOffset = Math.max(0, Math.min(maxScroll, this.saveScrollOffset));
    }
  }

  handleLoadWorldClick(mousePos, canvasWidth, canvasHeight) {
    const centerX = canvasWidth / 2;

    // Back button
    if (mousePos.x >= 10 && mousePos.x <= 130 && mousePos.y >= 10 && mousePos.y <= 60) {
      this.screen = 'main';
      this.confirmDelete = null;
      return null;
    }
    
    // New World Button (Now at Top-Center-Rightish or clearly separated)
    // Let's place it nicely below the title
    const newBtnY = 100;
    const newBtnW = 200;
    if (mousePos.x >= centerX - newBtnW/2 && mousePos.x <= centerX + newBtnW/2 &&
        mousePos.y >= newBtnY && mousePos.y <= newBtnY + 50) {
        this.screen = 'newWorld';
        this.worldName = 'World ' + (Date.now() % 1000);
        this.isTypingName = true;
        return null;
    }

    // Confirm delete dialog logic
    if (this.confirmDelete) {
        const dialogY = canvasHeight / 2 - 50;
        if (mousePos.x >= centerX - 110 && mousePos.x <= centerX - 20 &&
            mousePos.y >= dialogY + 60 && mousePos.y <= dialogY + 100) {
          return { action: 'deleteSave', saveId: this.confirmDelete };
        }
        if (mousePos.x >= centerX + 20 && mousePos.x <= centerX + 110 &&
            mousePos.y >= dialogY + 60 && mousePos.y <= dialogY + 100) {
          this.confirmDelete = null;
        }
        return null;
    }

    // Save slots (Scrollable area)
    const listStartY = 180; // Below New World button
    const listHeight = canvasHeight - listStartY - 20; // Bottom margin
    const slotHeight = 80;
    const slotSpacing = 10;
    const slotWidth = 500;
    const slotX = centerX - slotWidth / 2;

    // Check if click is within list area
    if (mousePos.y >= listStartY && mousePos.y <= listStartY + listHeight) {
        // Adjust mouse Y by scroll offset
        const scrolledY = mousePos.y - listStartY + this.saveScrollOffset;
        
        for (let i = 0; i < this.saves.length; i++) {
          const slotTop = i * (slotHeight + slotSpacing);
          const slotBottom = slotTop + slotHeight;

          if (scrolledY >= slotTop && scrolledY <= slotBottom) {
             if (mousePos.x >= slotX && mousePos.x <= slotX + slotWidth) {
                // Delete button check
                if (mousePos.x >= slotX + slotWidth - 70) {
                  this.selectedSaveIndex = i;
                  this.confirmDelete = this.saves[i].id;
                  return null;
                }

                this.selectedSaveIndex = i;
                return { action: 'loadSave', saveId: this.saves[i].id };
             }
          }
        }
    }
    return null;
  }

  // Select current main option
  selectMainOption() {
    const option = this.mainOptions[this.selectedOption];
    
    if (option.id === 'singleplayer') {
      // Go to world select screen
      this.screen = 'loadWorld';
      this.selectedSaveIndex = 0;
      this.confirmDelete = null;
      return null;
    }
    else if (option.id === 'settings') {
      // This will be caught by Game.js to open settings menu
      return { action: 'openSettings' }; 
    }
    else if (option.id === 'exit') {
        // Just reload page
        window.location.reload();
        return null;
    }
    // Other options do nothing yet
    return null;
  }

  // Render the main menu
  render(ctx) {
    if (!this.visible) return;

    const canvas = ctx.canvas;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 1. Draw Sky (Vertical Gradient)
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#4b9cd3'); // Darker blue top
    skyGradient.addColorStop(1, '#95d9e8'); // Lighter blue horizon
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Landscape Layers (Parallax Mountains)
    this.drawLandscape(ctx, canvas.width, canvas.height);

    // 3. Draw Main UI based on screen
    if (this.screen === 'main') {
      this.renderMainScreen(ctx, canvas, centerX, centerY);
    } else if (this.screen === 'newWorld') {
      this.renderNewWorldScreen(ctx, canvas, centerX, centerY);
    } else if (this.screen === 'loadWorld') {
      this.renderLoadWorldScreen(ctx, canvas, centerX, centerY);
    }
    
    // 4. Footer Text
    this.renderFooter(ctx, canvas.width, canvas.height);
  }

  renderMainScreen(ctx, canvas, centerX, centerY) {
    // Logo
    this.drawLogo(ctx, centerX, 100);

    // Menu Options
    const menuStartY = 250;
    const optionHeight = 40;
    const optionSpacing = 15;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < this.mainOptions.length; i++) {
      const option = this.mainOptions[i];
      const y = menuStartY + i * (optionHeight + optionSpacing);
      const isSelected = i === this.selectedOption;
      
      // Text shadow/outline
      ctx.font = 'bold 24px monospace';
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#000000';
      ctx.strokeText(option.label, centerX, y);
      
      // Text fill
      ctx.fillStyle = isSelected ? '#FFFF00' : '#E0E0E0'; // Yellow if selected, White/Gray otherwise
      ctx.fillText(option.label, centerX, y);
      
      // Glow effect if selected (simulated by drawing again with alpha)
      if (isSelected) {
          ctx.shadowColor = '#FFFF00';
          ctx.shadowBlur = 10;
          ctx.fillText(option.label, centerX, y);
          ctx.shadowBlur = 0;
      }
    }
  }

  // Draw the "Terraria" style logo
  drawLogo(ctx, x, y) {
    ctx.save();
    
    // Main Text
    const text = "Terraria";
    ctx.font = "bold 80px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // 3D/Shadow effect
    ctx.fillStyle = "#003300"; // Dark green shadow
    ctx.fillText(text, x + 4, y + 4);
    
    // Outline
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 6;
    ctx.strokeText(text, x, y);
    
    // Fill (Grass Texture Gradient)
    const gradient = ctx.createLinearGradient(x, y - 40, x, y + 40);
    gradient.addColorStop(0, "#55DD55"); // Light green
    gradient.addColorStop(0.5, "#22AA22"); // Mid green
    gradient.addColorStop(1, "#006600"); // Dark green
    ctx.fillStyle = gradient;
    ctx.fillText(text, x, y);
    
    // Tree on 'T'
    // Calculate position of 'T'. Roughly x - width/2
    const width = ctx.measureText(text).width;
    const tx = x - width/2 + 20; // Approx start of T
    const ty = y - 30; // Top of T
    
    this.drawTree(ctx, tx, ty);
    
    ctx.restore();
  }
  
  drawTree(ctx, x, y) {
      // Trunk
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x - 4, y - 20, 8, 25);
      
      // Leaves (Pixelated blob)
      ctx.fillStyle = '#228B22';
      // Center
      ctx.fillRect(x - 12, y - 35, 24, 20);
      // Edges
      ctx.fillRect(x - 16, y - 30, 4, 10);
      ctx.fillRect(x + 12, y - 30, 4, 10);
      ctx.fillRect(x - 8, y - 38, 16, 3);
      
      // Highlights
      ctx.fillStyle = '#32CD32';
      ctx.fillRect(x - 8, y - 32, 4, 4);
      ctx.fillRect(x + 4, y - 25, 4, 4);
  }

  drawLandscape(ctx, width, height) {
    // 1. Distant Mountains (Faded Blue-Grey)
    ctx.fillStyle = '#8DA6C0'; // Hazy blue
    ctx.beginPath();
    ctx.moveTo(0, height);
    for(let x = 0; x <= width; x += 40) {
        const h = Math.abs(Math.sin(x * 0.005)) * 150 + 100;
        ctx.lineTo(x, height - h - 100); // Higher up
    }
    ctx.lineTo(width, height);
    ctx.fill();
    
    // 2. Mid Mountains (Darker Blue)
    ctx.fillStyle = '#5D738E';
    ctx.beginPath();
    ctx.moveTo(0, height);
    for(let x = 0; x <= width; x += 30) {
        const h = Math.abs(Math.sin(x * 0.01 + 1)) * 100 + 50;
        ctx.lineTo(x, height - h - 50);
    }
    ctx.lineTo(width, height);
    ctx.fill();
    
    // 3. Foreground Hills (Green)
    ctx.fillStyle = '#2E8B57'; // SeaGreen
    ctx.beginPath();
    ctx.moveTo(0, height);
    for(let x = 0; x <= width; x += 20) {
        const h = Math.abs(Math.sin(x * 0.015 + 2)) * 40 + 20;
        ctx.lineTo(x, height - h);
    }
    ctx.lineTo(width, height);
    ctx.fill();
    
    // 4. Foreground Trees (Left and Right edges)
    // Left Tree
    this.drawLargeTree(ctx, 40, height - 20, 1.5);
    this.drawLargeTree(ctx, 100, height - 40, 1.0);
    
    // Right Trees
    this.drawLargeTree(ctx, width - 60, height - 30, 1.4);
    this.drawLargeTree(ctx, width - 120, height - 20, 0.9);
  }
  
  drawLargeTree(ctx, x, y, scale) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      
      // Trunk
      ctx.fillStyle = '#5C3317';
      ctx.fillRect(-10, -80, 20, 80);
      
      // Leaves (Big canopy)
      ctx.fillStyle = '#006400';
      ctx.beginPath();
      ctx.arc(0, -90, 40, 0, Math.PI * 2);
      ctx.fill();
      
      // Leaf Highlights
      ctx.fillStyle = '#228B22';
      ctx.beginPath();
      ctx.arc(-15, -100, 15, 0, Math.PI * 2);
      ctx.arc(15, -85, 12, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
  }
  
  renderFooter(ctx, width, height) {
      ctx.font = '12px monospace';
      ctx.fillStyle = '#FFFFFF';
      
      // Bottom Left
      ctx.textAlign = 'left';
      ctx.fillText('© Re-Logic', 10, height - 10);
      
      // Bottom Right
      ctx.textAlign = 'right';
      ctx.fillText('v1.4.x.x', width - 10, height - 10);
  }

  // Reuse existing render methods for other screens (New/Load) but updated slightly styles
  renderNewWorldScreen(ctx, canvas, centerX, centerY) {
      // ... keep existing functional logic but maybe clean up style to match ...
      // For brevity, using standard render but on top of new landscape
      
      // Overlay to darken background
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Title
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 30px monospace';
      ctx.fillText('Create New World', centerX, 100);
      
      // Input
      const inputY = centerY - 20;
      ctx.fillStyle = '#000000';
      ctx.fillRect(centerX - 200, inputY, 400, 40);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX - 200, inputY, 400, 40);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '20px monospace';
      ctx.fillText(this.worldName + (this.isTypingName && Math.floor(Date.now()/500)%2 ? '_' : ''), centerX, inputY + 28);
      
      // Buttons
      const btnY = centerY + 60;
      this.drawSimpleButton(ctx, centerX, btnY, 'Create World', true);
      this.drawSimpleButton(ctx, 70, 40, 'Back', false);
  }
  
  renderLoadWorldScreen(ctx, canvas, centerX, centerY) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Title
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px monospace';
      ctx.fillText('Select World', centerX, 60);
      
      this.drawSimpleButton(ctx, 70, 40, 'Back', false);
      
      // New World Button (Prominent at top)
      const newBtnY = 100;
      this.drawSimpleButton(ctx, centerX, newBtnY + 25, '+ Create New World', true);
      
      // List Area
      const listStartY = 180;
      const listHeight = canvas.height - listStartY - 20;
      const slotHeight = 80;
      const slotWidth = 500;
      const slotX = centerX - slotWidth / 2;
      
      // Clip List
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, listStartY, canvas.width, listHeight);
      ctx.clip();
      
      if (this.saves.length === 0) {
          ctx.textAlign = 'center';
          ctx.fillStyle = '#AAAAAA';
          ctx.fillText('No Worlds Found', centerX, listStartY + 100);
      } else {
          for(let i=0; i<this.saves.length; i++) {
              const save = this.saves[i];
              const y = listStartY + i * (slotHeight + 10) - this.saveScrollOffset;
              
              // Culling
              if (y + slotHeight < listStartY || y > canvas.height) continue;
              
              const isSelected = i === this.selectedSaveIndex;
              
              // Slot BG
              ctx.fillStyle = isSelected ? '#000044' : '#000000';
              ctx.fillRect(slotX, y, slotWidth, slotHeight);
              ctx.strokeStyle = isSelected ? '#FFFF00' : '#444444';
              ctx.lineWidth = 2;
              ctx.strokeRect(slotX, y, slotWidth, slotHeight);
              
              // Icon/Thumbnail placeholder (Left)
              ctx.fillStyle = '#222';
              ctx.fillRect(slotX + 10, y + 10, 60, 60);
              // Draw tree icon logic from logo maybe? Or simple icon
              // Use simplified tree
              ctx.fillStyle = '#228B22';
              ctx.fillRect(slotX + 35, y + 20, 10, 40); // trunk?
              ctx.beginPath(); ctx.arc(slotX + 40, y + 30, 15, 0, Math.PI*2); ctx.fill(); // leaves
              
              // Text
              ctx.fillStyle = '#FFFFFF';
              ctx.font = 'bold 20px monospace';
              ctx.textAlign = 'left';
              ctx.fillText(save.name, slotX + 85, y + 30);
              
              ctx.font = '14px monospace';
              ctx.fillStyle = '#AAAAAA';
              const date = new Date(save.timestamp).toLocaleDateString();
              const playtime = SaveManager.formatPlaytime(save.playtime || 0);
              ctx.fillText(`${date} - Played: ${playtime}`, slotX + 85, y + 55);
              
              // Delete Icon (Right)
              ctx.textAlign = 'right';
              ctx.fillStyle = '#FF4444';
              ctx.font = 'bold 16px monospace';
              ctx.fillText('X', slotX + slotWidth - 20, y + 45);
          }
      }
      ctx.restore();
      
      // Scrollbar (if needed)
      const totalContentHeight = this.saves.length * (slotHeight + 10);
      if (totalContentHeight > listHeight) {
          const scrollBarX = slotX + slotWidth + 20;
          const scrollBarWidth = 10;
          const thumbHeight = Math.max(30, (listHeight / totalContentHeight) * listHeight);
          const thumbY = listStartY + (this.saveScrollOffset / totalContentHeight) * listHeight;
          
          ctx.fillStyle = '#333333';
          ctx.fillRect(scrollBarX, listStartY, scrollBarWidth, listHeight);
          ctx.fillStyle = '#888888';
          ctx.fillRect(scrollBarX, thumbY, scrollBarWidth, thumbHeight);
      }
      
      // Confirm Dialog (Draw on top of everything)
      if (this.confirmDelete) {
          ctx.fillStyle = 'rgba(0,0,0,0.9)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.font = 'bold 24px monospace';
          ctx.fillText('Delete this world?', centerX, centerY - 20);
          ctx.font = '16px monospace';
          ctx.fillText('This cannot be undone.', centerX, centerY + 10);
          ctx.fillStyle = '#FF0000';
          ctx.fillText('YES (Y)', centerX - 50, centerY + 50);
          ctx.fillStyle = '#00FF00';
          ctx.fillText('NO (N)', centerX + 50, centerY + 50);
      }
  }
  
  drawSimpleButton(ctx, x, y, text, highlight) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 20px monospace';
      
      // Text with shadow
      ctx.fillStyle = '#000000';
      ctx.fillText(text, x+2, y+2);
      ctx.fillStyle = highlight ? '#FFFF00' : '#FFFFFF';
      ctx.fillText(text, x, y);
  }
}
