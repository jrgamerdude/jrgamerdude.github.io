const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('startButton');

// Sæt canvas størrelse
canvas.width = 800;
canvas.height = 600;

let score = 0;
let ballX = 400;
let ballY = 0;
let ballSpeed = 2;
let paddleX = 350;
const paddleWidth = 100;
const paddleHeight = 10;

function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBall();
    drawPaddle();
    
    ballY += ballSpeed;
    
    if (ballY + 10 > canvas.height - paddleHeight && 
        ballX > paddleX && ballX < paddleX + paddleWidth) {
        score++;
        scoreElement.textContent = score;
        ballY = 0;
        ballX = Math.random() * canvas.width;
        ballSpeed += 0.2;
    }
    
    if (ballY > canvas.height) {
        alert('Spil slut! Din score: ' + score);
        score = 0;
        scoreElement.textContent = score;
        ballY = 0;
        ballX = Math.random() * canvas.width;
        ballSpeed = 2;
        startButton.style.display = 'block';
        return;
    }
    
    requestAnimationFrame(updateGame);
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    paddleX = e.clientX - rect.left - paddleWidth / 2;
});

startButton.addEventListener('click', () => {
    startButton.style.display = 'none';
    updateGame();
});
