/**
 * Car module - racing car with physics and rendering
 */

class Car {
  constructor(options = {}) {
    this.name = options.name || 'Player';
    this.color = options.color || '#e94560';
    this.secondaryColor = options.secondaryColor || '#c0392b';
    this.distance = options.distance || 0; // distance along track
    this.speed = options.speed || 1.0; // base speed multiplier
    this.length = 14; // car pixel length
    this.width = 8; // car pixel width
    
    // Lap tracking
    this.laps = 0;
    this.lapStartTime = 0;
    this.lastLapTime = 0;
    this.currentLapProgress = 0; // 0 to 1
    
    // Visual
    this.bobPhase = Math.random() * Math.PI * 2; // for slight wobble
  }

  /**
   * Update car position
   * @param {Track} track - The track
   * @param {number} dt - Delta time in seconds
   * @param {number} speedMultiplier - Global speed multiplier from upgrades
   */
  update(track, dt, speedMultiplier = 1.0) {
    const effectiveSpeed = this.speed * speedMultiplier;
    const pixelsPerSecond = effectiveSpeed * 120; // base movement rate
    
    const oldDistance = this.distance;
    this.distance += pixelsPerSecond * dt;
    
    // Check for lap completion
    if (this.distance - oldDistance >= track.length) {
      this.completeLap(track);
    }
    
    // Update lap progress
    this.currentLapProgress = ((this.distance % track.length) / track.length);
    
    // Update bob phase for visual wobble
    this.bobPhase += dt * 8;
  }

  /**
   * Called when a lap is completed
   */
  completeLap(track) {
    this.laps++;
    this.lastLapTime = (track.length) / (this.speed * 120); // approximate lap time
    this.distance = this.distance % (track.length * 1000); // prevent overflow
  }

  /**
   * Get current position on track
   */
  getPosition(track) {
    return track.getPosition(this.distance);
  }

  /**
   * Draw the car on canvas
   */
  draw(ctx, track) {
    const pos = this.getPosition(track);
    
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(pos.angle);
    
    // Slight wobble for life
    const bob = Math.sin(this.bobPhase) * 0.3;
    ctx.translate(0, bob);
    
    // Car shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(-this.length / 2 + 2, -this.width / 2 + 2, this.length, this.width);
    
    // Car body
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.roundRect(-this.length / 2, -this.width / 2, this.length, this.width, 2);
    ctx.fill();
    
    // Car stripe
    ctx.fillStyle = this.secondaryColor;
    ctx.fillRect(-this.length / 2 + 2, -1, this.length - 4, 2);
    
    // Windshield
    ctx.fillStyle = 'rgba(150,200,255,0.7)';
    ctx.fillRect(this.length / 2 - 5, -this.width / 2 + 1, 3, this.width - 2);
    
    // Wheels
    ctx.fillStyle = '#222';
    ctx.fillRect(-this.length / 2 + 1, -this.width / 2 - 1, 3, 1.5);
    ctx.fillRect(-this.length / 2 + 1, this.width / 2 - 0.5, 3, 1.5);
    ctx.fillRect(this.length / 2 - 4, -this.width / 2 - 1, 3, 1.5);
    ctx.fillRect(this.length / 2 - 4, this.width / 2 - 0.5, 3, 1.5);
    
    ctx.restore();
    
    // Draw name tag above car
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, pos.x, pos.y - 10);
  }

  /**
   * Draw multiple cars with proper z-ordering
   */
  static drawCars(ctx, track, cars) {
    // Sort by y position for proper overlap
    const sorted = cars.map(car => {
      const pos = car.getPosition(track);
      return { car, y: pos.y };
    }).sort((a, b) => a.y - b.y);
    
    for (const { car } of sorted) {
      car.draw(ctx, track);
    }
  }
}
