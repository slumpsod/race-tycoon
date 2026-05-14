/**
 * Economy module - manages money, viewers, upgrades, and income
 */

class Economy {
  constructor() {
    this.money = 0;
    this.totalEarned = 0;
    this.viewers = 10; // starting viewers
    
    // Upgrade levels
    this.upgrades = {
      // Car upgrades (improve speed)
      tires: { level: 0, maxLevel: 10 },
      engine: { level: 0, maxLevel: 10 },
      turbo: { level: 0, maxLevel: 5 },
      nitrous: { level: 0, maxLevel: 5 },
      rebuild: { level: 0, maxLevel: 3 },
      
      // Venue upgrades (more viewers / higher pay)
      seats: { level: 0, maxLevel: 10 },
      comfySeats: { level: 0, maxLevel: 5 },
      premiumSeats: { level: 0, maxLevel: 5 },
      vipLounge: { level: 0, maxLevel: 3 },
      liveStream: { level: 0, maxLevel: 3 },
      
      // Racer upgrades (more competition = more pay)
      racer1: { level: 0, maxLevel: 1 },
      racer2: { level: 0, maxLevel: 1 },
      racer3: { level: 0, maxLevel: 1 },
      racer4: { level: 0, maxLevel: 1 },
      racer5: { level: 0, maxLevel: 1 },
    };
  }

  /**
   * Get the list of all upgrade definitions
   */
  getUpgradeDefinitions() {
    return {
      car: [
        {
          id: 'tires',
          name: 'Better Tires',
          icon: '🛞',
          desc: 'Improve grip and speed',
          baseCost: 10,
          costMultiplier: 1.5,
          effect: (level) => `+${level * 5}% speed`,
          speedBonus: (level) => 1 + level * 0.05,
        },
        {
          id: 'engine',
          name: 'Engine Tune',
          icon: '⚙️',
          desc: 'Optimize engine performance',
          baseCost: 50,
          costMultiplier: 1.6,
          effect: (level) => `+${level * 8}% speed`,
          speedBonus: (level) => 1 + level * 0.08,
        },
        {
          id: 'turbo',
          name: 'Turbocharger',
          icon: '💨',
          desc: 'Force induction for more power',
          baseCost: 250,
          costMultiplier: 1.8,
          effect: (level) => `+${level * 15}% speed`,
          speedBonus: (level) => 1 + level * 0.15,
        },
        {
          id: 'nitrous',
          name: 'Nitrous System',
          icon: '🔥',
          desc: 'Nitrous oxide injection',
          baseCost: 1000,
          costMultiplier: 2.0,
          effect: (level) => `+${level * 20}% speed`,
          speedBonus: (level) => 1 + level * 0.20,
        },
        {
          id: 'rebuild',
          name: 'Full Rebuild',
          icon: '🏆',
          desc: 'Complete engine overhaul',
          baseCost: 5000,
          costMultiplier: 2.5,
          effect: (level) => `+${level * 30}% speed`,
          speedBonus: (level) => 1 + level * 0.30,
        },
      ],
      venue: [
        {
          id: 'seats',
          name: 'More Seats',
          icon: '💺',
          desc: 'Expand the grandstand capacity',
          baseCost: 15,
          costMultiplier: 1.4,
          effect: (level) => `+${level * 10} viewers`,
          viewerBonus: (level) => level * 10,
        },
        {
          id: 'comfySeats',
          name: 'Comfortable Seats',
          icon: '🛋️',
          desc: 'Viewers pay more for comfort',
          baseCost: 75,
          costMultiplier: 1.6,
          effect: (level) => `+${level * 15}% pay/viewer`,
          payMultiplier: (level) => 1 + level * 0.15,
        },
        {
          id: 'premiumSeats',
          name: 'Premium Seats',
          icon: '✨',
          desc: 'Luxury seating experience',
          baseCost: 350,
          costMultiplier: 1.8,
          effect: (level) => `+${level * 25}% pay/viewer`,
          payMultiplier: (level) => 1 + level * 0.25,
        },
        {
          id: 'vipLounge',
          name: 'VIP Lounge',
          icon: '🥂',
          desc: 'Exclusive VIP viewing area',
          baseCost: 1500,
          costMultiplier: 2.0,
          effect: (level) => `+${level * 50}% pay/viewer`,
          payMultiplier: (level) => 1 + level * 0.50,
        },
        {
          id: 'liveStream',
          name: 'Live Stream',
          icon: '📡',
          desc: 'Broadcast to online audience',
          baseCost: 5000,
          costMultiplier: 2.2,
          effect: (level) => `+${level * 30} viewers, +${level * 10}% pay`,
          viewerBonus: (level) => level * 30,
          payMultiplier: (level) => 1 + level * 0.10,
        },
      ],
      racers: [
        {
          id: 'racer1',
          name: 'Local Hobbyist',
          icon: '🚗',
          desc: 'A weekend warrior joins the track',
          baseCost: 100,
          costMultiplier: 1,
          effect: () => '+15% pay',
          payMultiplier: () => 1.15,
          oneTime: true,
        },
        {
          id: 'racer2',
          name: 'Club Racer',
          icon: '🏎️',
          desc: 'A local club driver competes',
          baseCost: 500,
          costMultiplier: 1,
          effect: () => '+30% pay',
          payMultiplier: () => 1.30,
          oneTime: true,
        },
        {
          id: 'racer3',
          name: 'Pro Driver',
          icon: '🏁',
          desc: 'A professional joins the race',
          baseCost: 2500,
          costMultiplier: 1,
          effect: () => '+50% pay',
          payMultiplier: () => 1.50,
          oneTime: true,
        },
        {
          id: 'racer4',
          name: 'Celebrity Racer',
          icon: '⭐',
          desc: 'A famous driver draws crowds',
          baseCost: 10000,
          costMultiplier: 1,
          effect: () => '+100% pay',
          payMultiplier: () => 2.0,
          oneTime: true,
        },
        {
          id: 'racer5',
          name: 'Rival Team',
          icon: '🏢',
          desc: 'A full racing team challenges you',
          baseCost: 50000,
          costMultiplier: 1,
          effect: () => '+200% pay',
          payMultiplier: () => 3.0,
          oneTime: true,
        },
      ],
    };
  }

