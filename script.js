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
    const levelUpPopup = document.getElementById('level-up-popup');
    const levelUpNumber = document.getElementById('level-up-number');
    
    // プレイヤー画像
    const playerImage = new Image();
    playerImage.src = 'takase02.png';
    
    // お助けキャラ画像
    const helperImage = new Image();
    helperImage.src = 'saisu01.png';

    let assetsLoadedCount = 0;
    const totalAssets = 2; // playerImageとhelperImage

    function assetLoaded() {
        assetsLoadedCount++;
        if (assetsLoadedCount === totalAssets) {
            assetsLoaded = true;
            if (gameScreen.classList.contains('active')) {
                gameLoop(); // ゲーム画面が既にアクティブならゲーム開始
            }
        }
    }

    playerImage.onload = assetLoaded;
    playerImage.onerror = () => { console.error("Failed to load player image: takase02.png"); assetLoaded(); };
    helperImage.onload = assetLoaded;
    helperImage.onerror = () => { console.error("Failed to load helper image: saisu01.png"); assetLoaded(); };


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
        level: 1,
        exp: 0,
        maxExp: 100,
        attackPower: 1,
        jumpPower: 1,
        isInvincible: false, // 無敵状態
        flickerTimer: 0 // 点滅アニメーション用
    };

    // お助けキャラオブジェクト
    const helper = {
        x: 0,
        y: 0,
        width: 30, // お助けキャラのサイズ
        height: 30,
        isVisible: false,
        displayTimer: 0, // 表示時間
        respawnTimer: 0, // 次の出現までの時間
        initialRespawnTime: 10 * 60 // 10秒 * 60フレーム/秒 (仮定)
    };
    // 初期の出現タイマーを設定
    helper.respawnTimer = helper.initialRespawnTime;


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
        player.maxExp = Math.floor(player.maxExp * 1.5);
        
        player.attackPower++;
        player.jumpPower += 0.1;

        levelUpNumber.textContent = player.level;
        levelUpPopup.classList.add('visible');
        
        setTimeout(() => {
            levelUpPopup.classList.remove('visible');
        }, 2000);
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
            player.velocityY = -gameCanvas.height / (25 / player.jumpPower);
        }
    });
    
    const attackButton = document.getElementById('attack-button');
    attackButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!player.isAttacking) {
            player.isAttacking = true;
            player.attackTimer = 15;
            
            player.exp += 20; // 攻撃時に仮の経験値
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

        // お助けキャラのロジック
        if (helper.isVisible) {
            helper.displayTimer--;
            if (helper.displayTimer <= 0) {
                helper.isVisible = false;
                player.isInvincible = false; // 無敵解除
                helper.respawnTimer = helper.initialRespawnTime + Math.random() * 60 * 5; // 次の出現まで5秒のランダム幅
            } else {
                // お助けキャラが表示されている間、プレイヤーを無敵にする
                player.isInvincible = true;
                player.flickerTimer++; // 点滅用タイマー
            }
        } else {
            helper.respawnTimer--;
            if (helper.respawnTimer <= 0) {
                helper.isVisible = true;
                helper.displayTimer = 60 * 1.5; // 1.5秒表示 (90フレーム)
                // プレイヤーの近くにランダムに出現
                helper.x = player.x + (Math.random() * player.width * 2) - (player.width / 2);
                helper.y = player.y - (Math.random() * player.height) - helper.height;
                if (helper.y < 0) helper.y = 0; // 画面上端を超えないように
                if (helper.x < 0) helper.x = 0; // 画面左端を超えないように
                if (helper.x + helper.width > gameCanvas.width) helper.x = gameCanvas.width - helper.width; // 画面右端を超えないように
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
        
        // プレイヤーを描画 (無敵中は点滅)
        if (assetsLoaded) {
            if (player.isInvincible && Math.floor(player.flickerTimer / 5) % 2 === 0) {
                // 無敵中は5フレームごとに描画をスキップして点滅させる
            } else {
                ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
            }
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

        // お助けキャラを描画
        if (helper.isVisible && assetsLoaded) {
            ctx.drawImage(helperImage, helper.x, helper.y, helper.width, helper.height);
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
        // 全てのアセットがロードされていればゲーム開始、そうでなければロード完了後に開始
        if (assetsLoaded) {
            gameLoop(); 
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
    
    // assetLoadedは画像読み込み後に呼び出される
    // openingScreen.classList.add('active'); はDOMContentLoadedで実行
    openingScreen.classList.add('active');
});
