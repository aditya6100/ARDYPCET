import { useState, useCallback, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import { Menu, Zap, MapPin } from 'lucide-react';
import NavigationUI from './components/NavigationUI';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastContainer } from './components/ToastContainer';
import { useToast } from './hooks/useToast';
import { ALL_FLOORS } from './data/floorRegistry';
import { findMultiFloorPath } from './utils/multiFloorPathfinding';
import { autoLocationService, type LocationData } from './utils/autoLocation';
import { PathValidator } from './utils/pathValidator';
import type { PathSegment } from './utils/multiFloorPathfinding';
import MiniMap from './components/MiniMap';
import {
  findNearestRoom,
  findNearestWaypoint,
  lerp,
  smoothPosition,
  snapToPolyline,
  type MapPosition,
} from './utils/minimap';
import { CONFIG } from './config';

const ARScene = lazy(() => import('./components/ARScene'));

function AppContent() {
  const { toasts, toast, removeToast } = useToast();
  const [hasValidated, setHasValidated] = useState(false);

  console.log("AR System Version 2.0 - Enhanced with Auto-Location & Validation");
  
  // Validate all floor data on startup (only once)
  useEffect(() => {
    if (!hasValidated) {
      const diagnostics = PathValidator.getDiagnostics(ALL_FLOORS);
      
      // Only show warning if there are actual errors (not just info/warnings)
      const criticalErrors = diagnostics.reports.flatMap(r => 
        r.errors.filter(e => e.severity === 'error')
      );
      
      if (criticalErrors.length > 0) {
        console.warn('⚠️  Floor data issues detected:', diagnostics);
        toast('⚠️ Floor data issues detected - check console', 'warning', 5000);
      } else {
        // Log for debugging but don't show warning toast
        console.log('✓ Floor validation passed. Info messages:', diagnostics);
      }
      setHasValidated(true);
    }
  }, [hasValidated, toast]);
  // Default: start on floor 2 (CSE — your real floor)
  const defaultFloor = 'f2';
  const defaultStart = ALL_FLOORS.find(f => f.floorId === defaultFloor)?.rooms.find(r => !r.id.endsWith('_corridor'))?.id ?? '';
  const defaultEnd   = ALL_FLOORS.find(f => f.floorId === defaultFloor)?.rooms.filter(r => !r.id.endsWith('_corridor'))[1]?.id ?? '';

  const [startFloorId, setStartFloorId] = useState(defaultFloor);
  const [startRoomId,  setStartRoomId]  = useState(defaultStart);
  const [endFloorId,   setEndFloorId]   = useState(defaultFloor);
  const [endRoomId,    setEndRoomId]    = useState(defaultEnd);

  const [activeFloorId, setActiveFloorId] = useState(defaultFloor);
  const activeFloorIdRef = useRef(activeFloorId);
  useEffect(() => { activeFloorIdRef.current = activeFloorId; }, [activeFloorId]);

  const [pathSegments, setPathSegments] = useState<PathSegment[]>([]);
  const [isARActive,   setIsARActive]   = useState(false);
  const [isMenuOpen,   setIsMenuOpen]   = useState(false);
  
  // Auto-location detection
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [autoLocationEnabled, setAutoLocationEnabled] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState<number>(0);

  const [loadScene, setLoadScene] = useState(false);
  const idleLoaderCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (loadScene) return;

    type IdleCallbackDeadline = { didTimeout: boolean; timeRemaining: () => number };
    type IdleRequestCallback = (deadline: IdleCallbackDeadline) => void;

    const requestIdle = (cb: IdleRequestCallback, timeoutMs: number) => {
      const w = window as unknown as {
        requestIdleCallback?: (callback: IdleRequestCallback, opts?: { timeout: number }) => number;
        cancelIdleCallback?: (handle: number) => void;
      };

      if (typeof w.requestIdleCallback === 'function') {
        const handle = w.requestIdleCallback(cb, { timeout: timeoutMs });
        return () => w.cancelIdleCallback?.(handle);
      }

      const handle = window.setTimeout(() => cb({ didTimeout: true, timeRemaining: () => 0 }), 200);
      return () => window.clearTimeout(handle);
    };

    idleLoaderCleanupRef.current = requestIdle(() => setLoadScene(true), 1500);

    return () => {
      idleLoaderCleanupRef.current?.();
      idleLoaderCleanupRef.current = null;
    };
  }, [loadScene]);

  const handleFindPath = useCallback(() => {
    const segments = findMultiFloorPath(startRoomId, endRoomId, ALL_FLOORS);
    setPathSegments(segments);

    // Auto-switch view to the start floor
    if (segments.length > 0) {
      setActiveFloorId(segments[0].floorId);
    }
    setIsMenuOpen(false);
  }, [startRoomId, endRoomId]);

  // Auto-location detection setup
  useEffect(() => {
    if (!autoLocationEnabled) {
      autoLocationService.stop();
      return;
    }

    // Start location tracking on the current floor
    autoLocationService.start(activeFloorIdRef.current);

    // Listen for location updates
    const unsubscribe = autoLocationService.onChange((location: LocationData) => {
      setCurrentLocation(location);
      setLocationAccuracy(location.confidence);

      // Only auto-set start room, don't change activeFloorId in callback
      const activeFloor = ALL_FLOORS.find(f => f.floorId === location.floorId);
      if (activeFloor) {
        const nearestRoom = autoLocationService.findNearestRoom(location, activeFloor.rooms);
        if (nearestRoom) {
          // Only update if actually different (prevent unnecessary state updates)
          setStartFloorId(location.floorId);
          setStartRoomId(nearestRoom);
        }
      }
    });

    return () => {
      unsubscribe();
      autoLocationService.stop();
    };
  }, [autoLocationEnabled]); // Only depend on toggle, not activeFloorId

  // Minimap state (AR mode)
  const [isMiniMapOpen, setIsMiniMapOpen] = useState(false);
  const [miniMapFloorId, setMiniMapFloorId] = useState(activeFloorId);
  const [pickedMapPos, setPickedMapPos] = useState<{ floorId: string; pos: MapPosition } | null>(null);
  const [pickedRoomId, setPickedRoomId] = useState<string | null>(null);
  const [userMapPose, setUserMapPose] = useState<{ floorId: string; pos: MapPosition; headingRad: number; accuracyMeters: number | null } | null>(null);
  const userPoseRef = useRef<{ smoothed: MapPosition | null }>({
    smoothed: null,
  });

  useEffect(() => {
    if (isMiniMapOpen) setMiniMapFloorId(activeFloorId);
  }, [isMiniMapOpen, activeFloorId]);

  const miniMapFloorData = useMemo(
    () => ALL_FLOORS.find(f => f.floorId === miniMapFloorId) ?? null,
    [miniMapFloorId]
  );

  useEffect(() => {
    // Avoid carrying a selection across floors
    setPickedMapPos(null);
    setPickedRoomId(null);
  }, [miniMapFloorId]);

  const handlePickOnMap = useCallback((pos: MapPosition) => {
    if (!miniMapFloorData) return;
    setPickedMapPos({ floorId: miniMapFloorData.floorId, pos });

    const nearest = findNearestRoom(miniMapFloorData, pos, 5);
    if (nearest) {
      setPickedRoomId(nearest);
      toast('Selected room on map', 'success', 1500);
    } else {
      setPickedRoomId(null);
      toast('Tap closer to a room to set location', 'info', 2500);
    }
  }, [miniMapFloorData, toast]);

  const confirmPickedLocation = useCallback(() => {
    if (!miniMapFloorData || !pickedRoomId) {
      toast('Pick a room first', 'info', 1500);
      return;
    }

    setStartFloorId(miniMapFloorData.floorId);
    setStartRoomId(pickedRoomId);
    setActiveFloorId(miniMapFloorData.floorId);
    setIsMiniMapOpen(false);
    toast('📍 Location set', 'success', 2000);
  }, [miniMapFloorData, pickedRoomId, toast]);

  const handleStartChange = (floorId: string, roomId: string) => {
    setStartFloorId(floorId);
    setStartRoomId(roomId);
  };

  const handleEndChange = (floorId: string, roomId: string) => {
    setEndFloorId(floorId);
    setEndRoomId(roomId);
  };

  // Active floor data for 3D rendering
  const activeFloorData = ALL_FLOORS.find(f => f.floorId === activeFloorId);

  // Path segment to render on the active floor
  const activeSegment = pathSegments.find(s => s.floorId === activeFloorId) ?? null;

  return (
    <main>
      {/* Hamburger menu button */}
      {!isARActive && !isMenuOpen && (
        <button
          onClick={() => setIsMenuOpen(true)}
          className="fixed top-6 left-6 z-20 bg-slate-900/90 border border-purple-500/30 p-3 rounded-full shadow-lg text-white hover:bg-slate-800 transition-colors"
          aria-label="Open navigation menu">
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Auto-Location Button */}
      {!isARActive && !isMenuOpen && (
        <button
          onClick={() => setAutoLocationEnabled(!autoLocationEnabled)}
          className={`fixed top-6 right-6 z-20 px-4 py-2 rounded-full shadow-lg transition-all flex items-center gap-2 text-sm font-medium ${
            autoLocationEnabled
              ? 'bg-green-500/80 text-white border border-green-400'
              : 'bg-slate-900/90 border border-purple-500/30 text-slate-300 hover:bg-slate-800'
          }`}
          title={autoLocationEnabled ? 'Auto-location ON' : 'Auto-location OFF'}>
          <Zap className="w-4 h-4" />
          {autoLocationEnabled && currentLocation && (
            <>
              <MapPin className="w-4 h-4" />
              <span className="text-xs">{Math.round(locationAccuracy * 100)}%</span>
            </>
          )}
        </button>
      )}

      {/* Floor indicator badge */}
      {!isARActive && !isMenuOpen && (
        <div className="fixed top-6 left-20 z-20 bg-slate-900/90 border border-purple-500/30 px-3 py-2 rounded-full text-xs text-purple-300 font-medium">
          {ALL_FLOORS.find(f => f.floorId === activeFloorId) && (
            <>Viewing: <span className="text-white font-bold">
              {ALL_FLOORS.find(f => f.floorId === activeFloorId)?.floorName || activeFloorId}
            </span></>
          )}
        </div>
      )}

      {/* Navigation UI */}
      {!isARActive && isMenuOpen && (
        <NavigationUI
          startRoomId={startRoomId}
          startFloorId={startFloorId}
          endRoomId={endRoomId}
          endFloorId={endFloorId}
          activeFloorId={activeFloorId}
          pathSegments={pathSegments}
          onStartChange={handleStartChange}
          onEndChange={handleEndChange}
          onFloorChange={setActiveFloorId}
          onFindPath={handleFindPath}
          onClose={() => setIsMenuOpen(false)}
        />
      )}

      {/* Multi-floor guidance */}
      {activeSegment?.transition && !isMenuOpen && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-xs bg-slate-900/95 border border-amber-500/50 p-4 rounded-2xl shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-amber-500/20 p-2 rounded-lg">
              <span className="text-xl">
                {activeSegment.transition.type === 'lift' ? '🛗' : 
                 activeSegment.transition.type === 'stairs' ? '🪜' : '♿'}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Next Step</p>
              <p className="text-sm text-white font-medium">
                Take the {activeSegment.transition.name} to {ALL_FLOORS.find(f => f.floorId === activeSegment.transition?.toFloor)?.floorName || activeSegment.transition.toFloor}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveFloorId(activeSegment.transition!.toFloor)}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-2 rounded-xl transition-colors text-sm shadow-lg shadow-amber-500/20">
            Switch to {ALL_FLOORS.find(f => f.floorId === activeSegment.transition?.toFloor)?.floorName.split(' ')[0] || 'Next'} Floor
          </button>
        </div>
      )}

      {/* 3D Scene — always rendered, floor switches dynamically */}
      {activeFloorData && loadScene && (
        <Suspense fallback={<div className="fixed inset-0 z-0 bg-slate-950" />}>
          <ARScene
            floorData={activeFloorData}
            activeSegment={activeSegment}
            pathSegments={pathSegments}
            endRoomId={endFloorId === activeFloorId ? endRoomId : null}
            onSessionStateChange={setIsARActive}
            onUserPositionChange={(p) => {
              if (!p) { setUserMapPose(null); userPoseRef.current.smoothed = null; return; }

              const raw = { x: p.x, z: p.z };
              const smoothed = smoothPosition(userPoseRef.current.smoothed, raw, 0.35);
              userPoseRef.current.smoothed = smoothed;

              const floor = ALL_FLOORS.find(f => f.floorId === p.floorId) ?? null;
              let finalPos: MapPosition = smoothed;
              let accuracyMeters: number | null = null;

              if (floor) {
                const seg = pathSegments.find(s => s.floorId === p.floorId) ?? null;
                const snapPath = seg ? snapToPolyline(smoothed, seg.positions, 1.8) : null;
                if (snapPath) {
                  finalPos = snapPath.pos;
                  accuracyMeters = snapPath.distance;
                } else {
                  const nearWp = findNearestWaypoint(floor, smoothed, 1.2);
                  if (nearWp) {
                    const wp = floor.waypoints.find(w => w.id === nearWp.waypointId);
                    if (wp) {
                      finalPos = { x: wp.position[0], z: wp.position[1] };
                      accuracyMeters = nearWp.distance;
                    }
                  }
                }
              }

              const prevHeading = userMapPose?.headingRad ?? p.headingRad;
              const headingRad = lerp(prevHeading, p.headingRad, 0.25);

              setUserMapPose({ floorId: p.floorId, pos: finalPos, headingRad, accuracyMeters });
            }}
            showARButton={!isMenuOpen}
            showUIView={!isMenuOpen}
          />
        </Suspense>
      )}

      {/* Minimap overlay (AR mode) */}
      {CONFIG.ENABLE_MINIMAP && isARActive && !isMenuOpen && miniMapFloorData && (
        <>
          {/* Small minimap dock */}
          <button
            onClick={() => setIsMiniMapOpen(true)}
            className="fixed bottom-6 left-6 z-50 bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-purple-500/30 p-2 rounded-3xl shadow-2xl hover:brightness-110 transition-all"
            aria-label="Open map">
            <MiniMap
              floorData={miniMapFloorData}
              size={140}
              userPosition={userMapPose?.floorId === miniMapFloorData.floorId ? userMapPose.pos : null}
              userHeadingRad={userMapPose?.floorId === miniMapFloorData.floorId ? userMapPose.headingRad : null}
              pickedPosition={pickedMapPos?.floorId === miniMapFloorData.floorId ? pickedMapPos.pos : null}
              path={(pathSegments.find(s => s.floorId === miniMapFloorData.floorId)?.positions ?? []).map(([x, z]) => ({ x, z }))}
              showWaypoints={false}
            />
            <div className="mt-2 flex items-center justify-between px-1">
              <span className="text-[10px] text-slate-200 font-bold">{miniMapFloorData.floorId.toUpperCase()}</span>
              <span className="text-[10px] text-purple-200 font-semibold">
                {userMapPose?.accuracyMeters !== null && userMapPose?.floorId === miniMapFloorData.floorId
                  ? `±${userMapPose.accuracyMeters.toFixed(1)}m`
                  : 'AR'}
              </span>
            </div>
          </button>

          {/* Full map */}
          {isMiniMapOpen && (
            <div className="fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-slate-900/95 border border-purple-500/30 rounded-3xl p-4 shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-purple-300 font-bold uppercase tracking-wider">Map</p>
                    <p className="text-sm text-white font-semibold">{miniMapFloorData.floorName}</p>
                    <p className="text-[11px] text-slate-400">Drag to pan • scroll/pinch to zoom • tap to select</p>
                  </div>
                  <button
                    onClick={() => setIsMiniMapOpen(false)}
                    className="px-3 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700">
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-6 gap-1 mb-3">
                  {ALL_FLOORS.map(f => (
                    <button
                      key={f.floorId}
                      onClick={() => setMiniMapFloorId(f.floorId)}
                      className={`text-[11px] py-1.5 rounded-lg font-bold transition-colors ${
                        miniMapFloorId === f.floorId ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}>
                      {f.floorId.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-center">
                  <div className="rounded-2xl overflow-hidden">
                    <MiniMap
                      floorData={miniMapFloorData}
                      size={320}
                      userPosition={userMapPose?.floorId === miniMapFloorData.floorId ? userMapPose.pos : null}
                      userHeadingRad={userMapPose?.floorId === miniMapFloorData.floorId ? userMapPose.headingRad : null}
                      pickedPosition={pickedMapPos?.floorId === miniMapFloorData.floorId ? pickedMapPos.pos : null}
                      path={(pathSegments.find(s => s.floorId === miniMapFloorData.floorId)?.positions ?? []).map(([x, z]) => ({ x, z }))}
                      interactive
                      showWaypoints
                      onPickPosition={handlePickOnMap}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-300">
                    <div>You: <span className="text-blue-300 font-bold">blue</span></div>
                    <div>Selected: <span className="text-amber-300 font-bold">yellow</span></div>
                    <div className="mt-1 text-slate-400">
                      {pickedRoomId
                        ? `Selected room: ${miniMapFloorData.rooms.find(r => r.id === pickedRoomId)?.name ?? pickedRoomId}`
                        : 'Select a room to enable “Set Start Here”'}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => { setPickedMapPos(null); setPickedRoomId(null); }}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-sm">
                      Clear
                    </button>
                    <button
                      onClick={confirmPickedLocation}
                      disabled={!pickedRoomId}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                        pickedRoomId
                          ? 'bg-amber-400 text-slate-900 hover:bg-amber-300'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}>
                      Set Start Here
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </main>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
