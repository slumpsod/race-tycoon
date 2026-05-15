/**
 * Car module - racing car with 4-directional steering and multiple shapes
 */

class Car {
  constructor(options = {}) {
    this.name = options.name || 'Player';
    this.color = options.color || '#e94560';
    this.secondaryColor = options.secondaryColor || '#c0392b';
    this.distance = options.distance || 0; // distance along track center
    this.speed = options.speed || 1.0; // base speed multiplier
    this.shape = options.shape || 'stock'; // car shape: stock, sport, proto

    // Dimensions vary by shape
    if (this.shape === 'stock') {
      this.length = 14;
      this.width = 8;
    } else if (this.shape === 'sport') {
      this.length = 16;
      this.width = 9;
    } else { // proto
      this.length = 18;
      this.width = 10;
    }

    // Lap tracking
    this.laps = options.laps || 0;
    this.lapStartTime = 0;
    this.currentLapTime = 0;
    this.lastLapTime = 0;
    this.bestLapTime = options.bestLapTime || 0;
    this.currentLapProgress = 0;
    this._previousLaps = 0;

    // Driving mode: 'auto' or 'manual'
    this.mode = 'auto';

    // Manual driving state - 4 directional
    this.currentSpeed = 0; // 0 to 1 (fraction of max speed along track)
    this.lateralOffset = 0; // -1 to 1 (left to right across track)
    this.accelInput = 0; // -1 to 1 (forward/backward)
    this.steerInput = 0; // -1 to 1 (left/right)

    // Visual
    this.bobPhase = Math.random() * Math.PI * 2;
    this.tiltAngle = 0; // visual tilt when steering
  }

  /**
   * Update car position
   */
  update(track, dt, speedMultiplier = 1.0) {
    const effectiveSpeed = this.speed * speedMultiplier;

    if (this.mode === 'auto') {
      // Auto mode: drive at constant speed along center
      const pixelsPerSecond = effectiveSpeed * 120;
      this.distance += pixelsPerSecond * dt;
      this.currentSpeed = Math.min(1, pixelsPerSecond / (effectiveSpeed * 120));
      this.lateralOffset = Math.sin(this.bobPhase) * 0.1; // slight wobble
    } else {
      // Manual mode: 4-directional control
      const maxPixelsPerSecond = effectiveSpeed * 120;
      const accelRate = 100; // pixels/s^2
      const steerRate = 1.5; // lateral units per second
      const friction = 0.5; // lateral friction

      // Apply acceleration (forward/backward along track)
      this.currentSpeed += this.accelInput * accelRate * dt / maxPixelsPerSecond;
      this.currentSpeed = Math.max(-0.2, Math.min(1, this.currentSpeed));

      // Apply steering (left/right across track)
      this.lateralOffset += this.steerInput * steerRate * dt;

      // Apply lateral friction
      this.lateralOffset *= (1 - friction * dt);

      // Clamp lateral offset to track bounds
      if (Math.abs(this.lateralOffset) > 1.0) {
        // Hit the wall - reduce speed
        const wallImpact = Math.abs(this.lateralOffset) - 1.0;
        this.currentSpeed *= (1 - wallImpact * 2 * dt);
        this.lateralOffset = Math.sign(this.lateralOffset) * 1.0;
      }

      // Move along track
      const pixelsPerSecond = this.currentSpeed * maxPixelsPerSecond;
      this.distance += pixelsPerSecond * dt;

      // Update visual tilt
      this.tiltAngle = this.steerInput * 0.15;
    }

    // Update lap timer
    this.currentLapTime += dt;

    // Check for lap completion
    const completedLaps = Math.floor(this.distance / track.length);
    const newLaps = completedLaps - this._previousLaps;

    if (newLaps > 0) {
      for (let i = 0; i < newLaps; i++) {
        this.completeLap(track, effectiveSpeed);
      }
      this._previousLaps = completedLaps;
    }

    // Update lap progress
    this.currentLapProgress = ((this.distance % track.length) / track.length);

    // Update bob phase
    this.bobPhase += dt * 8;
  }

  /**
   * Called when a lap is completed
   */
  completeLap(track, effectiveSpeed) {
    this.laps++;
    this.lastLapTime = this.currentLapTime;

    if (this.bestLapTime === 0 || this.currentLapTime < this.bestLapTime) {
      this.bestLapTime = this.currentLapTime;
    }

    this.currentLapTime = 0;
  }

  /**
   * Get current position on track (with lateral offset)
   */
  getPosition(track) {
    const center = track.getPosition(this.distance);

    // Apply lateral offset
    const lateralPx = this.lateralOffset * (track.trackWidthPx / 2 * 0.8);
    const normalAngle = center.angle - Math.PI / 2;

    const x = center.x + Math.cos(normalAngle) * lateralPx;
    const y = center.y + Math.sin(normalAngle) * lateralPx;

    return { x, y, angle: center.angle + this.tiltAngle };
  }

