// Main game application
import { initializeScoreboard, updateScoreboard, displayFinalResults, resetScoreboard } from './scoreboard.js';

// Game state management
class GameState {
    constructor() {
        this.players = [];
        this.currentRound = 1;
        this.maxRounds = 10;
        this.roundScores = {};
        this.isGameActive = false;
        this.gameCompleted = false;
    }

    addPlayer(name) {
        if (!name || name.trim() === '') {
            throw new Error('Player name cannot be empty');
        }
        
        const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const player = {
            id: playerId,
            name: name.trim(),
            totalScore: 0,
            roundScores: Array(this.maxRounds).fill(0)
        };
        
        this.players.push(player);
        this.roundScores[playerId] = Array(this.maxRounds).fill(0);
        return player;
    }

    updateRoundScore(playerId, round, score) {
        if (round < 1 || round > this.maxRounds) {
            throw new Error(`Invalid round number: ${round}`);
        }
        
        const player = this.players.find(p => p.id === playerId);
        if (!player) {
            throw new Error(`Player not found: ${playerId}`);
        }
        
        const numericScore = parseInt(score, 10);
        if (isNaN(numericScore)) {
            throw new Error('Score must be a valid number');
        }
        
        player.roundScores[round - 1] = numericScore;
        this.roundScores[playerId][round - 1] = numericScore;
        
        // Recalculate total score
        player.totalScore = player.roundScores.reduce((sum, score) => sum + score, 0);
    }

    isRoundComplete(round) {
        if (this.players.length === 0) return false;
        
        return this.players.every(player => 
            player.roundScores[round - 1] !== 0 || 
            (player.roundScores[round - 1] === 0 && this.hasScoreEntered(player.id, round))
        );
    }

    hasScoreEntered(playerId, round) {
        // Check if score was explicitly entered (even if 0)
        const scoreInput = document.querySelector(`input[data-player="${playerId}"][data-round="${round}"]`);
        return scoreInput && scoreInput.hasAttribute('data-entered');
    }

    canAdvanceRound() {
        return this.currentRound < this.maxRounds && this.isRoundComplete(this.currentRound);
    }

    advanceRound() {
        if (this.canAdvanceRound()) {
            this.currentRound++;
            return true;
        }
        return false;
    }

    isGameComplete() {
        return this.currentRound >= this.maxRounds && this.isRoundComplete(this.maxRounds);
    }

    getWinner() {
        if (this.players.length === 0) return null;
        
        return this.players.reduce((winner, player) => 
            player.totalScore > winner.totalScore ? player : winner
        );
    }

    reset() {
        this.currentRound = 1;
        this.gameCompleted = false;
        this.isGameActive = false;
        this.players.forEach(player => {
            player.totalScore = 0;
            player.roundScores = Array(this.maxRounds).fill(0);
        });
        this.roundScores = {};
        this.players.forEach(player => {
            this.roundScores[player.id] = Array(this.maxRounds).fill(0);
        });
    }
}

// Global game state
const gameState = new GameState();

// DOM elements
const playerSetup = document.getElementById('player-setup');
const gameArea = document.getElementById('game-area');
const addPlayerBtn = document.getElementById('add-player');
const startGameBtn = document.getElementById('start-game');
const newGameBtn = document.getElementById('new-game');
const playerNameInput = document.getElementById('player-name');
const playersList = document.getElementById('players-list');
const currentRoundDisplay = document.getElementById('current-round');
const nextRoundBtn = document.getElementById('next-round');
const finishGameBtn = document.getElementById('finish-game');

// Event listeners
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    try {
        setupEventListeners();
        showPlayerSetup();
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError('Failed to initialize application');
    }
}

function setupEventListeners() {
    // Player management
    addPlayerBtn?.addEventListener('click', handleAddPlayer);
    startGameBtn?.addEventListener('click', handleStartGame);
    newGameBtn?.addEventListener('click', handleNewGame);
    
    // Round management
    nextRoundBtn?.addEventListener('click', handleNextRound);
    finishGameBtn?.addEventListener('click', handleFinishGame);
    
    // Player name input
    playerNameInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAddPlayer();
        }
    });
    
    // Score input delegation
    document.addEventListener('input', handleScoreInput);
    document.addEventListener('blur', handleScoreBlur, true);
}

function handleAddPlayer() {
    try {
        const name = playerNameInput?.value?.trim();
        if (!name) {
            showError('Please enter a player name');
            return;
        }
        
        // Check for duplicate names
        if (gameState.players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            showError('Player name already exists');
            return;
        }
        
        const player = gameState.addPlayer(name);
        updatePlayersDisplay();
        playerNameInput.value = '';
        playerNameInput.focus();
        
        console.log('Added player:', player.name);
    } catch (error) {
        console.error('Error adding player:', error);
        showError(error.message);
    }
}

function handleStartGame() {
    try {
        if (gameState.players.length === 0) {
            showError('Please add at least one player');
            return;
        }
        
        gameState.isGameActive = true;
        showGameArea();
        initializeScoreboard(gameState.players, gameState.maxRounds);
        updateGameDisplay();
        
        console.log('Game started with', gameState.players.length, 'players');
    } catch (error) {
        console.error('Error starting game:', error);
        showError('Failed to start game');
    }
}

function handleNextRound() {
    try {
        if (!gameState.canAdvanceRound()) {
            showError('Please complete all scores for the current round');
            return;
        }
        
        gameState.advanceRound();
        updateGameDisplay();
        updateScoreboardDisplay();
        
        // Check if game is complete after advancing
        if (gameState.isGameComplete()) {
            handleGameComplete();
        }
        
        console.log('Advanced to round', gameState.currentRound);
    } catch (error) {
        console.error('Error advancing round:', error);
        showError('Failed to advance round');
    }
}

