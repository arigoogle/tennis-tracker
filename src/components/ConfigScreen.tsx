import React, { useState } from 'react';
import type { MatchConfig, DeuceMode, SetMode, SetFormat } from '../model';
import { formatConfigSummary } from '../model';

interface Props {
  initialConfig: MatchConfig;
  onStart: (config: MatchConfig) => void;
}

const GAME_PRESETS = [1, 3, 4, 6, 8, 10];

const DEUCE_OPTIONS: { value: DeuceMode; label: string; desc: string }[] = [
  { value: 'standard', label: 'Advantage', desc: 'Deuce → Ad → win by 2 points' },
  { value: 'sudden_death', label: 'Sudden Death', desc: 'No Ad — next point at deuce wins' },
  { value: 'golden', label: 'Golden Point', desc: 'Deuce → Ad → Golden decider' },
];

export const ConfigScreen: React.FC<Props> = ({ initialConfig, onStart }) => {
  const [playerA, setPlayerA] = useState(initialConfig.playerA);
  const [playerB, setPlayerB] = useState(initialConfig.playerB);
  const [gamesPerSet, setGamesPerSet] = useState<SetMode>(initialConfig.gamesPerSet);
  const [setFormat, setSetFormat] = useState<SetFormat>(initialConfig.setFormat ?? 'fixed');
  const [winByTwoGames, setWinByTwoGames] = useState<boolean>(initialConfig.winByTwoGames ?? true);
  const [deuceMode, setDeuceMode] = useState<DeuceMode>(initialConfig.deuceMode);
  const [firstServe, setFirstServe] = useState<'A' | 'B'>(initialConfig.firstServe);

  const isEndless = gamesPerSet === 'infinity';
  const numericGames = typeof gamesPerSet === 'number' ? gamesPerSet : 6;

  const setGames = (n: number) => setGamesPerSet(Math.max(1, Math.floor(n)));

  const draftConfig: MatchConfig = {
    playerA: playerA || 'Player A',
    playerB: playerB || 'Player B',
    gamesPerSet,
    setFormat,
    winByTwoGames,
    deuceMode,
    firstServe,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart(draftConfig);
  };

  const chipStyle = (active: boolean): React.CSSProperties => ({
    flex: '0 0 auto',
    minWidth: 52,
    padding: '10px 14px',
    borderRadius: 10,
    fontWeight: 700,
    border: active ? '2px solid var(--brand-primary)' : '1px solid var(--border-color)',
    backgroundColor: active ? 'var(--brand-primary)' : 'var(--bg-secondary)',
    color: active ? 'white' : 'var(--text-primary)',
  });

  const formatBtnStyle = (active: boolean): React.CSSProperties => ({
    textAlign: 'left',
    padding: '10px 12px',
    borderRadius: 12,
    border: active ? '2px solid var(--brand-primary)' : '1px solid var(--border-color)',
    backgroundColor: active ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-secondary)',
    color: 'var(--text-primary)',
  });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: 'var(--spacing-md) 0', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--brand-primary)' }}>AceBoard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Match Setup</p>
      </header>

      <div className="glass" style={{ borderRadius: 16, padding: 'var(--spacing-md)', flex: 1, overflowY: 'auto' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>Players</label>
            <input
              type="text"
              placeholder="Player 1 Name"
              value={playerA}
              onChange={e => setPlayerA(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Player 2 Name"
              value={playerB}
              onChange={e => setPlayerB(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>First Serve</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setFirstServe('A')}
                className={`btn ${firstServe === 'A' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
              >
                {playerA || 'Player A'}
              </button>
              <button
                type="button"
                onClick={() => setFirstServe('B')}
                className={`btn ${firstServe === 'B' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
              >
                {playerB || 'Player B'}
              </button>
            </div>
          </div>

          {/* Games per set — fully dynamic */}
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>Games per Set</label>

            {/* Quick presets + endless */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--spacing-sm)' }}>
              {GAME_PRESETS.map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setGames(n)}
                  style={chipStyle(!isEndless && numericGames === n)}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setGamesPerSet('infinity')}
                style={chipStyle(isEndless)}
              >
                ∞ Endless
              </button>
            </div>

            {/* Custom stepper — any number */}
            {!isEndless && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setGames(numericGames - 1)}
                  className="btn btn-secondary"
                  style={{ width: 48, fontSize: '1.4rem', padding: '8px 0' }}
                  aria-label="Decrease games"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={numericGames}
                  onChange={e => {
                    const v = parseInt(e.target.value, 10);
                    if (!Number.isNaN(v)) setGames(v);
                  }}
                  style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.2rem', margin: 0 }}
                />
                <button
                  type="button"
                  onClick={() => setGames(numericGames + 1)}
                  className="btn btn-secondary"
                  style={{ width: 48, fontSize: '1.4rem', padding: '8px 0' }}
                  aria-label="Increase games"
                >
                  +
                </button>
              </div>
            )}

            {/* Set format — fixed games vs race */}
            {!isEndless && (
              <div style={{ display: 'flex', gap: 8, marginTop: 'var(--spacing-sm)' }}>
                <button
                  type="button"
                  onClick={() => setSetFormat('fixed')}
                  style={{ ...formatBtnStyle(setFormat === 'fixed'), flex: 1 }}
                >
                  <span style={{ display: 'block', fontWeight: 700 }}>Fixed</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Play all {numericGames} (e.g. {Math.max(0, numericGames - 1)}–1, ties possible)
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSetFormat('race')}
                  style={{ ...formatBtnStyle(setFormat === 'race'), flex: 1 }}
                >
                  <span style={{ display: 'block', fontWeight: 700 }}>Race</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    First to {numericGames} wins
                  </span>
                </button>
              </div>
            )}

            {/* Win-by-2 toggle (race / advantage set only) */}
            {!isEndless && setFormat === 'race' && numericGames > 1 && (
              <button
                type="button"
                onClick={() => setWinByTwoGames(v => !v)}
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: 'var(--spacing-sm)', justifyContent: 'space-between' }}
              >
                <span style={{ textAlign: 'left' }}>
                  <span style={{ display: 'block', fontWeight: 600 }}>Win by 2 games</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                    {winByTwoGames ? 'Advantage set — must lead by 2' : 'First to target wins outright'}
                  </span>
                </span>
                <span
                  style={{
                    flexShrink: 0,
                    padding: '4px 10px',
                    borderRadius: 999,
                    fontWeight: 700,
                    backgroundColor: winByTwoGames ? 'var(--brand-primary)' : 'var(--border-color)',
                    color: winByTwoGames ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {winByTwoGames ? 'ON' : 'OFF'}
                </span>
              </button>
            )}
          </div>

          {/* Deuce rules */}
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>Deuce Rule (40–40)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {DEUCE_OPTIONS.map(opt => {
                const active = deuceMode === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDeuceMode(opt.value)}
                    style={{
                      textAlign: 'left',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: active ? '2px solid var(--brand-primary)' : '1px solid var(--border-color)',
                      backgroundColor: active ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <span style={{ display: 'block', fontWeight: 700 }}>{opt.label}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live summary of how the match will score */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Format: </span>
            {formatConfigSummary(draftConfig)}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 'var(--spacing-lg)' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.2rem' }}>
              Start Match
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
