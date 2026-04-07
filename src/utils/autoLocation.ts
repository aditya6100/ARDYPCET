// ===================================================================
// AUTO-LOCATION DETECTION
// Detects user's location using:
// 1. WiFi RSSI (signal strength)
// 2. Device motion sensors (accelerometer + gyroscope)
// 3. Geolocation API (outdoor fallback)
// 4. Bluetooth beacons (if available)
// ===================================================================

import { CONFIG } from '../config';

export interface LocationData {
  x: number;
  z: number;
  floorId: string;
  confidence: number; // 0-1
  method: 'wifi' | 'ble' | 'motion' | 'geolocation' | 'manual';
  timestamp: number;
}

export interface WifiNetwork {
  ssid: string;
  rssi: number;
  bssid: string;
}

// ============================================================
// WIFI-BASED POSITIONING (using RSSI fingerprinting)
// ============================================================

// Maps WiFi network BSSIDs to known positions in building
const WIFI_REFERENCE_POINTS: Record<string, { x: number; z: number; floorId: string; bssid: string; rssi: number }[]> = {
  // Example: Build this from real measurements on your floor plan
  f3: [
    { bssid: '00:11:22:33:44:55', x: 2.0, z: 4.095, floorId: 'f3', rssi: -30 },
    { bssid: '00:11:22:33:44:55', x: 14.0, z: 4.095, floorId: 'f3', rssi: -45 },
    { bssid: '00:11:22:33:44:55', x: 30.0, z: 4.095, floorId: 'f3', rssi: -55 },
    // Add more reference points for each floor
  ],
};

// RSSI to distance conversion (empirical formula)
function rssiToDistance(rssi: number): number {
  const txPower = -40; // Default transmit power (dBm)
  const n = 2.0; // Path loss exponent
  return Math.pow(10, (txPower - rssi) / (10 * n));
}

