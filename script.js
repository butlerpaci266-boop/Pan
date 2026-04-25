// Navigation
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-section');
        navigateTo(target);
    });
});

function navigateTo(sectionId) {
    // Update active section
    sections.forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');

    // Update active button
    navBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

    // Scroll to top
    window.scrollTo(0, 0);
}

// Game Management
function startGame(gameName) {
    const gameContainer = document.getElementById('game-container');
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = '';

    switch(gameName) {
        case 'snake':
            loadSnakeGame();
            break;
        case 'flappy':
            loadFlappyGame();
            break;
        case '2048':
            load2048Game();
            break;
        case 'tictactoe':
            loadTicTacToeGame();
            break;
        case 'breakout':
            loadBreakoutGame();
            break;
        case 'memory':
            loadMemoryGame();
            break;
    }

    gameContainer.classList.remove('hidden');
}

function closeGame() {
    document.getElementById('game-container').classList.add('hidden');
    document.getElementById('game-content').innerHTML = '';
}

// ==================== SNAKE GAME ====================
function loadSnakeGame() {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    document.getElementById('game-content').appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const gridSize = 20;
    let snake = [{x: 10, y: 10}];
    let food = {x: 15, y: 15};
    let dx = 1, dy = 0;
    let nextDx = 1, nextDy = 0;
    let score = 0;
    let gameRunning = true;

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' && dy === 0) { nextDx = 0; nextDy = -1; }
        if (e.key === 'ArrowDown' && dy === 0) { nextDx = 0; nextDy = 1; }
        if (e.key === 'ArrowLeft' && dx === 0) { nextDx = -1; nextDy = 0; }
        if (e.key === 'ArrowRight' && dx === 0) { nextDx = 1; nextDy = 0; }
    });

    function update() {
        if (!gameRunning) return;

        dx = nextDx;
        dy = nextDy;

        const head = {x: snake[0].x + dx, y: snake[0].y + dy};

        if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
            gameRunning = false;
            alert(`Game Over! Score: ${score}`);
            closeGame();
            return;
        }

        for (let segment of snake) {
            if (head.x === segment.x && head.y === segment.y) {
                gameRunning = false;
                alert(`Game Over! Score: ${score}`);
                closeGame();
                return;
            }
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score += 10;
            food = {x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20)};
        } else {
            snake.pop();
        }
    }

    function draw() {
        ctx.fillStyle = '#0f0f1e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00d4ff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#00d4ff';
        for (let i = 0; i <= 20; i++) {
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0);
            ctx.lineTo(i * gridSize, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * gridSize);
            ctx.lineTo(canvas.width, i * gridSize);
            ctx.stroke();
        }

        ctx.fillStyle = '#00ff00';
        for (let segment of snake) {
            ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
        }

        ctx.fillStyle = '#ff0000';
        ctx.fillRect(food.x * gridSize + 1, food.y * gridSize + 1, gridSize - 2, gridSize - 2);

        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(`Score: ${score}`, 10, canvas.height + 30);
    }

    function gameLoop() {
        update();
        draw();
        if (gameRunning) setTimeout(gameLoop, 100);
    }

    gameLoop();
}

