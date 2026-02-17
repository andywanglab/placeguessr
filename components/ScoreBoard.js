"use client";
import { useGame } from "../lib/gameState";
import { formatDistance } from "../lib/scoring";
import ResultMap from "./ResultMap";

export default function ScoreBoard() {
  const { state, nextRound } = useGame();
  const round = state.currentRound;
  const location = state.locations[round];
  const isLastRound = round >= state.totalRounds - 1;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
        <h2 className="text-2xl font-bold text-white text-center mb-1">
          Round {round + 1} Results
        </h2>
        <p className="text-gray-400 text-center mb-4 text-sm">
          {location.name}
        </p>

        {/* Results map */}
        <div className="h-64 mb-4 rounded-lg overflow-hidden border border-gray-600">
          <ResultMap
            actual={location}
            guesses={state.guesses[round]}
            playerNames={state.playerNames}
          />
        </div>

        <div className="space-y-3 mb-4">
          {[0, 1].map((i) => {
            const dist = state.distances[round][i];
            const score = state.scores[round][i];
            const isWinner =
              state.scores[round][i] > state.scores[round][1 - i];
            const color = i === 0 ? "blue" : "red";

            return (
              <div
                key={i}
                className={`p-4 rounded-xl border-2 ${
                  isWinner ? (i === 0 ? "border-blue-500 bg-blue-500/10" : "border-red-500 bg-red-500/10") : "border-gray-600 bg-gray-700/50"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className={`font-bold ${i === 0 ? "text-blue-400" : "text-red-400"}`}>
                      {state.playerNames[i]}
                    </span>
                    {isWinner && (
                      <span className="ml-2 text-yellow-400 text-sm">Winner!</span>
                    )}
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {score}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  {formatDistance(dist)} away
                </p>
              </div>
            );
          })}
        </div>

        {/* Running totals */}
        <div className="bg-gray-700/50 rounded-lg p-3 mb-6">
          <div className="flex justify-between text-sm text-gray-300">
            <span>
              <span className="text-blue-400">{state.playerNames[0]}</span>:{" "}
              {state.totalScores[0]}
            </span>
            <span className="text-gray-500">Total Score</span>
            <span>
              <span className="text-red-400">{state.playerNames[1]}</span>:{" "}
              {state.totalScores[1]}
            </span>
          </div>
        </div>

        <button
          onClick={nextRound}
          className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors"
        >
          {isLastRound ? "See Final Results" : `Next Round (${round + 2}/${state.totalRounds})`}
        </button>
      </div>
    </div>
  );
}
