/**
 * Bidding Phase Management Module
 * Handles bid collection, validation, and UI for each round
 */

// Global gameState reference (assumed to be available)
let gameState = window.gameState || {};

/**
 * Display the bidding phase UI for the current round
 * @param {number} roundNumber - Current round number (1-based)
 * @param {Array} players - Array of player objects with name property
 */
function showBiddingPhase(roundNumber, players) {
    // Initialize currentBids array if it doesn't exist
    if (!gameState.currentBids) {
        gameState.currentBids = [];
    }
    
    // Clear any existing bids for this round
    gameState.currentBids = new Array(players.length).fill(null);
    
    const container = document.getElementById('game-container') || document.body;
    
    // Create bidding phase container
    const biddingContainer = document.createElement('div');
    biddingContainer.id = 'bidding-container';
    biddingContainer.className = 'bidding-phase';
    
    // Round information header
    const headerHTML = `
        <div class="round-info">
            <h2>Round ${roundNumber}</h2>
            <p>Total hands this round: <strong>${roundNumber}</strong></p>
            <p>Each player gets ${roundNumber} card${roundNumber !== 1 ? 's' : ''}. Bid how many tricks you think you'll win.</p>
        </div>
    `;
    
    // Create bid input fields for each player
    let bidInputsHTML = '<div class="bid-inputs">';
    players.forEach((player, index) => {
        bidInputsHTML += `
            <div class="player-bid" data-player-index="${index}">
                <label for="bid-${index}">${player.name}:</label>
                <input 
                    type="number" 
                    id="bid-${index}" 
                    class="bid-input" 
                    min="0" 
                    max="${roundNumber}" 
                    data-player-index="${index}"
                    placeholder="0-${roundNumber}"
                >
                <span class="bid-status" id="status-${index}">⏳ Waiting</span>
                <div class="bid-error" id="error-${index}"></div>
            </div>
        `;
    });
    bidInputsHTML += '</div>';
    
    // Continue button (initially disabled)
    const controlsHTML = `
        <div class="bidding-controls">
            <button id="continue-button" class="btn-primary" disabled>
                Continue to Playing Phase
            </button>
            <div class="bidding-summary">
                <span id="bids-remaining">${players.length} bids remaining</span>
            </div>
        </div>
    `;
    
    biddingContainer.innerHTML = headerHTML + bidInputsHTML + controlsHTML;
    
    // Clear container and add bidding UI
    container.innerHTML = '';
    container.appendChild(biddingContainer);
    
    // Add event listeners to bid inputs
    players.forEach((player, index) => {
        const input = document.getElementById(`bid-${index}`);
        input.addEventListener('input', () => handleBidInput(index, roundNumber));
        input.addEventListener('blur', () => handleBidInput(index, roundNumber));
    });
    
    updateBiddingStatus();
}

/**
 * Handle bid input changes and validation
 * @param {number} playerIndex - Index of the player
 * @param {number} roundNumber - Current round number
 */
function handleBidInput(playerIndex, roundNumber) {
    const input = document.getElementById(`bid-${playerIndex}`);
    const bidValue = input.value.trim();
    
    // Clear previous error
    const errorElement = document.getElementById(`error-${playerIndex}`);
    errorElement.textContent = '';
    errorElement.style.display = 'none';
    
    if (bidValue === '') {
        // Empty input - reset to waiting status
        gameState.currentBids[playerIndex] = null;
        updatePlayerStatus(playerIndex, 'waiting');
    } else {
        const bid = parseInt(bidValue);
        const validation = validateBid(bid, roundNumber);
        
        if (validation.isValid) {
            // Valid bid - store it
            gameState.currentBids[playerIndex] = bid;
            updatePlayerStatus(playerIndex, 'valid');
        } else {
            // Invalid bid - show error
            gameState.currentBids[playerIndex] = null;
            updatePlayerStatus(playerIndex, 'error');
            errorElement.textContent = validation.error;
            errorElement.style.display = 'block';
        }
    }
    
    updateBiddingStatus();
}

/**
 * Validate a single bid
 * @param {number} bid - The bid value to validate
 * @param {number} roundNumber - Current round number (max allowed bid)
 * @returns {Object} - {isValid: boolean, error: string}
 */
function validateBid(bid, roundNumber) {
    // Check if bid is a valid number
    if (isNaN(bid) || bid === null || bid === undefined) {
        return {
            isValid: false,
            error: 'Bid must be a number'
        };
    }
    
    // Check if bid is non-negative
    if (bid < 0) {
        return {
            isValid: false,
            error: 'Bid cannot be negative'
        };
    }
    
    // Check if bid exceeds round number (hand count)
    if (bid > roundNumber) {
        return {
            isValid: false,
            error: `Bid cannot exceed ${roundNumber} (number of cards in hand)`
        };
    }
    
    // Check if bid is an integer
    if (!Number.isInteger(bid)) {
        return {
            isValid: false,
            error: 'Bid must be a whole number'
        };
    }
    
    return {
        isValid: true,
        error: ''
    };
}

