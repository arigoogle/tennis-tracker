export type DeuceMode = 'standard' | 'golden' | 'sudden_death';
export type SetMode = 4 | 6 | 'infinity';

export interface MatchConfig {
  gamesPerSet: SetMode;
  deuceMode: DeuceMode;
  playerA: string;
  playerB: string;
  firstServe: 'A' | 'B';
}

export interface PlayerScore {
  points: number; // 0=0, 1=15, 2=30, 3=40, 4=Ad
  games: number;
  sets: number;
}

export interface SetResult {
  playerA: number;
  playerB: number;
  duration: number; // seconds
}

export interface MatchState {
  config: MatchConfig;
  status: 'setup' | 'playing' | 'finished';
  playerA: PlayerScore;
  playerB: PlayerScore;
  serving: 'A' | 'B';
  setStartTime: number; // ms timestamp when current set began
  setHistory: SetResult[]; // Completed sets scores
  history: MatchState[]; // For undo functionality
}

export const initialConfig: MatchConfig = {
  gamesPerSet: 6,
  deuceMode: 'standard',
  playerA: 'Player A',
  playerB: 'Player B',
  firstServe: 'A',
};

export const initialMatchState: MatchState = {
  config: initialConfig,
  status: 'setup',
  playerA: { points: 0, games: 0, sets: 0 },
  playerB: { points: 0, games: 0, sets: 0 },
  serving: 'A',
  setStartTime: 0,
  setHistory: [],
  history: [],
};

export function scorePoint(state: MatchState, player: 'A' | 'B'): MatchState {
  const historySnapshot = { ...state, history: [] };
  
  let pA = { ...state.playerA };
  let pB = { ...state.playerB };
  const config = state.config;
  
  if (player === 'A') {
    const res = calculatePoints(pA.points, pB.points, config.deuceMode);
    pA.points = res.scored;
    pB.points = res.other;
    if (res.wonGame) {
      pA.games += 1;
      pA.points = 0;
      pB.points = 0;
    }
  } else {
    const res = calculatePoints(pB.points, pA.points, config.deuceMode);
    pB.points = res.scored;
    pA.points = res.other;
    if (res.wonGame) {
      pB.games += 1;
      pB.points = 0;
      pA.points = 0;
    }
  }

  // Set Logic — also track serve switches per game won
  let newSetHistory = state.setHistory;
  let serving = state.serving;
  let setStartTime = state.setStartTime;

  const gameWon = pA.points === 0 && pB.points === 0 &&
    (pA.games !== state.playerA.games || pB.games !== state.playerB.games);

  if (pA.points === 0 && pB.points === 0) {
    const setRes = checkSetLogic(pA.games, pB.games, config.gamesPerSet);
    if (setRes.wonSetA || setRes.wonSetB) {
      const now = Date.now();
      const duration = state.setStartTime > 0 ? Math.floor((now - state.setStartTime) / 1000) : 0;
      if (setRes.wonSetA) {
        newSetHistory = [...newSetHistory, { playerA: pA.games, playerB: pB.games, duration }];
        pA.sets += 1;
        pA.games = 0;
        pB.games = 0;
      } else {
        newSetHistory = [...newSetHistory, { playerA: pA.games, playerB: pB.games, duration }];
        pB.sets += 1;
        pB.games = 0;
        pA.games = 0;
      }
      setStartTime = now;
    }
  }

  if (gameWon) {
    serving = serving === 'A' ? 'B' : 'A';
  }

  return {
    ...state,
    playerA: pA,
    playerB: pB,
    serving,
    setStartTime,
    setHistory: newSetHistory,
    history: [...state.history, historySnapshot],
  };
}

function calculatePoints(scoredPoints: number, otherPoints: number, deuceMode: DeuceMode) {
  let scored = scoredPoints + 1;
  let other = otherPoints;
  let wonGame = false;

  if (scored === 4) {
    if (other < 3) {
      wonGame = true; // Win at 40-xx
    } else if (other === 3) {
      // 40-40 Deuce
      if (deuceMode === 'sudden_death') {
        wonGame = true; // Next point wins
      } else {
        scored = 4; // Advantage
      }
    } else if (other === 4) {
      // Other had Ad, it returns to a tie
      if (deuceMode === 'golden') {
        scored = 5; // Golden state
        other = 5;
      } else {
        scored = 3; // Back to Deuce
        other = 3;
      }
    }
  } else if (scored > 4) {
    wonGame = true; // Win from Ad or Golden
  }

  return { scored, other, wonGame };
}

function checkSetLogic(gamesA: number, gamesB: number, gamesPerSet: SetMode) {
  if (gamesPerSet === 'infinity') {
    return { wonSetA: false, wonSetB: false };
  }
  
  const target = gamesPerSet;
  let wonSetA = false;
  let wonSetB = false;
  
  if (gamesA >= target && (gamesA - gamesB) >= 2) wonSetA = true;
  if (gamesB >= target && (gamesB - gamesA) >= 2) wonSetB = true;
  
  return { wonSetA, wonSetB };
}

export function swapServe(state: MatchState): MatchState {
  return { ...state, serving: state.serving === 'A' ? 'B' : 'A' };
}

export function undoLastPoint(state: MatchState): MatchState {
  if (state.history.length === 0) return state;
  const prevState = state.history[state.history.length - 1];
  return {
    ...prevState,
    history: state.history.slice(0, -1),
  };
}

export function resetMatch(config: MatchConfig): MatchState {
  return {
    ...initialMatchState,
    config,
    serving: config.firstServe,
    setStartTime: Date.now(),
    status: 'playing',
  };
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function displayPoint(points: number): string {
  switch (points) {
    case 0: return '0';
    case 1: return '15';
    case 2: return '30';
    case 3: return '40';
    case 4: return 'Ad';
    case 5: return 'Golden';
    default: return '';
  }
}
