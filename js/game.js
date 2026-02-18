// Import required modules
import { initializeScoreEntry, validateScoreEntry, getScoreEntryData } from './score-entry.js';
import { calculateRoundScores } from './scoring.js';

// Game state management
class GameState {
    constructor() {
        this.currentPhase = 'setup'; // 'setup', 'bidding', 'playing', 'scoring', 'results'
        this.players = [];
        this.currentRound = 1;
        this.maxRounds = 10;
        this.roundData = {
            bids: {},
            tricks: {},
            scores: {}
        };
        this.totalScores = {};
        this.gameHistory = [];
    }

    addPlayer(name) {
        this.players.push(name);
        this.totalScores[name] = 0;
    }

    setCurrentPhase(phase) {
        this.currentPhase = phase;
        this.updateUI();
    }

    updateUI() {
        const phaseIndicator = document.getElementById('current-phase');
        if (phaseIndicator) {
            phaseIndicator.textContent = `Phase: ${this.currentPhase.charAt(0).toUpperCase() + this.currentPhase.slice(1)}`;
        }

        // Show/hide relevant sections
        this.toggleSectionVisibility();
    }

    toggleSectionVisibility() {
        const sections = {
            'bidding-section': this.currentPhase === 'bidding',
            'score-entry-section': this.currentPhase === 'scoring',
            'results-section': this.currentPhase === 'results'
        };

        Object.entries(sections).forEach(([sectionId, shouldShow]) => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = shouldShow ? 'block' : 'none';
            }
        });
    }
}

// Initialize game state
const gameState = new GameState();

// Score entry handler function
function handleScoreEntry() {
    try {
        // Validate score entry form
        const isValid = validateScoreEntry();
        if (!isValid) {
            showError('Please fill in all required score entry fields correctly.');
            return;
        }

        // Collect data from score entry form
        const scoreData = getScoreEntryData();
        
        // Update round data with collected information
        gameState.roundData.bids = scoreData.bids;
        gameState.roundData.tricks = scoreData.tricks;

        // Calculate round scores using scoring.js
        const roundScores = calculateRoundScores(
            scoreData.bids,
            scoreData.tricks,
            gameState.players
        );

        // Update game state with calculated scores
        gameState.roundData.scores = roundScores;
        
        // Update total scores
        gameState.players.forEach(player => {
            gameState.totalScores[player] += roundScores[player] || 0;
        });

        // Store round in game history
        gameState.gameHistory.push({
            round: gameState.currentRound,
            bids: { ...scoreData.bids },
            tricks: { ...scoreData.tricks },
            scores: { ...roundScores },
            timestamp: new Date().toISOString()
        });

        // Display round results
        displayRoundResults(roundScores);

        // Transition to results phase
        gameState.setCurrentPhase('results');

        // Show success message
        showSuccess(`Round ${gameState.currentRound} scores calculated successfully!`);

    } catch (error) {
        console.error('Error handling score entry:', error);
        showError('An error occurred while processing scores. Please try again.');
    }
}

// Display round results function
function displayRoundResults(roundScores) {
    const resultsContainer = document.getElementById('round-results');
    if (!resultsContainer) {
        console.error('Results container not found');
        return;
    }

    // Clear previous results
    resultsContainer.innerHTML = '';

    // Create results header
    const header = document.createElement('div');
    header.className = 'results-header';
    header.innerHTML = `
        <h2>Round ${gameState.currentRound} Results</h2>
        <div class="round-summary">
            <p>Players: ${gameState.players.length} | Round: ${gameState.currentRound}/${gameState.maxRounds}</p>
        </div>
    `;
    resultsContainer.appendChild(header);

    // Create results table
    const table = document.createElement('table');
    table.className = 'results-table';
    
    // Table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Player</th>
            <th>Bid</th>
            <th>Tricks Taken</th>
            <th>Round Score</th>
            <th>Total Score</th>
            <th>Status</th>
        </tr>
    `;
    table.appendChild(thead);

    // Table body with player results
    const tbody = document.createElement('tbody');
    gameState.players.forEach(player => {
        const bid = gameState.roundData.bids[player] || 0;
        const tricks = gameState.roundData.tricks[player] || 0;
        const roundScore = roundScores[player] || 0;
        const totalScore = gameState.totalScores[player] || 0;
        
        // Determine status (made bid or not)
        const status = bid === tricks ? 'Made Bid' : 'Missed Bid';
        const statusClass = bid === tricks ? 'status-success' : 'status-fail';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="player-name">${player}</td>
            <td class="bid-value">${bid}</td>
            <td class="tricks-value">${tricks}</td>
            <td class="round-score ${roundScore > 0 ? 'positive-score' : 'negative-score'}">${roundScore}</td>
            <td class="total-score">${totalScore}</td>
            <td class="${statusClass}">${status}</td>
        `;
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    resultsContainer.appendChild(table);

    // Add action buttons
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'results-actions';
    
    if (gameState.currentRound < gameState.maxRounds) {
        actionsDiv.innerHTML = `
            <button id="next-round-btn" class="btn btn-primary">Next Round</button>
            <button id="view-scoreboard-btn" class="btn btn-secondary">View Scoreboard</button>
        `;
    } else {
        actionsDiv.innerHTML = `
            <button id="final-results-btn" class="btn btn-success">View Final Results</button>
            <button id="new-game-btn" class="btn btn-primary">New Game</button>
        `;
    }
    
    resultsContainer.appendChild(actionsDiv);
    
    // Attach event listeners to action buttons
    attachResultsEventListeners();
}

