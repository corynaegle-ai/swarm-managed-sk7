/**
 * Player Setup Module
 * Handles all player management functionality for the game
 */

// Private state
let players = [];
let playerIdCounter = 0;

// Constants
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;

/**
 * Generates a unique player ID
 * @returns {number} Unique ID
 */
function generatePlayerId() {
    return ++playerIdCounter;
}

/**
 * Validates if a player name is unique
 * @param {string} name - Player name to validate
 * @param {number} excludeId - Player ID to exclude from validation (for edits)
 * @returns {boolean} True if name is unique
 */
function isNameUnique(name, excludeId = null) {
    if (!name || typeof name !== 'string') {
        return false;
    }
    
    const trimmedName = name.trim();
    if (trimmedName === '') {
        return false;
    }
    
    return !players.some(player => 
        player.id !== excludeId && 
        player.name.toLowerCase() === trimmedName.toLowerCase()
    );
}

/**
 * Adds a new player to the game
 * @param {string} name - Player name
 * @returns {object} Result object with success status and data/error
 */
function addPlayer(name) {
    // Validate input
    if (!name || typeof name !== 'string') {
        return {
            success: false,
            error: 'Player name must be a non-empty string'
        };
    }
    
    const trimmedName = name.trim();
    if (trimmedName === '') {
        return {
            success: false,
            error: 'Player name cannot be empty'
        };
    }
    
    // Check player limit
    if (players.length >= MAX_PLAYERS) {
        return {
            success: false,
            error: `Maximum of ${MAX_PLAYERS} players allowed`
        };
    }
    
    // Check name uniqueness
    if (!isNameUnique(trimmedName)) {
        return {
            success: false,
            error: 'Player name must be unique'
        };
    }
    
    // Create new player
    const newPlayer = {
        id: generatePlayerId(),
        name: trimmedName
    };
    
    players.push(newPlayer);
    
    return {
        success: true,
        data: newPlayer
    };
}

/**
 * Removes a player from the game
 * @param {number} id - Player ID to remove
 * @returns {object} Result object with success status and data/error
 */
function removePlayer(id) {
    if (typeof id !== 'number') {
        return {
            success: false,
            error: 'Player ID must be a number'
        };
    }
    
    const playerIndex = players.findIndex(player => player.id === id);
    
    if (playerIndex === -1) {
        return {
            success: false,
            error: 'Player not found'
        };
    }
    
    const removedPlayer = players.splice(playerIndex, 1)[0];
    
    return {
        success: true,
        data: removedPlayer
    };
}

/**
 * Edits a player's name
 * @param {number} id - Player ID to edit
 * @param {string} newName - New player name
 * @returns {object} Result object with success status and data/error
 */
function editPlayer(id, newName) {
    if (typeof id !== 'number') {
        return {
            success: false,
            error: 'Player ID must be a number'
        };
    }
    
    if (!newName || typeof newName !== 'string') {
        return {
            success: false,
            error: 'New player name must be a non-empty string'
        };
    }
    
    const trimmedNewName = newName.trim();
    if (trimmedNewName === '') {
        return {
            success: false,
            error: 'New player name cannot be empty'
        };
    }
    
    const playerIndex = players.findIndex(player => player.id === id);
    
    if (playerIndex === -1) {
        return {
            success: false,
            error: 'Player not found'
        };
    }
    
    // Check name uniqueness (excluding current player)
    if (!isNameUnique(trimmedNewName, id)) {
        return {
            success: false,
            error: 'Player name must be unique'
        };
    }
    
    // Update player name
    const oldName = players[playerIndex].name;
    players[playerIndex].name = trimmedNewName;
    
    return {
        success: true,
        data: {
            player: players[playerIndex],
            oldName: oldName
        }
    };
}

/**
 * Gets all current players
 * @returns {Array} Array of player objects
 */
function getPlayers() {
    // Return a deep copy to prevent external modifications
    return players.map(player => ({
        id: player.id,
        name: player.name
    }));
}

/**
 * Validates if the game can start
 * @returns {object} Validation result with success status and message
 */
function validateGameStart() {
    if (players.length < MIN_PLAYERS) {
        return {
            valid: false,
            message: `At least ${MIN_PLAYERS} players required to start the game`
        };
    }
    
    return {
        valid: true,
        message: 'Game can start'
    };
}

/**
 * Resets all players (useful for testing or new games)
 */
function resetPlayers() {
    players = [];
    playerIdCounter = 0;
}

/**
 * Gets current player count
 * @returns {number} Number of players
 */
function getPlayerCount() {
    return players.length;
}

// Export functions for use in main app
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        addPlayer,
        removePlayer,
        editPlayer,
        getPlayers,
        validateGameStart,
        resetPlayers,
        getPlayerCount
    };
} else {
    // Browser environment
    window.PlayerSetup = {
        addPlayer,
        removePlayer,
        editPlayer,
        getPlayers,
        validateGameStart,
        resetPlayers,
        getPlayerCount
    };
}