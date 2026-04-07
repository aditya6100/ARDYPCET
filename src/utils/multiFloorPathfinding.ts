// ===================================================================
// IMPROVED MULTI-FLOOR PATHFINDING
// With caching, validation, and better accuracy
// ===================================================================

import type { FloorData } from '../data/floorTypes';
import { verticalConnectors } from '../data/floorRegistry';
import { PathValidator } from './pathValidator';
import { CONFIG } from '../config';

interface UnifiedWaypoint {
  id: string;
  position: [number, number, number];
  connectedTo: string[];
  floorId: string;
}

export interface PathSegment {
  floorId: string;
  waypointIds: string[];
  positions: [number, number][];
  transition?: {
    type: 'lift' | 'stairs' | 'ramp';
    name: string;
    fromFloor: string;
    toFloor: string;
  };
}

// ============================================================
// PATH CACHE (Memoization)
// ============================================================

class PathCache {
  private cache = new Map<string, PathSegment[]>();
  private maxSize = 100;

  getCacheKey(startId: string, endId: string): string {
    return `${startId}→${endId}`;
  }

  get(startId: string, endId: string): PathSegment[] | null {
    return this.cache.get(this.getCacheKey(startId, endId)) || null;
  }

  set(startId: string, endId: string, path: PathSegment[]) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value as string | undefined;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(this.getCacheKey(startId, endId), path);
  }

  clear() {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

const pathCache = new PathCache();

// ============================================================
// IMPROVED DISTANCE CALCULATION
// ============================================================

function distance3D(a: UnifiedWaypoint, b: UnifiedWaypoint): number {
  const dx = a.position[0] - b.position[0];
  const dz = a.position[1] - b.position[1];
  const df = (a.position[2] - b.position[2]) * CONFIG.FLOOR_PENALTY_3D;
  return Math.sqrt(dx * dx + dz * dz + df * df);
}

function distanceWithPenalties(
  current: UnifiedWaypoint,
  neighbor: UnifiedWaypoint,
  previous: UnifiedWaypoint | null
): number {
  let dist = distance3D(current, neighbor);

  if (current.floorId !== neighbor.floorId) {
    dist += CONFIG.CONNECTOR_COST_PER_FLOOR;
  }

  if (previous) {
    const dx1 = current.position[0] - previous.position[0];
    const dz1 = current.position[1] - previous.position[1];
    const dx2 = neighbor.position[0] - current.position[0];
    const dz2 = neighbor.position[1] - current.position[1];
    const mag1 = Math.sqrt(dx1 * dx1 + dz1 * dz1) || 1;
    const mag2 = Math.sqrt(dx2 * dx2 + dz2 * dz2) || 1;
    const dot = (dx1 * dx2 + dz1 * dz2) / (mag1 * mag2);

    if (dot < 0.7) {
      dist += CONFIG.TURN_PENALTY;
    }
  }

  return dist;
}

// ============================================================
// BUILD UNIFIED GRAPH
// ============================================================

function buildUnifiedGraph(allFloorData: FloorData[]): UnifiedWaypoint[] {
  const unified: UnifiedWaypoint[] = [];

  for (const floor of allFloorData) {
    const floorNum = parseInt(floor.floorId.replace('f', ''), 10);

    const validation = PathValidator.validateFloor(floor);
    if (!validation.isValid) {
      console.warn(`⚠️  Floor ${floor.floorId} has validation issues:`, validation.errors);
    }

    for (const wp of floor.waypoints) {
      unified.push({
        id: wp.id,
        position: [wp.position[0], wp.position[1], floorNum],
        connectedTo: [...wp.connectedTo],
        floorId: floor.floorId,
      });
    }
  }

  for (const connector of verticalConnectors) {
    const floorIds = Object.keys(connector.floorWaypoints);

    for (let i = 0; i < floorIds.length; i++) {
      const floorA = floorIds[i];
      const wpA = connector.floorWaypoints[floorA];
      const nodeA = unified.find(u => u.id === wpA);

      if (!nodeA) {
        console.warn(`❌ Vertical connector references non-existent waypoint: ${wpA}`);
        continue;
      }

      for (let j = 0; j < floorIds.length; j++) {
        if (i === j) continue;

        const floorB = floorIds[j];
        const wpB = connector.floorWaypoints[floorB];
        const nodeB = unified.find(u => u.id === wpB);

        if (!nodeB) {
          console.warn(`❌ Vertical connector references non-existent waypoint: ${wpB}`);
          continue;
        }

        if (!nodeA.connectedTo.includes(wpB)) {
          nodeA.connectedTo.push(wpB);
        }
        if (!nodeB.connectedTo.includes(wpA)) {
          nodeB.connectedTo.push(wpA);
        }
      }
    }
  }

  return unified;
}

// ============================================================
// IMPROVED A* ALGORITHM
// ============================================================

function findUnifiedPath(
  startId: string,
  endId: string,
  graph: UnifiedWaypoint[]
): string[] {
  const startNode = graph.find(w => w.id === startId);
  const endNode = graph.find(w => w.id === endId);

  if (!startNode || !endNode) {
    console.error(`❌ Invalid path endpoints: ${startId} or ${endId} not found`);
    return [];
  }

  if (startId === endId) return [startId];

  const openSet: string[] = [startId];
  const cameFrom: Record<string, string> = {};
  const gScore: Record<string, number> = {};
  const fScore: Record<string, number> = {};

  for (const node of graph) {
    gScore[node.id] = Infinity;
    fScore[node.id] = Infinity;
  }

  gScore[startId] = 0;
  fScore[startId] = distance3D(startNode, endNode);

  while (openSet.length > 0) {
    let current = openSet[0];
    let lowestF = fScore[current];

    for (let i = 1; i < openSet.length; i++) {
      if (fScore[openSet[i]] < lowestF) {
        current = openSet[i];
        lowestF = fScore[current];
      }
    }

    if (current === endId) {
      const path: string[] = [current];
      while (cameFrom[current]) {
        current = cameFrom[current];
        path.unshift(current);
      }
      return path;
    }

    const idx = openSet.indexOf(current);
    openSet.splice(idx, 1);

    const currentNode = graph.find(w => w.id === current)!;
    const previousId = cameFrom[current];
    const previousNode = previousId ? graph.find(n => n.id === previousId) ?? null : null;

    for (const neighborId of currentNode.connectedTo) {
      const neighborNode = graph.find(w => w.id === neighborId);
      if (!neighborNode) continue;

      const tentativeG =
        gScore[current] + distanceWithPenalties(currentNode, neighborNode, previousNode);

      if (tentativeG < gScore[neighborId]) {
        cameFrom[neighborId] = current;
        gScore[neighborId] = tentativeG;
        fScore[neighborId] = tentativeG + distance3D(neighborNode, endNode);

        if (!openSet.includes(neighborId)) {
          openSet.push(neighborId);
        }
      }
    }
  }

  console.error(`❌ No path found from ${startId} to ${endId}`);
  return [];
}

// ============================================================
// MAIN MULTI-FLOOR PATHFINDING
// ============================================================

export function findMultiFloorPath(
  startRoomId: string,
  endRoomId: string,
  allFloorData: FloorData[]
): PathSegment[] {
  let startWpId = '';
  let endWpId = '';

  for (const floor of allFloorData) {
    const startRoom = floor.rooms.find(r => r.id === startRoomId);
    if (startRoom?.connectedTo[0]) {
      startWpId = startRoom.connectedTo[0];
    }

    const endRoom = floor.rooms.find(r => r.id === endRoomId);
    if (endRoom?.connectedTo[0]) {
      endWpId = endRoom.connectedTo[0];
    }
  }

  if (!startWpId || !endWpId) {
    console.error(`❌ Room not found: ${startRoomId} or ${endRoomId}`);
    return [];
  }

  if (CONFIG.ENABLE_PATH_CACHING) {
    const cached = pathCache.get(startWpId, endWpId);
    if (cached) {
      console.log(`📦 Using cached path (cache size: ${pathCache.size()})`);
      return cached;
    }
  }

  const graph = buildUnifiedGraph(allFloorData);
  const pathIds = findUnifiedPath(startWpId, endWpId, graph);

  if (pathIds.length === 0) {
    console.error(`❌ Pathfinding failed for ${startWpId} → ${endWpId}`);
    return [];
  }

  const segments: PathSegment[] = [];
  let currentSegment: PathSegment | null = null;

  for (let i = 0; i < pathIds.length; i++) {
    const wpId = pathIds[i];
    const node = graph.find(n => n.id === wpId)!;
    const isNewFloor = !currentSegment || currentSegment.floorId !== node.floorId;

    if (isNewFloor) {
      if (currentSegment && i > 0) {
        const prevId = pathIds[i - 1];
        const connector = verticalConnectors.find(
          c =>
            Object.values(c.floorWaypoints).includes(prevId) &&
            Object.values(c.floorWaypoints).includes(wpId)
        );

        if (connector) {
          currentSegment.transition = {
            type: connector.type,
            name: connector.name,
            fromFloor: currentSegment.floorId,
            toFloor: node.floorId,
          };
        }
      }

      currentSegment = {
        floorId: node.floorId,
        waypointIds: [wpId],
        positions: [[node.position[0], node.position[1]]],
      };
      segments.push(currentSegment);
    } else {
      currentSegment!.waypointIds.push(wpId);
      currentSegment!.positions.push([node.position[0], node.position[1]]);
    }
  }

  if (CONFIG.ENABLE_PATH_CACHING) {
    pathCache.set(startWpId, endWpId, segments);
  }

  console.log(`✅ Path found: ${pathIds.length} waypoints, ${segments.length} floor(s)`);
  return segments;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function clearPathCache() {
  pathCache.clear();
}

export function getCacheStats() {
  return {
    size: pathCache.size(),
    maxSize: 100,
  };
}

export function getAllRooms(allFloorData: FloorData[]) {
  return allFloorData.flatMap(floor =>
    floor.rooms
      .filter(r => r.connectedTo?.length > 0 && !r.id.endsWith('_corridor'))
      .map(r => ({
        ...r,
        floorId: floor.floorId,
        floorLabel: floor.floorId,
      }))
  );
}

if (typeof window !== 'undefined') {
  const debugWindow = window as unknown as Record<string, unknown>;
  debugWindow.pathCache = { getStats: getCacheStats, clear: clearPathCache };
}
