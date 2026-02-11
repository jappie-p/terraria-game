// SaveManager - Handles saving and loading game state
export class SaveManager {
  constructor() {
    this.storageKey = 'terraria_game_save';
    this.autoSaveInterval = 120; // Auto-save every 2 minutes
    this.lastAutoSave = 0;
  }

  // Save game data to localStorage
  save(saveData) {
    try {
      const serialized = JSON.stringify(saveData);
      localStorage.setItem(this.storageKey, serialized);
      console.log('Game saved successfully!');
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }

  // Load game data from localStorage
  load() {
    try {
      const serialized = localStorage.getItem(this.storageKey);
      if (!serialized) {
        console.log('No save data found');
        return null;
      }

      const saveData = JSON.parse(serialized);
      console.log('Game loaded successfully!');
      return saveData;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  // Check if save data exists
  hasSave() {
    return localStorage.getItem(this.storageKey) !== null;
  }

  // Delete save data
  deleteSave() {
    try {
      localStorage.removeItem(this.storageKey);
      console.log('Save data deleted');
      return true;
    } catch (error) {
      console.error('Failed to delete save:', error);
      return false;
    }
  }

  // Get save metadata without loading full save
  getSaveMetadata() {
    try {
      const serialized = localStorage.getItem(this.storageKey);
      if (!serialized) return null;

      const saveData = JSON.parse(serialized);
      return {
        timestamp: saveData.timestamp,
        playtime: saveData.playtime,
        seed: saveData.seed,
        playerHealth: saveData.player?.health
      };
    } catch (error) {
      console.error('Failed to get save metadata:', error);
      return null;
    }
  }

  // Check if auto-save should trigger
  shouldAutoSave(dt) {
    this.lastAutoSave += dt;
    if (this.lastAutoSave >= this.autoSaveInterval) {
      this.lastAutoSave = 0;
      return true;
    }
    return false;
  }
}