// ==================== FLAPPY BIRD GAME ====================
function loadFlappyGame() {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 600;
    document.getElementById('game-content').appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let bird = {x: 50, y: 300, width: 30, height: 30, velocity: 0, gravity: 0.5, jump: -12};
    let pipes = [];
    let score = 0;
    let gameRunning = true;
    let pipeCounter = 0;

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') bird.velocity = bird.jump;
    });
    canvas.addEventListener('click', () => {
        bird.velocity = bird.jump;
    });

    function update() {
        if (!gameRunning) return;

        bird.velocity += bird.gravity;
        bird.y += bird.velocity;

        if (bird.y + bird.height > canvas.height || bird.y < 0) {
            gameRunning = false;
            alert(`Game Over! Score: ${score}`);
            closeGame();
            return;
        }

        pipeCounter++;
        if (pipeCounter > 90) {
            let gap = 150;
            let pipeY = Math.random() * (canvas.height - gap - 100) + 50;
            pipes.push({x: canvas.width, y: pipeY, width: 80, gap: gap});
            pipeCounter = 0;
        }

        for (let i = pipes.length - 1; i >= 0; i--) {
            pipes[i].x -= 6;

            if (pipes[i].x + pipes[i].width < bird.x && !pipes[i].scored) {
                pipes[i].scored = true;
                score++;
            }

            if (bird.x < pipes[i].x + pipes[i].width &&
                bird.x + bird.width > pipes[i].x &&
                (bird.y < pipes[i].y || bird.y + bird.height > pipes[i].y + pipes[i].gap)) {
                gameRunning = false;
                alert(`Game Over! Score: ${score}`);
                closeGame();
                return;
            }

            if (pipes[i].x < -pipes[i].width) pipes.splice(i, 1);
        }
    }

    function draw() {
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(bird.x + bird.width / 2, bird.y + bird.height / 2, bird.width / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#228B22';
        pipes.forEach(pipe => {
            ctx.fillRect(pipe.x, 0, pipe.width, pipe.y);
            ctx.fillRect(pipe.x, pipe.y + pipe.gap, pipe.width, canvas.height - pipe.y - pipe.gap);
        });

        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 28px Arial';
        ctx.fillText(`Score: ${score}`, 10, 40);
    }

    function gameLoop() {
        update();
        draw();
        if (gameRunning) requestAnimationFrame(gameLoop);
    }

    gameLoop();
}

// ==================== 2048 GAME ====================
function load2048Game() {
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = `
        <div style="width: 320px; text-align: center;">
            <h2 style="color: #00d4ff; margin-bottom: 10px;">2048</h2>
            <p style="color: #a0a0a0; margin-bottom: 10px;">Use arrow keys to move tiles</p>
            <div id="grid2048" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #1a1a2e; padding: 10px; border-radius: 8px; border: 2px solid #00d4ff;"></div>
            <p id="score2048" style="color: #00d4ff; margin-top: 15px; font-size: 20px; font-weight: bold;">Score: 0</p>
        </div>
    `;

    let grid = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    let score = 0;

    function addTile() {
        let empty = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] === 0) empty.push({x: i, y: j});
            }
        }
        if (empty.length > 0) {
            let pos = empty[Math.floor(Math.random() * empty.length)];
            grid[pos.x][pos.y] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    function draw() {
        const gridDiv = document.getElementById('grid2048');
        gridDiv.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const tile = document.createElement('div');
                const value = grid[i][j];
                tile.style.cssText = `
                    width: 60px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: ${value === 0 ? '#16213e' : '#00d4ff'};
                    color: ${value === 0 ? '#444' : '#0f0f1e'};
                    font-weight: bold;
                    font-size: 24px;
                    border-radius: 4px;
                    border: 2px solid #00d4ff;
                `;
                tile.textContent = value === 0 ? '' : value;
                gridDiv.appendChild(tile);
            }
        }
        document.getElementById('score2048').textContent = `Score: ${score}`;
    }

    function move(direction) {
        let moved = false;
        if (direction === 'left' || direction === 'right') {
            for (let i = 0; i < 4; i++) {
                let row = grid[i];
                if (direction === 'right') row = row.reverse();
                row = row.filter(v => v !== 0);
                for (let j = 0; j < row.length - 1; j++) {
                    if (row[j] === row[j + 1]) {
                        row[j] *= 2;
                        score += row[j];
                        row.splice(j + 1, 1);
                    }
                }
                while (row.length < 4) row.push(0);
                if (direction === 'right') row.reverse();
                grid[i] = row;
            }
        } else {
            for (let j = 0; j < 4; j++) {
                let col = [grid[0][j], grid[1][j], grid[2][j], grid[3][j]];
                if (direction === 'down') col = col.reverse();
                col = col.filter(v => v !== 0);
                for (let i = 0; i < col.length - 1; i++) {
                    if (col[i] === col[i + 1]) {
                        col[i] *= 2;
                        score += col[i];
                        col.splice(i + 1, 1);
                    }
                }
                while (col.length < 4) col.push(0);
                if (direction === 'down') col = col.reverse();
                for (let i = 0; i < 4; i++) grid[i][j] = col[i];
            }
        }
        addTile();
        draw();
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') move('left');
        if (e.key === 'ArrowRight') move('right');
        if (e.key === 'ArrowUp') move('up');
        if (e.key === 'ArrowDown') move('down');
    });

    addTile();
    addTile();
    draw();
}

