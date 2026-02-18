import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayerSetup from './PlayerSetup';

describe('PlayerSetup', () => {
  const mockOnGameStart = jest.fn();

  beforeEach(() => {
    mockOnGameStart.mockClear();
  });

  test('renders player setup interface', () => {
    render(<PlayerSetup onGameStart={mockOnGameStart} />);
    expect(screen.getByText('Player Setup')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter player name')).toBeInTheDocument();
    expect(screen.getByText('Add Player')).toBeInTheDocument();
  });

  test('can add players one at a time', async () => {
    render(<PlayerSetup onGameStart={mockOnGameStart} />);
    
    const input = screen.getByPlaceholderText('Enter player name');
    const addButton = screen.getByText('Add Player');

    fireEvent.change(input, { target: { value: 'Player 1' } });
    fireEvent.click(addButton);

    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('Players: 1 / 8')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'Player 2' } });
    fireEvent.click(addButton);

    expect(screen.getByText('Player 2')).toBeInTheDocument();
    expect(screen.getByText('Players: 2 / 8')).toBeInTheDocument();
  });

  test('prevents duplicate names', async () => {
    render(<PlayerSetup onGameStart={mockOnGameStart} />);
    
    const input = screen.getByPlaceholderText('Enter player name');
    const addButton = screen.getByText('Add Player');

    fireEvent.change(input, { target: { value: 'Player 1' } });
    fireEvent.click(addButton);

    fireEvent.change(input, { target: { value: 'Player 1' } });
    fireEvent.click(addButton);

    expect(screen.getByText('Player name must be unique')).toBeInTheDocument();
    expect(screen.getAllByText('Player 1')).toHaveLength(1);
  });

  test('prevents duplicate names case insensitive', async () => {
    render(<PlayerSetup onGameStart={mockOnGameStart} />);
    
    const input = screen.getByPlaceholderText('Enter player name');
    const addButton = screen.getByText('Add Player');

    fireEvent.change(input, { target: { value: 'Player 1' } });
    fireEvent.click(addButton);

    fireEvent.change(input, { target: { value: 'player 1' } });
    fireEvent.click(addButton);

    expect(screen.getByText('Player name must be unique')).toBeInTheDocument();
  });

  test('enforces minimum 2 players', async () => {
    render(<PlayerSetup onGameStart={mockOnGameStart} />);
    
    const startButton = screen.getByText(/Start Game/);
    expect(startButton).toBeDisabled();

    const input = screen.getByPlaceholderText('Enter player name');
    const addButton = screen.getByText('Add Player');

    fireEvent.change(input, { target: { value: 'Player 1' } });
    fireEvent.click(addButton);

    expect(startButton).toBeDisabled();

    fireEvent.change(input, { target: { value: 'Player 2' } });
    fireEvent.click(addButton);

    expect(startButton).not.toBeDisabled();
  });

  test('enforces maximum 8 players', async () => {
    render(<PlayerSetup onGameStart={mockOnGameStart} />);
    
    const input = screen.getByPlaceholderText('Enter player name');
    const addButton = screen.getByText('Add Player');

    // Add 8 players
    for (let i = 1; i <= 8; i++) {
      fireEvent.change(input, { target: { value: `Player ${i}` } });
      fireEvent.click(addButton);
    }

    expect(screen.getByText('Players: 8 / 8')).toBeInTheDocument();
    expect(addButton).toBeDisabled();
    expect(input).toBeDisabled();

    // Try to add 9th player
    fireEvent.change(input, { target: { value: 'Player 9' } });
    fireEvent.click(addButton);

    expect(screen.getByText('Maximum 8 players allowed')).toBeInTheDocument();
  });

  test('can edit player names', async () => {
    render(<PlayerSetup onGameStart={mockOnGameStart} />);
    
    const input = screen.getByPlaceholderText('Enter player name');
    const addButton = screen.getByText('Add Player');

    fireEvent.change(input, { target: { value: 'Player 1' } });
    fireEvent.click(addButton);

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    const editInput = screen.getByDisplayValue('Player 1');
    fireEvent.change(editInput, { target: { value: 'Edited Player' } });
    
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(screen.getByText('Edited Player')).toBeInTheDocument();
    expect(screen.queryByText('Player 1')).not.toBeInTheDocument();
  });

  test('can remove players', async () => {
    render(<PlayerSetup onGameStart={mockOnGameStart} />);
    
    const input = screen.getByPlaceholderText('Enter player name');
    const addButton = screen.getByText('Add Player');

    fireEvent.change(input, { target: { value: 'Player 1' } });
    fireEvent.click(addButton);

    expect(screen.getByText('Player 1')).toBeInTheDocument();

    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);

    expect(screen.queryByText('Player 1')).not.toBeInTheDocument();
    expect(screen.getByText('Players: 0 / 8')).toBeInTheDocument();
  });

  test('prevents editing to duplicate names', async () => {
    render(<PlayerSetup onGameStart={mockOnGameStart} />);
    
    const input = screen.getByPlaceholderText('Enter player name');
    const addButton = screen.getByText('Add Player');

    // Add two players
    fireEvent.change(input, { target: { value: 'Player 1' } });
    fireEvent.click(addButton);
    fireEvent.change(input, { target: { value: 'Player 2' } });
    fireEvent.click(addButton);

    // Edit first player to duplicate second player's name
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    const editInput = screen.getByDisplayValue('Player 1');
    fireEvent.change(editInput, { target: { value: 'Player 2' } });
    
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(screen.getByText('Player name must be unique')).toBeInTheDocument();
  });

  test('starts game with valid player count', async () => {
    render(<PlayerSetup onGameStart={mockOnGameStart} />);
    
    const input = screen.getByPlaceholderText('Enter player name');
    const addButton = screen.getByText('Add Player');

    // Add 3 players
    fireEvent.change(input, { target: { value: 'Player 1' } });
    fireEvent.click(addButton);
    fireEvent.change(input, { target: { value: 'Player 2' } });
    fireEvent.click(addButton);
    fireEvent.change(input, { target: { value: 'Player 3' } });
    fireEvent.click(addButton);

    const startButton = screen.getByText('Start Game (3 players)');
    fireEvent.click(startButton);

    expect(mockOnGameStart).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'Player 1' }),
      expect.objectContaining({ name: 'Player 2' }),
      expect.objectContaining({ name: 'Player 3' })
    ]);
  });

  test('validates empty player names', async () => {
    render(<PlayerSetup onGameStart={mockOnGameStart} />);
    
    const addButton = screen.getByText('Add Player');
    fireEvent.click(addButton);

    expect(screen.getByText('Player name cannot be empty')).toBeInTheDocument();
  });

  test('trims whitespace from player names', async () => {
    render(<PlayerSetup onGameStart={mockOnGameStart} />);
    
    const input = screen.getByPlaceholderText('Enter player name');
    const addButton = screen.getByText('Add Player');

    fireEvent.change(input, { target: { value: '  Player 1  ' } });
    fireEvent.click(addButton);

    expect(screen.getByText('Player 1')).toBeInTheDocument();
  });
});