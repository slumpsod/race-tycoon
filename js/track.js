/**
 * Track module - waypoint-based track system with 3 unique tracks
 */

const TRACK_DEFS = [
  {
    id: 'rookie_oval',
    name: 'Rookie Oval',
    description: 'A classic oval to start your career',
    color: '#4a7c59',
    trackColor: '#555',
    borderColor: '#777',
    // Oval track defined by waypoints
    waypoints: [
      { x: 0.5, y: 0.15 },  // top center
      { x: 0.85, y: 0.25 }, // top right curve start
      { x: 0.85, y: 0.75 }, // bottom right curve start
      { x: 0.5, y: 0.85 },  // bottom center
      { x: 0.15, y: 0.75 }, // bottom left curve start
      { x: 0.15, y: 0.25 }, // top left curve start
    ],
    trackWidth: 0.12,
    carShape: 'stock',
    carBaseSpeed: 1.0,
    carColor: '#e94560',
    carSecondary: '#c0392b',
    upgrades: {
      car: [
        { id: 'tires', name: 'Better Tires', icon: '🛞', desc: 'Improve grip and speed', baseCost: 10, costMult: 1.5, maxLevel: 10, speedBonus: 0.05 },
        { id: 'engine', name: 'Engine Tune', icon: '⚙️', desc: 'Optimize engine performance', baseCost: 50, costMult: 1.6, maxLevel: 10, speedBonus: 0.08 },
        { id: 'turbo', name: 'Turbocharger', icon: '💨', desc: 'Force induction for more power', baseCost: 250, costMult: 1.8, maxLevel: 5, speedBonus: 0.15 },
        { id: 'nitrous', name: 'Nitrous System', icon: '🔥', desc: 'Nitrous oxide injection', baseCost: 1000, costMult: 2.0, maxLevel: 5, speedBonus: 0.20 },
        { id: 'rebuild', name: 'Full Rebuild', icon: '🏆', desc: 'Complete engine overhaul', baseCost: 5000, costMult: 2.5, maxLevel: 3, speedBonus: 0.30 },
      ],
      venue: [
        { id: 'seats', name: 'More Seats', icon: '💺', desc: 'Expand grandstand capacity', baseCost: 15, costMult: 1.4, maxLevel: 10, viewerBonus: 10 },
        { id: 'comfySeats', name: 'Comfortable Seats', icon: '🛋️', desc: 'Viewers pay more for comfort', baseCost: 75, costMult: 1.6, maxLevel: 5, payMult: 0.15 },
        { id: 'premiumSeats', name: 'Premium Seats', icon: '✨', desc: 'Luxury seating experience', baseCost: 350, costMult: 1.8, maxLevel: 5, payMult: 0.25 },
        { id: 'vipLounge', name: 'VIP Lounge', icon: '🥂', desc: 'Exclusive VIP viewing area', baseCost: 1500, costMult: 2.0, maxLevel: 3, payMult: 0.50 },
        { id: 'liveStream', name: 'Live Stream', icon: '📡', desc: 'Broadcast to online audience', baseCost: 5000, costMult: 2.2, maxLevel: 3, viewerBonus: 30, payMult: 0.10 },
      ],
      racers: [
        { id: 'racer1', name: 'Local Hobbyist', icon: '🚗', desc: 'A weekend warrior joins', baseCost: 100, payMult: 1.15, oneTime: true },
        { id: 'racer2', name: 'Club Racer', icon: '🏎️', desc: 'A local club driver', baseCost: 500, payMult: 1.30, oneTime: true },
        { id: 'racer3', name: 'Pro Driver', icon: '🏁', desc: 'A professional joins', baseCost: 2500, payMult: 1.50, oneTime: true },
        { id: 'racer4', name: 'Celebrity Racer', icon: '⭐', desc: 'A famous driver', baseCost: 10000, payMult: 2.0, oneTime: true },
        { id: 'racer5', name: 'Rival Team', icon: '🏢', desc: 'A full racing team', baseCost: 50000, payMult: 3.0, oneTime: true },
      ],
    },
  },
  {
    id: 'circuit_bend',
    name: 'Circuit Bend',
    description: 'Technical S-curves and chicanes',
    color: '#5a4a7c',
    trackColor: '#666',
    borderColor: '#888',
    // S-curve / figure-8 style track
    waypoints: [
      { x: 0.2, y: 0.2 },
      { x: 0.5, y: 0.1 },
      { x: 0.8, y: 0.2 },
      { x: 0.9, y: 0.5 },
      { x: 0.8, y: 0.8 },
      { x: 0.5, y: 0.9 },
      { x: 0.2, y: 0.8 },
      { x: 0.1, y: 0.5 },
    ],
    trackWidth: 0.10,
    carShape: 'sport',
    carBaseSpeed: 1.2,
    carColor: '#3498db',
    carSecondary: '#2980b9',
    upgrades: {
      car: [
        { id: 'tires', name: 'Slick Tires', icon: '🛞', desc: 'Race-compound tires', baseCost: 50, costMult: 1.5, maxLevel: 10, speedBonus: 0.05 },
        { id: 'engine', name: 'V6 Engine', icon: '⚙️', desc: 'Smooth power delivery', baseCost: 250, costMult: 1.6, maxLevel: 10, speedBonus: 0.08 },
        { id: 'turbo', name: 'Dual Turbo', icon: '💨', desc: 'Twin-scroll turbochargers', baseCost: 1250, costMult: 1.8, maxLevel: 5, speedBonus: 0.15 },
        { id: 'nitrous', name: 'NOS System', icon: '🔥', desc: 'Nitrous oxide boost', baseCost: 5000, costMult: 2.0, maxLevel: 5, speedBonus: 0.20 },
        { id: 'rebuild', name: 'Race Build', icon: '🏆', desc: 'Full race-spec rebuild', baseCost: 25000, costMult: 2.5, maxLevel: 3, speedBonus: 0.30 },
      ],
      venue: [
        { id: 'seats', name: 'Grandstand', icon: '💺', desc: 'Build grandstand seating', baseCost: 75, costMult: 1.4, maxLevel: 10, viewerBonus: 15 },
        { id: 'comfySeats', name: 'Padded Seats', icon: '🛋️', desc: 'Comfortable viewing', baseCost: 375, costMult: 1.6, maxLevel: 5, payMult: 0.15 },
        { id: 'premiumSeats', name: 'Box Seats', icon: '✨', desc: 'Private box experience', baseCost: 1750, costMult: 1.8, maxLevel: 5, payMult: 0.25 },
        { id: 'vipLounge', name: 'Sky Box', icon: '🥂', desc: 'Premium sky box suite', baseCost: 7500, costMult: 2.0, maxLevel: 3, payMult: 0.50 },
        { id: 'liveStream', name: 'HD Broadcast', icon: '📡', desc: 'HD live broadcast', baseCost: 25000, costMult: 2.2, maxLevel: 3, viewerBonus: 50, payMult: 0.10 },
      ],
      racers: [
        { id: 'racer1', name: 'Amateur Rival', icon: '🚗', desc: 'An amateur challenger', baseCost: 500, payMult: 1.15, oneTime: true },
        { id: 'racer2', name: 'Regional Pro', icon: '🏎️', desc: 'Regional champion', baseCost: 2500, payMult: 1.30, oneTime: true },
        { id: 'racer3', name: 'National Star', icon: '🏁', desc: 'National series star', baseCost: 12500, payMult: 1.50, oneTime: true },
        { id: 'racer4', name: 'TV Personality', icon: '⭐', desc: 'TV racing personality', baseCost: 50000, payMult: 2.0, oneTime: true },
        { id: 'racer5', name: 'Factory Team', icon: '🏢', desc: 'Factory racing team', baseCost: 250000, payMult: 3.0, oneTime: true },
      ],
    },
  },
  {
    id: 'pro_speedway',
    name: 'Pro Speedway',
    description: 'The ultimate professional circuit',
    color: '#7c3a3a',
    trackColor: '#777',
    borderColor: '#999',
    // Complex multi-turn track with varying radius
    waypoints: [
      { x: 0.15, y: 0.3 },
      { x: 0.35, y: 0.1 },
      { x: 0.65, y: 0.1 },
      { x: 0.85, y: 0.3 },
      { x: 0.9, y: 0.5 },
      { x: 0.85, y: 0.7 },
      { x: 0.7, y: 0.85 },
      { x: 0.5, y: 0.9 },
      { x: 0.3, y: 0.85 },
      { x: 0.15, y: 0.7 },
      { x: 0.1, y: 0.5 },
    ],
    trackWidth: 0.09,
    carShape: 'proto',
    carBaseSpeed: 1.5,
    carColor: '#f39c12',
    carSecondary: '#e67e22',
    upgrades: {
      car: [
        { id: 'tires', name: 'Proto Slicks', icon: '🛞', desc: 'Prototype compound tires', baseCost: 250, costMult: 1.5, maxLevel: 10, speedBonus: 0.05 },
        { id: 'engine', name: 'V12 Power', icon: '⚙️', desc: 'V12 race engine', baseCost: 1250, costMult: 1.6, maxLevel: 10, speedBonus: 0.08 },
        { id: 'turbo', name: 'Quad Turbo', icon: '💨', desc: 'Quad-turbo setup', baseCost: 6250, costMult: 1.8, maxLevel: 5, speedBonus: 0.15 },
        { id: 'nitrous', name: 'Mega NOS', icon: '🔥', desc: 'Maximum nitrous system', baseCost: 25000, costMult: 2.0, maxLevel: 5, speedBonus: 0.20 },
        { id: 'rebuild', name: 'Proto Build', icon: '🏆', desc: 'Full prototype rebuild', baseCost: 125000, costMult: 2.5, maxLevel: 3, speedBonus: 0.30 },
      ],
      venue: [
        { id: 'seats', name: 'Mega Stand', icon: '💺', desc: 'Massive grandstand', baseCost: 375, costMult: 1.4, maxLevel: 10, viewerBonus: 25 },
        { id: 'comfySeats', name: 'Club Seats', icon: '🛋️', desc: 'Climate-controlled seats', baseCost: 1875, costMult: 1.6, maxLevel: 5, payMult: 0.15 },
        { id: 'premiumSeats', name: 'Penthouse', icon: '✨', desc: 'Penthouse suites', baseCost: 8750, costMult: 1.8, maxLevel: 5, payMult: 0.25 },
        { id: 'vipLounge', name: 'Owner Suite', icon: '🥂', desc: 'Owner-level luxury', baseCost: 37500, costMult: 2.0, maxLevel: 3, payMult: 0.50 },
        { id: 'liveStream', name: 'Global Stream', icon: '📡', desc: 'Global broadcast network', baseCost: 125000, costMult: 2.2, maxLevel: 3, viewerBonus: 100, payMult: 0.10 },
      ],
      racers: [
        { id: 'racer1', name: 'Rookie Challenger', icon: '🚗', desc: 'Hungry rookie', baseCost: 2500, payMult: 1.15, oneTime: true },
        { id: 'racer2', name: 'Series Veteran', icon: '🏎️', desc: 'Multi-time champion', baseCost: 12500, payMult: 1.30, oneTime: true },
        { id: 'racer3', name: 'Legend', icon: '🏁', desc: 'Hall of fame driver', baseCost: 62500, payMult: 1.50, oneTime: true },
        { id: 'racer4', name: 'Mega Star', icon: '⭐', desc: 'Global racing icon', baseCost: 250000, payMult: 2.0, oneTime: true },
        { id: 'racer5', name: 'World Team', icon: '🏢', desc: 'World championship team', baseCost: 1250000, payMult: 3.0, oneTime: true },
      ],
    },
  },
];

