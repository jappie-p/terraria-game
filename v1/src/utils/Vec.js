// 2D Vector class with utility methods
export class Vec {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  // Create a copy of this vector
  clone() {
    return new Vec(this.x, this.y);
  }

  // Add another vector to this one
  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  // Subtract another vector from this one
  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  // Multiply by scalar or vector
  multiply(n) {
    if (typeof n === 'number') {
      this.x *= n;
      this.y *= n;
    } else {
      this.x *= n.x;
      this.y *= n.y;
    }
    return this;
  }

  // Divide by scalar
  divide(n) {
    this.x /= n;
    this.y /= n;
    return this;
  }

  // Get the length (magnitude) of the vector
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  // Get squared length (faster, no sqrt)
  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }

  // Normalize the vector (make it length 1)
  normalize() {
    const len = this.length();
    if (len > 0) {
      this.divide(len);
    }
    return this;
  }

  // Set the length of the vector
  setLength(len) {
    this.normalize();
    this.multiply(len);
    return this;
  }

  // Distance to another vector
  dist(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Squared distance (faster, no sqrt)
  distSq(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return dx * dx + dy * dy;
  }

  // Dot product
  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  // Set x and y values
  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  // Limit the magnitude
  limit(max) {
    const lenSq = this.lengthSq();
    if (lenSq > max * max) {
      this.setLength(max);
    }
    return this;
  }

  // Linear interpolation to another vector
  lerp(v, amt) {
    this.x += (v.x - this.x) * amt;
    this.y += (v.y - this.y) * amt;
    return this;
  }

  // Static methods for creating new vectors without modifying originals

  static add(v1, v2) {
    return new Vec(v1.x + v2.x, v1.y + v2.y);
  }

  static sub(v1, v2) {
    return new Vec(v1.x - v2.x, v1.y - v2.y);
  }

  static multiply(v, n) {
    if (typeof n === 'number') {
      return new Vec(v.x * n, v.y * n);
    } else {
      return new Vec(v.x * n.x, v.y * n.y);
    }
  }

  static dist(v1, v2) {
    return v1.dist(v2);
  }

  static dot(v1, v2) {
    return v1.dot(v2);
  }

  // Create vector from angle
  static fromAngle(angle, length = 1) {
    return new Vec(Math.cos(angle) * length, Math.sin(angle) * length);
  }

  // Get angle of vector
  angle() {
    return Math.atan2(this.y, this.x);
  }

  // Rotate vector by angle
  rotate(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = this.x * cos - this.y * sin;
    const y = this.x * sin + this.y * cos;
    this.x = x;
    this.y = y;
    return this;
  }
}
