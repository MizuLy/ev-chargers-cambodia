import { useCallback, useEffect, useState } from "react";

const OPTIONS = { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 };
const supported = typeof navigator !== "undefined" && "geolocation" in navigator;

// Starts following the user's position as soon as it mounts.
// status: "locating" | "tracking" | "denied" | "unavailable"
export default function useLiveLocation() {
  const [state, setState] = useState({
    pos: null,
    accuracy: null,
    status: supported ? "locating" : "unavailable",
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!supported) return;
    const id = navigator.geolocation.watchPosition(
      ({ coords }) =>
        setState({ pos: [coords.latitude, coords.longitude], accuracy: coords.accuracy, status: "tracking" }),
      (err) =>
        // a brief signal loss after we already have a fix is ignored; the dot stays where it was
        setState((s) =>
          err.code !== 1 && s.pos
            ? s
            : { pos: null, accuracy: null, status: err.code === 1 ? "denied" : "unavailable" },
        ),
      OPTIONS,
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ pos: null, accuracy: null, status: supported ? "locating" : "unavailable" });
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, retry };
}
