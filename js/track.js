/**
 * Track module - defines the oval racing track geometry
 */

class Track {
  constructor(canvasWidth, canvasHeight) {
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.cx = canvasWidth / 2;
    this.cy = canvasHeight / 2;
    
    // Track dimensions (proportional to canvas)
    const scale = Math.min(canvasWidth, canvasHeight) / 400;
    this.outerRx = 160 * scale;  // outer horizontal radius
    this.outerRy = 110 * scale;  // outer vertical radius
    this.trackWidth = 32 * scale; // track width
    this.innerRx = this.outerRx - this.trackWidth;
    this.innerRy = this.outerRy - this.trackWidth;
    
    // Straight section length (angle in radians)
    this.straightAngle = Math.PI * 0.35;
    
    // Calculate track length for lap tracking
    this.length = this.calculateLength();
    
    // Grandstand positions
    this.grandstands = this.calculateGrandstands();
  }

  /**
   * Get position on track center path at given distance
   * @param {number} distance - Distance along track (0 to this.length)
   * @returns {{x: number, y: number, angle: number}}
   */
  getPosition(distance) {
    const t = (distance % this.length) / this.length;
    const angle = t * Math.PI * 2;
    
    // Oval parameterization
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    // Blend between circle and ellipse for oval shape
    const rx = this.outerRx - this.trackWidth / 2;
    const ry = this.outerRy - this.trackWidth / 2;
    
    // Flatten the sides for a more oval look
    const flatten = 0.15;
    const flatX = rx * (cos + flatten * Math.sign(cos) * cos * cos);
    const flatY = ry * sin;
    
    const x = this.cx + flatX;
    const y = this.cy + flatY;
    
    // Calculate tangent angle for car orientation
    const dt = 0.01;
    const nextAngle = (t + dt) * Math.PI * 2;
    const nextCos = Math.cos(nextAngle);
    const nextSin = Math.sin(nextAngle);
    const nextX = this.cx + rx * (nextCos + flatten * Math.sign(nextCos) * nextCos * nextCos);
    const nextY = this.cy + ry * nextSin;
    
    const tangentAngle = Math.atan2(nextY - y, nextX - x);
    
    return { x, y, angle: tangentAngle };
  }

  /**
   * Calculate approximate track length
   */
  calculateLength() {
    const rx = this.outerRx - this.trackWidth / 2;
    const ry = this.outerRy - this.trackWidth / 2;
    // Ramanujan's approximation for ellipse circumference
    const h = Math.pow(rx - ry, 2) / Math.pow(rx + ry, 2);
    return Math.PI * (rx + ry) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
  }

  /**
   * Calculate grandstand positions for viewer rendering
   */
  calculateGrandstands() {
    const positions = [];
    const count = 4; // 4 grandstands around the track
    
    for (let i = 0; i < count; i++) {
      const t = i / count + 0.125; // offset from track center
      const angle = t * Math.PI * 2;
      
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      
      // Position outside the track
      const rx = this.outerRx + 20;
      const ry = this.outerRy + 20;
      
      positions.push({
        x: this.cx + rx * cos,
        y: this.cy + ry * sin,
        width: 50,
        height: 20
      });
    }
    
    return positions;
  }

  /**
   * Draw the track on canvas
   */
  draw(ctx) {
    // Draw grass background
    ctx.fillStyle = '#2d5a27';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw grass texture (subtle dots)
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    for (let i = 0; i < 200; i++) {
      const x = (i * 137.5) % this.width;
      const y = (i * 97.3) % this.height;
      ctx.fillRect(x, y, 2, 2);
    }
    
    // Draw outer track boundary
    this.drawOval(ctx, this.outerRx, this.outerRy, '#555', 2);
    
    // Draw inner track boundary
    this.drawOval(ctx, this.innerRx, this.innerRy, '#555', 2);
    
    // Draw track surface
    this.drawOvalFill(ctx, this.outerRx, this.outerRy, '#444');
    this.drawOvalFill(ctx, this.innerRx, this.innerRy, '#2d5a27');
    
    // Draw start/finish line
    const startPos = this.getPosition(0);
    ctx.save();
    ctx.translate(startPos.x, startPos.y);
    ctx.rotate(startPos.angle + Math.PI / 2);
    ctx.fillStyle = '#fff';
    for (let i = -3; i <= 3; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#fff' : '#222';
      ctx.fillRect(i * 4, -this.trackWidth / 2, 4, this.trackWidth);
    }
    ctx.restore();
    
    // Draw grandstands
    this.drawGrandstands(ctx);
  }

  /**
   * Draw an oval outline
   */
  drawOval(ctx, rx, ry, color, lineWidth) {
    ctx.save();
    ctx.translate(this.cx, this.cy);
    ctx.beginPath();
    
    const flatten = 0.15;
    for (let i = 0; i <= 360; i++) {
      const angle = (i * Math.PI) / 180;
      const cos = Math.cos(angle);
      const x = rx * (cos + flatten * Math.sign(cos) * cos * cos);
      const y = ry * Math.sin(angle);
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Draw a filled oval (for track surface)
   */
  drawOvalFill(ctx, rx, ry, color) {
    ctx.save();
    ctx.translate(this.cx, this.cy);
    ctx.beginPath();
    
    const flatten = 0.15;
    for (let i = 0; i <= 360; i++) {
      const angle = (i * Math.PI) / 180;
      const cos = Math.cos(angle);
      const x = rx * (cos + flatten * Math.sign(cos) * cos * cos);
      const y = ry * Math.sin(angle);
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  /**
   * Draw grandstands with viewers
   */
  drawGrandstands(ctx, viewerCount = 0) {
    for (const stand of this.grandstands) {
      // Grandstand structure
      ctx.fillStyle = '#8b7355';
      ctx.fillRect(stand.x - stand.width / 2, stand.y - stand.height / 2, stand.width, stand.height);
      
      // Roof
      ctx.fillStyle = '#6b5335';
      ctx.fillRect(stand.x - stand.width / 2 - 2, stand.y - stand.height / 2 - 4, stand.width + 4, 4);
      
      // Draw viewers as colored dots
      const viewersHere = Math.floor(viewerCount / this.grandstands.length);
      const extra = viewerCount % this.grandstands.length;
      const count = viewersHere + (this.grandstands.indexOf(stand) < extra ? 1 : 0);
      
      const colors = ['#e94560', '#4ecca3', '#f9ed69', '#3498db', '#e74c3c', '#9b59b6'];
      for (let i = 0; i < Math.min(count, 20); i++) {
        const vx = stand.x - stand.width / 2 + 5 + (i % 5) * 9;
        const vy = stand.y - stand.height / 2 + 4 + Math.floor(i / 5) * 7;
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.arc(vx, vy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
