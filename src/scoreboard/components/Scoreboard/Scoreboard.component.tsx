import { useState, useRef, useEffect, FC, FormEvent, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { API } from 'aws-amplify';
import { useSelector } from 'react-redux';
import { Box, CircularProgress } from '@material-ui/core';
import { selectors } from 'store/leagues/slice';
import { DartboardWrapper, DartboardClickDetails } from '../DartboardWrapper';
import { IGameData, IRounds } from 'store/games/types';
import { buildGameData, comparePlayerStats } from 'store/games/helpers';
import { formatDivision } from 'shared/utils/numbers';
import { hooks as gameHooks } from 'store/games/slice';
import { DartsToClose } from '../DartsToClose';

export interface ScoreboardProps {}

export const saveGame = async (leagueKey: string | undefined, gameId: string, gameData: IGameData) => {
  if (!leagueKey) {
    return;
  }
  await API.put('leagues', `/leagues/${leagueKey}/games/${gameId}`, {
    body: gameData,
  });
};

export const Scoreboard: FC<ScoreboardProps> = () => {
  const params = useParams<{ gameId: string }>();
  const gameId = params.gameId;

  const selectedLeague = useSelector(selectors.selectSelectedLeague);
  const { makeStale: makeGamesStale } = gameHooks.useMonitoredData();

  const [gameData, setGameData] = useState<IGameData | undefined>();
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [saving, setSaving] = useState(false);
  const scoreRef = useRef<HTMLInputElement | null>(null);
  const [editModeScores, setEditModeScores] = useState<IRounds | undefined>();

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

  const remainingPlayers = gameConfig.players.filter((player) => playerStats[player].remaining !== 0);
  const currentPlayer = remainingPlayers[currentPlayerIdx];
  const gameOver = !currentPlayer;

  const saveScore = async (_newScore: number) => {
    if (saving || !currentPlayer) {
      return;
    }
    setSaving(true);
    const newRounds = [...rounds];
    const newScore = _newScore > playerStats[currentPlayer].remaining ? 0 : _newScore;
    newRounds[currentRound][currentPlayer] = newScore;
    setScore(0);
    if (currentPlayerIdx >= remainingPlayers.length - 1) {
      setCurrentPlayerIdx(0);
      newRounds.push({});
    } else {
      if (playerStats[currentPlayer].total + newScore !== gameConfig.goal) {
        setCurrentPlayerIdx(currentPlayerIdx + 1);
      }
    }

    const newGameData = buildGameData(gameData.config, newRounds);
    setGameData(newGameData);
    setScore(0);
    scoreRef.current?.focus();
    await saveGame(selectedLeague?.leagueKey, gameId, newGameData);
    makeGamesStale();
    setSaving(false);
  };

  const addScore = (evt?: FormEvent) => {
    evt?.preventDefault();
    saveScore(score);
  };

  const addBust = () => {
    if (saving) {
      return;
    }
    saveScore(-1);
  };

  const handleDartboardClick = (details: DartboardClickDetails) => {
    setScore(score + details.score);
  };

  const onEditScoreChange = (roundNum: number, player: string) => (evt: ChangeEvent<HTMLInputElement>) => {
    if (!editModeScores) {
      return;
    }

    const newScores = [...editModeScores];
    newScores[roundNum][player] = parseInt(evt.target.value || '0');
    setEditModeScores(newScores);
  };

  const renderScore = (roundNum: number, player: string) => {
    if (editModeScores) {
      const roundScore = editModeScores[roundNum][player];
      if (roundScore === undefined) {
        return null;
      }
      return <input type="number" value={roundScore} onChange={onEditScoreChange(roundNum, player)} />;
    } else {
      const roundScore = rounds[roundNum][player];
      return roundScore === -1 ? 'x' : roundScore;
    }
  };

  const toggleEditMode = async (cancel: boolean = false) => {
    if (editModeScores) {
      if (!cancel) {
        setSaving(true);
        const newGameData = buildGameData(gameData.config, editModeScores);
        setGameData(newGameData);
        await saveGame(selectedLeague?.leagueKey, gameId, newGameData);
        makeGamesStale();
        setSaving(false);
      }
      setEditModeScores(undefined);
      scoreRef.current?.focus();
    } else {
      setEditModeScores(rounds.map((round) => ({ ...round })));
    }
  };

  const isWinner = (player: string) => {
    return playerStats[player].remaining === 0 && playerStats[player].ranking === 1;
  };
  const isLeader = (player: string) => {
    return !isWinner(player) && playerStats[player].total > 0 && playerStats[player].ranking === 1;
  };
  const isLoser = (player: string) => {
    return (
      rounds.length > 1 &&
      !isLeader(player) &&
      playerStats[player].ranking === sortedPlayers[sortedPlayers.length - 1].ranking
    );
  };

  const playerEmoji = (player: string) => {
    if (isWinner(player)) {
      return <>&#128081;</>;
    } else if (isLeader(player)) {
      return <>&#11088;</>;
    } else if (isLoser(player)) {
      return <>&#128169;</>;
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
      <div style={{ flex: '1 0 auto' }}>
        <h2 style={{ textAlign: 'center' }}>Scores</h2>
        <table style={{ borderWidth: 1, borderStyle: 'solid', width: '100%' }}>
          <thead>
            <tr>
              <td></td>
              {gameConfig.players.map((player) => (
                <td key={player} style={{ fontWeight: 'bold' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {player.split('.')[0]} {playerEmoji(player)}
                  </div>
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
        {!gameOver && (
          <div style={{ marginTop: 5 }}>
            <input type="button" onClick={() => toggleEditMode()} value={editModeScores ? 'Save changes' : 'Oops'} />
            {editModeScores && <input type="button" onClick={() => toggleEditMode(true)} value="Cancel" />}
          </div>
        )}
      </div>
      {!gameOver && (
        <div style={{ flex: '1 0 auto' }}>
          <h2>Current player</h2>
          <h3>Name: {currentPlayer?.split('.')[0] ?? ''}</h3>
          <h3>Current round: {currentRound + 1}</h3>
          <h3>
            Remaining: {playerStats[currentPlayer].remaining}{' '}
            <DartsToClose remaining={playerStats[currentPlayer].remaining} />
          </h3>
          <DartboardWrapper size={400} onClick={handleDartboardClick} />
          <div style={{ marginTop: 20 }}>
            <form onSubmit={addScore}>
              <input
                ref={scoreRef}
                type="number"
                value={score}
                onChange={(evt) => setScore(parseInt(evt.target.value))}
              />
              <input type="submit" value="Save score" disabled={saving} />
              <input type="button" value="Bust!" onClick={addBust} disabled={saving} />
            </form>
          </div>
        </div>
      )}
      {gameOver && (
        <div style={{ flex: '1 0 auto' }}>
          <h2>Rankings</h2>
          {sortedPlayers.map((sortedPlayer) => (
            <h3 key={sortedPlayer.email}>
              {sortedPlayer.ranking}. {sortedPlayer.email.split('.')[0]} {playerEmoji(sortedPlayer.email)}
            </h3>
          ))}
        </div>
      )}
    </div>
  );
};
