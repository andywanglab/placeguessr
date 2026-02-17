"use client";
import { useEffect, useRef, useState } from "react";
import { useGame } from "../lib/gameState";
import GuessMap from "./GuessMap";

export default function PlayerView({ playerIndex }) {
  const { state, placeGuess, lockIn, replaceLocation } = useGame();
  const svRef = useRef(null);
  const svInstanceRef = useRef(null);
  const prevRoundRef = useRef(-1);
  const svServiceRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 10;

  const location = state.locations[state.currentRound];
  const guess = state.guesses[state.currentRound]?.[playerIndex];
  const isLocked = state.locked[playerIndex];
  const name = state.playerNames[playerIndex];
  const color = playerIndex === 0 ? "blue" : "red";

  // Check if Street View is available at the location
  const checkStreetViewAvailable = async (lat, lng) => {
    if (!window.google?.maps?.StreetViewService) {
      return false;
    }

    if (!svServiceRef.current) {
      svServiceRef.current = new google.maps.StreetViewService();
    }

    return new Promise((resolve) => {
      svServiceRef.current.getPanorama(
        { location: { lat, lng }, radius: 1000 },
        (data, status) => {
          resolve(status === "OK");
        }
      );
    });
  };

  useEffect(() => {
    if (!svRef.current || !window.google || !location) return;

    // Only process when round changes
    if (prevRoundRef.current !== state.currentRound) {
      prevRoundRef.current = state.currentRound;
      setIsLoading(true);
      setError(null);
      retryCountRef.current = 0;

      const loadStreetView = async () => {
        const available = await checkStreetViewAvailable(location.lat, location.lng);

        if (!available) {
          // Try to get a new location if Street View is not available
          if (retryCountRef.current < MAX_RETRIES) {
            retryCountRef.current++;
            console.log(`No Street View at ${location.name}, trying new location (attempt ${retryCountRef.current})`);
            replaceLocation(state.currentRound);
            return;
          } else {
            setError("Unable to find a location with Street View coverage");
            setIsLoading(false);
            return;
          }
        }

        // Street View is available, create or update panorama
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

        // Listen for panorama ready event
        const handleReady = () => {
          setIsLoading(false);
        };

        const handleError = () => {
          if (retryCountRef.current < MAX_RETRIES) {
            retryCountRef.current++;
            replaceLocation(state.currentRound);
          } else {
            setError("Failed to load Street View");
            setIsLoading(false);
          }
        };

        google.maps.event.addListenerOnce(svInstanceRef.current, 'pano_changed', handleReady);
        google.maps.event.addListenerOnce(svInstanceRef.current, 'error', handleError);

        // Fallback timeout in case events don't fire
        setTimeout(() => {
          setIsLoading(false);
        }, 5000);
      };

      loadStreetView();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, state.currentRound, replaceLocation]);

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
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center p-4">
              <span className="text-red-400 text-sm">{error}</span>
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