class Track {
  constructor(def, canvasWidth, canvasHeight) {
    this.def = def;
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.waypoints = def.waypoints.map(wp => ({
      x: wp.x * canvasWidth,
      y: wp.y * canvasHeight,
    }));
    this.trackWidthPx = def.trackWidth * Math.min(canvasWidth, canvasHeight);
    // Compute smoothed path and cumulative distances
    this.path = this.computeSmoothPath();
    this.length = this.computeLength();
    // Grandstand positions
    this.grandstands = this.computeGrandstands();
  }

  /**
   * Compute a smooth Catmull-Rom spline through waypoints
   */
  computeSmoothPath() {
    const wps = this.waypoints;
    const n = wps.length;
    const segments = 20; // points per segment
    const path = [];

    for (let i = 0; i < n; i++) {
      const p0 = wps[(i - 1 + n) % n];
      const p1 = wps[i];
      const p2 = wps[(i + 1) % n];
      const p3 = wps[(i + 2) % n];

      for (let j = 0; j < segments; j++) {
        const t = j / segments;
        const t2 = t * t;
        const t3 = t2 * t;

        const x = 0.5 * ((2 * p1.x) +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);

        const y = 0.5 * ((2 * p1.y) +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

        path.push({ x, y });
      }
    }

    return path;
  }

  /**
   * Compute cumulative distance along path
   */
  computeLength() {
    let total = 0;
    for (let i = 1; i < this.path.length; i++) {
      const dx = this.path[i].x - this.path[i - 1].x;
      const dy = this.path[i].y - this.path[i - 1].y;
      total += Math.sqrt(dx * dx + dy * dy);
    }
    // Close the loop
    const last = this.path[this.path.length - 1];
    const first = this.path[0];
    const dx = first.x - last.x;
    const dy = first.y - last.y;
    total += Math.sqrt(dx * dx + dy * dy);
    return total;
  }

  /**
   * Get position and angle at a given distance along the track
   */
  getPosition(distance) {
    const d = ((distance % this.length) + this.length) % this.length;
    const pathLen = this.path.length;

    // Find the segment
    let accumulated = 0;
    for (let i = 1; i <= pathLen; i++) {
      const idx = i % pathLen;
      const prevIdx = (i - 1) % pathLen;
      const dx = this.path[idx].x - this.path[prevIdx].x;
      const dy = this.path[idx].y - this.path[prevIdx].y;
      const segLen = Math.sqrt(dx * dx + dy * dy);

      if (accumulated + segLen >= d) {
        const t = (d - accumulated) / segLen;
        const x = this.path[prevIdx].x + dx * t;
        const y = this.path[prevIdx].y + dy * t;
        const angle = Math.atan2(dy, dx);
        return { x, y, angle };
      }
      accumulated += segLen;
    }

    // Fallback
    return { x: this.path[0].x, y: this.path[0].y, angle: 0 };
  }

  /**
   * Get track center at a given distance (for off-track detection)
   */
  getTrackCenter(distance) {
    return this.getPosition(distance);
  }

  /**
   * Compute grandstand positions
   */
  computeGrandstands() {
    const positions = [];
    const count = Math.max(4, Math.floor(this.waypoints.length / 2));

    for (let i = 0; i < count; i++) {
      const t = i / count;
      const dist = t * this.length;
      const pos = this.getPosition(dist);

      // Offset outward from track center
      const outwardAngle = pos.angle - Math.PI / 2;
      const offset = this.trackWidthPx * 0.8;

      positions.push({
        x: pos.x + Math.cos(outwardAngle) * offset,
        y: pos.y + Math.sin(outwardAngle) * offset,
        width: 40,
        height: 16,
      });
    }

    return positions;
  }

  /**
   * Draw the track
   */
  draw(ctx) {
    // Background
    ctx.fillStyle = this.def.color;
    ctx.fillRect(0, 0, this.width, this.height);

    // Grass texture
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    for (let i = 0; i < 300; i++) {
      const x = (i * 137.508) % this.width;
      const y = (i * 97.333) % this.height;
      ctx.fillRect(x, y, 2, 2);
    }

    // Draw track surface using path
    this.drawTrackSurface(ctx);

    // Draw track borders
    this.drawTrackBorders(ctx);

    // Draw start/finish line
    this.drawStartFinish(ctx);

    // Draw track name
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.def.name, this.width / 2, 20);
  }

