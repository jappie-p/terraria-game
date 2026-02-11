// SaveManager - Handles saving and loading game state with multiple save slots
export class SaveManager {
  constructor() {
    this.storageKeyIndex = 'terraria_save_index';
    this.storageKeyPrefix = 'terraria_save_';
    this.autoSaveInterval = 120; // Auto-save every 2 minutes
    this.lastAutoSave = 0;
    this.currentSaveId = null; // Currently loaded save slot
  }

  // Generate unique save ID
  generateSaveId() {
    return 'save_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get list of all saves
  getAllSaves() {
    try {
      const indexJson = localStorage.getItem(this.storageKeyIndex);
      if (!indexJson) return [];
      return JSON.parse(indexJson);
    } catch (error) {
      console.error('Failed to get save index:', error);
      return [];
    }
  }

  // Update save index
  updateSaveIndex(saves) {
    try {
      localStorage.setItem(this.storageKeyIndex, JSON.stringify(saves));
      return true;
    } catch (error) {
      console.error('Failed to update save index:', error);
      return false;
    }
  }

  // Create a new save slot
  createSave(name, saveData) {
    try {
      const saveId = this.generateSaveId();
      const saves = this.getAllSaves();

      // Add metadata to index
      const metadata = {
        id: saveId,
        name: name,
        timestamp: Date.now(),
        playtime: saveData.playtime || 0,
        seed: saveData.seed
      };

      saves.push(metadata);
      this.updateSaveIndex(saves);

      // Save the actual data
      const serialized = JSON.stringify(saveData);
      localStorage.setItem(this.storageKeyPrefix + saveId, serialized);

      this.currentSaveId = saveId;
      console.log(`Game saved as "${name}"!`);
      return saveId;
    } catch (error) {
      console.error('Failed to create save:', error);
      return null;
    }
  }

  // Save to current slot (or create new if none)
  save(saveData, name = null) {
    try {
      if (!this.currentSaveId) {
        // No current save, create a new one
        const saveName = name || 'World ' + (this.getAllSaves().length + 1);
        return this.createSave(saveName, saveData);
      }

      // Update existing save
      const saves = this.getAllSaves();
      const saveIndex = saves.findIndex(s => s.id === this.currentSaveId);

      if (saveIndex === -1) {
        // Save was deleted, create new one
        const saveName = name || 'World ' + (saves.length + 1);
        return this.createSave(saveName, saveData);
      }

      // Update metadata
      saves[saveIndex].timestamp = Date.now();
      saves[saveIndex].playtime = saveData.playtime || 0;
      if (name) saves[saveIndex].name = name;
      this.updateSaveIndex(saves);

      // Update save data
      const serialized = JSON.stringify(saveData);
      localStorage.setItem(this.storageKeyPrefix + this.currentSaveId, serialized);

      this.lastAutoSave = 0;
      console.log('Game saved!');
      return this.currentSaveId;
    } catch (error) {
      console.error('Failed to save game:', error);
      return null;
    }
  }

  // Load a specific save by ID
  loadSave(saveId) {
    try {
      const serialized = localStorage.getItem(this.storageKeyPrefix + saveId);
      if (!serialized) {
        console.log('Save not found:', saveId);
        return null;
      }

      const saveData = JSON.parse(serialized);
      this.currentSaveId = saveId;
      console.log('Game loaded!');
      return saveData;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  // Load the most recent save (for backwards compatibility)
  load() {
    const saves = this.getAllSaves();
    if (saves.length === 0) {
      // Try legacy save format
      return this.loadLegacySave();
    }

    // Sort by timestamp, most recent first
    saves.sort((a, b) => b.timestamp - a.timestamp);
    return this.loadSave(saves[0].id);
  }

  // Load old single-save format for backwards compatibility
  loadLegacySave() {
    try {
      const serialized = localStorage.getItem('terraria_game_save');
      if (!serialized) return null;

      const saveData = JSON.parse(serialized);

      // Migrate to new format
      console.log('Migrating legacy save...');
      const saveId = this.createSave('Legacy World', saveData);

      // Remove old save
      localStorage.removeItem('terraria_game_save');

      return saveData;
    } catch (error) {
      return null;
    }
  }

  // Check if any saves exist
  hasSave() {
    const saves = this.getAllSaves();
    if (saves.length > 0) return true;

    // Check for legacy save
    return localStorage.getItem('terraria_game_save') !== null;
  }

  // Delete a specific save
  deleteSave(saveId) {
    try {
      const saves = this.getAllSaves();
      const newSaves = saves.filter(s => s.id !== saveId);
      this.updateSaveIndex(newSaves);
      localStorage.removeItem(this.storageKeyPrefix + saveId);

      if (this.currentSaveId === saveId) {
        this.currentSaveId = null;
      }

      console.log('Save deleted');
      return true;
    } catch (error) {
      console.error('Failed to delete save:', error);
      return false;
    }
  }

  // Rename a save
  renameSave(saveId, newName) {
    try {
      const saves = this.getAllSaves();
      const save = saves.find(s => s.id === saveId);
      if (save) {
        save.name = newName;
        this.updateSaveIndex(saves);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to rename save:', error);
      return false;
    }
  }

  // Get metadata for a specific save
  getSaveMetadata(saveId) {
    const saves = this.getAllSaves();
    return saves.find(s => s.id === saveId) || null;
  }

  // Get current save name
  getCurrentSaveName() {
    if (!this.currentSaveId) return null;
    const metadata = this.getSaveMetadata(this.currentSaveId);
    return metadata ? metadata.name : null;
  }

  // Set current save ID (when loading from menu)
  setCurrentSave(saveId) {
    this.currentSaveId = saveId;
  }

  // Clear current save (when returning to menu)
  clearCurrentSave() {
    this.currentSaveId = null;
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

  // Format playtime for display
  static formatPlaytime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  // Format timestamp for display
  static formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
