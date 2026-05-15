# 🏁 Race Tycoon

A browser-based idle/tycoon game that mixes **Adventure Capitalist** mechanics with **2D racing**.

## How It Works

1. **Race** — Your car auto-races around the track (idle game style)
2. **Earn** — Viewers watch and pay per lap based on your lap time
3. **Upgrade** — Spend earnings on:
   - 🏎️ **Car upgrades** — Better tires, engine, turbo, nitrous, rebuild (faster auto-racer)
   - 🏟️ **Venue upgrades** — More seats, comfy seats, premium seats, VIP lounge, live stream (more viewers = more $)
   - 🏁 **Rival racers** — Local → Club → Pro → Celebrity → Rival team (more competition = more pay)
4. **Drive** — Switch to manual mode and complete a lap yourself (WASD/keyboard or virtual joystick on mobile)
5. **Unlock** — Max all upgrades + complete a manual lap → unlock the next track with a new car!

## 3 Unique Tracks

| Track | Name | Car | Description |
|-------|------|-----|-------------|
| T1 | Rookie Oval | Stock Car | Classic oval to start your career |
| T2 | Circuit Bend | Sport Car | Technical S-curves and chicanes |
| T3 | Pro Speedway | Prototype | The ultimate professional circuit |

## Controls

- **Auto Mode:** Cars race automatically, upgrades boost speed
- **Manual Mode:**
  - Desktop: `WASD` or `Arrow Keys` (W=accelerate, S=brake, A=steer left, D=steer right)
  - Mobile: Tap and drag on the canvas for virtual joystick control
- **Wall collision:** Hitting track walls slows you down

## Features

- **3 unique tracks** with waypoint-based smooth paths
- **3 car shapes** — Stock, Sport, Prototype (unlock as you progress)
- **4-directional steering** — accelerate, brake, steer left/right
- **Virtual joystick** for mobile touch controls
- **Idle gameplay** — Cars race automatically when not driving
- **Offline earnings** — Earn money while away (50% efficiency, 24hr cap)
- **Auto-save** — Progress saved every 30 seconds
- **Mobile-first** — Responsive design optimized for touchscreens
- **No dependencies** — Pure vanilla HTML5 Canvas + JavaScript

## Tech Stack

- HTML5 Canvas for rendering
- Catmull-Rom spline interpolation for smooth tracks
- Vanilla JavaScript (no frameworks)
- CSS Grid/Flexbox for responsive layout
- localStorage for persistence

## Playing

Open `index.html` in any modern browser, or serve with a local server:

```bash
cd race-tycoon
python3 -m http.server 8081
# Open http://localhost:8081
```

## License

MIT
