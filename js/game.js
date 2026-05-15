/**
 * Main Game module - orchestrates the game loop, rendering, and systems
 */

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.economy = new Economy();
    this.saveManager = new SaveManager();
    this.ui = new UIManager(this);

    this.cars = [];
    this.track = null;

    this.totalLaps = 0;
    this.playTime = 0;
    this.lastTime = 0;
    this.lastSaveTime = 0;

    this.paused = false;

    // Input state - 4 directional
    this.keys = { up: false, down: false, left: false, right: false };

    // Virtual joystick state
    this.joystick = { active: false, id: null, startX: 0, startY: 0, dx: 0, dy: 0 };

    this.init();
  }

  /**
   * Initialize the game
   */
  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Create track for current track
    this.switchToTrack(this.economy.currentTrack);

    // Load save if exists
    const saveData = this.saveManager.load();
    if (saveData) {
      const offlineEarnings = this.saveManager.applySave(this, saveData);

      if (offlineEarnings > 0) {
        setTimeout(() => {
          this.ui.showNotification(`Welcome back! Earned ${this.ui.formatMoney(offlineEarnings)} while away!`);
        }, 500);
      }
    }

    // Update rival racers
    this.updateRivalRacers();

    // Setup input handlers
    this.setupInput();

    // Start game loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  /**
   * Switch to a specific track
   */
  switchToTrack(trackIndex) {
    this.economy.currentTrack = trackIndex;
    const trackDef = TRACK_DEFS[trackIndex];

    // Recreate track
    this.track = new Track(trackDef, this.canvas.width, this.canvas.height);

    // Recreate player car with track-specific properties
    this.cars = [];
    this.cars.push(new Car({
      name: 'YOU',
      color: trackDef.carColor,
      secondaryColor: trackDef.carSecondary,
      speed: trackDef.carBaseSpeed,
      shape: trackDef.carShape,
    }));

    // Reset rival racers
    this.updateRivalRacers();

    // Update UI
    this.ui.refresh();
  }

  /**
   * Setup keyboard, touch and joystick input
   */
  setupInput() {
    // Keyboard - WASD
    window.addEventListener('keydown', (e) => {
      switch (e.key.toLowerCase()) {
        case 'w': case 'arrowup': this.keys.up = true; break;
        case 's': case 'arrowdown': this.keys.down = true; break;
        case 'a': case 'arrowleft': this.keys.left = true; break;
        case 'd': case 'arrowright': this.keys.right = true; break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.key.toLowerCase()) {
        case 'w': case 'arrowup': this.keys.up = false; break;
        case 's': case 'arrowdown': this.keys.down = false; break;
        case 'a': case 'arrowleft': this.keys.left = false; break;
        case 'd': case 'arrowright': this.keys.right = false; break;
      }
    });

    // Touch controls - virtual joystick
    this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
    this.canvas.addEventListener('touchcancel', (e) => this.handleTouchEnd(e), { passive: false });
  }

  handleTouchStart(e) {
    e.preventDefault();
    const playerCar = this.cars[0];
    if (!playerCar || playerCar.mode !== 'manual') return;

    for (const touch of e.changedTouches) {
      if (!this.joystick.active) {
        this.joystick.active = true;
        this.joystick.id = touch.identifier;
        this.joystick.startX = touch.clientX;
        this.joystick.startY = touch.clientY;
        this.joystick.dx = 0;
        this.joystick.dy = 0;
      }
    }
  }

  handleTouchMove(e) {
    e.preventDefault();
    const playerCar = this.cars[0];
    if (!playerCar || playerCar.mode !== 'manual' || !this.joystick.active) return;

    for (const touch of e.changedTouches) {
      if (touch.identifier === this.joystick.id) {
        const maxDist = 50; // max joystick radius
        let dx = touch.clientX - this.joystick.startX;
        let dy = touch.clientY - this.joystick.startY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > maxDist) {
          dx = (dx / dist) * maxDist;
          dy = (dy / dist) * maxDist;
        }

        this.joystick.dx = dx / maxDist; // -1 to 1
        this.joystick.dy = dy / maxDist; // -1 to 1

        // Map to keys
        this.keys.up = this.joystick.dy < -0.3;
        this.keys.down = this.joystick.dy > 0.3;
        this.keys.left = this.joystick.dx < -0.3;
        this.keys.right = this.joystick.dx > 0.3;
      }
    }
  }

  handleTouchEnd(e) {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      if (touch.identifier === this.joystick.id) {
        this.joystick.active = false;
        this.joystick.dx = 0;
        this.joystick.dy = 0;
        this.keys.up = false;
        this.keys.down = false;
        this.keys.left = false;
        this.keys.right = false;
      }
    }
  }

  /**
   * Resize canvas to fit container
   */
  resizeCanvas() {
    const container = this.canvas.parentElement;
    const rect = container.getBoundingClientRect();

    const statsHeight = 50;
    const panelHeight = Math.min(window.innerHeight * 0.45, 200);

    this.canvas.width = rect.width;
    this.canvas.height = rect.height - statsHeight - panelHeight;

    // Recreate track with new dimensions
    if (this.track) {
      const trackDef = TRACK_DEFS[this.economy.currentTrack];
      const oldCars = this.cars.map(c => ({
        distance: c.distance,
        speed: c.speed,
        name: c.name,
        color: c.color,
        secondaryColor: c.secondaryColor,
        shape: c.shape,
        laps: c.laps,
        bestLapTime: c.bestLapTime,
      }));

      this.track = new Track(trackDef, this.canvas.width, this.canvas.height);

      this.cars = [];
      for (const carData of oldCars) {
        const car = new Car(carData);
        this.cars.push(car);
      }
    }
  }

  /**
   * Update rival racers based on economy state
   */
  updateRivalRacers() {
    const activeRacers = this.economy.getActiveRacers();
    const trackDef = TRACK_DEFS[this.economy.currentTrack];

    while (this.cars.length > activeRacers + 1) {
      this.cars.pop();
    }

    const racerColors = [
      { color: '#3498db', secondary: '#2980b9' },
      { color: '#2ecc71', secondary: '#27ae60' },
      { color: '#f39c12', secondary: '#e67e22' },
      { color: '#9b59b6', secondary: '#8e44ad' },
      { color: '#1abc9c', secondary: '#16a085' },
    ];

    const racerNames = ['Local', 'Club', 'Pro', 'Star', 'Rival'];

    while (this.cars.length - 1 < activeRacers) {
      const index = this.cars.length - 1;
      const colors = racerColors[index % racerColors.length];

      this.cars.push(new Car({
        name: racerNames[index] || `Racer ${index + 1}`,
        color: colors.color,
        secondaryColor: colors.secondary,
        speed: 0.6 + Math.random() * 0.4,
        distance: Math.random() * this.track.length,
        shape: trackDef.carShape,
      }));
    }
  }

  /**
   * Main game loop
   */
  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    if (!this.paused) {
      this.update(dt);
      this.render();
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  /**
   * Update game state
   */
  update(dt) {
    this.playTime += dt;

    const speedMult = this.economy.getSpeedMultiplier();
    const playerCar = this.cars[0];

    // Process player input for manual driving
    if (playerCar && playerCar.mode === 'manual') {
      // Acceleration (up/down)
      if (this.keys.up) {
        playerCar.accelInput = 1;
      } else if (this.keys.down) {
        playerCar.accelInput = -1.5;
      } else {
        playerCar.accelInput = -0.3; // natural deceleration
      }

      // Steering (left/right)
      if (this.keys.left) {
        playerCar.steerInput = -1;
      } else if (this.keys.right) {
        playerCar.steerInput = 1;
      } else {
        playerCar.steerInput = 0;
      }
    }

    // Update all cars
    for (const car of this.cars) {
      car.update(this.track, dt, car === this.cars[0] ? speedMult : 1.0);
    }

    // Check for player lap completion
    if (playerCar) {
      const currentLaps = playerCar.laps;
      if (currentLaps > this.totalLaps) {
        const lapsGained = currentLaps - this.totalLaps;
        this.totalLaps = currentLaps;

        for (let i = 0; i < lapsGained; i++) {
          const earnings = this.economy.getEarningsPerLap(playerCar);
          this.economy.addEarnings(earnings);

          const pos = playerCar.getPosition(this.track);
          this.ui.showEarningsPopup(earnings, pos.x, pos.y - 20);
        }

        // Show lap overlay
        this.ui.showLapOverlay(playerCar.lastLapTime, playerCar.bestLapTime, this.totalLaps);

        // Check for track unlock
        if (this.economy.canUnlockNextTrack()) {
          this.ui.showTrackUnlockPrompt();
        }
      }
    }

    // Update stats
    this.ui.updateStats();

    // Auto-save every 30 seconds
    this.lastSaveTime += dt;
    if (this.lastSaveTime >= 30) {
      this.lastSaveTime = 0;
      this.saveManager.save(this);
    }
  }

  /**
   * Render the game
   */
  render() {
    const ctx = this.ctx;
    const track = this.track;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw track
    track.draw(ctx);

    // Draw grandstands
    track.drawGrandstands(ctx, this.economy.getTotalViewers());

    // Draw cars
    Car.drawCars(ctx, track, this.cars);

    // Draw lap progress for player
    const playerCar = this.cars[0];
    if (playerCar) {
      this.drawLapProgress(ctx, playerCar);

      // Draw driving UI for manual mode
      if (playerCar.mode === 'manual') {
        this.drawDrivingUI(ctx, playerCar);
      }
    }

    // Draw joystick for manual mode on mobile
    if (playerCar && playerCar.mode === 'manual' && this.joystick.active) {
      this.drawJoystick(ctx);
    }
  }

  /**
   * Draw virtual joystick
   */
  drawJoystick(ctx) {
    const { startX, startY, dx, dy } = this.joystick;
    const radius = 50;
    const knobRadius = 20;

    // Base circle
    ctx.beginPath();
    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Direction indicators
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('▲', startX, startY - radius + 15);
    ctx.fillText('▼', startX, startY + radius - 5);
    ctx.fillText('◀', startX - radius + 12, startY + 4);
    ctx.fillText('▶', startX + radius - 12, startY + 4);

    // Knob
    const knobX = startX + dx * radius;
    const knobY = startY + dy * radius;
    ctx.beginPath();
    ctx.arc(knobX, knobY, knobRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(233, 69, 96, 0.6)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  /**
   * Draw driving controls overlay for manual mode
   */
  drawDrivingUI(ctx, car) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Speed bar at bottom
    const barWidth = w * 0.6;
    const barHeight = 8;
    const barX = (w - barWidth) / 2;
    const barY = h - 20;

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth, barHeight, 4);
    ctx.fill();

    const speedColor = car.currentSpeed > 0.8 ? '#e94560' : car.currentSpeed > 0.4 ? '#f9ed69' : '#4ecca3';
    ctx.fillStyle = speedColor;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth * Math.max(0, car.currentSpeed), barHeight, 4);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    const displaySpeed = Math.floor(Math.max(0, car.currentSpeed) * 200);
    ctx.fillText(`${displaySpeed} km/h`, w / 2, barY - 4);

    // Lap times
    ctx.font = '11px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.textAlign = 'left';
    ctx.fillText(`⏱ ${car.currentLapTime.toFixed(2)}s`, 10, 20);

    if (car.bestLapTime > 0) {
      ctx.fillStyle = '#f9ed69';
      ctx.textAlign = 'right';
      ctx.fillText(`🏆 ${car.bestLapTime.toFixed(2)}s`, w - 10, 20);
    }

    // Mode indicator
    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MANUAL', w / 2, 16);

    // Touch hint (only show if joystick not active)
    if (!this.joystick.active) {
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.font = '11px sans-serif';
      ctx.fillText('TAP & DRAG TO STEER', w / 2, h / 2 - 10);
      ctx.fillText('WASD on keyboard', w / 2, h / 2 + 8);
    }
  }

  /**
   * Draw lap progress arc
   */
  drawLapProgress(ctx, car) {
    const pos = car.getPosition(this.track);

    ctx.save();
    ctx.translate(pos.x, pos.y - 18);

    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 6, -Math.PI / 2, -Math.PI / 2 + car.currentLapProgress * Math.PI * 2);
    ctx.strokeStyle = '#4ecca3';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Unlock next track
   */
  unlockNextTrack() {
    if (this.economy.unlockNextTrack()) {
      this.ui.showNotification(`🏁 Unlocked: ${TRACK_DEFS[this.economy.currentTrack].name}!`);
      this.switchToTrack(this.economy.currentTrack);
    }
  }
}

// Start the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
