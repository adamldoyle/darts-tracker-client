import { IGame } from './types';

const DEFAULT_ELO = 1500;
const K_FACTOR = 10;

const calculateExpectedScore = (playerElo: number, opponentElo: number): number => {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
};

const calculateScore = (playerRanking: number, opponentRanking: number): number => {
  if (playerRanking === opponentRanking) {
    return 0.5;
  }
  return playerRanking < opponentRanking ? 1 : 0;
};

const calculateEloChange = (
  playerElo: number,
  opponentElo: number,
  playerRanking: number,
  opponentRanking: number,
): number => {
  const expectedScore = calculateExpectedScore(playerElo, opponentElo);
  const actualScore = calculateScore(playerRanking, opponentRanking);
  return K_FACTOR * (actualScore - expectedScore);
};

export const calculateGameElos = (game: IGame, playerElos: Record<string, number>) => {
  const eloChange: Record<string, number> = {};
  game.data.config.players.forEach((email) => {
    eloChange[email] = 0;
    if (!playerElos[email]) {
      playerElos[email] = DEFAULT_ELO;
    }
  });
  game.data.config.players.forEach((email) => {
    game.data.config.players.forEach((opponentEmail) => {
      if (email === opponentEmail) {
        return;
      }

      eloChange[email] += calculateEloChange(
        playerElos[email],
        playerElos[opponentEmail],
        game.data.playerStats[email].ranking,
        game.data.playerStats[opponentEmail].ranking,
      );
    });
  });
  Object.entries(eloChange).forEach(([email, change]) => {
    playerElos[email] += change;
  });
};
