import { IPlayerGameStats, IGameData, IAllPlayerGameStats, IGameConfig, IRounds } from './types';

export const comparePlayerStats = (player1Stats: IPlayerGameStats, player2Stats: IPlayerGameStats): -1 | 0 | 1 => {
  if (player1Stats.forfeit) {
    if (player2Stats.forfeit) {
      return 0;
    }
    return 1;
  } else if (player2Stats.forfeit) {
    return -1;
  }
  if (player1Stats.total > player2Stats.total) {
    return -1;
  }
  if (player1Stats.total < player2Stats.total) {
    return 1;
  }
  if (player1Stats.roundsPlayed < player2Stats.roundsPlayed) {
    return -1;
  }
  return 0;
};

export const calculatePlayerStats = (gameData: IGameData) => {
  const playerStats = gameData.rounds.reduce<IAllPlayerGameStats>(
    (acc, round) => {
      Object.entries(round).forEach(([email, roundScore]) => {
        const playerStats = acc[email];
        playerStats.total = playerStats.total + Math.max(roundScore, 0);
        playerStats.remaining = gameData.config.goal - playerStats.total;
        playerStats.roundsPlayed++;
        if (playerStats.remaining !== 0) {
          if (roundScore === -1) {
            playerStats.busts++;
          } else if (roundScore === 0) {
            playerStats.zeroes++;
          }
        }
      });
      return acc;
    },
    gameData.config.players.reduce<IAllPlayerGameStats>((acc, player) => {
      acc[player] = {
        email: player,
        total: 0,
        remaining: gameData.config.goal,
        roundsPlayed: 0,
        ranking: 1,
        busts: 0,
        zeroes: 0,
        forfeit: gameData.config.forfeits?.includes(player),
      };
      return acc;
    }, {}),
  );
  const sortedPlayers = Object.values(playerStats).sort(comparePlayerStats);
  for (let i = 0; i < sortedPlayers.length; i++) {
    if (i > 0 && comparePlayerStats(sortedPlayers[i - 1], sortedPlayers[i]) === 0) {
      sortedPlayers[i].ranking = sortedPlayers[i - 1].ranking;
    } else {
      sortedPlayers[i].ranking = i + 1;
    }
  }
  gameData.playerStats = playerStats;
};

export const buildGameData = (config: IGameConfig, rounds: IRounds): IGameData => {
  const gameData: IGameData = { config, rounds, playerStats: {} };
  calculatePlayerStats(gameData);
  if (
    Object.values(gameData.playerStats).find((stats) => stats.remaining > 0) &&
    !Object.values(gameData.playerStats).find(
      (stats) => !stats.forfeit && stats.remaining > 0 && stats.roundsPlayed < gameData.rounds.length,
    )
  ) {
    gameData.rounds.push({});
  }
  return gameData;
};
