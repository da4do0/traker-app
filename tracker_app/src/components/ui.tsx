import { useEffect, useRef, useState } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { X } from "lucide-react";

// ---------- formattazione numeri come nel Figma: 1.011 · 68,4
export const fmt = (n: number, d = 0) =>
  new Intl.NumberFormat("it-IT", { useGrouping: "always", minimumFractionDigits: d, maximumFractionDigits: d } as unknown as Intl.NumberFormatOptions).format(n);

export const DAYS = ["DOM", "LUN", "MAR", "MER", "GIO", "VEN", "SAB"];
export const ddmm = (d: Date) => `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;

export function useIsDesktop() {
  const q = "(min-width: 64rem)";
  const [m, setM] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return m;
}

// ---------- dot-matrix (componente DotChar del Figma: griglia 5×7, discendenti su 8ª riga)
const G: Record<string, string> = {
  "0": "01110 10001 10001 10001 10001 10001 01110", "1": "00100 01100 00100 00100 00100 00100 01110",
  "2": "01110 10001 00001 00010 00100 01000 11111", "3": "11111 00010 00100 00010 00001 10001 01110",
  "4": "00010 00110 01010 10010 11111 00010 00010", "5": "11111 10000 11110 00001 00001 10001 01110",
  "6": "00110 01000 10000 11110 10001 10001 01110", "7": "11111 00001 00010 00100 01000 01000 01000",
  "8": "01110 10001 10001 01110 10001 10001 01110", "9": "01110 10001 10001 01111 00001 00010 01100",
  a: "00000 00000 01110 00001 01111 10001 01111", b: "10000 10000 10110 11001 10001 10001 11110",
  c: "00000 00000 01110 10000 10000 10001 01110", d: "00001 00001 01101 10011 10001 10001 01111",
  e: "00000 00000 01110 10001 11111 10000 01110", f: "00110 01001 01000 11100 01000 01000 01000",
  g: "00000 00000 01111 10001 10001 01111 00001 01110", h: "10000 10000 10110 11001 10001 10001 10001",
  i: "00100 00000 01100 00100 00100 00100 01110", j: "00010 00000 00110 00010 00010 10010 01100",
  k: "10000 10000 10010 10100 11000 10100 10010", l: "01100 00100 00100 00100 00100 00100 01110",
  m: "00000 00000 11010 10101 10101 10001 10001", n: "00000 00000 10110 11001 10001 10001 10001",
  o: "00000 00000 01110 10001 10001 10001 01110", p: "00000 00000 11110 10001 10001 11110 10000 10000",
  q: "00000 00000 01111 10001 10001 01111 00001 00001", r: "00000 00000 10110 11001 10000 10000 10000",
  s: "00000 00000 01110 10000 01110 00001 11110", t: "01000 01000 11100 01000 01000 01001 00110",
  u: "00000 00000 10001 10001 10001 10011 01101", v: "00000 00000 10001 10001 10001 01010 00100",
  w: "00000 00000 10001 10001 10101 10101 01010", x: "00000 00000 10001 01010 00100 01010 10001",
  y: "00000 00000 10001 10001 10001 01111 00001 01110", z: "00000 00000 11111 00010 00100 01000 11111",
  A: "01110 10001 10001 11111 10001 10001 10001",
  ",": "00 00 00 00 01 01 10", ".": "0 0 0 0 0 0 1", "-": "000 000 000 111 000 000 000", "−": "000 000 000 111 000 000 000",
  "+": "00000 00100 00100 11111 00100 00100 00000", ":": "0 0 1 0 1 0 0", "%": "11001 11010 00010 00100 01000 01011 10011",
  "/": "00001 00010 00010 00100 01000 01000 10000", " ": "000 000 000 000 000 000 000",
};

/** Testo dot-matrix: passo p = distanza tra punti = spazio tra caratteri; punto = 0,8p. */
export function Dot({ text, p, className = "" }: { text: string; p: number; className?: string }) {
  const glyphs = [...text].map((c) => (G[c] ?? G[c.toLowerCase()] ?? G[" "]).split(" "));
  const circles: ReactNode[] = [];
  let x = 0;
  glyphs.forEach((g, gi) => {
    g.forEach((row, r) => [...row].forEach((on, c) => on === "1" && circles.push(<circle key={`${gi}-${r}-${c}`} cx={x + c * p + 0.4 * p} cy={r * p + 0.4 * p} r={0.4 * p} />)));
    x += g[0].length * p - 0.2 * p + p;
  });
  // come in Figma: l'ingombro è di 7 righe, la riga delle discendenti (g p q y) sborda sotto
  const w = Math.max(0, x - p), h = 7 * p - 0.2 * p;
  return (
    <svg role="img" aria-label={text} width={w} height={h} viewBox={`0 0 ${w} ${h}`} overflow="visible" className={`shrink-0 fill-current ${className}`}>
      {circles}
    </svg>
  );
}

/** Dot con passo diverso mobile / desktop (lg). */
export function RDot({ text, p, className = "" }: { text: string; p: [number, number]; className?: string }) {
  return (
    <>
      <Dot text={text} p={p[0]} className={`lg:hidden ${className}`} />
      <span className="hidden lg:contents" aria-hidden><Dot text={text} p={p[1]} className={className} /></span>
    </>
  );
}

/** Numero che scorre dal vecchio al nuovo valore in 600 ms (DESIGN.md · movimento). */
export function useRoll(target: number) {
  const [v, setV] = useState(target);
  const from = useRef(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setV(target); from.current = target; return; }
    const start = performance.now(), a = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 600), e = 1 - Math.pow(1 - k, 4);
      setV(Math.round(a + (target - a) * e));
      if (k < 1) raf = requestAnimationFrame(tick); else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); from.current = target; };
  }, [target]);
  return v;
}

// ---------- Glyph a segmenti (componente firma)
type Group = { n: number; label?: ReactNode };
export function Glyph({ total, groups, outline = 0, h = 22, gap = 3, groupGap = 14, free, className = "" }: {
  total: number; groups: Group[]; outline?: number; h?: number; gap?: number; groupGap?: number; free?: ReactNode; className?: string;
}) {
  const lit = groups.reduce((s, g) => s + g.n, 0);
  const prev = useRef(0);
  useEffect(() => { prev.current = lit; }, [lit]);
  const off = Math.max(0, total - lit - outline);
  let idx = 0;
  const seg = (kind: "on" | "out" | "off", k: number) => {
    const i = idx++;
    const anim = kind === "on" && i >= prev.current;
    return (
      <span key={k} className={`flex-1 rounded-full ${kind === "on" ? "bg-ink" : kind === "out" ? "border-[1.25px] border-ink" : "bg-dotoff"} ${anim ? "seg-on" : ""}`}
        style={{ height: h, animationDelay: anim ? `${(i - prev.current) * 60}ms` : undefined }} />
    );
  };
  const part = (n: number, kind: "on" | "out" | "off", label: ReactNode, key: string) => n > 0 && (
    <div key={key} className="flex min-w-0 flex-col" style={{ flex: `${n} 1 ${(n - 1) * gap}px` }}>
      <div className="flex" style={{ gap }}>{Array.from({ length: n }, (_, k) => seg(kind, k))}</div>
      {label}
    </div>
  );
  return (
    <div className={`flex w-full ${className}`} style={{ gap: groupGap }}>
      {groups.map((g, i) => part(g.n, "on", g.label, `g${i}`))}
      {outline > 0 || off > 0 ? (
        <div className="flex min-w-0 flex-col" style={{ flex: `${outline + off} 1 ${(outline + off - 1) * gap}px` }}>
          <div className="flex" style={{ gap }}>
            {Array.from({ length: outline }, (_, k) => seg("out", k))}
            {Array.from({ length: off }, (_, k) => seg("off", outline + k))}
          </div>
          {free}
        </div>
      ) : null}
    </div>
  );
}

/** Divide `on` segmenti tra le parti con arrotondamento cumulativo (somma esatta). */
export function splitSegments(values: number[], whole: number, total: number) {
  let acc = 0, used = 0;
  return values.map((v) => {
    acc += v;
    const upto = Math.min(total, Math.round((acc / whole) * total));
    const n = Math.max(0, upto - used);
    used += n;
    return n;
  });
}

/** Barra a punti (macro, anteprime). */
export function DotBar({ n, on, size = 6.5, gap = 3.5, className = "" }: { n: number; on: number; size?: number; gap?: number; className?: string }) {
  return (
    <div className={`flex items-center ${className}`} style={{ gap }}>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className={`shrink-0 rounded-full ${i < on ? "bg-ink" : "bg-dotoff"}`} style={{ width: size, height: size }} />
      ))}
    </div>
  );
}

// ---------- pulsanti
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { kind?: "primary" | "secondary" | "ghost" | "danger"; size?: "L" | "M"; icon?: ReactNode };
export function Btn({ kind = "primary", size = "L", icon, className = "", children, ...rest }: BtnProps) {
  const k = { primary: "bg-ink text-void", secondary: "border border-ink3 text-ink", ghost: "text-ink", danger: "bg-signal text-ink" }[kind];
  const s = size === "L" ? "h-[52px] px-6 gap-2 t-button" : "h-10 px-[18px] gap-2 text-[14px] leading-5 font-semibold";
  return (
    <button {...rest} className={`inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full transition-opacity [&>svg]:shrink-0 hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40 ${k} ${s} ${className}`}>
      {icon}
      {children}
    </button>
  );
}

export function IconBtn({ size = 40, className = "", children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { size?: number }) {
  return (
    <button {...rest} style={{ width: size, height: size }} className={`inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full bg-control text-ink transition-opacity hover:opacity-80 disabled:opacity-40 ${className}`}>
      {children}
    </button>
  );
}

// ---------- campi
type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label?: string; icon?: ReactNode; unit?: string; right?: ReactNode; error?: boolean | string; hint?: ReactNode; box?: string };
export function Field({ label, icon, unit, right, error, hint, className = "", box = "", ...input }: FieldProps) {
  return (
    <label className={`flex min-w-0 flex-col gap-2 ${className}`}>
      {label && <span className="t-label text-ink2">{label}</span>}
      <span className={`flex h-[52px] items-center gap-[10px] rounded-2xl border bg-control px-4 ${error ? "border-signal" : "border-transparent focus-within:border-ink"} ${box}`}>
        {icon && <span className="flex shrink-0 text-ink2">{icon}</span>}
        <input {...input} className="t-body relative min-w-0 flex-1 bg-transparent text-ink caret-ink outline-none" />
        {unit && <span className="t-data shrink-0 text-ink2">{unit}</span>}
        {right}
      </span>
      {typeof error === "string" && error && <span className="t-body-s text-signal">{error}</span>}
      {hint && <span className="t-body-s text-ink2">{hint}</span>}
    </label>
  );
}

export function Seg<T extends string | number>({ options, value, onChange, h = 48, item = "text-[13px] leading-[18px] font-medium", className = "" }: {
  options: { value: T; label: ReactNode }[]; value: T; onChange: (v: T) => void; h?: number; item?: string; className?: string;
}) {
  return (
    <div role="radiogroup" className={`flex rounded-full bg-control p-1 ${className}`} style={{ height: h }}>
      {options.map((o) => (
        <button key={String(o.value)} type="button" role="radio" aria-checked={o.value === value} onClick={() => onChange(o.value)}
          className={`flex-1 cursor-pointer rounded-full transition-colors ${item} ${o.value === value ? "bg-ink text-void" : "text-ink"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Banner di errore: rosso al 14% con punto rosso. */
export function ErrorBanner({ children, onDismiss }: { children: ReactNode; onDismiss?: () => void }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-2xl bg-signal/14 px-[18px] py-[14px]">
      <span className="mt-[7px] size-2 shrink-0 rounded-full bg-signal" />
      <p className="t-body-s flex-1 text-ink">{children}</p>
      {onDismiss && <button onClick={onDismiss} aria-label="Chiudi" className="cursor-pointer text-ink2"><X size={16} /></button>}
    </div>
  );
}

