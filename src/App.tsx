import { useState, useEffect } from 'react';
import { initialMatchState, type MatchState } from './model';
import { ConfigScreen } from './components/ConfigScreen';
import { MatchScreen } from './components/MatchScreen';

function App() {
  const [state, setState] = useState<MatchState>(() => {
    const saved = localStorage.getItem('tennis-os-state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialMatchState;
      }
    }
    return initialMatchState;
  });

  // Persist state to local storage
  useEffect(() => {
    localStorage.setItem('tennis-os-state', JSON.stringify(state));
  }, [state]);

  const handleStart = (config: typeof initialMatchState.config) => {
    setState({
      ...initialMatchState,
      config,
      status: 'playing',
    });
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to exit to settings? Current game progress will be reset.')) {
      setState(initialMatchState);
    }
  };

  return (
    <div className="container" style={{ WebkitUserSelect: 'none', userSelect: 'none' }}>
      {state.status === 'setup' ? (
        <ConfigScreen 
          initialConfig={state.config} 
          onStart={handleStart} 
        />
      ) : (
        <MatchScreen 
          state={state} 
          setState={setState} 
          onReset={handleReset} 
        />
      )}
    </div>
  );
}

export default App;
