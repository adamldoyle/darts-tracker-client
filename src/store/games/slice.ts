import { createSelector } from '@reduxjs/toolkit';
import { API } from 'aws-amplify';
import { IRootState } from 'store/types';
import { createMonitoredSlice } from '@adamldoyle/reduxjs-toolkit-monitored-slice';
import { ILeagueWithMembers } from '../leagues/types';
import { selectEloKFactor, selectSelectedLeague } from '../leagues/slice';
import { IGame, ILeagueGamesState } from './types';
import { formatDivision, formatNumber, formatPercent } from 'shared/utils/numbers';
import { calculateGameElos } from './elo';

const { slice, selectors: baseSelectors, hooks, context } = createMonitoredSlice<
  IRootState,
  IGame[],
  ILeagueGamesState,
  ILeagueWithMembers | null
>(
  {
    name: 'games',
    initialState: {},
    reducers: {},
  },
  [],
  async (selectedLeague) => {
    if (!selectedLeague) {
      return [];
    }

    const { games } = (await API.get('leagues', `/leagues/${selectedLeague.leagueKey}/games`, {})) as {
      games: IGame[];
    };
    games.sort((a, b) => (a.data.config.datePlayed < b.data.config.datePlayed ? 1 : -1));
    return games;
  },
  selectSelectedLeague,
);

const userAverages = (userValues: Record<string, number[]>): Record<string, number> => {
  return Object.entries(userValues).reduce<Record<string, number>>((acc, [email, values]) => {
    acc[email] = formatDivision(
      values.reduce((acc, value) => acc + value, 0),
      values.length,
      1,
    );
    return acc;
  }, {});
};

const mergeUserAverages = (
  numerators: Record<string, number>,
  denominators: Record<string, number>,
): Record<string, number> => {
  return Object.entries(numerators).reduce<Record<string, number>>((acc, [email, numerator]) => {
    acc[email] = formatDivision(numerator, denominators[email], 1);
    return acc;
  }, {});
};

const collectRoundsPlayed = (games: IGame[]) => {
  return games.reduce<Record<string, number[]>>((acc, game) => {
    Object.values(game.data.playerStats).forEach((playerStats) => {
      if (!acc[playerStats.email]) {
        acc[playerStats.email] = [];
      }
      if (playerStats.remaining === 0) {
        acc[playerStats.email].push(playerStats.roundsPlayed);
      }
    });
    return acc;
  }, {});
};

const selectTotalBusts = createSelector(baseSelectors.selectData, (games) => {
  return games.reduce<Record<string, number>>((acc, game) => {
    Object.values(game.data.playerStats).forEach((playerStats) => {
      if (!acc[playerStats.email]) {
        acc[playerStats.email] = 0;
      }
      acc[playerStats.email] += playerStats.busts;
    });
    return acc;
  }, {});
});

const selectTotalGames = createSelector(baseSelectors.selectData, (games) => {
  return games.reduce<Record<string, number>>((acc, game) => {
    Object.values(game.data.playerStats).forEach((playerStats) => {
      if (!acc[playerStats.email]) {
        acc[playerStats.email] = 0;
      }
      if (playerStats.roundsPlayed > 0) {
        acc[playerStats.email]++;
      }
    });
    return acc;
  }, {});
});

const selectScoresToClose = createSelector(baseSelectors.selectData, (games) => {
  const rawScores: Record<string, number> = {};
  return games.reduce<Record<string, number[]>>((acc, game) => {
    game.data.config.players.forEach((email) => {
      if (game.data.playerStats[email].remaining === 0) {
        if (!acc[email]) {
          acc[email] = [];
        }
        rawScores[email] = 0;
      }
    });
    game.data.rounds.forEach((round) => {
      Object.entries(round).forEach(([email, score]) => {
        if (game.data.playerStats[email].remaining === 0) {
          rawScores[email] += Math.max(0, score);
          if (game.data.config.goal === rawScores[email]) {
            acc[email].push(score);
          }
        }
      });
    });
    return acc;
  }, {});
});

const selectRoundScores = createSelector(baseSelectors.selectData, (games) => {
  return games.reduce<Record<string, number[]>>((acc, game) => {
    game.data.rounds.forEach((round) => {
      Object.entries(round).forEach(([email, score]) => {
        if (!acc[email]) {
          acc[email] = [];
        }
        acc[email].push(Math.max(0, score));
      });
    });
    return acc;
  }, {});
});

