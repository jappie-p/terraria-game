// Terraria Game - Entry point
import { Game } from './src/Game.js';

// Wait for DOM to load
window.addEventListener('DOMContentLoaded', () => {
  // Get canvas
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }

  // Set canvas size
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (window.game) {
      window.game.resize(canvas.width, canvas.height);
    }
  };

  resize();
  window.addEventListener('resize', resize);

  try {
    // Create game
    const game = new Game(canvas);

    // Start game (begins at main menu)
    game.start();

    // Make game globally accessible for debugging
    window.game = game;

    console.log('Terraria game started!');
    console.log('Use the main menu to start a new world or load an existing save.');
    console.log('In-game controls: WASD to move, Left-click to mine/attack, Right-click to place blocks');
    console.log('Press E/I for inventory, C for crafting, F5 to quick-save, Escape to pause');
  } catch (error) {
    console.error('Failed to start game:', error);
    console.error('Stack trace:', error.stack);
  }
});
