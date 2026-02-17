"use client";
import { useGame } from "../lib/gameState";
import { formatDistance } from "../lib/scoring";

export default function ResultsScreen() {
  const { state, restart } = useGame();
  const winner =
    state.totalScores[0] > state.totalScores[1]
      ? 0
      : state.totalScores[1] > state.totalScores[0]
      ? 1
      : -1; // tie

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Game Over!
        </h1>
        <p className="text-center text-xl mb-8">
          {winner === -1 ? (
            <span className="text-yellow-400 font-bold">It&apos;s a tie!</span>
          ) : (
            <span className={winner === 0 ? "text-blue-400" : "text-red-400"}>
              <span className="font-bold">{state.playerNames[winner]}</span>{" "}
              wins!
            </span>
          )}
        </p>

        {/* Final scores */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`p-6 rounded-xl border-2 text-center ${
                winner === i
                  ? i === 0
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-red-500 bg-red-500/10"
                  : "border-gray-600 bg-gray-700/50"
              }`}
            >
              <p className={`font-bold text-lg ${i === 0 ? "text-blue-400" : "text-red-400"}`}>
                {state.playerNames[i]}
              </p>
              <p className="text-4xl font-bold text-white mt-2">
                {state.totalScores[i]}
              </p>
              <p className="text-gray-400 text-sm mt-1">points</p>
            </div>
          ))}
        </div>

        {/* Round breakdown */}
        <div className="mb-8">
          <h3 className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wide">
            Round Breakdown
          </h3>
          <div className="space-y-2">
            {state.locations.map((loc, round) => (
              <div
                key={round}
                className="bg-gray-700/50 rounded-lg p-3 flex items-center justify-between text-sm"
              >
                <span className="text-gray-300 w-24 shrink-0">
                  R{round + 1}: {loc.name}
                </span>
                <div className="flex gap-8">
                  <span className="text-blue-400">
                    {state.scores[round][0]} pts ({formatDistance(state.distances[round][0])})
                  </span>
                  <span className="text-red-400">
                    {state.scores[round][1]} pts ({formatDistance(state.distances[round][1])})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={restart}
          className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-lg rounded-lg transition-colors"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
