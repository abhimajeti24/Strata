"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { monolithState } from "@/lib/monolithStore";

/**
 * Procedural modernist house - plinth, floor slab, walls, columns, living
 * volume, roof, cantilevered upper box, service core. Deconstruction runs in
 * reverse construction order: the cantilever and roof lift away first, the
 * foundation sinks last. Each piece animates inside its own window of the
 * global 0..1 progress so the building comes apart piece by piece, not all
 * at once.
 */
type Piece = {
  size: [number, number, number];
  pos: [number, number, number];
  /** offset at full deconstruction */
  lift: [number, number, number];
  rotY: number;
  /** [start, end] slice of the global progress this piece animates in */
  window: [number, number];
  shade: string;
};

const PIECES: Piece[] = [
  // 8 - cantilevered upper box: first to leave (top of the build sequence)
  { size: [1.7, 0.62, 1.05], pos: [-0.5, 1.65, 0.1], lift: [-0.7, 2.0, 0.55], rotY: -0.1, window: [0.05, 0.4], shade: "#232320" },
  // 7 - roof slab
  { size: [3.2, 0.1, 2.05], pos: [0, 1.29, 0], lift: [0.15, 1.7, 0.35], rotY: -0.05, window: [0.18, 0.52], shade: "#1c1c1a" },
  // 6 - service core (rises past the roof)
  { size: [0.5, 1.86, 0.55], pos: [0.75, 1.17, -0.4], lift: [0.35, 1.6, -0.25], rotY: 0.06, window: [0.28, 0.62], shade: "#2a2a27" },
  // 5 - living volume
  { size: [1.5, 1.0, 1.55], pos: [0.55, 0.74, 0.05], lift: [0.55, 1.05, 0.45], rotY: 0.05, window: [0.4, 0.74], shade: "#1c1c1a" },
  // 4 - rear wall
  { size: [2.9, 1.0, 0.08], pos: [0, 0.74, -0.9], lift: [0, 1.1, -0.55], rotY: -0.07, window: [0.48, 0.8], shade: "#232320" },
  // 3 - side wall
  { size: [0.08, 1.0, 1.75], pos: [-1.45, 0.74, 0], lift: [-0.85, 0.95, 0.2], rotY: 0.09, window: [0.54, 0.85], shade: "#232320" },
  // 2 - colonnade
  { size: [0.07, 1.0, 0.07], pos: [-1.05, 0.74, 0.75], lift: [-0.15, 0.85, 0.1], rotY: 0.04, window: [0.58, 0.88], shade: "#1c1c1a" },
  { size: [0.07, 1.0, 0.07], pos: [-0.55, 0.74, 0.75], lift: [0.05, 0.9, 0.18], rotY: -0.04, window: [0.62, 0.9], shade: "#1c1c1a" },
  { size: [0.07, 1.0, 0.07], pos: [-0.05, 0.74, 0.75], lift: [0.18, 0.82, 0.08], rotY: 0.05, window: [0.66, 0.92], shade: "#1c1c1a" },
  // 1 - floor slab
  { size: [3.0, 0.1, 1.9], pos: [0, 0.19, 0], lift: [0, 0.45, 0.25], rotY: 0.03, window: [0.7, 0.96], shade: "#2a2a27" },
  // 0 - plinth: sinks back into the ground, last to go
  { size: [3.4, 0.14, 2.2], pos: [0, 0.07, 0], lift: [0, -0.6, 0], rotY: 0, window: [0.78, 1], shade: "#232320" },
];

/** vertical centering so the composed house pivots around its middle */
const Y_CENTER = -1.0;

const BLUEPRINT = new THREE.Color("#002fa7");

function makeMaterial(shade: string) {
  const mat = new THREE.MeshStandardMaterial({
    color: shade,
    roughness: 0.85,
    metalness: 0.05,
    // opacity is animated every frame (intro fade + manifesto ghosting);
    // flipping `transparent` at runtime would not recompile the shader
    transparent: true,
  });
  // subtle Blueprint fresnel rim - catches light on silhouette edges only
  mat.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <emissivemap_fragment>",
      `#include <emissivemap_fragment>
      float strataFresnel = pow(1.0 - saturate(dot(normalize(vViewPosition), normal)), 3.0);
      totalEmissiveRadiance += vec3(${BLUEPRINT.r.toFixed(4)}, ${BLUEPRINT.g.toFixed(4)}, ${BLUEPRINT.b.toFixed(4)}) * strataFresnel * 0.15;`,
    );
  };
  return mat;
}

const smoothstep = (t: number) => t * t * (3 - 2 * t);

