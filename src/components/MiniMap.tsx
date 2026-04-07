import { useMemo, useRef } from 'react';
import type { FloorData } from '../data/floorTypes';
import type { MapPosition } from '../utils/minimap';

function getBounds(floorData: FloorData) {
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;

  const addPoint = (x: number, z: number) => {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  };

  for (const w of floorData.walls) {
    addPoint(w.p1[0], w.p1[1]);
    addPoint(w.p2[0], w.p2[1]);
  }
  for (const r of floorData.rooms) addPoint(r.center[0], r.center[1]);
  for (const wp of floorData.waypoints) addPoint(wp.position[0], wp.position[1]);
  if (floorData.corridorPolygon) for (const [x, z] of floorData.corridorPolygon) addPoint(x, z);

  if (!isFinite(minX) || !isFinite(minZ) || !isFinite(maxX) || !isFinite(maxZ)) {
    return { minX: 0, minZ: 0, maxX: 1, maxZ: 1 };
  }

  // Avoid zero-area bounds
  if (maxX - minX < 0.001) maxX = minX + 1;
  if (maxZ - minZ < 0.001) maxZ = minZ + 1;

  return { minX, minZ, maxX, maxZ };
}

export default function MiniMap({
  floorData,
  size = 180,
  userPosition,
  pickedPosition,
  onPickPosition,
}: {
  floorData: FloorData;
  size?: number;
  userPosition?: MapPosition | null;
  pickedPosition?: MapPosition | null;
  onPickPosition?: (pos: MapPosition) => void;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const bounds = useMemo(() => getBounds(floorData), [floorData]);
  const padding = 14;
  const width = size;
  const height = size;
  const sx = (width - padding * 2) / (bounds.maxX - bounds.minX);
  const sz = (height - padding * 2) / (bounds.maxZ - bounds.minZ);
  const scale = Math.min(sx, sz);

  const toSvg = (x: number, z: number) => {
    const px = padding + (x - bounds.minX) * scale;
    const py = height - (padding + (z - bounds.minZ) * scale);
    return { px, py };
  };

  const fromSvg = (px: number, py: number) => {
    const x = bounds.minX + (px - padding) / scale;
    const z = bounds.minZ + ((height - py) - padding) / scale;
    return { x, z };
  };

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox={`0 0 ${width} ${height}`}
      className="select-none touch-none"
      onClick={(e) => {
        if (!onPickPosition) return;
        const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        onPickPosition(fromSvg(px, py));
      }}>
      <rect x="0" y="0" width={width} height={height} rx="18" fill="rgba(2,6,23,0.85)" stroke="rgba(168,85,247,0.25)" />

      {/* corridor polygon */}
      {floorData.corridorPolygon && floorData.corridorPolygon.length > 2 && (
        <path
          d={
            floorData.corridorPolygon
              .map(([x, z], i) => {
                const { px, py } = toSvg(x, z);
                return `${i === 0 ? 'M' : 'L'} ${px} ${py}`;
              })
              .join(' ') + ' Z'
          }
          fill="rgba(34,197,94,0.12)"
          stroke="rgba(34,197,94,0.25)"
          strokeWidth={1}
        />
      )}

      {/* walls */}
      <g stroke="rgba(148,163,184,0.55)" strokeWidth={2} strokeLinecap="round">
        {floorData.walls.map((w, i) => {
          const a = toSvg(w.p1[0], w.p1[1]);
          const b = toSvg(w.p2[0], w.p2[1]);
          return <line key={i} x1={a.px} y1={a.py} x2={b.px} y2={b.py} />;
        })}
      </g>

      {/* waypoints (light) */}
      <g fill="rgba(99,102,241,0.35)">
        {floorData.waypoints.map((wp) => {
          const p = toSvg(wp.position[0], wp.position[1]);
          return <circle key={wp.id} cx={p.px} cy={p.py} r={2} />;
        })}
      </g>

      {/* picked position */}
      {pickedPosition && (
        (() => {
          const p = toSvg(pickedPosition.x, pickedPosition.z);
          return (
            <g>
              <circle cx={p.px} cy={p.py} r={7} fill="rgba(250,204,21,0.18)" />
              <circle cx={p.px} cy={p.py} r={3} fill="rgba(250,204,21,0.9)" />
            </g>
          );
        })()
      )}

      {/* user position */}
      {userPosition && (
        (() => {
          const p = toSvg(userPosition.x, userPosition.z);
          return (
            <g>
              <circle cx={p.px} cy={p.py} r={8} fill="rgba(59,130,246,0.18)" />
              <circle cx={p.px} cy={p.py} r={3} fill="rgba(59,130,246,0.95)" />
            </g>
          );
        })()
      )}
    </svg>
  );
}
