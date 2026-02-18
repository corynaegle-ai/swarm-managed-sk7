import React from 'react';
import { render, screen } from '@testing-library/react';
import ScoreDisplay from '../ScoreDisplay';

const mockPlayers = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' }
];

const mockRoundHistory = [
  { '1': 50, '2': 30, '3': 70 },
  { '1': 40, '2': 60, '3': 20 }
];

describe('ScoreDisplay', () => {
  it('displays current total scores for all players', () => {
    render(
      <ScoreDisplay 
        players={mockPlayers}
        currentRound={3}
        roundHistory={mockRoundHistory}
        gameComplete={false}
      />
    );
    
    expect(screen.getByText('90 pts')).toBeInTheDocument(); // Alice total
    expect(screen.getByText('90 pts')).toBeInTheDocument(); // Bob total
    expect(screen.getByText('90 pts')).toBeInTheDocument(); // Charlie total
  });

  it('shows scores sorted by ranking', () => {
    render(
      <ScoreDisplay 
        players={mockPlayers}
        currentRound={3}
        roundHistory={mockRoundHistory}
        gameComplete={false}
      />
    );
    
    const rankings = screen.getAllByText(/#\d/);
    expect(rankings[0]).toHaveTextContent('#1');
    expect(rankings[1]).toHaveTextContent('#2');
    expect(rankings[2]).toHaveTextContent('#3');
  });

  it('indicates current round progress', () => {
    render(
      <ScoreDisplay 
        players={mockPlayers}
        currentRound={5}
        roundHistory={mockRoundHistory}
        gameComplete={false}
      />
    );
    
    expect(screen.getByText('Round 5 of 10')).toBeInTheDocument();
  });

  it('shows round-by-round score history', () => {
    render(
      <ScoreDisplay 
        players={mockPlayers}
        currentRound={3}
        roundHistory={mockRoundHistory}
        gameComplete={false}
      />
    );
    
    expect(screen.getByText('Round-by-Round Breakdown')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument(); // Alice round 1
    expect(screen.getByText('60')).toBeInTheDocument(); // Bob round 2
  });

  it('shows final results after game completion', () => {
    render(
      <ScoreDisplay 
        players={mockPlayers}
        currentRound={10}
        roundHistory={mockRoundHistory}
        gameComplete={true}
      />
    );
    
    expect(screen.getByText('Final Results')).toBeInTheDocument();
  });
});