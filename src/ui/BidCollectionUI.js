/**
 * BidCollectionUI - User interface for bid collection
 */
class BidCollectionUI {
  constructor(bidCollector) {
    this.bidCollector = bidCollector;
    this.container = null;
  }

  /**
   * Render the bid collection interface
   * @param {HTMLElement} container - Container element
   */
  render(container) {
    this.container = container;
    const roundInfo = this.bidCollector.getRoundInfo();
    
    container.innerHTML = `
      <div class="bid-collection">
        <div class="round-info">
          <h2>Round ${roundInfo.roundNumber}</h2>
          <p>Number of hands: ${roundInfo.handCount}</p>
          <p>Bids collected: ${roundInfo.bidsCollected}/${roundInfo.totalPlayers}</p>
        </div>
        
        <div class="players-section">
          ${this.renderPlayerBids()}
        </div>
        
        <div class="pending-players">
          ${this.renderPendingPlayers()}
        </div>
        
        <div class="actions">
          <button id="proceed-btn" ${this.bidCollector.allBidsCollected() ? '' : 'disabled'}>
            Proceed to Next Phase
          </button>
        </div>
      </div>
    `;
    
    this.attachEventListeners();
  }

  /**
   * Render individual player bid inputs/displays
   */
  renderPlayerBids() {
    const players = this.bidCollector.game.getPlayers();
    const maxBid = this.bidCollector.maxBid;
    
    return players.map(player => {
      const currentBid = this.bidCollector.getPlayerBid(player.id);
      const hasBid = currentBid !== null;
      
      return `
        <div class="player-bid ${hasBid ? 'completed' : 'pending'}">
          <label>${player.name}:</label>
          ${hasBid ? 
            `<span class="bid-display">${currentBid}</span>` :
            `<input type="number" 
                    id="bid-${player.id}" 
                    min="0" 
                    max="${maxBid}" 
                    placeholder="Enter bid (0-${maxBid})">
             <button onclick="window.bidUI.submitBid('${player.id}')">Submit</button>`
          }
        </div>
      `;
    }).join('');
  }

  /**
   * Render list of players who still need to bid
   */
  renderPendingPlayers() {
    const pending = this.bidCollector.getPlayersNeedingBids();
    
    if (pending.length === 0) {
      return '<div class="all-complete">✓ All bids collected!</div>';
    }
    
    const playerNames = pending.map(playerId => {
      const player = this.bidCollector.game.getPlayers().find(p => p.id === playerId);
      return player ? player.name : playerId;
    });
    
    return `
      <div class="pending-list">
        <h3>Waiting for bids from:</h3>
        <ul>
          ${playerNames.map(name => `<li>${name}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  /**
   * Submit bid for a player
   * @param {string} playerId - Player identifier
   */
  submitBid(playerId) {
    const input = document.getElementById(`bid-${playerId}`);
    const bid = parseInt(input.value);
    
    if (isNaN(bid)) {
      this.showError('Please enter a valid number');
      return;
    }
    
    const result = this.bidCollector.collectBid(playerId, bid);
    
    if (result.success) {
      this.render(this.container); // Re-render to show updated state
      this.showSuccess(result.message);
    } else {
      this.showError(result.error);
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Remove existing error messages
    const existing = this.container.querySelector('.error-message');
    if (existing) existing.remove();
    
    this.container.appendChild(errorDiv);
    
    // Auto-remove after 3 seconds
    setTimeout(() => errorDiv.remove(), 3000);
  }

  /**
   * Show success message
   * @param {string} message - Success message
   */
  showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    // Remove existing success messages
    const existing = this.container.querySelector('.success-message');
    if (existing) existing.remove();
    
    this.container.appendChild(successDiv);
    
    // Auto-remove after 2 seconds
    setTimeout(() => successDiv.remove(), 2000);
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const proceedBtn = document.getElementById('proceed-btn');
    if (proceedBtn) {
      proceedBtn.addEventListener('click', () => {
        if (this.bidCollector.allBidsCollected()) {
          this.onProceed();
        }
      });
    }
    
    // Make submitBid available globally for onclick handlers
    window.bidUI = this;
  }

  /**
   * Handle proceed to next phase
   */
  onProceed() {
    // Emit event or call callback to proceed to next phase
    const event = new CustomEvent('bidsCompleted', {
      detail: { bids: this.bidCollector.getBids() }
    });
    document.dispatchEvent(event);
  }
}

module.exports = BidCollectionUI;