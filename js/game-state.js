/**
 * GameState class manages the core game state including phases and rounds
 * Extends EventTarget to emit phase change notifications
 */
class GameState extends EventTarget {
    constructor() {
        super();
        
        // Game phases in order
        this.PHASES = {
            SETUP: 'setup',
            BIDDING: 'bidding',
            SCORING: 'scoring'
        };
        
        // Phase transition order
        this.PHASE_ORDER = [this.PHASES.SETUP, this.PHASES.BIDDING, this.PHASES.SCORING];
        
        // Initialize game state
        this.state = {
            currentPhase: this.PHASES.SETUP,
            currentRound: 1,
            phaseIndex: 0,
            gameStarted: false,
            gameComplete: false
        };
        
        this.TOTAL_ROUNDS = 10;
    }
    
    /**
     * Starts the game and initializes state
     * @returns {Object} Current game state
     */
    startGame() {
        this.state = {
            currentPhase: this.PHASES.SETUP,
            currentRound: 1,
            phaseIndex: 0,
            gameStarted: true,
            gameComplete: false
        };
        
        // Emit game start event
        this.dispatchEvent(new CustomEvent('gameStarted', {
            detail: {
                phase: this.state.currentPhase,
                round: this.state.currentRound
            }
        }));
        
        return { ...this.state };
    }
    
    /**
     * Advances to the next phase in the current round
     * @returns {Object} Current game state after phase change
     */
    nextPhase() {
        if (!this.state.gameStarted || this.state.gameComplete) {
            throw new Error('Game must be started and not complete to advance phases');
        }
        
        const previousPhase = this.state.currentPhase;
        
        // If we're at scoring phase, we need to advance to next round
        if (this.state.currentPhase === this.PHASES.SCORING) {
            return this.nextRound();
        }
        
        // Advance to next phase in current round
        this.state.phaseIndex = (this.state.phaseIndex + 1) % this.PHASE_ORDER.length;
        this.state.currentPhase = this.PHASE_ORDER[this.state.phaseIndex];
        
        // Emit phase change event
        this.dispatchEvent(new CustomEvent('phaseChanged', {
            detail: {
                previousPhase,
                currentPhase: this.state.currentPhase,
                round: this.state.currentRound
            }
        }));
        
        return { ...this.state };
    }
    
    /**
     * Advances to the next round (only called from scoring phase)
     * @returns {Object} Current game state after round change
     */
    nextRound() {
        if (!this.state.gameStarted || this.state.gameComplete) {
            throw new Error('Game must be started and not complete to advance rounds');
        }
        
        if (this.state.currentPhase !== this.PHASES.SCORING) {
            throw new Error('Can only advance to next round from scoring phase');
        }
        
        const previousRound = this.state.currentRound;
        
        // Check if game should be complete
        if (this.state.currentRound >= this.TOTAL_ROUNDS) {
            this.state.gameComplete = true;
            
            this.dispatchEvent(new CustomEvent('gameComplete', {
                detail: {
                    totalRounds: this.TOTAL_ROUNDS,
                    finalRound: this.state.currentRound
                }
            }));
            
            return { ...this.state };
        }
        
        // Advance to next round and reset to setup phase
        this.state.currentRound += 1;
        this.state.phaseIndex = 0;
        this.state.currentPhase = this.PHASES.SETUP;
        
        // Emit round change event
        this.dispatchEvent(new CustomEvent('roundChanged', {
            detail: {
                previousRound,
                currentRound: this.state.currentRound,
                phase: this.state.currentPhase
            }
        }));
        
        return { ...this.state };
    }
    
    /**
     * Checks if the game is complete (after 10 rounds)
     * @returns {boolean} True if game is complete
     */
    isGameComplete() {
        return this.state.gameComplete;
    }
    
    /**
     * Gets the current phase
     * @returns {string} Current phase name
     */
    getCurrentPhase() {
        return this.state.currentPhase;
    }
    
    /**
     * Gets the current round number
     * @returns {number} Current round (1-10)
     */
    getCurrentRound() {
        return this.state.currentRound;
    }
    
    /**
     * Gets the complete current game state
     * @returns {Object} Copy of current state
     */
    getState() {
        return { ...this.state };
    }
    
    /**
     * Resets the game to initial state
     * @returns {Object} Reset game state
     */
    resetGame() {
        const previousState = { ...this.state };
        
        this.state = {
            currentPhase: this.PHASES.SETUP,
            currentRound: 1,
            phaseIndex: 0,
            gameStarted: false,
            gameComplete: false
        };
        
        this.dispatchEvent(new CustomEvent('gameReset', {
            detail: {
                previousState,
                newState: { ...this.state }
            }
        }));
        
        return { ...this.state };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameState;
} else if (typeof window !== 'undefined') {
    window.GameState = GameState;
}