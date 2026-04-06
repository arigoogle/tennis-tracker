import React from 'react';
import { type MatchState, scorePoint, undoLastPoint, displayPoint } from '../model';
import { Undo2, Settings } from 'lucide-react';

interface Props {
  state: MatchState;
  setState: React.Dispatch<React.SetStateAction<MatchState>>;
  onReset: () => void;
}

export const MatchScreen: React.FC<Props> = ({ state, setState, onReset }) => {
  const handleScore = (player: 'A' | 'B') => {
    setState(s => scorePoint(s, player));
  };

  const handleUndo = () => {
    setState(s => undoLastPoint(s));
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-sm) 0', marginBottom: 'var(--spacing-sm)' }}>
        <button onClick={onReset} className="btn btn-secondary" style={{ padding: '8px' }}>
          <Settings size={20} />
        </button>
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
        display: 'flex', 
        borderRadius: 16, 
        overflow: 'hidden',
        marginBottom: 'var(--spacing-md)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Player Headers */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', fontWeight: 600, textAlign: 'center', backgroundColor: 'var(--p1-color)', color: 'white' }}>
            {state.config.playerA}
          </div>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ flex: 1, padding: '16px', textAlign: 'center', borderRight: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sets</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{state.playerA.sets}</div>
            </div>
            <div style={{ flex: 1, padding: '16px', textAlign: 'center', borderRight: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Games</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{state.playerA.games}</div>
            </div>
          </div>
        </div>

        {/* Player B */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', fontWeight: 600, textAlign: 'center', backgroundColor: 'var(--p2-color)', color: 'white' }}>
            {state.config.playerB}
          </div>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
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
