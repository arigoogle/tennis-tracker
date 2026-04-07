import React, { useEffect, useState } from 'react';
import { type MatchState, scorePoint, undoLastPoint, swapServe, displayPoint, formatDuration } from '../model';
import { Undo2, Settings } from 'lucide-react';

interface Props {
  state: MatchState;
  setState: React.Dispatch<React.SetStateAction<MatchState>>;
  onReset: () => void;
}

export const MatchScreen: React.FC<Props> = ({ state, setState, onReset }) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsedSeconds = Math.floor((now - state.setStartTime) / 1000);

  const handleScore = (player: 'A' | 'B') => {
    setState(s => scorePoint(s, player));
  };

  const handleUndo = () => {
    setState(s => undoLastPoint(s));
  };

  const handleSwapServe = () => {
    setState(s => swapServe(s));
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

      {/* Top Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-sm) 0', marginBottom: 'var(--spacing-sm)' }}>
        <button onClick={onReset} className="btn btn-secondary" style={{ padding: '8px' }}>
          <Settings size={20} />
        </button>

        {/* Set timer */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Set {state.setHistory.length + 1}
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {formatDuration(elapsedSeconds)}
          </div>
        </div>

        <button
          onClick={handleUndo}
          className="btn btn-secondary"
          disabled={state.history.length === 0}
          style={{ padding: '8px', opacity: state.history.length === 0 ? 0.5 : 1 }}
        >
          <Undo2 size={20} /> &nbsp; Undo
        </button>
      </div>

      {/* Scoreboard */}
      <div className="glass" style={{
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 'var(--spacing-md)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Player name headers */}
        <div style={{ display: 'flex' }}>
          <button
            type="button"
            onClick={handleSwapServe}
            style={{
              flex: 1, padding: '12px', borderBottom: '1px solid var(--border-color)',
              fontWeight: 600, textAlign: 'center', backgroundColor: 'var(--p1-color)',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 6, cursor: 'pointer', border: 'none',
            }}
          >
            {state.serving === 'A' && (
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#facc15', display: 'inline-block', flexShrink: 0 }} />
            )}
            {state.config.playerA}
          </button>
          <button
            type="button"
            onClick={handleSwapServe}
            style={{
              flex: 1, padding: '12px', borderBottom: '1px solid var(--border-color)',
              fontWeight: 600, textAlign: 'center', backgroundColor: 'var(--p2-color)',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 6, cursor: 'pointer', border: 'none',
            }}
          >
            {state.serving === 'B' && (
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#facc15', display: 'inline-block', flexShrink: 0 }} />
            )}
            {state.config.playerB}
          </button>
        </div>

        {/* Current sets / games row */}
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1, display: 'flex' }}>
            <div style={{ flex: 1, padding: '16px', textAlign: 'center', borderRight: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sets</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{state.playerA.sets}</div>
            </div>
            <div style={{ flex: 1, padding: '16px', textAlign: 'center', borderRight: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Games</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{state.playerA.games}</div>
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex' }}>
            <div style={{ flex: 1, padding: '16px', textAlign: 'center', borderRight: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Games</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{state.playerB.games}</div>
            </div>
            <div style={{ flex: 1, padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sets</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{state.playerB.sets}</div>
            </div>
          </div>
        </div>

        {/* Set history */}
        {state.setHistory.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-color)', padding: '8px 16px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Set History</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {state.setHistory.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)', marginRight: 2 }}>S{i + 1}</span>
                  <span style={{
                    fontWeight: 700,
                    color: s.playerA > s.playerB ? 'var(--p1-color)' : 'var(--text-secondary)'
                  }}>{s.playerA}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>–</span>
                  <span style={{
                    fontWeight: 700,
                    color: s.playerB > s.playerA ? 'var(--p2-color)' : 'var(--text-secondary)'
                  }}>{s.playerB}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: 2 }}>
                    ({formatDuration(s.duration)})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Points Area (Tap Targets) */}
      <div style={{ flex: 1, display: 'flex', gap: 'var(--spacing-md)', paddingBottom: 'var(--spacing-md)' }}>

        {/* Player A Tap Area */}
        <button
          onClick={() => handleScore('A')}
          style={{
            flex: 1,
            backgroundColor: 'var(--p1-color)',
            color: 'white',
            borderRadius: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)',
          }}
        >
          <div style={{ fontSize: '5rem', fontWeight: 800, lineHeight: 1 }}>
            {displayPoint(state.playerA.points)}
          </div>
          <div style={{ marginTop: '16px', fontWeight: 600, opacity: 0.8 }}>TAP TO SCORE</div>
        </button>

        {/* Player B Tap Area */}
        <button
          onClick={() => handleScore('B')}
          style={{
            flex: 1,
            backgroundColor: 'var(--p2-color)',
            color: 'white',
            borderRadius: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.4)',
          }}
        >
          <div style={{ fontSize: '5rem', fontWeight: 800, lineHeight: 1 }}>
            {displayPoint(state.playerB.points)}
          </div>
          <div style={{ marginTop: '16px', fontWeight: 600, opacity: 0.8 }}>TAP TO SCORE</div>
        </button>

      </div>
    </div>
  );
};
