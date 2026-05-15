/**
 * Economy module - manages money, viewers, upgrades, and track progression
 */

class Economy {
  constructor() {
    this.money = 0;
    this.totalEarned = 0;
    this.viewers = 10;

    // Current track index (0, 1, 2)
    this.currentTrack = 0;
    this.unlockedTracks = [true, false, false];

    // Per-track upgrade states
    this.trackUpgrades = [this.createEmptyUpgrades(), this.createEmptyUpgrades(), this.createEmptyUpgrades()];

    // Manual lap completed for current track (required to unlock next)
    this.manualLapCompleted = [false, false, false];
  }

  createEmptyUpgrades() {
    const upgrades = {};
    const def = TRACK_DEFS[0].upgrades; // structure is the same across tracks
    for (const category of ['car', 'venue', 'racers']) {
      for (const u of def[category]) {
        upgrades[u.id] = { level: 0, maxLevel: u.oneTime ? 1 : u.maxLevel };
      }
    }
    return upgrades;
  }

  /**
   * Get upgrade definitions for current track
   */
  getUpgradeDefinitions() {
    return TRACK_DEFS[this.currentTrack].upgrades;
  }

  /**
   * Get current track upgrades
   */
  get upgrades() {
    return this.trackUpgrades[this.currentTrack];
  }

  /**
   * Get all upgrade definitions flattened
   */
  getAllDefinitions() {
    const defs = this.getUpgradeDefinitions();
    return [...defs.car, ...defs.venue, ...defs.racers];
  }

  /**
   * Get upgrades for a specific category
   */
  getCategoryUpgrades(category) {
    return this.getUpgradeDefinitions()[category] || [];
  }

  /**
   * Calculate current speed multiplier from car upgrades
   */
  getSpeedMultiplier() {
    let multiplier = 1.0;
    const defs = this.getUpgradeDefinitions().car;

    for (const def of defs) {
      if (def.speedBonus) {
        const level = this.upgrades[def.id].level;
        multiplier *= (1 + level * def.speedBonus);
      }
    }

    return multiplier;
  }

  /**
   * Calculate current total viewers
   */
  getTotalViewers() {
    let total = this.viewers;
    const defs = this.getUpgradeDefinitions().venue;

    for (const def of defs) {
      if (def.viewerBonus) {
        total += def.viewerBonus * this.upgrades[def.id].level;
      }
    }

    return total;
  }

  /**
   * Calculate pay multiplier per viewer
   */
  getPayMultiplier() {
    let multiplier = 1.0;
    const defs = this.getUpgradeDefinitions().venue;

    for (const def of defs) {
      if (def.payMult) {
        multiplier *= (1 + this.upgrades[def.id].level * def.payMult);
      }
    }

    // Racer bonuses
    const racerDefs = this.getUpgradeDefinitions().racers;
    for (const def of racerDefs) {
      if (this.upgrades[def.id].level > 0 && def.payMult) {
        multiplier *= def.payMult;
      }
    }

    return multiplier;
  }

  /**
   * Calculate earnings per lap
   */
  getEarningsPerLap(playerCar = null) {
    const viewers = this.getTotalViewers();
    const payMult = this.getPayMultiplier();
    const speedMult = this.getSpeedMultiplier();

    const basePay = 1 * (0.5 + speedMult * 0.5);

    let lapTimeBonus = 1.0;
    if (playerCar && playerCar.bestLapTime > 0) {
      const referenceTime = 5.0;
      lapTimeBonus = Math.max(0.5, Math.min(3.0, referenceTime / playerCar.bestLapTime));
    }

    return Math.floor(viewers * basePay * payMult * lapTimeBonus * 100) / 100;
  }

  /**
   * Calculate cost for next upgrade level
   */
  getUpgradeCost(id) {
    const defs = this.getAllDefinitions();
    const def = defs.find(d => d.id === id);
    if (!def) return Infinity;

    const upgrade = this.upgrades[id];
    if (upgrade.level >= upgrade.maxLevel) return Infinity;

    return Math.floor(def.baseCost * Math.pow(def.costMult, upgrade.level));
  }

  /**
   * Buy an upgrade
   */
  buyUpgrade(id) {
    const cost = this.getUpgradeCost(id);
    if (this.money < cost) return false;

    const upgrade = this.upgrades[id];
    if (upgrade.level >= upgrade.maxLevel) return false;

    this.money -= cost;
    upgrade.level++;

    return true;
  }

  /**
   * Add earnings
   */
  addEarnings(amount) {
    this.money += amount;
    this.totalEarned += amount;
  }

  /**
   * Get number of active rival racers
   */
  getActiveRacers() {
    let count = 0;
    for (let i = 1; i <= 5; i++) {
      if (this.upgrades[`racer${i}`].level > 0) {
        count = i;
      }
    }
    return count;
  }

  /**
   * Check if all upgrades are maxed for current track
   */
  allUpgradesMaxed() {
    const defs = this.getAllDefinitions();
    for (const def of defs) {
      if (this.upgrades[def.id].level < this.upgrades[def.id].maxLevel) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if next track can be unlocked
   */
  canUnlockNextTrack() {
    if (this.currentTrack >= 2) return false;
    return this.allUpgradesMaxed() && this.manualLapCompleted[this.currentTrack];
  }

  /**
   * Unlock next track
   */
  unlockNextTrack() {
    if (!this.canUnlockNextTrack()) return false;

    const nextTrack = this.currentTrack + 1;
    this.currentTrack = nextTrack;
    this.unlockedTracks[nextTrack] = true;
    this.viewers = 10; // Reset viewers for new track

    return true;
  }

  /**
   * Mark manual lap as completed for current track
   */
  completeManualLap() {
    this.manualLapCompleted[this.currentTrack] = true;
  }

  /**
   * Serialize state for saving
   */
  serialize() {
    return {
      money: this.money,
      totalEarned: this.totalEarned,
      viewers: this.viewers,
      currentTrack: this.currentTrack,
      unlockedTracks: [...this.unlockedTracks],
      trackUpgrades: this.trackUpgrades.map(u => JSON.parse(JSON.stringify(u))),
      manualLapCompleted: [...this.manualLapCompleted],
    };
  }

  /**
   * Deserialize state from save
   */
  deserialize(data) {
    this.money = data.money || 0;
    this.totalEarned = data.totalEarned || 0;
    this.viewers = data.viewers || 10;
    this.currentTrack = data.currentTrack || 0;
    this.unlockedTracks = data.unlockedTracks || [true, false, false];
    this.manualLapCompleted = data.manualLapCompleted || [false, false, false];

    if (data.trackUpgrades) {
      for (let t = 0; t < 3; t++) {
        if (data.trackUpgrades[t]) {
          for (const [id, value] of Object.entries(data.trackUpgrades[t])) {
            if (this.trackUpgrades[t][id]) {
              this.trackUpgrades[t][id].level = value.level || 0;
            }
          }
        }
      }
    }
  }
}
