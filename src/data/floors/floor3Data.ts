import type { FloorData } from '../floorTypes';

// =============================================================
// Floor 3 — CSE Department (2nd Floor)
// MOVED from f2 to f3 as it is the 2nd Floor.
// AUTO-GENERATED from Secondfloorcse.dxf
// =============================================================

export const floor3Data: FloorData = {
  floorId: 'f3',
  floorNumber: 3,
  floorName: 'CSE Department (2nd Floor)',

  rooms: [
    { id: 'f3_hod',        name: 'HOD Cabin',      center: [ 2.025, 1.764] as [number,number], connectedTo: ['f3_wp_hod']        },
    { id: 'f3_dept_lib',   name: 'Dept Library',   center: [ 5.541, 1.764] as [number,number], connectedTo: ['f3_wp_lib']        },
    { id: 'f3_server',     name: 'Server Room',    center: [ 9.352, 1.764] as [number,number], connectedTo: ['f3_wp_server']     },
    { id: 'f3_tutorial',   name: 'Tutorial Room',  center: [14.063, 1.764] as [number,number], connectedTo: ['f3_wp_tutorial']   },
    { id: 'f3_lab10',      name: 'Lab 10',         center: [22.942, 1.764] as [number,number], connectedTo: ['f3_wp_lab10']      },
    { id: 'f3_stairs_top', name: 'Stairs',         center: [29.741, 1.678] as [number,number], connectedTo: ['f3_wp_stairs_top'] },
    { id: 'f3_lab9',       name: 'Lab 9',          center: [36.276, 3.650] as [number,number], connectedTo: ['f3_wp_lab9']       },
    { id: 'f3_corridor',   name: 'Middle Portion', center: [14.887, 4.095] as [number,number], connectedTo: ['f3_wp_lab7']       },
    { id: 'f3_lift',       name: 'Lift',           center: [ 2.680, 5.894] as [number,number], connectedTo: ['f3_wp_lift']       },
    { id: 'f3_stairs_bot', name: 'Stairs',         center: [ 6.601, 5.894] as [number,number], connectedTo: ['f3_wp_stairs_bot'] },
    { id: 'f3_lab7',       name: 'Lab 7',          center: [14.043, 5.979] as [number,number], connectedTo: ['f3_wp_lab7']       },
    { id: 'f3_lab8',       name: 'Lab 8',          center: [23.191, 5.979] as [number,number], connectedTo: ['f3_wp_lab8']       },
    { id: 'f3_women',      name: 'Women Washroom', center: [29.576, 5.979] as [number,number], connectedTo: ['f3_wp_women']      },
    { id: 'f3_gents',      name: 'Men Washroom',   center: [35.461, 6.182] as [number,number], connectedTo: ['f3_wp_gents']      },
  ],

  waypoints: [
    { id: 'f3_wp_lift',       position: [ 2.680, 4.095] as [number,number], connectedTo: ['f3_wp_stairs_bot'] },
    { id: 'f3_wp_stairs_bot', position: [ 6.601, 4.095] as [number,number], connectedTo: ['f3_wp_lift',  'f3_wp_lab7',  'f2_wp_stairs_bot', 'f4_wp_hall_stairs_bot'] },
    { id: 'f3_wp_hod',        position: [ 2.025, 4.095] as [number,number], connectedTo: ['f3_wp_stairs_bot', 'f3_wp_lib'] },
    { id: 'f3_wp_lib',        position: [ 5.541, 4.095] as [number,number], connectedTo: ['f3_wp_hod',         'f3_wp_server'] },
    { id: 'f3_wp_server',     position: [ 9.352, 4.095] as [number,number], connectedTo: ['f3_wp_lib',         'f3_wp_tutorial'] },
    { id: 'f3_wp_tutorial',   position: [14.063, 4.095] as [number,number], connectedTo: ['f3_wp_server',      'f3_wp_lab10'] },
    { id: 'f3_wp_lab10',      position: [22.942, 4.095] as [number,number], connectedTo: ['f3_wp_tutorial',    'f3_wp_stairs_top'] },
    { id: 'f3_wp_stairs_top', position: [29.741, 4.095] as [number,number], connectedTo: ['f3_wp_lab10', 'f3_wp_lab9',  'f2_wp_stairs_top', 'f4_wp_hall_stairs_top'] },
    { id: 'f3_wp_lab7',       position: [14.043, 4.095] as [number,number], connectedTo: ['f3_wp_stairs_bot',  'f3_wp_lab8'] },
    { id: 'f3_wp_lab8',       position: [23.191, 4.095] as [number,number], connectedTo: ['f3_wp_lab7',        'f3_wp_women'] },
    { id: 'f3_wp_women',      position: [29.576, 4.095] as [number,number], connectedTo: ['f3_wp_lab8',        'f3_wp_gents'] },
    { id: 'f3_wp_gents',      position: [35.461, 4.095] as [number,number], connectedTo: ['f3_wp_women',       'f3_wp_lab9'] },
    { id: 'f3_wp_lab9',       position: [36.276, 4.095] as [number,number], connectedTo: ['f3_wp_stairs_top',  'f3_wp_gents'] },
  ],

  walls: [
    { p1: [ 0.000, 0.000] as [number,number], p2: [41.311, 0.000] as [number,number] },
    { p1: [41.311, 0.000] as [number,number], p2: [41.311, 7.300] as [number,number] },
    { p1: [41.311, 7.300] as [number,number], p2: [ 0.000, 7.300] as [number,number] },
    { p1: [ 0.000, 7.300] as [number,number], p2: [ 0.000, 0.000] as [number,number] },
    { p1: [ 0.000, 6.489] as [number,number], p2: [ 5.360, 6.489] as [number,number] },
    { p1: [ 0.049, 3.528] as [number,number], p2: [ 0.000, 6.489] as [number,number] },
    { p1: [ 0.049, 3.528] as [number,number], p2: [ 4.049, 3.539] as [number,number] },
    { p1: [ 5.041, 3.539] as [number,number], p2: [ 6.041, 3.539] as [number,number] },
    { p1: [ 6.041, 3.539] as [number,number], p2: [ 9.127, 3.534] as [number,number] },
    { p1: [ 9.677, 3.536] as [number,number], p2: [11.063, 3.536] as [number,number] },
    { p1: [11.063, 3.536] as [number,number], p2: [17.063, 3.520] as [number,number] },
    { p1: [18.442, 3.520] as [number,number], p2: [26.442, 3.499] as [number,number] },
    { p1: [31.241, 3.495] as [number,number], p2: [31.241, 0.000] as [number,number] },
    { p1: [ 8.740, 4.659] as [number,number], p2: [17.063, 4.659] as [number,number] },
    { p1: [18.463, 4.659] as [number,number], p2: [26.442, 4.659] as [number,number] },
    { p1: [ 6.041, 3.539] as [number,number], p2: [ 6.041, 0.000] as [number,number] },
    { p1: [ 9.677, 3.541] as [number,number], p2: [ 9.677, 0.000] as [number,number] },
    { p1: [15.563, 3.536] as [number,number], p2: [15.563, 0.000] as [number,number] },
    { p1: [19.442, 3.520] as [number,number], p2: [19.442, 0.000] as [number,number] },
    { p1: [28.241, 3.495] as [number,number], p2: [28.241, 0.000] as [number,number] },
    { p1: [31.241, 4.359] as [number,number], p2: [41.311, 4.359] as [number,number] },
    { p1: [41.311, 4.359] as [number,number], p2: [41.311, 5.065] as [number,number] },
    { p1: [41.311, 5.065] as [number,number], p2: [41.311, 0.000] as [number,number] },
    { p1: [ 8.740, 5.069] as [number,number], p2: [ 8.740, 7.300] as [number,number] },
    { p1: [19.442, 4.659] as [number,number], p2: [19.442, 7.300] as [number,number] },
    { p1: [27.911, 5.065] as [number,number], p2: [27.911, 7.300] as [number,number] },
    { p1: [27.911, 5.065] as [number,number], p2: [28.311, 5.065] as [number,number] },
    { p1: [29.211, 5.065] as [number,number], p2: [35.011, 5.065] as [number,number] },
    { p1: [34.811, 5.065] as [number,number], p2: [34.811, 7.300] as [number,number] },
    { p1: [35.911, 5.065] as [number,number], p2: [41.311, 5.065] as [number,number] },
  ],

  wallHeight: 3.00,
  wallThickness: 0.15,
  planSize: { width: 41.311, height: 7.300 },
};
