"use client";
import { useState } from "react";
import { useGame } from "../lib/gameState";
import { useGoogleMaps } from "../lib/googleMaps";

export default function Lobby() {
  const { startGame } = useGame();
  const mapsLoaded = useGoogleMaps();
  const [names, setNames] = useState(["", ""]);

  const handleStart = () => {
    if (!mapsLoaded) return;
    const p1 = names[0].trim() || "Player 1";
    const p2 = names[1].trim() || "Player 2";
    startGame([p1, p2]);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
        <h1 className="text-4xl font-bold text-white text-center mb-2">
          PlaceGuessr
        </h1>
        <p className="text-gray-400 text-center mb-8">
          2-Player Split Screen Battle
        </p>

        <div className="space-y-4 mb-8">
          {[0, 1].map((i) => (
            <div key={i}>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Player {i + 1}
              </label>
              <input
                type="text"
                placeholder={`Player ${i + 1}`}
                value={names[i]}
                onChange={(e) => {
                  const n = [...names];
                  n[i] = e.target.value;
                  setNames(n);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleStart}
          disabled={!mapsLoaded}
          className={`w-full py-4 font-bold text-lg rounded-lg transition-colors ${
            mapsLoaded
              ? "bg-green-600 hover:bg-green-500 text-white"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }`}
        >
          {mapsLoaded ? "Start Game" : "Loading Maps..."}
        </button>

        <div className="mt-6 text-gray-500 text-sm text-center">
          <p>5 rounds - Guess locations on the map</p>
          <p>Closest guess wins the most points!</p>
        </div>
      </div>
    </div>
  );
}
