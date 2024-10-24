import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { Chess } from "chess.js";
import { nanoid } from "nanoid";
import cors from 'cors';

const PORT = 3001;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://192.168.1.151:3000"]
  }
});

const games = {};

app.use(cors());

app.get('/game/:id', (req, res) => {
  const { id } = req.params;
  const game = games[id];
  if (game) return res.json({fen: game.fen()});
  res.sendStatus(404);
});

app.post('/game', (req, res) => {
  const id = nanoid(8);
  const game = new Chess();
  games[id] = game;
  res.status(200).json({ id });
  console.log(`Created game [${id}]`);
});

io.on("connection", (socket) => {
  console.log('New connection');

  socket.on('move', ({gameId, move}) => {
    const game = games[gameId];
    if (game?.move(move)) {
      socket.to(gameId).emit('opponentMoved', move);
      console.log(`${socket.id} made a move in game [${gameId}]`);
      console.log(game.fen());
    } else {
      socket.emit('invalidMove');
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});