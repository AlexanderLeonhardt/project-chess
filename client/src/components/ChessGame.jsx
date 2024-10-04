import { useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

export default function ChessGame() {
  const [game, setGame] = useState(new Chess());

  function makeAMove(move) {
    const gameCopy = new Chess(game.fen());
    const result = gameCopy.move(move);

    setGame(gameCopy);
    return result; // null if the move was illegal, the move object if the move was legal
  }

  function makeRandomMove() {
    setGame((prevGame) => {
      const gameCopy = new Chess(prevGame.fen());
      const possibleMoves = gameCopy.moves();

      if (gameCopy.isGameOver()) return;

      const randomIndex = Math.floor(Math.random() * possibleMoves.length);
      gameCopy.move(possibleMoves[randomIndex]);
      return gameCopy;
    });
  }

  function onDrop(sourceSquare, targetSquare) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // always promote to a queen for example simplicity
    });

    // illegal move
    if (move === null) return false;
    setTimeout(makeRandomMove, 200);
    return true;
  }

  return (
    <div className='chess-container'>
      <Chessboard position={game.fen()} onPieceDrop={onDrop} />;
    </div>
  ); 
}