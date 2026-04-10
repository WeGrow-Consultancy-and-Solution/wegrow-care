import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function FloatingParticles({ count = 40 }: { count?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 8,
      ] as [number, number, number],
      speed: 0.2 + Math.random() * 0.5,
      offset: Math.random() * Math.PI * 2,
      scale: 0.03 + Math.random() * 0.08,
    }));
  }, [count]);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.getElapsedTime();

    particles.forEach((p, i) => {
      dummy.position.set(
        p.position[0] + Math.sin(t * p.speed + p.offset) * 0.5,
        p.position[1] + Math.cos(t * p.speed + p.offset) * 0.3,
        p.position[2]
      );
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });

    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial
        color="#0d9488"
        transparent
        opacity={0.4}
        roughness={0.3}
        metalness={0.1}
      />
    </instancedMesh>
  );
}

function GlowOrb({ position, color, size }: { position: [number, number, number]; color: string; size: number }) {
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1.2}>
      <Sphere args={[size, 32, 32]} position={position}>
        <MeshDistortMaterial
          color={color}
          transparent
          opacity={0.15}
          roughness={0.2}
          metalness={0.3}
          distort={0.25}
          speed={2}
        />
      </Sphere>
    </Float>
  );
}

function DNAHelix() {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.y = clock.getElapsedTime() * 0.15;
    }
  });

  const helixPoints = useMemo(() => {
    const points: { pos: [number, number, number]; color: string }[] = [];
    for (let i = 0; i < 30; i++) {
      const t = (i / 30) * Math.PI * 4;
      const y = (i / 30) * 6 - 3;
      points.push({
        pos: [Math.cos(t) * 1.5, y, Math.sin(t) * 1.5],
        color: i % 2 === 0 ? '#14b8a6' : '#2dd4bf',
      });
      points.push({
        pos: [Math.cos(t + Math.PI) * 1.5, y, Math.sin(t + Math.PI) * 1.5],
        color: i % 2 === 0 ? '#0d9488' : '#5eead4',
      });
    }
    return points;
  }, []);

  return (
    <group ref={group} position={[4, 0, -3]}>
      {helixPoints.map((point, i) => (
        <Sphere key={i} args={[0.06, 8, 8]} position={point.pos}>
          <meshStandardMaterial color={point.color} transparent opacity={0.5} />
        </Sphere>
      ))}
    </group>
  );
}

export function ThreeBackground() {
  return (
    <div className="absolute inset-0 z-0" style={{ pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.4} />
        <pointLight position={[-5, -5, -5]} intensity={0.2} color="#14b8a6" />

        <FloatingParticles count={35} />
        <DNAHelix />
        <GlowOrb position={[-3, 2, -2]} color="#0d9488" size={1.8} />
        <GlowOrb position={[5, -1, -4]} color="#14b8a6" size={1.2} />
        <GlowOrb position={[-5, -2, -3]} color="#2dd4bf" size={0.9} />
      </Canvas>
    </div>
  );
}
