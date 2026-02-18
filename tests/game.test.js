import { jest } from '@jest/globals';
import { gameState, handleScoreEntry, displayRoundResults, showError, showSuccess } from '../js/game.js';

// Mock the imported modules
jest.mock('../js/score-entry.js', () => ({
    initializeScoreEntry: jest.fn(),
    validateScoreEntry: jest.fn(),
    getScoreEntryData: jest.fn()
}));

jest.mock('../js/scoring.js', () => ({
    calculateRoundScores: jest.fn()
}));

// Mock DOM elements
const mockDOM = () => {
    document.body.innerHTML = `
        <div id="current-phase"></div>
        <div id="bidding-section" style="display: none;"></div>
        <div id="score-entry-section" style="display: none;"></div>
        <div id="results-section" style="display: none;"></div>
        <div id="round-results"></div>
        <div id="error-message" style="display: none;"></div>
        <div id="success-message" style="display: none;"></div>
        <button id="submit-scores-btn"></button>
    `;
};

describe('Game State Management', () => {
    beforeEach(() => {
        mockDOM();
        // Reset game state
        gameState.currentPhase = 'setup';
        gameState.players = [];
        gameState.currentRound = 1;
        gameState.totalScores = {};
        gameState.gameHistory = [];
    });

    test('should initialize game state correctly', () => {
        expect(gameState.currentPhase).toBe('setup');
        expect(gameState.players).toEqual([]);
        expect(gameState.currentRound).toBe(1);
        expect(gameState.maxRounds).toBe(10);
    });

    test('should add players correctly', () => {
        gameState.addPlayer('Player 1');
        gameState.addPlayer('Player 2');
        
        expect(gameState.players).toEqual(['Player 1', 'Player 2']);
        expect(gameState.totalScores).toEqual({
            'Player 1': 0,
            'Player 2': 0
        });
    });

    test('should change phases correctly', () => {
        gameState.setCurrentPhase('bidding');
        expect(gameState.currentPhase).toBe('bidding');
        
        const phaseIndicator = document.getElementById('current-phase');
        expect(phaseIndicator.textContent).toBe('Phase: Bidding');
    });

    test('should toggle section visibility based on phase', () => {
        const biddingSection = document.getElementById('bidding-section');
        const scoreEntrySection = document.getElementById('score-entry-section');
        const resultsSection = document.getElementById('results-section');

        gameState.setCurrentPhase('bidding');
        expect(biddingSection.style.display).toBe('block');
        expect(scoreEntrySection.style.display).toBe('none');
        expect(resultsSection.style.display).toBe('none');

        gameState.setCurrentPhase('scoring');
        expect(biddingSection.style.display).toBe('none');
        expect(scoreEntrySection.style.display).toBe('block');
        expect(resultsSection.style.display).toBe('none');

        gameState.setCurrentPhase('results');
        expect(biddingSection.style.display).toBe('none');
        expect(scoreEntrySection.style.display).toBe('none');
        expect(resultsSection.style.display).toBe('block');
    });
});