// Attach event listeners for results actions
function attachResultsEventListeners() {
    const nextRoundBtn = document.getElementById('next-round-btn');
    const viewScoreboardBtn = document.getElementById('view-scoreboard-btn');
    const finalResultsBtn = document.getElementById('final-results-btn');
    const newGameBtn = document.getElementById('new-game-btn');

    if (nextRoundBtn) {
        nextRoundBtn.addEventListener('click', () => {
            startNextRound();
        });
    }

    if (viewScoreboardBtn) {
        viewScoreboardBtn.addEventListener('click', () => {
            showScoreboard();
        });
    }

    if (finalResultsBtn) {
        finalResultsBtn.addEventListener('click', () => {
            showFinalResults();
        });
    }

    if (newGameBtn) {
        newGameBtn.addEventListener('click', () => {
            startNewGame();
        });
    }
}

// Game flow functions
function startNextRound() {
    gameState.currentRound++;
    gameState.roundData = { bids: {}, tricks: {}, scores: {} };
    gameState.setCurrentPhase('bidding');
    
    // Clear previous round data from UI
    clearScoreEntryForm();
    showSuccess(`Starting Round ${gameState.currentRound}`);
}

function showScoreboard() {
    // Implementation for showing current scoreboard
    const modal = createScoreboardModal();
    document.body.appendChild(modal);
}

function showFinalResults() {
    gameState.setCurrentPhase('final');
    displayFinalGameResults();
}

function startNewGame() {
    if (confirm('Are you sure you want to start a new game? All progress will be lost.')) {
        location.reload();
    }
}

// Utility functions
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 3000);
    }
}

function clearScoreEntryForm() {
    const scoreEntrySection = document.getElementById('score-entry-section');
    if (scoreEntrySection) {
        const inputs = scoreEntrySection.querySelectorAll('input');
        inputs.forEach(input => input.value = '');
    }
}

function createScoreboardModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Current Scoreboard</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="scoreboard-content">
                    ${generateScoreboardHTML()}
                </div>
            </div>
        </div>
    `;
    
    // Close modal event
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    return modal;
}

function generateScoreboardHTML() {
    const sortedPlayers = gameState.players.sort((a, b) => 
        gameState.totalScores[b] - gameState.totalScores[a]
    );
    
    return `
        <table class="scoreboard-table">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Total Score</th>
                </tr>
            </thead>
            <tbody>
                ${sortedPlayers.map((player, index) => `
                    <tr class="${index === 0 ? 'leader-row' : ''}">
                        <td>${index + 1}</td>
                        <td>${player}</td>
                        <td>${gameState.totalScores[player]}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function displayFinalGameResults() {
    const resultsContainer = document.getElementById('round-results');
    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <div class="final-results">
                <h2>🎉 Game Complete! 🎉</h2>
                <div class="final-scoreboard">
                    ${generateFinalResultsHTML()}
                </div>
                <div class="game-stats">
                    <h3>Game Statistics</h3>
                    <p>Total Rounds: ${gameState.maxRounds}</p>
                    <p>Players: ${gameState.players.length}</p>
                    <p>Game Duration: ${calculateGameDuration()}</p>
                </div>
                <div class="final-actions">
                    <button id="new-game-final-btn" class="btn btn-primary">Start New Game</button>
                    <button id="export-results-btn" class="btn btn-secondary">Export Results</button>
                </div>
            </div>
        `;
        
        // Attach final result event listeners
        document.getElementById('new-game-final-btn')?.addEventListener('click', startNewGame);
        document.getElementById('export-results-btn')?.addEventListener('click', exportGameResults);
    }
}

function generateFinalResultsHTML() {
    const sortedPlayers = gameState.players.sort((a, b) => 
        gameState.totalScores[b] - gameState.totalScores[a]
    );
    
    return `
        <div class="winner-announcement">
            <h3>🏆 Winner: ${sortedPlayers[0]} 🏆</h3>
            <p>Final Score: ${gameState.totalScores[sortedPlayers[0]]}</p>
        </div>
        ${generateScoreboardHTML()}
    `;
}

function calculateGameDuration() {
    if (gameState.gameHistory.length === 0) return 'N/A';
    
    const firstRound = new Date(gameState.gameHistory[0].timestamp);
    const lastRound = new Date(gameState.gameHistory[gameState.gameHistory.length - 1].timestamp);
    const durationMs = lastRound - firstRound;
    const minutes = Math.floor(durationMs / (1000 * 60));
    
    return `${minutes} minutes`;
}

function exportGameResults() {
    const gameData = {
        players: gameState.players,
        totalScores: gameState.totalScores,
        gameHistory: gameState.gameHistory,
        timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(gameData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `skull-king-results-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showSuccess('Game results exported successfully!');
}

// Initialize game on load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize score entry functionality
    initializeScoreEntry();
    
    // Set up main score entry handler
    const submitScoreBtn = document.getElementById('submit-scores-btn');
    if (submitScoreBtn) {
        submitScoreBtn.addEventListener('click', handleScoreEntry);
    }
    
    // Initialize game state
    gameState.setCurrentPhase('setup');
    console.log('Game initialized successfully');
});

// Export functions for use in other modules
export { 
    gameState, 
    handleScoreEntry, 
    displayRoundResults, 
    showError, 
    showSuccess 
};