// ==================== TIC-TAC-TOE GAME ====================
function loadTicTacToeGame() {
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = `
        <div style="text-align: center; color: #00d4ff;">
            <h2 style="margin-bottom: 20px;">Tic-Tac-Toe</h2>
            <div id="tictactoe-board" style="display: grid; grid-template-columns: repeat(3, 100px); gap: 5px;"></div>
            <p id="tictactoe-status" style="margin-top: 20px; font-size: 18px;"></p>
            <button onclick="loadTicTacToeGame()" style="margin-top: 20px; padding: 10px 20px; background: #00d4ff; color: #0f0f1e; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">New Game</button>
        </div>
    `;

    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let gameOver = false;

    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    function checkWin() {
        for (let pattern of winPatterns) {
            if (board[pattern[0]] && board[pattern[0]] === board[pattern[1]] && board[pattern[1]] === board[pattern[2]]) {
                return board[pattern[0]];
            }
        }
        return null;
    }

    function aiMove() {
        let availableMoves = board.map((cell, i) => cell === '' ? i : null).filter(i => i !== null);
        if (availableMoves.length > 0) {
            let move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            board[move] = 'O';
        }
    }

    function draw() {
        const boardDiv = document.getElementById('tictactoe-board');
        boardDiv.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('button');
            cell.style.cssText = `
                width: 100px;
                height: 100px;
                font-size: 32px;
                background: #1a1a2e;
                border: 2px solid #00d4ff;
                color: #00d4ff;
                cursor: ${board[i] || gameOver ? 'default' : 'pointer'};
                border-radius: 5px;
                font-weight: bold;
            `;
            cell.textContent = board[i];
            cell.onclick = () => {
                if (board[i] === '' && !gameOver) {
                    board[i] = 'X';
                    let winner = checkWin();
                    if (winner) {
                        gameOver = true;
                        document.getElementById('tictactoe-status').textContent = `${winner} Wins!`;
                    } else if (board.every(cell => cell !== '')) {
                        gameOver = true;
                        document.getElementById('tictactoe-status').textContent = 'Draw!';
                    } else {
                        aiMove();
                        winner = checkWin();
                        if (winner) {
                            gameOver = true;
                            document.getElementById('tictactoe-status').textContent = `${winner} Wins!`;
                        } else if (board.every(cell => cell !== '')) {
                            gameOver = true;
                            document.getElementById('tictactoe-status').textContent = 'Draw!';
                        } else {
                            document.getElementById('tictactoe-status').textContent = 'Your turn (X)';
                        }
                    }
                    draw();
                }
            };
            boardDiv.appendChild(cell);
        }
    }

    document.getElementById('tictactoe-status').textContent = 'Your turn (X)';
    draw();
}

