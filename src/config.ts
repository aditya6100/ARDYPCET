// ===================================================================
// GLOBAL CONFIG — All magic numbers in one place
// ===================================================================

export const CONFIG = {
  // === ARROW/PATH VISUALIZATION ===
  ARROW_HEIGHT: 0.3,
  ARROW_SPACING: 4,
  ARROW_BASE_SIZE: 0.15,
  ARROW_OPACITY: 0.8,
  
  // === ANIMATION SPEEDS ===
  PULSE_SPEED: 3,
  FLOAT_AMPLITUDE: 0.02,
  FLOAT_SPEED: 2,
  EMISSIVE_INTENSITY: 2.5,
  EMISSIVE_INTENSITY_PULSE: 1.0,
  
  // === DISTANCE & PROXIMITY ===
  ARROW_VISIBILITY_DISTANCE: 15,
  ARRIVAL_THRESHOLD: 1.5, // meters
  ARROW_FADE_START: 10,
  ARROW_FADE_END: 15,
  ARROW_SCALE_MIN: 0.1,
  ARROW_SCALE_MAX: 1,
  
  // === CAMERA & CONTROLS ===
  CAMERA_FOV: 75,
  CAMERA_NEAR: 0.1,
  CAMERA_FAR: 1000,
  DEFAULT_ZOOM: 50,
  ORBIT_CONTROLS_AUTO_ROTATE: false,
  
  // === PATHFINDING ===
  FLOOR_CHANGE_PENALTY: 30,
  TURN_PENALTY: 15,
  CONNECTOR_COST_PER_FLOOR: 20,
  FLOOR_PENALTY_3D: 15,
  
  // === LOCATION DETECTION ===
  LOCATION_UPDATE_INTERVAL: 1000, // ms
  GPS_ACCURACY_THRESHOLD: 30, // meters (for outdoor fallback)
  BLE_RSSI_THRESHOLD: -70, // dBm (signal strength)
  WIFI_SCAN_INTERVAL: 5000, // ms
  LOCATION_SMOOTHING_FACTOR: 0.7, // lower = more responsive, higher = smoother
  
  // === AR CALIBRATION ===
  CALIBRATION_TIMEOUT: 10000, // ms
  CALIBRATION_ACCURACY_THRESHOLD: 0.5, // meters
  
  // === UI ===
  ANIMATION_INDEX_INTERVAL: 4,
  DISTANCE_UPDATE_INTERVAL: 100, // ms
  
  // === COLORS ===
  COLORS: {
    ARROW: 0xC792EA,          // Light purple
    ARROW_EMISSIVE: 0xC792EA,
    START_BEACON: 0x4AFF00,   // Green
    END_BEACON: 0xFF0000,     // Red
    FLOOR_TRANSITION: 0xFFAA00, // Orange
    WALL: 0x3A3A5A,           // Dark blue-gray
  },
  
  // === LIGHTS ===
  AMBIENT_LIGHT_INTENSITY: 0.8,
  DIRECTIONAL_LIGHT_INTENSITY: 1,
  POINT_LIGHT_INTENSITY: 0.5,
  SHADOW_MAP_SIZE: 2048,
  
  // === FEATURES (FEATURE FLAGS) ===
  ENABLE_AUDIO_GUIDANCE: true,
  ENABLE_HAPTIC_FEEDBACK: true,
  ENABLE_PATH_CACHING: true,
  ENABLE_WEB_WORKERS: false, // Set to true when implemented
  ENABLE_MINIMAP: true,
  ENABLE_DISTANCE_DISPLAY: true,
  ENABLE_AUTO_LOCATION: true,
};
