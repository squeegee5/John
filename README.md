# Marmoset Hang Glider

A mobile-friendly web game where you pilot a marmoset riding a Flying V guitar through the skies!

## Game Story

Guide your adventurous marmoset as they soar through the skies on a legendary Flying V guitar. Use thermal updrafts to gain altitude, pass through colorful checkpoints, land on precarious cliffs to catch your breath, and defend yourself against flying lizard enemies!

## Features

- **Unique Premise**: Play as a marmoset hang gliding on a Flying V guitar
- **Physics-Based Gliding**: Realistic gliding mechanics with gravity and lift
- **Thermal Updrafts**: Ride warm air currents to soar higher
- **Colorful Checkpoints**: Collect rainbow-colored checkpoint rings for points
- **Cliff Landing**: Carefully land on cliff platforms to rest and score bonus points
- **Weapon System**: Collect blasters to defend against enemies
- **Flying Lizard Enemies**: Battle dangerous flying lizards in the sky
- **Mobile-Optimized**: Touch controls designed for mobile devices
- **Score & Altitude Tracking**: Compete to reach the highest altitude and score

## How to Play

### Controls

**Mobile (Touch):**
- Touch the **left side** of the screen to steer left
- Touch the **right side** of the screen to steer right
- **Tap anywhere** to shoot (when you have a weapon)

**Desktop (Mouse):**
- Click and hold the **left side** to steer left
- Click and hold the **right side** to steer right
- **Click anywhere** to shoot (when you have a weapon)

### Gameplay Tips

1. **Build Speed for Lift**: Move side to side to generate lift and prevent falling
2. **Find Thermals**: Look for orange particle effects - these are thermal updrafts that will push you higher
3. **Collect Checkpoints**: Fly through the colorful glowing rings for 100 points each
4. **Land Carefully**: Approach cliffs slowly (low vertical speed) to land safely for 50 points
5. **Grab Weapons**: Collect orange weapon pickups to defend yourself
6. **Fight Lizards**: Shoot the green flying lizards before they hit you (200 points each)
7. **Avoid Collisions**: Hitting lizards will damage you and reduce your score

### Scoring

- **Checkpoint**: 100 points
- **Cliff Landing**: 50 points
- **Weapon Pickup**: 25 points
- **Defeat Flying Lizard**: 200 points
- **Altitude**: Track your maximum altitude reached!

## Running the Game

### Option 1: Open Directly in Browser

Simply open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge).

### Option 2: Local Web Server

For the best experience, especially on mobile, run a local web server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have http-server installed)
npx http-server -p 8000
```

Then open your browser to `http://localhost:8000`

### Option 3: Mobile Testing

To test on your mobile device:

1. Start a local web server on your computer (see Option 2)
2. Find your computer's local IP address
   - Mac/Linux: `ifconfig | grep inet`
   - Windows: `ipconfig`
3. On your mobile device, connect to the same WiFi network
4. Open your mobile browser to `http://[YOUR_IP]:8000`

## Technologies Used

- **HTML5 Canvas**: For rendering graphics
- **Vanilla JavaScript**: Game logic and physics
- **CSS3**: Responsive styling and UI
- **No dependencies**: Pure web technologies, no frameworks required!

## Game Mechanics

### Physics System
- Gravity pulls the marmoset down
- Horizontal movement generates lift (gliding)
- Air resistance (drag) slows movement
- Thermals provide strong upward force

### Enemy AI
- Flying lizards patrol in sine wave patterns
- They spawn from both sides of the screen
- Require 2 hits to defeat
- Collision damages the player

### Procedural Generation
- Thermals, checkpoints, cliffs, weapons, and enemies spawn randomly
- Spawn rates balanced for engaging gameplay
- Objects are cleaned up when they move off-screen

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari (iOS and macOS)
- Mobile browsers

## Future Enhancements

Potential features for future versions:
- Power-ups (shields, speed boosts, multi-shot)
- Different enemy types
- Boss battles
- Unlockable marmoset skins
- Leaderboard system
- Sound effects and background music
- Difficulty levels
- Endless mode vs. story mode

## Credits

Created with Claude AI for John's marmoset hang gliding adventure!

Enjoy your flight! 🎸🐒🪂
