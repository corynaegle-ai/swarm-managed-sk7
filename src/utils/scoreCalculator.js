/**
 * Skull King scoring calculation utilities
 * Implements the official Skull King scoring rules
 */

/**
 * Calculate the score for a single player's round
 * @param {number} bid - The player's bid for the round
 * @param {number} tricksTaken - Actual tricks taken by the player
 * @param {number} bonusPoints - Bonus points earned (only counted if bid met exactly)
 * @param {number} roundNumber - Current round number (used for zero bid scoring)
 * @returns {Object} Score calculation result
 */
export const calculatePlayerScore = (bid, tricksTaken, bonusPoints, roundNumber) => {
  let roundScore = 0;
  let calculation = '';
  let actualBonus = 0;

  // Validate inputs
  if (typeof bid !== 'number' || typeof tricksTaken !== 'number' || 
      typeof bonusPoints !== 'number' || typeof roundNumber !== 'number') {
    throw new Error('All parameters must be numbers');
  }

  if (bid < 0 || tricksTaken < 0 || bonusPoints < 0 || roundNumber < 1) {
    throw new Error('All parameters must be non-negative (except roundNumber must be >= 1)');
  }

  // Special case: Zero bid scoring
  if (bid === 0) {
    if (tricksTaken === 0) {
      // Successful zero bid: +10 × round number
      roundScore = 10 * roundNumber;
      calculation = `Zero bid successful: +10 × ${roundNumber} = +${roundScore}`;
    } else {
      // Failed zero bid: -10 × round number  
      roundScore = -10 * roundNumber;
      calculation = `Zero bid failed (took ${tricksTaken}): -10 × ${roundNumber} = ${roundScore}`;
    }
    // No bonus points for zero bids
    actualBonus = 0;
  } else {
    // Regular scoring
    if (tricksTaken === bid) {
      // Bid met exactly: +20 per correct trick
      const baseScore = 20 * bid;
      actualBonus = bonusPoints; // Only apply bonus if bid was met exactly
      roundScore = baseScore + actualBonus;
      
      if (actualBonus > 0) {
        calculation = `Bid met exactly: +20 × ${bid} + ${actualBonus} bonus = +${roundScore}`;
      } else {
        calculation = `Bid met exactly: +20 × ${bid} = +${roundScore}`;
      }
    } else {
      // Bid missed: -10 per miss
      const misses = Math.abs(tricksTaken - bid);
      roundScore = -10 * misses;
      actualBonus = 0; // No bonus points when bid is missed
      
      const missType = tricksTaken > bid ? 'overtricks' : 'undertricks';
      calculation = `Bid missed by ${misses} ${missType}: -10 × ${misses} = ${roundScore}`;
    }
  }

  return {
    bid,
    tricksTaken,
    bonusPoints: actualBonus,
    roundScore,
    calculation,
    bidMet: bid === 0 ? tricksTaken === 0 : tricksTaken === bid
  };
};

/**
 * Calculate scores for all players in a round
 * @param {Array} players - Array of player objects with id and name
 * @param {Object} bids - Object mapping player IDs to their bids
 * @param {Object} tricksData - Object mapping player IDs to their tricks and bonus data
 * @param {number} roundNumber - Current round number
 * @returns {Object} Complete scoring results for all players
 */
export const calculateRoundScores = (players, bids, tricksData, roundNumber) => {
  const results = {};
  
  players.forEach(player => {
    const playerId = player.id;
    const bid = bids[playerId] || 0;
    const playerData = tricksData[playerId] || { tricksTaken: 0, bonusPoints: 0 };
    const tricksTaken = parseInt(playerData.tricksTaken) || 0;
    const bonusPoints = parseInt(playerData.bonusPoints) || 0;
    
    results[playerId] = calculatePlayerScore(bid, tricksTaken, bonusPoints, roundNumber);
  });
  
  return results;
};

/**
 * Validate that the total tricks taken makes sense for the round
 * @param {Object} tricksData - Object mapping player IDs to their tricks data
 * @param {number} roundNumber - Current round number (max possible tricks)
 * @returns {Object} Validation result with isValid flag and message
 */
export const validateTricksTotal = (tricksData, roundNumber) => {
  const totalTricks = Object.values(tricksData).reduce((sum, data) => {
    return sum + (parseInt(data.tricksTaken) || 0);
  }, 0);
  
  // In Skull King, total tricks should equal the round number
  // (each round has exactly that many tricks available)
  if (totalTricks === roundNumber) {
    return { isValid: true, message: 'Tricks total is correct' };
  } else if (totalTricks < roundNumber) {
    return { 
      isValid: false, 
      message: `Total tricks (${totalTricks}) is less than round number (${roundNumber}). ${roundNumber - totalTricks} tricks unaccounted for.`
    };
  } else {
    return {
      isValid: false,
      message: `Total tricks (${totalTricks}) exceeds round number (${roundNumber}). Too many tricks recorded.`
    };
  }
};

/**
 * Get a summary of scoring rules for display
 * @returns {Object} Scoring rules summary
 */
export const getScoringRules = () => {
  return {
    regular: {
      bidMet: '+20 points per trick (if bid met exactly)',
      bidMissed: '-10 points per trick missed (over or under)',
      bonus: 'Bonus points only awarded when bid is met exactly'
    },
    zeroBid: {
      success: '+10 × round number (if no tricks taken)',
      failure: '-10 × round number (if any tricks taken)',
      bonus: 'No bonus points available for zero bids'
    }
  };
};