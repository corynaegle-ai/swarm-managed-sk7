import { addPlayer, removePlayer, editPlayer, getPlayers, validatePlayerName, canStartGame } from './playerSetup.js';

// DOM Elements
const playerForm = document.getElementById('player-form');
const playerNameInput = document.getElementById('player-name');
const playersList = document.getElementById('players-list');
const startGameBtn = document.getElementById('start-game');
const validationMessage = document.getElementById('validation-message');
const playerSetupView = document.getElementById('player-setup');
const gameView = document.getElementById('game-view');

// State for edit mode
let editingPlayerId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Add event listeners
    playerForm.addEventListener('submit', handleFormSubmit);
    startGameBtn.addEventListener('click', handleStartGame);
    
    // Initial render
    renderPlayersList();
    updateStartButtonState();
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const playerName = playerNameInput.value.trim();
    
    if (!playerName) {
        showValidationMessage('Please enter a player name.', 'error');
        return;
    }
    
    try {
        if (editingPlayerId) {
            // Edit existing player
            const result = editPlayer(editingPlayerId, playerName);
            if (result.success) {
                showValidationMessage(`Player updated successfully!`, 'success');
                cancelEdit();
            } else {
                showValidationMessage(result.error, 'error');
            }
        } else {
            // Add new player
            const result = addPlayer(playerName);
            if (result.success) {
                showValidationMessage(`${playerName} added successfully!`, 'success');
                playerForm.reset();
            } else {
                showValidationMessage(result.error, 'error');
            }
        }
        
        renderPlayersList();
        updateStartButtonState();
        
    } catch (error) {
        showValidationMessage('An error occurred. Please try again.', 'error');
        console.error('Form submission error:', error);
    }
}

function renderPlayersList() {
    const players = getPlayers();
    
    // Clear existing content
    while (playersList.firstChild) {
        playersList.removeChild(playersList.firstChild);
    }
    
    if (players.length === 0) {
        const noPlayersDiv = document.createElement('div');
        noPlayersDiv.className = 'no-players';
        noPlayersDiv.textContent = 'No players added yet. Add players to start the game!';
        playersList.appendChild(noPlayersDiv);
        return;
    }
    
    players.forEach(player => {
        const playerItem = createPlayerItem(player);
        playersList.appendChild(playerItem);
    });
}

function createPlayerItem(player) {
    const playerItem = document.createElement('div');
    playerItem.className = 'player-item';
    
    const playerName = document.createElement('div');
    playerName.className = 'player-name';
    playerName.textContent = player.name;
    
    const playerActions = document.createElement('div');
    playerActions.className = 'player-actions';
    
    const editButton = document.createElement('button');
    editButton.className = 'btn btn-edit';
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => handleEditPlayer(player.id));
    
    const removeButton = document.createElement('button');
    removeButton.className = 'btn btn-remove';
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => handleRemovePlayer(player.id));
    
    playerActions.appendChild(editButton);
    playerActions.appendChild(removeButton);
    
    playerItem.appendChild(playerName);
    playerItem.appendChild(playerActions);
    
    return playerItem;
}

function handleEditPlayer(playerId) {
    const players = getPlayers();
    const player = players.find(p => p.id === playerId);
    
    if (!player) {
        showValidationMessage('Player not found.', 'error');
        return;
    }
    
    // Enter edit mode
    editingPlayerId = playerId;
    playerNameInput.value = player.name;
    playerNameInput.focus();
    
    // Update form button text
    const submitButton = playerForm.querySelector('.btn-primary');
    submitButton.textContent = 'Update Player';
    
    // Show cancel button
    showCancelButton();
    
    showValidationMessage(`Editing ${player.name}. Update the name and click "Update Player".`, 'info');
}

function handleRemovePlayer(playerId) {
    const players = getPlayers();
    const player = players.find(p => p.id === playerId);
    
    if (!player) {
        showValidationMessage('Player not found.', 'error');
        return;
    }
    
    if (confirm(`Are you sure you want to remove ${player.name}?`)) {
        const result = removePlayer(playerId);
        if (result.success) {
            showValidationMessage(`${player.name} removed successfully!`, 'success');
            renderPlayersList();
            updateStartButtonState();
            
            // Cancel edit mode if we're editing this player
            if (editingPlayerId === playerId) {
                cancelEdit();
            }
        } else {
            showValidationMessage(result.error, 'error');
        }
    }
}

function showCancelButton() {
    let cancelButton = document.getElementById('cancel-edit');
    if (!cancelButton) {
        cancelButton = document.createElement('button');
        cancelButton.id = 'cancel-edit';
        cancelButton.type = 'button';
        cancelButton.className = 'btn btn-secondary';
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', cancelEdit);
        
        const formGroup = playerForm.querySelector('.form-group');
        formGroup.appendChild(cancelButton);
    }
}

function hideCancelButton() {
    const cancelButton = document.getElementById('cancel-edit');
    if (cancelButton) {
        cancelButton.remove();
    }
}

function cancelEdit() {
    editingPlayerId = null;
    playerForm.reset();
    
    // Reset form button text
    const submitButton = playerForm.querySelector('.btn-primary');
    submitButton.textContent = 'Add Player';
    
    // Hide cancel button
    hideCancelButton();
    
    hideValidationMessage();
}

function updateStartButtonState() {
    const canStart = canStartGame();
    startGameBtn.disabled = !canStart;
    
    if (canStart) {
        startGameBtn.title = 'Click to start the game';
    } else {
        const playerCount = getPlayers().length;
        startGameBtn.title = `Add ${2 - playerCount} more player(s) to start the game`;
    }
}

function handleStartGame() {
    if (!canStartGame()) {
        showValidationMessage('You need at least 2 players to start the game.', 'error');
        return;
    }
    
    try {
        // Hide player setup and show game view
        playerSetupView.style.display = 'none';
        gameView.style.display = 'block';
        
        // Initialize game with players
        initializeGame(getPlayers());
        
    } catch (error) {
        showValidationMessage('Failed to start the game. Please try again.', 'error');
        console.error('Start game error:', error);
    }
}

function initializeGame(players) {
    // Placeholder for game initialization
    // This will be implemented when the game logic is added
    console.log('Game started with players:', players);
    
    // For now, just show a simple message
    gameView.innerHTML = `
        <div class="game-content">
            <h2>Game Started!</h2>
            <p>Players: ${players.map(p => p.name).join(', ')}</p>
            <button id="back-to-setup" class="btn btn-secondary">Back to Setup</button>
        </div>
    `;
    
    // Add back button functionality
    document.getElementById('back-to-setup').addEventListener('click', () => {
        gameView.style.display = 'none';
        playerSetupView.style.display = 'block';
    });
}

function showValidationMessage(message, type = 'info') {
    validationMessage.textContent = message;
    validationMessage.className = `validation-message ${type}`;
    validationMessage.style.display = 'block';
    
    // Auto-hide success and info messages
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            hideValidationMessage();
        }, 3000);
    }
}

function hideValidationMessage() {
    validationMessage.style.display = 'none';
    validationMessage.textContent = '';
    validationMessage.className = 'validation-message';
}

// Export functions for testing
export {
    initializeApp,
    handleFormSubmit,
    renderPlayersList,
    handleEditPlayer,
    handleRemovePlayer,
    handleStartGame,
    showValidationMessage
};