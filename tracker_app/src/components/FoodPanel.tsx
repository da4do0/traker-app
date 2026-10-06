import { useState } from "react";
import { ImageIcon, Plus } from "lucide-react";
import type { FoodDetailHover } from "../types/Food";
import { Btn, Dot, fmt } from "./ui";

// ---------- helper di presentazione per i prodotti OpenFoodFacts
const strip = (s: string) => s.replace(/^[a-z]{2}:/, "").replace(/-/g, " ").trim();
export const categoryPath = (categories: string) => {
  const list = (categories || "").split(",").map(strip).filter(Boolean);
  if (!list.length || categories === "Sconosciuto") return "";
  return (list.length > 1 ? `${list[0]} › ${list[list.length - 1]}` : list[0]).toUpperCase();
};
/** Grammi della porzione in etichetta ("170 g" → 170), se ricavabili. */
export const portionGrams = (servingSize: string) => {
  const m = /([\d.,]+)\s*(g|ml)\b/i.exec(servingSize || "");
  return m ? parseFloat(m[1].replace(",", ".")) : 0;
};
const NOVA = ["", "NON TRASFORMATO", "INGREDIENTI CULINARI", "TRASFORMATO", "ULTRA-TRASFORMATO"];
export const hasPhoto = (url?: string) => !!url && !url.includes("via.placeholder.com");

// ---------- codice a barre EAN-13 disegnato dal codice prodotto
const L = ["0001101", "0011001", "0010011", "0111101", "0100011", "0110001", "0101111", "0111011", "0110111", "0001011"];
const Gc = ["0100111", "0110011", "0011011", "0100001", "0011101", "0111001", "0000101", "0010001", "0001001", "0010111"];
const R = L.map((c) => [...c].map((b) => (b === "1" ? "0" : "1")).join(""));
const PARITY = ["LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG", "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"];
export const ean13 = (code: string) => {
  const c = /^\d{12,13}$/.test(code) ? code.padStart(13, "0") : "";
  return c || null;
};
function modules(c: string) {
  const d = [...c].map(Number), p = PARITY[d[0]];
  const left = d.slice(1, 7).map((x, i) => (p[i] === "L" ? L : Gc)[x]).join("");
  const right = d.slice(7).map((x) => R[x]).join("");
  return { bits: "101" + left + "01010" + right + "101", guard: (i: number) => i < 3 || (i >= 45 && i < 50) || i >= 92 };
}
export function Barcode({ code, inset = false }: { code: string; inset?: boolean }) {
  const c = ean13(code)!;
  const { bits, guard } = modules(c);
  const mw = inset ? 2.1 : 1, H = inset ? 92 : 100, h = inset ? 68 : 88, off = inset ? 14 : 0;
  const W = 95 * mw + off;
  const bars = [...bits].map((b, i) => b === "1" && <rect key={i} x={off + i * mw} y={0} width={mw + 0.02} height={guard(i) ? H : h} />);
  if (!inset) {
    return (
      <div>
        <svg viewBox={`0 0 95 ${H}`} preserveAspectRatio="none" className="h-[100px] w-full fill-ink" aria-label={`Codice a barre ${c}`}>{bars}</svg>
        <div className="t-data mt-2 whitespace-pre text-center">{`${c[0]}  ${c.slice(1, 7)}  ${c.slice(7)}`}</div>
      </div>
    );
  }
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="fill-ink" aria-label={`Codice a barre ${c}`}>
      {bars}
      <g className="font-mono text-[12px] font-semibold" style={{ letterSpacing: ".04em" }}>
        <text x={0} y={h + 14}>{c[0]}</text>
        <text x={off + 3 * mw + 21 * mw} y={h + 14} textAnchor="middle">{c.slice(1, 7)}</text>
        <text x={off + 50 * mw + 21 * mw} y={h + 14} textAnchor="middle">{c.slice(7)}</text>
      </g>
    </svg>
  );
}

// ---------- foto prodotto: foto OFF in scala di grigi, altrimenti il segnaposto «FOTO OFF»
export function Photo({ url, name, size }: { url?: string; name: string; size: number }) {
  const [broken, setBroken] = useState(false);
  if (hasPhoto(url) && !broken)
    return <img src={url} alt={name} onError={() => setBroken(true)} className="shrink-0 rounded-2xl bg-control object-cover grayscale" style={{ width: size, height: size }} />;
  return (
    <span className="flex shrink-0 flex-col items-center justify-center gap-[6px] rounded-2xl border border-dashed border-line bg-control text-ink2" style={{ width: size, height: size }}>
      <ImageIcon size={22} strokeWidth={1.5} />
      <span className="t-label-s">FOTO OFF</span>
    </span>
  );
}

