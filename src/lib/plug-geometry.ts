import type { ManifoldToplevel } from "manifold-3d";
import * as THREE from "three";
import { OUTLINE } from "./outline.ts";

export type PlugSpec = {
  length: number;
  width: number;
  height: number;
  clipRise: number;
  ribs: boolean;
  clips: boolean;
};

export type PlugModel = {
  geometry: THREE.BufferGeometry;
  size: { x: number; y: number; z: number };
  triangles: number;
};

type Pt = [number, number];
type Solid = InstanceType<ManifoldToplevel["Manifold"]>;
type Disposable = { delete: () => void };

let wasmPromise: Promise<ManifoldToplevel> | null = null;

function wasm() {
  if (!wasmPromise) {
    wasmPromise = import("manifold-3d").then(async (mod) => {
      const api = await mod.default();
      api.setup();
      return api;
    });
  }
  return wasmPromise;
}

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}

function toMillimetres(length: number, width: number): Pt[] {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [x, y] of OUTLINE) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  const sx = maxX - minX || 1;
  const sy = maxY - minY || 1;
  return ensureCcw(
    OUTLINE.map(([x, y]) => [((x - minX) / sx - 0.5) * length, ((y - minY) / sy - 0.5) * width]),
  );
}

function edgeY(pts: Pt[], x: number, side: 1 | -1) {
  let best = side > 0 ? -1e9 : 1e9;
  let hit = false;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const lo = Math.min(a[0], b[0]);
    const hi = Math.max(a[0], b[0]);
    if (x < lo - 1e-4 || x > hi + 1e-4) continue;
    const denom = b[0] - a[0];
    const t = Math.abs(denom) < 1e-8 ? 0 : (x - a[0]) / denom;
    if (t < -0.05 || t > 1.05) continue;
    const y = a[1] + (b[1] - a[1]) * clamp(t, 0, 1);
    hit = true;
    best = side > 0 ? Math.max(best, y) : Math.min(best, y);
  }
  return hit ? best : side;
}

function ensureCcw(pts: Pt[]): Pt[] {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % pts.length];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return a < 0 ? pts.slice().reverse() : pts;
}

