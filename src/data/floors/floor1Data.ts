// =============================================================
// Floor 1 — Ground Floor (GYMKHANA, G1-G6)
// Structure mirrors Floor 3 (CSE) exactly as requested.
// =============================================================

export const floor1Data = {
  floorId: 'f1',
  floorNumber: 1,
  floorName: "Ground Floor",

  // ── GREEN CORRIDOR / MIDDLE PORTION POLYGON ───────────────────────────
  corridorPolygon: [
    [ 0.00,  3.20],  // top-left
    [24.54,  3.20],  // corridor top → G2/Stairs boundary
    [24.54,  2.35],  // step UP
    [27.54,  2.35],  // Stairs box corner
    [27.54,  3.20],  // step back down
    [27.54,  3.20],  // jog right to G6
    [38.98,  3.20],  // right edge top
    [38.98,  4.10],  // right edge bottom
    [27.17,  4.10],  // G6 boundary
    [ 5.36,  4.10],  // corridor bottom → Stairs RHS
    [ 5.36,  7.30],  // step DOWN column
    [ 0.00,  7.30],  // left building bottom
    [ 0.00,  4.10],  // left wall back up
  ] as [number, number][],

  corridorColor: '#2ecc40',

  rooms: [
    // --- TOP ROW ---
    { id: "f1_gymkhana",   name: "GYMKHANA",       center: [3.35,  1.60], connectedTo: ["f1_wp_hall_gymkhana"] },
    { id: "f1_g1",         name: "Classroom G1",   center: [8.62,  1.60], connectedTo: ["f1_wp_hall_g1"] },
    { id: "f1_g2",         name: "Classroom G2",   center: [17.54, 1.60], connectedTo: ["f1_wp_hall_g2"] },
    { id: "f1_stairs_top", name: "Stairs (Top)",   center: [26.04, 1.10], connectedTo: ["f1_wp_hall_stairs_top"] },
    { id: "f1_g6",         name: "Classroom G6",   center: [33.15, 3.65], connectedTo: ["f1_wp_hall_g6"] },

    // --- BOTTOM ROW ---
    { id: "f1_lift",       name: "Lift",           center: [0.89,  5.70], connectedTo: [] }, // NO CONNECTION
    { id: "f1_stairs_bot", name: "Stairs (Bot)",   center: [3.57,  5.70], connectedTo: ["f1_wp_hall_stairs_bot"] },
    { id: "f1_g4",         name: "Classroom G4",   center: [10.95, 5.70], connectedTo: ["f1_wp_hall_g4"] },
    { id: "f1_g5",         name: "Classroom G5",   center: [20.54, 5.70], connectedTo: ["f1_wp_hall_g5"] },
    { id: "f1_women",      name: "Women Washroom", center: [25.86, 5.70], connectedTo: ["f1_wp_hall_women"] },
    { id: "f1_gents",      name: "Men Washroom",   center: [38.11, 5.70], connectedTo: ["f1_wp_hall_gents"] },
  ],

  waypoints: [
    { id: "f1_wp_hall_stairs_bot", position: [3.57,  3.65], connectedTo: ["f1_wp_hall_gymkhana"] },
    { id: "f1_wp_hall_gymkhana",   position: [3.35,  3.65], connectedTo: ["f1_wp_hall_stairs_bot", "f1_wp_hall_g1"] },
    { id: "f1_wp_hall_g1",         position: [8.62,  3.65], connectedTo: ["f1_wp_hall_gymkhana", "f1_wp_hall_g4"] },
    { id: "f1_wp_hall_g4",         position: [10.95, 3.65], connectedTo: ["f1_wp_hall_g1", "f1_wp_hall_g2"] },
    { id: "f1_wp_hall_g2",         position: [17.54, 3.65], connectedTo: ["f1_wp_hall_g4", "f1_wp_hall_g5"] },
    { id: "f1_wp_hall_g5",         position: [20.54, 3.65], connectedTo: ["f1_wp_hall_g2", "f1_wp_hall_stairs_top"] },
    { id: "f1_wp_hall_stairs_top", position: [26.04, 3.65], connectedTo: ["f1_wp_hall_g5", "f1_wp_hall_women"] },
    { id: "f1_wp_hall_women",      position: [25.86, 3.65], connectedTo: ["f1_wp_hall_stairs_top", "f1_wp_hall_g6"] },
    { id: "f1_wp_hall_g6",         position: [33.15, 3.65], connectedTo: ["f1_wp_hall_women", "f1_wp_hall_gents"] },
    { id: "f1_wp_hall_gents",      position: [38.11, 3.65], connectedTo: ["f1_wp_hall_g6"] },
  ],

  walls: [
    // Outer
    { p1: [0.00, 0.00], p2: [24.54, 0.00] },
    { p1: [27.54, 0.00], p2: [38.98, 0.00] },
    { p1: [38.98, 0.00], p2: [38.98, 7.30] },
    { p1: [38.98, 7.30], p2: [5.36, 7.30] },
    { p1: [1.78, 7.30], p2: [0.00, 7.30] },
    { p1: [0.00, 7.30], p2: [0.00, 0.00] },
    // Horizontal Corridor
    { p1: [0.00, 3.20], p2: [24.54, 3.20] },
    { p1: [27.54, 3.20], p2: [38.98, 3.20] },
    { p1: [0.00, 4.10], p2: [38.98, 4.10] },
    // Top dividers
    { p1: [6.70, 0.00], p2: [6.70, 3.20] },
    { p1: [13.54, 0.00], p2: [13.54, 3.20] },
    { p1: [24.54, 0.00], p2: [24.54, 3.20] },
    { p1: [27.54, 0.00], p2: [27.54, 3.20] },
    // Bottom dividers
    { p1: [1.78, 4.10], p2: [1.78, 7.30] },
    { p1: [5.36, 4.10], p2: [5.36, 7.30] },
    { p1: [16.54, 4.10], p2: [16.54, 7.30] },
    { p1: [24.54, 4.10], p2: [24.54, 7.30] },
    { p1: [32.38, 4.10], p2: [32.38, 7.30] },
  ],

  wallHeight: 3.00,
  wallThickness: 0.15,

  floorMessages: [
    { id: "m1", type: "welcome", text: "GROUND FLOOR - ENTRANCE", position: [2, 3.65] },
    { id: "m2", type: "quote",   text: "Keep Moving Forward 🚀", position: [15, 3.65] },
  ],
};
