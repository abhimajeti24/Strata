"use client";

import { Canvas } from "@react-three/fiber";
import { House } from "./House";

type Props = {
  isMobile: boolean;
  frozen?: boolean;
};

/**
 * The only WebGL surface on the page. Procedural geometry, no downloaded
 * models, no shadows, no environment maps — one key light, one fill, fog
 * matched to Limewash for atmospheric fade.
 */
export default function MonolithCanvas({ isMobile, frozen = false }: Props) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6.4], fov: 34 }}
      gl={{ antialias: true, alpha: true }}
      frameloop={frozen ? "demand" : "always"}
      aria-hidden="true"
    >
      <fog attach="fog" args={["#eae9e4", 9, 16]} />
      <directionalLight position={[-2.5, 3.5, 4.5]} intensity={3.4} color="#fff3e2" />
      <directionalLight position={[3, -1, 2.5]} intensity={0.5} color="#eae9e4" />
      <ambientLight intensity={0.7} />
      <House isMobile={isMobile} frozen={frozen} />
    </Canvas>
  );
}
