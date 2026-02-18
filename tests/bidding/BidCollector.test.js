const BidCollector = require('../../src/bidding/BidCollector');

// Mock game object
const mockGame = {
  getPlayers: () => [
    { id: 'player1', name: 'Alice' },
    { id: 'player2', name: 'Bob' },
    { id: 'player3', name: 'Charlie' }
  ]
};

describe('BidCollector', () => {
  let bidCollector;

  beforeEach(() => {
    bidCollector = new BidCollector(mockGame);
    bidCollector.initializeRound(3, 5);
  });

  describe('Round Information', () => {
    test('should display current round number and hand count', () => {
      const roundInfo = bidCollector.getRoundInfo();
      
      expect(roundInfo.roundNumber).toBe(3);
      expect(roundInfo.handCount).toBe(5);
      expect(roundInfo.totalPlayers).toBe(3);
      expect(roundInfo.bidsCollected).toBe(0);
    });
  });

  describe('Bid Collection', () => {
    test('should collect valid bids from players', () => {
      const result = bidCollector.collectBid('player1', 3);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Bid of 3 recorded');
      expect(bidCollector.getPlayerBid('player1')).toBe(3);
    });

    test('should collect bids for all players', () => {
      bidCollector.collectBid('player1', 2);
      bidCollector.collectBid('player2', 1);
      bidCollector.collectBid('player3', 4);
      
      expect(bidCollector.getBids().size).toBe(3);
      expect(bidCollector.getPlayerBid('player1')).toBe(2);
      expect(bidCollector.getPlayerBid('player2')).toBe(1);
      expect(bidCollector.getPlayerBid('player3')).toBe(4);
    });
  });

  describe('Bid Validation', () => {
    test('should reject bids exceeding hand count', () => {
      const result = bidCollector.collectBid('player1', 6); // Max is 5
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Bid must be between 0 and 5');
    });

    test('should reject negative bids', () => {
      const result = bidCollector.collectBid('player1', -1);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Bid must be between 0 and 5');
    });

    test('should accept bid equal to hand count', () => {
      const result = bidCollector.collectBid('player1', 5);
      
      expect(result.success).toBe(true);
    });

    test('should accept zero bids', () => {
      const result = bidCollector.collectBid('player1', 0);
      
      expect(result.success).toBe(true);
    });

    test('should reject non-integer bids', () => {
      const result = bidCollector.collectBid('player1', 2.5);
      
      expect(result.success).toBe(false);
    });
  });

  describe('Bid Completion Tracking', () => {
    test('should prevent proceeding until all bids collected', () => {
      expect(bidCollector.allBidsCollected()).toBe(false);
      
      bidCollector.collectBid('player1', 2);
      expect(bidCollector.allBidsCollected()).toBe(false);
      
      bidCollector.collectBid('player2', 1);
      expect(bidCollector.allBidsCollected()).toBe(false);
      
      bidCollector.collectBid('player3', 3);
      expect(bidCollector.allBidsCollected()).toBe(true);
    });

    test('should track players needing bids', () => {
      let pending = bidCollector.getPlayersNeedingBids();
      expect(pending).toEqual(['player1', 'player2', 'player3']);
      
      bidCollector.collectBid('player1', 2);
      pending = bidCollector.getPlayersNeedingBids();
      expect(pending).toEqual(['player2', 'player3']);
      
      bidCollector.collectBid('player2', 1);
      bidCollector.collectBid('player3', 0);
      pending = bidCollector.getPlayersNeedingBids();
      expect(pending).toEqual([]);
    });
  });

  describe('Round Management', () => {
    test('should reset bids when initializing new round', () => {
      bidCollector.collectBid('player1', 2);
      expect(bidCollector.getBids().size).toBe(1);
      
      bidCollector.initializeRound(4, 3);
      expect(bidCollector.getBids().size).toBe(0);
      expect(bidCollector.getRoundInfo().roundNumber).toBe(4);
      expect(bidCollector.getRoundInfo().handCount).toBe(3);
    });
  });
});