/** Scala a segmenti: si accende solo la posizione del valore (No-Hue Rule). */
function Scale({ n, at, w, letters }: { n: number; at: number; w: number; letters?: string[] }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          {letters && <span className={`t-label-s ${i === at ? "text-ink" : "text-ink2"}`}>{letters[i]}</span>}
          <span className={`h-[10px] rounded-full ${i === at ? "bg-ink" : "bg-dotoff"}`} style={{ width: w }} />
        </div>
      ))}
    </div>
  );
}

const GRADES = ["A", "B", "C", "D", "E"];
const gradeIndex = (g: string) => GRADES.indexOf((g || "").toUpperCase());

function NutritionTable({ food, desktop }: { food: FoodDetailHover; desktop: boolean }) {
  const portion = portionGrams(food.servingSize);
  const n = food.nutrition;
  const rows: [string, number, string][] = [
    ["Energia", n?.calories100g ?? 0, "KCAL"], ["Proteine", n?.protein100g ?? 0, "G"],
    ["Carboidrati", n?.carbs100g ?? 0, "G"], ["Grassi", n?.fat100g ?? 0, "G"],
  ];
  const v = (x: number, u: string) => `${u === "KCAL" ? fmt(Math.round(x)) : fmt(x, 1)} ${u}`;
  return (
    <div>
      <div className={`flex items-center border-b border-line ${desktop ? "pb-4" : "mt-4 justify-end pb-4"}`}>
        {desktop && <span className="t-label flex-1 text-ink2">VALORI NUTRIZIONALI</span>}
        <span className="t-label w-[80px] text-right lg:w-[100px]">100 G</span>
        {portion > 0 && <span className="t-label w-[80px] text-right lg:w-[120px]">{desktop ? `PORZIONE ${fmt(portion)} G` : `${fmt(portion)} G`}</span>}
      </div>
      {rows.map(([k, x, u], i) => (
        <div key={k} className={`flex items-center border-line ${i < 3 || desktop ? "border-b" : ""} ${desktop ? "py-3" : "py-[14px]"} ${!desktop && i === 0 ? "py-[18px]" : ""}`}>
          <span className={`flex-1 ${i === 0 ? "t-strong" : "t-body"}`}>{k}</span>
          <span className="t-data w-[80px] text-right lg:w-[100px]">{v(x, u)}</span>
          {portion > 0 && <span className="t-data w-[80px] text-right text-ink2 lg:w-[120px]">{v((x * portion) / 100, u)}</span>}
        </div>
      ))}
    </div>
  );
}

const allergenList = (a: string[]) => (a || []).map(strip).filter(Boolean);

/** Dettaglio alimento, mobile: pila di tile. */
export function FoodTiles({ food }: { food: FoodDetailHover }) {
  const portion = portionGrams(food.servingSize);
  const g = gradeIndex(food.nutritionGrade);
  const code = ean13(food.code);
  const cat = categoryPath(food.categories);
  const tile = "rounded-[28px] bg-tile p-5";
  return (
    <div className="flex flex-col gap-3">
      <section className={`${tile} pt-6`}>
        <div className="flex gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="t-title-l">{food.name}</h1>
            <div className="t-label mt-[6px] text-ink2">{[food.brands, food.quantity].filter(Boolean).join(" · ").toUpperCase()}</div>
            {cat && <div className="t-label-s mt-[6px] text-ink2">{cat}</div>}
          </div>
          <Photo url={food.imageUrl} name={food.name} size={80} />
        </div>
        <div className="mt-[26px] flex items-end gap-3">
          <Dot text={fmt(Math.round(food.nutrition?.calories100g ?? 0))} p={10} />
          <span className="t-label pb-[2px] text-ink2">KCAL / 100 G</span>
        </div>
        {code && <div className="mt-[38px]"><Barcode code={code} /></div>}
      </section>
      <div className="grid grid-cols-2 gap-3">
        <section className={`${tile} h-[170px]`}>
          <span className="t-label text-ink2">NUTRI-SCORE</span>
          <div className="mt-4"><Dot text={g >= 0 ? GRADES[g] : "-"} p={9} /></div>
          <div className="mt-[23px]"><Scale n={5} at={g} w={23} /></div>
        </section>
        <section className={`${tile} h-[170px]`}>
          <span className="t-label text-ink2">NOVA</span>
          <div className="mt-4 flex items-end justify-between">
            <Dot text={food.novaGroup ? String(food.novaGroup) : "-"} p={9} />
            <span className="t-label-s mb-[18px] max-w-[90px] text-right text-ink2">{NOVA[food.novaGroup] ?? ""}</span>
          </div>
          <div className="mt-[23px]"><Scale n={4} at={food.novaGroup - 1} w={30} /></div>
        </section>
      </div>
      <section className={tile}>
        <span className="t-label text-ink2">VALORI NUTRIZIONALI</span>
        <NutritionTable food={food} desktop={false} />
        {portion > 0 && <p className="t-body-s mt-1 text-ink2">Porzione indicata in etichetta: {fmt(portion)} g</p>}
      </section>
      <section className={tile}>
        <span className="t-label text-ink2">INGREDIENTI</span>
        <p className="t-body mt-3">{food.ingredients}</p>
      </section>
      <section className={tile}>
        <span className="t-label text-ink2">ALLERGENI</span>
        <Allergens list={allergenList(food.allergens)} />
        <p className="t-label-s mt-[14px] normal-case text-ink2">Codice prodotto {food.code}</p>
      </section>
    </div>
  );
}

