/**
 * GameController - Connects game state management with UI updates
 * Listens to GameState events and updates the DOM accordingly
 */
class GameController {
    constructor(gameState) {
        this.gameState = gameState;
        this.phaseIndicators = null;
        this.roundCounter = null;
        this.newGameButton = null;
        this.gameContainer = null;
        this.gameOverScreen = null;
        
        this.init();
    }

    /**
     * Initialize the controller and set up event listeners
     */
    init() {
        try {
            // Cache DOM elements
            this.phaseIndicators = document.querySelectorAll('[data-phase]');
            this.roundCounter = document.querySelector('[data-round-counter]');
            this.newGameButton = document.querySelector('[data-new-game]');
            this.gameContainer = document.querySelector('[data-game-container]');
            this.gameOverScreen = document.querySelector('[data-game-over]');
            
            // Listen for GameState events
            if (this.gameState) {
                this.gameState.addEventListener('stateChanged', this.handleStateChange.bind(this));
                this.gameState.addEventListener('phaseChanged', this.handlePhaseChange.bind(this));
                this.gameState.addEventListener('roundChanged', this.handleRoundChange.bind(this));
                this.gameState.addEventListener('gameOver', this.handleGameOver.bind(this));
            }
            
            // Set up new game button
            if (this.newGameButton) {
                this.newGameButton.addEventListener('click', this.startNewGame.bind(this));
            }
            
            // Initialize UI to current state
            this.updateUI();
            
        } catch (error) {
            console.error('GameController initialization failed:', error);
        }
    }

    /**
     * Handle general state changes
     */
    handleStateChange(event) {
        try {
            this.updateUI();
        } catch (error) {
            console.error('Error handling state change:', error);
        }
    }

    /**
     * Handle phase transitions and update phase indicators
     */
    handlePhaseChange(event) {
        try {
            const currentPhase = event.detail ? event.detail.phase : this.gameState.getCurrentPhase();
            
            // Update phase indicators
            this.phaseIndicators.forEach(indicator => {
                const phase = indicator.dataset.phase;
                if (phase === currentPhase) {
                    indicator.classList.add('active', 'current-phase');
                    indicator.classList.remove('inactive');
                } else {
                    indicator.classList.remove('active', 'current-phase');
                    indicator.classList.add('inactive');
                }
            });
            
            // Show/hide phase-specific UI elements
            this.updatePhaseSpecificUI(currentPhase);
            
        } catch (error) {
            console.error('Error handling phase change:', error);
        }
    }

    /**
     * Handle round counter updates
     */
    handleRoundChange(event) {
        try {
            const currentRound = event.detail ? event.detail.round : this.gameState.getCurrentRound();
            
            if (this.roundCounter) {
                this.roundCounter.textContent = currentRound;
                this.roundCounter.classList.add('updated');
                
                // Remove animation class after animation completes
                setTimeout(() => {
                    this.roundCounter.classList.remove('updated');
                }, 300);
            }
            
        } catch (error) {
            console.error('Error handling round change:', error);
        }
    }

    /**
     * Handle game over state
     */
    handleGameOver(event) {
        try {
            // Hide game container
            if (this.gameContainer) {
                this.gameContainer.classList.add('hidden');
            }
            
            // Show game over screen
            if (this.gameOverScreen) {
                this.gameOverScreen.classList.remove('hidden');
                this.gameOverScreen.classList.add('visible');
            }
            
            // Show new game button
            if (this.newGameButton) {
                this.newGameButton.classList.remove('hidden');
                this.newGameButton.classList.add('visible');
            }
            
        } catch (error) {
            console.error('Error handling game over:', error);
        }
    }

    /**
     * Update phase-specific UI elements visibility
     */
    updatePhaseSpecificUI(phase) {
        try {
            const phaseElements = {
                'setup': document.querySelectorAll('[data-phase-ui="setup"]'),
                'planning': document.querySelectorAll('[data-phase-ui="planning"]'),
                'execution': document.querySelectorAll('[data-phase-ui="execution"]'),
                'resolution': document.querySelectorAll('[data-phase-ui="resolution"]')
            };
            
            // Hide all phase-specific elements first
            Object.values(phaseElements).forEach(elements => {
                elements.forEach(element => {
                    element.classList.add('hidden');
                    element.classList.remove('visible');
                });
            });
            
            // Show elements for current phase
            if (phaseElements[phase]) {
                phaseElements[phase].forEach(element => {
                    element.classList.remove('hidden');
                    element.classList.add('visible');
                });
            }
            
        } catch (error) {
            console.error('Error updating phase-specific UI:', error);
        }
    }

