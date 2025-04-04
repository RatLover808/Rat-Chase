document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const player = document.createElement('div');
    player.id = 'player';
    gameBoard.appendChild(player);
    
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('level');
    const timeDisplay = document.getElementById('time');
    const livesDisplay = document.getElementById('lives');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const gameOverScreen = document.getElementById('game-over');
    const finalScoreDisplay = document.getElementById('final-score');
    const finalLevelDisplay = document.getElementById('final-level');
    
    let score = 0;
    let level = 1;
    let time = 30;
    let lives = 3;
    let gameInterval;
    let timeInterval;
    let isGameRunning = false;
    let cheeses = [];
    let cats = [];
    let playerPosition = { x: 180, y: 180 };
    let keysPressed = {};
    
    // Game configuration by level
    const levelConfig = {
        1: { cats: 2, speed: 2, spawnRate: 0.02, cheesePoints: 10 },
        2: { cats: 3, speed: 2.5, spawnRate: 0.025, cheesePoints: 15 },
        3: { cats: 4, speed: 3, spawnRate: 0.03, cheesePoints: 20 },
        4: { cats: 5, speed: 3.5, spawnRate: 0.035, cheesePoints: 25 },
        5: { cats: 6, speed: 4, spawnRate: 0.04, cheesePoints: 30 }
    };
    
    // Initialize player position
    player.style.left = `${playerPosition.x}px`;
    player.style.top = `${playerPosition.y}px`;
    
    // Event listeners for keyboard controls
    document.addEventListener('keydown', (e) => {
        keysPressed[e.key] = true;
    });
    
    document.addEventListener('keyup', (e) => {
        keysPressed[e.key] = false;
    });
    
    // Start game button
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    
    function startGame() {
        if (isGameRunning) return;
        
        // Reset game state
        score = 0;
        level = 1;
        time = 30;
        lives = 3;
        scoreDisplay.textContent = score;
        levelDisplay.textContent = level;
        timeDisplay.textContent = time;
        livesDisplay.textContent = lives;
        
        // Clear existing elements
        cheeses.forEach(cheese => cheese.element.remove());
        cats.forEach(cat => cat.element.remove());
        cheeses = [];
        cats = [];
        
        // Reset player position
        playerPosition = { x: 180, y: 180 };
        player.style.left = `${playerPosition.x}px`;
        player.style.top = `${playerPosition.y}px`;
        
        // Hide game over screen and start button
        gameOverScreen.classList.add('hidden');
        startBtn.classList.add('hidden');
        
        isGameRunning = true;
        
        // Start game loop
        gameInterval = setInterval(updateGame, 100);
        
        // Start timer
        startLevelTimer();
        
        // Spawn initial cheese and cats
        spawnCheese();
        spawnInitialCats();
    }
    
    function startLevelTimer() {
        clearInterval(timeInterval);
        time = 30;
        timeDisplay.textContent = time;
        
        timeInterval = setInterval(() => {
            time--;
            timeDisplay.textContent = time;
            
            if (time <= 0) {
                levelUp();
            }
        }, 1000);
    }
    
    function levelUp() {
        if (level >= 5) {
            endGame(true); // Player won
            return;
        }
        
        level++;
        levelDisplay.textContent = level;
        
        // Show level up message
        const levelUpMsg = document.createElement('div');
        levelUpMsg.className = 'level-up';
        levelUpMsg.textContent = `Level ${level}!`;
        gameBoard.appendChild(levelUpMsg);
        
        // Remove message after animation
        setTimeout(() => {
            levelUpMsg.remove();
        }, 3000);
        
        // Clear existing cats
        cats.forEach(cat => cat.element.remove());
        cats = [];
        
        // Spawn cats for new level
        spawnInitialCats();
        
        // Reset timer for new level
        startLevelTimer();
    }
    
    function updateGame() {
        movePlayer();
        moveCats();
        checkCollisions();
        
        // Randomly spawn new cheese based on level spawn rate
        if (Math.random() < levelConfig[level].spawnRate && cheeses.length < 8) {
            spawnCheese();
        }
    }
    
    function movePlayer() {
        const speed = 10;
        
        if (keysPressed['ArrowUp'] && playerPosition.y > 0) {
            playerPosition.y -= speed;
        }
        if (keysPressed['ArrowDown'] && playerPosition.y < 370) {
            playerPosition.y += speed;
        }
        if (keysPressed['ArrowLeft'] && playerPosition.x > 0) {
            playerPosition.x -= speed;
            player.style.transform = 'scaleX(-1)';
        }
        if (keysPressed['ArrowRight'] && playerPosition.x < 360) {
            playerPosition.x += speed;
            player.style.transform = 'scaleX(1)';
        }
        
        player.style.left = `${playerPosition.x}px`;
        player.style.top = `${playerPosition.y}px`;
    }
    
    function spawnCheese() {
        const cheese = document.createElement('div');
        cheese.className = 'cheese';
        
        const x = Math.random() * 370;
        const y = Math.random() * 370;
        
        cheese.style.left = `${x}px`;
        cheese.style.top = `${y}px`;
        
        gameBoard.appendChild(cheese);
        
        cheeses.push({
            element: cheese,
            x: x,
            y: y
        });
    }
    
    function spawnInitialCats() {
        for (let i = 0; i < levelConfig[level].cats; i++) {
            spawnCat();
        }
    }
    
    function spawnCat() {
        const cat = document.createElement('div');
        const catType = Math.floor(Math.random() * 5) + 1;
        cat.className = `cat cat-${catType}`;
        
        // Spawn cats at edges
        let x, y;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 : 360;
            y = Math.random() * 360;
        } else {
            x = Math.random() * 360;
            y = Math.random() < 0.5 ? 0 : 360;
        }
        
        cat.style.left = `${x}px`;
        cat.style.top = `${y}px`;
        
        gameBoard.appendChild(cat);
        
        const speed = levelConfig[level].speed;
        const angle = Math.random() * Math.PI * 2;
        
        cats.push({
            element: cat,
            x: x,
            y: y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            type: catType
        });
    }
    
    function moveCats() {
        cats.forEach(cat => {
            // Update position
            cat.x += cat.dx;
            cat.y += cat.dy;
            
            // Bounce off walls
            if (cat.x <= 0 || cat.x >= 360) {
                cat.dx *= -1;
                cat.x = cat.x <= 0 ? 0 : 360;
            }
            if (cat.y <= 0 || cat.y >= 360) {
                cat.dy *= -1;
                cat.y = cat.y <= 0 ? 0 : 360;
            }
            
            // Occasionally change direction
            if (Math.random() < 0.02) {
                const angle = Math.random() * Math.PI * 2;
                const speed = levelConfig[level].speed;
                cat.dx = Math.cos(angle) * speed;
                cat.dy = Math.sin(angle) * speed;
            }
            
            // Slightly chase player (more aggressive in higher levels)
            if (Math.random() < 0.05 + (level * 0.01)) {
                const dx = playerPosition.x - cat.x;
                const dy = playerPosition.y - cat.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 0) {
                    const chaseFactor = 0.05 + (level * 0.01);
                    cat.dx += (dx / distance) * chaseFactor;
                    cat.dy += (dy / distance) * chaseFactor;
                    
                    // Normalize speed
                    const currentSpeed = Math.sqrt(cat.dx * cat.dx + cat.dy * cat.dy);
                    const maxSpeed = levelConfig[level].speed * 1.5;
                    if (currentSpeed > maxSpeed) {
                        cat.dx = (cat.dx / currentSpeed) * maxSpeed;
                        cat.dy = (cat.dy / currentSpeed) * maxSpeed;
                    }
                }
            }
            
            cat.element.style.left = `${cat.x}px`;
            cat.element.style.top = `${cat.y}px`;
        });
    }
    
    function checkCollisions() {
        // Check cheese collisions
        cheeses.forEach((cheese, index) => {
            const distance = Math.sqrt(
                Math.pow(playerPosition.x + 15 - (cheese.x + 12.5), 2) + 
                Math.pow(playerPosition.y + 15 - (cheese.y + 12.5), 2)
            );
            
            if (distance < 20) { // Collision detected
                cheese.element.remove();
                cheeses.splice(index, 1);
                score += levelConfig[level].cheesePoints;
                scoreDisplay.textContent = score;
                
                // Play sound (optional)
                playSound('cheese');
                
                // Spawn new cheese
                if (Math.random() < 0.7) spawnCheese();
            }
        });
        
        // Check cat collisions
        cats.forEach(cat => {
            const distance = Math.sqrt(
                Math.pow(playerPosition.x + 15 - (cat.x + 20), 2) + 
                Math.pow(playerPosition.y + 15 - (cat.y + 20), 2)
            );
            
            if (distance < 25) { // Collision detected
                lives--;
                livesDisplay.textContent = lives;
                
                // Play sound (optional)
                playSound('cat');
                
                // Flash the player
                player.style.filter = 'brightness(2)';
                setTimeout(() => {
                    player.style.filter = '';
                }, 200);
                
                // Reset player position
                playerPosition = { x: 180, y: 180 };
                player.style.left = `${playerPosition.x}px`;
                player.style.top = `${playerPosition.y}px`;
                
                if (lives <= 0) {
                    endGame(false);
                }
            }
        });
    }
    
    function playSound(type) {
        // In a real game, you'd want to use actual sound files
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            if (type === 'cheese') {
                oscillator.type = 'triangle';
                oscillator.frequency.value = 800;
                gainNode.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.3);
                oscillator.start();
                oscillator.stop(ctx.currentTime + 0.3);
            } else if (type === 'cat') {
                oscillator.type = 'sawtooth';
                oscillator.frequency.value = 200;
                gainNode.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.5);
                oscillator.start();
                oscillator.stop(ctx.currentTime + 0.5);
            }
        } catch (e) {
            console.log('Audio not supported');
        }
    }
    
    function endGame(victory) {
        clearInterval(gameInterval);
        clearInterval(timeInterval);
        isGameRunning = false;
        
        finalScoreDisplay.textContent = score;
        finalLevelDisplay.textContent = level;
        
        if (victory) {
            const gameOverTitle = gameOverScreen.querySelector('h2');
            gameOverTitle.textContent = 'You Won!';
            gameOverTitle.style.color = '#2ecc71';
        } else {
            const gameOverTitle = gameOverScreen.querySelector('h2');
            gameOverTitle.textContent = 'Game Over!';
            gameOverTitle.style.color = '#e74c3c';
        }
        
        gameOverScreen.classList.remove('hidden');
        startBtn.classList.remove('hidden');
    }
});