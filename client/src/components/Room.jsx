import { useParams } from "react-router-dom";
import ChessGame from "./ChessGame";
import { useEffect, useState } from "react";

const Room = () => {
  const { gameId } = useParams();
  const [gameFen, setGameFen] = useState(null);

  useEffect(() => {
    const fetchGameFen = async () => {
      const response = await fetch(`http://192.168.1.151:3001/game/${gameId}`);
      if (response.ok) {
        const data = await response.json();
        setGameFen(data.fen);
      }
    }

    fetchGameFen();
  }, [gameId]);
  
  return gameFen ? <ChessGame gameId={gameId} gameFen={gameFen} /> : <p>Loading</p>
}

export default Room;