// ---------- sheet (mobile) / dialog (desktop) su scrim nero al 72%
export function Modal({ onClose, width = 560, center = false, children }: { onClose: () => void; width?: number; center?: boolean; children: ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className={`fixed inset-0 z-50 flex justify-center bg-void/72 lg:items-center lg:p-6 ${center ? "items-center p-6" : "items-end"}`} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" style={{ maxWidth: width }}
        className={`max-h-[92vh] w-full overflow-y-auto bg-tile lg:rounded-[32px] lg:p-8 ${center ? "rounded-[32px] p-6 pt-7" :"rounded-t-[32px] px-5 pb-6 pt-3 lg:pt-8"}`}>
        {!center && <div className="mx-auto mb-[23px] h-[5px] w-9 rounded-full bg-ink3 lg:hidden" />}
        {children}
      </div>
    </div>
  );
}

export function CloseBtn({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return <IconBtn onClick={onClick} disabled={disabled} aria-label="Chiudi"><X size={18} strokeWidth={1.75} /></IconBtn>;
}

/** Monogramma dot-matrix dell'iniziale (riquadro foto prodotto). */
export function Monogram({ name, size = 60, p = 3.2, r = 16, bg = "bg-control" }: { name: string; size?: number; p?: number; r?: number; bg?: string }) {
  const c = (name.trim()[0] ?? "?").toLowerCase();
  return (
    <span className={`flex shrink-0 items-center justify-center ${bg}`} style={{ width: size, height: size, borderRadius: r }}>
      <Dot text={/[a-z0-9]/.test(c) ? c : "?"} p={p} />
    </span>
  );
}
