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

    // Check if save exists
    if (game.hasSave()) {
      console.log('Save file detected! Press F9 to load or start a new game.');
      console.log('Starting new game...');
    }

    // Start game
    game.start();

    // Make game globally accessible for debugging
    window.game = game;

    console.log('Terraria game started!');
    console.log('Controls: WASD to move, Left-click to mine/attack, Right-click to place blocks');
    console.log('Press C for crafting, E for equipment, F5 to save, F9 to load');
  } catch (error) {
    console.error('Failed to start game:', error);
    console.error('Stack trace:', error.stack);
  }
});
