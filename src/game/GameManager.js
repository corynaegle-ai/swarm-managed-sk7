const BidCollector = require('../bidding/BidCollector');
const BidCollectionUI = require('../ui/BidCollectionUI');

/**
 * GameManager - Manages the overall game flow
 */
class GameManager {
  constructor() {
    this.players = [];
    this.currentRound = 1;
    this.bidCollector = new BidCollector(this);
    this.bidUI = new BidCollectionUI(this.bidCollector);
    this.gameState = 'setup'; // setup, bidding, playing, scoring
  }

  /**
   * Add player to the game
   * @param {object} player - Player object with id and name
   */
  addPlayer(player) {
    this.players.push(player);
  }

  /**
   * Get all players
   * @returns {Array} Array of player objects
   */
  getPlayers() {
    return [...this.players];
  }

  /**
   * Start a new round
   * @param {number} roundNumber - Round number
   * @param {number} handCount - Number of hands for this round
   */
  startRound(roundNumber, handCount) {
    this.currentRound = roundNumber;
    this.bidCollector.initializeRound(roundNumber, handCount);
    this.gameState = 'bidding';
    
    // Set up event listener for bid completion
    document.addEventListener('bidsCompleted', (event) => {
      this.onBidsCompleted(event.detail.bids);
    });
  }

  /**
   * Render bid collection UI
   * @param {HTMLElement} container - Container element
   */
  renderBidCollection(container) {
    if (this.gameState !== 'bidding') {
      throw new Error('Game is not in bidding phase');
    }
    
    this.bidUI.render(container);
  }

  /**
   * Handle completion of bid collection
   * @param {Map} bids - Collected bids
   */
  onBidsCompleted(bids) {
    console.log('All bids collected:', bids);
    this.gameState = 'playing';
    
    // Proceed to next phase of the game
    this.proceedToPlay();
  }

  /**
   * Proceed to playing phase
   */
  proceedToPlay() {
    // This would transition to the card playing phase
    console.log(`Round ${this.currentRound}: Moving to playing phase`);
    
    // Emit event for other components to handle
    const event = new CustomEvent('gamePhaseChanged', {
      detail: { 
        phase: 'playing',
        round: this.currentRound,
        bids: this.bidCollector.getBids()
      }
    });
    document.dispatchEvent(event);
  }

  /**
   * Get current game state
   * @returns {string} Current game state
   */
  getGameState() {
    return this.gameState;
  }

  /**
   * Get current round number
   * @returns {number} Current round
   */
  getCurrentRound() {
    return this.currentRound;
  }

  /**
   * Reset the game
   */
  reset() {
    this.currentRound = 1;
    this.gameState = 'setup';
    this.bidCollector.reset();
  }
}

module.exports = GameManager;