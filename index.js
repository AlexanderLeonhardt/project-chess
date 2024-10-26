import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import gameRoutes from "./routes/gameRoutes.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const games = {};

app.use(express.json());
app.use('/api/game', gameRoutes(games));
app.use(express.static(path.join(__dirname, "/client/dist/")));

io.on("connection", (socket) => {
  console.log('New connection');

  socket.on('joinGame', (gameId) => {
    if (games[gameId]) socket.join(gameId);
    console.log(games[gameId].players);
  });

  socket.on('move', ({gameId, move}) => {
    const game = games[gameId].game;
    if (game?.move(move)) socket.to(gameId).emit('opponentMoved', move);
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/client/dist/index.html"));
});

httpServer.listen(3000, () => {
  console.log(`Server started on port 3000`);
});