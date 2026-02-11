// InputManager - Handles keyboard and mouse input
import { Vec } from '../utils/Vec.js';

export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Map(); // Currently pressed keys
    this.keysPressed = new Map(); // Just pressed this frame
    this.keysReleased = new Map(); // Just released this frame
    this.mouse = {
      pos: new Vec(0, 0),
      left: false,
      right: false,
      leftPressed: false,
      rightPressed: false,
      leftReleased: false,
      rightReleased: false
    };

    this.setupEventListeners();
  }

  // Setup event listeners
  setupEventListeners() {
    // Keyboard events
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));

    // Mouse events
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault()); // Disable right-click menu
  }

  // Key down handler
  onKeyDown(e) {
    if (!this.keys.has(e.key)) {
      this.keysPressed.set(e.key, true);
    }
    this.keys.set(e.key, true);
  }

  // Key up handler
  onKeyUp(e) {
    this.keys.delete(e.key);
    this.keysReleased.set(e.key, true);
  }

  // Mouse move handler
  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.pos.x = e.clientX - rect.left;
    this.mouse.pos.y = e.clientY - rect.top;
  }

  // Mouse down handler
  onMouseDown(e) {
    if (e.button === 0) { // Left button
      if (!this.mouse.left) {
        this.mouse.leftPressed = true;
      }
      this.mouse.left = true;
    } else if (e.button === 2) { // Right button
      if (!this.mouse.right) {
        this.mouse.rightPressed = true;
      }
      this.mouse.right = true;
    }
    e.preventDefault();
  }

  // Mouse up handler
  onMouseUp(e) {
    if (e.button === 0) { // Left button
      this.mouse.left = false;
      this.mouse.leftReleased = true;
    } else if (e.button === 2) { // Right button
      this.mouse.right = false;
      this.mouse.rightReleased = true;
    }
  }

  // Check if key is currently down
  isDown(key) {
    return this.keys.has(key);
  }

  // Check if key was just pressed this frame
  isPressed(key) {
    return this.keysPressed.has(key);
  }

  // Check if key was just released this frame
  isReleased(key) {
    return this.keysReleased.has(key);
  }

  // Update - call at end of frame to clear pressed/released states
  update() {
    this.keysPressed.clear();
    this.keysReleased.clear();
    this.mouse.leftPressed = false;
    this.mouse.rightPressed = false;
    this.mouse.leftReleased = false;
    this.mouse.rightReleased = false;
  }

  // Cleanup
  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mouseup', this.onMouseUp);
  }
}
