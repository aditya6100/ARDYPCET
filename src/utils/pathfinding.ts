// =============================================================
// pathfinding.ts — A* across ALL floors (unified waypoint graph)
// Waypoints from different floors are merged; cross-floor edges
// are encoded directly in each waypoint's connectedTo array.
// =============================================================

export interface Waypoint {
  id: string;
  position: number[];   // [X, Z]
  connectedTo: string[];
  floorNumber?: number;
}

export function distanceBetween(a: Waypoint, b: Waypoint): number {
  const dx = a.position[0] - b.position[0];
  const dz = a.position[1] - b.position[1];
  // Add a large penalty when crossing floors so pathfinder prefers staying on same floor
  // unless destination is on a different floor
  const floorPenalty = (a.floorNumber !== undefined && b.floorNumber !== undefined && a.floorNumber !== b.floorNumber) ? 30 : 0;
  return Math.sqrt(dx * dx + dz * dz) + floorPenalty;
}

export function heuristic(aId: string, bId: string, waypoints: Waypoint[]): number {
  const a = waypoints.find(w => w.id === aId);
  const b = waypoints.find(w => w.id === bId);
  if (!a || !b) return Infinity;
  return distanceBetween(a, b);
}

function reconstructPath(cameFrom: Record<string, string>, current: string): string[] {
  const path = [current];
  while (cameFrom[current]) {
    current = cameFrom[current];
    path.unshift(current);
  }
  return path;
}

export function findPath(startId: string, endId: string, waypoints: Waypoint[]): string[] {
  if (startId === endId) return [startId];

  const openSet = new Set([startId]);
  const cameFrom: Record<string, string> = {};
  const gScore: Record<string, number>   = {};
  const fScore: Record<string, number>   = {};

  for (const wp of waypoints) {
    gScore[wp.id] = Infinity;
    fScore[wp.id] = Infinity;
  }
  gScore[startId] = 0;
  fScore[startId] = heuristic(startId, endId, waypoints);

  while (openSet.size > 0) {
    // Pick node with lowest fScore
    let current = '';
    let best = Infinity;
    for (const id of openSet) {
      if ((fScore[id] ?? Infinity) < best) { best = fScore[id]; current = id; }
    }
    if (!current) break;
    if (current === endId) return reconstructPath(cameFrom, current);

    openSet.delete(current);
    const currentWP = waypoints.find(w => w.id === current);
    if (!currentWP) continue;

    for (const neighborId of currentWP.connectedTo) {
      const neighborWP = waypoints.find(w => w.id === neighborId);
      if (!neighborWP) continue;

      const tentativeG = gScore[current] + distanceBetween(currentWP, neighborWP);
      if (tentativeG < (gScore[neighborId] ?? Infinity)) {
        cameFrom[neighborId] = current;
        gScore[neighborId]   = tentativeG;
        fScore[neighborId]   = tentativeG + heuristic(neighborId, endId, waypoints);
        openSet.add(neighborId);
      }
    }
  }
  return [];
}