const selectRoundsPlayed = createSelector(baseSelectors.selectData, (games) => {
  return collectRoundsPlayed(games);
});

const selectAverageRoundsPlayedHistory = createSelector(baseSelectors.selectData, (games) => {
  const gamesByMonth = games.reduce<Record<string, IGame[]>>((acc, game) => {
    const date = new Date(game.data.config.datePlayed);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const key = `${year}-${month}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(game);
    return acc;
  }, {});
  const roundsPlayedByMonth = Object.entries(gamesByMonth).reduce<Record<string, Record<string, number[]>>>(
    (acc, [month, games]) => {
      acc[month] = collectRoundsPlayed(games);
      return acc;
    },
    {},
  );
  const averagesByMonth = Object.entries(roundsPlayedByMonth).reduce<Record<string, Record<string, number>>>(
    (acc, [month, roundsPlayed]) => {
      acc[month] = userAverages(roundsPlayed);
      return acc;
    },
    {},
  );
  return averagesByMonth;
});

const selectTotalWins = createSelector(baseSelectors.selectData, (games) => {
  return games.reduce<Record<string, number>>((acc, game) => {
    Object.values(game.data.playerStats).forEach((playerStats) => {
      if (!acc[playerStats.email]) {
        acc[playerStats.email] = 0;
      }
      if (playerStats.ranking === 1 && playerStats.remaining === 0) {
        acc[playerStats.email]++;
      }
    });
    return acc;
  }, {});
});

const buildEloHistory = (games: IGame[], eloKFactor: number, gameStop?: string) => {
  const sortedGames = [...games].sort((a, b) => (a.data.config.datePlayed < b.data.config.datePlayed ? -1 : 1));
  const filteredGames = gameStop
    ? sortedGames.slice(
        0,
        sortedGames.findIndex((game) => game.gameId === gameStop),
      )
    : sortedGames;
  const masterElo: Record<string, number> = {};
  const allEmails = new Set<string>();
  const eloHistoryLookup = filteredGames.reduce<Record<number, { datePlayed: number; elos: Record<string, number> }>>(
    (acc, game) => {
      calculateGameElos(game.data, masterElo, eloKFactor);
      game.data.config.players.forEach((email) => {
        allEmails.add(email);
      });

      const datePlayed = new Date(game.data.config.datePlayed);
      datePlayed.setHours(0, 0, 0, 0);
      const key = datePlayed.getTime();
      if (!acc[key]) {
        acc[key] = { datePlayed: key, elos: {} };
      }

      allEmails.forEach((email) => {
        acc[key].elos[email] = formatNumber(masterElo[email], 1);
      });

      return acc;
    },
    {},
  );
  const finalElo = Object.entries(masterElo).reduce<Record<string, number>>((acc, [email, elo]) => {
    acc[email] = formatNumber(elo, 1);
    return acc;
  }, {});
  const eloHistory = Object.values(eloHistoryLookup).sort((a, b) => (a.datePlayed < b.datePlayed ? -1 : 1));
  return { finalElo, eloHistory };
};

const selectEloHistory = createSelector(baseSelectors.selectData, selectEloKFactor, (games, eloKFactor) => {
  return buildEloHistory(games, eloKFactor, undefined);
});

const selectFilteredEloHistory = createSelector(
  baseSelectors.selectData,
  selectEloKFactor,
  (state: unknown, gameStop: string) => gameStop,
  (games, eloKFactor, gameStop) => {
    return buildEloHistory(games, eloKFactor, gameStop);
  },
);

const selectAverageBustsRankings = createSelector(selectTotalGames, selectTotalBusts, (totalGames, totalBusts) => {
  const averages = mergeUserAverages(totalBusts, totalGames);
  return Object.entries(averages).sort((a, b) => (a[1] < b[1] ? -1 : 1));
});

const selectAverageClosingScoreRankings = createSelector(selectScoresToClose, (scoresToClose) => {
  const averages = userAverages(scoresToClose);
  return Object.entries(averages).sort((a, b) => (a[1] < b[1] ? 1 : -1));
});

const selectAverageRoundScoreRankings = createSelector(selectRoundScores, (roundScores) => {
  const averages = userAverages(roundScores);
  return Object.entries(averages).sort((a, b) => (a[1] < b[1] ? 1 : -1));
});

const selectAverageRoundsPlayedRankings = createSelector(selectRoundsPlayed, (roundsPlayed) => {
  const averages = userAverages(roundsPlayed);
  return Object.entries(averages).sort((a, b) => (a[1] < b[1] ? -1 : 1));
});

const selectBestRoundRankings = createSelector(selectRoundScores, (roundScores) => {
  const bestRoundScores = Object.entries(roundScores).reduce<Record<string, number>>((acc, [email, roundScores]) => {
    acc[email] = Math.max(...roundScores);
    return acc;
  }, {});
  return Object.entries(bestRoundScores).sort((a, b) => (a[1] < b[1] ? 1 : -1));
});

const selectTopTenRoundRankings = createSelector(baseSelectors.selectData, (games) => {
  const roundScores = games.reduce<[string, number][]>((acc, game) => {
    game.data.rounds.forEach((round) => {
      Object.entries(round).forEach(([email, score]) => {
        acc.push([email, score]);
      });
    });
    return acc;
  }, []);
  const sorted = roundScores.sort((a, b) => (a[1] < b[1] ? 1 : -1));
  return sorted.slice(0, 10);
});

const selectBestScoreToCloseRankings = createSelector(selectScoresToClose, (scoresToClose) => {
  const bestScores = Object.entries(scoresToClose).reduce<Record<string, number>>((acc, [email, roundScores]) => {
    acc[email] = Math.max(...roundScores);
    return acc;
  }, {});
  return Object.entries(bestScores).sort((a, b) => (a[1] < b[1] ? 1 : -1));
});

const selectGamesPlayedRankings = createSelector(selectTotalGames, (totalGames) => {
  return Object.entries(totalGames).sort((a, b) => (a[1] < b[1] ? 1 : -1));
});

const selectRoundsAboveScoreRankings = createSelector(
  [selectRoundScores, (state: unknown, scoreTarget: number) => scoreTarget],
  (roundScores, scoreTarget) => {
    const roundsAbove50 = Object.entries(roundScores).reduce<Record<string, number>>((acc, [email, scores]) => {
      acc[email] = scores.filter((score) => score >= scoreTarget).length;
      return acc;
    }, {});
    return Object.entries(roundsAbove50).sort((a, b) => (a[1] < b[1] ? 1 : -1));
  },
);

const CLOSE_BREAKPOINT = 30;

const selectAverageRoundsToCloseRankings = createSelector(
  baseSelectors.selectData,
  (state: unknown, includeBusts: boolean) => includeBusts,
  (games, includeBusts) => {
    const rawScores: Record<string, number> = {};
    const roundsToFinish = games.reduce<Record<string, number[]>>((acc, game) => {
      game.data.config.players.forEach((email) => {
        if (game.data.playerStats[email].remaining === 0) {
          if (!acc[email]) {
            acc[email] = [];
          }
          acc[email].push(0);
          rawScores[email] = 0;
        }
      });
      game.data.rounds.forEach((round) => {
        Object.entries(round).forEach(([email, score]) => {
          if (game.data.playerStats[email].remaining === 0) {
            if (game.data.config.goal - rawScores[email] <= CLOSE_BREAKPOINT) {
              if (includeBusts || score !== -1) {
                acc[email][acc[email].length - 1]++;
              }
            }
            if (score !== -1) {
              rawScores[email] += score;
            }
          }
        });
      });
      return acc;
    }, {});
    const averages = userAverages(roundsToFinish);
    return Object.entries(averages).sort((a, b) => (a[1] < b[1] ? -1 : 1));
  },
);

const selectTotalWinsRankings = createSelector(selectTotalWins, (totalWins) => {
  return Object.entries(totalWins).sort((a, b) => (a[1] < b[1] ? 1 : -1));
});

const selectWinPercentageRankings = createSelector(selectTotalGames, selectTotalWins, (totalGames, totalWins) => {
  const winPercentages = Object.entries(totalWins).reduce<Record<string, number>>((acc, [email, wins]) => {
    acc[email] = formatPercent(wins, totalGames[email]);
    return acc;
  }, {});
  const rankings = Object.entries(winPercentages).sort((a, b) => (a[1] < b[1] ? 1 : -1));
  return rankings.map(([email, winPercentage]) => [email, `${winPercentage}%`]) as [string, string][];
});

const selectEloRankings = createSelector(selectEloHistory, ({ finalElo }) => {
  return Object.entries(finalElo).sort((a, b) => (a[1] > b[1] ? -1 : 1));
});

const selectHighestBustRankings = createSelector(baseSelectors.selectData, (games) => {
  const highestBusts = games.reduce<Record<string, number>>((acc, game) => {
    const remaining: Record<string, number> = {};
    game.data.config.players.forEach((email) => {
      if (game.data.playerStats[email].remaining === 0) {
        remaining[email] = game.data.config.goal;
      }
      if (!acc[email]) {
        acc[email] = 0;
      }
    });
    game.data.rounds.forEach((round) => {
      Object.entries(round).forEach(([email, score]) => {
        if (game.data.playerStats[email].remaining === 0) {
          if (score === -1) {
            if (remaining[email] > acc[email]) {
              acc[email] = remaining[email];
            }
          } else {
            remaining[email] -= score;
          }
        }
      });
    });
    return acc;
  }, {});
  return Object.entries(highestBusts).sort((a, b) => (a[1] > b[1] ? -1 : 1));
});

const selectCloseLossRankings = createSelector(baseSelectors.selectData, (games) => {
  const closeLosses = games.reduce<Record<string, number>>((acc, game) => {
    const winner = Object.values(game.data.playerStats).find((playerStats) => playerStats.ranking === 1);
    if (!winner) {
      return acc;
    }
    Object.values(game.data.playerStats).forEach((playerStats) => {
      if (!acc[playerStats.email]) {
        acc[playerStats.email] = 0;
      }
      if (playerStats.roundsPlayed === winner.roundsPlayed + 1) {
        acc[playerStats.email]++;
      }
    });
    return acc;
  }, {});
  return Object.entries(closeLosses).sort((a, b) => (a[1] > b[1] ? -1 : 1));
});

const selectAverageRoundsInSingleDigits = createSelector(baseSelectors.selectData, (games) => {
  const rawScores: Record<string, number> = {};
  const roundsInSingleDigits = games.reduce<Record<string, number[]>>((acc, game) => {
    game.data.config.players.forEach((email) => {
      if (game.data.playerStats[email].remaining === 0) {
        if (!acc[email]) {
          acc[email] = [];
        }
        acc[email].push(0);
        rawScores[email] = 0;
      }
    });
    game.data.rounds.forEach((round) => {
      Object.entries(round).forEach(([email, score]) => {
        if (game.data.playerStats[email].remaining === 0) {
          if (game.data.config.goal - rawScores[email] < 10) {
            acc[email][acc[email].length - 1]++;
          }
          if (score !== -1) {
            rawScores[email] += score;
          }
        }
      });
    });
    return acc;
  }, {});
  const averages = userAverages(roundsInSingleDigits);
  return Object.entries(averages).sort((a, b) => (a[1] < b[1] ? -1 : 1));
});

const selectAverageScoreBeforeClosingRangeRankings = createSelector(baseSelectors.selectData, (games) => {
  const rawScores: Record<string, number> = {};
  const averageScores = games.reduce<Record<string, number[]>>((acc, game) => {
    game.data.config.players.forEach((email) => {
      if (game.data.playerStats[email].remaining === 0) {
        if (!acc[email]) {
          acc[email] = [];
        }
        rawScores[email] = 0;
      }
    });
    game.data.rounds.forEach((round) => {
      Object.entries(round).forEach(([email, score]) => {
        if (game.data.playerStats[email].remaining === 0) {
          if (game.data.config.goal - rawScores[email] > CLOSE_BREAKPOINT && score !== -1) {
            acc[email].push(score);
          }
          if (score !== -1) {
            rawScores[email] += score;
          }
        }
      });
    });
    return acc;
  }, {});
  const averages = userAverages(averageScores);
  return Object.entries(averages).sort((a, b) => (a[1] > b[1] ? -1 : 1));
});

const actions = slice.actions;
const reducer = slice.reducer;
const selectors = {
  ...baseSelectors,
  selectAverageBustsRankings,
  selectAverageClosingScoreRankings,
  selectAverageRoundScoreRankings,
  selectAverageRoundsPlayedRankings,
  selectBestRoundRankings,
  selectTopTenRoundRankings,
  selectBestScoreToCloseRankings,
  selectGamesPlayedRankings,
  selectRoundsAboveScoreRankings,
  selectAverageRoundsToCloseRankings,
  selectTotalWinsRankings,
  selectWinPercentageRankings,
  selectEloRankings,
  selectEloHistory,
  selectFilteredEloHistory,
  selectHighestBustRankings,
  selectAverageRoundsPlayedHistory,
  selectCloseLossRankings,
  selectAverageRoundsInSingleDigits,
  selectAverageScoreBeforeClosingRangeRankings,
};
export { selectors, actions, hooks, context, reducer };
