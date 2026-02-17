"use client";
import { useEffect, useRef } from "react";
import { useGame } from "../lib/gameState";
import GuessMap from "./GuessMap";

export default function PlayerView({ playerIndex }) {
  const { state, placeGuess, lockIn } = useGame();
  const svRef = useRef(null);
  const svInstanceRef = useRef(null);
  const prevRoundRef = useRef(-1);

  const location = state.locations[state.currentRound];
  const guess = state.guesses[state.currentRound]?.[playerIndex];
  const isLocked = state.locked[playerIndex];
  const name = state.playerNames[playerIndex];
  const color = playerIndex === 0 ? "blue" : "red";

  useEffect(() => {
    if (!svRef.current || !window.google || !location) return;

    // Only create/reset when round changes
    if (prevRoundRef.current !== state.currentRound) {
      prevRoundRef.current = state.currentRound;

      if (svInstanceRef.current) {
        svInstanceRef.current.setPosition({
          lat: location.lat,
          lng: location.lng,
        });
        svInstanceRef.current.setPov({ heading: Math.random() * 360, pitch: 0 });
      } else {
        svInstanceRef.current = new google.maps.StreetViewPanorama(svRef.current, {
          position: { lat: location.lat, lng: location.lng },
          pov: { heading: Math.random() * 360, pitch: 0 },
          zoom: 0,
          addressControl: false,
          showRoadLabels: false,
          enableCloseButton: false,
          fullscreenControl: false,
          motionTracking: false,
          motionTrackingControl: false,
        });
      }
    }
  }, [location, state.currentRound]);

  const handleGuess = (lat, lng) => {
    placeGuess(playerIndex, lat, lng);
  };

  const handleLock = () => {
    if (guess && !isLocked) {
      lockIn(playerIndex);
    }
  };

  const borderColor = playerIndex === 0 ? "border-blue-500" : "border-red-500";
  const bgColor = playerIndex === 0 ? "bg-blue-600" : "bg-red-600";
  const textColor = playerIndex === 0 ? "text-blue-400" : "text-red-400";

  return (
    <div className={`flex flex-col h-full border-2 ${borderColor} rounded-lg overflow-hidden bg-gray-900`}>
      {/* Header */}
      <div className={`${bgColor} px-3 py-1.5 flex justify-between items-center`}>
        <span className="text-white font-bold text-sm">{name}</span>
        <span className="text-white/80 text-xs">
          Score: {state.totalScores[playerIndex]}
        </span>
      </div>

      {/* Street View */}
      <div className="flex-1 min-h-0" ref={svRef} />

      {/* Guess Map */}
      <div className="h-[35%] relative">
        <GuessMap
          onGuess={handleGuess}
          guess={guess}
          locked={isLocked}
          playerIndex={playerIndex}
        />

        {/* Lock In button overlay */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
          {isLocked ? (
            <div className="bg-gray-800/90 text-green-400 px-4 py-2 rounded-lg font-bold text-sm">
              Locked In!
            </div>
          ) : (
            <button
              onClick={handleLock}
              disabled={!guess}
              className={`px-6 py-2 rounded-lg font-bold text-sm text-white transition-all ${
                guess
                  ? `${bgColor} hover:opacity-90 shadow-lg`
                  : "bg-gray-600 cursor-not-allowed opacity-50"
              }`}
            >
              {guess ? "Lock In" : "Click map to guess"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
