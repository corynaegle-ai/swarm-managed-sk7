/**
 * GameController - Connects game state management with UI updates
 * Listens to GameState events and updates the DOM accordingly
 */
class GameController {
    constructor(gameState) {
        this.gameState = gameState;
        this.domElements = {};
        this.boundEventHandlers = {};
        
        // Initialize bound event handlers to prevent memory leaks
        this.boundEventHandlers.handlePhaseChange = this.handlePhaseChange.bind(this);
        this.boundEventHandlers.handleRoundUpdate = this.handleRoundUpdate.bind(this);
        this.boundEventHandlers.handleGameOver = this.handleGameOver.bind(this);
        this.boundEventHandlers.handleGameReset = this.handleGameReset.bind(this);
    }

    /**
     * Initialize the controller and set up event listeners
     */
    init() {
        try {
            this.cacheDOMElements();
            this.setupEventListeners();
            this.initialUIUpdate();
        } catch (error) {
            console.error('Failed to initialize GameController:', error);
            throw error;
        }
    }

    /**
     * Cache DOM elements to avoid repeated queries
     */
    cacheDOMElements() {
        const selectors = {
            phaseIndicator: '.phase-indicator',
            roundCounter: '.round-counter',
            newGameButton: '.new-game-button',
            gameOverScreen: '.game-over-screen',
            planningPhaseElements: '.planning-phase',
            actionPhaseElements: '.action-phase',
            resolutionPhaseElements: '.resolution-phase',
            gameEndElements: '.game-end'
        };

        for (const [key, selector] of Object.entries(selectors)) {
            if (key.includes('Elements')) {
                // For elements that might have multiple matches
                this.domElements[key] = document.querySelectorAll(selector);
            } else {
                // For single elements
                this.domElements[key] = document.querySelector(selector);
            }
        }
    }

    /**
     * Set up event listeners with proper validation
     */
    setupEventListeners() {
        if (!this.gameState) {
            throw new Error('GameState is required but not provided');
        }

        if (typeof this.gameState.addEventListener !== 'function') {
            throw new Error('GameState must implement EventTarget interface');
        }

        // Set up game state event listeners
        this.gameState.addEventListener('phaseChange', this.boundEventHandlers.handlePhaseChange);
        this.gameState.addEventListener('roundUpdate', this.boundEventHandlers.handleRoundUpdate);
        this.gameState.addEventListener('gameOver', this.boundEventHandlers.handleGameOver);
        this.gameState.addEventListener('gameReset', this.boundEventHandlers.handleGameReset);

        // Set up new game button listener
        if (this.domElements.newGameButton) {
            this.domElements.newGameButton.addEventListener('click', () => this.startNewGame());
        }
    }

    /**
     * Handle phase change events with consistent pattern
     * @param {CustomEvent} event - Phase change event
     */
    handlePhaseChange(event) {
        try {
            const phase = event?.detail?.phase || this.getCurrentPhase();
            if (!phase) {
                console.warn('Phase change event received but no phase data available');
                return;
            }
            
            this.updatePhaseIndicator(phase);
            this.updatePhaseSpecificUI(phase);
        } catch (error) {
            console.error('Error handling phase change:', error);
        }
    }

    /**
     * Handle round update events with consistent pattern
     * @param {CustomEvent} event - Round update event
     */
    handleRoundUpdate(event) {
        try {
            const round = event?.detail?.round || this.getCurrentRound();
            if (round !== null && round !== undefined) {
                this.updateRoundCounter(round);
            }
        } catch (error) {
            console.error('Error handling round update:', error);
        }
    }

    /**
     * Handle game over events with consistent pattern
     * @param {CustomEvent} event - Game over event
     */
    handleGameOver(event) {
        try {
            const gameData = event?.detail || {};
            this.showGameOverUI(gameData);
        } catch (error) {
            console.error('Error handling game over:', error);
        }
    }

    /**
     * Handle game reset events with consistent pattern
     * @param {CustomEvent} event - Game reset event
     */
    handleGameReset(event) {
        try {
            this.resetUI();
        } catch (error) {
            console.error('Error handling game reset:', error);
        }
    }

    /**
     * Update the phase indicator UI
     * @param {string} phase - Current game phase
     */
    updatePhaseIndicator(phase) {
        if (!this.domElements.phaseIndicator) return;
        
        this.domElements.phaseIndicator.textContent = this.formatPhaseName(phase);
        this.domElements.phaseIndicator.className = `phase-indicator phase-${phase.toLowerCase()}`;
    }

    /**
     * Update phase-specific UI elements visibility
     * @param {string} phase - Current game phase
     */
    updatePhaseSpecificUI(phase) {
        const phaseMap = {
            'planning': this.domElements.planningPhaseElements,
            'action': this.domElements.actionPhaseElements,
            'resolution': this.domElements.resolutionPhaseElements,
            'gameEnd': this.domElements.gameEndElements
        };

        // Hide all phase-specific elements
        Object.values(phaseMap).forEach(elements => {
            if (elements && elements.length) {
                elements.forEach(el => el.classList.add('hidden'));
            }
        });

        // Show current phase elements
        const currentPhaseElements = phaseMap[phase.toLowerCase()];
        if (currentPhaseElements && currentPhaseElements.length) {
            currentPhaseElements.forEach(el => el.classList.remove('hidden'));
        }
    }

