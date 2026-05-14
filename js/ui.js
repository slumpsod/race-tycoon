/**
 * UI module - manages the upgrade panel, stats, and interactions
 */

class UIManager {
  constructor(game) {
    this.game = game;
    this.currentTab = 'car';
    this.init();
  }

  init() {
    this.statsBar = document.getElementById('stats-bar');
    this.upgradesContainer = document.getElementById('upgrades-container');
    this.tabBar = document.getElementById('tab-bar');
    this.gameContainer = document.getElementById('game-container');
    
    // Bind tab clicks
    this.tabBar.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.switchTab(tab.dataset.tab);
      });
    });
    
    // Initial render
    this.switchTab('car');
  }

  /**
   * Switch to a different upgrade tab
   */
  switchTab(tabName) {
    this.currentTab = tabName;
    
    // Update tab styles
    this.tabBar.querySelectorAll('.tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Render upgrades for this tab
    this.renderUpgrades();
  }

  /**
   * Update stats display
   */
  updateStats() {
    const economy = this.game.economy;
    
    document.getElementById('stat-money').textContent = this.formatMoney(economy.money);
    document.getElementById('stat-viewers').textContent = economy.getTotalViewers();
    document.getElementById('stat-per-lap').textContent = this.formatMoney(economy.getEarningsPerLap());
    
    const playerCar = this.game.cars[0];
    if (playerCar && playerCar.lastLapTime > 0) {
      document.getElementById('stat-lap-time').textContent = playerCar.lastLapTime.toFixed(1) + 's';
    }
    
    // Update buy button states
    this.updateBuyButtons();
  }

  /**
   * Update buy button enabled/disabled states
   */
  updateBuyButtons() {
    const buttons = this.upgradesContainer.querySelectorAll('.upgrade-buy[data-id]');
    const economy = this.game.economy;
    
    buttons.forEach(btn => {
      const id = btn.dataset.id;
      const cost = economy.getUpgradeCost(id);
      const upgrade = economy.upgrades[id];
      const isMaxed = upgrade.level >= upgrade.maxLevel;
      
      if (!isMaxed) {
        btn.disabled = economy.money < cost;
        btn.textContent = this.formatMoney(cost);
      }
    });
  }

  /**
   * Render upgrade cards for current tab
   */
  renderUpgrades() {
    const upgrades = this.game.economy.getCategoryUpgrades(this.currentTab);
    const economy = this.game.economy;
    
    this.upgradesContainer.innerHTML = '';
    
    for (const def of upgrades) {
      const upgrade = economy.upgrades[def.id];
      const cost = economy.getUpgradeCost(def.id);
      const isMaxed = upgrade.level >= upgrade.maxLevel;
      const canAfford = economy.money >= cost;
      
      const card = document.createElement('div');
      card.className = 'upgrade-card' + (isMaxed ? ' maxed' : (!canAfford && !isMaxed ? ' locked' : ''));
      
      const levelText = def.oneTime
        ? (upgrade.level > 0 ? '✓ OWNED' : 'LOCKED')
        : `Lv. ${upgrade.level}/${upgrade.maxLevel}`;
      
      const effectText = def.effect(upgrade.level);
      
      card.innerHTML = `
        <div class="upgrade-icon">${def.icon}</div>
        <div class="upgrade-info">
          <div class="upgrade-name">${def.name}</div>
          <div class="upgrade-desc">${def.desc}</div>
          <div class="upgrade-level">${levelText} — ${effectText}</div>
        </div>
        <button class="upgrade-buy" ${(!canAfford || isMaxed) ? 'disabled' : ''} data-id="${def.id}">
          ${isMaxed ? 'MAX' : this.formatMoney(cost)}
        </button>
      `;
      
      // Bind buy button
      const buyBtn = card.querySelector('.upgrade-buy');
      buyBtn.addEventListener('click', () => {
        this.buyUpgrade(def.id);
      });
      
      this.upgradesContainer.appendChild(card);
    }
  }

  /**
   * Buy an upgrade
   */
  buyUpgrade(id) {
    const result = this.game.economy.buyUpgrade(id);
    
    if (result) {
      // Refresh UI
      this.updateStats();
      this.renderUpgrades();
      
      // Visual feedback
      this.showPurchaseEffect();
      
      // Update rival racers if needed
      if (id.startsWith('racer')) {
        this.game.updateRivalRacers();
      }
    }
  }

  /**
   * Show visual effect when purchasing
   */
  showPurchaseEffect() {
    const panel = document.getElementById('upgrade-panel');
    panel.style.borderColor = '#4ecca3';
    setTimeout(() => {
      panel.style.borderColor = '';
    }, 300);
  }

  /**
   * Show earnings popup on canvas
   */
  showEarningsPopup(amount, x, y) {
    const popup = document.createElement('div');
    popup.className = 'earnings-popup';
    popup.textContent = `+${this.formatMoney(amount)}`;
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
    
    this.gameContainer.appendChild(popup);
    
    setTimeout(() => {
      popup.remove();
    }, 1500);
  }

  /**
   * Show lap completion overlay
   */
  showLapOverlay() {
    let overlay = document.getElementById('lap-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'lap-overlay';
      this.gameContainer.appendChild(overlay);
    }
    
    overlay.textContent = `LAP ${this.game.totalLaps}`;
    overlay.classList.remove('show');
    void overlay.offsetWidth; // force reflow
    overlay.classList.add('show');
  }

  /**
   * Format money value
   */
  formatMoney(amount) {
    if (amount >= 1000000) {
      return '$' + (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
      return '$' + (amount / 1000).toFixed(1) + 'K';
    }
    return '$' + Math.floor(amount);
  }

  /**
   * Refresh all UI
   */
  refresh() {
    this.updateStats();
    this.renderUpgrades();
  }
}
