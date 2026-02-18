import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ScoreEntry from './ScoreEntry';

describe('ScoreEntry Component', () => {
  const mockPlayers = [
    { id: 'p1', name: 'Alice' },
    { id: 'p2', name: 'Bob' }
  ];
  
  const mockBids = { p1: 2, p2: 1 };
  const mockOnScoreSubmit = jest.fn();

  beforeEach(() => {
    mockOnScoreSubmit.mockClear();
  });

  it('renders score entry form correctly', () => {
    render(
      <ScoreEntry 
        players={mockPlayers} 
        round={3} 
        bids={mockBids} 
        onScoreSubmit={mockOnScoreSubmit} 
      />
    );

    expect(screen.getByText('Round 3 - Score Entry')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Alice's bid
    expect(screen.getByText('1')).toBeInTheDocument(); // Bob's bid
  });

  it('allows entering tricks and bonus points', () => {
    render(
      <ScoreEntry 
        players={mockPlayers} 
        round={3} 
        bids={mockBids} 
        onScoreSubmit={mockOnScoreSubmit} 
      />
    );

    const tricksInputs = screen.getAllByRole('spinbutton');
    const aliceTricks = tricksInputs[0];
    const aliceBonus = tricksInputs[1];

    fireEvent.change(aliceTricks, { target: { value: '2' } });
    fireEvent.change(aliceBonus, { target: { value: '10' } });

    expect(aliceTricks.value).toBe('2');
    expect(aliceBonus.value).toBe('10');
  });

  it('disables calculate button when fields are empty', () => {
    render(
      <ScoreEntry 
        players={mockPlayers} 
        round={3} 
        bids={mockBids} 
        onScoreSubmit={mockOnScoreSubmit} 
      />
    );

    const calculateButton = screen.getByText('Calculate Scores');
    expect(calculateButton).toBeDisabled();
  });

  it('enables calculate button when all fields are filled', () => {
    render(
      <ScoreEntry 
        players={mockPlayers} 
        round={3} 
        bids={mockBids} 
        onScoreSubmit={mockOnScoreSubmit} 
      />
    );

    const tricksInputs = screen.getAllByRole('spinbutton');
    
    // Fill all fields
    fireEvent.change(tricksInputs[0], { target: { value: '2' } }); // Alice tricks
    fireEvent.change(tricksInputs[1], { target: { value: '10' } }); // Alice bonus
    fireEvent.change(tricksInputs[2], { target: { value: '1' } }); // Bob tricks  
    fireEvent.change(tricksInputs[3], { target: { value: '0' } }); // Bob bonus

    const calculateButton = screen.getByText('Calculate Scores');
    expect(calculateButton).not.toBeDisabled();
  });

  it('calculates and displays scores correctly', async () => {
    render(
      <ScoreEntry 
        players={mockPlayers} 
        round={3} 
        bids={mockBids} 
        onScoreSubmit={mockOnScoreSubmit} 
      />
    );

    const tricksInputs = screen.getAllByRole('spinbutton');
    
    // Alice bids 2, takes 2, gets 10 bonus: should get 20*2 + 10 = 50
    fireEvent.change(tricksInputs[0], { target: { value: '2' } });
    fireEvent.change(tricksInputs[1], { target: { value: '10' } });
    
    // Bob bids 1, takes 0, gets 0 bonus: should get -10*1 = -10
    fireEvent.change(tricksInputs[2], { target: { value: '0' } });
    fireEvent.change(tricksInputs[3], { target: { value: '0' } });

    const calculateButton = screen.getByText('Calculate Scores');
    fireEvent.click(calculateButton);

    await waitFor(() => {
      expect(screen.getByText('Round 3 Results')).toBeInTheDocument();
      expect(screen.getByText('+50')).toBeInTheDocument(); // Alice's score
      expect(screen.getByText('-10')).toBeInTheDocument(); // Bob's score
    });
  });

  it('handles zero bid scoring correctly', async () => {
    const zeroBidBids = { p1: 0, p2: 1 };
    
    render(
      <ScoreEntry 
        players={mockPlayers} 
        round={4} 
        bids={zeroBidBids} 
        onScoreSubmit={mockOnScoreSubmit} 
      />
    );

    const tricksInputs = screen.getAllByRole('spinbutton');
    
    // Alice bids 0, takes 0: should get 10*4 = 40
    fireEvent.change(tricksInputs[0], { target: { value: '0' } });
    fireEvent.change(tricksInputs[1], { target: { value: '0' } });
    
    // Bob bids 1, takes 1: should get 20*1 = 20
    fireEvent.change(tricksInputs[2], { target: { value: '1' } });
    fireEvent.change(tricksInputs[3], { target: { value: '0' } });

    const calculateButton = screen.getByText('Calculate Scores');
    fireEvent.click(calculateButton);

    await waitFor(() => {
      expect(screen.getByText('+40')).toBeInTheDocument(); // Alice's zero bid success
      expect(screen.getByText('+20')).toBeInTheDocument(); // Bob's normal success
    });
  });

  it('calls onScoreSubmit when submit button is clicked', async () => {
    render(
      <ScoreEntry 
        players={mockPlayers} 
        round={3} 
        bids={mockBids} 
        onScoreSubmit={mockOnScoreSubmit} 
      />
    );

    const tricksInputs = screen.getAllByRole('spinbutton');
    
    // Fill all fields
    fireEvent.change(tricksInputs[0], { target: { value: '2' } });
    fireEvent.change(tricksInputs[1], { target: { value: '0' } });
    fireEvent.change(tricksInputs[2], { target: { value: '1' } });
    fireEvent.change(tricksInputs[3], { target: { value: '0' } });

    // Calculate scores
    fireEvent.click(screen.getByText('Calculate Scores'));

    await waitFor(() => {
      expect(screen.getByText('Submit Round Scores')).toBeInTheDocument();
    });

    // Submit scores
    fireEvent.click(screen.getByText('Submit Round Scores'));

    expect(mockOnScoreSubmit).toHaveBeenCalledWith(expect.objectContaining({
      p1: expect.objectContaining({
        bid: 2,
        tricksTaken: 2,
        roundScore: 40 // 20 * 2
      }),
      p2: expect.objectContaining({
        bid: 1,
        tricksTaken: 1,
        roundScore: 20 // 20 * 1
      })
    }));
  });

  it('prevents invalid trick values', () => {
    render(
      <ScoreEntry 
        players={mockPlayers} 
        round={3} 
        bids={mockBids} 
        onScoreSubmit={mockOnScoreSubmit} 
      />
    );

    const tricksInput = screen.getAllByRole('spinbutton')[0];
    
    // Try to enter invalid value (negative)
    fireEvent.change(tricksInput, { target: { value: '-1' } });
    expect(tricksInput.value).toBe(''); // Should not accept negative
    
    // Try to enter value higher than round number
    fireEvent.change(tricksInput, { target: { value: '5' } });
    expect(tricksInput.value).toBe(''); // Should not accept > round
  });
});