import { useState, useRef, useEffect, FC, FormEvent, ChangeEvent, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { API } from 'aws-amplify';
import { useSelector } from 'react-redux';
import { Box, CircularProgress, Tooltip, Typography } from '@material-ui/core';
import { selectors as leagueSelectors } from 'store/leagues/slice';
import { DartboardWrapper, DartboardClickDetails } from '../DartboardWrapper';
import { IEditRounds, IGameData } from 'store/games/types';
import { buildGameData, comparePlayerStats } from 'store/games/helpers';
import { CLOSE_BREAKPOINT, selectors as gamesSelectors } from 'store/games/slice';
import { playerUtils } from 'shared/utils';
import { formatDivision, formatNumber } from 'shared/utils/numbers';
import { hooks as gameHooks } from 'store/games/slice';
import { DartsToClose } from '../DartsToClose';
import { IRootState } from 'store/types';
import { DEFAULT_ELO, calculateGameElos } from 'store/games/elo';
import lawOfAverages from '../../../images/law-of-averages.gif';
import bagOfDicks from '../../../images/bag-of-dicks.gif';
import shanghai from '../../../images/shanghai.gif';

export interface ScoreboardProps {}

export const saveGame = async (leagueKey: string | undefined, gameId: string, gameData: IGameData) => {
  if (!leagueKey) {
    return;
  }
  await API.put('leagues', `/leagues/${leagueKey}/games/${gameId}`, {
    body: gameData,
  });
};

const parseScore = (rawScore: string): number => {
  const score = parseInt(rawScore);
  if (isNaN(score)) {
    return 0;
  }
  return score;
};

const displayElo = (
  email: string,
  preGameElo?: Partial<Record<string, number>>,
  postGameEloData?: {
    postGameElo: Partial<Record<string, number>>;
    eloChanges: Partial<Record<string, { opponentEmail: string; change: number }[]>>;
  },
) => {
  const playerPreElo = formatNumber(preGameElo?.[email] ?? DEFAULT_ELO, 1);
  const playerPostElo = formatNumber(postGameEloData?.postGameElo?.[email] ?? preGameElo?.[email] ?? DEFAULT_ELO, 1);
  const playerChanges = postGameEloData?.eloChanges?.[email] ?? [];
  return (
    <Tooltip
      title={
        <>
          <Typography variant="subtitle1">ELO changes:</Typography>
          {playerChanges.map((playerChange) => (
            <Typography key={playerChange.opponentEmail} variant="subtitle2">
              {playerChange.opponentEmail}:{' '}
              <span style={{ color: playerChange.change > 0 ? undefined : 'red' }}>
                {playerChange.change > 0 ? '+' : ''}
                {formatNumber(playerChange.change, 1)}
              </span>
            </Typography>
          ))}
        </>
      }
    >
      <span>
        ({playerPreElo} &mdash;&gt; {playerPostElo})
      </span>
    </Tooltip>
  );
};

export const Scoreboard: FC<ScoreboardProps> = () => {
  const params = useParams<{ gameId: string }>();
  const gameId = params.gameId;

  const { finalElo: preGameElo } = useSelector((state: IRootState) =>
    gamesSelectors.selectFilteredEloHistory(state, gameId),
  );

  const eloKFactor = useSelector(leagueSelectors.selectEloKFactor);
  const selectedLeague = useSelector(leagueSelectors.selectSelectedLeague);
  const { makeStale: makeGamesStale } = gameHooks.useMonitoredData();

  const [gameData, setGameData] = useState<IGameData | undefined>();
  const [throws, setThrows] = useState<number[]>([]);
  const [score, setScore] = useState('0');
  const [saving, setSaving] = useState(false);
  const scoreRef = useRef<HTMLInputElement | null>(null);
  const [editModeScores, setEditModeScores] = useState<IEditRounds | undefined>();
  const [responsePop, setResponsePop] = useState<string | undefined>();

  const postGameEloData = useMemo(() => {
    if (!gameData) {
      return undefined;
    }

    const postGameElo = { ...preGameElo };
    const eloChanges = calculateGameElos(gameData, postGameElo, eloKFactor);
    return { postGameElo, eloChanges };
  }, [eloKFactor, preGameElo, gameData]);

  useEffect(() => {
    if (gameId && selectedLeague) {
      (async () => {
        const { game } = await API.get('leagues', `/leagues/${selectedLeague.leagueKey}/games/${gameId}`, {});
        setGameData(game.data);
      })();
    }
  }, [gameId, selectedLeague]);

  useEffect(() => {
    scoreRef.current?.focus();
  }, [gameData]);

  if (!gameData) {
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress size={100} />
      </Box>
    );
  }

  const gameConfig = gameData.config;
  const rounds = gameData.rounds;
  const currentRound = rounds.length - 1;
  const playerStats = gameData.playerStats;
  const sortedPlayers = Object.values(playerStats).sort(comparePlayerStats);

  const remainingRoundPlayers = gameConfig.players.filter(
    (player) =>
      !playerStats[player].forfeit &&
      playerStats[player].remaining !== 0 &&
      playerStats[player].roundsPlayed !== rounds.length,
  );
  const currentPlayer = remainingRoundPlayers[0];
  const gameOver = !currentPlayer;
  const newGame = currentRound === 0 && sortedPlayers.every((other) => other.roundsPlayed === 0);

  const showReaction = async (image: string) => {
    setResponsePop(image);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setResponsePop(undefined);
  };

  const scoreReaction = (player: string, _throws?: number[]) => {
    const standardDeviation = (arr: number[], average: number) => {
      const variance = arr.reduce((acc, score) => acc + (score - average) ** 2) / arr.length;
      return Math.sqrt(variance);
    };
    const playerScores = rounds.map((round) => {
      return round[currentPlayer];
    });
    const average = formatDivision(playerStats[player].total, playerStats[player].roundsPlayed, 1);
    const stdDev = standardDeviation(playerScores, average);

    const scoresRev = [...playerScores].reverse();
    const scoreLeft = playerStats[player].remaining;
    // Determine a reaction
    if (stdDev > 40 && scoresRev[0] < scoresRev[1] && scoreLeft > CLOSE_BREAKPOINT) {
      showReaction(lawOfAverages);
    }
    if ((_throws?.length ?? 0) > 0) {
      if (_throws?.includes(20) && _throws?.includes(5) && _throws?.includes(1)) {
        showReaction(bagOfDicks);
      }
      const lowestValue = _throws?.sort()?.[0];
      if (lowestValue && _throws?.includes(lowestValue * 2) && _throws?.includes(lowestValue * 3)) {
        showReaction(shanghai);
      }
    }
  };

  const saveScore = async (_newScore: number, _throws?: number[]) => {
    if (saving || !currentPlayer) {
      return;
    }
    setSaving(true);
    const newRounds = [...rounds];
    const newScore = _newScore > playerStats[currentPlayer].remaining ? -1 : _newScore;
    newRounds[currentRound][currentPlayer] = newScore;
    scoreReaction(currentPlayer, _throws);
    const newGameData = buildGameData(gameData.config, newRounds);
    setGameData(newGameData);
    setThrows([]);
    setScore('0');
    scoreRef.current?.focus();
    await saveGame(selectedLeague?.leagueKey, gameId, newGameData);
    makeGamesStale();
    setSaving(false);
  };

  const addScore = (evt?: FormEvent) => {
    evt?.preventDefault();
    saveScore(parseScore(score), throws);
  };

  const addBust = () => {
    if (saving) {
      return;
    }
    saveScore(-1);
  };

  const handleDartboardClick = (details: DartboardClickDetails) => {
    setScore((parseScore(score) + details.score).toString());
    setThrows((prevThrows) => {
      const updates = [...prevThrows];
      updates.push(details.score);
      return updates;
    });
  };

  const onEditScoreChange = (roundNum: number, player: string) => (evt: ChangeEvent<HTMLInputElement>) => {
    if (!editModeScores) {
      return;
    }

    const newScores = [...editModeScores];
    newScores[roundNum][player] = evt.target.value;
    setEditModeScores(newScores);
  };

  const renderScore = (roundNum: number, player: string) => {
    if (editModeScores) {
      const roundScore = editModeScores[roundNum]?.[player];
      return <input value={roundScore} onChange={onEditScoreChange(roundNum, player)} />;
    } else {
      const roundScore = rounds[roundNum]?.[player];
      return roundScore === -1 ? 'x' : roundScore;
    }
  };

  const toggleForfeit = async (player: string) => {
    if (!newGame) {
      return;
    }

    setSaving(true);
    const forfeit = !gameData.config.forfeits?.includes(player);
    const newGameData = buildGameData(
      {
        ...gameData.config,
        forfeits: forfeit
          ? [...(gameData.config.forfeits ?? []), player]
          : gameData.config.forfeits?.filter((other) => other !== player) ?? [],
      },
      rounds,
    );
    setGameData(newGameData);
    await saveGame(selectedLeague?.leagueKey, gameId, newGameData);
    setSaving(false);
  };

  const toggleEditMode = async (cancel: boolean = false) => {
    if (editModeScores) {
      if (!cancel) {
        setSaving(true);
        const newGameData = buildGameData(
          gameData.config,
          editModeScores.map((round) =>
            Object.entries(round).reduce<Record<string, number>>((acc, [email, score]) => {
              if (score !== '') {
                acc[email] = parseInt(score);
              }
              return acc;
            }, {}),
          ),
        );
        setGameData(newGameData);
        await saveGame(selectedLeague?.leagueKey, gameId, newGameData);
        makeGamesStale();
        setSaving(false);
      }
      setEditModeScores(undefined);
      scoreRef.current?.focus();
    } else {
      setEditModeScores(
        rounds.map((round) =>
          Object.entries(round).reduce<Record<string, string>>((acc, [email, score]) => {
            acc[email] = score.toString();
            return acc;
          }, {}),
        ),
      );
    }
  };

  const isWinner = (player: string) => {
    return playerStats[player].remaining === 0 && playerStats[player].ranking === 1;
  };
  const isLeader = (player: string) => {
    return !isWinner(player) && playerStats[player].total > 0 && playerStats[player].ranking === 1;
  };
  const isLoser = (player: string) => {
    const nonQuitters = sortedPlayers.filter((other) => !other.forfeit);
    return (
      !playerStats[player].forfeit &&
      rounds.length > 1 &&
      !isLeader(player) &&
      playerStats[player].ranking === nonQuitters[nonQuitters.length - 1].ranking
    );
  };
  const isQuitter = (player: string) => {
    return playerStats[player].forfeit;
  };

  const playerEmoji = (player: string) => {
    if (isQuitter(player)) {
      return <>&#128037;</>;
    } else if (isWinner(player)) {
      return <>&#128081;</>;
    } else if (isLeader(player)) {
      return <>&#11088;</>;
    } else if (isLoser(player)) {
      return <>&#128169;</>;
    }
    return null;
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 0 min-content', overflowX: 'scroll', maxWidth: '100%' }}>
          <h2 style={{ textAlign: 'center' }}>Scores</h2>
          {newGame && <>Click player name to toggle their forfeit status prior to game beginning.</>}
          <table style={{ borderWidth: 1, borderStyle: 'solid', width: '100%' }}>
            <thead>
              <tr>
                <td></td>
                {gameConfig.players.map((player) => (
                  <td key={player} style={{ fontWeight: 'bold' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        textDecoration: gameData.config.forfeits?.includes(player) ? 'line-through' : undefined,
                      }}
                      onClick={() => toggleForfeit(player)}
                    >
                      {playerUtils.displayName(player)} {playerEmoji(player)}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td></td>
                {gameConfig.players.map((player) => (
                  <td key={player} style={{ fontWeight: 'bold', fontSize: '.8em' }}>
                    {formatNumber(preGameElo?.[player] ?? DEFAULT_ELO, 1)}
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {rounds.map((round, roundNum) => (
                <tr key={roundNum}>
                  <td style={{ fontWeight: 'bold' }}>{roundNum + 1}</td>
                  {gameConfig.players.map((player) => (
                    <td key={player}>{renderScore(roundNum, player)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Remaining</td>
                {gameConfig.players.map((player) => (
                  <td key={player} style={{ fontWeight: 'bold' }}>
                    {playerStats[player].remaining}
                  </td>
                ))}
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Average</td>
                {gameConfig.players.map((player) => (
                  <td key={player}>
                    {playerStats[player].roundsPlayed
                      ? formatDivision(playerStats[player].total, playerStats[player].roundsPlayed, 1)
                      : ''}
                  </td>
                ))}
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Ranking</td>
                {gameConfig.players.map((player) => (
                  <td key={player} style={{ fontWeight: 'bold' }}>
                    {playerStats[player].ranking}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
          <div style={{ marginTop: 5 }}>
            <input type="button" onClick={() => toggleEditMode()} value={editModeScores ? 'Save changes' : 'Oops'} />
            {editModeScores && <input type="button" onClick={() => toggleEditMode(true)} value="Cancel" />}
          </div>
          <div style={{ display: 'flex', marginTop: 5, justifyContent: 'end' }}>
            {responsePop && <img src={responsePop} alt="Score reaction" width="50%" />}
          </div>
        </div>
        {!gameOver && (
          <div style={{ flex: '1 0 auto' }}>
            <h2>Current player</h2>
            <h3>Name: {playerUtils.displayName(currentPlayer ?? '')}</h3>
            <h3>Current round: {currentRound + 1}</h3>
            <h3>
              Remaining: {playerStats[currentPlayer].remaining}{' '}
              <DartsToClose remaining={playerStats[currentPlayer].remaining} />
            </h3>
            {!editModeScores && (
              <div style={{ marginTop: 20 }}>
                <form onSubmit={addScore}>
                  <input ref={scoreRef} value={score} onChange={(evt) => setScore(evt.target.value)} />
                  <input type="submit" value="Save score" disabled={saving} />
                  <input type="button" value="Bust!" onClick={addBust} disabled={saving} />
                </form>
              </div>
            )}
            <div style={{ marginTop: 20 }}>
              <DartboardWrapper size={400} onClick={handleDartboardClick} />
            </div>
          </div>
        )}
        {gameOver && (
          <div style={{ flex: '1 0 auto' }}>
            <h2>Rankings</h2>
            {sortedPlayers.map((sortedPlayer) => (
              <h3 key={sortedPlayer.email}>
                {sortedPlayer.ranking}. {playerUtils.displayName(sortedPlayer.email)} {playerEmoji(sortedPlayer.email)}{' '}
                {displayElo(sortedPlayer.email, preGameElo, postGameEloData)}
              </h3>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
