import React, { useState } from 'react';
import './ScoreEntry.css';

const ScoreEntry = ({ players, round, bids, onScoreSubmit }) => {
  const [tricksData, setTricksData] = useState(
    players.reduce((acc, player) => {
      acc[player.id] = {
        tricksTaken: '',
        bonusPoints: ''
      };
      return acc;
    }, {})
  );
  const [calculatedScores, setCalculatedScores] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const handleTricksChange = (playerId, field, value) => {
    const numValue = value === '' ? '' : parseInt(value);
    if (numValue !== '' && (numValue < 0 || numValue > round)) {
      return; // Invalid input
    }

    setTricksData(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: value
      }
    }));
  };

  const calculateScores = () => {
    const scores = {};

    players.forEach(player => {
      const playerId = player.id;
      const bid = bids[playerId];
      const tricksTaken = parseInt(tricksData[playerId].tricksTaken) || 0;
      const bonusPoints = parseInt(tricksData[playerId].bonusPoints) || 0;

      let roundScore = 0;

      // Special case: Zero bid scoring
      if (bid === 0) {
        if (tricksTaken === 0) {
          // Successful zero bid: +10 × round number
          roundScore = 10 * round;
        } else {
          // Failed zero bid: -10 × round number
          roundScore = -10 * round;
        }
      } else {
        // Regular scoring
        if (tricksTaken === bid) {
          // Bid met exactly: +20 per correct trick
          roundScore = 20 * bid;
          // Add bonus points only if bid was met exactly
          roundScore += bonusPoints;
        } else {
          // Bid missed: -10 per miss
          const misses = Math.abs(tricksTaken - bid);
          roundScore = -10 * misses;
          // No bonus points when bid is missed
        }
      }

      scores[playerId] = {
        bid,
        tricksTaken,
        bonusPoints: bid !== 0 && tricksTaken === bid ? bonusPoints : 0, // Only count bonus if eligible
        roundScore,
        calculation: getRoundScoreCalculation(bid, tricksTaken, bonusPoints, round)
      };
    });

    setCalculatedScores(scores);
    setShowResults(true);
  };

  const getRoundScoreCalculation = (bid, tricksTaken, bonusPoints, round) => {
    if (bid === 0) {
      if (tricksTaken === 0) {
        return `Zero bid successful: +10 × ${round} = +${10 * round}`;
      } else {
        return `Zero bid failed: -10 × ${round} = ${-10 * round}`;
      }
    } else {
      if (tricksTaken === bid) {
        const base = 20 * bid;
        const bonus = bonusPoints;
        return `Bid met: +20 × ${bid}${bonus > 0 ? ` + ${bonus} bonus` : ''} = +${base + bonus}`;
      } else {
        const misses = Math.abs(tricksTaken - bid);
        return `Bid missed by ${misses}: -10 × ${misses} = ${-10 * misses}`;
      }
    }
  };

  const submitScores = () => {
    if (calculatedScores) {
      onScoreSubmit(calculatedScores);
    }
  };

  const allFieldsFilled = players.every(player => 
    tricksData[player.id].tricksTaken !== '' &&
    tricksData[player.id].bonusPoints !== ''
  );

  const totalTricks = players.reduce((sum, player) => {
    const tricks = parseInt(tricksData[player.id].tricksTaken) || 0;
    return sum + tricks;
  }, 0);

  const tricksValid = totalTricks <= round + players.length; // Allow for some flexibility

  return (
    <div className="score-entry">
      <h3>Round {round} - Score Entry</h3>
      
      <div className="score-entry-table">
        <div className="table-header">
          <div className="player-name">Player</div>
          <div className="bid-column">Bid</div>
          <div className="tricks-column">Tricks Taken</div>
          <div className="bonus-column">Bonus Points</div>
        </div>
        
        {players.map(player => (
          <div key={player.id} className="player-row">
            <div className="player-name">{player.name}</div>
            <div className="bid-column">{bids[player.id]}</div>
            <div className="tricks-column">
              <input
                type="number"
                min="0"
                max={round}
                value={tricksData[player.id].tricksTaken}
                onChange={(e) => handleTricksChange(player.id, 'tricksTaken', e.target.value)}
                className="tricks-input"
              />
            </div>
            <div className="bonus-column">
              <input
                type="number"
                min="0"
                max="100"
                value={tricksData[player.id].bonusPoints}
                onChange={(e) => handleTricksChange(player.id, 'bonusPoints', e.target.value)}
                className="bonus-input"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="score-actions">
        <button 
          onClick={calculateScores}
          disabled={!allFieldsFilled || !tricksValid}
          className="calculate-button"
        >
          Calculate Scores
        </button>
        {!tricksValid && (
          <div className="error-message">
            Total tricks ({totalTricks}) seems high for this round. Please verify.
          </div>
        )}
      </div>

      {showResults && calculatedScores && (
        <div className="score-results">
          <h4>Round {round} Results</h4>
          <div className="results-table">
            <div className="results-header">
              <div>Player</div>
              <div>Bid</div>
              <div>Taken</div>
              <div>Bonus</div>
              <div>Calculation</div>
              <div>Score</div>
            </div>
            {players.map(player => {
              const result = calculatedScores[player.id];
              return (
                <div key={player.id} className="result-row">
                  <div>{player.name}</div>
                  <div>{result.bid}</div>
                  <div>{result.tricksTaken}</div>
                  <div>{result.bonusPoints}</div>
                  <div className="calculation">{result.calculation}</div>
                  <div className={`score ${result.roundScore >= 0 ? 'positive' : 'negative'}`}>
                    {result.roundScore >= 0 ? '+' : ''}{result.roundScore}
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={submitScores} className="submit-button">
            Submit Round Scores
          </button>
        </div>
      )}
    </div>
  );
};

export default ScoreEntry;