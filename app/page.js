"use client";
import { GoogleMapsProvider, useGoogleMaps } from "../lib/googleMaps";
import { GameProvider, useGame } from "../lib/gameState";
import Lobby from "../components/Lobby";
import PlayerView from "../components/PlayerView";
import ScoreBoard from "../components/ScoreBoard";
import ResultsScreen from "../components/ResultsScreen";

function GameContent() {
  const { state } = useGame();
  const mapsLoaded = useGoogleMaps();

  if (state.phase === "lobby") {
    return <Lobby />;
  }

  if (!mapsLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading Google Maps...</div>
      </div>
    );
  }

  if (state.phase === "finalResult") {
    return <ResultsScreen />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Round indicator */}
      <div className="bg-gray-800 px-4 py-2 flex justify-center items-center gap-4 shrink-0">
        <span className="text-gray-400 text-sm">
          Round {state.currentRound + 1} of {state.totalRounds}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: state.totalRounds }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < state.currentRound
                  ? "bg-green-500"
                  : i === state.currentRound
                  ? "bg-yellow-400"
                  : "bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Split screen */}
      <div className="flex-1 grid grid-cols-2 gap-1 p-1 min-h-0">
        <PlayerView playerIndex={0} />
        <PlayerView playerIndex={1} />
      </div>

      {/* Round result overlay */}
      {state.phase === "roundResult" && <ScoreBoard />}
    </div>
  );
}

export default function Home() {
  return (
    <GoogleMapsProvider>
      <GameProvider>
        <GameContent />
      </GameProvider>
    </GoogleMapsProvider>
  );
}
