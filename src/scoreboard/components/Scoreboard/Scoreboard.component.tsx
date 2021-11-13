import { useState, FC, FormEvent } from 'react';
import { DartboardWrapper, DartboardClickDetails } from '../DartboardWrapper';

const GOAL = 301;

export interface ScoreboardProps {}

export const Scoreboard: FC<ScoreboardProps> = () => {
  const [players, setPlayers] = useState<string[]>([]);
  const [newPlayer, setNewPlayer] = useState<string>('');
  const [rounds, setRounds] = useState<Record<string, number>[]>([{}]);
  const [currentRound, setCurrentRound] = useState(0);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [saving, setSaving] = useState(false);

  const totals = rounds.reduce<Record<string, number>>(
    (acc, round) => {
      Object.entries(round).forEach((playerEntry) => {
        acc[playerEntry[0]] = (acc[playerEntry[0]] ?? 0) + playerEntry[1];
      });
      return acc;
    },
    players.reduce<Record<string, number>>((acc, player) => {
      acc[player] = 0;
      return acc;
    }, {}),
  );
  const remainingPlayers = players.filter((player) => totals[player] !== GOAL);
  const currentPlayer = remainingPlayers[currentPlayerIdx];

  const addPlayer = (evt: FormEvent) => {
    evt.preventDefault();
    setPlayers([...players, newPlayer]);
    setNewPlayer('');
  };

  const saveScore = (_newScore: number) => {
    if (saving || !currentPlayer) {
      return;
    }
    setSaving(true);
    const newRounds = [...rounds];
    const newScore = totals[currentPlayer] + _newScore > GOAL ? 0 : _newScore;
    newRounds[currentRound][currentPlayer] = newScore;
    setScore(0);
    if (currentPlayerIdx >= remainingPlayers.length - 1) {
      setCurrentPlayerIdx(0);
      setCurrentRound(currentRound + 1);
      setRounds([...newRounds, {}]);
    } else {
      if (totals[currentPlayer] + newScore !== GOAL) {
        setCurrentPlayerIdx(currentPlayerIdx + 1);
      }
      setRounds(newRounds);
    }
    setScore(0);
    setTimeout(() => {
      setSaving(false);
    }, 1000);
  };

  const addScore = (evt?: FormEvent) => {
    evt?.preventDefault();
    saveScore(score);
  };

  const addBust = () => {
    if (saving) {
      return;
    }
    saveScore(0);
  };

  const handleDartboardClick = (details: DartboardClickDetails) => {
    setScore(score + details.score);
  };

  return (
    <>
      <div>
        <form onSubmit={addPlayer}>
          <input type="text" value={newPlayer} onChange={(evt) => setNewPlayer(evt.target.value)} />
          <input type="submit" value="Add player" />
        </form>
      </div>
      <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
        <div style={{ flex: '1 0 auto' }}>
          <table style={{ borderWidth: 1, borderStyle: 'solid', width: '100%' }}>
            <thead>
              <tr>
                <td></td>
                {players.map((player) => (
                  <td key={player} style={{ fontWeight: 'bold' }}>
                    {player}
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {rounds.map((round, roundNum) => (
                <tr key={roundNum}>
                  <td style={{ fontWeight: 'bold' }}>{roundNum + 1}</td>
                  {players.map((player) => (
                    <td key={player}>{round[player] ?? ''}</td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Total</td>
                {players.map((player) => (
                  <td key={player} style={{ fontWeight: 'bold' }}>
                    {GOAL - totals[player]}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
        <div style={{ flex: '1 0 auto' }}>
          <h2>Current player: {currentPlayer ?? 'None'}</h2>
          <h2>Current round: {currentRound + 1}</h2>
          <DartboardWrapper size={400} onClick={handleDartboardClick} />
          <div style={{ marginTop: 20 }}>
            <form onSubmit={addScore}>
              <input type="number" value={score} onChange={(evt) => setScore(parseInt(evt.target.value))} />
              <input type="submit" value="Save score" disabled={saving} />
              <input type="button" value="Bust!" onClick={addBust} disabled={saving} />
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
