// Test suite for app.js
import { GameState } from '../js/app.js';

describe('GameState', () => {
    let gameState;
    
    beforeEach(() => {
        gameState = new GameState();
    });
    
    describe('Player Management', () => {
        test('should add player successfully', () => {
            const player = gameState.addPlayer('John');
            expect(player.name).toBe('John');
            expect(player.totalScore).toBe(0);
            expect(gameState.players).toHaveLength(1);
        });
        
        test('should throw error for empty player name', () => {
            expect(() => gameState.addPlayer('')).toThrow('Player name cannot be empty');
            expect(() => gameState.addPlayer('   ')).toThrow('Player name cannot be empty');
        });
    });
    
    describe('Score Management', () => {
        beforeEach(() => {
            gameState.addPlayer('John');
        });
        
        test('should update round score correctly', () => {
            const player = gameState.players[0];
            gameState.updateRoundScore(player.id, 1, 10);
            
            expect(player.roundScores[0]).toBe(10);
            expect(player.totalScore).toBe(10);
        });
        
        test('should throw error for invalid round', () => {
            const player = gameState.players[0];
            expect(() => gameState.updateRoundScore(player.id, 0, 10)).toThrow('Invalid round number');
            expect(() => gameState.updateRoundScore(player.id, 11, 10)).toThrow('Invalid round number');
        });
        
        test('should throw error for non-existent player', () => {
            expect(() => gameState.updateRoundScore('fake-id', 1, 10)).toThrow('Player not found');
        });
    });
    
    describe('Round Management', () => {
        beforeEach(() => {
            gameState.addPlayer('John');
            gameState.addPlayer('Jane');
        });
        
        test('should detect incomplete round', () => {
            expect(gameState.isRoundComplete(1)).toBe(false);
        });
        
        test('should detect complete round', () => {
            const john = gameState.players[0];
            const jane = gameState.players[1];
            
            gameState.updateRoundScore(john.id, 1, 10);
            gameState.updateRoundScore(jane.id, 1, 15);
            
            expect(gameState.isRoundComplete(1)).toBe(true);
        });
        
        test('should advance round when possible', () => {
            const john = gameState.players[0];
            const jane = gameState.players[1];
            
            gameState.updateRoundScore(john.id, 1, 10);
            gameState.updateRoundScore(jane.id, 1, 15);
            
            expect(gameState.canAdvanceRound()).toBe(true);
            expect(gameState.advanceRound()).toBe(true);
            expect(gameState.currentRound).toBe(2);
        });
    });
    
    describe('Game Completion', () => {
        beforeEach(() => {
            gameState.addPlayer('John');
            gameState.addPlayer('Jane');
        });
        
        test('should detect game completion', () => {
            const john = gameState.players[0];
            const jane = gameState.players[1];
            
            // Complete all 10 rounds
            for (let round = 1; round <= 10; round++) {
                gameState.updateRoundScore(john.id, round, 10);
                gameState.updateRoundScore(jane.id, round, 15);
                if (round < 10) gameState.advanceRound();
            }
            
            expect(gameState.isGameComplete()).toBe(true);
        });
        
        test('should determine winner correctly', () => {
            const john = gameState.players[0];
            const jane = gameState.players[1];
            
            gameState.updateRoundScore(john.id, 1, 10);
            gameState.updateRoundScore(jane.id, 1, 15);
            
            const winner = gameState.getWinner();
            expect(winner.name).toBe('Jane');
            expect(winner.totalScore).toBe(15);
        });
    });
    
    describe('State Reset', () => {
        test('should reset game state properly', () => {
            gameState.addPlayer('John');
            gameState.currentRound = 5;
            gameState.gameCompleted = true;
            gameState.isGameActive = true;
            
            gameState.reset();
            
            expect(gameState.currentRound).toBe(1);
            expect(gameState.gameCompleted).toBe(false);
            expect(gameState.isGameActive).toBe(false);
            expect(gameState.players[0].totalScore).toBe(0);
        });
    });
});