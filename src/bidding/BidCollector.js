/**
 * BidCollector - Handles bid collection from all players
 */
class BidCollector {
  constructor(game) {
    this.game = game;
    this.bids = new Map();
    this.currentRound = 1;
    this.maxBid = 1;
  }

  /**
   * Initialize bid collection for a round
   * @param {number} roundNumber - Current round number
   * @param {number} handCount - Number of hands for this round
   */
  initializeRound(roundNumber, handCount) {
    this.currentRound = roundNumber;
    this.maxBid = handCount;
    this.bids.clear();
  }

  /**
   * Get round information for display
   * @returns {object} Round info
   */
  getRoundInfo() {
    return {
      roundNumber: this.currentRound,
      handCount: this.maxBid,
      totalPlayers: this.game.getPlayers().length,
      bidsCollected: this.bids.size
    };
  }

  /**
   * Collect bid from a player
   * @param {string} playerId - Player identifier
   * @param {number} bid - Player's bid
   * @returns {object} Result of bid submission
   */
  collectBid(playerId, bid) {
    // Validate bid amount
    if (!this.validateBid(bid)) {
      return {
        success: false,
        error: `Bid must be between 0 and ${this.maxBid} (number of hands)`
      };
    }

    // Store the bid
    this.bids.set(playerId, bid);
    
    return {
      success: true,
      message: `Bid of ${bid} recorded for player ${playerId}`
    };
  }

  /**
   * Validate a bid amount
   * @param {number} bid - Bid to validate
   * @returns {boolean} Whether bid is valid
   */
  validateBid(bid) {
    return typeof bid === 'number' && 
           bid >= 0 && 
           bid <= this.maxBid && 
           Number.isInteger(bid);
  }

  /**
   * Get players who still need to submit bids
   * @returns {Array} List of player IDs who haven't bid
   */
  getPlayersNeedingBids() {
    const allPlayers = this.game.getPlayers().map(p => p.id);
    return allPlayers.filter(playerId => !this.bids.has(playerId));
  }

  /**
   * Check if all players have submitted bids
   * @returns {boolean} True if all bids collected
   */
  allBidsCollected() {
    const totalPlayers = this.game.getPlayers().length;
    return this.bids.size === totalPlayers;
  }

  /**
   * Get all collected bids
   * @returns {Map} Map of playerId -> bid
   */
  getBids() {
    return new Map(this.bids);
  }

  /**
   * Get bid for specific player
   * @param {string} playerId - Player identifier
   * @returns {number|null} Player's bid or null if not submitted
   */
  getPlayerBid(playerId) {
    return this.bids.get(playerId) || null;
  }

  /**
   * Reset bid collection
   */
  reset() {
    this.bids.clear();
  }
}

module.exports = BidCollector;