  /**
   * Draw track surface
   */
  drawTrackSurface(ctx) {
    ctx.save();
    ctx.beginPath();
    this.drawPathOutline(ctx, 0);
    ctx.fillStyle = this.def.trackColor;
    ctx.fill('evenodd');
    ctx.restore();
  }

  /**
   * Draw track borders
   */
  drawTrackBorders(ctx) {
    ctx.save();
    // Outer border
    ctx.beginPath();
    this.drawPathOutline(ctx, this.trackWidthPx / 2);
    ctx.strokeStyle = this.def.borderColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner border
    ctx.beginPath();
    this.drawPathOutline(ctx, -this.trackWidthPx / 2);
    ctx.strokeStyle = this.def.borderColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center dashed line
    ctx.beginPath();
    this.drawPathOutline(ctx, 0);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 8]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  /**
   * Draw path outline with offset
   */
  drawPathOutline(ctx, offset) {
    const path = this.path;
    const n = path.length;

    for (let i = 0; i <= n; i++) {
      const idx = i % n;
      const prevIdx = (i - 1 + n) % n;
      const pos = path[idx];
      const prevPos = path[prevIdx];

      // Calculate normal
      const dx = pos.x - prevPos.x;
      const dy = pos.y - prevPos.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;

      const ox = pos.x + nx * offset;
      const oy = pos.y + ny * offset;

      if (i === 0) ctx.moveTo(ox, oy);
      else ctx.lineTo(ox, oy);
    }
    ctx.closePath();
  }