  /**
   * Calculate current speed multiplier from car upgrades
   */
  getSpeedMultiplier() {
    let multiplier = 1.0;
    const defs = this.getUpgradeDefinitions().car;
    
    for (const def of defs) {
      if (def.speedBonus) {
        multiplier *= def.speedBonus(this.upgrades[def.id].level);
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
        total += def.viewerBonus(this.upgrades[def.id].level);
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
      if (def.payMultiplier) {
        multiplier *= def.payMultiplier(this.upgrades[def.id].level);
      }
    }
    
    // Racer bonuses
    const racerDefs = this.getUpgradeDefinitions().racers;
    for (const def of racerDefs) {
      if (this.upgrades[def.id].level > 0 && def.payMultiplier) {
        multiplier *= def.payMultiplier();
      }
    }
    
    return multiplier;
  }

  /**
   * Calculate earnings per lap
   */
  getEarningsPerLap() {
    const viewers = this.getTotalViewers();
    const payMult = this.getPayMultiplier();
    const speedMult = this.getSpeedMultiplier();
    
    // Base pay scales with speed (faster = more exciting = more pay)
    const basePay = 1 * (0.5 + speedMult * 0.5);
    
    return Math.floor(viewers * basePay * payMult * 10) / 10;
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
    
    return Math.floor(def.baseCost * Math.pow(def.costMultiplier, upgrade.level));
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
    const defs = this.getUpgradeDefinitions();
    return defs[category] || [];
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
   * Serialize state for saving
   */
  serialize() {
    return {
      money: this.money,
      totalEarned: this.totalEarned,
      viewers: this.viewers,
      upgrades: JSON.parse(JSON.stringify(this.upgrades)),
    };
  }

  /**
   * Deserialize state from save
   */
  deserialize(data) {
    this.money = data.money || 0;
    this.totalEarned = data.totalEarned || 0;
    this.viewers = data.viewers || 10;
    
    if (data.upgrades) {
      for (const [id, value] of Object.entries(data.upgrades)) {
        if (this.upgrades[id]) {
          this.upgrades[id].level = value.level || 0;
        }
      }
    }
  }
}
