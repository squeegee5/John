// Marmoset Hang Glider Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Resize canvas to fill screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game State
const game = {
    running: false,
    score: 0,
    altitude: 0,
    maxAltitude: 0,
    touchX: null,
    touchY: null,
    cameraY: 0
};

// Player Class (Marmoset on Flying V Guitar)
class Player {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 200;
        this.width = 60;
        this.height = 50;
        this.velocityX = 0;
        this.velocityY = 0;
        this.gravity = 0.3;
        this.lift = -0.5;
        this.drag = 0.98;
        this.maxSpeed = 8;
        this.weapon = null;
        this.landed = false;
        this.angle = 0;
    }

    update() {
        // Apply gravity
        if (!this.landed) {
            this.velocityY += this.gravity;

            // Gliding physics - moving gives lift
            if (Math.abs(this.velocityX) > 2) {
                this.velocityY += this.lift * 0.3;
            }

            // Apply drag
            this.velocityX *= this.drag;
            this.velocityY *= 0.99;

            // Update position
            this.x += this.velocityX;
            this.y += this.velocityY;

            // Calculate angle based on velocity
            this.angle = Math.atan2(this.velocityY, this.velocityX) * 0.2;

            // Bounds checking
            if (this.x < 0) this.x = 0;
            if (this.x > canvas.width) this.x = canvas.width;

            // Update altitude
            game.altitude = Math.max(0, Math.floor((canvas.height - this.y + game.cameraY) / 10));
            if (game.altitude > game.maxAltitude) {
                game.maxAltitude = game.altitude;
            }

            // Game over if fall too low
            if (this.y > canvas.height + game.cameraY + 100) {
                endGame();
            }
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y - game.cameraY);
        ctx.rotate(this.angle);

        // Draw Flying V Guitar (simplified)
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.moveTo(-30, 0);
        ctx.lineTo(-15, -20);
        ctx.lineTo(15, -20);
        ctx.lineTo(30, 0);
        ctx.lineTo(15, 5);
        ctx.lineTo(-15, 5);
        ctx.closePath();
        ctx.fill();

        // Guitar details
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Marmoset body
        ctx.fillStyle = '#D2691E';
        ctx.beginPath();
        ctx.ellipse(0, -25, 12, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Marmoset head
        ctx.fillStyle = '#CD853F';
        ctx.beginPath();
        ctx.arc(0, -35, 10, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-4, -36, 2, 0, Math.PI * 2);
        ctx.arc(4, -36, 2, 0, Math.PI * 2);
        ctx.fill();

        // Tail
        ctx.strokeStyle = '#D2691E';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.quadraticCurveTo(15, -10, 20, -5);
        ctx.stroke();

        ctx.restore();
    }

    steer(direction) {
        if (!this.landed) {
            this.velocityX += direction * 0.5;
            if (this.velocityX > this.maxSpeed) this.velocityX = this.maxSpeed;
            if (this.velocityX < -this.maxSpeed) this.velocityX = -this.maxSpeed;
        }
    }

    shoot() {
        if (this.weapon) {
            projectiles.push(new Projectile(this.x, this.y - game.cameraY, this.velocityX));
        }
    }

    land() {
        this.landed = true;
        this.velocityX = 0;
        this.velocityY = 0;
    }

    takeOff() {
        this.landed = false;
        this.velocityY = -5;
    }
}

// Thermal Updraft Class
class Thermal {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = game.cameraY - Math.random() * 500 - 200;
        this.width = 100;
        this.height = 200;
        this.strength = 1.5;
        this.particles = [];
        this.active = true;

        // Create particles for visual effect
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: this.x + Math.random() * this.width,
                y: this.y + Math.random() * this.height,
                size: Math.random() * 3 + 1,
                speed: Math.random() * 2 + 1
            });
        }
    }

    update() {
        // Check collision with player
        if (player.x > this.x - this.width/2 && player.x < this.x + this.width/2 &&
            player.y > this.y && player.y < this.y + this.height) {
            player.velocityY -= this.strength;
        }

        // Update particles
        this.particles.forEach(p => {
            p.y -= p.speed;
            if (p.y < this.y) {
                p.y = this.y + this.height;
            }
        });

        // Remove if too far below camera
        if (this.y > game.cameraY + canvas.height + 200) {
            this.active = false;
        }
    }

    draw() {
        // Draw particles to show thermal
        ctx.fillStyle = 'rgba(255, 165, 0, 0.3)';
        this.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y - game.cameraY, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw thermal outline
        ctx.strokeStyle = 'rgba(255, 100, 0, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(this.x - this.width/2, this.y - game.cameraY, this.width, this.height);
        ctx.setLineDash([]);
    }
}

// Checkpoint Class
class Checkpoint {
    constructor() {
        this.x = Math.random() * (canvas.width - 100) + 50;
        this.y = game.cameraY - Math.random() * 400 - 300;
        this.width = 80;
        this.height = 15;
        this.collected = false;
        this.colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.pulse = 0;
    }

