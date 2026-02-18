import { playerSetup } from './playerSetup.js';

// DOM Elements
const playerForm = document.getElementById('player-form');
const playerNameInput = document.getElementById('player-name');
const addPlayerBtn = document.getElementById('add-player');
const playersList = document.getElementById('players-list');
const startGameBtn = document.getElementById('start-game');
const validationMessage = document.getElementById('validation-message');
const playerSetupView = document.getElementById('player-setup');
const gameView = document.getElementById('game-view');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializePlayerSetup();
    updateStartGameButton();
});

function initializePlayerSetup() {
    // Add player form submission
    playerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleAddPlayer();
    });

    // Add player button click
    addPlayerBtn.addEventListener('click', handleAddPlayer);

    // Start game button click
    startGameBtn.addEventListener('click', handleStartGame);

    // Clear validation message on input
    playerNameInput.addEventListener('input', () => {
        clearValidationMessage();
    });
}

function handleAddPlayer() {
    const playerName = playerNameInput.value.trim();
    
    if (!playerName) {
        showValidationMessage('Please enter a player name', 'error');
        return;
    }

    try {
        playerSetup.addPlayer(playerName);
        playerNameInput.value = '';
        updatePlayersDisplay();
        updateStartGameButton();
        clearValidationMessage();
    } catch (error) {
        showValidationMessage(error.message, 'error');
    }
}

function handleEditPlayer(playerId, currentName) {
    const newName = prompt('Enter new player name:', currentName);
    
    if (newName === null) return; // User cancelled
    
    const trimmedName = newName.trim();
    if (!trimmedName) {
        showValidationMessage('Player name cannot be empty', 'error');
        return;
    }

    try {
        playerSetup.editPlayer(playerId, trimmedName);
        updatePlayersDisplay();
        clearValidationMessage();
    } catch (error) {
        showValidationMessage(error.message, 'error');
    }
}

function handleRemovePlayer(playerId) {
    if (confirm('Are you sure you want to remove this player?')) {
        playerSetup.removePlayer(playerId);
        updatePlayersDisplay();
        updateStartGameButton();
        clearValidationMessage();
    }
}

function handleStartGame() {
    const players = playerSetup.getPlayers();
    
    if (players.length < 2) {
        showValidationMessage('At least 2 players are required to start the game', 'error');
        return;
    }

    // Transition to game view
    playerSetupView.style.display = 'none';
    gameView.style.display = 'block';
    
    // Initialize game with players (this would be implemented elsewhere)
    console.log('Starting game with players:', players);
}

function updatePlayersDisplay() {
    const players = playerSetup.getPlayers();
    
    if (players.length === 0) {
        playersList.innerHTML = '<p class="no-players">No players added yet</p>';
        return;
    }

    playersList.innerHTML = players.map(player => `
        <div class="player-item" data-player-id="${player.id}">
            <span class="player-name">${escapeHtml(player.name)}</span>
            <div class="player-actions">
                <button class="btn btn-edit" onclick="handleEditPlayer('${player.id}', '${escapeHtml(player.name)}')">
                    Edit
                </button>
                <button class="btn btn-remove" onclick="handleRemovePlayer('${player.id}')">
                    Remove
                </button>
            </div>
        </div>
    `).join('');
}

function updateStartGameButton() {
    const players = playerSetup.getPlayers();
    const canStart = players.length >= 2;
    
    startGameBtn.disabled = !canStart;
    startGameBtn.textContent = canStart 
        ? `Start Game (${players.length} players)` 
        : `Need ${2 - players.length} more player${players.length === 1 ? '' : 's'}`;
}

function showValidationMessage(message, type = 'error') {
    validationMessage.textContent = message;
    validationMessage.className = `validation-message ${type}`;
    validationMessage.style.display = 'block';
}

function clearValidationMessage() {
    validationMessage.style.display = 'none';
    validationMessage.textContent = '';
    validationMessage.className = 'validation-message';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions available globally for inline event handlers
window.handleEditPlayer = handleEditPlayer;
window.handleRemovePlayer = handleRemovePlayer;

// Export for testing
export {
    handleAddPlayer,
    handleEditPlayer,
    handleRemovePlayer,
    handleStartGame,
    updatePlayersDisplay,
    updateStartGameButton
};