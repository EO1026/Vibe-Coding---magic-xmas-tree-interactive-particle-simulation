import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Particles from './Particles';

interface SceneProps {
  isGathered: boolean;
  onMouseDown: () => void;
  onMouseUp: () => void;
}

const Scene: React.FC<SceneProps> = ({ isGathered, onMouseDown, onMouseUp }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  
  // Custom objects refs
  const particlesRef = useRef<any>(null);

  // Critical: Ref to track the latest isGathered value to avoid stale closure in the loop
  const isGatheredRef = useRef(isGathered);

  useEffect(() => {
    isGatheredRef.current = isGathered;
    if (controlsRef.current) {
      controlsRef.current.autoRotate = !isGathered;
    }
  }, [isGathered]);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050505, 1);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- Camera ---
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 35); 
    cameraRef.current = camera;

    // --- Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = !isGatheredRef.current;
    controls.autoRotateSpeed = 0.5;
    controls.maxDistance = 60;
    controls.minDistance = 10;
    controlsRef.current = controls;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    sceneRef.current.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.5);
    pointLight.position.set(5, 20, 10);
    sceneRef.current.add(pointLight);

    // --- Content ---
    const particles = new Particles(65000);
    sceneRef.current.add(particles.mesh);
    particlesRef.current = particles;

    // --- Loop ---
    const animate = (time: number) => {
      const clock = time * 0.001;
      
      // Use isGatheredRef.current instead of the prop directly to avoid stale closures
      const currentGathered = isGatheredRef.current;

      if (particlesRef.current) {
        particlesRef.current.update(clock, currentGathered);
      }
      
      if (controlsRef.current) {
        controlsRef.current.autoRotate = !currentGathered;
        controlsRef.current.update();
      }

      renderer.render(sceneRef.current, camera);
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);

    // --- Resize ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full cursor-pointer"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onTouchStart={onMouseDown}
      onTouchEnd={onMouseUp}
    />
  );
};

export default Scene;