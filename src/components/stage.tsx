import { ContactShadows, Grid, Html, Line, OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { buildPlug, type PlugModel, type PlugSpec } from "@/lib/plug-geometry";

export type StageView = "iso" | "face" | "back" | "side" | "top";

type StageProps = {
  spec: PlugSpec;
  view: StageView;
  autoRotate: boolean;
  wire: boolean;
  grid: boolean;
  dims: boolean;
  color: string;
  onInteract: () => void;
  onModel: (model: PlugModel) => void;
  frame: number;
};

const MARK = "#b4332a";

function framePosition(view: StageView, span: number) {
  if (view === "face") return new THREE.Vector3(span * 0.12, span * 1.05, span * 0.42);
  if (view === "back") return new THREE.Vector3(span * 0.02, -span * 1.28, span * 0.04);
  if (view === "side") return new THREE.Vector3(span * 1.25, span * 0.38, span * 0.12);
  return new THREE.Vector3(span * 0.9, span * 0.7, span * 0.92);
}

function Model({
  model,
  spec,
  wire,
  color,
  dims,
}: {
  model: PlugModel;
  spec: PlugSpec;
  wire: boolean;
  color: string;
  dims: boolean;
}) {
  const { size } = model;
  const yTop = size.y;
  const yShell = Math.max(0, yTop - spec.height);
  const pad = Math.max(spec.length, spec.width) * 0.16 + 4;

  return (
    <group>
      <mesh geometry={model.geometry} dispose={null} castShadow>
        <meshPhysicalMaterial
          color={color}
          roughness={0.48}
          metalness={0}
          clearcoat={0.22}
          clearcoatRoughness={0.5}
          wireframe={wire}
          side={THREE.DoubleSide}
        />
      </mesh>
      {dims && !wire ? (
        <group>
          <Dim
            a={[-spec.length / 2, yShell, spec.width / 2 + pad * 0.35]}
            b={[spec.length / 2, yShell, spec.width / 2 + pad * 0.35]}
            label={mm(spec.length)}
            at={[0, yShell + 1.2, spec.width / 2 + pad * 0.35]}
          />
          <Dim
            a={[spec.length / 2 + pad * 0.35, yShell, -spec.width / 2]}
            b={[spec.length / 2 + pad * 0.35, yShell, spec.width / 2]}
            label={mm(spec.width)}
            at={[spec.length / 2 + pad * 0.35, yShell + 1.2, 0]}
          />
          <Dim
            a={[-spec.length / 2 - pad * 0.45, yShell, 0]}
            b={[-spec.length / 2 - pad * 0.45, yTop, 0]}
            label={mm(spec.height)}
            at={[-spec.length / 2 - pad * 0.45, (yShell + yTop) / 2, 0]}
          />
        </group>
      ) : null}
    </group>
  );
}

function Dim({
  a,
  b,
  label,
  at,
}: {
  a: [number, number, number];
  b: [number, number, number];
  label: string;
  at: [number, number, number];
}) {
  return (
    <group>
      <Line points={[a, b]} color={MARK} lineWidth={1} />
      <Html position={at} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <span className="whitespace-nowrap rounded-md bg-sheet px-1.5 py-0.5 font-mono text-xs text-mark">
          {label}
        </span>
      </Html>
    </group>
  );
}

function mm(n: number) {
  const v = Math.round(n * 10) / 10;
  return `${Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1)} мм`;
}

function CameraRig({
  view,
  frame,
  span,
  autoRotate,
  onInteract,
}: {
  view: StageView;
  frame: number;
  span: number;
  autoRotate: boolean;
  onInteract: () => void;
}) {
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const spanRef = useRef(span);
  spanRef.current = span;

  useEffect(() => {
    const c = controls;
    if (!c) return;
    const cam = c.object as THREE.PerspectiveCamera;
    const s = Math.max(spanRef.current, 18);
    if (view === "top") {
      cam.up.set(0, 1, 0);
      cam.position.set(0, s * 4, 0.02);
      cam.fov = 8;
      c.target.set(0, 0, 0);
    } else {
      cam.up.set(0, 1, 0);
      cam.fov = 32;
      cam.position.copy(framePosition(view, s));
      c.target.set(0, Math.min(8, s * 0.14), 0);
    }
    cam.updateProjectionMatrix();
    c.update();
  }, [controls, view, frame]);

  return (
    <OrbitControls
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={10}
      maxDistance={320}
      maxPolarAngle={Math.PI * 0.92}
      autoRotate={autoRotate}
      autoRotateSpeed={0.7}
      onStart={onInteract}
    />
  );
}

export default function Stage({
  spec,
  view,
  autoRotate,
  wire,
  grid,
  dims,
  color,
  frame,
  onInteract,
  onModel,
}: StageProps) {
  const live = useRef<PlugModel | null>(null);
  const [model, setModel] = useState<PlugModel | null>(null);

  useEffect(() => {
    return () => {
      live.current?.geometry.dispose();
      live.current = null;
    };
  }, []);

  useEffect(() => {
    let cancel = false;
    const timer = window.setTimeout(() => {
      void buildPlug(spec)
        .then((next) => {
          if (cancel) {
            next.geometry.dispose();
            return;
          }
          const prev = live.current;
          live.current = next;
          setModel(next);
          onModel(next);
          if (prev) requestAnimationFrame(() => prev.geometry.dispose());
        })
        .catch((err: unknown) => {
          console.error(err);
        });
    }, 60);
    return () => {
      cancel = true;
      window.clearTimeout(timer);
    };
  }, [spec, onModel]);

  const span = Math.max(spec.length, spec.width, spec.height + spec.clipRise, model?.size.y ?? 0);

  return (
    <div className="absolute inset-0 touch-none">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [36, 28, 38], fov: 32, near: 0.1, far: 800 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor("#efece4");
        }}
      >
        <ambientLight intensity={0.72} />
        <hemisphereLight args={["#f6f3ea", "#c9c2b4", 0.45]} />
        <directionalLight position={[28, 48, 22]} intensity={1.45} />
        <directionalLight position={[-22, 16, -18]} intensity={0.35} />
        {model ? <Model model={model} spec={spec} wire={wire} color={color} dims={dims} /> : null}
        {grid ? (
          <Grid
            position={[0, -0.05, 0]}
            args={[10, 10]}
            cellSize={5}
            cellThickness={0.6}
            cellColor="#d9d2c4"
            sectionSize={20}
            sectionThickness={1.15}
            sectionColor="#b7b0a2"
            fadeDistance={170}
            fadeStrength={1.5}
            infiniteGrid
          />
        ) : null}
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.38}
          scale={140}
          blur={2.4}
          far={Math.max(12, spec.clipRise + spec.height)}
          color="#5e584e"
        />
        <CameraRig
          view={view}
          frame={frame}
          span={span}
          autoRotate={autoRotate}
          onInteract={onInteract}
        />
      </Canvas>
      {model ? null : (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-muted">
          Собираем модель…
        </div>
      )}
    </div>
  );
}
