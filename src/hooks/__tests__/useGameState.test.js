import { renderHook, act } from '@testing-library/react';
import useGameState from '../useGameState';

const mockPlayers = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' }
];

describe('useGameState', () => {
  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useGameState(mockPlayers));
    
    expect(result.current.currentRound).toBe(1);
    expect(result.current.roundHistory).toEqual([]);
    expect(result.current.gameComplete).toBe(false);
    expect(result.current.players).toEqual(mockPlayers);
  });

  it('adds round scores and advances to next round', () => {
    const { result } = renderHook(() => useGameState(mockPlayers));
    
    act(() => {
      result.current.addRoundScore({ '1': 50, '2': 30 });
    });
    
    expect(result.current.currentRound).toBe(2);
    expect(result.current.roundHistory).toEqual([{ '1': 50, '2': 30 }]);
    expect(result.current.gameComplete).toBe(false);
  });

  it('completes game after round 10', () => {
    const { result } = renderHook(() => useGameState(mockPlayers));
    
    // Add 10 rounds
    act(() => {
      for (let i = 1; i <= 10; i++) {
        result.current.addRoundScore({ '1': 10 * i, '2': 5 * i });
      }
    });
    
    expect(result.current.currentRound).toBe(10);
    expect(result.current.gameComplete).toBe(true);
    expect(result.current.roundHistory).toHaveLength(10);
  });

  it('calculates total scores correctly', () => {
    const { result } = renderHook(() => useGameState(mockPlayers));
    
    act(() => {
      result.current.addRoundScore({ '1': 50, '2': 30 });
      result.current.addRoundScore({ '1': 40, '2': 60 });
    });
    
    expect(result.current.getTotalScore('1')).toBe(90);
    expect(result.current.getTotalScore('2')).toBe(90);
  });

  it('resets game state', () => {
    const { result } = renderHook(() => useGameState(mockPlayers));
    
    act(() => {
      result.current.addRoundScore({ '1': 50, '2': 30 });
      result.current.resetGame();
    });
    
    expect(result.current.currentRound).toBe(1);
    expect(result.current.roundHistory).toEqual([]);
    expect(result.current.gameComplete).toBe(false);
  });
});