function meshToGeometry(mesh: {
  numProp: number;
  vertProperties: Float32Array;
  triVerts: Uint32Array;
}) {
  const { numProp, vertProperties, triVerts } = mesh;
  const pos = new Float32Array(triVerts.length * 3);
  for (let i = 0; i < triVerts.length; i++) {
    const v = triVerts[i] * numProp;
    pos[i * 3] = vertProperties[v];
    pos[i * 3 + 1] = vertProperties[v + 1];
    pos[i * 3 + 2] = vertProperties[v + 2];
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  return geo;
}

function smoothCrown(geo: THREE.BufferGeometry, minZ: number, radius: number, iterations: number) {
  const attr = geo.getAttribute("position");
  const n = attr.count;
  const cell = radius;
  const r2 = radius * radius;
  for (let iter = 0; iter < iterations; iter++) {
    const buckets = new Map<string, number[]>();
    for (let i = 0; i < n; i++) {
      if (attr.getZ(i) < minZ) continue;
      const k = `${Math.floor(attr.getX(i) / cell)},${Math.floor(attr.getY(i) / cell)}`;
      const list = buckets.get(k);
      if (list) list.push(i);
      else buckets.set(k, [i]);
    }
    const nz = new Float32Array(n);
    for (let i = 0; i < n; i++) nz[i] = attr.getZ(i);
    for (let i = 0; i < n; i++) {
      if (attr.getZ(i) < minZ) continue;
      const x = attr.getX(i);
      const y = attr.getY(i);
      const cx = Math.floor(x / cell);
      const cy = Math.floor(y / cell);
      let sum = attr.getZ(i);
      let w = 1;
      for (let ox = -1; ox <= 1; ox++) {
        for (let oy = -1; oy <= 1; oy++) {
          const list = buckets.get(`${cx + ox},${cy + oy}`);
          if (!list) continue;
          for (const j of list) {
            const dx = attr.getX(j) - x;
            const dy = attr.getY(j) - y;
            const d2 = dx * dx + dy * dy;
            if (d2 > r2 || d2 === 0) continue;
            const wt = 1 - Math.sqrt(d2) / radius;
            sum += attr.getZ(j) * wt;
            w += wt;
          }
        }
      }
      nz[i] = attr.getZ(i) * 0.62 + (sum / w) * 0.38;
    }
    for (let i = 0; i < n; i++) attr.setZ(i, nz[i]);
  }
  attr.needsUpdate = true;
}

function seat(geo: THREE.BufferGeometry) {
  geo.rotateX(-Math.PI / 2);
  geo.computeBoundingBox();
  const box3 = geo.boundingBox;
  if (!box3) return;
  geo.translate(-(box3.min.x + box3.max.x) / 2, -box3.min.y, -(box3.min.z + box3.max.z) / 2);
  geo.computeVertexNormals();
  geo.computeBoundingBox();
}

function measure(geo: THREE.BufferGeometry): PlugModel["size"] {
  geo.computeBoundingBox();
  const box3 = geo.boundingBox ?? new THREE.Box3();
  const s = box3.getSize(new THREE.Vector3());
  return { x: s.x, y: s.y, z: s.z };
}

function finish(geo: THREE.BufferGeometry): PlugModel {
  seat(geo);
  const pos = geo.getAttribute("position");
  return {
    geometry: geo,
    size: measure(geo),
    triangles: pos ? pos.count / 3 : 0,
  };
}

export async function buildPlug(input: PlugSpec): Promise<PlugModel> {
  const api = await wasm();
  const length = clamp(input.length, 16, 90);
  const width = clamp(input.width, 8, 60);
  const height = clamp(input.height, 2, 20);
  const clipRise = input.clips ? clamp(input.clipRise, 0, 12) : 0;
  const { Manifold } = api;
  const trash: Disposable[] = [];
  const keep = <T extends Disposable>(m: T) => {
    trash.push(m);
    return m;
  };

  try {
    const pts = toMillimetres(length, width);
    const crown = clamp(Math.min(0.95, height * 0.38), 0.7, 1.1);
    const foot = 0.42;
    const outer = keep(new api.CrossSection([pts]));
    const wallTop = Math.max(foot + 0.35, height - crown);
    let solid = keep(Manifold.extrude(outer, Math.max(0.3, wallTop - foot)).translate(0, 0, foot));
    const addRoll = (radius: number, steps: number) => {
      const sliceH = radius / steps;
      for (let i = 0; i < steps; i++) {
        const t = (i + 1) / steps;
        const inset = radius * (1 - Math.sqrt(Math.max(0, 1 - t * t)));
        const ring = keep(outer.offset(-Math.max(inset, 0.02), "Round", 2, 16));
        if (ring.isEmpty()) continue;
        solid = keep(
          solid.add(keep(Manifold.extrude(ring, sliceH + 0.02).translate(0, 0, foot - (i + 1) * sliceH))),
        );
      }
    };
    addRoll(foot, 3);
    const insetMax = Math.min(length, width) * 0.47;
    const steps = 28;
    const ease = (u: number) => {
      const s = u * u * (3 - 2 * u);
      return 0.4 * u + 0.6 * s;
    };
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const prev = (i - 1) / steps;
      const inset = Math.max(0.04, insetMax * ease(t));
      const z = wallTop + crown * ease(t);
      const zPrev = wallTop + crown * ease(prev);
      const ring = keep(outer.offset(-inset, "Round", 2, 16));
      if (ring.isEmpty()) continue;
      solid = keep(
        solid.add(keep(Manifold.extrude(ring, z - zPrev + 0.04).translate(0, 0, zPrev - 0.02))),
      );
    }

    const ribH = clamp(height - crown * 0.55, 0.45, 1.2);
    if (input.ribs && ribH > 0.35) {
      const rim = clamp(Math.min(length, width) * 0.09, 1.4, 2.2);
      const inner = keep(outer.offset(-rim, "Miter", 2));
      if (!inner.isEmpty()) {
        const pocket = keep(Manifold.extrude(inner, ribH + 0.25).translate(0, 0, -0.15));
        solid = keep(solid.subtract(pocket));
      }

      const rib = clamp(Math.min(length * 0.026, 0.7), 0.45, 0.9);
      const fx = length * 0.2;
      const fy = width * 0.24;
      const zSpan = ribH + 0.06;
      const zMid = zSpan / 2 - 0.03;
      const reach = Math.min(width, length) * 0.18;
      const bars: Solid[] = [
        bar(Manifold, fx * 2 + rib, rib, zSpan, 0, fy, zMid),
        bar(Manifold, fx * 2 + rib, rib, zSpan, 0, -fy, zMid),
        bar(Manifold, rib, fy * 2 + rib, zSpan, -fx, 0, zMid),
        bar(Manifold, rib, fy * 2 + rib, zSpan, fx, 0, zMid),
        bar(Manifold, rib, reach, zSpan, 0, fy + reach / 2, zMid),
        bar(Manifold, rib, reach, zSpan, 0, -(fy + reach / 2), zMid),
        bar(Manifold, reach, rib, zSpan, fx + reach / 2, 0, zMid),
        bar(Manifold, reach, rib, zSpan, -(fx + reach / 2), 0, zMid),
        angled(Manifold, -fx, fy, -fx - reach * 0.85, fy + reach * 0.7, rib, zSpan, zMid),
        angled(Manifold, fx, fy, fx + reach * 0.8, fy + reach * 0.72, rib, zSpan, zMid),
        angled(Manifold, -fx, -fy, -fx - reach * 0.8, -fy - reach * 0.62, rib, zSpan, zMid),
        angled(Manifold, fx, -fy, fx + reach * 0.72, -fy - reach * 0.62, rib, zSpan, zMid),
      ];
      let ribs: Solid | null = null;
      for (const piece of bars) {
        keep(piece);
        ribs = ribs ? keep(ribs.add(piece)) : piece;
      }
      if (ribs) solid = keep(solid.add(ribs));

      const marks: Array<[number, number, number]> = [
        [-0.16, 0.2, 0.9],
        [-0.1, -0.22, 1.05],
        [0.22, 0.18, 0.85],
        [0.16, -0.2, 0.95],
      ];
      for (const [nx, ny, scale] of marks) {
        const r = clamp(length * 0.028 * scale, 0.7, 1.5);
        const hole = keep(
          Manifold.cylinder(0.45, r, r * 0.72, 20, true).translate(nx * length, ny * width, ribH + 0.05),
        );
        solid = keep(solid.subtract(hole));
      }

      for (const nx of [-0.12, 0.16]) {
        for (const side of [1, -1] as const) {
          const x = nx * length;
          const y = edgeY(pts, x, side) - side * 0.45;
          solid = keep(solid.add(keep(bar(Manifold, 2.1, 0.9, 0.5, x, y, 0.02))));
        }
      }
    }

    if (clipRise >= 0.35) {
      const along = clamp(length * 0.12, 4.4, 5.8);
      const beamT = clamp(width * 0.13, 2.2, 2.8);
      const mounts: Array<{ x: number; side: 1 | -1; spin: number }> = [
        { x: -0.3 * length, side: -1, spin: 135 },
        { x: 0.34 * length, side: 1, spin: -45 },
      ];
      for (const mount of mounts) {
        const yEdge = edgeY(pts, mount.x, mount.side);
        const y = yEdge - mount.side * beamT * 0.12;
        const stemH = clipRise + 0.45;
        let clip = keep(bar(Manifold, along, beamT * 0.7, stemH, 0, 0, 0.18 - clipRise / 2));
        const headH = Math.max(0.85, clipRise * 0.4);
        clip = keep(
          clip.add(keep(bar(Manifold, along * 0.95, beamT * 0.42, headH, 0, beamT * 0.38, -clipRise + headH / 2))),
        );
        clip = keep(
          clip.subtract(
            keep(
              bar(
                Manifold,
                along * 0.5,
                beamT * 1.8,
                Math.max(0.8, clipRise * 0.42),
                0,
                beamT * 0.08,
                -clipRise * 0.46,
              ),
            ),
          ),
        );
        clip = keep(clip.rotate(0, 0, mount.spin).translate(mount.x, y, 0));
        solid = keep(solid.add(clip));
      }
    }

    if (solid.isEmpty()) throw new Error("empty solid");
    const geo = meshToGeometry(solid.getMesh());
    smoothCrown(geo, wallTop + crown * 0.02, 1.05, 2);
    return finish(geo);
  } finally {
    for (const item of trash) {
      try {
        item.delete();
      } catch {
        /* already freed */
      }
    }
  }
}

