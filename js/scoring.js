/**
 * Skull King Scoring Calculation Engine
 * Handles round scoring calculations including base scoring, zero bid special cases, and bonus points
 */

/**
 * Calculate round scores for all players
 * @param {Array} players - Array of player objects with current scores and bids
 * @param {number} roundNumber - Current round number (1-10)
 * @param {Object} tricksData - Object mapping player IDs to tricks taken
 * @param {Object} bonusData - Object mapping player IDs to bonus points earned
 * @returns {Array} Updated player objects with new round scores and total scores
 */
function calculateRoundScores(players, roundNumber, tricksData, bonusData) {
  // Validate inputs
  if (!Array.isArray(players) || players.length === 0) {
    throw new Error('Players array is required and cannot be empty');
  }
  
  if (!Number.isInteger(roundNumber) || roundNumber < 1 || roundNumber > 10) {
    throw new Error('Round number must be an integer between 1 and 10');
  }
  
  if (!tricksData || typeof tricksData !== 'object') {
    throw new Error('Tricks data is required and must be an object');
  }
  
  if (!bonusData || typeof bonusData !== 'object') {
    throw new Error('Bonus data is required and must be an object');
  }
  
  // Create deep copy of players to avoid mutating original array
  const updatedPlayers = players.map(player => ({ ...player }));
  
  updatedPlayers.forEach(player => {
    const playerId = player.id;
    const bid = player.bid || 0;
    const tricksTaken = tricksData[playerId] || 0;
    const bonusPoints = bonusData[playerId] || 0;
    
    // Validate player data
    if (!Number.isInteger(bid) || bid < 0) {
      throw new Error(`Invalid bid for player ${playerId}: must be non-negative integer`);
    }
    
    if (!Number.isInteger(tricksTaken) || tricksTaken < 0) {
      throw new Error(`Invalid tricks taken for player ${playerId}: must be non-negative integer`);
    }
    
    let roundScore = 0;
    
    // Check if bid was met exactly
    const bidMetExactly = bid === tricksTaken;
    
    if (bid === 0) {
      // Zero bid special scoring
      if (bidMetExactly) {
        // Successful zero bid: +10 × round number
        roundScore = 10 * roundNumber;
      } else {
        // Failed zero bid: -10 × round number
        roundScore = -10 * roundNumber;
      }
    } else {
      // Non-zero bid scoring
      if (bidMetExactly) {
        // Correct bid: +20 points per trick
        roundScore = 20 * bid;
      } else {
        // Incorrect bid: -10 points per trick difference
        const trickDifference = Math.abs(bid - tricksTaken);
        roundScore = -10 * trickDifference;
      }
    }
    
    // Apply bonus points only if bid was met exactly
    if (bidMetExactly && bonusPoints > 0) {
      roundScore += bonusPoints;
    }
    
    // Update player's round score and total score
    player.roundScore = roundScore;
    player.totalScore = (player.totalScore || 0) + roundScore;
  });
  
  return updatedPlayers;
}

// Export the function
module.exports = { calculateRoundScores };