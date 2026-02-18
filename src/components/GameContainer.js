import React from 'react';
import ScoreDisplay from './ScoreDisplay';
import useGameState from '../hooks/useGameState';

const GameContainer = ({ players: initialPlayers = [] }) => {
  const {
    players,
    currentRound,
    roundHistory,
    gameComplete,
    addRoundScore,
    resetGame
  } = useGameState(initialPlayers);

  // Example function to simulate adding scores (for testing)
  const handleAddTestScores = () => {
    if (gameComplete) return;
    
    // Generate random scores for demonstration
    const roundScores = {};
    players.forEach(player => {
      roundScores[player.id] = Math.floor(Math.random() * 100) + 1;
    });
    
    addRoundScore(roundScores);
  };

  return (
    <div className="game-container">
      <ScoreDisplay 
        players={players}
        currentRound={currentRound}
        roundHistory={roundHistory}
        gameComplete={gameComplete}
      />
      
      <div className="game-controls" style={{ textAlign: 'center', marginTop: '20px' }}>
        {!gameComplete && (
          <button 
            onClick={handleAddTestScores}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Add Round Scores (Test)
          </button>
        )}
        
        <button 
          onClick={resetGame}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Reset Game
        </button>
      </div>
    </div>
  );
};

export default GameContainer;