function handleFinishGame() {
    try {
        if (!gameState.isGameComplete()) {
            const confirm = window.confirm('Game is not complete. Are you sure you want to finish early?');
            if (!confirm) return;
        }
        
        handleGameComplete();
    } catch (error) {
        console.error('Error finishing game:', error);
        showError('Failed to finish game');
    }
}

function handleGameComplete() {
    try {
        gameState.gameCompleted = true;
        gameState.isGameActive = false;
        
        const winner = gameState.getWinner();
        displayFinalResults(gameState.players, winner);
        
        // Update UI
        nextRoundBtn.style.display = 'none';
        finishGameBtn.style.display = 'none';
        newGameBtn.style.display = 'block';
        
        console.log('Game completed. Winner:', winner?.name || 'No winner');
    } catch (error) {
        console.error('Error completing game:', error);
        showError('Failed to complete game');
    }
}

function handleNewGame() {
    try {
        gameState.reset();
        resetScoreboard();
        showPlayerSetup();
        updatePlayersDisplay();
        
        console.log('New game started');
    } catch (error) {
        console.error('Error starting new game:', error);
        showError('Failed to start new game');
    }
}

function handleScoreInput(e) {
    if (!e.target.matches('input[data-player][data-round]')) return;
    
    try {
        const playerId = e.target.dataset.player;
        const round = parseInt(e.target.dataset.round);
        const score = e.target.value;
        
        // Mark as entered (even if empty)
        e.target.setAttribute('data-entered', 'true');
        
        if (score !== '') {
            gameState.updateRoundScore(playerId, round, score);
            updateScoreboardDisplay();
            
            // Check if round is complete
            if (gameState.isRoundComplete(round)) {
                if (round === gameState.maxRounds) {
                    // Game complete
                    finishGameBtn.disabled = false;
                    if (gameState.isGameComplete()) {
                        handleGameComplete();
                    }
                } else if (round === gameState.currentRound) {
                    // Current round complete, enable next round
                    nextRoundBtn.disabled = false;
                }
            }
        }
    } catch (error) {
        console.error('Error updating score:', error);
        showError(error.message);
        e.target.value = ''; // Clear invalid input
    }
}

function handleScoreBlur(e) {
    if (!e.target.matches('input[data-player][data-round]')) return;
    
    // Validate score on blur
    const score = parseInt(e.target.value);
    if (e.target.value !== '' && (isNaN(score) || score < 0)) {
        showError('Please enter a valid score (0 or positive number)');
        e.target.focus();
        e.target.select();
    }
}

function updatePlayersDisplay() {
    if (!playersList) return;
    
    playersList.innerHTML = '';
    
    gameState.players.forEach(player => {
        const li = document.createElement('li');
        li.className = 'player-item';
        li.innerHTML = `
            <span class="player-name">${escapeHtml(player.name)}</span>
            <button class="remove-player" data-player-id="${player.id}" title="Remove player">&times;</button>
        `;
        
        // Add remove functionality
        li.querySelector('.remove-player').addEventListener('click', () => {
            removePlayer(player.id);
        });
        
        playersList.appendChild(li);
    });
    
    // Update start button state
    if (startGameBtn) {
        startGameBtn.disabled = gameState.players.length === 0;
    }
}

function removePlayer(playerId) {
    try {
        const index = gameState.players.findIndex(p => p.id === playerId);
        if (index !== -1) {
            const player = gameState.players[index];
            gameState.players.splice(index, 1);
            delete gameState.roundScores[playerId];
            updatePlayersDisplay();
            console.log('Removed player:', player.name);
        }
    } catch (error) {
        console.error('Error removing player:', error);
        showError('Failed to remove player');
    }
}

function updateGameDisplay() {
    if (currentRoundDisplay) {
        currentRoundDisplay.textContent = `Round ${gameState.currentRound} of ${gameState.maxRounds}`;
    }
    
    // Update round controls
    if (nextRoundBtn) {
        nextRoundBtn.disabled = !gameState.canAdvanceRound();
        nextRoundBtn.style.display = gameState.currentRound < gameState.maxRounds ? 'block' : 'none';
    }
    
    if (finishGameBtn) {
        finishGameBtn.disabled = !gameState.isRoundComplete(gameState.currentRound);
        finishGameBtn.style.display = gameState.currentRound === gameState.maxRounds ? 'block' : 'none';
    }
}

function updateScoreboardDisplay() {
    try {
        updateScoreboard(gameState.players, gameState.currentRound);
    } catch (error) {
        console.error('Error updating scoreboard:', error);
        showError('Failed to update scoreboard');
    }
}

function showPlayerSetup() {
    if (playerSetup) playerSetup.style.display = 'block';
    if (gameArea) gameArea.style.display = 'none';
    if (newGameBtn) newGameBtn.style.display = 'none';
}

function showGameArea() {
    if (playerSetup) playerSetup.style.display = 'none';
    if (gameArea) gameArea.style.display = 'block';
}

function showError(message) {
    // Create or update error display
    let errorDiv = document.getElementById('error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'error-message';
        errorDiv.className = 'error-message';
        document.body.insertBefore(errorDiv, document.body.firstChild);
    }
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GameState,
        gameState,
        handleAddPlayer,
        handleStartGame,
        handleNextRound,
        handleFinishGame,
        updateScoreboardDisplay
    };
}