// ==================== BREAKOUT GAME ====================
function loadBreakoutGame() {
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 320;
    document.getElementById('game-content').appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let paddle = {x: 200, y: 300, width: 80, height: 10};
    let ball = {x: 240, y: 150, radius: 6, dx: 3, dy: -3};
    let bricks = [];
    let score = 0;

    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 8; j++) {
            bricks.push({x: j * 60, y: i * 20 + 20, width: 60, height: 20});
        }
    }

    document.addEventListener('mousemove', (e) => {
        let rect = canvas.getBoundingClientRect();
        paddle.x = e.clientX - rect.left - paddle.width / 2;
        if (paddle.x < 0) paddle.x = 0;
        if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
    });

    function update() {
        ball.x += ball.dx;
        ball.y += ball.dy;

        if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) ball.dx *= -1;
        if (ball.y - ball.radius < 0) ball.dy *= -1;

        if (ball.y + ball.radius > canvas.height) {
            alert(`Game Over! Score: ${score}`);
            closeGame();
            return;
        }

        if (ball.y + ball.radius > paddle.y && ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            ball.dy *= -1;
        }

        for (let i = bricks.length - 1; i >= 0; i--) {
            if (ball.x > bricks[i].x && ball.x < bricks[i].x + bricks[i].width &&
                ball.y > bricks[i].y && ball.y < bricks[i].y + bricks[i].height) {
                ball.dy *= -1;
                bricks.splice(i, 1);
                score += 10;
            }
        }

        if (bricks.length === 0) {
            alert(`You Won! Score: ${score}`);
            closeGame();
            return;
        }
    }

    function draw() {
        ctx.fillStyle = '#0f0f1e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00d4ff';
        ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ff00ff';
        bricks.forEach(brick => {
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        });

        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(`Score: ${score}`, 10, 20);
    }

    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
}

// ==================== MEMORY GAME ====================
function loadMemoryGame() {
    const gameContent = document.getElementById('game-content');
    const emojis = ['🍎', '🍎', '🍌', '🍌', '🍒', '🍒', '🍓', '🍓', '🍊', '🍊', '🥝', '🥝', '🍉', '🍉', '🍇', '🍇'];
    const shuffled = emojis.sort(() => Math.random() - 0.5);

    let flipped = [];
    let matched = 0;
    let moves = 0;

    gameContent.innerHTML = `
        <div style="text-align: center;">
            <h2 style="color: #00d4ff; margin-bottom: 10px;">Memory Match</h2>
            <div id="memory-grid" style="display: grid; grid-template-columns: repeat(4, 60px); gap: 10px; margin: 20px auto; width: fit-content;"></div>
            <p style="color: #00d4ff; font-size: 18px; margin-top: 20px;">Moves: <span id="moves-count">0</span> | Matched: <span id="matched-count">0</span>/8</p>
        </div>
    `;

    const grid = document.getElementById('memory-grid');
    shuffled.forEach((emoji, index) => {
        const card = document.createElement('button');
        card.style.cssText = `
            width: 60px;
            height: 60px;
            font-size: 30px;
            background: #1a1a2e;
            border: 2px solid #00d4ff;
            cursor: pointer;
            border-radius: 5px;
        `;
        card.textContent = '?';
        card.dataset.emoji = emoji;
        card.dataset.flipped = false;

        card.onclick = () => {
            if (card.dataset.flipped === 'true' || flipped.length === 2) return;

            card.textContent = emoji;
            card.dataset.flipped = true;
            flipped.push(card);

            if (flipped.length === 2) {
                moves++;
                document.getElementById('moves-count').textContent = moves;

                if (flipped[0].dataset.emoji === flipped[1].dataset.emoji) {
                    matched++;
                    document.getElementById('matched-count').textContent = matched;
                    flipped = [];

                    if (matched === 8) {
                        setTimeout(() => {
                            alert(`You Won! Moves: ${moves}`);
                            closeGame();
                        }, 500);
                    }
                } else {
                    setTimeout(() => {
                        flipped[0].textContent = '?';
                        flipped[1].textContent = '?';
                        flipped[0].dataset.flipped = false;
                        flipped[1].dataset.flipped = false;
                        flipped = [];
                    }, 800);
                }
            }
        };

        grid.appendChild(card);
    });
}
