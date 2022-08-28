import { useState, useRef, useEffect, FC, FormEvent, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import { API } from 'aws-amplify';
import { useSelector } from 'react-redux';
import { Box, CircularProgress } from '@material-ui/core';
import { selectors } from 'store/leagues/slice';
import { DartboardWrapper, DartboardClickDetails } from '../DartboardWrapper';

interface PlayerGameStats {
  email: string;
  total: number;
  remaining: number;
  roundsPlayed: number;
  ranking: number;
}

interface GameConfig {
  players: string[];
  goal: number;
}

type Rounds = Record<string, number>[];

export interface ScoreboardProps {}

const comparePlayerStats = (player1Stats: PlayerGameStats, player2Stats: PlayerGameStats): -1 | 0 | 1 => {
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

const saveGame = async (leagueKey: string | undefined, gameId: string, gameConfig: GameConfig, rounds: Rounds) => {
  if (!leagueKey) {
    return;
  }
  await API.put('leagues', `/leagues/${leagueKey}/games/${gameId}`, {
    body: {
      ...gameConfig,
      rounds,
    },
  });
};

export const Scoreboard: FC<ScoreboardProps> = () => {
  const params = useParams<{ gameId: string }>();
  const gameId = params.gameId;

  const selectedLeague = useSelector(selectors.selectSelectedLeague);

  const [gameConfig, setGameConfig] = useState<GameConfig>();
  const [rounds, setRounds] = useState<Rounds>([{}]);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [saving, setSaving] = useState(false);
  const scoreRef = useRef<HTMLInputElement | null>(null);
  const [editModeScores, setEditModeScores] = useState<Rounds | undefined>();

  const currentRound = rounds.length - 1;

  useEffect(() => {
    if (gameId && selectedLeague) {
      (async () => {
        const { game } = await API.get('leagues', `/leagues/${selectedLeague.leagueKey}/games/${gameId}`, {});
        setGameConfig({ players: game.data.players, goal: game.data.goal });
        setRounds(game.data.rounds);
        setCurrentPlayerIdx(Object.keys(game.data.rounds[game.data.rounds.length - 1]).length);
      })();
    }
  }, [gameId, selectedLeague]);

  useEffect(() => {
    scoreRef.current?.focus();
  }, [gameConfig]);

  if (!gameConfig) {
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress size={100} />
      </Box>
    );
  }

  const playerStats = rounds.reduce<Record<string, PlayerGameStats>>(
    (acc, round) => {
      Object.entries(round).forEach((playerEntry) => {
        acc[playerEntry[0]].total = acc[playerEntry[0]].total + Math.max(playerEntry[1], 0);
        acc[playerEntry[0]].remaining = gameConfig.goal - acc[playerEntry[0]].total;
        acc[playerEntry[0]].roundsPlayed++;
      });
      return acc;
    },
    gameConfig.players.reduce<Record<string, PlayerGameStats>>((acc, player) => {
      acc[player] = { email: player, total: 0, remaining: gameConfig.goal, roundsPlayed: 0, ranking: 0 };
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
    setRounds(newRounds);
    setScore(0);
    scoreRef.current?.focus();
    await saveGame(selectedLeague?.leagueKey, gameId, gameConfig, newRounds);
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
        setRounds(editModeScores);
        await saveGame(selectedLeague?.leagueKey, gameId, gameConfig, editModeScores);
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
                    {player.split('.')[0]}
                    {isWinner(player) && <>&#128081;</>}
                    {isLeader(player) && <>&#11088;</>}
                    {isLoser(player) && <>&#128169;</>}
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
      </div>
      {!gameOver && (
        <div style={{ flex: '1 0 auto' }}>
          <h2>Current player</h2>
          <h3>Name: {currentPlayer?.split('.')[0] ?? ''}</h3>
          <h3>Current round: {currentRound + 1}</h3>
          <h3>Remaining: {playerStats[currentPlayer].remaining}</h3>
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
              {sortedPlayer.ranking}. {sortedPlayer.email.split('.')[0]}
              {isWinner(sortedPlayer.email) && <>&#128081;</>}
              {isLeader(sortedPlayer.email) && <>&#11088;</>}
              {isLoser(sortedPlayer.email) && <>&#128169;</>}
            </h3>
          ))}
        </div>
      )}
    </div>
  );
};
