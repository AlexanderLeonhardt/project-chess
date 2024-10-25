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
app.use(express.json());

// creating a new game
app.post('/game', (req, res) => {
  const id = nanoid(8);
  const { userId } = req.body;

  if (!userId) {
    console.log('Request Body:', req.body);
    return res.sendStatus(400);
  }

  const game = new Chess();
  const color = Math.random() * 2 > 1 ? 'white' : 'black';

  games[id] = { 
    game,
    players: { 
      [userId]: { color } 
    }, 
  };

  res.status(200).json({ id });
  console.log(`Created game [${id}]`);
});

// joining a game
app.get('/game/:id', (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;
  const game = games[id];

  // game doesn't exist
  if (!game) return res.sendStatus(404);

  // player joining back
  if (game.players[userId]) return res.json({fen: game.game.fen(), color: game.players[userId].color});

  // opponent joining
  let players = Object.keys(game.players);
  if (players.length === 1) {
    const hostPlayer = game.players[players[0]];

    const color = hostPlayer.color === 'white' ? 'black' : 'white';
    game.players[userId] = { color };

    return res.json({fen: game.game.fen(), color: 'spectator'});
  }
  
  // spectator joining
  return res.json({fen: game.game.fen()});
});

io.on("connection", (socket) => {
  console.log('New connection');

  socket.on('joinGame', (gameId) => {
    const game = games[gameId];
    if (game) {
      socket.join(gameId);
      console.log(`${socket.id} joined room [${gameId}]`);
    }
  });

  socket.on('move', ({gameId, move}) => {
    const game = games[gameId].game;
    if (game?.move(move)) {
      socket.to(gameId).emit('opponentMoved', move);
      console.log(`${socket.id} made a move in game [${gameId}]`);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});