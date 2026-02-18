const BidCollectionUI = require('../../src/ui/BidCollectionUI');
const BidCollector = require('../../src/bidding/BidCollector');

// Mock DOM
document.body.innerHTML = '<div id="test-container"></div>';

// Mock game object
const mockGame = {
  getPlayers: () => [
    { id: 'player1', name: 'Alice' },
    { id: 'player2', name: 'Bob' }
  ]
};

describe('BidCollectionUI', () => {
  let bidCollector;
  let bidUI;
  let container;

  beforeEach(() => {
    bidCollector = new BidCollector(mockGame);
    bidCollector.initializeRound(2, 4);
    bidUI = new BidCollectionUI(bidCollector);
    container = document.getElementById('test-container');
  });

  describe('Display Requirements', () => {
    test('should show current round number and hand count', () => {
      bidUI.render(container);
      
      expect(container.innerHTML).toContain('Round 2');
      expect(container.innerHTML).toContain('Number of hands: 4');
    });

    test('should show bid collection progress', () => {
      bidUI.render(container);
      
      expect(container.innerHTML).toContain('Bids collected: 0/2');
      
      // Submit one bid
      bidCollector.collectBid('player1', 2);
      bidUI.render(container);
      
      expect(container.innerHTML).toContain('Bids collected: 1/2');
    });

    test('should display who still needs to bid', () => {
      bidUI.render(container);
      
      expect(container.innerHTML).toContain('Waiting for bids from:');
      expect(container.innerHTML).toContain('Alice');
      expect(container.innerHTML).toContain('Bob');
      
      // After one player bids
      bidCollector.collectBid('player1', 3);
      bidUI.render(container);
      
      expect(container.innerHTML).not.toContain('Alice');
      expect(container.innerHTML).toContain('Bob');
    });

    test('should show completion message when all bids collected', () => {
      bidCollector.collectBid('player1', 2);
      bidCollector.collectBid('player2', 1);
      bidUI.render(container);
      
      expect(container.innerHTML).toContain('✓ All bids collected!');
    });
  });

  describe('Bid Input Interface', () => {
    test('should provide input fields for players who haven\'t bid', () => {
      bidUI.render(container);
      
      const input1 = container.querySelector('#bid-player1');
      const input2 = container.querySelector('#bid-player2');
      
      expect(input1).toBeTruthy();
      expect(input2).toBeTruthy();
      expect(input1.getAttribute('max')).toBe('4');
    });

    test('should display submitted bids instead of input fields', () => {
      bidCollector.collectBid('player1', 3);
      bidUI.render(container);
      
      expect(container.querySelector('#bid-player1')).toBeFalsy();
      expect(container.innerHTML).toContain('3'); // Shows the bid value
    });
  });

  describe('Proceed Button', () => {
    test('should disable proceed button until all bids collected', () => {
      bidUI.render(container);
      
      const proceedBtn = container.querySelector('#proceed-btn');
      expect(proceedBtn.disabled).toBe(true);
      
      // After all bids collected
      bidCollector.collectBid('player1', 2);
      bidCollector.collectBid('player2', 1);
      bidUI.render(container);
      
      const proceedBtn2 = container.querySelector('#proceed-btn');
      expect(proceedBtn2.disabled).toBe(false);
    });
  });

  describe('Bid Submission', () => {
    test('should handle valid bid submission', () => {
      bidUI.render(container);
      
      const input = container.querySelector('#bid-player1');
      input.value = '3';
      
      bidUI.submitBid('player1');
      
      expect(bidCollector.getPlayerBid('player1')).toBe(3);
    });

    test('should show error for invalid bids', () => {
      bidUI.render(container);
      
      const input = container.querySelector('#bid-player1');
      input.value = '6'; // Exceeds max of 4
      
      bidUI.submitBid('player1');
      
      // Should show error message
      setTimeout(() => {
        expect(container.innerHTML).toContain('Bid must be between 0 and 4');
      }, 10);
    });

    test('should show error for non-numeric input', () => {
      bidUI.render(container);
      
      const input = container.querySelector('#bid-player1');
      input.value = 'abc';
      
      bidUI.submitBid('player1');
      
      setTimeout(() => {
        expect(container.innerHTML).toContain('Please enter a valid number');
      }, 10);
    });
  });
});