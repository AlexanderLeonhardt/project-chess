import { useParams } from "react-router-dom";
import ChessGame from "./ChessGame";
import { useEffect, useState } from "react";
import { useCookies } from 'react-cookie';
import { nanoid } from 'nanoid';

const Room = () => {
  const { gameId } = useParams();
  const [gameFen, setGameFen] = useState(null);
  const [orientation, setOrientation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cookies, setCookie] = useCookies(['userId']);

  useEffect(() => {
    const fetchGameData = async () => {
      const userId = cookies.userId || nanoid(8);
      if (!cookies.userId) setCookie('userId', userId, { path: '/', maxAge: 7 * 24 * 60 * 60 });

      const response = await fetch(`/api/game/${gameId}?userId=${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setGameFen(data.fen);
        setOrientation(data.color);
      }
      setIsLoading(false);
    }

    fetchGameData();
  }, [gameId, cookies.user, setCookie]);

  if (isLoading) return <p>Loading...</p>
  
  return gameFen ? <ChessGame gameId={gameId} gameFen={gameFen} orientation={orientation}/> : <p>404 - Not Found</p>
}

export default Room;