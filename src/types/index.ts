export type GameId =
  | 'snake'
  | 'sudoku'
  | 'tictactoe'
  | 'memory'
  | 'minesweeper'
  | 'hangman'
  | 'wordsearch';

export type GameDifficulty = 'easy' | 'medium' | 'hard';
export type GameStatus = 'idle' | 'playing' | 'paused' | 'won' | 'lost';

export interface GameScore {
  id: string;
  gameId: GameId;
  score: number;
  date: string;
  difficulty?: GameDifficulty;
  extra?: Record<string, unknown>;
}

export interface GameMeta {
  id: GameId;
  title: string;
  description: string;
  emoji: string;
  color: string;
  colorGlow: string;
  tags: string[];
  difficulty: GameDifficulty[];
  path: string;
  comingSoon?: boolean;
}
