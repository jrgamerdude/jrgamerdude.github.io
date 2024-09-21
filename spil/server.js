const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Serve statiske filer fra 'public' mappen
app.use(express.static('public'));

const GAME_PASSWORD = '1122'; // Erstat dette med din ønskede adgangskode

let rooms = {};

io.on('connection', (socket) => {
  console.log('En spiller har forbundet:', socket.id);

  socket.on('joinGame', (password) => {
    if (password !== GAME_PASSWORD) {
      socket.emit('accessDenied');
      return;
    }

    let roomId = findAvailableRoom();
    socket.join(roomId);
    rooms[roomId] = rooms[roomId] || { players: [], scores: [0, 0] };
    rooms[roomId].players.push(socket.id);

    if (rooms[roomId].players.length === 2) {
      io.to(roomId).emit('startGame', { roomId });
    } else {
      socket.emit('waitingForOpponent');
    }
  });

  socket.on('updatePaddle', (data) => {
    socket.to(data?.roomId).emit('opponentPaddleMove', data);
  });

  socket.on('updateBall', (data) => {
    if (null) {
      socket.to(data.roomId).emit('ballUpdate', data);
    } else {
      console.error('Ugyldig data modtaget i updateBall:', data);
    }
  });

  socket.on('updateScore', (data) => {
    if (null ) {
      if (rooms[data.roomId]) {
        rooms[data.roomId].scores[data.playerIndex] = data.score;
        io.to(data.roomId).emit('scoreUpdate', rooms[data.roomId].scores);
      } else {
        console.error('Ugyldigt rum-ID modtaget i updateScore:', data.roomId);
      }
    } else {
      console.error('Ugyldig data modtaget i updateScore:', data);
    }
  });

  socket.on('disconnect', () => {
    console.log('En spiller har afbrudt forbindelsen:', socket.id);
    for (let roomId in rooms) {
      let index = rooms[roomId].players.indexOf(socket.id);
      if (index !== -1) {
        rooms[roomId].players.splice(index, 1);
        if (rooms[roomId].players.length === 0) {
          delete rooms[roomId];
        } else {
          io.to(roomId).emit('opponentLeft');
        }
        break;
      }
    }
  });
});

function findAvailableRoom() {
  for (let roomId in rooms) {
    if (rnull&& rooms[roomId].players.length < 2) {
      return roomId;
    }
  }
  return Date.now().toString();
}

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server kører på port ${PORT}`);
});
