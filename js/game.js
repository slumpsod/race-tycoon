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
    
    this.init();
  }

  /**
   * Initialize the game
   */
  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Create track
    this.track = new Track(this.canvas.width, this.canvas.height);
    
    // Create player car
    this.cars.push(new Car({
      name: 'YOU',
      color: '#e94560',
      secondaryColor: '#c0392b',
      speed: 1.0,
    }));
    
    // Load save if exists
    const saveData = this.saveManager.load();
    if (saveData) {
      const offlineEarnings = this.saveManager.applySave(this, saveData);
      
      if (offlineEarnings > 0) {
        // Show offline earnings notification
        setTimeout(() => {
          alert(`Welcome back! You earned ${this.ui.formatMoney(offlineEarnings)} while away!`);
        }, 500);
      }
    }
    
    // Update rival racers based on economy state
    this.updateRivalRacers();
    
    // Start game loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  /**
   * Resize canvas to fit container
   */
  resizeCanvas() {
    const container = this.canvas.parentElement;
    const rect = container.getBoundingClientRect();
    
    // Account for stats bar and upgrade panel
    const statsHeight = 50;
    const panelHeight = Math.min(window.innerHeight * 0.45, 200);
    
    this.canvas.width = rect.width;
    this.canvas.height = rect.height - statsHeight - panelHeight;
    
    // Recreate track with new dimensions
    if (this.track) {
      const oldCars = this.cars.map(c => ({
        distance: c.distance,
        speed: c.speed,
        name: c.name,
        color: c.color,
        secondaryColor: c.secondaryColor,
      }));
      
      this.track = new Track(this.canvas.width, this.canvas.height);
      
      // Restore car positions
      this.cars = [];
      for (const carData of oldCars) {
        const car = new Car(carData);
        this.cars.push(car);
      }
    }
  }

  /**
   * Update rival racers based on economy upgrades
   */
  updateRivalRacers() {
    const activeRacers = this.economy.getActiveRacers();
    
    // Remove excess racers
    while (this.cars.length > activeRacers + 1) {
      this.cars.pop();
    }
    
    // Add missing racers
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
        speed: 0.6 + Math.random() * 0.4, // varied speeds
        distance: Math.random() * this.track.length, // random starting position
      }));
    }
  }

  /**
   * Main game loop
   */
  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1); // cap at 100ms
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
    
    // Update all cars
    for (const car of this.cars) {
      car.update(this.track, dt, car === this.cars[0] ? speedMult : 1.0);
    }
    
    // Check for player lap completion
    const playerCar = this.cars[0];
    if (playerCar) {
      const currentLaps = playerCar.laps;
      if (currentLaps > this.totalLaps) {
        // Lap completed!
        const lapsGained = currentLaps - this.totalLaps;
        this.totalLaps = currentLaps;
        
        for (let i = 0; i < lapsGained; i++) {
          const earnings = this.economy.getEarningsPerLap();
          this.economy.addEarnings(earnings);
          
          // Show earnings popup
          const pos = playerCar.getPosition(this.track);
          this.ui.showEarningsPopup(earnings, pos.x, pos.y - 20);
        }
        
        // Show lap overlay
        this.ui.showLapOverlay();
        
        // Refresh UI
        this.ui.refresh();
      }
    }
    
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
    
    // Clear
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw track
    track.draw(ctx);
    
    // Draw grandstands with viewers
    track.drawGrandstands(ctx, this.economy.getTotalViewers());
    
    // Draw cars
    Car.drawCars(ctx, track, this.cars);
    
    // Draw lap progress indicator for player
    const playerCar = this.cars[0];
    if (playerCar) {
      this.drawLapProgress(ctx, playerCar);
    }
  }

  /**
   * Draw lap progress arc
   */
  drawLapProgress(ctx, car) {
    const pos = car.getPosition(this.track);
    
    // Draw progress arc above car
    ctx.save();
    ctx.translate(pos.x, pos.y - 18);
    
    // Background arc
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Progress arc
    ctx.beginPath();
    ctx.arc(0, 0, 6, -Math.PI / 2, -Math.PI / 2 + car.currentLapProgress * Math.PI * 2);
    ctx.strokeStyle = '#4ecca3';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
  }
}

// Start the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
