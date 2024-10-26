import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { nanoid } from 'nanoid';

const HomePage = () => {
  const navigate = useNavigate();
  const [cookies, setCookie] = useCookies(['userId']);

  useEffect(() => {
    const userId = cookies.userId || nanoid(8);
    if (!cookies.userId) setCookie('userId', userId, { path: '/', maxAge: 7 * 24 * 60 * 60 });
  }, [cookies, setCookie]);

  const handlePlayFriend = async () => {
    try {
      const response = await fetch('api/game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: cookies.userId }),
      });
      const data = await response.json();
      if (response.ok) {
        const { id } = data;
        navigate(`/${id}`);
      } else {
        console.error('Failed to create game', data);
      }
    } catch (error) {
      console.error('Error creating game:', error);
    }
  }
  
  return (
    <div>
      <h1>Project Chess</h1>
      <button onClick={handlePlayFriend}>Play with a friend</button>
    </div>
  );
}

export default HomePage;