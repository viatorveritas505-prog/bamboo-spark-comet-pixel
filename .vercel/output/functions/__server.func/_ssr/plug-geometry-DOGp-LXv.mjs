import { g as Vector3, h as BufferGeometry, m as BufferAttribute, p as Box3 } from "../_libs/@react-three/drei+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/plug-geometry-DOGp-LXv.js
/** Shell outline traced from the part photo, normalized to a 1×1 bounding box
* centered on the origin. +X is the long axis (right end of the photo),
* +Y is the photo's upper edge. */
var OUTLINE = [
	[-.4863, .0183],
	[-.4552, .1188],
	[-.4121, .1984],
	[-.356, .2563],
	[-.3023, .3059],
	[-.2618, .3429],
	[-.2258, .3783],
	[-.2003, .405],
	[-.1711, .4273],
	[-.1484, .4463],
	[-.121, .456],
	[-.0909, .4549],
	[-.0606, .4546],
	[-.0354, .4576],
	[-.0114, .4606],
	[.0114, .4648],
	[.0335, .4625],
	[.0582, .459],
	[.0829, .4546],
	[.1106, .4546],
	[.1364, .4542],
	[.1667, .4577],
	[.2082, .475],
	[.2538, .4961],
	[.2993, .5],
	[.3448, .4824],
	[.3892, .4388],
	[.4416, .3903],
	[.4798, .3411],
	[.5, .2689],
	[.4896, .1897],
	[.4641, .1019],
	[.4394, .0113],
	[.423, -.0818],
	[.4188, -.162],
	[.4134, -.2379],
	[.3996, -.2963],
	[.377, -.3552],
	[.3498, -.405],
	[.3165, -.4454],
	[.2807, -.4764],
	[.243, -.4934],
	[.2054, -.5],
	[.1683, -.4994],
	[.135, -.4949],
	[.1011, -.4811],
	[.0743, -.4731],
	[.0456, -.4648],
	[.02, -.4666],
	[-.0059, -.4616],
	[-.0339, -.456],
	[-.0591, -.4494],
	[-.0869, -.4417],
	[-.1145, -.4329],
	[-.1439, -.4232],
	[-.1731, -.4129],
	[-.2129, -.4027],
	[-.2621, -.3912],
	[-.3225, -.3731],
	[-.3787, -.337],
	[-.4339, -.2847],
	[-.4741, -.2189],
	[-.4987, -.1489],
	[-.5, -.0675]
];
var wasmPromise = null;
function wasm() {
	if (!wasmPromise) wasmPromise = import("../_libs/manifold-3d.mjs").then((n) => n.t).then(async (mod) => {
		const api = await mod.default();
		api.setup();
		return api;
	});
	return wasmPromise;
}
function clamp(n, a, b) {
	return Math.min(b, Math.max(a, n));
}
function toMillimetres(length, width) {
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
	return ensureCcw(OUTLINE.map(([x, y]) => [((x - minX) / sx - .5) * length, ((y - minY) / sy - .5) * width]));
}
function edgeY(pts, x, side) {
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
		if (t < -.05 || t > 1.05) continue;
		const y = a[1] + (b[1] - a[1]) * clamp(t, 0, 1);
		hit = true;
		best = side > 0 ? Math.max(best, y) : Math.min(best, y);
	}
	return hit ? best : side;
}
function ensureCcw(pts) {
	let a = 0;
	for (let i = 0; i < pts.length; i++) {
		const p = pts[i];
		const q = pts[(i + 1) % pts.length];
		a += p[0] * q[1] - q[0] * p[1];
	}
	return a < 0 ? pts.slice().reverse() : pts;
}
function meshToGeometry(mesh) {
	const { numProp, vertProperties, triVerts } = mesh;
	const pos = new Float32Array(triVerts.length * 3);
	for (let i = 0; i < triVerts.length; i++) {
		const v = triVerts[i] * numProp;
		pos[i * 3] = vertProperties[v];
		pos[i * 3 + 1] = vertProperties[v + 1];
		pos[i * 3 + 2] = vertProperties[v + 2];
	}
	const geo = new BufferGeometry();
	geo.setAttribute("position", new BufferAttribute(pos, 3));
	return geo;
}
function applyDome(geo, amount, hx, hy) {
	if (amount < .04) return;
	const attr = geo.getAttribute("position");
	let maxZ = -Infinity;
	for (let i = 0; i < attr.count; i++) maxZ = Math.max(maxZ, attr.getZ(i));
	const band = Math.max(.7, amount * 2.4);
	for (let i = 0; i < attr.count; i++) {
		const z = attr.getZ(i);
		const t = (z - (maxZ - band)) / band;
		if (t <= 0) continue;
		const r = Math.min(1, Math.hypot(attr.getX(i) / hx, attr.getY(i) / hy));
		const fall = Math.cos(r * Math.PI * .5);
		attr.setZ(i, z + amount * fall * t * t);
	}
	attr.needsUpdate = true;
}
function seat(geo) {
	geo.rotateX(-Math.PI / 2);
	geo.computeBoundingBox();
	const box3 = geo.boundingBox;
	if (!box3) return;
	geo.translate(-(box3.min.x + box3.max.x) / 2, -box3.min.y, -(box3.min.z + box3.max.z) / 2);
	geo.computeVertexNormals();
	geo.computeBoundingBox();
}
function measure(geo) {
	geo.computeBoundingBox();
	const s = (geo.boundingBox ?? new Box3()).getSize(new Vector3());
	return {
		x: s.x,
		y: s.y,
		z: s.z
	};
}
function finish(geo, dome, length, width) {
	applyDome(geo, dome, length / 2, width / 2);
	seat(geo);
	const pos = geo.getAttribute("position");
	return {
		geometry: geo,
		size: measure(geo),
		triangles: pos ? pos.count / 3 : 0
	};
}
async function buildPlug(input) {
	const api = await wasm();
	const length = clamp(input.length, 16, 90);
	const width = clamp(input.width, 8, 60);
	const height = clamp(input.height, 2, 20);
	const clipRise = input.clips ? clamp(input.clipRise, 0, 12) : 0;
	const { Manifold } = api;
	const trash = [];
	const keep = (m) => {
		trash.push(m);
		return m;
	};
	try {
		const dome = Math.min(.4, height * .09);
		const bodyDepth = Math.max(1.4, height - dome);
		const pts = toMillimetres(length, width);
		const outer = keep(new api.CrossSection([pts]));
		let solid = keep(Manifold.extrude(outer, bodyDepth));
		const skin = clamp(Math.min(1.7, height * .34), 1.4, 2);
		const ribH = Math.max(.6, bodyDepth - skin);
		if (input.ribs && bodyDepth > 1.8) {
			const rim = clamp(Math.min(length, width) * .09, 1.4, 2.2);
			const inner = keep(outer.offset(-rim, "Miter", 2));
			if (!inner.isEmpty()) {
				const pocket = keep(Manifold.extrude(inner, ribH + .25).translate(0, 0, -.15));
				solid = keep(solid.subtract(pocket));
			}
			const rib = clamp(Math.min(length * .026, skin * .55), .55, 1);
			const fx = length * .2;
			const fy = width * .24;
			const zSpan = ribH + .06;
			const zMid = zSpan / 2 - .03;
			const reach = Math.min(width, length) * .18;
			const bars = [
				bar(Manifold, fx * 2 + rib, rib, zSpan, 0, fy, zMid),
				bar(Manifold, fx * 2 + rib, rib, zSpan, 0, -fy, zMid),
				bar(Manifold, rib, fy * 2 + rib, zSpan, -fx, 0, zMid),
				bar(Manifold, rib, fy * 2 + rib, zSpan, fx, 0, zMid),
				bar(Manifold, rib, reach, zSpan, 0, fy + reach / 2, zMid),
				bar(Manifold, rib, reach, zSpan, 0, -(fy + reach / 2), zMid),
				bar(Manifold, reach, rib, zSpan, fx + reach / 2, 0, zMid),
				bar(Manifold, reach, rib, zSpan, -(fx + reach / 2), 0, zMid),
				angled(Manifold, -fx, fy, -fx - reach * .85, fy + reach * .7, rib, zSpan, zMid),
				angled(Manifold, fx, fy, fx + reach * .8, fy + reach * .72, rib, zSpan, zMid),
				angled(Manifold, -fx, -fy, -fx - reach * .8, -fy - reach * .62, rib, zSpan, zMid),
				angled(Manifold, fx, -fy, fx + reach * .72, -fy - reach * .62, rib, zSpan, zMid)
			];
			let ribs = null;
			for (const piece of bars) {
				keep(piece);
				ribs = ribs ? keep(ribs.add(piece)) : piece;
			}
			if (ribs) solid = keep(solid.add(ribs));
			for (const [nx, ny, scale] of [
				[
					-.16,
					.2,
					.9
				],
				[
					-.1,
					-.22,
					1.05
				],
				[
					.22,
					.18,
					.85
				],
				[
					.16,
					-.2,
					.95
				]
			]) {
				const r = clamp(length * .028 * scale, .7, 1.5);
				const hole = keep(Manifold.cylinder(.45, r, r * .72, 20, true).translate(nx * length, ny * width, ribH + .05));
				solid = keep(solid.subtract(hole));
			}
			for (const nx of [-.12, .16]) for (const side of [1, -1]) {
				const x = nx * length;
				const y = edgeY(pts, x, side) - side * .45;
				solid = keep(solid.add(keep(bar(Manifold, 2.1, .9, .5, x, y, .02))));
			}
		}
		if (clipRise >= .35) {
			const along = clamp(length * .14, 4.4, 7.2);
			const thick = clamp(width * .18, 2.6, 4.4);
			const mounts = [{
				x: -.34 * length,
				side: -1
			}, {
				x: .32 * length,
				side: 1
			}];
			for (const mount of mounts) {
				const y = edgeY(pts, mount.x, mount.side) - mount.side * thick * .48;
				const stemH = clipRise * .72 + .35;
				solid = keep(solid.add(keep(bar(Manifold, along * .72, thick * .62, stemH, mount.x, y, .15 - stemH / 2))));
				const headH = Math.max(.8, clipRise * .42);
				solid = keep(solid.add(keep(bar(Manifold, along, thick * .92, headH, mount.x, y, -clipRise + headH * .55))));
				solid = keep(solid.subtract(keep(bar(Manifold, along * .42, thick * 1.4, headH * .55, mount.x, y + mount.side * thick * .08, -clipRise + headH * .5))));
			}
		}
		if (solid.isEmpty()) throw new Error("empty solid");
		return finish(meshToGeometry(solid.getMesh()), dome, length, width);
	} finally {
		for (const item of trash) try {
			item.delete();
		} catch {}
	}
}
function bar(Manifold, sx, sy, sz, x, y, z) {
	return Manifold.cube([
		Math.max(sx, .2),
		Math.max(sy, .2),
		Math.max(sz, .2)
	], true).translate(x, y, z);
}
function angled(Manifold, x0, y0, x1, y1, width, depth, z) {
	const dx = x1 - x0;
	const dy = y1 - y0;
	const len = Math.max(Math.hypot(dx, dy), .2);
	const deg = Math.atan2(dy, dx) * 180 / Math.PI;
	return Manifold.cube([
		len,
		width,
		depth
	], true).rotate(0, 0, deg).translate((x0 + x1) / 2, (y0 + y1) / 2, z);
}
/** Printer frame: Z up, centred on XY, sitting on Z = 0. */
function geometryForPrint(viewGeometry, faceOnBed) {
	const geo = viewGeometry.clone();
	geo.rotateX(faceOnBed ? -Math.PI / 2 : Math.PI / 2);
	geo.computeBoundingBox();
	const box3 = geo.boundingBox;
	if (box3) geo.translate(-(box3.min.x + box3.max.x) / 2, -(box3.min.y + box3.max.y) / 2, -box3.min.z);
	geo.computeVertexNormals();
	return geo;
}
//#endregion
export { buildPlug, geometryForPrint };
