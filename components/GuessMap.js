"use client";
import { useEffect, useRef, useCallback } from "react";

export default function GuessMap({ onGuess, guess, locked, playerIndex }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.google || mapInstanceRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 20, lng: 0 },
      zoom: 2,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      gestureHandling: "greedy",
      styles: [
        {
          featureType: "administrative.country",
          elementType: "labels",
          stylers: [{ visibility: "on" }],
        },
      ],
    });

    mapInstanceRef.current = map;

    map.addListener("click", (e) => {
      if (locked) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      onGuess(lat, lng);
    });
  }, [locked, onGuess]);

  useEffect(() => {
    initMap();
  }, [initMap]);

  // Update marker when guess changes
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;

    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    if (guess) {
      markerRef.current = new google.maps.Marker({
        position: { lat: guess.lat, lng: guess.lng },
        map: mapInstanceRef.current,
        label: {
          text: `P${playerIndex + 1}`,
          color: "white",
          fontWeight: "bold",
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: playerIndex === 0 ? "#3B82F6" : "#EF4444",
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 2,
        },
      });
    }
  }, [guess, playerIndex]);

  // Handle locked state changes - update click listener
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    google.maps.event.clearListeners(map, "click");
    if (!locked) {
      map.addListener("click", (e) => {
        onGuess(e.latLng.lat(), e.latLng.lng());
      });
    }
  }, [locked, onGuess]);

  return <div ref={mapRef} className="w-full h-full rounded-lg" />;
}
