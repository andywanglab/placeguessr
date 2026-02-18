"use client";
import { useEffect, useRef, useState } from "react";
import { useGame } from "../lib/gameState";
import GuessMap from "./GuessMap";

export default function PlayerView({ playerIndex }) {
  const { state, placeGuess, lockIn, replaceLocation } = useGame();
  const svRef = useRef(null);
  const svInstanceRef = useRef(null);
  const prevLocationRef = useRef(null);
  const svServiceRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const retryCountRef = useRef(0);
  const prevRoundRef = useRef(-1);
  const MAX_RETRIES = 5;

  const location = state.locations[state.currentRound];
  const guess = state.guesses[state.currentRound]?.[playerIndex];
  const isLocked = state.locked[playerIndex];
  const name = state.playerNames[playerIndex];

  // Track location key to detect changes (both round changes and replacements)
  const locationKey = location ? `${location.lat},${location.lng}` : null;

  useEffect(() => {
    if (!svRef.current || !window.google || !location) return;

    // Skip if same location already loaded
    if (prevLocationRef.current === locationKey) return;
    prevLocationRef.current = locationKey;

    // Reset retry count only on new round
    if (prevRoundRef.current !== state.currentRound) {
      prevRoundRef.current = state.currentRound;
      retryCountRef.current = 0;
    }

    setIsLoading(true);

    if (!svServiceRef.current) {
      svServiceRef.current = new google.maps.StreetViewService();
    }

    // Only player 0 triggers replacement to avoid race condition
    const shouldReplace = playerIndex === 0;

    svServiceRef.current.getPanorama(
      { location: { lat: location.lat, lng: location.lng }, radius: 5000, source: "outdoor" },
      (data, status) => {
        if (status !== "OK") {
          if (shouldReplace && retryCountRef.current < MAX_RETRIES) {
            retryCountRef.current++;
            replaceLocation(state.currentRound);
          } else {
            setIsLoading(false);
          }
          return;
        }

        const panoPos = data.location.latLng;

        if (svInstanceRef.current) {
          svInstanceRef.current.setPosition(panoPos);
          svInstanceRef.current.setPov({ heading: Math.random() * 360, pitch: 0 });
        } else {
          svInstanceRef.current = new google.maps.StreetViewPanorama(svRef.current, {
            position: panoPos,
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

        setIsLoading(false);
      }
    );
  }, [locationKey, location, state.currentRound, playerIndex, replaceLocation]);

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
      <div className="flex-1 min-h-0 relative">
        <div ref={svRef} className="w-full h-full" />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-white/80 text-sm">Loading Street View...</span>
            </div>
          </div>
        )}
      </div>

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
              disabled={!guess || isLoading}
              className={`px-6 py-2 rounded-lg font-bold text-sm text-white transition-all ${
                guess && !isLoading
                  ? `${bgColor} hover:opacity-90 shadow-lg`
                  : "bg-gray-600 cursor-not-allowed opacity-50"
              }`}
            >
              {isLoading ? "Loading..." : guess ? "Lock In" : "Click map to guess"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
