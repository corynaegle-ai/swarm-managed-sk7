const GameManager = require('../../src/game/GameManager');

// Mock DOM for event handling
global.document = {
  addEventListener: jest.fn(),
  dispatchEvent: jest.fn()
};

describe('GameManager', () => {
  let gameManager;

  beforeEach(() => {
    gameManager = new GameManager();
    gameManager.addPlayer({ id: 'player1', name: 'Alice' });
    gameManager.addPlayer({ id: 'player2', name: 'Bob' });
  });

  describe('Game Setup', () => {
    test('should add players to the game', () => {
      expect(gameManager.getPlayers()).toHaveLength(2);
      expect(gameManager.getPlayers()[0].name).toBe('Alice');
    });

    test('should start in setup state', () => {
      expect(gameManager.getGameState()).toBe('setup');
    });
  });

  describe('Round Management', () => {
    test('should transition to bidding phase when round starts', () => {
      gameManager.startRound(1, 3);
      
      expect(gameManager.getGameState()).toBe('bidding');
      expect(gameManager.getCurrentRound()).toBe(1);
    });

    test('should initialize bid collector with round info', () => {
      gameManager.startRound(2, 5);
      
      const roundInfo = gameManager.bidCollector.getRoundInfo();
      expect(roundInfo.roundNumber).toBe(2);
      expect(roundInfo.handCount).toBe(5);
    });
  });

  describe('Bid Collection Integration', () => {
    test('should render bid collection UI when in bidding phase', () => {
      gameManager.startRound(1, 3);
      
      // Mock container
      const container = { innerHTML: '' };
      
      expect(() => {
        gameManager.renderBidCollection(container);
      }).not.toThrow();
    });

    test('should throw error if trying to render bid collection when not in bidding phase', () => {
      expect(() => {
        gameManager.renderBidCollection({});
      }).toThrow('Game is not in bidding phase');
    });
  });

  describe('Game Flow', () => {
    test('should transition to playing phase after all bids collected', () => {
      gameManager.startRound(1, 3);
      
      // Simulate bids completion
      const mockBids = new Map();
      mockBids.set('player1', 2);
      mockBids.set('player2', 1);
      
      gameManager.onBidsCompleted(mockBids);
      
      expect(gameManager.getGameState()).toBe('playing');
    });

    test('should dispatch game phase change event', () => {
      gameManager.startRound(1, 3);
      
      const mockBids = new Map();
      gameManager.onBidsCompleted(mockBids);
      
      expect(document.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: expect.objectContaining({
            phase: 'playing',
            round: 1
          })
        })
      );
    });
  });

  describe('Game Reset', () => {
    test('should reset game state', () => {
      gameManager.startRound(3, 5);
      gameManager.onBidsCompleted(new Map());
      
      gameManager.reset();
      
      expect(gameManager.getGameState()).toBe('setup');
      expect(gameManager.getCurrentRound()).toBe(1);
    });
  });
});