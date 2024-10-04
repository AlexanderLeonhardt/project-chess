import express from 'express';
import { createServer } from 'http';

const PORT = 3001;

const app = express();
const server = createServer(app);

app.get('/', (req, res) => {
  res.send('Hello world');
});

server.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});