/**
 * Tests for Player Setup Module
 */

// Load the module
const PlayerSetup = require('../js/playerSetup.js');

describe('Player Setup Module', () => {
    beforeEach(() => {
        PlayerSetup.resetPlayers();
    });

    describe('addPlayer', () => {
        test('should add a valid player', () => {
            const result = PlayerSetup.addPlayer('John');
            expect(result.success).toBe(true);
            expect(result.data.name).toBe('John');
            expect(typeof result.data.id).toBe('number');
        });

        test('should reject duplicate names (case insensitive)', () => {
            PlayerSetup.addPlayer('John');
            const result = PlayerSetup.addPlayer('JOHN');
            expect(result.success).toBe(false);
            expect(result.error).toContain('unique');
        });

        test('should enforce 8 player maximum', () => {
            for (let i = 1; i <= 8; i++) {
                PlayerSetup.addPlayer(`Player${i}`);
            }
            const result = PlayerSetup.addPlayer('Player9');
            expect(result.success).toBe(false);
            expect(result.error).toContain('Maximum');
        });

        test('should reject empty names', () => {
            const result = PlayerSetup.addPlayer('   ');
            expect(result.success).toBe(false);
        });
    });

    describe('removePlayer', () => {
        test('should remove existing player', () => {
            const addResult = PlayerSetup.addPlayer('John');
            const removeResult = PlayerSetup.removePlayer(addResult.data.id);
            expect(removeResult.success).toBe(true);
            expect(PlayerSetup.getPlayers()).toHaveLength(0);
        });

        test('should fail for non-existent player', () => {
            const result = PlayerSetup.removePlayer(999);
            expect(result.success).toBe(false);
        });
    });

    describe('editPlayer', () => {
        test('should edit player name successfully', () => {
            const addResult = PlayerSetup.addPlayer('John');
            const editResult = PlayerSetup.editPlayer(addResult.data.id, 'Jane');
            expect(editResult.success).toBe(true);
            expect(editResult.data.player.name).toBe('Jane');
        });

        test('should reject duplicate names during edit', () => {
            const player1 = PlayerSetup.addPlayer('John');
            PlayerSetup.addPlayer('Jane');
            const result = PlayerSetup.editPlayer(player1.data.id, 'Jane');
            expect(result.success).toBe(false);
        });
    });

    describe('getPlayers', () => {
        test('should return array of player objects', () => {
            PlayerSetup.addPlayer('John');
            PlayerSetup.addPlayer('Jane');
            const players = PlayerSetup.getPlayers();
            expect(Array.isArray(players)).toBe(true);
            expect(players).toHaveLength(2);
            expect(players[0]).toHaveProperty('id');
            expect(players[0]).toHaveProperty('name');
        });
    });

    describe('validateGameStart', () => {
        test('should return false with less than 2 players', () => {
            const result = PlayerSetup.validateGameStart();
            expect(result.valid).toBe(false);
        });

        test('should return true with 2 or more players', () => {
            PlayerSetup.addPlayer('John');
            PlayerSetup.addPlayer('Jane');
            const result = PlayerSetup.validateGameStart();
            expect(result.valid).toBe(true);
        });
    });
});