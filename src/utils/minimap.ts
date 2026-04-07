import type { FloorData } from '../data/floorTypes';

export type MapPosition = { x: number; z: number };

export function findNearestRoom(floorData: FloorData, pos: MapPosition, maxMeters = 4): string | null {
  let bestId: string | null = null;
  let bestDist = Infinity;

  for (const r of floorData.rooms) {
    const dx = r.center[0] - pos.x;
    const dz = r.center[1] - pos.z;
    const d = Math.sqrt(dx * dx + dz * dz);
    if (d < bestDist) {
      bestDist = d;
      bestId = r.id;
    }
  }

  return bestDist <= maxMeters ? bestId : null;
}

export function findNearestWaypoint(
  floorData: FloorData,
  pos: MapPosition,
  maxMeters = 2
): { waypointId: string; distance: number } | null {
  let bestId: string | null = null;
  let bestDist = Infinity;

  for (const wp of floorData.waypoints) {
    const dx = wp.position[0] - pos.x;
    const dz = wp.position[1] - pos.z;
    const d = Math.sqrt(dx * dx + dz * dz);
    if (d < bestDist) {
      bestDist = d;
      bestId = wp.id;
    }
  }

  if (!bestId || bestDist > maxMeters) return null;
  return { waypointId: bestId, distance: bestDist };
}

function clamp01(t: number) {
  return Math.max(0, Math.min(1, t));
}

function nearestPointOnSegment(a: MapPosition, b: MapPosition, p: MapPosition) {
  const abx = b.x - a.x;
  const abz = b.z - a.z;
  const apx = p.x - a.x;
  const apz = p.z - a.z;
  const ab2 = abx * abx + abz * abz;
  const t = ab2 > 0 ? clamp01((apx * abx + apz * abz) / ab2) : 0;
  const x = a.x + abx * t;
  const z = a.z + abz * t;
  const dx = p.x - x;
  const dz = p.z - z;
  return { pos: { x, z } as MapPosition, distance: Math.sqrt(dx * dx + dz * dz) };
}

export function snapToPolyline(
  pos: MapPosition,
  polyline: Array<[number, number]>,
  maxMeters = 2
): { pos: MapPosition; distance: number } | null {
  if (polyline.length < 2) return null;

  let best: { pos: MapPosition; distance: number } | null = null;
  for (let i = 0; i < polyline.length - 1; i++) {
    const a = { x: polyline[i][0], z: polyline[i][1] };
    const b = { x: polyline[i + 1][0], z: polyline[i + 1][1] };
    const hit = nearestPointOnSegment(a, b, pos);
    if (!best || hit.distance < best.distance) best = hit;
  }

  if (!best || best.distance > maxMeters) return null;
  return best;
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function smoothPosition(prev: MapPosition | null, next: MapPosition, alpha = 0.35): MapPosition {
  if (!prev) return next;
  return { x: lerp(prev.x, next.x, alpha), z: lerp(prev.z, next.z, alpha) };
}
