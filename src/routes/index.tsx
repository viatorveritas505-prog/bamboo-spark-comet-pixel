import { createFileRoute } from "@tanstack/react-router";
import { Download, RotateCcw } from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import type { PlugModel, PlugSpec } from "@/lib/plug-geometry";
import type { StageView } from "@/components/stage";

const Stage = lazy(() => import("@/components/stage"));

export const Route = createFileRoute("/")({ component: Home });

const MEASURE: PlugSpec = {
  length: 40,
  width: 20,
  height: 2.5,
  clipRise: 2.4,
  ribs: true,
  clips: true,
};

const CATALOG: PlugSpec = {
  length: 51,
  width: 28,
  height: 2.5,
  clipRise: 3.1,
  ribs: true,
  clips: true,
};

const PLASTICS = [
  { id: "oem", label: "Серый", color: "#c5c7c2" },
  { id: "graphite", label: "Графит", color: "#5c615c" },
  { id: "black", label: "Чёрный", color: "#232523" },
  { id: "white", label: "Белый", color: "#f3f3f0" },
] as const;

const VIEWS: { id: StageView; label: string }[] = [
  { id: "iso", label: "Изометрия" },
  { id: "top", label: "Сверху" },
  { id: "face", label: "Лицо" },
  { id: "back", label: "Спинка" },
  { id: "side", label: "Сбоку" },
];

