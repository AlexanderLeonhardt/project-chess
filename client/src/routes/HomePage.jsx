
const HomePage = () => {
  const handleCreateRoom = async () => {
    try {
      const response = await fetch('http://localhost:3001/game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (response.ok) {
        const { id } = data;
        console.log(`Room created with ID: ${id}`);
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
      <button onClick={handleCreateRoom}>Create Room</button>
    </div>
  );
}

export default HomePage;