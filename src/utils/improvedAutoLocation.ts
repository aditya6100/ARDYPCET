// ===================================================================
// IMPROVED AUTO-LOCATION v2 — Better Accuracy & Drift Detection
// ===================================================================

import { CONFIG } from '../config';
import type { LocationData } from './autoLocation';

interface MotionDataPoint {
  x: number;
  z: number;
  timestamp: number;
  confidence: number;
  method: 'wifi' | 'ble' | 'motion';
}

// ============================================================
// MOTION TRACKING WITH DRIFT DETECTION
// ============================================================

export class ImprovedMotionTracker {
  private lastPosition: [number, number] = [0, 0];
  private positions: MotionDataPoint[] = [];
  private stepCount = 0;
  private heading = 0;
  private lastRecalibration = Date.now();
  private isStationary = false;
  private stationaryTime = 0;
  private wallCollisionDetected = false;

  // Confidence degrades over time without recalibration
  private confidenceMultiplier = 1.0;

  setStartPosition(x: number, z: number) {
    this.lastPosition = [x, z];
    this.lastRecalibration = Date.now();
    this.confidenceMultiplier = 1.0;
    this.positions = [];
  }

  // Detect if user is stationary (movement < 0.2m/s)
  updateMotion(accel: { x: number; y: number; z: number }) {
    const magnitude = Math.sqrt(accel.x ** 2 + accel.y ** 2 + accel.z ** 2);

    if (magnitude < 2.0) {
      // Very low acceleration = stationary
      this.isStationary = true;
      this.stationaryTime += 100; // Update interval
    } else {
      this.isStationary = false;
      this.stationaryTime = 0;
    }
  }

  // Detect wall collision (sudden direction change)
  detectWallCollision(
    prevHeading: number,
    currentHeading: number
  ): boolean {
    const headingChange = Math.abs(currentHeading - prevHeading);
    // Sharp 90°+ turn = likely wall collision
    return headingChange > Math.PI / 2;
  }

  // Calculate confidence with drift penalty
  getConfidence(elapsedSeconds: number): number {
    // Base confidence: 0.85
    // Decays 5% per second without recalibration
    let confidence = 0.85 * Math.pow(0.95, elapsedSeconds / 1000);

    // Boost if stationary (more stable)
    if (this.isStationary) {
      confidence = Math.min(1.0, confidence + 0.1);
    }

    // Reduce if wall collision detected
    if (this.wallCollisionDetected) {
      confidence *= 0.7;
      this.wallCollisionDetected = false; // Reset flag
    }

    // Apply accumulated multiplier
    confidence *= this.confidenceMultiplier;

    return Math.max(0.2, Math.min(1.0, confidence)); // Clamp 0.2-1.0
  }

  // Recalibrate with external position (WiFi/BLE)
  recalibrate(
    x: number,
    z: number,
    extConfidence: number
  ) {
    if (extConfidence > 0.7) {
      // Trust the external source
      this.lastPosition = [x, z];
      this.lastRecalibration = Date.now();
      this.confidenceMultiplier = 1.0;
      this.stepCount = 0; // Reset step counter
    }
  }

  // Get current estimated position
  getPosition(): [number, number] {
    return [...this.lastPosition];
  }

  // Get time since last recalibration (seconds)
  getTimeSinceRecal(): number {
    return (Date.now() - this.lastRecalibration) / 1000;
  }

  isLowConfidence(): boolean {
    return this.getConfidence(this.getTimeSinceRecal()) < 0.5;
  }
}

// ============================================================
// ACCELEROMETER-BASED FLOOR DETECTION
// ============================================================

export class FloorDetector {
  private altitudeHistory: number[] = [];
  private currentFloor = 1;
  private altitudeThreshold = 2.5; // 2.5m per floor

