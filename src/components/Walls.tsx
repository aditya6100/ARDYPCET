import * as THREE from 'three';
import type { FloorData } from '../data/floorTypes';

interface WallCreationResult {
  wallGroup: THREE.Group;
  wallMaterial: THREE.MeshStandardMaterial;
}

export function createWalls(floorData: FloorData): WallCreationResult {
  const wallGroup = new THREE.Group();

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x3A3A5A,
    roughness: 0.8,
    metalness: 0.8,
  });

  const wallThickness = floorData.wallThickness || 0.2;
  const wallHeight    = floorData.wallHeight    || 3;

  floorData.walls.forEach(wallData => {
    const p1 = new THREE.Vector3(wallData.p1[0], 0, wallData.p1[1]);
    const p2 = new THREE.Vector3(wallData.p2[0], 0, wallData.p2[1]);

    const wallVector = new THREE.Vector3().subVectors(p2, p1);
    const wallLength = wallVector.length();
    if (wallLength < 0.01) return; // skip degenerate walls

    const wallGeometry = new THREE.BoxGeometry(wallLength, wallHeight, wallThickness);
    const wall = new THREE.Mesh(wallGeometry, wallMaterial.clone());

    const midpoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    wall.position.set(midpoint.x, wallHeight / 2, midpoint.z);
    wall.rotation.y = Math.atan2(wallVector.z, wallVector.x);

    wall.castShadow    = true;
    wall.receiveShadow = true;
    wallGroup.add(wall);
  });

  return { wallGroup, wallMaterial };
}
