'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from 'framer-motion';

function latLongToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

interface Arc {
  id: number;
  curve: THREE.CatmullRomCurve3;
  progress: number;
  fadeOut: boolean;
  opacity: number;
  line: THREE.Line | null;
  startDot: THREE.Mesh | null;
  endDot: THREE.Mesh | null;
}

function GlobeScene() {
  const { scene } = useThree();
  const globeRef = useRef<THREE.Mesh>(null);
  const arcsRef = useRef<Arc[]>([]);
  const arcIdRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const prefersReduced = useReducedMotion();

  const createArc = useCallback(() => {
    const id = arcIdRef.current++;
    const startLat = (Math.random() - 0.5) * 140;
    const startLon = (Math.random() - 0.5) * 360;
    const endLat = (Math.random() - 0.5) * 140;
    const endLon = (Math.random() - 0.5) * 360;

    const start = latLongToVector3(startLat, startLon, 1.02);
    const end = latLongToVector3(endLat, endLon, 1.02);
    const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(1.4);

    const curve = new THREE.CatmullRomCurve3([start, mid, end]);

    const dotGeo = new THREE.SphereGeometry(0.015, 6, 6);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xF15A22 });
    const startDot = new THREE.Mesh(dotGeo, dotMat.clone());
    const endDot = new THREE.Mesh(dotGeo.clone(), dotMat.clone());
    startDot.position.copy(start);
    endDot.position.copy(end);
    scene.add(startDot);
    scene.add(endDot);

    const points = curve.getPoints(60);
    const lineGeo = new THREE.BufferGeometry().setFromPoints([points[0]]);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xF15A22,
      transparent: true,
      opacity: 0.8,
    });
    const line = new THREE.Line(lineGeo, lineMat);
    scene.add(line);

    const arc: Arc = { id, curve, progress: 0, fadeOut: false, opacity: 0.8, line, startDot, endDot };
    arcsRef.current.push(arc);
  }, [scene]);

  const removeArc = useCallback((arc: Arc) => {
    if (arc.line) scene.remove(arc.line);
    if (arc.startDot) scene.remove(arc.startDot);
    if (arc.endDot) scene.remove(arc.endDot);
    arcsRef.current = arcsRef.current.filter((a) => a.id !== arc.id);
  }, [scene]);

  useEffect(() => {
    // Globe mesh
    const geo = new THREE.SphereGeometry(1, 48, 48);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x0D1520,
      roughness: 0.8,
      metalness: 0.2,
    });
    const globe = new THREE.Mesh(geo, mat);
    if (globeRef.current) {
      // already attached via ref
    }
    scene.add(globe);

    // Wireframe overlay
    const wireGeo = new THREE.SphereGeometry(1.001, 24, 24);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x2A2A2A,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wire);

    // Ambient and directional light
    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xF15A22, 0.5);
    dir.position.set(2, 2, 2);
    scene.add(dir);

    // Spawn initial arcs
    for (let i = 0; i < 5; i++) createArc();

    return () => {
      scene.remove(globe);
      scene.remove(wire);
      scene.remove(ambient);
      scene.remove(dir);
      arcsRef.current.forEach(removeArc);
    };
  }, [scene, createArc, removeArc]);

  useFrame((_, delta) => {
    if (prefersReduced) return;

    lastSpawnRef.current += delta;

    // Spawn new arcs periodically
    if (lastSpawnRef.current > 1.5 && arcsRef.current.length < 8) {
      createArc();
      lastSpawnRef.current = 0;
    }

    // Update arcs
    const toRemove: Arc[] = [];
    arcsRef.current.forEach((arc) => {
      if (!arc.line) return;

      if (!arc.fadeOut) {
        arc.progress = Math.min(arc.progress + delta * 0.5, 1);
        const count = Math.floor(arc.progress * 60) + 1;
        const pts = arc.curve.getPoints(60).slice(0, count);
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        arc.line.geometry.dispose();
        arc.line.geometry = geo;

        if (arc.progress >= 1) arc.fadeOut = true;
      } else {
        arc.opacity -= delta * 0.8;
        (arc.line.material as THREE.LineBasicMaterial).opacity = Math.max(0, arc.opacity);
        if (arc.startDot) (arc.startDot.material as THREE.MeshBasicMaterial).opacity = Math.max(0, arc.opacity);
        if (arc.endDot) (arc.endDot.material as THREE.MeshBasicMaterial).opacity = Math.max(0, arc.opacity);

        if (arc.opacity <= 0) toRemove.push(arc);
      }
    });

    toRemove.forEach(removeArc);
  });

  return null;
}

export default function GlobeNetwork({ className }: { className?: string }) {
  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 2.8], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <GlobeScene />
        <OrbitControls
          autoRotate
          autoRotateSpeed={0.5}
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
        />
      </Canvas>
    </div>
  );
}