    update() {
        this.pulse += 0.1;

        // Check collision with player
        if (!this.collected &&
            player.x > this.x - this.width/2 && player.x < this.x + this.width/2 &&
            player.y > this.y - this.height/2 && player.y < this.y + this.height/2) {
            this.collected = true;
            game.score += 100;
        }

        // Remove if too far below camera
        if (this.y > game.cameraY + canvas.height + 200) {
            this.collected = true;
        }
    }

    draw() {
        if (!this.collected) {
            const size = this.width + Math.sin(this.pulse) * 5;
            ctx.fillStyle = this.color;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(this.x, this.y - game.cameraY, size/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;

            // Inner glow
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(this.x, this.y - game.cameraY, size/4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Cliff Class
class Cliff {
    constructor() {
        this.x = Math.random() * (canvas.width - 200) + 100;
        this.y = game.cameraY - Math.random() * 600 - 400;
        this.width = 150;
        this.height = 30;
        this.active = true;
    }

    update() {
        // Check if player can land
        if (player.y > this.y - 10 && player.y < this.y + 10 &&
            player.x > this.x && player.x < this.x + this.width &&
            Math.abs(player.velocityY) < 5) {
            player.y = this.y;
            player.land();
            game.score += 50;
        }

        // Remove if too far below camera
        if (this.y > game.cameraY + canvas.height + 200) {
            this.active = false;
        }
    }

    draw() {
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(this.x, this.y - game.cameraY, this.width, this.height);

        // Cliff details
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x + i * 30, this.y - game.cameraY);
            ctx.lineTo(this.x + i * 30, this.y - game.cameraY + this.height);
            ctx.stroke();
        }
    }
}

// Weapon Pickup Class
class WeaponPickup {
    constructor() {
        this.x = Math.random() * (canvas.width - 100) + 50;
        this.y = game.cameraY - Math.random() * 500 - 300;
        this.width = 30;
        this.height = 30;
        this.collected = false;
        this.rotation = 0;
    }

    update() {
        this.rotation += 0.1;

        // Check collision with player
        if (!this.collected &&
            Math.abs(player.x - this.x) < 30 &&
            Math.abs(player.y - this.y) < 30) {
            this.collected = true;
            player.weapon = 'blaster';
            game.score += 25;
        }

        // Remove if too far below camera
        if (this.y > game.cameraY + canvas.height + 200) {
            this.collected = true;
        }
    }

    draw() {
        if (!this.collected) {
            ctx.save();
            ctx.translate(this.x, this.y - game.cameraY);
            ctx.rotate(this.rotation);

            // Draw weapon icon
            ctx.fillStyle = '#FF4500';
            ctx.fillRect(-10, -5, 20, 10);
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(5, -8, 8, 16);

            ctx.restore();
        }
    }
}

// Projectile Class
class Projectile {
    constructor(x, y, velocityX) {
        this.x = x;
        this.y = y + game.cameraY;
        this.velocityX = velocityX + 10;
        this.velocityY = 0;
        this.active = true;
        this.width = 10;
        this.height = 4;
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Remove if off screen
        if (this.x < 0 || this.x > canvas.width ||
            this.y < game.cameraY - 100 || this.y > game.cameraY + canvas.height + 100) {
            this.active = false;
        }
    }

    draw() {
        ctx.fillStyle = '#00FFFF';
        ctx.fillRect(this.x - 5, this.y - game.cameraY - 2, this.width, this.height);

        // Glow effect
        ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.fillRect(this.x - 7, this.y - game.cameraY - 3, this.width + 4, this.height + 2);
    }
}

// Flying Lizard Enemy Class
class FlyingLizard {
    constructor() {
        this.x = Math.random() < 0.5 ? -50 : canvas.width + 50;
        this.y = game.cameraY - Math.random() * 400 - 200;
        this.width = 50;
        this.height = 30;
        this.velocityX = this.x < 0 ? 2 : -2;
        this.velocityY = Math.sin(Date.now() * 0.001) * 2;
        this.active = true;
        this.wingFlap = 0;
        this.health = 2;
    }

    update() {
        // Simple AI - fly in sine wave
        this.x += this.velocityX;
        this.y += Math.sin(this.wingFlap * 0.1) * 0.5;
        this.wingFlap += 0.2;

        // Check collision with player
        if (Math.abs(player.x - this.x) < 40 && Math.abs(player.y - this.y) < 30) {
            player.velocityY = 5;
            game.score -= 50;
            this.active = false;
        }

        // Check collision with projectiles
        projectiles.forEach(proj => {
            if (proj.active && Math.abs(proj.x - this.x) < 30 && Math.abs(proj.y - this.y) < 20) {
                proj.active = false;
                this.health--;
                if (this.health <= 0) {
                    this.active = false;
                    game.score += 200;
                }
            }
        });

        // Remove if off screen or too far below camera
        if (this.x < -100 || this.x > canvas.width + 100 ||
            this.y > game.cameraY + canvas.height + 200) {
            this.active = false;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y - game.cameraY);

        const wingAngle = Math.sin(this.wingFlap) * 0.3;

        // Wings
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.ellipse(-15, 0, 20, 10, -wingAngle, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(15, 0, 20, 10, wingAngle, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(-15, -8, 30, 16);

        // Head
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.moveTo(15, -8);
        ctx.lineTo(25, -4);
        ctx.lineTo(25, 4);
        ctx.lineTo(15, 8);
        ctx.closePath();
        ctx.fill();

        // Eye
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(20, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// Game Objects
let player = new Player();
let thermals = [];
let checkpoints = [];
let cliffs = [];
let weapons = [];
let projectiles = [];
let enemies = [];

// Spawn game objects
function spawnObjects() {
    // Spawn thermals
    if (Math.random() < 0.02 && game.running) {
        thermals.push(new Thermal());
    }

    // Spawn checkpoints
    if (Math.random() < 0.015 && game.running) {
        checkpoints.push(new Checkpoint());
    }

    // Spawn cliffs
    if (Math.random() < 0.01 && game.running) {
        cliffs.push(new Cliff());
    }

    // Spawn weapons
    if (Math.random() < 0.008 && game.running) {
        weapons.push(new WeaponPickup());
    }

    // Spawn enemies
    if (Math.random() < 0.02 && game.running) {
        enemies.push(new FlyingLizard());
    }

    // Clean up inactive objects
    thermals = thermals.filter(t => t.active);
    checkpoints = checkpoints.filter(c => !c.collected);
    cliffs = cliffs.filter(c => c.active);
    weapons = weapons.filter(w => !w.collected);
    projectiles = projectiles.filter(p => p.active);
    enemies = enemies.filter(e => e.active);
}

// Update game camera
function updateCamera() {
    // Camera follows player, moving up as they climb
    const targetY = player.y - canvas.height * 0.7;
    if (targetY < game.cameraY) {
        game.cameraY = targetY;
    }
}

// Touch/Mouse Controls
let touchStartX = null;
let shootCooldown = 0;

canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    game.touchX = touch.clientX;
    game.touchY = touch.clientY;

    // Shoot on tap
    if (shootCooldown <= 0) {
        player.shoot();
        shootCooldown = 20;
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    game.touchX = touch.clientX;

    // Steer based on touch position
    if (touch.clientX < canvas.width / 3) {
        player.steer(-1);
    } else if (touch.clientX > canvas.width * 2 / 3) {
        player.steer(1);
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    touchStartX = null;
    game.touchX = null;
}

function handleMouseDown(e) {
    game.touchX = e.clientX;
    touchStartX = e.clientX;
    if (shootCooldown <= 0) {
        player.shoot();
        shootCooldown = 20;
    }
}

function handleMouseMove(e) {
    if (touchStartX !== null) {
        game.touchX = e.clientX;
        if (e.clientX < canvas.width / 3) {
            player.steer(-1);
        } else if (e.clientX > canvas.width * 2 / 3) {
            player.steer(1);
        }
    }
}

function handleMouseUp(e) {
    touchStartX = null;
    game.touchX = null;
}

// Draw background
function drawBackground() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1e3a8a');
    gradient.addColorStop(0.5, '#3b82f6');
    gradient.addColorStop(1, '#87CEEB');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 5; i++) {
        const cloudY = (i * 200 + game.cameraY * 0.5) % canvas.height;
        ctx.beginPath();
        ctx.arc(100 + i * 150, cloudY, 30, 0, Math.PI * 2);
        ctx.arc(130 + i * 150, cloudY, 40, 0, Math.PI * 2);
        ctx.arc(160 + i * 150, cloudY, 30, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Update HUD
function updateHUD() {
    document.getElementById('score').textContent = game.score;
    document.getElementById('altitude').textContent = game.altitude;
    document.getElementById('weapon').textContent = player.weapon || 'None';
}

// Game Loop
function gameLoop() {
    if (!game.running) return;

    // Update
    player.update();
    updateCamera();
    spawnObjects();

    thermals.forEach(t => t.update());
    checkpoints.forEach(c => c.update());
    cliffs.forEach(c => c.update());
    weapons.forEach(w => w.update());
    projectiles.forEach(p => p.update());
    enemies.forEach(e => e.update());

    if (shootCooldown > 0) shootCooldown--;

    // Draw
    drawBackground();

    thermals.forEach(t => t.draw());
    checkpoints.forEach(c => c.draw());
    cliffs.forEach(c => c.draw());
    weapons.forEach(w => w.draw());
    projectiles.forEach(p => p.draw());
    enemies.forEach(e => e.draw());

    player.draw();

    updateHUD();

    requestAnimationFrame(gameLoop);
}

// Start Game
function startGame() {
    game.running = true;
    game.score = 0;
    game.altitude = 0;
    game.maxAltitude = 0;
    game.cameraY = 0;

    player = new Player();
    thermals = [];
    checkpoints = [];
    cliffs = [];
    weapons = [];
    projectiles = [];
    enemies = [];

    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-over-screen').style.display = 'none';

    gameLoop();
}

// End Game
function endGame() {
    game.running = false;
    document.getElementById('final-score').textContent = game.score;
    document.getElementById('final-altitude').textContent = game.maxAltitude;
    document.getElementById('game-over-screen').style.display = 'flex';
}

// Event Listeners
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);