function Home() {
  const [spec, setSpec] = useState<PlugSpec>(CATALOG);
  const [view, setView] = useState<StageView>("iso");
  const [viewTick, setViewTick] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [wire, setWire] = useState(false);
  const [grid, setGrid] = useState(true);
  const [dims, setDims] = useState(true);
  const [plastic, setPlastic] = useState<(typeof PLASTICS)[number]["id"]>("oem");
  const [faceOnBed, setFaceOnBed] = useState(true);
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [model, setModel] = useState<PlugModel | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    if (mq.matches) setAutoRotate(false);
  }, []);

  const onModel = useCallback((next: PlugModel) => {
    setModel(next);
  }, []);

  const color = PLASTICS.find((p) => p.id === plastic)?.color ?? PLASTICS[0].color;
  const deferred = useMemo(() => spec, [spec]);

  function patch(partial: Partial<PlugSpec>) {
    setSpec((prev) => ({ ...prev, ...partial }));
  }

  function chooseView(next: StageView) {
    setView(next);
    setViewTick((n) => n + 1);
    setAutoRotate(false);
  }

  async function download() {
    setBusy(true);
    try {
      const THREE = await import("three");
      const { buildPlug, geometryForPrint } = await import("@/lib/plug-geometry");
      const { STLExporter } = await import("three/examples/jsm/exporters/STLExporter.js");
      const built = await buildPlug(spec);
      const printGeo = geometryForPrint(built.geometry, faceOnBed);
      const exporter = new STLExporter();
      const data = exporter.parse(new THREE.Mesh(printGeo), { binary: true }) as DataView;
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

  const sizeLine = model
    ? `Корпус ${fmt(spec.length)} × ${fmt(spec.width)} × ${fmt(spec.height)} мм · с защёлками ${fmt(model.size.y)} мм`
    : "Считаем габарит…";

  if (!mounted) {
    return (
      <div className="flex h-dvh flex-col bg-paper text-ink md:flex-row">
        <main className="relative order-1 grid min-h-[56dvh] flex-1 place-items-center bg-paper text-sm text-muted md:order-2 md:min-h-0">
          Собираем модель…
        </main>
        <aside className="order-2 w-full shrink-0 border-t border-line bg-sheet px-5 py-5 md:order-1 md:h-dvh md:w-96 md:border-t-0 md:border-r">
          <p className="font-mono text-xs tracking-wide text-olive">316300-5402154-00</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Заглушка поручня</h1>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            УАЗ Патриот, верхняя на передний поручень у лобового стекла, с 2018 года.
          </p>
        </aside>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-paper text-ink md:flex-row">
      <main className="relative order-1 min-h-[56dvh] flex-1 md:order-2 md:min-h-0">
        {mounted ? (
          <Suspense fallback={<StageFallback />}>
            <Stage
              spec={deferred}
              view={view}
              frame={viewTick}
              autoRotate={autoRotate && !reduced}
              wire={wire}
              grid={grid}
              dims={dims}
              color={color}
              onInteract={() => setAutoRotate(false)}
              onModel={onModel}
            />
          </Suspense>
        ) : (
          <StageFallback />
        )}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <div className="pointer-events-auto flex flex-wrap gap-1.5">
            {VIEWS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => chooseView(item.id)}
                className={`h-11 rounded-full px-3 text-sm ${
                  view === item.id
                    ? "bg-ink text-sheet"
                    : "bg-sheet text-ink ring-1 ring-line"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => chooseView("iso")}
            className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full bg-sheet text-ink ring-1 ring-line"
            aria-label="Сбросить вид"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
        <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-muted">
          Тяните, чтобы повернуть · двумя пальцами — масштаб
        </p>
      </main>

      <aside className="order-2 flex max-h-[44dvh] w-full shrink-0 flex-col border-t border-line bg-sheet md:order-1 md:h-dvh md:max-h-none md:w-96 md:border-t-0 md:border-r">
        <header className="px-5 pt-5 pb-3">
          <p className="font-mono text-xs tracking-wide text-olive">316300-5402154-00</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Заглушка поручня</h1>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            УАЗ Патриот, верхняя на передний поручень у лобового стекла, с 2018 года.
          </p>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setSpec(CATALOG);
                chooseView("iso");
              }}
              className="h-11 flex-1 rounded-xl bg-olive px-3 text-sm font-semibold text-sheet"
            >
              51 × 28 × 2,5
            </button>
            <button
              type="button"
              onClick={() => {
                setSpec(MEASURE);
                chooseView("iso");
              }}
              className="h-11 flex-1 rounded-xl bg-paper px-3 text-sm font-medium text-ink ring-1 ring-line"
            >
              40 × 20 × 2,5
            </button>
          </div>

          <Field
            label="Длина"
            unit="мм"
            min={24}
            max={70}
            step={0.5}
            value={spec.length}
            onChange={(length) => patch({ length })}
          />
          <Field
            label="Ширина"
            unit="мм"
            min={12}
            max={40}
            step={0.5}
            value={spec.width}
            onChange={(width) => patch({ width })}
          />
          <Field
            label="Высота корпуса"
            unit="мм"
            min={2.5}
            max={12}
            step={0.1}
            value={spec.height}
            onChange={(height) => patch({ height })}
          />
          <Field
            label="Вылет защёлок"
            unit="мм"
            min={0}
            max={8}
            step={0.1}
            value={spec.clipRise}
            onChange={(clipRise) => patch({ clipRise, clips: clipRise > 0 })}
          />

          <div className="grid grid-cols-2 gap-2">
            <Toggle on={spec.ribs} label="Рёбра" onClick={() => patch({ ribs: !spec.ribs })} />
            <Toggle
              on={spec.clips && spec.clipRise > 0}
              label="Защёлки"
              onClick={() => patch({ clips: !(spec.clips && spec.clipRise > 0) })}
            />
            <Toggle on={dims} label="Размеры" onClick={() => setDims((v) => !v)} />
            <Toggle on={grid} label="Сетка 5 мм" onClick={() => setGrid((v) => !v)} />
            <Toggle on={wire} label="Каркас" onClick={() => setWire((v) => !v)} />
            <Toggle
              on={autoRotate && !reduced}
              label="Вращение"
              onClick={() => setAutoRotate((v) => !v)}
            />
          </div>

          <div>
            <p className="mb-2 text-sm text-muted">Пластик</p>
            <div className="flex gap-2">
              {PLASTICS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={item.label}
                  onClick={() => setPlastic(item.id)}
                  className={`grid h-11 w-11 place-items-center rounded-full ring-2 ${
                    plastic === item.id ? "ring-olive" : "ring-line"
                  }`}
                >
                  <span className="h-7 w-7 rounded-full ring-1 ring-line" style={{ background: item.color }} />
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-start gap-3 text-sm leading-snug">
            <input
              type="checkbox"
              className="mt-0.5 h-5 w-5 accent-olive"
              checked={faceOnBed}
              onChange={(e) => setFaceOnBed(e.target.checked)}
            />
            <span>
              В STL лицом на стол
              <span className="mt-0.5 block text-muted">
                Так наружная поверхность ложится на стол принтера. Защёлкам могут понадобиться поддержки.
              </span>
            </span>
          </label>

          <details className="rounded-xl bg-paper ring-1 ring-line">
            <summary className="px-3 py-3 text-sm font-medium">Фото детали и оговорки</summary>
            <div className="px-3 pb-3">
              <img
                src="/ref/back.jpg"
                alt="Спинка заглушки 316300-5402154-00"
                className="mb-3 w-full rounded-lg"
              />
              <p className="text-sm leading-relaxed text-muted">
                Контур с фото: узкий торец слева, широкий справа. На спинке рамка рёбер без перемычек через маркировку.
                Две защёлки по диагонали: короткая балка, заходная фаска на конце и упорный зуб наружу.
                Радиус скругления лица больше: кромка закругляется раньше и мягче.
              </p>
            </div>
          </details>
        </div>

        <footer className="border-t border-line p-4">
          <button
            type="button"
            onClick={() => void download()}
            disabled={busy}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-olive text-sm font-semibold text-sheet disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {busy ? "Готовим STL…" : "Скачать STL"}
          </button>
          <p className="mt-2 text-center font-mono text-xs text-muted">
            {sizeLine}
            {model ? ` · ${Math.round(model.triangles)} тр.` : ""}
          </p>
        </footer>
      </aside>
    </div>
  );
}

function StageFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-paper text-sm text-muted">
      Собираем модель…
    </div>
  );
}

function Field({
  label,
  unit,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-baseline justify-between gap-3 text-sm">
        <span>{label}</span>
        <span className="font-mono text-ink">
          {fmt(value)} {unit}
        </span>
      </span>
      <span className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={label}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-11 min-w-0 flex-1"
        />
        <input
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={roundStep(value, step)}
          aria-label={`${label}, число`}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, n)));
          }}
          className="h-11 w-16 rounded-lg border border-line bg-paper px-2 text-right font-mono text-sm text-ink"
        />
      </span>
    </label>
  );
}

function Toggle({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`h-11 rounded-xl px-3 text-sm ${
        on ? "bg-ink text-sheet" : "bg-paper text-ink ring-1 ring-line"
      }`}
    >
      {label}
    </button>
  );
}

function fmt(n: number) {
  const v = Math.round(n * 10) / 10;
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

function roundStep(n: number, step: number) {
  const d = step < 0.1 ? 100 : 10;
  return Math.round(n * d) / d;
}

function fileNum(n: number) {
  return fmt(n).replace(".", "p");
}
