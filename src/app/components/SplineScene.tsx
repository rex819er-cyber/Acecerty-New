import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

const CERT_LABELS = ['CISSP', 'AWS', 'Azure', 'PMP', 'CCNA', 'CEH', 'Security+', 'CISM'];
const CERT_COLORS = ['#00A2B6', '#FF9900', '#0078D4', '#1E6FBE', '#00BCEB', '#C8102E', '#C8102E', '#7B5EA7'];

export function SplineScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  const mouseRef = useRef({ x: 0, y: 0 });
  const isDarkRef = useRef(isDark);

  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Renderer ──────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ── Scene & Camera ────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 8);

    // ── Lights ────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00a2b6, 3, 20);
    pointLight1.position.set(4, 4, 4);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x7b5ea7, 2, 20);
    pointLight2.position.set(-4, -3, 3);
    scene.add(pointLight2);

    // ── Central rotating torus knot (main 3D object) ──────────────────
    const knotGeo = new THREE.TorusKnotGeometry(1.4, 0.38, 128, 16);
    const knotMat = new THREE.MeshStandardMaterial({
      color: 0x00a2b6,
      metalness: 0.85,
      roughness: 0.12,
      emissive: new THREE.Color(0x003f4a),
      emissiveIntensity: 0.4,
    });
    const knotMesh = new THREE.Mesh(knotGeo, knotMat);
    scene.add(knotMesh);

    // ── Floating cert badges (icosahedra) ────────────────────────────
    const badges: { mesh: THREE.Mesh; orbitRadius: number; orbitSpeed: number; orbitOffset: number; bobSpeed: number; bobAmp: number; }[] = [];

    CERT_COLORS.forEach((col, i) => {
      const angle = (i / CERT_COLORS.length) * Math.PI * 2;
      const radius = 3.2 + (i % 3) * 0.5;
      const geo = new THREE.IcosahedronGeometry(0.28 + (i % 2) * 0.1, 0);
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(col),
        metalness: 0.7,
        roughness: 0.2,
        emissive: new THREE.Color(col).multiplyScalar(0.3),
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle * 0.7) * 1.5,
        Math.sin(angle) * radius * 0.4,
      );
      scene.add(mesh);
      badges.push({
        mesh,
        orbitRadius: radius,
        orbitSpeed: 0.18 + i * 0.025,
        orbitOffset: angle,
        bobSpeed: 1.2 + i * 0.3,
        bobAmp: 0.4 + (i % 3) * 0.2,
      });
    });

    // ── Ring ──────────────────────────────────────────────────────────
    const ringGeo = new THREE.TorusGeometry(2.4, 0.025, 8, 80);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x00a2b6,
      metalness: 1,
      roughness: 0.1,
      emissive: new THREE.Color(0x00a2b6),
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.55,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    scene.add(ring);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(3.2, 0.015, 8, 80),
      new THREE.MeshStandardMaterial({
        color: 0x7b5ea7,
        metalness: 1,
        roughness: 0.1,
        emissive: new THREE.Color(0x7b5ea7),
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.35,
      }),
    );
    ring2.rotation.x = Math.PI / 5;
    ring2.rotation.z = Math.PI / 4;
    scene.add(ring2);

    // ── Particle cloud ────────────────────────────────────────────────
    const particleCount = 160;
    const pPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * 14;
      pPositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x00a2b6,
      size: 0.04,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ── Mouse tracking ────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    mount.addEventListener('mousemove', onMouseMove);

    // ── Resize ────────────────────────────────────────────────────────
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // ── Animation loop ────────────────────────────────────────────────
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Torus knot rotation + mouse tilt
      knotMesh.rotation.x = t * 0.18 + mouseRef.current.y * 0.3;
      knotMesh.rotation.y = t * 0.25 + mouseRef.current.x * 0.3;

      // Rings
      ring.rotation.z = t * 0.12;
      ring2.rotation.y = t * 0.08;

      // Particles drift
      particles.rotation.y = t * 0.04;
      particles.rotation.x = t * 0.02;

      // Badges orbit
      badges.forEach((b, i) => {
        const angle = b.orbitOffset + t * (b.orbitSpeed * (i % 2 === 0 ? 1 : -0.7));
        b.mesh.position.x = Math.cos(angle) * b.orbitRadius;
        b.mesh.position.z = Math.sin(angle) * b.orbitRadius * 0.4;
        b.mesh.position.y = Math.sin(t * b.bobSpeed + b.orbitOffset) * b.bobAmp;
        b.mesh.rotation.x = t * 0.6 + i;
        b.mesh.rotation.y = t * 0.9 + i;
      });

      // Soft camera drift toward mouse
      camera.position.x += (mouseRef.current.x * 0.8 - camera.position.x) * 0.04;
      camera.position.y += (mouseRef.current.y * 0.5 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      // Light pulse
      pointLight1.intensity = 3 + Math.sin(t * 2.1) * 0.6;
      pointLight2.intensity = 2 + Math.cos(t * 1.7) * 0.5;

      // Theme-driven material color
      if (isDarkRef.current) {
        (knotMat as THREE.MeshStandardMaterial).emissiveIntensity = 0.4;
        pMat.opacity = 0.6;
      } else {
        (knotMat as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
        pMat.opacity = 0.35;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      mount.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full"
      style={{ minHeight: 420, cursor: 'crosshair' }}
    />
  );
}
