"use client";
import { createContext, useContext, useReducer, useCallback } from "react";
import { getRandomLocations, locations } from "./locations";
import { haversineDistance, calculateScore } from "./scoring";

const TOTAL_ROUNDS = 5;

const initialState = {
  phase: "lobby", // lobby | playing | roundResult | finalResult
  playerNames: ["Player 1", "Player 2"],
  currentRound: 0,
  totalRounds: TOTAL_ROUNDS,
  locations: [],
  // guesses[round][playerIndex] = {lat, lng} or null
  guesses: [],
  // locked[playerIndex] = boolean
  locked: [false, false],
  // scores[round][playerIndex] = number
  scores: [],
  // distances[round][playerIndex] = number (km)
  distances: [],
  // totalScores[playerIndex]
  totalScores: [0, 0],
};

function reducer(state, action) {
  switch (action.type) {
    case "START_GAME": {
      const locations = getRandomLocations(TOTAL_ROUNDS);
      return {
        ...initialState,
        phase: "playing",
        playerNames: action.playerNames,
        locations,
        guesses: Array.from({ length: TOTAL_ROUNDS }, () => [null, null]),
        scores: Array.from({ length: TOTAL_ROUNDS }, () => [0, 0]),
        distances: Array.from({ length: TOTAL_ROUNDS }, () => [0, 0]),
        locked: [false, false],
      };
    }
    case "PLACE_GUESS": {
      const { playerIndex, lat, lng } = action;
      if (state.locked[playerIndex]) return state;
      const newGuesses = state.guesses.map((r) => [...r]);
      newGuesses[state.currentRound][playerIndex] = { lat, lng };
      return { ...state, guesses: newGuesses };
    }
    case "LOCK_IN": {
      const { playerIndex } = action;
      const guess = state.guesses[state.currentRound][playerIndex];
      if (!guess || state.locked[playerIndex]) return state;

      const newLocked = [...state.locked];
      newLocked[playerIndex] = true;

      // If both locked, calculate scores
      const bothLocked = newLocked.every(Boolean);
      if (bothLocked) {
        const loc = state.locations[state.currentRound];
        const newScores = state.scores.map((r) => [...r]);
        const newDistances = state.distances.map((r) => [...r]);
        const newTotalScores = [...state.totalScores];

        for (let i = 0; i < 2; i++) {
          const g = state.guesses[state.currentRound][i] || (i === playerIndex ? guess : null);
          if (g) {
            const dist = haversineDistance(loc.lat, loc.lng, g.lat, g.lng);
            const score = calculateScore(dist);
            newScores[state.currentRound][i] = score;
            newDistances[state.currentRound][i] = dist;
            newTotalScores[i] += score;
          }
        }

        // Recalculate with the current guess included
        const currentGuesses = state.guesses.map((r) => [...r]);
        currentGuesses[state.currentRound][playerIndex] = guess;
        for (let i = 0; i < 2; i++) {
          const g = currentGuesses[state.currentRound][i];
          if (g) {
            const dist = haversineDistance(loc.lat, loc.lng, g.lat, g.lng);
            const score = calculateScore(dist);
            newScores[state.currentRound][i] = score;
            newDistances[state.currentRound][i] = dist;
          }
        }
        // Recalc totals
        newTotalScores[0] = newScores.reduce((sum, r) => sum + r[0], 0);
        newTotalScores[1] = newScores.reduce((sum, r) => sum + r[1], 0);

        return {
          ...state,
          locked: newLocked,
          scores: newScores,
          distances: newDistances,
          totalScores: newTotalScores,
          guesses: currentGuesses,
          phase: "roundResult",
        };
      }

      return { ...state, locked: newLocked };
    }
    case "NEXT_ROUND": {
      const nextRound = state.currentRound + 1;
      if (nextRound >= TOTAL_ROUNDS) {
        return { ...state, phase: "finalResult" };
      }
      return {
        ...state,
        phase: "playing",
        currentRound: nextRound,
        locked: [false, false],
      };
    }
    case "RESTART": {
      return { ...initialState };
    }
    case "REPLACE_LOCATION": {
      const { roundIndex } = action;
      const newLocations = [...state.locations];
      // Get a new random location that's not already in use
      const usedLocations = new Set(newLocations.map(l => `${l.lat},${l.lng}`));
      const availableLocations = locations.filter(
        l => !usedLocations.has(`${l[0]},${l[1]}`)
      );
      if (availableLocations.length > 0) {
        const [lat, lng, name] = availableLocations[Math.floor(Math.random() * availableLocations.length)];
        newLocations[roundIndex] = { lat, lng, name };
      }
      return { ...state, locations: newLocations };
    }
    default:
      return state;
  }
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const startGame = useCallback((playerNames) => {
    dispatch({ type: "START_GAME", playerNames });
  }, []);

  const placeGuess = useCallback((playerIndex, lat, lng) => {
    dispatch({ type: "PLACE_GUESS", playerIndex, lat, lng });
  }, []);

  const lockIn = useCallback((playerIndex) => {
    dispatch({ type: "LOCK_IN", playerIndex });
  }, []);

  const nextRound = useCallback(() => {
    dispatch({ type: "NEXT_ROUND" });
  }, []);

  const restart = useCallback(() => {
    dispatch({ type: "RESTART" });
  }, []);

  const replaceLocation = useCallback((roundIndex) => {
    dispatch({ type: "REPLACE_LOCATION", roundIndex });
  }, []);

  return (
    <GameContext.Provider
      value={{ state, startGame, placeGuess, lockIn, nextRound, restart, replaceLocation }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
