document.addEventListener('DOMContentLoaded', () => {
    const openingScreen = document.getElementById('opening-screen');
    const gameScreen = document.getElementById('game-screen');
    const startButton = document.getElementById('start-button');
    const openingBGM = document.getElementById('opening-bgm');
    const gameBGM = document.getElementById('game-bgm');
    const gameCanvas = document.getElementById('gameCanvas');
    const ctx = gameCanvas.getContext('2d');
    
    // UI要素
    const playerLevelDisplay = document.getElementById('player-level');
    const playerExpDisplay = document.getElementById('player-exp');
    const playerMaxExpDisplay = document.getElementById('player-max-exp');
    
    const playerImage = new Image();
    playerImage.src = 'takase02.png';
    let assetsLoaded = false; 

    // 画面サイズに合わせてキャンバスを調整
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

    // プレイヤーオブジェクト
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
        // レベルアップ関連のプロパティ
        level: 1,
        exp: 0,
        maxExp: 100,
        attackPower: 1,
        jumpPower: 1
    };

    // 背景オブジェクト
    const background = {
        x: 0,
        speed: 1
    };

    // タッチ入力の状態
    const touch = {
        moveRight: false,
        moveLeft: false,
        isJumping: false
    };

    // レベルアップの関数
    function levelUp() {
        player.level++;
        player.exp -= player.maxExp;
        player.maxExp = Math.floor(player.maxExp * 1.5); // 必要な経験値を1.5倍に
        
        // 能力値の強化
        player.attackPower++;
        player.jumpPower += 0.1;

        console.log(`Level Up! 現在のレベル: ${player.level}, 攻撃力: ${player.attackPower}, ジャンプ力: ${player.jumpPower}`);
    }

    // UIの更新関数
    function updateUI() {
        playerLevelDisplay.textContent = player.level;
        playerExpDisplay.textContent = player.exp;
        playerMaxExpDisplay.textContent = player.maxExp;
    }

    // タッチイベントリスナー
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
    jumpButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!player.isJumping) {
            player.isJumping = true;
            // ジャンプ力に合わせて初速を調整
            player.velocityY = -gameCanvas.height / (25 / player.jumpPower);
        }
    });
    
    const attackButton = document.getElementById('attack-button');
    attackButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!player.isAttacking) {
            player.isAttacking = true;
            player.attackTimer = 15;
            
            // 攻撃時に経験値を仮で追加
            player.exp += 20;
            if (player.exp >= player.maxExp) {
                levelUp();
            }
        }
    });

    // ゲームの更新
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

        updateUI();
    }

    // ゲームの描画
    function draw() {
        ctx.fillStyle = '#5c628f';
        ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        
        ctx.fillStyle = '#4682b4';
        ctx.fillRect(0, gameCanvas.height - 10, gameCanvas.width, 10);
        
        if (assetsLoaded) {
            ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
        } else {
            ctx.fillStyle = '#ff6347';
            ctx.fillRect(player.x, player.y, player.width, player.height);
        }
        
        if (player.isAttacking) {
            ctx.font = `${player.height * 0.8}px Arial`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText('⭐', player.x + player.width + 5, player.y + player.height / 2);
        }
    }

    // ゲームループ
    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    // スタートボタンのイベントリスナー
    startButton.addEventListener('click', () => {
        openingScreen.classList.remove('active');
        gameScreen.classList.add('active');
        if (assetsLoaded) {
            gameLoop();
        } else {
            playerImage.onload = () => {
                assetsLoaded = true;
                gameLoop();
            };
        }
        
        openingBGM.pause();
        gameBGM.play();
    });

    // ユーザーの最初の操作でBGMを再生
    document.body.addEventListener('touchstart', () => {
        if (openingBGM.paused) {
            openingBGM.play().catch(e => console.error(e));
        }
    }, { once: true });
    
    playerImage.onload = () => {
        assetsLoaded = true;
        if (gameScreen.classList.contains('active')) {
            draw();
        }
    };
    playerImage.onerror = () => {
        console.error("Failed to load player image: takase02.png");
        assetsLoaded = true;
    };

    openingScreen.classList.add('active');
});
