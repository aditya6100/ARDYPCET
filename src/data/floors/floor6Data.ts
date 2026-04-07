// =============================================================
// Floor 6 — 5th Floor (501-505)
// Structure mirrors Floor 3 (CSE) exactly as requested.
// =============================================================

export const floor6Data = {
  floorId: 'f6',
  floorNumber: 6,
  floorName: "5th Floor",

  // ── GREEN CORRIDOR / MIDDLE PORTION POLYGON ───────────────────────────
  corridorPolygon: [
    [ 0.00,  3.20],  
    [24.54,  3.20],  
    [24.54,  2.35],  
    [27.54,  2.35],  
    [27.54,  3.20],  
    [27.54,  3.20],  
    [38.98,  3.20],  
    [38.98,  4.10],  
    [27.17,  4.10],  
    [ 5.36,  4.10],  
    [ 5.36,  7.30],  
    [ 0.00,  7.30],  
    [ 0.00,  4.10],  
  ] as [number, number][],

  corridorColor: '#2ecc40',

  rooms: [
    { id: "f6_501",        name: "Classroom 501",  center: [3.35,  1.60], connectedTo: ["f6_wp_hall_501"] },
    { id: "f6_502",        name: "Classroom 502",  center: [8.62,  1.60], connectedTo: ["f6_wp_hall_502"] },
    { id: "f6_503",        name: "Classroom 503",  center: [17.54, 1.60], connectedTo: ["f6_wp_hall_503"] },
    { id: "f6_504",        name: "Classroom 504",  center: [26.04, 1.10], connectedTo: ["f6_wp_hall_503"] },
    { id: "f6_505",        name: "Classroom 505",  center: [33.15, 3.65], connectedTo: ["f6_wp_hall_505"] },
    { id: "f6_lift",       name: "Lift",           center: [0.89,  5.70], connectedTo: [] }, 
    { id: "f6_stairs_bot", name: "Stairs (Bot)",   center: [3.57,  5.70], connectedTo: ["f6_wp_hall_stairs_bot"] },
  ],

  waypoints: [
    { id: "f6_wp_hall_stairs_bot", position: [3.57,  3.65], connectedTo: ["f6_wp_hall_501"] },
    { id: "f6_wp_hall_501",        position: [3.35,  3.65], connectedTo: ["f6_wp_hall_stairs_bot", "f6_wp_hall_502"] },
    { id: "f6_wp_hall_502",        position: [8.62,  3.65], connectedTo: ["f6_wp_hall_501", "f6_wp_hall_503"] },
    { id: "f6_wp_hall_503",        position: [17.54, 3.65], connectedTo: ["f6_wp_hall_502", "f6_wp_hall_505"] },
    { id: "f6_wp_hall_505",        position: [33.15, 3.65], connectedTo: ["f6_wp_hall_503"] },
  ],

  walls: [
    { p1: [0.00, 0.00], p2: [38.98, 0.00] },
    { p1: [38.98, 0.00], p2: [38.98, 7.30] },
    { p1: [38.98, 7.30], p2: [0.00, 7.30] },
    { p1: [0.00, 7.30], p2: [0.00, 0.00] },
    { p1: [0.00, 3.20], p2: [38.98, 3.20] },
    { p1: [0.00, 4.10], p2: [38.98, 4.10] },
  ],

  wallHeight: 3.00,
  wallThickness: 0.15,

  floorMessages: [
    { id: "m1", type: "welcome", text: "5TH FLOOR CLASSROOMS", position: [2, 3.65] },
    { id: "m2", type: "quote",   text: "Reach for the Stars ✨", position: [15, 3.65] },
  ],
};
