import GameFlowManager from '../GameFlowManager';

describe('GameFlowManager', () => {
  let gameFlow;
  const mockPlayers = [
    { id: 'player1', name: 'Alice' },
    { id: 'player2', name: 'Bob' },
    { id: 'player3', name: 'Charlie' }
  ];

  beforeEach(() => {
    gameFlow = new GameFlowManager();
  });

  describe('Game Initialization', () => {
    test('should start with setup phase', () => {
      const state = gameFlow.getGameState();
      expect(state.phase).toBe('setup');
      expect(state.currentRound).toBe(1);
      expect(state.isGameActive).toBe(false);
    });

    test('should start game with valid players', () => {
      gameFlow.startGame(mockPlayers);
      const state = gameFlow.getGameState();
      
      expect(state.isGameActive).toBe(true);
      expect(state.phase).toBe('bidding');
      expect(state.players).toEqual(mockPlayers);
      expect(Object.keys(state.scores)).toHaveLength(3);
    });

    test('should throw error with insufficient players', () => {
      expect(() => {
        gameFlow.startGame([{ id: 'player1', name: 'Alice' }]);
      }).toThrow('At least 2 players required');
    });
  });

  describe('Phase Transitions', () => {
    beforeEach(() => {
      gameFlow.startGame(mockPlayers);
    });

    test('should transition from bidding to scoring', () => {
      expect(gameFlow.getGameState().phase).toBe('bidding');
      
      gameFlow.nextPhase();
      expect(gameFlow.getGameState().phase).toBe('scoring');
    });

    test('should complete round and progress to next', () => {
      gameFlow.nextPhase(); // bidding -> scoring
      
      const initialRound = gameFlow.getGameState().currentRound;
      gameFlow.nextPhase(); // scoring -> next round
      
      const newState = gameFlow.getGameState();
      expect(newState.currentRound).toBe(initialRound + 1);
      expect(newState.phase).toBe('bidding');
    });

    test('should emit phase change events', (done) => {
      gameFlow.on('phaseChanged', (data) => {
        expect(data.phase).toBe('scoring');
        expect(data.round).toBe(1);
        done();
      });
      
      gameFlow.nextPhase();
    });
  });

  describe('Round Progression', () => {
    beforeEach(() => {
      gameFlow.startGame(mockPlayers);
    });

    test('should progress through 10 rounds', () => {
      for (let round = 1; round <= 10; round++) {
        expect(gameFlow.getGameState().currentRound).toBe(round);
        
        if (round < 10) {
          gameFlow.nextPhase(); // bidding -> scoring
          gameFlow.nextPhase(); // scoring -> next round
        }
      }
    });

    test('should complete game after 10 rounds', () => {
      // Progress through 9 rounds
      for (let round = 1; round < 10; round++) {
        gameFlow.nextPhase(); // bidding -> scoring
        gameFlow.nextPhase(); // scoring -> next round
      }
      
      // Complete final round
      gameFlow.nextPhase(); // bidding -> scoring
      gameFlow.nextPhase(); // scoring -> completed
      
      const state = gameFlow.getGameState();
      expect(state.phase).toBe('completed');
      expect(state.isGameCompleted).toBe(true);
      expect(state.isGameActive).toBe(false);
    });
  });

  describe('Score Management', () => {
    beforeEach(() => {
      gameFlow.startGame(mockPlayers);
    });

    test('should update scores correctly', () => {
      const roundScores = {
        'player1': 10,
        'player2': 5,
        'player3': 8
      };
      
      gameFlow.updateScores(roundScores);
      const state = gameFlow.getGameState();
      
      expect(state.scores['player1']).toBe(10);
      expect(state.scores['player2']).toBe(5);
      expect(state.scores['player3']).toBe(8);
    });

    test('should accumulate scores across rounds', () => {
      gameFlow.updateScores({ 'player1': 10 });
      gameFlow.updateScores({ 'player1': 5 });
      
      expect(gameFlow.getGameState().scores['player1']).toBe(15);
    });

    test('should emit score update events', (done) => {
      const roundScores = { 'player1': 10 };
      
      gameFlow.on('scoresUpdated', (data) => {
        expect(data.roundScores).toEqual(roundScores);
        expect(data.totalScores['player1']).toBe(10);
        done();
      });
      
      gameFlow.updateScores(roundScores);
    });
  });

  describe('Game Completion', () => {
    test('should emit game completed event', (done) => {
      gameFlow.startGame(mockPlayers);
      
      gameFlow.on('gameCompleted', (data) => {
        expect(data.finalScores).toBeDefined();
        expect(data.winner).toBeDefined();
        expect(data.totalRounds).toBe(10);
        done();
      });
      
      // Fast-forward to game completion
      for (let round = 1; round <= 10; round++) {
        gameFlow.nextPhase(); // bidding -> scoring
        gameFlow.nextPhase(); // scoring -> next round or completed
      }
    });

    test('should determine winner correctly', () => {
      gameFlow.startGame(mockPlayers);
      gameFlow.updateScores({
        'player1': 100,
        'player2': 50,
        'player3': 75
      });
      
      const winner = gameFlow.determineWinner(gameFlow.getGameState().scores);
      expect(winner.winner.playerId).toBe('player1');
      expect(winner.winner.score).toBe(100);
      expect(winner.rankings).toHaveLength(3);
    });
  });

  describe('New Game', () => {
    test('should reset and start new game', () => {
      gameFlow.startGame(mockPlayers);
      gameFlow.updateScores({ 'player1': 50 });
      
      gameFlow.startNewGame(mockPlayers);
      
      const state = gameFlow.getGameState();
      expect(state.phase).toBe('bidding');
      expect(state.currentRound).toBe(1);
      expect(state.scores['player1']).toBe(0);
      expect(state.isGameActive).toBe(true);
      expect(state.isGameCompleted).toBe(false);
    });
  });
});