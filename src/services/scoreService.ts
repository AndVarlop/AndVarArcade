import type { GameId, GameScore } from '../types';

const STORAGE_KEY = 'andvar-arcade-scores';

function loadAll(): GameScore[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as GameScore[];
  } catch {
    return [];
  }
}

function saveAll(scores: GameScore[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
}

export function addScore(entry: Omit<GameScore, 'id' | 'date'>): void {
  const scores = loadAll();
  scores.push({
    ...entry,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
  });
  saveAll(scores);
}

export function getTopScores(gameId: GameId, limit = 5): GameScore[] {
  return loadAll()
    .filter((s) => s.gameId === gameId)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getBestScore(gameId: GameId): number {
  const scores = loadAll().filter((s) => s.gameId === gameId);
  return scores.length ? Math.max(...scores.map((s) => s.score)) : 0;
}

export function clearScores(gameId?: GameId): void {
  if (gameId) {
    saveAll(loadAll().filter((s) => s.gameId !== gameId));
  } else {
    saveAll([]);
  }
}
