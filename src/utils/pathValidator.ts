// ===================================================================
// PATH VALIDATION & DIAGNOSTICS
// Ensures paths are accurate and detects issues in floor data
// ===================================================================

import type { FloorData } from '../data/floorTypes';
import type { Waypoint, Room } from '../data/floorTypes';

export interface ValidationError {
  type: 'disconnected-waypoint' | 'invalid-reference' | 'isolated-room' | 'unreachable' | 'circular-reference';
  severity: 'error' | 'warning' | 'info';
  message: string;
  affectedIds?: string[];
}

export interface ValidationReport {
  floorId: string;
  isValid: boolean;
  errors: ValidationError[];
  statistics: {
    totalWaypoints: number;
    totalRooms: number;
    connectedWaypoints: number;
    isolatedWaypoints: number;
    averageConnectionsPerWaypoint: number;
  };
}

// ============================================================
// VALIDATION FUNCTIONS
// ============================================================

export class PathValidator {
  // Validate a single floor's data integrity
  static validateFloor(floor: FloorData): ValidationReport {
    const errors: ValidationError[] = [];
    const waypointIds = new Set(floor.waypoints.map(w => w.id));
    const roomIds = new Set(floor.rooms.map(r => r.id));
    const visited = new Set<string>();

    // 1. Check for unreachable waypoints
    if (floor.waypoints.length > 0) {
      const startId = floor.waypoints[0].id;
      this.bfs(startId, floor.waypoints, visited);

      for (const wp of floor.waypoints) {
        if (!visited.has(wp.id)) {
          errors.push({
            type: 'disconnected-waypoint',
            severity: 'error',
            message: `Waypoint ${wp.id} is not connected to the main graph`,
            affectedIds: [wp.id],
          });
        }
      }
    }

    // 2. Check for invalid waypoint references
    for (const wp of floor.waypoints) {
      for (const connectedId of wp.connectedTo) {
        if (!waypointIds.has(connectedId) && !this.isVerticalConnector(connectedId)) {
          errors.push({
            type: 'invalid-reference',
            severity: 'error',
            message: `Waypoint ${wp.id} references non-existent waypoint ${connectedId}`,
            affectedIds: [wp.id, connectedId],
          });
        }
      }
    }

    // 3. Check for isolated rooms
    for (const room of floor.rooms) {
      const hasValidConnection = room.connectedTo.some(id => waypointIds.has(id));
      if (!hasValidConnection && room.connectedTo.length > 0) {
        errors.push({
          type: 'isolated-room',
          severity: 'warning',
          message: `Room ${room.id} is not connected to any waypoint`,
          affectedIds: [room.id],
        });
      }
    }

    // 4. Duplicate connection check
    for (const wp of floor.waypoints) {
      const duplicates = wp.connectedTo.filter(
        (id, idx, arr) => arr.indexOf(id) !== idx
      );
      if (duplicates.length > 0) {
        errors.push({
          type: 'circular-reference',
          severity: 'warning',
          message: `Waypoint ${wp.id} has duplicate connections: ${duplicates.join(', ')}`,
          affectedIds: [wp.id],
        });
      }
    }

    // 5. Bidirectional connection check
    for (const wp of floor.waypoints) {
      for (const connectedId of wp.connectedTo) {
        if (!waypointIds.has(connectedId)) continue;
        const connectedWp = floor.waypoints.find(w => w.id === connectedId);
        if (connectedWp && !connectedWp.connectedTo.includes(wp.id)) {
          errors.push({
            type: 'info',
            severity: 'info',
            message: `Unidirectional connection: ${wp.id} → ${connectedId} (not bidirectional)`,
            affectedIds: [wp.id, connectedId],
          });
        }
      }
    }

    const connectedWaypoints = visited.size;

    return {
      floorId: floor.floorId,
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      statistics: {
        totalWaypoints: floor.waypoints.length,
        totalRooms: floor.rooms.length,
        connectedWaypoints,
        isolatedWaypoints: floor.waypoints.length - connectedWaypoints,
        averageConnectionsPerWaypoint:
          floor.waypoints.length > 0
            ? floor.waypoints.reduce((sum, wp) => sum + wp.connectedTo.length, 0) /
              floor.waypoints.length
            : 0,
      },
    };
  }

