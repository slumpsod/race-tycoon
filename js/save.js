/**
 * Save/Load module - persists game state to localStorage
 */

class SaveManager {
  constructor() {
    this.saveKey = 'race-tycoon-save-v2';
    this.autoSaveInterval = 30000;
    this.lastSaveTime = 0;
  }

  /**
   * Save game state
   */
  save(game) {
    const data = {
      version: 3,
      timestamp: Date.now(),
      economy: game.economy.serialize(),
      cars: game.cars.map(car => ({
        name: car.name,
        color: car.color,
        distance: car.distance,
        speed: car.speed,
        shape: car.shape,
        laps: car.laps,
        bestLapTime: car.bestLapTime,
        mode: car.mode,
      })),
      stats: {
        totalLaps: game.totalLaps,
        playTime: game.playTime,
      },
    };

    try {
      localStorage.setItem(this.saveKey, JSON.stringify(data));
      this.lastSaveTime = Date.now();
      return true;
    } catch (e) {
      console.warn('Failed to save game:', e);
      return false;
    }
  }

  /**
   * Load game state
   */
  load() {
    try {
      const raw = localStorage.getItem(this.saveKey);
      if (!raw) return null;

      const data = JSON.parse(raw);
      const now = Date.now();
      const elapsed = (now - data.timestamp) / 1000;

      return {
        data,
        offlineSeconds: Math.min(elapsed, 86400),
      };
    } catch (e) {
      console.warn('Failed to load save:', e);
      return null;
    }
  }

  /**
   * Apply loaded save to game
   */
  applySave(game, saveData) {
    if (!saveData || !saveData.data) return 0;

    const data = saveData.data;

    // Restore economy
    if (data.economy) {
      game.economy.deserialize(data.economy);
    }

    // Switch to saved track
    game.switchToTrack(game.economy.currentTrack);

    // Restore cars
    if (data.cars && data.cars.length > 0) {
      for (let i = 0; i < Math.min(data.cars.length, game.cars.length); i++) {
        const savedCar = data.cars[i];
        const car = game.cars[i];
        if (car && savedCar) {
          car.distance = savedCar.distance || 0;
          car.speed = savedCar.speed || 1.0;
          car.laps = savedCar.laps || 0;
          car.bestLapTime = savedCar.bestLapTime || 0;
          car.mode = savedCar.mode || 'auto';
          car._previousLaps = Math.floor(car.distance / game.track.length);
        }
      }
    }

    // Restore stats
    if (data.stats) {
      game.totalLaps = data.stats.totalLaps || 0;
      game.playTime = data.stats.playTime || 0;
    }

    // Calculate offline earnings
    if (saveData.offlineSeconds > 10) {
      return this.calculateOfflineEarnings(game, saveData.offlineSeconds);
    }

    return 0;
  }

  /**
   * Calculate earnings while player was away
   */
  calculateOfflineEarnings(game, seconds) {
    const earningsPerLap = game.economy.getEarningsPerLap();
    const speedMult = game.economy.getSpeedMultiplier();
    const playerCar = game.cars[0];

    if (!playerCar || earningsPerLap <= 0) return 0;

    const lapTime = game.track.length / (playerCar.speed * speedMult * 120);
    const lapsCompleted = Math.floor(seconds / lapTime);

    const offlineRate = 0.5;
    const earnings = Math.floor(lapsCompleted * earningsPerLap * offlineRate);

    game.economy.addEarnings(earnings);
    return earnings;
  }

  /**
   * Clear save data
   */
  clear() {
    localStorage.removeItem(this.saveKey);
  }

  /**
   * Check if save exists
   */
  hasSave() {
    return localStorage.getItem(this.saveKey) !== null;
  }
}
