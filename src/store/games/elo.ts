import { IGameData } from './types';

export const DEFAULT_ELO = 1500;
export const DEFAULT_K_FACTOR = 10;

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
  kFactor: number,
): number => {
  const expectedScore = calculateExpectedScore(playerElo, opponentElo);
  const actualScore = calculateScore(playerRanking, opponentRanking);
  return kFactor * (actualScore - expectedScore);
};

export const calculateGameElos = (
  game: IGameData,
  playerElos: Record<string, number>,
  kFactor: number = DEFAULT_K_FACTOR,
) => {
  const eloChange: Record<string, number> = {};
  game.config.players.forEach((email) => {
    eloChange[email] = 0;
    if (!playerElos[email]) {
      playerElos[email] = DEFAULT_ELO;
    }
  });
  const eloChangeHistory: Record<string, { opponentEmail: string; change: number }[]> = {};
  game.config.players.forEach((email) => {
    game.config.players.forEach((opponentEmail) => {
      if (email === opponentEmail) {
        return;
      }

      if (!game.playerStats[email].forfeit || !game.playerStats[opponentEmail].forfeit) {
        const change = calculateEloChange(
          playerElos[email],
          playerElos[opponentEmail],
          game.playerStats[email].ranking,
          game.playerStats[opponentEmail].ranking,
          kFactor,
        );
        eloChange[email] += change;
        if (!eloChangeHistory[email]) {
          eloChangeHistory[email] = [];
        }
        eloChangeHistory[email].push({ opponentEmail, change });
      }
    });
  });
  Object.entries(eloChange).forEach(([email, change]) => {
    playerElos[email] += change;
  });
  return eloChangeHistory;
};
