import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { Chess } from "chess.js";

const PORT = 3001;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://192.168.1.151:3000"]
  }
});

const games = {};

io.on("connection", (socket) => {
  console.log('New connection');

  socket.on('createRoom', () => {
    const roomId = Math.floor(Math.random() * 999999999).toString();
    const game = new Chess();
    games[roomId] = {
      game,
      players: [socket.id],
    }
    socket.join(roomId);
    socket.emit('createdRoom', roomId);
    console.log(`Created room [${roomId}]`);
  });

  socket.on('joinRoom', (roomId) => {
    const game = games[roomId]?.game;
    if (game) {
      games[roomId].players.push(socket.id);
      socket.join(roomId);
      const room = io.sockets.adapter.rooms.get(roomId);
      console.log(`Room [${roomId}] now has players:`, Array.from(room));
      socket.emit('joinedRoom', roomId);
      console.log(`Players in room [${roomId}]: ${games[roomId].players}`);
    } else {
      socket.emit('invalidRoom');
    }
  });

  socket.on('move', ({roomId, move}) => {
    const game = games[roomId]?.game;
    if (game?.move(move)) {
      socket.to(roomId).emit('opponentMoved', move);
      console.log(`${socket.id} made a move in room [${roomId}] with players ${games[roomId].players}`);
    } else {
      socket.emit('invalidMove');
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});