    /**
     * Update the round counter display
     * @param {number} round - Current round number
     */
    updateRoundCounter(round) {
        if (!this.domElements.roundCounter) return;
        
        this.domElements.roundCounter.textContent = `Round: ${round}`;
    }

    /**
     * Show game over UI elements
     * @param {Object} gameData - Game completion data
     */
    showGameOverUI(gameData) {
        // Show game over screen
        if (this.domElements.gameOverScreen) {
            this.domElements.gameOverScreen.classList.remove('hidden');
        }

        // Show new game button
        if (this.domElements.newGameButton) {
            this.domElements.newGameButton.classList.remove('hidden');
        }

        // Hide game-specific UI elements
        this.hideActiveGameUI();
    }

    /**
     * Hide active game UI elements
     */
    hideActiveGameUI() {
        const elementsToHide = [
            this.domElements.planningPhaseElements,
            this.domElements.actionPhaseElements,
            this.domElements.resolutionPhaseElements
        ];

        elementsToHide.forEach(elements => {
            if (elements && elements.length) {
                elements.forEach(el => el.classList.add('hidden'));
            }
        });
    }

    /**
     * Reset UI to initial state
     */
    resetUI() {
        // Hide game over elements
        if (this.domElements.gameOverScreen) {
            this.domElements.gameOverScreen.classList.add('hidden');
        }

        if (this.domElements.newGameButton) {
            this.domElements.newGameButton.classList.add('hidden');
        }

        // Reset counters and indicators
        this.updateRoundCounter(1);
        this.updatePhaseIndicator('planning');
        this.updatePhaseSpecificUI('planning');
    }

    /**
     * Perform initial UI update based on current game state
     */
    initialUIUpdate() {
        try {
            const currentPhase = this.getCurrentPhase();
            const currentRound = this.getCurrentRound();
            const isGameOver = this.isGameOver();

            if (isGameOver) {
                this.showGameOverUI({});
            } else {
                this.updatePhaseIndicator(currentPhase);
                this.updatePhaseSpecificUI(currentPhase);
                this.updateRoundCounter(currentRound);
            }
        } catch (error) {
            console.error('Error during initial UI update:', error);
        }
    }

    /**
     * Start a new game with full validation
     */
    startNewGame() {
        try {
            if (!this.gameState) {
                throw new Error('GameState not available');
            }

            // Validate all required methods exist
            const requiredMethods = ['reset', 'getCurrentPhase', 'getCurrentRound', 'isGameOver'];
            for (const method of requiredMethods) {
                if (typeof this.gameState[method] !== 'function') {
                    throw new Error(`GameState.${method} is not a function`);
                }
            }

            // Reset the game state
            this.gameState.reset();
            
            // UI will be updated through the gameReset event handler
        } catch (error) {
            console.error('Failed to start new game:', error);
        }
    }

    /**
     * Update the entire UI based on current game state
     */
    updateUI() {
        try {
            this.initialUIUpdate();
        } catch (error) {
            console.error('Error updating UI:', error);
        }
    }

    /**
     * Get current phase with error handling
     * @returns {string} Current game phase
     */
    getCurrentPhase() {
        if (this.gameState && typeof this.gameState.getCurrentPhase === 'function') {
            return this.gameState.getCurrentPhase();
        }
        return 'planning'; // Default fallback
    }

    /**
     * Get current round with error handling
     * @returns {number} Current round number
     */
    getCurrentRound() {
        if (this.gameState && typeof this.gameState.getCurrentRound === 'function') {
            return this.gameState.getCurrentRound();
        }
        return 1; // Default fallback
    }

    /**
     * Check if game is over with error handling
     * @returns {boolean} True if game is over
     */
    isGameOver() {
        if (this.gameState && typeof this.gameState.isGameOver === 'function') {
            return this.gameState.isGameOver();
        }
        return false; // Default fallback
    }

    /**
     * Format phase name for display
     * @param {string} phase - Phase name
     * @returns {string} Formatted phase name
     */
    formatPhaseName(phase) {
        return phase.charAt(0).toUpperCase() + phase.slice(1).toLowerCase();
    }

    /**
     * Clean up event listeners and prevent memory leaks
     */
    destroy() {
        if (this.gameState && typeof this.gameState.removeEventListener === 'function') {
            // Remove event listeners using the same bound references
            this.gameState.removeEventListener('phaseChange', this.boundEventHandlers.handlePhaseChange);
            this.gameState.removeEventListener('roundUpdate', this.boundEventHandlers.handleRoundUpdate);
            this.gameState.removeEventListener('gameOver', this.boundEventHandlers.handleGameOver);
            this.gameState.removeEventListener('gameReset', this.boundEventHandlers.handleGameReset);
        }

        // Clear references
        this.gameState = null;
        this.domElements = {};
        this.boundEventHandlers = {};
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameController;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.GameController = GameController;
}