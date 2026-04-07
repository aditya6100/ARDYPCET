export interface Room {
  id: string;
  name: string;
  center: [number, number];
  connectedTo: string[];
}

export interface Waypoint {
  id: string;
  position: [number, number];
  connectedTo: string[];
}

export interface Wall {
  p1: [number, number];
  p2: [number, number];
}

export interface FloorMessage {
  id: string;
  text: string;
  position: [number, number];
  type: 'welcome' | 'quote' | 'utility';
}

export interface Door {
  room: string;
  wallSide: 'top' | 'bottom' | 'left' | 'right';
  posX: number;
  posZ?: number;
  width: number;
}

export interface Feature {
  id: string;
  name: string;
  type: string;
  center: [number, number];
  size: { width: number; depth: number };
}

export interface FloorData {
  floorId: string;
  floorNumber: number;
  floorName: string;
  rooms: Room[];
  waypoints: Waypoint[];
  walls: Wall[];
  corridorPolygon?: [number, number][]; // 👈 Added
  corridorColor?: string;               // 👈 Added
  doors?: Door[];                       // 👈 Added
  features?: Feature[];                 // 👈 Added
  floorMessages?: FloorMessage[];
  wallHeight: number;
  wallThickness: number;
  planSize?: { width: number; height: number };
}
