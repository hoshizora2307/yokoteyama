document.addEventListener('DOMContentLoaded', () => {
    const openingScreen = document.getElementById('opening-screen');
    const gameScreen = document.getElementById('game-screen');
    const startButton = document.getElementById('start-button');
    const openingBGM = document.getElementById('opening-bgm');
    const gameBGM = document.getElementById('game-bgm');
    const gameCanvas = document.getElementById('gameCanvas');
    const ctx = gameCanvas.getContext('2d');
    
    // 画面サイズに合わせてキャンバスを調整
    function resizeCanvas() {
        if (window.innerWidth / window.innerHeight > 800 / 400) {
            gameCanvas.height = window.innerHeight * 0.8;
            gameCanvas.width = gameCanvas.height * 2;
        } else {
            gameCanvas.width = window.innerWidth * 0.9;
            gameCanvas.height = gameCanvas.width / 2;
        }
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // プレイヤーオブジェクト
    const player = {
        x: gameCanvas.width / 5,
        y: gameCanvas.height - 50,
        width: 30,
        height: 30,
        color: '#ff6347',
        velocityY: 0,
        isJumping: false,
        speed: 5
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
            player.velocityY = -gameCanvas.height / 25; // ジャンプの初速
        }
    });

    // ゲームの更新
    function update() {
        // プレイヤーの左右移動（タッチ操作）
        if (touch.moveRight) {
            background.x -= background.speed;
        }
        if (touch.moveLeft) {
            background.x += background.speed;
        }

        // プレイヤーのジャンプと重力
        player.y += player.velocityY;
        player.velocityY += gameCanvas.height / 500; // 重力

        // 地面との衝突判定
        if (player.y > gameCanvas.height - player.height) {
            player.y = gameCanvas.height - player.height;
            player.isJumping = false;
            player.velocityY = 0;
        }
    }

    // ゲームの描画
    function draw() {
        // 背景を描画 (横スクロール)
        ctx.fillStyle = '#5c628f';
        ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
        
        // 簡易的な地面の描画
        ctx.fillStyle = '#4682b4';
        ctx.fillRect(0, gameCanvas.height - 10, gameCanvas.width, 10);
        
        // プレイヤーを描画
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
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
        gameLoop(); // ゲームループを開始
        
        // BGMを切り替える
        openingBGM.pause();
        gameBGM.play();
    });

    // iOS/iPadOSの制限に対応
    // ユーザーの最初の操作でBGMを再生
    document.body.addEventListener('touchstart', () => {
        if (openingBGM.paused) {
            openingBGM.play().catch(e => console.error(e));
        }
    }, { once: true });
    
    // 初期表示：オープニング画面をアクティブに
    openingScreen.classList.add('active');
});