    /**
     * Update the entire UI based on current game state
     */
    updateUI() {
        try {
            if (!this.gameState) {
                console.warn('GameState not available for UI update');
                return;
            }
            
            const currentPhase = this.gameState.getCurrentPhase();
            const currentRound = this.gameState.getCurrentRound();
            const isGameOver = this.gameState.isGameOver();
            
            // Update phase indicators
            this.updatePhaseIndicators(currentPhase);
            
            // Update round counter
            this.updateRoundCounter(currentRound);
            
            // Update phase-specific UI
            this.updatePhaseSpecificUI(currentPhase);
            
            // Handle game over state
            if (isGameOver) {
                this.showGameOverUI();
            } else {
                this.hideGameOverUI();
            }
            
        } catch (error) {
            console.error('Error updating UI:', error);
        }
    }

    /**
     * Update phase indicators
     */
    updatePhaseIndicators(currentPhase) {
        try {
            this.phaseIndicators.forEach(indicator => {
                const phase = indicator.dataset.phase;
                if (phase === currentPhase) {
                    indicator.classList.add('active', 'current-phase');
                    indicator.classList.remove('inactive');
                } else {
                    indicator.classList.remove('active', 'current-phase');
                    indicator.classList.add('inactive');
                }
            });
        } catch (error) {
            console.error('Error updating phase indicators:', error);
        }
    }

    /**
     * Update round counter display
     */
    updateRoundCounter(round) {
        try {
            if (this.roundCounter) {
                this.roundCounter.textContent = round;
            }
        } catch (error) {
            console.error('Error updating round counter:', error);
        }
    }

    /**
     * Show game over UI elements
     */
    showGameOverUI() {
        try {
            if (this.gameContainer) {
                this.gameContainer.classList.add('hidden');
            }
            
            if (this.gameOverScreen) {
                this.gameOverScreen.classList.remove('hidden');
                this.gameOverScreen.classList.add('visible');
            }
            
            if (this.newGameButton) {
                this.newGameButton.classList.remove('hidden');
                this.newGameButton.classList.add('visible');
            }
        } catch (error) {
            console.error('Error showing game over UI:', error);
        }
    }

    /**
     * Hide game over UI elements
     */
    hideGameOverUI() {
        try {
            if (this.gameContainer) {
                this.gameContainer.classList.remove('hidden');
            }
            
            if (this.gameOverScreen) {
                this.gameOverScreen.classList.add('hidden');
                this.gameOverScreen.classList.remove('visible');
            }
            
            if (this.newGameButton) {
                this.newGameButton.classList.add('hidden');
                this.newGameButton.classList.remove('visible');
            }
        } catch (error) {
            console.error('Error hiding game over UI:', error);
        }
    }

    /**
     * Start a new game
     */
    startNewGame() {
        try {
            if (this.gameState && typeof this.gameState.reset === 'function') {
                this.gameState.reset();
            }
            
            // Hide game over UI
            this.hideGameOverUI();
            
            // Initialize UI for new game
            this.updateUI();
            
            console.log('New game started');
            
        } catch (error) {
            console.error('Error starting new game:', error);
        }
    }

    /**
     * Destroy the controller and clean up event listeners
     */
    destroy() {
        try {
            if (this.gameState) {
                this.gameState.removeEventListener('stateChanged', this.handleStateChange.bind(this));
                this.gameState.removeEventListener('phaseChanged', this.handlePhaseChange.bind(this));
                this.gameState.removeEventListener('roundChanged', this.handleRoundChange.bind(this));
                this.gameState.removeEventListener('gameOver', this.handleGameOver.bind(this));
            }
            
            if (this.newGameButton) {
                this.newGameButton.removeEventListener('click', this.startNewGame.bind(this));
            }
            
        } catch (error) {
            console.error('Error destroying GameController:', error);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameController;
} else if (typeof window !== 'undefined') {
    window.GameController = GameController;
}