// Trilateration: find position from multiple RSSI measurements
function trilaterate(
  networks: WifiNetwork[],
  referencePoints: typeof WIFI_REFERENCE_POINTS[keyof typeof WIFI_REFERENCE_POINTS]
): { x: number; z: number; confidence: number } | null {
  if (networks.length < 3) return null;

  let sumX = 0, sumZ = 0, totalWeight = 0;

  for (const network of networks) {
    const refs = referencePoints.filter(r => r.bssid === network.bssid);
    if (refs.length === 0) continue;

    // Use closest reference point
    const ref = refs.reduce((closest, r) => {
      const distToNetwork = Math.abs(r.rssi - network.rssi);
      const distToClosest = Math.abs(closest.rssi - network.rssi);
      return distToNetwork < distToClosest ? r : closest;
    });

    const distance = rssiToDistance(network.rssi);
    const weight = 1 / (distance || 1);

    sumX += ref.x * weight;
    sumZ += ref.z * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return null;

  return {
    x: sumX / totalWeight,
    z: sumZ / totalWeight,
    confidence: Math.min(1, networks.length / 4), // Scale by number of networks
  };
}

// ============================================================
// MOTION-BASED POSITIONING (step counting + heading)
// ============================================================

class MotionTracker {
  private lastAccel = { x: 0, y: 0, z: 0 };
  private stepCount = 0;
  private heading = 0; // radians
  private stepThreshold = 20; // m/s²
  private isWalking = false;

  update(accel: { x: number; y: number; z: number }, rotation: { alpha: number; beta: number; gamma: number }) {
    // Detect steps (peaks in vertical acceleration)
    const magnitude = Math.sqrt(accel.x ** 2 + accel.y ** 2 + accel.z ** 2);
    
    if (magnitude > this.stepThreshold && !this.isWalking) {
      this.stepCount++;
      this.isWalking = true;
    } else if (magnitude < this.stepThreshold - 5) {
      this.isWalking = false;
    }

    // Update heading from compass (if available)
    if (rotation.alpha !== undefined) {
      this.heading = (rotation.alpha * Math.PI) / 180;
    }

    this.lastAccel = accel;
  }

  // Calculate displacement since last reset
  getDisplacement(strideLength = 0.75): { dx: number; dz: number } {
    const distance = this.stepCount * strideLength;
    return {
      dx: Math.cos(this.heading) * distance,
      dz: Math.sin(this.heading) * distance,
    };
  }

  reset() {
    this.stepCount = 0;
  }
}

// ============================================================
// BLUETOOTH BEACON POSITIONING
// ============================================================

function bleTrilaterate(
  beaconDistances: { uuid: string; distance: number; x: number; z: number }[]
): { x: number; z: number; confidence: number } | null {
  if (beaconDistances.length < 3) return null;

  // Similar to WiFi trilateration but with known beacon positions
  let sumX = 0, sumZ = 0, totalWeight = 0;

  for (const beacon of beaconDistances) {
    const weight = 1 / (beacon.distance || 0.1);
    sumX += beacon.x * weight;
    sumZ += beacon.z * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return null;

  return {
    x: sumX / totalWeight,
    z: sumZ / totalWeight,
    confidence: Math.min(1, beaconDistances.length / 3),
  };
}

// ============================================================
// MAIN AUTO-LOCATION SERVICE
// ============================================================

export class AutoLocationService {
  private currentLocation: LocationData | null = null;
  private motionTracker: MotionTracker;
  private updateInterval: number | null = null;
  private listeners: ((location: LocationData) => void)[] = [];
  private lastWifiScan: number = 0;
  private wifiNetworks: WifiNetwork[] = [];

  constructor() {
    this.motionTracker = new MotionTracker();
    this.initializeListeners();
  }

  private initializeListeners() {
    // Motion sensors
    if ('DeviceMotionEvent' in window && 'requestPermission' in (DeviceMotionEvent as any)) {
      (DeviceMotionEvent as any).requestPermission?.().then(() => {
        window.addEventListener('devicemotion', (e) => {
          if (e.acceleration) {
            this.motionTracker.update(e.acceleration, {
              alpha: (e as any).alpha || 0,
              beta: (e as any).beta || 0,
              gamma: (e as any).gamma || 0,
            });
          }
        });
      }).catch(() => {
        console.log('Motion permission denied');
      });
    }
  }

  // Start continuous location updates
  start(floorId: string, currentPosition?: { x: number; z: number }) {
    this.updateInterval = window.setInterval(() => {
      this.updateLocation(floorId, currentPosition);
    }, CONFIG.LOCATION_UPDATE_INTERVAL);
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Single location update
  private async updateLocation(floorId: string, currentPosition?: { x: number; z: number }) {
    const now = Date.now();
    let bestLocation: LocationData | null = null;
    let bestConfidence = 0;

    // Try WiFi positioning (less frequent)
    if (now - this.lastWifiScan > CONFIG.WIFI_SCAN_INTERVAL) {
      const wifiLocation = await this.getWifiLocation(floorId);
      if (wifiLocation && wifiLocation.confidence > bestConfidence) {
        bestLocation = wifiLocation;
        bestConfidence = wifiLocation.confidence;
      }
      this.lastWifiScan = now;
    }

    // Try BLE positioning
    const bleLocation = await this.getBleLocation(floorId);
    if (bleLocation && bleLocation.confidence > bestConfidence) {
      bestLocation = bleLocation;
      bestConfidence = bleLocation.confidence;
    }

    // Try motion tracking
    const motionLocation = this.getMotionLocation(floorId, currentPosition);
    if (motionLocation && motionLocation.confidence > bestConfidence) {
      bestLocation = motionLocation;
      bestConfidence = motionLocation.confidence;
    }

    // Fallback to geolocation
    if (!bestLocation) {
      bestLocation = await this.getGeolocationBasedLocation(floorId);
    }

    if (bestLocation) {
      // Apply smoothing
      if (this.currentLocation) {
        bestLocation.x = this.lerp(
          this.currentLocation.x,
          bestLocation.x,
          CONFIG.LOCATION_SMOOTHING_FACTOR
        );
        bestLocation.z = this.lerp(
          this.currentLocation.z,
          bestLocation.z,
          CONFIG.LOCATION_SMOOTHING_FACTOR
        );
      }

      this.currentLocation = bestLocation;
      this.notifyListeners(bestLocation);
    }
  }

  // Get location from WiFi RSSI
  private async getWifiLocation(floorId: string): Promise<LocationData | null> {
    try {
      // Try to access WiFi networks if available (requires special permissions)
      const networks = this.wifiNetworks;
      if (networks.length === 0) return null;

      const refPoints = WIFI_REFERENCE_POINTS[floorId as keyof typeof WIFI_REFERENCE_POINTS];
      if (!refPoints) return null;

      const result = trilaterate(networks, refPoints);
      if (!result) return null;

      return {
        x: result.x,
        z: result.z,
        floorId,
        confidence: result.confidence * 0.8, // WiFi is less reliable than BLE
        method: 'wifi',
        timestamp: Date.now(),
      };
    } catch (error) {
      console.debug('WiFi location failed:', error);
      return null;
    }
  }

  // Get location from Bluetooth beacons
  private async getBleLocation(floorId: string): Promise<LocationData | null> {
    try {
      if (!('bluetooth' in navigator)) return null;

      const device = await (navigator.bluetooth as any).requestDevice({
        filters: [{ services: ['eddystone'] }],
        optionalServices: ['eddystone'],
      });

      // Parse beacon data and trilaterate
      // This is a simplified example
      return null;
    } catch (error) {
      console.debug('BLE location failed:', error);
      return null;
    }
  }

  // Get location from motion/pedometer
  private getMotionLocation(floorId: string, basePosition?: { x: number; z: number }): LocationData | null {
    if (!basePosition) return null;

    const displacement = this.motionTracker.getDisplacement();
    return {
      x: basePosition.x + displacement.dx,
      z: basePosition.z + displacement.dz,
      floorId,
      confidence: 0.5, // Motion tracking has moderate confidence
      method: 'motion',
      timestamp: Date.now(),
    };
  }

  // Fallback: use geolocation (outdoor only)
  private async getGeolocationBasedLocation(floorId: string): Promise<LocationData | null> {
    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd convert lat/lon to building coordinates
          // For now, just return null
          resolve(null);
        },
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  }

  // Detect nearest room from location
  public findNearestRoom(
    location: LocationData,
    floorRooms: Array<{ id: string; center: [number, number] }>
  ): string | null {
    let nearestRoom: string | null = null;
    let minDistance = Infinity;

    for (const room of floorRooms) {
      const dx = room.center[0] - location.x;
      const dz = room.center[1] - location.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance < minDistance) {
        minDistance = distance;
        nearestRoom = room.id;
      }
    }

    return minDistance < 3 ? nearestRoom : null; // Within 3 meters
  }

  // Subscribe to location updates
  onChange(listener: (location: LocationData) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(location: LocationData) {
    this.listeners.forEach(listener => listener(location));
  }

  getCurrentLocation(): LocationData | null {
    return this.currentLocation;
  }

  setWifiNetworks(networks: WifiNetwork[]) {
    this.wifiNetworks = networks;
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }
}

export const autoLocationService = new AutoLocationService();
