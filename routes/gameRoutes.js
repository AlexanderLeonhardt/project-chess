import express from 'express';
import { nanoid } from "nanoid";
import { Chess } from "chess.js";

const createGameRoutes = (games) => {
  const router = express.Router();

  // creating a new game
  router.post('/', (req, res) => {
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
  router.get('/:id', (req, res) => {
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

      return res.json({fen: game.game.fen(), color});
    }
    
    // spectator joining
    return res.json({fen: game.game.fen()});
  });

  return router;
}

export default createGameRoutes;