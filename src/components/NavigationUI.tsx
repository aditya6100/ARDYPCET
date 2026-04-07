import { useMemo } from 'react';
import { MapPin, Navigation, X, Layers, ArrowUp, ArrowDown } from 'lucide-react';
import { floors, ALL_FLOORS } from '../data/floorRegistry';
import type { PathSegment } from '../utils/multiFloorPathfinding';

const CONNECTOR_ICONS: Record<string, string> = {
  lift:   '🛗',
  stairs: '🪜',
  ramp:   '♿',
};

interface NavigationUIProps {
  startRoomId: string;
  startFloorId: string;
  endRoomId: string;
  endFloorId: string;
  activeFloorId: string;
  pathSegments: PathSegment[];
  onStartChange: (floorId: string, roomId: string) => void;
  onEndChange:   (floorId: string, roomId: string) => void;
  onFloorChange: (floorId: string) => void;
  onFindPath: () => void;
  onClose: () => void;
}

export default function NavigationUI({
  startRoomId, startFloorId,
  endRoomId,   endFloorId,
  activeFloorId,
  pathSegments,
  onStartChange, onEndChange,
  onFloorChange,
  onFindPath, onClose,
}: NavigationUIProps) {

  const roomsByFloor = useMemo(() =>
    ALL_FLOORS.map(floor => ({
      floorId: floor.floorId,
      label: floors.find(f => f.id === floor.floorId)?.label ?? floor.floorId,
      rooms: floor.rooms.filter(r => r.connectedTo?.length > 0 && !r.id.endsWith('_corridor')),
    })),
  []);

  const isSameFloor = startFloorId === endFloorId;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-20 bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl p-5 w-full max-w-sm border border-purple-500/30">

      <button onClick={onClose}
        className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors">
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-2 rounded-xl">
          <Navigation className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">AR Navigation</h1>
          <p className="text-xs text-purple-300">Multi-Floor System</p>
        </div>
      </div>

      {/* Active Floor View Switcher */}
      <div className="mb-4">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5">
          <Layers className="w-3.5 h-3.5" /> Viewing Floor
        </label>
        <div className="grid grid-cols-3 gap-1">
          {floors.map(f => (
            <button key={f.id}
              onClick={() => onFloorChange(f.id)}
              className={`text-xs py-1.5 px-2 rounded-lg font-medium transition-all truncate ${
                activeFloorId === f.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}>
              F{f.number}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {/* FROM */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-green-400" /> From
          </label>
          <select value={startFloorId}
            onChange={e => {
              const fd = ALL_FLOORS.find(f => f.floorId === e.target.value);
              const fr = fd?.rooms.find(r => !r.id.endsWith('_corridor'));
              onStartChange(e.target.value, fr?.id ?? '');
            }}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-xl text-white text-xs mb-1 focus:outline-none focus:ring-2 focus:ring-purple-500">
            {roomsByFloor.map(f => <option key={f.floorId} value={f.floorId}>{f.label}</option>)}
          </select>
          <select value={startRoomId}
            onChange={e => onStartChange(startFloorId, e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500">
            {roomsByFloor.find(f => f.floorId === startFloorId)?.rooms.map(r =>
              <option key={r.id} value={r.id}>{r.name}</option>
            )}
          </select>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-slate-700" />
          <div className="flex items-center gap-1 text-xs text-purple-400">
            {!isSameFloor ? <><ArrowDown className="w-3 h-3"/><span>cross-floor</span><ArrowUp className="w-3 h-3"/></> : <span className="text-slate-500">same floor</span>}
          </div>
          <div className="flex-1 h-px bg-slate-700" />
        </div>

        {/* TO */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-red-400" /> To
          </label>
          <select value={endFloorId}
            onChange={e => {
              const fd = ALL_FLOORS.find(f => f.floorId === e.target.value);
              const fr = fd?.rooms.find(r => !r.id.endsWith('_corridor'));
              onEndChange(e.target.value, fr?.id ?? '');
            }}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-xl text-white text-xs mb-1 focus:outline-none focus:ring-2 focus:ring-purple-500">
            {roomsByFloor.map(f => <option key={f.floorId} value={f.floorId}>{f.label}</option>)}
          </select>
          <select value={endRoomId}
            onChange={e => onEndChange(endFloorId, e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500">
            {roomsByFloor.find(f => f.floorId === endFloorId)?.rooms.map(r =>
              <option key={r.id} value={r.id}>{r.name}</option>
            )}
          </select>
        </div>

        <button onClick={onFindPath}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2">
          <Navigation className="w-4 h-4" /> Find Path
        </button>
      </div>

      {/* Route Summary */}
      {pathSegments.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
            <Layers className="w-3 h-3" /> Route ({pathSegments.length} floor{pathSegments.length > 1 ? 's' : ''})
          </p>
          <div className="space-y-1.5">
            {pathSegments.map((seg, i) => {
              const fl = floors.find(f => f.id === seg.floorId);
              return (
                <div key={i}>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${seg.floorId === activeFloorId ? 'bg-purple-400' : 'bg-slate-600'}`} />
                    <span className={`font-medium ${seg.floorId === activeFloorId ? 'text-white' : 'text-slate-400'}`}>
                      {fl?.label ?? seg.floorId}
                    </span>
                    <span className="text-slate-600 ml-auto">{seg.waypointIds.length} wp</span>
                    {seg.floorId === activeFloorId && <span className="text-purple-400 text-[10px]">●</span>}
                  </div>
                  {seg.transition && (
                    <div className="ml-4 text-[11px] text-amber-300 mt-0.5">
                      {CONNECTOR_ICONS[seg.transition.type]} {seg.transition.name}
                      <span className="text-slate-500"> → {floors.find(f => f.id === seg.transition!.toFloor)?.label}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
