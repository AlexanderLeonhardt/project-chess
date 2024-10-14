import { useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

export default function ChessGame() {
  const [game, setGame] = useState(new Chess());
  const [orientation, setOrientation] = useState('white');
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [customSquareStyles, setCustomSquaresStyles] = useState({});

  const moveStyle = {
    background: 'radial-gradient(circle, rgba(0, 0, 0, 0.2) 25%, transparent 25%)',
  }
  const captureStyle = {
    background: 'radial-gradient(circle, rgba(255, 0, 0, 0.5) 65%, transparent 65%)',
  }

  function makeAMove(move) {
    const gameCopy = new Chess(game.fen());
    const result = gameCopy.move(move);
    setGame(gameCopy);
    return result;
  }

  function onSquareClick(square, piece) {
    if (selectedSquare) {
      setSelectedSquare(null);
      setCustomSquaresStyles({});
    }
    if (selectedSquare && square !== selectedSquare) {
      if (game.moves().includes(square)) {
        const move = makeAMove({
          from: selectedSquare,
          to: square,
          promotion: "q",
        });
        
        if (move === null) return false;
        return true;
      }
      setSelectedSquare(null);
      setCustomSquaresStyles({});
    }
    if (square !== selectedSquare && piece && piece[0] === orientation[0]) {
      const moves = game.moves({square, verbose: true});
      if (moves.length > 0) {
        setSelectedSquare(square);

        const squareStyles = {}
        moves.forEach((move) => {
          const enemy = orientation[0] === 'w' ? 'b' : 'w';
          squareStyles[move.to] = game.get(move.to).color === enemy ? captureStyle : moveStyle;
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
      squareStyles[move.to] = game.get(move.to).color === enemy ? captureStyle : moveStyle;
    });
    setCustomSquaresStyles(squareStyles);
  }

  function onPieceDrop(sourceSquare, targetSquare, piece) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: piece[1].toLowerCase() ?? "q",
    });
    setSelectedSquare(null);
    setCustomSquaresStyles({});
    if (move === null) return false;
    return true;
  }

  return (
    <div className='chess-container'>
      <Chessboard 
        position={game.fen()} 
        boardOrientation={orientation}
        isDraggablePiece={({piece}) => (game.turn() === orientation[0]) && (game.isGameOver() ? false : piece[0] === orientation[0])}
        onSquareClick={onSquareClick}
        onPieceDragBegin={onPieceDragBegin}
        onPieceDrop={onPieceDrop}
        customSquareStyles={customSquareStyles}
        customDropSquareStyle={{}}
      />
      {game.isGameOver() && <div>
        <p>Game over</p>
        {game.isCheckmate() && (
          game.turn() === 'b' 
          ? <p>White has won</p>
          : <p>Black has won</p>
        )}
        {game.isDraw() && <p>Game has ended in a draw</p>}
        <button onClick={() => setGame(new Chess())}>New game</button>
      </div>}
    </div>
  ); 
}