describe('Score Entry Handling', () => {
    beforeEach(() => {
        mockDOM();
        gameState.players = ['Player 1', 'Player 2'];
        gameState.totalScores = { 'Player 1': 0, 'Player 2': 0 };
    });

    test('should handle score entry successfully', async () => {
        const { validateScoreEntry, getScoreEntryData } = await import('../js/score-entry.js');
        const { calculateRoundScores } = await import('../js/scoring.js');
        
        validateScoreEntry.mockReturnValue(true);
        getScoreEntryData.mockReturnValue({
            bids: { 'Player 1': 2, 'Player 2': 1 },
            tricks: { 'Player 1': 2, 'Player 2': 1 }
        });
        calculateRoundScores.mockReturnValue({
            'Player 1': 22, 'Player 2': 11
        });

        handleScoreEntry();

        expect(gameState.currentPhase).toBe('results');
        expect(gameState.totalScores).toEqual({
            'Player 1': 22,
            'Player 2': 11
        });
        expect(gameState.gameHistory).toHaveLength(1);
    });

    test('should handle validation errors', async () => {
        const { validateScoreEntry } = await import('../js/score-entry.js');
        validateScoreEntry.mockReturnValue(false);

        handleScoreEntry();

        const errorMessage = document.getElementById('error-message');
        expect(errorMessage.style.display).toBe('block');
        expect(errorMessage.textContent).toContain('Please fill in all required');
    });

    test('should handle calculation errors gracefully', async () => {
        const { validateScoreEntry, getScoreEntryData } = await import('../js/score-entry.js');
        const { calculateRoundScores } = await import('../js/scoring.js');
        
        validateScoreEntry.mockReturnValue(true);
        getScoreEntryData.mockReturnValue({
            bids: { 'Player 1': 2 },
            tricks: { 'Player 1': 2 }
        });
        calculateRoundScores.mockImplementation(() => {
            throw new Error('Calculation failed');
        });

        handleScoreEntry();

        const errorMessage = document.getElementById('error-message');
        expect(errorMessage.style.display).toBe('block');
        expect(errorMessage.textContent).toContain('error occurred');
    });
});

describe('Round Results Display', () => {
    beforeEach(() => {
        mockDOM();
        gameState.players = ['Player 1', 'Player 2'];
        gameState.currentRound = 1;
        gameState.roundData = {
            bids: { 'Player 1': 2, 'Player 2': 1 },
            tricks: { 'Player 1': 2, 'Player 2': 0 }
        };
        gameState.totalScores = { 'Player 1': 22, 'Player 2': 0 };
    });

    test('should display round results correctly', () => {
        const roundScores = { 'Player 1': 22, 'Player 2': 0 };
        
        displayRoundResults(roundScores);
        
        const resultsContainer = document.getElementById('round-results');
        expect(resultsContainer.innerHTML).toContain('Round 1 Results');
        expect(resultsContainer.innerHTML).toContain('Player 1');
        expect(resultsContainer.innerHTML).toContain('Player 2');
        expect(resultsContainer.innerHTML).toContain('Made Bid');
        expect(resultsContainer.innerHTML).toContain('Missed Bid');
    });

    test('should create results table with correct data', () => {
        const roundScores = { 'Player 1': 22, 'Player 2': 0 };
        
        displayRoundResults(roundScores);
        
        const table = document.querySelector('.results-table');
        expect(table).toBeTruthy();
        
        const rows = table.querySelectorAll('tbody tr');
        expect(rows).toHaveLength(2);
        
        // Check Player 1 row
        expect(rows[0].innerHTML).toContain('Player 1');
        expect(rows[0].innerHTML).toContain('2'); // bid
        expect(rows[0].innerHTML).toContain('2'); // tricks
        expect(rows[0].innerHTML).toContain('22'); // round score
        expect(rows[0].innerHTML).toContain('Made Bid');
        
        // Check Player 2 row
        expect(rows[1].innerHTML).toContain('Player 2');
        expect(rows[1].innerHTML).toContain('1'); // bid
        expect(rows[1].innerHTML).toContain('0'); // tricks
        expect(rows[1].innerHTML).toContain('0'); // round score
        expect(rows[1].innerHTML).toContain('Missed Bid');
    });

    test('should show next round button for non-final rounds', () => {
        gameState.currentRound = 5; // Not final round
        const roundScores = { 'Player 1': 22, 'Player 2': 0 };
        
        displayRoundResults(roundScores);
        
        const nextRoundBtn = document.getElementById('next-round-btn');
        expect(nextRoundBtn).toBeTruthy();
        expect(nextRoundBtn.textContent).toBe('Next Round');
    });

    test('should show final results button for final round', () => {
        gameState.currentRound = 10; // Final round
        gameState.maxRounds = 10;
        const roundScores = { 'Player 1': 22, 'Player 2': 0 };
        
        displayRoundResults(roundScores);
        
        const finalResultsBtn = document.getElementById('final-results-btn');
        expect(finalResultsBtn).toBeTruthy();
        expect(finalResultsBtn.textContent).toBe('View Final Results');
    });
});

describe('Message Display Functions', () => {
    beforeEach(() => {
        mockDOM();
    });

    test('should show error message', () => {
        showError('Test error message');
        
        const errorDiv = document.getElementById('error-message');
        expect(errorDiv.style.display).toBe('block');
        expect(errorDiv.textContent).toBe('Test error message');
    });

    test('should show success message', () => {
        showSuccess('Test success message');
        
        const successDiv = document.getElementById('success-message');
        expect(successDiv.style.display).toBe('block');
        expect(successDiv.textContent).toBe('Test success message');
    });

    test('should handle missing message elements gracefully', () => {
        document.getElementById('error-message').remove();
        document.getElementById('success-message').remove();
        
        expect(() => showError('Test')).not.toThrow();
        expect(() => showSuccess('Test')).not.toThrow();
    });
});

describe('Game Flow Integration', () => {
    beforeEach(() => {
        mockDOM();
        gameState.players = ['Player 1', 'Player 2'];
        gameState.totalScores = { 'Player 1': 0, 'Player 2': 0 };
    });

    test('should transition through game phases correctly', async () => {
        const { validateScoreEntry, getScoreEntryData } = await import('../js/score-entry.js');
        const { calculateRoundScores } = await import('../js/scoring.js');
        
        validateScoreEntry.mockReturnValue(true);
        getScoreEntryData.mockReturnValue({
            bids: { 'Player 1': 2, 'Player 2': 1 },
            tricks: { 'Player 1': 2, 'Player 2': 1 }
        });
        calculateRoundScores.mockReturnValue({
            'Player 1': 22, 'Player 2': 11
        });

        // Start in scoring phase
        gameState.setCurrentPhase('scoring');
        expect(gameState.currentPhase).toBe('scoring');
        
        // Handle score entry should transition to results
        handleScoreEntry();
        expect(gameState.currentPhase).toBe('results');
        
        // Check that game history was updated
        expect(gameState.gameHistory).toHaveLength(1);
        expect(gameState.gameHistory[0].round).toBe(1);
        expect(gameState.gameHistory[0].bids).toEqual({ 'Player 1': 2, 'Player 2': 1 });
        expect(gameState.gameHistory[0].tricks).toEqual({ 'Player 1': 2, 'Player 2': 1 });
        expect(gameState.gameHistory[0].scores).toEqual({ 'Player 1': 22, 'Player 2': 11 });
    });

    test('should update total scores correctly across rounds', async () => {
        const { validateScoreEntry, getScoreEntryData } = await import('../js/score-entry.js');
        const { calculateRoundScores } = await import('../js/scoring.js');
        
        // Setup mocks
        validateScoreEntry.mockReturnValue(true);
        calculateRoundScores.mockReturnValue({ 'Player 1': 22, 'Player 2': 11 });
        
        // First round
        getScoreEntryData.mockReturnValue({
            bids: { 'Player 1': 2, 'Player 2': 1 },
            tricks: { 'Player 1': 2, 'Player 2': 1 }
        });
        handleScoreEntry();
        
        expect(gameState.totalScores).toEqual({ 'Player 1': 22, 'Player 2': 11 });
        
        // Second round
        gameState.currentRound = 2;
        calculateRoundScores.mockReturnValue({ 'Player 1': 10, 'Player 2': 20 });
        getScoreEntryData.mockReturnValue({
            bids: { 'Player 1': 1, 'Player 2': 2 },
            tricks: { 'Player 1': 1, 'Player 2': 2 }
        });
        handleScoreEntry();
        
        expect(gameState.totalScores).toEqual({ 'Player 1': 32, 'Player 2': 31 });
    });
});