type Props = {
  isMobile: boolean;
  frozen?: boolean;
};

export function House({ isMobile, frozen = false }: Props) {
  const group = useRef<THREE.Group>(null);
  const rig = useRef<THREE.Group>(null);
  const meshes = useRef<Array<THREE.Mesh | null>>([]);
  const shadowMat = useRef<THREE.MeshBasicMaterial>(null);
  const smooth = useRef({ deconstruct: 0, px: 0, py: 0 });

  const materials = useMemo(() => PIECES.map((p) => makeMaterial(p.shade)), []);

  // soft radial contact shadow - grounds the house without real shadow maps
  const shadowTexture = useMemo(() => {
    const size = 256;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(28, 28, 26, 0.4)");
    g.addColorStop(0.55, "rgba(28, 28, 26, 0.12)");
    g.addColorStop(1, "rgba(28, 28, 26, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }, []);

  // hero composition: right of headline on desktop, low center on mobile
  const heroY = isMobile ? -0.85 : -0.38;
  const amplitude = isMobile ? 0.5 : 1;

  useFrame((state) => {
    if (!group.current || !rig.current) return;
    const s = smooth.current;

    // viewport-relative composition so the house sits in the right column
    // at any aspect ratio: centered around 80% of the screen width, never
    // clipped at the edge, scaled with the viewport
    const vw = state.viewport.width;
    const heroX = isMobile ? 0 : Math.min(vw * 0.32, vw / 2 - 1.1);
    const scale = isMobile
      ? Math.min(0.34, vw * 0.115)
      : THREE.MathUtils.clamp(vw * 0.085, 0.36, 0.54);

    if (frozen) {
      group.current.position.set(heroX, heroY, 0);
      group.current.scale.setScalar(scale);
      return;
    }

    // creamy damping - motion stays smooth on fast scroll
    s.deconstruct += (monolithState.deconstruct - s.deconstruct) * 0.08;
    s.px += (monolithState.pointerX - s.px) * 0.06;
    s.py += (monolithState.pointerY - s.py) * 0.06;

    const d = s.deconstruct;
    // travel from hero composition to screen center as deconstruction begins
    const settle = Math.min(d * 2.5, 1);
    group.current.position.x = heroX * (1 - settle);
    group.current.position.y = heroY * (1 - settle);

    // pointer parallax (desktop only) + slow breathing rotation
    const t = state.clock.elapsedTime;
    rig.current.rotation.y = s.px * 0.12 + Math.sin(t * 0.18) * 0.04 + 0.52;
    rig.current.rotation.x = -s.py * 0.06 + 0.12;

    PIECES.forEach((piece, i) => {
      const mesh = meshes.current[i];
      if (!mesh) return;
      const [start, end] = piece.window;
      const local = smoothstep(THREE.MathUtils.clamp((d - start) / (end - start), 0, 1));
      mesh.position.set(
        piece.pos[0] + piece.lift[0] * local * amplitude,
        piece.pos[1] + Y_CENTER + piece.lift[1] * local * amplitude,
        piece.pos[2] + piece.lift[2] * local * amplitude,
      );
      mesh.rotation.y = piece.rotY * local;
    });

    // intro fade-in; the mass ghosts back as it deconstructs so the
    // manifesto text stays the protagonist
    const intro = monolithState.intro;
    const sc = scale * (0.96 + 0.04 * intro);
    group.current.scale.setScalar(sc);
    // fade quickly to ~22% so the manifesto text stays readable, but the
    // exploded structure remains present behind it
    const opacity = intro * THREE.MathUtils.clamp(1 - d * 1.3, 0.22, 1);
    materials.forEach((m) => {
      m.opacity = opacity;
    });
    // shadow lightens as pieces lift away
    if (shadowMat.current) shadowMat.current.opacity = opacity * (1 - d) * 0.9;
  });

  return (
    <group ref={group} position={[1.6, heroY, 0]} scale={0.5}>
      <group ref={rig} rotation={[0.12, 0.52, 0]}>
        <mesh rotation-x={-Math.PI / 2} position={[0, Y_CENTER - 0.02, 0]}>
          <planeGeometry args={[4.6, 3.4]} />
          <meshBasicMaterial ref={shadowMat} map={shadowTexture} transparent depthWrite={false} />
        </mesh>
        {PIECES.map((piece, i) => (
          <mesh
            key={i}
            ref={(el) => {
              meshes.current[i] = el;
            }}
            position={[piece.pos[0], piece.pos[1] + Y_CENTER, piece.pos[2]]}
            material={materials[i]}
          >
            <boxGeometry args={piece.size} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
