// AudioManager - Handles game audio (sound effects and music)
// Uses Web Audio API for better control and lower latency

export class AudioManager {
  constructor() {
    this.context = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;

    this.sounds = new Map(); // Cached sound buffers
    this.currentMusic = null;
    this.musicSource = null;

    // Volume settings (0-1)
    this.masterVolume = 0.7;
    this.sfxVolume = 0.8;
    this.musicVolume = 0.5;

    this.initialized = false;
    this.muted = false;

    // Procedural sound generators
    this.generators = {};
  }

  // Initialize audio context (must be called after user interaction)
  async init() {
    if (this.initialized) return;

    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();

      // Create gain nodes
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.masterGain.gain.value = this.masterVolume;

      this.sfxGain = this.context.createGain();
      this.sfxGain.connect(this.masterGain);
      this.sfxGain.gain.value = this.sfxVolume;

      this.musicGain = this.context.createGain();
      this.musicGain.connect(this.masterGain);
      this.musicGain.gain.value = this.musicVolume;

      this.initialized = true;
      console.log('AudioManager initialized');

      // Generate procedural sounds
      this.generateProceduralSounds();
    } catch (e) {
      console.warn('Failed to initialize audio:', e);
    }
  }

  // Resume audio context if suspended
  async resume() {
    if (this.context && this.context.state === 'suspended') {
      await this.context.resume();
    }
  }

  // Generate procedural sound effects
  generateProceduralSounds() {
    // Hit sound - short noise burst
    this.sounds.set('hit', this.generateHitSound());
    this.sounds.set('hit_crit', this.generateHitSound(true));

    // Swing sound - whoosh
    this.sounds.set('swing', this.generateSwingSound());

    // Jump sound
    this.sounds.set('jump', this.generateJumpSound());

    // Land sound
    this.sounds.set('land', this.generateLandSound());

    // Block break
    this.sounds.set('break', this.generateBreakSound());

    // Block place
    this.sounds.set('place', this.generatePlaceSound());

    // Pickup sound
    this.sounds.set('pickup', this.generatePickupSound());

    // Hurt sound
    this.sounds.set('hurt', this.generateHurtSound());

    // Enemy death
    this.sounds.set('enemy_death', this.generateEnemyDeathSound());

    // Slime sounds
    this.sounds.set('slime', this.generateSlimeSound());

    console.log('Procedural sounds generated');
  }

  // Generate a hit sound effect
  generateHitSound(isCrit = false) {
    const duration = isCrit ? 0.15 : 0.1;
    const sampleRate = this.context.sampleRate;
    const length = duration * sampleRate;
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // Noise burst with envelope
      const envelope = Math.exp(-t * 30);
      const noise = (Math.random() * 2 - 1) * envelope;
      // Add some tone for crit
      const tone = isCrit ? Math.sin(t * 800 * Math.PI * 2) * envelope * 0.3 : 0;
      data[i] = (noise * 0.6 + tone) * 0.5;
    }

    return buffer;
  }

  // Generate swing/whoosh sound
  generateSwingSound() {
    const duration = 0.15;
    const sampleRate = this.context.sampleRate;
    const length = duration * sampleRate;
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // Filtered noise sweep
      const envelope = Math.sin(t / duration * Math.PI);
      const freq = 200 + t * 2000; // Rising frequency
      const noise = Math.random() * 2 - 1;
      data[i] = noise * envelope * 0.15 * Math.sin(freq * t);
    }

    return buffer;
  }

  // Generate jump sound
  generateJumpSound() {
    const duration = 0.1;
    const sampleRate = this.context.sampleRate;
    const length = duration * sampleRate;
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // Rising tone
      const freq = 200 + (t / duration) * 400;
      const envelope = 1 - t / duration;
      data[i] = Math.sin(freq * t * Math.PI * 2) * envelope * 0.2;
    }

    return buffer;
  }

  // Generate land sound
  generateLandSound() {
    const duration = 0.08;
    const sampleRate = this.context.sampleRate;
    const length = duration * sampleRate;
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // Thud - low frequency burst
      const envelope = Math.exp(-t * 40);
      const tone = Math.sin(t * 100 * Math.PI * 2);
      const noise = (Math.random() * 2 - 1) * 0.3;
      data[i] = (tone + noise) * envelope * 0.4;
    }

    return buffer;
  }

  // Generate block break sound
  generateBreakSound() {
    const duration = 0.2;
    const sampleRate = this.context.sampleRate;
    const length = duration * sampleRate;
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // Crunchy noise
      const envelope = Math.exp(-t * 15);
      const noise = Math.random() * 2 - 1;
      // Add some low crunch
      const crunch = Math.sin(t * 150 * Math.PI * 2) * 0.5;
      data[i] = (noise + crunch) * envelope * 0.3;
    }

    return buffer;
  }

  // Generate block place sound
  generatePlaceSound() {
    const duration = 0.1;
    const sampleRate = this.context.sampleRate;
    const length = duration * sampleRate;
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // Soft thunk
      const envelope = Math.exp(-t * 30);
      const tone = Math.sin(t * 200 * Math.PI * 2);
      data[i] = tone * envelope * 0.25;
    }

    return buffer;
  }

  // Generate pickup sound
  generatePickupSound() {
    const duration = 0.15;
    const sampleRate = this.context.sampleRate;
    const length = duration * sampleRate;
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // Pleasant ascending tone
      const freq = 600 + (t / duration) * 800;
      const envelope = Math.sin(t / duration * Math.PI);
      data[i] = Math.sin(freq * t * Math.PI * 2) * envelope * 0.15;
    }

    return buffer;
  }

  // Generate hurt sound
  generateHurtSound() {
    const duration = 0.2;
    const sampleRate = this.context.sampleRate;
    const length = duration * sampleRate;
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // Descending tone with noise
      const freq = 400 - (t / duration) * 200;
      const envelope = Math.exp(-t * 10);
      const tone = Math.sin(freq * t * Math.PI * 2);
      const noise = (Math.random() * 2 - 1) * 0.2;
      data[i] = (tone + noise) * envelope * 0.3;
    }

    return buffer;
  }

  // Generate enemy death sound
  generateEnemyDeathSound() {
    const duration = 0.3;
    const sampleRate = this.context.sampleRate;
    const length = duration * sampleRate;
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // Death squeal - descending with noise
      const freq = 500 - (t / duration) * 400;
      const envelope = Math.exp(-t * 8);
      const tone = Math.sin(freq * t * Math.PI * 2);
      const noise = (Math.random() * 2 - 1) * 0.4;
      data[i] = (tone * 0.6 + noise) * envelope * 0.25;
    }

    return buffer;
  }

  // Generate slime sound
  generateSlimeSound() {
    const duration = 0.15;
    const sampleRate = this.context.sampleRate;
    const length = duration * sampleRate;
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // Squelchy sound
      const freq = 100 + Math.sin(t * 30) * 50;
      const envelope = Math.sin(t / duration * Math.PI);
      const tone = Math.sin(freq * t * Math.PI * 2);
      data[i] = tone * envelope * 0.2;
    }

    return buffer;
  }

  // Play a sound effect
  play(soundName, volume = 1, pitch = 1) {
    if (!this.initialized || this.muted) return;

    const buffer = this.sounds.get(soundName);
    if (!buffer) {
      console.warn(`Sound not found: ${soundName}`);
      return;
    }

    try {
      const source = this.context.createBufferSource();
      source.buffer = buffer;
      source.playbackRate.value = pitch;

      const gainNode = this.context.createGain();
      gainNode.gain.value = volume;

      source.connect(gainNode);
      gainNode.connect(this.sfxGain);
      source.start();
    } catch (e) {
      console.warn('Failed to play sound:', e);
    }
  }

  // Play sound at a position (for spatial audio - simplified)
  playAt(soundName, x, y, listenerX, listenerY, maxDistance = 500) {
    const dx = x - listenerX;
    const dy = y - listenerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > maxDistance) return;

    // Volume based on distance
    const volume = 1 - (distance / maxDistance);
    // Slight pitch variation based on position
    const pitch = 0.95 + Math.random() * 0.1;

    this.play(soundName, volume * volume, pitch);
  }

  // Set master volume
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.masterVolume;
    }
  }

  // Set SFX volume
  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.sfxGain) {
      this.sfxGain.gain.value = this.sfxVolume;
    }
  }

  // Set music volume
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicGain) {
      this.musicGain.gain.value = this.musicVolume;
    }
  }

  // Toggle mute
  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : this.masterVolume;
    }
    return this.muted;
  }
}

// Singleton instance
export const audioManager = new AudioManager();
