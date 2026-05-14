import { useState, useCallback } from 'react';
import { addScore, getBestScore } from '../services/scoreService';
import type { GameId } from '../types';

export function useGameScore(gameId: GameId) {
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => getBestScore(gameId));

  const increment = useCallback((points = 1) => {
    setScore((prev) => prev + points);
  }, []);

  const reset = useCallback(() => {
    setScore(0);
  }, []);

  const save = useCallback(
    (finalScore?: number) => {
      const value = finalScore ?? score;
      if (value > 0) {
        addScore({ gameId, score: value });
        setBest((prev) => Math.max(prev, value));
      }
    },
    [gameId, score]
  );

  return { score, best, setScore, increment, reset, save };
}
