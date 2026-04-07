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