/**
 * Update the status indicator for a specific player
 * @param {number} playerIndex - Index of the player
 * @param {string} status - 'waiting', 'valid', or 'error'
 */
function updatePlayerStatus(playerIndex, status) {
    const statusElement = document.getElementById(`status-${playerIndex}`);
    if (!statusElement) return;
    
    switch (status) {
        case 'waiting':
            statusElement.textContent = '⏳ Waiting';
            statusElement.className = 'bid-status waiting';
            break;
        case 'valid':
            statusElement.textContent = '✅ Valid';
            statusElement.className = 'bid-status valid';
            break;
        case 'error':
            statusElement.textContent = '❌ Invalid';
            statusElement.className = 'bid-status error';
            break;
    }
}

/**
 * Update the overall bidding status and continue button state
 */
function updateBiddingStatus() {
    const continueButton = document.getElementById('continue-button');
    const remainingElement = document.getElementById('bids-remaining');
    
    if (!gameState.currentBids || !continueButton || !remainingElement) {
        return;
    }
    
    // Count valid bids and remaining bids
    const validBids = gameState.currentBids.filter(bid => bid !== null && bid !== undefined);
    const totalPlayers = gameState.currentBids.length;
    const remaining = totalPlayers - validBids.length;
    
    // Update remaining count
    if (remaining === 0) {
        remainingElement.textContent = 'All bids collected!';
        remainingElement.className = 'all-complete';
    } else {
        remainingElement.textContent = `${remaining} bid${remaining !== 1 ? 's' : ''} remaining`;
        remainingElement.className = 'pending';
    }
    
    // Enable/disable continue button
    if (remaining === 0) {
        continueButton.disabled = false;
        continueButton.textContent = 'Continue to Playing Phase';
    } else {
        continueButton.disabled = true;
        continueButton.textContent = `Waiting for ${remaining} more bid${remaining !== 1 ? 's' : ''}...`;
    }
}

/**
 * Collect all bids and return them if all are valid
 * @returns {Array|null} - Array of bids if all collected, null otherwise
 */
function collectAllBids() {
    if (!gameState.currentBids) {
        return null;
    }
    
    // Check if all bids are collected
    const allBidsCollected = gameState.currentBids.every(bid => bid !== null && bid !== undefined);
    
    if (allBidsCollected) {
        return [...gameState.currentBids]; // Return a copy
    }
    
    return null;
}

/**
 * Get the current bidding progress
 * @returns {Object} - {totalPlayers: number, collectedBids: number, allCollected: boolean}
 */
function getBiddingProgress() {
    if (!gameState.currentBids) {
        return { totalPlayers: 0, collectedBids: 0, allCollected: false };
    }
    
    const totalPlayers = gameState.currentBids.length;
    const collectedBids = gameState.currentBids.filter(bid => bid !== null && bid !== undefined).length;
    const allCollected = collectedBids === totalPlayers && totalPlayers > 0;
    
    return {
        totalPlayers,
        collectedBids,
        allCollected
    };
}

// Export functions for use in main game flow
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        showBiddingPhase,
        validateBid,
        collectAllBids,
        getBiddingProgress
    };
} else {
    // Browser environment - attach to window
    window.biddingModule = {
        showBiddingPhase,
        validateBid,
        collectAllBids,
        getBiddingProgress
    };
}

// CSS styles (to be added to a stylesheet)
const biddingStyles = `
.bidding-phase {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.round-info {
    text-align: center;
    margin-bottom: 30px;
    padding: 20px;
    background: #f5f5f5;
    border-radius: 8px;
}

.bid-inputs {
    display: grid;
    gap: 20px;
    margin-bottom: 30px;
}

.player-bid {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: white;
}

.player-bid label {
    min-width: 120px;
    font-weight: bold;
}

.bid-input {
    width: 80px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    text-align: center;
    font-size: 16px;
}

.bid-input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.bid-status {
    min-width: 80px;
    font-size: 14px;
}

.bid-status.waiting { color: #666; }
.bid-status.valid { color: #28a745; }
.bid-status.error { color: #dc3545; }

.bid-error {
    color: #dc3545;
    font-size: 12px;
    display: none;
}

.bidding-controls {
    text-align: center;
    padding: 20px;
}

.btn-primary {
    background: #007bff;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    margin-bottom: 10px;
}

.btn-primary:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

.btn-primary:hover:not(:disabled) {
    background: #0056b3;
}

.bidding-summary {
    font-size: 14px;
    color: #666;
}

.all-complete {
    color: #28a745;
    font-weight: bold;
}

.pending {
    color: #ffc107;
}
`;