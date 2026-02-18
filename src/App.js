import React, { useState } from 'react';
import PlayerSetup from './components/PlayerSetup';
import './App.css';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState([]);

  const handleGameStart = (selectedPlayers) => {
    setPlayers(selectedPlayers);
    setGameStarted(true);
  };

  const resetToSetup = () => {
    setGameStarted(false);
    setPlayers([]);
  };

  if (!gameStarted) {
    return (
      <div className="App">
        <PlayerSetup onGameStart={handleGameStart} />
      </div>
    );
  }

  return (
    <div className="App">
      <div className="game-placeholder">
        <h1>Game Started!</h1>
        <h2>Players:</h2>
        <ul>
          {players.map((player) => (
            <li key={player.id}>{player.name}</li>
          ))}
        </ul>
        <button onClick={resetToSetup}>Back to Setup</button>
      </div>
    </div>
  );
}

export default App;