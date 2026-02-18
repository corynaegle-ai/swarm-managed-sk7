/**
 * Score Entry Module for Skull King Game
 * Handles dynamic form generation and validation for player score entry
 */

class ScoreEntry {
    constructor() {
        this.container = null;
        this.playersData = [];
        this.currentRound = 1;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.bindEvents());
        } else {
            this.bindEvents();
        }
    }

    bindEvents() {
        this.container = document.getElementById('scoreEntryContainer');
        const calculateBtn = document.getElementById('calculateScores');
        
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => this.calculateScores());
        }
    }

    /**
     * Show the score entry form for given players and round
     * @param {Array} players - Array of player objects with name property
     * @param {number} roundNumber - Current round number (1-10)
     */
    showScoreEntry(players, roundNumber) {
        if (!players || !Array.isArray(players) || players.length === 0) {
            console.error('Invalid players array provided');
            return;
        }

        if (!roundNumber || roundNumber < 1 || roundNumber > 10) {
            console.error('Invalid round number. Must be between 1 and 10');
            return;
        }

        this.playersData = players;
        this.currentRound = roundNumber;

        // Update round number display
        const roundDisplay = document.getElementById('roundNumber');
        if (roundDisplay) {
            roundDisplay.textContent = roundNumber;
        }

        // Generate player input fields
        this.generatePlayerInputs();

        // Show the container
        if (this.container) {
            this.container.style.display = 'block';
        }
    }

    /**
     * Hide the score entry form
     */
    hideScoreEntry() {
        if (this.container) {
            this.container.style.display = 'none';
        }
        this.clearInputs();
    }

    /**
     * Generate input fields dynamically for each player
     */
    generatePlayerInputs() {
        const playerEntriesContainer = document.getElementById('playerEntries');
        if (!playerEntriesContainer) {
            console.error('Player entries container not found');
            return;
        }

        // Clear existing entries
        playerEntriesContainer.innerHTML = '';

        // Create input fields for each player
        this.playersData.forEach((player, index) => {
            const playerEntry = this.createPlayerEntry(player, index);
            playerEntriesContainer.appendChild(playerEntry);
        });
    }

    /**
     * Create input form for a single player
     * @param {Object} player - Player object
     * @param {number} index - Player index
     * @returns {HTMLElement} Player entry form element
     */
    createPlayerEntry(player, index) {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-entry';
        playerDiv.setAttribute('data-player-index', index);

        const playerName = document.createElement('div');
        playerName.className = 'player-name';
        playerName.textContent = player.name || `Player ${index + 1}`;

        // Tricks taken input
        const tricksGroup = document.createElement('div');
        tricksGroup.className = 'input-group';

        const tricksLabel = document.createElement('label');
        tricksLabel.textContent = 'Tricks Taken:';
        tricksLabel.setAttribute('for', `tricks-${index}`);

        const tricksInput = document.createElement('input');
        tricksInput.type = 'number';
        tricksInput.id = `tricks-${index}`;
        tricksInput.name = `tricks-${index}`;
        tricksInput.min = '0';
        tricksInput.max = this.currentRound.toString();
        tricksInput.value = '0';
        tricksInput.required = true;

        const tricksError = document.createElement('div');
        tricksError.className = 'error';
        tricksError.id = `tricks-error-${index}`;

        // Bonus points input
        const bonusGroup = document.createElement('div');
        bonusGroup.className = 'input-group';

        const bonusLabel = document.createElement('label');
        bonusLabel.textContent = 'Bonus Points:';
        bonusLabel.setAttribute('for', `bonus-${index}`);

        const bonusInput = document.createElement('input');
        bonusInput.type = 'number';
        bonusInput.id = `bonus-${index}`;
        bonusInput.name = `bonus-${index}`;
        bonusInput.value = '0';
        bonusInput.step = '1';

        const bonusError = document.createElement('div');
        bonusError.className = 'error';
        bonusError.id = `bonus-error-${index}`;

        // Add validation event listeners
        tricksInput.addEventListener('input', () => this.validateTricksInput(tricksInput, tricksError));
        tricksInput.addEventListener('blur', () => this.validateTricksInput(tricksInput, tricksError));
        bonusInput.addEventListener('input', () => this.validateBonusInput(bonusInput, bonusError));

        // Assemble the elements
        tricksGroup.appendChild(tricksLabel);
        tricksGroup.appendChild(tricksInput);
        tricksGroup.appendChild(tricksError);

        bonusGroup.appendChild(bonusLabel);
        bonusGroup.appendChild(bonusInput);
        bonusGroup.appendChild(bonusError);

        playerDiv.appendChild(playerName);
        playerDiv.appendChild(tricksGroup);
        playerDiv.appendChild(bonusGroup);

        return playerDiv;
    }

    /**
     * Validate tricks taken input
     * @param {HTMLInputElement} input - The tricks input element
     * @param {HTMLElement} errorElement - Error display element
     * @returns {boolean} Whether input is valid
     */
    validateTricksInput(input, errorElement) {
        const value = parseInt(input.value);
        const min = 0;
        const max = this.currentRound;

        // Clear previous error
        errorElement.textContent = '';
        input.style.borderColor = '#ccc';

        if (isNaN(value)) {
            errorElement.textContent = 'Please enter a valid number';
            input.style.borderColor = 'red';
            return false;
        }

        if (value < min) {
            errorElement.textContent = `Minimum tricks: ${min}`;
            input.style.borderColor = 'red';
            return false;
        }

        if (value > max) {
            errorElement.textContent = `Maximum tricks for round ${this.currentRound}: ${max}`;
            input.style.borderColor = 'red';
            return false;
        }

        return true;
    }

    /**
     * Validate bonus points input
     * @param {HTMLInputElement} input - The bonus input element
     * @param {HTMLElement} errorElement - Error display element
     * @returns {boolean} Whether input is valid
     */
    validateBonusInput(input, errorElement) {
        const value = parseFloat(input.value);

        // Clear previous error
        errorElement.textContent = '';
        input.style.borderColor = '#ccc';

        if (input.value === '') {
            input.value = '0';
            return true;
        }

        if (isNaN(value)) {
            errorElement.textContent = 'Please enter a valid number';
            input.style.borderColor = 'red';
            return false;
        }

        return true;
    }

    /**
     * Validate all inputs in the form
     * @returns {boolean} Whether all inputs are valid
     */
    validateAllInputs() {
        let allValid = true;

        this.playersData.forEach((player, index) => {
            const tricksInput = document.getElementById(`tricks-${index}`);
            const bonusInput = document.getElementById(`bonus-${index}`);
            const tricksError = document.getElementById(`tricks-error-${index}`);
            const bonusError = document.getElementById(`bonus-error-${index}`);

            if (tricksInput && tricksError) {
                if (!this.validateTricksInput(tricksInput, tricksError)) {
                    allValid = false;
                }
            }

            if (bonusInput && bonusError) {
                if (!this.validateBonusInput(bonusInput, bonusError)) {
                    allValid = false;
                }
            }
        });

        return allValid;
    }

    /**
     * Calculate scores and trigger score calculation event
     */
    calculateScores() {
        if (!this.validateAllInputs()) {
            console.warn('Please fix validation errors before calculating scores');
            return;
        }

        const scoresData = [];

        // Collect all player score data
        this.playersData.forEach((player, index) => {
            const tricksInput = document.getElementById(`tricks-${index}`);
            const bonusInput = document.getElementById(`bonus-${index}`);

            if (tricksInput && bonusInput) {
                const playerScore = {
                    playerIndex: index,
                    playerName: player.name || `Player ${index + 1}`,
                    tricksTaken: parseInt(tricksInput.value) || 0,
                    bonusPoints: parseInt(bonusInput.value) || 0,
                    roundNumber: this.currentRound
                };
                scoresData.push(playerScore);
            }
        });

        // Dispatch custom event with score data
        const scoreCalculatedEvent = new CustomEvent('scoresCalculated', {
            detail: {
                roundNumber: this.currentRound,
                scores: scoresData
            }
        });

        document.dispatchEvent(scoreCalculatedEvent);

        console.log('Scores calculated for round', this.currentRound, scoresData);
    }

    /**
     * Clear all input fields
     */
    clearInputs() {
        this.playersData.forEach((player, index) => {
            const tricksInput = document.getElementById(`tricks-${index}`);
            const bonusInput = document.getElementById(`bonus-${index}`);
            const tricksError = document.getElementById(`tricks-error-${index}`);
            const bonusError = document.getElementById(`bonus-error-${index}`);

            if (tricksInput) {
                tricksInput.value = '0';
                tricksInput.style.borderColor = '#ccc';
            }
            if (bonusInput) {
                bonusInput.value = '0';
                bonusInput.style.borderColor = '#ccc';
            }
            if (tricksError) tricksError.textContent = '';
            if (bonusError) bonusError.textContent = '';
        });
    }
}

// Create global instance
const scoreEntryInstance = new ScoreEntry();

// Export functions for external use
function showScoreEntry(players, roundNumber) {
    scoreEntryInstance.showScoreEntry(players, roundNumber);
}

function hideScoreEntry() {
    scoreEntryInstance.hideScoreEntry();
}

// Export for module systems if available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showScoreEntry,
        hideScoreEntry,
        ScoreEntry
    };
}

// Export for browser global access
if (typeof window !== 'undefined') {
    window.showScoreEntry = showScoreEntry;
    window.hideScoreEntry = hideScoreEntry;
    window.ScoreEntry = ScoreEntry;
}