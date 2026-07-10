"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { monolithState } from "@/lib/monolithStore";

type Stratum = {
  size: [number, number, number];
  baseY: number;
  offset: [number, number, number];
  rot: number;
  shade: string;
};

/**
 * Seven stacked volumes — the STRATA mark. Deterministic "scatter" so the
 * deconstructed state is composed, not random per load.
 */
const SPEC: Array<[w: number, h: number, d: number, shade: string]> = [
  [0.8, 0.32, 0.8, "#232320"],
  [0.94, 0.48, 0.94, "#1c1c1a"],
  [0.76, 0.24, 0.76, "#2a2a27"],
  [1.0, 0.6, 1.0, "#1c1c1a"],
  [0.86, 0.3, 0.86, "#232320"],
  [0.96, 0.52, 0.96, "#1c1c1a"],
  [1.0, 0.38, 1.0, "#232320"],
];

// per-volume drift when deconstructed: x/z scatter ±0.4, rotation ±0.08 rad
const DRIFT: Array<[x: number, z: number, r: number]> = [
  [0.32, -0.18, 0.07],
  [-0.26, 0.22, -0.05],
  [0.38, 0.1, 0.08],
  [-0.12, -0.3, -0.03],
  [0.24, 0.34, 0.06],
  [-0.36, -0.14, -0.08],
  [0.1, 0.26, 0.04],
];

const BLUEPRINT = new THREE.Color("#002fa7");

function buildStrata(): Stratum[] {
  const totalH = SPEC.reduce((a, [, h]) => a + h, 0);
  let y = -totalH / 2;
  return SPEC.map(([w, h, d, shade], i) => {
    const baseY = y + h / 2;
    y += h;
    // vertical spread: bottom volumes sink, top volumes lift, ±1.6 overall
    const spread = (i / (SPEC.length - 1) - 0.5) * 3.2;
    return {
      size: [w, h, d],
      baseY,
      offset: [DRIFT[i][0], spread, DRIFT[i][1]],
      rot: DRIFT[i][2],
      shade,
    };
  });
}

function makeMaterial(shade: string) {
  const mat = new THREE.MeshStandardMaterial({
    color: shade,
    roughness: 0.85,
    metalness: 0.05,
  });
  // subtle Blueprint fresnel rim — catches light on silhouette edges only
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

type Props = {
  isMobile: boolean;
  frozen?: boolean;
};

export function Monolith({ isMobile, frozen = false }: Props) {
  const group = useRef<THREE.Group>(null);
  const rig = useRef<THREE.Group>(null);
  const meshes = useRef<Array<THREE.Mesh | null>>([]);
  const smooth = useRef({ deconstruct: 0, px: 0, py: 0 });

  const strata = useMemo(buildStrata, []);
  const materials = useMemo(() => SPEC.map(([, , , shade]) => makeMaterial(shade)), []);

  // hero composition: right of headline on desktop, low center on mobile
  const heroX = isMobile ? 0 : 1.62;
  const heroY = isMobile ? -0.95 : -0.05;
  const scale = isMobile ? 0.48 : 0.78;
  const amplitude = isMobile ? 0.5 : 1;

  useFrame((state) => {
    if (!group.current || !rig.current) return;
    const s = smooth.current;

    if (frozen) {
      group.current.position.set(heroX, heroY, 0);
      return;
    }

    // creamy damping — motion stays smooth on fast scroll
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
    rig.current.rotation.y = s.px * 0.12 + Math.sin(t * 0.18) * 0.05 + 0.35;
    rig.current.rotation.x = -s.py * 0.06 + 0.08;

    strata.forEach((st, i) => {
      const mesh = meshes.current[i];
      if (!mesh) return;
      mesh.position.set(
        st.baseY * 0 + st.offset[0] * d * amplitude,
        st.baseY + st.offset[1] * 0.5 * d * amplitude,
        st.offset[2] * d * amplitude,
      );
      mesh.rotation.y = st.rot * d;
    });

    // intro fade-in; the mass ghosts back as it deconstructs so the
    // manifesto text stays the protagonist (mockup: strata at ~8-15%)
    const intro = monolithState.intro;
    const sc = scale * (0.96 + 0.04 * intro);
    group.current.scale.setScalar(sc);
    const opacity = intro * (1 - d * 0.86);
    materials.forEach((m) => {
      m.opacity = opacity;
      m.transparent = opacity < 1;
    });
  });

  return (
    <group ref={group} position={[heroX, heroY, 0]} scale={scale}>
      <group ref={rig} rotation={[0.08, 0.35, 0]}>
        {strata.map((st, i) => (
          <mesh
            key={i}
            ref={(el) => {
              meshes.current[i] = el;
            }}
            position={[0, st.baseY, 0]}
            material={materials[i]}
          >
            <boxGeometry args={st.size} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