function Allergens({ list }: { list: string[] }) {
  if (!list.length) return <p className="t-body mt-3 text-ink2">Nessun allergene indicato.</p>;
  return (
    <div className="mt-[14px] flex flex-wrap gap-2">
      {list.map((a) => <span key={a} className="t-label flex h-9 items-center rounded-full border border-ink px-5">{a}</span>)}
    </div>
  );
}

/** Dettaglio alimento, desktop: un'unica tile (pannello destro dello split view). */
export function FoodPanel({ food, onAdd }: { food: FoodDetailHover; onAdd: () => void }) {
  const g = gradeIndex(food.nutritionGrade);
  const code = ean13(food.code);
  const cat = categoryPath(food.categories);
  return (
    <section className="rounded-[32px] bg-tile p-8">
      <div className="flex items-start gap-6">
        <div className="min-w-0 flex-1">
          <h1 className="t-title-l">{food.name}</h1>
          <div className="t-label mt-[6px] text-ink2">{[food.brands, food.quantity, cat].filter(Boolean).join(" · ").toUpperCase()}</div>
        </div>
        <Btn icon={<Plus size={20} />} onClick={onAdd} className="!h-12 w-[220px]">Aggiungi al diario</Btn>
      </div>
      <div className="mt-9 flex items-start border-b border-line pb-[30px]">
        <Photo url={food.imageUrl} name={food.name} size={112} />
        <div className="ml-6 mt-2">
          <Dot text={fmt(Math.round(food.nutrition?.calories100g ?? 0))} p={12} />
          <div className="t-label mt-[8px] text-ink2">KCAL / 100 G</div>
        </div>
        {code && <div className="ml-auto mt-3"><Barcode code={code} inset /></div>}
      </div>
      <div className="grid grid-cols-2 border-b border-line py-6">
        <div>
          <span className="t-label text-ink2">NUTRI-SCORE</span>
          <div className="mt-3 flex items-end gap-[34px]">
            <Dot text={g >= 0 ? GRADES[g] : "-"} p={7} />
            <div className="mb-[10px]"><Scale n={5} at={g} w={26} letters={GRADES} /></div>
          </div>
        </div>
        <div>
          <span className="t-label text-ink2">NOVA</span>
          <div className="mt-3 flex items-end gap-[14px]">
            <Dot text={food.novaGroup ? String(food.novaGroup) : "-"} p={7} />
            <div className="mb-[10px]">
              <span className="t-label-s mb-2 block text-ink2">{NOVA[food.novaGroup] ?? ""}</span>
              <Scale n={4} at={food.novaGroup - 1} w={32} />
            </div>
          </div>
        </div>
      </div>
      <div className="pt-6"><NutritionTable food={food} desktop /></div>
      <div className="mt-6">
        <span className="t-label text-ink2">INGREDIENTI</span>
        <p className="t-body mt-[10px]">{food.ingredients}</p>
      </div>
      <div className="mt-[46px] flex items-end justify-between">
        <div>
          <span className="t-label text-ink2">ALLERGENI</span>
          <Allergens list={allergenList(food.allergens)} />
        </div>
        <span className="t-label-s mb-3 text-ink2">CODICE {food.code}</span>
      </div>
    </section>
  );
}
