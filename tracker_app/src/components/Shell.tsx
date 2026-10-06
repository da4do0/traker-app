import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, House, LogOut, Plus, Scale } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Btn, Dot, RDot, DAYS, ddmm } from "./ui";

type Tab = "oggi" | "diario" | "peso";
const TABS: { id: Tab; label: string; to: string; Icon: typeof House }[] = [
  { id: "oggi", label: "Oggi", to: "/", Icon: House },
  { id: "diario", label: "Diario", to: "/foodList", Icon: BookOpen },
  { id: "peso", label: "Peso", to: "/weight", Icon: Scale },
];

/** Rail sinistra (desktop) + barra di navigazione in basso (mobile). */
export default function Shell({ active, children }: { active?: Tab; children: ReactNode }) {
  const navigate = useNavigate();
  const { username, logout } = useAuth();

  return (
    <div className="min-h-screen bg-void text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-line bg-void lg:flex">
        <button onClick={() => navigate("/")} className="ml-8 mt-9 w-fit cursor-pointer" aria-label="Bilancio">
          <Dot text="bilancio" p={3.4} />
        </button>
        <Btn icon={<Plus size={20} />} onClick={() => navigate("/food")} className="ml-8 mt-8 w-[184px] !px-4">Aggiungi alimento</Btn>
        <nav className="mt-12 flex flex-col gap-1 px-5">
          {TABS.map(({ id, label, to, Icon }) => (
            <button key={id} onClick={() => navigate(to)} aria-current={active === id ? "page" : undefined}
              className={`flex h-11 cursor-pointer items-center gap-3 rounded-[14px] px-[14px] t-strong ${active === id ? "bg-tile text-ink" : "text-ink2 hover:text-ink"}`}>
              <Icon size={20} strokeWidth={1.5} />
              {label}
              {active === id && <span className="ml-auto size-1.5 rounded-full bg-signal" />}
            </button>
          ))}
        </nav>
        <div className="mt-auto flex h-[88px] items-center gap-3 border-t border-line px-8">
          <span className="t-strong flex size-9 shrink-0 items-center justify-center rounded-full bg-control">{(username[0] ?? "?").toUpperCase()}</span>
          <div className="min-w-0 flex-1">
            <div className="t-strong truncate">{username}</div>
            <div className="t-label-s truncate normal-case text-ink2">@{username}</div>
          </div>
          <button onClick={() => { logout(); navigate("/login"); }} aria-label="Esci" className="cursor-pointer text-ink2 hover:text-ink">
            <LogOut size={20} strokeWidth={1.5} />
          </button>
        </div>
      </aside>

      <div className="lg:pl-[248px]">
        <main className="mx-auto max-w-[1192px] px-4 pb-[116px] pt-4 lg:px-12 lg:pb-16 lg:pt-[52px]">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-[92px] items-start border-t border-line bg-void px-4 pt-3 lg:hidden">
        {TABS.map(({ id, label, to, Icon }) => (
          <button key={id} onClick={() => navigate(to)} aria-current={active === id ? "page" : undefined}
            className={`mr-[6px] flex w-[62px] cursor-pointer flex-col items-center pt-[2px] ${active === id ? "text-ink" : "text-ink2"}`}>
            <Icon size={22} strokeWidth={1.5} />
            <span className="t-label-s mt-[6px]">{label}</span>
            <span className={`mt-[6px] size-1 rounded-full ${active === id ? "bg-signal" : ""}`} />
          </button>
        ))}
        <Btn icon={<Plus size={20} />} onClick={() => navigate("/food")} className="ml-auto">Aggiungi</Btn>
      </nav>
    </div>
  );
}

/** Intestazione pagina: titolo dot-matrix + punto rosso con la data di oggi. */
export function PageHead({ title, right, date = true, children }: { title: string; right?: ReactNode; date?: boolean; children?: ReactNode }) {
  const d = new Date();
  return (
    <header className="mb-5 flex items-center gap-5 px-1 lg:mb-[30px] lg:px-0">
      <div className="flex items-end gap-5">
        <RDot text={title} p={[5.5, 8]} />
        {children}
        {date && (
          <span className="hidden items-center gap-2 pb-[10px] lg:flex">
            <span className="size-2 rounded-full bg-signal" />
            <span className="t-label">{DAYS[d.getDay()]} {ddmm(d)}.{d.getFullYear()}</span>
          </span>
        )}
      </div>
      <div className="ml-auto flex items-center gap-3">
        {date && (
          <span className="flex items-center gap-[6px] lg:hidden">
            <span className="size-2 rounded-full bg-signal" />
            <span className="t-label">{DAYS[d.getDay()]} {ddmm(d)}</span>
          </span>
        )}
        {right}
      </div>
    </header>
  );
}
