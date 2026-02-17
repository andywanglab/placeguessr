"use client";
import { useEffect, useRef } from "react";

export default function ResultMap({ actual, guesses, playerNames }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    const points = [actual, ...guesses.filter(Boolean)];
    const bounds = new google.maps.LatLngBounds();
    points.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));

    const map = new google.maps.Map(mapRef.current, {
      center: bounds.getCenter(),
      zoom: 2,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
    });

    map.fitBounds(bounds, 40);

    // Actual location marker (green star)
    new google.maps.Marker({
      position: { lat: actual.lat, lng: actual.lng },
      map,
      label: { text: "!", color: "white", fontWeight: "bold", fontSize: "14px" },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 16,
        fillColor: "#22C55E",
        fillOpacity: 1,
        strokeColor: "white",
        strokeWeight: 3,
      },
      zIndex: 10,
    });

    // Player guess markers + lines
    const colors = ["#3B82F6", "#EF4444"];
    guesses.forEach((guess, i) => {
      if (!guess) return;

      new google.maps.Marker({
        position: { lat: guess.lat, lng: guess.lng },
        map,
        label: { text: `P${i + 1}`, color: "white", fontWeight: "bold" },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: colors[i],
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 2,
        },
      });

      new google.maps.Polyline({
        path: [
          { lat: guess.lat, lng: guess.lng },
          { lat: actual.lat, lng: actual.lng },
        ],
        map,
        strokeColor: colors[i],
        strokeOpacity: 0.8,
        strokeWeight: 3,
        geodesic: true,
        icons: [
          {
            icon: { path: google.maps.SymbolPath.FORWARD_OPEN_ARROW, scale: 3 },
            offset: "50%",
          },
        ],
      });
    });
  }, [actual, guesses, playerNames]);

  return <div ref={mapRef} className="w-full h-full rounded-lg" />;
}
