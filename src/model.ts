export type DeuceMode = 'standard' | 'golden' | 'sudden_death';
// 'infinity' = endless set (no game cap); otherwise any positive integer.
export type SetMode = number | 'infinity';
// 'fixed'  = play exactly N games, higher game count wins (ties possible: 2-2).
// 'race'   = first player to reach N games wins (optionally by a 2-game margin).
export type SetFormat = 'fixed' | 'race';

export interface MatchConfig {
  gamesPerSet: SetMode;
  setFormat: SetFormat;
  // Race format only: when true a set must be won by a 2-game margin.
  winByTwoGames: boolean;
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
  gamesPerSet: 4,
  setFormat: 'fixed',
  winByTwoGames: true,
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
    const setRes = checkSetLogic(
      pA.games,
      pB.games,
      config.gamesPerSet,
      config.setFormat ?? 'fixed',
      config.winByTwoGames ?? true,
    );
    if (setRes.complete) {
      const now = Date.now();
      const duration = state.setStartTime > 0 ? Math.floor((now - state.setStartTime) / 1000) : 0;
      newSetHistory = [...newSetHistory, { playerA: pA.games, playerB: pB.games, duration }];
      // A drawn set (e.g. 2-2 in a fixed 4-game set) awards no set point.
      if (setRes.wonSetA) pA.sets += 1;
      else if (setRes.wonSetB) pB.sets += 1;
      pA.games = 0;
      pB.games = 0;
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

function checkSetLogic(
  gamesA: number,
  gamesB: number,
  gamesPerSet: SetMode,
  setFormat: SetFormat,
  winByTwoGames: boolean,
) {
  if (gamesPerSet === 'infinity') {
    return { complete: false, wonSetA: false, wonSetB: false };
  }

  const target = Math.max(1, Math.floor(gamesPerSet));

  if (setFormat === 'fixed') {
    // Play exactly `target` games; the set ends once they have all been
    // played. Whoever has more games wins; an even split is a drawn set.
    if (gamesA + gamesB < target) {
      return { complete: false, wonSetA: false, wonSetB: false };
    }
    return { complete: true, wonSetA: gamesA > gamesB, wonSetB: gamesB > gamesA };
  }

  // Race format: first to `target` games. Advantage sets need a 2-game lead,
  // but a target of 1 can never reach that, so fall back to a 1-game margin.
  const margin = winByTwoGames && target > 1 ? 2 : 1;
  const wonSetA = gamesA >= target && (gamesA - gamesB) >= margin;
  const wonSetB = gamesB >= target && (gamesB - gamesA) >= margin;

  return { complete: wonSetA || wonSetB, wonSetA, wonSetB };
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
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export function deuceLabel(mode: DeuceMode): string {
  switch (mode) {
    case 'standard': return 'Advantage';
    case 'golden': return 'Golden Point';
    case 'sudden_death': return 'Sudden Death';
    default: return mode;
  }
}

export function formatConfigSummary(config: MatchConfig): string {
  const format = config.setFormat ?? 'fixed';
  let games: string;
  if (config.gamesPerSet === 'infinity') {
    games = 'Endless sets';
  } else {
    const plural = config.gamesPerSet === 1 ? '' : 's';
    if (format === 'fixed') {
      games = `${config.gamesPerSet} game${plural} per set`;
    } else {
      const margin = (config.winByTwoGames ?? true) && config.gamesPerSet > 1 ? ', win by 2' : '';
      games = `First to ${config.gamesPerSet} game${plural}${margin}`;
    }
  }
  return `${games} · ${deuceLabel(config.deuceMode)}`;
}

export function displayPoint(points: number): string {
  switch (points) {
    case 0: return '0';
    case 1: return '15';
    case 2: return '30';
    case 3: return '40';
    case 4: return 'Ad';
    case 5: return 'GP'; // Golden Point decider
    default: return '';
  }
}
