import { useState, useCallback } from 'react';

const useGameState = (initialPlayers = []) => {
  const [players] = useState(initialPlayers);
  const [currentRound, setCurrentRound] = useState(1);
  const [roundHistory, setRoundHistory] = useState([]);
  const [gameComplete, setGameComplete] = useState(false);

  const addRoundScore = useCallback((roundScores) => {
    if (currentRound > 10) {
      console.warn('Game is already complete');
      return;
    }

    setRoundHistory(prev => [...prev, roundScores]);
    
    if (currentRound === 10) {
      setGameComplete(true);
    } else {
      setCurrentRound(prev => prev + 1);
    }
  }, [currentRound]);

  const resetGame = useCallback(() => {
    setCurrentRound(1);
    setRoundHistory([]);
    setGameComplete(false);
  }, []);

  const getTotalScore = useCallback((playerId) => {
    return roundHistory.reduce((sum, round) => {
      return sum + (round[playerId] || 0);
    }, 0);
  }, [roundHistory]);

  const getPlayerRankings = useCallback(() => {
    const playersWithScores = players.map(player => ({
      ...player,
      totalScore: getTotalScore(player.id)
    }));
    
    return playersWithScores.sort((a, b) => b.totalScore - a.totalScore);
  }, [players, getTotalScore]);

  return {
    players,
    currentRound,
    roundHistory,
    gameComplete,
    addRoundScore,
    resetGame,
    getTotalScore,
    getPlayerRankings
  };
};

export default useGameState;