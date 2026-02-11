// Camera - Viewport management and smooth following
import { Vec } from '../utils/Vec.js';
import { CAMERA_SMOOTHNESS, CAMERA_DEADZONE } from '../utils/Constants.js';

export class Camera {
  constructor(viewport) {
    this.pos = new Vec(0, 0); // Camera center in world coordinates
    this.viewport = viewport; // {width, height} in pixels
    this.target = null; // Entity to follow (usually player)
    this.zoom = 1.0;
    this.smoothness = CAMERA_SMOOTHNESS;

    // Screen shake
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeTime = 0;
    this.shakeOffset = new Vec(0, 0);
    this.shakeDecay = 0.9; // How fast shake fades
  }

  // Trigger screen shake
  shake(intensity, duration = 0.3) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeDuration = Math.max(this.shakeDuration, duration);
    this.shakeTime = 0;
  }

  // Update screen shake
  updateShake(dt) {
    if (this.shakeDuration > 0) {
      this.shakeTime += dt;

      // Calculate shake progress (0 to 1)
      const progress = this.shakeTime / this.shakeDuration;

      // Decay intensity over time
      const currentIntensity = this.shakeIntensity * (1 - progress);

      // Random offset with decreasing magnitude
      this.shakeOffset.x = (Math.random() * 2 - 1) * currentIntensity;
      this.shakeOffset.y = (Math.random() * 2 - 1) * currentIntensity;

      // End shake when duration is over
      if (this.shakeTime >= this.shakeDuration) {
        this.shakeDuration = 0;
        this.shakeIntensity = 0;
        this.shakeOffset.x = 0;
        this.shakeOffset.y = 0;
      }
    }
  }

  // Set target to follow
  follow(entity) {
    this.target = entity;
  }

  // Update camera position
  update(dt) {
    // Update screen shake
    this.updateShake(dt);

    if (!this.target) return;

    // Target position (center of entity)
    const targetX = this.target.pos.x;
    const targetY = this.target.pos.y;

    // Calculate distance to target
    const dx = targetX - this.pos.x;
    const dy = targetY - this.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only move if outside deadzone
    if (distance > CAMERA_DEADZONE) {
      // Smooth camera movement using lerp
      this.pos.x += dx * this.smoothness;
      this.pos.y += dy * this.smoothness;
    }
  }

  // Convert world coordinates to screen coordinates
  worldToScreen(worldPos) {
    const screenX = (worldPos.x - this.pos.x) * this.zoom + this.viewport.width / 2 + this.shakeOffset.x;
    const screenY = (worldPos.y - this.pos.y) * this.zoom + this.viewport.height / 2 + this.shakeOffset.y;
    return new Vec(screenX, screenY);
  }

  // Convert screen coordinates to world coordinates
  screenToWorld(screenPos) {
    const worldX = (screenPos.x - this.viewport.width / 2) / this.zoom + this.pos.x;
    const worldY = (screenPos.y - this.viewport.height / 2) / this.zoom + this.pos.y;
    return new Vec(worldX, worldY);
  }

  // Get camera bounds in world coordinates
  getBounds() {
    const halfWidth = (this.viewport.width / 2) / this.zoom;
    const halfHeight = (this.viewport.height / 2) / this.zoom;

    return {
      left: this.pos.x - halfWidth,
      right: this.pos.x + halfWidth,
      top: this.pos.y - halfHeight,
      bottom: this.pos.y + halfHeight
    };
  }

  // Check if a point is visible
  isPointVisible(worldX, worldY) {
    const bounds = this.getBounds();
    return worldX >= bounds.left &&
           worldX <= bounds.right &&
           worldY >= bounds.top &&
           worldY <= bounds.bottom;
  }

  // Check if a rectangle is visible
  isRectVisible(x, y, width, height) {
    const bounds = this.getBounds();
    return !(x + width < bounds.left ||
             x > bounds.right ||
             y + height < bounds.top ||
             y > bounds.bottom);
  }

  // Snap to target immediately (no smoothing)
  snapToTarget() {
    if (this.target) {
      this.pos.x = this.target.pos.x;
      this.pos.y = this.target.pos.y;
    }
  }

  // Set zoom level
  setZoom(zoom) {
    this.zoom = Math.max(0.1, Math.min(10, zoom));
  }

  // Set camera position
  setPosition(x, y) {
    this.pos.set(x, y);
  }
}