  // BFS to find all reachable waypoints
  private static bfs(startId: string, waypoints: Waypoint[], visited: Set<string>) {
    const queue = [startId];
    visited.add(startId);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentWp = waypoints.find(w => w.id === current);
      if (!currentWp) continue;

      for (const neighborId of currentWp.connectedTo) {
        if (!visited.has(neighborId)) {
          const neighbor = waypoints.find(w => w.id === neighborId);
          if (neighbor) {
            visited.add(neighborId);
            queue.push(neighborId);
          }
        }
      }
    }
  }

  // Check if ID is a vertical connector (cross-floor)
  private static isVerticalConnector(id: string): boolean {
    // Vertical connectors follow pattern: fX_wp_... where X is different floor
    return /^f\d+_wp_/.test(id);
  }

  // Validate a calculated path
  static validatePath(
    pathIds: string[],
    waypoints: Waypoint[]
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (pathIds.length === 0) {
      errors.push('Path is empty');
      return { valid: false, errors };
    }

    // Check all IDs exist
    for (const id of pathIds) {
      if (!waypoints.find(w => w.id === id)) {
        errors.push(`Path contains non-existent waypoint: ${id}`);
      }
    }

    // Check consecutive waypoints are connected
    for (let i = 0; i < pathIds.length - 1; i++) {
      const current = waypoints.find(w => w.id === pathIds[i]);
      const next = pathIds[i + 1];

      if (current && !current.connectedTo.includes(next)) {
        errors.push(`Path breaks at ${pathIds[i]} → ${next} (not connected)`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Auto-fix common issues
  static fixFloor(floor: FloorData): FloorData {
    const fixed = { ...floor };
    const waypointIds = new Set(floor.waypoints.map(w => w.id));

    // Remove invalid references
    fixed.waypoints = fixed.waypoints.map(wp => ({
      ...wp,
      connectedTo: wp.connectedTo.filter(id => waypointIds.has(id) || this.isVerticalConnector(id)),
    }));

    // Remove duplicate connections
    fixed.waypoints = fixed.waypoints.map(wp => ({
      ...wp,
      connectedTo: [...new Set(wp.connectedTo)], // Unique
    }));

    return fixed;
  }

  // Get diagnostics for debugging
  static getDiagnostics(floors: FloorData[]): {
    allValid: boolean;
    reports: ValidationReport[];
    summary: string;
  } {
    const reports = floors.map(f => this.validateFloor(f));
    const allValid = reports.every(r => r.isValid);
    const errorCount = reports.reduce((sum, r) => sum + r.errors.length, 0);

    return {
      allValid,
      reports,
      summary: `${reports.length} floors checked. ${allValid ? '✓ All valid' : `✗ ${errorCount} issues found`}`,
    };
  }
}

// ============================================================
// PATH DEBUGGING UTILITIES
// ============================================================

export class PathDebugger {
  // Find alternative paths when primary fails
  static findAlternativePaths(
    startId: string,
    endId: string,
    waypoints: Waypoint[],
    maxPaths: number = 3
  ): string[][] {
    const paths: string[][] = [];
    const visited = new Set<string>();

    const dfs = (current: string, target: string, path: string[]) => {
      if (paths.length >= maxPaths) return;
      if (current === target) {
        paths.push([...path]);
        return;
      }

      visited.add(current);

      const currentWp = waypoints.find(w => w.id === current);
      if (currentWp) {
        for (const next of currentWp.connectedTo) {
          if (!visited.has(next)) {
            dfs(next, target, [...path, next]);
          }
        }
      }

      visited.delete(current);
    };

    dfs(startId, endId, [startId]);
    return paths;
  }

  // Calculate path metrics
  static getPathMetrics(
    pathIds: string[],
    waypoints: Waypoint[]
  ): {
    length: number;
    waypoints: number;
    avgSegmentLength: number;
    turns: number;
  } {
    let totalDistance = 0;
    let turns = 0;

    const positions = pathIds.map(id => {
      const wp = waypoints.find(w => w.id === id);
      return wp?.position || [0, 0];
    });

    // Calculate total distance
    for (let i = 0; i < positions.length - 1; i++) {
      const [x1, z1] = positions[i];
      const [x2, z2] = positions[i + 1];
      totalDistance += Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
    }

    // Calculate turns
    for (let i = 1; i < positions.length - 1; i++) {
      const [x1, z1] = positions[i - 1];
      const [x2, z2] = positions[i];
      const [x3, z3] = positions[i + 1];

      const dot = (x2 - x1) * (x3 - x2) + (z2 - z1) * (z3 - z2);
      if (dot < 0) turns++; // Sharp turn
    }

    return {
      length: totalDistance,
      waypoints: pathIds.length,
      avgSegmentLength: totalDistance / (pathIds.length - 1 || 1),
      turns,
    };
  }

  // Check if waypoints are properly spaced
  static checkWaypointSpacing(waypoints: Waypoint[], minDistance: number = 1): ValidationError[] {
    const errors: ValidationError[] = [];

    for (let i = 0; i < waypoints.length; i++) {
      for (let j = i + 1; j < waypoints.length; j++) {
        const wp1 = waypoints[i];
        const wp2 = waypoints[j];
        const dx = wp2.position[0] - wp1.position[0];
        const dz = wp2.position[1] - wp1.position[1];
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance < minDistance && wp1.connectedTo.includes(wp2.id)) {
          errors.push({
            type: 'info',
            severity: 'warning',
            message: `Waypoints ${wp1.id} and ${wp2.id} are too close (${distance.toFixed(2)}m < ${minDistance}m)`,
            affectedIds: [wp1.id, wp2.id],
          });
        }
      }
    }

    return errors;
  }
}

// ============================================================
// EXPORT FOR DEBUGGING IN CONSOLE
// ============================================================

if (typeof window !== 'undefined') {
  (window as any).PathValidator = PathValidator;
  (window as any).PathDebugger = PathDebugger;
}
