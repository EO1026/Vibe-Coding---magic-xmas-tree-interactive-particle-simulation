
import * as THREE from 'three';
import { particleVertexShader, particleFragmentShader } from '../shaders/particleShaders';

export default class Particles {
  mesh: THREE.Points;
  geometry: THREE.BufferGeometry;
  material: THREE.ShaderMaterial;
  count: number;

  constructor(count: number = 65000) {
    this.count = count;
    this.geometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(count * 3);
    const targetPositions = new Float32Array(count * 3);
    const randomPositions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const leafCount = 48000; // Adjusted ratio to give more particles to the gold ribbon
    const goldCount = 17000;
    const treeHeight = 22;
    const treeRadius = 9;

    for (let i = 0; i < count; i++) {
      // 1. Random Start Positions (Scattered)
      const r_start = 30 + Math.random() * 40;
      const theta_start = Math.random() * Math.PI * 2;
      const phi_start = Math.random() * Math.PI * 2;
      randomPositions[i * 3 + 0] = r_start * Math.sin(theta_start) * Math.cos(phi_start);
      randomPositions[i * 3 + 1] = r_start * Math.sin(theta_start) * Math.sin(phi_start);
      randomPositions[i * 3 + 2] = r_start * Math.cos(theta_start);

      // 2. Target Positions (Christmas Tree)
      if (i < leafCount) {
        const y_norm = Math.random(); 
        const y = y_norm * treeHeight;
        
        const numLayers = 7;
        const layerIdx = Math.floor(y_norm * numLayers);
        const layerT = (y_norm * numLayers) - layerIdx; 
        
        const baseRadius = (1.1 - y_norm) * treeRadius;
        const stepEffect = 0.75 + 0.35 * Math.pow(layerT, 1.5);
        const currentRadius = baseRadius * stepEffect;
        
        const angle = Math.random() * Math.PI * 2;
        const distFromCenter = Math.pow(Math.random(), 0.8) * currentRadius;
        
        const yNoise = (Math.random() - 0.5) * 1.0;

        targetPositions[i * 3 + 0] = Math.cos(angle) * distFromCenter;
        targetPositions[i * 3 + 1] = y - treeHeight / 2 - 2 + yNoise; 
        targetPositions[i * 3 + 2] = Math.sin(angle) * distFromCenter;

        const gVar = Math.random();
        colors[i * 3 + 0] = 0.02 + gVar * 0.04;
        colors[i * 3 + 1] = 0.12 + gVar * 0.15;
        colors[i * 3 + 2] = 0.02 + gVar * 0.04;
      } else {
        // Gold Ribbon logic
        const t = (i - leafCount) / goldCount;
        const y = t * treeHeight;
        const y_norm = t;
        const baseRadius = (1.1 - y_norm) * treeRadius;
        const currentRadius = baseRadius * 1.1; // Slightly larger than the tree
        
        // Reduced rotations from 12 to 5.5 for a wider, more majestic flow
        const rotations = 5.5;
        const angle = t * Math.PI * 2 * rotations + (i % 2 === 0 ? 0 : Math.PI); 
        
        // Increased jitter to make the ribbon wider (horizontal spread and vertical thickness)
        const ribbonWidthJitter = 2.2; 
        const ribbonHeightJitter = 1.5;
        const jitterH = (Math.random() - 0.5) * ribbonWidthJitter;
        const jitterV = (Math.random() - 0.5) * ribbonHeightJitter;

        targetPositions[i * 3 + 0] = Math.cos(angle) * (currentRadius + jitterH);
        targetPositions[i * 3 + 1] = y - treeHeight / 2 - 2 + jitterV;
        targetPositions[i * 3 + 2] = Math.sin(angle) * (currentRadius + jitterH);

        // Keep colors as a saturated gold
        colors[i * 3 + 0] = 1.0;
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 0.2;
      }

      positions[i * 3 + 0] = randomPositions[i * 3 + 0];
      positions[i * 3 + 1] = randomPositions[i * 3 + 1];
      positions[i * 3 + 2] = randomPositions[i * 3 + 2];

      sizes[i] = Math.random() * 1.8 + 1.2; // Slightly larger particles overall
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('targetPosition', new THREE.BufferAttribute(targetPositions, 3));
    this.geometry.setAttribute('randomPosition', new THREE.BufferAttribute(randomPositions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uGatherFactor: { value: 0 },
      },
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.mesh = new THREE.Points(this.geometry, this.material);
  }

  update(time: number, isGathered: boolean) {
    this.material.uniforms.uTime.value = time;
    const target = isGathered ? 1.0 : 0.0;
    this.material.uniforms.uGatherFactor.value = THREE.MathUtils.lerp(
      this.material.uniforms.uGatherFactor.value,
      target,
      0.03 
    );
  }
}
