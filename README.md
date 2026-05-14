# 🏁 Race Tycoon

A browser-based idle/tycoon game that mixes **Adventure Capitalist** mechanics with **2D top-down racing**.

## How It Works

1. **Race** — Your car auto-races around an oval track (idle game style)
2. **Earn** — Viewers watch and pay per lap based on your lap time
3. **Upgrade** — Spend earnings on:
   - 🏎️ **Car upgrades** — Better tires, engine, turbo, nitrous, full rebuild (faster car = better lap times = more $/viewer)
   - 🏟️ **Venue upgrades** — More seats, comfy seats, premium seats, VIP lounge, live stream (more viewers = more $)
   - 🏁 **Rival racers** — Local hobbyist → Club racer → Pro → Celebrity → Rival team (more competition = more pay)
4. **Repeat** — The cycle compounds: faster car → better times → more money → more upgrades

## Income Formula

```
Revenue per lap = Viewers × BasePay × SpeedMultiplier × SeatMultiplier × RacerMultiplier
```

## Features

- **Idle gameplay** — Cars race automatically, money accumulates over time
- **Offline earnings** — Earn money while away (50% efficiency, capped at 24 hours)
- **Auto-save** — Progress saved every 30 seconds to localStorage
- **Mobile-first** — Responsive design optimized for touchscreens
- **No dependencies** — Pure vanilla HTML5 Canvas + JavaScript

## Tech Stack

- HTML5 Canvas for rendering
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

## Upgrade Trees

### Car (Speed)
| Upgrade | Effect | Levels |
|---------|--------|--------|
| Better Tires | +5% speed per level | 10 |
| Engine Tune | +8% speed per level | 10 |
| Turbocharger | +15% speed per level | 5 |
| Nitrous System | +20% speed per level | 5 |
| Full Rebuild | +30% speed per level | 3 |

### Venue (Viewers & Pay)
| Upgrade | Effect | Levels |
|---------|--------|--------|
| More Seats | +10 viewers per level | 10 |
| Comfortable Seats | +15% pay/viewer | 5 |
| Premium Seats | +25% pay/viewer | 5 |
| VIP Lounge | +50% pay/viewer | 3 |
| Live Stream | +30 viewers, +10% pay | 3 |

### Racers (Competition Bonus)
| Racer | Pay Bonus | One-time |
|-------|-----------|----------|
| Local Hobbyist | +15% | ✓ |
| Club Racer | +30% | ✓ |
| Pro Driver | +50% | ✓ |
| Celebrity Racer | +100% | ✓ |
| Rival Team | +200% | ✓ |

## License

MIT