  // Z-axis acceleration indicates vertical movement
  processAcceleration(accelZ: number): string | null {
    // Sustained upward acceleration = going upstairs
    // Sustained downward acceleration = going downstairs

    this.altitudeHistory.push(accelZ);
    if (this.altitudeHistory.length > 10) {
      this.altitudeHistory.shift();
    }

    const avgAccel = this.altitudeHistory.reduce((a, b) => a + b, 0) / this.altitudeHistory.length;

    if (avgAccel > 0.5 && this.altitudeHistory.length === 10) {
      // Sustained upward
      this.currentFloor++;
      this.altitudeHistory = [];
      return 'up';
    } else if (avgAccel < -0.5 && this.altitudeHistory.length === 10) {
      // Sustained downward
      this.currentFloor--;
      this.altitudeHistory = [];
      return 'down';
    }

    return null;
  }

  getCurrentFloor(): number {
    return this.currentFloor;
  }

  setFloor(floor: number) {
    this.currentFloor = floor;
    this.altitudeHistory = [];
  }
}

// ============================================================
// ACCURACY MONITORING & ALERTS
// ============================================================

export class AccuracyMonitor {
  private errors: number[] = [];
  private maxHistorySize = 20; // Track last 20 measurements

  // Record location error (actual vs detected)
  recordError(actualX: number, actualZ: number, detectedX: number, detectedZ: number) {
    const dx = actualX - detectedX;
    const dz = actualZ - detectedZ;
    const error = Math.sqrt(dx * dx + dz * dz);

    this.errors.push(error);
    if (this.errors.length > this.maxHistorySize) {
      this.errors.shift();
    }
  }

  // Get average error
  getAverageError(): number {
    if (this.errors.length === 0) return 0;
    return this.errors.reduce((a, b) => a + b, 0) / this.errors.length;
  }

  // Get latest error
  getLatestError(): number {
    return this.errors[this.errors.length - 1] ?? 0;
  }

  // Check if error exceeds threshold
  isAccuracyPoor(): boolean {
    const avgError = this.getAverageError();
    return avgError > 3; // More than 3 meters is poor
  }

  // Get accuracy quality assessment
  getQuality(): 'excellent' | 'good' | 'fair' | 'poor' | 'unknown' {
    if (this.errors.length === 0) return 'unknown';
    const avgError = this.getAverageError();
    if (avgError < 1) return 'excellent';
    if (avgError < 2) return 'good';
    if (avgError < 3) return 'fair';
    return 'poor';
  }

  reset() {
    this.errors = [];
  }
}

// ============================================================
// LOCATION DATA WITH METADATA
// ============================================================

export interface ImprovedLocationData extends LocationData {
  timeSinceRecalibration: number; // seconds
  driftRisk: 'low' | 'medium' | 'high'; // How much drift has accumulated?
  qualityRating: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
  recommendRecalibration: boolean;
}

// ============================================================
// EXPORT INSTANCES
// ============================================================

export const improvedMotionTracker = new ImprovedMotionTracker();
export const floorDetector = new FloorDetector();
export const accuracyMonitor = new AccuracyMonitor();

// ============================================================
// UTILITY FUNCTION: Location Quality Assessment
// ============================================================

export function assessLocationQuality(
  location: LocationData,
  timeSinceRecal: number
): ImprovedLocationData {
  const confidence = improvedMotionTracker.getConfidence(timeSinceRecal);
  const avgError = accuracyMonitor.getAverageError();

  let driftRisk: 'low' | 'medium' | 'high' = 'low';
  if (timeSinceRecal > 60) driftRisk = 'high';
  else if (timeSinceRecal > 30) driftRisk = 'medium';

  const recommendRecalibration = timeSinceRecal > 45 || improvedMotionTracker.isLowConfidence();

  return {
    ...location,
    timeSinceRecalibration: timeSinceRecal,
    driftRisk,
    qualityRating: accuracyMonitor.getQuality(),
    recommendRecalibration,
  };
}

// ============================================================
// EXPORT FOR DEBUGGING
// ============================================================

if (typeof window !== 'undefined') {
  (window as any).ImprovedMotionTracker = ImprovedMotionTracker;
  (window as any).FloorDetector = FloorDetector;
  (window as any).AccuracyMonitor = AccuracyMonitor;
  (window as any).improvedMotionTracker = improvedMotionTracker;
  (window as any).floorDetector = floorDetector;
  (window as any).accuracyMonitor = accuracyMonitor;
  (window as any).assessLocationQuality = assessLocationQuality;
}
