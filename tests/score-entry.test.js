/**
 * Tests for Score Entry Module
 */

// Mock DOM environment for testing
function setupMockDOM() {
    const mockHTML = `
        <div id="scoreEntryContainer" class="score-entry">
            <h2>Round <span id="roundNumber"></span> - Enter Scores</h2>
            <div id="playerEntries"></div>
            <button id="calculateScores" class="calculate-btn">Calculate Scores</button>
        </div>
    `;
    
    document.body.innerHTML = mockHTML;
}

// Test Suite for Score Entry
describe('Score Entry Module', () => {
    let scoreEntry;
    
    beforeEach(() => {
        setupMockDOM();
        scoreEntry = new ScoreEntry();
    });
    
    afterEach(() => {
        document.body.innerHTML = '';
    });

    test('AC-001: Input fields generated dynamically for each player', () => {
        const players = [
            { name: 'Alice' },
            { name: 'Bob' },
            { name: 'Charlie' }
        ];
        
        scoreEntry.showScoreEntry(players, 3);
        
        // Check that input fields are created for each player
        expect(document.getElementById('tricks-0')).toBeTruthy();
        expect(document.getElementById('bonus-0')).toBeTruthy();
        expect(document.getElementById('tricks-1')).toBeTruthy();
        expect(document.getElementById('bonus-1')).toBeTruthy();
        expect(document.getElementById('tricks-2')).toBeTruthy();
        expect(document.getElementById('bonus-2')).toBeTruthy();
        
        // Verify player names are displayed
        const playerEntries = document.querySelectorAll('.player-entry');
        expect(playerEntries.length).toBe(3);
        expect(playerEntries[0].textContent).toContain('Alice');
        expect(playerEntries[1].textContent).toContain('Bob');
        expect(playerEntries[2].textContent).toContain('Charlie');
    });

    test('AC-002: Tricks taken validation (0 to current round number)', () => {
        const players = [{ name: 'Test Player' }];
        scoreEntry.showScoreEntry(players, 5);
        
        const tricksInput = document.getElementById('tricks-0');
        const errorElement = document.getElementById('tricks-error-0');
        
        // Test valid values
        tricksInput.value = '3';
        expect(scoreEntry.validateTricksInput(tricksInput, errorElement)).toBe(true);
        expect(errorElement.textContent).toBe('');
        
        // Test minimum boundary
        tricksInput.value = '0';
        expect(scoreEntry.validateTricksInput(tricksInput, errorElement)).toBe(true);
        
        // Test maximum boundary
        tricksInput.value = '5';
        expect(scoreEntry.validateTricksInput(tricksInput, errorElement)).toBe(true);
        
        // Test invalid values
        tricksInput.value = '6'; // exceeds round number
        expect(scoreEntry.validateTricksInput(tricksInput, errorElement)).toBe(false);
        expect(errorElement.textContent).toContain('Maximum tricks');
        
        tricksInput.value = '-1'; // below minimum
        expect(scoreEntry.validateTricksInput(tricksInput, errorElement)).toBe(false);
        expect(errorElement.textContent).toContain('Minimum tricks');
    });

    test('AC-003: Bonus points input (numbers only)', () => {
        const players = [{ name: 'Test Player' }];
        scoreEntry.showScoreEntry(players, 3);
        
        const bonusInput = document.getElementById('bonus-0');
        const errorElement = document.getElementById('bonus-error-0');
        
        // Test valid numbers
        bonusInput.value = '10';
        expect(scoreEntry.validateBonusInput(bonusInput, errorElement)).toBe(true);
        
        bonusInput.value = '0';
        expect(scoreEntry.validateBonusInput(bonusInput, errorElement)).toBe(true);
        
        bonusInput.value = '-5';
        expect(scoreEntry.validateBonusInput(bonusInput, errorElement)).toBe(true);
        
        // Test invalid input
        bonusInput.value = 'abc';
        expect(scoreEntry.validateBonusInput(bonusInput, errorElement)).toBe(false);
        expect(errorElement.textContent).toContain('valid number');
    });

    test('AC-004: Calculate button triggers score calculation', () => {
        const players = [
            { name: 'Player 1' },
            { name: 'Player 2' }
        ];
        
        scoreEntry.showScoreEntry(players, 4);
        
        // Set input values
        document.getElementById('tricks-0').value = '2';
        document.getElementById('bonus-0').value = '10';
        document.getElementById('tricks-1').value = '1';
        document.getElementById('bonus-1').value = '5';
        
        // Mock event listener to capture the custom event
        let eventFired = false;
        let eventData = null;
        
        document.addEventListener('scoresCalculated', (event) => {
            eventFired = true;
            eventData = event.detail;
        });
        
        // Trigger calculation
        const calculateBtn = document.getElementById('calculateScores');
        calculateBtn.click();
        
        // Verify event was fired with correct data
        expect(eventFired).toBe(true);
        expect(eventData.roundNumber).toBe(4);
        expect(eventData.scores.length).toBe(2);
        expect(eventData.scores[0].tricksTaken).toBe(2);
        expect(eventData.scores[0].bonusPoints).toBe(10);
        expect(eventData.scores[1].tricksTaken).toBe(1);
        expect(eventData.scores[1].bonusPoints).toBe(5);
    });

    test('AC-005: Form can be shown/hidden programmatically', () => {
        const players = [{ name: 'Test Player' }];
        
        // Initially hidden
        const container = document.getElementById('scoreEntryContainer');
        expect(container.style.display).toBe('');
        
        // Show form
        scoreEntry.showScoreEntry(players, 3);
        expect(container.style.display).toBe('block');
        
        // Hide form
        scoreEntry.hideScoreEntry();
        expect(container.style.display).toBe('none');
        
        // Verify inputs are cleared when hidden
        scoreEntry.showScoreEntry(players, 3);
        document.getElementById('tricks-0').value = '5';
        document.getElementById('bonus-0').value = '15';
        
        scoreEntry.hideScoreEntry();
        scoreEntry.showScoreEntry(players, 3);
        
        expect(document.getElementById('tricks-0').value).toBe('0');
        expect(document.getElementById('bonus-0').value).toBe('0');
    });

    test('Error handling for invalid inputs', () => {
        // Test with empty players array
        console.error = jest.fn();
        scoreEntry.showScoreEntry([], 3);
        expect(console.error).toHaveBeenCalledWith('Invalid players array provided');
        
        // Test with invalid round number
        scoreEntry.showScoreEntry([{ name: 'Test' }], 0);
        expect(console.error).toHaveBeenCalledWith('Invalid round number. Must be between 1 and 10');
        
        scoreEntry.showScoreEntry([{ name: 'Test' }], 11);
        expect(console.error).toHaveBeenCalledWith('Invalid round number. Must be between 1 and 10');
    });
});

// Integration tests for exported functions
describe('Exported Functions', () => {
    beforeEach(() => {
        setupMockDOM();
    });
    
    test('showScoreEntry function works correctly', () => {
        const players = [{ name: 'Test Player' }];
        showScoreEntry(players, 3);
        
        expect(document.getElementById('roundNumber').textContent).toBe('3');
        expect(document.getElementById('tricks-0')).toBeTruthy();
    });
    
    test('hideScoreEntry function works correctly', () => {
        const players = [{ name: 'Test Player' }];
        showScoreEntry(players, 3);
        
        const container = document.getElementById('scoreEntryContainer');
        expect(container.style.display).toBe('block');
        
        hideScoreEntry();
        expect(container.style.display).toBe('none');
    });
});