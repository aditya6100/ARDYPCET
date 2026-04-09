import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from 'react';
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
  userHeadingRad,
  followUser = false,
  pickedPosition,
  path,
  interactive = false,
  showWaypoints = true,
  onPickPosition,
}: {
  floorData: FloorData;
  size?: number;
  userPosition?: MapPosition | null;
  userHeadingRad?: number | null;
  followUser?: boolean;
  pickedPosition?: MapPosition | null;
  path?: MapPosition[] | null;
  interactive?: boolean;
  showWaypoints?: boolean;
  onPickPosition?: (pos: MapPosition) => void;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

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

  const centerX = width / 2;
  const centerY = height / 2;

  const rotateRad = followUser && userHeadingRad !== null && userHeadingRad !== undefined
    ? (Math.PI / 2 - userHeadingRad)
    : 0;

  const transformParts: string[] = [];
  if (interactive) {
    transformParts.push(`translate(${centerX + pan.x} ${centerY + pan.y})`);
    transformParts.push(`scale(${zoom})`);
    transformParts.push(`translate(${-centerX} ${-centerY})`);
  }
  if (rotateRad !== 0) {
    transformParts.push(`rotate(${(rotateRad * 180) / Math.PI} ${centerX} ${centerY})`);
  }
  const transform = transformParts.length > 0 ? transformParts.join(' ') : undefined;

  const toBasePxFromClient = (clientX: number, clientY: number) => {
    const rect = (svgRef.current as SVGSVGElement | null)?.getBoundingClientRect();
    if (!rect) return null;
    let px = clientX - rect.left;
    let py = clientY - rect.top;

    if (interactive) {
      px = (px - (centerX + pan.x)) / zoom + centerX;
      py = (py - (centerY + pan.y)) / zoom + centerY;
    }

    return { px, py };
  };

  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!interactive) return;
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, moved: false };
  };

  const onPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!interactive || !dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) dragRef.current.moved = true;
    dragRef.current.x = e.clientX;
    dragRef.current.y = e.clientY;
    setPan(p => ({ x: p.x + dx, y: p.y + dy }));
  };

  const onPointerUp = () => {
    if (!interactive) return;
    dragRef.current = null;
  };

  const onWheel = (e: ReactWheelEvent<SVGSVGElement>) => {
    if (!interactive) return;
    e.preventDefault();
    const delta = -e.deltaY;
    const factor = delta > 0 ? 1.08 : 0.92;
    setZoom(z => Math.max(0.8, Math.min(3.5, z * factor)));
  };

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox={`0 0 ${width} ${height}`}
      className="select-none touch-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
      onClick={(e) => {
        if (!onPickPosition) return;
        if (interactive && dragRef.current?.moved) return;
        const base = toBasePxFromClient(e.clientX, e.clientY);
        if (!base) return;
        onPickPosition(fromSvg(base.px, base.py));
      }}>
      <defs>
        <linearGradient id="mm_bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgba(2,6,23,0.95)" />
          <stop offset="1" stopColor="rgba(15,23,42,0.90)" />
        </linearGradient>
        <filter id="mm_glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.8" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x="0" y="0" width={width} height={height} rx="18" fill="url(#mm_bg)" stroke="rgba(168,85,247,0.28)" />
      <rect x="10" y="10" width={width - 20} height={height - 20} rx="14" fill="transparent" stroke="rgba(148,163,184,0.12)" />

      <g transform={transform}>
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
            fill="rgba(34,197,94,0.10)"
            stroke="rgba(34,197,94,0.22)"
            strokeWidth={1.2}
          />
        )}

        {/* walls */}
        <g stroke="rgba(226,232,240,0.55)" strokeWidth={2.4} strokeLinecap="round">
          {floorData.walls.map((w, i) => {
            const a = toSvg(w.p1[0], w.p1[1]);
            const b = toSvg(w.p2[0], w.p2[1]);
            return <line key={i} x1={a.px} y1={a.py} x2={b.px} y2={b.py} />;
          })}
        </g>

        {/* path */}
        {path && path.length > 1 && (
          <>
            <path
              d={path.map((p, i) => {
                const q = toSvg(p.x, p.z);
                return `${i === 0 ? 'M' : 'L'} ${q.px} ${q.py}`;
              }).join(' ')}
              stroke="rgba(168,85,247,0.35)"
              strokeWidth={7}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              filter="url(#mm_glow)"
            />
            <path
              d={path.map((p, i) => {
                const q = toSvg(p.x, p.z);
                return `${i === 0 ? 'M' : 'L'} ${q.px} ${q.py}`;
              }).join(' ')}
              stroke="rgba(168,85,247,0.95)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        )}

        {/* waypoints */}
        {showWaypoints && (
          <g fill="rgba(99,102,241,0.32)">
            {floorData.waypoints.map((wp) => {
              const p = toSvg(wp.position[0], wp.position[1]);
              return <circle key={wp.id} cx={p.px} cy={p.py} r={2} />;
            })}
          </g>
        )}

        {/* picked position */}
        {pickedPosition && (
          (() => {
            const p = toSvg(pickedPosition.x, pickedPosition.z);
            return (
              <g>
                <circle cx={p.px} cy={p.py} r={10} fill="rgba(250,204,21,0.12)" />
                <circle cx={p.px} cy={p.py} r={4} fill="rgba(250,204,21,0.95)" filter="url(#mm_glow)" />
              </g>
            );
          })()
        )}

        {/* user position */}
        {userPosition && (
          (() => {
            const p = toSvg(userPosition.x, userPosition.z);
            const dir = userHeadingRad ?? null;
            const hx = dir !== null ? Math.cos(dir) : 0;
            const hz = dir !== null ? Math.sin(dir) : 0;
            const tip = { x: p.px + hx * 14, y: p.py - hz * 14 };
            const left = { x: p.px + Math.cos((dir ?? 0) + Math.PI * 0.72) * 8, y: p.py - Math.sin((dir ?? 0) + Math.PI * 0.72) * 8 };
            const right = { x: p.px + Math.cos((dir ?? 0) - Math.PI * 0.72) * 8, y: p.py - Math.sin((dir ?? 0) - Math.PI * 0.72) * 8 };

            return (
              <g>
                <circle cx={p.px} cy={p.py} r={11} fill="rgba(59,130,246,0.12)" />
                <circle cx={p.px} cy={p.py} r={4} fill="rgba(59,130,246,0.95)" filter="url(#mm_glow)" />
                {dir !== null && (
                  <path
                    d={`M ${left.x} ${left.y} L ${tip.x} ${tip.y} L ${right.x} ${right.y} Z`}
                    fill="rgba(59,130,246,0.9)"
                    opacity={0.95}
                  />
                )}
              </g>
            );
          })()
        )}
      </g>
    </svg>
  );
}
