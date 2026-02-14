
import * as THREE from 'three';

export default class Decorations {
  group: THREE.Group;
  ornaments: THREE.InstancedMesh;
  ornamentCount = 100;
  ornamentData: { pos: THREE.Vector3; scale: number; speed: number }[] = [];

  constructor() {
    this.group = new THREE.Group();

    // 1. Ornaments (InstancedMesh)
    const sphereGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const sphereMat = new THREE.MeshStandardMaterial({ 
      color: 0xff2222, 
      emissive: 0x550000,
      metalness: 0.9, 
      roughness: 0.1 
    });
    this.ornaments = new THREE.InstancedMesh(sphereGeo, sphereMat, this.ornamentCount);
    
    const treeHeight = 22;
    const treeRadius = 9;
    const dummy = new THREE.Object3D();

    for (let i = 0; i < this.ornamentCount; i++) {
      const y_norm = Math.random();
      const y = y_norm * treeHeight - treeHeight / 2 - 2;
      const currentRadius = (1.1 - y_norm) * treeRadius;
      const angle = Math.random() * Math.PI * 2;
      
      // Place ornaments on the surface of the tree
      const pos = new THREE.Vector3(
        Math.cos(angle) * currentRadius * 0.95,
        y,
        Math.sin(angle) * currentRadius * 0.95
      );
      
      this.ornamentData.push({
        pos: pos,
        scale: 0.8 + Math.random() * 0.5,
        speed: 1.0 + Math.random() * 2.5
      });

      dummy.position.copy(pos);
      dummy.scale.set(0, 0, 0); // Start hidden
      dummy.updateMatrix();
      this.ornaments.setMatrixAt(i, dummy.matrix);
    }
    this.group.add(this.ornaments);
  }

  update(time: number, isGathered: boolean) {
    // Ornaments animation (Breathing + Visibility)
    const dummy = new THREE.Object3D();
    for (let i = 0; i < this.ornamentCount; i++) {
      const data = this.ornamentData[i];
      const breathing = 1.0 + Math.sin(time * data.speed) * 0.15;
      const transitionScale = isGathered ? data.scale * breathing : 0;
      
      // Use the instance matrix to update
      this.ornaments.getMatrixAt(i, dummy.matrix);
      dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
      
      const lerpedS = THREE.MathUtils.lerp(dummy.scale.x, transitionScale, 0.05);
      
      dummy.position.copy(data.pos);
      dummy.scale.set(lerpedS, lerpedS, lerpedS);
      dummy.updateMatrix();
      this.ornaments.setMatrixAt(i, dummy.matrix);
    }
    this.ornaments.instanceMatrix.needsUpdate = true;
  }
}
