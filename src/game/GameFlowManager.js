import { EventEmitter } from 'events';

/**
 * Manages the overall game flow and state transitions
 * Handles progression through setup, bidding, scoring phases
 * Manages round progression and game completion
 */
class GameFlowManager extends EventEmitter {
  constructor() {
    super();
    this.reset();
  }

  /**
   * Reset game to initial state
   */
  reset() {
    this.gameState = {
      phase: 'setup', // setup, bidding, scoring, completed
      currentRound: 1,
      totalRounds: 10,
      isGameActive: false,
      isGameCompleted: false,
      players: [],
      scores: {},
      roundData: {}
    };
    this.emit('stateChanged', this.gameState);
  }

  /**
   * Start a new game with given players
   * @param {Array} players - Array of player objects
   */
  startGame(players) {
    if (!players || players.length < 2) {
      throw new Error('At least 2 players required to start game');
    }

    this.gameState.players = [...players];
    this.gameState.scores = {};
    
    // Initialize scores for all players
    players.forEach(player => {
      this.gameState.scores[player.id] = 0;
    });

    this.gameState.isGameActive = true;
    this.gameState.phase = 'bidding';
    this.gameState.currentRound = 1;
    
    this.emit('gameStarted', {
      players: this.gameState.players,
      currentRound: this.gameState.currentRound
    });
    
    this.emit('phaseChanged', {
      phase: this.gameState.phase,
      round: this.gameState.currentRound
    });
    
    this.emit('stateChanged', this.gameState);
  }

  /**
   * Transition to the next phase in the current round
   */
  nextPhase() {
    if (!this.gameState.isGameActive || this.gameState.isGameCompleted) {
      throw new Error('Cannot transition phase: game not active');
    }

    switch (this.gameState.phase) {
      case 'setup':
        this.gameState.phase = 'bidding';
        break;
      
      case 'bidding':
        this.gameState.phase = 'scoring';
        break;
      
      case 'scoring':
        // Complete current round and check if game should end
        this.completeRound();
        break;
      
      default:
        throw new Error(`Invalid phase transition from: ${this.gameState.phase}`);
    }

    this.emit('phaseChanged', {
      phase: this.gameState.phase,
      round: this.gameState.currentRound
    });
    
    this.emit('stateChanged', this.gameState);
  }

  /**
   * Complete the current round and progress to next or end game
   */
  completeRound() {
    if (this.gameState.currentRound >= this.gameState.totalRounds) {
      // Game completed
      this.gameState.phase = 'completed';
      this.gameState.isGameActive = false;
      this.gameState.isGameCompleted = true;
      
      const finalScores = { ...this.gameState.scores };
      const winner = this.determineWinner(finalScores);
      
      this.emit('gameCompleted', {
        finalScores,
        winner,
        totalRounds: this.gameState.totalRounds
      });
    } else {
      // Progress to next round
      this.gameState.currentRound++;
      this.gameState.phase = 'bidding';
      
      this.emit('roundCompleted', {
        completedRound: this.gameState.currentRound - 1,
        currentRound: this.gameState.currentRound,
        scores: { ...this.gameState.scores }
      });
      
      this.emit('phaseChanged', {
        phase: this.gameState.phase,
        round: this.gameState.currentRound
      });
    }
    
    this.emit('stateChanged', this.gameState);
  }

  /**
   * Update scores for the current round
   * @param {Object} roundScores - Object mapping player IDs to scores
   */
  updateScores(roundScores) {
    if (!roundScores || typeof roundScores !== 'object') {
      throw new Error('Invalid round scores provided');
    }

    // Add round scores to total scores
    Object.entries(roundScores).forEach(([playerId, score]) => {
      if (this.gameState.scores.hasOwnProperty(playerId)) {
        this.gameState.scores[playerId] += score;
      }
    });

    this.emit('scoresUpdated', {
      roundScores,
      totalScores: { ...this.gameState.scores },
      round: this.gameState.currentRound
    });
    
    this.emit('stateChanged', this.gameState);
  }

  /**
   * Determine the winner based on final scores
   * @param {Object} finalScores - Final scores object
   * @returns {Object} Winner information
   */
  determineWinner(finalScores) {
    const sortedPlayers = Object.entries(finalScores)
      .sort(([,a], [,b]) => b - a)
      .map(([playerId, score]) => ({
        playerId,
        score,
        player: this.gameState.players.find(p => p.id === playerId)
      }));

    return {
      winner: sortedPlayers[0],
      rankings: sortedPlayers
    };
  }

  /**
   * Get current game state
   * @returns {Object} Current game state
   */
  getGameState() {
    return { ...this.gameState };
  }

  /**
   * Get current phase information
   * @returns {Object} Current phase details
   */
  getCurrentPhase() {
    return {
      phase: this.gameState.phase,
      round: this.gameState.currentRound,
      totalRounds: this.gameState.totalRounds,
      isGameActive: this.gameState.isGameActive,
      isGameCompleted: this.gameState.isGameCompleted
    };
  }

  /**
   * Check if game can transition to next phase
   * @returns {boolean} Whether transition is possible
   */
  canTransitionPhase() {
    return this.gameState.isGameActive && 
           !this.gameState.isGameCompleted && 
           this.gameState.phase !== 'completed';
  }

  /**
   * Start a completely new game (reset and start)
   * @param {Array} players - Players for new game
   */
  startNewGame(players) {
    this.reset();
    this.startGame(players);
  }
}

export default GameFlowManager;