  /**
   * Draw the car on canvas
   */
  draw(ctx, track) {
    const pos = this.getPosition(track);

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(pos.angle);

    // Slight wobble
    const bob = Math.sin(this.bobPhase) * 0.3;
    ctx.translate(0, bob);

    const l = this.length;
    const w = this.width;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    this.drawCarShape(ctx, l, w, 2, 2, true);

    // Car body
    ctx.fillStyle = this.color;
    this.drawCarShape(ctx, l, w, 0, 0, false);

    // Stripe
    ctx.fillStyle = this.secondaryColor;
    if (this.shape === 'stock') {
      ctx.fillRect(-l / 2 + 2, -1, l - 4, 2);
    } else if (this.shape === 'sport') {
      ctx.fillRect(-l / 2 + 3, -1.5, l - 6, 3);
      // Side stripes
      ctx.fillRect(-l / 4, -w / 2, l / 2, 1);
      ctx.fillRect(-l / 4, w / 2 - 1, l / 2, 1);
    } else { // proto
      // Racing livery
      ctx.fillRect(-l / 2 + 2, -2, l - 4, 4);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect(-l / 3, -w / 2, l / 6, w);
    }

    // Windshield
    ctx.fillStyle = 'rgba(150,200,255,0.7)';
    if (this.shape === 'stock') {
      ctx.fillRect(l / 2 - 5, -w / 2 + 1, 3, w - 2);
    } else if (this.shape === 'sport') {
      ctx.beginPath();
      ctx.moveTo(l / 2 - 6, -w / 2 + 1);
      ctx.lineTo(l / 2 - 2, -w / 2 + 1);
      ctx.lineTo(l / 2 - 1, 0);
      ctx.lineTo(l / 2 - 2, w / 2 - 1);
      ctx.lineTo(l / 2 - 6, w / 2 - 1);
      ctx.closePath();
      ctx.fill();
    } else { // proto
      ctx.beginPath();
      ctx.moveTo(l / 2 - 8, -w / 2 + 1);
      ctx.lineTo(l / 2 - 2, -w / 3);
      ctx.lineTo(l / 2 - 1, w / 3);
      ctx.lineTo(l / 2 - 8, w / 2 - 1);
      ctx.closePath();
      ctx.fill();
    }

    // Wheels
    ctx.fillStyle = '#222';
    const wheelW = this.shape === 'proto' ? 4 : 3;
    const wheelH = this.shape === 'proto' ? 2 : 1.5;
    ctx.fillRect(-l / 2 + 1, -w / 2 - 1, wheelW, wheelH);
    ctx.fillRect(-l / 2 + 1, w / 2 - wheelH + 1, wheelW, wheelH);
    ctx.fillRect(l / 2 - wheelW - 1, -w / 2 - 1, wheelW, wheelH);
    ctx.fillRect(l / 2 - wheelW - 1, w / 2 - wheelH + 1, wheelW, wheelH);

    // Proto car: rear wing
    if (this.shape === 'proto') {
      ctx.fillStyle = this.secondaryColor;
      ctx.fillRect(-l / 2 - 2, -w / 2 - 2, 2, w + 4);
      ctx.fillRect(-l / 2 - 1, -w / 2 - 1, 1, 1);
      ctx.fillRect(-l / 2 - 1, w / 2, 1, 1);
    }

    // Sport car: spoiler
    if (this.shape === 'sport') {
      ctx.fillStyle = this.secondaryColor;
      ctx.fillRect(-l / 2 - 1, -w / 2 - 1, 1.5, w + 2);
    }

    ctx.restore();

    // Name tag
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, pos.x, pos.y - 10);
  }

  /**
   * Draw car shape based on type
   */
  drawCarShape(ctx, l, w, ox, oy, isShadow) {
    ctx.beginPath();
    if (this.shape === 'stock') {
      ctx.roundRect(-l / 2 + ox, -w / 2 + oy, l, w, 2);
    } else if (this.shape === 'sport') {
      // More aerodynamic
      ctx.moveTo(-l / 2 + ox, -w / 2 + oy);
      ctx.lineTo(l / 2 - 3 + ox, -w / 2 + oy);
      ctx.quadraticCurveTo(l / 2 + ox, -w / 2 + oy, l / 2 + ox, 0 + oy);
      ctx.quadraticCurveTo(l / 2 + ox, w / 2 + oy, l / 2 - 3 + ox, w / 2 + oy);
      ctx.lineTo(-l / 2 + ox, w / 2 + oy);
      ctx.quadraticCurveTo(-l / 2 + ox, 0 + oy, -l / 2 + ox, -w / 2 + oy);
    } else { // proto
      // Sleek prototype
      ctx.moveTo(-l / 2 + ox, -w / 2.5 + oy);
      ctx.lineTo(l / 2 - 4 + ox, -w / 2 + oy);
      ctx.quadraticCurveTo(l / 2 + 2 + ox, -w / 3 + oy, l / 2 + 2 + ox, 0 + oy);
      ctx.quadraticCurveTo(l / 2 + 2 + ox, w / 3 + oy, l / 2 - 4 + ox, w / 2 + oy);
      ctx.lineTo(-l / 2 + ox, w / 2.5 + oy);
      ctx.quadraticCurveTo(-l / 2 - 1 + ox, 0 + oy, -l / 2 + ox, -w / 2.5 + oy);
    }
    if (isShadow) {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fill();
    } else {
      ctx.fill();
    }
  }

  /**
   * Draw multiple cars with proper z-ordering
   */
  static drawCars(ctx, track, cars) {
    const sorted = cars.map(car => {
      const pos = car.getPosition(track);
      return { car, y: pos.y };
    }).sort((a, b) => a.y - b.y);

    for (const { car } of sorted) {
      car.draw(ctx, track);
    }
  }
}
