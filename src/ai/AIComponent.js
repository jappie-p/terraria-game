// AIComponent - Base AI component
export class AIComponent {
  constructor(entity) {
    this.entity = entity;
    this.target = null;
    this.state = 'IDLE';
    this.stateTimer = 0;
  }

  // Update AI (override in subclasses)
  update(dt, world, entities) {
    this.stateTimer += dt;
  }

  // Change state
  setState(newState) {
    if (this.state !== newState) {
      this.state = newState;
      this.stateTimer = 0;
    }
  }

  // Find nearest player
  findNearestPlayer(entities) {
    let nearest = null;
    let nearestDist = Infinity;

    for (const entity of entities) {
      if (entity.constructor.name === 'Player' && entity.alive) {
        const dist = this.entity.pos.distSq(entity.pos);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = entity;
        }
      }
    }

    return nearest;
  }

  // Move towards target
  moveToward(target, speed) {
    const dx = target.pos.x - this.entity.pos.x;
    const dy = target.pos.y - this.entity.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      // Only set horizontal velocity, let physics handle vertical
      const moveDirection = dx > 0 ? 1 : -1;
      this.entity.vel.x = moveDirection * speed;
      this.entity.facing = moveDirection;

      // Jump if there's a wall in front and entity is on ground
      if (this.entity.onGround && this.isWallAhead(moveDirection)) {
        this.entity.vel.y = -250; // Jump to get over obstacle
      }
    }
  }

  // Check if there's a wall ahead
  isWallAhead(direction) {
    // This will be used to detect obstacles
    // For now, return false - will implement proper obstacle detection later
    return false;
  }

  // Check if can see target (simple line of sight)
  canSeeTarget(target, maxDistance = 300) {
    if (!target) return false;

    const dist = this.entity.pos.dist(target.pos);
    return dist <= maxDistance;
  }
}
