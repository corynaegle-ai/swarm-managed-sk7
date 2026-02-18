import React, { useState, useEffect } from 'react';
import GameFlowManager from '../game/GameFlowManager';
import GamePhaseIndicator from './GamePhaseIndicator';

/**
 * Main game controller component that manages game flow
 * Handles phase transitions and game state management
 */
const GameController = ({ players = [], onGameStateChange }) => {
  const [gameFlowManager] = useState(() => new GameFlowManager());
  const [gameState, setGameState] = useState(gameFlowManager.getGameState());
  const [error, setError] = useState(null);

  useEffect(() => {
    // Set up event listeners
    const handleStateChange = (newState) => {
      setGameState({ ...newState });
      if (onGameStateChange) {
        onGameStateChange(newState);
      }
    };

    const handleError = (error) => {
      setError(error.message || 'An error occurred');
      setTimeout(() => setError(null), 5000);
    };

    gameFlowManager.on('stateChanged', handleStateChange);
    gameFlowManager.on('error', handleError);

    // Cleanup listeners
    return () => {
      gameFlowManager.removeListener('stateChanged', handleStateChange);
      gameFlowManager.removeListener('error', handleError);
    };
  }, [gameFlowManager, onGameStateChange]);

  const handleStartGame = () => {
    try {
      setError(null);
      gameFlowManager.startGame(players);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNextPhase = () => {
    try {
      setError(null);
      gameFlowManager.nextPhase();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStartNewGame = () => {
    try {
      setError(null);
      gameFlowManager.startNewGame(players);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateScores = (roundScores) => {
    try {
      setError(null);
      gameFlowManager.updateScores(roundScores);
    } catch (err) {
      setError(err.message);
    }
  };

  const getPhaseActions = () => {
    const { phase, isGameActive, isGameCompleted } = gameState;

    if (isGameCompleted) {
      return (
        <div className="flex flex-col gap-3">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              🎉 Game Completed!
            </h3>
            <p className="text-green-700">
              All {gameState.totalRounds} rounds have been completed.
            </p>
          </div>
          
          <button
            onClick={handleStartNewGame}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Start New Game
          </button>
        </div>
      );
    }

    if (!isGameActive) {
      return (
        <button
          onClick={handleStartGame}
          disabled={!players || players.length < 2}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Start Game
        </button>
      );
    }

    return (
      <div className="flex gap-3">
        <button
          onClick={handleNextPhase}
          disabled={!gameFlowManager.canTransitionPhase()}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {phase === 'bidding' ? 'Start Scoring' : 
           phase === 'scoring' ? 'Complete Round' : 'Next Phase'}
        </button>
        
        {phase === 'scoring' && (
          <button
            onClick={() => {
              // Example: Update scores for demo purposes
              const demoScores = {};
              players.forEach(player => {
                demoScores[player.id] = Math.floor(Math.random() * 10);
              });
              handleUpdateScores(demoScores);
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Update Scores
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="game-controller max-w-2xl mx-auto p-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <GamePhaseIndicator gameState={gameState} />
      
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Game Controls</h2>
          <div className="text-sm text-gray-600">
            {players.length} players
          </div>
        </div>
        
        {getPhaseActions()}
        
        {gameState.isGameActive && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Current Scores:</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(gameState.scores).map(([playerId, score]) => {
                const player = players.find(p => p.id === playerId);
                return (
                  <div key={playerId} className="flex justify-between text-sm">
                    <span>{player?.name || playerId}:</span>
                    <span className="font-medium">{score}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameController;