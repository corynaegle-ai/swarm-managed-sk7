/**
 * Test suite for bidding.js module
 */

// Mock DOM and global objects
const mockDOM = {
    elements: new Map(),
    getElementById: function(id) {
        return this.elements.get(id) || {
            innerHTML: '',
            textContent: '',
            disabled: false,
            value: '',
            style: { display: 'block' },
            addEventListener: () => {},
            className: ''
        };
    },
    createElement: function(tag) {
        return {
            tagName: tag,
            id: '',
            className: '',
            innerHTML: '',
            appendChild: () => {},
            addEventListener: () => {}
        };
    },
    body: {
        innerHTML: '',
        appendChild: () => {}
    }
};

// Setup global mocks
global.document = mockDOM;
global.window = {
    gameState: {},
    biddingModule: {}
};

// Import the module
const { showBiddingPhase, validateBid, collectAllBids, getBiddingProgress } = require('../js/bidding.js');

describe('Bidding Module Tests', () => {
    beforeEach(() => {
        // Reset gameState before each test
        global.window.gameState = {};
        mockDOM.elements.clear();
    });

    describe('validateBid function', () => {
        test('should accept valid bid within round limit', () => {
            const result = validateBid(3, 5);
            expect(result.isValid).toBe(true);
            expect(result.error).toBe('');
        });

        test('should accept bid of 0', () => {
            const result = validateBid(0, 5);
            expect(result.isValid).toBe(true);
            expect(result.error).toBe('');
        });

        test('should accept bid equal to round number', () => {
            const result = validateBid(5, 5);
            expect(result.isValid).toBe(true);
            expect(result.error).toBe('');
        });

        test('should reject bid exceeding round number', () => {
            const result = validateBid(6, 5);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('cannot exceed');
        });

        test('should reject negative bid', () => {
            const result = validateBid(-1, 5);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('cannot be negative');
        });

        test('should reject non-integer bid', () => {
            const result = validateBid(2.5, 5);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('whole number');
        });

        test('should reject non-numeric bid', () => {
            const result = validateBid('abc', 5);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('must be a number');
        });

        test('should reject null/undefined bid', () => {
            expect(validateBid(null, 5).isValid).toBe(false);
            expect(validateBid(undefined, 5).isValid).toBe(false);
        });
    });

    describe('collectAllBids function', () => {
        test('should return null when no bids collected', () => {
            global.window.gameState.currentBids = [null, null, null];
            const result = collectAllBids();
            expect(result).toBe(null);
        });

        test('should return null when some bids missing', () => {
            global.window.gameState.currentBids = [2, null, 1];
            const result = collectAllBids();
            expect(result).toBe(null);
        });

        test('should return bids array when all collected', () => {
            global.window.gameState.currentBids = [2, 0, 1];
            const result = collectAllBids();
            expect(result).toEqual([2, 0, 1]);
        });

        test('should return copy of bids array', () => {
            global.window.gameState.currentBids = [1, 2, 3];
            const result = collectAllBids();
            result[0] = 999;
            expect(global.window.gameState.currentBids[0]).toBe(1);
        });

        test('should return null when gameState.currentBids is undefined', () => {
            const result = collectAllBids();
            expect(result).toBe(null);
        });
    });

    describe('getBiddingProgress function', () => {
        test('should return correct progress when no bids collected', () => {
            global.window.gameState.currentBids = [null, null, null];
            const progress = getBiddingProgress();
            expect(progress).toEqual({
                totalPlayers: 3,
                collectedBids: 0,
                allCollected: false
            });
        });

        test('should return correct progress when some bids collected', () => {
            global.window.gameState.currentBids = [2, null, 1];
            const progress = getBiddingProgress();
            expect(progress).toEqual({
                totalPlayers: 3,
                collectedBids: 2,
                allCollected: false
            });
        });

        test('should return correct progress when all bids collected', () => {
            global.window.gameState.currentBids = [2, 0, 1];
            const progress = getBiddingProgress();
            expect(progress).toEqual({
                totalPlayers: 3,
                collectedBids: 3,
                allCollected: true
            });
        });

        test('should handle undefined gameState.currentBids', () => {
            const progress = getBiddingProgress();
            expect(progress).toEqual({
                totalPlayers: 0,
                collectedBids: 0,
                allCollected: false
            });
        });
    });

    describe('showBiddingPhase function', () => {
        test('should initialize currentBids array', () => {
            const players = [{name: 'Alice'}, {name: 'Bob'}];
            showBiddingPhase(3, players);
            
            expect(global.window.gameState.currentBids).toBeDefined();
            expect(global.window.gameState.currentBids.length).toBe(2);
            expect(global.window.gameState.currentBids.every(bid => bid === null)).toBe(true);
        });

        test('should reset currentBids for new round', () => {
            global.window.gameState.currentBids = [1, 2, 3];
            const players = [{name: 'Alice'}, {name: 'Bob'}];
            showBiddingPhase(4, players);
            
            expect(global.window.gameState.currentBids.length).toBe(2);
            expect(global.window.gameState.currentBids.every(bid => bid === null)).toBe(true);
        });

        test('should create UI elements for each player', () => {
            const players = [{name: 'Alice'}, {name: 'Bob'}, {name: 'Charlie'}];
            
            // Mock container element
            const container = {
                innerHTML: '',
                appendChild: jest.fn()
            };
            mockDOM.elements.set('game-container', container);
            
            showBiddingPhase(5, players);
            
            expect(container.appendChild).toHaveBeenCalled();
        });
    });

    describe('Edge cases', () => {
        test('should handle round number 1', () => {
            const result = validateBid(1, 1);
            expect(result.isValid).toBe(true);
            
            const resultInvalid = validateBid(2, 1);
            expect(resultInvalid.isValid).toBe(false);
        });

        test('should handle large round numbers', () => {
            const result = validateBid(52, 52);
            expect(result.isValid).toBe(true);
            
            const resultInvalid = validateBid(53, 52);
            expect(resultInvalid.isValid).toBe(false);
        });

        test('should handle empty players array', () => {
            showBiddingPhase(3, []);
            expect(global.window.gameState.currentBids).toEqual([]);
        });
    });
});