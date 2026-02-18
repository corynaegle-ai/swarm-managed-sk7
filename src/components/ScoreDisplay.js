import React from 'react';
import './ScoreDisplay.css';

const ScoreDisplay = ({ players, currentRound, roundHistory, gameComplete }) => {
  // Calculate total scores for each player
  const playersWithScores = players.map(player => {
    const totalScore = roundHistory.reduce((sum, round) => {
      return sum + (round[player.id] || 0);
    }, 0);
    return { ...player, totalScore };
  });

  // Sort players by total score (descending)
  const sortedPlayers = [...playersWithScores].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="score-display">
      <div className="game-progress">
        <h2>Round {currentRound} of 10</h2>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(currentRound / 10) * 100}%` }}
          />
        </div>
      </div>

      <div className="current-standings">
        <h3>{gameComplete ? 'Final Results' : 'Current Standings'}</h3>
        <div className="standings-list">
          {sortedPlayers.map((player, index) => (
            <div key={player.id} className={`player-standing ${index === 0 && gameComplete ? 'winner' : ''}`}>
              <span className="rank">#{index + 1}</span>
              <span className="player-name">{player.name}</span>
              <span className="total-score">{player.totalScore} pts</span>
            </div>
          ))}
        </div>
      </div>

      <div className="round-history">
        <h3>Round-by-Round Breakdown</h3>
        <div className="history-table">
          <div className="history-header">
            <div className="round-cell">Round</div>
            {players.map(player => (
              <div key={player.id} className="player-cell">{player.name}</div>
            ))}
          </div>
          {roundHistory.map((round, roundIndex) => (
            <div key={roundIndex} className="history-row">
              <div className="round-cell">{roundIndex + 1}</div>
              {players.map(player => (
                <div key={player.id} className="score-cell">
                  {round[player.id] !== undefined ? round[player.id] : '-'}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScoreDisplay;