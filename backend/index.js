const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const games = {}; // Almacenar partidas activas

// Función que obtiene los jugadores de una partida usando el gameCode
function getPlayersInGame(gameCode) {
  const game = games[gameCode];  // Accede a la partida usando el código
  return game ? game.players : [];  // Devuelve los jugadores si la partida existe, si no devuelve un array vacío
}

io.on('connection', (socket) => {
  console.log('Un usuario se ha conectado:', socket.id);

  // Crear partida
  socket.on('createGame', (data, callback) => {
    const gameCode = data.gameCode;

    if (!games[gameCode]) {
      games[gameCode] = {
        players: [socket.id],
        creator: socket.id, // El creador de la partida es el primer jugador
        started: false, // Indica si la partida ya empezó
      };
      socket.join(gameCode); // El creador se une a la sala
      console.log(`Partida creada: ${gameCode} por ${socket.id}`);

      // Emitir actualización de la partida
      io.to(gameCode).emit('gameUpdated', {
        players: games[gameCode].players,
        scores: games[gameCode].scores || {},
        started: games[gameCode].started,
        creator: games[gameCode].creator, // Enviar el creador al cliente
      });

      if (typeof callback === 'function') {
        callback({ success: true, gameCode });
      }
    } else {
      if (typeof callback === 'function') {
        callback({ success: false, message: 'El código de la partida ya existe.' });
      }
    }
  });

  // Actualizar puntajes manualmente
  socket.on('updateScore', (data) => {
    const { gameCode, playerId, round, score } = data;

    if (games[gameCode] && typeof score === 'number' && score >= 0) {
      if (!games[gameCode].scores) {
        games[gameCode].scores = {};
      }
      if (!games[gameCode].scores[playerId]) {
        games[gameCode].scores[playerId] = {};
      }
      games[gameCode].scores[playerId][round] = score;

      // Emitir actualización de la partida
      io.to(gameCode).emit('gameUpdated', {
        players: games[gameCode].players,
        scores: games[gameCode].scores,
        started: games[gameCode].started,
      });

      // Notificar a todos los jugadores
      io.to(gameCode).emit('scoresUpdated', games[gameCode].scores);
    } else {
      console.log('Datos inválidos al intentar actualizar puntajes:', data);
    }
  });


  // Unirse a una partida
  socket.on('joinGame', (data, callback) => {
    const gameCode = data.gameCode;

    socket.emit('syncGameState', {
      players: games[gameCode].players,
      scores: games[gameCode].scores || {},
    });


    if (games[gameCode]) {
      if (games[gameCode].players.length < 6) {
        games[gameCode].players.push(socket.id);
        socket.join(gameCode);
        console.log(`Usuario ${socket.id} se unió a la partida ${gameCode}`);

        // Emitir actualización de la partida
        io.to(gameCode).emit('gameUpdated', {
          players: games[gameCode].players,
          scores: games[gameCode].scores || {},
          started: games[gameCode].started,
        });

        // Notificar a todos los jugadores de la sala
        io.to(gameCode).emit('playerJoined', { players: games[gameCode].players });

        // Si hay al menos 2 jugadores, notificar que se puede empezar la partida
        if (games[gameCode].players.length >= 2 && !games[gameCode].started) {
          io.to(gameCode).emit('gameReady', { message: '¡Partida lista para empezar!' });
        }

        if (typeof callback === 'function') {
          callback({ success: true });
        }
      } else {
        if (typeof callback === 'function') {
          callback({ success: false, message: 'La partida está llena.' });
        }
      }
    } else {
      if (typeof callback === 'function') {
        callback({ success: false, message: 'Partida no encontrada.' });
      }
    }
  });

  /*socket.on('startGame', (gameCode) => {
    const players = getPlayersInGame(gameCode);

    players.forEach(player => {
      io.to(player.socketId).emit('playerJoined', { players: players.map(p => p.id) });
    });

    // Continúa con la lógica para iniciar la partida
    // io.to(gameCode).emit('gameStarted', gameCode);


    if (games[gameCode] && games[gameCode].players.length >= 2) {
      games[gameCode].started = true; // Marcar la partida como iniciada

      // Notificar a todos los jugadores de la sala
      io.to(gameCode).emit('gameStarted', { message: 'La partida ha comenzado!' });
      console.log(`Partida ${gameCode} iniciada`);
    } else {
      console.log(`No se puede iniciar la partida ${gameCode}. Jugadores insuficientes.`);
    }
  });*/

  socket.on('startGame', (gameCode) => {
    const game = games[gameCode];

    if (game && game.creator === socket.id) { // Solo el creador puede iniciar la partida
      if (game.players.length >= 2) {
        game.started = true;
        io.to(gameCode).emit('gameStarted', { message: 'La partida ha comenzado!' });
        console.log(`Partida ${gameCode} iniciada por ${socket.id}`);
      } else {
        console.log(`No se puede iniciar la partida ${gameCode}. Jugadores insuficientes.`);
      }
    } else {
      console.log('Solo el creador puede iniciar la partida');
    }
  });




  // Desconexión de un usuario
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);

    // Eliminar al jugador de cualquier partida activa
    for (const gameCode in games) {
      const game = games[gameCode];
      const index = game.players.indexOf(socket.id);
      if (index !== -1) {
        game.players[index] = null; // Mantener el lugar para reconexión
        io.to(gameCode).emit('gameUpdated', {
          players: game.players,
          scores: game.scores || {},
          started: game.started,
        });
        io.to(gameCode).emit('playerLeft', { players: game.players });
        console.log(`Usuario ${socket.id} eliminado de la partida ${gameCode}`);

        // Si no hay más jugadores, eliminar la partida
        if (game.players.length === 0) {
          delete games[gameCode];
          console.log(`Partida ${gameCode} eliminada por falta de jugadores`);
        } else {
          io.to(gameCode).emit('playerLeft', { players: game.players });
        }
        break;
      }
    }
  });

  socket.on('reconnectToGame', (data) => {
    const { gameCode, playerId } = data;
    if (games[gameCode]) {
      const playerIndex = games[gameCode].players.indexOf(null);
      if (playerIndex !== -1) {
        games[gameCode].players[playerIndex] = socket.id;
        socket.join(gameCode);
        io.to(gameCode).emit('playerReconnected', { players: games[gameCode].players });
      } else {
        console.log(`No hay espacio para que el jugador ${playerId} se reconecte a ${gameCode}`);
      }
    }
  });


});

server.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000');
});
