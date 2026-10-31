import { i as __toESM } from "../_runtime.mjs";
import { a as Html, d as require_react, g as Vector3, i as Line, n as Grid, o as Canvas, r as OrbitControls, s as useThree, t as ContactShadows, u as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { buildPlug } from "./plug-geometry-DOGp-LXv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stage-mzndd0-X.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MARK = "#b4332a";
function framePosition(view, span) {
	if (view === "face") return new Vector3(span * .12, span * 1.05, span * .42);
	if (view === "back") return new Vector3(span * .02, -span * 1.28, span * .04);
	if (view === "side") return new Vector3(span * 1.25, span * .38, span * .12);
	return new Vector3(span * .9, span * .7, span * .92);
}
function Model({ model, spec, wire, color, dims }) {
	const { size } = model;
	const yTop = size.y;
	const yShell = Math.max(0, yTop - spec.height);
	const pad = Math.max(spec.length, spec.width) * .16 + 4;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mesh", {
		geometry: model.geometry,
		dispose: null,
		castShadow: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshPhysicalMaterial", {
			color,
			roughness: .48,
			metalness: 0,
			clearcoat: .22,
			clearcoatRoughness: .5,
			wireframe: wire,
			side: 2
		})
	}), dims && !wire ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dim, {
			a: [
				-spec.length / 2,
				yShell,
				spec.width / 2 + pad * .35
			],
			b: [
				spec.length / 2,
				yShell,
				spec.width / 2 + pad * .35
			],
			label: mm(spec.length),
			at: [
				0,
				yShell + 1.2,
				spec.width / 2 + pad * .35
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dim, {
			a: [
				spec.length / 2 + pad * .35,
				yShell,
				-spec.width / 2
			],
			b: [
				spec.length / 2 + pad * .35,
				yShell,
				spec.width / 2
			],
			label: mm(spec.width),
			at: [
				spec.length / 2 + pad * .35,
				yShell + 1.2,
				0
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dim, {
			a: [
				-spec.length / 2 - pad * .45,
				yShell,
				0
			],
			b: [
				-spec.length / 2 - pad * .45,
				yTop,
				0
			],
			label: mm(spec.height),
			at: [
				-spec.length / 2 - pad * .45,
				(yShell + yTop) / 2,
				0
			]
		})
	] }) : null] });
}
function Dim({ a, b, label, at }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
		points: [a, b],
		color: MARK,
		lineWidth: 1
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Html, {
		position: at,
		center: true,
		zIndexRange: [20, 0],
		style: { pointerEvents: "none" },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "whitespace-nowrap rounded-md bg-sheet px-1.5 py-0.5 font-mono text-xs text-mark",
			children: label
		})
	})] });
}
function mm(n) {
	const v = Math.round(n * 10) / 10;
	return `${Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1)} мм`;
}
function CameraRig({ view, frame, span, autoRotate, onInteract }) {
	const controls = useThree((s) => s.controls);
	const spanRef = (0, import_react.useRef)(span);
	spanRef.current = span;
	(0, import_react.useEffect)(() => {
		const c = controls;
		if (!c) return;
		const s = Math.max(spanRef.current, 18);
		c.object.position.copy(framePosition(view, s));
		c.target.set(0, Math.min(8, s * .14), 0);
		c.update();
	}, [
		controls,
		view,
		frame
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrbitControls, {
		makeDefault: true,
		enableDamping: true,
		dampingFactor: .08,
		minDistance: 10,
		maxDistance: 320,
		maxPolarAngle: Math.PI * .92,
		autoRotate,
		autoRotateSpeed: .7,
		onStart: onInteract
	});
}
function Stage({ spec, view, autoRotate, wire, grid, dims, color, frame, onInteract, onModel }) {
	const live = (0, import_react.useRef)(null);
	const [model, setModel] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		return () => {
			live.current?.geometry.dispose();
			live.current = null;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		let cancel = false;
		const timer = window.setTimeout(() => {
			buildPlug(spec).then((next) => {
				if (cancel) {
					next.geometry.dispose();
					return;
				}
				const prev = live.current;
				live.current = next;
				setModel(next);
				onModel(next);
				if (prev) requestAnimationFrame(() => prev.geometry.dispose());
			}).catch((err) => {
				console.error(err);
			});
		}, 60);
		return () => {
			cancel = true;
			window.clearTimeout(timer);
		};
	}, [spec, onModel]);
	const span = Math.max(spec.length, spec.width, spec.height + spec.clipRise, model?.size.y ?? 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 touch-none",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Canvas, {
			shadows: true,
			dpr: [1, 1.75],
			camera: {
				position: [
					36,
					28,
					38
				],
				fov: 32,
				near: .1,
				far: 800
			},
			gl: {
				antialias: true,
				alpha: false,
				powerPreference: "high-performance"
			},
			onCreated: ({ gl }) => {
				gl.setClearColor("#efece4");
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", { intensity: .72 }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hemisphereLight", { args: [
					"#f6f3ea",
					"#c9c2b4",
					.45
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
					position: [
						28,
						48,
						22
					],
					intensity: 1.45
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
					position: [
						-22,
						16,
						-18
					],
					intensity: .35
				}),
				model ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Model, {
					model,
					spec,
					wire,
					color,
					dims
				}) : null,
				grid ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid, {
					position: [
						0,
						-.05,
						0
					],
					args: [10, 10],
					cellSize: 5,
					cellThickness: .6,
					cellColor: "#d9d2c4",
					sectionSize: 20,
					sectionThickness: 1.15,
					sectionColor: "#b7b0a2",
					fadeDistance: 170,
					fadeStrength: 1.5,
					infiniteGrid: true
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContactShadows, {
					position: [
						0,
						0,
						0
					],
					opacity: .38,
					scale: 140,
					blur: 2.4,
					far: Math.max(12, spec.clipRise + spec.height),
					color: "#5e584e"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CameraRig, {
					view,
					frame,
					span,
					autoRotate,
					onInteract
				})
			]
		}), model ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none absolute inset-0 grid place-items-center text-sm text-muted",
			children: "Собираем модель…"
		})]
	});
}
//#endregion
export { Stage as default };