function bar(
  Manifold: ManifoldToplevel["Manifold"],
  sx: number,
  sy: number,
  sz: number,
  x: number,
  y: number,
  z: number,
) {
  return Manifold.cube([Math.max(sx, 0.2), Math.max(sy, 0.2), Math.max(sz, 0.2)], true).translate(x, y, z);
}

function roundBar(
  Manifold: ManifoldToplevel["Manifold"],
  sx: number,
  sy: number,
  sz: number,
  x: number,
  y: number,
  z: number,
  radius: number,
) {
  const dx = Math.max(sx, 0.2);
  const dy = Math.max(sy, 0.2);
  const dz = Math.max(sz, 0.2);
  const rr = Math.min(radius, dx * 0.42, dy * 0.42, dz * 0.42);
  if (rr < 0.06) return bar(Manifold, dx, dy, dz, x, y, z);
  const core = Manifold.cube([dx - 2 * rr, dy - 2 * rr, dz - 2 * rr], true);
  const ball = Manifold.sphere(rr, 8);
  const body = core.minkowskiSum(ball).translate(x, y, z);
  core.delete();
  ball.delete();
  return body;
}

function angled(
  Manifold: ManifoldToplevel["Manifold"],
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  width: number,
  depth: number,
  z: number,
) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.max(Math.hypot(dx, dy), 0.2);
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
  return Manifold.cube([len, width, depth], true)
    .rotate(0, 0, deg)
    .translate((x0 + x1) / 2, (y0 + y1) / 2, z);
}

function rampYZ(
  api: ManifoldToplevel,
  Manifold: ManifoldToplevel["Manifold"],
  along: number,
  yInner: number,
  yOuter: number,
  zTip: number,
  zShoulder: number,
) {
  const tri = ensureCcw([
    [-zTip, yOuter],
    [-zShoulder, yOuter],
    [-zTip, yInner],
  ]);
  const section = new api.CrossSection([tri]);
  const solid = Manifold.extrude(section, along, 0, 0, [1, 1], true).rotate(0, 90, 0);
  section.delete();
  return solid;
}

/** Printer frame: Z up, centred on XY, sitting on Z = 0. */
export function geometryForPrint(viewGeometry: THREE.BufferGeometry, faceOnBed: boolean) {
  const geo = viewGeometry.clone();
  geo.rotateX(faceOnBed ? -Math.PI / 2 : Math.PI / 2);
  geo.computeBoundingBox();
  const box3 = geo.boundingBox;
  if (box3) {
    geo.translate(-(box3.min.x + box3.max.x) / 2, -(box3.min.y + box3.max.y) / 2, -box3.min.z);
  }
  geo.computeVertexNormals();
  return geo;
}
