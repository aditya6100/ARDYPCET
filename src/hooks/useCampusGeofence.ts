import { useCallback, useMemo, useRef, useState } from "react";
import { CONFIG } from "../config";
import { haversineDistanceMeters } from "../utils/geo";

export type CampusGeofenceState =
  | { status: "disabled" }
  | {
      status: "idle" | "checking";
      inside: boolean | null;
      distanceMeters: number | null;
      coords: GeolocationCoordinates | null;
    }
  | {
      status: "error";
      message: string;
      inside: boolean | null;
      distanceMeters: number | null;
      coords: GeolocationCoordinates | null;
    };

export function useCampusGeofence() {
  const [coords, setCoords] = useState<GeolocationCoordinates | null>(null);
  const [inside, setInside] = useState<boolean | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);

  const compute = useCallback((c: GeolocationCoordinates) => {
    const d = haversineDistanceMeters(
      { lat: c.latitude, lon: c.longitude },
      { lat: CONFIG.CAMPUS_CENTER.lat, lon: CONFIG.CAMPUS_CENTER.lon }
    );
    setDistanceMeters(d);
    setInside(d <= CONFIG.CAMPUS_RADIUS_METERS);
  }, []);

  const checkOnce = useCallback(() => {
    if (!CONFIG.CAMPUS_GEOFENCE_ENABLED) return;
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported on this device/browser");
      return;
    }

    setIsChecking(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords(pos.coords);
        compute(pos.coords);
        setIsChecking(false);
      },
      (e) => {
        setError(e.message || "Geolocation permission denied");
        setIsChecking(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 15000 }
    );
  }, [compute]);

  const startWatch = useCallback(() => {
    if (!CONFIG.CAMPUS_GEOFENCE_ENABLED) return;
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported on this device/browser");
      return;
    }
    if (watchIdRef.current !== null) return;

    setError(null);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords(pos.coords);
        compute(pos.coords);
      },
      (e) => setError(e.message || "Geolocation error"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 }
    );
  }, [compute]);

  const stopWatch = useCallback(() => {
    if (watchIdRef.current === null) return;
    navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
  }, []);

  const state: CampusGeofenceState = useMemo(() => {
    if (!CONFIG.CAMPUS_GEOFENCE_ENABLED) return { status: "disabled" };
    if (error) return { status: "error", message: error, inside, distanceMeters, coords };
    if (isChecking) return { status: "checking", inside, distanceMeters, coords };
    return { status: "idle", inside, distanceMeters, coords };
  }, [coords, distanceMeters, error, inside, isChecking]);

  return { state, checkOnce, startWatch, stopWatch };
}
