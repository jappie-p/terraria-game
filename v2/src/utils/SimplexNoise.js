// Simplex Noise implementation for procedural generation
// Based on Stefan Gustavson's implementation

export class SimplexNoise {
  constructor(seed = Math.random()) {
    this.seed = seed;
    this.perm = this.buildPermutationTable(seed);
    this.permMod12 = new Uint8Array(512);
    for (let i = 0; i < 512; i++) {
      this.permMod12[i] = this.perm[i] % 12;
    }
  }

  // Build permutation table from seed
  buildPermutationTable(seed) {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      p[i] = i;
    }

    // Shuffle using seeded random
    let n, q;
    for (let i = 255; i > 0; i--) {
      seed = (seed * 16807) % 2147483647;
      n = seed % (i + 1);
      q = p[i];
      p[i] = p[n];
      p[n] = q;
    }

    // Extend to 512
    const perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) {
      perm[i] = p[i & 255];
    }
    return perm;
  }

  // 2D Simplex Noise
  noise2D(xin, yin) {
    const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
    const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);

    let n0, n1, n2;

    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);

    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;

    let i1, j1;
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } else {
      i1 = 0;
      j1 = 1;
    }

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1.0 + 2.0 * G2;
    const y2 = y0 - 1.0 + 2.0 * G2;

    const ii = i & 255;
    const jj = j & 255;
    const gi0 = this.permMod12[ii + this.perm[jj]];
    const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1]];
    const gi2 = this.permMod12[ii + 1 + this.perm[jj + 1]];

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 < 0) {
      n0 = 0.0;
    } else {
      t0 *= t0;
      n0 = t0 * t0 * this.dot2D(this.grad3[gi0], x0, y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 < 0) {
      n1 = 0.0;
    } else {
      t1 *= t1;
      n1 = t1 * t1 * this.dot2D(this.grad3[gi1], x1, y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 < 0) {
      n2 = 0.0;
    } else {
      t2 *= t2;
      n2 = t2 * t2 * this.dot2D(this.grad3[gi2], x2, y2);
    }

    return 70.0 * (n0 + n1 + n2);
  }

  // Dot product for 2D
  dot2D(g, x, y) {
    return g[0] * x + g[1] * y;
  }

  // Gradient vectors
  grad3 = [
    [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
    [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
    [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
  ];

  // Octave noise - multiple layers of noise for more detail
  octaveNoise2D(x, y, octaves = 4, persistence = 0.5, lacunarity = 2.0) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return total / maxValue;
  }

  // Utility: Get noise in 0-1 range
  noise2D01(x, y) {
    return (this.noise2D(x, y) + 1) / 2;
  }

  // Utility: Get octave noise in 0-1 range
  octaveNoise2D01(x, y, octaves = 4, persistence = 0.5, lacunarity = 2.0) {
    return (this.octaveNoise2D(x, y, octaves, persistence, lacunarity) + 1) / 2;
  }
}
