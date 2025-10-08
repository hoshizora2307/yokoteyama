document.addEventListener('DOMContentLoaded', () => {
    const openingScreen = document.getElementById('opening-screen');
    const gameScreen = document.getElementById('game-screen');
    const startButton = document.getElementById('start-button');
    const gameBGM = document.getElementById('game-bgm');
    
    // ゲームキャンバス関連のコード
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 400;

    // プレイヤーオブジェクト
    const player = {
        x: 50,
        y: canvas.height - 50,
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

    // キーボード入力の状態
    const keys = {
        right: false,
        left: false,
        space: false
    };

    // キーイベントリスナー
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
        if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
        if (e.key === ' ' && !player.isJumping) {
            keys.space = true;
            player.isJumping = true;
            player.velocityY = -15; // ジャンプの初速
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
        if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
        if (e.key === ' ') keys.space = false;
    });

    // ゲームの更新
    function update() {
        // プレイヤーの左右移動
        if (keys.right) {
            background.x -= background.speed;
        }
        if (keys.left) {
            background.x += background.speed;
        }

        // プレイヤーのジャンプと重力
        player.y += player.velocityY;
        player.velocityY += 0.8; // 重力

        // 地面との衝突判定
        if (player.y > canvas.height - player.height) {
            player.y = canvas.height - player.height;
            player.isJumping = false;
            player.velocityY = 0;
        }
    }

    // ゲームの描画
    function draw() {
        // 背景を描画 (横スクロール)
        ctx.fillStyle = '#5c628f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 簡易的な地面の描画
        ctx.fillStyle = '#4682b4';
        ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
        
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

        // BGMを再生
        gameBGM.play();
    });
    
    // 初期表示：オープニング画面をアクティブに
    openingScreen.classList.add('active');
});
