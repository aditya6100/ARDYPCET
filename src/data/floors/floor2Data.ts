import type { FloorData } from '../floorTypes';

// =============================================================
// Floor 2 — 1st Floor
// Placeholder layout until actual geometry is provided.
// =============================================================

export const floor2Data: FloorData = {
  floorId: 'f2',
  floorNumber: 2,
  floorName: '1st Floor',

  rooms: [
    { id: 'f2_room_placeholder', name: 'Room 201', center: [10, 5], connectedTo: ['f2_wp_stairs_bot'] }
  ],

  waypoints: [
    { id: 'f2_wp_stairs_bot', position: [ 6.601, 4.095], connectedTo: ['f1_wp_hall_stairs_bot', 'f3_wp_stairs_bot'] },
    { id: 'f2_wp_stairs_top', position: [ 29.741, 4.095], connectedTo: ['f1_wp_hall_stairs_top', 'f3_wp_stairs_top'] },
  ],

  walls: [
    { p1: [0, 0], p2: [41, 0] },
    { p1: [41, 0], p2: [41, 7] },
    { p1: [41, 7], p2: [0, 7] },
    { p1: [0, 7], p2: [0, 0] },
  ],

  wallHeight: 3.00,
  wallThickness: 0.15,
  planSize: { width: 41, height: 7 },
};
