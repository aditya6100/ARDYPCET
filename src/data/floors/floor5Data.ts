// =============================================================
// Floor 5 — 4th Floor (ENTC Dept)
// Structure mirrors Floor 3 (CSE) exactly as requested.
// =============================================================

export const floor5Data = {
  floorId: 'f5',
  floorNumber: 5,
  floorName: "4th Floor (ENTC)",

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
    { id: "f5_entc_hod",   name: "ENTC HOD Cabin", center: [3.35,  1.60], connectedTo: ["f5_wp_hall_hod"] },
    { id: "f5_dept_lib",   name: "Dept Library",   center: [8.62,  1.60], connectedTo: ["f5_wp_hall_dlib"] },
    { id: "f5_tutorial",   name: "Tutorial Room",  center: [17.54, 1.60], connectedTo: ["f5_wp_hall_lab11"] },
    { id: "f5_lab11",      name: "Lab 11",         center: [26.04, 1.10], connectedTo: ["f5_wp_hall_lab11"] },
    { id: "f5_lab12",      name: "Lab 12",         center: [33.15, 3.65], connectedTo: ["f5_wp_hall_lab12"] },
    { id: "f5_lift",       name: "Lift",           center: [0.89,  5.70], connectedTo: [] }, 
    { id: "f5_stairs_bot", name: "Stairs (Bot)",   center: [3.57,  5.70], connectedTo: ["f5_wp_hall_stairs_bot"] },
    { id: "f5_lab13",      name: "Lab 13",         center: [10.95, 5.70], connectedTo: ["f5_wp_hall_lab14"] },
    { id: "f5_lab14",      name: "Lab 14",         center: [20.54, 5.70], connectedTo: ["f5_wp_hall_lab14"] },
  ],

  waypoints: [
    { id: "f5_wp_hall_stairs_bot", position: [3.57,  3.65], connectedTo: ["f5_wp_hall_hod"] },
    { id: "f5_wp_hall_hod",        position: [3.35,  3.65], connectedTo: ["f5_wp_hall_stairs_bot", "f5_wp_hall_dlib"] },
    { id: "f5_wp_hall_dlib",       position: [8.62,  3.65], connectedTo: ["f5_wp_hall_hod", "f5_wp_hall_lab11"] },
    { id: "f5_wp_hall_lab11",      position: [17.54, 3.65], connectedTo: ["f5_wp_hall_dlib", "f5_wp_hall_lab12"] },
    { id: "f5_wp_hall_lab12",      position: [33.15, 3.65], connectedTo: ["f5_wp_hall_lab11", "f5_wp_hall_lab14"] },
    { id: "f5_wp_hall_lab14",      position: [20.54, 3.65], connectedTo: ["f5_wp_hall_lab12"] },
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
    { id: "m1", type: "welcome", text: "WELCOME TO ENTC DEPT", position: [2, 3.65] },
    { id: "m2", type: "quote",   text: "Connecting the World 📡", position: [15, 3.65] },
  ],
};
