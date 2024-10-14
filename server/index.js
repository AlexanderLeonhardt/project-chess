import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const PORT = 3001;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000"]
  }
});

io.on("connection", (socket) => {
  console.log('New connection');

  socket.on('message', (msg) => {
    console.log('Got message: ', msg);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});