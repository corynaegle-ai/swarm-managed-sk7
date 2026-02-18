const { calculateRoundScores } = require('../js/scoring');

describe('Skull King Scoring Engine', () => {
  const mockPlayers = [
    { id: 'player1', bid: 2, totalScore: 0 },
    { id: 'player2', bid: 0, totalScore: 10 },
    { id: 'player3', bid: 3, totalScore: 20 }
  ];
  
  test('correct bid scoring: +20 points per trick when bid met exactly', () => {
    const tricksData = { player1: 2, player2: 0, player3: 3 };
    const bonusData = { player1: 0, player2: 0, player3: 0 };
    
    const result = calculateRoundScores(mockPlayers, 3, tricksData, bonusData);
    
    expect(result[0].roundScore).toBe(40); // 2 tricks × 20 points
    expect(result[2].roundScore).toBe(60); // 3 tricks × 20 points
  });
  
  test('incorrect bid scoring: -10 points per trick difference', () => {
    const tricksData = { player1: 1, player2: 1, player3: 1 };
    const bonusData = { player1: 0, player2: 0, player3: 0 };
    
    const result = calculateRoundScores(mockPlayers, 3, tricksData, bonusData);
    
    expect(result[0].roundScore).toBe(-10); // |2-1| = 1 × -10
    expect(result[2].roundScore).toBe(-20); // |3-1| = 2 × -10
  });
  
  test('zero bid successful: +10 × round number', () => {
    const tricksData = { player1: 2, player2: 0, player3: 3 };
    const bonusData = { player1: 0, player2: 0, player3: 0 };
    
    const result = calculateRoundScores(mockPlayers, 5, tricksData, bonusData);
    
    expect(result[1].roundScore).toBe(50); // 10 × 5
  });
  
  test('zero bid failed: -10 × round number', () => {
    const tricksData = { player1: 2, player2: 1, player3: 3 };
    const bonusData = { player1: 0, player2: 0, player3: 0 };
    
    const result = calculateRoundScores(mockPlayers, 4, tricksData, bonusData);
    
    expect(result[1].roundScore).toBe(-40); // -10 × 4
  });
  
  test('bonus points only applied when bid met exactly', () => {
    const tricksData = { player1: 2, player2: 0, player3: 2 };
    const bonusData = { player1: 15, player2: 10, player3: 20 };
    
    const result = calculateRoundScores(mockPlayers, 3, tricksData, bonusData);
    
    expect(result[0].roundScore).toBe(55); // 40 + 15 bonus
    expect(result[1].roundScore).toBe(40); // 30 + 10 bonus
    expect(result[2].roundScore).toBe(-10); // -10, no bonus (bid not met)
  });
  
  test('total scores updated correctly', () => {
    const tricksData = { player1: 2, player2: 0, player3: 3 };
    const bonusData = { player1: 0, player2: 0, player3: 0 };
    
    const result = calculateRoundScores(mockPlayers, 2, tricksData, bonusData);
    
    expect(result[0].totalScore).toBe(40); // 0 + 40
    expect(result[1].totalScore).toBe(30); // 10 + 20
    expect(result[2].totalScore).toBe(80); // 20 + 60
  });
});