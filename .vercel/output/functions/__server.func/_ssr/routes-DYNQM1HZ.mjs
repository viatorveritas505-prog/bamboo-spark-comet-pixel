import { i as __toESM } from "../_runtime.mjs";
import { d as require_react, u as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { n as RotateCcw, r as Download } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DYNQM1HZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Stage = (0, import_react.lazy)(() => import("./stage-mzndd0-X.mjs"));
var MEASURE = {
	length: 40,
	width: 20,
	height: 5,
	clipRise: 2.4,
	ribs: true,
	clips: true
};
var CATALOG = {
	length: 51,
	width: 28,
	height: 6.4,
	clipRise: 3.1,
	ribs: true,
	clips: true
};
var PLASTICS = [
	{
		id: "oem",
		label: "Серый",
		color: "#c5c7c2"
	},
	{
		id: "graphite",
		label: "Графит",
		color: "#5c615c"
	},
	{
		id: "black",
		label: "Чёрный",
		color: "#232523"
	},
	{
		id: "white",
		label: "Белый",
		color: "#f3f3f0"
	}
];
var VIEWS = [
	{
		id: "iso",
		label: "Изометрия"
	},
	{
		id: "face",
		label: "Лицо"
	},
	{
		id: "back",
		label: "Спинка"
	},
	{
		id: "side",
		label: "Сбоку"
	}
];
function Home() {
	const [spec, setSpec] = (0, import_react.useState)(MEASURE);
	const [view, setView] = (0, import_react.useState)("iso");
	const [viewTick, setViewTick] = (0, import_react.useState)(0);
	const [autoRotate, setAutoRotate] = (0, import_react.useState)(true);
	const [wire, setWire] = (0, import_react.useState)(false);
	const [grid, setGrid] = (0, import_react.useState)(true);
	const [dims, setDims] = (0, import_react.useState)(true);
	const [plastic, setPlastic] = (0, import_react.useState)("oem");
	const [faceOnBed, setFaceOnBed] = (0, import_react.useState)(true);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [mounted, setMounted] = (0, import_react.useState)(false);
	const [model, setModel] = (0, import_react.useState)(null);
	const [reduced, setReduced] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setMounted(true);
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		setReduced(mq.matches);
		if (mq.matches) setAutoRotate(false);
	}, []);
	const onModel = (0, import_react.useCallback)((next) => {
		setModel(next);
	}, []);
	const color = PLASTICS.find((p) => p.id === plastic)?.color ?? PLASTICS[0].color;
	const deferred = (0, import_react.useMemo)(() => spec, [spec]);
	function patch(partial) {
		setSpec((prev) => ({
			...prev,
			...partial
		}));
	}
	function chooseView(next) {
		setView(next);
		setViewTick((n) => n + 1);
		setAutoRotate(false);
	}
	async function download() {
		setBusy(true);
		try {
			const THREE = await import("../_libs/@react-three/drei+[...].mjs").then((n) => n.f);
			const { buildPlug, geometryForPrint } = await import("./plug-geometry-DOGp-LXv.mjs");
			const { STLExporter } = await import("../_libs/three.mjs").then((n) => n.t);
			const built = await buildPlug(spec);
			const printGeo = geometryForPrint(built.geometry, faceOnBed);
			const data = new STLExporter().parse(new THREE.Mesh(printGeo), { binary: true });
			built.geometry.dispose();
			printGeo.dispose();
			const bytes = new Uint8Array(data.byteLength);
			bytes.set(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
			const blob = new Blob([bytes.buffer], { type: "model/stl" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `zaglushka-316300-5402154-${fileNum(spec.length)}x${fileNum(spec.width)}x${fileNum(spec.height)}.stl`;
			a.click();
			URL.revokeObjectURL(url);
		} finally {
			setBusy(false);
		}
	}
	const sizeLine = model ? `Корпус ${fmt(spec.length)} × ${fmt(spec.width)} × ${fmt(spec.height)} мм · с защёлками ${fmt(model.size.y)} мм` : "Считаем габарит…";
	if (!mounted) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh flex-col bg-paper text-ink md:flex-row",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "relative order-1 grid min-h-[56dvh] flex-1 place-items-center bg-paper text-sm text-muted md:order-2 md:min-h-0",
			children: "Собираем модель…"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "order-2 w-full shrink-0 border-t border-line bg-sheet px-5 py-5 md:order-1 md:h-dvh md:w-96 md:border-t-0 md:border-r",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-wide text-olive",
					children: "316300-5402154-00"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 text-2xl font-semibold tracking-tight",
					children: "Заглушка поручня"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm leading-relaxed text-muted",
					children: "УАЗ Патриот, верхняя на передний поручень у лобового стекла, с 2018 года."
				})
			]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh flex-col bg-paper text-ink md:flex-row",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "relative order-1 min-h-[56dvh] flex-1 md:order-2 md:min-h-0",
			children: [
				mounted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
					fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StageFallback, {}),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stage, {
						spec: deferred,
						view,
						frame: viewTick,
						autoRotate: autoRotate && !reduced,
						wire,
						grid,
						dims,
						color,
						onInteract: () => setAutoRotate(false),
						onModel
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StageFallback, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pointer-events-auto flex flex-wrap gap-1.5",
						children: VIEWS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => chooseView(item.id),
							className: `h-11 rounded-full px-3 text-sm ${view === item.id ? "bg-ink text-sheet" : "bg-sheet text-ink ring-1 ring-line"}`,
							children: item.label
						}, item.id))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => chooseView("iso"),
						className: "pointer-events-auto grid h-11 w-11 place-items-center rounded-full bg-sheet text-ink ring-1 ring-line",
						"aria-label": "Сбросить вид",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-4 w-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-muted",
					children: "Тяните, чтобы повернуть · двумя пальцами — масштаб"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "order-2 flex max-h-[44dvh] w-full shrink-0 flex-col border-t border-line bg-sheet md:order-1 md:h-dvh md:max-h-none md:w-96 md:border-t-0 md:border-r",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "px-5 pt-5 pb-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs tracking-wide text-olive",
							children: "316300-5402154-00"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-1 text-2xl font-semibold tracking-tight",
							children: "Заглушка поручня"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm leading-relaxed text-muted",
							children: "УАЗ Патриот, верхняя на передний поручень у лобового стекла, с 2018 года."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									setSpec(MEASURE);
									chooseView("iso");
								},
								className: "h-11 flex-1 rounded-xl bg-olive px-3 text-sm font-semibold text-sheet",
								children: "40 × 20 × 5"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									setSpec(CATALOG);
									chooseView("iso");
								},
								className: "h-11 flex-1 rounded-xl bg-paper px-3 text-sm font-medium text-ink ring-1 ring-line",
								children: "Каталог ≈51 × 28"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Длина",
							unit: "мм",
							min: 24,
							max: 70,
							step: .5,
							value: spec.length,
							onChange: (length) => patch({ length })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Ширина",
							unit: "мм",
							min: 12,
							max: 40,
							step: .5,
							value: spec.width,
							onChange: (width) => patch({ width })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Высота корпуса",
							unit: "мм",
							min: 2.5,
							max: 12,
							step: .1,
							value: spec.height,
							onChange: (height) => patch({ height })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Вылет защёлок",
							unit: "мм",
							min: 0,
							max: 8,
							step: .1,
							value: spec.clipRise,
							onChange: (clipRise) => patch({
								clipRise,
								clips: clipRise > 0
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
									on: spec.ribs,
									label: "Рёбра",
									onClick: () => patch({ ribs: !spec.ribs })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
									on: spec.clips && spec.clipRise > 0,
									label: "Защёлки",
									onClick: () => patch({ clips: !(spec.clips && spec.clipRise > 0) })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
									on: dims,
									label: "Размеры",
									onClick: () => setDims((v) => !v)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
									on: grid,
									label: "Сетка 5 мм",
									onClick: () => setGrid((v) => !v)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
									on: wire,
									label: "Каркас",
									onClick: () => setWire((v) => !v)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
									on: autoRotate && !reduced,
									label: "Вращение",
									onClick: () => setAutoRotate((v) => !v)
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-2 text-sm text-muted",
							children: "Пластик"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-2",
							children: PLASTICS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": item.label,
								onClick: () => setPlastic(item.id),
								className: `grid h-11 w-11 place-items-center rounded-full ring-2 ${plastic === item.id ? "ring-olive" : "ring-line"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "h-7 w-7 rounded-full ring-1 ring-line",
									style: { background: item.color }
								})
							}, item.id))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-start gap-3 text-sm leading-snug",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								className: "mt-0.5 h-5 w-5 accent-olive",
								checked: faceOnBed,
								onChange: (e) => setFaceOnBed(e.target.checked)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["В STL лицом на стол", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 block text-muted",
								children: "Так наружная поверхность ложится на стол принтера. Защёлкам могут понадобиться поддержки."
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
							className: "rounded-xl bg-paper ring-1 ring-line",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
								className: "px-3 py-3 text-sm font-medium",
								children: "Фото детали и оговорки"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "px-3 pb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: "/ref/back.jpg",
									alt: "Спинка заглушки 316300-5402154-00",
									className: "mb-3 w-full rounded-lg"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm leading-relaxed text-muted",
									children: "Контур с фото: узкий торец слева, широкий справа. На спинке рамка рёбер без перемычек через маркировку, спицы к краю, круглые отпечатки толкателей и две защёлки по диагонали. Стенка около 1,7 мм. Габарит 40×20×5 мм — ваш размер, на каталожном снимке примерно 51×28. Номер пресс-формы не гравируется."
								})]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
					className: "border-t border-line p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => void download(),
						disabled: busy,
						className: "flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-olive text-sm font-semibold text-sheet disabled:opacity-60",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" }), busy ? "Готовим STL…" : "Скачать STL"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-center font-mono text-xs text-muted",
						children: [sizeLine, model ? ` · ${Math.round(model.triangles)} тр.` : ""]
					})]
				})
			]
		})]
	});
}
function StageFallback() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 grid place-items-center bg-paper text-sm text-muted",
		children: "Собираем модель…"
	});
}
function Field({ label, unit, min, max, step, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "mb-1 flex items-baseline justify-between gap-3 text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "font-mono text-ink",
				children: [
					fmt(value),
					" ",
					unit
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "range",
				min,
				max,
				step,
				value,
				"aria-label": label,
				onChange: (e) => onChange(Number(e.target.value)),
				className: "h-11 min-w-0 flex-1"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "number",
				inputMode: "decimal",
				min,
				max,
				step,
				value: roundStep(value, step),
				"aria-label": `${label}, число`,
				onChange: (e) => {
					const n = Number(e.target.value);
					if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, n)));
				},
				className: "h-11 w-16 rounded-lg border border-line bg-paper px-2 text-right font-mono text-sm text-ink"
			})]
		})]
	});
}
function Toggle({ on, label, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		"aria-pressed": on,
		className: `h-11 rounded-xl px-3 text-sm ${on ? "bg-ink text-sheet" : "bg-paper text-ink ring-1 ring-line"}`,
		children: label
	});
}
function fmt(n) {
	const v = Math.round(n * 10) / 10;
	return Number.isInteger(v) ? String(v) : v.toFixed(1);
}
function roundStep(n, step) {
	const d = step < .1 ? 100 : 10;
	return Math.round(n * d) / d;
}
function fileNum(n) {
	return fmt(n).replace(".", "p");
}
//#endregion
export { Home as component };
