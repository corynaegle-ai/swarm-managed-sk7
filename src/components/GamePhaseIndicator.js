import React from 'react';

/**
 * Component to display current game phase and round information
 * Provides clear visual indicators of game progress
 */
const GamePhaseIndicator = ({ gameState }) => {
  const { phase, currentRound, totalRounds, isGameCompleted } = gameState;

  const getPhaseDisplay = () => {
    switch (phase) {
      case 'setup':
        return {
          title: 'Game Setup',
          description: 'Setting up the game...',
          color: 'bg-blue-500'
        };
      case 'bidding':
        return {
          title: 'Bidding Phase',
          description: 'Players are placing their bids',
          color: 'bg-yellow-500'
        };
      case 'scoring':
        return {
          title: 'Scoring Phase',
          description: 'Calculating round scores',
          color: 'bg-green-500'
        };
      case 'completed':
        return {
          title: 'Game Completed',
          description: 'All rounds finished!',
          color: 'bg-purple-500'
        };
      default:
        return {
          title: 'Unknown Phase',
          description: '',
          color: 'bg-gray-500'
        };
    }
  };

  const phaseInfo = getPhaseDisplay();
  const progress = (currentRound / totalRounds) * 100;

  return (
    <div className="game-phase-indicator bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full ${phaseInfo.color} mr-3`}></div>
          <h3 className="text-lg font-semibold text-gray-800">
            {phaseInfo.title}
          </h3>
        </div>
        
        {!isGameCompleted && (
          <div className="text-sm font-medium text-gray-600">
            Round {currentRound} of {totalRounds}
          </div>
        )}
      </div>
      
      <p className="text-gray-600 text-sm mb-3">
        {phaseInfo.description}
      </p>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${phaseInfo.color}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Start</span>
        <span>{Math.round(progress)}% Complete</span>
        <span>End</span>
      </div>
    </div>
  );
};

export default GamePhaseIndicator;