  /**
   * Draw start/finish line
   */
  drawStartFinish(ctx) {
    const startPos = this.getPosition(0);
    ctx.save();
    ctx.translate(startPos.x, startPos.y);
    ctx.rotate(startPos.angle + Math.PI / 2);

    const hw = this.trackWidthPx / 2;
    const strips = 7;
    const stripW = (hw * 2) / strips;

    for (let i = 0; i < strips; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#fff' : '#222';
      ctx.fillRect(-hw + i * stripW, -2, stripW, 4);
    }

    ctx.restore();
  }

  /**
   * Draw grandstands with viewers
   */
  drawGrandstands(ctx, viewerCount = 0) {
    for (const stand of this.grandstands) {
      // Structure
      ctx.fillStyle = '#8b7355';
      ctx.fillRect(stand.x - stand.width / 2, stand.y - stand.height / 2, stand.width, stand.height);

      // Roof
      ctx.fillStyle = '#6b5335';
      ctx.fillRect(stand.x - stand.width / 2 - 2, stand.y - stand.height / 2 - 3, stand.width + 4, 3);

      // Viewers
      const viewersHere = Math.floor(viewerCount / this.grandstands.length);
      const extra = viewerCount % this.grandstands.length;
      const idx = this.grandstands.indexOf(stand);
      const count = viewersHere + (idx < extra ? 1 : 0);

      const colors = ['#e94560', '#4ecca3', '#f9ed69', '#3498db', '#e74c3c', '#9b59b6'];
      for (let i = 0; i < Math.min(count, 16); i++) {
        const vx = stand.x - stand.width / 2 + 4 + (i % 4) * 8;
        const vy = stand.y - stand.height / 2 + 3 + Math.floor(i / 4) * 5;
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.arc(vx, vy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
