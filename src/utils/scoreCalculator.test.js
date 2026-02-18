import { calculatePlayerScore, calculateRoundScores, validateTricksTotal, getScoringRules } from './scoreCalculator';

describe('scoreCalculator', () => {
  describe('calculatePlayerScore', () => {
    it('should calculate correct score for met bid', () => {
      const result = calculatePlayerScore(3, 3, 10, 5);
      expect(result.roundScore).toBe(70); // 20 * 3 + 10 bonus
      expect(result.bonusPoints).toBe(10);
      expect(result.bidMet).toBe(true);
    });

    it('should calculate correct score for missed bid (under)', () => {
      const result = calculatePlayerScore(4, 2, 10, 5);
      expect(result.roundScore).toBe(-20); // -10 * 2 misses
      expect(result.bonusPoints).toBe(0); // No bonus when bid missed
      expect(result.bidMet).toBe(false);
    });

    it('should calculate correct score for missed bid (over)', () => {
      const result = calculatePlayerScore(2, 5, 5, 5);
      expect(result.roundScore).toBe(-30); // -10 * 3 misses
      expect(result.bonusPoints).toBe(0);
      expect(result.bidMet).toBe(false);
    });

    it('should calculate correct score for successful zero bid', () => {
      const result = calculatePlayerScore(0, 0, 0, 3);
      expect(result.roundScore).toBe(30); // 10 * 3 (round number)
      expect(result.bonusPoints).toBe(0);
      expect(result.bidMet).toBe(true);
    });

    it('should calculate correct score for failed zero bid', () => {
      const result = calculatePlayerScore(0, 1, 0, 4);
      expect(result.roundScore).toBe(-40); // -10 * 4 (round number)
      expect(result.bonusPoints).toBe(0);
      expect(result.bidMet).toBe(false);
    });

    it('should not apply bonus points for zero bids', () => {
      const result = calculatePlayerScore(0, 0, 20, 2);
      expect(result.roundScore).toBe(20); // 10 * 2, no bonus
      expect(result.bonusPoints).toBe(0);
    });

    it('should throw error for invalid inputs', () => {
      expect(() => calculatePlayerScore('invalid', 1, 0, 1)).toThrow();
      expect(() => calculatePlayerScore(-1, 1, 0, 1)).toThrow();
      expect(() => calculatePlayerScore(1, 1, 0, 0)).toThrow();
    });
  });

  describe('calculateRoundScores', () => {
    const players = [
      { id: 'p1', name: 'Player 1' },
      { id: 'p2', name: 'Player 2' }
    ];
    const bids = { p1: 2, p2: 0 };
    const tricksData = {
      p1: { tricksTaken: '2', bonusPoints: '10' },
      p2: { tricksTaken: '0', bonusPoints: '0' }
    };

    it('should calculate scores for all players', () => {
      const results = calculateRoundScores(players, bids, tricksData, 2);
      
      expect(results.p1.roundScore).toBe(50); // 20 * 2 + 10 bonus
      expect(results.p1.bidMet).toBe(true);
      
      expect(results.p2.roundScore).toBe(20); // 10 * 2 (successful zero bid)
      expect(results.p2.bidMet).toBe(true);
    });
  });

  describe('validateTricksTotal', () => {
    it('should validate correct tricks total', () => {
      const tricksData = {
        p1: { tricksTaken: '2' },
        p2: { tricksTaken: '1' }
      };
      const result = validateTricksTotal(tricksData, 3);
      expect(result.isValid).toBe(true);
    });

    it('should detect too few tricks', () => {
      const tricksData = {
        p1: { tricksTaken: '1' },
        p2: { tricksTaken: '1' }
      };
      const result = validateTricksTotal(tricksData, 4);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('2 tricks unaccounted');
    });

    it('should detect too many tricks', () => {
      const tricksData = {
        p1: { tricksTaken: '3' },
        p2: { tricksTaken: '2' }
      };
      const result = validateTricksTotal(tricksData, 4);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('exceeds round number');
    });
  });

  describe('getScoringRules', () => {
    it('should return scoring rules object', () => {
      const rules = getScoringRules();
      expect(rules.regular).toBeDefined();
      expect(rules.zeroBid).toBeDefined();
      expect(rules.regular.bidMet).toContain('+20');
      expect(rules.zeroBid.success).toContain('+10');
    });
  });
});