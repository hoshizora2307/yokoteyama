document.addEventListener('DOMContentLoaded', () => {
    const gameScreen = document.getElementById('game-screen');
    const gameBGM = document.getElementById('game-bgm');
    const gameCanvas = document.getElementById('gameCanvas');
    const ctx = gameCanvas.getContext('2d');
    
    // UI要素
    const playerLevelDisplay = document.getElementById('player-level');
    const playerExpDisplay = document.getElementById('player-exp');
    const playerMaxExpDisplay = document.getElementById('player-max-exp');
    const levelUpPopup = document.getElementById('level-up-popup');
    const levelUpNumber = document.getElementById('level-up-number');
    
    // プレイヤー画像
    const playerImage = new Image();
    playerImage.src = 'takase02.png';
    
    // お助けキャラ画像
    const helperImage = new Image();
    helperImage.src = 'saisu01.png';

    let assetsLoadedCount = 0;
    const totalAssets = 2; // takase02.png, saisu01.png
    let isGameStarted = false; // ゲームが開始されたかどうかのフラグ

    function assetLoaded() {
        assetsLoadedCount++;
        if (assetsLoadedCount === totalAssets) {
            console.log("All assets loaded. Waiting for user interaction to start game.");
        }
    }
    
    playerImage.onload = assetLoaded;
    playerImage.onerror = () => { console.error("Failed to load player image: takase02.png"); assetLoaded(); };
    helperImage.onload = assetLoaded;
    helperImage.onerror = () => { console.error("Failed to load helper image: saisu01.png"); assetLoaded(); };
    
    function resizeCanvas() {
        const aspectRatio = 800 / 400;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        let newWidth, newHeight;

        if (windowWidth / windowHeight > aspectRatio) {
            newHeight = windowHeight * 0.9;
            newWidth = newHeight * aspectRatio;
        } else {
            newWidth = windowWidth * 0.9;
            newHeight = newWidth / aspectRatio;
        }

        gameCanvas.width = newWidth;
        gameCanvas.height = newHeight;
        
        player.x = gameCanvas.width / 5;
        player.y = gameCanvas.height - player.height;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const player = {
        x: gameCanvas.width / 5,
        y: gameCanvas.height - 50,
        width: 40,
        height: 40,
        velocityY: 0,
        isJumping: false,
        isAttacking: false,
        attackTimer: 0,
        speed: 5,
        level: 1,
        exp: 0,
        maxExp: 100,
        attackPower: 1,
        jumpPower: 1,
        isInvincible: false,
        flickerTimer: 0
    };

    const helper = {
        x: 0,
        y: 0,
        width: 30,
        height: 30,
        isVisible: false,
        displayTimer: 0,
        respawnTimer: 0,
        initialRespawnTime: 60 * 60
    };
    helper.respawnTimer = helper.initialRespawnTime;


    const background = {
        x: 0,
        speed: 1
    };

    const touch = {
        moveRight: false,
        moveLeft: false,
        isJumping: false
    };

    function levelUp() {
        player.level++;
        player.exp -= player.maxExp;
        player.maxExp = Math.floor(player.maxExp * 1.5);
        
        player.attackPower++;
        player.jumpPower += 0.1;

        levelUpNumber.textContent = player.level;
        levelUpPopup.classList.add('visible');
        
        setTimeout(() => {
            levelUpPopup.classList.remove('visible');
        }, 2000);
    }

    function updateUI() {
        if (playerLevelDisplay && playerExpDisplay && playerMaxExpDisplay) {
            playerLevelDisplay.textContent = player.level;
            playerExpDisplay.textContent = player.exp;
            playerMaxExpDisplay.textContent = player.maxExp;
        }
    }

    gameCanvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touchX = e.touches[0].clientX;
        const canvasRect = gameCanvas.getBoundingClientRect();
        const touchPos = (touchX - canvasRect.left) / canvasRect.width;

        if (touchPos > 0.6) {
            touch.moveRight = true;
        } else if (touchPos < 0.4) {
            touch.moveLeft = true;
        }
    });

    gameCanvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        touch.moveRight = false;
        touch.moveLeft = false;
    });

    const jumpButton = document.getElementById('jump-button');
    if (jumpButton) {
        jumpButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!player.isJumping) {
                player.isJumping = true;
                player.velocityY = -gameCanvas.height / (25 / player.jumpPower);
            }
        });
    }
    
    const attackButton = document.getElementById('attack-button');
    if (attackButton) {
        attackButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!player.isAttacking) {
                player.isAttacking = true;
                player.attackTimer = 15;
                
                player.exp += 20;
                if (player.exp >= player.maxExp) {
                    levelUp();
                }
            }
        });
    }

    function update() {
        if (touch.moveRight) {
            background.x -= background.speed;
        }
        if (touch.moveLeft) {
            background.x += background.speed;
        }

        player.y += player.velocityY;
        player.velocityY += gameCanvas.height / 500;

        if (player.y > gameCanvas.height - player.height) {
            player.y = gameCanvas.height - player.height;
            player.isJumping = false;
            player.velocityY = 0;
        }
        
        if (player.isAttacking) {
            player.attackTimer--;
            if (player.attackTimer <= 0) {
                player.isAttacking = false;
            }
        }

        if (helper.isVisible) {
            helper.displayTimer--;
            if (helper.displayTimer <= 0) {
                helper.isVisible = false;
                player.isInvincible = false;
                helper.respawnTimer = helper.initialRespawnTime + Math.random() * 60 * 30;
            } else {
                player.isInvincible = true;
                player.flickerTimer++;
            }
        } else {
            helper.respawnTimer--;
            if (helper.respawnTimer <= 0) {
                helper.isVisible = true;
                helper.displayTimer = 60 * 1.5;
                helper.x = player.x + (Math.random() * player.width * 2) - (player.width / 2);
                helper.y = player.y - (Math.random() * player.height) - helper.height;
                if (helper.y < 0) helper.y = 0;
                if (helper.x < 0) helper.x = 0;
                if (helper.x + helper.width > gameCanvas.width) helper.x = gameCanvas.width - helper.width;
            }
        }

        updateUI();
    }

    function draw() {
        ctx.fillStyle = '#5c628f';
        ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        
        ctx.fillStyle = '#4682b4';
        ctx.fillRect(0, gameCanvas.height - 10, gameCanvas.width, 10);
        
        if (player.isInvincible && Math.floor(player.flickerTimer / 5) % 2 === 0) {
        } else {
            ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
        }
        
        if (player.isAttacking) {
            ctx.font = `${player.height * 0.8}px Arial`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText('⭐', player.x + player.width + 5, player.y + player.height / 2);
        }

        if (helper.isVisible) {
            ctx.drawImage(helperImage, helper.x, helper.y, helper.width, helper.height);
        }
    }

    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
    
    function startGame() {
        if (isGameStarted) return;
        isGameStarted = true;

        // BGMを再生
        gameBGM.play().catch(e => {
            console.error("BGM再生に失敗しました", e);
        });
        gameLoop();
    }

    // ユーザー操作を待ってゲームを開始
    document.body.addEventListener('touchstart', startGame, { once: true });

    // HTMLが読み込まれたらゲーム画面をアクティブにする
    gameScreen.classList.add('active');
});
