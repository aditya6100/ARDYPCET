// =============================================================
// Floor 4 — 3rd Floor (Classrooms 301-306)
// Structure mirrors Floor 3 (CSE) exactly as requested.
// =============================================================

export const floor4Data = {
  floorId: 'f4',
  floorNumber: 4,
  floorName: "3rd Floor",

  // ── GREEN CORRIDOR / MIDDLE PORTION POLYGON ───────────────────────────
  corridorPolygon: [
    [ 0.00,  3.20],  // top-left
    [24.54,  3.20],  // corridor top → Room303/Stairs boundary
    [24.54,  2.35],  // step UP
    [27.54,  2.35],  // Stairs box corner
    [27.54,  3.20],  // step back down
    [27.54,  3.20],  // jog right to Room306
    [38.98,  3.20],  // right edge top
    [38.98,  4.10],  // right edge bottom
    [27.17,  4.10],  // Room306 boundary
    [ 5.36,  4.10],  // corridor bottom → Stairs RHS
    [ 5.36,  7.30],  // step DOWN column
    [ 0.00,  7.30],  // left building bottom
    [ 0.00,  4.10],  // left wall back up
  ] as [number, number][],

  corridorColor: '#2ecc40',

  rooms: [
    // --- TOP ROW ---
    { id: "f4_301",        name: "Classroom 301",  center: [3.35,  1.60], connectedTo: ["f4_wp_hall_301"] },
    { id: "f4_302",        name: "Classroom 302",  center: [8.62,  1.60], connectedTo: ["f4_wp_hall_302"] },
    { id: "f4_303",        name: "Classroom 303",  center: [17.54, 1.60], connectedTo: ["f4_wp_hall_303"] },
    { id: "f4_stairs_top", name: "Stairs (Top)",   center: [26.04, 1.10], connectedTo: ["f4_wp_hall_stairs_top"] },
    { id: "f4_306",        name: "Classroom 306",  center: [33.15, 3.65], connectedTo: ["f4_wp_hall_306"] },

    // --- BOTTOM ROW ---
    { id: "f4_lift",       name: "Lift",           center: [0.89,  5.70], connectedTo: [] }, // NO CONNECTION
    { id: "f4_stairs_bot", name: "Stairs (Bot)",   center: [3.57,  5.70], connectedTo: ["f4_wp_hall_stairs_bot"] },
    { id: "f4_304",        name: "Classroom 304",  center: [10.95, 5.70], connectedTo: ["f4_wp_hall_304"] },
    { id: "f4_305",        name: "Classroom 305",  center: [20.54, 5.70], connectedTo: ["f4_wp_hall_305"] },
    { id: "f4_women",      name: "Women Washroom", center: [25.86, 5.70], connectedTo: ["f4_wp_hall_women"] },
    { id: "f4_gents",      name: "Men Washroom",   center: [38.11, 5.70], connectedTo: ["f4_wp_hall_gents"] },
  ],

  waypoints: [
    { id: "f4_wp_hall_stairs_bot", position: [3.57,  3.65], connectedTo: ["f4_wp_hall_301"] },
    { id: "f4_wp_hall_301",        position: [3.35,  3.65], connectedTo: ["f4_wp_hall_stairs_bot", "f4_wp_hall_302"] },
    { id: "f4_wp_hall_302",        position: [8.62,  3.65], connectedTo: ["f4_wp_hall_301", "f4_wp_hall_304"] },
    { id: "f4_wp_hall_304",        position: [10.95, 3.65], connectedTo: ["f4_wp_hall_302", "f4_wp_hall_303"] },
    { id: "f4_wp_hall_303",        position: [17.54, 3.65], connectedTo: ["f4_wp_hall_304", "f4_wp_hall_305"] },
    { id: "f4_wp_hall_305",        position: [20.54, 3.65], connectedTo: ["f4_wp_hall_303", "f4_wp_hall_stairs_top"] },
    { id: "f4_wp_hall_stairs_top", position: [26.04, 3.65], connectedTo: ["f4_wp_hall_305", "f4_wp_hall_women"] },
    { id: "f4_wp_hall_women",      position: [25.86, 3.65], connectedTo: ["f4_wp_hall_stairs_top", "f4_wp_hall_306"] },
    { id: "f4_wp_hall_306",        position: [33.15, 3.65], connectedTo: ["f4_wp_hall_women", "f4_wp_hall_gents"] },
    { id: "f4_wp_hall_gents",      position: [38.11, 3.65], connectedTo: ["f4_wp_hall_306"] },
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
    { id: "m1", type: "welcome", text: "3RD FLOOR CLASSROOMS", position: [2, 3.65] },
    { id: "m2", type: "quote",   text: "Knowledge is Power 📚", position: [15, 3.65] },
  ],
};
