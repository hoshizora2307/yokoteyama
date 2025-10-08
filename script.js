document.addEventListener('DOMContentLoaded', () => {
    const openingScreen = document.getElementById('opening-screen');
    const gameScreen = document.getElementById('game-screen');
    const startButton = document.getElementById('start-button');
    const openingBGM = document.getElementById('opening-bgm');
    const gameBGM = document.getElementById('game-bgm');
    const gameCanvas = document.getElementById('gameCanvas');
    const ctx = gameCanvas.getContext('2d');
    
    // プレイヤー画像
    const playerImage = new Image();
    playerImage.src = 'takase02.png';
    // 画像が読み込まれるまでゲームループを開始しないようにするためのフラグ
    let assetsLoaded = false; 

    // 画面サイズに合わせてキャンバスを調整
    function resizeCanvas() {
        const aspectRatio = 800 / 400; // ゲームの理想的な縦横比
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        let newWidth, newHeight;

        if (windowWidth / windowHeight > aspectRatio) {
            // ウィンドウが横長すぎる場合
            newHeight = windowHeight * 0.9;
            newWidth = newHeight * aspectRatio;
        } else {
            // ウィンドウが縦長すぎる場合
            newWidth = windowWidth * 0.9;
            newHeight = newWidth / aspectRatio;
        }

        gameCanvas.width = newWidth;
        gameCanvas.height = newHeight;
        
        // プレイヤーの初期位置も再調整
        player.x = gameCanvas.width / 5;
        player.y = gameCanvas.height - player.height;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // 初回ロード時にも実行

    // プレイヤーオブジェクト
    const player = {
        x: gameCanvas.width / 5,
        y: gameCanvas.height - 50, // 初期位置は地面から少し上
        width: 40, // 画像に合わせて調整
        height: 40, // 画像に合わせて調整
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
        
        // プレイヤーを描画 (画像)
        if (assetsLoaded) { // 画像が読み込まれていれば描画
            ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
        } else { // 読み込み中は仮の四角形を描画
            ctx.fillStyle = '#ff6347';
            ctx.fillRect(player.x, player.y, player.width, player.height);
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
        if (assetsLoaded) { // アセットが読み込まれてからゲームを開始
            gameLoop(); 
        } else {
            // アセット読み込み中であれば、読み込み完了後にゲームループ開始
            playerImage.onload = () => {
                assetsLoaded = true;
                gameLoop();
            };
        }
        
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
    
    // 画像が読み込まれたらフラグを立てる
    playerImage.onload = () => {
        assetsLoaded = true;
        // もしすでにゲーム画面がアクティブなら、描画を更新するために一度描画を呼び出す
        if (gameScreen.classList.contains('active')) {
            draw(); 
        }
    };
    playerImage.onerror = () => {
        console.error("Failed to load player image: takase02.png");
        // 画像読み込み失敗時も、ゲームは進行させるためフラグをtrueに
        assetsLoaded = true;
    };

    // 初期表示：オープニング画面をアクティブに
    openingScreen.classList.add('active');
});
