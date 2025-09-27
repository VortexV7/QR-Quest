import riddles from "../data/riddles.json";
import puzzles from "../data/puzzles.json";
import games from "../data/games.json";

export function getGameForTeam(teamId) {
  // shuffle riddles + puzzles together
  const combined = [...riddles, ...puzzles];
  const shuffled = combined.sort(() => Math.random() - 0.5);

  // assign random mini-game at the end
  const game = games[Math.floor(Math.random() * games.length)];

  return { sequence: shuffled, finalGame: game };
}

export function getHint(item, step) {
  if (!item.hints || step >= item.hints.length) return "No more hints!";
  return item.hints[step];
}
