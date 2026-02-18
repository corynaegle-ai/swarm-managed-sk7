/**
 * Test suite for GameState class
 */

// Mock EventTarget for Node.js environment if needed
if (typeof EventTarget === 'undefined') {
    global.EventTarget = class EventTarget {
        constructor() {
            this.listeners = {};
        }
        
        addEventListener(type, listener) {
            if (!this.listeners[type]) {
                this.listeners[type] = [];
            }
            this.listeners[type].push(listener);
        }
        
        dispatchEvent(event) {
            const listeners = this.listeners[event.type] || [];
            listeners.forEach(listener => listener(event));
            return true;
        }
    };
    
    global.CustomEvent = class CustomEvent extends Event {
        constructor(type, options = {}) {
            super();
            this.type = type;
            this.detail = options.detail;
        }
    };
}

// Load GameState class
const GameState = require('../js/game-state.js');

describe('GameState', () => {
    let gameState;
    
    beforeEach(() => {
        gameState = new GameState();
    });
    
    describe('Constructor and Initial State', () => {
        test('should initialize with correct default state', () => {
            expect(gameState.getCurrentPhase()).toBe('setup');
            expect(gameState.getCurrentRound()).toBe(1);
            expect(gameState.isGameComplete()).toBe(false);
        });
    });
    
    describe('startGame()', () => {
        test('should start game and emit gameStarted event', () => {
            let eventFired = false;
            gameState.addEventListener('gameStarted', () => {
                eventFired = true;
            });
            
            const state = gameState.startGame();
            
            expect(state.gameStarted).toBe(true);
            expect(state.currentPhase).toBe('setup');
            expect(state.currentRound).toBe(1);
            expect(eventFired).toBe(true);
        });
    });
    
    describe('nextPhase()', () => {
        beforeEach(() => {
            gameState.startGame();
        });
        
        test('should progress setup → bidding → scoring', () => {
            expect(gameState.getCurrentPhase()).toBe('setup');
            
            gameState.nextPhase();
            expect(gameState.getCurrentPhase()).toBe('bidding');
            
            gameState.nextPhase();
            expect(gameState.getCurrentPhase()).toBe('scoring');
        });
        
        test('should emit phaseChanged events', () => {
            const events = [];
            gameState.addEventListener('phaseChanged', (e) => {
                events.push(e.detail);
            });
            
            gameState.nextPhase();
            gameState.nextPhase();
            
            expect(events).toHaveLength(2);
            expect(events[0].currentPhase).toBe('bidding');
            expect(events[1].currentPhase).toBe('scoring');
        });
        
        test('should advance to next round from scoring phase', () => {
            // Get to scoring phase
            gameState.nextPhase(); // bidding
            gameState.nextPhase(); // scoring
            
            expect(gameState.getCurrentRound()).toBe(1);
            
            // Next phase from scoring should advance round
            gameState.nextPhase();
            
            expect(gameState.getCurrentRound()).toBe(2);
            expect(gameState.getCurrentPhase()).toBe('setup');
        });
    });
    
    describe('nextRound()', () => {
        beforeEach(() => {
            gameState.startGame();
        });
        
        test('should only work from scoring phase', () => {
            expect(() => gameState.nextRound()).toThrow('Can only advance to next round from scoring phase');
            
            gameState.nextPhase(); // bidding
            expect(() => gameState.nextRound()).toThrow('Can only advance to next round from scoring phase');
            
            gameState.nextPhase(); // scoring
            expect(() => gameState.nextRound()).not.toThrow();
        });
        
        test('should advance round and reset to setup phase', () => {
            // Get to scoring phase
            gameState.nextPhase(); // bidding
            gameState.nextPhase(); // scoring
            
            const state = gameState.nextRound();
            
            expect(state.currentRound).toBe(2);
            expect(state.currentPhase).toBe('setup');
        });
        
        test('should emit roundChanged event', () => {
            let eventDetail;
            gameState.addEventListener('roundChanged', (e) => {
                eventDetail = e.detail;
            });
            
            // Get to scoring phase
            gameState.nextPhase(); // bidding
            gameState.nextPhase(); // scoring
            
            gameState.nextRound();
            
            expect(eventDetail.previousRound).toBe(1);
            expect(eventDetail.currentRound).toBe(2);
        });
    });
    
    describe('isGameComplete()', () => {
        beforeEach(() => {
            gameState.startGame();
        });
        
        test('should return false during gameplay', () => {
            expect(gameState.isGameComplete()).toBe(false);
            
            // Play through several rounds
            for (let i = 0; i < 5; i++) {
                gameState.nextPhase(); // bidding
                gameState.nextPhase(); // scoring
                if (i < 4) gameState.nextPhase(); // next round
            }
            
            expect(gameState.isGameComplete()).toBe(false);
        });
        
        test('should return true after 10 rounds', () => {
            // Play through all 10 rounds
            for (let round = 1; round <= 10; round++) {
                gameState.nextPhase(); // bidding
                gameState.nextPhase(); // scoring
                
                if (round < 10) {
                    gameState.nextPhase(); // next round
                    expect(gameState.isGameComplete()).toBe(false);
                } else {
                    // After 10th round scoring, next phase should complete game
                    gameState.nextPhase();
                    expect(gameState.isGameComplete()).toBe(true);
                }
            }
        });
        
        test('should emit gameComplete event', () => {
            let gameCompleteEvent;
            gameState.addEventListener('gameComplete', (e) => {
                gameCompleteEvent = e.detail;
            });
            
            // Play through all 10 rounds
            for (let round = 1; round <= 10; round++) {
                gameState.nextPhase(); // bidding
                gameState.nextPhase(); // scoring
                gameState.nextPhase(); // next round or complete
            }
            
            expect(gameCompleteEvent).toBeDefined();
            expect(gameCompleteEvent.totalRounds).toBe(10);
        });
    });
    
    describe('Phase Transitions and Events', () => {
        test('should emit correct events for complete game cycle', () => {
            const events = [];
            
            gameState.addEventListener('gameStarted', (e) => events.push('gameStarted'));
            gameState.addEventListener('phaseChanged', (e) => events.push('phaseChanged'));
            gameState.addEventListener('roundChanged', (e) => events.push('roundChanged'));
            gameState.addEventListener('gameComplete', (e) => events.push('gameComplete'));
            
            gameState.startGame();
            
            // Play one complete round
            gameState.nextPhase(); // setup → bidding
            gameState.nextPhase(); // bidding → scoring
            gameState.nextPhase(); // scoring → next round setup
            
            expect(events).toContain('gameStarted');
            expect(events).toContain('phaseChanged');
            expect(events).toContain('roundChanged');
        });
    });
});