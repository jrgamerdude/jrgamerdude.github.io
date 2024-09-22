# Træn Reflekser

Dette er et simpelt spil designet til at træne dine reflekser. Brug musen til at styre paddlen og fang så mange bolde som muligt!

## Sådan spiller du

1. Åbn spillet i din browser.
2. Klik på "Start Træning" for at begynde.
3. Brug musen til at flytte paddlen i bunden af skærmen.
4. Fang de faldende bolde med paddlen.
5. Hver gang du fanger en bold, stiger din score og bolden falder hurtigere.
6. Spillet slutter, når en bold rammer bunden af skærmen.

God fornøjelse med at træne dine reflekser!

<!DOCTYPE html>
<html lang="da">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Beskyttet Online Træn Reflekser</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f0f0f0;
            font-family: Arial, sans-serif;
        }
        #gameCanvas {
            border: 2px solid #000;
            background-color: #fff;
        }
        #menu, #pauseMenu {
            position: absolute;
            background-color: rgba(255, 255, 255, 0.8);
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }
        #pauseMenu {
            display: none;
        }
        button {
            font-size: 18px;
            padding: 10px 20px;
            cursor: pointer;
        }
        #passwordPrompt {
            position: absolute;
            background-color: rgba(255, 255, 255, 0.9);
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }
        #passwordInput {
            margin: 10px 0;
            padding: 5px;
        }
        #submitPassword {
            padding: 5px 10px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <canvas id="gameCanvas"></canvas>
    <p>Din Score: <span id="score">0</span> | Modstander Score: <span id="opponentScore">0</span></p>
    <div id="menu">
        <h1>Beskyttet Online Træn Reflekser</h1>
        <p>Brug musen til at styre paddlen og fang boldene for at træne dine reflekser!</p>
        <button id="startButton">Find Modstander</button>
    </div>
    <div id="pauseMenu">
        <h2>Træning på pause</h2>
        <p>Tryk ESC for at fortsætte</p>
    </div>
    <div id="passwordPrompt" style="display: none;">
        <h2>Indtast adgangskode</h2>
        <input type="password" id="passwordInput" placeholder="Adgangskode">
        <button id="submitPassword">Start spil</button>
    </div>
    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreElement = document.getElementById('score');
        const opponentScoreElement = document.getElementById('opponentScore');
        const passwordPrompt = document.getElementById('passwordPrompt');
        const passwordInput = document.getElementById('passwordInput');
        const submitPasswordButton = document.getElementById('submitPassword');

        let roomId;
        let playerIndex;
        let opponentPaddleX = 150;
        let paddleX = 150;
        let paddleY;
        let paddleWidth = 100;
        let paddleHeight = 10;
        let ballX;
        let ballY;
        let ballSpeed;
        let score = 0;
        let gameRunning = false;
        let isPaused = false;

        function showPasswordPrompt() {
            hideMenu();
            passwordPrompt.style.display = 'block';
        }

        function hidePasswordPrompt() {
            passwordPrompt.style.display = 'none';
        }

        function startGame() {
            showPasswordPrompt();
        }

        function submitPassword() {
            const password = passwordInput.value;
            socket.emit('joinGame', password);
        }

        socket.on('accessDenied', () => {
            alert('Forkert adgangskode. Prøv igen.');
            passwordInput.value = '';
        });

        socket.on('waitingForOpponent', () => {
            hidePasswordPrompt();
            alert('Venter på en modstander...');
        });

        socket.on('startGame', (data) => {
            hidePasswordPrompt();
            roomId = data.roomId;
            playerIndex = rooms[roomId].players.indexOf(socket.id);
            gameRunning = true;
            isPaused = false;
            score = 0;
            scoreElement.textContent = score;
            opponentScoreElement.textContent = '0';
            ballY = 0;
            ballX = Math.random() * canvas.width;
            ballSpeed = 2;
            paddleY = canvas.height - paddleHeight;
            updateGame();
        });

        function updateGame() {
            if (!gameRunning || isPaused) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            drawBall();
            drawPaddle();
            drawOpponentPaddle();
            
            ballY += ballSpeed;
            
            if (ballY + 10 > paddleY && 
                ballX > paddleX && ballX < paddleX + paddleWidth) {
                score++;
                scoreElement.textContent = score;
                socket.emit('updateScore', { roomId, playerIndex, score });
                ballY = 0;
                ballX = Math.random() * canvas.width;
                ballSpeed += 0.2;
                socket.emit('updateBall', { roomId, ballX, ballY, ballSpeed });
            }
            
            if (ballY > canvas.height) {
                gameRunning = false;
                alert('Træning slut! Din score: ' + score);
                showMenu();
                socket.emit('leaveGame', { roomId });
            } else {
                requestAnimationFrame(updateGame);
            }
        }

        function drawBall() {
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
            ctx.fill();
        }

        function drawPaddle() {
            ctx.fillStyle = 'blue';
            ctx.fillRect(paddleX, paddleY, paddleWidth, paddleHeight);
        }

        function drawOpponentPaddle() {
            ctx.fillStyle = 'green';
            ctx.fillRect(opponentPaddleX, 0, paddleWidth, paddleHeight);
        }

        function hideMenu() {
            document.getElementById('menu').style.display = 'none';
        }

        function showMenu() {
            document.getElementById('menu').style.display = 'block';
        }

        function resizeCanvas() {
            canvas.width = window.innerWidth * 0.8;
            canvas.height = window.innerHeight * 0.8;
            paddleY = canvas.height - paddleHeight;
        }

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            paddleX = e.clientX - rect.left - paddleWidth / 2;
            socket.emit('updatePaddle', { roomId, paddleX });
        });

        socket.on('opponentPaddleMove', (data) => {
            opponentPaddleX = data.paddleX;
        });

        socket.on('ballUpdate', (data) => {
            ballX = data.ballX;
            ballY = data.ballY;
            ballSpeed = data.ballSpeed;
        });

        socket.on('scoreUpdate', (scores) => {
            scoreElement.textContent = scores[playerIndex];
            opponentScoreElement.textContent = scores[1 - playerIndex];
        });

        socket.on('opponentLeft', () => {
            alert('Din modstander har forladt spillet.');
            gameRunning = false;
            showMenu();
        });

        document.getElementById('startButton').addEventListener('click', startGame);
        submitPasswordButton.addEventListener('click', submitPassword);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (gameRunning) {
                    isPaused = !isPaused;
                    if (isPaused) {
                        document.getElementById('pauseMenu').style.display = 'block';
                    } else {
                        document.getElementById('pauseMenu').style.display = 'none';
                        updateGame();
                    }
                }
            }
        });

        window.addEventListener('resize', resizeCanvas);

        resizeCanvas();
        showMenu();
    </script>
</body>
</html>
