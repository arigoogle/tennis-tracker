import React, { useState } from 'react';
import type { MatchConfig, DeuceMode, SetMode } from '../model';

interface Props {
  initialConfig: MatchConfig;
  onStart: (config: MatchConfig) => void;
}

export const ConfigScreen: React.FC<Props> = ({ initialConfig, onStart }) => {
  const [playerA, setPlayerA] = useState(initialConfig.playerA);
  const [playerB, setPlayerB] = useState(initialConfig.playerB);
  const [gamesPerSet, setGamesPerSet] = useState<SetMode>(initialConfig.gamesPerSet);
  const [deuceMode, setDeuceMode] = useState<DeuceMode>(initialConfig.deuceMode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({
      playerA: playerA || 'Player A',
      playerB: playerB || 'Player B',
      gamesPerSet,
      deuceMode,
    });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: 'var(--spacing-md) 0', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--brand-primary)' }}>Tennis OS</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Match Setup</p>
      </header>

      <div className="glass" style={{ borderRadius: 16, padding: 'var(--spacing-md)', flex: 1 }}>
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
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>Games per Set</label>
            <select 
              value={gamesPerSet.toString()} 
              onChange={e => {
                const val = e.target.value;
                if (val === 'infinity') setGamesPerSet('infinity');
                else setGamesPerSet(parseInt(val, 10) as SetMode);
              }}
            >
              <option value="4">First to 4 Games (Short Set)</option>
              <option value="6">First to 6 Games (Standard)</option>
              <option value="infinity">Endless (Infinity)</option>
            </select>
          </div>

          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>Deuce Rules</label>
            <select 
              value={deuceMode} 
              onChange={e => setDeuceMode(e.target.value as DeuceMode)}
            >
              <option value="standard">Standard (Ad, Win by 2)</option>
              <option value="golden">Golden Point (Deuce -{'>'} Ad -{'>'} Golden)</option>
              <option value="sudden_death">Sudden Death (No Ad, win at deuce)</option>
            </select>
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
