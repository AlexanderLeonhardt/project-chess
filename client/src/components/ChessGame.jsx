import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { io } from 'socket.io-client';

const socket = io('http://192.168.1.151:3001');

export default function ChessGame() {
  const [game, setGame] = useState(new Chess());
  const [orientation, setOrientation] = useState('white');
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [customSquareStyles, setCustomSquaresStyles] = useState({});
  const [lastMove, setLastMove] = useState(null);

  useEffect(() => {
    socket.on('move', (move) => makeAMove(move));

    return () => socket.off('move');
  }, []);

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

  function getKingSquare() {
    const board = game.board();
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] && board[i][j].type === 'k' && board[i][j].color === game.turn()) return board[i][j].square;
      }
    }
    return null;
  }

  function makeAMove(move) {
    const gameCopy = { ...game };
    const result = gameCopy.move(move);
    setGame(gameCopy);

    if (result) {
      setLastMove(move);
    }

    return result;
  }

  function onSquareClick(square, piece) {
    if (selectedSquare) {
      setSelectedSquare(null);
      let kingSquare;
      if (game.in_check()) {
        kingSquare = getKingSquare();
      }
      if (kingSquare) setCustomSquaresStyles({ [kingSquare]: styles.check });
      else setCustomSquaresStyles({});
    }
    if (selectedSquare && square !== selectedSquare) {
      const move = makeAMove({
        from: selectedSquare,
        to: square,
        promotion: "q",
      });
      
      if (move === null) return false;
      else socket.emit('move', move);

      let kingSquare;
      if (game.in_check()) {
        kingSquare = getKingSquare();
      }
      if (kingSquare) setCustomSquaresStyles({ [kingSquare]: styles.check });
      else setCustomSquaresStyles({});

      setSelectedSquare(null);
      return true;
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
        setCustomSquaresStyles(squareStyles);
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
    let kingSquare;
    if (game.in_check()) {
      kingSquare = getKingSquare();
    }
    if (kingSquare) setCustomSquaresStyles({ ...squareStyles, [kingSquare]: styles.check });
    else setCustomSquaresStyles(squareStyles);
  }

  function onPieceDrop(sourceSquare, targetSquare, piece) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: piece[1].toLowerCase() ?? "q",
    });
    setSelectedSquare(null);
    let kingSquare;
    if (game.in_check()) {
      kingSquare = getKingSquare();
    }
    if (kingSquare) setCustomSquaresStyles({ [kingSquare]: styles.check });
    else setCustomSquaresStyles({});
    if (move === null) return false;
    else socket.emit('move', move);
    return true;
  }

  return (
    <div className='chess-container'>
      <Chessboard 
        position={game.fen()} 
        boardOrientation={orientation}
        isDraggablePiece={({piece}) => (game.turn() === orientation[0]) && (game.game_over() ? false : piece[0] === orientation[0])}
        onSquareClick={onSquareClick}
        onPieceDragBegin={onPieceDragBegin}
        onPieceDrop={onPieceDrop}
        customSquareStyles={
          {
            ...customSquareStyles,
            [lastMove?.from]: styles.lastMove,
            [lastMove?.to]: styles.lastMove,
          }
        }
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
  ); 
}