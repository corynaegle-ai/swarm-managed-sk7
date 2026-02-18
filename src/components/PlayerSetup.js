import React, { useState } from 'react';
import './PlayerSetup.css';

const PlayerSetup = ({ onGameStart }) => {
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState('');

  const MIN_PLAYERS = 2;
  const MAX_PLAYERS = 8;

  const addPlayer = () => {
    const trimmedName = newPlayerName.trim();
    
    if (!trimmedName) {
      setError('Player name cannot be empty');
      return;
    }

    if (players.some(player => player.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError('Player name must be unique');
      return;
    }

    if (players.length >= MAX_PLAYERS) {
      setError(`Maximum ${MAX_PLAYERS} players allowed`);
      return;
    }

    setPlayers([...players, { id: Date.now(), name: trimmedName }]);
    setNewPlayerName('');
    setError('');
  };

  const removePlayer = (playerId) => {
    setPlayers(players.filter(player => player.id !== playerId));
    setError('');
  };

  const startEditing = (index, name) => {
    setEditingIndex(index);
    setEditingName(name);
    setError('');
  };

  const saveEdit = () => {
    const trimmedName = editingName.trim();
    
    if (!trimmedName) {
      setError('Player name cannot be empty');
      return;
    }

    if (players.some((player, index) => 
      index !== editingIndex && player.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError('Player name must be unique');
      return;
    }

    const updatedPlayers = [...players];
    updatedPlayers[editingIndex] = { ...updatedPlayers[editingIndex], name: trimmedName };
    setPlayers(updatedPlayers);
    setEditingIndex(-1);
    setEditingName('');
    setError('');
  };

  const cancelEdit = () => {
    setEditingIndex(-1);
    setEditingName('');
    setError('');
  };

  const handleStartGame = () => {
    if (players.length < MIN_PLAYERS) {
      setError(`Need at least ${MIN_PLAYERS} players to start`);
      return;
    }
    onGameStart(players);
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <div className="player-setup">
      <h1>Player Setup</h1>
      <div className="player-count">
        Players: {players.length} / {MAX_PLAYERS} (Need {MIN_PLAYERS}-{MAX_PLAYERS} to play)
      </div>

      <div className="add-player-section">
        <div className="input-group">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, addPlayer)}
            placeholder="Enter player name"
            maxLength="30"
            disabled={players.length >= MAX_PLAYERS}
          />
          <button 
            onClick={addPlayer}
            disabled={players.length >= MAX_PLAYERS || !newPlayerName.trim()}
          >
            Add Player
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="players-list">
        {players.map((player, index) => (
          <div key={player.id} className="player-item">
            {editingIndex === index ? (
              <div className="player-edit">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, saveEdit)}
                  maxLength="30"
                  autoFocus
                />
                <div className="edit-actions">
                  <button onClick={saveEdit}>Save</button>
                  <button onClick={cancelEdit}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="player-display">
                <span className="player-name">{player.name}</span>
                <div className="player-actions">
                  <button onClick={() => startEditing(index, player.name)}>Edit</button>
                  <button onClick={() => removePlayer(player.id)} className="remove-btn">Remove</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="start-game-section">
        <button 
          className="start-game-btn"
          onClick={handleStartGame}
          disabled={players.length < MIN_PLAYERS}
        >
          Start Game ({players.length} players)
        </button>
      </div>
    </div>
  );
};

export default PlayerSetup;