import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { io } from 'socket.io-client';

const socket = io('http://192.168.1.151:3001');

const styles = {
  move: { 
    background: 'radial-gradient(circle, rgba(0, 0, 0, 0.2) 25%, transparent 25%)' 
  },
  capture: { 
    background: 'radial-gradient(circle, rgba(255, 0, 0, 0.5) 65%, transparent 65%)' 
  },
  check: { 
    background: 'rgba(255, 0, 0, 0.7)' 
  },
  lastMove: { 
    background: 'rgba(255, 255, 0, 0.4)' 
  },
}

const moveSound = new Audio('/sounds/move.mp3');
moveSound.volume = 0.25;
const captureSound = new Audio('/sounds/capture.mp3');
captureSound.volume = 0.25;

export default function ChessGame() {
  const [game, setGame] = useState(new Chess());
  const [orientation, setOrientation] = useState('white');
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [customSquareStyles, setCustomSquaresStyles] = useState({});
  const [lastMove, setLastMove] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [inputRoomId, setInputRoomId] = useState('');

  useEffect(() => {
    socket.on('opponentMoved', (move) => {
      console.log('the opponent moved');
      makeAMove(move);
    });

    socket.on('createdRoom', (id) => {
      setRoomId(id);
    });

    socket.on('joinedRoom', (id) => {
      setRoomId(id);
    });

    return () => {
      socket.off('move');
      socket.off('createdRoom');
      socket.off('joinedRoom');
    }
  }, []);

  function getKingSquare() {
    const board = game.board();
    for (let row of board) {
      for (let square of row) {
        if (square?.type === 'k' && square.color === game.turn()) return square.square;
      }
    }
    return null;
  }

  function updateSquareStyles(additionalStyles = {}) {
    const kingSquare = game.in_check() ? getKingSquare() : null;
    setCustomSquaresStyles({
      ...(kingSquare ? { [kingSquare]: styles.check } : {}),
      ...additionalStyles,
    });
  }

  function makeAMove(move) {
    const gameCopy = { ...game };
    const result = gameCopy.move(move);
    if (result) {
      setGame(gameCopy);
      setLastMove(move);

      if (result.captured) captureSound.play();
      else moveSound.play();
    }
    return result;
  }

  function onSquareClick(square, piece) {
    if (selectedSquare) {
      setSelectedSquare(null);
      updateSquareStyles();
    }

    if (square !== selectedSquare && piece && piece[0] === orientation[0]) {
      const moves = game.moves({square, verbose: true});
      if (moves.length > 0) {
        setSelectedSquare(square);
        const squareStyles = {}
        moves.forEach((move) => {
          const enemy = orientation[0] === 'w' ? 'b' : 'w';
          squareStyles[move.to] = game.get(move.to) && game.get(move.to).color === enemy ? styles.capture : styles.move;
        });
        updateSquareStyles(squareStyles);
      }
    }
    if (selectedSquare && square !== selectedSquare) {
      const move = makeAMove({
        from: selectedSquare,
        to: square,
        promotion: "q",
      });
      if (move) {
        socket.emit('move', {roomId, move});
        updateSquareStyles();
        setSelectedSquare(null);
      }
    }
  }

  function onPieceDragBegin(piece, square) {
    setSelectedSquare(square);
    const squareStyles = {}
    game.moves({square, verbose: true}).forEach((move) => {
      const enemy = orientation[0] === 'w' ? 'b' : 'w';
      squareStyles[move.to] = game.get(move.to) && game.get(move.to).color === enemy ? styles.capture : styles.move;
    });
    updateSquareStyles(squareStyles);
  }

  function onPieceDrop(sourceSquare, targetSquare, piece) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: piece[1].toLowerCase() ?? "q",
    });
    setSelectedSquare(null);
    updateSquareStyles();
    if (move === null) return false;
    else socket.emit('move', {roomId, move});
    return true;
  }

  return (
    roomId ? (
      <div className='chess-container'>
        {roomId && <p>Room ID: {roomId}</p>}
        <Chessboard 
          position={game.fen()} 
          boardOrientation={orientation}
          isDraggablePiece={({piece}) => (game.turn() === orientation[0]) && (game.game_over() ? false : piece[0] === orientation[0])}
          onSquareClick={onSquareClick}
          onPieceDragBegin={onPieceDragBegin}
          onPieceDrop={onPieceDrop}
          customSquareStyles={{
            [lastMove?.from]: styles.lastMove,
            [lastMove?.to]: styles.lastMove,
            ...customSquareStyles,
          }}
          customDropSquareStyle={{}}
        />
        <button onClick={() => setOrientation(orientation === 'white' ? 'black' : 'white')}>Flip board</button>
        {game.game_over() && <div>
          <p>Game over</p>
          {game.in_checkmate() && (
            game.turn() === 'b' 
            ? <p>White has won</p>
            : <p>Black has won</p>
          )}
          {game.in_draw() && <p>Game has ended in a draw</p>}
          <button onClick={() => setGame(new Chess())}>New game</button>
        </div>}
      </div>
    ) : (
      <div>
        <button onClick={() => socket.emit('createRoom')}>Create Game</button>
        <input placeholder="Room ID" value={inputRoomId} onChange={(e) => setInputRoomId(e.target.value)}></input>
        <button onClick={() => socket.emit('joinRoom', inputRoomId)}>Join Game</button>
      </div>
    )
  );
}