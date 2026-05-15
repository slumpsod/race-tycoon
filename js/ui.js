/**
 * UI module - manages the upgrade panel, stats, track switching, and interactions
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

    // Bind mode toggle
    const modeBtn = document.getElementById('mode-toggle');
    if (modeBtn) {
      modeBtn.addEventListener('click', () => {
        this.toggleMode();
      });
    }

    // Bind track unlock button
    const unlockBtn = document.getElementById('unlock-track-btn');
    if (unlockBtn) {
      unlockBtn.addEventListener('click', () => {
        this.game.unlockNextTrack();
      });
    }

    // Initial render
    this.switchTab('car');
  }

  /**
   * Switch to a different upgrade tab
   */
  switchTab(tabName) {
    this.currentTab = tabName;

    this.tabBar.querySelectorAll('.tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    this.renderUpgrades();
  }

  /**
   * Update stats display
   */
  updateStats() {
    const economy = this.game.economy;
    const playerCar = this.game.cars[0];
    const trackDef = TRACK_DEFS[economy.currentTrack];

    document.getElementById('stat-money').textContent = this.formatMoney(economy.money);
    document.getElementById('stat-viewers').textContent = economy.getTotalViewers();
    document.getElementById('stat-per-lap').textContent = this.formatMoney(economy.getEarningsPerLap(playerCar));

    if (playerCar) {
      if (playerCar.lastLapTime > 0) {
        document.getElementById('stat-lap-time').textContent = playerCar.lastLapTime.toFixed(1) + 's';
      }
      if (playerCar.bestLapTime > 0) {
        document.getElementById('stat-best-time').textContent = playerCar.bestLapTime.toFixed(1) + 's';
        document.getElementById('stat-best-time').style.color = '#f9ed69';
      }
    }

    // Update mode toggle button
    const modeBtn = document.getElementById('mode-toggle');
    if (modeBtn && playerCar) {
      modeBtn.textContent = playerCar.mode === 'auto' ? '🏎️ Drive' : '🤖 Auto';
      modeBtn.classList.toggle('active', playerCar.mode === 'manual');
    }

    // Update track info
    const trackLabel = document.getElementById('stat-track');
    if (trackLabel) {
      trackLabel.textContent = `T${economy.currentTrack + 1}`;
      trackLabel.title = trackDef.name;
    }

    // Update unlock button
    this.updateUnlockButton();

    // Update buy button states
    this.updateBuyButtons();
  }

  /**
   * Update unlock button state
   */
  updateUnlockButton() {
    const unlockBtn = document.getElementById('unlock-track-btn');
    if (!unlockBtn) return;

    const canUnlock = this.game.economy.canUnlockNextTrack();
    const allMaxed = this.game.economy.allUpgradesMaxed();
    const lapCompleted = this.game.economy.manualLapCompleted[this.game.economy.currentTrack];

    unlockBtn.style.display = canUnlock ? 'block' : 'none';

    if (canUnlock) {
      unlockBtn.textContent = `🏁 Unlock ${TRACK_DEFS[this.game.economy.currentTrack + 1].name}`;
      unlockBtn.disabled = false;
    } else if (allMaxed && !lapCompleted) {
      unlockBtn.style.display = 'block';
      unlockBtn.textContent = 'Complete 1 manual lap to unlock';
      unlockBtn.disabled = true;
    }
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

      let effectText = '';
      if (def.speedBonus) {
        effectText = `+${upgrade.level * Math.round(def.speedBonus * 100)}% speed`;
      } else if (def.viewerBonus) {
        effectText = `+${upgrade.level * def.viewerBonus} viewers`;
      } else if (def.payMult) {
        effectText = `+${upgrade.level * Math.round(def.payMult * 100)}% pay`;
      } else if (def.oneTime && def.payMult) {
        effectText = upgrade.level > 0 ? `+${Math.round((def.payMult - 1) * 100)}% pay` : `+${Math.round((def.payMult - 1) * 100)}% pay`;
      }

      card.innerHTML = `
        <div class="upgrade-icon">${def.icon}</div>
        <div class="upgrade-info">
          <div class="upgrade-name">${def.name}</div>
          <div class="upgrade-desc">${def.desc}</div>
          <div class="upgrade-level">${levelText}${effectText ? ' — ' + effectText : ''}</div>
        </div>
        <button class="upgrade-buy" ${(!canAfford || isMaxed) ? 'disabled' : ''} data-id="${def.id}">
          ${isMaxed ? 'MAX' : this.formatMoney(cost)}
        </button>
      `;

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
      this.updateStats();
      this.renderUpgrades();
      this.showPurchaseEffect();

      if (id.startsWith('racer')) {
        this.game.updateRivalRacers();
      }

      // Check if all upgrades are now maxed
      if (this.game.economy.allUpgradesMaxed()) {
        this.showNotification('🎉 All upgrades maxed! Complete a manual lap to unlock the next track!');
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
  showLapOverlay(lapTime, bestTime, lapNum) {
    let overlay = document.getElementById('lap-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'lap-overlay';
      this.gameContainer.appendChild(overlay);
    }

    let text = `LAP ${lapNum}`;
    if (lapTime > 0) {
      text += `\n${lapTime.toFixed(2)}s`;
    }
    if (bestTime > 0 && lapTime <= bestTime + 0.01) {
      text += '\n🏆 NEW BEST!';
    }

    overlay.textContent = text;
    overlay.classList.remove('show');
    void overlay.offsetWidth;
    overlay.classList.add('show');
  }

  /**
   * Show notification toast
   */
  showNotification(text) {
    let notif = document.getElementById('notification');
    if (!notif) {
      notif = document.createElement('div');
      notif.id = 'notification';
      this.gameContainer.appendChild(notif);
    }

    notif.textContent = text;
    notif.classList.remove('show');
    void notif.offsetWidth;
    notif.classList.add('show');

    setTimeout(() => {
      notif.classList.remove('show');
    }, 3000);
  }

  /**
   * Show track unlock prompt
   */
  showTrackUnlockPrompt() {
    this.updateUnlockButton();
  }

  /**
   * Format money value
   */
  formatMoney(amount) {
    if (amount >= 1000000000) {
      return '$' + (amount / 1000000000).toFixed(1) + 'B';
    } else if (amount >= 1000000) {
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

  /**
   * Toggle driving mode between auto and manual
   */
  toggleMode() {
    const playerCar = this.game.cars[0];
    if (!playerCar) return;

    if (playerCar.mode === 'auto') {
      playerCar.mode = 'manual';
      playerCar.currentSpeed = 0;
      playerCar.accelInput = 0;
      playerCar.steerInput = 0;
      playerCar.lateralOffset = 0;
      this.game.keys.up = false;
      this.game.keys.down = false;
      this.game.keys.left = false;
      this.game.keys.right = false;
      this.showNotification('🏎️ Manual mode! Use WASD or touch to drive.');
    } else {
      playerCar.mode = 'auto';
      this.game.keys.up = false;
      this.game.keys.down = false;
      this.game.keys.left = false;
      this.game.keys.right = false;
      this.game.joystick.active = false;

      // Mark manual lap as completed if player has completed at least one lap in manual
      if (playerCar.laps > 0) {
        this.game.economy.completeManualLap();
      }

      this.showNotification('🤖 Auto mode. Upgrades boost your auto-racer!');
    }

    this.updateStats();
  }
}
